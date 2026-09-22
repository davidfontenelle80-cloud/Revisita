const STORAGE_KEY = 'revisita.state.v1';
const SNAPSHOT_KEY = 'revisita.preimport.v1';

export function createDefaultState() {
  return {
    version: 1,
    visits: [],
    settings: { theme: 'dark' },
    map: { lat: 18.7357, lng: -70.1627, zoom: 8 },
    lastSavedAt: null,
  };
}

export function loadState() {
  const fallback = createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return normalizeState(JSON.parse(raw));
  } catch (error) {
    console.warn('No se pudo leer el estado local.', error);
    return fallback;
  }
}

export function normalizeState(value) {
  const base = createDefaultState();
  if (!value || typeof value !== 'object') return base;
  const visits = Array.isArray(value.visits) ? value.visits.map(normalizeVisit).filter(Boolean) : [];
  return {
    version: 1,
    visits,
    settings: { ...base.settings, ...(value.settings || {}) },
    map: { ...base.map, ...(value.map || {}) },
    lastSavedAt: value.lastSavedAt || null,
  };
}

export function normalizeVisit(v) {
  if (!v || typeof v !== 'object') return null;
  const lat = Number(v.lat);
  const lng = Number(v.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id: String(v.id || crypto.randomUUID()),
    name: String(v.name || 'Revisita'),
    address: String(v.address || ''),
    notes: String(v.notes || ''),
    dueDate: typeof v.dueDate === 'string' ? v.dueDate : '',
    lat,
    lng,
    createdAt: v.createdAt || new Date().toISOString(),
    updatedAt: v.updatedAt || new Date().toISOString(),
  };
}

export function saveState(state) {
  state.lastSavedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state.lastSavedAt;
}

export function exportPayload(state) {
  return {
    app: 'Revisita',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    visits: state.visits,
    settings: state.settings,
  };
}

export function validateImportPayload(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('El archivo no contiene un objeto JSON válido.');
  if (payload.app !== 'Revisita') throw new Error('Este archivo no parece ser una copia de Revisita.');
  if (!Array.isArray(payload.visits)) throw new Error('La copia no contiene una lista de revisitas válida.');
  const visits = payload.visits.map(normalizeVisit).filter(Boolean);
  if (visits.length !== payload.visits.length) throw new Error('Una o más revisitas tienen coordenadas inválidas.');
  return { ...payload, visits };
}

export function previewImport(state, payload) {
  const localIds = new Set(state.visits.map((v) => v.id));
  const conflicts = payload.visits.filter((v) => localIds.has(v.id)).length;
  return {
    imported: payload.visits.length,
    conflicts,
    newRecords: payload.visits.length - conflicts,
    localBefore: state.visits.length,
  };
}

export function applyImport(state, payload) {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(state));
  const merged = new Map(state.visits.map((v) => [v.id, v]));
  payload.visits.forEach((v) => merged.set(v.id, normalizeVisit(v)));
  state.visits = [...merged.values()];
  if (payload.settings?.theme) state.settings.theme = payload.settings.theme;
  saveState(state);
  return state;
}

export function hasRecoverySnapshot() {
  return Boolean(localStorage.getItem(SNAPSHOT_KEY));
}

export function restoreRecoverySnapshot() {
  const raw = localStorage.getItem(SNAPSHOT_KEY);
  if (!raw) throw new Error('No hay una copia anterior disponible.');
  const restored = normalizeState(JSON.parse(raw));
  saveState(restored);
  return restored;
}
