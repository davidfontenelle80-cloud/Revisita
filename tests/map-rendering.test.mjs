import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../js/map.js', import.meta.url), 'utf8');

test('map reuses tile DOM instead of rebuilding every pan frame', () => {
  assert.match(source, /this\.tileNodes=new Map\(\)/);
  assert.match(source, /this\.tileNodes\.get\(key\)/);
  assert.doesNotMatch(source, /this\.tileLayer\.replaceChildren/);
});

test('map coalesces redraws with requestAnimationFrame', () => {
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /scheduleRender\(\)/);
});

test('map reuses marker nodes while panning', () => {
  assert.match(source, /this\.markerNodes=new Map\(\)/);
  assert.match(source, /renderMarkerPositions/);
  assert.doesNotMatch(source, /this\.markerLayer\.replaceChildren/);
});

test('map uses GPU-friendly transforms and throttles wheel zoom', () => {
  assert.match(source, /translate3d/);
  assert.match(source, /now-this\.lastWheelAt<90/);
});
