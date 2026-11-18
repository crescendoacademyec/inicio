const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../curriculum.js'),L=require('../learning-design.js'),P=require('../progress.js').create(C),M=require('../models.js');
const E=require('../../../shared/listening-engine.js'),D=require('../../../shared/music-compendium/data.js');
const near=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<=e,`${a} != ${b}`);
const memory=()=>{const values=new Map();return {values,getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};};
test('Web Audio section settings distinguish pass-filter Q in dB from bell/notch Q',()=>{
 for(const type of ['highpass','lowpass'])for(const sections of [1,2,4]){
  let product=1;for(let i=0;i<sections;i++){const settings=M.filterSection({type,frequency:1000,gain:0,q:4,sections},i,48000);product*=10**(settings.Q/20);}
  near(product,Math.SQRT1_2);
 }
 for(const type of ['peaking','notch'])assert.equal(M.filterSection({type,frequency:800,gain:-4,q:4,sections:1},0,48000).Q,4);
 near(M.comparisonGain(6,true),1);near(M.comparisonGain(6,false),10**(.3));
});
test('legacy course migration retains notes, practice, results and old declarations without granting rubric mastery',()=>{
 const old={version:1,current:'midi-2',studied:{'sonido-1':true},answers:{'sonido-1':false},notes:{'midi-2':'Mi sonido'},labNotes:{eq:'comparé'},projects:{sonido:{notes:'archivo.wav',checks:[true,false,true]}},assessments:{sonido:{score:3,total:4,date:'17/11/2026'}}};
 const migrated=P.sanitize(old);assert.equal(migrated.learningRoute,'full');assert.equal(migrated.current,'midi-2');assert.equal(migrated.notes['midi-2'],'Mi sonido');assert.equal(migrated.answers['sonido-1'],false);assert.deepEqual(migrated.projects.sonido.checks,[true,false,true]);assert.deepEqual(migrated.projects.sonido.levels,['unreviewed','unreviewed','unreviewed']);assert.equal(migrated.assessments.sonido.kind,'legacy-reading');assert.deepEqual(P.sanitize(migrated),migrated);
});
test('course import validates before writing, preserves previous copy, and can exchange it back',()=>{
 const storage=memory(),current=P.empty();current.notes['sonido-1']='No perder';storage.setItem(P.key,JSON.stringify(current));
 for(const raw of [{version:1,hello:'world'},{version:1,stats:{},sessions:[]},{...current,app:'other-course'},{...current,notes:null}]){
  const before=[...storage.values];assert.throws(()=>P.replace(storage,raw,current));assert.deepEqual([...storage.values],before);
 }
 const incoming=P.empty();incoming.current='midi-2';incoming.taskAnswers['midi-2']={values:{level:'0,25'},checked:true};incoming.projects.midi={notes:'mi.wav',checks:[],levels:['supported','help','unreviewed']};
 const imported=P.replace(storage,incoming,current);assert.equal(imported.current,'midi-2');const restored=P.restore(storage,imported);assert.equal(restored.notes['sonido-1'],'No perder');assert.equal(JSON.parse(storage.getItem(P.key+'-respaldo')).current,'midi-2');
 const failed={getItem:storage.getItem,setItem(){throw Error('quota');}};assert.throws(()=>P.replace(failed,incoming,current),/quota/);assert.equal(current.notes['sonido-1'],'No perder');
});
test('auditory backup accepts its new and legacy formats and rejects course backups',()=>{
 const raw={version:1,stats:{adsr:{total:5,right:4,recent:[1,1,1,1,0]}},sessions:[]};assert.equal(E.parseBackup(raw).stats.adsr.total,5);assert.deepEqual(E.parseBackup({...raw,app:'crescendo-listening'}),E.parseBackup(raw));assert.throws(()=>E.parseBackup(P.empty()));assert.throws(()=>E.parseBackup({version:1,hello:'world'}));
});
test('fade stimuli have a common smooth onset and only the intended abrupt offset has a discontinuity',()=>{
 for(let option=0;option<3;option++){
  const round=E.create('artifacts',0,19,'music',option),sr=round.sr;
  for(const pair of round.audio)for(const channel of pair){
   for(let second=0;second<4;second++){assert.equal(channel[second*sr],0);if(second)assert.equal(channel[second*sr-1],0);assert.ok(Math.abs(channel[second*sr+1])<.002);}
  }
  const example=round.audio[1][0],at=Math.ceil(.713*sr),jump=Math.abs(example[at]-example[at-1]);
  assert.ok(option===0?jump>.05:jump<.01,`option ${option}: ${jump}`);
 }
});
test('all 48 application cases differ from reading checks and map to real lessons',()=>{
 const lessons=C.modules.flatMap(m=>m.lessons);assert.equal(Object.keys(L.assessments).length,48);
 for(const l of lessons){const q=L.assessments[l.id];assert.ok(q);assert.notEqual(q.prompt,l.question.prompt);assert.equal(new Set(q.options).size,3);assert.ok(q.answer>=0&&q.answer<q.options.length);assert.ok(q.explanation.length>30);}
 assert.equal(L.assessments['mezcla-3'].options[0],'−20 dBFS');assert.equal(L.assessments['sonido-4'].options[0],'34,3 Hz');
 for(const id of Object.keys(E.topics)){assert.ok(lessons.some(l=>L.href(l.id)==='#curso/'+E.lessonFor(id)),id);}
 for(const [id,destination]of Object.entries({adsr:'midi/midi-2',comping:'edicion/edicion-2',reverb:'profundidad/profundidad-1','mid-side':'profundidad/profundidad-3',parallel:'profundidad/profundidad-4'}))assert.equal(D.entries.find(e=>e.id===id).lesson,destination);
});
test('starter route, 12 independent tasks and observable lab criteria are consistent',()=>{
 const ids=new Set(C.modules.flatMap(m=>m.lessons.map(l=>l.id)));assert.equal(L.starter.length,6);
 L.starter.forEach((step,i)=>{assert.ok(ids.has(step.id));assert.equal(step.next,L.starter[i+1]?.id||null);assert.ok(step.steps.length===3&&step.evidence&&step.time);});
 assert.equal(Object.keys(L.tasks).length,12);
 for(const [id,task]of Object.entries(L.tasks)){assert.ok(ids.has(id));assert.equal(L.gradeTask(id,{}).score,0);assert.equal(L.gradeTask(id,Object.fromEntries(task.fields.map(f=>[f.id,String(f.value)]))).score,task.fields.length);}
 assert.equal(L.recommend({listen:'1',session:'1',evidence:'1'}),'full');assert.equal(L.recommend({listen:'0',session:'1',evidence:'1'}),'guided');
 assert.equal(L.labTasks.eq.check({type:'peaking',frequency:800,gain:-4,q:4,enabled:true,bypass:false}),true);assert.equal(L.labTasks.eq.check({type:'lowpass',frequency:800,gain:-4,q:4,enabled:true,bypass:false}),false);
 assert.equal(L.labTasks.compresion.check({threshold:-18,ratio:4,knee:0,enabled:true,bypass:true}),false);
});
test('renderer keeps the full course while starter content is progressive and assessment uses the new bank',()=>{
 const ui=require('./ui-harness.cjs')();ui.state.learningRoute='guided';ui.course(C.modules[0],C.modules[0].lessons[0]);const guided=ui.element('lessonArticle').innerHTML;assert.match(guided,/id="starterEvidence"/);assert.match(guided,/<details[^>]*id="deepStudy"/);assert.ok(guided.indexOf('Tarea aplicada')<guided.indexOf('class="reading"'));assert.match(guided,/Escuchar A/);
 ui.state.learningRoute='full';ui.course(C.modules[0],C.modules[0].lessons[0]);assert.doesNotMatch(ui.element('lessonArticle').innerHTML,/id="deepStudy"/);
 for(const m of C.modules){ui.assessment(m,true);const html=ui.element('assessmentContent').innerHTML;for(const l of m.lessons){assert.ok(html.includes(L.assessments[l.id].prompt));assert.ok(!html.includes(l.question.prompt));}}
 ui.state.projects.sonido={notes:'mi.wav',checks:[true],levels:['supported']};ui.project(C.modules[0]);assert.match(ui.element('projectContent').innerHTML,/marcas anteriores/);assert.match(ui.element('projectContent').innerHTML,/value="supported" selected/);
});
