const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const W=require('./rhythm-writing.js'),S=require('./rhythm-structure.js'),source=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function fn(name){const start=source.indexOf('    function '+name+'(');assert.ok(start>=0);let p=source.indexOf('(',start),n=1;for(p++;n;p++){if(source[p]==='(')n++;if(source[p]===')')n--;}let end=source.indexOf('{',p);n=1;for(end++;n;end++){if(source[end]==='{')n++;if(source[end]==='}')n--;}return source.slice(start,end);}
function fixture(events,head=0){let handler;const c={activeRhythmTool:W.create(),rhythmEditorEvents:events,rhythmMarks:[],selectedRhythmNote:{index:0,head},rhythmPointerTarget:{bar:0,beat:0},rhythmWriting:W,rhythmStructure:S,rhythmHistory:W.history(),rhythmSnapshot:()=>JSON.stringify(events),rhythmPreview:{replaceChildren(){}},UI:{rhythmLab:{hidden:false}},rhythmListen:{click:()=>c.playCount=(c.playCount||0)+1},syncRhythmPalette(){},renderRhythmScore:m=>c.message=m,document:{addEventListener:(name,callback)=>handler=callback}};vm.createContext(c);const anchor=source.indexOf('    function selectRhythmHead('),start=source.indexOf("    document.addEventListener('keydown',event=>{",anchor),end=source.indexOf("    UI.rhythmScore.parentElement.addEventListener('click'",start);vm.runInContext(source.slice(start,end),c);return {c,press(key,editing=false,modifiers={}){let prevented=false;handler({key,...modifiers,target:{closest:()=>editing},preventDefault:()=>prevented=true});return prevented;}};}
test('Delete and Backspace erase only the selected chord head, preserve timing and other staves, and support undo',()=>{
 for(const key of ['Delete','Backspace']){
  const events=[{id:'a',staff:1,bar:0,offset:0,beats:1,note:'C4',notes:['C4','E4','G4']},{id:'b',staff:1,bar:0,offset:1,beats:2,note:'A4'},{id:'bass',staff:2,bar:0,offset:0,beats:4,note:'C3'}],before=JSON.stringify(events),f=fixture(events,1);
  assert.equal(f.press(key),true);assert.deepEqual(events[0].notes,['C4','G4']);assert.equal(events[1].offset,1);assert.equal(events[2].id,'bass');assert.equal(f.c.selectedRhythmNote,null);assert.equal(f.c.rhythmPointerTarget,null);assert.equal(f.c.rhythmHistory.undo(JSON.stringify(events)),before);
 }
});
test('deleting a single note leaves its occupied time as rests without moving later notes and ignores editing fields/dialogs',()=>{
 const events=[{id:'a',staff:1,bar:0,offset:0,beats:2,note:'C4'},{id:'b',staff:1,bar:0,offset:2,beats:2,note:'G4'}],f=fixture(events);
 assert.equal(f.press('Delete',true),false);assert.equal(events.length,2);assert.equal(f.press('Delete'),true);assert.equal(events.length,1);assert.equal(events[0].offset,2);
 const notation=W.notation(events,4,1).filter(e=>e.staff===1);assert.equal(notation.filter(e=>e.kind==='rest').reduce((n,e)=>n+e.beats,0),2);assert.equal(f.c.rhythmHistory.canUndo,true);
});
test('a half or whole note can target beat four rather than snapping to beat three; guides use the same positions',()=>{
 for(const figure of ['half','whole']){
  const c={rhythmWriting:W,rhythmStructure:S,activeRhythmTool:W.create(),activeRhythmStaff:1,activeRhythmMark:null,rhythmEditorEvents:[],rhythmTimeline:()=>S.timeline('4/4',[],4),UI:{rhythmScore:{querySelectorAll:()=>[{dataset:{bar:'0',staff:'1',start:'100',end:'500',capacity:'4',top:'20'},getBoundingClientRect:()=>({left:100,right:500,top:20,height:40}),ownerSVGElement:{getBoundingClientRect:()=>({left:0,top:0})}}]}}};W.select(c.activeRhythmTool,'duration',figure);vm.createContext(c);vm.runInContext(fn('rhythmSlots')+fn('locateRhythmTime'),c);
  assert.ok(c.rhythmSlots(0).includes(3));c.locateRhythmTime({clientX:400,clientY:40});assert.equal(c.rhythmPointerTarget.beat,3);
  const p=W.overflowPlan(c.activeRhythmTool,[],[4,4,4,4],4,1,c.rhythmPointerTarget);assert.equal(p.remaining,1);assert.equal(p.segments[0].offset,3);
 }
});
test('left/right traverse existing notes in time order across bars and keep the selected staff, chord head and rhythm intact',()=>{
 const events=[{id:'later',staff:1,bar:1,offset:0,beats:1,note:'C5'},{id:'bass',staff:2,bar:0,offset:0,beats:1,note:'C3'},{id:'first',staff:1,bar:0,offset:0,beats:1,note:'E5',notes:['C5','E5']},{id:'rest',staff:1,bar:0,offset:1,beats:1,kind:'rest'},{id:'triplet',staff:1,bar:0,offset:2,beats:1/3,note:'D5'}],before=JSON.stringify(events);
 const c={rhythmEditorEvents:events,activeRhythmStaff:1,selectedRhythmNote:{index:2,head:1},rhythmPreview:{replaceChildren(){}},renderRhythmScore(){},UI:{rhythmScore:{querySelector:()=>null}}};vm.createContext(c);vm.runInContext(fn('moveRhythmSelection'),c);c.moveRhythmSelection(1);assert.equal(c.selectedRhythmNote.index,4);assert.equal(c.selectedRhythmNote.head,0);c.moveRhythmSelection(1);assert.equal(c.selectedRhythmNote.index,0);c.moveRhythmSelection(-1);assert.equal(c.selectedRhythmNote.index,4);assert.equal(JSON.stringify(events),before);c.selectedRhythmNote=null;c.moveRhythmSelection(-1);assert.equal(c.selectedRhythmNote.index,0);
});

