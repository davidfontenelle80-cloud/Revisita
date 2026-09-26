# PROJECT_STATUS — Revisita

## Estado

**Publicada: v1.5.7. v1.5.8: READY FOR REVIEW — búsqueda por país y formato de dirección.**

## Búsqueda por país + formato de dirección v1.5.8

- La búsqueda del mapa empieza con **País** y cambia los campos según el formato de dirección.
- **Estados Unidos:** Dirección, Ciudad, Estado, ZIP.
- **República Dominicana:** Calle/número, Sector/Barrio, Municipio/Ciudad, Provincia y Código postal opcional.
- **Otro país:** País + Dirección o lugar flexible.
- Para EE. UU. y RD la búsqueda queda limitada al país elegido para evitar coincidencias en otro país.
- Un solo toque en **Buscar en el mapa** aplica la mejor coincidencia y lleva el mapa allí.
- Corrige el fallo donde una búsqueda de un solo resultado podía dejar **Buscar** deshabilitado.
- Si falla la consulta directa al geocodificador, se reintenta con un fallback compatible con navegador.
- Versión **1.5.8** · shell cache **revisita-shell-v30-country-address-search**.
- GitHub Actions **Check #301 PASS** y PR **Check #302 PASS**.

## Búsqueda mueve el mapa automáticamente v1.5.7

- Al tocar **Buscar**, Revisita aplica inmediatamente la mejor coincidencia; ya no espera un segundo toque.
- En teléfono, cierra el teclado y lleva el mapa a la vista.
- Dirección exacta: crea pin provisional para confirmar.
- ZIP/código postal/ciudad/área: centra el mapa allí y pide tocar la casa exacta.
- Si hay varias coincidencias, deja visibles las alternativas para corregir la selección automática.
- Versión **1.5.7** · shell cache **revisita-shell-v29-auto-search-map**.
- GitHub Actions **Check #284 PASS**: `npm run check` + bundle seco del Worker.

## Buscar dirección / código postal v1.5.6

- El mapa incluye **Buscar dirección o código postal** (también sirve para sector/barrio/municipio).
- Muestra hasta cinco resultados cuando hay varias coincidencias.
- Un resultado con número de casa crea un pin provisional para confirmar.
- Un ZIP/código postal o resultado de área solo centra el mapa; el usuario toca el punto exacto de la casa para evitar falsa precisión.
- Reutiliza OpenStreetMap/Nominatim y conserva el flujo existente de confirmar/ajustar ubicación.
- Versión **1.5.6** · shell cache **revisita-shell-v28-address-search**.
- GitHub Actions **Check #271 PASS**: `npm run check` + bundle seco del Worker.

## Mejor precisión GPS v1.5.5

- **Usar mi ubicación** ya no toma la primera lectura inmediatamente: observa lecturas de alta precisión hasta ~8 segundos y conserva la mejor.
- Se detiene antes si alcanza **≤80 m** de precisión.
- Antes de confirmar, muestra **GPS preciso** (≤80 m), **GPS aproximado** (81–250 m) o **GPS poco preciso** (>250 m).
- Las precisiones grandes se muestran en km para que una ubicación muy aproximada sea evidente.
- **Ajustar ubicación** sigue disponible cuando el dispositivo no consigue una lectura confiable.
- **Más → Ubicación / GPS** usa la misma lógica de mejor lectura.
- Versión **1.5.5** · shell cache **revisita-shell-v27-gps-accuracy**.
- GitHub Actions **Check #254 PASS**: `npm run check` + bundle seco del Worker.

## Ajustes de ubicación / GPS v1.5.4

- **Más** incluye una tarjeta **Ubicación / GPS** con estado y botón para solicitar/probar la ubicación desde una acción directa del usuario.
- Si GPS funciona, muestra precisión aproximada y actualiza la posición actual usada por mapa/distancias.
- Si el permiso está bloqueado, muestra instrucciones específicas para iPad/iPhone o Android y vuelve a comprobar el estado al regresar a la app.
- En iPad/iPhone: Ajustes → Privacidad y seguridad → Localización → Revisita (si aparece) o Sitios web de Safari → Mientras se usa la app + Ubicación precisa.
- Versión **1.5.4** · shell cache **revisita-shell-v26-location-settings**.
- GitHub Actions **Check #238 PASS**: `npm run check` + bundle seco del Worker.

## Mapa visible en tablet portrait v1.5.3

