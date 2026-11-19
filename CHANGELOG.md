# Änderungsprotokoll · Sunshine@R DAW Studio
<!-- Pflege: Ganz oben einen neuen Abschnitt „## Version · Datum · Titel“ anlegen, darunter die Neuerungen als Stichpunkte.
     Der oberste Abschnitt wird (1) in die App eingebaut („Was ist neu“) und (2) bei GitHub als Release-Text veröffentlicht. -->

## 1.15 · 2026-11-19 · Kompaktere Projekte & sparsameres Speichern
- Neu: Importierte Stems (WAV, MP3, …) werden im Projekt als Original-Datei gespeichert statt als entpackte Rohdaten. Projekte, Autosave und Sicherungen werden dadurch kleiner (16-Bit-WAV etwa die Hälfte, MP3 rund ein Zehntel).
- Besser: Beim Speichern werden die Audiodaten nicht mehr zusätzlich kopiert – das senkt die Speicherspitze, die bei vielen Spuren zum Absturz führen konnte.
- Hinweis: Aufnahmen, erzeugte oder bearbeitete Spuren und 32-Bit-Float-Dateien bleiben wie bisher als Rohdaten. Ältere Projekte bleiben lesbar und werden erst dann kompakt, wenn die Stems neu importiert werden.
- Hinweis: Beim Öffnen werden die Original-Dateien neu dekodiert – bei vielen Spuren dauert das einige Sekunden.

## 1.14 · 2026-11-19 · Updates, Sicherung & Stabilität
- Neu: „Was ist neu“ – dieses Änderungsprotokoll steckt jetzt in der App (Optionen → Updates) und erscheint nach einem Update einmal auf der Startseite.
- Neu: Beim Update-Hinweis steht jetzt, was die neue Version bringt (aus dem GitHub-Release-Text).
- Neu: Wöchentliche Sicherung – automatisch in „Dokumente/SunshineDAW/Sicherung“ (die letzten 4 bleiben), bei großen Datenmengen als Erinnerung zum Speichern.
- Neu: Live-Update der Oberfläche – kleine Änderungen kommen ohne neue APK, mit automatischem Rückfall auf die eingebaute Version, falls etwas nicht startet.
- Neu: Optionen → Stabilität & Leistung: Speicher-Anzeige mit Warnung, Fehlerprotokoll zum Kopieren, Sparmodus für schwächere Handys, Anzeige-Test.
- Der Name der App ist jetzt überall „Sunshine@R DAW Studio“.

## 1.13 · Updates & Datensicherung
- Neu: Feste App-Signatur und hochzählende Versionsnummer – neue APKs lassen sich über die installierte App einspielen, Projekte bleiben erhalten.
- Neu: „Nach Updates suchen“ in den Optionen (GitHub-Releases) mit Hinweis auf der Startseite.
- Neu: „Alles sichern“ und „Wiederherstellen“ – alle Projekte, Autosave und Einstellungen als eine ZIP-Datei.
- Neu: Gerätespeicher dauerhaft schützen.

## 1.12 · Anzeige & Effekte
- Effekte sind standardmäßig aus und wirken nur noch auf große Flächen und Ränder (kein Vollbild-Overlay mehr).
- Layout-Wächter gegen seitliche Ränder, Kamera-Abstand optional, „Anzeige prüfen“ in den Optionen.

## 1.11 · Anleitung
- Neu: Interaktiver Rundgang und Handbuch in der App (Optionen oder Startseite → Hilfe).

## 1.10 · Android-Feinschliff
- Zurück-Taste schließt Fenster und führt zur Startseite, Vollbild und Querformat randlos.
- Icons je Design vereinheitlicht, Transportleiste und Werkzeugleiste ans Design angepasst.

## 1.9 · Kreativ-Werkzeuge
- Beat-Slicer, Tonart-Erkennung mit Transponieren, Stem-Import-Assistent, Strukturmarker.

## 1.8 · Mix & Export
- Automation, LUFS-Messung mit Limiter, Spektrum.
- Export als Stems-ZIP, Loop-Bereich, komprimiert oder MIDI.

## 1.7 · Clip-Bearbeitung
- Teilen, zuschneiden, kopieren, einfügen, verschieben; Fades und Überblendungen; Mehrfachauswahl; Lücke schließen.
- Großansicht je Spur, Autosave mit Wiederherstellung.

## 1.6 · Fenster-Modus
- Editor, Drums, Vocal, Mixer und Spuren als einzeln ein- und ausklappbare Fenster.
- Einheitliche Transport-Buttons, klarere Zurück/Vor-Symbole.

## 1.5 · KI & Sprache
- KI-Assistent mit Sprachsteuerung.
- Audio-zu-MIDI per Basic-Pitch-KI.

## 1.4 · Design-Optionen
- Farbe, Transparenz, Unschärfe und Rundung einstellbar; „Vor“-Button (Redo).

## 1.3 · Neues Design
- Theme „Liquid Matt“, schwebende Navigation unten, kompaktere Spurkarten, aufgeräumtes Datei-Menü.

## 1.2 · SoundFonts
- SpessaSynth-Integration: SoundFonts laden und als Instrument nutzen.

## 1.1 · Mixer & Editor
- Mixer, Piano-Roll, Drum-Pattern und Vocal-Ansicht für Suno-Stems.

## 1.0 · Erste Fassung
- Suno-Stems laden, abspielen, mischen und exportieren.
