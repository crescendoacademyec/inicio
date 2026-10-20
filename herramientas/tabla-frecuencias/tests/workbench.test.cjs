const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const W=require('../workbench-model.js'),R=require('../eq-response.js');
function section(a,f,sr=96000){const w=2*Math.PI*f/sr,p=i=>(a[i]+a[i+1]*Math.cos(w)+a[i+2]*Math.cos(2*w))**2+(a[i+1]*Math.sin(w)+a[i+2]*Math.sin(2*w))**2;return 10*Math.log10(p(0)/p(3));}
const band={type:'peaking',frequency:1000,gain:6,q:1,slope:12,enabled:true};
test('audible Butterworth sections match the plotted response for every supported slope',()=>{
 for(const type of ['lowpass','highpass'])for(const slope of [6,12,18,24,36,48])for(const frequency of [100,1000,12000]){
  const b={...band,type,slope,frequency},sections=W.stages(b);assert.equal(sections.length,Math.ceil(slope/12));
  for(const f of [20,100,500,1000,6000,18000,20000]){const expected=R.response(b,f),actual=sections.reduce((sum,a)=>sum+section(a,f),0);assert.ok(Number.isFinite(actual));if(expected>-80)assert.ok(Math.abs(expected-actual)<.003,`${type} ${slope} ${frequency}/${f}: ${actual} vs ${expected}`);else assert.ok(actual<-70);}
 }
});
test('bell, notch and shelf filters use exactly the plotted coefficients and remain stable at their limits',()=>{
 for(const type of ['peaking','notch','lowshelf','highshelf'])for(const frequency of [20,1000,20000])for(const gain of [-18,18])for(const q of [.2,12]){
  const b={...band,type,frequency,gain,q},[a]=W.stages(b);assert.deepEqual(a,R.coefficients(b));
  const a1=a[4]/a[3],a2=a[5]/a[3];assert.ok(Math.abs(a2)<1);assert.ok(1+a1+a2>0);assert.ok(1-a1+a2>0);
 }
 assert.deepEqual(W.stages({...band,enabled:false}),[]);
});
test('RMS comparison preserves stereo proportions and reserves shared sample headroom',()=>{
 const packs=[[new Float32Array([.4,-.4]),new Float32Array([.2,-.2])],[new Float32Array([.8,-.8]),new Float32Array([.4,-.4])],[new Float32Array([2,-2]),new Float32Array([1,-1])]],before=JSON.stringify(packs),g=W.comparisonGains(packs,true);
 assert.ok(Math.abs(W.metrics(packs[0]).rms*g[0]-W.metrics(packs[1]).rms*g[1])<1e-8);
 packs.forEach((p,i)=>assert.ok(W.metrics(p).peak*g[i]<=.950001));assert.equal(JSON.stringify(packs),before);
 assert.ok(W.comparisonGains([[new Float32Array(2)],[new Float32Array(2)],[new Float32Array(2)]]).every(Number.isFinite));
 const raw=W.comparisonGains(packs,false);assert.ok(Math.abs(raw[0]-raw[1])<1e-12);
});
test('frequency, note and harmonic positions retain musical relationships inside a zoomed interval',()=>{
 assert.equal(W.note(440).name,'La4');assert.equal(W.note(440).cents,0);assert.equal(W.note(261.625565).name,'Do4');assert.equal(W.note(880).midi-W.note(440).midi,12);assert.equal(W.note(0),null);
 const view=W.viewport(100,1000);for(const f of [100,150,440,1000])assert.ok(Math.abs(W.frequencyAt(W.position(f,view),view)-f)<1e-8);
 assert.throws(()=>W.viewport(1000,100));assert.throws(()=>W.viewport(NaN,1000));
 assert.equal(W.harmonics(440).length,16);assert.equal(W.harmonics(440)[1].frequency,880);assert.equal(W.harmonics(2000).length,10);
});
test('shared EQ files round trip and reject invalid or oversized bands without trusting extra properties',()=>{
 const p={version:1,name:'Voz de prueba',instrument:'Voz',notes:'Comprobar en contexto',bands:[band]};assert.deepEqual(W.validatePreset(JSON.parse(JSON.stringify(p))),p);
 for(const invalid of [{...p,version:2},{...p,bands:Array(13).fill(band)},{...p,bands:[{...band,frequency:0}]},{...p,bands:[{...band,gain:NaN}]},{...p,name:'x'.repeat(81)}])assert.throws(()=>W.validatePreset(invalid));
 assert.deepEqual(W.readPresets({getItem(){throw Error('blocked');}}),[]);assert.deepEqual(W.readPresets({getItem:()=> 'null'}),[]);assert.equal(W.readPresets({getItem:()=>JSON.stringify([p,{invalid:true}])}).length,1);
});
test('every instrument gets a described visual and valid exploration ranges without invalid SVG values',()=>{
 const c={};vm.createContext(c);for(const f of ['data.js','instrument-catalog.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),c);vm.runInContext('out=INSTRUMENTS',c);const V=require('../instrument-visuals.js');
 assert.equal(c.out.length,58);for(const inst of c.out){const html=V.render(inst,inst.realRange||inst.range);assert.doesNotMatch(html,/NaN|Infinity|undefined/);assert.match(html,/role="img"|alt="/);for(const match of html.matchAll(/<img src="([^"]+)"/g))assert.ok(fs.existsSync(path.join(__dirname,'..',match[1])));}
});
