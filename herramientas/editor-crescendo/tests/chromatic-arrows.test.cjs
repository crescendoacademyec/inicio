const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../src/app.js'),'utf8');
function fn(name){const start=source.indexOf('  function '+name+'(');assert.ok(start>=0,name);let p=source.indexOf('(',start),n=1;for(p++;n;p++){if(source[p]==='(')n++;if(source[p]===')')n--;}let i=source.indexOf('{',p),depth=1;for(i++;depth;i++){if(source[i]==='{')depth++;if(source[i]==='}')depth--;}return source.slice(start,i);}
function setup({clef='clef-g',diatonic=0,key='C',input=true}={}){
 const c={window:{}};vm.createContext(c);
 for(const file of ['score-editor-clefs.js','score-editor-key-signatures.js','score-editor-midi-chords.js'])vm.runInContext(fs.readFileSync(require.resolve('../src/'+file),'utf8'),c);
 const C=c.window.JMLScoreClefs,K=c.window.JMLScoreKeySignatures,entry={id:'drawn',type:'note',staffStep:C.staffStepForDiatonicStep(diatonic,clef),diatonicStep:diatonic,tickStart:0,ticks:4,voice:1},next={id:'other',type:'note',staffStep:0,diatonicStep:6,tickStart:8,ticks:4,voice:2};
 Object.assign(c,{EPSILON:.0001,KeySignatures:K,MidiChords:c.window.JMLScoreMidiChords,state:{mode:'note',cursorActive:input,cursorMeasure:0,cursorTick:4,cursorEntryId:input?null:entry.id,selectedEntryIds:[],selectedNoteRefs:[],measures:[{entries:[entry,next]}]},activeVoice:()=>1,entryVoice:e=>e.voice||1,isNoteInputMode:()=>c.state.cursorActive,activeSystemIsPercussionLine:()=>false,entryLocationById:id=>{const entry=c.state.measures[0].entries.find(e=>e.id===id);return entry?{entry,measureIndex:0}:null;},nearestEntryStaffStep:(e,s)=>e.chordSteps?.includes(s)?s:e.staffStep,entryClefId:()=>clef,staffStepForDiatonicStep:C.staffStepForDiatonicStep,diatonicStepForStaffStep:C.diatonicStepForStaffStep,entryKeySignature:()=>K.parse(key),keySignatureAccidentalForDiatonicStep:K.accidentalForDiatonicStep,accidentalSemitone:K.accidentalSemitone,history:[],saveHistory:()=>c.history.push(JSON.stringify(entry)),render(){},pruneBrokenWritingTies(){},auditionEntryStaffStep(){}});
 for(const name of ['entryStaffStep','entryStaffSteps','entryDiatonicSteps','entryDiatonicStepForStaffStep','getEntryAccidental','setEntryAccidental','clearEntryAccidental','setActiveNote','clearActiveNote','showCursorPitchAtCursor','carryCursorPitchAfterWrittenNote','selectedEntryLocation','findActiveNoteTarget','effectiveEntryAccidental','mod12','midiForDiatonicStep','moveSelectedNoteChromatically'])vm.runInContext(fn(name),c);
 // Layout reconstruction is outside this test; update the same pitch fields
 // that setEntryStaffSteps derives from the active clef in production.
 c.setEntryStaffSteps=(e,steps)=>{e.staffStep=steps[0];e.diatonicStep=C.diatonicStepForStaffStep(steps[0],clef);if(steps.length>1){e.chordSteps=[...steps];e.chordDiatonicSteps=steps.map(s=>C.diatonicStepForStaffStep(s,clef));}};
 c.carryCursorPitchAfterWrittenNote(entry,entry.staffStep);
 const midi=()=>c.midiForDiatonicStep(entry.diatonicStep,c.effectiveEntryAccidental(entry,entry.staffStep));
 const spelling=()=>{const a=c.getEntryAccidental(entry,entry.staffStep);return 'CDEFGAB'[((entry.diatonicStep%7)+7)%7]+({sharp:'#',flat:'b'}[a]||'');};
 return {c,entry,next,midi,spelling};
}
test('arrows immediately after drawing visit every semitone in both directions, with the caret already advanced',()=>{
 const {c,entry,next,midi,spelling}=setup(),other=JSON.stringify(next),up=[],down=[];
 for(let i=1;i<=12;i++){assert.equal(c.moveSelectedNoteChromatically(1),true);assert.equal(midi(),60+i);up.push(spelling());}
 for(let i=1;i<=12;i++){assert.equal(c.moveSelectedNoteChromatically(-1),true);assert.equal(midi(),72-i);down.push(spelling());}
 assert.deepEqual(up,['C#','D','D#','E','F','F#','G','G#','A','A#','B','C']);assert.deepEqual(down,['B','Bb','A','Ab','G','Gb','F','E','Eb','D','Db','C']);
 assert.equal(entry.tickStart,0);assert.equal(entry.ticks,4);assert.equal(entry.voice,1);assert.equal(c.state.cursorTick,4);assert.equal(c.state.cursorEntryId,null);assert.equal(c.history.length,24);assert.equal(JSON.stringify(next),other);
});
test('chromatic motion uses the written clef and the effective key accidental rather than skipping to the next scale degree',()=>{
 for(const clef of ['clef-g','clef-f','clef-c']){const {c,midi,spelling}=setup({clef,diatonic:3,key:'G'});assert.equal(midi(),66);assert.equal(c.moveSelectedNoteChromatically(1),true);assert.equal(midi(),67);assert.equal(spelling(),'G');assert.equal(c.moveSelectedNoteChromatically(-1),true);assert.equal(midi(),66);assert.equal(spelling(),'Gb');}
 const {c,midi,spelling}=setup({key:'Bb'});assert.equal(c.moveSelectedNoteChromatically(-1),true);assert.equal(midi(),59);assert.equal(spelling(),'B');
});
test('rest entry, a newly prepared pitch and an empty caret leave previously written notes alone',()=>{
 for(const change of [{mode:'rest'},{pendingInputPitch:{diatonicStep:4}},{pendingMidiNotes:[{midi:64}]},{activeNoteEntryId:null}]){const {c,entry}=setup();Object.assign(c.state,change);const before=JSON.stringify(entry);assert.equal(c.moveSelectedNoteChromatically(1),false);assert.equal(JSON.stringify(entry),before);assert.equal(c.history.length,0);}
});
test('selected notes still use chromatic movement after leaving note input, while percussion does not',()=>{
 const {c,midi}=setup({input:false});assert.equal(c.moveSelectedNoteChromatically(1),true);assert.equal(midi(),61);c.activeSystemIsPercussionLine=()=>true;assert.equal(c.moveSelectedNoteChromatically(1),false);assert.equal(midi(),61);
});
