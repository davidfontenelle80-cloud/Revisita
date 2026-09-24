import{SimpleMap}from'./map.js?v=1.4.4';
import{haversineKm,formatDistance}from'./map-utils.js?v=1.4.4';
import{dateKey,visitBucket,compareSchedule,formatTime,selectNextVisit}from'./schedule-utils.js?v=1.4.4';
import{initLanguage,setLanguage,getLanguage,locale,t,applyTranslations}from'./i18n.js?v=1.4.4';
import{loadState,saveState,exportPayload,validateImportPayload,previewImport,applyImport,hasRecoverySnapshot,restoreRecoverySnapshot,normalizeVisit}from'./storage.js?v=1.4.4';
import{compactAddress,placeLine,nextDatePresets,directionsUrl,mapLink,whatsappUrl,telUrl,buildICS,googleCalendarUrl,zoneTileUrls,calendarSlot,staleCalendarSlot,addDays}from'./visit-tools.js?v=1.4.4';
import{createCloudSync}from'./cloud-sync.js?v=1.4.4';

let state=loadState(),logVisitId=null,directionsVisitId=null,zoneSaving=false,cloud=null,currentLocation=null,filter='active',mapMode='active',installPrompt=null,pendingImport=null,pendingLocation=null,swRegistration=null,swReloading=false,swLastUpdateCheck=0,lookupToken=0,nextVisitId=null,mapHasOpened=false,mapMovedByUser=state.map?.manual===true,historyExpanded=false;
const ONBOARDING_KEY='revisita.onboarding.v1';
if('scrollRestoration' in history)history.scrollRestoration='manual';
const $=id=>document.getElementById(id);
const els={
 status:$('saveStatus'),mapEl:$('map'),mapShell:$('mapShell'),locate:$('locateBtn'),confirmPanel:$('locationConfirmPanel'),pendingAddress:$('pendingAddress'),pendingCoords:$('pendingCoords'),pendingAccuracy:$('pendingAccuracy'),mapModeSummary:$('mapModeSummary'),
 dialog:$('visitDialog'),form:$('visitForm'),id:$('visitId'),lat:$('visitLat'),lng:$('visitLng'),visitStatus:$('visitStatus'),name:$('visitName'),reference:$('visitReference'),phone:$('visitPhone'),leftWith:$('visitLeftWith'),nextTopic:$('visitNextTopic'),address:$('visitAddress'),notes:$('visitNotes'),due:$('visitDueDate'),dueTime:$('visitDueTime'),title:$('dialogTitle'),coords:$('dialogCoords'),deleteVisit:$('deleteVisitBtn'),cancelEdit:$('cancelEditBtn'),saveVisitBtn:$('saveVisitBtn'),detailMapSection:$('detailMapSection'),historyPanel:$('historyPanel'),historyList:$('historyList'),historyMore:$('historyMoreBtn'),visitView:$('visitView'),editFields:$('editFields'),viewPlace:$('viewPlace'),viewSchedule:$('viewSchedule'),viewDetails:$('viewDetails'),viewLog:$('viewLogBtn'),viewContact:$('viewContactActions'),viewCall:$('viewCallBtn'),viewWhatsapp:$('viewWhatsappBtn'),calendarHint:$('calendarHint'),
 logDialog:$('logDialog'),logForm:$('logForm'),logName:$('logVisitName'),logNote:$('logNote'),logLeftWith:$('logLeftWith'),logNextTopic:$('logNextTopic'),logDue:$('logDueDate'),logTime:$('logDueTime'),logEnd:$('logEnd'),directionsDialog:$('directionsDialog'),mapTip:$('mapTip'),zoneBtn:$('saveZoneBtn'),
 list:$('visitList'),empty:$('emptyList'),summary:$('listSummary'),search:$('searchInput'),
 todayDate:$('todayDate'),upcomingSection:$('upcomingSection'),upcomingList:$('upcomingList'),overdueSection:$('overdueSection'),todaySection:$('todaySection'),overdueList:$('overdueList'),todayList:$('todayList'),todayEmpty:$('todayEmpty'),todayBadge:$('todayBadge'),nextVisitCard:$('nextVisitCard'),nextVisitName:$('nextVisitName'),nextVisitMeta:$('nextVisitMeta'),nextVisitTime:$('nextVisitTime'),
 importDialog:$('importDialog'),importPreview:$('importPreview'),importFile:$('importFileInput'),restore:$('restoreSnapshotBtn'),install:$('installBtn'),installHint:$('installHint'),iosInstallDialog:$('iosInstallDialog'),onboardingDialog:$('onboardingDialog'),mapSidebarList:$('mapSidebarList'),mapSidebarCount:$('mapSidebarCount'),fab:$('fabNewVisit'),update:$('updateNotice'),toast:$('toastRegion')
};
const map=new SimpleMap(els.mapEl,state.map);
const detailMap=new SimpleMap($('detailMap'),{...state.map,interactive:false,zoom:17});
map.onTap=ll=>{mapMovedByUser=true;beginLocationConfirmation({...ll,source:'map'});};
map.onMarkerTap=id=>{clearPendingLocation();openEditor(id);};
map.onViewChange=({lat,lng,zoom})=>{state.map={lat,lng,zoom,manual:mapMovedByUser};persist(false);};

init();

function init(){
 initLanguage();
 applyTheme(state.settings.theme||'dark');
 applyTranslations(document);
 bindHeader();bindHorizontalHints();bindNav();bindMap();bindEditor();bindLog();bindDirections();bindAgenda();bindList();bindMore();bindSettings();bindCloud();bindPolishUI();bindKeyboardShortcuts();
 renderAll();renderSettings();registerSW();updateOnline();updateInstallUI();autoLocateOnLaunch();maybeShowOnboarding();cloud.init();
 addEventListener('online',()=>{updateOnline();cloud?.schedule(1000);});addEventListener('offline',updateOnline);
 addEventListener('pageshow',()=>{if(isMapViewActive())resetPageScroll(true);});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&isMapViewActive())resetPageScroll(true);if(!document.hidden)cloud?.schedule(1500);});
 addEventListener('revisita:language',()=>{applyTranslations(document);syncThemeButtons();renderAll();renderSettings();updateOnline();updateInstallUI();});
 addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;updateInstallUI();});
 addEventListener('appinstalled',()=>{installPrompt=null;updateInstallUI();toast(t('appInstalled'));});
 addEventListener('error',e=>showError(t('errorApp'),e.message||t('unknownError')));
 addEventListener('unhandledrejection',e=>showError(t('errorApp'),e.reason?.message||String(e.reason||t('unknownError'))));
}


