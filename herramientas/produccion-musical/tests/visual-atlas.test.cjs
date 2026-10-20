const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../curriculum.js'),A=require('../visual-atlas.js'),I=require('../illustrations.js');
const lessons=C.modules.flatMap(m=>m.lessons),byId=Object.fromEntries(lessons.map(l=>[l.id,l]));
test('all 48 lessons keep a primary illustration; new photos and graphs attach to actual concept paragraphs',()=>{
 assert.equal(lessons.length,48);for(const l of lessons)assert.ok(I.render(l.id).includes('<figure'),l.id);
 assert.equal(Object.keys(A.photos).length,8);assert.equal(Object.keys(A.diagrams).length,20);
 for(const [id,spec] of [...Object.entries(A.photos),...Object.entries(A.diagrams)]){
  assert.ok(byId[id],id);assert.ok(spec.at>=0&&spec.at<byId[id].concepts.length,id);
  assert.ok(A.render(id,spec.at),id);assert.equal(A.render(id,9),'');
 }
 assert.equal(A.render('unknown',0),'');
});
test('all eight original images are local, compressed, intrinsically sized, lazy loaded and described',()=>{
 for(const [id,p] of Object.entries(A.photos)){
  const file=path.join(__dirname,'../assets/illustrations',p.asset+'.jpg');assert.ok(fs.existsSync(file));assert.ok(fs.statSync(file).size<750000);
  const html=A.render(id,p.at);assert.match(html,/width="1536" height="1024"/);assert.match(html,/loading="lazy"/);assert.match(html,/alt="[^"]{40,}"/);assert.match(html,/Ilustración didáctica generada con IA/);
  assert.ok(p.items.length===3);assert.ok(p.items.every(([title,body])=>title&&body.length>25));
 }
});
test('each graph has finite deterministic geometry and a uniquely associated text description',()=>{
 const seen=new Set();for(const l of lessons)for(let i=0;i<l.concepts.length;i++){
  const html=A.render(l.id,i);assert.equal(html,A.render(l.id,i));assert.doesNotMatch(html,/NaN|Infinity|undefined/);
  for(const match of html.matchAll(/id="(atlas-[^"]+)"/g)){assert.ok(!seen.has(match[1]),match[1]);seen.add(match[1]);}
  if(html.includes('<svg')){assert.match(html,/aria-labelledby="atlas-title-/);assert.match(html,/<desc id="atlas-desc-/);}
 }
});
test('pan example preserves total squared gain, and compression responds progressively without a delayed jump',()=>{
 for(let p=-1;p<=1;p+=.05){const [l,r]=A.models.panGains(p);assert.ok(Math.abs(l*l+r*r-1)<1e-12);}
 assert.deepEqual(A.models.panGains(-1),[1,0]);assert.ok(Math.abs(A.models.panGains(0)[0]-Math.SQRT1_2)<1e-12);
 assert.equal(A.models.compressionGain(.2),1);assert.ok(A.models.compressionGain(.201)<1);assert.ok(A.models.compressionGain(.3)>.4);assert.ok(A.models.compressionGain(.65)<A.models.compressionGain(.8));
 for(let i=0;i<=100;i++){const gain=A.models.compressionGain(i/100);assert.ok(gain>0&&gain<=1);}
});
test('delay marks represent actual subdivisions at the displayed tempo',()=>{
 assert.equal(A.models.delayMs(120,.5),250);assert.equal(A.models.delayMs(120),500);assert.equal(A.models.delayMs(120,1.5),750);
 assert.equal(A.models.delayMs(60),1000);
 const html=A.render('profundidad-2',0);assert.match(html,/120 BPM/);assert.match(html,/250 ms/);assert.match(html,/500 ms/);assert.match(html,/750 ms/);
});
test('the atlas loads before the lesson renderer and inserts resources inside the reading rather than after practice',()=>{
 const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
 assert.ok(index.indexOf('visual-atlas.js')<index.indexOf('src="app.js'));assert.match(index,/visual-atlas\.css/);
 assert.ok(app.indexOf('ProductionVisualAtlas?.render(l.id,i)')<app.indexOf('Prueba y escucha'));
 assert.equal(A.photos['grabacion-4'].at,1,'Photo belongs to the paragraph about monitoring, filter and position');
});
