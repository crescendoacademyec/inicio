const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function fn(source,name,next){let a=source.indexOf('function '+name+'('),b=source.indexOf('function '+next+'(',a);assert.ok(a>=0&&b>a,name);if(source.slice(a-6,a)==='async ')a-=6;return source.slice(a,b).replace(/async\s*$/,'');}
const ctx=extra=>vm.createContext(extra),run=(code,c)=>vm.runInContext(code,c);
const field=()=>({textContent:'',innerHTML:'',className:'',classList:{add(){},remove(){},toggle(){}},setAttribute(){}});

test('M01 repeated attacks retain no orphan oscillator, including sustain and final panic release',()=>{
 const source=read('herramientas/piano-virtual/js/audio.js'),voices=[];
 const node=()=>({gain:{value:1,cancelScheduledValues(){},setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},frequency:{setValueAtTime(){}},connect(){return this},start(){},stop(){this.stopped=true}});
 const c=ctx({window:{},document:{dispatchEvent(){}},CustomEvent:class{},keyElByMidi:{},isNoteInRange:()=>true,sustainedNotes:new Set(),visuallySustainedNotes:new Set(),ensureCtx:()=>({currentTime:0,createGain:node,createOscillator(){const n=node();voices.push(n);return n}}),volumeSlider:{value:'.4'},velocityGain:()=>1,lastMidiVelocity:0,findSampleForMidi:()=>null,sfPlayer:null,masterBus:node(),activeSources:{},setKeyActive(){},setStaffNote(){},updateChordDisplay(){},sustainOn:false});
 run(fn(source,'stopSoundNow','releaseSustainedNotes')+fn(source,'noteOn','setKeyActive'),c);
 run('noteOn({midi:60,freq:261.6});noteOn({midi:60,freq:261.6});noteOff({midi:60});',c);
 assert.equal(voices.length,2);assert.ok(voices.every(v=>v.stopped));assert.equal(Object.keys(c.activeSources).length,0);
 c.sustainOn=true;run('noteOn({midi:60,freq:261.6});noteOff({midi:60});noteOn({midi:60,freq:261.6});stopSoundNow(60);',c);
 assert.ok(voices.every(v=>v.stopped));assert.equal(c.sustainedNotes.size,0);
});

test('M02 click bar boundaries agree with score duration at quarter-note tempo, including dotted pulses',()=>{
 const source=read('herramientas/metronomo/index.html'),A=require('../herramientas/metronomo/rhythm-audio.js'),Structure=require('../herramientas/metronomo/rhythm-structure.js');
 for(const meter of ['4/4','6/8','7/8'])for(const subdivision of ['1','2','0.666667']){
  const c=ctx({UI:{amalgamInp:{value:''},beatsSel:{style:{}},subSel:{value:subdivision},volExtra:{value:'.5'},claveSel:{value:'off'},polyTgl:{checked:false},polyY:{value:'3'},pmTgl:{checked:false},accentTgl:{checked:true},swingSld:{value:'50'},dropTgl:{checked:false},rhythmPlacement:{value:'all'},volAccent:{value:'.5'},volNormal:{value:'.5'},volSub:{value:'.5'},trainTgl:{checked:false},pyrTgl:{checked:false}},document:{getElementById:()=>({value:'.5'})},window:{CrescendoRhythmStructure:Structure},currentRhythmMeter:()=>meter,renderVisualizer(){},audioContext:{currentTime:0},scheduleAheadTime:30,nextMainTime:0,mainBeatPos:0,mainMeasureCount:0,notesInQueue:[],tempo:60,playSynthSound(){},schedulerWorker:true,totalBeats:4,accentPulses:[0]});
  run(fn(source,'mainMeter','gcd')+fn(source,'scheduler','draw')+'\nparsePattern();scheduler();',c);
  const boundaries=c.notesInQueue.filter(n=>n.noteIdx===0).map(n=>n.time),duration=A.compile([],{meter,bars:1,tempo:60}).duration;
  assert.ok(boundaries.length>=4);
  boundaries.forEach((time,index)=>assert.ok(Math.abs(time-index*duration)<1e-7,`${meter}/${subdivision}: ${time}`));
 }
});

