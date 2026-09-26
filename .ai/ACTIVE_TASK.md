# ACTIVE_TASK — Revisita

## v1.5.5 — Mejor precisión GPS antes de confirmar

Worker: ChatGPT / GPT-5.6 Sol · Status: **READY FOR REVIEW** (2026-09-25).

Supervisor observation: GPS permission now works, but the tablet returned a very inaccurate point (17.233126, -69.258360) with no approximate address.

Scope:
- Do not accept the first GPS reading immediately when the user taps **Usar mi ubicación**.
- Collect high-accuracy readings for up to ~8 seconds, keep the best reading, and stop early when accuracy reaches a useful threshold.
- Show clear **precisa / aproximada / poco precisa** accuracy guidance before confirmation.
- Keep manual **Ajustar ubicación** available when the device cannot provide a reliable fix.
- Reuse the improved acquisition in the Más → Ubicación / GPS test.
- Add regression tests and bump the PWA shell/build.
- Implemented high-accuracy `watchPosition` acquisition: waits up to 8 seconds, keeps the best reading, and stops early at ≤80 m.
- Confirmation sheet labels fixes as precise (≤80 m), approximate (81–250 m), or low accuracy (>250 m).
- Large accuracy values are formatted in km so a multi-kilometer coarse fix is obvious.
- Más → Ubicación / GPS now uses the same best-reading acquisition path.
- Added `js/location-utils.js` plus unit coverage for best-reading selection, accuracy bands, and formatting.
- App build **1.5.5** · shell cache **revisita-shell-v27-gps-accuracy**.
- GitHub Actions **Check #254 PASS**: `npm run check` PASS; Worker dry bundle PASS.


## v1.5.4 — Ajustes de ubicación / GPS

Worker: ChatGPT / GPT-5.6 Sol · Status: **READY FOR REVIEW** (2026-09-25).

Supervisor request: add an in-app setting because the tablet did not show a GPS permission prompt.

Implemented:
- Más now has a dedicated **Ubicación / GPS** card.
- The primary button performs a user-initiated geolocation request, which is the correct moment for iPadOS/browser permission UI when permission is still promptable.
- The card reports working/granted/prompt/denied/unsupported states and approximate GPS accuracy after success.
- A **No aparece el permiso** button shows device-specific recovery instructions. On iPad/iPhone it points to Ajustes → Privacidad y seguridad → Localización, then Revisita if listed or Sitios web de Safari, with Mientras se usa la app + Ubicación precisa.
- Returning to Revisita re-checks the permission state automatically.
- The app does not attempt an undocumented iOS Settings deep link; when iPadOS has already blocked the website/app, Revisita explains how to change it safely in Settings.
- App build bumped to v1.5.4; shell cache is revisita-shell-v26-location-settings.
- Regression coverage added for the settings card, user-gesture request, blocked state, and iOS/Android guidance.
- GitHub Actions Check #238: PASS. `npm run check` PASS; Worker dry bundle PASS.

## v1.5.3 — Mapa visible en tablet portrait

Worker: ChatGPT / GPT-5.6 Sol · Status: **READY FOR REVIEW** (2026-09-25).

Supervisor observation: after v1.5.2, the map could disappear on a tablet because the split two-column layout started too early at 740px.

Fix:
- 740–959px now uses a one-column tablet layout with the map first at full width and the visit/navigation list underneath.
- 960px+ keeps the side-by-side visit list + map layout.
- The iOS/iPadOS navigation handoff from v1.5.2 remains unchanged.
- App build bumped to v1.5.3; shell cache is revisita-shell-v25-tablet-map-visibility.
- Regression test now requires full-width portrait tablet map plus side-by-side layout only at 960px+.
- Automated verification pending/then recorded in GitHub Actions before merge.

## v1.5.2 — Navegación en iPad/tablet

Worker: ChatGPT / GPT-5.6 Sol · Status: **READY FOR REVIEW** (2026-09-25).

