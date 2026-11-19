const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../js/melody-core.js'),transport=require('../js/melody-transport.js');
const el=(tag,attrs={},children=[],text='')=>({tagName:tag,localName:tag,children,textContent:text,getAttribute:k=>attrs[k]??null});
const note=(step='C',duration=1,ties=[])=>el('note',{},[el('pitch',{},[el('step',{},[],step),el('octave',{},[],'4')]),el('duration',{},[],String(duration)),...ties.map(type=>el('tie',{type}))]);
const measure=children=>el('measure',{},[el('attributes',{},[el('divisions',{},[],'1')]),...children]);
const bar=children=>el('barline',{},children),repeat=direction=>el('repeat',{direction}),ending=(number,type)=>el('ending',{number,type});
function parse(...measures){class Parser{parseFromString(){return el('document',{},[el('score-partwise',{},[el('part',{},measures)])]);}}return transport.parse('',{DOMParser:Parser});}
test('G4 moved seven semitones becomes D5, including enharmonic octave boundaries',()=>{assert.deepEqual(Object.fromEntries(Object.entries(core.spelling(74,1)).filter(([k])=>k!=='score')),{step:'D',alter:0,octave:5});for(let midi=0;midi<128;midi++)for(let key=-7;key<=7;key++){const p=core.spelling(midi,key),pc={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[p.step];assert.equal(12*(p.octave+1)+pc+p.alter,midi);}});
test('ties merge attacks, rests remain silent, final rest remains in MIDI',()=>{const r=parse(measure([note('G',2,['start'])]),measure([note('G',2,['stop']),el('note',{},[el('rest'),el('duration',{},[],'2')])]));assert.equal(r.events.length,1);assert.equal(r.events[0].endBeat,4);assert.equal(r.duration,3);const midi=core.midi(r);assert.equal(Buffer.from(midi).subarray(0,4).toString(),'MThd');assert.equal(Buffer.from(midi).readUInt32BE(18),midi.length-22);assert.deepEqual(Array.from(midi.slice(-5)),[0x87,0x40,0xff,0x2f,0]);});
test('first and second endings follow the written route',()=>{const r=parse(measure([bar([repeat('forward')]),note('C')]),measure([bar([ending('1','start')]),note('D'),bar([ending('1','stop'),repeat('backward')])]),measure([bar([ending('2','start')]),note('E'),bar([ending('2','discontinue')])]));assert.deepEqual(r.events.map(n=>n.midi),[60,62,60,64]);assert.deepEqual(r.visits.map(v=>v.index),[0,1,0,2]);});
test('AAC attachment normalization rejects entities and keeps melody in project normalization',()=>{const source=fs.readFileSync(require.resolve('../js/app.js'),'utf8'),start=source.indexOf('function normalizeMelodyAttachment('),end=source.indexOf('window.CrescendoAACMelodyBridge=',start),context={};vm.createContext(context);vm.runInContext(source.slice(start,end),context);assert.equal(context.normalizeMelodyAttachment({xml:'<!ENTITY x SYSTEM "file">'}),null);const clean=context.normalizeMelodyAttachment({xml:'<score-partwise/>',originalXml:'<score-partwise/>',tempo:120,linked:true,originalBreaks:[0,4,4,-1,'5',8],studyBreaks:[0,3,6],reviewLog:['review'],secret:'discard'});assert.equal(clean.linked,true);assert.equal(JSON.stringify(clean.originalBreaks),'[0,4,8]');assert.equal(JSON.stringify(clean.studyBreaks),'[0,3,6]');assert.equal(clean.secret,undefined);assert.match(source,/melody:\s*normalizeMelodyAttachment\(raw\?\.melody\)/);assert.match(source,/exportVersion:\s*45/);});

test('transposition preserves diatonic spelling for chromatic notes and harmony',()=>{assert.deepEqual(core.transposePitch(66,'F',4,7,-3),{step:'C',octave:5,alter:1});assert.deepEqual(core.transposePitch(67,'G',4,7,0),{step:'D',octave:5,alter:0});assert.deepEqual(core.transposePitch(60,'C',4,-1,0),{step:'B',octave:3,alter:0});});
test('swing delays eighth offbeats and retains durations, endings and triplets',()=>{const t={secondsAt:b=>b/2,visits:[{endBeat:4}],events:[{beat:0,endBeat:.5},{beat:.5,endBeat:1}],clicks:[{beat:0},{beat:1}],duration:2};const s=core.swingTimeline(t,true);assert.ok(Math.abs(s.events[1].start-1/3)<1e-8);assert.ok(Math.abs(s.events[0].dur-1/3)<1e-8);assert.equal(s.duration,2);assert.ok(Math.abs(s.writtenBeatAtTime(1/3)-.5)<1e-7);const trip=core.swingTimeline({...t,events:[{beat:0,endBeat:2/3},{beat:2/3,endBeat:4/3},{beat:4/3,endBeat:2}]},true);assert.ok(Math.abs(trip.events[1].dur-1/3)<1e-8);});
test('score and instruments receive the identical audible frame at each swung note',()=>{
 const t=core.swingTimeline(parse(measure([note('G',.5),note('C',.5),note('D',1)])),true);
 const source=fs.readFileSync(require.resolve('../js/melody.js'),'utf8'),body=source.slice(source.indexOf(' function update(){'),source.indexOf(' async function loadPiano'));
 let time=0,scoreFrame,instrumentFrame;
 const c={Core:core,window:{AACMelodyInstruments:{update(t,v,p,f){instrumentFrame=f}},AACMelodyScoreView:{update(f){scoreFrame=f}}},playing:false,activeLoop:null,timeline:t,now:()=>time,$:()=>({dataset:{}}),fmt:String};
 vm.createContext(c);vm.runInContext(body,c);
 for(const [seconds,midi,beat] of [[0,67,0],[.32,67,0],[1/3,60,.5],[.49,60,.5],[.5,62,1]]){
  time=seconds;c.update();assert.equal(scoreFrame,instrumentFrame);assert.equal(scoreFrame.measure,0);assert.equal(scoreFrame.active[0].e.midi,midi);assert.ok(scoreFrame.localBeat>=beat-1e-7);
 }
});
test('manual line breaks move boundaries while preserving chronological measure order',()=>{
 assert.deepEqual(core.reflowBreaks([0,4,8],4,'up',12),[0,5,8]);
 assert.deepEqual(core.reflowBreaks([0,5,8],4,'down',12),[0,4,8]);
 assert.deepEqual(core.reflowBreaks([0,4,8],6,'up',12),[0,7,8]);
 assert.deepEqual(core.reflowBreaks([0,4,8],6,'down',12),[0,4,6]);
 assert.deepEqual(core.reflowBreaks([0,4,8],11,'up',12),[0,4]);
 assert.throws(()=>core.reflowBreaks([0,4,8],0,'up',12),/primer pentagrama/);
 assert.throws(()=>core.reflowBreaks([0,4,8],4,'down',12),/inicia/);
 assert.throws(()=>core.reflowBreaks([0],12,'up',12),/válido/);
 assert.throws(()=>core.reflowBreaks([0],1,'sideways',12),/Dirección/);
});
test('guitar transposition is applied once before choosing keys or strings',()=>{const M=require('../../../shared/instrument-pitch-model.js'),attributes=el('attributes',{},[el('transpose',{},[el('chromatic',{},[],'0'),el('octave-change',{},[],'-1')])]);const t=parse(measure([attributes,note('G')]));assert.equal(t.events[0].writtenMidi,67);assert.equal(t.events[0].midi,55);assert.equal(M.noteInfo(t.events[0].midi).octave,3);const sounding=note('G');sounding.children[0].children[1].textContent='3';const clef=el('attributes',{},[el('clef',{},[el('sign',{},[],'G'),el('line',{},[],'2'),el('clef-octave-change',{},[],'-1')])]);assert.equal(parse(measure([clef,sounding])).events[0].midi,55);assert.ok(M.guitarPositions(t.events[0].midi).some(p=>p.string===3&&p.fret===0));const concert=parse(measure([note('G')]));assert.equal(concert.events[0].midi,67);assert.ok(M.guitarPositions(concert.events[0].midi).some(p=>p.string===1&&p.fret===3));});

test('swing keeps source-bar visits aligned when a pickup ends on an eighth',()=>{const t=core.swingTimeline(parse(measure([note('G',.5)]),measure([note('C',1)])),true);const event=t.events[1];assert.ok(Math.abs(t.visits[1].start-event.start)<1e-8);const frame=core.frameAt(t,event.start);assert.equal(frame.measure,1);assert.ok(Math.abs(frame.localBeat)<1e-7);assert.equal(frame.active[0].e.midi,60);assert.ok(Math.abs(t.duration-t.visits.at(-1).end)<1e-8);});
const control=(key,val='yes')=>el('direction',{},[el('sound',{[key]:val})]);
test('AAC and MIDI follow D.C. al Fine, D.S. al Coda and repeated endings',()=>{
 const dc=parse(measure([note('C')]),measure([note('D'),control('fine')]),measure([note('E'),control('dacapo')]));
 assert.deepEqual(dc.visits.map(v=>v.index),[0,1,2,0,1]);assert.deepEqual(dc.events.map(n=>n.midi),[60,62,64,60,62]);
 const ds=parse(measure([note('C')]),measure([note('D'),control('segno','S')]),measure([note('E'),control('tocoda','C')]),measure([note('F'),control('dalsegno','S')]),measure([note('G'),control('coda','C')]));
 assert.deepEqual(ds.visits.map(v=>v.index),[0,1,2,3,1,2,4]);assert.equal(ds.duration,3.5);assert.equal(core.midi(ds).length>22,true);
});
test('AAC preserves the explicit MEI itinerary in MusicXML metadata',()=>{
 const make=route=>{class Parser{parseFromString(){return el('document',{},[el('score-partwise',{},[el('identification',{},[el('miscellaneous',{},[el('miscellaneous-field',{name:'crescendo:measure-route'},[],JSON.stringify(route))])]),el('part',{},[measure([note('C')]),measure([note('D')]),measure([note('E')])])])]);}}return transport.parse('',{DOMParser:Parser});};
 const r=make([0,1,0,2]);assert.deepEqual(r.visits.map(v=>v.index),[0,1,0,2]);assert.deepEqual(r.events.map(n=>n.midi),[60,62,60,64]);assert.throws(()=>make([0,7]),/recorrido/);
});
test('AAC does not join equal pitches through a noncontiguous D.S. jump',()=>{
 const r=parse(measure([note('C')]),measure([control('segno','S'),note('G',1,['stop'])]),measure([note('G',1,['start']),control('dalsegno','S')]));
 assert.equal(r.events.filter(n=>n.midi===67).length,4);
});
