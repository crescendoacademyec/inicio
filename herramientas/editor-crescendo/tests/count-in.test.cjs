const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8');
function fn(name){const match=new RegExp('  (?:async )?function '+name+'\\(').exec(source);assert.ok(match,name);const start=match.index;let p=source.indexOf('(',start),depth=1;for(p++;depth;p++){if(source[p]==='(')depth++;if(source[p]===')')depth--;}let i=source.indexOf('{',p);depth=1;for(i++;depth;i++){if(source[i]==='{')depth++;if(source[i]==='}')depth--;}return source.slice(start,i);}
function fixture(meter={top:4,bottom:4},tempo={absoluteTick:0,bpm:120,unitTicks:4}){
 let now=0,id=0;const timers=new Map(),messages=[],clicks=[];
 const overlay={hidden:true,children:[],replaceChildren(...children){this.children=children;},setAttribute(k,v){this[k]=v;}};
 const output={send:(message,timestamp)=>messages.push({message,timestamp}),clear(){}};
 const context={state:'running',currentTime:0};
 const c={EPSILON:.0001,performance:{now:()=>now},window:{AudioContext:function(){return context;}},document:{getElementById:()=>overlay,createElement:()=>({style:{}})},playbackCountIn:{context,nodes:new Set()},state:{midiPlayback:{active:false,starting:false,runId:0,scheduledTimers:[]}},measureIndexAndTickFromAbsolute:t=>({measureIndex:Math.floor(t/16),tick:t%16}),meterForMeasureIndex:()=>meter,playbackTempoEvents:()=>[tempo],playbackNoteEvents:()=>[{startMs:0,endMs:500,midi:60,velocity:88}],playbackStartAbsoluteTick:()=>0,applyJazzModeToPlaybackEvents:e=>e,playbackEventsFromAbsoluteTick:e=>({adjustedEvents:e,startOffsetMs:0}),midiPlaybackOutput:async()=>output,suspendMidiInputForPlayback(){},resumeMidiInputAfterPlayback(){},updatePlaybackButton(){},updateInstrumentPlayback(){},playbackTickForMs:ms=>ms/125,sendMidiAllNotesOff(){},clearPendingMidiInputWrite(){},startPlaybackLineAnimation:()=>c.animationStarted=true,stopPlaybackLineAnimation(){},showEditorMessage:m=>{throw Error(m);},soundEditorMetronomeClick:(time,accented)=>clicks.push({time,accented,at:now}),removePlaybackLine:()=>c.removed=true,setTimeout:(callback,delay)=>{timers.set(++id,{callback,at:now+delay});return id;},clearTimeout:key=>timers.delete(key)};
 vm.createContext(c);for(const name of ['playbackCountInPlan','stopPlaybackCountIn','schedulePlaybackCountIn','clearPlaybackTimers','schedulePlaybackMidiMessage','stopMidiPlayback','toggleMidiPlayback','updatePlaybackLine'])vm.runInContext(fn(name),c);
 return {c,overlay,messages,clicks,timers,runTo(target){while(true){const next=[...timers.entries()].filter(([,t])=>t.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;timers.delete(next[0]);now=next[1].at;context.currentTime=now/1000;next[1].callback();}now=target;context.currentTime=now/1000;}};
}
test('one-bar count-in follows numerator, denominator, local tempo and dotted tempo units',()=>{
 for(const [meter,tempo,beats,beatMs] of [[{top:4,bottom:4},{absoluteTick:0,bpm:120,unitTicks:4},4,500],[{top:3,bottom:4},{absoluteTick:0,bpm:60,unitTicks:4},3,1000],[{top:6,bottom:8},{absoluteTick:0,bpm:60,unitTicks:4},6,500],[{top:6,bottom:8},{absoluteTick:0,bpm:60,unitTicks:6},6,1000/3]]){
  const {c}=fixture(meter,tempo),plan=c.playbackCountInPlan(0,[tempo]);assert.equal(plan.beats,beats);assert.ok(Math.abs(plan.beatMs-beatMs)<.0001);assert.ok(Math.abs(plan.durationMs-beats*beatMs)<.0001);
 }
 const {c}=fixture();assert.equal(c.playbackCountInPlan(16,[{absoluteTick:0,bpm:120,unitTicks:4},{absoluteTick:16,bpm:60,unitTicks:4}]).durationMs,4000);
});
test('playback waits for all four counts, hides the playhead, then hides count-in and completes the score',async()=>{
 const f=fixture(),{c,overlay}=f;await c.toggleMidiPlayback();assert.equal(c.state.midiPlayback.startAt,2120);c.updatePlaybackLine();assert.equal(c.removed,true);
 assert.ok(f.messages.every(e=>e.timestamp>=2120));assert.ok(f.messages.some(e=>e.message[0]===0x90&&e.timestamp===2120));
 f.runTo(120);assert.equal(overlay.hidden,false);assert.equal(overlay.children[0].textContent,'1');assert.equal(overlay.children[0].style.animationDuration,'500ms');
 f.runTo(1620);assert.equal(overlay.children[0].textContent,'4');assert.equal(f.clicks.length,4);assert.equal(f.clicks[0].accented,true);assert.ok(f.clicks.slice(1).every(e=>!e.accented));
 f.runTo(2120);assert.equal(overlay.hidden,true);assert.equal(c.state.midiPlayback.active,true);
 f.runTo(2900);assert.equal(c.state.midiPlayback.active,false);
});
test('stopping during count-in cancels clicks, pending notes, overlay and old callbacks before replay',async()=>{
 const f=fixture(),{c,overlay}=f;await c.toggleMidiPlayback();f.runTo(120);let stopped=0;c.playbackCountIn.nodes.add({stop:()=>stopped++});await c.toggleMidiPlayback();
 assert.equal(overlay.hidden,true);assert.equal(stopped,1);assert.equal(f.timers.size,0);f.runTo(3000);assert.equal(f.clicks.length,1);
 await c.toggleMidiPlayback();f.runTo(3120);assert.equal(overlay.children[0].textContent,'1');assert.equal(f.clicks.length,2);
});
test('canceling while audio output loads cannot start a stale count-in',async()=>{
 const f=fixture(),{c}=f;let finish;c.midiPlaybackOutput=()=>new Promise(resolve=>finish=resolve);const pending=c.toggleMidiPlayback();await c.toggleMidiPlayback();finish({send(){},clear(){}});await pending;assert.equal(c.state.midiPlayback.active,false);assert.equal(f.timers.size,0);assert.equal(f.overlay.hidden,true);
});

test('pause during the score preserves the current position and resume skips the count-in',async()=>{
 const f=fixture(),{c}=f;c.playbackNoteEvents=()=>[{startMs:0,endMs:5000,midi:60}];
 await c.toggleMidiPlayback();f.runTo(2500);await c.toggleMidiPlayback();
 assert.equal(c.state.midiPlayback.active,false);assert.ok(c.state.midiPlayback.pausedTick>0);assert.equal(f.timers.size,0);
 await c.toggleMidiPlayback();assert.equal(c.state.midiPlayback.startAt,2620);assert.equal(f.overlay.hidden,true);
 c.stopMidiPlayback();assert.equal(c.state.midiPlayback.pausedTick,null);
});
