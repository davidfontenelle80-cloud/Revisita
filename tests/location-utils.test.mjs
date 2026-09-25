import test from 'node:test';
import assert from 'node:assert/strict';
import { locationFromPosition, betterLocation, accuracyLevel, formatAccuracy } from '../js/location-utils.js';

test('locationFromPosition normalizes geolocation readings', () => {
  assert.deepEqual(
    locationFromPosition({coords:{latitude:41.75,longitude:-72.68,accuracy:42.4}}),
    {lat:41.75,lng:-72.68,accuracy:42.4}
  );
  assert.equal(locationFromPosition({coords:{latitude:'x',longitude:-72.68,accuracy:10}}), null);
});

test('betterLocation keeps the most accurate reading', () => {
  const coarse={lat:1,lng:2,accuracy:1500};
  const fair={lat:3,lng:4,accuracy:180};
  const precise={lat:5,lng:6,accuracy:35};
  assert.deepEqual(betterLocation(null,coarse),coarse);
  assert.deepEqual(betterLocation(coarse,fair),fair);
  assert.deepEqual(betterLocation(fair,precise),precise);
  assert.deepEqual(betterLocation(precise,fair),precise);
});

test('accuracy levels separate precise, approximate and poor fixes', () => {
  assert.equal(accuracyLevel(40),'good');
  assert.equal(accuracyLevel(80),'good');
  assert.equal(accuracyLevel(81),'fair');
  assert.equal(accuracyLevel(250),'fair');
  assert.equal(accuracyLevel(251),'poor');
  assert.equal(accuracyLevel(Infinity),'unknown');
});

test('accuracy formatting stays readable for large coarse fixes', () => {
  assert.equal(formatAccuracy(42.4),'42 m');
  assert.equal(formatAccuracy(900),'900 m');
  assert.equal(formatAccuracy(1500),'1.5 km');
  assert.equal(formatAccuracy(12500),'13 km');
});
