const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('./data.js'),P=require('../../herramientas/produccion-musical/curriculum.js');
const lessons=new Set(P.modules.flatMap(m=>m.lessons.map(l=>m.id+'/'+l.id)));
test('every concept and diagnostic has valid course links and related concepts',()=>{
 assert.ok(C.entries.length>=69);assert.equal(new Set(C.entries.map(e=>e.id)).size,C.entries.length);
 for(const e of [...C.entries,...C.diagnostics]){assert.ok(lessons.has(e.lesson),e.id);for(const id of e.related)assert.ok(C.entries.some(x=>x.id===id),id);}
 for(const e of C.entries){for(const field of ['definition','use','caution','example'])assert.ok(e[field]?.length>20,e.id+': '+field);assert.ok(C.sources[e.source]);assert.ok(C.sources[e.source][1].startsWith('https://'));}
 assert.equal(C.diagnostics.length,12);for(const d of C.diagnostics)assert.ok(d.steps.length>=3);
});
test('search matches accents, English aliases, categories and problem descriptions',()=>{
 assert.ok(C.search('ecualizacion').some(e=>e.id==='eq'));assert.ok(C.search('lookahead').some(e=>e.id==='lookahead'));assert.ok(C.search('convolution').some(e=>e.id==='reverb'));
 assert.ok(C.search('','Dinámica').every(e=>e.category==='Dinámica'));assert.equal(C.search('ZZZ_UNFINDABLE').length,0);
 assert.ok(C.search('voz','', 'diagnostics').length>=2);
});
test('both platforms share live instrument profiles without inventing bus registers',()=>{
 const c=vm.createContext({window:{}}),base=path.resolve(__dirname,'../../herramientas/tabla-frecuencias');
 for(const f of ['data.js','instrument-catalog.js','eq-presets.js','eq-guidance.js'])vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),c);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'data.js'),'utf8'),c);
 const d=c.window.MusicCompendium;assert.equal(d.entries.filter(e=>e.instrumentId).length,65);assert.ok(d.search('nylon').some(e=>e.instrumentId==='guit-nylon'));for(const e of d.entries)assert.ok(d.sources[e.source],e.id);assert.ok(d.entries.some(e=>e.instrumentId==='mix-bus')); 
});
