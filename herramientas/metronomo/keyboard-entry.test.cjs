const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const W=require('./rhythm-writing.js'),S=require('./rhythm-structure.js'),source=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
function fn(name){const start=source.indexOf('    function '+name+'(');assert.ok(start>=0);let p=source.indexOf('(',start),n=1;for(p++;n;p++){if(source[p]==='(')n++;if(source[p]===')')n--;}let end=source.indexOf('{',p);n=1;for(end++;n;end++){if(source[end]==='{')n++;if(source[end]==='}')n--;}return source.slice(start,end);}
function fixture(events,head=0){let handler;const c={activeRhythmTool:W.create(),rhythmEditorEvents:events,rhythmMarks:[],selectedRhythmNote:{index:0,head},rhythmPointerTarget:{bar:0,beat:0},rhythmWriting:W,rhythmStructure:S,rhythmHistory:W.history(),rhythmSnapshot:()=>JSON.stringify(events),rhythmPreview:{replaceChildren(){}},UI:{rhythmLab:{hidden:false}},syncRhythmPalette(){},renderRhythmScore:m=>c.message=m,document:{addEventListener:(name,callback)=>handler=callback}};vm.createContext(c);const anchor=source.indexOf('    function selectRhythmHead('),start=source.indexOf("    document.addEventListener('keydown',event=>{",anchor),end=source.indexOf("    UI.rhythmScoreOverlay.addEventListener('click'",start);vm.runInContext(source.slice(start,end),c);return {c,press(key,editing=false){let prevented=false;handler({key,target:{closest:()=>editing},preventDefault:()=>prevented=true});return prevented;}};}
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
