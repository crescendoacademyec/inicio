const {test}=require('node:test'),assert=require('node:assert/strict');
const O=require('../../shared/overflow-writing.js'),W=require('./rhythm-writing.js');
test('overflow offers duration-preserving notation for half, whole and variable meters',()=>{
 for(const [duration,expected] of [[2,[1,1]],[4,[1,3]],[8,[1,4,3]]]){
  const p=O.plan({capacities:[4,4,4],bar:0,offset:3,duration});assert.deepEqual(p.segments.map(s=>s.beats),expected);assert.equal(p.segments.reduce((n,s)=>n+s.beats,0),duration);assert.match(O.message(p),/solo queda 1 tiempo/);
 }
 const p=O.plan({capacities:[4,3,2],bar:0,offset:3,duration:8});assert.deepEqual(p.segments.map(s=>s.beats),[1,3,2,2]);assert.equal(O.plan({capacities:[4],bar:0,offset:3,duration:8,maxBars:1}),null);
});
test('accepting overflow creates two tied notes and preserves later tails, other staves, sounding accidentals and undo',()=>{
 for(const staff of [1,2]){
  const s=W.create(),events=[{id:'old',staff,bar:1,offset:0,beats:2,note:'E4'},{id:'other',staff:staff===1?2:1,bar:0,offset:0,beats:4,note:'G3'}];W.select(s,'duration','half');W.select(s,'accidental','sharp');
  const before=JSON.stringify(events),p=W.overflowPlan(s,events,[4,4],2,staff,{bar:0,beat:3});assert.ok(p);assert.equal(JSON.stringify(events),before);
  assert.equal(W.writeOverflow(s,events,'F4',[4,4],2,staff,{bar:0,beat:3},p),'');
  const first=events.find(e=>e.bar===0&&e.staff===staff),last=events.find(e=>e.id===first.tieToId);assert.equal(first.beats,1);assert.equal(last.beats,1);assert.equal(last.note,'F#4');assert.equal(last.offset,0);assert.equal(last.bar,1);assert.equal(events.find(e=>e.id==='old').offset,1);assert.equal(events.find(e=>e.id==='old').beats,1);assert.ok(events.find(e=>e.id==='other'));
  const history=W.history();history.commit(before,JSON.stringify(events));assert.equal(history.undo(JSON.stringify(events)),before);
 }
});
test('overflow can replace a written chord, append bars, and reject conflicting tuplets without mutation',()=>{
 const state=W.create(),events=[{id:'chord',staff:1,bar:0,offset:3,beats:1,note:'C4',notes:['C4','E4','G4']}];W.select(state,'duration','whole');let p=W.overflowPlan(state,events,[4],1,1,null,0);assert.equal(p.bars,2);assert.equal(W.writeOverflow(state,events,'C4',[4],1,1,null,p,0),'');assert.equal(events[0].beats,1);assert.equal(events[1].beats,3);assert.deepEqual(events[1].notes,['C4','E4','G4']);assert.equal(events[0].tieToId,events[1].id);
 const blocked=[{id:'group',staff:1,bar:1,offset:0,beats:1/3,note:'D4',tupletActual:3}];p=W.overflowPlan(state,blocked,[4,4],2,1,{bar:0,beat:3});const before=JSON.stringify(blocked);assert.match(W.writeOverflow(state,blocked,'C4',[4,4],2,1,{bar:0,beat:3},p),/grupo irregular/);assert.equal(JSON.stringify(blocked),before);
});
