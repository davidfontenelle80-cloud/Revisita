# PROJECT_STATUS — Revisita

## Estado

**v1.3.2 implementada — READY FOR REVIEW.**

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

- Versión app: **1.3.2**.
- Cache del service worker: **v9-auto-update**.
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


## Pulido de experiencia v1.3.0

- **Próxima revisita** destacada en Hoy.
- Botones rápidos **Abrir** y **Cómo llegar**.
- Vista dividida en tablet/escritorio: lista de revisitas visibles + mapa.
- La lista lateral muestra horario, dirección/distancia y navegación.
- Botón flotante universal **+ Nueva**.
- Durante la confirmación de ubicación se oculta temporalmente la navegación inferior.
- Guía inicial de tres pasos para usuarios nuevos sin revisitas guardadas.
- Selección de “próxima revisita” cubierta por pruebas unitarias.


## Entrega de actualización en iPhone v1.3.1

- Los assets principales y módulos usan URLs versionadas para evitar que un service worker viejo sirva UI antigua.
- El registro del service worker usa `updateViaCache: 'none'`.
- La captura del supervisor mostraba una versión antigua: todavía aparecía “Guardado localmente” y la navegación inferior seguía visible al confirmar.
- En la versión actual, la confirmación de ubicación queda fija y visible, y la navegación/FAB se ocultan durante la confirmación.
- GitHub Actions `Check`: PASS.
- GitHub Pages: build/deploy PASS.


## Ajuste de filtros v1.3.1

- La pista **“Desliza para ver más →”** ya no se superpone sobre los botones.
- Ahora aparece en una línea independiente encima de los filtros.
- Solo aparece cuando hay opciones fuera de pantalla y se oculta al llegar al final.
- Se eliminó el espacio reservado que antes podía hacer parecer que faltaba una categoría.
- Al seleccionar una categoría, el chip elegido se desplaza automáticamente a una posición visible.


## Entrega de actualizaciones v1.3.2

- Se comparó el patrón de Revisita con **KHub Boilerplate**, Ministry Tracker, Talk Arrangements y Umbriq.
- El shell de Revisita cambió de **cache-first** a **network-first** cuando hay conexión.
- El nuevo worker usa instalación atómica, `skipWaiting()`, `clients.claim()` y mensaje `RELOAD_READY`.
- La app fuerza una búsqueda de actualización al arrancar y vuelve a comprobar al regresar al primer plano.
- Si es seguro, recarga automáticamente; si hay un diálogo/formulario/pin pendiente, muestra el aviso de actualización en vez de interrumpir.
- CSS, app y módulos críticos usan `?v=1.3.2` para romper el ciclo del worker cache-first anterior.
- El cache de mosaicos OSM queda separado como `revisita-tiles-v1` y sobrevive a actualizaciones del shell.
- Se añadieron pruebas de regresión específicas para el service worker.
