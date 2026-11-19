const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const reader = require('./score-file-reader.js');
// Tiny XML element fixture: tests exercise music conversion without a browser dependency.
function e(localName, attrs={}, children=[], textContent='') {
  return {localName, children, textContent: textContent || children.map(n=>n.textContent).join(''),getAttribute:k=>attrs[k]===undefined?null:String(attrs[k])};
}
const n=(pname='c',oct=4,attrs={})=>e('note',{pname,oct,dur:4,...attrs});
const layer=(notes,num=1)=>e('layer',{n:num},notes);
const measure=(notes,attrs={})=>e('measure',{n:1,...attrs},[e('staff',{n:1},Array.isArray(notes)&&notes[0]?.localName==='layer'?notes:[layer(notes)])]);
function score(measures,config={},extras=[]){return e('mei',{},[e('meiHead',{},[e('title',{},[],'Study & <music>'),e('composer',{},[],'A. Composer')]),e('music',{},[e('score',{},[e('scoreDef',{'meter.count':4,'meter.unit':4,...config},[e('staffGrp',{},[e('staffDef',{n:1,'clef.shape':'G','clef.line':2,...config})])]),...measures,...extras])])]);}
const xml=(measures,config={},extras=[])=>reader.convertElement(score(measures,config,extras));
function pitches(content){return [...content.matchAll(/<pitch><step>(.*?)<\/step><alter>(.*?)<\/alter><octave>(.*?)<\/octave><\/pitch>/g)].map(m=>[m[1],+m[2],+m[3]]);}
test('keeps title, composer, and all chord pitches',()=>{
 const r=xml([measure([n(),e('chord',{dur:4},[n('e'),n('g')]),e('rest',{dur:2})])]);
 assert.equal(r.noteCount,3); assert.equal(r.restCount,1);assert.deepEqual(pitches(r.content),[['C',0,4],['E',0,4],['G',0,4]]);
 assert.match(r.content,/Study &amp; &lt;music&gt;/);assert.match(r.content,/A\. Composer/);assert.match(r.content,/<chord><\/chord>/);
});
test('preserves exact dotted and triplet timing from ppq',()=>{
 const r=xml([measure([n('c',4,{dur:4,dots:1,'dur.ppq':90}),e('tuplet',{num:3,numbase:2},[n('d',4,{dur:8,'dur.ppq':20}),n('e',4,{dur:8,'dur.ppq':20}),n('f',4,{dur:8,'dur.ppq':20})])])],{ppq:60});
 assert.deepEqual([...r.content.matchAll(/<duration>(\d+)<\/duration>/g)].map(m=>+m[1]),[30240,6720,6720,6720]);assert.match(r.content,/<actual-notes>3<\/actual-notes><normal-notes>2/);
});
test('symbolic durations apply tuplets and dots without ppq',()=>{
 const r=xml([measure([e('tuplet',{num:3,numbase:2},[n('c',4,{dur:8,dots:1})])])]);assert.match(r.content,/<duration>10080<\/duration>/);
});
test('key, written accidentals, resets and gestural pitch are respected',()=>{
 const r=xml([measure([n('f'),n('f',4,{accid:'n'}),n('f'),n('f',4,{'accid.ges':'s'})]),measure([n('f')],{n:2})],{'key.sig':'1s'});
 assert.deepEqual(pitches(r.content).map(p=>p[1]),[1,0,0,1,1]);
});
test('accidentals use musical time across voices',()=>{
 const r=xml([measure([layer([e('rest',{dur:4}),n('f',4,{accid:'s'})],1),layer([n('f'),n('f')],2)])]);
 assert.deepEqual(pitches(r.content).map(p=>p[1]),[1,0,1]);assert.match(r.content,/<backup><duration>40320/);
});
test('tied accidentals continue across the barline',()=>{
 const r=xml([measure([n('f',4,{accid:'s','xml:id':'a'})]),measure([n('f',4,{'xml:id':'b'}),n('f')],{n:2})],{},[e('tie',{startid:'#a',endid:'#b'})]);
 assert.deepEqual(pitches(r.content).map(p=>p[1]),[1,1,0]);assert.match(r.content,/<tie type="start"/);assert.match(r.content,/<tie type="stop"/);
});
test('whole measure rest uses the meter and grace notes take no time',()=>{
 const r=xml([measure([n('d',4,{grace:'unacc',dur:8,'dur.ppq':0}),e('mRest')])],{'meter.count':3,'meter.unit':4});assert.match(r.content,/<grace><\/grace><pitch>/);assert.match(r.content,/<duration>60480/);
});
test('sounding offset honors explicit transposition once',()=>{
 assert.equal(xml([measure([n()])],{'trans.semi':-12}).soundOffset,-12);
 assert.equal(xml([measure([n()])],{'clef.dis':8,'clef.dis.place':'below'}).soundOffset,-12);
 assert.equal(xml([measure([n()])],{'clef.dis':8,'clef.dis.place':'below','trans.semi':0}).soundOffset,0);
});
test('tempo uses MusicXML metronome instead of private font characters',()=>{
 const m=measure([n()]);m.children.push(e('tempo',{mm:104,'mm.unit':4},[],'Funk  = 104'));
 const r=xml([m]);assert.match(r.content,/<metronome><beat-unit>quarter/);assert.match(r.content,/<per-minute>104/);assert.match(r.content,/<sound tempo="104"/);assert.doesNotMatch(r.content,/[\uE000-\uF8FF]/);
});
test('repeats and first endings survive',()=>{
 const r=xml([e('ending',{n:1},[measure([n()],{left:'rptstart',right:'rptend'})])]);assert.match(r.content,/<repeat direction="forward"/);assert.match(r.content,/<repeat direction="backward"/);assert.match(r.content,/<ending number="1" type="start"/);
});
for(const name of ['neume','multiRest','tupletSpan','app'])test('reports unsupported '+name,()=>assert.throws(()=>xml([measure([e(name)])]),/no es compatible|aún no es compatible/));
test('rejects invalid pitches, durations and inline keys clearly',()=>{
 assert.throws(()=>xml([measure([n('h')])]),/altura/);assert.throws(()=>xml([measure([n('c',4,{dur:9})])]),/Duración/);assert.throws(()=>xml([measure([e('keySig',{sig:'2s'}),n()])]),/dentro de una voz/);
});
test('rejects malformed/oversize/entity XML before importing',()=>{
 assert.throws(()=>reader.parseXML('<!ENTITY x "bad">'),/compatible/);assert.throws(()=>reader.parseXML('a'.repeat(8*1024*1024+1)),/8 MB/);
 class BadParser{parseFromString(){return {documentElement:e('parsererror'),children:[]};}}assert.throws(()=>reader.parseXML('<bad',BadParser),/incorrecto/);
});
test('detects actual root even when file extension is wrong',async()=>{
 const Original=global.DOMParser;global.DOMParser=class{parseFromString(source){const root=source==='MEI'?score([measure([n()])]):e(source);return{documentElement:root,children:[root]};}};
 try{assert.equal((await reader.read({name:'wrong.xml',size:3,text:async()=> 'MEI'})).format,'mei');assert.equal((await reader.read({name:'score.musicxml',size:3,text:async()=> 'score-partwise'})).format,'musicxml');await assert.rejects(reader.read({name:'fake.xml',size:1,text:async()=> 'html'}),/no contiene/);assert.throws(()=>reader.convert('html'),/no contiene/);}finally{global.DOMParser=Original;}
});
test('compressed MusicXML remains binary',async()=>{const data=new ArrayBuffer(5),r=await reader.read({name:'score.mxl',size:5,arrayBuffer:async()=>data});assert.equal(r.content,data);assert.equal(r.format,'mxl');});
for(const app of ['piano-virtual','diapason-virtual','requinteando','bass-virtual','cuerdas-frotadas'])test(app+' declares MEI and loads the shared bridge',()=>{const html=fs.readFileSync(path.join(__dirname,'../herramientas',app,'index.html'),'utf8');assert.match(html,/accept="[^\"]*\.mei/);assert.match(html,/shared\/score-file-reader\.js/);});
test('MEI expansion is authoritative for repeats, endings and D.S./coda',()=>{
 const first=e('section',{'xml:id':'a'},[measure([n()])]),ending=e('ending',{'xml:id':'b',n:'1'},[measure([n('d')])]),coda=e('section',{'xml:id':'c'},[measure([n('e')])]);
 const r=xml([e('expansion',{plist:'#a #b #a #c'}),first,ending,coda]);assert.deepEqual(r.playbackRoute,[0,1,0,2]);
 assert.throws(()=>xml([e('expansion',{plist:'#missing'}),measure([n()])]),/inexistente/);
 assert.throws(()=>xml([e('expansion',{plist:'#a'}),e('section',{'xml:id':'a'},[e('expansion',{plist:'#a'})])]),/compases compatibles|circulares/);
});