- Corrige la regresión de v1.5.2 donde el layout lateral podía comprimir/ocultar el mapa en tablets de ~744–768 px.
- Entre 740 y 959 px: mapa primero a ancho completo; lista de revisitas con **Abrir / Cómo llegar** debajo.
- Desde 960 px: vuelve el layout dividido lista + mapa.
- Se conserva el traspaso de navegación iOS/iPadOS de v1.5.2.
- Versión **1.5.3** · shell cache **revisita-shell-v25-tablet-map-visibility**.

## Navegación iPad/tablet v1.5.2

- El layout dividido de Mapa + lista lateral empieza a 740 px, por lo que iPad portrait de 744/768 px ya muestra acciones directas **Abrir / Cómo llegar**.
- En iPhone/iPad, **Cómo llegar** usa navegación del mismo contexto hacia el universal link para mejorar el traspaso desde la PWA instalada a Apple Maps / Google Maps / Waze.
- Apple Maps aparece primero cuando iOS/iPadOS está disponible; Google Maps y Waze siguen disponibles.
- Las coordenadas guardadas del pin siguen siendo el destino; no se cambió el modelo de datos.
- Versión **1.5.2** · shell cache **revisita-shell-v24-tablet-navigation**.
- GitHub Actions **Check #212 PASS**: npm run check PASS + bundle seco del Worker PASS.
- Pendiente de aceptación: tocar **Cómo llegar** desde un iPad físico y confirmar que abre la app de navegación elegida.

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

- Versión app: **1.3.4**.
- Cache del service worker: **v11-map-viewport**.
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


## Rendimiento del mapa v1.3.3

- Causa del “glitch”: el mapa recreaba todos los tiles y marcadores en cada movimiento del dedo.
- Los tiles ahora se reutilizan y solo se agregan/quitan al entrar/salir del viewport con buffer.
- Marcadores, pin provisional y punto GPS se reutilizan durante el paneo.
- Los movimientos se renderizan como máximo una vez por animation frame.
- Posicionamiento mediante `translate3d` para reducir layout/paint.
- Wheel zoom ligeramente limitado para evitar saltos múltiples.
- Pruebas específicas impiden volver al patrón `replaceChildren()` durante paneo.
- GitHub Check: **22/22 PASS**; encoding 28 archivos; KHub ship check PASS.


## Apertura del mapa v1.3.4

- Se corrigió el caso donde iOS/PWA restauraba una posición vertical antigua y abría Mapa con los filtros fuera de pantalla.
- `history.scrollRestoration` se fuerza a `manual`.
- Entrar en **Mapa** ahora reinicia el scroll de página a la parte superior de forma inmediata.
- `pageshow` y el regreso desde background vuelven a asegurar la posición correcta cuando Mapa está activo.
- En teléfono, los filtros de Mapa quedan sticky debajo del encabezado para que sigan visibles aunque el usuario desplace la página.
- En tablet/escritorio, el toolbar vuelve a layout normal.
- Se añadieron pruebas de regresión específicas del viewport del mapa.


## Flujo de trabajo v1.4.0

- **Iconos**: reconstruidos en color real desde el arte original (`icons/source/revisita-artwork.webp`, `scripts/build-icons.py`). Apple touch 180 px nativo; maskable Android con zona segura. URLs versionadas `?v=1.4.0`. En iPhone hay que borrar y volver a añadir el icono una vez.
- **Tarjeta de revisita**: al abrir una revisita guardada se ve primero la tarjeta (sin teclado): Cómo llegar · Registrar visita; Llamar/WhatsApp si hay teléfono; Calendario · Compartir · Ver en mapa · Editar.
- **Registrar visita** reemplaza “Marcar como hecha”: nota, qué le dejaste, tema próximo, próxima fecha (+1 semana / +2 semanas / +1 mes / elegir) en un paso. “No volver” la pasa al historial. Cada visita queda en el historial.
- **Referencia** (cómo encontrar la casa) como dato principal; dirección automática corta; detalles opcionales (teléfono, qué le dejaste, tema).
- **Recordatorios por calendario** (en lugar de notificaciones push): al guardar con fecha se abre el calendario del teléfono con alarma (iPhone: .ics; Android: Google Calendar). Ajustes: activar/desactivar, minutos antes, tipo de calendario.
- **Navegación**: Google Maps, Waze o Apple Maps (iPhone), con opción de recordar.
- **Mapa**: 4 filtros (Hoy · Activas · Todas · Cerca), sin subtítulo, consejo solo la primera vez, mapa más alto, botón **Guardar zona** para usar sin conexión.
- **Encabezado**: estado pasivo “Guardado ✓ / Sin conexión” (ya no es un botón).
- **Sincronización opcional** con cuenta KHub (Firebase `khub-apps`), fusión por revisita + `updatedAt` con registros de borrado. Firebase solo se carga al abrir Más o si la sincronización está activa.
- Datos: esquema lógico **3** (campos `reference`, `phone`, `leftWith`, `nextTopic`; historial con `note`, `leftWith`, `ended`; `deleted`). Migración automática desde v1/v2.
- Versión app **1.4.0** · shell cache **revisita-shell-v12-workflow** · tiles **revisita-tiles-v1** · zonas **revisita-zones-v1**.


