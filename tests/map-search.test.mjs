import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');

test('map exposes address and postal-code search controls',()=>{
  assert.match(html,/id="mapSearchForm"/);
  assert.match(html,/id="mapSearchInput"/);
  assert.match(html,/id="mapSearchResults"/);
});

test('map search queries Nominatim and distinguishes exact from area results',()=>{
  assert.match(app,/nominatim\.openstreetmap\.org\/search/);
  assert.match(app,/geocodeResultIsExact\(raw\)/);
  assert.match(app,/beginLocationConfirmation\(\{lat:result\.lat,lng:result\.lng,source:'search'/);
  assert.match(app,/map\.setView\(result\.lat,result\.lng,geocodeResultZoom\(raw\)\)/);
});

test('successful search immediately applies the best match and reveals the map',()=>{
  assert.match(app,/renderMapSearchResults\(\);[\s\S]*selectMapSearchResult\(0,\{keepResults:rows\.length>1,automatic:true\}\)/);
  assert.match(app,/els\.mapSearchInput\?\.blur\(\)/);
  assert.match(app,/scrollIntoView\(\{behavior:'smooth',block:'center'\}\)/);
});
