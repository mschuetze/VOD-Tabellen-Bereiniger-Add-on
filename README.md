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

Dieses Projekt ist als internes Google Workspace Add-on konzipiert und kann von jedem S&S-Mitarbeiter installiert werden.

1. Öffne eine beliebige Google-Tabelle.
2. Öffne das Menü `Erweiterungen` -> `Add-ons` -> `Add-ons aufrufen`
3. Im Popup auf das Hamburger Menü klicken (siehe Abb. 01)
![alt text](https://github.com/mschuetze/VOD-Tabellen-Bereiniger-Add-on/blob/main/Bilder/vod-01.png)
4. Punkt `Interne Apps` auswählen.
5. Add-on **VOD-Tabellen Bereiniger** installieren.

> Direkt nach der Installation ist ggf. einmalig ein Refresh der Tabelle über den Browser notwendig. 

## Benutzung

1. Öffne die zu bereinigende Tabelle.
2. Öffne die Seitenleiste rechts.
3. Ein Klick auf das Tabellen-Icon startet das Add-on.

