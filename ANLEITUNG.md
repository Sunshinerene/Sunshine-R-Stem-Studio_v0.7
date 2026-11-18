# Sunshine@R – Update: Offline, Vollbild, Zurück-Taste

## 1. Dateien einsetzen
- `index_ueberarbeitet.html` → wie bisher als `www/index.html` (bzw. dein bisheriger Name)
- Ordner `www/assets/vendor/` (Tailwind + JSZip) → in dein `www/assets/` kopieren.
  Ohne diese zwei Dateien lädt die App sie weiter aus dem Internet (dann geht sie offline nicht).
- `scripts/patch-android.cjs` → in dein Repo unter `scripts/`

## 2. Im GitHub-Workflow einen Schritt ergänzen
Direkt NACH `npx cap add android` (oder dem Schritt, der den android-Ordner erzeugt) und VOR dem Gradle-Build:

```yaml
      - name: Android-Feinschliff (Vollbild, Zurück-Taste)
        run: node scripts/patch-android.cjs && npx cap sync android
```

Liegt der android-Ordner bei dir schon im Repo, einmal lokal ausführen: `node scripts/patch-android.cjs`.
Das Skript ist wiederholbar und legt Sicherungen (`*.orig`) an.

## 3. Prüfen nach der Installation
- Querformat: Statusleiste/Navigationsleiste weg, Inhalt bis zum Rand (Wischen vom Rand zeigt die Leisten kurz).
- Zurück-Taste: schließt zuerst Dialoge/Menüs, dann → Startseite, dann → App in den Hintergrund.
- Flugmodus an, App starten: Oberfläche muss normal aussehen (nur die Schriftart weicht ab).
