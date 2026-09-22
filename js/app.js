import { SimpleMap } from './map.js';
import { haversineKm, formatDistance } from './map-utils.js';
import {
  loadState, saveState, exportPayload, validateImportPayload,
  previewImport, applyImport, hasRecoverySnapshot, restoreRecoverySnapshot,
} from './storage.js';

let state = loadState();
let currentLocation = null;
let filter = 'all';
let installPrompt = null;
let pendingImport = null;
let swRegistration = null;
const $ = (id) => document.getElementById(id);

const els = {
  status: $('saveStatus'), mapEl: $('map'), locate: $('locateBtn'),
  dialog: $('visitDialog'), form: $('visitForm'), id: $('visitId'), lat: $('visitLat'), lng: $('visitLng'),
  name: $('visitName'), address: $('visitAddress'), notes: $('visitNotes'), due: $('visitDueDate'),
  title: $('dialogTitle'), coords: $('dialogCoords'), existing: $('existingActions'), deleteVisit: $('deleteVisitBtn'),
  list: $('visitList'), empty: $('emptyList'), summary: $('listSummary'), today: $('todayCount'),
  upcoming: $('upcomingCount'), undated: $('undatedCount'), search: $('searchInput'),
  importDialog: $('importDialog'), importPreview: $('importPreview'), importFile: $('importFileInput'),
  restore: $('restoreSnapshotBtn'), install: $('installBtn'), installHint: $('installHint'),
  update: $('updateNotice'), toast: $('toastRegion'),
};

const map = new SimpleMap(els.mapEl, state.map);
map.onTap = ({ lat, lng }) => openEditor(null, { lat, lng });
map.onMarkerTap = (id) => openEditor(id);
map.onViewChange = ({ lat, lng, zoom }) => {
  state.map = { lat, lng, zoom };
  persist(false);
};

init();

function init() {
  applyTheme(state.settings.theme || 'dark');
  map.setMarkers(state.visits);
  bindNav(); bindMap(); bindEditor(); bindList(); bindMore();
  renderAll(); registerSW(); updateOnline();
  addEventListener('online', updateOnline); addEventListener('offline', updateOnline);
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); installPrompt = e; els.install.disabled = false;
    els.installHint.textContent = 'Lista para instalarse en este dispositivo.';
  });
  addEventListener('appinstalled', () => {
    installPrompt = null; els.install.disabled = true; els.installHint.textContent = 'Revisita quedó instalada.';
    toast('Revisita se instaló correctamente.');
  });
  addEventListener('error', (e) => showError('Error de la app', e.message || 'Error desconocido'));
  addEventListener('unhandledrejection', (e) => showError('Error de la app', e.reason?.message || String(e.reason || 'Error desconocido')));
}

