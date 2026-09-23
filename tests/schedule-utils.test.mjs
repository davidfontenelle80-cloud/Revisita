import test from'node:test';import assert from'node:assert/strict';import{visitBucket,compareSchedule,formatTime,selectNextVisit}from'../js/schedule-utils.js';
test('classifies active visits',()=>{assert.equal(visitBucket({status:'active',dueDate:'2026-09-21'},'2026-09-22'),'overdue');assert.equal(visitBucket({status:'active',dueDate:'2026-09-22'},'2026-09-22'),'today');assert.equal(visitBucket({status:'active',dueDate:'2026-09-23'},'2026-09-22'),'upcoming');assert.equal(visitBucket({status:'active',dueDate:''},'2026-09-22'),'undated');assert.equal(visitBucket({status:'completed',dueDate:'2026-09-22'},'2026-09-22'),'completed');});
test('sorts timed visits before untimed on same date',()=>{const a={dueDate:'2026-09-22',dueTime:'14:00'},b={dueDate:'2026-09-22',dueTime:''},c={dueDate:'2026-09-22',dueTime:'09:00'};assert.deepEqual([a,b,c].sort(compareSchedule),[c,a,b]);});
test('formats time for display',()=>{assert.ok(formatTime('14:30').length>0);assert.equal(formatTime(''),'');});

test('selects the next uncompleted visit for Today first',()=>{
  const now=new Date(2026,8,22,10,0);
  const visits=[
    {id:'past',status:'active',dueDate:'2026-09-22',dueTime:'09:00'},
    {id:'next',status:'active',dueDate:'2026-09-22',dueTime:'11:00'},
    {id:'future',status:'active',dueDate:'2026-09-23',dueTime:'08:00'}
  ];
  assert.equal(selectNextVisit(visits,now).id,'next');
});

test('falls back to overdue and ignores completed visits',()=>{
  const now=new Date(2026,8,22,18,0);
  const visits=[
    {id:'done',status:'completed',dueDate:'2026-09-22',dueTime:'19:00'},
    {id:'old',status:'active',dueDate:'2026-09-20',dueTime:'12:00'},
    {id:'future',status:'active',dueDate:'2026-09-24',dueTime:'08:00'}
  ];
  assert.equal(selectNextVisit(visits,now).id,'old');
});
