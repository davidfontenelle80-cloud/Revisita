# ACTIVE_TASK — Revisita

## Session / worker identity

- **Worker:** ChatGPT / GPT-5.6 Sol
- **Supervisor:** David Fontenelle
- **Session date:** 2026-09-22 EDT

## Status

- **Status:** IN PROGRESS
- **% complete:** 100% — apertura del mapa corregida y verificada
- **Confidence:** 96%

## Objective completed

Actualizar Revisita a una versión de seguimiento diario y mapa operativo, manteniendo el flujo simple en Android.

## Implemented

- **Hora opcional** además de fecha para volver.
- La app abre en **Hoy**: Atrasadas + Para hoy, con las del día ordenadas por hora.
- Acciones **Marcar hecha** y **Reprogramar**.
- **Historial** persistente de visitas completadas.
- Navegación: **Hoy · Mapa · Revisitas · Más**.
- Modos del mapa: **Hoy · Activas · Próximas · Todas · Cerca de mí**.
- **Cerca de mí** muestra activas dentro de 5 km cuando hay GPS.
- Tocar mapa/GPS crea solamente un **pin provisional**.
- Panel **¿Es esta la ubicación correcta?** con dirección aproximada, coordenadas y precisión GPS.
- El usuario puede tocar otro punto o usar **Ajustar ubicación** antes de confirmar.
- Ninguna revisita se guarda hasta pulsar **Guardar revisita**.
- Al abrir una revisita guardada aparece una **vista previa del mapa** centrada en su pin.
- Botón **Abrir en Google Maps** para navegación.
- Compatibilidad/migración automática de datos v1 al esquema v2.
- Service worker actualizado a cache v2.
- App version actualizada a **1.1.0**.

## Verification completed

- GitHub Actions `npm run check`: **PASS** en el código final antes de esta actualización de estado.
- Encoding check: **PASS**.
- JavaScript syntax check: **PASS**.
- Unit tests: **11 PASS** (mapas/distancias, agenda, importación, migración e historial).
- KHub ship check: **PASS**.
- GitHub Pages build: **PASS**.
- GitHub Pages deploy: **PASS**.
- URL publicada: `https://davidfontenelle80-cloud.github.io/Revisita/`.

## Remaining supervisor acceptance test

En Android real:

1. Abrir la app y confirmar que inicia en **Hoy**.
2. Tocar el mapa y comprobar que solo aparece un pin provisional.
3. Mover el pin y confirmar ubicación.
4. Probar GPS + precisión.
5. Guardar con fecha y hora.
6. Verlo en Hoy, Activas y Cerca de mí.
7. Marcar Hecha y luego Reprogramar.
8. Abrir una revisita y comprobar mapa previo + Google Maps.
9. Confirmar instalación PWA y comportamiento offline básico.

## Next step

David revisa el flujo real. Cualquier observación pasa a una nueva tarea; solo el supervisor marca COMPLETE.

## Supervisor Review

- **Review status:** NOT REVIEWED
- **Reviewed by:**
- **Reviewed at:**
- **Observations / required changes:**


## Follow-up UX — 2026-09-22

Observaciones del supervisor desde iPhone:
- El chip de estado del encabezado se corta en pantallas estrechas.
- Algunas vistas permiten contenido demasiado ancho y el texto puede quedar recortado.
- El estado “Guardado localmente” parece un botón pero no hace nada.
- Las filas horizontales de filtros no indican que hay más opciones fuera de pantalla.

Cambio solicitado:
- Compactar y hacer accionable el control de guardado.
- Evitar overflow horizontal.
- Añadir pista “Desliza para ver más →” cuando una fila realmente tiene contenido fuera de pantalla.


## Follow-up result

- Botón de encabezado: **Guardar**; al tocarlo fuerza guardado local y confirma con toast.
- Si hay un pin provisional, el botón advierte que primero debe confirmarse la ubicación.
- Header y pantallas estrechas protegidos contra overflow horizontal.
- Pistas dinámicas **Desliza para ver más →** añadidas a modos de mapa y filtros de Revisitas.
- La pista también funciona como botón para avanzar la fila.
- Versión: **1.1.1**.
- Service worker cache: **v3**.
- Automated checks: PASS en el código de este cambio antes del cierre de tarea.


## Responsive + theme follow-up — 2026-09-22

Requested:
- Make Revisita resize cleanly from small phones through tablets and larger browser windows.
- Keep controls/cards readable without clipped text or unnecessary horizontal overflow.
- Provide a clear, explicit **Claro / Oscuro** theme choice without complicating the app.

