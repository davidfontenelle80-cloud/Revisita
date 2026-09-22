import test from 'node:test';
import assert from 'node:assert/strict';
import { latLngToWorld, worldToLatLng, haversineKm, formatDistance } from '../js/map-utils.js';

test('Web Mercator conversion round-trips Dominican Republic coordinates', () => {
  const source = { lat: 18.4861, lng: -69.9312 };
  for (const zoom of [3, 8, 12, 17]) {
    const world = latLngToWorld(source.lat, source.lng, zoom);
    const roundTrip = worldToLatLng(world.x, world.y, zoom);
    assert.ok(Math.abs(roundTrip.lat - source.lat) < 1e-8);
    assert.ok(Math.abs(roundTrip.lng - source.lng) < 1e-8);
  }
});

test('haversine returns realistic Santo Domingo to Santiago distance', () => {
  const km = haversineKm(18.4861, -69.9312, 19.4517, -70.6970);
  assert.ok(km > 120 && km < 170, `distance was ${km}`);
});

test('distance formatting switches from meters to kilometers', () => {
  assert.equal(formatDistance(0.42), '420 m');
  assert.equal(formatDistance(1.25), '1.3 km');
  assert.equal(formatDistance(12.4), '12 km');
});
