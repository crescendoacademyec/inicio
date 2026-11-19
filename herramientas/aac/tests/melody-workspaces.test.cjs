const {test}=require('node:test'),assert=require('node:assert/strict');
const {keyFor,matches,createStore}=require('../js/melody-workspaces.js');
const melody=(id,title,xml='<score-partwise/>')=>({id,title,xml,originalXml:xml,linked:true});
const state=(m,chord)=>({document:{title:m.title,melody:m,pages:[{measures:[{slots:[{chord}]}]}]}});
test('workspace identity uses both the song and the source edition',()=>{
 const a=melody('all-of-me','All of Me'),b=melody('c-jam-blues','C-Jam Blues');
 assert.notEqual(keyFor(a),keyFor(b));assert.notEqual(keyFor(a),keyFor({...a,originalXml:'another edition'}));
 assert.equal(matches({...state(a),document:{...state(a).document,title:'ALL OF ME'}},a),true);
 assert.equal(matches({...state(a),document:{...state(a).document,title:'BIRD BLUES'}},a),false);
 assert.equal(matches(state({...a,linked:false,transpose:7}),a),true);
});
test('switching songs retains independent changes and returns isolated copies',async()=>{
 const store=createStore(null),a=melody('all-of-me','All of Me'),b=melody('c-jam-blues','C-Jam Blues');
 const draft=state(a,'Db7');draft.document.melody.studyBreaks=[0,3,6];await store.save(draft);await store.save(state(b,'C7'));
 const restored=await store.load(a);assert.equal(restored.document.pages[0].measures[0].slots[0].chord,'Db7');assert.deepEqual(restored.document.melody.studyBreaks,[0,3,6]);
 restored.document.pages[0].measures[0].slots[0].chord='F7';assert.equal((await store.load(a)).document.pages[0].measures[0].slots[0].chord,'Db7');
 assert.equal((await store.load(b)).document.pages[0].measures[0].slots[0].chord,'C7');assert.equal(await store.load({...a,originalXml:'other edition'}),null);
});
test('an unrelated chart is never stored as the selected melody draft',async()=>{
 const store=createStore(null),a=melody('all-of-me','All of Me'),draft=state(a,'Fmaj7');draft.document.title='Bird Blues';
 assert.equal(await store.save(draft),false);assert.equal(await store.load(a),null);
});
test('official library paths replace pilot references without losing saved edits',()=>{
 const {withEditionMetadata}=require('../js/melody-workspaces.js'),m={...melody('c-jam-blues','C-Jam Blues'),sourceImage:'private-pilot/c-jam-blues/source.png',xml:'edited score',tempo:90,studyBreaks:[0,3]};
 const draft=state(m,'C9'),updated=withEditionMetadata(draft,{...m,sourceImage:'Melodías/referencias/c-jam-blues.png',sourceFile:'Melodías/c-jam-blues.musicxml'});
 assert.equal(updated.document.melody.sourceImage,'Melodías/referencias/c-jam-blues.png');assert.equal(updated.document.melody.xml,'edited score');assert.equal(updated.document.melody.tempo,90);assert.deepEqual(updated.document.melody.studyBreaks,[0,3]);assert.equal(updated.document.pages[0].measures[0].slots[0].chord,'C9');assert.equal(draft.document.melody.sourceImage,'private-pilot/c-jam-blues/source.png');assert.throws(()=>withEditionMetadata(draft,melody('other','Other')),/no corresponde/);
});
