const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const functional = read('herramientas/armonia-funcional/app.js');
const jazz = read('herramientas/armonia-jazz/app.js');
const theory = read('herramientas/teoria-lectura-musical/app.js');
assert.match(functional, /nextCourse.hidden=view!=="theory"/);
assert.match(functional, /atEndOfLearningRoute\(\)/);
assert.match(functional, /prepend\(actions\)/);
// Execute the navigation guard instead of looking for a removed source literal.
const vm=require('node:vm');
const views=[],nodes=new Map(),node=id=>nodes.get(id)||nodes.set(id,{classList:{add(){},remove(){views.push(id)}}}).get(id);
const ctx=vm.createContext({state:{quiz:{active:true,submitted:false}},document:{querySelector:()=>({hidden:false}),querySelectorAll:()=>[]},$:node,atEndOfLearningRoute:()=>false,renderQuiz(){},scrollPageTop(){}});
const begin=functional.indexOf('function showView(view)'),end=functional.indexOf('\nfunction ',begin+1);
vm.runInContext(functional.slice(begin,end)+'\nshowView("home");',ctx);
assert.equal(ctx.currentView,'quiz');assert.equal(views.at(-1),'quizView');
ctx.state.quiz.submitted=true;vm.runInContext('showView("theory")',ctx);
assert.equal(ctx.currentView,'theory');assert.equal(views.at(-1),'theoryView');
assert.match(jazz, /if \(!isOpen\) return/);
assert.match(jazz, /prevTopicBtn"\).disabled/);
assert.match(jazz, /nextTopicBtn"\).disabled/);
const resetStart=jazz.indexOf('document.getElementById("resetTopicsBtn").addEventListener'),resetEnd=jazz.indexOf('\n    });',resetStart);
const reset=jazz.slice(resetStart,resetEnd)+'\n    });';
const scoped={studiedTopics:{one:true,two:true},practiceChecks:{one:true,two:true},taskChecks:{one:true,two:true},studyDates:{one:1,two:2},curriculumEvidence:{'level-entry':true,'other-project':true}};
let resetAction;const resetCtx=vm.createContext({state:scoped,confirm:()=>true,currentLevel:()=>({slug:'level',topics:[{}]}),topicKey:()=> 'one',saveState(){},renderTheory(){},document:{getElementById:()=>({addEventListener:(_,fn)=>resetAction=fn})}});
vm.runInContext(reset,resetCtx);resetAction();
for(const field of ['studiedTopics','practiceChecks','taskChecks','studyDates']){assert.equal(scoped[field].one,undefined);assert.ok(scoped[field].two);}
assert.equal(scoped.curriculumEvidence['level-entry'],undefined);assert.equal(scoped.curriculumEvidence['other-project'],true);
assert.match(theory, /<div class="lesson-actions">/);
assert.doesNotMatch(theory, /prepend\(\$\("lessonContent"\).querySelector\(".lesson-actions"\)\)/);
assert.match(theory, /id="resetCourseBtn"/);
assert.ok(read('herramientas/armonia-jazz/instrument-lab.js').includes("querySelector('.lab-views').appendChild(host)"));
console.log('Navegación, reinicio acotado, visualizadores y enlace final verificados.');
const actionsCSS=read('shared/course-actions.css');
assert.match(actionsCSS,/position: fixed/);
assert.match(actionsCSS,/backdrop-filter: none/);
assert.match(actionsCSS,/safe-area-inset-bottom/);
assert.match(actionsCSS,/repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(actionsCSS,/@media print/);
for(const app of ['armonia-funcional','armonia-jazz','teoria-lectura-musical']){
  assert.ok(read('herramientas/'+app+'/index.html').includes('../../shared/course-actions.css'));
}
console.log('Barra fija compartida, espacio inferior y estilos móviles/impresión verificados.');
