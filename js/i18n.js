const STORAGE_KEY = 'revisita.lang';

const STRINGS = {
  es: {
    skip:'Ir al contenido', updateAvailable:'Hay una actualización disponible.', update:'Actualizar', close:'Cerrar', mainNav:'Navegación principal', mapModes:'Modos del mapa', filterVisits:'Filtrar revisitas', swipeMoreOptions:'Desliza o toca para ver más opciones', swipeMoreFilters:'Desliza o toca para ver más filtros', zoomIn:'Acercar', zoomOut:'Alejar', mapAria:'Mapa de revisitas', mapControls:'Controles del mapa', searchVisitsAria:'Buscar revisitas', themeAria:'Tema', languageAria:'Idioma', unknownError:'Error desconocido', returnLabel:'Volver', openVisitAria:'Abrir revisita {name}',
    brandSubtitle:'Mapa de revisitas', save:'Guardar', savedLocally:'Guardado localmente', offline:'Sin conexión', searchingLocation:'Buscando ubicación…',
    today:'Hoy', newVisit:'Nueva', overdue:'Atrasadas', forToday:'Para hoy', doneToday:'Hechas hoy', attention:'Atención',
    orderedByTime:'Ordenadas por hora', allCaughtUp:'Todo al día', noTodayTasks:'No tienes revisitas atrasadas ni programadas para hoy.', viewActiveMap:'Ver mapa de activas',
    map:'Mapa', mapSubtitle:'Visualiza tus revisitas y confirma cada ubicación antes de guardarla.', active:'Activas', upcoming:'Próximas', all:'Todas', nearby:'Cerca de mí',
    swipeMore:'Desliza para ver más', mapTiles:'Los mosaicos aparecen cuando hay conexión.', useLocation:'Usar mi ubicación',
    confirmLocationTitle:'¿Es esta la ubicación correcta?', searchingAddress:'Buscando dirección aproximada…', cancel:'Cancelar', adjustLocation:'Ajustar ubicación', confirmLocation:'Confirmar ubicación',
    confirmTipTitle:'Primero confirma:', confirmTip:'al tocar el mapa aparece un pin provisional. Puedes tocar otro punto antes de confirmarlo.',
    visits:'Revisitas', searchPlaceholder:'Buscar por nombre, dirección o nota', undated:'Sin fecha', history:'Historial',
    noVisits:'No hay revisitas aquí', noVisitsText:'Guarda una ubicación desde el mapa para verla en esta lista.', goMap:'Ir al mapa',
    more:'Más', moreSubtitle:'Instalación, apariencia, idioma y copias de seguridad.', installApp:'Instalar la app',
    installText:'Úsala como una app normal desde la pantalla de inicio.', installRevisita:'Instalar Revisita',
    installHint:'Si ya está instalada, este botón puede no aparecer disponible.', appearance:'Apariencia', theme:'Tema', themeHelp:'Elige cómo quieres ver Revisita.', dark:'Oscuro', light:'Claro',
    language:'Idioma', languageHelp:'Puedes cambiar el idioma en cualquier momento.', spanish:'Español', english:'English',
    backup:'Copia de seguridad', backupText:'Exporta tus revisitas para guardarlas o pasarlas a otro teléfono.', exportBackup:'Exportar copia', importBackup:'Importar copia', restorePrevious:'Restaurar copia anterior',
    privacy:'Privacidad', privacyText:'Las revisitas y notas se guardan solamente en este dispositivo. El mapa y la búsqueda de dirección usan servicios públicos de OpenStreetMap cuando hay conexión.',
    privacyTip:'Guarda únicamente la información necesaria para la revisita.', data:'Datos', deleteAll:'Borrar todas las revisitas',
    navToday:'Hoy', navMap:'Mapa', navVisits:'Revisitas', navMore:'Más',
    newVisitTitle:'Nueva revisita', visitTitle:'Revisita', locationPreview:'Vista previa de la ubicación', openGoogleMaps:'Abrir en Google Maps',
    nameReference:'Nombre o referencia', namePlaceholder:'Ej.: Casa azul, familia Pérez', approximateAddress:'Dirección aproximada', addressPlaceholder:'Se puede completar automáticamente', search:'Buscar',
    notes:'Notas', notesPlaceholder:'Qué hablaron, qué recordar, mejor horario…', returnDate:'Volver el', returnTime:'Hora de volver',
    markDone:'Marcar como hecha', reschedule:'Reprogramar', reactivateReschedule:'Reactivar y reprogramar', viewMap:'Ver en mapa', googleMaps:'Google Maps', share:'Compartir',
    deleteVisit:'Eliminar revisita', saveVisit:'Guardar revisita', importReview:'Revisar importación', importReviewText:'Confirma antes de cambiar tus datos.',
    importPolicyTitle:'Política:', importPolicy:'se combinan registros por ID. Si un ID ya existe, la copia importada lo reemplaza. Antes de aplicar, se crea una copia local de recuperación.',
    importVisits:'Importar revisitas',
    mapSummaryToday:'hoy y atrasadas', mapSummaryActive:'activas', mapSummaryUpcoming:'próximas', mapSummaryAll:'todas', mapSummaryNearby:'activas a 5 km de ti',
    visitsSingular:'revisita', visitsPlural:'revisitas', noTime:'Sin hora', tomorrow:'Mañana', done:'Hecha',
    currentActive:'activas', inHistory:'en historial', locationNoAddress:'No se encontró una dirección aproximada.', offlineVerifyPin:'Sin conexión: verifica el pin en el mapa.',
    gpsAccuracy:'Precisión GPS aproximada: ±{meters} m', tapAnother:'Toca otro punto del mapa para mover el pin.',
    gpsUnsupported:'Este dispositivo no ofrece ubicación GPS.', allowLocation:'Permite el acceso a la ubicación para usar el GPS.', locationUnavailable:'No se pudo determinar la ubicación.', locationTimeout:'La ubicación tardó demasiado. Inténtalo otra vez.',
    locationFailed:'No se pudo obtener la ubicación.', tapMapOrLocation:'Toca el mapa o usa tu ubicación actual.', languageChanged:'Idioma cambiado a español.', locationNotSaved:'Esa ubicación todavía no está guardada. Confirma la ubicación primero.',
    everythingSaved:'Todo está guardado en este dispositivo.', nameRequired:'Escribe un nombre o referencia.', visitUpdated:'Revisita actualizada.', visitSaved:'Revisita guardada.',
    markDoneConfirm:'¿Marcar “{name}” como hecha?', visitMarkedDone:'Revisita marcada como hecha.', deleteVisitConfirm:'¿Eliminar la revisita “{name}”? Esta acción no se puede deshacer.', visitDeleted:'Revisita eliminada.',
    chooseNewSchedule:'Elige la nueva fecha y hora, luego guarda.', copiedLocation:'Ubicación copiada al portapapeles.', shareFailed:'No se pudo compartir la ubicación.',
    noAddressNow:'No se pudo encontrar la dirección ahora.', noConnectionAddress:'Necesitas conexión para buscar la dirección.',
    noVisitsDelete:'No hay revisitas para borrar.', deleteAllConfirm:'¿Borrar las {count} revisitas guardadas? Esta acción no se puede deshacer.', allDeleted:'Se borraron todas las revisitas.',
    backupExported:'Copia exportada.', importFinished:'Importación terminada. La copia anterior quedó disponible para restaurar.',
    restoreConfirm:'¿Restaurar la copia local creada antes de la última importación?', restored:'Copia anterior restaurada.',
    importCount:'Revisitas en la copia', newRecords:'Nuevas', conflicts:'Coincidencias por ID', currentSaved:'Guardadas actualmente',
    appInstalled:'Revisita se instaló correctamente.', installReady:'Lista para instalarse en este dispositivo.', installed:'Revisita quedó instalada.',
    errorApp:'Error de la app', errorSave:'Error al guardar', saveFailed:'No se pudo guardar', importFailed:'No se pudo importar', importApplyFailed:'No se pudo aplicar la importación', restoreFailed:'No se pudo restaurar',
    completedVisit:'Visita completada', scheduled:'Programada: {value}', open:'Abrir'
  },
  en: {
    skip:'Skip to content', updateAvailable:'An update is available.', update:'Update', close:'Close', mainNav:'Main navigation', mapModes:'Map modes', filterVisits:'Filter return visits', swipeMoreOptions:'Swipe or tap to see more options', swipeMoreFilters:'Swipe or tap to see more filters', zoomIn:'Zoom in', zoomOut:'Zoom out', mapAria:'Return visit map', mapControls:'Map controls', searchVisitsAria:'Search return visits', themeAria:'Theme', languageAria:'Language', unknownError:'Unknown error', returnLabel:'Return', openVisitAria:'Open return visit {name}',
    brandSubtitle:'Return visit map', save:'Save', savedLocally:'Saved locally', offline:'Offline', searchingLocation:'Finding location…',
    today:'Today', newVisit:'New', overdue:'Overdue', forToday:'For today', doneToday:'Done today', attention:'Attention',
    orderedByTime:'Ordered by time', allCaughtUp:'All caught up', noTodayTasks:'You have no overdue return visits or visits scheduled for today.', viewActiveMap:'View active map',
    map:'Map', mapSubtitle:'See your return visits and confirm each location before saving it.', active:'Active', upcoming:'Upcoming', all:'All', nearby:'Near me',
    swipeMore:'Swipe to see more', mapTiles:'Map tiles appear when you are online.', useLocation:'Use my location',
    confirmLocationTitle:'Is this the correct location?', searchingAddress:'Finding approximate address…', cancel:'Cancel', adjustLocation:'Adjust location', confirmLocation:'Confirm location',
    confirmTipTitle:'Confirm first:', confirmTip:'tapping the map creates a temporary pin. You can tap another point before confirming it.',
    visits:'Return visits', searchPlaceholder:'Search by name, address, or note', undated:'No date', history:'History',
    noVisits:'No return visits here', noVisitsText:'Save a location from the map to see it in this list.', goMap:'Go to map',
    more:'More', moreSubtitle:'Installation, appearance, language, and backups.', installApp:'Install the app',
    installText:'Use it like a normal app from your home screen.', installRevisita:'Install Revisita',
    installHint:'If it is already installed, this button may not be available.', appearance:'Appearance', theme:'Theme', themeHelp:'Choose how you want Revisita to look.', dark:'Dark', light:'Light',
    language:'Language', languageHelp:'You can change the language at any time.', spanish:'Español', english:'English',
    backup:'Backup', backupText:'Export your return visits to keep them safe or move them to another phone.', exportBackup:'Export backup', importBackup:'Import backup', restorePrevious:'Restore previous backup',
    privacy:'Privacy', privacyText:'Return visits and notes are stored only on this device. The map and approximate-address lookup use public OpenStreetMap services while online.',
    privacyTip:'Save only the information needed for the return visit.', data:'Data', deleteAll:'Delete all return visits',
    navToday:'Today', navMap:'Map', navVisits:'Visits', navMore:'More',
    newVisitTitle:'New return visit', visitTitle:'Return visit', locationPreview:'Location preview', openGoogleMaps:'Open in Google Maps',
    nameReference:'Name or reference', namePlaceholder:'Example: Blue house, Pérez family', approximateAddress:'Approximate address', addressPlaceholder:'Can be filled automatically', search:'Search',
    notes:'Notes', notesPlaceholder:'What you discussed, what to remember, best time…', returnDate:'Return on', returnTime:'Return time',
    markDone:'Mark done', reschedule:'Reschedule', reactivateReschedule:'Reactivate and reschedule', viewMap:'View on map', googleMaps:'Google Maps', share:'Share',
    deleteVisit:'Delete return visit', saveVisit:'Save return visit', importReview:'Review import', importReviewText:'Confirm before changing your data.',
    importPolicyTitle:'Policy:', importPolicy:'records are merged by ID. If an ID already exists, the imported copy replaces it. A local recovery snapshot is created before applying.',
    importVisits:'Import return visits',
    mapSummaryToday:'today and overdue', mapSummaryActive:'active', mapSummaryUpcoming:'upcoming', mapSummaryAll:'total', mapSummaryNearby:'active within 5 km of you',
    visitsSingular:'return visit', visitsPlural:'return visits', noTime:'No time', tomorrow:'Tomorrow', done:'Done',
    currentActive:'active', inHistory:'in history', locationNoAddress:'No approximate address was found.', offlineVerifyPin:'Offline: verify the pin on the map.',
    gpsAccuracy:'Approximate GPS accuracy: ±{meters} m', tapAnother:'Tap another point on the map to move the pin.',
    gpsUnsupported:'This device does not provide GPS location.', allowLocation:'Allow location access to use GPS.', locationUnavailable:'Your location could not be determined.', locationTimeout:'Location took too long. Try again.',
    locationFailed:'Could not get your location.', tapMapOrLocation:'Tap the map or use your current location.', languageChanged:'Language changed to English.', locationNotSaved:'That location has not been saved yet. Confirm the location first.',
    everythingSaved:'Everything is saved on this device.', nameRequired:'Enter a name or reference.', visitUpdated:'Return visit updated.', visitSaved:'Return visit saved.',
    markDoneConfirm:'Mark “{name}” as done?', visitMarkedDone:'Return visit marked done.', deleteVisitConfirm:'Delete “{name}”? This cannot be undone.', visitDeleted:'Return visit deleted.',
    chooseNewSchedule:'Choose the new date and time, then save.', copiedLocation:'Location copied to the clipboard.', shareFailed:'Could not share the location.',
    noAddressNow:'Could not find the address right now.', noConnectionAddress:'You need a connection to look up the address.',
    noVisitsDelete:'There are no return visits to delete.', deleteAllConfirm:'Delete all {count} saved return visits? This cannot be undone.', allDeleted:'All return visits were deleted.',
    backupExported:'Backup exported.', importFinished:'Import complete. The previous local copy is available to restore.',
    restoreConfirm:'Restore the local copy created before the last import?', restored:'Previous copy restored.',
    importCount:'Return visits in backup', newRecords:'New', conflicts:'Matching IDs', currentSaved:'Currently saved',
    appInstalled:'Revisita was installed successfully.', installReady:'Ready to install on this device.', installed:'Revisita is installed.',
    errorApp:'App error', errorSave:'Save error', saveFailed:'Could not save', importFailed:'Could not import', importApplyFailed:'Could not apply the import', restoreFailed:'Could not restore',
    completedVisit:'Visit completed', scheduled:'Scheduled: {value}', open:'Open'
  }
};

