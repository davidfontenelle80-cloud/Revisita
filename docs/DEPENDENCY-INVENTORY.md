# Dependency Inventory

Revisita no carga frameworks, librerías, fuentes ni icon fonts de terceros.

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
