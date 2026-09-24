// Pure helpers for Revisita v1.4: addresses, dates, directions, calendar, sharing and sync merge.
// No DOM access here so everything can be unit-tested in Node.
import { latLngToWorld, TILE_SIZE } from './map-utils.js?v=1.4.7';
import { visitInstant } from './visit-time.js?v=1.4.7';

/** Build a short, human address from a Nominatim jsonv2 response. */
export function compactAddress(result) {
  const a = result?.address;
  if (!a || typeof a !== 'object') return shortAddress(result?.display_name || '');
  const street = [a.road || a.pedestrian || a.footway || a.path || '', a.house_number || ''].filter(Boolean).join(' ');
  const area = a.neighbourhood || a.suburb || a.quarter || a.hamlet || a.village || '';
  const city = a.city || a.town || a.municipality || a.county || '';
  const parts = [street, area, city].filter(Boolean);
  const unique = parts.filter((p, i) => parts.indexOf(p) === i);
  return unique.length ? unique.join(', ') : shortAddress(result?.display_name || '');
}

/** Shorten a long comma-separated address (e.g. an older full Nominatim display_name). */
export function shortAddress(address, maxParts = 3) {
  const parts = String(address || '').split(',').map(p => p.trim()).filter(Boolean);
  const cleaned = parts.filter(p => !/^\d{4,6}$/.test(p) && !/^(república dominicana|dominican republic|united states|estados unidos|usa|puerto rico)$/i.test(p));
  return cleaned.slice(0, maxParts).join(', ');
}

/** Best single line describing where the house is: reference first, then short address. */
export function placeLine(v) {
  return [v?.reference, shortAddress(v?.address || '')].filter(Boolean).join(' · ');
}

function parseKey(key) {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, m - 1, d);
}
function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function addDays(key, days) {
  const d = parseKey(key); d.setDate(d.getDate() + days); return toKey(d);
}
export function addMonths(key, months) {
  const d = parseKey(key); const day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last)); return toKey(d);
}
/** Quick "next visit" choices counted from today. */
export function nextDatePresets(todayKey) {
  return [
    { id: 'w1', date: addDays(todayKey, 7) },
    { id: 'w2', date: addDays(todayKey, 14) },
    { id: 'm1', date: addMonths(todayKey, 1) },
  ];
}

const coord = n => String(+Number(n).toFixed(6));
export function directionsUrl(app, v) {
  const ll = `${coord(v.lat)},${coord(v.lng)}`;
  if (app === 'waze') return `https://waze.com/ul?ll=${ll}&navigate=yes`;
  if (app === 'apple') return `https://maps.apple.com/?daddr=${ll}&dirflg=d`;
  return `https://www.google.com/maps/dir/?api=1&destination=${ll}&travelmode=driving`;
}
export function mapLink(v) {
  return `https://www.google.com/maps/search/?api=1&query=${coord(v.lat)},${coord(v.lng)}`;
}

/** Digits only, for wa.me links. Keeps a leading country code if the user typed one. */
export function phoneDigits(phone) {
  return String(phone || '').replace(/\D+/g, '');
}
/** tel: link for the phone dialer, or '' when the number is too short to be real (under 7 digits). */
export function telUrl(phone) {
  const raw = String(phone || '');
  if (phoneDigits(raw).length < 7) return '';
  return `tel:${raw.replace(/[^\d+]/g, '')}`;
}
export function whatsappUrl(phone, text = '') {
  const digits = phoneDigits(phone);
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return digits ? `https://wa.me/${digits}${q}` : `https://wa.me/${q}`;
}

