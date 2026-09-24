const STORAGE_KEY = 'revisita.lang';

const STRINGS = {
  es: {
    nameLabel:'Nombre', upcomingDays:'Próximos días', upcomingDaysHint:'Los próximos 7 días', newWhereTitle:'¿Dónde está la casa?', newHere:'Aquí — mi ubicación', newHereHint:'Estás frente a la casa ahora.', newOnMap:'Elegir en el mapa', newOnMapHint:'Toca el lugar en el mapa.',
    calendarAskTitle:'¿Añadir al calendario?', calendarAskText:'Revisita puede poner esta visita en el calendario de tu teléfono con una alarma. Puedes cambiarlo luego en Más → Recordatorios.', calendarAskYes:'Sí, añadir siempre', calendarAskNo:'No, gracias',
    calendarStaleTitle:'Borra el aviso anterior', calendarStaleText:'Tu calendario todavía tiene a «{name}» para el {when}; Revisita no puede borrar ese aviso. Ábrelo en tu calendario y elimínalo para no recibir una alarma equivocada.', calendarStaleOk:'Entendido',
    privacyTextSynced:'Las revisitas y notas se guardan en este dispositivo y en tu cuenta KHub (sincronización activada). Solo tú puedes leerlas. El mapa y la búsqueda de dirección usan servicios públicos de OpenStreetMap cuando hay conexión.',
    savedCheck:'Guardado ✓', saveZone:'Guardar zona', nearbyShort:'Cerca', logVisit:'Registrar visita', call:'Llamar', addToCalendar:'Calendario', addToCalendarBtn:'Añadir al calendario', setReminderBtn:'Poner aviso', needDateTimeForReminder:'Pon fecha y hora para crear el aviso.', reminderSet:'Aviso activo. Te avisaremos 5 minutos antes.', edit:'Editar',
    reference:'Referencia (cómo encontrar la casa)', referencePlaceholder:'Ej.: casa verde frente al colmado, segundo piso', quickDates:'Fechas rápidas', inOneWeek:'+1 semana', inTwoWeeks:'+2 semanas', inOneMonth:'+1 mes',
    moreDetails:'Más detalles (opcional)', phone:'Teléfono / WhatsApp', phonePlaceholder:'Ej.: 809-555-1234', leftWith:'Qué le dejaste', leftWithPlaceholder:'Ej.: revista, folleto, video', nextTopic:'Tema para la próxima vez', nextTopicPlaceholder:'Pregunta o tema pendiente',
    calendarHint:'Al guardar con fecha se añadirá a tu calendario con recordatorio.', logNote:'¿Qué conversaron?', logNotePlaceholder:'Tema, reacción, qué quedó pendiente…', whenReturn:'¿Cuándo vuelves?', endVisit:'No volver — pasar al historial', saveLog:'Guardar visita',
    chooseNavApp:'Elige la app de navegación.', rememberChoice:'Recordar mi elección', remindersTitle:'Recordatorios', remindersText:'Revisita puede usar el calendario de tu teléfono para avisarte. Si lo activas, al guardar una revisita con fecha se abre el calendario para añadirla con una alarma.',
    calendarOnSave:'Añadir al calendario al guardar', reminderLead:'Avisarme antes', atTime:'A la hora', calendarApp:'Calendario', calendarAuto:'Automático (iPhone: Calendario · Android: Google Calendar)', calendarIcs:'Archivo de calendario (.ics)',
    visitTimeZoneHint:'La fecha y hora nuevas usan y conservan la zona de este dispositivo. Al reprogramar se usa la zona actual.', invalidVisitTime:'Esa hora no existe en esta fecha y zona (cambio de horario). Elige otra hora.', pushSyncing:'Sincronizando avisos…', pushSynced:'Avisos sincronizados. Ya puedes cerrar la app.', pushSyncFailed:'Avisos pendientes: conecta y mantén la app abierta hasta sincronizar. El aviso anterior podría seguir activo.',
    pushDescription:'Activa avisos en este dispositivo para recibir una notificación 5 minutos antes de cada revisita con hora, incluso con la app cerrada. Se envían el nombre y la hora al servicio de avisos. La entrega puede variar ligeramente; espera la confirmación de sincronización antes de cerrar.', enablePush:'Activar avisos', disablePush:'Desactivar avisos', testPush:'Probar aviso', pushEnabled:'Avisos activos en este dispositivo.', pushDisabled:'Avisos desactivados.', pushUnsupported:'Este navegador no admite avisos.', pushHomeScreen:'En iPhone, abre Revisita desde el icono de la pantalla de inicio.', pushPermission:'Permite las notificaciones en el dispositivo.', pushUnavailable:'El servicio de avisos aún no está disponible.', pushFailed:'No se pudieron configurar los avisos. Inténtalo de nuevo con conexión.', pushTestSent:'Aviso de prueba enviado.',
    navAppTitle:'Navegación', navAppLabel:'Abrir “Cómo llegar” con', askEachTime:'Preguntar cada vez',
    cloudTitle:'Sincronizar entre dispositivos', cloudText:'Opcional. Usa tu cuenta KHub (la misma de tus otras apps) para tener tus revisitas en el teléfono y la tableta.', email:'Correo', password:'Contraseña', signIn:'Entrar', createAccount:'Crear cuenta', forgotPassword:'Olvidé mi contraseña', syncNow:'Sincronizar ahora', signOut:'Cerrar sesión', cloudPrivacy:'Solo tú puedes leer tus datos en la nube. Guarda únicamente lo necesario para la revisita.',
    visitLogged:'Visita registrada.', visitLoggedNext:'Visita registrada — próxima: {when}', visitEnded:'Revisita pasada al historial.', calendarOpened:'Confirma en el calendario para guardar el recordatorio.', noDateForCalendar:'Primero programa una fecha para volver.', reactivate:'Reactivar',
    zoneSaving:'Guardando zona… {done}/{total}', zoneSaved:'Zona guardada para usar sin conexión ({count} mosaicos).', zoneOffline:'Conéctate a internet para guardar la zona.', zoneFailed:'No se pudo guardar toda la zona. Inténtalo de nuevo con conexión.', zoneZoomIn:'Acerca el mapa a las casas antes de guardar la zona.',
    showAllVisits:'Ver todas las visitas ({count})', showRecentVisits:'Ver solo las recientes',
    cloudSignedInAs:'Conectado como {email}', cloudLastSync:'Última sincronización: {time}', cloudNever:'Aún no se ha sincronizado.', cloudSyncing:'Sincronizando…', cloudSynced:'Sincronizado.', cloudError:'No se pudo sincronizar: {message}', cloudOffline:'Sin conexión. Se sincronizará cuando vuelva internet.', cloudNeedEmail:'Escribe tu correo y contraseña.', cloudResetSent:'Te enviamos un correo para cambiar la contraseña.', cloudSignedOutMsg:'Sesión cerrada. Tus revisitas siguen en este dispositivo.', cloudLoading:'Conectando…',
    lastVisit:'Última visita: {date}', detailNotes:'Notas', noSchedule:'Sin fecha para volver', scheduledFor:'Volver: {value}', loggedVisit:'Visita', endedVisit:'Terminada', logLeft:'Dejó: {value}', sharedFrom:'Enviado desde Revisita',

    skip:'Ir al contenido', updateAvailable:'Hay una actualización disponible.', update:'Actualizar', close:'Cerrar', mainNav:'Navegación principal', mapModes:'Modos del mapa', filterVisits:'Filtrar revisitas', swipeMoreOptions:'Desliza o toca para ver más opciones', swipeMoreFilters:'Desliza o toca para ver más filtros', zoomIn:'Acercar', zoomOut:'Alejar', mapAria:'Mapa de revisitas', mapControls:'Controles del mapa', searchVisitsAria:'Buscar revisitas', themeAria:'Tema', languageAria:'Idioma', unknownError:'Error desconocido', returnLabel:'Volver', openVisitAria:'Abrir revisita {name}',
    brandSubtitle:'Mapa de revisitas', save:'Guardar', savedLocally:'Guardado localmente', offline:'Sin conexión', searchingLocation:'Buscando ubicación…',
    today:'Hoy', newVisit:'Nueva', nextVisit:'Próxima revisita', directions:'Cómo llegar', visibleVisits:'Revisitas visibles', overdue:'Atrasadas', forToday:'Para hoy', doneToday:'Hechas hoy', attention:'Atención',
    orderedByTime:'Ordenadas por hora', allCaughtUp:'Todo al día', noTodayTasks:'No tienes revisitas atrasadas ni programadas para hoy.', viewActiveMap:'Ver mapa de activas',
    map:'Mapa', mapSubtitle:'Visualiza tus revisitas y confirma cada ubicación antes de guardarla.', active:'Activas', upcoming:'Próximas', all:'Todas', nearby:'Cerca de mí',
    swipeMore:'Desliza para ver más', mapTiles:'Los mosaicos aparecen cuando hay conexión.', useLocation:'Usar mi ubicación',
    confirmLocationTitle:'¿Es esta la ubicación correcta?', searchingAddress:'Buscando dirección aproximada…', cancel:'Cancelar', adjustLocation:'Ajustar ubicación', movePin:'Mover pin', pinMoved:'Pin movido. Revisa la dirección.', confirmLocation:'Confirmar ubicación',
    confirmTipTitle:'Primero confirma:', confirmTip:'al tocar el mapa aparece un pin provisional. Puedes tocar otro punto antes de confirmarlo.',
    visits:'Revisitas', searchPlaceholder:'Buscar por nombre, dirección o nota', undated:'Sin fecha', history:'Historial',
    noVisits:'No hay revisitas aquí', noVisitsText:'Guarda una ubicación desde el mapa para verla en esta lista.', goMap:'Ir al mapa',
    more:'Más', moreSubtitle:'Instalación, apariencia, idioma y copias de seguridad.', installApp:'Instalar la app',
    installText:'Úsala como una app normal desde la pantalla de inicio.', installRevisita:'Instalar Revisita',
    installHint:'Si ya está instalada, este botón puede no aparecer disponible.', installIOS:'Instalar en iPhone', installIOSHint:'En iPhone, toca este botón para ver cómo añadir Revisita a la pantalla de inicio.', installIOSTitle:'Instalar Revisita en iPhone', installIOSIntro:'Apple no permite que una página instale la app automáticamente. Haz estos pasos:', installIOSStep1:'Toca el botón Compartir del navegador (cuadrado con flecha hacia arriba).', installIOSStep2:'Elige “Añadir a pantalla de inicio”.', installIOSStep3:'Toca “Añadir” para terminar.', installIOSDone:'Entendido', installUnavailable:'Usa el menú de tu navegador y elige Instalar app o Añadir a pantalla de inicio.', appearance:'Apariencia', theme:'Tema', themeHelp:'Elige cómo quieres ver Revisita.', dark:'Oscuro', light:'Claro',
    language:'Idioma', languageHelp:'Puedes cambiar el idioma en cualquier momento.', spanish:'Español', english:'English',
    backup:'Copia de seguridad', backupText:'Exporta tus revisitas para guardarlas o pasarlas a otro teléfono.', exportBackup:'Exportar copia', importBackup:'Importar copia', restorePrevious:'Restaurar copia anterior',
    privacy:'Privacidad', privacyText:'Las revisitas y notas se guardan en este dispositivo (y en tu cuenta solo si activas la sincronización). El mapa y la búsqueda de dirección usan servicios públicos de OpenStreetMap cuando hay conexión.',
    privacyTip:'Guarda únicamente la información necesaria para la revisita.', data:'Datos', deleteAll:'Borrar todas las revisitas',
    navToday:'Hoy', navMap:'Mapa', navVisits:'Revisitas', navMore:'Más',
    newVisitTitle:'Nueva revisita', visitTitle:'Revisita', locationPreview:'Vista previa de la ubicación', openGoogleMaps:'Abrir en Google Maps',
    nameReference:'Nombre o referencia', namePlaceholder:'Ej.: Familia Pérez, doña Carmen', approximateAddress:'Dirección aproximada', addressPlaceholder:'Se puede completar automáticamente', search:'Buscar',
    notes:'Notas', notesPlaceholder:'Qué hablaron, qué recordar, mejor horario…', returnDate:'Volver el', returnTime:'Hora de volver',
    markDone:'Marcar como hecha', reschedule:'Reprogramar', reactivateReschedule:'Reactivar y reprogramar', viewMap:'Ver en mapa', googleMaps:'Google Maps', share:'Compartir',
    deleteVisit:'Eliminar revisita', saveVisit:'Guardar revisita', importReview:'Revisar importación', importReviewText:'Confirma antes de cambiar tus datos.',
    importPolicyTitle:'Política:', importPolicy:'se combinan registros por ID. Si un ID ya existe, la copia importada lo reemplaza. Antes de aplicar, se crea una copia local de recuperación.',
    importVisits:'Importar revisitas',
    mapSummaryToday:'hoy y atrasadas', mapSummaryActive:'activas', mapSummaryUpcoming:'próximas', mapSummaryAll:'todas', mapSummaryNearby:'activas a 5 km de ti',
    visitsSingular:'revisita', visitsPlural:'revisitas', mapSummaryOne:'1 revisita {label}', mapSummaryOneToday:'hoy o atrasada', mapSummaryOneActive:'activa', mapSummaryOneUpcoming:'próxima', mapSummaryOneAll:'en total', mapSummaryOneNearby:'activa a 5 km de ti', noTime:'Sin hora', tomorrow:'Mañana', done:'Hecha',
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
    completedVisit:'Visita completada', scheduled:'Programada: {value}', open:'Abrir', welcomeTitle:'Bienvenido a Revisita', welcomeIntro:'Tres pasos para comenzar.', welcomeStep1Title:'Permite tu ubicación', welcomeStep1Text:'Así el mapa puede mostrar dónde estás y qué revisitas tienes cerca.', welcomeStep2Title:'Guarda una revisita', welcomeStep2Text:'Toca el mapa o usa tu ubicación, confirma el pin y añade el nombre o referencia.', welcomeStep3Title:'Programa cuándo volver', welcomeStep3Text:'Añade fecha y hora para verla automáticamente en Hoy.', startUsing:'Empezar', dueNow:'Ahora', noAddress:'Sin dirección',
  },
  en: {
    nameLabel:'Name', upcomingDays:'Next few days', upcomingDaysHint:'The next 7 days', newWhereTitle:'Where is the house?', newHere:'Here — my location', newHereHint:'You are at the door right now.', newOnMap:'Pick on the map', newOnMapHint:'Tap the spot on the map.',
    calendarAskTitle:'Add to your calendar?', calendarAskText:'Revisita can put this visit in your phone calendar with an alarm. You can change this later in More → Reminders.', calendarAskYes:'Yes, every time', calendarAskNo:'No thanks',
    calendarStaleTitle:'Remove the old reminder', calendarStaleText:'Your calendar still has “{name}” on {when}; Revisita cannot delete that reminder. Open it in your calendar and delete it so you do not get a wrong alarm.', calendarStaleOk:'Got it',
    privacyTextSynced:'Return visits and notes are stored on this device and in your KHub account (sync is on). Only you can read them. The map and address lookup use public OpenStreetMap services when online.',
    savedCheck:'Saved ✓', saveZone:'Save area', nearbyShort:'Nearby', logVisit:'Log visit', call:'Call', addToCalendar:'Calendar', addToCalendarBtn:'Add to Calendar', setReminderBtn:'Set Reminder', needDateTimeForReminder:'Set a date and time to create the reminder.', reminderSet:'Reminder on. We’ll notify you 5 minutes before.', edit:'Edit',
    reference:'Reference (how to find the house)', referencePlaceholder:'E.g. green house across from the corner store, 2nd floor', quickDates:'Quick dates', inOneWeek:'+1 week', inTwoWeeks:'+2 weeks', inOneMonth:'+1 month',
    moreDetails:'More details (optional)', phone:'Phone / WhatsApp', phonePlaceholder:'E.g. 809-555-1234', leftWith:'What you left', leftWithPlaceholder:'E.g. magazine, tract, video', nextTopic:'Topic for next time', nextTopicPlaceholder:'Pending question or topic',
    calendarHint:'Saving with a date adds it to your calendar with a reminder.', logNote:'What did you talk about?', logNotePlaceholder:'Topic, reaction, what is pending…', whenReturn:'When will you return?', endVisit:'Do not return — move to history', saveLog:'Save visit',
    chooseNavApp:'Choose your navigation app.', rememberChoice:'Remember my choice', remindersTitle:'Reminders', remindersText:'Revisita can use your phone calendar to remind you. If you turn it on, saving a dated return visit opens the calendar so you can add it with an alarm.',
    calendarOnSave:'Add to calendar when saving', reminderLead:'Remind me', atTime:'At the time', calendarApp:'Calendar', calendarAuto:'Automatic (iPhone: Calendar · Android: Google Calendar)', calendarIcs:'Calendar file (.ics)',
    visitTimeZoneHint:'New dates and times retain this device’s time zone. Rescheduling uses the current zone.', invalidVisitTime:'That time does not exist on this date in this zone (daylight-saving change). Choose another time.', pushSyncing:'Syncing alerts…', pushSynced:'Alerts synced. You can close the app.', pushSyncFailed:'Alerts pending: connect and keep the app open until synced. The old alert may still be active.',
    pushDescription:'Enable alerts on this device to get a notification 5 minutes before each timed return visit, even when the app is closed. The name and time are sent to the alert service. Delivery may vary slightly; wait for sync confirmation before closing.', enablePush:'Enable alerts', disablePush:'Disable alerts', testPush:'Test alert', pushEnabled:'Alerts enabled on this device.', pushDisabled:'Alerts disabled.', pushUnsupported:'This browser does not support alerts.', pushHomeScreen:'On iPhone, open Revisita from its Home Screen icon.', pushPermission:'Allow notifications on this device.', pushUnavailable:'The alert service is not available yet.', pushFailed:'Could not set up alerts. Try again online.', pushTestSent:'Test alert sent.',
    navAppTitle:'Navigation', navAppLabel:'Open “Directions” with', askEachTime:'Ask every time',
    cloudTitle:'Sync across devices', cloudText:'Optional. Use your KHub account (the same one as your other apps) to have your return visits on your phone and tablet.', email:'Email', password:'Password', signIn:'Sign in', createAccount:'Create account', forgotPassword:'Forgot password', syncNow:'Sync now', signOut:'Sign out', cloudPrivacy:'Only you can read your cloud data. Save only what the return visit needs.',
    visitLogged:'Visit logged.', visitLoggedNext:'Visit logged — next: {when}', visitEnded:'Return visit moved to history.', calendarOpened:'Confirm in your calendar to keep the reminder.', noDateForCalendar:'Schedule a return date first.', reactivate:'Reactivate',
    zoneSaving:'Saving area… {done}/{total}', zoneSaved:'Area saved for offline use ({count} tiles).', zoneOffline:'Connect to the internet to save the area.', zoneFailed:'Could not save the whole area. Try again while online.', zoneZoomIn:'Zoom in on the houses before saving this area.',
    showAllVisits:'Show all visits ({count})', showRecentVisits:'Show recent visits only',
    cloudSignedInAs:'Signed in as {email}', cloudLastSync:'Last sync: {time}', cloudNever:'Not synced yet.', cloudSyncing:'Syncing…', cloudSynced:'Synced.', cloudError:'Could not sync: {message}', cloudOffline:'Offline. It will sync when you are back online.', cloudNeedEmail:'Enter your email and password.', cloudResetSent:'We sent you an email to reset your password.', cloudSignedOutMsg:'Signed out. Your return visits stay on this device.', cloudLoading:'Connecting…',
    lastVisit:'Last visit: {date}', detailNotes:'Notes', noSchedule:'No return date', scheduledFor:'Return: {value}', loggedVisit:'Visit', endedVisit:'Ended', logLeft:'Left: {value}', sharedFrom:'Sent from Revisita',

    skip:'Skip to content', updateAvailable:'An update is available.', update:'Update', close:'Close', mainNav:'Main navigation', mapModes:'Map modes', filterVisits:'Filter return visits', swipeMoreOptions:'Swipe or tap to see more options', swipeMoreFilters:'Swipe or tap to see more filters', zoomIn:'Zoom in', zoomOut:'Zoom out', mapAria:'Return visit map', mapControls:'Map controls', searchVisitsAria:'Search return visits', themeAria:'Theme', languageAria:'Language', unknownError:'Unknown error', returnLabel:'Return', openVisitAria:'Open return visit {name}',
    brandSubtitle:'Return visit map', save:'Save', savedLocally:'Saved locally', offline:'Offline', searchingLocation:'Finding location…',
    today:'Today', newVisit:'New', nextVisit:'Next return visit', directions:'Directions', visibleVisits:'Visible return visits', overdue:'Overdue', forToday:'For today', doneToday:'Done today', attention:'Attention',
    orderedByTime:'Ordered by time', allCaughtUp:'All caught up', noTodayTasks:'You have no overdue return visits or visits scheduled for today.', viewActiveMap:'View active map',
    map:'Map', mapSubtitle:'See your return visits and confirm each location before saving it.', active:'Active', upcoming:'Upcoming', all:'All', nearby:'Near me',
    swipeMore:'Swipe to see more', mapTiles:'Map tiles appear when you are online.', useLocation:'Use my location',
    confirmLocationTitle:'Is this the correct location?', searchingAddress:'Finding approximate address…', cancel:'Cancel', adjustLocation:'Adjust location', movePin:'Move pin', pinMoved:'Pin moved. Check the address.', confirmLocation:'Confirm location',
    confirmTipTitle:'Confirm first:', confirmTip:'tapping the map creates a temporary pin. You can tap another point before confirming it.',
    visits:'Return visits', searchPlaceholder:'Search by name, address, or note', undated:'No date', history:'History',
    noVisits:'No return visits here', noVisitsText:'Save a location from the map to see it in this list.', goMap:'Go to map',
    more:'More', moreSubtitle:'Installation, appearance, language, and backups.', installApp:'Install the app',
    installText:'Use it like a normal app from your home screen.', installRevisita:'Install Revisita',
    installHint:'If it is already installed, this button may not be available.', installIOS:'Install on iPhone', installIOSHint:'On iPhone, tap this button to see how to add Revisita to your Home Screen.', installIOSTitle:'Install Revisita on iPhone', installIOSIntro:'Apple does not allow a web page to install the app automatically. Follow these steps:', installIOSStep1:'Tap the browser Share button (square with an upward arrow).', installIOSStep2:'Choose “Add to Home Screen”.', installIOSStep3:'Tap “Add” to finish.', installIOSDone:'Got it', installUnavailable:'Use your browser menu and choose Install app or Add to Home Screen.', appearance:'Appearance', theme:'Theme', themeHelp:'Choose how you want Revisita to look.', dark:'Dark', light:'Light',
    language:'Language', languageHelp:'You can change the language at any time.', spanish:'Español', english:'English',
    backup:'Backup', backupText:'Export your return visits to keep them safe or move them to another phone.', exportBackup:'Export backup', importBackup:'Import backup', restorePrevious:'Restore previous backup',
    privacy:'Privacy', privacyText:'Return visits and notes are stored on this device (and in your account only if you turn on sync). The map and approximate-address lookup use public OpenStreetMap services while online.',
    privacyTip:'Save only the information needed for the return visit.', data:'Data', deleteAll:'Delete all return visits',
    navToday:'Today', navMap:'Map', navVisits:'Visits', navMore:'More',
    newVisitTitle:'New return visit', visitTitle:'Return visit', locationPreview:'Location preview', openGoogleMaps:'Open in Google Maps',
    nameReference:'Name or reference', namePlaceholder:'Example: Pérez family, Ms. Carmen', approximateAddress:'Approximate address', addressPlaceholder:'Can be filled automatically', search:'Search',
    notes:'Notes', notesPlaceholder:'What you discussed, what to remember, best time…', returnDate:'Return on', returnTime:'Return time',
    markDone:'Mark done', reschedule:'Reschedule', reactivateReschedule:'Reactivate and reschedule', viewMap:'View on map', googleMaps:'Google Maps', share:'Share',
    deleteVisit:'Delete return visit', saveVisit:'Save return visit', importReview:'Review import', importReviewText:'Confirm before changing your data.',
    importPolicyTitle:'Policy:', importPolicy:'records are merged by ID. If an ID already exists, the imported copy replaces it. A local recovery snapshot is created before applying.',
    importVisits:'Import return visits',
    mapSummaryToday:'today and overdue', mapSummaryActive:'active', mapSummaryUpcoming:'upcoming', mapSummaryAll:'total', mapSummaryNearby:'active within 5 km of you',
    visitsSingular:'return visit', visitsPlural:'return visits', mapSummaryOne:'1 return visit {label}', mapSummaryOneToday:'today or overdue', mapSummaryOneActive:'active', mapSummaryOneUpcoming:'upcoming', mapSummaryOneAll:'in total', mapSummaryOneNearby:'active within 5 km of you', noTime:'No time', tomorrow:'Tomorrow', done:'Done',
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
    completedVisit:'Visit completed', scheduled:'Scheduled: {value}', open:'Open', welcomeTitle:'Welcome to Revisita', welcomeIntro:'Three steps to get started.', welcomeStep1Title:'Allow your location', welcomeStep1Text:'This lets the map show where you are and which return visits are nearby.', welcomeStep2Title:'Save a return visit', welcomeStep2Text:'Tap the map or use your location, confirm the pin, and add a name or reference.', welcomeStep3Title:'Schedule when to return', welcomeStep3Text:'Add a date and time so it appears automatically on Today.', startUsing:'Get started', dueNow:'Now', noAddress:'No address',
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
