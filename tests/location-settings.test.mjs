import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const i18n = readFileSync(new URL('../js/i18n.js', import.meta.url), 'utf8');

test('More includes a dedicated GPS permission settings card', () => {
  assert.match(html, /id="locationSettingsCard"/);
  assert.match(html, /id="locationAccessBtn"/);
  assert.match(html, /id="locationHelpBtn"/);
  assert.match(html, /id="locationAccessStatus"/);
  assert.match(html, /id="locationAccessHelp"/);
});

test('GPS settings actively request geolocation from a user click', () => {
  assert.match(app, /locationAccessBtn'\)\?\.addEventListener\('click',requestLocationFromSettings\)/);
  assert.match(app, /function requestLocationFromSettings\(\)[\s\S]*navigator\.geolocation\.getCurrentPosition/);
  assert.match(app, /locationPermissionState='granted'/);
});

test('GPS settings detect blocked permission and show device instructions', () => {
  assert.match(app, /navigator\.permissions\?\.query/);
  assert.match(app, /locationPermissionState==='denied'/);
  assert.match(app, /locationSettingsIosStep1/);
  assert.match(app, /locationSettingsAndroidStep1/);
  assert.match(i18n, /locationSettingsIosStep2:'Busca Revisita\. Si no aparece, abre Sitios web de Safari\.'/);
  assert.match(i18n, /locationSettingsDenied:'El acceso a ubicación está bloqueado\./);
});
