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
