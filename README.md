# VOD-Tabellen Bereiniger Add-on


## Funktionen

- Ermittelt automatisch alle sichtbaren Tabellenblätter, deren Name ein Datum enthält (z. B. `01.06.2025`, `2025-06-01`, `März 2025` oder ähnliche Formate)
- Entfernt doppelte leere Zeilenblöcke und überflüssige leere Spalten
- setzt die Kopfzeile fest, friert die erste Zeile ein und vereinheitlicht die Zeilenhöhen
- formatiert Spalten mit "Start" bzw. "Ende" als Uhrzeiten in `HH:mm`
- blendet bekannte, nicht benötigte Spalten anhand fester Namen und Muster aus
- ergänzt am Ende der Tabelle 5 neue Standardspalten:
  - `VOD`
  - `Kommentar`
  - `Layout`
  - `PDF bearbeitet von`
  - `PDF in Redsys?`
- legt für die neuen Felder gültige Dropdown-Listen, Standardwerte und bedingte Formatierung an
- setzt die Arbeitsmappe auf die Sprache `en_US` für konsistente Formeln und Berechnungen
- erstellt eine Verknüpfung der aktuellen Tabelle im Google-Drive-Ordner "Konferenz Slides"

## Installation

Dieses Projekt ist als internes Google Workspace Add-on konzipiert und kann von jedem S&S-Mitarbeiter installiert werden.

1. Öffne eine beliebige Google-Tabelle.
2. Öffne das Menü `Erweiterungen` -> `Add-ons` -> `Add-ons aufrufen`.
3. Im Popup auf das Hamburger-Menü klicken.
![alt text](https://github.com/mschuetze/VOD-Tabellen-Bereiniger-Add-on/blob/main/Bilder/vod-01.png)
4. Punkt `Interne Apps` auswählen.
![alt text](https://github.com/mschuetze/VOD-Tabellen-Bereiniger-Add-on/blob/main/Bilder/vod-02.png)
5. Add-on **VOD-Tabellen Bereiniger** installieren.
![alt text](https://github.com/mschuetze/VOD-Tabellen-Bereiniger-Add-on/blob/main/Bilder/vod-03.png)

> **Direkt nach der Installation ist ggf. einmalig ein Refresh der Tabelle über den Browser notwendig.**

## Benutzung

1. Öffne die zu bereinigende Tabelle.
2. Öffne die Seitenleiste rechts, falls sie ausgeblendet ist.
![alt text](https://github.com/mschuetze/VOD-Tabellen-Bereiniger-Add-on/blob/main/Bilder/vod-04.png)
3. Klicke auf das Tabellen-Icon 
![alt text](https://github.com/mschuetze/VOD-Tabellen-Bereiniger-Add-on/blob/main/Bilder/vod-05.png)

Das Add-on verarbeitet anschließend automatisch alle sichtbaren Datumsblätter der Datei und ergänzt die vorbereiteten Standardfelder für die spätere VOD-/PDF-Bearbeitung.