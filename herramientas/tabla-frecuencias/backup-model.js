(function(root){
'use strict';
const STATS=['crescendo-ear-noise-stats-v2','crescendo-ear-tone-stats-v2','crescendo-ear-direction-stats-v3'];
const HISTORY=['crescendo-ear-noise-history-v3','crescendo-ear-tone-history-v3','crescendo-ear-direction-history-v3'];
const SESSIONS='crescendo-ear-practice-sessions-v4',PROCESSING='crescendo-processing-practice-v1';
const KEYS=[...STATS,...HISTORY,SESSIONS,PROCESSING];
const PREVIOUS='crescendo-frequency-practice-previous-v1',DRAFT='crescendo-frequency-practice-draft-v1';
const BANDS=[20,25,31.5,40,50,63,80,100,125,160,200,250,315,400,500,630,800,1000,1250,1600,2000,2500,3150,4000,5000,6300,8000,10000,12500,16000,20000];
const OCTAVES=[63,125,250,500,1000,2000,4000,8000,16000];
const EXERCISES=['eq','q','filter','attack','release','deess','masking','limit'];
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const count=v=>Number.isSafeInteger(v)&&v>=0&&v<=1e7;
function fail(){throw Error('El archivo no contiene un respaldo válido de práctica complementaria.');}
function tally(row,right='correct',total='total'){
 if(!object(row)||!count(row[total])||!count(row[right])||row[right]>row[total])fail();
 return {[total]:row[total],[right]:row[right]};
}
function session(s,dated=false){
 if(!object(s)||!count(s.rounds)||!count(s.correct)||s.correct>s.rounds||!Number.isFinite(s.duration)||s.duration<0||s.duration>1e8||!object(s.byModule))fail();
 const byModule={};
 for(const [k,v] of Object.entries(s.byModule)){
  if(!['noise','direction','tone',...EXERCISES.map(x=>'processing-'+x)].includes(k))fail();
  byModule[k]=tally(v);
 }
 if(Object.values(byModule).reduce((a,v)=>a+v.total,0)!==s.rounds||Object.values(byModule).reduce((a,v)=>a+v.correct,0)!==s.correct)fail();
 const out={rounds:s.rounds,correct:s.correct,duration:s.duration,byModule,goal:[10,20,30,50].includes(s.goal)?s.goal:20};
 if(dated){if(typeof s.date!=='string'||!Number.isFinite(Date.parse(s.date))||![10,20,30,50].includes(s.goal))fail();Object.assign(out,{date:s.date,goal:s.goal});}
 return out;
}
function progress(raw){
 if(!object(raw)||(raw.app!==undefined&&raw.app!=='crescendo-frequency-practice')||(raw.version!==undefined&&raw.version!==1)||!object(raw.saved)||typeof raw.date!=='string'||!Number.isFinite(Date.parse(raw.date))||!KEYS.every(k=>Object.hasOwn(raw.saved,k)))fail();
 const saved={};
 STATS.forEach((key,i)=>{
  const rows=raw.saved[key]??{};if(!object(rows))fail();const clean={};
  for(const [f,row] of Object.entries(rows)){
   if(!(i===1?BANDS:OCTAVES).includes(Number(f)))fail();
   if(i===2)clean[f]={...tally(row,'boostCorrect','boostTotal'),...tally(row,'cutCorrect','cutTotal')};
   else{const r=tally(row);if(!Array.isArray(row.recent)||row.recent.length>8||row.recent.some(v=>v!==0&&v!==1)||row.recent.length>r.total)fail();clean[f]={...r,recent:row.recent.slice()};}
  }
  saved[key]=clean;
 });
 HISTORY.forEach((key,i)=>{
  const rows=raw.saved[key]??[];if(!Array.isArray(rows)||rows.length>24)fail();
  saved[key]=rows.map(r=>{if(!object(r)||typeof r.ok!=='boolean'||!(i===1?BANDS:OCTAVES).includes(r.freq)||(i!==1&&!['boost','cut'].includes(r.dir)))fail();return {ok:r.ok,freq:r.freq,...(i===1?{}:{dir:r.dir})};});
 });
 const rows=raw.saved[SESSIONS]??[];if(!Array.isArray(rows)||rows.length>30)fail();saved[SESSIONS]=rows.map(s=>session(s,true));
 const processing=raw.saved[PROCESSING]??{};if(!object(processing))fail();saved[PROCESSING]={};
 for(const [key,row] of Object.entries(processing)){if(!EXERCISES.some(x=>['easy','medium','hard'].some(d=>key===x+':'+d)))fail();saved[PROCESSING][key]=tally(row,'right');}
 return {app:'crescendo-frequency-practice',version:1,date:raw.date,currentSession:session(raw.currentSession),saved};
}
function capture(storage,currentSession){
 const saved={};for(const k of KEYS)saved[k]=JSON.parse(storage.getItem(k)||'null');
 return progress({app:'crescendo-frequency-practice',version:1,date:new Date().toISOString(),currentSession,saved});
}
function replace(storage,raw,previous){
 const next=progress(raw),before=progress(previous),updates={[PREVIOUS]:JSON.stringify(before),...Object.fromEntries(KEYS.map(k=>[k,JSON.stringify(next.saved[k])])),[DRAFT]:JSON.stringify(next.currentSession)};
 const old=Object.fromEntries(Object.keys(updates).map(k=>[k,storage.getItem(k)]));
 try{for(const [k,v] of Object.entries(updates))storage.setItem(k,v);}
 catch(error){for(const [k,v] of Object.entries(old)){try{v===null?storage.removeItem(k):storage.setItem(k,v);}catch(_){}}throw Error('No se pudo guardar el respaldo. No se aplicó la importación; libera espacio o descarga tu progreso actual.');}
 return next;
}
function map(raw){
 if(!object(raw)||raw.version!==1||(raw.app!==undefined&&raw.app!=='crescendo-mix-map')||raw.family!=='custom'||raw.basis!=='custom'||typeof raw.title!=='string'||!raw.title.trim()||raw.title.length>60||!Array.isArray(raw.tracks)||raw.tracks.length<1||raw.tracks.length>20)throw Error('El archivo no contiene un mapa de mezcla válido.');
 const tracks=raw.tracks.map(t=>{
  if(!object(t)||typeof t.name!=='string'||!t.name.trim()||t.name.length>40||!/^#[0-9a-f]{6}$/i.test(t.color)||!['pan','register','width','depth','level'].every(k=>Number.isFinite(t[k])&&t[k]>=(k==='pan'?-100:0)&&t[k]<=100))throw Error('El mapa contiene una pista fuera de los límites.');
  return Object.fromEntries(['name','color','pan','register','width','depth','level'].map(k=>[k,t[k]]));
 });
 return {title:raw.title.trim(),tracks,family:'custom',basis:'custom',sources:[],note:'Tu mapa personalizado. Ajusta el arreglo y guarda para conservar los cambios.'};
}
const api={progress,capture,replace,map,session,KEYS,PREVIOUS,DRAFT};if(typeof module==='object')module.exports=api;else root.FrequencyBackup=api;
})(typeof window==='object'?window:globalThis);
