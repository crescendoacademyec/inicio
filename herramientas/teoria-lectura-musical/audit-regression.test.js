const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function appContext(){
  const c={console,setTimeout:()=>0,localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){}}};
  c.window=c;vm.createContext(c);
  vm.runInContext(fs.readFileSync(__dirname+'/data.js','utf8'),c);
  vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),c);
  return c;
}
test('dictation accepts repeated pitches and classifies diatonic steps and thirds',()=>{
  const c=appContext();
  for(const [a,b,expected] of [['C5','C5','Repetición exacta'],['B4','C5','Grado conjunto ascendente'],['E4','D4','Grado conjunto descendente'],['E4','G4','Salto ascendente'],['C5','G4','Salto descendente']]){
    assert.equal(c.melodicOpening(a,b),expected);
    const question=c.dictationOpeningQuestion([a,b]);
    assert.equal(question.answers[question.correct],expected);
    assert.equal(new Set(question.answers).size,4);
  }
});
test('scale labels match actual sounding register in all available keys and over multiple octaves',()=>{
  const c=appContext();
  for(const root of ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']){
    for(let degree=0;degree<22;degree++){
      const pitch=c.scaleFluencyPitch(root,degree);
      assert.equal(c.midiFromNamed(pitch.name),pitch.midi,`${root}: ${pitch.name}`);
      if(degree)assert.ok(pitch.midi>c.scaleFluencyPitch(root,degree-1).midi);
    }
  }
  assert.equal(c.scaleFluencyPitch('B',1).name,'C♯5');
  assert.equal(c.scaleFluencyPitch('G',3).name,'C5');
  assert.equal(c.midiFromNamed('Cb4'),59);
  assert.equal(c.midiFromNamed('B#4'),72);
});
test('score keeps written values while 6/8, 9/8 and 12/8 count main ternary pulses',()=>{
  const c=appContext();
  for(const [meter,pulses,unit] of [['4/4',4,1],['3/4',3,1],['6/8',2,1.5],['9/8',3,1.5],['12/8',4,1.5],['7/8',7,.5],['2/2',2,2]]){
    assert.equal(c.meterPulseCount(meter),pulses);
    assert.equal(c.quarterUnitsPerPulse(meter),unit);
  }
  const phrase=c.trackPhrase(['C4','D4','E4','F4','G4','A4'],'6/8');
  assert.equal(phrase.reduce((sum,n)=>sum+n.beats,0),3);
  assert.ok(phrase.every(n=>n.dur==='e'&&n.bar===0));
});
test('6/8 playback and model keep the same tempo as the count-in',async()=>{
  const c=appContext(),waits=[],tones=[];
  c.setTimeout=(callback,ms)=>{waits.push(ms);callback();};
  c.playTone=(midi,options)=>tones.push({midi,...options});
  c.ensurePianoSoundFont=async()=>null;
  c.setCountIn=()=>{};c.finishCountIn=()=>{};
  vm.runInContext('AUDIO.seq=0;stopAllAudio=()=>{AUDIO.seq++};',c);
  const root={querySelectorAll:()=>[]};
  const phrase=c.trackPhrase(['C4','D4','E4','F4','G4','A4'],'6/8');
  await c.playPhrase(root,phrase,60,'6/8');
  assert.deepEqual(waits.slice(0,2),[1000,1000]);
  assert.equal(waits.length,8);
  assert.ok(waits.slice(2).every(ms=>Math.abs(ms-1000/3)<1e-8));
  assert.ok(Math.abs(waits.reduce((a,b)=>a+b,0)-4000)<1e-8);
  waits.length=0;tones.length=0;
  await c.playPhrase(root,phrase,60,'6/8',{countIn:false});
  assert.equal(waits.length,6);assert.equal(tones.length,6);
  assert.ok(Math.abs(waits.reduce((a,b)=>a+b,0)-2000)<1e-8);
});
test('every irregular meter has multiple distinct answers including its actual grouping',()=>{
  const c=appContext();
  const patterns=vm.runInContext('IRREGULAR_METERS',c);
  for(const pattern of patterns){
    const q=c.irregularGroupingQuestion(pattern);
    assert.equal(q.answers.length,4);
    assert.equal(new Set(q.answers).size,4);
    assert.equal(q.answers[q.correct],pattern.label);
  }
});
test('checking a phrase can omit note names while keeping playback highlight targets',()=>{
  const c=appContext();let options;
  c.CrescendoPractice={sequence:(phrase,opts)=>{options=opts;return '<svg></svg>';}};
  const html=c.phraseStaffSVG([{note:'G4',beats:1}],{labels:false});
  assert.equal(options.labels,false);
  assert.ok(!html.includes('G4'));
  assert.ok(html.includes('data-sol-note-index="0"'));
  c.phraseStaffSVG([{note:'G4',beats:1}]);assert.equal(options.labels,true);
});
test('evaluations explain answers and wait for Continue instead of an automatic timer',()=>{
  const c=appContext();let timers=0;
  c.setTimeout=()=>{timers++;};
  function element(){return {hidden:true,disabled:false,dataset:{},setAttribute(){},focus(){},scrollIntoView(){},classList:{add(){},remove(){}},addEventListener(type,fn){this[type]=fn;}};}
  const feedback=element(),next=element();let buttons;
  const runner={classList:{remove(){}},set innerHTML(html){buttons=[...html.matchAll(/data-eval-choice="(\d+)"/g)].map(m=>({...element(),dataset:{evalChoice:m[1]}}));next.hidden=true;},querySelectorAll:()=>buttons,querySelector:selector=>selector==='[data-eval-feedback]'?feedback:next};
  c.document.getElementById=()=>runner;
  c.startEvaluation('diagnostic');
  buttons[0].click();
  assert.equal(timers,0);
  assert.equal(next.hidden,false);
  assert.ok(feedback.textContent.length>30);
  assert.ok(buttons.every(button=>button.disabled));
  const previous=buttons;next.click();assert.notEqual(buttons,previous);assert.equal(next.hidden,true);
});

