import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const app = await readFile(new URL('../js/app.js', import.meta.url), 'utf8');
const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

test('service worker uses the KHub immediate-update lifecycle', () => {
  assert.match(sw, /self\.skipWaiting\(\)/);
  assert.match(sw, /self\.clients\.claim\(\)/);
  assert.match(sw, /RELOAD_READY/);
  assert.match(sw, /fetch\(request, \{ cache: 'no-store' \}\)/);
  assert.match(sw, /revisita-tiles-v1/);
  assert.match(sw, /revisita-zones-v1/);
  assert.match(sw, /key !== ZONE_CACHE/);
});

test('critical shell assets are versioned for transition from older cache-first workers', () => {
  assert.ok(index.includes(`css/main.css?v=${version}`));
  assert.ok(index.includes(`js/app.js?v=${version}`));
  assert.ok(app.includes(`sw.js?v=${version}`));
});

test('app checks for service-worker updates and reloads safely', () => {
  assert.match(app, /swRegistration\.update\(\)/);
  assert.match(app, /updateViaCache:'none'/);
  assert.match(app, /visibilitychange/);
  assert.match(app, /isSafeForServiceWorkerReload/);
  assert.match(app, /applyServiceWorkerUpdate/);
});
