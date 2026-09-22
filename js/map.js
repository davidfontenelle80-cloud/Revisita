import { TILE_SIZE, clamp, latLngToWorld, worldToLatLng } from './map-utils.js';

export class SimpleMap {
  constructor(element, options = {}) {
    this.el = element;
    this.center = { lat: options.lat ?? 18.7357, lng: options.lng ?? -70.1627 };
    this.zoom = clamp(Math.round(options.zoom ?? 8), 2, 19);
    this.markers = [];
    this.draft = null;
    this.userLocation = null;
    this.onTap = () => {};
    this.onMarkerTap = () => {};
    this.onViewChange = () => {};
    this.drag = null;
    this.lastSize = { w: 0, h: 0 };
    this.buildLayers();
    this.bind();
    this.resizeObserver = new ResizeObserver(() => this.render());
    this.resizeObserver.observe(this.el);
    this.render();
  }

  buildLayers() {
    this.tileLayer = document.createElement('div');
    this.tileLayer.className = 'tile-layer';
    this.markerLayer = document.createElement('div');
    this.markerLayer.className = 'marker-layer';
    this.el.append(this.tileLayer, this.markerLayer);
  }

  bind() {
    this.el.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      this.el.setPointerCapture?.(event.pointerId);
      this.drag = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        moved: false,
      };
    });

    this.el.addEventListener('pointermove', (event) => {
      if (!this.drag || this.drag.id !== event.pointerId) return;
      const dx = event.clientX - this.drag.lastX;
      const dy = event.clientY - this.drag.lastY;
      const total = Math.hypot(event.clientX - this.drag.startX, event.clientY - this.drag.startY);
      if (total > 7) this.drag.moved = true;
      if (dx || dy) {
        const c = latLngToWorld(this.center.lat, this.center.lng, this.zoom);
        const ll = worldToLatLng(c.x - dx, c.y - dy, this.zoom);
        this.center = { lat: ll.lat, lng: normalizeLng(ll.lng) };
        this.drag.lastX = event.clientX;
        this.drag.lastY = event.clientY;
        this.render();
      }
    });

    const end = (event) => {
      if (!this.drag || this.drag.id !== event.pointerId) return;
      const moved = this.drag.moved;
      this.drag = null;
      if (!moved) {
        const rect = this.el.getBoundingClientRect();
        const ll = this.screenToLatLng(event.clientX - rect.left, event.clientY - rect.top);
        this.onTap(ll);
      } else {
        this.onViewChange({ ...this.center, zoom: this.zoom });
      }
    };
    this.el.addEventListener('pointerup', end);
    this.el.addEventListener('pointercancel', () => { this.drag = null; });

    this.el.addEventListener('wheel', (event) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 1 : -1;
      this.setZoom(this.zoom + delta);
    }, { passive: false });
  }

  screenToLatLng(x, y) {
    const centerWorld = latLngToWorld(this.center.lat, this.center.lng, this.zoom);
    return worldToLatLng(
      centerWorld.x + x - this.el.clientWidth / 2,
      centerWorld.y + y - this.el.clientHeight / 2,
      this.zoom,
    );
  }

  setView(lat, lng, zoom = this.zoom) {
    this.center = { lat: clamp(Number(lat), -85, 85), lng: normalizeLng(Number(lng)) };
    this.zoom = clamp(Math.round(zoom), 2, 19);
    this.render();
    this.onViewChange({ ...this.center, zoom: this.zoom });
  }

  setZoom(zoom) {
    const next = clamp(Math.round(zoom), 2, 19);
    if (next === this.zoom) return;
    this.zoom = next;
    this.render();
    this.onViewChange({ ...this.center, zoom: this.zoom });
  }

  setMarkers(markers) {
    this.markers = Array.isArray(markers) ? markers : [];
    this.renderMarkers();
  }

  setDraft(lat, lng) {
    this.draft = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
    this.renderMarkers();
  }

  setUserLocation(lat, lng) {
    this.userLocation = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
    this.renderMarkers();
  }

  render() {
    if (!this.el.clientWidth || !this.el.clientHeight) return;
    this.renderTiles();
    this.renderMarkers();
  }

  renderTiles() {
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;
    const centerWorld = latLngToWorld(this.center.lat, this.center.lng, this.zoom);
    const left = centerWorld.x - width / 2;
    const top = centerWorld.y - height / 2;
    const minTx = Math.floor(left / TILE_SIZE) - 1;
    const maxTx = Math.floor((left + width) / TILE_SIZE) + 1;
    const minTy = Math.floor(top / TILE_SIZE) - 1;
    const maxTy = Math.floor((top + height) / TILE_SIZE) + 1;
    const n = 2 ** this.zoom;
    const frag = document.createDocumentFragment();

    for (let ty = minTy; ty <= maxTy; ty += 1) {
      if (ty < 0 || ty >= n) continue;
      for (let tx = minTx; tx <= maxTx; tx += 1) {
        const wrappedX = ((tx % n) + n) % n;
        const img = document.createElement('img');
        img.className = 'map-tile';
        img.alt = '';
        img.draggable = false;
        img.decoding = 'async';
        img.src = `https://tile.openstreetmap.org/${this.zoom}/${wrappedX}/${ty}.png`;
        img.style.left = `${Math.round(tx * TILE_SIZE - left)}px`;
        img.style.top = `${Math.round(ty * TILE_SIZE - top)}px`;
        frag.append(img);
      }
    }
    this.tileLayer.replaceChildren(frag);
  }

  renderMarkers() {
    if (!this.markerLayer || !this.el.clientWidth) return;
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;
    const centerWorld = latLngToWorld(this.center.lat, this.center.lng, this.zoom);
    const left = centerWorld.x - width / 2;
    const top = centerWorld.y - height / 2;
    const worldWidth = 2 ** this.zoom * TILE_SIZE;
    const frag = document.createDocumentFragment();

    const point = (lat, lng) => {
      let p = latLngToWorld(lat, lng, this.zoom);
      let dx = p.x - centerWorld.x;
      if (dx > worldWidth / 2) p = { ...p, x: p.x - worldWidth };
      if (dx < -worldWidth / 2) p = { ...p, x: p.x + worldWidth };
      return { x: p.x - left, y: p.y - top };
    };

    this.markers.forEach((marker) => {
      const p = point(marker.lat, marker.lng);
      if (p.x < -50 || p.y < -50 || p.x > width + 50 || p.y > height + 50) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'marker';
      btn.style.left = `${p.x}px`;
      btn.style.top = `${p.y}px`;
      btn.setAttribute('aria-label', `Abrir revisita ${marker.name || ''}`.trim());
      btn.addEventListener('pointerdown', (e) => e.stopPropagation());
      btn.addEventListener('click', (e) => { e.stopPropagation(); this.onMarkerTap(marker.id); });
      frag.append(btn);
    });

    if (this.draft) {
      const p = point(this.draft.lat, this.draft.lng);
      const marker = document.createElement('div');
      marker.className = 'marker draft';
      marker.style.left = `${p.x}px`;
      marker.style.top = `${p.y}px`;
      frag.append(marker);
    }

    if (this.userLocation) {
      const p = point(this.userLocation.lat, this.userLocation.lng);
      const dot = document.createElement('div');
      dot.className = 'user-dot';
      dot.style.left = `${p.x}px`;
      dot.style.top = `${p.y}px`;
      frag.append(dot);
    }
    this.markerLayer.replaceChildren(frag);
  }
}

function normalizeLng(lng) {
  let value = lng;
  while (value > 180) value -= 360;
  while (value < -180) value += 360;
  return value;
}
