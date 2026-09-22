# PROJECT_STATUS — Revisita

## Estado

**v1.1.0 implementada — READY FOR REVIEW.**

## Flujo actual

- La aplicación abre en **Hoy**.
- Hoy muestra **Atrasadas** y **Para hoy**, ordenadas por hora.
- El mapa ofrece **Hoy · Activas · Próximas · Todas · Cerca de mí**.
- Tocar el mapa o usar GPS crea un **pin provisional**.
- La ubicación requiere **Confirmar ubicación** antes de abrir el formulario.
- El formulario admite fecha + **hora opcional**.
- Las revisitas se pueden marcar **Hecha** o **Reprogramar**.
- Las visitas completadas pasan al **Historial**.
- Al abrir una revisita se muestra una **vista previa del mapa**.
- **Abrir en Google Maps** inicia navegación hacia las coordenadas.

## Datos

- Persistencia: `localStorage`, clave histórica `revisita.state.v1` para conservar compatibilidad.
- Esquema lógico actual: versión 2.
- Nuevos campos: `dueTime`, `status`, `completedAt`, `history`.
- Migración automática desde v1.
- Sin backend ni cuenta.

## Verificación automatizada

- Encoding check.
- JavaScript syntax check.
- Tests de mapas, distancias, agenda, importación y migración.
- KHub ship check.
- GitHub Pages despliega desde `main`.

## Pendiente de supervisor

Prueba breve en Android real:
1. Abrir Hoy.
2. Crear pin por toque y verificar que **no se guarda** antes de confirmar/guardar.
3. Crear pin por GPS y revisar precisión.
4. Guardar con fecha + hora.
5. Verlo en Hoy y en Mapa.
6. Marcar Hecha y Reprogramar.
7. Abrir una revisita y comprobar mapa previo + Google Maps.
8. Probar Cerca de mí e instalación PWA.
