# Sunshine@R DAW Studio

Eine Stem-DAW für das Handy: Suno-Stems (WAV/MP3/ZIP) importieren, mischen, mit Effekten veredeln, MIDI und Audio exportieren.
Die App ist eine einzelne Web-Seite (`www/index.html`), die mit Capacitor als Android-App verpackt wird. Sie läuft komplett offline, alle Projekte bleiben lokal auf dem Gerät.

## Inhalt des Repositories

| Pfad | Zweck |
|---|---|
| `www/index.html` | Die komplette App (Oberfläche, Audio-Engine, Handbuch) |
| `www/assets/` | Logo, App-Icon und `vendor/` (JSZip für den ZIP-Import) |
| `capacitor.config.json` | App-Name und Kennung (`de.sunshiner.stemdaw` – nicht ändern, sonst gilt es für Android als neue App) |
| `scripts/patch-android.cjs` | Android-Feinschliff (Vollbild, Zurück-Taste, Live-Update-Dienst) |
| `.github/workflows/build-apk.yml` | Baut bei jedem Commit auf `main` die APK und veröffentlicht sie als Release |
| `signing/sunshine.p12` | Fester Signaturschlüssel, damit Updates ohne Datenverlust installiert werden |
| `VORSCHAU.md` | Ausblick auf das nächste Update („Bald neu“ in der App) – wird live aus dem Repo geladen |
| `CHANGELOG.md` | Änderungsprotokoll – oberster Abschnitt = „Was ist neu“ in der App und Text des Releases |
| `ANLEITUNG.md` | Kurzanleitung für den Alltag (Update einspielen) |
| `ANLEITUNG-UPDATES.md` | Ausführlich: Signatur, Updates, Live-Update, Rückfall |

## Update einspielen (Kurzfassung)
1. `www/index.html` (und bei Bedarf `CHANGELOG.md`) ersetzen und committen.
2. GitHub-Lauf unter **Actions** abwarten, APK aus **Releases** laden.
3. In der App: **Optionen → Updates & Datensicherung → Nach Updates suchen**.

Mehr dazu in `ANLEITUNG.md`.
