const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8');
function fn(name){const start=source.indexOf('  function '+name+'(');let i=source.indexOf('{',start),depth=1;for(i++;depth;i++){if(source[i]==='{')depth++;if(source[i]==='}')depth--;}return source.slice(start,i);}
function setup(){
 const a={id:'a',type:'note',chordSteps:[0,2,4],tickStart:0,ticks:4,accidentalsByStep:{0:'sharp',2:'flat'},noteheadsByStep:{2:'cross'},noteColors:{2:'#ff0000'},tieToNext:true,tieStaffStep:0,tieDiatonicStep:6},b={id:'b',type:'note',chordSteps:[0],tickStart:0,ticks:4,tieStaffStep:0},rest={id:'r',type:'rest',ticks:4},other={id:'other-part',chordSteps:[-7]};
 const entries=[a,b,rest],c={state:{selectedEntryIds:['a','b','r'],selectedNoteRefs:[],measures:entries.map(entry=>({entries:[entry]}))},measureSelectMode:false,history:0,renders:0,activeSystemIsPercussionLine:()=>false,selectedNoteLocations:()=>c.state.selectedNoteRefs.map(ref=>({entry:entries.find(e=>e.id===ref.entryId),staffStep:ref.staffStep})),selectedEntryLocations:()=>entries.filter(e=>c.state.selectedEntryIds.includes(e.id)||(!c.state.selectedEntryIds.length&&e.id===c.state.cursorEntryId)).map(entry=>({entry})),entryLocationById:id=>({entry:entries.find(e=>e.id===id)}),entryStaffSteps:e=>e.chordSteps.slice(),getEntryAccidental:(e,step)=>e.accidentalsByStep?.[step]||null,clearEntryAccidental:(e,step)=>{if(e.accidentalsByStep)delete e.accidentalsByStep[step];},setEntryAccidental:(e,step,value)=>{(e.accidentalsByStep??={})[step]=value;},setEntryStaffSteps:(e,steps)=>{e.chordSteps=steps;},saveHistory:()=>c.history++,stopMidiPlayback(){},setActiveNote(){},pruneBrokenWritingTies(){},render:()=>c.renders++,moveCursorPitch:delta=>c.cursorDelta=delta,setExerciseStatus:status=>c.status=status};
 vm.createContext(c);vm.runInContext(fn('moveSelectedPitchByOctave'),c);return {c,a,b,rest,other};
}
test('selected measures shift by exact octaves, preserving spelling, timing, ties and note styles, without touching other parts',()=>{
 const {c,a,b,rest,other}=setup(),otherBefore=JSON.stringify(other);c.moveSelectedPitchByOctave(-1);
 assert.deepEqual(a.chordSteps,[-7,-5,-3]);assert.deepEqual(b.chordSteps,[-7]);assert.equal(a.accidentalsByStep[-7],'sharp');assert.equal(a.accidentalsByStep[-5],'flat');assert.equal(a.noteheadsByStep[-5],'cross');assert.equal(a.noteColors[-5],'#ff0000');assert.equal(a.tieStaffStep,-7);assert.equal(a.tieDiatonicStep,-1);assert.equal(a.tickStart,0);assert.equal(a.ticks,4);assert.equal(rest.type,'rest');assert.equal(JSON.stringify(other),otherBefore);assert.equal(c.history,1);
 c.moveSelectedPitchByOctave(1);assert.deepEqual(a.chordSteps,[0,2,4]);assert.equal(a.accidentalsByStep[2],'flat');assert.equal(c.history,2);
});
test('one selected chord head moves alone even when cursorEntryId refers to the full chord',()=>{
 const {c,a,b}=setup();c.state.selectedEntryIds=[];c.state.cursorEntryId='a';c.state.selectedNoteRefs=[{entryId:'a',staffStep:2}];c.moveSelectedPitchByOctave(1);
 assert.deepEqual(a.chordSteps,[0,9,4]);assert.deepEqual(b.chordSteps,[0]);assert.equal(a.accidentalsByStep[0],'sharp');assert.equal(a.accidentalsByStep[9],'flat');assert.equal(a.tieStaffStep,0);
});
test('measure mode moves every note in the chosen measure rather than a stale note selection',()=>{
 const {c,a,b}=setup();c.measureSelectMode=true;c.state.selectedMeasureIndex=1;c.state.selectedEntryIds=[];c.state.cursorEntryId=null;c.moveSelectedPitchByOctave(-1);assert.deepEqual(a.chordSteps,[0,2,4]);assert.deepEqual(b.chordSteps,[-7]);
});
test('an octave collision leaves the entire operation unchanged and explains how to resolve it',()=>{
 const {c,a}=setup();a.chordSteps=[0,7];c.state.selectedEntryIds=[];c.state.selectedNoteRefs=[{entryId:'a',staffStep:0}];const before=JSON.stringify(a);c.moveSelectedPitchByOctave(1);assert.equal(JSON.stringify(a),before);assert.equal(c.history,0);assert.match(c.status,/Selecciona ambas/);
});
test('Shift arrows invoke octave motion and text fields remain editable',()=>{
 const calls=[],c={isTextEditingTarget:target=>target==='input',sceneNavigationMode:'edit',isNoteInputMode:()=>false,handleDoricoPitchInput:()=>false,handleSemanticKeyCommand:()=>false,isPlaybackSpaceShortcut:()=>false,measureSelectMode:false,handleAccidentalKey:()=>false,Keymap:{durationIdForEvent:()=>null},durationById:()=>null,moveSelectedPitchByOctave:direction=>calls.push(direction)};vm.createContext(c);vm.runInContext(fn('handleKeydown'),c);
 for(const [key,direction]of [['ArrowUp',1],['ArrowDown',-1]]){let prevented=false;c.handleKeydown({key,shiftKey:true,target:'score',preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(calls.at(-1),direction);}
 c.handleKeydown({key:'ArrowUp',shiftKey:true,target:'input'});assert.equal(calls.length,2);
});
