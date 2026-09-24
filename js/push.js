// Optional closed-app reminders. A separate scheduled Worker sends Web Push.
const WORKER_URL='https://revisita-push.davidfontenelle80.workers.dev';
const SUB_KEY='revisita.push.subscription.v1';
const TOKEN_KEY='revisita.push.token.v1';
const SENT_KEY='revisita.push.scheduled.v1';
const SOURCE_TYPE='revisita';

function get(key){try{return localStorage.getItem(key)||'';}catch{return'';}}
function put(key,value){try{localStorage.setItem(key,value);}catch{}}
function bytes(base64){const raw=atob(base64.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-base64.length%4)%4));return Uint8Array.from(raw,c=>c.charCodeAt(0));}
async function request(path,options={}){
 const response=await fetch(WORKER_URL+path,{...options,headers:{'content-type':'application/json',...(get(TOKEN_KEY)?{authorization:`Bearer ${get(TOKEN_KEY)}`} : {}),...options.headers}});
 const result=await response.json();
 if(!response.ok||!result.ok)throw new Error(result.error||`Push request failed (${response.status})`);
 return result;
}
export function pushSupported(){return 'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;}
export function pushEnabled(){return Boolean(get(SUB_KEY))&&pushSupported()&&Notification.permission==='granted';}
export function pushNeedsHomeScreen(){return /iPhone|iPad|iPod/.test(navigator.userAgent)&&!matchMedia('(display-mode: standalone)').matches&&!navigator.standalone;}

export async function enablePush(){
 if(!pushSupported())throw new Error('unsupported');
 if(pushNeedsHomeScreen())throw new Error('home-screen');
 const config=await request('/api/health').catch(()=>{throw new Error('unavailable');});
 if(!config.hasStore||!config.hasVapidPrivateKey||!config.vapidPublicKey)throw new Error('unavailable');
 const permission=await Notification.requestPermission();
 if(permission!=='granted')throw new Error('permission');
 const registration=await navigator.serviceWorker.ready;
 let subscription=await registration.pushManager.getSubscription();
 if(subscription?.options?.applicationServerKey){
  const key=new Uint8Array(subscription.options.applicationServerKey);
  if(key.length!==bytes(config.vapidPublicKey).length||!key.every((v,i)=>v===bytes(config.vapidPublicKey)[i])){
   await subscription.unsubscribe();subscription=null;
  }
 }
 subscription??=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(config.vapidPublicKey)});
 const result=await request('/api/subscribe',{method:'POST',body:JSON.stringify({app:'revisita',subscription:subscription.toJSON()})});
 put(SUB_KEY,result.subscriptionId);
 put(TOKEN_KEY,result.token);
 return result;
}

export async function disablePush(){
 const id=get(SUB_KEY);
 const scheduled=JSON.parse(get(SENT_KEY)||'[]');
 if(id)await Promise.all(scheduled.map(sourceId=>request(`/api/reminders/${SOURCE_TYPE}/${encodeURIComponent(sourceId)}?subscriptionId=${encodeURIComponent(id)}`,{method:'DELETE'}).catch(()=>{})));
 const registration=await navigator.serviceWorker.ready;
 await (await registration.pushManager.getSubscription())?.unsubscribe();
 put(SUB_KEY,'');put(TOKEN_KEY,'');put(SENT_KEY,'[]');
}

export function fireAtForVisit(visit){
 if(visit.status==='completed'||!/^\d{4}-\d{2}-\d{2}$/.test(visit.dueDate||'')||!/^\d{2}:\d{2}$/.test(visit.dueTime||''))return null;
 const date=new Date(`${visit.dueDate}T${visit.dueTime}:00`);
 if(Number.isNaN(date.getTime()))return null;
 return new Date(date.getTime()-5*60000);
}

export async function syncPushReminders(visits){
 const id=get(SUB_KEY);
 if(!id||!pushEnabled())return;
 const desired=visits.filter(v=>{const fire=fireAtForVisit(v);return fire&&fire.getTime()>Date.now();});
 const previous=JSON.parse(get(SENT_KEY)||'[]');
 const desiredIds=new Set(desired.map(v=>v.id));
 for(const sourceId of previous.filter(x=>!desiredIds.has(x))){
  await request(`/api/reminders/${SOURCE_TYPE}/${encodeURIComponent(sourceId)}?subscriptionId=${encodeURIComponent(id)}`,{method:'DELETE'});
 }
 for(const v of desired){
  await request('/api/reminders',{method:'POST',body:JSON.stringify({app:'revisita',subscriptionId:id,sourceType:SOURCE_TYPE,sourceId:v.id,title:'Revisita',body:v.name,fireAt:fireAtForVisit(v).toISOString(),url:'/Revisita/'})});
 }
 put(SENT_KEY,JSON.stringify([...desiredIds]));
}

export async function testPush(){
 const id=get(SUB_KEY);if(!id)throw new Error('not-enabled');
 return request('/api/test-push',{method:'POST',body:JSON.stringify({app:'revisita',subscriptionId:id,title:'Revisita',body:'Notificación de prueba'})});
}
