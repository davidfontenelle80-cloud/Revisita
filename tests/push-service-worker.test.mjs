import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

test('push displays a stable notification and taps focus or open only Revisita',async()=>{
 const events={},notifications=[],opened=[];let focused=false;
 const clients={matchAll:async()=>[],openWindow:async url=>opened.push(url)};
 const self={location:'https://example.com/Revisita/sw.js',addEventListener:(name,fn)=>events[name]=fn,registration:{showNotification:async(title,options)=>notifications.push({title,options})},clients};
 vm.runInNewContext(fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8'),{self,URL,console});
 let pending;const waitUntil=p=>pending=p;
 events.push({data:{json:()=>({sourceId:'one',body:'Visit',url:'https://evil.example'})},waitUntil});await pending;
 assert.equal(notifications[0].options.tag,'revisita-one');assert.equal(notifications[0].options.data.url,'./');
 events.notificationclick({notification:{close(){}},waitUntil});await pending;assert.deepEqual(opened,['./']);
 clients.matchAll=async()=>[{url:'https://example.com/OtherApp/',focus:()=>assert.fail('Wrong app')},{url:'https://example.com/Revisita/',focus:async()=>focused=true}];
 events.notificationclick({notification:{close(){}},waitUntil});await pending;assert.equal(focused,true);assert.equal(opened.length,1);
});
