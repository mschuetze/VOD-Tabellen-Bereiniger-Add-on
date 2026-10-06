// ============================================================================
// DEBUG SWITCH: Auf true setzen für Performance-Logs im Editor / Pop-up.
// ============================================================================
const DEBUG = true;

/**
 * Erstellt den Menüeintrag unter "Erweiterungen" beim Öffnen der Tabelle.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem('⚡ Nur Datum-Blätter verarbeiten', 'tabelleBereinigenUndErweitern')
    .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

/**
 * Erzeugt die Startseite in der rechten Seitenleiste (Homepage Card).
 */
function buildHomepage(e) {
  var builder = CardService.newCardBuilder();
  var section = CardService.newCardSection();
  
  section.addWidget(
    CardService.newTextParagraph()
      .setText("Klicken Sie unten, um alle Datums-Tabellenblätter automatisch zu bereinigen und zu strukturieren:")
  );
  
  section.addWidget(
    CardService.newTextButton()
      .setText("Datum-Blätter jetzt bereinigen")
      .setOnClickAction(
        CardService.newAction().setFunctionName("tabelleBereinigenUndErweitern")
      )
  );
  
  builder.addSection(section);
  return builder.build();
}

/**
 * Hilfs-Klasse für Zeitmessungen im Debug-Modus.
 */
class ExecutionTimer {
  constructor(enabled) {
    this.enabled = enabled;
    this.startTime = Date.now();
    this.lastTime = Date.now();
    this.logs = [];
  }

  logStep(stepName) {
    if (!this.enabled) return;
    const now = Date.now();
    const duration = now - this.lastTime;
    const totalDuration = now - this.startTime;
    this.lastTime = now;

    const logEntry = `⏱️️ [${duration} ms | Gesamt: ${totalDuration} ms] -> ${stepName}`;
    this.logs.push(logEntry);
    Logger.log(logEntry);

    try {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `${stepName} (${duration} ms)`,
        "Debug Profiler",
        3
      );
    } catch (e) {}
  }

  getSummary() {
    const totalTime = Date.now() - this.startTime;
    return `--- DEBUG PERFORMANCE REPORT (Gesamtzeit: ${totalTime} ms) ---\n` + this.logs.join("\n");
  }
}

/**
 * Hilfsfunktion: Prüft, ob ein Blattname ein Datum enthält (DE + EN, Varianten).
 */
function isDateSheetName(sheetName) {
  if (!sheetName) return false;
  
  const numericDatePattern = /\b\d{1,2}[\.\/-]\d{1,2}([\.\/-]\d{2,4})?\b/;
  const monthNamesPattern = /\b(jan|januar|january|feb|februar|february|mär|maerz|march|apr|april|mai|may|jun|juni|june|jul|juli|july|aug|august|sep|sept|september|okt|oct|oktober|october|nov|november|dez|dec|dezember|december)\b/i;

  return numericDatePattern.test(sheetName) || monthNamesPattern.test(sheetName);
}

/**
 * Hilfsfunktion: Bereinigt einen String von Groß-/Kleinschreibung,
 * Leerzeichen, Zeilenumbrüchen und Sonderzeichen für einen flexiblen Vergleich.
 */
function normalizeText(text) {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]/g, "");
}

/**
 * Prüft, ob ein Spaltentitel ausgeblendet werden soll (per Festtext oder RegEx).
 */
function shouldHideColumn(rawHeaderText, normalizedHeader, exactListNormalized, regexList) {
  if (!rawHeaderText && !normalizedHeader) return false;

  // 1. Prüfung gegen exakte Wortliste
  if (exactListNormalized.includes(normalizedHeader)) {
    return true;
  }

  // 2. Prüfung gegen RegEx-Muster
  return regexList.some(regex => regex.test(rawHeaderText));
}

/**
 * Führt die vollständige Bereinigung für ALLE sichtbaren Datums-Blätter aus.
 */
