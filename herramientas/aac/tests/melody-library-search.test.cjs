const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createIndex,find}=require('../js/melody-library-search.js');
const catalog=[{id:'1',title:'Ábrázame',composer:'José Pérez'},{id:'2',title:'C-Jam Blues',composer:'Duke Ellington'},{id:'3',title:'Blues for Alice',composer:'Charlie Parker'},{id:'4',title:'Blues',composer:'Alice Coltrane'}];
test('search matches accents, punctuation and title/composer tokens',()=>{
 const index=createIndex(catalog);
 assert.deepEqual(find(index,'abrazame').results.map(r=>r.id),['1']);
 assert.deepEqual(find(index,'c jam').results.map(r=>r.id),['2']);
 assert.deepEqual(find(index,'jose perez').results.map(r=>r.id),['1']);
 assert.deepEqual(find(index,'ellington blues').results.map(r=>r.id),['2']);
 assert.equal(find(index,'unknown').total,0);
});
test('title matches rank ahead of composer matches without changing the catalog',()=>{
 const index=createIndex(catalog);assert.deepEqual(find(index,'blues').results.map(r=>r.id),['4','3','2']);
 assert.deepEqual(find(index,'alice').results.map(r=>r.id),['3','4']);
 assert.deepEqual(catalog.map(r=>r.id),['1','2','3','4']);
});
test('3000 entries keep result count and a bounded render list, including the last song',()=>{
 const index=createIndex(Array.from({length:3000},(_,i)=>({id:String(i),title:`Tema ${i}`,composer:'Autor'})));
 const all=find(index,'');assert.equal(all.total,3000);assert.equal(all.results.length,40);
 assert.equal(find(index,'tema 2999').results[0].id,'2999');
 assert.equal(find(index,'autor',5).results.length,5);
});