test('M03 raw vibrato contour retains width and rate across 30/60/120 samples per second',()=>{
 const source=read('herramientas/cuerdas-frotadas/js/vibrato.js'),a=source.indexOf('  const median='),b=source.indexOf('  function tick(',a),widths=[];
 for(const fps of [30,60,120]){
  const c=ctx({samples:Array.from({length:fps*5},(_,i)=>({t:i/fps,c:30*Math.sin(2*Math.PI*6*i/fps)})),modeEl:{value:'continuous'},widthEl:{value:'30'},rateEl:{value:'6'},status:field(),centerEl:field(),measuredWidthEl:field(),measuredRateEl:field(),regularityEl:field(),onsetEl:field(),drawChart(){}});
  run(source.slice(a,b)+'\nanalyze();',c);const width=parseFloat(c.measuredWidthEl.textContent.slice(1));widths.push(width);
  assert.ok(Math.abs(width-30)<2);assert.ok(Math.abs(parseFloat(c.measuredRateEl.textContent)-6)<.15);
 }
 assert.ok(Math.max(...widths)-Math.min(...widths)<1.5);
});

test('M04 role colors follow actual intervals for pentatonic, blues and symmetric scales in every key',()=>{
 for(const app of ['diapason-virtual','bass-virtual','folk-virtual','requinteando'])for(const file of ['index.html','js/fretboard.js']){
  const source=read(`herramientas/${app}/${file}`),a=source.indexOf('const toneRole = '),b=source.indexOf('\n    };',a)+7,c=ctx({});run(source.slice(a,b)+'\nthis.role=toneRole;',c);
  for(let root=0;root<12;root++)for(const [intervals,structural] of [[[0,2,4,7,9],[4,7]],[[0,2,4,7,10],[4,7,10]],[[0,3,5,7,10],[3,7,10]],[[0,3,5,6,7,10],[3,7,10]],[[0,2,4,6,8,10],[4,8,10]],[[0,2,3,5,6,8,9,11],[3,6,9]]]){
   const pcs=intervals.map(n=>(root+n)%12);assert.equal(c.role(root,root,pcs),'root');
   for(const interval of structural)assert.equal(c.role((root+interval)%12,root,pcs),'structural',app+'/'+interval);
  }
 }
});

function ear(){const c=ctx({window:{}});run(read('herramientas/ear-training/js/data.js'),c);run(read('herramientas/ear-training/js/generators.js'),c);return {D:c.window.ETData,G:c.window.ETGenerators};}
test('M05/M12 chord inversions have an audible fundamental and error review keeps distractors',()=>{
 const {D,G}=ear();
 for(let i=0;i<80;i++){
  const chord=G.generate(2,{chords:['c6','cm7'],forcedConceptIds:['chord:c6'],chordVoicing:'inversions'});
  assert.equal(chord.meta.chordId,'c6');assert.ok(chord.options.length>=2);assert.equal(chord.seq.length,2);assert.equal(chord.seq[0].notes.length,1);
  assert.equal(chord.seq[0].notes[0]%12,D.PITCH_NAMES.indexOf(chord.meta.root));assert.ok(chord.seq[1].start>chord.seq[0].start+chord.seq[0].dur);
  const interval=G.generate(1,{intervals:[3,4,7],forcedConceptIds:['interval:4']});assert.equal(interval.meta.semitones,4);assert.equal(interval.options.length,3);
  const degree=G.generate(3,{level3Targets:[0,1,4],level3Refs:[0],forcedConceptIds:['degree:tetrad:1']});assert.equal(degree.meta.degree,1);assert.equal(degree.options.length,3);
 }
 const single=G.generate(2,{chords:['c6']});assert.ok(single.options.length>=2);
});

