const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');function context(){const c={window:{},console};vm.createContext(c);for(const name of ['concept-examples.js','concept-example-catalog.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,name),'utf8'),c);return c;}
function read(c,file,tail=''){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+'\n'+tail,c);}
test('every functional concept, reading block, jazz topic and production paragraph has an authored inline example',()=>{const c=context(),X=c.window.CourseExamples;read(c,'herramientas/armonia-funcional/data.js');for(const m of c.window.APP_DATA.modules)for(const sec of m.theory)for(const item of sec.items)assert.ok(X.render('functional',sec.id+':'+item.term),sec.id+':'+item.term);const fc=context();fc.window.addEventListener=()=>{};fc.document={addEventListener(){},getElementById(){return null;},querySelectorAll(){return [];},documentElement:{}};fc.location={hash:'',pathname:'/'};fc.history={state:null};fc.localStorage={getItem(){return null;},setItem(){}};read(fc,'herramientas/armonia-funcional/data.js');read(fc,'herramientas/armonia-funcional/app.js','out=DATA;');for(const m of fc.out.modules)for(const sec of m.theory)for(const item of sec.items)assert.ok(X.render('functional',sec.id+':'+item.term),sec.id+':'+item.term);read(c,'herramientas/teoria-lectura-musical/data.js');const source=fs.readFileSync(path.join(root,'herramientas/teoria-lectura-musical/app.js'),'utf8');vm.runInContext(source.slice(0,source.indexOf('let state ='))+'\nout=COURSE_TRACKS;',c);for(const track of Object.values(c.out))for(const level of track.levels)for(const block of level.blocks)assert.ok(X.render('reading',block.title),block.title);read(c,'herramientas/armonia-jazz/data.js');c.window.CrescendoPianoVoicings={};c.window.CrescendoPractice={};read(c,'herramientas/armonia-jazz/piano-bank.js');read(c,'herramientas/armonia-jazz/baga-lab.js','out=LEVELS;');for(const level of c.out)for(const topic of level.topics)assert.ok(X.render('jazz',topic.title),topic.title);read(c,'herramientas/produccion-musical/curriculum.js');for(const m of c.window.ProductionCurriculum.modules)for(const l of m.lessons)for(const [i] of l.concepts.entries())assert.ok(X.render('production',l.id+':'+i),l.id+':'+i);});
test('all authored pitches parse, rendering is deterministic and no example contains invalid SVG coordinates',()=>{const c=context(),X=c.window.CourseExamples;for(const [course,entries] of Object.entries(X.catalogs))for(const [key,s] of Object.entries(entries)){assert.ok(s.caption&&s.title);const html=X.render(course,key);assert.doesNotMatch(html,/NaN|undefined|Infinity/);assert.equal(html,X.render(course,key));assert.ok(/<svg|ce-steps|<table|ce-keys/.test(html),key);}});
test('staff positions and pitch spellings distinguish chromatic distance from written interval size',()=>{const X=context().window.CourseExamples;assert.equal(X.pitch('C4').midi,60);assert.equal(X.pitch('E4').midi-X.pitch('C4').midi,4);assert.equal(X.pitch('Eb4').midi-X.pitch('C4').midi,3);assert.equal(X.pitch('Ebb4').label,'Mi♭♭');assert.equal(X.pitch('C5').midi-X.pitch('C4').midi,12);const html=X.staff('E4 F4');assert.match(html,/y="86"/);assert.match(html,/y="81"/);});
test('the first functional unit teaches semitone and tone before expecting scale-pattern literacy',()=>{const c=context();read(c,'herramientas/armonia-funcional/data.js');const items=c.window.APP_DATA.modules[0].theory[0].items;assert.deepEqual(Array.from(items.slice(0,4),i=>i.term),['Semitono','Tono','Octava','Escala']);const X=c.window.CourseExamples;assert.match(X.render('functional','escalas-intervalos:Escala mayor natural'),/T–T–S–T–T–T–S/);assert.match(X.render('functional','escalas-intervalos:Semitono'),/ce-keys/);assert.match(X.render('functional','escalas-intervalos:Intervalo'),/<svg/);});
test('lesson renderers place examples in concept sections while retaining their final laboratories',()=>{const functional=fs.readFileSync(path.join(root,'herramientas/armonia-funcional/app.js'),'utf8'),reading=fs.readFileSync(path.join(root,'herramientas/teoria-lectura-musical/app.js'),'utf8'),production=fs.readFileSync(path.join(root,'herramientas/produccion-musical/app.js'),'utf8');assert.ok(functional.indexOf('CourseExamples?.render("functional"')<functional.indexOf('${renderSectionVisuals(section)}'));assert.match(reading,/block.html\}[\s\S]{0,120}CourseExamples/);assert.match(production,/production-concept/);assert.match(production,/productionIllustrationAt/);assert.ok(functional.includes('renderTopicPractice(section)'));assert.ok(production.includes('Prueba y escucha'));});
test('major and natural minor patterns agree with the rendered pitches rather than only the caption',()=>{const X=context().window.CourseExamples;for(const term of ['Escala mayor natural','Escala menor natural']){const spec=X.catalogs.functional['escalas-intervalos:'+term],notes=spec.notes.split(' ').map(X.pitch);const distances=notes.slice(1).map((p,i)=>p.midi-notes[i].midi);assert.deepEqual(distances,Array.from(spec.intervalSteps,t=>t==='T'?2:1));assert.equal(distances.reduce((a,b)=>a+b,0),12);const html=X.render('functional','escalas-intervalos:'+term);assert.equal((html.match(/class="ce-step-label"/g)||[]).length,7);}});
test('modal borrowing questions agree with the corrected parallel-scale explanation',()=>{const c=context();read(c,'herramientas/armonia-funcional/data.js');const questions=c.window.APP_DATA.modules[0].quiz;const major=questions.find(q=>q.id===37),minor=questions.find(q=>q.id===38);assert.match(major.prompt,/Fm/);assert.match(major.choices[major.answer],/Do menor natural/);assert.match(minor.choices[minor.answer],/Fa♯/);});
test('jazz chord qualities have separate compact scores and separate instrument pitches',()=>{
 const X=context().window.CourseExamples,spec=X.catalogs.jazz['1.1 Cifrado de acordes jazz'];
 assert.equal(spec.notes,undefined);assert.equal(spec.compare.length,5);
 assert.deepEqual(Array.from(spec.compare,c=>c.notes.split(' ').length),[1,1,1,1,1]);
 const html=X.render('jazz','1.1 Cifrado de acordes jazz');
 assert.match(html,/ce-compact-chords/);assert.equal((html.match(/viewBox="0 0 240 /g)||[]).length,5);
});
test('3/4 and 6/8 show six eighth notes with different beam groups and correct meters',()=>{
 const X=context().window.CourseExamples,spec=X.catalogs.reading['Dos agrupaciones distintas'],html=X.render('reading','Dos agrupaciones distintas');
 assert.equal(spec.diagrams.length,2);
 assert.deepEqual(Array.from(spec.diagrams[0].groups),[2,2,2]);assert.deepEqual(Array.from(spec.diagrams[1].groups),[3,3]);
 assert.equal(spec.diagrams[0].denominator,4);
 assert.equal((html.match(/&#xe0a4;/g)||[]).length,12);
 assert.equal((html.match(/stroke-width="4"/g)||[]).length,5);
 assert.match(html,/&#xe083;/);assert.match(html,/&#xe084;/);assert.match(html,/&#xe086;/);assert.match(html,/&#xe088;/);
});
test('new harmonic map examples keep each chord separate from the next instrument view',()=>{
 const X=context().window.CourseExamples;
 for(const [course,key,count] of [['jazz','1.2 Campo armónico mayor con tétradas',7],['functional','nivel-4-puente-jazz:ii - V - I mayor',3]]){
  const spec=X.catalogs[course][key];assert.equal(spec.compare.length,count);assert.ok(spec.compactChords);
  assert.ok(spec.compare.every(c=>c.notes.split(' ').length===1));
  assert.equal((X.render(course,key).match(/class="ce-comparison"/g)||[]).length,count);
 }
});
test('the overview map now includes visual examples and production equipment is local and described',()=>{
 const html=fs.readFileSync(path.join(root,'herramientas/teoria-lectura-musical/index.html'),'utf8');
 assert.equal((html.match(/data-ce-map=/g)||[]).length,9);
 const I=require('../herramientas/produccion-musical/illustrations.js'),equipment=I.render('estudio-1');
 assert.match(equipment,/alt="Ilustración de un micrófono/);assert.match(equipment,/Captura: micrófono → previo → A\/D → DAW/);assert.match(equipment,/Escucha: DAW → D\/A/);
 const src=equipment.match(/<img src="([^"]+)"/)[1];assert.ok(fs.existsSync(path.join(root,'herramientas/produccion-musical',src)));
 assert.doesNotMatch(I.render('grabacion-2'),/Orden de preparación/);
});