Supervisor request: fix navigation access/launching on iPad/tablet.

Scope:
- Make the split map sidebar available on common iPad portrait widths instead of waiting for 800px.
- Make external directions handoff reliable from iPad/iPadOS PWAs by using direct same-context navigation for the chosen Maps app instead of popup-style new-window navigation.
- Preserve Google Maps, Waze and Apple Maps choices and remembered preference.
- Keep saved pin coordinates as the destination source.
- Add regression coverage, bump app/service-worker asset version, run full checks, then update this task to READY FOR REVIEW.

Result:
- Tablet split Map + visit/sidebar layout now begins at 740px, covering 744px/768px iPad portrait layouts that previously fell back to the phone-only map.
- On iPhone/iPad, Directions now uses a direct same-context universal-link handoff; desktop/Android retain the existing new-tab behavior.
- Apple Maps is the first visible navigation choice on iOS/iPadOS; Google Maps and Waze remain available and remembered preferences are unchanged.
- Destination coordinates still come from the saved visit pin.
- App/assets bumped to v1.5.2; shell cache is revisita-shell-v24-tablet-navigation.
- Regression tests added for the iPad breakpoint, iOS handoff, and Apple-first chooser.
- GitHub Actions Check run 212: PASS. npm run check PASS; Worker dry bundle PASS.
- Physical iPad handoff remains the supervisor acceptance test.

## v1.5.1 — Mensajes visibles y guía de hora (Supervisor: "Go ahead, do those")

Worker: Claude · Status: **READY FOR REVIEW** (2026-09-24).

- Toasts now live in a top-layer popover, so messages from buttons inside an open sheet (Set Reminder, Calendar, Log visit…) are visible instead of hidden behind the sheet backdrop. This was why "Set Reminder does nothing" on the visit screen.
- Test alert tapped again within a minute (server 429) now says "Wait a minute before testing again" instead of "Could not set up alerts".
- Too-soon time guide in the visit editor and the log form: a timed visit today less than 10 minutes away (alerts go out 5 minutes before; the server checks once a minute) shows a note with a suggested time (now + 15 min, rounded up to 5) and a "Use <time>" button. Old dates are not flagged. Helper `reminderLead()` in js/schedule-utils.js.

Live finding (same session): Worker delivery confirmed working after c006e39 was deployed — test pushes accepted by Apple; the iPhone showed nothing because Sleep Focus was on. David confirmed "It's working now."

Verification: `npm run check` PASS (68/68 tests, encoding, syntax, KHub ship check). Headless 390×844: too-soon toast visible above the open visit sheet; guide shows and "Use 9:35 PM" fills the field; no page errors.

## v1.5.0 — Guía de avisos (Supervisor: "go ahead and do it. Build it.")

Worker: Claude · Status: **READY FOR REVIEW** (2026-09-24).

Scope: the app detects what a device still needs for closed-app alerts (`pushSetupState()` in `js/push.js`: home-screen / denied / ask / register / off / unsupported / ready).
- Saving a visit with a date+time that can still get its 5-minute alert opens a setup sheet if the device is not ready: "Turn on alerts" (permission prompt from the tap), iPhone Home Screen install steps (with the Safari→app data tip), or blocked-in-settings steps (iOS or Android) with "Check again". "Not now" snoozes the save-time sheet 3 days; the calendar step continues after the sheet.
- Today shows a banner while any timed visit lacks alerts; hidden once ready, on unsupported browsers, or after the user turns alerts off.
- Settings "Enable alerts" opens the guide when blocked or not installed (no longer a dead disabled button). Re-checks on return from Settings (visibilitychange).
- Fix: client cleared its registration on ANY 403. Now only 410 or 403 "Unauthorized." clear it. Worker test-push maps a push-service rejection to 424 `push-rejected-<status>` (was passed through as 403).

Verification: `npm run check` PASS (66/66 tests, encoding, syntax, KHub ship check); new tests/push-setup.test.mjs + worker 424 test. Headless 390×844: Android blocked path (EN) and iPhone Safari path (ES) render with no page errors.

