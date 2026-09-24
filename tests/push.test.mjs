import test from 'node:test';
import assert from 'node:assert/strict';
import { fireAtForVisit } from '../js/push.js';
import worker from '../cloudflare/revisita-push/worker.js';

test('a timed visit fires five minutes before its local scheduled time', () => {
  const visit={id:'visit-1',dueDate:'2026-09-26',dueTime:'10:00',status:'active'};
  assert.equal(fireAtForVisit(visit).getTime(),new Date('2026-09-26T10:00:00').getTime()-300000);
  assert.equal(fireAtForVisit({...visit,dueTime:''}),null);
  assert.equal(fireAtForVisit({...visit,status:'completed'}),null);
});

test('push backend protects reminders with the subscription token', async () => {
  const records=new Map();
  const env={PUSH_STORE:{get:async(key,type)=>{const raw=records.get(key);return type==='json'&&raw?JSON.parse(raw):raw;},put:async(key,value)=>records.set(key,value),delete:async key=>records.delete(key)},VAPID_PUBLIC_KEY:'public-key'};
  const base='https://revisita-push.example';
  const send=(path,body,token)=>worker.fetch(new Request(base+path,{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)}),env);
  const subscribe=await send('/api/subscribe',{app:'revisita',subscription:{endpoint:'https://push.example/device',keys:{p256dh:'p',auth:'a'}}});
  const {subscriptionId,token}=await subscribe.json();
  const payload={app:'revisita',subscriptionId,sourceType:'revisita',sourceId:'visit-1',fireAt:new Date(Date.now()+600000).toISOString(),body:'Casa verde'};
  assert.equal((await send('/api/reminders',payload)).status,403);
  assert.equal((await send('/api/reminders',payload,token)).status,200);
  assert.equal((await send('/api/reminders',{...payload,fireAt:new Date(Date.now()-120000).toISOString()},token)).status,400);
  assert.equal((await worker.fetch(new Request(`${base}/api/reminders/revisita/visit-1?subscriptionId=${subscriptionId}`,{method:'DELETE',headers:{authorization:`Bearer ${token}`}}),env)).status,200);
});
