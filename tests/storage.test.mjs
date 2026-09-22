import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState, validateImportPayload, previewImport } from '../js/storage.js';

if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto = { randomUUID: () => 'test-id' };
}

test('normalizeState removes invalid coordinates', () => {
  const state = normalizeState({ visits: [
    { id: 'a', name: 'Casa azul', lat: 18.4, lng: -69.9 },
    { id: 'b', name: 'Inválida', lat: 'x', lng: -69.9 },
  ] });
  assert.equal(state.visits.length, 1);
  assert.equal(state.visits[0].id, 'a');
});

test('import validation accepts Revisita payload and counts conflicts', () => {
  const local = normalizeState({ visits: [{ id: 'a', name: 'A', lat: 18, lng: -70 }] });
  const incoming = validateImportPayload({
    app: 'Revisita',
    visits: [
      { id: 'a', name: 'A nueva', lat: 18.1, lng: -70.1 },
      { id: 'b', name: 'B', lat: 19, lng: -70 },
    ],
  });
  assert.deepEqual(previewImport(local, incoming), {
    imported: 2,
    conflicts: 1,
    newRecords: 1,
    localBefore: 1,
  });
});

test('import validation rejects foreign payloads', () => {
  assert.throws(() => validateImportPayload({ app: 'Otra app', visits: [] }), /Revisita/);
});
