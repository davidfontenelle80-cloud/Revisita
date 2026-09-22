import{SimpleMap}from'./map.js';
import{haversineKm,formatDistance}from'./map-utils.js';
import{dateKey,visitBucket,compareSchedule,formatTime}from'./schedule-utils.js';
import{loadState,saveState,exportPayload,validateImportPayload,previewImport,applyImport,hasRecoverySnapshot,restoreRecoverySnapshot}from'./storage.js';

let state=loadState(),currentLocation=null,filter='active',mapMode='active',installPrompt=null,pendingImport=null,pendingLocation=null,swRegistration=null,lookupToken=0;
const $=id=>document.getElementById(id);
const els={
 status:$('saveStatus'),mapEl:$('map'),mapShell:$('mapShell'),locate:$('locateBtn'),confirmPanel:$('locationConfirmPanel'),pendingAddress:$('pendingAddress'),pendingCoords:$('pendingCoords'),pendingAccuracy:$('pendingAccuracy'),mapModeSummary:$('mapModeSummary'),
 dialog:$('visitDialog'),form:$('visitForm'),id:$('visitId'),lat:$('visitLat'),lng:$('visitLng'),visitStatus:$('visitStatus'),name:$('visitName'),address:$('visitAddress'),notes:$('visitNotes'),due:$('visitDueDate'),dueTime:$('visitDueTime'),title:$('dialogTitle'),coords:$('dialogCoords'),existing:$('existingActions'),deleteVisit:$('deleteVisitBtn'),detailMapSection:$('detailMapSection'),historyPanel:$('historyPanel'),historyList:$('historyList'),markDone:$('markDoneBtn'),reschedule:$('rescheduleBtn'),
 list:$('visitList'),empty:$('emptyList'),summary:$('listSummary'),search:$('searchInput'),
 todayDate:$('todayDate'),overdueCount:$('overdueCount'),todayCount:$('todayCount'),doneTodayCount:$('doneTodayCount'),overdueSection:$('overdueSection'),todaySection:$('todaySection'),overdueList:$('overdueList'),todayList:$('todayList'),todayEmpty:$('todayEmpty'),todayBadge:$('todayBadge'),
 importDialog:$('importDialog'),importPreview:$('importPreview'),importFile:$('importFileInput'),restore:$('restoreSnapshotBtn'),install:$('installBtn'),installHint:$('installHint'),update:$('updateNotice'),toast:$('toastRegion')
};
const map=new SimpleMap(els.mapEl,state.map);
const detailMap=new SimpleMap($('detailMap'),{...state.map,interactive:false,zoom:17});
map.onTap=ll=>beginLocationConfirmation({...ll,source:'map'});
map.onMarkerTap=id=>{clearPendingLocation();openEditor(id);};
map.onViewChange=({lat,lng,zoom})=>{state.map={lat,lng,zoom};persist(false);};

init();

function init(){
 applyTheme(state.settings.theme||'dark');
 bindHeader();bindHorizontalHints();bindNav();bindMap();bindEditor();bindAgenda();bindList();bindMore();
 renderAll();registerSW();updateOnline();
 addEventListener('online',updateOnline);addEventListener('offline',updateOnline);
 addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;els.install.disabled=false;els.installHint.textContent='Lista para instalarse en este dispositivo.';});
 addEventListener('appinstalled',()=>{installPrompt=null;els.install.disabled=true;els.installHint.textContent='Revisita quedó instalada.';toast('Revisita se instaló correctamente.');});
 addEventListener('error',e=>showError('Error de la app',e.message||'Error desconocido'));
 addEventListener('unhandledrejection',e=>showError('Error de la app',e.reason?.message||String(e.reason||'Error desconocido')));
}


function bindHeader(){
 els.status.addEventListener('click',()=>{
   if(pendingLocation){
     toast('Esa ubicación todavía no está guardada. Confirma la ubicación primero.');
     return;
   }
   if(els.dialog.open){
     els.form.requestSubmit();
     return;
   }
   persist();
   toast('Todo está guardado en este dispositivo.');
 });
}

