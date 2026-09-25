import test from 'node:test';
import assert from 'node:assert/strict';

// Minimal browser stand-in for js/push.js setup detection.
function env(t,{permission='default',ios=false,standalone=false,push=true,values={}}={}){
 const store=new Map(Object.entries(values));
 const globals={localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},window:push?{PushManager:true,Notification:true}:{},matchMedia:()=>({matches:standalone}),Notification:{permission,requestPermission:async()=>permission},navigator:{userAgent:ios?'iPhone':'test',standalone,serviceWorker:{ready:Promise.resolve({pushManager:{getSubscription:async()=>null}})}}};
 for(const [key,value] of Object.entries(globals)){const old=Object.getOwnPropertyDescriptor(globalThis,key);Object.defineProperty(globalThis,key,{configurable:true,value});t.after(()=>{if(old)Object.defineProperty(globalThis,key,old);else delete globalThis[key];});}
 return store;
}
let n=0;const load=()=>import(`../js/push.js?setup-${n++}`);

test('iPhone in Safari needs the Home Screen app before anything else',async t=>{
 env(t,{ios:true,push:false});const p=await load();
 assert.equal(p.pushSetupState(),'home-screen');assert.equal(p.pushSetupNeeded(),true);
});
test('never-asked, blocked, allowed-but-unregistered and ready are told apart',async t=>{
 const store=env(t,{permission:'default'});const p=await load();
 assert.equal(p.pushSetupState(),'ask');
 Notification.permission='denied';assert.equal(p.pushSetupState(),'denied');
 Notification.permission='granted';assert.equal(p.pushSetupState(),'register');
 store.set('revisita.push.subscription.v1','sub_x');assert.equal(p.pushSetupState(),'ready');assert.equal(p.pushSetupNeeded(),false);
});
test('a device the user switched off is not nagged',async t=>{
 env(t,{permission:'granted',values:{'revisita.push.optout.v1':'1'}});const p=await load();
 assert.equal(p.pushSetupState(),'off');assert.equal(p.pushSetupNeeded(),false);
});
test('browsers without Web Push are unsupported, not nagged',async t=>{
 env(t,{push:false});const p=await load();
 assert.equal(p.pushSetupState(),'unsupported');assert.equal(p.pushSetupNeeded(),false);
});
test('"Not now" snoozes the save-time prompt',async t=>{
 env(t);const p=await load();
 assert.equal(p.pushPromptSnoozed(),false);p.snoozePushPrompt(60000);assert.equal(p.pushPromptSnoozed(),true);
 p.snoozePushPrompt(-1);assert.equal(p.pushPromptSnoozed(),false);
});
test('a push-service rejection keeps the device registered; lost ownership clears it',async t=>{
 const store=env(t,{permission:'granted',values:{'revisita.push.subscription.v1':'sub_x','revisita.push.token.v1':'ab'.repeat(32)}});const p=await load();
 t.mock.method(globalThis,'fetch',async()=>Response.json({ok:false,error:'push-rejected-403'},{status:424}));
 await assert.rejects(p.testPush());assert.equal(store.get('revisita.push.subscription.v1'),'sub_x');
 fetch.mock.mockImplementation(async()=>Response.json({ok:false,error:'Unauthorized.'},{status:403}));
 await assert.rejects(p.testPush());assert.equal(store.get('revisita.push.subscription.v1'),'');
});
