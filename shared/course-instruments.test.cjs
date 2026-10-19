const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){const c={window:{}};vm.createContext(c);for(const f of ['course-instruments.js','concept-examples.js','concept-example-catalog.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),c);return c.window;}
test('every authored staff example shares its exact sounding pitches with the instrument group',()=>{
 const w=setup(),X=w.CourseExamples;
 for(const [course,specs] of Object.entries(X.catalogs))for(const [key,s] of Object.entries(specs)){
  if(!s.notes&&!s.compare)continue;const html=X.render(course,key);assert.doesNotMatch(html,/NaN|undefined|Infinity/);assert.match(html,/data-ci-group/);
  const encoded=[...html.matchAll(/data-ci-source="([^"]+)"/g)];assert.ok(encoded.length);
  for(const m of encoded){const notes=JSON.parse(m[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&'));assert.ok(notes.length);assert.ok(notes.every(n=>Number.isFinite(n.midi)&&n.midi>=0&&n.midi<=127));}
 }
 const html=X.staff('C4+Eb4+G4');const notes=JSON.parse(html.match(/data-ci-source="([^"]+)"/)[1].replace(/&quot;/g,'"'));assert.deepEqual(notes.map(n=>n.midi),[60,63,67]);
});
test('bass uses four standard strings, correct fret pitches and only the classes present in the score',()=>{
 const I=setup().CourseInstruments,html=I.fretboard([{midi:60,label:'Do'},{midi:63,label:'Mi♭'}],'bass');
 assert.match(html,/Bajo de cuatro cuerdas/);assert.match(html,/Sol2/);assert.match(html,/Mi1/);
 const positions=[...html.matchAll(/data-ci-midi="(\d+)" aria-label="[^"]*, cuerda (\d+), traste (\d+)"/g)];assert.ok(positions.length);
 for(const [,m,s,f] of positions){assert.equal(Number(m),[43,38,33,28][Number(s)-1]+Number(f));assert.ok([0,3].includes(Number(m)%12));}
 assert.ok(positions.some(([,m,s,f])=>m==='36'&&s==='4'&&f==='8'));
 assert.doesNotMatch(html,/cuerda 5|cuerda 6/);
});
test('piano highlights exact pitches while guitar and bass maps preserve spelled labels',()=>{
 const I=setup().CourseInstruments,notes=[{midi:60,label:'Do'},{midi:63,label:'Mi♭'},{midi:72,label:'Do'}],html=I.piano(notes);
 assert.equal((html.match(/fill="#d4a84f"/g)||[]).length,3);
 assert.match(html,/data-ci-midi="60"/);assert.match(html,/data-ci-midi="72"/);assert.doesNotMatch(html,/data-ci-midi="84"/);
 for(const instrument of ['guitar','bass'])assert.match(I.fretboard(notes,instrument),/Mi♭/);
 assert.doesNotMatch(I.piano([]),/NaN|Infinity/);assert.doesNotMatch(I.fretboard([], 'bass'),/NaN|Infinity/);
});
