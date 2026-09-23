import test from 'node:test';
import assert from 'node:assert/strict';
import { compactAddress, shortAddress, placeLine, addDays, addMonths, nextDatePresets, directionsUrl, phoneDigits, whatsappUrl, buildICS, googleCalendarUrl, mergeVisits, visitsFingerprint, calendarSlot, staleCalendarSlot, telUrl } from '../js/visit-tools.js';

const visit = { id: 'abc', name: 'Familia Pérez', reference: 'Casa verde, frente al colmado', address: 'Calle Luis E. Pérez García, La Agustina, Santo Domingo de Guzmán, Distrito Nacional, 03201, República Dominicana', lat: 18.4869, lng: -69.9304, dueDate: '2026-09-26', dueTime: '10:00', updatedAt: '2026-09-23T10:00:00.000Z' };

test('compact address uses street, neighbourhood and city only', () => {
  const r = { display_name: 'x', address: { road: 'Calle 14', neighbourhood: 'La Agustina', city: 'Santo Domingo de Guzmán', postcode: '03201', country: 'República Dominicana' } };
  assert.equal(compactAddress(r), 'Calle 14, La Agustina, Santo Domingo de Guzmán');
  assert.equal(compactAddress({ display_name: visit.address }), 'Calle Luis E. Pérez García, La Agustina, Santo Domingo de Guzmán');
});

test('short address drops postal code and country and keeps three parts', () => {
  assert.equal(shortAddress(visit.address), 'Calle Luis E. Pérez García, La Agustina, Santo Domingo de Guzmán');
  assert.equal(shortAddress(''), '');
});

test('place line puts the human reference first', () => {
  assert.match(placeLine(visit), /^Casa verde, frente al colmado · Calle Luis/);
  assert.equal(placeLine({ reference: '', address: '' }), '');
});

test('date presets add weeks and whole months safely', () => {
  assert.equal(addDays('2026-09-23', 7), '2026-09-30');
  assert.equal(addDays('2026-12-28', 7), '2027-01-04');
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.deepEqual(nextDatePresets('2026-09-23').map(p => p.date), ['2026-09-30', '2026-10-07', '2026-10-23']);
});

test('directions links for Google Maps, Waze and Apple Maps', () => {
  assert.match(directionsUrl('google', visit), /google\.com\/maps\/dir\/\?api=1&destination=18\.4869,-69\.9304/);
  assert.equal(directionsUrl('waze', visit), 'https://waze.com/ul?ll=18.4869,-69.9304&navigate=yes');
  assert.match(directionsUrl('apple', visit), /^https:\/\/maps\.apple\.com\/\?daddr=18\.4869,-69\.9304/);
});

test('phone numbers become WhatsApp links', () => {
  assert.equal(phoneDigits('+1 (809) 555-1234'), '18095551234');
  assert.equal(whatsappUrl('809-555-1234', 'Hola'), 'https://wa.me/8095551234?text=Hola');
});

test('ICS event has local start, 30 min default alarm and CRLF lines', () => {
  const ics = buildICS(visit, { now: new Date('2026-09-23T10:00:00Z'), alarmMinutes: 30 });
  assert.match(ics, /BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /DTSTART:20260926T100000\r\n/);
  assert.match(ics, /DTEND:20260926T103000\r\n/);
  assert.match(ics, /TRIGGER:-PT30M\r\n/);
  assert.match(ics, /SUMMARY:Revisita: Familia Pérez\r\n/);
  assert.match(ics, /LOCATION:Casa verde\\, frente al colmado/);
  for (const line of ics.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75, `line too long: ${line}`);
});

test('ICS without a time is an all-day event with a morning alarm', () => {
  const ics = buildICS({ ...visit, dueTime: '' }, { now: new Date('2026-09-23T10:00:00Z') });
  assert.match(ics, /DTSTART;VALUE=DATE:20260926\r\n/);
  assert.match(ics, /DTEND;VALUE=DATE:20260927\r\n/);
  assert.match(ics, /TRIGGER:PT8H/);
  assert.throws(() => buildICS({ ...visit, dueDate: '' }));
});

test('Google Calendar link carries title, dates and location', () => {
  const url = new URL(googleCalendarUrl(visit));
  assert.equal(url.searchParams.get('action'), 'TEMPLATE');
  assert.equal(url.searchParams.get('dates'), '20260926T100000/20260926T103000');
  assert.equal(url.searchParams.get('text'), 'Revisita: Familia Pérez');
});

