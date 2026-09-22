# ACTIVE_TASK — Revisita

## Session / worker identity

- **Worker:** ChatGPT / GPT-5.6 Sol
- **Supervisor:** David Fontenelle
- **Session date:** 2026-09-22 EDT

## Status

- **Status:** IN PROGRESS
- **% complete:** 100% — responsive + tema + bilingüe implementado y verificado
- **Confidence:** 95%

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
