// Optional closed-app reminders. A separate scheduled Worker sends Web Push.
import { visitInstant } from './visit-time.js?v=1.4.9';
const WORKER_URL='https://revisita-push.davidfontenelle80.workers.dev';
const SUB_KEY='revisita.push.subscription.v1';
const TOKEN_KEY='revisita.push.token.v1';
const SENT_KEY='revisita.push.scheduled.v1';

function get(key){try{return localStorage.getItem(key)||'';}catch{return'';}}
function put(key,value){localStorage.setItem(key,value);}
function bytes(base64){const raw=atob(base64.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-base64.length%4)%4));return Uint8Array.from(raw,c=>c.charCodeAt(0));}
async function request(path,options={}){
 const response=await fetch(WORKER_URL+path,{signal:AbortSignal.timeout(15000),...options,headers:{'content-type':'application/json',...(get(TOKEN_KEY)?{authorization:`Bearer ${get(TOKEN_KEY)}`} : {}),...options.headers}});
 const result=await response.json();
 if(response.status===403||response.status===410)put(SUB_KEY,'');
 if(!response.ok||!result.ok)throw new Error(result.error||`Push request failed (${response.status})`);
 return result;
}
export function pushSupported(){return 'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;}
export function pushEnabled(){return Boolean(get(SUB_KEY))&&pushSupported()&&Notification.permission==='granted';}
export function pushNeedsHomeScreen(){return (/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1))&&!matchMedia('(display-mode: standalone)').matches&&!navigator.standalone;}

export async function enablePush(){
 if(pushNeedsHomeScreen())throw new Error('home-screen');
 if(!pushSupported())throw new Error('unsupported');
 // Must run directly in the click handler, before any network await (Safari).
 const permission=await Notification.requestPermission();
 if(permission!=='granted')throw new Error('permission');
 const config=await request('/api/health').catch(()=>{throw new Error('unavailable');});
 if(!config.hasStore||!config.hasScheduler||!config.hasVapidPrivateKey||!config.vapidPublicKey)throw new Error('unavailable');
 const registration=await navigator.serviceWorker.ready;
 let subscription=await registration.pushManager.getSubscription();
 if(subscription&&!get(TOKEN_KEY)){await subscription.unsubscribe();subscription=null;}
 if(subscription?.options?.applicationServerKey){
  const key=new Uint8Array(subscription.options.applicationServerKey);
  if(key.length!==bytes(config.vapidPublicKey).length||!key.every((v,i)=>v===bytes(config.vapidPublicKey)[i])){
   await subscription.unsubscribe();subscription=null;
  }
 }
 subscription??=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(config.vapidPublicKey)});
 // Persist first so a lost registration response can be retried with ownership.
 if(!get(TOKEN_KEY))put(TOKEN_KEY,Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join(''));
 const result=await request('/api/subscribe',{method:'POST',body:JSON.stringify({app:'revisita',subscription:subscription.toJSON(),token:get(TOKEN_KEY)})});
 put(SUB_KEY,result.subscriptionId);
 return result;
}

export async function disablePush(){
 await syncTail.catch(()=>{});
 const id=get(SUB_KEY);
 if(id)try{await request('/api/unsubscribe',{method:'POST',body:JSON.stringify({app:'revisita',subscriptionId:id})});}catch(e){if(get(SUB_KEY))throw e;}
 const registration=await navigator.serviceWorker.ready;
 await (await registration.pushManager.getSubscription())?.unsubscribe();
 put(SUB_KEY,'');put(TOKEN_KEY,'');put(SENT_KEY,'[]');
}

export function fireAtForVisit(visit){
 if(visit.status!=='active'||visit.deleted)return null;
 const date=visitInstant(visit);if(!date)return null;
 return new Date(date.getTime()-5*60000);
}
// 'ok' when the five-minute reminder can still be scheduled, 'missed' when
// its fire time already passed, 'none' when the visit has no usable date/time.
export function reminderWindow(visit){
 const fire=fireAtForVisit(visit);
 if(!fire)return 'none';
 return fire.getTime()>Date.now()?'ok':'missed';
}

let syncTail=Promise.resolve();
export function syncPushReminders(visits){
 const snapshot=structuredClone(visits);
 const sync=()=>replaceReminders(snapshot);
 syncTail=syncTail.catch(()=>{}).then(()=>navigator.locks?navigator.locks.request('revisita-push-sync',sync):sync());
 return syncTail;
}
async function replaceReminders(visits){
 const id=get(SUB_KEY);
 if(!id||!pushEnabled())return;
 const desired=visits.filter(v=>{const fire=fireAtForVisit(v);return fire&&fire.getTime()>Date.now();});
 return request('/api/reminders/sync',{method:'POST',body:JSON.stringify({app:'revisita',subscriptionId:id,reminders:desired.map(v=>({sourceId:v.id,body:String(v.name).slice(0,120),fireAt:fireAtForVisit(v).toISOString()}))})});
}

export async function testPush(){
 const id=get(SUB_KEY);if(!id)throw new Error('not-enabled');
 return request('/api/test-push',{method:'POST',body:JSON.stringify({app:'revisita',subscriptionId:id,title:'Revisita',body:'Notificación de prueba'})});
}
