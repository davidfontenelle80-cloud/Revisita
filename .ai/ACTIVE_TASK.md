# ACTIVE_TASK — Revisita

## Session / worker identity

- **Worker:** ChatGPT / GPT-5.6 Sol
- **Supervisor:** David Fontenelle
- **Session date:** 2026-09-22 EDT

## Status

- **Status:** IN PROGRESS
- **% complete:** 10%
- **Confidence:** 95%

## Objective

Actualizar Revisita a una versión de seguimiento diario y mapa operativo, manteniendo el flujo simple en Android.

## Scope approved by supervisor

- Añadir **hora opcional** además de fecha para volver.
- Abrir la app en una vista **Hoy** que muestre atrasadas y las revisitas del día, ordenadas por hora.
- Añadir acciones rápidas **Hecha** y **Reprogramar**, conservando historial de visitas completadas.
- Cambiar la navegación a **Hoy · Mapa · Revisitas · Más**.
- Añadir modos del mapa: **Hoy · Activas · Próximas · Todas**, con opción **Cerca de mí**.
- Un toque en el mapa o GPS crea solo una **ubicación pendiente**: nunca guarda automáticamente.
- Antes de abrir el formulario, mostrar **¿Es esta la ubicación correcta?**, dirección aproximada, coordenadas y precisión GPS cuando exista.
- Permitir mover el pin tocando otro punto antes de confirmar.
- Al abrir una revisita guardada, mostrar un **mapa de vista previa** centrado en su ubicación.
- Añadir botón explícito **Abrir en Google Maps** para navegación.
- Mantener compatibilidad con datos existentes de v1.
- Mantener PWA/offline, import/export y KHub standards.

## Files expected to change

- `index.html`
- `css/main.css`
- `js/app.js`
- `js/map.js`
- `js/storage.js`
- `js/schedule-utils.js` (nuevo)
- `tests/**`
- `sw.js`
- `manifest.json`
- `README.md`
- `PROJECT_STATUS.md`
- `.ai/ACTIVE_TASK.md`

## Verification plan

- GitHub Actions: `npm run check`.
- Tests de migración v1 → nuevo esquema, orden de Hoy y clasificación activa/completada.
- Verificar que no se guarde una revisita hasta `Guardar revisita`.
- Verificar que el pin pendiente requiera `Confirmar ubicación`.
- Verificar mapa de detalle y URL de Google Maps.
- Prueba final en Android real por el supervisor.

## Next step if interrupted

Implementar el nuevo modelo de datos y UI, actualizar cache version, ejecutar GitHub Actions y dejar en `READY FOR REVIEW`.

## Supervisor Review

- **Review status:** NOT REVIEWED
- **Reviewed by:**
- **Reviewed at:**
- **Observations / required changes:**
