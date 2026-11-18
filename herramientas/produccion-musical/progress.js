(function(root){
'use strict';
const app='crescendo-production',key='crescendo-production-v1';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const rubricLevels=['unreviewed','help','supported','independent'];
function create(C){
 const lessons=C.modules.flatMap(m=>m.lessons),ids=new Set(lessons.map(l=>l.id));
 const labs=['senal','eq','compresion','espacio','fase','edicion','secuenciador','calculos','entrega'];
 const empty=()=>({app,version:2,studied:{},answers:{},notes:{},labNotes:{},projects:{},assessments:{},taskAnswers:{},starterEvidence:{},labTasks:{},learningRoute:'guided',supportMode:'accompanied',current:lessons[0].id});
 function sanitize(raw){
  const legacy=raw?.version===1&&raw.app===undefined;
  if(!object(raw)||(!legacy&&(raw.version!==2||raw.app!==app))||!ids.has(raw.current)||
   !['studied','answers','notes','labNotes','projects','assessments'].every(k=>object(raw[k])))
   throw Error('Esta no es una copia del curso de Producción Musical. El progreso auditivo se importa en Práctica auditiva.');
  const out=empty();out.current=raw.current;out.learningRoute=legacy?'full':raw.learningRoute==='full'?'full':'guided';
  out.supportMode=raw.supportMode==='independent'?'independent':'accompanied';
  for(const l of lessons){
   if(typeof raw.notes[l.id]==='string')out.notes[l.id]=raw.notes[l.id].slice(0,10000);
   if(raw.studied[l.id]===true)out.studied[l.id]=true;
   if(typeof raw.answers[l.id]==='boolean')out.answers[l.id]=raw.answers[l.id];
   if(typeof raw.starterEvidence?.[l.id]==='string')out.starterEvidence[l.id]=raw.starterEvidence[l.id].slice(0,3000);
   const task=raw.taskAnswers?.[l.id];
   if(object(task))out.taskAnswers[l.id]={values:object(task.values)?Object.fromEntries(Object.entries(task.values).filter(([k,v])=>/^\w{1,30}$/.test(k)&&typeof v==='string').map(([k,v])=>[k,v.slice(0,200)])): {},checked:task.checked===true};
  }
  for(const lab of labs){
   if(typeof raw.labNotes[lab]==='string')out.labNotes[lab]=raw.labNotes[lab].slice(0,10000);
   if(raw.labTasks?.[lab]===true)out.labTasks[lab]=true;
  }
  for(const m of C.modules){
   const p=raw.projects[m.id];
   if(object(p))out.projects[m.id]={notes:typeof p.notes==='string'?p.notes.slice(0,10000):'',checks:m.project.rubric.map((_,i)=>p.checks?.[i]===true),levels:m.project.rubric.map((_,i)=>rubricLevels.includes(p.levels?.[i])?p.levels[i]:'unreviewed')};
   const a=raw.assessments[m.id];
   if(object(a)&&Number.isInteger(a.score)&&a.score>=0&&a.score<=4)out.assessments[m.id]={score:a.score,total:4,date:typeof a.date==='string'?a.date.slice(0,40):'',kind:a.kind==='transfer-v1'?'transfer-v1':'legacy-reading'};
  }
  return out;
 }
 // Validate before any write; if either write fails, callers keep their current state.
 function replace(storage,raw,current){
  const incoming=sanitize(raw),previous=sanitize(current);
  storage.setItem(key+'-respaldo',JSON.stringify(previous));
  storage.setItem(key,JSON.stringify(incoming));
  return incoming;
 }
 function restore(storage,current){
  const raw=storage.getItem(key+'-respaldo');
  if(!raw)throw Error('Todavía no hay una copia anterior para recuperar.');
  return replace(storage,JSON.parse(raw),current);
 }
 return {empty,sanitize,replace,restore,key,rubricLevels};
}
const api={create,key};if(typeof module==='object'&&module.exports)module.exports=api;else root.ProductionProgress=api;
})(typeof window!=='undefined'?window:globalThis);
