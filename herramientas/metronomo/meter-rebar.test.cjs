const {test}=require('node:test'),assert=require('node:assert/strict');
const S=require('./rhythm-structure.js');
const note=(id,bar,offset,beats=1)=>({id,bar,offset,beats,note:'C4',staff:1});
const absolute=(events,tl)=>events.map(e=>[e.id,tl.absolute(e.bar,e.offset),e.beats]);
test('2/4 to 4/4 joins consecutive bars without inserting gaps, keeping rests and chords',()=>{
 const events=[note('a',0,0,2),note('b',1,0,2),{...note('c',2,0),notes:['C4','E4','G4']},{...note('r',2,1),kind:'rest'}];
 const old=S.timeline('2/4',[],3),next=[{type:'meter',bar:0,meter:'4/4'}],r=S.rebar(events,[],old,'2/4',next,3),tl=S.timeline('2/4',r.marks,r.bars);
 assert.deepEqual(absolute(r.events,tl),absolute(events,old));assert.deepEqual(r.events.map(e=>[e.bar,e.offset]),[[0,0],[0,2],[1,0],[1,1]]);assert.equal(r.events[2].notes.length,3);
});
test('4/4 to 2/4 preserves all music on both staves and adds bars as needed',()=>{
 const events=[note('a',0,0,2),note('b',0,2,2),note('c',1,0,4),{...note('bass',0,0,4),staff:2}];
 const r=S.rebar(events,[],S.timeline('4/4',[],2),'4/4',[{type:'meter',bar:0,meter:'2/4'}],2);
 assert.equal(r.bars,4);assert.equal(r.events.reduce((sum,e)=>sum+e.beats,0),12);assert.ok(r.events.every(e=>e.offset+e.beats<=2));assert.equal(r.events.find(e=>e.id==='c').tieToId,r.events.find(e=>e.id.startsWith('c-part')).id);
});
test('rebar preserves accidentals, dynamics and fractional tuplet timing',()=>{
 const events=[{...note('a',0,0),note:'F4',accidental:'sharp'},note('b',0,1),...Array.from({length:3},(_,i)=>({...note('t'+i,1,i/3,1/3),tupletUnitBeats:.5}))];
 const marks=[{type:'dynamic',bar:1,offset:0,value:'p'}],old=S.timeline('2/4',marks,2),r=S.rebar(events,marks,old,'2/4',[...marks,{type:'meter',bar:0,meter:'4/4'}],2);
 assert.equal(S.resolve(r.events,r.marks)[0].note,'F#4');assert.equal(r.marks[0].offset,2);assert.equal(r.marks[0].bar,0);assert.deepEqual(r.events.slice(2).map(e=>e.beats),[1/3,1/3,1/3]);
});
test('changing meter from a later bar keeps earlier music in place and never silently truncates',()=>{
 const events=[note('a',0,0,4),note('b',1,0,4)];const r=S.rebar(events,[],S.timeline('4/4',[],2),'4/4',[{type:'meter',bar:1,meter:'2/4'}],2);
 assert.equal(r.events[0].beats,4);assert.equal(r.events[0].bar,0);assert.equal(r.bars,3);
 const before=JSON.stringify(events),fail=S.rebar(events,[],S.timeline('4/4',[],2),'1/16',[],2);assert.match(fail.message,/No se modificó/);assert.equal(JSON.stringify(events),before);
});
