# Änderungsprotokoll · Sunshine@R DAW Studio
<!-- Pflege: Ganz oben einen neuen Abschnitt „## Version · Datum · Titel“ anlegen, darunter die Neuerungen als Stichpunkte.
     Der oberste Abschnitt wird (1) in die App eingebaut („Was ist neu“) und (2) bei GitHub als Release-Text veröffentlicht. -->

## 1.20 · 2026-11-19 · Start-Intro
- Neu: Beim Öffnen der App läuft jetzt dein Intro-Video (10 Sekunden, mit Ton). „Überspringen“ oder die Zurück-Taste beendet es sofort, der Lautsprecher-Knopf schaltet den Ton um. Es läuft einmal pro App-Start, nicht bei jedem Zurückkehren in die App.
- Neu: Optionen → Design & Aussehen → „Start-Intro“: beim Start abspielen ein/aus, mit oder ohne Ton und „Intro jetzt ansehen“ – das Video lässt sich also auch bei ausgeschaltetem Start jederzeit anschauen.
- Hinweis: Das Video liegt als eigene Datei in `www/assets/` (intro.mp4 und intro-poster.jpg). Weil sich damit Dateien außerhalb der index.html ändern, braucht dieses Update eine neue APK. Startet der Ton nicht automatisch (Android-Sperre), läuft das Intro stumm und der Lautsprecher-Knopf schaltet ihn zu.

## 1.19 · 2026-11-19 · Player & Musik im Hintergrund
- Neu: Die Musik läuft jetzt auch im Hintergrund und bei gesperrtem Bildschirm weiter – für den neuen Player und für die DAW-Wiedergabe. In der Benachrichtigungsleiste und auf dem Sperrbildschirm erscheint ein Player mit Titel, Cover im Farbton deines Designs und Tasten (Zurück, Play/Pause, Weiter bzw. Stopp). Das gibt es nur in der Android-App; es braucht einmalig eine neue APK.
- Neu: Einfacher Player für reine Audiodateien – WAV, MP3, M4A, OGG, FLAC. Auch ganze ZIP-Dateien (z. B. der Suno-Download) lassen sich öffnen; die Titel darin erscheinen sortiert in der Liste und werden erst beim Abspielen entpackt. Mit Zufall, Wiederholen (aus/alle/ein Titel), Lautstärke und kleiner Leiste, wenn du den Player schließt. Erreichbar über ☰ → Player, die Startseite und die Optionen.
- Neu: Optionen → Klang → „Player & Hintergrund“: Hintergrund-Wiedergabe und Benachrichtigungs-Player lassen sich abschalten.
- Besser: Der Taktgeber der DAW läuft in einem eigenen Arbeitsthread, damit Drums und MIDI auch bei gesperrtem Bildschirm nicht ins Stocken geraten.
- Hinweis: Player und DAW spielen nie gleichzeitig – startest du das eine, hält das andere an. Die Titelliste des Players bleibt nur bis zum Schließen der App erhalten. Hält Android die App trotzdem nach längerer Zeit an, hilft in den Android-Einstellungen für die App „Akku → Nicht einschränken“.
- Hinweis: Ändert die Datei scripts/patch-android.cjs – deshalb ist diesmal eine neue APK nötig (Live-Update allein reicht nicht). Beim ersten Start fragt Android auf neueren Versionen nach der Erlaubnis für Benachrichtigungen.

## 1.18 · 2026-11-19 · Übersichtliche Optionen
- Neu: Die Optionen sind jetzt in sechs Kategorien geordnet – Design & Aussehen, Effekte & Anzeige, Klang, KI & Assistent, Leistung & Speicher, Updates & Datensicherung, Hilfe & Feedback. Beim Öffnen siehst du die Übersicht mit Kurzinfo; ein Tipp öffnet die Einstellungen der Kategorie.
- Neu: Suchfeld in den Optionen – findet Einstellungen nach Stichwort („Farbe“, „Update“, „Speicher“ …).
- Besser: Die Zurück-Leiste „‹ Optionen“ bleibt beim Scrollen oben stehen; Zurück-Taste und Esc führen erst zur Übersicht, dann schließen sie die Optionen. Nach einem Design-Wechsel bleibst du auf der Seite „Design“.
- Hinweis: Alle bisherigen Einstellungen sind unverändert vorhanden – sie liegen nur an einer geordneten Stelle. Das Update kommt über das Live-Update (nur index.html geändert).

