import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const app = await readFile(new URL('../js/app.js', import.meta.url), 'utf8');
const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('service worker uses the KHub immediate-update lifecycle', () => {
  assert.match(sw, /self\.skipWaiting\(\)/);
  assert.match(sw, /self\.clients\.claim\(\)/);
  assert.match(sw, /RELOAD_READY/);
  assert.match(sw, /fetch\(request, \{ cache: 'no-store' \}\)/);
  assert.match(sw, /revisita-tiles-v1/);
});

test('critical shell assets are versioned for transition from older cache-first workers', () => {
  assert.match(index, /css\/main\.css\?v=1\.3\.2/);
  assert.match(index, /js\/app\.js\?v=1\.3\.2/);
  assert.match(app, /sw\.js\?v=1\.3\.2/);
});

test('app checks for service-worker updates and reloads safely', () => {
  assert.match(app, /swRegistration\.update\(\)/);
  assert.match(app, /updateViaCache:'none'/);
  assert.match(app, /visibilitychange/);
  assert.match(app, /isSafeForServiceWorkerReload/);
  assert.match(app, /applyServiceWorkerUpdate/);
});