## Ajustes de flujo v1.4.1

- **+ Nueva** pregunta primero: **Aquí — mi ubicación** o **Elegir en el mapa**.
- Formulario: **Nombre** → Referencia → **¿Cuándo vuelves?** (chips antes de la fecha) → Más detalles (teléfono, dirección, notas, qué le dejaste, tema).
- **Hoy**: sin contadores; la Próxima revisita no se repite abajo y tiene **Registrar visita**; nueva sección **Próximos días** (7 días).
- **Revisitas**: filtros Activas · Sin fecha · Historial · Todas.
- **Calendario**: apagado por defecto y se pregunta una vez. UID fijo por revisita + SEQUENCE. Al reprogramar, terminar o borrar una revisita que ya estaba en el calendario, aparece **Borra el aviso anterior** (una web app no puede borrar eventos del calendario).
- **Privacidad**: el texto cambia cuando la sincronización está activa.
- Datos: campos de visita `calendarSlot`, `calendarSeq`; ajustes `calendarAsked`.
- Versión **1.4.1** · shell cache **revisita-shell-v13-workflow-tweaks**.


## Llamar en Hoy v1.4.2

- **☎ Llamar** en la tarjeta Próxima revisita y en cada tarjeta de Hoy (Atrasadas, Para hoy, Próximos días) cuando la revisita tiene teléfono (7+ dígitos). Abre el marcador del teléfono.
- Versión **1.4.2** · shell cache **revisita-shell-v14-call-hoy**.

## Mapa rural y seguimiento v1.4.3

- El mapa conserva su posición al volver a la pestaña. La ubicación automática solo centra la primera apertura, y nunca interrumpe un movimiento o selección del usuario.
- Se puede saltar a latitud y longitud sin dirección ni conexión de geocodificación; el pin todavía requiere tocar el mapa y confirmarlo.
- Guardar zona pide acercar el mapa cuando el área visible supera el límite de mosaicos. No informa éxito con cero mosaicos.
- La tarjeta muestra las últimas ocho visitas y permite expandir el historial completo.
- El contador singular del mapa se muestra correctamente en español e inglés.
- Versión **1.4.3** · shell cache **revisita-shell-v15-rural-map**.

## Fluidez del mapa v1.4.4

- Los mosaicos ya cargados permanecen visibles al acercar o alejar hasta que cargan los nuevos mosaicos visibles. Se priorizan los mosaicos dentro de la pantalla.
- Se retira el campo de latitud/longitud de la interfaz; el pin se sigue colocando en el mapa o por GPS.
- Versión **1.4.4** · shell cache **revisita-shell-v16-map-speed**.

## Avisos v1.4.5 (borrador; despliegue bloqueado, auditoría 2026-09-24)

- Avisos Web Push opcionales por dispositivo, cinco minutos antes de revisitas con hora. Reprogramar o borrar sincroniza con el Worker.
- El Worker programado requiere KV, claves VAPID y despliegue Cloudflare. No está activo en GitHub Pages hasta comprobar entrega real con la app cerrada.
- Calendario `.ics` admite alarma de cinco minutos; el enlace de Google Calendar usa las preferencias del calendario.
- Auditoría corregida: propiedad de tokens, límites/validación, sincronización atómica por dispositivo con Durable Object, KV para recibos operativos, permisos por acción directa, limpieza de suscripciones caducadas y zona horaria persistente con DST.
- `npm run check`: 58/58 PASS; GitHub Check y bundle seco de Wrangler PASS (run 36048763662); prueba local en Chrome abre y acerca el mapa. Pruebas criptográficas descifran el payload y verifican VAPID; no equivalen a recepción real.
- Cuenta/subdominio confirmados: `3df617adc3ddf2b3ed89cedbbb917fab`, `davidfontenelle80.workers.dev`. Worker previsto: `revisita-push`; no desplegado. Revisión automática bloqueó OAuth de Wrangler y conexión GitHub desde Cloudflare.
- Faltan KV, claves VAPID, despliegue, salud/cron y recepción con app cerrada. PR #5 sigue borrador; no hay merge. Ministry Tracker y datos de usuarios no modificados.
