import test from 'node:test';
import assert from 'node:assert/strict';
import { hkdfSync,createDecipheriv } from 'node:crypto';
import { fireAtForVisit,reminderWindow } from '../js/push.js';
import { visitInstant } from '../js/visit-time.js';
import { normalizeVisit } from '../js/storage.js';
import { buildICS,googleCalendarUrl } from '../js/visit-tools.js';
import worker,{PushScheduler} from '../cloudflare/revisita-push/worker.js';

const b64=b=>Buffer.from(b).toString('base64url');
async function keys(){
 const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
 const jwk=await crypto.subtle.exportKey('jwk',pair.privateKey);
 return {VAPID_PUBLIC_KEY:b64(await crypto.subtle.exportKey('raw',pair.publicKey)),VAPID_PRIVATE_KEY:jwk.d,VAPID_SUBJECT:'mailto:test@example.com'};
}
function memory(){
 const records=new Map();const s={
 get:async k=>structuredClone(records.get(k)),put:async(k,v)=>records.set(k,structuredClone(v)),
 delete:async keys=>{for(const k of Array.isArray(keys)?keys:[keys])records.delete(k);},
 list:async({prefix='',limit=Infinity}={})=>new Map([...records].filter(([k])=>k.startsWith(prefix)).sort().slice(0,limit).map(([k,v])=>[k,structuredClone(v)])),
 transaction:async fn=>{const before=new Map(records);try{return await fn(s);}catch(e){records.clear();for(const [k,v] of before)records.set(k,v);throw e;}}
 };return s;
}
async function setup(){
 const store=memory(),receipts=memory(),env={...await keys(),PUSH_STORE:receipts};
 const scheduler=new PushScheduler({storage:store},env);
 env.PUSH_SCHEDULER={idFromName:x=>x,get:()=>({fetch:r=>scheduler.fetch(typeof r==='string'?new Request(r):r)})};
 const send=(path,data,token,headers={})=>worker.fetch(new Request('https://worker.example'+path,{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`} : {}),...headers},body:JSON.stringify({app:'revisita',...data})}),env);
 const pair=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/device1',keys:{p256dh:b64(await crypto.subtle.exportKey('raw',pair.publicKey)),auth:b64(crypto.getRandomValues(new Uint8Array(16)))}};
 const token='ab'.repeat(32),response=await send('/api/subscribe',{subscription,token});
 assert.equal(response.status,200);const {subscriptionId}=await response.json();
 const sync=(reminders,t=token,id=subscriptionId)=>send('/api/reminders/sync',{subscriptionId:id,reminders},t);
 return {store,receipts,env,scheduler,send,subscription,subscriptionId,token,sync,pair};
}
const reminder=(id='one',minutes=10)=>({sourceId:id,body:'Disposable visit',fireAt:new Date(Date.now()+minutes*60000).toISOString()});

test('five-minute scheduling excludes untimed, completed, deleted and invalid dates',()=>{
 const v={dueDate:'2026-09-26',dueTime:'10:00',status:'active',dueTimeZone:'America/Santo_Domingo'};
 assert.equal(fireAtForVisit(v).toISOString(),'2026-09-26T13:55:00.000Z');
 for(const patch of [{dueTime:''},{status:'completed'},{deleted:true},{dueDate:'2026-02-30'},{dueTime:'24:00'}])assert.equal(fireAtForVisit({...v,...patch}),null);
});
test('reminder window flags visits whose five-minute fire time already passed',()=>{
 // Wall-clock minutes from now in America/Santo_Domingo (UTC-4, no DST).
 const wallIn=m=>{const wall=new Date(Date.now()+m*60000-4*3600000);return{dueDate:wall.toISOString().slice(0,10),dueTime:wall.toISOString().slice(11,16)};};
 const base={status:'active',dueTimeZone:'America/Santo_Domingo'};
 assert.equal(reminderWindow({...base,...wallIn(60)}),'ok');
 assert.equal(reminderWindow({...base,...wallIn(3)}),'missed');
 assert.equal(reminderWindow({...base,dueDate:'2026-09-26',dueTime:''}),'none');
 assert.equal(reminderWindow({...base,...wallIn(60),status:'completed'}),'none');
});
test('Connecticut and DR conversion uses visit-date DST, preserves zone across devices',()=>{
 const v={dueDate:'2026-12-01',dueTime:'10:00',dueTimeZone:'America/New_York'};
 assert.equal(visitInstant(v).toISOString(),'2026-12-01T15:00:00.000Z');
 assert.equal(visitInstant({...v,dueDate:'2026-07-01'}).toISOString(),'2026-07-01T14:00:00.000Z');
 assert.equal(visitInstant({...v,dueTimeZone:'America/Santo_Domingo'}).toISOString(),'2026-12-01T14:00:00.000Z');
 assert.equal(visitInstant({...v,dueDate:'2026-03-08',dueTime:'02:30'}),null);
 assert.equal(visitInstant({...v,dueDate:'2026-11-01',dueTime:'01:30'}).toISOString(),'2026-11-01T05:30:00.000Z');
 const normalized=normalizeVisit({...v,id:'time',name:'Test',lat:18,lng:-70});
 assert.equal(normalized.dueTimeZone,v.dueTimeZone);
 assert.match(buildICS(normalized,{alarmMinutes:5}),/DTSTART:20261201T150000Z\r\n/);
 assert.match(buildICS(normalized,{alarmMinutes:5}),/TRIGGER:-PT5M\r\n/);
 assert.equal(new URL(googleCalendarUrl(normalized)).searchParams.get('ctz'),'America/New_York');
});
test('registration cannot steal an existing token; multiple devices remain independent',async()=>{
 const h=await setup();
 assert.equal((await h.send('/api/subscribe',{subscription:h.subscription,token:'cd'.repeat(32)})).status,403);
 assert.equal((await h.send('/api/subscribe',{subscription:h.subscription,token:h.token},h.token)).status,200);
 const second=await (await h.send('/api/subscribe',{subscription:{...h.subscription,endpoint:h.subscription.endpoint+'2'},token:'cd'.repeat(32)})).json();
 assert.notEqual(second.subscriptionId,h.subscriptionId);
 assert.equal((await h.sync([reminder()],undefined,second.subscriptionId)).status,403);
 assert.equal((await h.sync([reminder()])).status,200);
 assert.equal((await h.sync([reminder()], 'cd'.repeat(32),second.subscriptionId)).status,200);
 assert.equal((await h.store.list({prefix:'rem:'})).size,2);
});
test('atomic replacement handles reschedule, deletion, completion, past reminders and duplicate sync',async()=>{
 const h=await setup(),first=reminder();
 assert.equal((await h.sync([first])).status,200);
 assert.equal((await h.sync([first])).status,200);
 assert.equal((await h.store.list({prefix:'rem:'})).size,1);
 const moved=reminder('one',20);await h.sync([moved]);
 assert.equal((await h.store.get(`rem:${h.subscriptionId}:one`)).fireAt,moved.fireAt);
 await h.sync([reminder('past',-10)]);assert.equal((await h.store.list({prefix:'rem:'})).size,0);
 await h.sync([first]);await h.sync([]);assert.equal((await h.store.list({prefix:'rem:'})).size,0);
});
test('rejects unauthorized changes/tests, hostile endpoints, invalid and oversized input',async()=>{
 const h=await setup();
 assert.equal((await h.sync([reminder()],'bad')).status,403);
 assert.equal((await h.send('/api/test-push',{subscriptionId:h.subscriptionId})).status,403);
 assert.equal((await h.send('/api/subscribe',{subscription:{...h.subscription,endpoint:'https://127.0.0.1/private'},token:h.token})).status,400);
 assert.equal((await h.sync([{...reminder(),sourceId:'../bad'}])).status,400);
 assert.equal((await h.sync([{...reminder(),body:'a'.repeat(121)}])).status,400);
 assert.equal((await h.sync([reminder('far',366*1440)])).status,400);
 assert.equal((await h.send('/api/reminders/sync',{padding:'x'.repeat(131073)},h.token)).status,413);
 assert.equal((await h.send('/api/test-push',{subscriptionId:h.subscriptionId},h.token,{origin:'https://evil.example'})).status,403);
 assert.equal((await worker.fetch(new Request('https://worker.example/internal/tick'),h.env)).status,404);
 const health=await (await worker.fetch(new Request('https://worker.example/api/health'),h.env)).text();
 assert.ok(!health.includes(h.env.VAPID_PRIVATE_KEY));assert.match(health,/"hasScheduler":true/);
});
test('cron submits encrypted Web Push once, respects cancellations and expires dead subscriptions',async t=>{
 const h=await setup(),sent=[];
 t.mock.method(globalThis,'fetch',async(url,opts)=>{sent.push({url,opts});return new Response(null,{status:201});});
 await h.sync([reminder('send'),reminder('delete')]);await h.sync([reminder('send')]);
 const key=`rem:${h.subscriptionId}:send`,r=await h.store.get(key);r.fireAt=new Date(Date.now()-1000).toISOString();await h.store.put(key,r);
 await Promise.all([h.scheduler.fetch(new Request('https://internal/internal/tick')),h.scheduler.fetch(new Request('https://internal/internal/tick'))]);
 assert.equal(sent.length,1);assert.equal(sent[0].opts.headers['Content-Encoding'],'aes128gcm');
 assert.equal(sent[0].opts.headers.TTL,'300');assert.match(sent[0].opts.headers.Authorization,/^vapid t=/);
 assert.ok(sent[0].opts.body instanceof Uint8Array);assert.ok(!Buffer.from(sent[0].opts.body).includes(Buffer.from('Disposable visit')));
 // Independently decrypt RFC 8291 payload using the subscriber's private key.
 const wire=Buffer.from(sent[0].opts.body),salt=wire.subarray(0,16),sender=wire.subarray(21,86);
 assert.equal(wire.readUInt32BE(16),4096);assert.equal(wire[20],65);
 const publicKey=await crypto.subtle.importKey('raw',sender,{name:'ECDH',namedCurve:'P-256'},false,[]);
 const shared=await crypto.subtle.deriveBits({name:'ECDH',public:publicKey},h.pair.privateKey,256);
 const info=Buffer.concat([Buffer.from('WebPush: info\0'),Buffer.from(h.subscription.keys.p256dh,'base64url'),sender]);
 const ikm=hkdfSync('sha256',Buffer.from(shared),Buffer.from(h.subscription.keys.auth,'base64url'),info,32);
 const cek=hkdfSync('sha256',ikm,salt,Buffer.from('Content-Encoding: aes128gcm\0'),16);
 const nonce=hkdfSync('sha256',ikm,salt,Buffer.from('Content-Encoding: nonce\0'),12);
 const decipher=createDecipheriv('aes-128-gcm',cek,nonce);decipher.setAuthTag(wire.subarray(-16));
 const plain=Buffer.concat([decipher.update(wire.subarray(86,-16)),decipher.final()]);
 assert.equal(plain.at(-1),2);assert.equal(JSON.parse(plain.subarray(0,-1)).body,'Disposable visit');
 const jwt=sent[0].opts.headers.Authorization.match(/^vapid t=([^,]+)/)[1],segments=jwt.split('.');
 assert.equal(JSON.parse(Buffer.from(segments[1],'base64url')).aud,'https://fcm.googleapis.com');
 const vapidKey=await crypto.subtle.importKey('raw',Buffer.from(h.env.VAPID_PUBLIC_KEY,'base64url'),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
 assert.equal(await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},vapidKey,Buffer.from(segments[2],'base64url'),Buffer.from(segments.slice(0,2).join('.'))),true);
 assert.equal((await h.receipts.list()).size,1);
 t.mock.method(globalThis,'fetch',async()=>new Response(null,{status:410}));
 assert.equal((await h.send('/api/test-push',{subscriptionId:h.subscriptionId},h.token)).status,410);
 assert.equal((await h.store.list({prefix:'sub:'})).size,0);assert.equal((await h.store.list({prefix:'rem:'})).size,0);
});
test('test push is rate limited and unsubscribe removes all device state',async t=>{
 const h=await setup();t.mock.method(globalThis,'fetch',async()=>new Response(null,{status:201}));
 assert.equal((await h.send('/api/test-push',{subscriptionId:h.subscriptionId},h.token)).status,200);
 assert.equal((await h.send('/api/test-push',{subscriptionId:h.subscriptionId},h.token)).status,429);
 await h.sync([reminder()]);assert.equal((await h.send('/api/unsubscribe',{subscriptionId:h.subscriptionId},h.token)).status,200);
 assert.equal((await h.store.list({prefix:'rem:'})).size,0);assert.equal((await h.store.list({prefix:'sub:'})).size,0);
});
test('a push-service rejection on test push is 424, not an ownership 403',async t=>{
 const h=await setup();t.mock.method(globalThis,'fetch',async()=>new Response(null,{status:403}));
 const res=await h.send('/api/test-push',{subscriptionId:h.subscriptionId},h.token);
 assert.equal(res.status,424);assert.equal((await res.json()).error,'push-rejected-403');
 assert.equal((await h.store.list({prefix:'sub:'})).size,1);
});
