const {test}=require('node:test'),assert=require('node:assert/strict'),L=require('../js/shared-library.js'),R=require('../js/melody-references.js');
test('the shared library follows the sole view or the preferred enabled view',()=>{
 assert.equal(L.collectionForViews({score:true,photo:false,chart:false},'analysis'),'melodies');
 assert.equal(L.collectionForViews({score:false,photo:true,chart:false}),'photos');
 assert.equal(L.collectionForViews({score:false,photo:false,chart:true}),'analysis');
 assert.equal(L.collectionForViews({score:true,photo:true,chart:true},'photos'),'photos');
 assert.equal(L.collectionForViews({score:false,photo:false,chart:false},'analysis'),'analysis');
});
test('photo-to-melody lookup keeps versions but excludes ambiguous same-title works',()=>{
 const ref={id:'rain',title:'Rain',pages:[{image:'Melodías/referencias/rain.png'}]},lib=[{id:'reviewed',title:'Rain',composer:'A',sourceImage:ref.pages[0].image},{id:'other-composition',title:'Rain',composer:'B'}];
 assert.deepEqual(L.melodiesForReference(lib,ref,R.createIndex([ref],lib)).map(e=>e.id),['reviewed']);
 const versions=[{id:'a',title:'A Child Is Born',composer:'Thad Jones'},{id:'b',title:'Child Is Born',composer:'Thad Jones'}],photo={id:'child',title:'A Child Is Born',pages:[{image:'Melodías/referencias/child.png'}]};
 assert.deepEqual(L.melodiesForReference(versions,photo,R.createIndex([photo],versions)).map(e=>e.id),['a','b']);
 assert.deepEqual(L.melodiesForReference(versions,ref,R.createIndex([ref],versions)),[]);
});
test('analysis cards retain every version and the original open/delete identity',()=>{
 const library=[{filename:'Autumn.json',title:'Autumn Leaves',composer:'Kosma',source:'static',deletable:false},{filename:'Autumn-private.json',title:'Autumn Leaves',composer:'Kosma',source:'local',hasStaticBase:true},{filename:'My study.json',title:'My study',source:'local'}];
 const standards=[{filename:'autumn.xml',curatedFilename:'autumn-curated.json',title:'Autumn Leaves',curated:true},{id:'blues-simple',title:'Blues simple',kind:'blues'}];
 const rows=L.analysisEntries(library,standards,'Autumn-private.json','autumn-curated.json');
 assert.equal(rows.length,5);
 assert.equal(new Set(rows.map(row=>row.id)).size,5);
 assert.equal(rows.filter(row=>row.title==='Autumn Leaves').length,3);
 assert.equal(rows.find(row=>row.filename==='Autumn.json').canDelete,false);
 const copy=rows.find(row=>row.filename==='Autumn-private.json');
 assert.equal(copy.canDelete,true);assert.equal(copy.hasStaticBase,true);assert.equal(copy.current,true);assert.equal(copy.analysisKind,'library');
 const curated=rows.find(row=>row.curatedFilename==='autumn-curated.json');
 assert.equal(curated.current,true);assert.equal(curated.analysisKind,'standard');assert.equal(curated.canDelete,false);
 assert.equal(rows.find(row=>row.id==='standard:blues-simple').kind,'blues');
});
test('photo composers come only from explicit or unambiguous work matches',()=>{
 const references=[{id:'matched',pages:[{image:'matched.jpg'}]},{id:'unknown',pages:[{image:'unknown.jpg'}]},{id:'ambiguous',pages:[{image:'ambiguous.jpg'}]},{id:'explicit',composer:'Original author',pages:[]}];
 const catalog=[{composer:'Author',sourceImage:'matched.jpg'},{composer:'Other author',title:'Ambiguous'},{composer:'Unrelated author',title:'Other'}];
 const resolve=entry=>entry.title==='Ambiguous'?{ambiguous:true,references:[references[2]]}:{ambiguous:false,references:[]};
 const rows=L.photoEntries(references,catalog,resolve);
 assert.equal(rows[0].composer,'Author');assert.equal(rows[1].composer,'');assert.equal(rows[2].composer,'');assert.equal(rows[3].composer,'Original author');
 assert.equal(references[0].composer,undefined);
});