test('newly written notes remain active for immediate semitone arrows without a second click',()=>{
 const events=[],f=fixture(events);Object.assign(f.c,{activeRhythmStaff:1,rhythmPointerTarget:{bar:0,beat:0},rhythmTimeline:()=>S.timeline('4/4',[],4),UI:{rhythmLab:{hidden:false},rhythmBars:{value:'4'}},document:{activeElement:{blur(){}}}});vm.runInContext(fn('addRhythmEditorEvent'),f.c);
 f.c.addRhythmEditorEvent('C5');assert.equal(f.c.selectedRhythmNote.index,0);assert.equal(f.press('ArrowUp'),true);assert.equal(S.resolve(events)[0].note,'C#5');f.press('ArrowUp');assert.equal(S.resolve(events)[0].note,'D5');f.press('ArrowDown');assert.equal(S.resolve(events)[0].note,'Db5');f.press('ArrowDown');assert.equal(S.resolve(events)[0].note,'C5');assert.equal(events[0].offset,0);assert.equal(events[0].beats,1);
});
test('Shift arrows move an octave, Alt arrows a scale degree, and Space plays only the visible generator once',()=>{
 const events=[{id:'a',bar:0,offset:0,beats:1,note:'C5'}],f=fixture(events);f.press('ArrowDown',false,{shiftKey:true});assert.equal(S.resolve(events)[0].note,'C4');f.press('ArrowUp',false,{shiftKey:true});assert.equal(S.resolve(events)[0].note,'C5');f.press('ArrowUp',false,{altKey:true});assert.equal(S.resolve(events)[0].note,'D5');f.press('ArrowDown',false,{altKey:true});assert.equal(S.resolve(events)[0].note,'C5');
 assert.equal(f.press(' '),true);assert.equal(f.c.playCount,1);f.press(' ',false,{repeat:true});assert.equal(f.c.playCount,1);assert.equal(f.press(' ',true),false);f.c.UI.rhythmLab.hidden=true;assert.equal(f.press(' '),false);assert.equal(f.c.playCount,1);
});
test('written head selection locates added chord heads, new grace notes, and excludes rests',()=>{
 const events=[{id:'chord',staff:1,bar:0,offset:0,beats:1,note:'C5'},{id:'later',staff:1,bar:1,offset:0,beats:1,note:'G5'}],state=W.create(),position={bar:0,beat:0};
 assert.equal(W.append(state,events,'E5',[4,4],2,1,position),'');assert.deepEqual(W.writtenSelection(events,{note:'E5',position}),{index:0,head:1});
 W.select(state,'grace');W.append(state,events,'D5',[4,4],2,1,position);W.append(state,events,'F5',[4,4],2,1,position);assert.deepEqual(W.writtenSelection(events,{note:'F5',position,grace:true}),{index:3,head:0});assert.equal(W.writtenSelection(events,{note:'C5',rest:true}),null);
});
