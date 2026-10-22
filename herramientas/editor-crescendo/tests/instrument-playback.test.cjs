const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Guitar=require('../src/score-editor-guitar.js');
test('playback lights the saved TAB string and fret rather than an equivalent default position',()=>{
 const source=fs.readFileSync(require('node:path').join(__dirname,'../src/app.js'),'utf8');
 const fn=source.slice(source.indexOf('  function updateInstrumentPlayback()'),source.indexOf('  function stringInstrument()'));
 const make=(string,fret)=>({dataset:{string:String(string),fret:String(fret)},on:false,classList:{toggle(_cls,on){this.owner.on=on;}}});
 const keys=[make(1,0),make(2,5)];keys.forEach(k=>k.classList.owner=k);
 const entry={id:'n',stringFingerings:{guitar:[{string:2,fret:5,midi:64}]}};
 const c={performance:{now:()=>100},instrumentPlaybackSignature:'',midiKeyboardPlaybackNotes:[],state:{midiPlayback:{active:true,startAt:0,scheduledNotes:[{startMs:0,endMs:500,midi:64,entryId:'n',measureIndex:0,systemIndex:0}]},measures:[{entries:[entry]}]},midiKeyboard:null,applyMidiKeyboardHighlights(){},activeSystemIndex:()=>0,withSystemContext:(_index,callback)=>callback(),setActiveSystemIndex(){},stringInstrument:()=>Guitar.forInstrument('guitar'),stringMidisForEntry:()=>[64],savedStringFingering:e=>e.stringFingerings.guitar,document:{querySelectorAll:()=>keys}};
 vm.createContext(c);vm.runInContext(fn,c);c.updateInstrumentPlayback();assert.equal(keys[0].on,false);assert.equal(keys[1].on,true);assert.deepEqual([...c.midiKeyboardPlaybackNotes],[64]);
 c.state.midiPlayback.active=false;c.updateInstrumentPlayback();assert.ok(keys.every(k=>!k.on));assert.equal(c.midiKeyboardPlaybackNotes.length,0);
});
test('requinto uses its real tuning, five semitones above guitar',()=>{
 const g=Guitar.forInstrument('guitar'),r=Guitar.forInstrument('requinto');assert.equal(r.tuning.length,6);r.tuning.forEach((midi,index)=>assert.equal(midi,g.tuning[index]+5));
});
test('Crescendo transforms written pitches for TAB and playback exactly once',()=>{
 const source=fs.readFileSync(require('node:path').join(__dirname,'../src/app.js'),'utf8');
 const helper=source.slice(source.indexOf('  function stringMidisForEntry('),source.indexOf('  function savedStringFingering('));
 const playback=source.slice(source.indexOf('  function playbackNoteEvents()'),source.indexOf('  // Instrumento por SoundFont'));
 for(const [instrument,expected] of [['guitar',64],['requinto',69],['violin',76]]){
  const c={entryStaffSteps:()=>[1],stringInstrument:()=>Guitar.forInstrument(instrument),midiNotesForEntry:()=>[76],playbackTempoEvents:()=>[],scoreSystems:()=>[{measures:[]}],systemIsPercussionLine:()=>false,withSystemContext:(_i,f)=>f(),state:{measures:[]},MidiPlayback:{noteEventsForEntries:()=>[{midi:76,startMs:0}]},entryVoice(){},entryBaseTicks(){},nearestEntryStaffStep(){},entryStaffStep(){},EPSILON:.0001};
  vm.createContext(c);vm.runInContext(helper+playback,c);assert.deepEqual([...c.stringMidisForEntry({},0)],[expected]);assert.equal(c.playbackNoteEvents()[0].midi,expected);
 }
});
