# Sunshine@R – Updates ohne Datenverlust

## Warum waren die Daten bisher weg?
Android installiert ein Update nur über eine bestehende App, wenn die neue APK **mit demselben Schlüssel signiert** ist und eine **höhere Versionsnummer** hat.
Bisher hat jeder GitHub-Lauf einen neuen Zufallsschlüssel erzeugt und die Versionsnummer blieb 1 → Android lehnte das Update ab → nur Deinstallieren + Neuinstallieren ging → alle Projekte (liegen in der App) waren weg.

Jetzt:
- Alle Builds werden mit **einem festen Schlüssel** (`signing/sunshine.p12`) signiert.
- Die Versionsnummer zählt bei jedem Lauf automatisch hoch (Build 1, 2, 3 …).
- Jeder Lauf veröffentlicht die APK als **Release** („Build 17“). Die App fragt dort nach Updates (Optionen → Updates & Datensicherung).

## Einmalige Umstellung (diesmal geht es nicht ohne Neuinstallation)
Die jetzt installierte App wurde mit einem Zufallsschlüssel signiert, den es nicht mehr gibt. Darüber kann **nichts** installiert werden – einmalig muss deshalb deinstalliert werden. Danach nie wieder.
1. **Vorher retten, was du brauchst** (die alte App hat noch keine Sicherung): Master/Stems als WAV/ZIP exportieren, MIDI als .mid exportieren.
   *Alternative ohne Verlust:* In `capacitor.config.json` (oder `.ts`) die `appId` ändern (z. B. auf `de.sunshine.rdaw`). Dann installiert sich die neue App **neben** der alten, und du kannst in Ruhe exportieren. Danach alte App löschen.
2. Dateien ins Repo:
   | Datei | Ziel im Repo |
   |---|---|
   | `index_ueberarbeitet.html` | wie bisher als `www/index.html` |
   | `sunshine.p12` | `signing/sunshine.p12` (neuer Ordner) |
   | `patch-android.cjs` | `scripts/patch-android.cjs` (ersetzen) |
   | `build-apk.yml` | `.github/workflows/build-apk.yml` (ersetzen) |
   | `CHANGELOG.md` | **Hauptordner** des Repos (neu – siehe „Änderungsprotokoll“) |
3. Commit → GitHub-Lauf abwarten (Actions). Im Log steht bei „Signatur anzeigen“ der Fingerabdruck – er muss in jedem Lauf gleich sein.
4. APK aus **Releases** (rechts auf der Repo-Startseite, „Build N“) laden, alte App deinstallieren (falls gleiche appId), neue installieren.

## Ab dann: Update in 4 Schritten
1. Neue `index.html` ins Repo committen → der Lauf baut „Build N+1“ und legt eine Release an.
2. In der App: **Optionen → Updates & Datensicherung → Nach Updates suchen** (oder der Hinweis auf der Startseite; beim Start wird höchstens alle 12 Std. automatisch geprüft).
3. **Update herunterladen** → Datei öffnen → **Installieren/Aktualisieren**.
4. Fertig – Projekte, Autosave und Einstellungen sind noch da.

Vor größeren Änderungen: **Optionen → Alles sichern** erzeugt eine ZIP mit allen Projekten; **Wiederherstellen** spielt sie zurück (auch auf einem neuen Handy).

## Änderungsprotokoll („Was ist neu“)
- Die Datei **`CHANGELOG.md`** (Hauptordner des Repos) ist die einzige Quelle. Ganz oben steht der neueste Abschnitt:
  ```
  ## 1.15 · 2026-12-01 · Titel der Version
  - Neu: Was jetzt möglich ist
  - Behoben: Was nicht mehr hakt
  ```
- Dieser oberste Abschnitt wird (1) in die App eingebaut (Optionen → Updates → **Was ist neu?**, nach einem Update einmal als Karte auf der Startseite) und (2) vom GitHub-Lauf als **Release-Text** veröffentlicht – deshalb steht beim Update-Hinweis in der App, was die Version bringt.
- Bei jeder Lieferung von mir kommt ein neuer Abschnitt dazu. Ändert ihr die `index.html` selbst, bitte `CHANGELOG.md` mit committen (beides gehört zusammen).

