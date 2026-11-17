const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function runtime(){
 const storage=new Map(),c={console,document:{readyState:'loading',addEventListener(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};c.window=c;vm.createContext(c);
 for(const file of ['../../shared/music-practice.js','../../shared/piano-voicings.js','data.js','piano-bank.js','baga-lab.js','learning-design.js','theory-visuals.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),c);
 let app=fs.readFileSync(__dirname+'/app.js','utf8').replace(/\}\)\(\);\s*$/,'globalThis.appAudit={loadState,scoreQuiz,shuffledQuestions,renderResult,projectExample,getState(){return state},setState(s){Object.assign(state,s)}};})();');
 vm.runInContext(app,c);vm.runInContext('globalThis.levels=LEVELS;',c);return {c,storage};
}
const plain=v=>JSON.parse(JSON.stringify(v)),pcs=a=>[...new Set(a.map(n=>(n%12+12)%12))].sort((a,b)=>a-b);
test('real script order has 79 stable topics and all 114 questions have explanations and valid study targets',()=>{
 const {c}=runtime();assert.deepEqual(Array.from(c.levels,l=>l.topics.length),[15,16,18,17,13]);
 const ids=c.levels.flatMap(l=>l.topics.map(t=>t.id));assert.equal(new Set(ids).size,79);
 for(const l of c.levels)for(const q of l.quiz){assert.ok(q.explanation?.length>30,q.prompt);assert.ok(l.topics.some(t=>t.id===q.studyTopicId),q.studyTopicId);}
 const q=c.levels[3].quiz[2];assert.equal(q.options[q.correctIndex],'Tríada de A');
 assert.deepEqual(pcs([9,13,16].map(n=>n-7)),[2,6,9]);
 assert.match(c.levels[1].quiz[14].options[c.levels[1].quiz[14].correctIndex],/A7/);
});
test('compound models transpose each component and preserve inversion bass independently',()=>{
 const {c}=runtime(),api=c.TheoryVisuals;
 assert.equal(api.compoundModel(0,api.compounds[0]).label,'D7/F♯');
 assert.equal(api.compoundModel(0,api.compounds[1]).label,'C/D');
 for(let root=0;root<12;root++){
   const inversion=api.compoundModel(root,api.compounds[0]);assert.equal(inversion.midis[0]%12,(root+6)%12);assert.deepEqual(pcs(inversion.midis),pcs([2,6,9,12].map(n=>n+root)));
   const hybrid=api.compoundModel(root,api.compounds[1]);assert.equal(hybrid.midis[0]%12,(root+2)%12);assert.deepEqual(pcs(hybrid.midis),pcs([0,2,4,7].map(n=>n+root)));
   const poly=api.compoundModel(root,api.compounds[2]);assert.deepEqual(pcs(poly.midis),pcs([0,2,4,6,7,9,11].map(n=>n+root)));
 }
});
test('the mirror is an involution in all keys and its named results match the reflected pitches',()=>{
 const {c}=runtime(),a=c.TheoryVisuals;
 for(let root=0;root<12;root++){
   for(let p=0;p<12;p++)assert.equal(a.mirrorPitch(a.mirrorPitch(p,root),root),p);
   assert.deepEqual(pcs(a.mirrorModel(root,'triad')[0].reflected),pcs([0,3,7].map(n=>n+root)));
   assert.deepEqual(pcs(a.mirrorModel(root,'dominant')[0].reflected),pcs([5,8,0,2].map(n=>n+root)));
   for(const kind of ['triad','dominant','cadence'])for(const model of a.mirrorModel(root,kind))assert.deepEqual(pcs(model.reflected),pcs(model.source.map(n=>a.mirrorPitch(n,root))));
 }
});
test('both legacy versions migrate every progress map and version 3 survives topic insertion',()=>{
 const {c}=runtime(),a=c.JazzLearning;
 for(const version of [1,2]){
   const index=version===1?0:1,key='n1-'+index;
   const saved={curriculumVersion:version,levelIndex:0,topicIndex:index,studiedTopics:{[key]:true},practiceChecks:{[key]:{hear:true}},studyDates:{[key]:123},quiz:{questionSnapshot:[{correctIndex:0}]}};
   const migrated=a.migrate(saved);assert.equal(migrated.topicId,'n1-1.1');assert.equal(migrated.studiedTopics['n1-1.1'],true);assert.equal(migrated.practiceChecks['n1-1.1'].hear,true);assert.equal(migrated.studyDates['n1-1.1'],123);assert.equal(migrated.quiz.questionSnapshot[0].correctIndex,0);
   assert.deepEqual(plain(a.migrate(migrated)),plain(migrated));
 }
 const saved=a.migrate({curriculumVersion:1,levelIndex:0,topicIndex:0,studiedTopics:{'n1-0':true}});
 c.levels[0].topics.unshift({id:'n1-new-example',title:'Extra'});const next=a.migrate(saved);assert.equal(next.topicIndex,2);assert.equal(next.studiedTopics['n1-1.1'],true);
});
test('routes filter questions with topics and applied construction tasks require every answer',()=>{
 const {c}=runtime(),a=c.JazzLearning;
 assert.equal(a.indices(c.levels[3],'essential').length,0);
 for(const route of ['essential','expanded','complete'])for(const l of c.levels){const visible=new Set(Array.from(a.indices(l,route),i=>l.topics[i].id));assert.ok(a.questions(l,route).every(q=>visible.has(q.studyTopicId)));}
 for(const [id,t]of Object.entries(a.tasks)){assert.equal(a.gradeTask(id,[]).correct,0);const scored=a.gradeTask(id,t.fields.map(f=>f[2]));assert.equal(scored.correct,scored.total);assert.ok(t.fields.every(f=>f[1].includes(f[2])));}
});
test('saved attempts retain their answer order and current attempts carry explanation and review target',()=>{
 const {c,storage}=runtime();const q={prompt:'Old question',options:['old right','old wrong'],correctIndex:0};
 storage.set('armonia-jazz-state-v1',JSON.stringify({curriculumVersion:2,levelIndex:0,topicIndex:1,quiz:{startedAt:1,levelSlug:'n1',questionSnapshot:[q],answers:[0],submitted:true}}));
 c.appAudit.loadState();assert.equal(c.appAudit.scoreQuiz().correct,1);assert.equal(c.appAudit.scoreQuiz().total,1);assert.deepEqual(plain(c.appAudit.getState().quiz.questionSnapshot[0]),q);
 const shuffled=c.appAudit.shuffledQuestions(c.levels[3].quiz);assert.ok(shuffled.every(q=>q.explanation&&q.studyTopicId));
});
test('the moving line keeps its octave and explicit So What voicings retain their stacked fourths',()=>{
 const {c}=runtime();const source=fs.readFileSync(__dirname+'/instrument-lab.js','utf8').replace('global.ChordLab={','global.auditFormula=formulaSpec;global.ChordLab={');vm.runInContext(source,c);
 const get=title=>c.levels.flatMap(l=>l.topics).find(t=>t.title===title);
 const items=t=>JSON.parse(t.html.match(/data-progression='([^']+)'/s)[1]);
 const line=items(get('3.8 Clichés de línea (line clichés)')).map(item=>Math.max(...c.ChordLab.notationNotes(item.rootPc,c.auditFormula(item)).map(n=>n.midi)));
 assert.deepEqual(Array.from(line),[72,71,70,69]);
 const audioLine=items(get('3.8 Clichés de línea (line clichés)')).map(item=>Math.max(...c.ChordLab.progressionNotes(item,0).map(n=>n.midi)));
 assert.deepEqual(Array.from(audioLine),[72,71,70,69]);
 const chords=items(get('4.7 Armonía modal compositiva (acordes estáticos, color por escala)'));
 for(const item of chords){const notes=c.ChordLab.notationNotes(item.rootPc,c.auditFormula(item)).map(n=>n.midi);assert.deepEqual(Array.from(notes.slice(1),(n,i)=>n-notes[i]),[5,5,5,4]);}
});