function tabelleBereinigenUndErweitern() {
  const timer = new ExecutionTimer(DEBUG);
  timer.logStep("Start der Ausführung");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 0. Ländereinstellung / Sprache der Datei auf "Vereinigte Staaten" (en_US) setzen
  ss.setSpreadsheetLocale('en_US');
  timer.logStep("Sprache auf en_US gesetzt");

  const sheets = ss.getSheets();
  
  // Filtert nur sichtbare Blätter, die ein Datum im Namen tragen
  const dateSheets = sheets.filter(s => !s.isSheetHidden() && isDateSheetName(s.getName()));
  timer.logStep(`${dateSheets.length} von ${sheets.length} Blättern als Datums-Blätter identifiziert`);

  if (dateSheets.length === 0) {
    SpreadsheetApp.getUi().alert("Es wurden keine sichtbaren Tabellenblätter mit einem Datum im Namen gefunden.");
    return;
  }

  // Definierte Breiten in Pixeln für die 5 neuen Spalten [VOD, Kommentar, Layout, PDF bearbeitet von, PDF in Redsys?]
  const spaltenBreiten = [350, 350, 104, 142, 170];

  // Optionen für die Drop-down-Menüs
  const layoutOptionen = ["Session", "Workshop", "Keynote"];
  const bearbeiterOptionen = ["Micha", "Fidan", "Mariia"];
  const redsysOptionen = ["x", "✓"];

  // --------------------------------------------------------------------------
  // 1. Exakte Begriffe zum Ausblenden
  // --------------------------------------------------------------------------
  const festeSpaltenZumAusblenden = [
    "Tag",
    "Date",
    "Datum",
    "Is Remote",
    "SET UP",
    "Setup",
    "Talk Mode",
    "Onboarder",
    "Moderator",
    "Konferenz",
    "Conference",
    "DevSecOps Intro"
  ];
  const normalizedFesteListe = festeSpaltenZumAusblenden.map(normalizeText);

  // --------------------------------------------------------------------------
  // 2. RegEx-Muster zum Ausblenden (flexibel)
  // --------------------------------------------------------------------------
  const regexSpaltenZumAusblenden = [
    /\btn\b/i,          // Erfasst alle Begriffe mit dem Wort "TN" (TN Zahl, TN onsite remote, etc.)
    /zoom.*url/i,       // Erfasst "Live Zoom URL", "Zoom Stream URL", "Live Zoom Stream URL" etc.
    /vimeo/i,           // Erfasst ALLES, was das Wort "Vimeo" enthält
    /onboarding/i       // Erfasst ALLES, was das Wort "Onboarding" enthält
  ];

  dateSheets.forEach((sheet, sheetIdx) => {
    const sheetName = sheet.getName();
    timer.logStep(`--- Start Tabellenblatt [${sheetIdx + 1}/${dateSheets.length}]: "${sheetName}" ---`);

    // 1. Kopfzeile einfrieren (Zeile 1)
    if (sheet.getMaxRows() > 0) {
      sheet.setFrozenRows(1);
    }

    // 2. IN-MEMORY BEREINIGUNG (Entfernt Blöcke ab 2 leeren Zeilen & leere Spalten)
    purgeAllEmptyRowsAndColsInMemory(sheet, timer);

    // Zeilenhöhe für alle verbleibenden Zeilen vereinheitlichen (21px)
    if (sheet.getMaxRows() > 0) {
      sheet.setRowHeights(1, sheet.getMaxRows(), 21);
    }

    const lastRow = sheet.getLastRow();
    const currentCols = sheet.getLastColumn();

    // 3. Formate für "Start" & "Ende" explizit auf HH:mm setzen & Spalten ausblenden
    if (currentCols > 0) {
      const headerRange = sheet.getRange(1, 1, 1, currentCols);
      const headerValues = headerRange.getValues()[0];
      
      for (let colIndex = currentCols; colIndex >= 1; colIndex--) {
        const rawHeaderText = String(headerValues[colIndex - 1] || "").trim();
        const normalizedHeader = normalizeText(rawHeaderText);
        
        // A) Uhrzeit-Formatierung erzwingen für Start & Ende
        if (normalizedHeader === "start" || normalizedHeader === "ende" || normalizedHeader === "end") {
          if (lastRow >= 2) {
            sheet.getRange(2, colIndex, lastRow - 1, 1).setNumberFormat("HH:mm");
          }
        }

        // B) Prüft, ob die Spalte ausgeblendet werden soll
        if (shouldHideColumn(rawHeaderText, normalizedHeader, normalizedFesteListe, regexSpaltenZumAusblenden)) {
          sheet.hideColumns(colIndex);
        }
      }
    }

    // 4. Textumbruch aller bestehenden Spalten auf "ABSCHNEIDEN" (CLIP) stellen
    if (lastRow > 0 && currentCols > 0) {
      sheet.getRange(1, 1, lastRow, currentCols)
        .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    }

    // 5. 5 Spalten am Ende hinzufügen [VOD, Kommentar, Layout, PDF bearbeitet von, PDF in Redsys?]
    sheet.insertColumnsAfter(currentCols, 5);
    const startCol = currentCols + 1;

    // Überschriften für Spalte 1 (VOD) sowie Spalte 2 bis 4 setzen
    sheet.getRange(1, startCol).setValue("VOD");
    sheet.getRange(1, startCol + 1, 1, 3).setValues([
      ["Kommentar", "Layout", "PDF bearbeitet von"]
    ]);

    // US-Formel-Syntax für die 5. Spaltenüberschrift (PDF in Redsys?)
    const formelSpalte5 = '="PDF in Redsys? (" & COUNTIF(INDIRECT(ADDRESS(2,COLUMN(),4) & ":" & SUBSTITUTE(ADDRESS(1,COLUMN(),4),"1","")),"✓") & "/" & (COUNTIF(INDIRECT(ADDRESS(2,COLUMN(),4) & ":" & SUBSTITUTE(ADDRESS(1,COLUMN(),4),"1","")),"x") + COUNTIF(INDIRECT(ADDRESS(2,COLUMN(),4) & ":" & SUBSTITUTE(ADDRESS(1,COLUMN(),4),"1","")),"✓")) & ")"';

    sheet.getRange(1, startCol + 4).setFormula(formelSpalte5);

    // 6. Exakte Spaltenbreiten für die 5 neuen Spalten festlegen
    spaltenBreiten.forEach((breite, index) => {
      sheet.setColumnWidth(startCol + index, breite);
    });

    // 7. Hintergründe aller genutzten Zellen auf Hellgelb 3 setzen
    const finalLastRow = sheet.getLastRow();
    const finalLastCol = sheet.getLastColumn();
    if (finalLastRow > 0 && finalLastCol > 0) {
      sheet.getRange(1, 1, finalLastRow, finalLastCol).setBackground("#fff2cc");
    }

    // 8. Datenvalidierung (Drop-downs), Standardwert & Bedingte Formatierung
    if (finalLastRow >= 2) {
      const numRows = finalLastRow - 1;

      // Drop-down für Zusatzspalte 3 (Layout)
      const layoutColIndex = startCol + 2;
      const layoutRange = sheet.getRange(2, layoutColIndex, numRows, 1);
      const layoutRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(layoutOptionen, true)
        .setAllowInvalid(false)
        .build();
      layoutRange.setDataValidation(layoutRule);

      // Drop-down für Zusatzspalte 4 (PDF bearbeitet von)
      const bearbeiterColIndex = startCol + 3;
      const bearbeiterRange = sheet.getRange(2, bearbeiterColIndex, numRows, 1);
      const bearbeiterRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(bearbeiterOptionen, true)
        .setAllowInvalid(false)
        .build();
      bearbeiterRange.setDataValidation(bearbeiterRule);

      // Drop-down & Standardwerte für Zusatzspalte 5 (PDF in Redsys?)
      const redsysColIndex = startCol + 4;
      const redsysRange = sheet.getRange(2, redsysColIndex, numRows, 1);
      const redsysRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(redsysOptionen, true)
        .setAllowInvalid(false)
        .build();
      redsysRange.setDataValidation(redsysRule);

      // Standardmäßig "x" eintragen
      redsysRange.setValue("x");

      // Bedingte Formatierung für Zusatzspalte 5
      const rules = sheet.getConditionalFormatRules();

      const ruleX = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("x")
        .setBackground("#ffcfc9")
        .setRanges([redsysRange])
        .build();

      const ruleCheck = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("✓")
        .setBackground("#d4edbc")
        .setRanges([redsysRange])
        .build();

      rules.push(ruleX);
      rules.push(ruleCheck);
      sheet.setConditionalFormatRules(rules);
    }
  });

  const report = timer.getSummary();

  if (DEBUG) {
    const htmlOutput = HtmlService.createHtmlOutput(`<pre style="font-family: monospace; font-size: 11px;">${report}</pre>`)
      .setWidth(550)
      .setHeight(350);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, "📊 Debug Performance Report");
  }

  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification()
        .setText(`${dateSheets.length} Datums-Blätter erfolgreich bereinigt & formatiert!`)
    )
    .build();
}

