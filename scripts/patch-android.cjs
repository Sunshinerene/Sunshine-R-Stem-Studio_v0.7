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
     6. App-Name „Sunshine@R DAW Studio“ (strings.xml)
     7. Feste Signatur (signing/sunshine.p12) + hochzählende versionCode (BUILD_NUMBER) → Updates über die installierte App, Daten bleiben
     8. Live-Update-Dienst: schreibt sw.js neben die index.html (damit die App neue Oberflächen ohne APK laden kann)
     9. Musik im Hintergrund: Vordergrunddienst + Media-Benachrichtigung (Play/Pause/Weiter/Zurück auf Sperrbildschirm und Benachrichtigungsleiste)
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
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(SunshineMediaPlugin.class);   // Musik-Benachrichtigung (muss vor super.onCreate stehen)
    super.onCreate(savedInstanceState);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    applyBars(getResources().getConfiguration());
    hookServiceWorker();
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

  /** Live-Update: Der Service Worker (sw.js) muss seine Dateien wie die Seite aus der App bekommen, sonst scheitert seine Registrierung. */
  private void hookServiceWorker() {
    try {
      if (android.os.Build.VERSION.SDK_INT < 24 || getBridge() == null) return;
      ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient() {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
          try { return getBridge().getLocalServer().shouldInterceptRequest(request); } catch (Throwable e) { return null; }
        }
      });
    } catch (Throwable e) { /* ohne Hintergrunddienst läuft die App normal weiter */ }
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
// ---- App-Name auf dem Startbildschirm: „Sunshine@R DAW Studio“ ------------------------------------------------------
const strP = path.join(app, 'res', 'values', 'strings.xml');
if (fs.existsSync(strP)) {
  let sx = fs.readFileSync(strP, 'utf8'); const NAME = 'Sunshine@R DAW Studio';
  const sx2 = sx.replace(/(<string\s+name="(?:app_name|title_activity_main)"[^>]*>)[^<]*(<\/string>)/g, '$1' + NAME + '$2');
  if (sx2 !== sx) { fs.writeFileSync(strP, sx2); log('strings.xml: App-Name = ' + NAME); } else log('strings.xml: Name schon gesetzt.');
}
// ---- Musik im Hintergrund: Vordergrunddienst + Media-Benachrichtigung ---------------------------------------------------
//   Die Web-App meldet ihren Wiedergabezustand an das Plugin „SunshineMedia“; der Dienst zeigt die Benachrichtigung und hält die App im Hintergrund am Leben.
const JAVA_SERVICE = `package __PKG__;
// SUNSHINE_MEDIA - von scripts/patch-android.cjs erzeugt
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;

/** Vordergrunddienst fuer die Musik-Benachrichtigung (Sperrbildschirm / Benachrichtigungsleiste). Haelt die App beim Abspielen im Hintergrund am Leben. */
public class PlaybackService extends Service {
  static final class State {
    String title = "";
    String artist = "";
    boolean playing = false;
    boolean hasPrev = false;
    boolean hasNext = false;
    long positionMs = 0;
    long durationMs = 0;
    int color = 0xFFFF8A1A;
    Bitmap art = null;
    boolean active = false;
  }
  static final State S = new State();
  static PlaybackService inst = null;
  static final Handler MAIN = new Handler(Looper.getMainLooper());

  static final String CH = "sunshine_playback";
  static final int NID = 4711;
  static final String A_SYNC = "de.sunshiner.stemdaw.SYNC";
  static final String A_PLAY = "de.sunshiner.stemdaw.PLAY";
  static final String A_PAUSE = "de.sunshiner.stemdaw.PAUSE";
  static final String A_NEXT = "de.sunshiner.stemdaw.NEXT";
  static final String A_PREV = "de.sunshiner.stemdaw.PREV";
  static final String A_STOP = "de.sunshiner.stemdaw.STOP";

  private MediaSession session;
  private boolean fg = false;

  /** Zustand wurde geaendert -> Benachrichtigung aktualisieren (und Dienst bei Bedarf starten). */
  static void push(final Context c) {
    final Context app = c.getApplicationContext();
    MAIN.post(new Runnable() {
      @Override
      public void run() {
        try {
          PlaybackService s = inst;
          if (s != null) { s.refresh(); return; }
          if (!S.active) return;
          Intent i = new Intent(app, PlaybackService.class);
          i.setAction(A_SYNC);
          if (Build.VERSION.SDK_INT >= 26) app.startForegroundService(i); else app.startService(i);
        } catch (Throwable t) { /* ohne Dienst laeuft die App normal weiter */ }
      }
    });
  }

  /** Alles beenden (Benachrichtigung weg). */
  static void halt(final Context c) {
    final Context app = c.getApplicationContext();
    S.active = false;
    MAIN.post(new Runnable() {
      @Override
      public void run() {
        try {
          PlaybackService s = inst;
          if (s != null) s.shutdown(); else app.stopService(new Intent(app, PlaybackService.class));
        } catch (Throwable t) { }
      }
    });
  }

  @Override
  public void onCreate() {
    super.onCreate();
    inst = this;
    try {
      if (Build.VERSION.SDK_INT >= 26) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationChannel ch = new NotificationChannel(CH, "Wiedergabe", NotificationManager.IMPORTANCE_LOW);
        ch.setDescription("Musiksteuerung");
        ch.setShowBadge(false);
        nm.createNotificationChannel(ch);
      }
      session = new MediaSession(this, "SunshineR");
      session.setCallback(new MediaSession.Callback() {
        @Override public void onPlay() { SunshineMediaPlugin.emit("play", -1); }
        @Override public void onPause() { SunshineMediaPlugin.emit("pause", -1); }
        @Override public void onSkipToNext() { SunshineMediaPlugin.emit("next", -1); }
        @Override public void onSkipToPrevious() { SunshineMediaPlugin.emit("prev", -1); }
        @Override public void onStop() { SunshineMediaPlugin.emit("stop", -1); }
        @Override public void onSeekTo(long pos) { SunshineMediaPlugin.emit("seek", pos); }
      });
    } catch (Throwable t) { }
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    String a = intent == null ? null : intent.getAction();
    try {
      if (A_PLAY.equals(a)) SunshineMediaPlugin.emit("play", -1);
      else if (A_PAUSE.equals(a)) SunshineMediaPlugin.emit("pause", -1);
      else if (A_NEXT.equals(a)) SunshineMediaPlugin.emit("next", -1);
      else if (A_PREV.equals(a)) SunshineMediaPlugin.emit("prev", -1);
      else if (A_STOP.equals(a)) { SunshineMediaPlugin.emit("stop", -1); shutdown(); return START_NOT_STICKY; }
      // Wurde der Dienst per startForegroundService gestartet, muss binnen Sekunden startForeground folgen
      if (!fg) { startFg(build()); fg = true; }
      refresh();
    } catch (Throwable t) { }
    return START_NOT_STICKY;
  }

  private void startFg(Notification n) {
    if (Build.VERSION.SDK_INT >= 29) startForeground(NID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
    else startForeground(NID, n);
  }

  void refresh() {
    try {
      if (!S.active) { shutdown(); return; }
      syncSession();
      Notification n = build();
      NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
      if (S.playing) {
        if (!fg) { startFg(n); fg = true; } else nm.notify(NID, n);
      } else {
        if (fg) {
          if (Build.VERSION.SDK_INT >= 24) stopForeground(Service.STOP_FOREGROUND_DETACH); else stopForeground(false);
          fg = false;
        }
        nm.notify(NID, n);
      }
    } catch (Throwable t) { }
  }

  private void syncSession() {
    if (session == null) return;
    long actions = PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE | PlaybackState.ACTION_PLAY_PAUSE | PlaybackState.ACTION_STOP;
    if (S.hasNext) actions |= PlaybackState.ACTION_SKIP_TO_NEXT;
    if (S.hasPrev) actions |= PlaybackState.ACTION_SKIP_TO_PREVIOUS;
    if (S.durationMs > 0) actions |= PlaybackState.ACTION_SEEK_TO;
    PlaybackState.Builder pb = new PlaybackState.Builder();
    pb.setActions(actions);
    pb.setState(S.playing ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED, S.positionMs, S.playing ? 1f : 0f, SystemClock.elapsedRealtime());
    session.setPlaybackState(pb.build());
    MediaMetadata.Builder mb = new MediaMetadata.Builder();
    mb.putString(MediaMetadata.METADATA_KEY_TITLE, S.title);
    mb.putString(MediaMetadata.METADATA_KEY_ARTIST, S.artist);
    if (S.durationMs > 0) mb.putLong(MediaMetadata.METADATA_KEY_DURATION, S.durationMs);
    if (S.art != null) mb.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, S.art);
    session.setMetadata(mb.build());
    session.setActive(true);
  }

  private static String mmss(long ms) {
    long s = ms / 1000;
    if (s < 0) s = 0;
    return (s / 60) + ":" + ((s % 60) < 10 ? "0" : "") + (s % 60);
  }

  private PendingIntent act(String action, int code) {
    Intent i = new Intent(this, PlaybackService.class);
    i.setAction(action);
    int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
    return PendingIntent.getService(this, code, i, fl);
  }

  private Notification build() {
    Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CH) : new Notification.Builder(this);
    int small = getResources().getIdentifier("ic_stat_sunshine", "drawable", getPackageName());
    if (small == 0) small = android.R.drawable.ic_media_play;
    b.setSmallIcon(small);
    b.setContentTitle(S.title == null || S.title.length() == 0 ? "Sunshine@R" : S.title);
    b.setContentText(S.artist);
    if (S.art != null) b.setLargeIcon(S.art);
    if (S.playing) {
      // laufende Zeit (vom System gezaehlt, kein Aufwand fuer die App)
      b.setShowWhen(true);
      b.setUsesChronometer(true);
      b.setWhen(System.currentTimeMillis() - S.positionMs);
    } else {
      b.setShowWhen(false);
      if (S.positionMs > 0 || S.durationMs > 0) b.setSubText(mmss(S.positionMs) + (S.durationMs > 0 ? " / " + mmss(S.durationMs) : ""));
    }
    b.setOnlyAlertOnce(true);
    b.setOngoing(S.playing);
    b.setColor(S.color);
    b.setCategory(Notification.CATEGORY_TRANSPORT);
    b.setVisibility(Notification.VISIBILITY_PUBLIC);
    b.setDeleteIntent(act(A_STOP, 5));
    Intent open = getPackageManager().getLaunchIntentForPackage(getPackageName());
    if (open != null) {
      open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
      b.setContentIntent(PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0)));
    }
    int idx = 0;
    int[] compact = new int[3];
    int n = 0;
    if (S.hasPrev) { b.addAction(android.R.drawable.ic_media_previous, "Vorher", act(A_PREV, 1)); if (n < 3) compact[n++] = idx; idx++; }
    if (S.playing) b.addAction(android.R.drawable.ic_media_pause, "Pause", act(A_PAUSE, 2));
    else b.addAction(android.R.drawable.ic_media_play, "Abspielen", act(A_PLAY, 3));
    if (n < 3) compact[n++] = idx;
    idx++;
    if (S.hasNext) { b.addAction(android.R.drawable.ic_media_next, "Weiter", act(A_NEXT, 4)); if (n < 3) compact[n++] = idx; idx++; }
    if (!S.hasPrev && !S.hasNext) { b.addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stopp", act(A_STOP, 6)); if (n < 3) compact[n++] = idx; idx++; }
    int[] show = new int[n];
    for (int k = 0; k < n; k++) show[k] = compact[k];
    Notification.MediaStyle st = new Notification.MediaStyle();
    if (session != null) st.setMediaSession(session.getSessionToken());
    st.setShowActionsInCompactView(show);
    b.setStyle(st);
    return b.build();
  }

  void shutdown() {
    try {
      S.active = false;
      fg = false;
      try { stopForeground(true); } catch (Throwable t) { }
      NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
      nm.cancel(NID);
      if (session != null) { session.setActive(false); }
    } catch (Throwable t) { }
    stopSelf();
  }

  @Override
  public void onTaskRemoved(Intent rootIntent) {
    super.onTaskRemoved(rootIntent);
    shutdown();
  }

  @Override
  public void onDestroy() {
    try { if (session != null) { session.release(); session = null; } } catch (Throwable t) { }
    inst = null;
    super.onDestroy();
  }

  @Override
  public IBinder onBind(Intent intent) { return null; }
}
`;
const JAVA_PLUGIN = `package __PKG__;
// SUNSHINE_MEDIA - von scripts/patch-android.cjs erzeugt
import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelFileDescriptor;
import android.provider.DocumentsContract;
import android.util.Base64;
import android.webkit.WebView;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

/** Bruecke Web-App <-> Musik-Benachrichtigung. Web -> update()/stop(); Tasten der Benachrichtigung -> Ereignis "sunshine-media" im Fenster. */
@CapacitorPlugin(name = "SunshineMedia")
public class SunshineMediaPlugin extends Plugin {
  static SunshineMediaPlugin inst = null;
  private boolean asked = false;
  private String artKey = "";

  @Override
  public void load() { inst = this; }

  @Override
  protected void handleOnDestroy() {
    if (inst == this) inst = null;
    try { PlaybackService.halt(getContext()); } catch (Throwable t) { }
  }

  /** Taste in der Benachrichtigung -> JavaScript. */
  static void emit(final String action, final long posMs) {
    final SunshineMediaPlugin p = inst;
    if (p == null) return;
    final String js = "try{window.dispatchEvent(new CustomEvent('sunshine-media',{detail:{action:'" + action + "',position:" + (posMs < 0 ? "null" : String.valueOf(posMs / 1000.0)) + "}}))}catch(e){}";
    new Handler(Looper.getMainLooper()).post(new Runnable() {
      @Override
      public void run() {
        try {
          WebView wv = p.getBridge().getWebView();
          if (wv != null) wv.evaluateJavascript(js, null);
        } catch (Throwable t) { }
      }
    });
  }

  @PluginMethod
  public void update(PluginCall call) {
    try {
      PlaybackService.State s = PlaybackService.S;
      s.title = call.getString("title", "");
      s.artist = call.getString("artist", "");
      s.playing = call.getBoolean("playing", false);
      s.hasPrev = call.getBoolean("hasPrev", false);
      s.hasNext = call.getBoolean("hasNext", false);
      s.positionMs = (long) (call.getDouble("position", 0.0) * 1000.0);
      s.durationMs = (long) (call.getDouble("duration", 0.0) * 1000.0);
      String col = call.getString("color", "");
      if (col != null && col.length() > 0) { try { s.color = Color.parseColor(col); } catch (Throwable t) { } }
      String key = call.getString("artKey", "");
      String art = call.getString("art", "");
      if (art != null && art.length() > 0 && !key.equals(artKey)) {
        try {
          byte[] raw = Base64.decode(art, Base64.DEFAULT);
          Bitmap bm = BitmapFactory.decodeByteArray(raw, 0, raw.length);
          if (bm != null) { s.art = bm; artKey = key; }
        } catch (Throwable t) { }
      }
      s.active = true;
      if (s.playing && !asked && Build.VERSION.SDK_INT >= 33) {
        asked = true;
        try {
          if (getContext().checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            getActivity().requestPermissions(new String[] { "android.permission.POST_NOTIFICATIONS" }, 4711);
          }
        } catch (Throwable t) { }
      }
      PlaybackService.push(getContext());
      call.resolve();
    } catch (Throwable t) {
      call.reject("update fehlgeschlagen");
    }
  }

  @PluginMethod
  public void stop(PluginCall call) {
    try { PlaybackService.halt(getContext()); } catch (Throwable t) { }
    call.resolve();
  }

  // ---------------------------------------------------------------- Ordner-Dialog (Storage Access Framework)
  /** Ordner waehlen; die Freigabe bleibt auch nach einem Neustart der App erhalten. */
  @PluginMethod
  public void pickFolder(PluginCall call) {
    try {
      Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
      i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
      startActivityForResult(call, i, "folderResult");
    } catch (Throwable t) {
      call.reject("Ordner-Dialog nicht verfuegbar");
    }
  }

  @ActivityCallback
  private void folderResult(PluginCall call, ActivityResult result) {
    if (call == null) return;
    try {
      Intent d = result == null ? null : result.getData();
      JSObject o = new JSObject();
      if (result == null || result.getResultCode() != Activity.RESULT_OK || d == null || d.getData() == null) {
        o.put("cancelled", true);
        call.resolve(o);
        return;
      }
      Uri u = d.getData();
      ContentResolver cr = getContext().getContentResolver();
      try { cr.takePersistableUriPermission(u, Intent.FLAG_GRANT_READ_URI_PERMISSION); } catch (Throwable t) { }
      String nm = "Ordner";
      try {
        Uri doc = DocumentsContract.buildDocumentUriUsingTree(u, DocumentsContract.getTreeDocumentId(u));
        Cursor c = cr.query(doc, new String[] { DocumentsContract.Document.COLUMN_DISPLAY_NAME }, null, null, null);
        if (c != null) {
          try { if (c.moveToFirst() && c.getString(0) != null) nm = c.getString(0); } finally { c.close(); }
        }
      } catch (Throwable t) { }
      o.put("cancelled", false);
      o.put("uri", u.toString());
      o.put("name", nm);
      call.resolve(o);
    } catch (Throwable t) {
      call.reject("Ordner konnte nicht gelesen werden");
    }
  }

  private static boolean looksAudio(String name, String mime) {
    if (mime != null && mime.startsWith("audio/")) return true;
    String n = name == null ? "" : name.toLowerCase();
    return n.endsWith(".mp3") || n.endsWith(".wav") || n.endsWith(".m4a") || n.endsWith(".aac") || n.endsWith(".ogg") || n.endsWith(".opus") || n.endsWith(".flac") || n.endsWith(".zip");
  }

  private void walk(ContentResolver cr, Uri tree, String docId, String rel, int depth, JSArray out) {
    Uri kids = DocumentsContract.buildChildDocumentsUriUsingTree(tree, docId);
    Cursor c = null;
    try {
      c = cr.query(kids, new String[] { DocumentsContract.Document.COLUMN_DOCUMENT_ID, DocumentsContract.Document.COLUMN_DISPLAY_NAME, DocumentsContract.Document.COLUMN_MIME_TYPE, DocumentsContract.Document.COLUMN_SIZE }, null, null, null);
      if (c == null) return;
      while (c.moveToNext()) {
        if (out.length() >= 3000) break;
        String id = c.getString(0);
        String name = c.getString(1);
        String mime = c.getString(2);
        long size = c.isNull(3) ? 0L : c.getLong(3);
        if (id == null || name == null || name.startsWith(".")) continue;
        if (DocumentsContract.Document.MIME_TYPE_DIR.equals(mime)) {
          if (depth < 5) walk(cr, tree, id, rel + name + "/", depth + 1, out);
        } else if (looksAudio(name, mime)) {
          JSObject f = new JSObject();
          f.put("name", rel + name);
          f.put("uri", DocumentsContract.buildDocumentUriUsingTree(tree, id).toString());
          f.put("size", size);
          out.put(f);
        }
      }
    } finally {
      if (c != null) c.close();
    }
  }

  /** Alle Audiodateien eines freigegebenen Ordners (mit Unterordnern). */
  @PluginMethod
  public void listFolder(PluginCall call) {
    try {
      Uri tree = Uri.parse(call.getString("uri", ""));
      JSArray arr = new JSArray();
      walk(getContext().getContentResolver(), tree, DocumentsContract.getTreeDocumentId(tree), "", 0, arr);
      JSObject o = new JSObject();
      o.put("files", arr);
      call.resolve(o);
    } catch (Throwable t) {
      call.reject("Ordner nicht lesbar (Freigabe abgelaufen?)");
    }
  }

  /** Ein Stueck einer Datei als Base64 (die Web-Seite setzt die Stuecke wieder zusammen). */
  @PluginMethod
  public void readChunk(PluginCall call) {
    ParcelFileDescriptor pfd = null;
    try {
      Uri u = Uri.parse(call.getString("uri", ""));
      long off = (long) call.getDouble("offset", 0.0).doubleValue();
      int len = call.getInt("length", 1048576).intValue();
      if (len < 1) len = 1;
      if (len > 3145728) len = 3145728;
      ContentResolver cr = getContext().getContentResolver();
      byte[] buf = new byte[len];
      int n = 0;
      try {
        pfd = cr.openFileDescriptor(u, "r");
        if (pfd == null) throw new Exception("kein Zugriff");
        FileChannel ch = new FileInputStream(pfd.getFileDescriptor()).getChannel();
        ch.position(off);
        ByteBuffer bb = ByteBuffer.wrap(buf);
        while (bb.hasRemaining()) {
          int r = ch.read(bb);
          if (r < 0) break;
          n += r;
        }
      } catch (Throwable seekFail) {
        // Anbieter ohne Suchfunktion: ueber den Datenstrom lesen
        n = 0;
        InputStream in = cr.openInputStream(u);
        try {
          long left = off;
          while (left > 0) {
            long sk = in.skip(left);
            if (sk <= 0) break;
            left -= sk;
          }
          while (n < len) {
            int r = in.read(buf, n, len - n);
            if (r < 0) break;
            n += r;
          }
        } finally {
          in.close();
        }
      }
      JSObject o = new JSObject();
      o.put("b64", Base64.encodeToString(buf, 0, n, Base64.NO_WRAP));
      o.put("n", n);
      call.resolve(o);
    } catch (Throwable t) {
      call.reject("Datei nicht lesbar");
    } finally {
      try { if (pfd != null) pfd.close(); } catch (Throwable t) { }
    }
  }
}
`;
{
  const maNow = fs.existsSync(javaDir) ? findFile(javaDir, 'MainActivity.java') : null;
  const pk = maNow ? (fs.readFileSync(maNow, 'utf8').match(/^\s*package\s+([\w.]+)\s*;/m) || [])[1] : null;
  if (!maNow || !pk) { log('Musik-Dienst: MainActivity/Paket nicht gefunden – übersprungen (kein Hintergrund-Player).'); }
  else {
    const dir = path.dirname(maNow);
    fs.writeFileSync(path.join(dir, 'PlaybackService.java'), JAVA_SERVICE.split('__PKG__').join(pk));
    fs.writeFileSync(path.join(dir, 'SunshineMediaPlugin.java'), JAVA_PLUGIN.split('__PKG__').join(pk));
    log('Musik-Dienst: PlaybackService.java + SunshineMediaPlugin.java geschrieben (' + pk + ').');
    // Symbol für die Benachrichtigung (einfarbige Note)
    const dr = path.join(app, 'res', 'drawable'); fs.mkdirSync(dr, { recursive: true });
    fs.writeFileSync(path.join(dr, 'ic_stat_sunshine.xml'), '<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFFFF" android:pathData="M12,3v10.55c-0.59,-0.34 -1.27,-0.55 -2,-0.55 -2.21,0 -4,1.79 -4,4s1.79,4 4,4 4,-1.79 4,-4V7h4V3h-6z"/></vector>\n');
    // Manifest: Rechte + Dienst
    if (fs.existsSync(manP)) {
      let m2 = fs.readFileSync(manP, 'utf8');
      if (!/PlaybackService/.test(m2)) {
        const perms = ['FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_MEDIA_PLAYBACK', 'POST_NOTIFICATIONS'].filter(x => !new RegExp('android\\.permission\\.' + x + '"').test(m2)).map(x => '    <uses-permission android:name="android.permission.' + x + '" />\n').join('');
        m2 = m2.replace(/<application\b/, perms + '    <application');
        m2 = m2.replace('</application>', '    <service android:name="' + pk + '.PlaybackService" android:exported="false" android:foregroundServiceType="mediaPlayback" />\n    </application>');
        fs.writeFileSync(manP, m2); log('Manifest: Dienst PlaybackService + Rechte (Vordergrunddienst, Benachrichtigungen) eingetragen.');
      } else log('Manifest: Musik-Dienst schon eingetragen.');
    }
  }
}
// ---- Live-Update-Dienst (sw.js) in die Web-Dateien legen --------------------------------------------------------------
//   Der Service Worker liefert beim Start eine per Live-Update geladene Oberfläche aus – nur wenn eine solche vorhanden und gültig ist.
const SW_JS = "/* Sunshine@R · Live-Update-Dienst (Service Worker)\n   Liefert beim Start der App – falls vorhanden und passend – die per Live-Update geladene Oberfläche statt der eingebauten.\n   Sicherheitsnetze: gleiche App-Hülle (build.json), höchstens 2 Startversuche ohne Bestätigung, bei jedem Zweifel die eingebaute Seite. */\nconst C = 'sunshine-live';\nconst json = o => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } });\nself.addEventListener('install', () => self.skipWaiting());\nself.addEventListener('activate', e => e.waitUntil(self.clients.claim()));\nasync function livePage() {\n  const c = await caches.open(C);\n  const mr = await c.match('/__live/meta'); if (!mr) return null;\n  const meta = await mr.json();\n  const page = await c.match('/__live/page'); if (!page) return null;\n  if (meta.status === 'bad') return null;\n  let b = null;\n  try { const r = await fetch('/build.json', { cache: 'no-store' }); if (r.ok) b = await r.json(); } catch (_) {}\n  if (!b) return null;                                   // ohne Gegenprobe nie die Live-Seite zeigen\n  if (String(b.n) !== String(meta.n) || String(b.nat) !== String(meta.nat)) {   // neue APK installiert → Live-Kopie ist veraltet\n    await c.delete('/__live/page'); await c.delete('/__live/meta'); return null;\n  }\n  if (meta.status === 'pending') {\n    meta.boots = (meta.boots || 0) + 1;\n    if (meta.boots > 2) { meta.status = 'bad'; meta.why = 'start'; await c.put('/__live/meta', json(meta)); return null; }\n    await c.put('/__live/meta', json(meta));\n  }\n  return page;\n}\nself.addEventListener('fetch', e => {\n  const r = e.request;\n  if (r.method !== 'GET' || r.mode !== 'navigate') return;\n  const u = new URL(r.url);\n  if (u.origin !== self.location.origin || (u.pathname !== '/' && u.pathname !== '/index.html')) return;\n  e.respondWith(livePage().then(p => p || fetch(r)).catch(() => fetch(r)));\n});\n";
{
  let web = null;
  for (const d of ['www', 'dist', 'public', '.']) { if (fs.existsSync(path.join(root, d, 'index.html'))) { web = d; break; } }
  if (web) { fs.writeFileSync(path.join(root, web, 'sw.js'), SW_JS); log('sw.js nach ' + web + '/ geschrieben (Live-Update-Dienst).'); }
  else log('Keine index.html in www/dist/public gefunden – sw.js übersprungen (Live-Updates bleiben aus).');
}
log('fertig.');
