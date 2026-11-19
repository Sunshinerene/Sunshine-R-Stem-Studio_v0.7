#!/usr/bin/env node
/* Sunshine@R · Android-Feinschliff für das Capacitor-Projekt
   Aufruf (im Repo-Hauptordner), NACHDEM der android/-Ordner existiert:
       npx cap add android      (nur beim ersten Mal / wenn der Ordner im CI neu erzeugt wird)
       node scripts/patch-android.cjs
       npx cap sync android
   Was es macht:
     1. Vollbild im Querformat: Systemleisten ausblenden (Wischen zeigt sie kurz), Kamera-Ausschnitt nutzen (shortEdges)
     2. Hochformat: normale Statusleiste, Inhalt darunter
     3. Android-Zurück-Taste → ruft window.__androidBack() in der Web-App (Dialog schließen / Startseite), sonst App in den Hintergrund
     4. Bildschirm bleibt an, solange die App im Vordergrund ist (Musik-App: kein Abdunkeln beim Abspielen)
     5. Hintergrundfarbe der Fenster = App-Farbe (kein weißes Aufblitzen beim Start/Drehen)
     6. Feste Signatur (signing/sunshine.p12) + hochzählende versionCode (BUILD_NUMBER) → Updates über die installierte App, Daten bleiben
   Das Skript ist wiederholbar (erkennt, was schon gepatcht ist). */
const fs = require('fs'), path = require('path');
const root = process.argv[2] || process.cwd();
const app = path.join(root, 'android', 'app', 'src', 'main');
if (!fs.existsSync(app)) { console.error('android/app/src/main nicht gefunden – erst „npx cap add android“ ausführen.'); process.exit(1); }
// Sicherungen NIE in res/ oder java/ ablegen – Gradle würde sie als Ressource/Quelltext behandeln und scheitern
const bak = path.join(root, 'android', 'sunshine-orig'); fs.mkdirSync(bak, { recursive: true });
for (const d of ['res/values', 'java']) { const base = path.join(app, d); if (!fs.existsSync(base)) continue; (function w(x){ for (const e of fs.readdirSync(x, { withFileTypes: true })) { const q = path.join(x, e.name); if (e.isDirectory()) w(q); else if (e.name.endsWith('.orig')) fs.unlinkSync(q); } })(base); }
const log = m => console.log('[patch-android] ' + m);

// ---- MainActivity.java -----------------------------------------------------------
function findFile(dir, name) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { const r = findFile(p, name); if (r) return r; } else if (e.name === name) return p;
  }
  return null;
}
const javaDir = path.join(app, 'java');
let ma = fs.existsSync(javaDir) ? findFile(javaDir, 'MainActivity.java') : null;
if (!ma) { console.error('MainActivity.java nicht gefunden.'); process.exit(1); }
let src = fs.readFileSync(ma, 'utf8');
if (src.includes('SUNSHINE_PATCH')) { log('MainActivity.java ist schon gepatcht.'); }
else {
  const pkg = (src.match(/^\s*package\s+([\w.]+)\s*;/m) || [])[1];
  if (!pkg) { console.error('package-Zeile nicht gefunden.'); process.exit(1); }
  fs.writeFileSync(path.join(bak, 'MainActivity.java.txt'), src);
  fs.writeFileSync(ma, `package ${pkg};
// SUNSHINE_PATCH – von scripts/patch-android.cjs erzeugt
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    applyBars(getResources().getConfiguration());
    getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
      @Override
      public void handleOnBackPressed() {
        final WebView wv = getBridge() != null ? getBridge().getWebView() : null;
        if (wv == null) { moveTaskToBack(true); return; }
        wv.evaluateJavascript(
          "(function(){try{return window.__androidBack?window.__androidBack():false}catch(e){return false}})()",
          value -> { if (!"true".equals(value)) moveTaskToBack(true); });
      }
    });
  }

  @Override
  public void onConfigurationChanged(Configuration c) {
    super.onConfigurationChanged(c);
    applyBars(c);
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) applyBars(getResources().getConfiguration());
  }

  /** Querformat: randlos + Systemleisten weg. Hochformat: normale Leisten. */
  private void applyBars(Configuration c) {
    Window w = getWindow();
    boolean land = c.orientation == Configuration.ORIENTATION_LANDSCAPE;
    WindowCompat.setDecorFitsSystemWindows(w, !land);
    WindowInsetsControllerCompat ctl = WindowCompat.getInsetsController(w, w.getDecorView());
    if (ctl == null) return;
    if (land) {
      ctl.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
      ctl.hide(WindowInsetsCompat.Type.systemBars());
    } else {
      ctl.show(WindowInsetsCompat.Type.systemBars());
    }
  }
}
`);
  log('MainActivity.java geschrieben (' + pkg + ', Sicherung: android/sunshine-orig/).');
}

