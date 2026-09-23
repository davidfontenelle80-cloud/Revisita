# PROJECT_STATUS — Revisita

## Estado

**v1.2.2 implementada — READY FOR REVIEW.**

## Flujo actual

- La app abre en **Hoy / Today**.
- Hoy muestra atrasadas y las programadas para el día, ordenadas por hora.
- El mapa ofrece **Hoy · Activas · Próximas · Todas · Cerca de mí** y sus equivalentes en inglés.
- Tocar el mapa o usar GPS crea un **pin provisional**.
- La ubicación se confirma antes de abrir el formulario.
- El formulario admite fecha + hora opcional.
- Las revisitas se pueden marcar hechas o reprogramar.
- El historial conserva visitas completadas.
- Al abrir una revisita se muestra un mapa previo de la ubicación.
- Google Maps abre navegación hacia las coordenadas guardadas.

## Responsive / pantallas

- Layout KHub **Standard 960** centrado.
- Teléfonos: una columna y navegación compacta.
- Tablets: tarjetas/listas en dos columnas cuando hay espacio.
- Tablets grandes/laptops: diálogo más ancho, mapa más alto y navegación centrada.
- Landscape: altura de mapa adaptativa.
- Manifest permite orientación **any**.
- Las filas horizontales mantienen la pista **Desliza / Swipe para ver más** solo cuando hace falta.

## Apariencia e idioma

- **Oscuro / Dark** y **Claro / Light** con control explícito.
- **Español / English** con control explícito.
- La elección de tema se conserva en el estado local.
- El idioma se guarda localmente en `revisita.lang`.
- Fechas, horas, textos dinámicos, errores y mensajes siguen el idioma elegido.
- Atajos en teclado físico: `Alt+L` idioma, `Alt+D` tema.

## Datos

- Persistencia de revisitas: `localStorage`, clave histórica `revisita.state.v1`.
- Esquema lógico: versión 2.
- Campos: `dueTime`, `status`, `completedAt`, `history`.
- Migración automática desde datos anteriores.
- Sin backend ni cuenta.

## PWA

- Versión app: **1.2.2**.
- Cache del service worker: **v6**.
- `js/i18n.js` se incluye en el precache.
- GitHub Pages despliega desde `main`.

## Verificación automatizada

- Encoding check.
- JavaScript syntax check, incluido i18n.
- Tests de mapas, distancias, agenda, importación, migración, historial e idiomas.
- KHub ship check.

## Pendiente de supervisor

Prueba visual/funcional en:
1. teléfono pequeño,
2. teléfono grande,
3. tablet portrait,
4. tablet landscape,
5. tema claro y oscuro,
6. español e inglés,
7. flujo completo de crear, confirmar ubicación, guardar, abrir y navegar.


## Ajuste de ubicación v1.2.2

- Solicita ubicación automáticamente al abrir la app.
- Al abrir **Mapa**, centra la vista en la ubicación actual si está disponible.
- La ubicación automática no crea ni guarda una revisita.
- **Usar mi ubicación** conserva el flujo de pin provisional + confirmación.
- El panel de confirmación ahora queda fijo por encima de la navegación inferior y puede desplazarse internamente si la pantalla es baja.
