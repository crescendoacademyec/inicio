const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const W=require('./rhythm-writing.js'),E=require('./rhythm-export.js'),A=require('./rhythm-audio.js');
const paletteContext={window:{}};vm.createContext(paletteContext);vm.runInContext(fs.readFileSync(path.join(__dirname,'../editor-crescendo/src/bravura-palette-paths.js'),'utf8'),paletteContext);const glyphs=paletteContext.window.CrescendoBravuraPalette;
const occurrences=(text,part)=>text.split(part).length-1;
test('quarter-quarter-half resized to quarter-half-quarter uses four beats in engraving, playback and MusicXML on either staff',()=>{
 for(const [staff,clef,note] of [[1,'treble','C4'],[2,'bass','C3']])for(const chord of [false,true]){
  const events=[{id:'first',bar:0,staff,offset:0,beats:1,note},{id:'middle',bar:0,staff,offset:1,beats:1,note},{id:'tail',bar:0,staff,offset:2,beats:2,note}];
  if(chord)events.forEach(e=>e.notes=[note,staff===1?'E4':'E3',staff===1?'G4':'G3']);
  const tool=W.create();W.select(tool,'duration','half');assert.equal(W.replaceDuration(tool,events,1,4,1).handled,true);
  assert.deepEqual(events.map(e=>[e.offset,e.beats]),[[0,1],[1,2],[3,1]]);assert.equal(events.reduce((sum,e)=>sum+e.beats,0),4);
  const svg=W.render(events,{bars:1,clef,glyphs});
  if(chord){assert.equal(occurrences(svg,String.fromCodePoint(0xE0A3)),3);assert.equal(occurrences(svg,String.fromCodePoint(0xE0A4)),6);}
  else{assert.equal(occurrences(svg,'d="'+glyphs.half.d+'"'),1);assert.equal(occurrences(svg,'d="'+glyphs.quarter.d+'"'),2);}
  const xml=E.musicXML(events,{bars:1,clef,writing:W}),written=xml.match(/<note>[\s\S]*?<\/note>/g).filter(n=>!n.includes('<chord/>'));
  assert.deepEqual(written.map(n=>/<type>(.*?)<\/type>/.exec(n)[1]),['quarter','half','quarter']);assert.equal(written.reduce((sum,n)=>sum+Number(/<duration>(\d+)<\/duration>/.exec(n)[1]),0),W.TICKS*4);
  const plan=A.compile(events,{bars:1,clef,tempo:60});assert.equal(plan.duration,4);assert.deepEqual([...new Set(plan.notes.map(n=>n.start))],[0,1,3]);assert.deepEqual([...new Set(plan.notes.map(n=>n.end))],[1,3,4]);
  // Restoring a JSON draft must use the same figures, independent of stale display hints.
  const saved=JSON.parse(JSON.stringify(events));saved[2].durationId='half';assert.equal(W.render(saved,{bars:1,clef,glyphs}),svg);
 }
});
test('shortening half to quarter leaves its unused beat as a rest and cannot overflow the last beat',()=>{
 for(const staff of [1,2]){
  const events=[{id:'a',staff,bar:0,offset:0,beats:1,note:'C4'},{id:'b',staff,bar:0,offset:1,beats:2,note:'D4'},{id:'c',staff,bar:0,offset:3,beats:1,note:'E4'}],tool=W.create();
  W.replaceDuration(tool,events,1,4,1);const notation=W.notation(events,4,1).filter(e=>e.staff===staff);assert.deepEqual(notation.map(e=>[e.kind||'note',e.beats]),[['note',1],['note',1],['rest',1],['note',1]]);
  const before=JSON.stringify(events);W.select(tool,'duration','half');assert.match(W.replaceDuration(tool,events,2,4,1).message,/no cabe/);assert.equal(JSON.stringify(events),before);
 }
});
