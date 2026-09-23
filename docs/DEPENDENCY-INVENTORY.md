# Dependency Inventory

Revisita no carga frameworks, librerías, fuentes ni icon fonts de terceros en el shell. La única excepción es Firebase (opcional, carga diferida) para la sincronización.

## OpenStreetMap tiles

- Runtime URL: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- Purpose: map imagery.
- Offline behavior: previously viewed tiles are cached by `sw.js`; missing tiles show the app's local grid background.
- Attribution: visible in the map UI: `© OpenStreetMap contributors`.

## Nominatim / OpenStreetMap

- Runtime URL: `https://nominatim.openstreetmap.org/reverse`
- Purpose: optional approximate reverse-geocoded address.
- Trigger: when a new pin is opened while online, or when the user taps Buscar.
- Offline behavior: skipped; coordinates remain usable.

## Google Maps URL

- Used only to create shareable text links. No Google script is loaded into the app.

## Android `geo:` URI

- Used for Cómo llegar; hands the coordinate to a compatible navigation app installed on the device.

## Offline zones (v1.4.0)

- "Guardar zona" pre-caches the visible map area into `revisita-zones-v1` (never trimmed; survives shell updates).
- Capped at 200 tiles per save, zoom ≥ 14, to respect the OSM tile usage policy (no bulk download ≥ 250 tiles at z13+). Two parallel requests max.

## Directions (v1.4.0)

- Google Maps `https://www.google.com/maps/dir/?api=1&destination=lat,lng`, Waze `https://waze.com/ul?ll=lat,lng&navigate=yes`, Apple Maps `https://maps.apple.com/?daddr=lat,lng` (offered only on iPhone/iPad). Links only; no scripts.

## Calendar reminders (v1.4.0, replaces push notifications)

- iPhone (auto): an `.ics` file generated on-device (VEVENT + VALARM) handed to the system Calendar.
- Android (auto): Google Calendar create-event link `https://calendar.google.com/calendar/render?action=TEMPLATE…`. Links only; no scripts.

## Firebase (optional sync, v1.4.0)

- Runtime: `https://www.gstatic.com/firebasejs/10.12.2/firebase-{app,auth,firestore}.js` via dynamic `import()`.
- Loaded ONLY after the user opens **Más** or has turned sync on. Never precached; offline the app works without it.
- Project `khub-apps` (shared KHub). Data path `backups/revisita/users/{uid}/meta/latest`, covered by the existing rule `backups/{appId}/users/{userId}/**` (owner-only read/write).
- The web API key is referrer-restricted: requests from `localhost` are rejected (verified); production origin `davidfontenelle80-cloud.github.io` is the same one Ministry Tracker already uses.