test('generated repertoire fills every bar and keeps ties on the same pitch in each difficulty',()=>{
  const c=appContext();
  for(const meter of ['4/4','3/4','6/8','5/4'])for(const difficulty of [1,2,3])for(let run=0;run<30;run++){
    const phrase=c.makeReadingStudy({meter,phrase:['C4','D4','E4','F4','G4','A4','B4'],key:difficulty===3?1:0},{difficulty,bars:4});
    const [top,bottom]=meter.split('/').map(Number);
    for(let bar=0;bar<4;bar++)assert.equal(phrase.filter(event=>event.bar===bar).reduce((sum,event)=>sum+event.beats,0),top*4/bottom);
    phrase.forEach((event,index)=>{assert.ok(event.beats>0);if(event.tied){assert.ok(phrase[index-1].tieStart);assert.equal(event.note,phrase[index-1].note);assert.notEqual(event.kind,'rest');}});
    if(difficulty===3||meter==='6/8'||meter==='5/4'){
      assert.ok(phrase.some(event=>event.kind==='rest'));
      assert.ok(phrase.some(event=>event.tieStart));
    }
    assert.ok(new Set(phrase.map(event=>event.beats)).size>1);
  }
});
test('dictation provides exactly one full matching phrase and distinct valid alternatives',()=>{
  const c=appContext();
  for(let run=0;run<100;run++){
    const phrase=c.makeReadingStudy({meter:'4/4',phrase:['C4','D4','E4','F4','G4']},{difficulty:2,bars:2});
    const original=JSON.stringify(phrase),choices=c.dictationPhraseChoices(phrase);
    assert.equal(choices.filter(choice=>choice.correct).length,1);
    assert.equal(new Set(choices.map(choice=>JSON.stringify(choice.phrase))).size,3);
    assert.equal(JSON.stringify(choices.find(choice=>choice.correct).phrase),original);
    assert.equal(JSON.stringify(phrase),original);
    for(const choice of choices)for(let bar=0;bar<2;bar++)assert.equal(choice.phrase.filter(event=>event.bar===bar).reduce((sum,event)=>sum+event.beats,0),4);
  }
});
test('phrase checkpoints cover different measures, octaves and rhythm with unambiguous choices',()=>{
  const c=appContext();
  const phrase=c.makeReadingStudy({meter:'5/4',key:1,phrase:['D4','E4','F4','G4','A4','B4','C5']},{difficulty:3,bars:4});
  const questions=c.phraseCheckpoints(phrase,'5/4');
  assert.equal(questions.length,5);
  assert.equal(questions.filter(q=>q.skill==='altura').length,3);
  assert.equal(questions.filter(q=>q.skill==='ritmo').length,2);
  assert.ok(questions.some(q=>q.question.includes('Compás 4')));
  for(const q of questions){assert.equal(new Set(q.answers).size,4);assert.ok(q.correct>=0&&q.correct<4);}
});
test('playback waits through rests and prolongs tied pitches without another attack',async()=>{
  const c=appContext(),waits=[],tones=[];
  c.setTimeout=(callback,ms)=>{waits.push(ms);callback();};
  c.playTone=(midi,options)=>tones.push({midi,...options});
  c.ensurePianoSoundFont=async()=>null;c.finishCountIn=()=>{};
  vm.runInContext('AUDIO.seq=0;stopAllAudio=()=>{AUDIO.seq++};',c);
  const phrase=[{note:'C4',beats:1,tieStart:true},{note:'C4',beats:.5,tied:true},{note:'D4',kind:'rest',beats:.5},{note:'G4',beats:2}];
  const sounds=c.phraseSoundEvents(phrase);
  assert.deepEqual(Array.from(sounds,event=>event.start),[0,1,1.5,2]);
  assert.equal(sounds[0].length,1.5);
  await c.playPhrase({querySelectorAll:()=>[]},phrase,60,'4/4',{countIn:false});
  assert.deepEqual(tones.map(event=>event.midi),[60,67]);
  assert.ok(tones[0].duration>1.4);
  assert.equal(waits.reduce((sum,ms)=>sum+ms,0),4000);
});
test('grand staff uses a shared time axis for independent rhythms and exports both staves',()=>{
  const c=appContext();let events,options;
  c.CrescendoPractice={sequence:(e,o)=>{events=e;options=o;return 'score';}};
  const upper=[{note:'C4',beats:.5,bar:0},{note:'D4',beats:3.5,bar:0}],lower=[{note:'C3',beats:4,bar:0}];
  assert.ok(c.grandStaffHTML(upper,lower,'4/4').includes('score'));
  assert.equal(options.clef,'grand');
  assert.deepEqual(Array.from(events,event=>event.staff),[1,1,2]);
  assert.equal(upper[0].staff,undefined);
});
test('reading evidence persists separately from self assessment and survives reload with bounded history',()=>{
  const c=appContext();let saved;
  c.localStorage.setItem=(key,value)=>{saved=value;};
  vm.runInContext('state.readingEvaluation={achieved:2,total:4};',c);
  for(let i=0;i<45;i++)c.recordReadingEvidence('lectura',{score:i%6,total:5,meter:'4/4',supportUsed:i%2===0});
  const state=JSON.parse(saved);
  assert.equal(state.readingEvidence.length,40);
  assert.equal(state.readingEvaluation.achieved,2);
  c.localStorage.getItem=()=>saved;
  assert.equal(c.loadState().readingEvidence.length,40);
  assert.equal(c.loadState().readingEvaluation.total,4);
});