test('M06 import validator rejects foreign data while retaining current and legacy exports',()=>{
 const source=read('herramientas/aac/js/app.js'),c=ctx({});run(fn(source,'validateImportedState','normalizeImportedState'),c);
 for(const raw of [null,[],{},42,{stats:{},sessions:[]},{app:'other-app',document:{pages:[{measures:[]}]}},{document:{pages:[{}]}},{exportVersion:46,pages:[{measures:[]}]}])assert.throws(()=>c.validateImportedState(raw));
 for(const raw of [{app:'analizador-armonico-svg-pro',exportVersion:45,document:{pages:[{measures:[]}]}},{app:'analizador-armonico-svg-pro',exportVersion:44,document:{pages:[{measures:[]}]}},{title:'Legacy',measures:[{chord:'C'}]},{pages:[{measures:[]}]}])assert.equal(c.validateImportedState(raw),raw);
});

test('M06 failed import preserves document, filename and history; valid imports remain undoable',async()=>{
 const source=read('herramientas/aac/js/app.js');let reader,alerts=0;
 const c=ctx({FileReader:class{constructor(){reader=this}readAsText(){}},dirty:true,currentFilename:'Original.json',historyStack:['original'],confirm:()=>true,alert:()=>alerts++,console:{warn(){}},song:{title:'Original'},captureAppState:()=>({document:{pages:[{measures:[]}],title:c.song.title}}),pushHistory:()=>c.historyStack.push(c.song.title),clearCurrentStandardSource(){},setDirty(value){c.dirty=value},applyAppState:async raw=>{c.song={title:raw.document.title}}});
 run(fn(source,'validateImportedState','normalizeImportedState')+fn(source,'importJson','getSelectedSvg'),c);
 c.importJson({target:{files:[{name:'foreign.json'}]}});reader.result=JSON.stringify({stats:{}});await reader.onload();
 assert.equal(c.song.title,'Original');assert.equal(c.currentFilename,'Original.json');assert.equal(c.historyStack.length,1);assert.equal(alerts,1);
 c.importJson({target:{files:[{name:'New.json'}]}});reader.result=JSON.stringify({document:{title:'New',pages:[{measures:[]}]}});await reader.onload();
 assert.equal(c.currentFilename,'New.json');assert.equal(c.song.title,'New');assert.equal(c.historyStack.at(-2),'Original');assert.equal(c.historyStack.at(-1),'New');
});

test('M07 pending play cannot start after cancellation/removal',async()=>{
 const source=read('herramientas/speed/index.html');let resolve,starts=0,fallbacks=0,processingStarted=false;
 const pending=new Promise(r=>resolve=r),c=ctx({audioBuffer:{duration:10},audioCtx:{resume:async()=>{},currentTime:0},playbackGeneration:0,playPending:false,currentTime:0,duration:10,processedTempo:1,currentSource:null,isPlaying:false,ensureProcessed:()=>{processingStarted=true;return pending},disposeFallbackMedia(){},disposeSource(){},createSource:()=>({start(){starts++}}),applyLoop(){},startTimeUpdates(){},playIcon:{},startFallbackPlayback(){fallbacks++}});
 run(fn(source,'startPlayback','pausePlayback'),c);
 const playing=c.startPlayback();await new Promise(setImmediate);assert.equal(processingStarted,true);c.playbackGeneration++;c.audioBuffer=null;resolve({duration:10});await playing;
 assert.equal(starts,0);assert.equal(fallbacks,0);assert.equal(c.isPlaying,false);
});

