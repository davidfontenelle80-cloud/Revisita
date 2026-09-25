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

test('iPad portrait keeps the map full width with navigation below it', () => {
  assert.match(css, /@media\(min-width:740px\) and \(max-width:959px\)\{[\s\S]*grid-template-areas:"map" "sidebar"/);
  assert.match(css, /@media\(min-width:740px\) and \(max-width:959px\)\{[\s\S]*\.map-workspace \.map-shell\{[\s\S]*width:100%/);
  assert.match(css, /@media\(min-width:960px\)\{[\s\S]*grid-template-columns:300px minmax\(0,1fr\)/);
  assert.match(css, /@media\(min-width:740px\)\{\s*#view-map \.horizontal-options\{/);
});

test('Apple Maps is the first navigation choice when it is available', () => {
  const apple = html.indexOf('data-nav-app="apple"');
  const google = html.indexOf('data-nav-app="google"');
  const waze = html.indexOf('data-nav-app="waze"');
  assert.ok(apple >= 0 && google > apple && waze > google);
});
