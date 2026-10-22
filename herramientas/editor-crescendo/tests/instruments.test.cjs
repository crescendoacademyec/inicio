const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const I=require('../src/score-editor-instruments.js');
test('all instrument choices use the same SoundFont banks as the metronome and reuse cached outputs',async()=>{
 const calls=[],context={state:'running'},load=I.createLoader({getContext:()=>context,loadInstrument:async(ctx,bank)=>{calls.push(bank);return {bank};},createOutput:(player,ctx,sound)=>({player,name:sound.name,short:sound.short})});
 for(const id of Object.keys(I.instruments)){const first=await load(id);assert.equal(first.name,I.instruments[id].name);assert.equal(await load(id),first);}
 assert.deepEqual(calls,['acoustic_grand_piano','acoustic_guitar_nylon','acoustic_guitar_nylon','electric_bass_finger','violin','acoustic_guitar_nylon']);assert.equal((await load('ukulele')).short,true);assert.equal(I.normalize('unknown'),'piano');
});
test('preload does not wait for an audio gesture, playback resumes the shared context and simultaneous loads share a promise',async()=>{
 let resumes=0,loads=0;const context={state:'suspended',resume:async()=>{resumes++;context.state='running';}},load=I.createLoader({getContext:()=>context,loadInstrument:async()=>{loads++;return {};},createOutput:()=>({})});
 await load('piano',{preload:true});assert.equal(resumes,0);await load('piano');assert.equal(resumes,1);assert.equal(loads,1);
 const [a,b]=await Promise.all([load('violin'),load('violin')]);assert.equal(a,b);assert.equal(loads,2);
});
test('failed instrument downloads can be retried and missing audio support is handled',async()=>{
 let calls=0;const load=I.createLoader({getContext:()=>({state:'running'}),loadInstrument:async()=>{if(++calls===1)throw Error('offline');return {};},createOutput:()=>({name:'Bajo'})});
 await assert.rejects(load('bass'),/offline/);assert.equal((await load('bass')).name,'Bajo');assert.equal(calls,2);
 assert.equal(await I.createLoader({getContext:()=>null})('piano'),null);
});
test('SoundFont MIDI adapter names the selected instrument and uses the shorter ukulele envelope',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8'),start=source.indexOf('  function createAcousticPianoOutput('),end=source.indexOf('  let editorInstrumentAudioContext',start),played=[];
 const c={performance:{now:()=>100},instrument:{play:(midi,time,options)=>{played.push({midi,time,options});return {stop(){}};}},context:{currentTime:1}};vm.createContext(c);vm.runInContext(source.slice(start,end),c);
 for(const [name,short,duration] of [['Violín',false,6],['Ukelele',true,2]]){const output=c.createAcousticPianoOutput(c.instrument,c.context,{name,short});assert.equal(output.name,name);output.send([0x90,64,90],100);assert.equal(played.at(-1).options.duration,duration);assert.equal(played.at(-1).midi,64);output.clear();}
});

test('stopping silences samples whose note-offs were already scheduled in the future',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8'),start=source.indexOf('  function createAcousticPianoOutput('),end=source.indexOf('  let editorInstrumentAudioContext',start),stops=[],muted=[];
 const context={currentTime:1};
 const c={performance:{now:()=>100},instrument:{play:()=>({gain:{cancelScheduledValues(){},setValueAtTime:(value,time)=>muted.push([value,time])},source:{stop:time=>stops.push(time)},stop:time=>stops.push(time)})},context};vm.createContext(c);vm.runInContext(source.slice(start,end),c);
 const output=c.createAcousticPianoOutput(c.instrument,context,{name:'Violín'});
 output.send([0x90,64,100],200);output.send([0x80,64,0],5000);
 context.currentTime=2;output.clear();
 assert.ok(stops.includes(2));assert.deepEqual(muted,[[0,2]]);
});
