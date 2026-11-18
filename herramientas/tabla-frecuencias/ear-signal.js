/* Matched, synchronized reference/processed noise. One audible processing path. */
(function(root){
'use strict';
function create(ctx,destination,makeNoise,D){
 const dry=ctx.createGain(),wet=ctx.createGain();
 dry.gain.value=0;wet.gain.value=1;dry.connect(destination);wet.connect(destination);
 let voices=[],raw=null,frequency=null,gain=null,startedAt=0,offset=0,playing=false;
 function retire(when=ctx.currentTime){
  const now=ctx.currentTime;
  for(const {node,level} of voices){
   level.gain.cancelScheduledValues(now);level.gain.setValueAtTime(level.gain.value,now);
   level.gain.setValueAtTime(level.gain.value,when);
   level.gain.linearRampToValueAtTime(0,when+.015);
   node.onended=()=>{node.disconnect();level.disconnect();};
   try{node.stop(when+.016);}catch(_){}
  }
  voices=[];
 }
 function play(freq,db,restart=false){
  if(playing&&!restart&&freq===frequency&&db===gain)return;
  const continuing=playing&&!restart&&freq===frequency;
  if(!raw||restart||freq!==frequency)raw=makeNoise(ctx,4).getChannelData(0);
  const pair=D.matchLevels([raw,D.filter(raw,ctx.sampleRate,'peaking',freq,1.4,db)]);
  const when=ctx.currentTime+.01;
  const position=continuing?(offset+Math.max(0,when-startedAt))%4:0;
  retire(when);frequency=freq;gain=db;offset=position;startedAt=when;
  voices=pair.map((data,index)=>{
   const buffer=ctx.createBuffer(1,data.length,ctx.sampleRate);buffer.copyToChannel(data,0);
   const node=ctx.createBufferSource(),level=ctx.createGain();node.buffer=buffer;node.loop=true;
   level.gain.value=0;level.gain.setValueAtTime(0,startedAt);level.gain.linearRampToValueAtTime(1,startedAt+.015);
   node.connect(level);level.connect(index?wet:dry);node.start(startedAt,position);
   return {node,level};
  });
  playing=true;
 }
 function setWet(enabled){
  const now=ctx.currentTime;
  for(const [node,value] of [[dry,enabled?0:1],[wet,enabled?1:0]]){
   node.gain.cancelScheduledValues(now);node.gain.setValueAtTime(node.gain.value,now);
   node.gain.linearRampToValueAtTime(value,now+.05);
  }
 }
 return {play,setWet,updateGain(db){if(playing)play(frequency,db);},stop(){retire();playing=false;offset=0;}};
}
const api={create};if(typeof module==='object')module.exports=api;else root.EarSignal=api;
})(typeof window==='object'?window:globalThis);
