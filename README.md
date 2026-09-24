# Revisita

PWA bilingüe (**Español / English**) para organizar revisitas por **ubicación, fecha, hora y estado**.

## KHub profile

- **Mode:** Vanilla.
- **Archetype:** Task tracker / management.
- **Layout:** Standard (`--max-width: 960px`).
- **Theme:** dark or light, selectable in **Más / More → Apariencia / Appearance**.
- **Language:** Spanish or English, selectable in **Más / More → Idioma / Language**.
- **Responsive:** phone, tablet, landscape tablet, laptop and desktop.
- **Orientation:** unrestricted (`any`) so tablets can rotate.
- **Zoom:** locked in the installed UI, following the KHub phone-first field-use default. Responsive layout does not depend on browser zoom; all form controls remain at least 16px.

## Main flow

1. Revisita opens on **Hoy / Today** and shows overdue visits first, then visits scheduled for the day.
2. In **Mapa / Map**, tap a point or use **Usar mi ubicación / Use my location**.
3. The pin remains **temporary**. Nothing is saved yet.
4. Review the approximate address, coordinates and GPS accuracy, move the pin if needed, then confirm the location.
5. Add name/reference, notes, **date** and optional **time**.
6. Save the return visit.

## Features

- **Today dashboard:** overdue + today, ordered by time.
- **Optional return time.**
- **Done / Reschedule:** completed visits move to history instead of disappearing.
- **Map modes:** Today, Active, Upcoming, All and Near me.
- **Near me:** active return visits within 5 km when GPS is available.
- **Location confirmation:** tapping the map never saves by itself.
- **Saved-location preview:** opening a return visit shows a map preview centered on its pin.
- **Google Maps:** explicit navigation button.
- **Search and filters** for name, address, note, status and schedule.
- **Local storage:** return visits remain on the device.
- **Backup / restore:** JSON export/import with preview, conflict policy and recovery snapshot.
- **Offline/PWA:** app shell, saved data and previously viewed map tiles remain available offline.
- **Responsive shell:** horizontal rows show swipe hints only when more choices are off-screen; wider screens reflow cards and settings into columns.
- **EN/ES localization:** static UI, dynamic messages, dates and times follow the selected language.
- **Light / dark mode:** explicit two-button choice, persisted locally.
- **Keyboard:** `Alt+L` switches language and `Alt+D` switches theme on hardware keyboards.

## Compatibility

Version 1.4.4 keeps the same local data key and migrates older v1 data automatically. Existing return visits keep their date, notes and location; newer fields such as status, history and optional time are added safely.

## Privacy

Names, notes and return visits stay on the device. While online, OpenStreetMap provides map tiles and Nominatim can resolve an approximate address from coordinates.

## Publication

GitHub Pages publishes `main`:

`https://davidfontenelle80-cloud.github.io/Revisita/`

## Verification

```bash
npm run check
```

This runs encoding checks, JavaScript syntax checks, unit tests and the KHub ship check.

## Network dependencies

There are no JavaScript frameworks or external fonts. The map engine is vanilla. Map/address services are documented in `docs/DEPENDENCY-INVENTORY.md`.


## Location behavior

- On launch, Revisita requests the current device location when geolocation is available.
- Opening **Mapa / Map** centers the map on the current location automatically.
- Automatic location only updates the current-position dot and map center; it does **not** create or save a return visit.
- **Usar mi ubicación / Use my location** still creates a provisional pin that must be confirmed before saving.
- The confirmation panel is viewport-fixed above the bottom navigation so its buttons remain visible on phones and tablets.


## iPhone cache-delivery fix in 1.3.1

- App shell URLs are versioned so older service workers cannot keep serving stale CSS/JavaScript after a deployment.
- Service-worker registration bypasses the browser HTTP cache for update checks.
- This ensures the existing fixed confirmation panel behavior reaches iPhone/iPad reliably.

## User-side polish in 1.3.0

- **Next return visit card** on Today with quick Open and Directions actions.
- **Tablet split view:** visible return visits are listed beside the map on wider screens, with distance, schedule, Open and Directions.
- **Universal + New button** keeps creating a return visit one tap away.
- While confirming a provisional pin, the bottom navigation is temporarily hidden so the location-confirmation actions stay visually dominant.
- Brand-new users with no saved visits get a short three-step onboarding guide.


## Reliable update delivery in 1.3.2

Revisita now follows the KHub service-worker update pattern used by the stronger apps in this account:

- The app shell is **network-first** while online, with the current cache used only as an offline fallback.
- A new service worker installs atomically, calls **skipWaiting**, claims clients and broadcasts **RELOAD_READY**.
- The app calls `registration.update()` on every startup and re-checks when it returns to the foreground.
- Reloads happen automatically only when there is no open dialog, provisional location or focused form control; otherwise the update banner is shown.
- Critical CSS/JS/module URLs are versioned for the transition away from the previous cache-first worker.
- The OpenStreetMap tile cache is kept separate and stable so app updates do not unnecessarily discard previously viewed map tiles.
- Regression tests verify the update lifecycle and versioned critical assets.


## Map smoothness in 1.3.3

A performance issue in the custom map renderer was causing visible flicker/jank during panning. The old renderer destroyed and recreated every visible OpenStreetMap tile and every marker on each pointer-move render.

The map now:
- reuses tile DOM nodes keyed to map tiles,
- only adds/removes tiles as they enter or leave the buffered viewport,
- reuses marker/user/draft nodes while panning,
- coalesces redraws to one per animation frame,
- positions moving layers with GPU-friendly `translate3d`,
- slightly throttles wheel zoom on desktop.

This keeps existing tap-to-pin, GPS, marker, fit-to-visits and offline tile behavior while substantially reducing DOM/image churn.

## Rural map workflow in 1.4.3

- The map keeps the last viewed area when switching tabs. Automatic GPS centering happens only on first opening and does not override map interaction.
- Enter latitude and longitude to jump to a rural area. Then tap the house and confirm its provisional pin.
- Saving an offline area at too wide a zoom asks you to zoom in; an empty tile selection cannot be reported as a saved area.
- Older visit history can be expanded past the eight most recent entries.

## Map responsiveness in 1.4.4

- Zoom keeps previously loaded map tiles visible at the new scale until the visible tiles finish loading. New visible tiles load before the panning buffer.
- The latitude/longitude entry has been removed; use the map or GPS to place a pin. Coordinates remain stored internally with each location.
