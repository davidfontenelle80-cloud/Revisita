import test from 'node:test';
import assert from 'node:assert/strict';

function browser(t,{permission='granted',ios=false,standalone=false}={}){
 const values=new Map(),calls=[];
 const sub={toJSON:()=>({endpoint:'https://fcm.googleapis.com/test',keys:{}}),unsubscribe:async()=>{calls.push('unsubscribe');}};
 const globals={localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)},window:{PushManager:true,Notification:true},matchMedia:()=>({matches:standalone}),Notification:{permission,requestPermission:async()=>{calls.push('permission');return permission;}},navigator:{userAgent:ios?'iPhone':'test',serviceWorker:{ready:Promise.resolve({pushManager:{getSubscription:async()=>null,subscribe:async()=>sub}})},locks:{request:async(_name,fn)=>fn()}}};
 for(const [key,value] of Object.entries(globals)){const old=Object.getOwnPropertyDescriptor(globalThis,key);Object.defineProperty(globalThis,key,{configurable:true,value});t.after(()=>{if(old)Object.defineProperty(globalThis,key,old);else delete globalThis[key];});}
 t.mock.method(globalThis,'fetch',async(url,opts)=>{calls.push({url,opts});return Response.json(url.endsWith('/api/health')?{ok:true,hasStore:true,hasScheduler:true,hasVapidPrivateKey:true,vapidPublicKey:'BA'}:{ok:true,subscriptionId:'device'});});
 return {values,calls};
}
test('enable requests permission before fetching, and retains ownership token before registration',async t=>{
 const h=browser(t),push=await import('../js/push.js?permission-test');await push.enablePush();
 assert.equal(h.calls[0],'permission');assert.ok(h.calls[1].url.endsWith('/api/health'));
 assert.match(h.values.get('revisita.push.token.v1'),/^[a-f0-9]{64}$/);
 const registered=JSON.parse(h.calls.find(x=>x.url?.endsWith('/api/subscribe')).opts.body);
 assert.equal(registered.token,h.values.get('revisita.push.token.v1'));
});
test('denied permission and non-installed iPhone never register or schedule',async t=>{
 const h=browser(t,{permission:'denied'}),push=await import('../js/push.js?denied-test');
 await assert.rejects(push.enablePush(),/permission/);assert.deepEqual(h.calls,['permission']);
 navigator.userAgent='iPhone';delete window.PushManager;
 await assert.rejects(push.enablePush(),/home-screen/);assert.deepEqual(h.calls,['permission']);
});
test('client replaces whole schedule including cancellation after partial state loss',async t=>{
 const h=browser(t);h.values.set('revisita.push.subscription.v1','device');h.values.set('revisita.push.token.v1','ab'.repeat(32));
 const push=await import('../js/push.js?sync-test');
 const soon=new Date(Date.now()+3600000),date=soon.toISOString().slice(0,10),time=soon.toISOString().slice(11,16);
 const v={id:'one',name:'Test',status:'active',dueDate:date,dueTime:time,dueTimeZone:'UTC'};
 await Promise.all([push.syncPushReminders([v,{...v,id:'untimed',dueTime:''},{...v,id:'done',status:'completed'}]),push.syncPushReminders([])]);
 const payloads=h.calls.filter(x=>x.url?.endsWith('/api/reminders/sync')).map(x=>JSON.parse(x.opts.body));
 assert.equal(payloads.length,2);assert.equal(payloads[0].reminders.length,1);assert.equal(payloads[0].reminders[0].sourceId,'one');assert.deepEqual(payloads[1].reminders,[]);
});