Plan:
- Use a standard scalable viewport.
- Add fluid width constraints and tablet/desktop breakpoints.
- Improve tablet card grids, map sizing, dialogs and navigation width.
- Replace the generic theme toggle with an explicit two-option theme selector.
- Persist theme choice in existing local settings.
- Bump PWA cache/version and run full checks.


## Responsive + language/theme result

- Revisita ahora sigue el patrón responsive de KHub para teléfono, tablet, landscape, laptop y desktop.
- Layout se mantiene centrado en modo **Standard 960**.
- Manifest permite orientación **any**.
- Mapa, diálogos, listas, tarjetas, settings y navegación reflow según ancho/alto disponible.
- Tema explícito **Oscuro / Claro** con preferencia persistente.
- Idioma explícito **Español / English** con preferencia persistente en `revisita.lang`.
- Textos estáticos, mensajes dinámicos, fechas, horas, alertas, filtros y acciones cambian con el idioma.
- `Alt+L` cambia idioma y `Alt+D` cambia tema con teclado físico.
- `js/i18n.js` forma parte del precache offline.
- App version: **1.2.0**.
- Service worker cache: **v4**.
- GitHub Actions final: **PASS**.
- Encoding: **26 archivos limpios**.
- Syntax check: **PASS**.
- Unit tests: **13/13 PASS**.
- KHub ship check: **PASS**.

## Remaining supervisor acceptance test

Prueba visual rápida en:
- teléfono pequeño/grande,
- tablet portrait/landscape,
- tema claro/oscuro,
- español/English,
- flujo de ubicación provisional → confirmar → guardar → abrir → Google Maps.

## Next step

David revisa la versión publicada. Cualquier observación pasa a un nuevo ajuste; solo el supervisor marca COMPLETE.


## iPhone install UX follow-up — 2026-09-22

Requested:
- Make the install control useful on iPhone/iPad instead of appearing to do nothing.
- Respect iOS platform limits: a web app cannot programmatically force Apple's Add to Home Screen action.

Plan:
- Detect iOS/iPadOS and standalone state.
- On supported Android/Chromium, keep the native install prompt.
- On iPhone/iPad, change the button copy to platform-specific install guidance.
- Tapping it opens an in-app instruction sheet for Add to Home Screen.
- Provide Spanish/English copy and keep the flow responsive.


## iPhone install UX result

- iPhone/iPad is detected at runtime.
- Installed standalone mode is detected.
- On Android/Chromium with `beforeinstallprompt`, the native install prompt is preserved.
- On iPhone/iPad, **Instalar Revisita** becomes **Instalar en iPhone / Install on iPhone**.
- Tapping it opens a bilingual in-app guide:
  1. Tap Share.
  2. Choose Add to Home Screen.
  3. Tap Add.
- On unsupported browsers without a native prompt, the button now gives browser-menu guidance instead of doing nothing.
- App version: **1.2.1**.
- Service worker cache: **v5**.
- Final automated check: **PASS**.


## Auto-location + confirmation visibility follow-up — 2026-09-22

Supervisor observation from tablet:
- Revisita should obtain the device location automatically when the app opens.
- Opening the Map should center on the current location automatically when available.
- The location-confirmation panel is currently hidden behind the fixed bottom navigation.

Plan:
- Request geolocation automatically at launch.
- Keep the current-location dot available across views.
- Center the map on the current location when Map opens, without creating/saving a visit.
- Keep manual “Use my location” behavior for creating a provisional visit pin.
- Move the confirmation panel to a viewport-fixed safe position above the bottom navigation.
- Preserve phone/tablet/landscape responsiveness and EN/ES behavior.


## Auto-location + confirmation visibility result

- Revisita now requests current location automatically when the app opens.
- Opening **Mapa / Map** centers the map on the current device location when available.
- Automatic locating only updates the current-position dot/map center; it never creates or saves a revisita.
- **Usar mi ubicación / Use my location** still creates a provisional pin that must be confirmed.
- The confirmation panel is now fixed to the viewport above the persistent bottom navigation.
- The panel has a safe max height and internal scrolling on short/landscape screens so Confirm/Adjust/Cancel remain reachable.
- App version: **1.2.2**.
- Service worker cache: **v6**.
- GitHub Actions check: **PASS**.
- GitHub Pages build/deploy: **PASS**.

## Remaining supervisor acceptance test

On the tablet/phone:
1. Reload/open Revisita and allow location permission if prompted.
2. Open Map and confirm it centers on the live position automatically.
3. Tap a different point and verify the confirmation panel is fully visible above the bottom nav.
4. Confirm the point and verify the editor opens normally.