test('phrase assessment records one result only after every checkpoint and keeps aid use',()=>{
  const c=appContext();let saved;
  c.localStorage.setItem=(key,value)=>{saved=value;};
  c.renderEvaluationSummary=()=>{};
  function element(dataset={}){return {dataset,disabled:false,setAttribute(){},focus(){},scrollIntoView(){},classList:{add(){}},addEventListener(type,fn){this[type]=fn;}};}
  const feedback={},result=element();let buttons;
  const host={set innerHTML(html){buttons=[...html.matchAll(/data-phrase-question="(\d+)" data-phrase-answer="(\d+)"/g)].map(m=>element({phraseQuestion:m[1],phraseAnswer:m[2]}));},querySelectorAll(selector){if(selector==='[data-phrase-question]')return buttons;const index=/"(\d+)"/.exec(selector)[1];return buttons.filter(button=>button.dataset.phraseQuestion===index);},querySelector(selector){if(selector==='[data-phrase-result]')return result;return feedback[selector]??=(element());}};
  const phrase=c.makeReadingStudy({meter:'4/4',phrase:['C4','D4','E4','F4','G4']},{difficulty:2,bars:4});
  c.mountPhraseChecks(host,phrase,{meter:'4/4',levelId:'lectura',supportUsed:()=>true,bpm:()=>72});
  for(let index=0;index<4;index++)buttons.find(button=>button.dataset.phraseQuestion===String(index)).click();
  assert.equal(saved,undefined);
  const last=buttons.find(button=>button.dataset.phraseQuestion==='4');last.click();last.click();
  const state=JSON.parse(saved);
  assert.equal(state.readingEvidence.length,1);
  assert.equal(state.readingEvidence[0].total,5);
  assert.equal(state.readingEvidence[0].supportUsed,true);
  assert.equal(state.readingEvidence[0].bpm,72);
  assert.ok(result.textContent.includes('con ayudas'));
  assert.equal(state.readingEvaluation,null);
});

