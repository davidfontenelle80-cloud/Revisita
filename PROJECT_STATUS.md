# PROJECT_STATUS — Revisita

## Estado

Versión 1.0.0 implementada en `davidfontenelle80-cloud/Revisita` y **READY FOR REVIEW**.

## Flujo principal

1. Abrir **Mapa**.
2. Tocar **Usar mi ubicación** o tocar el mapa.
3. Escribir nombre/referencia y, si se desea, dirección, notas y fecha.
4. Guardar.
5. Consultar en **Revisitas**, buscar/filtrar, abrir el registro, navegar, compartir o editar.

## Datos

- Persistencia: `localStorage`, clave `revisita.state.v1`.
- Snapshot preimportación: `revisita.preimport.v1`.
- Sin backend ni cuenta.
- OpenStreetMap/Nominatim solo se usan para mosaicos y dirección aproximada cuando hay conexión.

## Verificación

- GitHub Actions `Check`: PASS.
- Tests: 6/6.
- Encoding: PASS.
- KHub ship check: PASS.
- Archivos e iconos PWA presentes en `main`.

## Pendiente

- Activar GitHub Pages desde **Settings → Pages → Deploy from a branch → main / root**.
- Probar en Android real: GPS, instalación PWA, guardar/editar/eliminar, mapa, copia de seguridad y **Cómo llegar**.