NOT verified: real iPhone/Android permission prompt and delivery. Worker change (424 mapping) and the earlier c006e39 redirect fix are CODE IN GITHUB — NOT LIVE until the Worker is redeployed to Cloudflare.

## v1.4.5 — Avisos cinco minutos antes

Worker: Codex · Status: **BLOCKED** (2026-09-24: Cloudflare authorization; deployment and physical delivery unverified).

Audit fixes prepared: token ownership, bounded inputs/rates, atomic per-device schedule replacement in a Revisita-only Durable Object, KV operational receipts, expired-subscription cleanup, direct-action permission prompt, iPhone/iPad Home Screen guidance, saved schedule zones/DST, ICS and notification-tap tests. `npm run check` PASS (58/58 tests). GitHub Check and Wrangler dry-run bundle PASS (run 36048763662). Local Chrome loaded v1.4.5 and opened/zoomed the map; existing map code and production user data unchanged.

Confirmed dashboard account `3df617adc3ddf2b3ed89cedbbb917fab`, `davidfontenelle80.workers.dev`. No Revisita Worker existed; intended URL is `https://revisita-push.davidfontenelle80.workers.dev`. Automatic approval review rejected account-wide Wrangler OAuth and the dashboard GitHub connection step. No KV, deployed Worker, VAPID keys or test subscriptions were created. A secure one-time VAPID provisioning script is prepared but has not been run. The draft stays unmerged, Pages remains v1.4.4, and no closed-app notification has been received. See the Worker README for precise setup, security/time-zone decisions, limitations and remaining release gates. Ministry Tracker was not modified.


## v1.4.4 — Fluidez del mapa

Worker: Codex · Status: **READY FOR REVIEW**.

Scope: mantener mosaicos visibles durante el zoom, priorizar carga de los visibles y retirar la entrada manual de coordenadas. `npm run check` PASS (46/46 tests, encoding, syntax, KHub ship check). Publicación y verificación en navegador en curso.


## v1.4.3 — Rural map and history (Supervisor: "go ahead and make the changes")

Worker: Codex · Status: **READY FOR REVIEW**.

Scope: fix empty offline zone result, preserve map viewport across tab changes, add coordinate jump, show older history, and correct singular map summary. Keep local data schema and privacy behavior unchanged.

Verification: `npm run check` PASS (47/47 tests, encoding, syntax, KHub ship check). GitHub Check and Pages deployment PASS. Published v1.4.3 browser check PASS: coordinate jump to 19.330927, -70.168193; broad offline save asks to zoom in; map position holds across tabs; one-visit label reads correctly; nine logged visits expand from eight to all nine. Disposable test visit removed. Supervisor should check GPS and saved offline tiles on an actual phone in the target area. Supervisor Review remains with David.


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

Status: **READY FOR REVIEW** (see result below)

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


## v1.4.0 result — READY FOR REVIEW

All 10 items implemented. Verification:
- `npm run check`: encoding clean · syntax PASS (incl. visit-tools.js, cloud-sync.js) · **41/41 tests PASS** (new: visit-tools 13, i18n parity + HTML-key coverage, v1.4 storage fields, zone-cache SW assertions) · KHub ship check PASS.
- Icons: built in two independent environments from the same source; all 9 files **byte-identical** (git blob match).
- Headless phone (iPhone 13 + Pixel 7) and tablet (1024×768), dark + light: create → confirm → save (compact address, reference, phone) → .ics generated on iPhone (DTSTART local, TRIGGER -PT30M) / Google Calendar link on Android → Hoy → card opens with no keyboard → Registrar visita (+1 semana) → history + next date → directions chooser (Apple hidden on Android, Waze remembered) → Guardar zona cached tiles → zero page errors. Older v2 data migrated and displayed correctly.
- Firebase: loads only after opening Más (0 requests before). Sign-in could not be completed from the test server because the API key is referrer-restricted (`requests-from-referer-http://localhost-are-blocked`) — expected; production origin is the same as Ministry Tracker.