## Live-Update der Oberfläche (ohne neue APK)
Voraussetzungen: **öffentliches Repository** und eine APK, die schon die Live-Update-Funktion enthält (Version 1.14 oder neuer – diese eine APK muss einmal normal installiert werden).
1. Nur `index.html` (und `CHANGELOG.md`) ändern und committen. Der Lauf baut wie immer eine APK und legt eine Release an. In den Release-Text schreibt er eine unsichtbare Zeile mit Version, Commit und Prüfsumme der neuen Oberfläche.
2. In der App meldet die Startseite **„Neue Oberfläche … bereit“** → **Laden** (kommt direkt von GitHub, wird per Prüfsumme geprüft) → **Neu starten**.
3. Startet die neue Oberfläche nicht, springt die App nach spätestens 15 Sekunden von selbst auf die eingebaute Version zurück und überspringt diese Version künftig. Manuell: Optionen → Updates → **Auf eingebaute Version zurücksetzen**.
4. **Wann trotzdem eine APK nötig ist:** wenn sich `scripts/patch-android.cjs`, `package.json`, `capacitor.config.*` oder andere Dateien neben der `index.html` (z. B. unter `www/assets/`) ändern. Der Lauf erkennt das über eine Prüfsumme der „App-Hülle“ und die App bietet dann automatisch die APK an.
- Eine neu installierte APK verwirft geladene Oberflächen (die eingebaute ist dann ohnehin so neu oder neuer).
- Ehrliche Grenze: Das Live-Update stützt sich auf einen Service Worker in der Android-WebView. Im Browser-Test funktioniert alles (Laden, Prüfen, Rückfall), auf einem echten Gerät konnte ich es nicht ausprobieren. Meldet die App „Live-Update geht auf diesem Gerät nicht“, bleibt sie einfach bei der eingebauten Version und das normale APK-Update funktioniert weiter. Mit dem Schalter in den Optionen lässt es sich komplett ausschalten.

## Wöchentliche Sicherung
- Standardmäßig an (Optionen → Updates & Datensicherung → „Wöchentliche Sicherung“). Die erste kommt 7 Tage nach dem ersten Start.
- In der Android-App wird still eine ZIP nach **Dokumente/SunshineDAW/Sicherung** geschrieben (die letzten 4 bleiben). Ist das Projekt sehr groß (über ca. 100 MB) oder gibt es keinen Dateizugriff, erscheint stattdessen auf der Startseite eine Erinnerung mit **Sichern**.
- Die ZIP lässt sich mit **Wiederherstellen** zurückspielen (auch auf einem neuen Handy).

## Wichtig
- **`sunshine.p12` gut aufbewahren** (zusätzlich zur Kopie im Repo: auf dem PC/Cloud). Geht der Schlüssel verloren oder wird ein anderer genutzt, ist wieder eine Neuinstallation nötig.
- Das Passwort des mitgelieferten Schlüssels steht im Skript. Ist dein Repository **öffentlich**, ist der Schlüssel faktisch öffentlich (für eine private Hobby-App meist ok, aber nicht ideal). Besser: eigenen Schlüssel erzeugen und als Secrets hinterlegen:
  ```
  keytool -genkeypair -keystore sunshine.p12 -storetype PKCS12 -alias mein-alias -keyalg RSA -keysize 2048 -validity 36500
  base64 -w0 sunshine.p12      # Ausgabe als Secret ANDROID_KEYSTORE_B64 speichern
  ```
  Weitere Secrets: `ANDROID_KEYSTORE_PASS` (Passwort) und `ANDROID_KEY_ALIAS` (Alias). Der Workflow nimmt sie automatisch, sobald sie existieren. (Wechsel des Schlüssels = einmal Neuinstallation.)
- Die Versionsnummer ist die GitHub-Laufnummer. Wird das Repo gelöscht/neu angelegt, beginnt sie bei 1 – dann wäre ein Update „älter“ als die installierte App.
- **Privates Repo:** Die App kann die Release dann nicht automatisch abfragen (Meldung „privat“). Die APK lässt sich trotzdem aus dem eingeloggten Browser unter Releases laden und installieren.
- Android fragt beim ersten Mal nach „Installation aus dieser Quelle erlauben“ (für den Browser, mit dem du die APK lädst).

## Wenn etwas hakt
| Meldung | Ursache |
|---|---|
| „App nicht installiert“ / „Konflikt mit vorhandenem Paket“ | installierte App hat anderen Schlüssel (noch die alte) → einmalig deinstallieren |
| „Downgrade“ / nichts passiert | Versionsnummer nicht höher (Repo neu angelegt?) |
| Workflow-Fehler „signing/sunshine.p12 fehlt“ | Datei nicht im Repo oder Ordner falsch |
| Release-Schritt 403 | Repo → Settings → Actions → General → Workflow permissions: „Read and write“ |
| In der App „Entwicklungsversion“ | `index.html` im Repo enthält den Platzhalter nicht (alte Datei?) |
| Beim Update-Hinweis fehlt der „Was ist neu“-Text | `CHANGELOG.md` fehlt im Hauptordner des Repos |
| „Live-Updates … nur in der gebauten App“ / „Hintergrunddienst startet nicht“ | Entwicklungsversion bzw. Gerät/WebView unterstützt keinen Service Worker → normales APK-Update nutzen |
| „Download fehlgeschlagen (Fehler 404)“ beim Live-Update | Repo ist privat oder der Commit wurde entfernt |
