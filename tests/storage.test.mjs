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


test('legacy v1 visits migrate to active visits with optional time fields', () => {
  const state = normalizeState({ version: 1, visits: [{ id: 'old', name: 'Casa', lat: 18.5, lng: -69.9, dueDate: '2026-09-22' }] });
  assert.equal(state.version, 3);
  assert.equal(state.visits[0].reference, '');
  assert.deepEqual(state.deleted, {});
  assert.equal(state.visits[0].status, 'active');
  assert.equal(state.visits[0].dueTime, '');
  assert.deepEqual(state.visits[0].history, []);
});

test('completed history survives normalization', () => {
  const state = normalizeState({ visits: [{ id: 'done', name: 'Familia', lat: 18.5, lng: -69.9, status: 'completed', completedAt: '2026-09-22T15:00:00Z', history: [{ completedAt: '2026-09-22T15:00:00Z', dueDate: '2026-09-22', dueTime: '14:30' }] }] });
  assert.equal(state.visits[0].status, 'completed');
  assert.equal(state.visits[0].history[0].dueTime, '14:30');
});

test('v1.4 fields and settings normalize with safe defaults', () => {
  const state = normalizeState({ settings: { navApp: 'bogus', reminderMinutes: 'x', calendarOnSave: false }, deleted: { a: '2026-09-23T00:00:00Z', b: 5 }, visits: [{ id: 'n', name: 'N', lat: 18, lng: -70, reference: 'Casa verde', phone: '809', leftWith: 'Revista', nextTopic: 'Salmo 37', history: [{ completedAt: '2026-09-23T10:00:00Z', note: 'Buena charla', ended: true }] }] });
  const v = state.visits[0];
  assert.equal(v.reference, 'Casa verde');
  assert.equal(v.phone, '809');
  assert.equal(v.leftWith, 'Revista');
  assert.equal(v.nextTopic, 'Salmo 37');
  assert.equal(v.history[0].note, 'Buena charla');
  assert.equal(v.history[0].ended, true);
  assert.equal(state.settings.navApp, 'ask');
  assert.equal(state.settings.reminderMinutes, 30);
  assert.equal(state.settings.calendarOnSave, false);
  assert.deepEqual(state.deleted, { a: '2026-09-23T00:00:00Z' });
});

test('v1.4.1: calendar hand-off is off until the user answers the one-time question', () => {
  const fresh = normalizeState({});
  assert.equal(fresh.settings.calendarOnSave, false);
  assert.equal(fresh.settings.calendarAsked, false);
  const legacy = normalizeState({ settings: { calendarOnSave: true } });
  assert.equal(legacy.settings.calendarOnSave, true);
  assert.equal(legacy.settings.calendarAsked, false, 'v1.4.0 users are asked once too');
  const answered = normalizeState({ settings: { calendarOnSave: false, calendarAsked: true } });
  assert.equal(answered.settings.calendarAsked, true);
});

test('v1.4.1: calendar slot bookkeeping survives a reload', () => {
  const s = normalizeState({ visits: [{ id: 'c', name: 'C', lat: 18, lng: -70, dueDate: '2026-09-26', calendarSlot: '2026-09-26', calendarSeq: 3 }] });
  assert.equal(s.visits[0].calendarSlot, '2026-09-26');
  assert.equal(s.visits[0].calendarSeq, 3);
  const bare = normalizeState({ visits: [{ id: 'd', name: 'D', lat: 18, lng: -70 }] });
  assert.equal(bare.visits[0].calendarSlot, '');
  assert.equal(bare.visits[0].calendarSeq, 0);
});
