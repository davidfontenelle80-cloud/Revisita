export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function visitBucket(v, today=dateKey()) {
  if (v.status === 'completed') return 'completed';
  if (!v.dueDate) return 'undated';
  if (v.dueDate < today) return 'overdue';
  if (v.dueDate === today) return 'today';
  return 'upcoming';
}
export function compareSchedule(a,b) {
  const ad=a.dueDate||'9999-12-31', bd=b.dueDate||'9999-12-31';
  if(ad!==bd) return ad.localeCompare(bd);
  const at=a.dueTime||'99:99', bt=b.dueTime||'99:99';
  if(at!==bt) return at.localeCompare(bt);
  return (b.updatedAt||'').localeCompare(a.updatedAt||'');
}
export function formatTime(time, locale='es-DO') {
  if(!/^\d{2}:\d{2}$/.test(time||'')) return '';
  const [h,m]=time.split(':').map(Number);
  return new Intl.DateTimeFormat(locale,{hour:'numeric',minute:'2-digit'}).format(new Date(2000,0,1,h,m));
}

export function selectNextVisit(visits, now=new Date()) {
  const today=dateKey(now);
  const active=(Array.isArray(visits)?visits:[]).filter(v=>v.status!=='completed');
  const due=active.filter(v=>visitBucket(v,today)==='today').sort(compareSchedule);
  const overdue=active.filter(v=>visitBucket(v,today)==='overdue').sort(compareSchedule);
  const upcoming=active.filter(v=>visitBucket(v,today)==='upcoming').sort(compareSchedule);
  const hhmm=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const futureToday=due.filter(v=>!v.dueTime||v.dueTime>=hhmm);
  return futureToday[0]||due[0]||overdue[0]||upcoming[0]||null;
}

// Closed-app alerts go out 5 minutes before a visit, and the server checks once a minute.
// A visit needs at least REMINDER_MIN_LEAD minutes of warning; we suggest REMINDER_SUGGEST_LEAD.
export const REMINDER_MIN_LEAD=10, REMINDER_SUGGEST_LEAD=15;
export function reminderLead(date,time,now=new Date()){
  if(!date||!time)return{soon:false};
  const at=new Date(`${date}T${time}`);
  if(Number.isNaN(at.getTime())||at.getTime()>=now.getTime()+REMINDER_MIN_LEAD*60000)return{soon:false};
  if(at.getTime()<=now.getTime()&&date!==dateKey(now))return{soon:false}; // an old date, not a time being chosen now
  const s=new Date(now.getTime()+REMINDER_SUGGEST_LEAD*60000);
  if(s.getSeconds()||s.getMilliseconds())s.setMinutes(s.getMinutes()+1);
  s.setSeconds(0,0);const m=s.getMinutes();if(m%5)s.setMinutes(m+(5-m%5));
  return{soon:true,past:at.getTime()<=now.getTime(),suggestDate:dateKey(s),suggestTime:`${String(s.getHours()).padStart(2,'0')}:${String(s.getMinutes()).padStart(2,'0')}`};
}
