# Service Worker Operations

- Stable cache prefix: `revisita-`.
- Shell cache: `revisita-shell-v1`.
- Tile cache: `revisita-tiles-v1`.
- `CACHE_VERSION` must be bumped when required shell assets change in a way that needs forced refresh.
- Activate deletes only historical caches whose names start with `revisita-`.
- Navigation failures fall back to cached `index.html`.
- Scripts/styles/assets never receive HTML fallback.
- Tile runtime cache is capped at approximately 220 entries.