test('study completion and performance are separate and all studied units reach 100 percent',()=>{
  const c=appContext();
  vm.runInContext('state.completed=Object.fromEntries(allCourseLevels().map(level=>[level.id,true]));state.practice={};',c);
  assert.equal(c.totalProgressPercent(),100);
  c.recordReadingEvidence('lectura',{score:1,total:5,supportUsed:true});
  assert.equal(c.totalProgressPercent(),100);
  assert.ok(c.readingLevelStatus('lectura').includes('1/5 con ayudas'));
});

test('sparse bass pitch pools can move between available notes instead of sticking at one pitch',()=>{
  const c=appContext();
  vm.runInContext('Math.random=()=>.5;',c);
  const notes=c.generateTrackNotes(['C3','G2','C3','G2','C3','G2']);
  assert.equal(new Set(notes).size,2);
  assert.ok(notes.every(note=>note==='C3'||note==='G2'));
  assert.equal(c.generateTrackNotes([]).length,0);
});

test('guided lessons show one idea, retain the current step and allow the complete view',()=>{
  const c=appContext();
  function button(dataset={}){return {dataset,attributes:{},setAttribute(name,value){this.attributes[name]=value;},addEventListener(type,callback){this[type]=callback;}};}
  let focusedHeading;
  const blocks=Array.from({length:3},(_,index)=>({hidden:false,microtask:{hidden:false},footer:{hidden:false},heading:{setAttribute(){},focus(){focusedHeading=index;},scrollIntoView(){}},querySelector(selector){return selector==='h1,h2,h3,h4'?this.heading:selector==='[data-microtask]'?this.microtask:this.footer;},scrollIntoView(){}}));
  const modes=[button({lessonMode:'guided'}),button({lessonMode:'full'})];
  const back=button(),forward=button(),practice=button(),controls={},position={},area={scrollIntoView(){}};
  const nodes={'[data-lesson-back]':back,'[data-lesson-forward]':forward,'[data-lesson-practice]':practice,'[data-lesson-step-controls]':controls,'[data-lesson-position]':position,'[data-lesson-practice-area]':area};
  const root={querySelectorAll:selector=>selector==='[data-lesson-block]'?blocks:selector==='[data-lesson-mode]'?modes:[],querySelector:selector=>nodes[selector]};
  c.document.getElementById=()=>root;c.saveState=()=>{};c.reducedMotion=()=>true;
  c.mountLessonPacing({id:'lectura'});
  assert.deepEqual(blocks.map(block=>block.hidden),[false,true,true]);
  forward.click();assert.deepEqual(blocks.map(block=>block.hidden),[true,false,true]);
  assert.equal(c.lessonStepIndex('lectura',3),1);assert.equal(focusedHeading,1);
  modes[1].click();assert.ok(blocks.every(block=>!block.hidden));assert.equal(controls.hidden,true);
  modes[0].click();assert.deepEqual(blocks.map(block=>block.hidden),[true,false,true]);
});
test('review suggestions become due on a later day and prioritise the earlier recommended practice',()=>{
  const c=appContext();
  vm.runInContext(`state.readingEvidence=[{levelId:'lectura',score:2,total:5,at:'2026-11-17T15:00:00Z'},{levelId:'l2-dictado',score:5,total:5,at:'2026-11-17T15:00:00Z'}];`,c);
  const today=c.readingReviewPlan(Date.parse('2026-11-17T18:00:00Z'));
  assert.equal(today.length,2);assert.ok(today.every(item=>!item.due));
  const tomorrow=c.readingReviewPlan(Date.parse('2026-11-18T16:00:00Z'));
  assert.equal(tomorrow[0].level.id,'lectura');assert.equal(tomorrow[0].due,true);assert.equal(tomorrow[1].due,false);
  const later=c.readingReviewPlan(Date.parse('2026-11-21T16:00:00Z'));
  assert.ok(later.every(item=>item.due));
});
test('classical melodic minor ascends with raised sixth and seventh and descends as natural minor',()=>{
  const c=appContext();
  const scale=vm.runInContext('SCALES.find(scale=>scale.id==="melodic-minor")',c);
  const up=c.tones('A',scale.tokens),down=c.descendingScaleTones('A',scale);
  assert.deepEqual(Array.from(up,tone=>tone.semi),[0,2,3,5,7,9,11,12]);
  assert.deepEqual(Array.from(down,tone=>tone.semi),[12,10,8,7,5,3,2,0]);
  assert.deepEqual(Array.from(down,tone=>tone.name),['A','G','F','E','D','C','B','A']);
});
test('alto trainer sends C clef on the third line to the notation engine',()=>{
  const c=appContext();let events,options;
  c.CrescendoPractice={sequence:(e,o)=>{events=e;options=o;return 'alto score';}};
  assert.equal(c.staffTrainerSVG('C4','alto'),'alto score');
  assert.equal(options.clef,'alto');assert.equal(events[0].note,'C4');
});

