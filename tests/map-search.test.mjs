import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');

test('map exposes country-specific address search controls',()=>{
  assert.match(html,/id="mapSearchForm"/);
  assert.match(html,/id="mapSearchCountry"/);
  assert.match(html,/id="mapSearchFieldsUS"/);
  assert.match(html,/id="mapSearchFieldsDO"/);
  assert.match(html,/id="mapSearchFieldsOther"/);
  assert.match(html,/id="mapSearchUSZip"/);
  assert.match(html,/id="mapSearchDOSector"/);
  assert.match(html,/id="mapSearchDOProvince"/);
  assert.match(html,/id="mapSearchResults"/);
});

test('country selector swaps visible address field groups',()=>{
  assert.match(app,/function renderMapSearchCountry\(\)/);
  assert.match(app,/group\.hidden=group\.dataset\.searchCountry!==country/);
  assert.match(app,/MAP_SEARCH_COUNTRY_KEY/);
});

test('map search queries Nominatim, country-filters known countries and has a JSONP fallback',()=>{
  assert.match(app,/countrycodes/);
  assert.match(app,/nominatim\.openstreetmap\.org\/search/);
  assert.match(app,/function geocodeJsonp\(params\)/);
  assert.match(app,/json_callback/);
  assert.match(app,/geocodeResultIsExact\(raw\)/);
  assert.match(app,/beginLocationConfirmation\(\{lat:result\.lat,lng:result\.lng,source:'search'/);
  assert.match(app,/map\.setView\(result\.lat,result\.lng,geocodeResultZoom\(raw\)\)/);
});

test('successful search immediately applies the best match and reveals the map',()=>{
  assert.match(app,/renderMapSearchResults\(\);[\s\S]*selectMapSearchResult\(0,\{keepResults:rows\.length>1,automatic:true\}\)/);
  assert.match(app,/document\.activeElement instanceof HTMLElement&&document\.activeElement\.blur\(\)/);
  assert.match(app,/scrollIntoView\(\{behavior:'smooth',block:'center'\}\)/);
});

test('single-result selection does not invalidate the active search token',()=>{
  const clearBody=app.match(/function clearMapSearchResults\(\)\{([\s\S]*?)\n\}/)?.[1]||'';
  assert.doesNotMatch(clearBody,/mapSearchToken\+\+/);
  assert.match(app,/finally\{[\s\S]*token===mapSearchToken&&btn\)btn\.disabled=false/);
});
