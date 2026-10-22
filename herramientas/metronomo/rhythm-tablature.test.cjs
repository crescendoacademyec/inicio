const {test}=require('node:test'),assert=require('node:assert/strict');
const Tab=require('./rhythm-tablature.js'),Structure=require('./rhythm-structure.js'),Audio=require('./rhythm-audio.js');
test('TAB editing changes a single chord head and keeps timing and other notes',()=>{
 const events=[{staff:1,bar:0,offset:1,beats:2,note:'C4',notes:['C4','E4']}];
 assert.equal(Tab.setPosition(events,[],0,0,'guitar',{string:3,fret:7}),'');
 assert.deepEqual(Tab.noteMidis(Structure.resolve(events)[0]),[62,64]);assert.equal(events[0].beats,2);assert.equal(events[0].offset,1);
 assert.equal(events[0].stringFingerings.guitar.find(p=>p.midi===62).string,3);
});
test('bass, ukulele, violin TAB use sounding pitches and handle octave marks',()=>{
 for(const [id,string,fret,midi] of [['bass',4,0,28],['ukulele',4,0,67],['violin',3,5,67]]){
  const events=[{note:'C4',beats:1,bar:0,staff:id==='bass'?2:1,ottava:true}];
  assert.equal(Tab.setPosition(events,[],0,0,id,{string,fret,position:'III'}),'');
  assert.equal(Audio.compile(events,{bars:1,clef:id==='bass'?'bass':'treble'}).notes[0].midi,midi);
  if(id==='violin')assert.equal(events[0].stringFingerings.violin[0].position,'III');
 }
});
test('TAB editing respects key signatures by explicitly pinning accidentals',()=>{
 const events=[{note:'F4',beats:1,bar:0}],marks=[{type:'key',bar:0,fifths:1}];
 assert.equal(Tab.setPosition(events,marks,0,0,'guitar',{string:1,fret:1}),'');
 assert.equal(Structure.resolve(events,marks)[0].note,'F4');
 assert.equal(Audio.compile(events,{marks,bars:1}).notes[0].midi,65);
});
test('conflicting strings, invalid positions and duplicate pitches preserve the original score',()=>{
 const events=[{note:'C4',notes:['C4','E4'],beats:1,bar:0,stringFingerings:{guitar:[{string:2,fret:1,midi:60},{string:1,fret:0,midi:64}]}}];const original=JSON.stringify(events);
 for(const p of [{string:1,fret:2},{string:1,fret:0},{string:8,fret:0},{string:1,fret:25}]){assert.ok(Tab.setPosition(events,[],0,0,'guitar',p));assert.equal(JSON.stringify(events),original);}
});
