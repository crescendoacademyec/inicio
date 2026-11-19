const {test}=require('node:test'),assert=require('node:assert/strict'),P=require('../js/melody-practice.js');
const timeline={duration:8,visits:[{index:0,start:0,end:1},{index:1,start:1,end:3},{index:0,start:3,end:4},{index:2,start:4,end:6},{index:3,start:6,end:8}]};
test('practice ranges include the final bar and follow the performed repeat route',()=>{
 assert.deepEqual(P.range(timeline,1,2),{start:1,end:6,a:1,b:2});
 assert.deepEqual(P.range(timeline,2,2),{start:4,end:6,a:2,b:2});
 assert.throws(()=>P.range(timeline,3,1),/final/);assert.throws(()=>P.range(timeline,4,5),/recorrido/);
});
test('phrase clipping retains sustained notes at A and stops notes exactly at B',()=>{
 const events=[{midi:60,start:0,dur:2},{midi:62,start:2,dur:1},{midi:64,start:3,dur:3},{midi:67,start:6,dur:1}];
 assert.deepEqual(P.clip(events,1,4).map(n=>[n.midi,n.start,n.dur]),[[60,1,1],[62,2,1],[64,3,1]]);
 assert.equal(P.clip(events,6,7).length,1);
});
test('loop clock wraps at the same boundary used by the audio schedule',()=>{
 const loop={start:4,end:6};assert.equal(P.clock(8,4,-.06,loop),4);assert.equal(P.clock(8,5.5,.5,loop),4);assert.equal(P.clock(8,5.5,4.75,loop),4.25);assert.equal(P.clock(8,7,4,null),8);
});
test('lookahead schedules contiguous audio windows before each loop boundary',()=>{
 const scheduled=[],s=P.scheduler({duration:8,position:5,origin:10,loop:{start:4,end:6},schedule:(a,b,time)=>scheduled.push([a,b,time])});
 assert.deepEqual(scheduled,[[5,6,10]]);s.fill(10.3);assert.deepEqual(scheduled,[[5,6,10],[4,6,11]]);s.fill(12.5);assert.deepEqual(scheduled,[[5,6,10],[4,6,11],[4,6,13]]);
 for(let i=1;i<scheduled.length;i++)assert.equal(scheduled[i][2],scheduled[i-1][2]+scheduled[i-1][1]-scheduled[i-1][0]);
 s.fill(12.5);assert.equal(scheduled.length,3);
});
test('audio sources are clipped at the loop end and omit following notes',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync(require.resolve('../js/melody.js'),'utf8'),body=source.slice(source.indexOf(' function scheduleWindow('),source.indexOf(' async function play(){'));
 const scheduled=[];const ctx={destination:{},createBufferSource(){const n={connect(){},disconnect(){},start(at){this.at=at},stop(at){scheduled.push({at:this.at,stop:at,buffer:this.buffer})}};return n},createGain(){return {connect(){},disconnect(){},gain:{setValueAtTime(){},linearRampToValueAtTime(){}}}}};
 const context={ctx,window:{AACMelodyPractice:P},timeline:{events:[{midi:60,start:0,dur:5},{midi:62,start:3,dur:1}]},nodes:new Set(),$:()=>({checked:false})};vm.createContext(context);vm.runInContext(body,context);context.scheduleWindow(1,3,10,new Map([[60,'C4']]));
 assert.deepEqual(scheduled,[{at:10,stop:12.001,buffer:'C4'}]);assert.equal(context.nodes.size,1);
});
