# Revisita

PWA móvil en español para organizar revisitas por **ubicación, fecha, hora y estado**.

## Flujo principal

1. La app abre en **Hoy** y muestra primero las revisitas atrasadas y las programadas para el día.
2. En **Mapa**, toca un punto o usa **Usar mi ubicación**.
3. El pin queda **provisional**. Nada se guarda todavía.
4. Revisa dirección aproximada, coordenadas y precisión GPS (si aplica), mueve el pin si hace falta y pulsa **Confirmar ubicación**.
5. Añade nombre/referencia, notas, **fecha** y **hora opcional**.
6. Pulsa **Guardar revisita**.

## Funciones

- **Hoy:** atrasadas + revisitas del día, ordenadas por hora.
- **Hora opcional:** permite programar una hora concreta o dejar solo la fecha.
- **Hecha / Reprogramar:** marca una revisita completada o cambia su próxima fecha/hora.
- **Historial:** conserva las visitas completadas.
- **Mapa por modo:** Hoy, Activas, Próximas, Todas y Cerca de mí.
- **Cerca de mí:** muestra las revisitas activas dentro de 5 km cuando el GPS está disponible.
- **Confirmación de ubicación:** un toque en el mapa nunca guarda por sí solo.
- **Vista previa:** al abrir una revisita guardada se muestra un mapa centrado en el punto.
- **Google Maps:** botón explícito para abrir navegación hacia la revisita.
- **Buscar/filtrar:** por nombre, dirección, nota, estado y programación.
- **Datos locales:** las revisitas se guardan en el dispositivo con `localStorage`.
- **Copia de seguridad:** exportación/importación JSON con vista previa, conflictos y snapshot de recuperación.
- **PWA/offline:** el shell, las revisitas y los mosaicos ya vistos siguen disponibles sin conexión.

## Compatibilidad

La versión 1.1.0 migra automáticamente los datos creados con la versión 1.0.0. Las revisitas antiguas quedan **Activas**, sin hora, y conservan su fecha, notas y ubicación.

## Privacidad

Los nombres, notas y revisitas permanecen en el dispositivo. Cuando hay conexión, OpenStreetMap entrega los mosaicos y Nominatim puede resolver una dirección aproximada a partir de las coordenadas.

## Publicación

GitHub Pages publica la rama `main`:

`https://davidfontenelle80-cloud.github.io/Revisita/`

## Verificación

```bash
npm run check
```

Incluye encoding, sintaxis JavaScript, pruebas unitarias y KHub ship check.

## Dependencias de red

No hay frameworks JavaScript ni fuentes externas. El motor del mapa es vanilla. Los servicios de mapa/dirección se documentan en `docs/DEPENDENCY-INVENTORY.md`.