test('tonal examples render real signatures and local naturals rather than decorative glyph rows',()=>{
  const c=appContext(),calls=[];
  c.CrescendoPractice={sequence:(events,options)=>{calls.push({events,options});return '<svg></svg>';}};
  const scenarios=vm.runInContext('TONAL_CHANGE_SCENARIOS',c);
  for(const scenario of scenarios){
    calls.length=0;
    c.tonalChangePracticeHTML(scenario);
    assert.equal(calls.length,2);
    assert.equal(calls[0].options.key,scenario.oldKey);
    assert.equal(calls[1].options.key,scenario.newKey);
    assert.ok(calls[0].events.some(event=>event.note===scenario.localNote&&event.accidental==='natural'));
    assert.equal(calls[1].events.reduce((sum,event)=>sum+event.beats,0),4);
  }
});

test('foundation scale training can stay within taught scales without restricting other courses',()=>{
  const c={};c.window=c;vm.createContext(c);
  vm.runInContext(fs.readFileSync(__dirname+'/../../shared/music-practice.js','utf8'),c);
  const allowed=['major','minor','harmonic','melodic'];
  for(let i=0;i<40;i++){
    const q=c.CrescendoPractice.question('scale',{scaleIds:allowed});
    assert.equal(q.choices.length,4);
    assert.ok(q.choices.includes(q.answer));
    assert.ok(!q.choices.some(choice=>choice.includes('Bebop')));
  }
  assert.ok(c.CrescendoPractice.question('scale').choices.some(choice=>choice.includes('Bebop')));
});

