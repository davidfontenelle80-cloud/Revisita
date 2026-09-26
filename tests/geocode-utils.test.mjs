import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGeocodeResult, geocodeResultIsExact, geocodeResultZoom } from '../js/geocode-utils.js';

test('normalizeGeocodeResult parses Nominatim coordinates', () => {
  assert.deepEqual(
    normalizeGeocodeResult({lat:'41.7',lon:'-72.6',display_name:'Test',address:{road:'Main St'},type:'residential',addresstype:'road'}),
    {lat:41.7,lng:-72.6,displayName:'Test',address:{road:'Main St'},type:'residential',addresstype:'road'}
  );
  assert.equal(normalizeGeocodeResult({lat:'x',lon:'-72.6'}),null);
});

test('house-number results are treated as exact enough for provisional pin', () => {
  assert.equal(geocodeResultIsExact({lat:'1',lon:'2',address:{house_number:'25'},type:'residential'}),true);
  assert.equal(geocodeResultIsExact({lat:'1',lon:'2',address:{postcode:'06040'},type:'postcode'}),false);
});

test('postal/city results use an area zoom while houses use close zoom', () => {
  assert.equal(geocodeResultZoom({lat:'1',lon:'2',address:{house_number:'25'},type:'house'}),18);
  assert.equal(geocodeResultZoom({lat:'1',lon:'2',address:{postcode:'06040'},type:'postcode'}),13);
  assert.equal(geocodeResultZoom({lat:'1',lon:'2',type:'suburb'}),16);
});
