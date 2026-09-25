// Optional cross-device sync for Revisita using the shared KHub Firebase project.
// Firebase is loaded lazily from gstatic ONLY when the user has turned sync on (or opens the sync card),
// so the app shell keeps working fully offline without any third-party script.
// Firestore path: backups/revisita/users/{uid}/meta/latest  (allowed by the KHub rules for backups/{appId}/users/{uid}/**)
import { mergeVisits, visitsFingerprint } from './visit-tools.js?v=1.5.0';

const FIREBASE_VERSION = '10.12.2';
const BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/`;
const CONFIG = {
  apiKey: 'AIzaSyBG6H6T147vMUeRtWdLcU_WtXZIR_ltrS4',
  authDomain: 'khub-apps.firebaseapp.com',
  projectId: 'khub-apps',
  storageBucket: 'khub-apps.firebasestorage.app',
  messagingSenderId: '969605091721',
  appId: '1:969605091721:web:4068564af7bc0dc56c1158',
};
const ENABLED_KEY = 'revisita.cloud.v1';
const LAST_SYNC_KEY = 'revisita.cloud.lastSync';
const DEVICE_KEY = 'khub-device-id';

function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch {} }
function lsDel(k) { try { localStorage.removeItem(k); } catch {} }
function deviceId() {
  let id = lsGet(DEVICE_KEY);
  if (!id) { id = 'dev-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); lsSet(DEVICE_KEY, id); }
  return id;
}

/**
 * @param {{getState:()=>any, applyMerged:(visits:any[], deleted:object)=>void, normalizeVisit:(v:any)=>any, onChange:(info:object)=>void}} hooks
 */
export function createCloudSync(hooks) {
  let fb = null; let loading = null; let user = null; let inFlight = null; let rerun = false; let timer = null;
  const emit = (extra = {}) => hooks.onChange({ user, enabled: isEnabled(), lastSync: lsGet(LAST_SYNC_KEY), ...extra });

  function isEnabled() { return lsGet(ENABLED_KEY) === '1'; }

  async function load() {
    if (fb) return fb;
    if (!loading) {
      loading = (async () => {
        const [appMod, authMod, fsMod] = await Promise.all([
          import(BASE + 'firebase-app.js'), import(BASE + 'firebase-auth.js'), import(BASE + 'firebase-firestore.js'),
        ]);
        // Default app name so a KHub sign-in already on this origin (e.g. Ministry Tracker in the same browser) is reused.
        const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(CONFIG);
        const auth = authMod.getAuth(app);
        const db = fsMod.getFirestore(app);
        fb = { authMod, fsMod, auth, db };
        await new Promise(resolve => {
          let first = true;
          authMod.onAuthStateChanged(auth, u => {
            user = u ? { uid: u.uid, email: u.email || '' } : null;
            if (user) lsSet(ENABLED_KEY, '1');
            emit();
            if (first) { first = false; resolve(); } else if (user) schedule(0);
          });
        });
        return fb;
      })().catch(e => { loading = null; throw e; });
    }
    return loading;
  }

  function ref() { return fb.fsMod.doc(fb.db, 'backups', 'revisita', 'users', user.uid, 'meta', 'latest'); }

  async function runSync() {
    if (!navigator.onLine) { emit({ status: 'offline' }); return false; }
    await load();
    if (!user) return false;
    emit({ status: 'syncing' });
    const state = hooks.getState();
    const snap = await fb.fsMod.getDoc(ref());
    const remote = snap.exists() ? snap.data() : null;
    const remoteVisits = Array.isArray(remote?.visits) ? remote.visits.map(hooks.normalizeVisit).filter(Boolean) : [];
    const remoteDeleted = remote?.deleted && typeof remote.deleted === 'object' ? remote.deleted : {};
    const merged = mergeVisits(state.visits, remoteVisits, state.deleted || {}, remoteDeleted);
    const mergedPrint = visitsFingerprint(merged.visits, merged.deleted);
    if (mergedPrint !== visitsFingerprint(state.visits, state.deleted || {})) hooks.applyMerged(merged.visits, merged.deleted);
    if (!remote || mergedPrint !== visitsFingerprint(remoteVisits, remoteDeleted)) {
      await fb.fsMod.setDoc(ref(), {
        appId: 'revisita', schema: 3, uid: user.uid, deviceId: deviceId(), savedAtISO: new Date().toISOString(),
        visits: JSON.parse(JSON.stringify(merged.visits)), deleted: merged.deleted,
      });
    }
    lsSet(LAST_SYNC_KEY, new Date().toISOString());
    emit({ status: 'synced' });
    return true;
  }

  async function syncNow() {
    if (inFlight) { rerun = true; return inFlight; }
    inFlight = runSync().catch(e => { emit({ status: 'error', message: e?.code || e?.message || String(e) }); return false; })
      .finally(() => { inFlight = null; if (rerun) { rerun = false; schedule(500); } });
    return inFlight;
  }

  /** Debounced background sync after local changes. No-op unless sync is on. */
  function schedule(delay = 4000) {
    if (!isEnabled()) return;
    clearTimeout(timer);
    timer = setTimeout(() => { syncNow(); }, delay);
  }

  /** Start at launch: only touches the network if sync was turned on before. */
  async function init({ force = false } = {}) {
    if (!force && !isEnabled()) { emit(); return; }
    if (!navigator.onLine) { emit({ status: 'offline' }); return; }
    try { emit({ status: 'loading' }); await load(); if (user) await syncNow(); else emit(); }
    catch (e) { emit({ status: 'error', message: e?.message || String(e) }); }
  }

  async function signIn(email, password) {
    await load();
    await fb.authMod.signInWithEmailAndPassword(fb.auth, String(email || '').trim(), password);
    lsSet(ENABLED_KEY, '1');
    return syncNow();
  }
  async function signUp(email, password) {
    await load();
    await fb.authMod.createUserWithEmailAndPassword(fb.auth, String(email || '').trim(), password);
    lsSet(ENABLED_KEY, '1');
    return syncNow();
  }
  async function resetPassword(email) {
    await load();
    return fb.authMod.sendPasswordResetEmail(fb.auth, String(email || '').trim());
  }
  async function signOut() {
    lsDel(ENABLED_KEY); lsDel(LAST_SYNC_KEY);
    if (fb) await fb.authMod.signOut(fb.auth);
    user = null; emit({ status: 'signedOut' });
  }

  return { init, syncNow, schedule, signIn, signUp, resetPassword, signOut, isEnabled };
}
