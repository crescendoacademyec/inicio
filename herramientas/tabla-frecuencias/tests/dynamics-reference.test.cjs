const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const M=require('../dynamics-model.js'),D=require('../dynamics-presets.js');
const p={threshold:-18,ratio:4,attack:20,release:150,knee:0,makeup:0,wet:100};
test('static compressor follows ratio, soft knee is continuous and monotonic',()=>{
 assert.equal(M.reduction(-24,p),0);assert.equal(M.reduction(-6,p),9);assert.equal(M.transfer(-6,p),-15);
 for(const knee of [0,6,24]){
  const q={...p,knee};let previous=-Infinity;
  for(let x=-60;x<=12;x+=.02){const y=M.transfer(x,q);assert.ok(Number.isFinite(y)&&y>=previous-1e-8);assert.ok(y<=x+1e-8);previous=y;}
  if(knee){for(const boundary of [q.threshold-knee/2,q.threshold+knee/2])assert.ok(Math.abs(M.transfer(boundary-.00001,q)-M.transfer(boundary+.00001,q))<.0001);}
 }
});
test('unity ratio and dry mix preserve levels; parallel blend adds amplitudes',()=>{
 for(const x of [-60,-24,-6,0]){assert.equal(M.transfer(x,{...p,ratio:1}),x);assert.equal(M.transfer(x,{...p,wet:0,makeup:9}),x);}
 const y=M.transfer(-6,{...p,wet:50});assert.ok(y>-15&&y<-6);const expected=-6+20*Math.log10((1+10**(-9/20))/2);assert.ok(Math.abs(y-expected)<1e-10);
});
test('attack preserves initial transients and release controls recovery',()=>{
 const fast=M.simulate({...p,attack:1,release:20}),slow=M.simulate({...p,attack:50,release:400});
 assert.ok(slow[155].output>fast[155].output);
 assert.ok(slow[700].gr>fast[700].gr);
 assert.ok(Math.abs(fast[500].gr-M.reduction(-9,p))<1e-8);
 assert.ok(fast[155].gr>0); // attack is progressive, not a delay before compression
});
test('every proposal has provenance, valid controls and finite simulation',()=>{
 assert.equal(D.recipes.length,21);assert.equal(D.masters.length,5);
 for(const r of [...D.recipes,...D.masters]){
  assert.ok(r.body.length>80&&r.attribution.includes('Crescendo')&&D.sources[r.source]);assert.equal(new URL(D.sources[r.source][1]).protocol,'https:');
  assert.ok(r.settings.ratio>=1&&r.settings.ratio<=20&&r.settings.attack>=.02&&r.settings.release>=10);
  for(const peak of [-30,-9,0])for(const row of M.simulate(r.settings,peak))assert.ok(Number.isFinite(row.output)&&row.gr>=0);
 }
 assert.equal(D.masters.find(p=>p.id==='lazar').settings.ratio,1);
});
test('all 57 instruments resolve to a supported family, shared by the production embed',()=>{
 const base=path.join(__dirname,'..'),ctx=vm.createContext({});for(const f of ['data.js','instrument-catalog.js'])vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),ctx);
 const instruments=vm.runInContext('INSTRUMENTS',ctx);assert.equal(instruments.length,57);
 for(const i of instruments)assert.ok(D.recipes.filter(r=>r.groups.includes(D.group(i))).length>=2,i.id);
 const html=fs.readFileSync(path.join(base,'../produccion-musical/dynamics-reference.html'),'utf8');
 for(const f of ['dynamics-model','dynamics-presets','dynamics-reference'])assert.ok(html.includes('../tabla-frecuencias/'+f+'.js'));
 const ext=fs.readFileSync(path.join(base,'../produccion-musical/lesson-extensions.js'),'utf8');assert.ok(ext.includes("dynamicsFrame('compression')"));assert.ok(ext.includes("dynamicsFrame('mastering')"));
});
