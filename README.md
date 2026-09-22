# Revisita

PWA móvil en español para guardar la ubicación de una revisita, ponerle un nombre o referencia, añadir notas y programar una fecha para volver.

## Qué hace

- **GPS con un toque:** `Usar mi ubicación` toma la ubicación actual y abre el formulario.
- **Pin manual:** tocar cualquier punto del mapa crea una revisita en esa ubicación.
- **Mapa:** mosaicos de OpenStreetMap, con zoom y desplazamiento; las zonas vistas se guardan en caché para reutilizarlas sin conexión.
- **Revisitas:** nombre/referencia, dirección aproximada, notas y fecha para volver.
- **Lista:** búsqueda, filtros Hoy / Próximas / Sin fecha y distancia desde la última ubicación obtenida.
- **Acciones:** ver en mapa, abrir navegación del teléfono y compartir una ubicación.
- **Datos locales:** las revisitas se guardan en el dispositivo mediante `localStorage`.
- **Copia de seguridad:** exportación/importación JSON con vista previa, política de conflictos y snapshot de recuperación.
- **PWA:** instalable en Android y funcional para capturar/consultar revisitas aun cuando no haya red. El GPS puede seguir funcionando sin datos; los mosaicos nuevos y la búsqueda de dirección sí requieren conexión.

## Decisiones KHub

- **Modo:** Vanilla.
- **Arquetipo:** Task tracker / management.
- **Layout:** Standard (`--max-width: 960px`).
- **Idioma:** Español.
- **Zoom:** bloqueado en la interfaz instalada (`user-scalable=no`, `maximum-scale=1.0`) porque es una app móvil de uso rápido en campo; todos los campos mantienen 16px o más.
- **Tema:** oscuro por defecto, claro opcional.
- **Navegación:** 3 destinos: Mapa, Revisitas, Más.
- **Acción primaria del mapa:** Usar mi ubicación.

## Privacidad

Las revisitas, nombres y notas no se suben a un servidor propio. Permanecen en el dispositivo. Mientras hay conexión, el mapa solicita mosaicos a OpenStreetMap y la función de dirección aproximada consulta Nominatim/OpenStreetMap; esas solicitudes contienen la zona o coordenada consultada.

## Publicar con GitHub Pages

1. Crear un repositorio llamado `revisita`.
2. Subir el contenido de esta carpeta a la rama `main`.
3. En GitHub: **Settings → Pages → Deploy from a branch → main / root**.
4. Esperar a que GitHub Pages publique la URL HTTPS.
5. Abrirla en Chrome para Android y tocar **Instalar Revisita** o **Añadir a pantalla principal**.

El GPS del navegador requiere HTTPS; GitHub Pages lo proporciona.

## Verificación

```bash
npm test
npm run check:encoding
npm run ship-check
# o todo junto:
npm run check
```

## Dependencias de red

No hay librerías JavaScript de terceros en tiempo de ejecución. El motor de mapa es vanilla y propio. Solo se consumen servicios web públicos para mosaicos/direcciones, documentados en `docs/DEPENDENCY-INVENTORY.md`.
