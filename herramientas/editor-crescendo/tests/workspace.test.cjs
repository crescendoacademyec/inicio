const {test}=require('node:test'),assert=require('node:assert/strict'),W=require('../src/score-editor-workspace.js'),P=require('../src/score-editor-project-settings.js'),I=require('../src/score-editor-instruments.js');
test('metronome drafts and project library are isolated from Crescendo, with shared appearance settings',()=>{
 for(const key of ['jml-score-exercise-library-v1','jml-score-canvas-autosave-v1','crescendo-editor-instrument']){assert.equal(W.storageKey(key,false),key);assert.notEqual(W.storageKey(key,true),key);}
 assert.equal(W.storageKey('jml-score-appearance-v1',true),'jml-score-appearance-v1');
});
test('single-instrument workspace retains piano grand staff and rejects orchestral projects without removing notes',()=>{
 const data={systems:[{id:'g',partId:'p1',instrumentId:'piano',measures:[{notes:[60]}]},{id:'f',partId:'p1',instrumentId:'piano',measures:[{notes:[48]}]}]},before=JSON.stringify(data);W.assertSingle(data);assert.equal(JSON.stringify(data),before);
 const ensemble={systems:[...data.systems,{partId:'p2',instrumentId:'violin'}]},original=JSON.stringify(ensemble);assert.throws(()=>W.assertSingle(ensemble),/varios instrumentos/);assert.equal(JSON.stringify(ensemble),original);
 W.assertSingle({systems:[{instrumentId:'piano'},{instrumentId:'piano'}]});
});
test('project creation in the metronome accepts one instrument and refuses two before mutation',()=>{
 const parseKey=()=>({tonic:'C'}),input={title:'Solo',key:'C',instruments:[{instrumentId:'piano'}]};assert.equal(P.validate(input,{instruments:I.instruments,parseKey,maxParts:1}).instruments.length,1);
 assert.throws(()=>P.validate({...input,instruments:[...input.instruments,{instrumentId:'violin'}]},{instruments:I.instruments,parseKey,maxParts:1}),/solo instrumento/);
});
test('melody search matches title and composer together, ignores case and accents and leaves the catalog intact',()=>{
 const rows=[{title:'Alma con alma',composer:'Juan García'},{title:'502 Blues',composer:'Wayne Shorter'},{title:'All of Me',composer:'Gerald Marks'}],before=JSON.stringify(rows);assert.deepEqual(W.search(rows,'ALMA garcia'),[rows[0]]);assert.deepEqual(W.search(rows,'shorter 502'),[rows[1]]);assert.deepEqual(W.search(rows,'nothing'),[]);assert.equal(W.search(rows,'').length,3);assert.equal(JSON.stringify(rows),before);
});
test('library assets stay inside the same official Melodías folder, including deployments under /inicio/',()=>{
 const base='https://example.org/inicio/herramientas/aac/';assert.equal(W.assetUrl('Melodías/partituras/502-blues.musicxml',base).href,new URL('Melodías/partituras/502-blues.musicxml',base).href);
 for(const path of ['https://elsewhere.org/Melodías/a.xml','../secret.xml','Melodías/../library/a.xml','Melodías/%2e%2e/library/a.xml','Melodías/a.xml?token=x','Melodías/a.html'])assert.throws(()=>W.assetUrl(path,base),/Ruta/);
});

test('changing the metronome instrument updates both piano staves as one undoable part',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync(require.resolve('../src/app.js'),'utf8'),start=source.indexOf('  function changeScoreInstrument('),end=source.indexOf('  function moveScoreInstrument(',start),calls=[],systems=[{id:'g',partId:'p1',instrumentId:'piano',name:'Piano',measures:[]},{id:'f',partId:'p1',instrumentId:'piano',name:'Piano',measures:[]}];
 const c={window:{JMLScoreWorkspace:{singleInstrument:true}},saveHistory:()=>calls.push('undo'),scoreSystems:()=>systems,createSystemId:()=>String(calls.push('id')),state:{systems,marks:[],midiPlayback:{}},stopMidiPlayback(){},arrangementSourceItems:()=>[],systemInstrumentProfile:s=>I.instruments[s.instrumentId],InstrumentSounds:I,transposedInstrumentKey:key=>key,withSystemContext:(index,fn)=>fn(),setActiveSystemIndex(){},invalidateLayoutCache(){},render:()=>calls.push('render')};vm.createContext(c);vm.runInContext(source.slice(start,end),c);c.changeScoreInstrument(0,{instrumentId:'violin'});assert.deepEqual(systems.map(s=>s.instrumentId),['violin','violin']);assert.equal(systems[0].partId,systems[1].partId);assert.equal(calls.filter(c=>c==='undo').length,1);assert.equal(calls.filter(c=>c==='render').length,1);W.assertSingle({systems});
});

test('embedded exports initiate their download in the parent document with an isolated object URL',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),calls=[],anchor={click:()=>calls.push('download'),remove:()=>calls.push('remove')},parent={location:{origin:'https://example.org'},URL:{createObjectURL:blob=>{calls.push(blob);return 'blob:score';},revokeObjectURL:url=>calls.push(url)},document:{createElement:tag=>{assert.equal(tag,'a');return anchor;},body:{append:node=>assert.equal(node,anchor)}}},window={location:{origin:'https://example.org',search:'?workspace=metronome'},parent,setTimeout:fn=>fn()};const c={window,URL,URLSearchParams};vm.createContext(c);vm.runInContext(fs.readFileSync(require.resolve('../src/score-editor-workspace.js'),'utf8'),c);const blob={data:'midi'};window.JMLScoreWorkspace.download(blob,'Solo.mid');assert.equal(anchor.download,'Solo.mid');assert.equal(anchor.href,'blob:score');assert.deepEqual(calls,[blob,'download','remove','blob:score']);
});
