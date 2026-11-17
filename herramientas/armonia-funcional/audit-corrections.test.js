const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = {
  console, window:{addEventListener(){}},
  document:{readyState:"loading",addEventListener(){},getElementById(){return null},querySelectorAll(){return []},documentElement:{}},
  location:{hash:'',pathname:'/'},history:{pushState(){},replaceState(){},state:null},
  localStorage:{getItem(){return null},setItem(){}}, alert(){},confirm(){return true},setTimeout(){}
};
vm.createContext(context);
for (const file of ['data.js','chords-ref.js','app.js']) vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),context);
vm.runInContext(fs.readFileSync(__dirname+'/../../shared/music-practice.js','utf8'),context);
context.CrescendoPractice=context.window.CrescendoPractice;
vm.runInContext(`globalThis.api={DATA,defaultState,normalizeStoredState,gradePianoSelection,gradeQuestion,closedAndDrop2,mountScaleExplorer,renderBridgeNotation,FUNCTIONAL_BRIDGE_FAMILIES,TOPIC_PRACTICE_BANK,availableQuiz,moduleTheory,setState(s){state=s}}`,context);
const api=context.api;
const state=api.defaultState(); api.setState(state);
const voicings=api.DATA.modules[3];
const question=source=>voicings.quiz.find(q=>q.sourceId===source);
assert.equal(api.gradePianoSelection(question(47),['A2','G4','C5']).points,1,'Valid octave redistribution must receive full credit');
assert.ok(api.gradePianoSelection(question(47),['E2','G4','C5']).points<1,'Wrong bass cannot receive full credit');
const reversed=api.gradePianoSelection(question(49),['A2','E4','G4','C#5']);
assert.ok(reversed.points<1); assert.match(reversed.feedback,/voz superior/);
assert.equal(api.gradePianoSelection(question(1),['D3']).points,1);
assert.ok(api.gradePianoSelection(question(1),['D4']).points<1);
const result=api.closedAndDrop2('C','maj9');
assert.deepEqual(Array.from(result.closed,n=>n.step),[64,67,71,74]);
assert.deepEqual(Array.from(result.skip,n=>n.step),[64,71,74,79]);
assert.deepEqual(Array.from(result.drop,n=>n.step),[59,64,67,74]);

// Exercise the mounted explorer, including the exact spelling sent to the score renderer.
const fields={};
for(const [selector,value] of [['[data-scale-root]','C'],['[data-scale-type]','major'],['[data-scale-practice]','scale']]) {
  fields[selector]={value,addEventListener(event,handler){this.change=handler}};
}
const host={innerHTML:'',querySelector(selector){if(selector.startsWith(".")) return null;return fields[selector] ||= {innerHTML:'',textContent:''}}};
api.mountScaleExplorer(host);
const decode=s=>s.replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
let cases=0;
for(const root of ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']) {
  for(const kind of ['scale','thirds','triads','sevenths']) {
    fields['[data-scale-root]'].value=root; fields['[data-scale-practice]'].value=kind;
    fields['[data-scale-root]'].change();
    const xml=decode(fields['[data-scale-staff]'].innerHTML);
    const pitches=[...xml.matchAll(/<step>([A-G])<\/step><alter>(-?\d+)<\/alter><octave>(\d+)<\/octave>/g)];
    assert.ok(pitches.length>=8,root+' '+kind);
    assert.ok(pitches.every(p=>Math.abs(Number(p[2]))<=2),root+' '+kind+' must never encode octave changes as alterations');
    if(root==='C'&&kind==='scale') assert.deepEqual(pitches.at(-1).slice(1),['C','0','5']);
    cases++;
  }
}
const staff={innerHTML:''};
api.renderBridgeNotation({querySelector(){return staff}},api.FUNCTIONAL_BRIDGE_FAMILIES.colors[1],'C');
assert.match(decode(staff.innerHTML),/<step>C<\/step><alter>-1<\/alter><octave>4<\/octave>/,'Tritone substitute must spell C-flat, not B');
// Every topic now has a local retrieval challenge, including all five new connection topics.
for(const module of api.DATA.modules) {
  for(const topic of module.theory) assert.ok(api.TOPIC_PRACTICE_BANK[topic.id]?.length,topic.id);
  assert.equal(new Set(module.quiz.map(q=>q.id)).size,module.quiz.length);
  state.moduleId=module.id;
  for(const q of module.quiz.filter(q=>q.id>=1000)) {
    assert.ok(q.answers.every(a=>q.options.includes(a)),q.prompt);
    state.quiz.answers={}; q.answers.forEach((a,i)=>state.quiz.answers['q'+q.id+'_'+i]=a);
    const scored=api.gradeQuestion(q); assert.equal(scored.points,1); assert.ok(scored.feedback.length>20); assert.equal(scored.studyTopic,q.studyTopic);
    state.quiz.answers={}; assert.equal(api.gradeQuestion(q).points,0);
  }
}
state.moduleId=api.DATA.modules[2].id;state.learningPath='essential';
assert.ok(!api.moduleTheory().some(t=>/onceavas|treceavas/.test(t.id)));
assert.ok(api.availableQuiz().every(q=>!/VII\.|VIII\./.test(q.section)));
const active=api.normalizeStoredState({learningPath:'essential',moduleId:state.moduleId,studied:{acordes:true},quiz:{active:true,attemptModuleId:state.moduleId,questionSnapshot:[{id:77,prompt:'Saved attempt'}]}});
assert.equal(active.quiz.questionSnapshot[0].id,77);assert.equal(active.studied.acordes,true);
console.log(`Audit regressions: ${cases} score spellings, distinct voicings, fair grading, applied questions and study paths OK.`);