Supervisor acceptance (real devices):
1. iPhone: delete old Home Screen icon → Safari → Añadir a pantalla de inicio → new full-color icon.
2. iPhone: save a dated visit → confirm the Calendar "Añadir" sheet appears and the alarm is set. If iOS standalone does not show it, switch Más → Recordatorios → Calendario → Google Calendar.
3. Android: save a dated visit → Google Calendar opens pre-filled → Guardar.
4. Registrar visita → +1 semana → check Hoy / Revisitas / history.
5. Más → Sincronizar: sign in with the KHub account on phone and tablet; add a visit on one, open the other.
6. Mapa → Guardar zona while on Wi-Fi → airplane mode → map still shows that area.

Deferred: house photo (IndexedDB + sync size); push notifications (replaced by calendar per Supervisor).


## v1.4.1 — Approved batch (Supervisor: "go ahead and make all those improvements", 2026-09-23 07:35)

Worker: Claude / Opus 5.5 · Status: **READY FOR REVIEW** (see result below)

Repo vs tracker checked before coding: matches v1.4.0 (commit `f46b19f`), `npm run check` PASS. Supervisor's API-key rotation (`d97971a`, cloud-sync.js only) landed mid-task; fast-forwarded, no overlap.

Bugs:
1. **Stale calendar events** — rescheduling / Registrar visita adds a new calendar event but the old one stays. Fix: stable per-visit event UID (update replaces on iPhone .ics) + "calendar event date" tracking so the user is told to remove the old event when the date moves (Google Calendar links cannot delete).
2. **Privacy text** — "only on this device" is wrong when KHub sync is on. Text switches when signed in to sync (wording change approved by Supervisor in this batch).

Workflow:
3. **+ Nueva** opens a chooser: "Aquí (mi ubicación)" or "Elegir en el mapa".
4. Rename required field "Nombre o referencia" → **Nombre**.
5. New-visit form: Dirección aproximada + Notas move into "Más detalles".
6. Quick-date chips placed **before** the date inputs in both forms.
7. Hoy: remove the three counters; Próxima card no longer repeated as the first list item.
8. Hoy: new **Próximos días** section (next 7 days).
9. Revisitas filters reduced to **Activas · Sin fecha · Historial · Todas**.
10. **Añadir al calendario al guardar** default OFF; asked once on the first dated save.


## v1.4.1 result — READY FOR REVIEW

Correction to item 2: the live app already showed a sync-aware privacy sentence (i18n `privacyText`); only the HTML fallback said "solamente en este dispositivo". Now the fallback matches, and when signed in to sync the card switches to `privacyTextSynced` ("…en este dispositivo y en tu cuenta KHub…").

All 10 items implemented:
1. Calendar: one UID per visit (`revisita-{id}@khub`) + incrementing SEQUENCE; each visit remembers the slot it was sent for (`calendarSlot`, `calendarSeq` — device bookkeeping, does not bump `updatedAt`). When a calendared visit is rescheduled, ended ("No volver") or deleted, a **"Borra el aviso anterior"** sheet names the old date/time, then the new one is added. Limitation: a web app cannot delete phone-calendar events; visits sent to the calendar under v1.4.0 have no recorded slot, so they cannot be warned about.
2. Privacy text (above).
3. **+ Nueva / Nueva / Revisitas → Nueva** open "¿Dónde está la casa?": **Aquí — mi ubicación** (GPS → confirm pin) or **Elegir en el mapa**.
4. Field renamed **Nombre** (placeholder "Familia Pérez, doña Carmen").
5. Dirección aproximada + Notas moved into **Más detalles** (closed for new visits; open on edit when it holds notes/phone/left/topic).
6. Form order: Nombre → Referencia → **¿Cuándo vuelves?** (chips first, then fecha/hora) — same order as Registrar visita.
7. Hoy: counters removed; the Próxima card is no longer repeated in the lists and now has **Registrar visita**.
8. Hoy: **Próximos días** (next 7 days), date over time.
9. Revisitas filters: **Activas · Sin fecha · Historial · Todas**.
10. Calendar hand-off defaults **off**; the first dated save asks once (**Sí, añadir siempre / No, gracias**). v1.4.0 users are asked once too. Toggle in Más still works.
Also: extra bottom padding so the floating **+** never covers the last card's buttons.

