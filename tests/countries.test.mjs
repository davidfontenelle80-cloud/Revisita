import test from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRY_COUNT, countryOptions, countryName, filterCountries, isCountryCode } from '../js/countries.js';

test('country picker includes the full ISO country and territory list',()=>{
  assert.equal(COUNTRY_COUNT,249);
  assert.equal(isCountryCode('US'),true);
  assert.equal(isCountryCode('do'),true);
  assert.equal(isCountryCode('JP'),true);
  assert.equal(isCountryCode('ZZ'),false);
});

test('country names are localized and searchable by name or code',()=>{
  const es=countryOptions('es');
  const en=countryOptions('en');
  assert.equal(es.length,249);
  assert.equal(en.length,249);
  assert.ok(countryName('us','es').length>2);
  assert.ok(countryName('do','en').length>2);
  assert.equal(filterCountries(en,'Japan')[0]?.code,'jp');
  assert.equal(filterCountries(en,'JP')[0]?.code,'jp');
});

test('country filtering is accent-insensitive',()=>{
  const es=countryOptions('es');
  assert.equal(filterCountries(es,'Republica Dominicana').some(x=>x.code==='do'),true);
});
