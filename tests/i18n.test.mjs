import test from 'node:test';
import assert from 'node:assert/strict';
import { t, setLanguage, getLanguage, locale } from '../js/i18n.js';

test('Spanish is available and interpolates values', () => {
  setLanguage('es', { persist: false, notify: false });
  assert.equal(getLanguage(), 'es');
  assert.equal(t('today'), 'Hoy');
  assert.equal(t('gpsAccuracy', { meters: 12 }), 'Precisión GPS aproximada: ±12 m');
  assert.equal(locale(), 'es-DO');
});

test('English translations switch without changing data', () => {
  setLanguage('en', { persist: false, notify: false });
  assert.equal(getLanguage(), 'en');
  assert.equal(t('today'), 'Today');
  assert.equal(t('confirmLocation'), 'Confirm location');
  assert.equal(t('markDoneConfirm', { name: 'Blue house' }), 'Mark “Blue house” as done?');
  assert.equal(locale(), 'en-US');
  setLanguage('es', { persist: false, notify: false });
});

test('every Spanish string has an English translation and vice versa', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../js/i18n.js', import.meta.url), 'utf8');
  const es = src.slice(src.indexOf('es: {'), src.indexOf('en: {'));
  const en = src.slice(src.indexOf('en: {'), src.indexOf('let current'));
  const keys = block => new Set([...block.matchAll(/(?:^\s+|',\s*)([A-Za-z]\w*):'/gm)].map(m => m[1]));
  const esKeys = keys(es), enKeys = keys(en);
  const missingEn = [...esKeys].filter(k => !enKeys.has(k));
  const missingEs = [...enKeys].filter(k => !esKeys.has(k));
  assert.deepEqual(missingEn, []);
  assert.deepEqual(missingEs, []);
});

test('every data-i18n key used in index.html exists', async () => {
  const { readFile } = await import('node:fs/promises');
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  setLanguage('es', { persist: false, notify: false });
  const used = [...html.matchAll(/data-i18n(?:-placeholder|-aria)?="([^"]+)"/g)].map(m => m[1]);
  const missing = [...new Set(used)].filter(k => t(k) === k);
  assert.deepEqual(missing, []);
});