test('M07 an older processed request cannot replace a newer playing source',async()=>{
 const source=read('herramientas/speed/index.html'),requests=[],started=[];
 const c=ctx({audioBuffer:{duration:10},audioCtx:{resume:async()=>{},currentTime:0},playbackGeneration:0,playPending:false,currentTime:0,duration:10,processedTempo:1,currentSource:null,isPlaying:false,ensureProcessed:()=>new Promise(resolve=>requests.push(resolve)),disposeFallbackMedia(){},disposeSource(){},createSource:buffer=>({buffer,start(){started.push(buffer)}}),applyLoop(){},startTimeUpdates(){},playIcon:{},startFallbackPlayback(){assert.fail('unexpected fallback')}});
 run(fn(source,'startPlayback','pausePlayback'),c);
 const first=c.startPlayback();await new Promise(setImmediate);const second=c.startPlayback();await new Promise(setImmediate);
 const fresh={duration:10,id:'fresh'};requests[1](fresh);await second;requests[0]({duration:10,id:'stale'});await first;
 assert.equal(started.length,1);assert.equal(started[0],fresh);assert.equal(c.currentSource.buffer,fresh);assert.equal(c.isPlaying,true);
});

test('M07 a native fallback resolving after cancellation remains paused',async()=>{
 const source=read('herramientas/speed/index.html');let resolve,pauses=0;
 const media={pause(){pauses++},play:()=>new Promise(r=>resolve=r),currentTime:0},c=ctx({audioFile:{},playbackGeneration:0,currentTime:0,duration:8,currentPitchSemitones:()=>0,fallbackMedia:media,currentTempoRate:()=>1,isPlaying:false});
 run(fn(source,'startFallbackPlayback','linearSample'),c);
 const pending=c.startFallbackPlayback();c.playbackGeneration++;c.fallbackMedia=null;resolve();await pending;
 assert.equal(c.isPlaying,false);assert.ok(pauses>=2);
});

test('M08 cancellation of pending mic closes late capture and initialization failure cleans resources',async()=>{
 const source=read('herramientas/afinador/index.html'),a=source.indexOf('let listening = false;'),b=source.indexOf('\nfunction tick()',a);let resolve,handler;
 const tracks=[],contexts=[],c=ctx({navigator:{mediaDevices:{getUserMedia:()=>new Promise(r=>resolve=r)}},window:{addEventListener(){},AudioContext:class{constructor(){contexts.push(this)}createMediaStreamSource(){return {connect(){}}}createAnalyser(){return {fftSize:4096}}close(){this.closed=true;return Promise.resolve()}}},PitchDetector:{forFloat32Array:()=>({})},micBtn:{...field(),addEventListener:(_,fn)=>handler=fn},micStatus:field(),tick(){},resetDial(){},cancelAnimationFrame(){},console});
 run('let audioCtx,analyser,detector,dataArray,rafId,stream;'+source.slice(a,b),c);
 let pending=handler();await handler();const track={stopped:false,stop(){this.stopped=true}};tracks.push(track);resolve({getTracks:()=>[track]});await pending;
 assert.equal(track.stopped,true);assert.equal(contexts.length,0);
 c.PitchDetector.forFloat32Array=()=>{throw Error('detector unavailable')};pending=handler();const second={stopped:false,stop(){this.stopped=true}};resolve({getTracks:()=>[second]});await pending;
 assert.equal(second.stopped,true);assert.ok(contexts.every(context=>context.closed));
});

test('M10 keyboard and pointer loop changes update the playing source and clear invalid ranges',()=>{
 const source=read('herramientas/speed/index.html'),a=source.indexOf('            function applyLoop()'),b=source.indexOf("            loopATag.addEventListener",a);
 const c=ctx({audioBuffer:{},currentTime:2,loopA:null,loopB:null,loopActive:false,currentSource:{loop:false},processedTempo:.5,repeatBtn:field(),loopATag:field(),loopBTag:field(),loopHint:field(),formatTime:String,drawWaveform(){},refreshCurrentTime(){}});
 run(source.slice(a,b),c);c.markLoop('a');c.currentTime=5;c.markLoop('b');assert.equal(c.currentSource.loop,true);assert.equal(c.currentSource.loopStart,4);assert.equal(c.currentSource.loopEnd,10);
 c.currentTime=6;c.markLoop('a');assert.equal(c.currentSource.loop,false);assert.equal(c.loopActive,false);
 const keyboard=source.slice(source.indexOf("document.addEventListener('keydown', async (e) => {"));assert.match(keyboard,/markLoop\(e.key.toLowerCase\(\)\)/);
});

