const {test}=require('node:test'),assert=require('node:assert/strict'),G=require('../js/melody-guitar.js'),P=require('../../../shared/instrument-pitch-model.js');
const standard=P.GUITAR_TUNINGS[0].pitches;
function valid(frame,tuning){assert.equal(new Set(frame.positions.map(p=>p.string)).size,frame.positions.length);assert.equal(new Set(frame.positions.map(p=>p.midi)).size,frame.positions.length);for(const p of frame.positions){assert.equal(tuning[p.string-1]+p.fret,p.midi);assert.ok(p.fret>=0&&p.fret<=22);assert.ok(p.fret===0||p.fret>=frame.range.start&&p.fret<=frame.range.end);}}
test('every playable melody pitch gets exactly one fingering in a four-fret position in each tuning',()=>{
 for(const t of P.GUITAR_TUNINGS)for(let midi=0;midi<128;midi++){const f=G.fingering([midi],t.pitches),available=P.guitarPositions(midi,t.pitches);valid(f,t.pitches);assert.equal(f.range.width,4);assert.equal(f.positions.length,available.length?1:0);assert.deepEqual(f.missing,available.length?[]:[midi]);}
});
test('an out-of-position melody note moves the window automatically without shifting its octave',()=>{
 const t={events:[{part:'P1',midi:67,start:0,dur:1},{part:'P1',midi:74,start:1,dur:1}]},route=G.build(t,standard),first=G.frameAt(route,0),second=G.frameAt(route,1);
 assert.equal(first.range.width,4);assert.equal(second.range.width,4);assert.deepEqual(first.positions.map(p=>p.midi),[67]);assert.deepEqual(second.positions.map(p=>p.midi),[74]);assert.notDeepEqual(first.range,second.range);assert.deepEqual(second.missing,[]);assert.deepEqual(G.build(t,standard),route);assert.equal(G.frameAt(route,2).positions.length,0);
});
test('simultaneous notes use distinct strings and expand to five frets only when necessary',()=>{
 const four=G.fingering([48,54,74],standard);assert.equal(four.range.width,4);assert.deepEqual(four.missing,[]);valid(four,standard);
 const extended=G.fingering([60,59,52,53],standard);assert.equal(extended.range.width,5);assert.deepEqual(extended.missing,[]);valid(extended,standard);
 const impossible=G.fingering([40,42,74],standard);valid(impossible,standard);assert.ok(impossible.range.width<=5);assert.ok(impossible.missing.length>0);
});
test('unisons show one marker and sustained notes retain a usable fingering when the melody changes',()=>{
 const first=G.fingering([67,67],standard),second=G.fingering([67,69],standard,22,first);assert.equal(first.positions.length,1);assert.deepEqual(second.positions.find(p=>p.midi===67),first.positions[0]);valid(second,standard);
});
test('frame lookup follows exact note starts, note ends, rests and concert pitches',()=>{
 const t={events:[{part:'P1',midi:74,start:.125,dur:.25},{part:'AAC-GUIDE-TONES',midi:48,start:0,dur:1}]},route=G.build(t,standard);
 assert.deepEqual(G.frameAt(route,.124).positions.map(p=>p.midi),[48]);assert.deepEqual(G.frameAt(route,.125).positions.map(p=>p.midi).sort((a,b)=>a-b),[48,74]);assert.deepEqual(G.frameAt(route,.375).positions.map(p=>p.midi),[48]);assert.deepEqual(G.frameAt(route,1).positions,[]);
});
test('the chosen tuning is restored per source edition and retained during redraws',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync(require.resolve('../js/melody-instruments.js'),'utf8'),storage=new Map([['aac:guitar-tuning:song-a','drop_d'],['aac:guitar-tuning:song-b','dadgad']]);
 const context={host:{},Pitch:P,editionKey:null,tuning:{value:'standard'},caption:{},localStorage:{getItem:key=>storage.get(key)},buildPiano(){},buildGuitar(){},calculateRoute(){},clear(){},syncDock(){},update(){}};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf(' function setTimeline('),source.indexOf(' function clear(')),context);
 context.setTimeline({},0,'song-a');assert.equal(context.tuning.value,'drop_d');context.setTimeline({},0,'song-b');assert.equal(context.tuning.value,'dadgad');context.setTimeline({},0,'new-song');assert.equal(context.tuning.value,'standard');context.tuning.value='open_g';context.setTimeline({},-2,'new-song');assert.equal(context.tuning.value,'open_g');context.setTimeline({},0,'song-a');assert.equal(context.tuning.value,'drop_d');
});