Verification:
- `npm run check`: encoding clean (32) · syntax PASS · **45/45 tests PASS** (new: stable UID+SEQUENCE, calendar slot/stale detection, ask-once defaults, slot persistence) · KHub ship check PASS.
- Headless iPhone 13 walkthrough, 21/21 checks PASS, zero page errors: chooser → Aquí → confirm → Nombre form order → ask-once (No remembered) → Elegir en el mapa; seeded Hoy (Próxima not repeated, Próximos días only ≤7 days) → Registrar +2 semanas on a calendared visit → notice → .ics same UID, SEQUENCE 1 → notes-only edit does not touch calendar → "No volver" shows notice → privacy text → English chooser.
- App version **1.4.1** · shell cache **revisita-shell-v13-workflow-tweaks** (tiles/zones caches unchanged).

Supervisor acceptance (real phone):
1. Tap **+** → Aquí → confirm pin → save with +1 semana → answer the calendar question once.
2. Open that visit → Registrar visita → +2 semanas → the "Borra el aviso anterior" sheet appears → delete the old event in Calendar.
3. Hoy: Próxima card not repeated below; Próximos días shows this week's visits.
4. Revisitas: four filters, no swipe hint needed.

Delivery: shell `git push` is blocked for this repo in this session, so the files were pushed through the GitHub connector to branch `v1.4.1`, each file verified byte-for-byte against the tested local copy, then merged to `main` as one squash commit (single deploy).


## v1.4.2 — Llamar on Hoy cards (Supervisor: "Ok", 2026-09-23 13:21, to "add a small Llamar button to the cards on Hoy")

Worker: Claude / Opus 5.5 · Status: **READY FOR REVIEW** (see result below)

Repo vs tracker checked before coding: `main` = `cb75986` (v1.4.1), matches tracker.
Open issue carried over: GitHub Pages still serves **1.4.0** (~1 h 45 min after the v1.4.1 merge). The worker cannot see Pages/Actions logs from this session; Supervisor to check Actions → "pages build and deployment".

Scope:
1. On every Hoy card (Próxima revisita, Atrasadas, Para hoy, Próximos días), when the visit has a phone number (≥ 7 digits), show a **☎ Llamar** button that opens the phone dialer (`tel:`). No button when there is no number.
2. Nothing else changes.


## v1.4.2 result — READY FOR REVIEW

- **☎ Llamar** now appears on the Próxima revisita card and on every Atrasadas / Para hoy / Próximos días card when the visit has a phone number of 7+ digits; it opens the phone dialer (`tel:`). Cards without a number show nothing extra. English label: **Call**.
- New helper `telUrl()` in `js/visit-tools.js` (unit-tested). The visit card's existing Llamar/WhatsApp buttons are unchanged.
- `npm run check`: encoding clean (32) · syntax PASS · **46/46 tests PASS** · KHub ship check PASS.
- Headless iPhone 13, dark + light + English: 11/11 checks PASS, zero page errors (button present with correct `tel:` for 809-… and +1 829-…; absent for no number and for "809").
- App version **1.4.2** · shell cache **revisita-shell-v14-call-hoy**.
- NOT modified: calendar, sync, map, forms, data schema.

Supervisor acceptance (real phone, once Pages is publishing again): open Hoy → a visit with a phone shows ☎ Llamar → tap → dialer opens with the number.

Delivery: same as v1.4.1 (GitHub connector → branch `v1.4.2`, byte-for-byte check, squash-merge to `main`).
