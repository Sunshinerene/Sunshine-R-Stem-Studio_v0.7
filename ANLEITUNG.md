# Sunshine@R – Anleitung für den Alltag

## 1. Ein Update einspielen
1. Die neue Seite als **`www/index.html`** ins Repository legen (alte Datei ersetzen).
2. **`CHANGELOG.md`** im Hauptordner ersetzen – der oberste Abschnitt erscheint in der App unter „Was ist neu“ und als Text des GitHub-Releases.
3. Commit auf `main`. Unter **Actions** startet der Lauf „Build APK“ und legt danach unter **Releases** den neuen Build an.
4. Handy: **Optionen → Updates & Datensicherung → Nach Updates suchen → Herunterladen → Installieren**.

### Wann reicht das Live-Update, wann braucht es eine neue APK?
- Hat sich **nur `www/index.html`** geändert, bietet die App eine „neue Oberfläche“ an, die ohne Neuinstallation geladen wird (mit automatischem Rückfall, falls sie nicht startet).
- Haben sich **andere Dateien** geändert (Logo/Icons in `www/assets/`, `scripts/`, `package.json`, `capacitor.config.json`), wird eine neue APK angeboten, die du installierst.
- Die Version 1.17 ändert auch `scripts/patch-android.cjs` (Hintergrunddienst für Live-Updates) → **einmal neue APK installieren**. Ab dann sollten reine Oberflächen-Änderungen per Live-Update kommen (auf einem echten Gerät noch nicht bestätigt).

## 2. Dateien dieser Lieferung
| Datei | Ziel im Repo |
|---|---|
| `index_ueberarbeitet.html` | `www/index.html` (**umbenennen auf `index.html`**, alte Datei ersetzen) |
| `VORSCHAU.md` | Hauptordner (neu; Text der „Bald neu“-Vorschau) |
| `CHANGELOG.md` | Hauptordner (ersetzen) |
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
