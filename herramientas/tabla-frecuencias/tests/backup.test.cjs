const {test}=require('node:test'),assert=require('node:assert/strict'),B=require('../backup-model.js');
function store(){const values=new Map();return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}
const empty=()=>({rounds:0,correct:0,duration:0,goal:20,byModule:{noise:{total:0,correct:0},direction:{total:0,correct:0},tone:{total:0,correct:0}}});
function populated(){const s=store();s.setItem(B.KEYS[0],JSON.stringify({'1000':{total:2,correct:1,recent:[1,0]}}));return B.capture(s,{rounds:1,correct:1,duration:4,goal:30,byModule:{noise:{total:1,correct:1}}});}
test('complementary practice round trips and keeps the previous snapshot and active session recoverable',()=>{
 const source=populated(),target=store(),before=B.capture(target,empty());target.setItem('crescendo-listening-v1','independent');B.replace(target,JSON.parse(JSON.stringify(source)),before);
 const roundtrip=B.capture(target,JSON.parse(target.getItem(B.DRAFT)));assert.deepEqual({...roundtrip,date:source.date},source);assert.deepEqual(JSON.parse(target.getItem(B.PREVIOUS)),before);assert.equal(target.getItem('crescendo-listening-v1'),'independent');
 B.replace(target,JSON.parse(target.getItem(B.PREVIOUS)),source);assert.deepEqual(B.capture(target,JSON.parse(target.getItem(B.DRAFT))).saved,before.saved);
 const legacy={...source};delete legacy.app;delete legacy.version;assert.deepEqual(B.progress(legacy),source);
});
test('foreign backups, invalid numbers and inconsistent session totals cannot mutate storage',()=>{
 const s=store(),before=B.capture(s,empty()),valid=populated();
 const bads=[{version:1,stats:{},sessions:[]},{...valid,app:'other'},{...valid,version:2},{...valid,currentSession:{...valid.currentSession,correct:2}}];
 const invalid=structuredClone(valid);invalid.saved[B.KEYS[0]]['1000'].correct=3;bads.push(invalid);
 const wrongBand=structuredClone(valid);wrongBand.saved[B.KEYS[0]]={'99':{total:1,correct:1,recent:[1]}};bads.push(wrongBand);
 for(const bad of bads){assert.throws(()=>B.replace(s,bad,before));assert.equal(s.values.size,0);}
});
test('a failed storage write rolls back all changed keys',()=>{
 const s=store(),before=B.capture(s,empty()),set=s.setItem;let writes=0;s.setItem=(k,v)=>{if(++writes===3)throw Error('quota');return set(k,v)};
 assert.throws(()=>B.replace(s,populated(),before),/No se pudo/);assert.equal(s.values.size,0);
});
const map=()=>({version:1,app:'crescendo-mix-map',title:'Mi mezcla',family:'custom',basis:'custom',tracks:[{name:'Voz',color:'#aabbcc',pan:-30,register:50,width:20,depth:30,level:70}]});
test('map imports retain coordinates, accept old exports, and discard unrelated metadata',()=>{
 const raw=map(),clean=B.map(raw);assert.deepEqual(clean.tracks,raw.tracks);assert.equal(clean.title,raw.title);
 delete raw.app;assert.deepEqual(B.map(raw),clean);assert.deepEqual(B.map({...raw,sources:['untrusted'],note:'untrusted'}),clean);
});
test('map imports reject foreign formats, invalid tracks and empty titles',()=>{
 for(const bad of [{...map(),app:'other'},{...map(),title:''},{...map(),tracks:[]},{...map(),tracks:[{...map().tracks[0],pan:101}]},{...map(),tracks:[{...map().tracks[0],color:'url(x)'}]},populated()])assert.throws(()=>B.map(bad));
});