// ---------- Calendar ----------
function icsEscape(text) {
  return String(text || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}
function foldLine(line) {
  // RFC 5545: lines longer than 75 octets are folded with CRLF + space.
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out = []; let current = ''; let size = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (size + n > (out.length ? 74 : 75)) { out.push(current); current = ''; size = 0; }
    current += ch; size += n;
  }
  out.push(current);
  return out.join('\r\n ');
}
function stamp(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}
function localStamp(key, time) {
  return `${key.replace(/-/g, '')}T${time.replace(':', '')}00`;
}
function endOf(key, time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const d = parseKey(key); d.setHours(h, m + minutes, 0, 0);
  return `${toKey(d).replace(/-/g, '')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
}

/**
 * Build an .ics calendar file for a scheduled visit.
 * Timed visits use floating local time (the phone's own time zone) with an alarm `alarmMinutes` before.
 * Undated-time visits become all-day events with an alarm at 8:00 that morning.
 */
export function buildICS(v, { alarmMinutes = 30, now = new Date(), title = 'Revisita', durationMinutes = 30, description = '', sequence = 0 } = {}) {
  if (!v?.dueDate) throw new Error('visit-has-no-date');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KHub//Revisita//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    // One UID per visit (not per date): calendars that honour UID + SEQUENCE update the event instead of adding a second one.
    `UID:revisita-${v.id}@khub`,
    `SEQUENCE:${Math.max(0, Math.round(Number(sequence) || 0))}`,
    `DTSTAMP:${stamp(now)}`,
  ];
  if (v.dueTime) {
    const instant=v.dueTimeZone?visitInstant(v):null;
    if(v.dueTimeZone&&!instant)throw new Error('invalid-visit-time');
    lines.push(`DTSTART:${instant?stamp(instant):localStamp(v.dueDate, v.dueTime)}`, `DTEND:${instant?stamp(new Date(instant.getTime()+durationMinutes*60000)):endOf(v.dueDate, v.dueTime, durationMinutes)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${v.dueDate.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${addDays(v.dueDate, 1).replace(/-/g, '')}`);
  }
  const place = placeLine(v);
  lines.push(
    `SUMMARY:${icsEscape(`${title}: ${v.name}`)}`,
    `LOCATION:${icsEscape(place || `${v.lat}, ${v.lng}`)}`,
    `GEO:${Number(v.lat).toFixed(6)};${Number(v.lng).toFixed(6)}`,
    `DESCRIPTION:${icsEscape([description, mapLink(v)].filter(Boolean).join('\n'))}`,
    `URL:${mapLink(v)}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(`${title}: ${v.name}`)}`,
    v.dueTime ? `TRIGGER:-PT${Math.max(0, Math.round(alarmMinutes))}M` : 'TRIGGER:PT8H',
    'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  );
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** Google Calendar "create event" link (used on Android, where .ics files open poorly). */
export function googleCalendarUrl(v, { title = 'Revisita', durationMinutes = 30, description = '' } = {}) {
  if (!v?.dueDate) throw new Error('visit-has-no-date');
  const instant=v.dueTime&&v.dueTimeZone?visitInstant(v):null;
  if(v.dueTime&&v.dueTimeZone&&!instant)throw new Error('invalid-visit-time');
  const dates = v.dueTime
    ? instant?`${stamp(instant)}/${stamp(new Date(instant.getTime()+durationMinutes*60000))}`:`${localStamp(v.dueDate, v.dueTime)}/${endOf(v.dueDate, v.dueTime, durationMinutes)}`
    : `${v.dueDate.replace(/-/g, '')}/${addDays(v.dueDate, 1).replace(/-/g, '')}`;
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${title}: ${v.name}`,
    dates,
    details: [description, mapLink(v)].filter(Boolean).join('\n'),
    location: placeLine(v) || `${v.lat}, ${v.lng}`,
  });
  if(v.dueTimeZone)q.set('ctz',v.dueTimeZone);
  return `https://calendar.google.com/calendar/render?${q}`;
}

/** The date/time slot a visit was handed to the phone calendar for ("2026-09-26 10:00" or "2026-09-26"). */
export function calendarSlot(v) {
  if (!v?.dueDate) return '';
  return v.dueTime ? `${v.dueDate} ${v.dueTime}` : v.dueDate;
}
/**
 * A web app cannot delete events from the phone calendar. When a visit that was already sent to the
 * calendar moves to another slot (or ends / is deleted), return the old slot so the user can be told to remove it.
 */
export function staleCalendarSlot(previous, next) {
  const old = String(previous?.calendarSlot || '');
  if (!old) return '';
  if (!next || next.status === 'completed' || !next.dueDate) return old;
  return calendarSlot(next) === old ? '' : old;
}

// ---------- Sync merge ----------
/**
 * Merge two copies of the visit list. Newest `updatedAt` wins per id.
 * Tombstones ({id: deletedAtISO}) remove a visit unless it was edited after the deletion.
 */
export function mergeVisits(localVisits = [], remoteVisits = [], localDeleted = {}, remoteDeleted = {}) {
  const deleted = { ...(localDeleted || {}) };
  for (const [id, at] of Object.entries(remoteDeleted || {})) {
    if (!deleted[id] || String(at) > String(deleted[id])) deleted[id] = at;
  }
  const byId = new Map();
  for (const v of [...(localVisits || []), ...(remoteVisits || [])]) {
    if (!v?.id) continue;
    const prev = byId.get(v.id);
    if (!prev || String(v.updatedAt || '') > String(prev.updatedAt || '')) byId.set(v.id, v);
  }
  const visits = [];
  for (const v of byId.values()) {
    const del = deleted[v.id];
    if (del && String(del) >= String(v.updatedAt || '')) continue;
    if (del) delete deleted[v.id];
    visits.push(v);
  }
  return { visits, deleted };
}

/** Stable fingerprint to know whether a merge changed anything. */
export function visitsFingerprint(visits = [], deleted = {}) {
  const v = [...visits].map(x => `${x.id}:${x.updatedAt}`).sort().join('|');
  const d = Object.entries(deleted).map(([k, t]) => `${k}:${t}`).sort().join('|');
  return `${v}#${d}`;
}

// ---------- Offline zone ----------
/** OSM tile URLs covering a bounding box, lowest zoom first, capped (OSM policy: < 250 tiles at z13+). */
export function zoneTileUrls(bounds,zooms,max=200){
 const urls=[];
 for(const z of zooms){
   const a=latLngToWorld(bounds.north,bounds.west,z),b=latLngToWorld(bounds.south,bounds.east,z);
   const x0=Math.floor(a.x/TILE_SIZE),x1=Math.floor(b.x/TILE_SIZE),y0=Math.floor(a.y/TILE_SIZE),y1=Math.floor(b.y/TILE_SIZE);
   const level=[];for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const n=2**z;level.push(`https://tile.openstreetmap.org/${z}/${((x%n)+n)%n}/${y}.png`);}
   if(urls.length+level.length>max)break;
   urls.push(...level);
 }
  return urls;
}