test('M11 6/9 qualities preserve ninth and slash bass',()=>{
 const c=ctx({window:{}});run(read('herramientas/aac/js/tonal-analysis.js'),c);const parse=c.window.TonalAnalysis.parseChord;
 for(const [symbol,suffix,bass] of [['C6/9','69',''],['Cm6/9','m69',''],['C6/9/E','69','E'],['Dbm6/9/Ab','m69','Ab'],['C7/E','7','E']]){
  const parsed=parse(symbol);assert.equal(parsed.suffix,suffix);assert.equal(parsed.bass,bass);
 }
});

test('M13 assisted attempts are counted separately from independent auditory progress',()=>{
 const memory={},c=ctx({window:{localStorage:{}},localStorage:{getItem:key=>memory[key]||null,setItem:(key,value)=>memory[key]=value,removeItem:key=>delete memory[key]}});
 run(read('herramientas/ear-training/js/data.js'),c);run(read('herramientas/ear-training/js/storage.js'),c);const S=c.window.ETStorage;
 S.recordAnswer(1,true,1,{targetId:'interval:4',assisted:true});assert.equal(S.getLevelStats(1).total,0);assert.equal(S.getLevelStats(1).assisted,1);assert.equal(S.getConceptStats(1).length,0);
 S.recordAnswer(1,true,1,{targetId:'interval:4'});assert.equal(S.getLevelStats(1).total,1);assert.equal(S.getConceptStats(1)[0].total,1);
});

test('M13 answers require a completed listening attempt, including numeric shortcuts',()=>{
 const source=read('herramientas/ear-training/js/app.js');let recorded=0;
 const buttons=[field(),field()],r={options:[{id:'a'},{id:'b'}],correctIdx:0,meta:{},feedback:()=>'',answered:false,heard:false};
 const c=ctx({state:{round:r,session:{total:0,correct:0,streak:0,streakMax:0},level:1},S:{recordAnswer(){recorded++}},document:{querySelectorAll:()=>buttons,getElementById:()=>field(),querySelector:()=>null},window:{CrescendoPractice:{review:()=>''}}});
 run(fn(source,'answerRound','startChallenge'),c);c.answerRound(0);assert.equal(recorded,0);assert.equal(r.answered,false);
 r.heard=true;c.answerRound(0);assert.equal(recorded,1);c.answerRound(1);assert.equal(recorded,1);
});

test('M16 all four accessible boards expose sounding octaves and roles, including the legacy Folk note map',()=>{
 const notes=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
 for(const app of ['diapason-virtual','bass-virtual','folk-virtual','requinteando']){
  const source=read(`herramientas/${app}/index.html`);let cells;
  const c=ctx({window:{CrescendoFretboardAccess:{create:()=>({update(value){cells=value}})},...(app==='folk-virtual'?{}:{CrescendoPitchSpelling:{pc:n=>notes.indexOf(n)}})},NOTE:notes,accessibleBoard:null,cvs:{},activateBoardCell(){},activePitches:()=>[64,59],physicalFret:f=>f,offset:0,visibleFrets:3,rootSel:{value:'C'},scaleSel:{value:'pentatonica_mayor'},chordTypeSel:{value:''},scalePitchClasses:()=>[0,2,4,7,9],spellPc:app==='folk-virtual'?undefined:n=>notes[n],toneRole:n=>n===4?'structural':'tension',blankMode:()=>false});
  run(fn(source,'renderAccessibleBoard','draw')+'\nrenderAccessibleBoard();',c);
  assert.equal(cells.length,8);assert.equal(cells[0].label,'E4');assert.equal(cells[0].role,'sonido estructural');assert.equal(cells[4].label,'B3');
 }
});
