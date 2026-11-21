const {test}=require('node:test'),assert=require('node:assert/strict');
const A=require('../src/score-editor-arrangement.js'),I=require('../src/score-editor-instruments.js'),P=require('../src/score-editor-page-layout.js'),S=require('../src/score-editor-system-spans.js');
const note=(diatonicStep,alter=0)=>({diatonicStep,alter,staffStep:diatonicStep-6});
function phrase(){return [{entry:{id:'a',type:'note',tickStart:0,ticks:4,tieToNext:true,tieStaffStep:0},notes:[note(0),note(2),note(4),note(6)],voice:1,measureIndex:0},{entry:{id:'b',type:'note',tickStart:4,ticks:2,tuplet:{actual:3,normal:2}},notes:[note(1,-1),note(3),note(5,-1)],voice:1,measureIndex:0},{entry:{id:'c',type:'rest',tickStart:6,ticks:2},notes:[],voice:1,measureIndex:0},{entry:{id:'v2',type:'note',tickStart:0,ticks:8},notes:[note(-7)],voice:2,measureIndex:0}];}
test('high/low voice extraction retains rhythm, rests, accidentals and the source; missing voices stay silent',()=>{
 const items=phrase(),original=JSON.stringify(items),high=A.extract(items,{mode:'high',rank:1}),low=A.extract(items,{mode:'low',rank:1}),fourth=A.extract(items,{rank:4});
 assert.deepEqual(high.map(item=>item.notes.map(n=>A.midi(n.diatonicStep,n.alter))),[[71],[68],[]]);
 assert.deepEqual(low.map(item=>item.notes.map(n=>A.midi(n.diatonicStep,n.alter))),[[60],[61],[]]);
 assert.equal(high[0].tieToNext,true);assert.equal(low[0].tieToNext,false);
 assert.deepEqual(fourth.map(item=>item.notes.length),[1,0,0]);assert.equal(high[1].entry.tuplet.actual,3);
 assert.deepEqual(high.map(item=>[item.entry.tickStart,item.entry.ticks]),[[0,4],[4,2],[6,2]]);assert.equal(JSON.stringify(items),original);
});
test('explicit voice and selected noteheads support independent rhythms rather than ranking other layers',()=>{
 const items=phrase();assert.deepEqual(A.extract(items,{mode:'voice',voice:2})[0].notes,[note(-7)]);
 assert.deepEqual(A.extract(items,{mode:'selected',selected:[{entryId:'a',staffStep:-4},{entryId:'b',staffStep:-1}]}).map(item=>item.notes),[[note(2)],[note(5,-1)],[]]);
});
test('orchestrating to Bb, Eb, F and octave instruments preserves exact concert pitch and enharmonic spelling',()=>{
 const expectations={trumpet:[1,0],altoSax:[5,0],tenorSax:[8,0],baritoneSax:[12,0],horn:[4,0],contrabass:[7,0],viola:[0,0],cello:[0,0]};
 for(const [id,[degree,alter]]of Object.entries(expectations)){
  const target=A.transpose(note(0),I.instruments.piano,I.instruments[id]);assert.equal(target.diatonicStep,degree,id);assert.equal(target.alter,alter,id);
  assert.equal(A.midi(target.diatonicStep,target.alter)+I.instruments[id].transpose,60,id);
  assert.deepEqual(A.transpose(target,I.instruments[id],I.instruments.piano),note(0));
 }
 for(const id of Object.keys(I.instruments))for(const pitch of [note(-15,-1),note(-1),note(6,1),note(14,-1)]){
  const target=A.transpose(pitch,I.instruments.piano,I.instruments[id]);assert.equal(A.midi(target.diatonicStep,target.alter)+I.instruments[id].transpose,A.midi(pitch.diatonicStep,pitch.alter),id);
 }
});
test('destination conflict detection ignores rests and other voices, and catches partial overlaps only',()=>{
 const items=phrase().slice(0,1),targets=[{entry:{id:'before',type:'note',tickStart:0,ticks:2},voice:1,measureIndex:1},{entry:{id:'overlap',type:'note',tickStart:3,ticks:3},voice:1,measureIndex:0},{entry:{id:'after',type:'note',tickStart:4,ticks:4},voice:1,measureIndex:0},{entry:{id:'rest',type:'rest',tickStart:0,ticks:8},voice:1,measureIndex:0}];
 assert.deepEqual(A.conflicts(items,targets).map(t=>t.entry.id),['overlap']);
});
test('moving or removing instruments retains expressions on their original staves',()=>{
 const a={id:'a'},b={id:'b'},c={id:'c'},state={marks:[{systemIndex:0,id:'ma'},{systemIndex:2,id:'mc'},{id:'global'}],textItems:[{systemIndex:1,id:'tb'}]};
 A.remapReferences(state,[a,b,c],[c,a,b]);assert.deepEqual(state.marks,[{systemIndex:1,id:'ma'},{systemIndex:0,id:'mc'},{id:'global'}]);assert.equal(state.textItems[0].systemIndex,2);
 A.remapReferences(state,[c,a,b],[a,b]);assert.deepEqual(state.marks,[{systemIndex:0,id:'ma'},{id:'global'}]);
});
test('a large ensemble routes the same pitch independently to every staff and updates mute/solo/volume live',async()=>{
 const sent=[],volumes=[],cleared=[],systems=Array.from({length:24},(_,index)=>({id:'s'+index,instrumentId:index%2?'trumpet':'violin',volume:80}));
 const out=await I.ensemble(systems,async(id,{track})=>({send:(msg,time)=>sent.push([track,msg,time]),setVolume:value=>volumes.push([track,value]),clear:()=>cleared.push(track)}));
 systems.forEach((system,index)=>out.send([0x90,60,88],100,index));assert.equal(sent.length,24);assert.equal(new Set(sent.map(s=>s[0])).size,24);
 systems[3].solo=true;systems[5].solo=true;systems[5].muted=true;systems[3].volume=35;out.setMix(systems);
 assert.equal(volumes.at(-21)[1],.35);assert.equal(volumes.at(-19)[1],0);assert.equal(volumes.at(-24)[1],0);
 systems[3].solo=false;systems[5].solo=false;out.setMix(systems);assert.equal(volumes.at(-24)[1],.8);out.clear();assert.equal(cleared.length,24);
});
test('separate instances of the same instrument have independent sample outputs',async()=>{
 let created=0;const load=I.createLoader({getContext:()=>({state:'running'}),loadInstrument:async()=>({}),createOutput:()=>({instance:++created})});
 const a=await load('violin',{track:'I'}),b=await load('violin',{track:'II'});assert.notEqual(a,b);assert.equal(await load('violin',{track:'I'}),a);
});
test('page settings retain equal physical margins and landscape dimensions and normalize malformed values',()=>{
 const value=P.normalize({paper:'letter',orientation:'landscape',margin:15,bars:6,staffGap:160,pageBreaks:[5,2,2,-1,1.5]});assert.deepEqual(value.pageBreaks,[2,5]);assert.equal(value.bars,6);
 const page=P.printOptions(value);assert.equal(page.pageWidth,792);assert.equal(page.pageHeight,612);assert.ok(Math.abs(page.margin-15*72/25.4)<1e-7);
 assert.equal(P.normalize({bars:-5,margin:100}).bars,1);assert.equal(P.normalize({paper:'bad'}).paper,'a4');
});
test('ties and phrase slurs continue after headers across two or more systems without crossing another row',()=>{
 const starts=[100,300,500,700,900,1100],rows=[{first:0,last:1,end:500},{first:2,last:3,end:900},{first:4,last:5,end:1300}];
 const segments=S.segments({x1:340,x2:1160,y1:90,y2:100,startMeasure:1,endMeasure:5},rows,starts);
 assert.equal(segments.length,3);assert.deepEqual(segments.map(s=>[s.x1,s.x2]),[[340,495],[504,895],[904,1160]]);
 assert.deepEqual(segments.map(s=>[s.openStart,s.openEnd]),[[false,true],[true,true],[true,false]]);assert.equal(segments[0].y1,90);assert.equal(segments[2].y2,100);
 assert.deepEqual(S.segments({x1:100,x2:90,startMeasure:0,endMeasure:0},rows,starts),[]);
});