function bindHeader(){
 // The header chip is a passive status ("Guardado ✓" / "Sin conexión"); saving is automatic.
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
 $('todayNewBtn').addEventListener('click',openNewVisitChooser);
 $('todayMapBtn').addEventListener('click',()=>{mapMovedByUser=true;mapMode='active';showView('map');syncMapModeButtons();renderMapMode(true);});
 $('addFromListBtn').addEventListener('click',openNewVisitChooser);
}
function showView(name){
 if(name!=='map'&&pendingLocation)clearPendingLocation();
 document.querySelectorAll('.view').forEach(v=>{const on=v.dataset.view===name;v.hidden=!on;v.classList.toggle('is-active',on);});
 document.querySelectorAll('[data-destination]').forEach(b=>{const on=b.dataset.destination===name;b.classList.toggle('is-active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 if(name==='map'){
  const firstOpen=!mapHasOpened;mapHasOpened=true;
  requestAnimationFrame(()=>{map.render();renderMapMode(false);if(firstOpen&&!mapMovedByUser)centerMapOnCurrentLocation();resetPageScroll(true);});
 }
 if(name==='today')renderToday();
 if(name==='list')renderList();
 if(els.fab)els.fab.hidden=name==='more';
 resetPageScroll(name==='map');
}


function isMapViewActive(){
 const view=document.querySelector('[data-view="map"]');
 return Boolean(view&&!view.hidden);
}
function resetPageScroll(reassert=false){
 const apply=()=>{
   window.scrollTo(0,0);
   const scroller=document.scrollingElement;
   if(scroller)scroller.scrollTop=0;
   document.documentElement.scrollTop=0;
   document.body.scrollTop=0;
 };
 apply();
 requestAnimationFrame(apply);
 if(reassert)setTimeout(apply,80);
}

function bindMap(){
 els.mapEl.addEventListener('pointerdown',()=>{mapMovedByUser=true;});
 $('zoomInBtn').addEventListener('click',()=>{mapMovedByUser=true;map.setZoom(map.zoom+1);});$('zoomOutBtn').addEventListener('click',()=>{mapMovedByUser=true;map.setZoom(map.zoom-1);});
 els.locate.addEventListener('click',()=>requestLocation(loc=>beginLocationConfirmation({...loc,source:'gps'}),true));
 document.querySelectorAll('[data-map-mode]').forEach(b=>b.addEventListener('click',()=>selectMapMode(b.dataset.mapMode)));
 $('mapSidebarList')?.addEventListener('click',handleMapSidebarAction);
 $('cancelLocationBtn').addEventListener('click',()=>clearPendingLocation());
 $('adjustLocationBtn').addEventListener('click',()=>{if(!pendingLocation)return;map.setView(pendingLocation.lat,pendingLocation.lng,19);toast(t('tapAnother'));});
 els.zoneBtn?.addEventListener('click',saveOfflineZone);
 $('confirmLocationBtn').addEventListener('click',()=>{if(!pendingLocation)return;const p={...pendingLocation};clearPendingLocation(false);openEditor(null,p);});
}
function selectMapMode(mode){
 mapMovedByUser=true;mapMode=mode;syncMapModeButtons();
 ensureChipVisible(document.querySelector(`[data-map-mode="${mode}"]`));
 if(mode==='nearby'&&!currentLocation){requestLocation(()=>renderMapMode(true),false);return;}
 renderMapMode(true);
}

function ensureChipVisible(chip){
 if(!chip)return;
 const row=chip.closest('.filter-row');
 if(!row)return;
 const left=chip.offsetLeft;
 const right=left+chip.offsetWidth;
 const visibleLeft=row.scrollLeft;
 const visibleRight=visibleLeft+row.clientWidth;
 if(left<visibleLeft+6||right>visibleRight-6){
   row.scrollTo({left:Math.max(0,left-(row.clientWidth-chip.offsetWidth)/2),behavior:'smooth'});
 }
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
 const oneLabels={today:t('mapSummaryOneToday'),active:t('mapSummaryOneActive'),upcoming:t('mapSummaryOneUpcoming'),all:t('mapSummaryOneAll'),nearby:t('mapSummaryOneNearby')};
 els.mapModeSummary.textContent=visits.length===1?t('mapSummaryOne',{label:oneLabels[mapMode]}):`${visits.length} ${t('visitsPlural')} ${labels[mapMode]}`;
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
   detail.textContent=[placeLine(v)||t('noAddress'),distance].filter(Boolean).join(' · ');
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
 if(!v)return;
 const app=state.settings.navApp;
 if(app&&app!=='ask'&&!(app==='apple'&&!isIOSDevice())){window.open(directionsUrl(app,v),'_blank','noopener');return;}
 directionsVisitId=id;
 const remember=$('rememberNavApp');if(remember)remember.checked=false;
 const apple=els.directionsDialog.querySelector('[data-nav-app="apple"]');if(apple)apple.hidden=!isIOSDevice();
 if(!els.directionsDialog.open)els.directionsDialog.showModal();
}
function bindDirections(){
 els.directionsDialog.querySelectorAll('[data-nav-app]').forEach(b=>b.addEventListener('click',()=>{
   const v=state.visits.find(x=>x.id===directionsVisitId);const app=b.dataset.navApp;
   if($('rememberNavApp')?.checked){state.settings.navApp=app;persist(false);renderSettings();}
   els.directionsDialog.close();
   if(v)window.open(directionsUrl(app,v),'_blank','noopener');
 }));
 $('closeDirectionsBtn').addEventListener('click',()=>els.directionsDialog.close());
 els.directionsDialog.addEventListener('click',e=>{if(e.target===els.directionsDialog)els.directionsDialog.close();});
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
   if(mapView&&!mapView.hidden&&!mapMovedByUser)centerMapOnCurrentLocation();
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
 try{const q=new URLSearchParams({format:'jsonv2',addressdetails:'1',lat:String(lat),lon:String(lng),zoom:'18','accept-language':getLanguage()});const r=await fetch(`https://nominatim.openstreetmap.org/reverse?${q}`,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return compactAddress(await r.json());}catch(e){console.warn('Geocodificación no disponible.',e);return'';}
}

function bindAgenda(){
 [els.overdueList,els.todayList,els.upcomingList].forEach(box=>box.addEventListener('click',handleVisitAction));
}
function renderToday(){
 const today=dateKey(),weekEnd=addDays(today,7),overdue=state.visits.filter(v=>visitBucket(v,today)==='overdue').sort(compareSchedule),due=state.visits.filter(v=>visitBucket(v,today)==='today').sort(compareSchedule);
 const upcoming=state.visits.filter(v=>visitBucket(v,today)==='upcoming'&&v.dueDate<=weekEnd).sort(compareSchedule);
 els.todayDate.textContent=new Intl.DateTimeFormat(locale(),{weekday:'long',day:'numeric',month:'long'}).format(new Date());
 const actionCount=overdue.length+due.length;els.todayBadge.textContent=actionCount;els.todayBadge.hidden=!actionCount;
 renderNextVisit(overdue,due);
 // The "Próxima revisita" card already shows this visit, so it is not repeated in the lists below.
 const notNext=v=>v.id!==nextVisitId;
 const overdueRest=overdue.filter(notNext),dueRest=due.filter(notNext),upcomingRest=upcoming.filter(notNext);
 els.overdueSection.hidden=!overdueRest.length;els.overdueList.replaceChildren(...overdueRest.map(v=>agendaCard(v,'overdue')));
 els.todaySection.hidden=!dueRest.length;els.todayList.replaceChildren(...dueRest.map(v=>agendaCard(v,'today')));
 els.upcomingSection.hidden=!upcomingRest.length;els.upcomingList.replaceChildren(...upcomingRest.map(v=>agendaCard(v,'upcoming')));
 els.todayEmpty.hidden=actionCount!==0;
}
function renderNextVisit(overdue,due){
 if(!els.nextVisitCard)return;
 const v=selectNextVisit(state.visits,new Date());
 nextVisitId=v?.id||null;
 els.nextVisitCard.hidden=!v;
 if(!v){setCallLink($('nextVisitCallBtn'),'');return;}
 els.nextVisitName.textContent=v.name;
 const bucket=visitBucket(v);
 const distance=currentLocation?formatDistance(haversineKm(currentLocation.lat,currentLocation.lng,v.lat,v.lng)):'';
 const status=bucket==='overdue'?t('overdue'):bucket==='today'?t('today'):v.dueDate?shortDate(v.dueDate):t('undated');
 els.nextVisitMeta.textContent=[placeLine(v)||t('noAddress'),distance,status].filter(Boolean).join(' · ');
 setCallLink($('nextVisitCallBtn'),v.phone);
 els.nextVisitTime.textContent=v.dueTime?formatTime(v.dueTime,locale()):(bucket==='today'?t('noTime'):v.dueDate?shortDate(v.dueDate):'');
}
function agendaCard(v,kind){
 const isOverdue=kind==='overdue';
 const card=document.createElement('article');card.className=`agenda-card card${isOverdue?' is-overdue':''}`;
 const top=document.createElement('div');top.className='agenda-top';const left=document.createElement('div'),h=document.createElement('h3');h.textContent=v.name;left.append(h);
 const place=placeLine(v);if(place){const p=document.createElement('p');p.textContent=place;left.append(p);}const time=document.createElement('span');time.className='agenda-time';if(kind==='upcoming'){time.classList.add('is-stacked');const d=document.createElement('span');d.textContent=shortDate(v.dueDate);time.append(d);if(v.dueTime){const h=document.createElement('span');h.textContent=formatTime(v.dueTime,locale());time.append(h);}}else time.textContent=v.dueTime?formatTime(v.dueTime,locale()):isOverdue?shortDate(v.dueDate):t('noTime');top.append(left,time);card.append(top);
 const meta=document.createElement('div');meta.className='visit-card-meta';if(isOverdue)meta.append(chip(t('overdue'),'overdue'));if(currentLocation)meta.append(chip(formatDistance(haversineKm(currentLocation.lat,currentLocation.lng,v.lat,v.lng))));
 const tel=telUrl(v.phone);if(tel){const call=document.createElement('a');call.className='call-link';call.href=tel;call.setAttribute('aria-label',`${t('call')}: ${v.name}`);call.innerHTML='<span aria-hidden="true">☎</span> ';const lbl=document.createElement('span');lbl.textContent=t('call');call.append(lbl);meta.append(call);}
 card.append(meta);
 const actions=document.createElement('div');actions.className='agenda-actions';actions.append(actionBtn(t('open'),v.id,'open'),actionBtn(t('directions'),v.id,'dir'),actionBtn(t('logVisit'),v.id,'log'));card.append(actions);return card;
}
function setCallLink(el,phone){if(!el)return;const tel=telUrl(phone);el.hidden=!tel;if(tel)el.href=tel;else el.removeAttribute('href');}
function actionBtn(label,id,action){const b=document.createElement('button');b.type='button';b.className=action==='log'?'btn btn-primary':'btn btn-secondary';b.textContent=label;b.dataset[action]=id;return b;}
function handleVisitAction(e){
 const open=e.target.closest('[data-open]'),dir=e.target.closest('[data-dir]'),log=e.target.closest('[data-log]');
 if(open)openEditor(open.dataset.open);else if(dir)openDirectionsForVisit(dir.dataset.dir);else if(log)openLog(log.dataset.log);
}

function bindEditor(){
 $('closeDialogBtn').addEventListener('click',closeEditor);els.dialog.addEventListener('cancel',e=>{e.preventDefault();closeEditor();});els.dialog.addEventListener('click',e=>{if(e.target===els.dialog)closeEditor();});
 els.form.addEventListener('submit',saveVisit);$('lookupAddressBtn').addEventListener('click',async()=>{const a=await reverseGeocode(Number(els.lat.value),Number(els.lng.value));if(a)els.address.value=a;else toast(t('noAddressNow'));});
 els.deleteVisit.addEventListener('click',deleteVisit);$('showOnMapBtn').addEventListener('click',showVisitOnMap);$('shareBtn').addEventListener('click',shareVisit);
 $('viewDirectionsBtn').addEventListener('click',()=>{const v=currentVisit();if(v)openDirectionsForVisit(v.id);});
 els.viewLog.addEventListener('click',()=>{const v=currentVisit();if(v)openLog(v.id);});
 $('viewEditBtn').addEventListener('click',()=>{const v=currentVisit();if(v)openEditor(v.id,null,{edit:true});});
 $('viewCalendarBtn').addEventListener('click',()=>{const v=currentVisit();if(!v)return;if(!v.dueDate){toast(t('noDateForCalendar'));return;}runCalendarFlow(v,{force:true});});
 els.cancelEdit.addEventListener('click',()=>{const v=currentVisit();if(v)openEditor(v.id);else closeEditor();});
 document.querySelectorAll('[data-edit-preset]').forEach(b=>b.addEventListener('click',()=>{const p=nextDatePresets(dateKey()).find(x=>x.id===b.dataset.editPreset);if(p)els.due.value=p.date;markPreset('[data-edit-preset]',b);}));
 els.due.addEventListener('input',()=>markPreset('[data-edit-preset]',null));
}
function markPreset(selector,active){document.querySelectorAll(selector).forEach(x=>x.classList.toggle('is-active',x===active));}
function setEditorMode(mode,visit){
 const viewing=mode==='view';
 els.visitView.hidden=!viewing;els.editFields.hidden=viewing;
 els.form.querySelector('.sheet-footer').hidden=viewing;
 els.deleteVisit.hidden=mode!=='edit';els.cancelEdit.hidden=mode!=='edit';
 els.detailMapSection.hidden=!visit;
 els.calendarHint.hidden=!state.settings.calendarOnSave;
 els.coords.hidden=viewing;
}
function openEditor(id,coords=null,options={}){
 const visit=id?state.visits.find(v=>v.id===id):null,p=visit||coords;if(!p)return;els.form.reset();markPreset('[data-edit-preset]',null);
 if(id!==els.id.value)historyExpanded=false;
 els.id.value=visit?.id||'';els.lat.value=p.lat;els.lng.value=p.lng;els.visitStatus.value=visit?.status||'active';els.coords.textContent=`${Number(p.lat).toFixed(6)}, ${Number(p.lng).toFixed(6)}`;
 els.name.value=visit?.name||'';els.reference.value=visit?.reference||'';els.address.value=visit?.address||coords?.address||'';els.notes.value=visit?.notes||'';els.phone.value=visit?.phone||'';els.leftWith.value=visit?.leftWith||'';els.nextTopic.value=visit?.nextTopic||'';els.due.value=visit?.dueDate||'';els.dueTime.value=visit?.dueTime||'';
 const details=els.form.querySelector('.more-details');if(details)details.open=Boolean(visit&&(visit.phone||visit.notes||visit.leftWith||visit.nextTopic));
 const mode=!visit?'new':options.edit?'edit':'view';
 els.title.textContent=mode==='new'?t('newVisitTitle'):visit.name;
 setEditorMode(mode,visit);
 if(visit)renderVisitView(visit);
 if(!visit)map.setDraft(p.lat,p.lng);if(!els.dialog.open)els.dialog.showModal();
 if(visit)requestAnimationFrame(()=>{detailMap.setMarkers([{...visit,isOverdue:visitBucket(visit)==='overdue'}]);detailMap.setView(visit.lat,visit.lng,17);detailMap.render();});
 const sheet=els.form;sheet.scrollTop=0;
 if(mode==='new')requestAnimationFrame(()=>els.name.focus());
 else requestAnimationFrame(()=>{if(document.activeElement&&els.form.contains(document.activeElement))document.activeElement.blur();});
}
function scheduleText(v){
 if(!v.dueDate)return'';
 return `${new Intl.DateTimeFormat(locale(),{weekday:'long',day:'numeric',month:'long'}).format(new Date(...v.dueDate.split('-').map((n,i)=>i===1?Number(n)-1:Number(n))))}${v.dueTime?' · '+formatTime(v.dueTime,locale()):''}`;
}
function renderVisitView(v){
 els.viewPlace.textContent=placeLine(v)||t('noAddress');
 const bucket=visitBucket(v);
 els.viewSchedule.className=`view-schedule${bucket==='overdue'?' is-overdue':''}${v.status==='completed'?' is-done':''}`;
 els.viewSchedule.textContent=v.status==='completed'?t('done'):v.dueDate?t('scheduledFor',{value:scheduleText(v)}):t('noSchedule');
 els.viewLog.querySelector('[data-i18n]')?.removeAttribute('data-i18n');
 const logLabel=els.viewLog.querySelector('span:last-child');if(logLabel)logLabel.textContent=v.status==='completed'?t('reactivate'):t('logVisit');
 const rows=[[t('detailNotes'),v.notes],[t('leftWith'),v.leftWith],[t('nextTopic'),v.nextTopic],[t('phone'),v.phone]];
 const last=(v.history||[]).at(-1);if(last)rows.unshift([t('lastVisit',{date:''}).replace(/:\s*$/,''),longDate(last.completedAt)+(last.note?' — '+last.note:'')]);
 els.viewDetails.replaceChildren(...rows.filter(r=>r[1]).flatMap(([k,val])=>{const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dd.textContent=val;return[dt,dd];}));
 els.viewDetails.hidden=!els.viewDetails.childElementCount;
 const hasPhone=Boolean(v.phone&&v.phone.replace(/\D/g,'').length>=7);
 els.viewContact.hidden=!hasPhone;
 if(hasPhone){els.viewCall.href=`tel:${v.phone.replace(/[^\d+]/g,'')}`;els.viewWhatsapp.href=whatsappUrl(v.phone);}
 renderHistory(v);
}
function longDate(iso){try{return new Intl.DateTimeFormat(locale(),{day:'numeric',month:'short',year:'numeric'}).format(new Date(iso));}catch{return'';}}
function renderHistory(v){
 const history=v?.history||[];els.historyPanel.hidden=!history.length;
 els.historyList.replaceChildren(...history.slice().reverse().slice(0,historyExpanded?undefined:8).map(h=>{
   const row=document.createElement('div');row.className='history-entry';
   const a=document.createElement('span');a.className='history-date';a.textContent=longDate(h.completedAt);
   const b=document.createElement('span');
   const bits=[h.ended?t('endedVisit'):t('loggedVisit'),h.note,h.leftWith?t('logLeft',{value:h.leftWith}):''].filter(Boolean);
   b.textContent=bits.join(' · ');row.append(a,b);return row;
 }));
 els.historyMore.hidden=history.length<=8;
 if(!els.historyMore.hidden)els.historyMore.textContent=historyExpanded?t('showRecentVisits'):t('showAllVisits',{count:history.length});
}
function closeEditor(){if(!els.id.value)map.setDraft(null,null);if(els.dialog.open)els.dialog.close();}
function saveVisit(e){
 e.preventDefault();const name=els.name.value.trim();if(!name){els.name.focus();return toast(t('nameRequired'));}const now=new Date().toISOString(),id=els.id.value||crypto.randomUUID(),old=state.visits.find(v=>v.id===id),status=els.visitStatus.value==='completed'?'completed':'active';
 const rec={id,name,reference:els.reference.value.trim(),address:els.address.value.trim(),notes:els.notes.value.trim(),phone:els.phone.value.trim(),leftWith:els.leftWith.value.trim(),nextTopic:els.nextTopic.value.trim(),dueDate:els.due.value||'',dueTime:els.dueTime.value||'',status,completedAt:status==='completed'?(old?.completedAt||now):null,history:old?.history||[],calendarSlot:old?.calendarSlot||'',calendarSeq:old?.calendarSeq||0,lat:Number(els.lat.value),lng:Number(els.lng.value),createdAt:old?.createdAt||now,updatedAt:now};
 if(rec.dueDate&&rec.status==='completed'){rec.status='active';rec.completedAt=null;}
 const scheduleChanged=Boolean(rec.dueDate)&&(!old||old.dueDate!==rec.dueDate||old.dueTime!==rec.dueTime);
 state.visits=old?state.visits.map(v=>v.id===id?rec:v):[...state.visits,rec];persist();closeEditor();clearPendingLocation();renderAll();toast(old?t('visitUpdated'):t('visitSaved'));
 runCalendarFlow(rec,{changed:scheduleChanged});
}
function currentVisit(){return state.visits.find(v=>v.id===els.id.value)||null;}

// ---------- Registrar visita ----------
function bindLog(){
 els.historyMore.addEventListener('click',()=>{historyExpanded=!historyExpanded;renderHistory(currentVisit());});
 els.logForm.addEventListener('submit',saveLog);
 $('closeLogBtn').addEventListener('click',closeLog);$('cancelLogBtn').addEventListener('click',closeLog);
 els.logDialog.addEventListener('cancel',e=>{e.preventDefault();closeLog();});
 els.logDialog.addEventListener('click',e=>{if(e.target===els.logDialog)closeLog();});
 document.querySelectorAll('[data-log-preset]').forEach(b=>b.addEventListener('click',()=>{const p=nextDatePresets(dateKey()).find(x=>x.id===b.dataset.logPreset);if(p){els.logDue.value=p.date;els.logEnd.checked=false;syncLogEnd();}markPreset('[data-log-preset]',b);}));
 els.logDue.addEventListener('input',()=>{markPreset('[data-log-preset]',null);if(els.logDue.value){els.logEnd.checked=false;syncLogEnd();}});
 els.logEnd.addEventListener('change',syncLogEnd);
}
function syncLogEnd(){const end=els.logEnd.checked;els.logForm.querySelector('.log-next').classList.toggle('is-ending',end);els.logDue.disabled=end;els.logTime.disabled=end;els.logForm.querySelectorAll('[data-log-preset]').forEach(b=>b.disabled=end);}
function openLog(id){
 const v=state.visits.find(x=>x.id===id);if(!v)return;logVisitId=id;els.logForm.reset();markPreset('[data-log-preset]',null);
 els.logName.textContent=[v.name,placeLine(v)].filter(Boolean).join(' · ');
 els.logLeftWith.value='';els.logNextTopic.value=v.nextTopic||'';els.logDue.value='';els.logTime.value=v.dueTime||'';els.logEnd.checked=false;syncLogEnd();
 if(!els.logDialog.open)els.logDialog.showModal();
 requestAnimationFrame(()=>{if(document.activeElement&&els.logForm.contains(document.activeElement))document.activeElement.blur();els.logForm.scrollTop=0;});
}
function closeLog(){logVisitId=null;if(els.logDialog.open)els.logDialog.close();}
function saveLog(e){
 e.preventDefault();const v=state.visits.find(x=>x.id===logVisitId);if(!v)return closeLog();
 const now=new Date().toISOString(),ended=els.logEnd.checked,note=els.logNote.value.trim(),left=els.logLeftWith.value.trim();
 const entry={completedAt:now,dueDate:v.dueDate||'',dueTime:v.dueTime||'',note,leftWith:left,ended};
 const next={...v,history:[...(v.history||[]),entry],leftWith:left||v.leftWith,nextTopic:els.logNextTopic.value.trim(),updatedAt:now};
 if(ended){Object.assign(next,{status:'completed',completedAt:now,dueDate:'',dueTime:''});}
 else{Object.assign(next,{status:'active',completedAt:null,dueDate:els.logDue.value||'',dueTime:els.logDue.value?(els.logTime.value||''):''});}
 state.visits=state.visits.map(x=>x.id===v.id?next:x);persist();closeLog();closeEditor();renderAll();
 if(ended)toast(t('visitEnded'));else if(next.dueDate)toast(t('visitLoggedNext',{when:`${shortDate(next.dueDate)}${next.dueTime?' '+formatTime(next.dueTime,locale()):''}`}));else toast(t('visitLogged'));
 runCalendarFlow(next,{changed:Boolean(next.dueDate)});
}

// ---------- Calendar reminders (instead of push notifications) ----------
function calendarDescription(v){return[v.nextTopic?`${t('nextTopic')}: ${v.nextTopic}`:'',v.leftWith?t('logLeft',{value:v.leftWith}):'',v.phone?`${t('phone')}: ${v.phone}`:''].filter(Boolean).join('\n');}
function addToCalendar(v){
 if(!v?.dueDate){toast(t('noDateForCalendar'));return;}
 const mode=state.settings.calendarMode==='auto'?(isIOSDevice()?'ics':'google'):state.settings.calendarMode;
 // calendarSeq = how many times this visit was sent; it is also the next ICS SEQUENCE to use.
 const seq=Math.max(0,Number(v.calendarSeq)||0);
 const opts={alarmMinutes:state.settings.reminderMinutes,description:calendarDescription(v),title:'Revisita',sequence:seq};
 try{
   if(mode==='google'){window.open(googleCalendarUrl(v,opts),'_blank','noopener');}
   else{
     const blob=new Blob([buildICS(v,opts)],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob);
     const a=document.createElement('a');a.href=url;a.download=`revisita-${(v.name||'visita').replace(/[^\wÀ-ſ-]+/g,'-').slice(0,40)}.ics`;document.body.append(a);a.click();a.remove();
     setTimeout(()=>URL.revokeObjectURL(url),60000);
   }
   // Remember which slot the phone calendar now holds, so a later reschedule can warn about the old event.
   setCalendarSlot(v.id,calendarSlot(v),seq+1);
   toast(t('calendarOpened'));
 }catch(err){console.warn('[Revisita] calendar hand-off failed',err);toast(t('noDateForCalendar'));}
}
function setCalendarSlot(id,slot,seq){
 // Device bookkeeping only: updatedAt is left alone so this does not count as an edit for sync.
 state.visits=state.visits.map(x=>x.id===id?{...x,calendarSlot:slot,calendarSeq:seq??x.calendarSeq??0}:x);persist(false);
}
function slotText(slot){const[d,tm]=String(slot).split(' ');return[shortDate(d),tm?formatTime(tm,locale()):''].filter(Boolean).join(' · ');}
let calendarFlowNext=null;
/**
 * After a visit is saved, logged, ended or deleted:
 * 1) if the phone calendar still holds an old slot for it, say so (a web app cannot delete calendar events);
 * 2) if it now has a new date, add it — asking once whether the user wants calendar reminders at all.
 * `visit` is the stored record; pass `{deleted:true, ...}` for a visit that no longer exists.
 */
function runCalendarFlow(visit,{force=false,changed=false}={}){
 if(!visit)return;
 const stale=staleCalendarSlot(visit,visit.deleted?null:visit);
 const needsAdd=!visit.deleted&&visit.status==='active'&&visit.dueDate&&(force||(changed&&calendarSlot(visit)!==visit.calendarSlot));
 const addStep=()=>{
   if(!needsAdd)return;
   const v=state.visits.find(x=>x.id===visit.id)||visit;
   if(force)return addToCalendar(v);
   if(!state.settings.calendarAsked){calendarFlowNext=v;$('calendarAskDialog').showModal();return;}
   if(state.settings.calendarOnSave)addToCalendar(v);
 };
 if(stale){
   if(!visit.deleted)setCalendarSlot(visit.id,'',visit.calendarSeq);
   $('calendarStaleText').textContent=t('calendarStaleText',{name:visit.name,when:slotText(stale)});
   calendarFlowNext=addStep;
   $('calendarStaleDialog').showModal();
   return;
 }
 addStep();
}
function bindCalendarDialogs(){
 const ask=$('calendarAskDialog'),stale=$('calendarStaleDialog');
 const answer=yes=>{state.settings.calendarAsked=true;state.settings.calendarOnSave=yes;persist(false);renderSettings();const v=calendarFlowNext;calendarFlowNext=null;ask.close();if(yes&&v)addToCalendar(v);};
 $('calendarAskYesBtn').addEventListener('click',()=>answer(true));
 $('calendarAskNoBtn').addEventListener('click',()=>answer(false));
 ask.addEventListener('cancel',()=>{calendarFlowNext=null;}); // Escape: skip this time, ask again next time.
 $('calendarStaleOkBtn').addEventListener('click',()=>{const next=calendarFlowNext;calendarFlowNext=null;stale.close();if(typeof next==='function')next();});
 stale.addEventListener('cancel',e=>{e.preventDefault();$('calendarStaleOkBtn').click();});
}
function openNewVisitChooser(){
 const d=$('newVisitDialog');
 if(!navigator.geolocation){showView('map');toast(t('tapMapOrLocation'));return;}
 if(d&&!d.open)d.showModal();
}
function deleteVisit(){const v=currentVisit();if(!v||!confirm(t('deleteVisitConfirm',{name:v.name})))return;state.visits=state.visits.filter(x=>x.id!==v.id);state.deleted={...(state.deleted||{}),[v.id]:new Date().toISOString()};persist();closeEditor();renderAll();toast(t('visitDeleted'));runCalendarFlow({...v,deleted:true});}
function showVisitOnMap(){const v=currentVisit();if(!v)return;closeEditor();mapMovedByUser=true;mapMode=v.status==='completed'?'all':'active';showView('map');syncMapModeButtons();renderMapMode(false);map.setView(v.lat,v.lng,17);}
async function shareVisit(){const v=currentVisit();if(!v)return;const url=mapLink(v),text=[v.name,placeLine(v),v.dueDate?t('scheduledFor',{value:`${shortDate(v.dueDate)}${v.dueTime?' '+formatTime(v.dueTime,locale()):''}`}):'',url].filter(Boolean).join('\n');try{if(navigator.share)await navigator.share({title:`Revisita: ${v.name}`,text});else window.open(whatsappUrl('',text),'_blank','noopener');}catch(e){if(e?.name!=='AbortError'){try{await navigator.clipboard.writeText(text);toast(t('copiedLocation'));}catch{toast(t('shareFailed'));}}}}

function bindList(){
 els.search.addEventListener('input',renderList);document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('is-active',x===b));ensureChipVisible(b);renderList();}));els.list.addEventListener('click',handleListAction);
}
function handleListAction(e){const b=e.target.closest('[data-open-visit]');if(b)openEditor(b.dataset.openVisit);}
function renderAll(){renderToday();renderList();renderMapMode(false);els.restore.hidden=!hasRecoverySnapshot();if(els.mapTip)els.mapTip.hidden=state.visits.length>0;}
function renderList(){
 const today=dateKey(),q=els.search.value.trim().toLowerCase();let visits=state.visits.filter(v=>{const bucket=visitBucket(v,today);if(filter==='active'&&v.status!=='active')return false;if(filter==='today'&&!['today','overdue'].includes(bucket))return false;if(filter==='upcoming'&&bucket!=='upcoming')return false;if(filter==='undated'&&bucket!=='undated')return false;if(filter==='completed'&&v.status!=='completed')return false;return!q||`${v.name} ${v.reference} ${v.address} ${v.notes} ${v.leftWith} ${v.nextTopic}`.toLowerCase().includes(q);}).sort(compareSchedule);
 if(filter==='completed')visits.sort((a,b)=>(b.completedAt||'').localeCompare(a.completedAt||''));
 els.summary.textContent=`${state.visits.filter(v=>v.status==='active').length} ${t('currentActive')} · ${state.visits.filter(v=>v.status==='completed').length} ${t('inHistory')}`;els.list.replaceChildren(...visits.map(visitCard));els.empty.hidden=visits.length!==0;els.list.hidden=visits.length===0;
}
function visitCard(v){
 const bucket=visitBucket(v),card=document.createElement('article');card.className=`visit-card card${v.status==='completed'?' completed':''}`;const body=document.createElement('div'),h=document.createElement('h3');h.textContent=v.name;body.append(h);const place=placeLine(v);if(place){const p=document.createElement('p');p.textContent=place;body.append(p);}if(v.notes){const p=document.createElement('p');p.className='note-preview';p.textContent=v.notes;body.append(p);}const meta=document.createElement('div');meta.className='visit-card-meta';if(v.status==='completed')meta.append(chip(t('done'),'done'));else if(bucket==='overdue')meta.append(chip(t('overdue'),'overdue'));if(v.dueDate)meta.append(chip(`${shortDate(v.dueDate)}${v.dueTime?' · '+formatTime(v.dueTime,locale()):''}`,'due'));if(currentLocation)meta.append(chip(formatDistance(haversineKm(currentLocation.lat,currentLocation.lng,v.lat,v.lng))));body.append(meta);const open=document.createElement('button');open.type='button';open.className='card-open';open.dataset.openVisit=v.id;open.setAttribute('aria-label',t('openVisitAria',{name:v.name}));open.textContent='›';card.append(body,open);return card;
}
function chip(text,extra=''){const s=document.createElement('span');s.className=`mini-chip ${extra}`.trim();s.textContent=text;return s;}
function shortDate(k){if(!k)return'';const[y,m,d]=k.split('-').map(Number);return new Intl.DateTimeFormat(locale(),{day:'numeric',month:'short'}).format(new Date(y,m-1,d));}

