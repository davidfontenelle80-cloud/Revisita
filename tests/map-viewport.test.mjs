import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../js/app.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../css/main.css', import.meta.url), 'utf8');

test('map view disables browser scroll restoration', () => {
  assert.match(app, /history\.scrollRestoration='manual'/);
});

test('entering or resuming Map resets page scroll to the top', () => {
  assert.match(app, /function resetPageScroll/);
  assert.match(app, /pageshow/);
  assert.match(app, /isMapViewActive/);
  assert.match(app, /window\.scrollTo\(0,0\)/);
});

test('phone map filter choices remain sticky below the app header', () => {
  assert.match(css, /#view-map \.horizontal-options\{/);
  assert.match(css, /position:sticky/);
  assert.match(css, /top:calc\(var\(--header-height\) \+ env\(safe-area-inset-top\)\)/);
});
