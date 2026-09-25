import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../css/main.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('iOS directions use a same-context handoff instead of a popup', () => {
  assert.match(app, /function launchDirections\(app,v\)[\s\S]*isIOSDevice\(\)[\s\S]*window\.location\.assign\(url\)/);
  assert.match(app, /if\(app&&app!=='ask'[\s\S]*launchDirections\(app,v\)/);
  assert.match(app, /if\(v\)launchDirections\(app,v\)/);
});

test('iPad portrait widths get the split map sidebar and non-sticky map toolbar', () => {
  assert.match(css, /@media\(min-width:740px\)\{\s*\.map-workspace\{/);
  assert.match(css, /@media\(min-width:740px\)\{\s*#view-map \.horizontal-options\{/);
});

test('Apple Maps is the first navigation choice when it is available', () => {
  const apple = html.indexOf('data-nav-app="apple"');
  const google = html.indexOf('data-nav-app="google"');
  const waze = html.indexOf('data-nav-app="waze"');
  assert.ok(apple >= 0 && google > apple && waze > google);
});