let current = 'es';

function storageGet(){
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function storageSet(value){
  try { localStorage.setItem(STORAGE_KEY,value); } catch {}
}
function interpolate(text,vars={}){
  return String(text).replace(/\{(\w+)\}/g,(_,key)=>vars[key]??`{${key}}`);
}
export function t(key,vars={},lang=current){
  return interpolate(STRINGS[lang]?.[key] ?? STRINGS.es[key] ?? key,vars);
}
export function getLanguage(){ return current; }
export function locale(){ return current==='en'?'en-US':'es-DO'; }
export function applyTranslations(root=document){
  if(!root?.querySelectorAll)return;
  document.documentElement.lang=current;
  root.querySelectorAll('[data-i18n]').forEach(el=>{ const key=el.dataset.i18n; if(key) el.textContent=t(key); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{ const key=el.dataset.i18nPlaceholder; if(key) el.placeholder=t(key); });
  root.querySelectorAll('[data-i18n-aria]').forEach(el=>{ const key=el.dataset.i18nAria; if(key) el.setAttribute('aria-label',t(key)); });
  root.querySelectorAll('[data-lang-choice]').forEach(el=>el.classList.toggle('is-active',el.dataset.langChoice===current));
}
export function setLanguage(lang,{persist=true,notify=true}={}){
  if(!STRINGS[lang])return;
  current=lang;
  if(persist)storageSet(lang);
  if(typeof document!=='undefined')applyTranslations(document);
  if(notify&&typeof window!=='undefined')window.dispatchEvent(new CustomEvent('revisita:language',{detail:{language:lang}}));
}
export function initLanguage(){
  const saved=storageGet();
  current=STRINGS[saved]?saved:'es';
  if(typeof document!=='undefined')applyTranslations(document);
  return current;
}
