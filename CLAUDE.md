# Build and Ship Rules for Revisita

## AI Session Continuity

1. Leer `.ai/ACTIVE_TASK.md` primero.
2. Leer `PROJECT_STATUS.md` y este archivo.
3. Verificar que el repo coincide con la documentación.
4. Marcar `IN PROGRESS` antes de cambios y actualizar `ACTIVE_TASK.md` al terminar.
5. Un worker termina en `READY FOR REVIEW` o `BLOCKED`; solo David aprueba.

## UX KHub

- Vanilla PWA, task tracker/management, layout Standard.
- Tema oscuro por defecto y tema claro funcional.
- Máximo 5 destinos; Revisita usa 3.
- Campos de texto mínimo 16px.
- Offline: el shell y la tarea de guardar/consultar revisitas funcionan sin red; los mosaicos ya vistos se cachean.
- Importación cumple vista previa, política explícita, snapshot, confirmación, aplicación y restauración.
- Cache prefix exclusivo `revisita-`; nunca borrar caches ajenos.
- Usar tokens CSS para color, radio, espacio, sombra y movimiento.

## Ship check

Ejecutar `npm run check`. Verificar también en Android real: GPS, instalación PWA, mapa, crear/editar/eliminar, exportar/importar y abrir navegación.