test('view navigation focuses visible content and rejects unknown views without hiding the page',()=>{
  const c=appContext();let focusCount=0,scrollCount=0,audioStops=0,rendered=0;
  const heading={setAttribute(){},focus(options){assert.equal(options.preventScroll,true);focusCount++;},scrollIntoView(){scrollCount++;}};
  const target={classList:{remove(){}},querySelector:()=>heading,querySelectorAll:()=>[]};
  const button={dataset:{view:'curso'},classList:{toggle(){}},setAttribute(){},removeAttribute(){}};
  c.document.getElementById=id=>['cursoView','mapaView'].includes(id)?target:null;
  c.document.querySelectorAll=selector=>selector==='[data-view]'?[button]:[];
  c.stopAllAudio=()=>audioStops++;c.renderCourse=()=>rendered++;c.scrollTopSafe=()=>{};
  assert.equal(c.showView('mapa'),true);assert.equal(focusCount,1);assert.equal(scrollCount,1);assert.equal(audioStops,1);
  c.showView('curso',{focus:false});assert.equal(rendered,1);assert.equal(focusCount,1);
  assert.equal(c.showView('unknown'),false);assert.equal(focusCount,1);assert.equal(audioStops,1);
});
test('focusing a correction keeps the scroll position and leaves the next control available to Tab',()=>{
  const c=appContext();let options,scrolled=false;
  const target={setAttribute(name,value){assert.equal(name,'tabindex');assert.equal(value,'-1');},focus(value){options=value;},scrollIntoView(){scrolled=true;}};
  assert.equal(c.focusTarget(target,{scroll:false}),true);
  assert.equal(options.preventScroll,true);assert.equal(scrolled,false);
  assert.equal(c.focusTarget(null),false);
});

test('only overflowing regions enter the keyboard sequence and existing notation semantics survive',()=>{
  const c=appContext();
  function region(width,scroll,initial={}){
    const attributes={...initial};
    return {clientWidth:width,scrollWidth:scroll,dataset:{},attributes,hasAttribute:name=>Object.hasOwn(attributes,name),setAttribute(name,value){attributes[name]=value;},removeAttribute(name){delete attributes[name];},closest:()=>({querySelector:()=>({textContent:'Tabla de figuras'})}),querySelector:()=>null};
  }
  const table=region(240,600),notation=region(240,500,{role:'img','aria-label':'Pentagrama de sol'}),fitting=region(600,600),root={querySelectorAll:()=>[table,notation,fitting]};
  c.enhanceTheoryScrollRegions(root);
  assert.equal(table.attributes.tabindex,'0');assert.equal(table.attributes.role,'region');assert.ok(table.attributes['aria-label'].includes('Tabla de figuras'));
  assert.equal(notation.attributes.role,'img');assert.equal(notation.attributes['aria-label'],'Pentagrama de sol');assert.equal(notation.attributes.tabindex,'0');
  assert.equal(fitting.attributes.tabindex,undefined);
  table.scrollWidth=240;notation.scrollWidth=240;c.enhanceTheoryScrollRegions(root);
  assert.equal(table.attributes.tabindex,undefined);assert.equal(table.attributes.role,undefined);
  assert.equal(notation.attributes.tabindex,undefined);assert.equal(notation.attributes.role,'img');assert.equal(notation.attributes['aria-label'],'Pentagrama de sol');
});

test('manual polyrhythm counts accept only whole numbers from two to eight',()=>{
  const c=appContext();
  assert.deepEqual(Array.from(c.polyrhythmCounts('5','3')),[5,3]);
  assert.deepEqual(Array.from(c.polyrhythmCounts(8,8)),[8,8]);
  for(const values of [['',3],[0,3],[9,3],[2.5,3],['nota',3],[3,1]])assert.equal(c.polyrhythmCounts(...values),null);
});
