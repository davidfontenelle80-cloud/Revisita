import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAddressSearch, hasAddressSearchInput } from '../js/address-search.js';

test('US search uses US address order and country filter',()=>{
  assert.deepEqual(
    buildAddressSearch('us',{street:'123 Main St',city:'Manchester',region:'CT',postal:'06040'}),
    {query:'123 Main St, Manchester, CT, 06040, United States',countryCode:'us'}
  );
});

test('Dominican Republic search includes sector municipality and province',()=>{
  assert.deepEqual(
    buildAddressSearch('do',{street:'Calle Duarte 25',neighborhood:'Los Jardines',city:'Santiago',region:'Santiago',postal:'51000'}),
    {query:'Calle Duarte 25, Los Jardines, Santiago, Santiago, 51000, República Dominicana',countryCode:'do'}
  );
});

test('postal code alone is valid for country-scoped area search',()=>{
  assert.equal(hasAddressSearchInput('us',{postal:'06040'}),true);
  assert.equal(buildAddressSearch('us',{postal:'06040'}).query,'06040, United States');
  assert.equal(hasAddressSearchInput('do',{postal:'10101'}),true);
});

test('other-country search stays flexible',()=>{
  assert.deepEqual(
    buildAddressSearch('other',{address:'10 Downing Street, London',countryName:'United Kingdom'}),
    {query:'10 Downing Street, London, United Kingdom',countryCode:''}
  );
  assert.equal(hasAddressSearchInput('other',{countryName:'Spain',address:''}),false);
});
