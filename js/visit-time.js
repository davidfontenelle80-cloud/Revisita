// Wall-clock schedules retain the zone selected when created/rescheduled.
export function deviceTimeZone(){return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';}
export function validTimeZone(zone){try{new Intl.DateTimeFormat('en',{timeZone:zone});return typeof zone==='string'&&zone.length>0;}catch{return false;}}
export function visitInstant(visit){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(visit?.dueDate||'')||!/^([01]\d|2[0-3]):[0-5]\d$/.test(visit?.dueTime||''))return null;
 const [y,m,d]=visit.dueDate.split('-').map(Number),[h,min]=visit.dueTime.split(':').map(Number);
 const wall=Date.UTC(y,m-1,d,h,min);
 if(new Date(wall).toISOString().slice(0,10)!==visit.dueDate)return null;
 const zone=visit.dueTimeZone||deviceTimeZone();if(!validTimeZone(zone))return null;
 const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const parts=ms=>Object.fromEntries(fmt.formatToParts(new Date(ms)).map(p=>[p.type,p.value]));
 const offsets=new Set([-36,0,36].map(hours=>{const ms=wall+hours*3600000,p=parts(ms);return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute)-ms;}));
 const matches=[...offsets].map(offset=>wall-offset).filter(ms=>{const p=parts(ms);return +p.year===y&&+p.month===m&&+p.day===d&&+p.hour===h&&+p.minute===min;});
 // Spring gap: reject. Fall overlap: use the first occurrence, consistently.
 return matches.length?new Date(Math.min(...matches)):null;
}
