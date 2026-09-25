import { createVapidJwt, encryptPushPayload } from './web-push.js';
const ORIGIN='https://davidfontenelle80-cloud.github.io', PATH='/Revisita/';
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const hash=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
const decode=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));

async function body(request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))fail(415,'JSON required.');
 const reader=request.body?.getReader();if(!reader)fail(400,'Body required.');
 const chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>131072){await reader.cancel();fail(413,'Body too large.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 let data;try{data=JSON.parse(new TextDecoder().decode(bytes));}catch{fail(400,'Invalid JSON.');}
 if(!data||Array.isArray(data)||data.app!=='revisita')fail(400,'Invalid app.');return data;
}
async function validateSubscription(sub){
 try{
  const url=new URL(sub.endpoint),host=url.hostname;
  const allowed=host==='fcm.googleapis.com'||host==='updates.push.services.mozilla.com'||host.endsWith('.notify.windows.com')||host==='web.push.apple.com'||host.endsWith('.push.apple.com');
  if(url.protocol!=='https:'||url.port||url.username||url.password||url.hash||!allowed||sub.endpoint.length>4096)throw new Error();
  if(!/^[A-Za-z0-9_-]{87}$/.test(sub.keys.p256dh)||!/^[A-Za-z0-9_-]{22}$/.test(sub.keys.auth))throw new Error();
  const key=decode(sub.keys.p256dh);if(key[0]!==4)throw new Error();
  await crypto.subtle.importKey('raw',key,{name:'ECDH',namedCurve:'P-256'},false,[]);
 }catch{fail(400,'Invalid push subscription.');}
 return {endpoint:sub.endpoint,keys:{p256dh:sub.keys.p256dh,auth:sub.keys.auth}};
}
function health(env){return reply({ok:true,app:'revisita',hasStore:!!env.PUSH_STORE,hasScheduler:!!env.PUSH_SCHEDULER,hasVapidPublicKey:!!env.VAPID_PUBLIC_KEY,vapidPublicKey:env.VAPID_PUBLIC_KEY||'',hasVapidPrivateKey:!!env.VAPID_PRIVATE_KEY,hasVapidSubject:!!env.VAPID_SUBJECT,cron:'* * * * *'});}
export async function sendWebPush(subscription,payload,env){
 const jwt=await createVapidJwt(subscription.endpoint,env),encrypted=await encryptPushPayload(subscription,payload);
 const response=await fetch(subscription.endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{TTL:'300',Urgency:'high','Content-Encoding':'aes128gcm','Content-Type':'application/octet-stream',Authorization:`vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`},body:encrypted});
 if(!response.ok)fail(response.status,'Push service rejected notification.');return response.status;
}