/**
 * Filtert leere Zeilen-Blöcke (NUR wenn mindestens 2 leere Zeilen aufeinanderfolgen)
 * sowie leere Spalten im Arbeitsspeicher (Memory).
 */
function purgeAllEmptyRowsAndColsInMemory(sheet, timer) {
  const maxRows = sheet.getMaxRows();
  const maxCols = sheet.getMaxColumns();
  if (maxRows === 0 || maxCols === 0) return;

  const rawValues = sheet.getRange(1, 1, maxRows, maxCols).getValues();

  // 1. NEU: Nur Blöcke von >= 2 aufeinanderfolgenden leeren Zeilen herausfiltern
  const filteredRows = [];
  let pendingEmptyRows = [];

  for (let r = 0; r < rawValues.length; r++) {
    const isEmpty = rawValues[r].every(cell => cell === "" || cell === null || cell === undefined || String(cell).trim() === "");

    if (isEmpty) {
      pendingEmptyRows.push(rawValues[r]);
    } else {
      // Wenn genau 1 leere Zeile vorausging -> Beibehalten
      if (pendingEmptyRows.length === 1) {
        filteredRows.push(pendingEmptyRows[0]);
      }
      // Wenn >= 2 leere Zeilen vorausgingen -> Verwerfen (Löschen)
      pendingEmptyRows = [];
      filteredRows.push(rawValues[r]);
    }
  }

  // Am Ende des Tabellenblatts: einzelne Leerzeilen ebenfalls verwerfen
  if (filteredRows.length === 0) return;

  // 2. Indexe aller nicht-leeren Spalten ermitteln
  const numCols = filteredRows[0].length;
  const activeColIndexes = [];

  for (let c = 0; c < numCols; c++) {
    const isColActive = filteredRows.some(row => {
      const val = row[c];
      return val !== "" && val !== null && val !== undefined && String(val).trim() !== "";
    });
    if (isColActive) {
      activeColIndexes.push(c);
    }
  }

  // 3. Neue saubere Daten-Matrix erzeugen
  const cleanData = filteredRows.map(row => {
    return activeColIndexes.map(colIdx => row[colIdx]);
  });

  const newRowCount = cleanData.length;
  const newColCount = cleanData[0].length;

  // 4. Blatt leeren & saubere Daten zurückschreiben
  sheet.clearContents();
  sheet.clearFormats();
  
  if (sheet.getMaxRows() > newRowCount) {
    sheet.deleteRows(newRowCount + 1, sheet.getMaxRows() - newRowCount);
  }
  if (sheet.getMaxColumns() > newColCount) {
    sheet.deleteColumns(newColCount + 1, sheet.getMaxColumns() - newColCount);
  }

  sheet.getRange(1, 1, newRowCount, newColCount).setValues(cleanData);
}