function bindHorizontalHints(){
 const pairs=[[$('mapModeRow'),$('mapScrollHint')],[$('listFilterRow'),$('listScrollHint')]];
 pairs.forEach(([row,hint])=>{
   if(!row||!hint)return;
   const update=()=>{
     const overflow=row.scrollWidth>row.clientWidth+8;
     const atEnd=row.scrollLeft+row.clientWidth>=row.scrollWidth-8;
     hint.classList.toggle('is-hidden',!overflow||atEnd);
   };
   hint.addEventListener('click',()=>row.scrollBy({left:Math.max(150,row.clientWidth*.65),behavior:'smooth'}));
   row.addEventListener('scroll',update,{passive:true});
   new ResizeObserver(update).observe(row);
   requestAnimationFrame(update);
 });
}

function bindNav(){
 document.querySelectorAll('[data-destination]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.destination)));
 $('emptyMapBtn').addEventListener('click',()=>showView('map'));
 $('todayNewBtn').addEventListener('click',()=>{showView('map');toast('Toca el mapa o usa tu ubicación actual.');});
 $('todayMapBtn').addEventListener('click',()=>{mapMode='active';showView('map');syncMapModeButtons();renderMapMode(true);});
 $('addFromListBtn').addEventListener('click',()=>{showView('map');toast('Toca el mapa o usa tu ubicación actual.');});
}
function showView(name){
 if(name!=='map'&&pendingLocation)clearPendingLocation();
 document.querySelectorAll('.view').forEach(v=>{const on=v.dataset.view===name;v.hidden=!on;v.classList.toggle('is-active',on);});
 document.querySelectorAll('[data-destination]').forEach(b=>{const on=b.dataset.destination===name;b.classList.toggle('is-active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 if(name==='map')requestAnimationFrame(()=>{map.render();renderMapMode(false);});
 if(name==='today')renderToday();
 if(name==='list')renderList();
 scrollTo({top:0,behavior:'smooth'});
}

function bindMap(){
 $('zoomInBtn').addEventListener('click',()=>map.setZoom(map.zoom+1));$('zoomOutBtn').addEventListener('click',()=>map.setZoom(map.zoom-1));
 els.locate.addEventListener('click',()=>requestLocation(loc=>beginLocationConfirmation({...loc,source:'gps'}),true));
 document.querySelectorAll('[data-map-mode]').forEach(b=>b.addEventListener('click',()=>selectMapMode(b.dataset.mapMode)));
 $('cancelLocationBtn').addEventListener('click',()=>clearPendingLocation());
 $('adjustLocationBtn').addEventListener('click',()=>{if(!pendingLocation)return;map.setView(pendingLocation.lat,pendingLocation.lng,19);toast('Toca otro punto del mapa para mover el pin.');});
 $('confirmLocationBtn').addEventListener('click',()=>{if(!pendingLocation)return;const p={...pendingLocation};clearPendingLocation(false);openEditor(null,p);});
}
function selectMapMode(mode){
 mapMode=mode;syncMapModeButtons();
 if(mode==='nearby'&&!currentLocation){requestLocation(()=>renderMapMode(true),false);return;}
 renderMapMode(true);
}
function syncMapModeButtons(){document.querySelectorAll('[data-map-mode]').forEach(b=>b.classList.toggle('is-active',b.dataset.mapMode===mapMode));}
function mapVisits(){
 const today=dateKey();
 let visits=state.visits;
 if(mapMode==='today')visits=visits.filter(v=>v.status==='active'&&['overdue','today'].includes(visitBucket(v,today)));
 else if(mapMode==='active')visits=visits.filter(v=>v.status==='active');
 else if(mapMode==='upcoming')visits=visits.filter(v=>v.status==='active'&&visitBucket(v,today)==='upcoming');
 else if(mapMode==='nearby')visits=currentLocation?visits.filter(v=>v.status==='active'&&haversineKm(currentLocation.lat,currentLocation.lng,v.lat,v.lng)<=5):[];
 return visits.map(v=>({...v,isOverdue:visitBucket(v,today)==='overdue'}));
}
function renderMapMode(fit=false){
 syncMapModeButtons();const visits=mapVisits();map.setMarkers(visits);
 const labels={today:'hoy y atrasadas',active:'activas',upcoming:'próximas',all:'todas',nearby:'activas a 5 km de ti'};
 els.mapModeSummary.textContent=`${visits.length} revisita${visits.length===1?'':'s'} ${labels[mapMode]}`;
 if(currentLocation)map.setUserLocation(currentLocation.lat,currentLocation.lng);
 if(fit){const pts=[...visits];if(mapMode==='nearby'&&currentLocation)pts.push(currentLocation);if(pts.length)requestAnimationFrame(()=>map.fitPoints(pts,mapMode==='nearby'?15:16));}
}
function requestLocation(done,forNewVisit){
 if(!navigator.geolocation)return toast('Este dispositivo no ofrece ubicación GPS.');
 setStatus('Buscando ubicación…','info');if(forNewVisit)els.locate.disabled=true;
 navigator.geolocation.getCurrentPosition(p=>{
   if(forNewVisit)els.locate.disabled=false;currentLocation={lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy};map.setUserLocation(currentLocation.lat,currentLocation.lng);updateOnline();done?.(currentLocation);
 },e=>{if(forNewVisit)els.locate.disabled=false;updateOnline();toast(({1:'Permite el acceso a la ubicación para usar el GPS.',2:'No se pudo determinar la ubicación.',3:'La ubicación tardó demasiado. Inténtalo otra vez.'})[e.code]||'No se pudo obtener la ubicación.');},{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
}
async function beginLocationConfirmation(loc){
 pendingLocation={lat:Number(loc.lat),lng:Number(loc.lng),accuracy:Number.isFinite(loc.accuracy)?loc.accuracy:null,source:loc.source||'map',address:''};
 map.setDraft(pendingLocation.lat,pendingLocation.lng);map.setView(pendingLocation.lat,pendingLocation.lng,Math.max(map.zoom,17));
 els.mapShell.classList.add('has-pending');els.confirmPanel.hidden=false;els.pendingCoords.textContent=`${pendingLocation.lat.toFixed(6)}, ${pendingLocation.lng.toFixed(6)}`;
 els.pendingAccuracy.hidden=!pendingLocation.accuracy;els.pendingAccuracy.textContent=pendingLocation.accuracy?`Precisión GPS aproximada: ±${Math.round(pendingLocation.accuracy)} m`:'';
 els.pendingAddress.textContent=navigator.onLine?'Buscando dirección aproximada…':'Sin conexión: verifica el pin en el mapa.';
 const token=++lookupToken;if(navigator.onLine){const address=await reverseGeocode(pendingLocation.lat,pendingLocation.lng);if(token===lookupToken&&pendingLocation){pendingLocation.address=address;els.pendingAddress.textContent=address||'No se encontró una dirección aproximada.';}}
}
function clearPendingLocation(clearDraft=true){lookupToken++;pendingLocation=null;els.confirmPanel.hidden=true;els.mapShell.classList.remove('has-pending');if(clearDraft)map.setDraft(null,null);}
async function reverseGeocode(lat,lng){
 try{const q=new URLSearchParams({format:'jsonv2',lat:String(lat),lon:String(lng),zoom:'18','accept-language':'es'});const r=await fetch(`https://nominatim.openstreetmap.org/reverse?${q}`,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return (await r.json()).display_name||'';}catch(e){console.warn('Geocodificación no disponible.',e);return'';}
}

function bindAgenda(){
 [els.overdueList,els.todayList].forEach(box=>box.addEventListener('click',handleVisitAction));
}
function renderToday(){
 const today=dateKey(),overdue=state.visits.filter(v=>visitBucket(v,today)==='overdue').sort(compareSchedule),due=state.visits.filter(v=>visitBucket(v,today)==='today').sort(compareSchedule);
 const doneToday=state.visits.filter(v=>v.status==='completed'&&dateKey(new Date(v.completedAt))===today).length;
 els.todayDate.textContent=new Intl.DateTimeFormat('es-DO',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
 els.overdueCount.textContent=overdue.length;els.todayCount.textContent=due.length;els.doneTodayCount.textContent=doneToday;
 const actionCount=overdue.length+due.length;els.todayBadge.textContent=actionCount;els.todayBadge.hidden=!actionCount;
 els.overdueSection.hidden=!overdue.length;els.overdueList.replaceChildren(...overdue.map(v=>agendaCard(v,true)));els.todayList.replaceChildren(...due.map(v=>agendaCard(v,false)));
 els.todaySection.hidden=!due.length;els.todayEmpty.hidden=actionCount!==0;
}
function agendaCard(v,isOverdue){
 const card=document.createElement('article');card.className=`agenda-card card${isOverdue?' is-overdue':''}`;
 const top=document.createElement('div');top.className='agenda-top';const left=document.createElement('div'),h=document.createElement('h3');h.textContent=v.name;left.append(h);
 if(v.address){const p=document.createElement('p');p.textContent=v.address;left.append(p);}const time=document.createElement('span');time.className='agenda-time';time.textContent=v.dueTime?formatTime(v.dueTime):isOverdue?shortDate(v.dueDate):'Sin hora';top.append(left,time);card.append(top);
 const meta=document.createElement('div');meta.className='visit-card-meta';if(isOverdue)meta.append(chip('Atrasada','overdue'));if(currentLocation)meta.append(chip(formatDistance(haversineKm(currentLocation.lat,currentLocation.lng,v.lat,v.lng))));card.append(meta);
 const actions=document.createElement('div');actions.className='agenda-actions';actions.append(actionBtn('Abrir',v.id,'open'),actionBtn('Marcar hecha',v.id,'done'),actionBtn('Reprogramar',v.id,'reschedule'));card.append(actions);return card;
}
function actionBtn(label,id,action){const b=document.createElement('button');b.type='button';b.className=action==='done'?'btn btn-primary':'btn btn-secondary';b.textContent=label;b.dataset[action]=id;return b;}
function handleVisitAction(e){
 const open=e.target.closest('[data-open]'),done=e.target.closest('[data-done]'),res=e.target.closest('[data-reschedule]');
 if(open)openEditor(open.dataset.open);else if(done)markDoneVisit(done.dataset.done);else if(res)openEditor(res.dataset.reschedule,null,{focusSchedule:true});
}

function bindEditor(){
 $('closeDialogBtn').addEventListener('click',closeEditor);els.dialog.addEventListener('cancel',e=>{e.preventDefault();closeEditor();});els.dialog.addEventListener('click',e=>{if(e.target===els.dialog)closeEditor();});
 els.form.addEventListener('submit',saveVisit);$('lookupAddressBtn').addEventListener('click',async()=>{const a=await reverseGeocode(Number(els.lat.value),Number(els.lng.value));if(a)els.address.value=a;else toast('No se pudo encontrar la dirección ahora.');});
 els.deleteVisit.addEventListener('click',deleteVisit);$('showOnMapBtn').addEventListener('click',showVisitOnMap);$('googleMapsBtn').addEventListener('click',openGoogleMaps);$('googleMapsTopBtn').addEventListener('click',openGoogleMaps);$('shareBtn').addEventListener('click',shareVisit);els.markDone.addEventListener('click',()=>{const v=currentVisit();if(v)markDoneVisit(v.id,true);});els.reschedule.addEventListener('click',()=>{els.visitStatus.value='active';els.due.focus();toast('Elige la nueva fecha y hora, luego guarda.');});
}
function openEditor(id,coords=null,options={}){
 const visit=id?state.visits.find(v=>v.id===id):null,p=visit||coords;if(!p)return;els.form.reset();els.id.value=visit?.id||'';els.lat.value=p.lat;els.lng.value=p.lng;els.visitStatus.value=visit?.status||'active';els.coords.textContent=`${Number(p.lat).toFixed(6)}, ${Number(p.lng).toFixed(6)}`;els.name.value=visit?.name||'';els.address.value=visit?.address||coords?.address||'';els.notes.value=visit?.notes||'';els.due.value=visit?.dueDate||'';els.dueTime.value=visit?.dueTime||'';els.title.textContent=visit?'Revisita':'Nueva revisita';els.existing.hidden=!visit;els.deleteVisit.hidden=!visit;els.detailMapSection.hidden=!visit;els.markDone.hidden=!visit||visit.status==='completed';els.reschedule.textContent=visit?.status==='completed'?'Reactivar y reprogramar':'Reprogramar';renderHistory(visit);
 if(!visit)map.setDraft(p.lat,p.lng);if(!els.dialog.open)els.dialog.showModal();
 if(visit)requestAnimationFrame(()=>{detailMap.setMarkers([{...visit,isOverdue:visitBucket(visit)==='overdue'}]);detailMap.setView(visit.lat,visit.lng,17);detailMap.render();});
 requestAnimationFrame(()=>options.focusSchedule?els.due.focus():els.name.focus());
}
function renderHistory(v){
 const history=v?.history||[];els.historyPanel.hidden=!history.length;els.historyList.replaceChildren(...history.slice().reverse().slice(0,5).map(h=>{const row=document.createElement('div');row.className='history-entry';const a=document.createElement('span');a.textContent=new Intl.DateTimeFormat('es-DO',{day:'numeric',month:'short',year:'numeric'}).format(new Date(h.completedAt));const b=document.createElement('span');b.textContent=h.dueDate?`Programada: ${shortDate(h.dueDate)}${h.dueTime?' · '+formatTime(h.dueTime):''}`:'Visita completada';row.append(a,b);return row;}));
}
function closeEditor(){if(!els.id.value)map.setDraft(null,null);if(els.dialog.open)els.dialog.close();}
function saveVisit(e){
 e.preventDefault();const name=els.name.value.trim();if(!name){els.name.focus();return toast('Escribe un nombre o referencia.');}const now=new Date().toISOString(),id=els.id.value||crypto.randomUUID(),old=state.visits.find(v=>v.id===id),status=els.visitStatus.value==='completed'?'completed':'active';
 const rec={id,name,address:els.address.value.trim(),notes:els.notes.value.trim(),dueDate:els.due.value||'',dueTime:els.dueTime.value||'',status,completedAt:status==='completed'?(old?.completedAt||now):null,history:old?.history||[],lat:Number(els.lat.value),lng:Number(els.lng.value),createdAt:old?.createdAt||now,updatedAt:now};
 state.visits=old?state.visits.map(v=>v.id===id?rec:v):[...state.visits,rec];persist();closeEditor();clearPendingLocation();renderAll();toast(old?'Revisita actualizada.':'Revisita guardada.');
}
function currentVisit(){return state.visits.find(v=>v.id===els.id.value)||null;}
function markDoneVisit(id,close=false){
 const v=state.visits.find(x=>x.id===id);if(!v||v.status==='completed')return;if(!confirm(`¿Marcar “${v.name}” como hecha?`))return;const now=new Date().toISOString(),history=[...(v.history||[]),{completedAt:now,dueDate:v.dueDate||'',dueTime:v.dueTime||''}];state.visits=state.visits.map(x=>x.id===id?{...x,status:'completed',completedAt:now,history,dueDate:'',dueTime:'',updatedAt:now}:x);persist();if(close)closeEditor();renderAll();toast('Revisita marcada como hecha.');
}
function deleteVisit(){const v=currentVisit();if(!v||!confirm(`¿Eliminar la revisita “${v.name}”? Esta acción no se puede deshacer.`))return;state.visits=state.visits.filter(x=>x.id!==v.id);persist();closeEditor();renderAll();toast('Revisita eliminada.');}
function showVisitOnMap(){const v=currentVisit();if(!v)return;closeEditor();mapMode=v.status==='completed'?'all':'active';showView('map');syncMapModeButtons();renderMapMode(false);map.setView(v.lat,v.lng,17);}
function googleMapsUrl(v){return`https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}&travelmode=driving`;}
function openGoogleMaps(){const v=currentVisit();if(!v)return;window.open(googleMapsUrl(v),'_blank','noopener');}
async function shareVisit(){const v=currentVisit();if(!v)return;const url=`https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`,text=`${v.name}\n${v.address||''}\n${v.dueDate?'Volver: '+shortDate(v.dueDate)+(v.dueTime?' '+formatTime(v.dueTime):'')+'\n':''}${url}`.trim();try{if(navigator.share)await navigator.share({title:`Revisita: ${v.name}`,text});else{await navigator.clipboard.writeText(text);toast('Ubicación copiada al portapapeles.');}}catch(e){if(e?.name!=='AbortError')toast('No se pudo compartir la ubicación.');}}

function bindList(){
 els.search.addEventListener('input',renderList);document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('is-active',x===b));renderList();}));els.list.addEventListener('click',handleListAction);
}
function handleListAction(e){const b=e.target.closest('[data-open-visit]');if(b)openEditor(b.dataset.openVisit);}
function renderAll(){renderToday();renderList();renderMapMode(false);els.restore.hidden=!hasRecoverySnapshot();}
function renderList(){
 const today=dateKey(),q=els.search.value.trim().toLowerCase();let visits=state.visits.filter(v=>{const bucket=visitBucket(v,today);if(filter==='active'&&v.status!=='active')return false;if(filter==='today'&&!['today','overdue'].includes(bucket))return false;if(filter==='upcoming'&&bucket!=='upcoming')return false;if(filter==='undated'&&bucket!=='undated')return false;if(filter==='completed'&&v.status!=='completed')return false;return!q||`${v.name} ${v.address} ${v.notes}`.toLowerCase().includes(q);}).sort(compareSchedule);
 if(filter==='completed')visits.sort((a,b)=>(b.completedAt||'').localeCompare(a.completedAt||''));
 els.summary.textContent=`${state.visits.filter(v=>v.status==='active').length} activas · ${state.visits.filter(v=>v.status==='completed').length} en historial`;els.list.replaceChildren(...visits.map(visitCard));els.empty.hidden=visits.length!==0;els.list.hidden=visits.length===0;
}
function visitCard(v){
 const bucket=visitBucket(v),card=document.createElement('article');card.className=`visit-card card${v.status==='completed'?' completed':''}`;const body=document.createElement('div'),h=document.createElement('h3');h.textContent=v.name;body.append(h);if(v.address){const p=document.createElement('p');p.textContent=v.address;body.append(p);}if(v.notes){const p=document.createElement('p');p.className='note-preview';p.textContent=v.notes;body.append(p);}const meta=document.createElement('div');meta.className='visit-card-meta';if(v.status==='completed')meta.append(chip('Hecha','done'));else if(bucket==='overdue')meta.append(chip('Atrasada','overdue'));if(v.dueDate)meta.append(chip(`${shortDate(v.dueDate)}${v.dueTime?' · '+formatTime(v.dueTime):''}`,'due'));if(currentLocation)meta.append(chip(formatDistance(haversineKm(currentLocation.lat,currentLocation.lng,v.lat,v.lng))));body.append(meta);const open=document.createElement('button');open.type='button';open.className='card-open';open.dataset.openVisit=v.id;open.setAttribute('aria-label',`Abrir revisita ${v.name}`);open.textContent='›';card.append(body,open);return card;
}
function chip(text,extra=''){const s=document.createElement('span');s.className=`mini-chip ${extra}`.trim();s.textContent=text;return s;}
function shortDate(k){if(!k)return'';const[y,m,d]=k.split('-').map(Number);return new Intl.DateTimeFormat('es-DO',{day:'numeric',month:'short'}).format(new Date(y,m-1,d));}

function bindMore(){
 $('themeToggleBtn').addEventListener('click',()=>{state.settings.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(state.settings.theme);persist();});
 els.install.addEventListener('click',async()=>{if(!installPrompt)return;await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;els.install.disabled=true;});
 $('exportBtn').addEventListener('click',exportBackup);$('importBtn').addEventListener('click',()=>els.importFile.click());els.importFile.addEventListener('change',importFile);$('closeImportBtn').addEventListener('click',closeImport);$('cancelImportBtn').addEventListener('click',closeImport);$('confirmImportBtn').addEventListener('click',confirmImport);els.restore.addEventListener('click',restoreSnapshot);$('deleteAllBtn').addEventListener('click',deleteAll);$('reloadAppBtn').addEventListener('click',()=>{swRegistration?.waiting?.postMessage({type:'SKIP_WAITING'});location.reload();});
}
function applyTheme(theme){document.documentElement.dataset.theme=theme==='light'?'light':'dark';document.querySelector('meta[name="theme-color"]').content=theme==='light'?'#eaf0f5':'#102d49';}
function exportBackup(){const blob=new Blob([JSON.stringify(exportPayload(state),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`revisita-copia-${dateKey()}.json`;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);toast('Copia exportada.');}
async function importFile(){const f=els.importFile.files?.[0];els.importFile.value='';if(!f)return;try{pendingImport=validateImportPayload(JSON.parse(await f.text()));const p=previewImport(state,pendingImport);els.importPreview.replaceChildren(row('Revisitas en la copia',p.imported),row('Nuevas',p.newRecords),row('Coincidencias por ID',p.conflicts),row('Guardadas actualmente',p.localBefore));els.importDialog.showModal();}catch(e){showError('No se pudo importar',e.message||String(e));}}
function row(label,value){const r=document.createElement('div');r.className='preview-row';const l=document.createElement('span');l.textContent=label;const v=document.createElement('strong');v.className='num';v.textContent=value;r.append(l,v);return r;}
function confirmImport(){if(!pendingImport)return;try{state=applyImport(state,pendingImport);pendingImport=null;closeImport();applyTheme(state.settings.theme);renderAll();toast('Importación terminada. La copia anterior quedó disponible para restaurar.');}catch(e){showError('No se pudo aplicar la importación',e.message||String(e));}}
function closeImport(){pendingImport=null;if(els.importDialog.open)els.importDialog.close();}
function restoreSnapshot(){if(!confirm('¿Restaurar la copia local creada antes de la última importación?'))return;try{state=restoreRecoverySnapshot();applyTheme(state.settings.theme);renderAll();toast('Copia anterior restaurada.');}catch(e){showError('No se pudo restaurar',e.message||String(e));}}
function deleteAll(){if(!state.visits.length)return toast('No hay revisitas para borrar.');if(!confirm(`¿Borrar las ${state.visits.length} revisitas guardadas? Esta acción no se puede deshacer.`))return;state.visits=[];persist();renderAll();toast('Se borraron todas las revisitas.');}

function persist(announce=true){try{saveState(state);setStatus(navigator.onLine?'Guardado':'Sin conexión',navigator.onLine?'success':'warn',announce);}catch(e){setStatus('No se pudo guardar','danger');showError('Error al guardar',e.message||String(e));}}
function setStatus(text,kind='success',announce=true){els.status.textContent=text;const c=kind==='danger'?'error':kind==='warn'?'warning':kind==='info'?'info':'success';els.status.style.color=`var(--color-${c})`;els.status.style.borderColor=`var(--border-${c}-soft)`;els.status.style.background=`var(--color-${c}-soft)`;els.status.setAttribute('aria-live',announce?'polite':'off');}
function updateOnline(){setStatus(navigator.onLine?'Guardado':'Sin conexión',navigator.onLine?'success':'warn');}
function toast(message){const d=document.createElement('div');d.className='toast';d.textContent=message;els.toast.append(d);setTimeout(()=>d.remove(),3200);}
function showError(type,message){const box=$('errorBoundary');box.replaceChildren();const s=document.createElement('strong');s.textContent=type,p=document.createElement('div');p.textContent=message;const b=document.createElement('button');b.type='button';b.className='btn btn-secondary';b.textContent='Cerrar';b.style.marginTop='8px';b.onclick=()=>box.hidden=true;box.append(s,p,b);box.hidden=false;}
async function registerSW(){if(!('serviceWorker'in navigator))return;try{swRegistration=await navigator.serviceWorker.register('./sw.js');if(swRegistration.waiting)els.update.hidden=false;swRegistration.addEventListener('updatefound',()=>{const w=swRegistration.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)els.update.hidden=false;});});navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());}catch(e){console.warn('No se pudo registrar el service worker.',e);}}
