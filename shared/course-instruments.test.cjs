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
 assert.equal(positions.length,2);assert.ok(positions.some(([,m])=>Number(m)%12===0));
 assert.doesNotMatch(html,/cuerda 5|cuerda 6/);
});
test('piano highlights exact pitches while guitar and bass maps preserve spelled labels',()=>{
 const I=setup().CourseInstruments,notes=[{midi:60,label:'Do'},{midi:63,label:'Mi♭'},{midi:72,label:'Do'}],html=I.piano(notes);
 assert.equal((html.match(/fill="#(?:4caf6a|4a90d9)"/g)||[]).length,3);
 assert.match(html,/data-ci-midi="60"/);assert.match(html,/data-ci-midi="72"/);assert.doesNotMatch(html,/data-ci-midi="84"/);
 for(const instrument of ['guitar','bass'])assert.match(I.fretboard(notes,instrument),/Mi♭/);
 assert.doesNotMatch(I.piano([]),/NaN|Infinity/);assert.doesNotMatch(I.fretboard([], 'bass'),/NaN|Infinity/);
});
test('chords use exactly one compact voicing on guitar and bass in every key',()=>{
 const I=setup().CourseInstruments,formulas=[[0,4,7],[0,3,7],[0,4,7,11],[0,3,7,10],[0,4,7,10],[0,3,6,10],[0,3,6,9],[0,3,7,11],[0,4,8,11]];
 for(const instrument of ['guitar','bass'])for(let root=0;root<12;root++)for(const formula of formulas){
  const notes=I.roles(formula.map(i=>60+root+i),{kind:'chord',root}),positions=Array.from(I.chordPosition(notes,instrument));
  assert.equal(positions.length,formula.length,`${instrument}, root ${root}, ${formula}`);
  assert.equal(new Set(positions.map(n=>n.string)).size,positions.length);
  assert.deepEqual(positions.map(n=>n.midi%12).sort((a,b)=>a-b),formula.map(i=>(root+i)%12).sort((a,b)=>a-b));
  assert.ok(Math.max(...positions.map(n=>n.fret))-Math.min(...positions.map(n=>n.fret))<=4);
  const svg=I.fretboard(notes,instrument,{kind:'chord'});
  assert.equal((svg.match(/data-ci-midi=/g)||[]).length,formula.length);
  assert.doesNotMatch(svg,/NaN|undefined/);
 }
});
test('scale diagrams preserve harmonic roles and stay in one fret window',()=>{
 const I=setup().CourseInstruments;
 const notes=I.roles([60,62,64,65,67,69,71],{kind:'scale',root:0,chordPcs:[0,4,7,11],tensionPcs:[2,9]});
 assert.deepEqual(Array.from(notes,n=>n.role),['root','tension','chordTone','avoid','chordTone','tension','chordTone']);
 for(const instrument of ['guitar','bass']){
  const svg=I.fretboard(notes,instrument,{kind:'scale'});
  for(const color of Object.values(I.ROLE_COLORS))assert.ok(svg.includes(color));
  for(const [,fret]of svg.matchAll(/traste (\d+)"/g))assert.ok(Number(fret)<=4);
 }
 const x=setup().CourseExamples.staff('C4+E4+G4+B4');assert.match(x,/data-ci-kind="chord"/);
 const s=setup().CourseExamples.staff('C4 D4 E4 F4 G4 A4 B4');assert.match(s,/data-ci-kind="scale"/);
});
test('authored chord examples across all courses have a finite single position',()=>{
 const w=setup(),I=w.CourseInstruments;
 for(const [course,specs]of Object.entries(w.CourseExamples.catalogs))for(const [key,spec]of Object.entries(specs)){
  const entries=[spec,...(spec.compare||[])];
  for(const entry of entries){if(!entry.notes||entry.notes.includes(' ')||!entry.notes.includes('+'))continue;
   const notes=entry.notes.split('+').map(w.CourseExamples.pitch);
   for(const instrument of ['guitar','bass']){
    const position=I.chordPosition(I.roles(notes,{kind:'chord'}),instrument);
    assert.ok(position.length,`${course}/${key}/${instrument}`);
    assert.equal(position.length,Math.min(instrument==='bass'?4:6,new Set(notes.map(n=>n.midi%12)).size));
   }
  }
 }
 const notes=I.roles([60,64,67,70,74],{kind:'chord'});
 assert.deepEqual(Array.from(notes,n=>n.role),['root','chordTone','chordTone','chordTone','tension']);
});