function bindPolishUI(){
 els.fab?.addEventListener('click',openNewVisitChooser);
 $('nextVisitLogBtn')?.addEventListener('click',()=>{if(nextVisitId)openLog(nextVisitId);});
 const nd=$('newVisitDialog');
 $('closeNewVisitBtn')?.addEventListener('click',()=>nd.close());
 nd?.addEventListener('click',e=>{if(e.target===nd)nd.close();});
 $('newHereBtn')?.addEventListener('click',()=>{nd.close();showView('map');requestLocation(loc=>beginLocationConfirmation({...loc,source:'gps'}),true);});
 $('newOnMapBtn')?.addEventListener('click',()=>{nd.close();showView('map');toast(t('newOnMapHint'));});
 bindCalendarDialogs();
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
// ---------- Offline zone (pre-cache the visible area; OSM tile policy: < 250 tiles at z13+) ----------
const ZONE_CACHE='revisita-zones-v1';
async function saveOfflineZone(){
 if(zoneSaving)return;
 if(!navigator.onLine||!('caches'in window)){toast(t('zoneOffline'));return;}
 const w=els.mapEl.clientWidth,h=els.mapEl.clientHeight;
 const nw=map.screenToLatLng(0,0),se=map.screenToLatLng(w,h);
 const base=Math.max(14,Math.min(map.zoom,17));
 const urls=zoneTileUrls({north:nw.lat,west:nw.lng,south:se.lat,east:se.lng},[base,base+1,base+2].filter(z=>z<=18));
 if(!urls.length){toast(t('zoneZoomIn'));return;}
 zoneSaving=true;updateOnline();const label=els.zoneBtn.querySelector('[data-i18n]')||els.zoneBtn;const original=label.textContent;
 let done=0,failed=0;
 try{
   const cache=await caches.open(ZONE_CACHE);
   const queue=[...urls];
   const worker=async()=>{while(queue.length){const url=queue.shift();try{if(!(await cache.match(url))){const r=await fetch(url,{mode:'cors'});if(r.ok)await cache.put(url,r);else failed++;}}catch{failed++;}done++;label.textContent=t('zoneSaving',{done,total:urls.length});}};
   await Promise.all([worker(),worker()]);
    toast(failed?t('zoneFailed'):t('zoneSaved',{count:urls.length}));
 }catch(e){console.warn('[Revisita] zone cache failed',e);toast(t('zoneFailed'));}
 finally{zoneSaving=false;label.textContent=original;updateOnline();}
}

// ---------- Settings ----------
function bindSettings(){
 $('calendarOnSaveToggle')?.addEventListener('change',e=>{state.settings.calendarOnSave=e.target.checked;state.settings.calendarAsked=true;persist(false);});
 $('reminderMinutesSelect')?.addEventListener('change',e=>{state.settings.reminderMinutes=Number(e.target.value)||0;persist(false);});
 $('calendarModeSelect')?.addEventListener('change',e=>{state.settings.calendarMode=e.target.value;persist(false);});
 $('navAppSelect')?.addEventListener('change',e=>{state.settings.navApp=e.target.value;persist(false);});
}
function renderSettings(){
 const s=state.settings;
 const set=(id,prop,val)=>{const el=$(id);if(el)el[prop]=val;};
 set('calendarOnSaveToggle','checked',s.calendarOnSave===true);
 set('reminderMinutesSelect','value',String(s.reminderMinutes??30));
 set('calendarModeSelect','value',s.calendarMode||'auto');
 set('navAppSelect','value',s.navApp||'ask');
 const apple=document.querySelector('#navAppSelect option[value="apple"]');if(apple)apple.hidden=!isIOSDevice();
}

// ---------- Cloud sync ----------
function bindCloud(){
 cloud=createCloudSync({
   getState:()=>state,
   normalizeVisit,
   applyMerged:(visits,deleted)=>{state.visits=visits.map(normalizeVisit).filter(Boolean);state.deleted=deleted||{};persist(false);renderAll();},
   onChange:renderCloud,
 });
 const email=$('cloudEmail'),pass=$('cloudPassword');
 const need=()=>{if(!email.value.trim()||!pass.value){setCloudStatus(t('cloudNeedEmail'));return false;}return true;};
 const run=async(fn,okMsg)=>{setCloudStatus(t('cloudLoading'));try{await fn();pass.value='';if(okMsg)setCloudStatus(okMsg);}catch(e){setCloudStatus(t('cloudError',{message:friendlyAuthError(e)}));}};
 $('cloudSignInBtn').addEventListener('click',()=>{if(need())run(()=>cloud.signIn(email.value,pass.value));});
 $('cloudSignUpBtn').addEventListener('click',()=>{if(need())run(()=>cloud.signUp(email.value,pass.value));});
 $('cloudResetBtn').addEventListener('click',()=>{if(!email.value.trim()){setCloudStatus(t('cloudNeedEmail'));return;}run(()=>cloud.resetPassword(email.value),t('cloudResetSent'));});
 $('cloudSyncBtn').addEventListener('click',()=>cloud.syncNow());
 $('cloudSignOutBtn').addEventListener('click',()=>run(()=>cloud.signOut(),t('cloudSignedOutMsg')));
 document.querySelector('[data-destination="more"]')?.addEventListener('click',()=>{if(navigator.onLine)cloud.init({force:true});});
}
function friendlyAuthError(e){const c=String(e?.code||e?.message||e);if(/invalid-credential|wrong-password|user-not-found/.test(c))return getLanguage()==='en'?'wrong email or password':'correo o contraseña incorrectos';if(/email-already-in-use/.test(c))return getLanguage()==='en'?'that email already has an account — use Sign in':'ese correo ya tiene cuenta — usa Entrar';if(/weak-password/.test(c))return getLanguage()==='en'?'password needs at least 6 characters':'la contraseña necesita al menos 6 caracteres';if(/network|Failed to fetch|dynamically imported/i.test(c))return t('cloudOffline');return c;}
function setCloudStatus(text){const el=$('cloudStatus');if(el)el.textContent=text||'';}
function renderCloud(info){
 const signedIn=Boolean(info.user);
 $('cloudSignedOut').hidden=signedIn;$('cloudSignedIn').hidden=!signedIn;
 if(signedIn)$('cloudUser').textContent=t('cloudSignedInAs',{email:info.user.email||'—'});
 const privacy=$('privacyText');if(privacy){privacy.dataset.i18n=signedIn?'privacyTextSynced':'privacyText';privacy.textContent=t(privacy.dataset.i18n);}
 $('cloudLastSync').textContent=info.lastSync?t('cloudLastSync',{time:new Intl.DateTimeFormat(locale(),{dateStyle:'medium',timeStyle:'short'}).format(new Date(info.lastSync))}):t('cloudNever');
 const msg={syncing:t('cloudSyncing'),synced:t('cloudSynced'),offline:t('cloudOffline'),loading:t('cloudLoading'),error:t('cloudError',{message:friendlyAuthError({code:info.message})})}[info.status];
 if(msg!==undefined)setCloudStatus(msg);else if(!info.status)setCloudStatus('');
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
 $('exportBtn').addEventListener('click',exportBackup);$('importBtn').addEventListener('click',()=>els.importFile.click());els.importFile.addEventListener('change',importFile);$('closeImportBtn').addEventListener('click',closeImport);$('cancelImportBtn').addEventListener('click',closeImport);$('confirmImportBtn').addEventListener('click',confirmImport);els.restore.addEventListener('click',restoreSnapshot);$('deleteAllBtn').addEventListener('click',deleteAll);$('reloadAppBtn').addEventListener('click',applyServiceWorkerUpdate);
}
function applyTheme(theme){document.documentElement.dataset.theme=theme==='light'?'light':'dark';document.querySelector('meta[name="theme-color"]').content=theme==='light'?'#eaf0f5':'#102d49';syncThemeButtons();}
function syncThemeButtons(){document.querySelectorAll('[data-theme-choice]').forEach(b=>b.classList.toggle('is-active',b.dataset.themeChoice===document.documentElement.dataset.theme));}
function exportBackup(){const blob=new Blob([JSON.stringify(exportPayload(state),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`revisita-copia-${dateKey()}.json`;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);toast(t('backupExported'));}
async function importFile(){const f=els.importFile.files?.[0];els.importFile.value='';if(!f)return;try{pendingImport=validateImportPayload(JSON.parse(await f.text()));const p=previewImport(state,pendingImport);els.importPreview.replaceChildren(row(t('importCount'),p.imported),row(t('newRecords'),p.newRecords),row(t('conflicts'),p.conflicts),row(t('currentSaved'),p.localBefore));els.importDialog.showModal();}catch(e){showError(t('importFailed'),e.message||String(e));}}
function row(label,value){const r=document.createElement('div');r.className='preview-row';const l=document.createElement('span');l.textContent=label;const v=document.createElement('strong');v.className='num';v.textContent=value;r.append(l,v);return r;}
function confirmImport(){if(!pendingImport)return;try{state=applyImport(state,pendingImport);pendingImport=null;closeImport();applyTheme(state.settings.theme);renderAll();toast(t('importFinished'));}catch(e){showError(t('importApplyFailed'),e.message||String(e));}}
function closeImport(){pendingImport=null;if(els.importDialog.open)els.importDialog.close();}
function restoreSnapshot(){if(!confirm(t('restoreConfirm')))return;try{state=restoreRecoverySnapshot();applyTheme(state.settings.theme);renderAll();toast(t('restored'));}catch(e){showError(t('restoreFailed'),e.message||String(e));}}
function deleteAll(){if(!state.visits.length)return toast(t('noVisitsDelete'));if(!confirm(t('deleteAllConfirm',{count:state.visits.length})))return;const now=new Date().toISOString();state.deleted={...(state.deleted||{})};state.visits.forEach(v=>{state.deleted[v.id]=now;});state.visits=[];persist();renderAll();toast(t('allDeleted'));}

function persist(announce=true){try{saveState(state);setStatus(navigator.onLine?t('savedCheck'):t('offline'),navigator.onLine?'success':'warn',announce);if(announce)cloud?.schedule();}catch(e){setStatus(t('saveFailed'),'danger');showError(t('errorSave'),e.message||String(e));}}
function setStatus(text,kind='success',announce=true){els.status.textContent=text;const c=kind==='danger'?'error':kind==='warn'?'warning':kind==='info'?'info':'success';els.status.style.color=`var(--color-${c})`;els.status.style.borderColor=`var(--border-${c}-soft)`;els.status.style.background=`var(--color-${c}-soft)`;els.status.setAttribute('aria-live',announce?'polite':'off');}
function updateOnline(){setStatus(navigator.onLine?t('savedCheck'):t('offline'),navigator.onLine?'success':'warn');if(els.zoneBtn)els.zoneBtn.disabled=!navigator.onLine||zoneSaving;}
function toast(message){const d=document.createElement('div');d.className='toast';d.textContent=message;els.toast.append(d);setTimeout(()=>d.remove(),3200);}
function showError(type,message){const box=$('errorBoundary');box.replaceChildren();const s=document.createElement('strong');s.textContent=type,p=document.createElement('div');p.textContent=message;const b=document.createElement('button');b.type='button';b.className='btn btn-secondary';b.textContent=t('close');b.style.marginTop='8px';b.onclick=()=>box.hidden=true;box.append(s,p,b);box.hidden=false;}
function isSafeForServiceWorkerReload(){
 if(pendingLocation)return false;
 if(document.querySelector('dialog[open]'))return false;
 const focused=document.activeElement;
 if(focused&&['INPUT','TEXTAREA','SELECT'].includes(focused.tagName))return false;
 return true;
}
function showServiceWorkerUpdate(){
 if(els.update)els.update.hidden=false;
}
function reloadForServiceWorkerUpdate(){
 if(swReloading)return;
 swReloading=true;
 location.reload();
}
async function checkServiceWorkerForUpdate(force=false){
 if(!swRegistration)return false;
 const now=Date.now();
 if(!force&&now-swLastUpdateCheck<10*60*1000)return false;
 swLastUpdateCheck=now;
 try{
   await swRegistration.update();
   return true;
 }catch(e){
   console.warn('[Revisita SW] Update check failed.',e);
   return false;
 }
}
function applyServiceWorkerUpdate(){
 if(els.update)els.update.hidden=true;
 if(swRegistration?.waiting){
   swRegistration.waiting.postMessage({type:'SKIP_WAITING'});
   return;
 }
 reloadForServiceWorkerUpdate();
}
async function registerSW(){
 if(!('serviceWorker'in navigator))return;
 const initiallyControlled=Boolean(navigator.serviceWorker.controller);
 try{
   swRegistration=await navigator.serviceWorker.register('./sw.js?v=1.4.4',{scope:'./',updateViaCache:'none'});
   if(swRegistration.waiting&&navigator.serviceWorker.controller){
     if(isSafeForServiceWorkerReload())swRegistration.waiting.postMessage({type:'SKIP_WAITING'});
     else showServiceWorkerUpdate();
   }
   swRegistration.addEventListener('updatefound',()=>{
     const worker=swRegistration.installing;
     if(!worker)return;
     worker.addEventListener('statechange',()=>{
       if(worker.state!=='installed'||!navigator.serviceWorker.controller)return;
       if(isSafeForServiceWorkerReload()){
         if(swRegistration.waiting)swRegistration.waiting.postMessage({type:'SKIP_WAITING'});
       }else{
         showServiceWorkerUpdate();
       }
     });
   });
   navigator.serviceWorker.addEventListener('controllerchange',()=>{
     if(!initiallyControlled)return;
     if(isSafeForServiceWorkerReload())reloadForServiceWorkerUpdate();
     else showServiceWorkerUpdate();
   });
   navigator.serviceWorker.addEventListener('message',event=>{
     if(event.data?.type!=='RELOAD_READY'||!initiallyControlled)return;
     if(isSafeForServiceWorkerReload())reloadForServiceWorkerUpdate();
     else showServiceWorkerUpdate();
   });
   await checkServiceWorkerForUpdate(true);
   document.addEventListener('visibilitychange',()=>{
     if(!document.hidden)checkServiceWorkerForUpdate();
   });
 }catch(e){
   console.warn('[Revisita SW] Registration failed.',e);
 }
}
