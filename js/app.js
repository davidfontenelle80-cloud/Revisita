import{SimpleMap}from'./map.js';
import{haversineKm,formatDistance}from'./map-utils.js';
import{dateKey,visitBucket,compareSchedule,formatTime,selectNextVisit}from'./schedule-utils.js';
import{initLanguage,setLanguage,getLanguage,locale,t,applyTranslations}from'./i18n.js';
import{loadState,saveState,exportPayload,validateImportPayload,previewImport,applyImport,hasRecoverySnapshot,restoreRecoverySnapshot}from'./storage.js';

let state=loadState(),currentLocation=null,filter='active',mapMode='active',installPrompt=null,pendingImport=null,pendingLocation=null,swRegistration=null,lookupToken=0,nextVisitId=null;
const ONBOARDING_KEY='revisita.onboarding.v1';
const $=id=>document.getElementById(id);
const els={
 status:$('saveStatus'),mapEl:$('map'),mapShell:$('mapShell'),locate:$('locateBtn'),confirmPanel:$('locationConfirmPanel'),pendingAddress:$('pendingAddress'),pendingCoords:$('pendingCoords'),pendingAccuracy:$('pendingAccuracy'),mapModeSummary:$('mapModeSummary'),
 dialog:$('visitDialog'),form:$('visitForm'),id:$('visitId'),lat:$('visitLat'),lng:$('visitLng'),visitStatus:$('visitStatus'),name:$('visitName'),address:$('visitAddress'),notes:$('visitNotes'),due:$('visitDueDate'),dueTime:$('visitDueTime'),title:$('dialogTitle'),coords:$('dialogCoords'),existing:$('existingActions'),deleteVisit:$('deleteVisitBtn'),detailMapSection:$('detailMapSection'),historyPanel:$('historyPanel'),historyList:$('historyList'),markDone:$('markDoneBtn'),reschedule:$('rescheduleBtn'),
 list:$('visitList'),empty:$('emptyList'),summary:$('listSummary'),search:$('searchInput'),
 todayDate:$('todayDate'),overdueCount:$('overdueCount'),todayCount:$('todayCount'),doneTodayCount:$('doneTodayCount'),overdueSection:$('overdueSection'),todaySection:$('todaySection'),overdueList:$('overdueList'),todayList:$('todayList'),todayEmpty:$('todayEmpty'),todayBadge:$('todayBadge'),nextVisitCard:$('nextVisitCard'),nextVisitName:$('nextVisitName'),nextVisitMeta:$('nextVisitMeta'),nextVisitTime:$('nextVisitTime'),
 importDialog:$('importDialog'),importPreview:$('importPreview'),importFile:$('importFileInput'),restore:$('restoreSnapshotBtn'),install:$('installBtn'),installHint:$('installHint'),iosInstallDialog:$('iosInstallDialog'),onboardingDialog:$('onboardingDialog'),mapSidebarList:$('mapSidebarList'),mapSidebarCount:$('mapSidebarCount'),fab:$('fabNewVisit'),update:$('updateNotice'),toast:$('toastRegion')
};
const map=new SimpleMap(els.mapEl,state.map);
const detailMap=new SimpleMap($('detailMap'),{...state.map,interactive:false,zoom:17});
map.onTap=ll=>beginLocationConfirmation({...ll,source:'map'});
map.onMarkerTap=id=>{clearPendingLocation();openEditor(id);};
map.onViewChange=({lat,lng,zoom})=>{state.map={lat,lng,zoom};persist(false);};

init();

function init(){
 initLanguage();
 applyTheme(state.settings.theme||'dark');
 applyTranslations(document);
 bindHeader();bindHorizontalHints();bindNav();bindMap();bindEditor();bindAgenda();bindList();bindMore();bindPolishUI();bindKeyboardShortcuts();
 renderAll();registerSW();updateOnline();updateInstallUI();autoLocateOnLaunch();maybeShowOnboarding();
 addEventListener('online',updateOnline);addEventListener('offline',updateOnline);
 addEventListener('revisita:language',()=>{applyTranslations(document);syncThemeButtons();renderAll();updateOnline();updateInstallUI();});
 addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;updateInstallUI();});
 addEventListener('appinstalled',()=>{installPrompt=null;updateInstallUI();toast(t('appInstalled'));});
 addEventListener('error',e=>showError(t('errorApp'),e.message||t('unknownError')));
 addEventListener('unhandledrejection',e=>showError(t('errorApp'),e.reason?.message||String(e.reason||t('unknownError'))));
}


