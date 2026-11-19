/* Audio scheduling and the visual playhead use the same practice interval. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AACMelodyPractice=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function range(timeline,a,b){
  if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<a)throw Error('El final del bucle debe estar después de su inicio.');
  const first=timeline.visits.findIndex(v=>v.index===a),last=timeline.visits.find((v,i)=>i>=first&&v.index===b);
  if(first<0||!last)throw Error('Ese intervalo no está en el recorrido de la partitura.');
  const start=timeline.visits[first].start,end=last.end;
  if(end-start<.001)throw Error('El intervalo de práctica está vacío.');return {start,end,a,b};
 }
 function clip(events,start,end){return events.flatMap((event,index)=>{const from=Math.max(start,event.start),to=Math.min(end,event.start+event.dur);return to>from+1e-9?[{...event,index,start:from,dur:to-from}]:[];});}
 function clock(duration,position,elapsed,loop){const value=position+Math.max(0,elapsed);return loop?loop.start+(((value-loop.start)%(loop.end-loop.start))+(loop.end-loop.start))%(loop.end-loop.start):Math.max(0,Math.min(duration,value));}
 function scheduler({duration,position,origin,loop,schedule,lookAhead=.8}){
  const end=loop?.end??duration;let next=origin+end-position,cycles=0;
  schedule(position,end,origin);
  return {fill(now){if(!loop)return;while(next<now+lookAhead){schedule(loop.start,loop.end,next);next+=loop.end-loop.start;cycles++;if(cycles>1000000)throw Error('Se alcanzó el límite de repeticiones.');}},get cycles(){return cycles;}};
 }
 return {range,clip,clock,scheduler};
});
