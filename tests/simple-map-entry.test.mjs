import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');

test('map entry is limited to tap and device location',()=>{
  assert.doesNotMatch(html,/mapSearchForm|countryPickerDialog|mapSearchBtn|lookupAddressBtn/);
  assert.match(html,/id="locateBtn"/);
  assert.match(html,/id="locationConfirmPanel"/);
  assert.match(html,/id="adjustLocationBtn"/);
  assert.match(app,/map\.onTap=ll=>\{mapMovedByUser=true;beginLocationConfirmation/);
  assert.match(app,/els\.locate\.addEventListener\('click'/);
});

test('approximate address stays editable and can still be filled from the pin',()=>{
  assert.match(html,/id="visitAddress" type="text"/);
  assert.doesNotMatch(html,/id="lookupAddressBtn"/);
  assert.match(app,/async function reverseGeocode\(lat,lng\)/);
  assert.match(app,/pendingLocation\.address=address/);
  assert.match(app,/if\(p\.address\)els\.address\.value=p\.address/);
});
