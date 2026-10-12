const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
function catalog(files=['data.js','instrument-catalog.js','eq-guidance.js']){
 const context=vm.createContext({window:{}});
 for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
 return vm.runInContext('({instruments:INSTRUMENTS,sources:FREQUENCY_SOURCES,render:window.InstrumentEQGuidance.html})',context);
}
test('all 57 instruments have two distinct, referenced alternatives with explicit source scope',()=>{
 const {instruments,sources,render}=catalog();assert.equal(instruments.length,57);
 for(const i of instruments){
  assert.equal(i.eqReview.alternatives.length,2,i.id);
  assert.notEqual(i.eqReview.alternatives[0].title,i.eqReview.alternatives[1].title,i.id);
  assert.ok(i.eqReview.scope.length>20,i.id);
  for(const a of i.eqReview.alternatives)assert.ok(a.title&&a.body.length>60,i.id);
  for(const id of i.eqReview.sources)assert.equal(new URL(sources[id].url).protocol,'https:');
  const html=render(i);assert.ok(html.includes('Referencias y criterio'));assert.ok(!html.includes('undefined'));assert.ok(html.includes('no presets oficiales'));
 }
});
test('production embeds the same complete catalog and guidance in dependency order',()=>{
 const html=fs.readFileSync(path.join(root,'../produccion-musical/instrument-eq.html'),'utf8');
 const files=[...html.matchAll(/src="\.\.\/tabla-frecuencias\/(data|instrument-catalog|eq-guidance)\.js[^\"]*"/g)].map(m=>m[1]+'.js');
 assert.deepEqual(files,['data.js','instrument-catalog.js','eq-guidance.js']);
 const embedded=catalog(files),table=catalog();
 assert.equal(JSON.stringify(embedded.instruments),JSON.stringify(table.instruments));
});
test('review removes destructive universal cuts and merges duplicate advice',()=>{
 const {instruments}=catalog(),get=id=>instruments.find(i=>i.id===id);
 assert.ok(get('guit-ac').cuts.some(x=>x.r.includes('82.4 Hz')));
 assert.ok(get('overhead').boosts.length>0);
 assert.ok(get('toms').tip.includes('se cancelan'));
 assert.ok(get('kick').tip.includes('acústico'));
 assert.ok(get('bajo').tip.includes('depende de la nota'));
 for(const i of instruments){assert.equal(new Set(i.cuts.map(x=>x.f)).size,i.cuts.length,i.id);assert.equal(new Set(i.boosts.map(x=>x.f)).size,i.boosts.length,i.id);}
});