## User-side polish follow-up — 2026-09-22

Approved improvements:
- Add a prominent **Próxima revisita / Next return visit** card on Hoy.
- On tablets/large screens, use a **split Map + visits list** layout instead of only enlarging the phone map.
- Add a universal floating **+ Nueva / + New** action.
- Make the provisional-location confirmation even clearer by de-emphasizing/hiding the bottom nav while confirmation is active.
- Add a lightweight first-use guide for brand-new users.
- Keep EN/ES, light/dark, phone/tablet responsiveness, local storage and existing data compatibility.


## User-side polish result — v1.3.0

- **Próxima revisita / Next return visit** card added to Hoy with quick Open and Directions.
- Next-visit selection prioritizes the next remaining visit today, then falls back to today's remaining items, overdue items, then upcoming.
- **Tablet/desktop split Map view** added: visible return visits appear in a left-side list next to the map.
- Sidebar cards show schedule, address/distance, Open and Directions.
- Added universal floating **+ Nueva / + New** action.
- While confirming a provisional location, bottom navigation and FAB are hidden so Confirm/Adjust/Cancel remain dominant.
- Added first-use three-step onboarding for brand-new users with no saved visits.
- Existing users with saved visits are not interrupted by onboarding.
- EN/ES and light/dark behavior preserved.
- App version: **1.3.0**.
- Service worker cache: **v7**.
- GitHub Actions: **PASS**.
- Encoding: **26 text files clean**.
- Unit tests: **15/15 PASS**.
- KHub ship check: **PASS**.
- GitHub Pages build/deploy: **PASS**.

## Supervisor acceptance focus

Check:
1. Hoy → Próxima revisita card.
2. Tablet Map → sidebar + map split layout.
3. + Nueva button.
4. Location confirmation with nav hidden.
5. New-user onboarding on a clean browser/device.


## iPhone confirmation popup + stale-cache follow-up — 2026-09-22

Supervisor observation:
- Al tocar el mapa, el panel de confirmación todavía puede aparecer abajo/oculto en iPhone.
- La captura muestra UI antigua (por ejemplo, “Guardado localmente” y navegación inferior visible durante la confirmación), aunque el código actual ya contiene la corrección de panel fijo y ocultamiento de navegación.

Plan:
- Hacer que la página cargue assets versionados para evitar que un service worker antiguo siga sirviendo CSS/JS viejos.
- Mantener el panel de confirmación fijo y visible por encima del viewport seguro.
- Subir versión/cache y ejecutar checks.


## iPhone confirmation popup + stale-cache result — v1.3.1

- Confirmed the screenshot was rendering stale UI rather than the current confirmation behavior.
- Added versioned URLs to the main stylesheet, app module and browser module imports.
- Service-worker registration now uses a versioned script URL and `updateViaCache: 'none'`.
- Service-worker cache bumped to **v8**.
- App version bumped to **1.3.1**.
- Current confirmation behavior remains fixed to the viewport; bottom navigation and FAB are hidden while confirmation is active.
- GitHub Actions final check: **PASS**.
- GitHub Pages final build/deploy: **PASS**.

## Remaining supervisor acceptance test

On iPhone:
1. Close and reopen the Revisita tab once.
2. Tap the map.
3. Confirm the full location panel appears immediately in the visible viewport.
4. Confirm the bottom navigation is hidden while that panel is active.


## Horizontal filter hint follow-up — 2026-09-22

Supervisor observation from iPhone:
- The “Desliza para ver más →” hint is positioned on top of the filter chips.
- It can obscure a category such as Próximas and makes it look like an option is missing until the row is fully scrolled.

Fix:
- Move the hint into its own line above the chips; never overlay filter buttons.
- Keep it dynamic: only show when the chip row actually overflows and hide when the user reaches the end.
- Remove the artificial right padding that was reserving space for the old overlay.
- Preserve horizontal swiping and selected-chip visibility on small screens.


## Horizontal filter hint result — v1.3.1

- “Desliza para ver más →” moved above the chip row; it no longer covers Hoy/Activas/Próximas/Todas/Cerca de mí.
- Hint remains dynamic and disappears when the horizontal row reaches its end.
- Removed old right-side padding reserved for the overlay.
- Selected map/list filter chips automatically scroll into view when necessary.
- App version: **1.3.1**.
- Service worker cache: **v8**.


## Service-worker reliability follow-up — 2026-09-22

Supervisor request:
- Updates must reliably reach installed/browser-cached copies without requiring manual cache-busting.
- Compare Revisita with other KHub-family apps and adopt the more reliable update lifecycle.

