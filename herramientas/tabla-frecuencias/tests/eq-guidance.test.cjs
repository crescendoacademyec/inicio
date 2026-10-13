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
test('all 58 instruments have distinct, referenced alternatives with explicit source scope',()=>{
 const {instruments,sources,render}=catalog();assert.equal(instruments.length,58);
 for(const i of instruments){
  assert.ok(i.eqReview.alternatives.length>=2,i.id);
  assert.equal(i.eqReview.alternatives.length,i.eqPresets.length,i.id);
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
test('all presets contain valid editable filters and produce distinct curves per instrument',()=>{
 const {response}=require('../eq-response.js');
 const {instruments}=catalog();
 const frequencies=Array.from({length:121},(_,i)=>20*1000**(i/120));
 for(const i of instruments){
  assert.ok(i.eqPresets.length>=2,i.id);
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
  for(let a=0;a<curves.length;a++)for(let b=a+1;b<curves.length;b++)assert.ok(Math.max(...curves[a].map((v,n)=>Math.abs(v-curves[b][n])))>.5,i.id+" "+a+"/"+b);
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

test('additional artist studies disclose their origin and keep a source on every proposal',()=>{
 const {instruments,sources,render}=catalog();
 assert.equal(instruments.reduce((n,i)=>n+i.eqPresets.length,0),144);
 const voice=instruments.find(i=>i.id==='voz');
 assert.equal(voice.eqPresets.length,9);
 for(const i of instruments)for(let index=2;index<i.eqPresets.length;index++){
  const p=i.eqPresets[index],a=i.eqReview.alternatives[index];
  assert.equal(p.title,a.title);assert.equal(p.source,a.source);assert.ok(sources[p.source]);
  assert.ok(p.attribution.includes('Crescendo'));assert.ok(render(i,index).includes('Consultar fuente'));
  assert.ok(render(i,index).includes('data-eq-preset="'+index+'"'));
 }
 const kick=instruments.find(i=>i.id==='kick').eqPresets.find(p=>p.title?.includes('Scheps'));
 assert.equal(kick.bands[0].slope,18);
 const html=render(voice,5);assert.ok(html.includes('no es un preset del autor'));assert.ok(html.includes('Finneas'));
});

test('selected proposal renders only its explanation while all compact selectors remain available',()=>{
 const {instruments,render}=catalog();const voice=instruments.find(i=>i.id==='voz');
 for(let index=0;index<voice.eqPresets.length;index++){
  const html=render(voice,index),aside=html.split('<aside')[1];
  assert.ok(aside);assert.ok(aside.includes(voice.eqReview.alternatives[index].body.replace(/&/g,'&amp;')));
  for(let other=0;other<voice.eqPresets.length;other++)if(other!==index)assert.ok(!aside.includes(voice.eqReview.alternatives[other].body));
  assert.equal((html.match(/data-eq-preset=/g)||[]).length,voice.eqPresets.length);
  assert.ok(!html.includes('Ver objetivos, ajustes y referencias'));
 }
});

test('group buses have their own editable EQ and documented routing without fictitious registers',()=>{
 const c=vm.createContext({window:{}});
 for(const f of ['data.js','instrument-catalog.js','eq-presets.js','eq-guidance.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
 const buses=vm.runInContext('MIX_BUSES',c);
 assert.equal(buses.length,7);
 for(const b of buses){assert.equal(b.cat,'bus');assert.equal(b.realRange,undefined);assert.equal(b.eqPresets.length,2);assert.ok(b.eqReview.sources.includes('busMix'));assert.ok(b.tip.length>70);assert.notDeepEqual(b.eqPresets[0].bands,b.eqPresets[1].bands);}
});