// Revisita-only strongly consistent coordinator. API mutations and cron sends
// share a serial queue, so an acknowledged cancellation cannot read stale KV.
export class PushScheduler {
 constructor(ctx,env){this.storage=ctx.storage;this.env=env;this.tail=Promise.resolve();}
 exclusive(fn){const result=this.tail.then(fn);this.tail=result.catch(()=>{});return result;}
 fetch(request){return this.exclusive(async()=>{try{return await this.route(request);}catch(e){return reply({ok:false,error:e.status?e.message:'Push service unavailable.'},e.status&&e.status<500?e.status:503);}});}
 async rate(key,limit,seconds){
  const now=Date.now();let r=await this.storage.get(key);
  if(!r||r.until<=now)r={count:0,until:now+seconds*1000};
  if(r.count>=limit)fail(429,'Too many requests. Try later.');r.count++;await this.storage.put(key,r);
 }
 async auth(request,id){
  if(typeof id!=='string'||!/^sub_[a-f0-9]{64}$/.test(id))fail(403,'Unauthorized.');
  const sub=await this.storage.get(`sub:${id}`),token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
  if(!sub||await hash(token)!==sub.tokenHash)fail(403,'Unauthorized.');return sub;
 }
 async remove(id){
  const records=await this.storage.list({prefix:`rem:${id}:`});
  const keys=[...records.keys(),`sub:${id}`,`rate:test:${id}`,`rate:sync:${id}`];
  for(let i=0;i<keys.length;i+=128)await this.storage.delete(keys.slice(i,i+128));
 }
 async route(request){
  const path=new URL(request.url).pathname;
  // Internal binding only: the public router rejects this path.
  if(path==='/internal/tick'){await this.tick();return reply({ok:true});}
  const data=await body(request);
  if(path==='/api/subscribe'&&request.method==='POST'){
   const subscription=await validateSubscription(data.subscription),id='sub_'+await hash(subscription.endpoint);
   if(typeof data.token!=='string'||!/^[a-f0-9]{64}$/.test(data.token))fail(400,'A random 32-byte token is required.');
   const existing=await this.storage.get(`sub:${id}`);
   if(existing){await this.auth(request,id);return reply({ok:true,subscriptionId:id});}
   await this.rate(`rate:register:${await hash(request.headers.get('cf-connecting-ip')||'local')}`,10,3600);
   if((await this.storage.list({prefix:'sub:',limit:1000})).size>=1000)fail(429,'Subscription capacity reached.');
   await this.storage.put(`sub:${id}`,{subscription,tokenHash:await hash(data.token),createdAt:Date.now(),lastSeen:Date.now()});
   return reply({ok:true,subscriptionId:id});
  }
  const id=data.subscriptionId,sub=await this.auth(request,id);
  if(path==='/api/unsubscribe'&&request.method==='POST'){await this.remove(id);return reply({ok:true});}
  if(path==='/api/reminders/sync'&&request.method==='POST'){
   if(!Array.isArray(data.reminders)||data.reminders.length>500)fail(400,'Maximum 500 reminders per device.');
   const now=Date.now(),desired=new Map();
   for(const r of data.reminders){
    if(!r||typeof r.sourceId!=='string'||!/^[\w-]{1,80}$/.test(r.sourceId)||typeof r.body!=='string'||r.body.length>120||typeof r.fireAt!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(r.fireAt))fail(400,'Invalid reminder.');
    const ms=Date.parse(r.fireAt);
    if(!Number.isFinite(ms)||new Date(ms).toISOString()!==r.fireAt||ms>now+365*86400000||desired.has(r.sourceId))fail(400,'Invalid reminder time or duplicate ID.');
    if(ms<=now)continue;
    desired.set(r.sourceId,{sourceId:r.sourceId,body:r.body,fireAt:r.fireAt});
   }
   await this.rate(`rate:sync:${id}`,30,60);
   const previous=await this.storage.list({prefix:`rem:${id}:`});
   await this.storage.transaction(async txn=>{
    for(const [key] of previous)if(!desired.has(key.slice(`rem:${id}:`.length)))await txn.delete(key);
    for(const [sourceId,r] of desired){const key=`rem:${id}:${sourceId}`,old=previous.get(key);await txn.put(key,{...r,subscriptionId:id,...(old?.fireAt===r.fireAt&&old.attemptedAt?{attemptedAt:old.attemptedAt}:{})});}
    await txn.put(`sub:${id}`,{...sub,lastSeen:now});
   });
   return reply({ok:true,scheduled:desired.size});
  }
  if(path==='/api/test-push'&&request.method==='POST'){
   await this.rate(`rate:test:${id}`,1,60);
   try{await sendWebPush(sub.subscription,{body:'Notificación de prueba',sourceId:'test-push',url:PATH},this.env);}catch(e){if(e.status===404||e.status===410){await this.remove(id);fail(410,'subscription-expired');}throw e;}
   return reply({ok:true,accepted:true});
  }
  fail(404,'Not found.');
 }
 async tick(){
  const now=Date.now(),reminders=await this.storage.list({prefix:'rem:'});let attempts=0;
  for(const [key,r] of reminders){
   const fire=Date.parse(r.fireAt);if(fire>now)continue;
   if(now-fire>300000){await this.storage.delete(key);continue;}
   if(r.attemptedAt||attempts>=100)continue;
   const sub=await this.storage.get(`sub:${r.subscriptionId}`);if(!sub){await this.storage.delete(key);continue;}
   // At most one submission: persist before sending. Ambiguous network failures
   // are not retried; this favors avoiding duplicates over guaranteed delivery.
   await this.storage.put(key,{...r,attemptedAt:now});attempts++;
   let status='accepted',sendError='';
   try{await sendWebPush(sub.subscription,{body:r.body,sourceId:r.sourceId,url:PATH},this.env);}catch(e){status=e.status?`rejected-${e.status}`:'network-error';sendError=String((e&&e.message)||e).slice(0,160);if(e.status===404||e.status===410)await this.remove(r.subscriptionId);console.error('[revisita-push] send failed',status,sendError);}
   await this.env.PUSH_STORE.put(`delivery:${crypto.randomUUID()}`,JSON.stringify({scheduledAt:r.fireAt,attemptedAt:new Date(now).toISOString(),status,error:sendError}),{expirationTtl:86400}).catch(()=>{});
  }
  for(const [key,r] of await this.storage.list({prefix:'rate:'}))if(r.until<=now)await this.storage.delete(key);
  for(const [key,s] of await this.storage.list({prefix:'sub:'}))if(now-s.lastSeen>366*86400000)await this.remove(key.slice(4));
 }
}
export default {
 async fetch(request,env){
  const allowed=env.ALLOWED_ORIGIN||ORIGIN,cors={'access-control-allow-origin':allowed,'access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'content-type, authorization','vary':'Origin'};let response;
  if(request.headers.get('origin')&&request.headers.get('origin')!==allowed)response=reply({ok:false,error:'Origin not allowed.'},403);
  else if(request.method==='OPTIONS')response=new Response(null,{status:204});
  else if(request.method==='GET'&&new URL(request.url).pathname==='/api/health')response=health(env);
  else if(!['/api/subscribe','/api/unsubscribe','/api/reminders/sync','/api/test-push'].includes(new URL(request.url).pathname)||request.method!=='POST')response=reply({ok:false,error:'Not found.'},404);
  else if(!env.PUSH_SCHEDULER||!env.PUSH_STORE||!env.VAPID_PRIVATE_KEY)response=reply({ok:false,error:'Service not configured.'},503);
  else response=await env.PUSH_SCHEDULER.get(env.PUSH_SCHEDULER.idFromName('revisita')).fetch(request);
  const out=new Response(response.body,response);for(const [k,v] of Object.entries(cors))out.headers.set(k,v);return out;
 },
 async scheduled(_event,env,ctx){ctx.waitUntil(env.PUSH_SCHEDULER.get(env.PUSH_SCHEDULER.idFromName('revisita')).fetch('https://internal/internal/tick'));}
};