function bindHeader(){
 els.status.addEventListener('click',()=>{
   if(pendingLocation){
     toast(t('locationNotSaved'));
     return;
   }
   if(els.dialog.open){
     els.form.requestSubmit();
     return;
   }
   persist();
   toast(t('everythingSaved'));
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
 $('todayNewBtn').addEventListener('click',()=>{showView('map');toast(t('tapMapOrLocation'));});
 $('todayMapBtn').addEventListener('click',()=>{mapMode='active';showView('map');syncMapModeButtons();renderMapMode(true);});
 $('addFromListBtn').addEventListener('click',()=>{showView('map');toast(t('tapMapOrLocation'));});
}
function showView(name){
 if(name!=='map'&&pendingLocation)clearPendingLocation();
 document.querySelectorAll('.view').forEach(v=>{const on=v.dataset.view===name;v.hidden=!on;v.classList.toggle('is-active',on);});
 document.querySelectorAll('[data-destination]').forEach(b=>{const on=b.dataset.destination===name;b.classList.toggle('is-active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 if(name==='map')requestAnimationFrame(()=>{map.render();renderMapMode(false);centerMapOnCurrentLocation();});
 if(name==='today')renderToday();
 if(name==='list')renderList();
 if(els.fab)els.fab.hidden=name==='more';
 scrollTo({top:0,behavior:'smooth'});
}

function bindMap(){
 $('zoomInBtn').addEventListener('click',()=>map.setZoom(map.zoom+1));$('zoomOutBtn').addEventListener('click',()=>map.setZoom(map.zoom-1));
 els.locate.addEventListener('click',()=>requestLocation(loc=>beginLocationConfirmation({...loc,source:'gps'}),true));
 document.querySelectorAll('[data-map-mode]').forEach(b=>b.addEventListener('click',()=>selectMapMode(b.dataset.mapMode)));
 $('mapSidebarList')?.addEventListener('click',handleMapSidebarAction);
 $('cancelLocationBtn').addEventListener('click',()=>clearPendingLocation());
 $('adjustLocationBtn').addEventListener('click',()=>{if(!pendingLocation)return;map.setView(pendingLocation.lat,pendingLocation.lng,19);toast(t('tapAnother'));});
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
 const labels={today:t('mapSummaryToday'),active:t('mapSummaryActive'),upcoming:t('mapSummaryUpcoming'),all:t('mapSummaryAll'),nearby:t('mapSummaryNearby')};
 els.mapModeSummary.textContent=`${visits.length} ${visits.length===1?t('visitsSingular'):t('visitsPlural')} ${labels[mapMode]}`;
 if(currentLocation)map.setUserLocation(currentLocation.lat,currentLocation.lng);
 renderMapSidebar(visits);
 if(fit){const pts=[...visits];if(mapMode==='nearby'&&currentLocation)pts.push(currentLocation);if(pts.length)requestAnimationFrame(()=>map.fitPoints(pts,mapMode==='nearby'?15:16));}
}

function handleMapSidebarAction(e){
 const dir=e.target.closest('[data-map-directions]');
 const open=e.target.closest('[data-map-open]');
 if(dir){e.stopPropagation();openDirectionsForVisit(dir.dataset.mapDirections);return;}
 if(open)openEditor(open.dataset.mapOpen);
}
function renderMapSidebar(visits){
 if(!els.mapSidebarList||!els.mapSidebarCount)return;
 els.mapSidebarCount.textContent=visits.length;
 if(!visits.length){
   const empty=document.createElement('div');
   empty.className='map-sidebar-empty';
   empty.textContent=t('noVisits');
   els.mapSidebarList.replaceChildren(empty);
   return;
 }
 const cards=visits.slice().sort(compareSchedule).map(v=>{
   const card=document.createElement('article');
   card.className='map-sidebar-card';
   card.dataset.mapOpen=v.id;
   card.tabIndex=0;
   const top=document.createElement('div');top.className='map-sidebar-card-top';
   const title=document.createElement('strong');title.textContent=v.name;
   const when=document.createElement('span');when.className='map-sidebar-when';
   when.textContent=v.dueDate?(shortDate(v.dueDate)+(v.dueTime?' · '+formatTime(v.dueTime,locale()):'')):t('undated');
   top.append(title,when);card.append(top);
   const detail=document.createElement('p');
   const distance=currentLocation?formatDistance(haversineKm(currentLocation.lat,currentLocation.lng,v.lat,v.lng)):'';
   detail.textContent=[v.address||t('noAddress'),distance].filter(Boolean).join(' · ');
   card.append(detail);
   const actions=document.createElement('div');actions.className='map-sidebar-actions';
   const openBtn=document.createElement('button');openBtn.type='button';openBtn.className='btn btn-secondary';openBtn.dataset.mapOpen=v.id;openBtn.textContent=t('open');
   const dirBtn=document.createElement('button');dirBtn.type='button';dirBtn.className='btn btn-primary';dirBtn.dataset.mapDirections=v.id;dirBtn.textContent=t('directions');
   actions.append(openBtn,dirBtn);card.append(actions);
   card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();openEditor(v.id);}});
   return card;
 });
 els.mapSidebarList.replaceChildren(...cards);
}
function openDirectionsForVisit(id){
 const v=state.visits.find(x=>x.id===id);
 if(v)window.open(googleMapsUrl(v),'_blank','noopener');
}
function centerMapOnCurrentLocation(){
 if(!currentLocation||pendingLocation)return;
 map.setUserLocation(currentLocation.lat,currentLocation.lng);
 map.setView(currentLocation.lat,currentLocation.lng,Math.max(map.zoom,16));
}
function autoLocateOnLaunch(){
 if(!navigator.geolocation)return;
 navigator.geolocation.getCurrentPosition(p=>{
   currentLocation={lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy};
   map.setUserLocation(currentLocation.lat,currentLocation.lng);
   const mapView=document.querySelector('[data-view="map"]');
   if(mapView&&!mapView.hidden)centerMapOnCurrentLocation();
   renderToday();
   renderList();
   renderMapMode(false);
 },()=>{}, {enableHighAccuracy:true,timeout:12000,maximumAge:60000});
}

function requestLocation(done,forNewVisit){
 if(!navigator.geolocation)return toast(t('gpsUnsupported'));
 setStatus(t('searchingLocation'),'info');if(forNewVisit)els.locate.disabled=true;
 navigator.geolocation.getCurrentPosition(p=>{
   if(forNewVisit)els.locate.disabled=false;currentLocation={lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy};map.setUserLocation(currentLocation.lat,currentLocation.lng);updateOnline();done?.(currentLocation);
 },e=>{if(forNewVisit)els.locate.disabled=false;updateOnline();toast(({1:t('allowLocation'),2:t('locationUnavailable'),3:t('locationTimeout')})[e.code]||t('locationFailed'));},{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
}
async function beginLocationConfirmation(loc){
 pendingLocation={lat:Number(loc.lat),lng:Number(loc.lng),accuracy:Number.isFinite(loc.accuracy)?loc.accuracy:null,source:loc.source||'map',address:''};
 map.setDraft(pendingLocation.lat,pendingLocation.lng);map.setView(pendingLocation.lat,pendingLocation.lng,Math.max(map.zoom,17));
 els.mapShell.classList.add('has-pending');document.body.classList.add('location-pending');els.confirmPanel.hidden=false;els.pendingCoords.textContent=`${pendingLocation.lat.toFixed(6)}, ${pendingLocation.lng.toFixed(6)}`;
 els.pendingAccuracy.hidden=!pendingLocation.accuracy;els.pendingAccuracy.textContent=pendingLocation.accuracy?t('gpsAccuracy',{meters:Math.round(pendingLocation.accuracy)}):'';
 els.pendingAddress.textContent=navigator.onLine?t('searchingAddress'):t('offlineVerifyPin');
 const token=++lookupToken;if(navigator.onLine){const address=await reverseGeocode(pendingLocation.lat,pendingLocation.lng);if(token===lookupToken&&pendingLocation){pendingLocation.address=address;els.pendingAddress.textContent=address||t('locationNoAddress');}}
}
function clearPendingLocation(clearDraft=true){lookupToken++;pendingLocation=null;els.confirmPanel.hidden=true;els.mapShell.classList.remove('has-pending');document.body.classList.remove('location-pending');if(clearDraft)map.setDraft(null,null);}
async function reverseGeocode(lat,lng){
 try{const q=new URLSearchParams({format:'jsonv2',lat:String(lat),lon:String(lng),zoom:'18','accept-language':getLanguage()});const r=await fetch(`https://nominatim.openstreetmap.org/reverse?${q}`,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return (await r.json()).display_name||'';}catch(e){console.warn('Geocodificación no disponible.',e);return'';}
}

function bindAgenda(){
 [els.overdueList,els.todayList].forEach(box=>box.addEventListener('click',handleVisitAction));
}
function renderToday(){
 const today=dateKey(),overdue=state.visits.filter(v=>visitBucket(v,today)==='overdue').sort(compareSchedule),due=state.visits.filter(v=>visitBucket(v,today)==='today').sort(compareSchedule);
 const doneToday=state.visits.filter(v=>v.status==='completed'&&dateKey(new Date(v.completedAt))===today).length;
 els.todayDate.textContent=new Intl.DateTimeFormat(locale(),{weekday:'long',day:'numeric',month:'long'}).format(new Date());
 els.overdueCount.textContent=overdue.length;els.todayCount.textContent=due.length;els.doneTodayCount.textContent=doneToday;
 const actionCount=overdue.length+due.length;els.todayBadge.textContent=actionCount;els.todayBadge.hidden=!actionCount;
 els.overdueSection.hidden=!overdue.length;els.overdueList.replaceChildren(...overdue.map(v=>agendaCard(v,true)));els.todayList.replaceChildren(...due.map(v=>agendaCard(v,false)));
 els.todaySection.hidden=!due.length;els.todayEmpty.hidden=actionCount!==0;
 renderNextVisit(overdue,due);
}
function renderNextVisit(overdue,due){
 if(!els.nextVisitCard)return;
 const v=selectNextVisit(state.visits,new Date());
 nextVisitId=v?.id||null;
 els.nextVisitCard.hidden=!v;
 if(!v)return;
 els.nextVisitName.textContent=v.name;
 const bucket=visitBucket(v);
 const distance=currentLocation?formatDistance(haversineKm(currentLocation.lat,currentLocation.lng,v.lat,v.lng)):'';
 const status=bucket==='overdue'?t('overdue'):bucket==='today'?t('today'):v.dueDate?shortDate(v.dueDate):t('undated');
 els.nextVisitMeta.textContent=[v.address||t('noAddress'),distance,status].filter(Boolean).join(' · ');
 els.nextVisitTime.textContent=v.dueTime?formatTime(v.dueTime,locale()):(bucket==='today'?t('noTime'):v.dueDate?shortDate(v.dueDate):'');
}
function agendaCard(v,isOverdue){
 const card=document.createElement('article');card.className=`agenda-card card${isOverdue?' is-overdue':''}`;
 const top=document.createElement('div');top.className='agenda-top';const left=document.createElement('div'),h=document.createElement('h3');h.textContent=v.name;left.append(h);
 if(v.address){const p=document.createElement('p');p.textContent=v.address;left.append(p);}const time=document.createElement('span');time.className='agenda-time';time.textContent=v.dueTime?formatTime(v.dueTime,locale()):isOverdue?shortDate(v.dueDate):t('noTime');top.append(left,time);card.append(top);
 const meta=document.createElement('div');meta.className='visit-card-meta';if(isOverdue)meta.append(chip(t('overdue'),'overdue'));if(currentLocation)meta.append(chip(formatDistance(haversineKm(currentLocation.lat,currentLocation.lng,v.lat,v.lng))));card.append(meta);
 const actions=document.createElement('div');actions.className='agenda-actions';actions.append(actionBtn(t('open'),v.id,'open'),actionBtn(t('markDone'),v.id,'done'),actionBtn(t('reschedule'),v.id,'reschedule'));card.append(actions);return card;
}
function actionBtn(label,id,action){const b=document.createElement('button');b.type='button';b.className=action==='done'?'btn btn-primary':'btn btn-secondary';b.textContent=label;b.dataset[action]=id;return b;}
function handleVisitAction(e){
 const open=e.target.closest('[data-open]'),done=e.target.closest('[data-done]'),res=e.target.closest('[data-reschedule]');
 if(open)openEditor(open.dataset.open);else if(done)markDoneVisit(done.dataset.done);else if(res)openEditor(res.dataset.reschedule,null,{focusSchedule:true});
}

function bindEditor(){
 $('closeDialogBtn').addEventListener('click',closeEditor);els.dialog.addEventListener('cancel',e=>{e.preventDefault();closeEditor();});els.dialog.addEventListener('click',e=>{if(e.target===els.dialog)closeEditor();});
 els.form.addEventListener('submit',saveVisit);$('lookupAddressBtn').addEventListener('click',async()=>{const a=await reverseGeocode(Number(els.lat.value),Number(els.lng.value));if(a)els.address.value=a;else toast(t('noAddressNow'));});
 els.deleteVisit.addEventListener('click',deleteVisit);$('showOnMapBtn').addEventListener('click',showVisitOnMap);$('googleMapsBtn').addEventListener('click',openGoogleMaps);$('googleMapsTopBtn').addEventListener('click',openGoogleMaps);$('shareBtn').addEventListener('click',shareVisit);els.markDone.addEventListener('click',()=>{const v=currentVisit();if(v)markDoneVisit(v.id,true);});els.reschedule.addEventListener('click',()=>{els.visitStatus.value='active';els.due.focus();toast(t('chooseNewSchedule'));});
}
function openEditor(id,coords=null,options={}){
 const visit=id?state.visits.find(v=>v.id===id):null,p=visit||coords;if(!p)return;els.form.reset();els.id.value=visit?.id||'';els.lat.value=p.lat;els.lng.value=p.lng;els.visitStatus.value=visit?.status||'active';els.coords.textContent=`${Number(p.lat).toFixed(6)}, ${Number(p.lng).toFixed(6)}`;els.name.value=visit?.name||'';els.address.value=visit?.address||coords?.address||'';els.notes.value=visit?.notes||'';els.due.value=visit?.dueDate||'';els.dueTime.value=visit?.dueTime||'';els.title.textContent=visit?t('visitTitle'):t('newVisitTitle');els.existing.hidden=!visit;els.deleteVisit.hidden=!visit;els.detailMapSection.hidden=!visit;els.markDone.hidden=!visit||visit.status==='completed';els.reschedule.textContent=visit?.status==='completed'?t('reactivateReschedule'):t('reschedule');renderHistory(visit);
 if(!visit)map.setDraft(p.lat,p.lng);if(!els.dialog.open)els.dialog.showModal();
 if(visit)requestAnimationFrame(()=>{detailMap.setMarkers([{...visit,isOverdue:visitBucket(visit)==='overdue'}]);detailMap.setView(visit.lat,visit.lng,17);detailMap.render();});
 requestAnimationFrame(()=>options.focusSchedule?els.due.focus():els.name.focus());
}
function renderHistory(v){
 const history=v?.history||[];els.historyPanel.hidden=!history.length;els.historyList.replaceChildren(...history.slice().reverse().slice(0,5).map(h=>{const row=document.createElement('div');row.className='history-entry';const a=document.createElement('span');a.textContent=new Intl.DateTimeFormat(locale(),{day:'numeric',month:'short',year:'numeric'}).format(new Date(h.completedAt));const b=document.createElement('span');b.textContent=h.dueDate?t('scheduled',{value:`${shortDate(h.dueDate)}${h.dueTime?' · '+formatTime(h.dueTime,locale()):''}`}):t('completedVisit');row.append(a,b);return row;}));
}
function closeEditor(){if(!els.id.value)map.setDraft(null,null);if(els.dialog.open)els.dialog.close();}
function saveVisit(e){
 e.preventDefault();const name=els.name.value.trim();if(!name){els.name.focus();return toast(t('nameRequired'));}const now=new Date().toISOString(),id=els.id.value||crypto.randomUUID(),old=state.visits.find(v=>v.id===id),status=els.visitStatus.value==='completed'?'completed':'active';
 const rec={id,name,address:els.address.value.trim(),notes:els.notes.value.trim(),dueDate:els.due.value||'',dueTime:els.dueTime.value||'',status,completedAt:status==='completed'?(old?.completedAt||now):null,history:old?.history||[],lat:Number(els.lat.value),lng:Number(els.lng.value),createdAt:old?.createdAt||now,updatedAt:now};
 state.visits=old?state.visits.map(v=>v.id===id?rec:v):[...state.visits,rec];persist();closeEditor();clearPendingLocation();renderAll();toast(old?t('visitUpdated'):t('visitSaved'));
}
function currentVisit(){return state.visits.find(v=>v.id===els.id.value)||null;}
function markDoneVisit(id,close=false){
 const v=state.visits.find(x=>x.id===id);if(!v||v.status==='completed')return;if(!confirm(t('markDoneConfirm',{name:v.name})))return;const now=new Date().toISOString(),history=[...(v.history||[]),{completedAt:now,dueDate:v.dueDate||'',dueTime:v.dueTime||''}];state.visits=state.visits.map(x=>x.id===id?{...x,status:'completed',completedAt:now,history,dueDate:'',dueTime:'',updatedAt:now}:x);persist();if(close)closeEditor();renderAll();toast(t('visitMarkedDone'));
}
function deleteVisit(){const v=currentVisit();if(!v||!confirm(t('deleteVisitConfirm',{name:v.name})))return;state.visits=state.visits.filter(x=>x.id!==v.id);persist();closeEditor();renderAll();toast(t('visitDeleted'));}
function showVisitOnMap(){const v=currentVisit();if(!v)return;closeEditor();mapMode=v.status==='completed'?'all':'active';showView('map');syncMapModeButtons();renderMapMode(false);map.setView(v.lat,v.lng,17);}
function googleMapsUrl(v){return`https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}&travelmode=driving`;}
function openGoogleMaps(){const v=currentVisit();if(!v)return;window.open(googleMapsUrl(v),'_blank','noopener');}
async function shareVisit(){const v=currentVisit();if(!v)return;const url=`https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`,text=`${v.name}\n${v.address||''}\n${v.dueDate?'Volver: '+shortDate(v.dueDate)+(v.dueTime?' '+formatTime(v.dueTime,locale()):'')+'\n':''}${url}`.trim();try{if(navigator.share)await navigator.share({title:`Revisita: ${v.name}`,text});else{await navigator.clipboard.writeText(text);toast(t('copiedLocation'));}}catch(e){if(e?.name!=='AbortError')toast(t('shareFailed'));}}

function bindList(){
 els.search.addEventListener('input',renderList);document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('is-active',x===b));renderList();}));els.list.addEventListener('click',handleListAction);
}
function handleListAction(e){const b=e.target.closest('[data-open-visit]');if(b)openEditor(b.dataset.openVisit);}
function renderAll(){renderToday();renderList();renderMapMode(false);els.restore.hidden=!hasRecoverySnapshot();}
function renderList(){
 const today=dateKey(),q=els.search.value.trim().toLowerCase();let visits=state.visits.filter(v=>{const bucket=visitBucket(v,today);if(filter==='active'&&v.status!=='active')return false;if(filter==='today'&&!['today','overdue'].includes(bucket))return false;if(filter==='upcoming'&&bucket!=='upcoming')return false;if(filter==='undated'&&bucket!=='undated')return false;if(filter==='completed'&&v.status!=='completed')return false;return!q||`${v.name} ${v.address} ${v.notes}`.toLowerCase().includes(q);}).sort(compareSchedule);
 if(filter==='completed')visits.sort((a,b)=>(b.completedAt||'').localeCompare(a.completedAt||''));
 els.summary.textContent=`${state.visits.filter(v=>v.status==='active').length} ${t('currentActive')} · ${state.visits.filter(v=>v.status==='completed').length} ${t('inHistory')}`;els.list.replaceChildren(...visits.map(visitCard));els.empty.hidden=visits.length!==0;els.list.hidden=visits.length===0;
}
function visitCard(v){
 const bucket=visitBucket(v),card=document.createElement('article');card.className=`visit-card card${v.status==='completed'?' completed':''}`;const body=document.createElement('div'),h=document.createElement('h3');h.textContent=v.name;body.append(h);if(v.address){const p=document.createElement('p');p.textContent=v.address;body.append(p);}if(v.notes){const p=document.createElement('p');p.className='note-preview';p.textContent=v.notes;body.append(p);}const meta=document.createElement('div');meta.className='visit-card-meta';if(v.status==='completed')meta.append(chip(t('done'),'done'));else if(bucket==='overdue')meta.append(chip(t('overdue'),'overdue'));if(v.dueDate)meta.append(chip(`${shortDate(v.dueDate)}${v.dueTime?' · '+formatTime(v.dueTime,locale()):''}`,'due'));if(currentLocation)meta.append(chip(formatDistance(haversineKm(currentLocation.lat,currentLocation.lng,v.lat,v.lng))));body.append(meta);const open=document.createElement('button');open.type='button';open.className='card-open';open.dataset.openVisit=v.id;open.setAttribute('aria-label',t('openVisitAria',{name:v.name}));open.textContent='›';card.append(body,open);return card;
}
function chip(text,extra=''){const s=document.createElement('span');s.className=`mini-chip ${extra}`.trim();s.textContent=text;return s;}
function shortDate(k){if(!k)return'';const[y,m,d]=k.split('-').map(Number);return new Intl.DateTimeFormat(locale(),{day:'numeric',month:'short'}).format(new Date(y,m-1,d));}

function bindPolishUI(){
 els.fab?.addEventListener('click',()=>{showView('map');toast(t('tapMapOrLocation'));});
 $('nextVisitOpenBtn')?.addEventListener('click',()=>{if(nextVisitId)openEditor(nextVisitId);});
 $('nextVisitDirectionsBtn')?.addEventListener('click',()=>{if(nextVisitId)openDirectionsForVisit(nextVisitId);});
 $('closeOnboardingBtn')?.addEventListener('click',completeOnboarding);
 $('onboardingDoneBtn')?.addEventListener('click',completeOnboarding);
 els.onboardingDialog?.addEventListener('cancel',e=>{e.preventDefault();completeOnboarding();});
 els.onboardingDialog?.addEventListener('click',e=>{if(e.target===els.onboardingDialog)completeOnboarding();});
}
function maybeShowOnboarding(){
 if(!els.onboardingDialog||state.visits.length)return;
 try{if(localStorage.getItem(ONBOARDING_KEY))return;}catch{}
 setTimeout(()=>{if(!els.onboardingDialog.open&&!document.querySelector('dialog[open]'))els.onboardingDialog.showModal();},900);
}
function completeOnboarding(){
 try{localStorage.setItem(ONBOARDING_KEY,'1');}catch{}
 if(els.onboardingDialog?.open)els.onboardingDialog.close();
}
function bindKeyboardShortcuts(){
 document.addEventListener('keydown',e=>{
   if(!e.altKey)return;
   const key=e.key.toLowerCase();
   if(key==='l'){e.preventDefault();setLanguage(getLanguage()==='es'?'en':'es');toast(t('languageChanged'));}
   if(key==='d'){e.preventDefault();state.settings.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(state.settings.theme);persist();}
 });
}


function isIOSDevice(){
 const ua=navigator.userAgent||'';
 return /iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
}
function isStandalone(){
 return window.matchMedia?.('(display-mode: standalone)').matches===true||navigator.standalone===true;
}
function updateInstallUI(){
 if(!els.install||!els.installHint)return;
 if(isStandalone()){
   els.install.disabled=true;
   els.install.textContent=t('installed');
   els.installHint.textContent=t('installed');
   return;
 }
 if(isIOSDevice()){
   els.install.disabled=false;
   els.install.textContent=t('installIOS');
   els.installHint.textContent=t('installIOSHint');
   return;
 }
 if(installPrompt){
   els.install.disabled=false;
   els.install.textContent=t('installRevisita');
   els.installHint.textContent=t('installReady');
   return;
 }
 els.install.disabled=false;
 els.install.textContent=t('installRevisita');
 els.installHint.textContent=t('installHint');
}
function openIOSInstallGuide(){
 if(!els.iosInstallDialog)return;
 if(!els.iosInstallDialog.open)els.iosInstallDialog.showModal();
}
function closeIOSInstallGuide(){
 if(els.iosInstallDialog?.open)els.iosInstallDialog.close();
}

function bindMore(){
 document.querySelectorAll('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>{state.settings.theme=b.dataset.themeChoice==='light'?'light':'dark';applyTheme(state.settings.theme);persist();}));
 document.querySelectorAll('[data-lang-choice]').forEach(b=>b.addEventListener('click',()=>{setLanguage(b.dataset.langChoice);toast(t('languageChanged'));}));
 els.install.addEventListener('click',async()=>{
   if(isStandalone()){toast(t('installed'));return;}
   if(isIOSDevice()){openIOSInstallGuide();return;}
   if(installPrompt){
     await installPrompt.prompt();
     await installPrompt.userChoice;
     installPrompt=null;
     updateInstallUI();
     return;
   }
   toast(t('installUnavailable'));
 });
 $('closeIOSInstallBtn')?.addEventListener('click',closeIOSInstallGuide);
 $('iosInstallDoneBtn')?.addEventListener('click',closeIOSInstallGuide);
 els.iosInstallDialog?.addEventListener('cancel',e=>{e.preventDefault();closeIOSInstallGuide();});
 els.iosInstallDialog?.addEventListener('click',e=>{if(e.target===els.iosInstallDialog)closeIOSInstallGuide();});
 $('exportBtn').addEventListener('click',exportBackup);$('importBtn').addEventListener('click',()=>els.importFile.click());els.importFile.addEventListener('change',importFile);$('closeImportBtn').addEventListener('click',closeImport);$('cancelImportBtn').addEventListener('click',closeImport);$('confirmImportBtn').addEventListener('click',confirmImport);els.restore.addEventListener('click',restoreSnapshot);$('deleteAllBtn').addEventListener('click',deleteAll);$('reloadAppBtn').addEventListener('click',()=>{swRegistration?.waiting?.postMessage({type:'SKIP_WAITING'});location.reload();});
}
function applyTheme(theme){document.documentElement.dataset.theme=theme==='light'?'light':'dark';document.querySelector('meta[name="theme-color"]').content=theme==='light'?'#eaf0f5':'#102d49';syncThemeButtons();}
function syncThemeButtons(){document.querySelectorAll('[data-theme-choice]').forEach(b=>b.classList.toggle('is-active',b.dataset.themeChoice===document.documentElement.dataset.theme));}
function exportBackup(){const blob=new Blob([JSON.stringify(exportPayload(state),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`revisita-copia-${dateKey()}.json`;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);toast(t('backupExported'));}
async function importFile(){const f=els.importFile.files?.[0];els.importFile.value='';if(!f)return;try{pendingImport=validateImportPayload(JSON.parse(await f.text()));const p=previewImport(state,pendingImport);els.importPreview.replaceChildren(row(t('importCount'),p.imported),row(t('newRecords'),p.newRecords),row(t('conflicts'),p.conflicts),row(t('currentSaved'),p.localBefore));els.importDialog.showModal();}catch(e){showError(t('importFailed'),e.message||String(e));}}
function row(label,value){const r=document.createElement('div');r.className='preview-row';const l=document.createElement('span');l.textContent=label;const v=document.createElement('strong');v.className='num';v.textContent=value;r.append(l,v);return r;}
function confirmImport(){if(!pendingImport)return;try{state=applyImport(state,pendingImport);pendingImport=null;closeImport();applyTheme(state.settings.theme);renderAll();toast(t('importFinished'));}catch(e){showError(t('importApplyFailed'),e.message||String(e));}}
function closeImport(){pendingImport=null;if(els.importDialog.open)els.importDialog.close();}
function restoreSnapshot(){if(!confirm(t('restoreConfirm')))return;try{state=restoreRecoverySnapshot();applyTheme(state.settings.theme);renderAll();toast(t('restored'));}catch(e){showError(t('restoreFailed'),e.message||String(e));}}
function deleteAll(){if(!state.visits.length)return toast(t('noVisitsDelete'));if(!confirm(t('deleteAllConfirm',{count:state.visits.length})))return;state.visits=[];persist();renderAll();toast(t('allDeleted'));}

function persist(announce=true){try{saveState(state);setStatus(navigator.onLine?t('save'):t('offline'),navigator.onLine?'success':'warn',announce);}catch(e){setStatus(t('saveFailed'),'danger');showError(t('errorSave'),e.message||String(e));}}
function setStatus(text,kind='success',announce=true){els.status.textContent=text;const c=kind==='danger'?'error':kind==='warn'?'warning':kind==='info'?'info':'success';els.status.style.color=`var(--color-${c})`;els.status.style.borderColor=`var(--border-${c}-soft)`;els.status.style.background=`var(--color-${c}-soft)`;els.status.setAttribute('aria-live',announce?'polite':'off');}
function updateOnline(){setStatus(navigator.onLine?t('save'):t('offline'),navigator.onLine?'success':'warn');}
function toast(message){const d=document.createElement('div');d.className='toast';d.textContent=message;els.toast.append(d);setTimeout(()=>d.remove(),3200);}
function showError(type,message){const box=$('errorBoundary');box.replaceChildren();const s=document.createElement('strong');s.textContent=type,p=document.createElement('div');p.textContent=message;const b=document.createElement('button');b.type='button';b.className='btn btn-secondary';b.textContent=t('close');b.style.marginTop='8px';b.onclick=()=>box.hidden=true;box.append(s,p,b);box.hidden=false;}
async function registerSW(){if(!('serviceWorker'in navigator))return;try{swRegistration=await navigator.serviceWorker.register('./sw.js');if(swRegistration.waiting)els.update.hidden=false;swRegistration.addEventListener('updatefound',()=>{const w=swRegistration.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)els.update.hidden=false;});});navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());}catch(e){console.warn('No se pudo registrar el service worker.',e);}}