## 1.17 · 2026-11-19 · Aufgeräumte Großansicht, Feedback & Vorschau
- Neu: Klavier/Piano Roll, Drum-Sequencer, Mixer und MIDI-Werkzeuge öffnen jetzt in einem eigenen Großansicht-Fenster, wenn du sie brauchst – das Hauptfenster bleibt übersichtlich (Spuren, Transport und Navigation bleiben immer erreichbar). Schließen mit ✕, Zurück-Taste oder Esc; ein zweiter Tipp auf den Knopf schließt ebenfalls.
- Neu: Der MIDI-Editor ist in fünf Werkzeug-Gruppen aufgeteilt (Raster, Tonart, Generator, Audio→MIDI, Klang) – es ist immer nur die Gruppe sichtbar, die du gerade brauchst. Die Auswahl wird gemerkt.
- Neu: Feedback-Funktion für Tester (Menü, Startseite und Optionen): Fehler, Ideen, Anmerkungen, Lob oder Fragen schreiben, Bereich wird automatisch erkannt. Optional werden Geräte-/Versionsangaben und das technische Fehlerprotokoll (keine Audiodaten, keine Projektinhalte) angehängt. Du siehst vorher genau, was mitgeht, und schickst es per E-Mail, Teilen, Datei oder Kopieren selbst ab – es wird nichts automatisch gesendet.
- Neu: Update-Vorschau („Bald neu“) auf der Startseite und in „Was ist neu“: ein kurzer Ausblick auf das nächste Release. Der Text wird beim Start live aus der Datei VORSCHAU.md im Repo nachgeladen (ohne neue App-Version) und lässt sich wegklicken.
- Besser: Optionen → Darstellung der Fenster: „Großansicht“ ist neu der Standard; die bisherigen Modi „Fenster“ (Ziehharmonika) und „Tabs“ bleiben wählbar. Wer bewusst Tabs gewählt hatte, behält sie.
- Besser: Der Hintergrunddienst für Live-Updates startet jetzt in der Android-App (vorher meldete die App „Der Hintergrunddienst konnte nicht starten“). Seine Dateien kommen nun wie die Seite aus der App selbst.
- Hinweis: Dieser Fix ändert die Android-Hülle – deshalb einmal die neue APK installieren. Danach können Oberflächen-Änderungen über das Live-Update kommen.
- Hinweis: Das Feedback läuft ohne Server: „Per E-Mail“ öffnet die Mail-App mit fertigem Text (Betreff „Feedback Sunshine@R DAW Studio“); Teilen, Datei und Kopieren liefern denselben Inhalt.

## 1.16 · 2026-11-19 · Speicher-Sparer, schlankere App
- Neu: Speicher-Sparer (Optionen → Speicher-Sparer, standardmäßig aus): Spuren, die gerade nicht zu hören sind (stumm oder durch Solo ausgeblendet), werden aus dem Arbeitsspeicher entladen – bei einer 4½-Minuten-Stereo-Spur sind das rund 95 MB. Wellenform, Länge und Name bleiben sichtbar; beim Einschalten, Abspielen oder Exportieren lädt die App die Spur automatisch wieder, bit-genau. Einzelne Spuren lassen sich auch von Hand entladen und laden.
- Besser: Das Design (Tailwind) wird nicht mehr beim Start im Handy berechnet, sondern liegt fertig in der App. Das spart ca. 400 KB Programmcode, Rechenzeit beim Start und bei jeder Änderung der Oberfläche. Aussehen unverändert (in 135 Ansichten Punkt für Punkt gegen die alte Version geprüft).
- Besser: Logo und App-Icon sind deutlich kleiner (Logo 2,5 MB → ca. 0,2 MB) – die App wird schneller geladen und das Paket schlanker.
- Hinweis: Wer gleichzeitig viele Spuren hört, braucht diese Spuren auch gleichzeitig im Speicher. Der Sparer entlastet vor allem beim Arrangieren und beim Abhören einzelner Stems.
- Hinweis: Diese Version ändert Dateien der App (Logo, Design). Das Update läuft deshalb über eine neue APK, nicht über das Live-Update.

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