Reference review:
- KHub Boilerplate: network-first shell assets, atomic precache, self.skipWaiting(), clients.claim(), RELOAD_READY broadcast, periodic update manager.
- Ministry Tracker: startup registration.update(), safe reload detection, RELOAD_READY, skip-waiting lifecycle.
- Talk Arrangements: versioned critical CSS/JS plus network-first for polished assets.
- Umbriq: network-first shell with offline fallback and app-owned cache cleanup.

Planned fix:
- Replace Revisita's cache-first shell strategy with KHub-style network-first shell handling.
- Use atomic precache + immediate worker activation + RELOAD_READY broadcast.
- Check for a new worker on every startup and when the app returns to the foreground.
- Reload automatically only when safe; otherwise show the update banner.
- Add versioned critical asset URLs for transition away from the old cache-first worker.
- Keep map-tile cache separate and persistent across app-shell updates.
- Add service-worker/update regression tests.


## Service-worker reliability result — v1.3.2

- Adopted KHub-style **network-first** app-shell delivery with offline fallback.
- Atomic shell precache prevents a partial/broken worker from replacing a complete worker.
- New workers call `skipWaiting()`, then `clients.claim()`, then broadcast `RELOAD_READY`.
- Revisita calls `registration.update()` on startup and when returning to the foreground (throttled).
- Automatic reload is gated by safe-state checks; active dialogs, focused form fields and provisional locations are not interrupted.
- Update banner remains the manual fallback when an immediate reload is unsafe.
- Critical shell assets and module imports are versioned **1.3.2** to escape the previous cache-first worker immediately.
- Map tile cache is stable across app-shell releases.
- Added service-worker update regression tests.
- App version: **1.3.2**.
- Shell cache: **revisita-shell-v9-auto-update**.
- Tile cache: **revisita-tiles-v1**.

## Remaining supervisor acceptance test

After this deployment reaches the device:
1. Open Revisita normally without adding a query-string version.
2. Future releases should be detected on startup/foreground automatically.
3. When no form is open, the app should move to the new build automatically.
4. If the user is editing/confirming something, the update banner should appear instead of interrupting the work.


## Map smoothness follow-up — 2026-09-23

Supervisor observation:
- The map can feel glitchy/flickery when it opens and especially while dragging/panning.

Code-level cause found:
- `renderTiles()` destroys and recreates every visible tile image on every pointer-move render via `replaceChildren()`.
- `renderMarkers()` also destroys/recreates all marker DOM on every render.
- Pointer-move events call a full render synchronously, potentially many times per animation frame.
- Wheel zoom can fire multiple zoom steps in a very short burst.

Fix plan:
- Retain/reuse tile DOM nodes keyed by z/x/y and only add/remove tiles that enter/leave the buffered viewport.
- Retain marker/user/draft nodes and update positions instead of rebuilding them while panning.
- Coalesce map redraws with `requestAnimationFrame`.
- Use GPU-friendly translate3d positioning.
- Throttle wheel zoom slightly.
- Preserve existing tap-to-pin, GPS, marker opening, zoom, fitPoints and saved map-center behavior.
- Add regression checks so tile/marker DOM is not rebuilt during every pan frame.


## Map smoothness result — v1.3.3

- Root cause confirmed: tile and marker DOM was fully destroyed/recreated during every pan render.
- Tile nodes are now retained/reused; only entering/leaving buffered tiles change.
- Marker, draft-pin and user-location nodes are retained and repositioned.
- Pointer-move redraws are coalesced with `requestAnimationFrame`.
- GPU-friendly `translate3d` positioning added while preserving pin anchors.
- Wheel zoom is throttled to prevent rapid multi-step jumps.
- Existing map APIs/behaviors remain unchanged.
- App version: **1.3.3**.
- Shell cache: **revisita-shell-v10-map-smooth**.
- GitHub Actions final Check: **PASS**.
- Encoding: **28 text files clean**.
- Unit/regression tests: **22/22 PASS**.
- KHub ship check: **PASS**.

## Supervisor acceptance focus

On phone/tablet:
1. Open Map and let it center on current location.
2. Drag slowly, then quickly in several directions.
3. Cross several blocks/tiles and watch for blank flashes or snapping.
4. Zoom +/- and confirm the map remains stable.
5. Tap a location and confirm the provisional pin still lands exactly where tapped.


## Map opening viewport follow-up — 2026-09-23

Supervisor observation from iPhone:
- Revisita can reopen/return to the Map view with the page scrolled down.
- In that state the map is visible, but the map title/filter choices are above the viewport, so the user cannot immediately see Hoy / Activas / Próximas / Todas / Cerca de mí.
- Scrolling upward reveals them, which proves the controls are present but the opening scroll position is wrong.

