const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
function catalog(files=['data.js','instrument-catalog.js','eq-presets.js','eq-guidance.js']){
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
 const files=[...html.matchAll(/src="\.\.\/tabla-frecuencias\/(data|instrument-catalog|eq-presets|eq-guidance)\.js[^\"]*"/g)].map(m=>m[1]+'.js');
 assert.deepEqual(files,['data.js','instrument-catalog.js','eq-presets.js','eq-guidance.js']);
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
test('all 114 presets contain valid editable filters and produce two distinct curves per instrument',()=>{
 const {response}=require('../eq-response.js');
 const {instruments}=catalog();
 const frequencies=Array.from({length:121},(_,i)=>20*1000**(i/120));
 for(const i of instruments){
  assert.equal(i.eqPresets.length,2,i.id);
  for(const preset of i.eqPresets){
   assert.ok(preset.bands.length>=2&&preset.bands.length<=12,i.id);
   for(const b of preset.bands){
    assert.ok(b.frequency>=20&&b.frequency<=20000,i.id);
    assert.ok(b.q>=.2&&b.q<=12&&Math.abs(b.gain)<=18&&b.enabled,i.id);
    assert.ok(['peaking','highpass','lowpass','lowshelf','highshelf'].includes(b.type),i.id);
    for(const f of frequencies)assert.ok(Number.isFinite(response(b,f)),i.id);
   }
  }
  const curves=i.eqPresets.map(p=>frequencies.map(f=>p.bands.reduce((sum,b)=>sum+response(b,f),0)));
  assert.ok(Math.max(...curves[0].map((v,n)=>Math.abs(v-curves[1][n])))>.5,i.id);
 }
});
test('loading and editing a preset does not mutate its stored proposal',()=>{
 const context=vm.createContext({window:{}});
 for(const f of ['data.js','instrument-catalog.js','eq-presets.js','eq-guidance.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context);
 const {instrument,api}=vm.runInContext('({instrument:INSTRUMENTS.find(i=>i.id==="guit-ac"),api:window.InstrumentEQGuidance})',context);
 const loaded=api.example(instrument,0),original=instrument.eqPresets[0].bands[0].frequency;
 loaded.bands[0].frequency=17000;
 assert.equal(api.example(instrument,0).bands[0].frequency,original);
 assert.ok(api.html(instrument,1).includes('data-eq-preset="1" data-eq-instrument="guit-ac" aria-pressed="true"'));
});