test('sync merge keeps the newest copy of each visit', () => {
  const a = { id: '1', name: 'old', updatedAt: '2026-09-20T00:00:00Z' };
  const b = { id: '1', name: 'new', updatedAt: '2026-09-21T00:00:00Z' };
  const c = { id: '2', name: 'only remote', updatedAt: '2026-09-19T00:00:00Z' };
  const r = mergeVisits([a], [b, c]);
  assert.deepEqual(r.visits.map(v => v.name).sort(), ['new', 'only remote']);
});

test('sync merge honours deletions but not older than a later edit', () => {
  const v = { id: '1', updatedAt: '2026-09-20T00:00:00Z' };
  assert.equal(mergeVisits([v], [], {}, { 1: '2026-09-21T00:00:00Z' }).visits.length, 0);
  const edited = mergeVisits([{ ...v, updatedAt: '2026-09-22T00:00:00Z' }], [], {}, { 1: '2026-09-21T00:00:00Z' });
  assert.equal(edited.visits.length, 1);
  assert.deepEqual(edited.deleted, {});
});

test('fingerprint changes only when data changes', () => {
  const v = [{ id: '1', updatedAt: 'a' }, { id: '2', updatedAt: 'b' }];
  assert.equal(visitsFingerprint(v, {}), visitsFingerprint([...v].reverse(), {}));
  assert.notEqual(visitsFingerprint(v, {}), visitsFingerprint(v, { 3: 'x' }));
});

test('offline zone tiles stay under the OSM bulk-download cap', async () => {
  const { zoneTileUrls } = await import('../js/visit-tools.js');
  const small = zoneTileUrls({ north: 18.49, west: -69.935, south: 18.484, east: -69.926 }, [15, 16, 17]);
  assert.ok(small.length > 0 && small.length <= 200);
  assert.match(small[0], /^https:\/\/tile\.openstreetmap\.org\/15\/\d+\/\d+\.png$/);
  const huge = zoneTileUrls({ north: 19.9, west: -72, south: 17.5, east: -68.3 }, [14, 15, 16]);
  assert.ok(huge.length <= 200);
});

test('ICS uses one UID per visit plus SEQUENCE, so a reschedule updates instead of duplicating', () => {
  const a = buildICS(visit, { now: new Date('2026-09-23T10:00:00Z') });
  const b = buildICS({ ...visit, dueDate: '2026-10-03' }, { now: new Date('2026-09-23T10:00:00Z'), sequence: 2 });
  assert.match(a, /UID:revisita-abc@khub\r\n/);
  assert.match(b, /UID:revisita-abc@khub\r\n/);
  assert.match(a, /SEQUENCE:0\r\n/);
  assert.match(b, /SEQUENCE:2\r\n/);
});

test('calendar slot and stale-slot detection', () => {
  assert.equal(calendarSlot(visit), '2026-09-26 10:00');
  assert.equal(calendarSlot({ ...visit, dueTime: '' }), '2026-09-26');
  assert.equal(calendarSlot({ ...visit, dueDate: '' }), '');
  const sent = { ...visit, calendarSlot: '2026-09-26 10:00' };
  assert.equal(staleCalendarSlot(sent, sent), '', 'same slot is not stale');
  assert.equal(staleCalendarSlot(sent, { ...sent, dueDate: '2026-10-03' }), '2026-09-26 10:00', 'moved date');
  assert.equal(staleCalendarSlot(sent, { ...sent, dueTime: '11:00' }), '2026-09-26 10:00', 'moved time');
  assert.equal(staleCalendarSlot(sent, { ...sent, status: 'completed', dueDate: '' }), '2026-09-26 10:00', 'ended');
  assert.equal(staleCalendarSlot(sent, null), '2026-09-26 10:00', 'deleted');
  assert.equal(staleCalendarSlot(visit, { ...visit, dueDate: '2026-10-03' }), '', 'never sent to the calendar');
});

test('tel link only for real-looking numbers', () => {
  assert.equal(telUrl('809-555-1234'), 'tel:8095551234');
  assert.equal(telUrl('+1 (809) 555-1234'), 'tel:+18095551234');
  assert.equal(telUrl('809'), '');
  assert.equal(telUrl(''), '');
});