Fix plan:
- Disable browser scroll restoration so iOS/Safari/PWA does not restore an old vertical page position.
- Reset the page to the top immediately (not smooth) whenever Map is entered.
- Re-assert the top position on pageshow/foreground restore when Map is the active view.
- Keep the map itself pannable; only page-level vertical scroll is reset.
- Avoid changing the existing map pan/zoom behavior.


## Map opening viewport result — v1.3.4

- Browser/PWA scroll restoration disabled.
- Map tab resets page scroll to top immediately on entry.
- pageshow/foreground restore reasserts the top position when Map is active.
- Phone map filters stay sticky below the app header, so Hoy/Activas/Próximas/Todas/Cerca de mí remain visible even if the page had been scrolled.
- Tablet/desktop split layout remains unchanged.
- App version: **1.3.4**.
- Shell cache: **revisita-shell-v11-map-viewport**.
- Latest GitHub Check: **PASS**.


## App icon fidelity follow-up — 2026-09-23

Supervisor observation from iPhone:
- The installed Home Screen icon looks darker/flatter and less faithful than the supplied original artwork.
- The original artwork has richer blue/silver/brown tones and smoother photographic shading.

Cause:
- Earlier icon assets were aggressively color-quantized to keep binary uploads tiny, including a 4-color 512px version.
- iOS uses `apple-touch-icon.png`; the currently installed shortcut can also keep its old icon cached even after the web app updates.

Fix:
- Rebuild all icon sizes directly from the supplied original artwork in full true-color PNG.
- Provide a native 180x180 Apple touch icon.
- Keep Android regular and maskable icon sets.
- Version the icon URLs so new installs fetch the new artwork.
- Existing iPhone Home Screen shortcuts may need to be removed/re-added once because iOS caches installed icons separately from the service worker.


## Tracker reconciliation — 2026-09-23 (Claude / Opus 5.5)

- Repo vs tracker checked before coding. Discrepancy: **App icon fidelity follow-up** was opened by the previous worker (commit `cf91926`) but **no icon files were changed** — `icons/*.png` are still 2–4-bit palette PNGs (512px = 4 colors). Status corrected: that task is **taken over by Claude** and folded into v1.4.0 below.
- Supervisor browser review (iPhone 13 viewport, live v1.3.4): create → confirm pin → save → Hoy → open works, zero console errors. Findings drove the plan below.

## v1.4.0 — Approved batch (Supervisor: "let's get it all done", 2026-09-23 06:24)

Status: **IN PROGRESS**

1. **Icons** — rebuild every size in true color from the supplied artwork (blue panel + wordmark, no double bezel); native 180px Apple touch icon; Android maskable with safe-zone padding; versioned icon URLs.
2. **Visit card** — opening a saved visit shows a read-first card (no keyboard): Cómo llegar · Registrar visita · Editar; call/WhatsApp when a phone exists.
3. **Registrar visita** — replaces "Marcar como hecha": log note + what was left + next date (quick chips +1 sem / +2 sem / +1 mes / elegir) in one step; "Terminar revisita" is an explicit option. History keeps each visit.
4. **DR-friendly location text** — new **Referencia** field (how to find the house); compact auto-address; optional details (teléfono, qué dejaste, tema próxima vez).
5. **Directions** — Google Maps / Waze / Apple Maps (iPhone) with a remembered preference; Share includes reference + map link (WhatsApp via share sheet or wa.me fallback).
6. **Calendar reminders instead of push** (Supervisor, 06:25): after saving a dated visit, hand it to the phone calendar with an alarm (.ics on iPhone, Google Calendar on Android). Setting to turn off; reminder lead time selectable.
7. **Map screen** — fewer chips (Hoy · Activas · Todas · Cerca), no subtitle, first-use-only tip, taller map.
8. **Offline zone** — "Guardar esta zona" pre-caches the visible area (OSM policy-safe cap, separate persistent cache).
9. **Header** — replace do-nothing "Guardar" button with passive "Guardado ✓ / Sin conexión" status.
10. **Cloud sync** — optional KHub account (same Firebase project `khub-apps`, path `backups/revisita/users/{uid}` already allowed by rules); merge by visit id + `updatedAt` with deletion tombstones; Firebase SDK lazy-loaded only when used, so the app stays fully offline-capable.

Deferred (not in this batch): house photo (needs IndexedDB + sync size planning); push notifications (replaced by calendar reminders per Supervisor).