// ---- styles.xml: Kamera-Ausschnitt nutzen + Fensterfarbe -----------------------------
const stylesP = path.join(app, 'res', 'values', 'styles.xml');
if (fs.existsSync(stylesP)) {
  let st = fs.readFileSync(stylesP, 'utf8');
  if (st.includes('windowLayoutInDisplayCutoutMode')) log('styles.xml ist schon gepatcht.');
  else {
    const add = '\n        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>\n        <item name="android:windowBackground">@android:color/black</item>\n        <item name="android:navigationBarColor">@android:color/black</item>\n        <item name="android:statusBarColor">@android:color/black</item>';
    // in alle <style name="AppTheme…"> Blöcke einfügen (Standard-Theme, NoActionBar, Splash)
    const cut = '\n        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>';
    let n = 0;
    st = st.replace(/(<style\s+name="(AppTheme[^"]*)"[^>]*>)/g, (m, tag, nm) => { n++; return tag + (/Launch|Splash/i.test(nm) ? cut : add); });
    fs.writeFileSync(path.join(bak, 'styles.xml.txt'), fs.readFileSync(stylesP));
    fs.writeFileSync(stylesP, st);
    log('styles.xml: ' + n + ' Theme(s) ergänzt.');
  }
} else log('styles.xml nicht gefunden – übersprungen.');

// ---- AndroidManifest: Tastatur schiebt Inhalt hoch, Hardwarebeschleunigung -------------
const manP = path.join(app, 'AndroidManifest.xml');
if (fs.existsSync(manP)) {
  let mf = fs.readFileSync(manP, 'utf8');
  if (!/android:hardwareAccelerated=/.test(mf)) { mf = mf.replace(/<activity\b/, '<activity android:hardwareAccelerated="true"'); fs.writeFileSync(manP, mf); log('Manifest: hardwareAccelerated gesetzt.'); }
  else log('Manifest: nichts zu tun.');
}
// ---- build.gradle: FESTE Signatur + hochzählende versionCode  (Voraussetzung für Updates über die installierte App) --------
//   Android installiert ein Update nur, wenn (1) die Signatur dieselbe ist und (2) die versionCode höher ist.
//   Ohne dieses Stück erzeugt jeder CI-Lauf einen neuen Zufallsschlüssel → "App nicht installiert" → Deinstallieren → Daten weg.
const gradleP = path.join(root, 'android', 'app', 'build.gradle');
if (fs.existsSync(gradleP)) {
  let g = fs.readFileSync(gradleP, 'utf8'), changed = false;
  const ksSrc = process.env.SUNSHINE_KEYSTORE || path.join(root, 'signing', 'sunshine.p12');
  const ksPass = process.env.SUNSHINE_KS_PASS || 'sunshine-daw-signing', ksAlias = process.env.SUNSHINE_KS_ALIAS || 'sunshine';
  if (!g.includes('SUNSHINE_SIGNING')) {
    if (fs.existsSync(ksSrc)) {
      fs.copyFileSync(ksSrc, path.join(root, 'android', 'app', 'sunshine.p12'));
      fs.writeFileSync(path.join(bak, 'build.gradle.txt'), g);
      const q = x => "'" + String(x).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
      const blk = `\n    // SUNSHINE_SIGNING – feste Signatur (scripts/patch-android.cjs)\n    signingConfigs {\n        debug {\n            storeFile file('sunshine.p12')\n            storePassword ${q(ksPass)}\n            keyAlias ${q(ksAlias)}\n            keyPassword ${q(ksPass)}\n            storeType 'pkcs12'\n        }\n    }\n`;
      if (/\bandroid\s*\{/.test(g)) { g = g.replace(/(\bandroid\s*\{)/, '$1' + blk); changed = true; log('build.gradle: feste Signatur eingetragen (' + path.relative(root, ksSrc) + ').'); }
      else console.error('[patch-android] WARNUNG: android { }-Block in build.gradle nicht gefunden – Signatur NICHT gesetzt.');
    } else console.error('[patch-android] WARNUNG: ' + path.relative(root, ksSrc) + ' fehlt – ohne feste Signatur sind KEINE Updates über die installierte App möglich.');
  } else log('build.gradle: Signatur schon eingetragen.');
  const N = process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER;
  if (N && /^\d+$/.test(N)) {
    const g2 = g.replace(/versionCode\s+\d+/, 'versionCode ' + N).replace(/versionName\s+"[^"]*"/, 'versionName "1.0.' + N + '"');
    if (g2 !== g) { g = g2; changed = true; log('build.gradle: versionCode = ' + N + ', versionName = 1.0.' + N); }
  } else log('Keine BUILD_NUMBER gesetzt – versionCode bleibt (lokaler Build).');
  if (changed) fs.writeFileSync(gradleP, g);
} else log('android/app/build.gradle nicht gefunden – Signatur/Version übersprungen.');
log('fertig.');