function bindNav() {
  document.querySelectorAll('[data-destination]').forEach((b) => b.addEventListener('click', () => showView(b.dataset.destination)));
  $('emptyMapBtn').addEventListener('click', () => showView('map'));
  $('addFromListBtn').addEventListener('click', () => { showView('map'); toast('Toca el mapa o usa tu ubicación actual.'); });
}
function showView(name) {
  document.querySelectorAll('.view').forEach((v) => { const on = v.dataset.view === name; v.hidden = !on; v.classList.toggle('is-active', on); });
  document.querySelectorAll('[data-destination]').forEach((b) => {
    const on = b.dataset.destination === name; b.classList.toggle('is-active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  if (name === 'map') requestAnimationFrame(() => map.render());
  if (name === 'list') renderList();
  scrollTo({ top: 0, behavior: 'smooth' });
}

function bindMap() {
  $('zoomInBtn').addEventListener('click', () => map.setZoom(map.zoom + 1));
  $('zoomOutBtn').addEventListener('click', () => map.setZoom(map.zoom - 1));
  els.locate.addEventListener('click', locateMe);
}
function locateMe() {
  if (!navigator.geolocation) return toast('Este dispositivo no ofrece ubicación GPS.');
  setStatus('Buscando ubicación…', 'info'); els.locate.disabled = true;
  navigator.geolocation.getCurrentPosition((p) => {
    els.locate.disabled = false;
    currentLocation = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
    map.setUserLocation(currentLocation.lat, currentLocation.lng);
    map.setView(currentLocation.lat, currentLocation.lng, Math.max(map.zoom, 17));
    updateOnline(); openEditor(null, currentLocation);
  }, (e) => {
    els.locate.disabled = false; updateOnline();
    toast(({1:'Permite el acceso a la ubicación para usar el GPS.',2:'No se pudo determinar la ubicación.',3:'La ubicación tardó demasiado. Inténtalo otra vez.'})[e.code] || 'No se pudo obtener la ubicación.');
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
}

function bindEditor() {
  $('closeDialogBtn').addEventListener('click', closeEditor);
  els.dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeEditor(); });
  els.dialog.addEventListener('click', (e) => { if (e.target === els.dialog) closeEditor(); });
  els.form.addEventListener('submit', saveVisit);
  $('lookupAddressBtn').addEventListener('click', () => lookupAddress(true));
  els.deleteVisit.addEventListener('click', deleteVisit);
  $('showOnMapBtn').addEventListener('click', showVisitOnMap);
  $('navigateBtn').addEventListener('click', navigateVisit);
  $('shareBtn').addEventListener('click', shareVisit);
}
function openEditor(id, coords = null) {
  const visit = id ? state.visits.find((v) => v.id === id) : null;
  const p = visit || coords; if (!p) return;
  els.form.reset();
  els.id.value = visit?.id || ''; els.lat.value = p.lat; els.lng.value = p.lng;
  els.coords.textContent = `${Number(p.lat).toFixed(6)}, ${Number(p.lng).toFixed(6)}`;
  els.name.value = visit?.name || ''; els.address.value = visit?.address || ''; els.notes.value = visit?.notes || ''; els.due.value = visit?.dueDate || '';
  els.title.textContent = visit ? 'Editar revisita' : 'Nueva revisita';
  els.existing.hidden = !visit; els.deleteVisit.hidden = !visit; map.setDraft(p.lat, p.lng);
  if (!els.dialog.open) els.dialog.showModal();
  requestAnimationFrame(() => els.name.focus());
  if (!visit && navigator.onLine) setTimeout(() => lookupAddress(false), 250);
}
function closeEditor() { map.setDraft(null, null); if (els.dialog.open) els.dialog.close(); }
function saveVisit(e) {
  e.preventDefault(); const name = els.name.value.trim(); if (!name) { els.name.focus(); return toast('Escribe un nombre o referencia.'); }
  const now = new Date().toISOString(); const id = els.id.value || crypto.randomUUID(); const old = state.visits.find((v) => v.id === id);
  const rec = { id, name, address: els.address.value.trim(), notes: els.notes.value.trim(), dueDate: els.due.value || '', lat: Number(els.lat.value), lng: Number(els.lng.value), createdAt: old?.createdAt || now, updatedAt: now };
  if (old) state.visits = state.visits.map((v) => v.id === id ? rec : v); else state.visits.push(rec);
  persist(); closeEditor(); renderAll(); toast(old ? 'Revisita actualizada.' : 'Revisita guardada.');
}
async function lookupAddress(showFailure) {
  if (!navigator.onLine) return showFailure && toast('Necesitas conexión para buscar la dirección.');
  const btn = $('lookupAddressBtn'); const prior = btn.textContent; btn.textContent = 'Buscando…'; btn.disabled = true;
  try {
    const q = new URLSearchParams({ format:'jsonv2', lat:els.lat.value, lon:els.lng.value, zoom:'18', 'accept-language':'es' });
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?${q}`, { headers:{ Accept:'application/json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`); const data = await r.json();
    if (data.display_name) els.address.value = data.display_name; else if (showFailure) toast('No se encontró una dirección para ese punto.');
  } catch (err) { console.warn(err); if (showFailure) toast('No se pudo buscar la dirección ahora.'); }
  finally { btn.textContent = prior; btn.disabled = false; }
}
function currentVisit() { return state.visits.find((v) => v.id === els.id.value) || null; }
function deleteVisit() {
  const v = currentVisit(); if (!v || !confirm(`¿Eliminar la revisita “${v.name}”? Esta acción no se puede deshacer.`)) return;
  state.visits = state.visits.filter((x) => x.id !== v.id); persist(); closeEditor(); renderAll(); toast('Revisita eliminada.');
}
function showVisitOnMap() { const v = currentVisit(); if (!v) return; closeEditor(); showView('map'); map.setView(v.lat, v.lng, Math.max(map.zoom, 17)); }
function navigateVisit() { const v = currentVisit(); if (!v) return; location.href = `geo:${v.lat},${v.lng}?q=${v.lat},${v.lng}(${encodeURIComponent(v.name)})`; }
async function shareVisit() {
  const v = currentVisit(); if (!v) return;
  const url = `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`;
  const text = `${v.name}\n${v.address || ''}\n${url}`.trim();
  try { if (navigator.share) await navigator.share({ title:`Revisita: ${v.name}`, text }); else { await navigator.clipboard.writeText(text); toast('Ubicación copiada al portapapeles.'); } }
  catch (e) { if (e?.name !== 'AbortError') toast('No se pudo compartir la ubicación.'); }
}

function bindList() {
  els.search.addEventListener('input', renderList);
  document.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.filter; document.querySelectorAll('[data-filter]').forEach((x) => x.classList.toggle('is-active', x === b)); renderList();
  }));
  els.list.addEventListener('click', (e) => { const b = e.target.closest('[data-open-visit]'); if (b) openEditor(b.dataset.openVisit); });
}
function renderAll() { renderSummary(); renderList(); map.setMarkers(state.visits); els.restore.hidden = !hasRecoverySnapshot(); }
function renderSummary() {
  const today = dateKey(new Date());
  const t = state.visits.filter((v) => v.dueDate === today).length;
  const u = state.visits.filter((v) => v.dueDate && v.dueDate > today).length;
  const n = state.visits.filter((v) => !v.dueDate).length;
  els.today.textContent = t; els.upcoming.textContent = u; els.undated.textContent = n;
  els.summary.textContent = `${state.visits.length} ${state.visits.length === 1 ? 'guardada' : 'guardadas'}`;
}
function renderList() {
  const today = dateKey(new Date()); const q = els.search.value.trim().toLowerCase();
  const visits = state.visits.filter((v) => {
    if (filter === 'today' && v.dueDate !== today) return false;
    if (filter === 'upcoming' && !(v.dueDate && v.dueDate > today)) return false;
    if (filter === 'undated' && v.dueDate) return false;
    return !q || `${v.name} ${v.address} ${v.notes}`.toLowerCase().includes(q);
  }).sort((a,b) => a.dueDate && b.dueDate ? a.dueDate.localeCompare(b.dueDate) : a.dueDate ? -1 : b.dueDate ? 1 : b.updatedAt.localeCompare(a.updatedAt));
  els.list.replaceChildren(...visits.map(visitCard)); els.empty.hidden = visits.length !== 0; els.list.hidden = visits.length === 0;
}
function visitCard(v) {
  const card = document.createElement('article'); card.className = 'visit-card card';
  const body = document.createElement('div'); const h = document.createElement('h3'); h.textContent = v.name; body.append(h);
  if (v.address) { const p = document.createElement('p'); p.textContent = v.address; body.append(p); }
  if (v.notes) { const p = document.createElement('p'); p.className = 'note-preview'; p.textContent = v.notes; body.append(p); }
  const meta = document.createElement('div'); meta.className = 'visit-card-meta';
  if (v.dueDate) meta.append(chip(dueLabel(v.dueDate), 'due'));
  if (currentLocation) meta.append(chip(formatDistance(haversineKm(currentLocation.lat,currentLocation.lng,v.lat,v.lng))));
  meta.append(chip(`${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}`, 'num')); body.append(meta);
  const open = document.createElement('button'); open.type='button'; open.className='card-open'; open.dataset.openVisit=v.id; open.setAttribute('aria-label',`Abrir revisita ${v.name}`); open.textContent='›';
  card.append(body, open); return card;
}
function chip(text, extra='') { const s=document.createElement('span'); s.className=`mini-chip ${extra}`.trim(); s.textContent=text; return s; }
function dueLabel(k) { const today=dateKey(new Date()); if(k===today)return'Hoy'; const d=new Date(); d.setDate(d.getDate()+1); if(k===dateKey(d))return'Mañana'; const [y,m,day]=k.split('-').map(Number); return new Intl.DateTimeFormat('es-DO',{day:'numeric',month:'short'}).format(new Date(y,m-1,day)); }
function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function bindMore() {
  $('themeToggleBtn').addEventListener('click', () => { state.settings.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; applyTheme(state.settings.theme); persist(); });
  els.install.addEventListener('click', async () => { if (!installPrompt) return; await installPrompt.prompt(); await installPrompt.userChoice; installPrompt=null; els.install.disabled=true; });
  $('exportBtn').addEventListener('click', exportBackup); $('importBtn').addEventListener('click', () => els.importFile.click()); els.importFile.addEventListener('change', importFile);
  $('closeImportBtn').addEventListener('click', closeImport); $('cancelImportBtn').addEventListener('click', closeImport); $('confirmImportBtn').addEventListener('click', confirmImport);
  els.restore.addEventListener('click', restoreSnapshot); $('deleteAllBtn').addEventListener('click', deleteAll);
  $('reloadAppBtn').addEventListener('click', () => { swRegistration?.waiting?.postMessage({type:'SKIP_WAITING'}); location.reload(); });
}
function applyTheme(theme) { document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark'; document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#eaf0f5' : '#102d49'; }
function exportBackup() {
  const blob=new Blob([JSON.stringify(exportPayload(state),null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`revisita-copia-${dateKey(new Date())}.json`; document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url); toast('Copia exportada.');
}
async function importFile() {
  const f=els.importFile.files?.[0]; els.importFile.value=''; if(!f)return;
  try { pendingImport=validateImportPayload(JSON.parse(await f.text())); const p=previewImport(state,pendingImport); els.importPreview.replaceChildren(row('Revisitas en la copia',p.imported),row('Nuevas',p.newRecords),row('Coincidencias por ID',p.conflicts),row('Guardadas actualmente',p.localBefore)); els.importDialog.showModal(); }
  catch(e){ showError('No se pudo importar',e.message||String(e)); }
}
function row(label,value){const r=document.createElement('div');r.className='preview-row';const l=document.createElement('span');l.textContent=label;const v=document.createElement('strong');v.className='num';v.textContent=value;r.append(l,v);return r;}
function confirmImport(){if(!pendingImport)return; try{state=applyImport(state,pendingImport);pendingImport=null;closeImport();applyTheme(state.settings.theme);renderAll();toast('Importación terminada. La copia anterior quedó disponible para restaurar.');}catch(e){showError('No se pudo aplicar la importación',e.message||String(e));}}
function closeImport(){pendingImport=null;if(els.importDialog.open)els.importDialog.close();}
function restoreSnapshot(){if(!confirm('¿Restaurar la copia local creada antes de la última importación?'))return;try{state=restoreRecoverySnapshot();applyTheme(state.settings.theme);renderAll();toast('Copia anterior restaurada.');}catch(e){showError('No se pudo restaurar',e.message||String(e));}}
function deleteAll(){if(!state.visits.length)return toast('No hay revisitas para borrar.');if(!confirm(`¿Borrar las ${state.visits.length} revisitas guardadas? Esta acción no se puede deshacer.`))return;state.visits=[];persist();renderAll();toast('Se borraron todas las revisitas.');}

function persist(announce=true){try{saveState(state);setStatus(navigator.onLine?'Guardado localmente':'Sin conexión',navigator.onLine?'success':'warn',announce);}catch(e){setStatus('No se pudo guardar','danger');showError('Error al guardar',e.message||String(e));}}
function setStatus(text,kind='success',announce=true){els.status.textContent=text;const c=kind==='danger'?'error':kind==='warn'?'warning':kind==='info'?'info':'success';els.status.style.color=`var(--color-${c})`;els.status.style.borderColor=`var(--border-${c}-soft)`;els.status.style.background=`var(--color-${c}-soft)`;els.status.setAttribute('aria-live',announce?'polite':'off');}
function updateOnline(){setStatus(navigator.onLine?'Guardado localmente':'Sin conexión',navigator.onLine?'success':'warn');}
function toast(message){const d=document.createElement('div');d.className='toast';d.textContent=message;els.toast.append(d);setTimeout(()=>d.remove(),3200);}
function showError(type,message){const box=$('errorBoundary');box.replaceChildren();const s=document.createElement('strong');s.textContent=type;const p=document.createElement('div');p.textContent=message;const b=document.createElement('button');b.type='button';b.className='btn btn-secondary';b.textContent='Cerrar';b.style.marginTop='8px';b.onclick=()=>box.hidden=true;box.append(s,p,b);box.hidden=false;}
async function registerSW(){if(!('serviceWorker'in navigator))return;try{swRegistration=await navigator.serviceWorker.register('./sw.js');if(swRegistration.waiting)els.update.hidden=false;swRegistration.addEventListener('updatefound',()=>{const w=swRegistration.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)els.update.hidden=false;});});navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());}catch(e){console.warn('No se pudo registrar el service worker.',e);}}
