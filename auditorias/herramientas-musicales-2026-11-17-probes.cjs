/* Read-only probes of audit baseline 6a81b18. Run from any directory.
 * Current behavior is verified by musical-corrections.test.cjs. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>require('node:child_process').execFileSync('git',['show','6a81b18:'+p],{cwd:root,encoding:'utf8'});
function between(source,name,next){const a=source.indexOf('function '+name+'('),b=source.indexOf('function '+next+'(',a);if(a<0||b<a)throw Error(name);return source.slice(a,b).replace(/async\s*$/,'');}
function context(extra){return vm.createContext(extra);}
function run(code,c){return vm.runInContext(code,c);}
const results={};

// The main click and the score use different bar lengths in eighth-note meters.
{
 const source=read('herramientas/metronomo/index.html');
 const A=require('../herramientas/metronomo/rhythm-audio.js');
 results.metronomeMeter=['4/4','6/8','7/8'].map(meter=>{
  const c=context({UI:{amalgamInp:{value:''},beatsSel:{value:meter.split('/')[0],style:{}},subSel:{value:'1'},volExtra:{value:'.5'},claveSel:{value:'off'},polyTgl:{checked:false},polyY:{value:'3'},pmTgl:{checked:false},accentTgl:{checked:true},swingSld:{value:'50'},dropTgl:{checked:false},rhythmPlacement:{value:'all'},volAccent:{value:'.5'},volNormal:{value:'.5'},volSub:{value:'.5'},trainTgl:{checked:false},pyrTgl:{checked:false}},document:{getElementById:()=>({value:'.5'})},window:{},renderVisualizer(){},audioContext:{currentTime:0},scheduleAheadTime:15,nextMainTime:0,mainBeatPos:0,mainMeasureCount:0,notesInQueue:[],tempo:60,playSynthSound(){},schedulerWorker:true,totalBeats:4,accentPulses:[0]});
  run(between(source,'parsePattern','gcd')+between(source,'scheduler','draw')+'\nparsePattern();scheduler();',c);
  const accents=c.notesInQueue.filter(n=>n.noteIdx===0).map(n=>n.time);
  return {meter,tempo:60,figure:'quarter',mainBarSeconds:accents[1]-accents[0],scoreBarSeconds:A.compile([],{meter,bars:1,tempo:60}).duration};
 });
}

// Actual vibrato analysis, with synthetic pitch contours and no microphone.
{
 const source=read('herramientas/cuerdas-frotadas/js/vibrato.js'),a=source.indexOf('  const median='),b=source.indexOf('  function tick(',a);
 results.vibrato=[30,60,120].map(fps=>{
  const field=()=>({textContent:'',className:''}),c=context({samples:Array.from({length:fps*5},(_,i)=>({t:i/fps,c:30*Math.sin(2*Math.PI*6*i/fps)})),modeEl:{value:'continuous'},widthEl:{value:'30'},rateEl:{value:'6'},status:field(),centerEl:field(),measuredWidthEl:field(),measuredRateEl:field(),regularityEl:field(),onsetEl:field(),drawChart(){}});
  run(source.slice(a,b)+'\nanalyze();',c);
  return {fps,expectedHalfWidth:30,expectedRate:6,measuredWidth:c.measuredWidthEl.textContent,measuredRate:c.measuredRateEl.textContent,feedback:c.status.textContent};
 });
}

// Current inline code is the active source in these four pages.
results.scaleRoles={};
for(const app of ['diapason-virtual','bass-virtual','folk-virtual','requinteando']){
 const src=read('herramientas/'+app+'/index.html'),a=src.indexOf('const toneRole = '),b=src.indexOf('\n    };',a)+7,c=context({});
 run(src.slice(a,b)+'\nthis.role=toneRole;',c);
 results.scaleRoles[app]={majorPentatonic:[0,2,4,7,9].map(pc=>({pc,role:c.role(pc,0,[0,2,4,7,9],true)})),dominantPentatonic:[0,2,4,7,10].map(pc=>({pc,role:c.role(pc,0,[0,2,4,7,10],false)}))};
}

// Two overlapping attacks of one MIDI pitch overwrite the only stop handle.
{
 const src=read('herramientas/piano-virtual/js/audio.js'),oscillators=[];
 const node=()=>({gain:{value:1,cancelScheduledValues(){},setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this},frequency:{setValueAtTime(){}},start(){},stop(){this.stopped=true}});
 const ctx={currentTime:0,createGain:node,createOscillator(){const n=node();oscillators.push(n);return n}};
 const c=context({window:{},document:{dispatchEvent(){}},CustomEvent:class{},keyElByMidi:{},isNoteInRange:()=>true,sustainedNotes:new Set(),visuallySustainedNotes:new Set(),ensureCtx:()=>ctx,volumeSlider:{value:'.4'},velocityGain:()=>1,lastMidiVelocity:0,findSampleForMidi:()=>null,sfPlayer:null,masterBus:node(),activeSources:{},setKeyActive(){},setStaffNote(){},updateChordDisplay(){},sustainOn:false});
 run(between(src,'stopSoundNow','releaseSustainedNotes')+between(src,'noteOn','setKeyActive'),c);
 run('noteOn({midi:60,freq:261.6256});noteOn({midi:60,freq:261.6256});noteOff({midi:60});',c);
 results.pianoRepeatedPitch={created:oscillators.length,stopped:oscillators.filter(n=>n.stopped).length,retainedHandles:Object.keys(c.activeSources).length};
}

// Native microphone request is deferred; no real permission or capture is used.
(async()=>{
 const src=read('herramientas/afinador/index.html'),requests=[],streams=[],contexts=[];
 const field=()=>({textContent:'',classList:{add(){},remove(){}}});
 const c=context({navigator:{mediaDevices:{getUserMedia:()=>new Promise(r=>requests.push(r))}},window:{AudioContext:class{constructor(){this.closed=false;contexts.push(this)}createMediaStreamSource(){return {connect(){}}}createAnalyser(){return {fftSize:4096}}close(){this.closed=true}}},PitchDetector:{forFloat32Array:()=>({})},micBtn:{...field(),addEventListener(t,f){c.click=f}},micStatus:field(),tick(){},resetDial(){},cancelAnimationFrame(){},console});
 const start=src.indexOf("micBtn.addEventListener('click', async () => {");
 run('let audioCtx,analyser,detector,dataArray,rafId,stream;let listening=false;'+src.slice(start,src.indexOf('function tick()',start)),c);
 const first=c.click(),second=c.click();
 for(let i=0;i<2;i++){const track={stopped:false,stop(){this.stopped=true}},stream={getTracks:()=>[track]};streams.push(track);requests[i](stream);}
 await Promise.all([first,second]);run('stopListening()',c);
 results.tunerConcurrentPermission={requests:requests.length,tracksStopped:streams.map(s=>s.stopped),contextsClosed:contexts.map(c=>c.closed)};

 // Keyboard shortcut marks loop state but does not update the playing source.
 {
  const source=read('herramientas/speed/index.html'),a=source.indexOf("document.addEventListener('keydown', async (e) => {"),b=source.indexOf('\n            });',a);
  const body=source.slice(a+"document.addEventListener('keydown', async (e) => {".length,b),tag=()=>({classList:{add(){}}});
  const c=context({audioBuffer:{},currentTime:2,loopA:null,loopB:null,loopActive:false,currentSource:{loop:false,loopStart:0,loopEnd:0},loopATag:tag(),loopBTag:tag(),loopHint:{textContent:''},drawWaveform(){},formatTime:String});
  run('this.shortcut=async function(e){'+body+'};',c);
  await c.shortcut({target:{tagName:'BODY'},key:'a'});c.currentTime=5;await c.shortcut({target:{tagName:'BODY'},key:'b'});
  results.speedKeyboardLoop={A:c.loopA,B:c.loopB,announcedActive:c.loopActive,source:c.currentSource,status:c.loopHint.textContent};
 }

 // A pending processed play is not invalidated by removing the input file.
 {
  const source=read('herramientas/speed/index.html');let resolve,starts=0;
  const pending=new Promise(r=>resolve=r),c=context({audioBuffer:{duration:10},audioCtx:{resume:async()=>{},currentTime:0},currentTime:0,duration:10,processedTempo:1,currentSource:null,isPlaying:false,ensureProcessed:()=>pending,disposeFallbackMedia(){},disposeSource(){},createSource:()=>({loop:false,start(){starts++}}),startTimeUpdates(){},playIcon:{},console,startFallbackPlayback(){throw Error('unexpected fallback')}});
  run('async '+between(source,'startPlayback','pausePlayback'),c);
  const playing=c.startPlayback();await Promise.resolve();c.audioBuffer=null;c.isPlaying=false;c.disposeSource();resolve({duration:10});await playing;
  results.speedRemovedDuringProcessing={audioPresent:!!c.audioBuffer,sourcesStarted:starts,playing:c.isPlaying};
 }

 // Actual AAC parser and visible-input normalizer.
 {
  const c=context({window:{}});run(read('herramientas/aac/js/tonal-analysis.js'),c);
  const src=read('herramientas/aac/js/app.js');
  c.getCurrentSettingsFallback=()=>({});c.isDeltaMaj7Enabled=()=>false;
  run(between(src,'normalizeTextSymbols','normalizeAccidentals')+between(src,'normalizeChordSymbolInput','normalizeMinorMajorSuffixInput')+between(src,'normalizeMinorMajorSuffixInput','normalizeDegreeInput'),c);
  results.aacChords=['C6/9','Cm6/9','C6/9/E','C69','Cm69','C7/E'].map(symbol=>{
   const displayed=c.normalizeChordSymbolInput(symbol),parsed=c.window.TonalAnalysis.parseChord(displayed);return {symbol,displayed,parsed};
  });
  results.aacBasicCadence=c.window.TonalAnalysis.analyzeProgression(['Dm7','G7','Cmaj7']);
  // Contract check only: the router forwards foreign JSON without validation.
  // The full normalizer's default-to-blank behavior is inspected separately.
  const parsedInputs=[];c.normalizeSong=raw=>{parsedInputs.push(raw);return {normalizerStub:true}};
  run(between(src,'normalizeImportedState','resetHistory'),c);
  c.normalizeImportedState({version:1,stats:{},sessions:[]});
  results.aacForeignImport={accepted:true,rawPassedToNormalizer:parsedInputs[0],scope:'import router only; normalizeSong stubbed; no real document changed'};
 }

 // Chord answers restricted to a single missed concept collapse to one option.
 {
  let seed=17012026;const seededMath=Object.create(Math);seededMath.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  const c=context({window:{},Math:seededMath});run(read('herramientas/ear-training/js/data.js'),c);run(read('herramientas/ear-training/js/generators.js'),c);
  const D=c.window.ETData,G=c.window.ETGenerators;
  const chord=D.CHORD_BANK[0].id;
  const r=G.generate(2,{chords:D.CHORD_BANK.map(c=>c.id),forcedConceptIds:['chord:'+chord]});
  results.earSingleError={options:r.options.length,answer:r.options[r.correctIdx].label};
  const signatures=new Map();
  for(let i=0;i<5000;i++){
   const x=G.generate(2,{chords:['c6','cm7'],register:'mid',chordVoicing:'inversions'}),key=x.seq[0].notes.join(',');
   const previous=signatures.get(key);
   if(previous&&previous.meta.chordId!==x.meta.chordId){results.earAmbiguousVoicing={notes:x.seq[0].notes,first:previous.meta,second:x.meta,options:x.options.map(o=>o.label)};break;}
   signatures.set(key,x);
  }

 }
 process.stdout.write(JSON.stringify(results,null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1;});
