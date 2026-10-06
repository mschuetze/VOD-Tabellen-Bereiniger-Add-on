# VOD-Tabellen Bereiniger Add-on

Dieses Google Apps Script-Add-on bereinigt und strukturiert automatisch Datums-Tabellenblätter in einer VOD-Übersicht. Es entfernt leere Bereiche, formatiert relevante Spalten und ergänzt Standardfelder für die spätere Bearbeitung von VOD- bzw. PDF-Informationen.

## Funktionen

- Ermittelt automatisch alle sichtbaren Tabellenblätter, deren Name ein Datum enthält
- Entfernt doppelte leere Zeilenblöcke und überflüssige leere Spalten
- setzt die Kopfzeile fest und friert die erste Zeile ein
- formatiert Spalten mit "Start" und "Ende" als Uhrzeiten in HH:mm
- blendet bekannte, nicht benötigte Spalten aus
- ergänzt am Ende der Tabelle 5 neue Spalten:
  - VOD
  - Kommentar
  - Layout
  - PDF bearbeitet von
  - PDF in Redsys?
- legt Dropdown-Listen und bedingte Formatierungen für die neuen Felder an
- setzt die Arbeitsmappe auf die Sprache "en_US" für konsistente Formeln

## Installation

1. Öffne dein Google Sheets-Dokument.
2. Gehe auf `Erweiterungen` → `Apps Script`.
3. Kopiere den Inhalt der Datei `vod-tabellenbereiniger.gs` in den Script-Editor.
4. Speichere das Projekt mit einem aussagekräftigen Namen, z. B. `VOD Tabellen Bereiniger`.
5. Autorisiere die benötigten Google Sheets-Berechtigungen, wenn du dazu aufgefordert wirst.
6. Wenn das Projekt als Add-on genutzt werden soll, deploye es als Google Workspace Add-on bzw. Editor-Add-on.
7. Lade die Tabelle danach neu, damit das Menü unter `Erweiterungen` angezeigt wird.

Hinweis: Das Menü wird beim Öffnen der Tabelle automatisch erzeugt. Wenn das Add-on nicht sofort erscheint, prüfe den Script-Editor und aktiviere das Projekt erneut oder lade die Datei neu.

## Benutzung

1. Öffne die Tabelle, in der die Datumsblätter bereinigt werden sollen.
2. Gehe zu `Erweiterungen`.
3. Wähle den Menüpunk `⚡ Nur Datum-Blätter verarbeiten`.
4. Das Script verarbeitet automatisch alle sichtbaren Blätter mit einem Datum im Namen.

Das Ergebnis umfasst:

- bereinigte Tabellenstrukturen ohne überflüssige Leerbereiche
- korrekte Uhrzeitformatierung für Datums- und Zeitspalten
- ausgeblendete nicht benötigte Spalten
- zusätzliche VOD-/Kommentar-/Layout-/PDF-Überschriften mit Validierung

Falls keine sichtbaren Datumsblätter gefunden werden, zeigt das Script eine Benachrichtigung an.

## Hinweise zur Funktionsweise

Das Hauptprogramm wird durch die Funktion `tabelleBereinigenUndErweitern()` ausgelöst. Diese Funktion:

- prüft alle sichtbaren Tabellenblätter
- erkennt Dateinamen mit Datumsangaben über den Namen des Blattes
- bereinigt die Daten in-memory
- fügt die Zusatzspalten hinzu
- setzt Validierungen und Formatierungen
- meldet am Ende den Abschluss per Benachrichtigung bzw. Debug-Report

Damit eignet sich das Add-on für den schnellen Einsatz in strukturierten VOD-Tabellen, bei denen mehrere Datumsblätter regelmäßig aufbereitet werden müssen.

