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
