# Sunshine@R – Anleitung für den Alltag

## 1. Ein Update einspielen
1. Die neue Seite als **`www/index.html`** ins Repository legen (alte Datei ersetzen).
2. **`CHANGELOG.md`** im Hauptordner ersetzen – der oberste Abschnitt erscheint in der App unter „Was ist neu“ und als Text des GitHub-Releases.
3. Commit auf `main`. Unter **Actions** startet der Lauf „Build APK“ und legt danach unter **Releases** den neuen Build an.
4. Handy: **Optionen → Updates & Datensicherung → Nach Updates suchen → Herunterladen → Installieren**.

### Wann reicht das Live-Update, wann braucht es eine neue APK?
- Hat sich **nur `www/index.html`** geändert, bietet die App eine „neue Oberfläche“ an, die ohne Neuinstallation geladen wird (mit automatischem Rückfall, falls sie nicht startet).
- Haben sich **andere Dateien** geändert (Logo/Icons in `www/assets/`, `scripts/`, `package.json`, `capacitor.config.json`), wird eine neue APK angeboten, die du installierst.
- Version 1.17 hat `scripts/patch-android.cjs` geändert (Hintergrunddienst für Live-Updates) und brauchte eine neue APK.
- Version 1.18 änderte nur `www/index.html` (und `CHANGELOG.md`/`VORSCHAU.md`) → das **Live-Update** genügte.
- Version 1.23 (Transport in der unteren Leiste) ändert ebenfalls nur `www/index.html` (und `CHANGELOG.md`/`VORSCHAU.md`) → **Live-Update** reicht.
- Version 1.22 (Cover-Platz, Randeffekte, Design-Verknüpfung) ändert ebenfalls nur `www/index.html` (und `CHANGELOG.md`/`VORSCHAU.md`) → **Live-Update** reicht.
- Version 1.21 (Cover & Tags) ändert nur `www/index.html` (und `CHANGELOG.md`/`VORSCHAU.md`) → das **Live-Update** reicht – sofern 1.19/1.20 schon als APK installiert sind.
- **Version 1.20** bringt das Start-Intro als eigene Dateien `www/assets/intro.mp4` und `www/assets/intro-poster.jpg` mit – beide **mit hochladen**; auch hier ist eine neue APK nötig. (Wer 1.19 und 1.20 zusammen einspielt, braucht nur eine APK.)
- **Version 1.19 ändert `scripts/patch-android.cjs`** (Musik-Dienst und Benachrichtigungs-Player) → es braucht **einmalig eine neue APK**. Lade `scripts/patch-android.cjs`, `www/index.html` und `CHANGELOG.md` zusammen hoch; der GitHub-Lauf baut dann die APK, die du wie gewohnt installierst. Beim ersten Start fragt Android nach der Erlaubnis für Benachrichtigungen.

## 2. Dateien dieser Lieferung
| Datei | Ziel im Repo |
|---|---|
| `index_ueberarbeitet.html` | `www/index.html` (**umbenennen auf `index.html`**, alte Datei ersetzen) |
| `VORSCHAU.md` | Hauptordner (neu; Text der „Bald neu“-Vorschau) |
| `CHANGELOG.md` | Hauptordner (ersetzen) |
| `intro.mp4`, `intro-poster.jpg` | `www/assets/` (neu, ab 1.20) |
| `patch-android.cjs` | `scripts/patch-android.cjs` (ersetzen – **Pflicht ab 1.19**) |
| `README.md`, `ANLEITUNG.md` | Hauptordner (ersetzen) |
| `capacitor.config.json` | Hauptordner (ersetzen; `appId` bleibt gleich) |
| `.gitignore` | Hauptordner (neu) |

## 2a. Vorschau & Feedback pflegen
- **Vorschau:** `VORSCHAU.md` im Hauptordner bearbeiten (Titel = erste Überschrift nach „# Vorschau“, Stichpunkte mit `- `). Die App lädt sie beim Start live nach – ohne neues Update. Datei leeren = keine Vorschau. Das Repository muss öffentlich sein.
- **Feedback:** „Per E-Mail“ geht an die beim Bauen eingetragene Adresse (Betreff „Feedback Sunshine@R DAW Studio"). Eine andere Adresse wird beim Erstellen der Seite eingetragen – dafür bei mir melden.

## 3. Einmalig aufräumen (von Hand auf GitHub löschen)
- `signing/Test` – leere Test-Datei, wird nicht gebraucht.
- `www/assets/vendor/tailwind-3.4.17.js` – das Design ist ab 1.16 fest in der Seite eingebaut, die 400-KB-Datei wird nicht mehr geladen.
- Behalten: `www/assets/vendor/jszip-3.10.1.min.js`, `signing/sunshine.p12`.

Löschen auf GitHub: Datei öffnen → Mülleimer-Symbol oben rechts → „Commit changes“.

## 4. Wenn etwas schiefgeht
- **Neue Version startet nicht:** Die App fällt nach wenigen Sekunden von selbst auf die eingebaute Version zurück (Live-Update). Bei einer fehlerhaften APK: alte Releases bleiben auf GitHub; Android lässt keine niedrigere Versionsnummer zu, daher den Fehler beheben und einen neuen Build erzeugen.
- **Fehlerbericht:** Optionen → Stabilität & Leistung → Fehlerprotokoll → Kopieren / Als Datei.
- **Viel Speicher belegt:** Optionen → Speicher-Sparer (Spuren, die nicht klingen, entladen).
