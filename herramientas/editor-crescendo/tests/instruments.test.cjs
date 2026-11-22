const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const I=require('../src/score-editor-instruments.js');
test('all instrument choices use the same SoundFont banks as the metronome and reuse cached outputs',async()=>{
 const calls=[],context={state:'running'},load=I.createLoader({getContext:()=>context,loadInstrument:async(ctx,bank)=>{calls.push(bank);return {bank};},createOutput:(player,ctx,sound)=>({player,name:sound.name,short:sound.short})});
 for(const id of Object.keys(I.instruments)){const first=await load(id);assert.equal(first.name,I.instruments[id].name);assert.equal(await load(id),first);}
 assert.deepEqual(calls.slice(0,6),['acoustic_grand_piano','acoustic_guitar_nylon','acoustic_guitar_nylon','electric_bass_finger','violin','acoustic_guitar_nylon']);assert.equal((await load('ukulele')).short,true);assert.equal(I.normalize('unknown'),'piano');
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

test('each channel routes its gain through an independent stereo panner and disconnects both nodes',()=>{
 const connections=[],disconnected=[],context={destination:{name:'speakers'},createGain:()=>({name:'gain',connect:node=>connections.push(['gain',node]),disconnect:()=>disconnected.push('gain')}),createStereoPanner:()=>({name:'pan',connect:node=>connections.push(['pan',node]),disconnect:()=>disconnected.push('pan')})};
 const a=I.createChannel(context),b=I.createChannel(context);
 assert.notEqual(a.pan,b.pan);assert.notEqual(a.gain,b.gain);assert.equal(connections[0][1],a.pan);assert.equal(connections[1][1],context.destination);a.disconnect();assert.deepEqual(disconnected,['gain','pan']);
});
test('ensemble pan stays independent per staff and survives mute, solo and live updates',async()=>{
 const values=new Map(),systems=[{id:'left',instrumentId:'violin',pan:-1},{id:'right',instrumentId:'violin',pan:.75},{id:'old',instrumentId:'piano'}];
 const output=await I.ensemble(systems,async(id,{track})=>({setPan:value=>values.set(track,value),setVolume(){}}));
 assert.deepEqual([...values.values()],[-1,.75,0]);systems[0].muted=true;systems[1].solo=true;systems[0].pan=-.3;output.setMix(systems);assert.deepEqual([...values.values()],[-.3,.75,0]);
 systems[0].pan=-5;systems[1].pan=5;systems[2].pan='invalid';output.setMix(systems);assert.deepEqual([...values.values()],[-1,1,0]);
});
test('SoundFont adapter ramps pan on the audio clock without interrupting scheduled notes',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8'),start=source.indexOf('  function createAcousticPianoOutput('),end=source.indexOf('  let editorInstrumentAudioContext',start),calls=[];
 const c={InstrumentSounds:I,performance:{now:()=>100},context:{currentTime:3},instrument:{__channelPan:{pan:{cancelScheduledValues:t=>calls.push(['cancel',t]),setTargetAtTime:(v,t,r)=>calls.push(['pan',v,t,r])}}}};vm.createContext(c);vm.runInContext(source.slice(start,end),c);
 const output=c.createAcousticPianoOutput(c.instrument,c.context,{name:'Violín'});output.setPan(-.6);output.setPan(4);assert.deepEqual(calls,[['cancel',3],['pan',-.6,3,.012],['cancel',3],['pan',1,3,.012]]);
});
