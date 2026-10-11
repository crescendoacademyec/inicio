(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dbToGain=db=>10**(db/20);
const gainToDb=g=>g>0?20*Math.log10(g):-Infinity;
function compressionDb(x,threshold,ratio,knee=0){
 const d=x-threshold,r=1/Math.max(1,ratio)-1;
 if(knee>0&&Math.abs(d)<=knee/2)return x+r*(d+knee/2)**2/(2*knee);
 return d>knee/2?threshold+d/Math.max(1,ratio):x;
}
function delayMs(bpm,division=1,modifier=1){return 60000/clamp(bpm,20,300)*division*modifier;}
function roomModes(dimensions,speed=343){return dimensions.map(length=>[1,2,3].map(n=>n*speed/(2*clamp(length,1,40))));}
function bufferLatency(samples,sampleRate){return samples/sampleRate*1000;}
function sineSumGain(hz,delay,polarity=1){return Math.sqrt(Math.max(0,2+2*polarity*Math.cos(2*Math.PI*hz*delay/1000)));}
function statistics(channels){
 let peak=0,total=0,count=0;
 for(const channel of channels)for(const s of channel){peak=Math.max(peak,Math.abs(s));total+=s*s;count++;}
 const rms=Math.sqrt(total/(count||1));return {peak,rms,peakDb:gainToDb(peak),rmsDb:gainToDb(rms),crestDb:rms>0?gainToDb(peak/rms):0};
}
function trim(channels,sampleRate,start,end,fadeMs){
 const length=channels[0].length;
 const a=clamp(Math.floor(start*sampleRate),0,length-1),b=clamp(Math.floor(end*sampleRate),a+1,length);
 const n=b-a,fade=clamp(Math.floor(fadeMs/1000*sampleRate),0,Math.floor(n/2));
 return channels.map(channel=>{
  const out=channel.slice(a,b);
  if(fade>0)for(let i=0;i<n;i++)out[i]*=Math.min(1,i/fade,(n-1-i)/fade);
  return out;
 });
}
function wav16(channels,sampleRate,{dither=false,random=Math.random}={}){
 const count=channels.length,frames=channels[0].length,size=frames*count*2,buffer=new ArrayBuffer(44+size),v=new DataView(buffer);
 const text=(at,s)=>{for(let i=0;i<s.length;i++)v.setUint8(at+i,s.charCodeAt(i));};
 text(0,'RIFF');v.setUint32(4,36+size,true);text(8,'WAVE');text(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,count,true);v.setUint32(24,sampleRate,true);v.setUint32(28,sampleRate*count*2,true);v.setUint16(32,count*2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,size,true);
 let at=44;
 for(let i=0;i<frames;i++)for(let c=0;c<count;c++){
  let s=channels[c][i];if(dither)s+=(random()-random())/32768;
  const quantized=clamp(Math.round(s*32768),-32768,32767);v.setInt16(at,quantized,true);at+=2;
 }
 return buffer;
}
function beatPattern(sampleRate,bpm,pattern){
 const step=60/bpm/4,frames=Math.ceil(step*16*sampleRate),out=new Float32Array(frames);
 const noise=i=>{const x=Math.sin((i+1)*78.233)*43758.5453;return (x-Math.floor(x))*2-1;};
 pattern.forEach((row,track)=>row.forEach((active,s)=>{
  if(!active)return;const start=Math.round(s*step*sampleRate),duration=track===0?.28:track===1?.16:.055;
  for(let j=0;j<duration*sampleRate&&start+j<frames;j++){
   const t=j/sampleRate;
   let val;
   if(track===0)val=.55*Math.sin(2*Math.PI*(48*t+2.2*(1-Math.exp(-t*35))))*Math.exp(-t*18);
   else if(track===1)val=(noise(start+j)*.25+Math.sin(2*Math.PI*180*t)*.08)*Math.exp(-t*28);
   else val=noise(start+j)*.14*Math.exp(-t*80);
   out[start+j]+=val*Math.min(1,j/12);
  }
 }));
 return [out,out.slice()];
}
function demo(sampleRate=44100){
 const bpm=96,duration=5,length=Math.round(sampleRate*duration),step=60/bpm/4;
 const percussion=beatPattern(sampleRate,bpm,[[1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]]);
 const tracks={ritmo:[new Float32Array(length),new Float32Array(length)],bajo:[new Float32Array(length),new Float32Array(length)],armonia:[new Float32Array(length),new Float32Array(length)]};
 for(let i=0;i<length;i++){
  const t=i/sampleRate,bar=t<2.5?0:1,p=t%step,note=Math.floor(t/(60/bpm)),f=[65.406,65.406,98,82.407,87.307,87.307,98,87.307][note%8];
  const env=Math.min(1,(t%(60/bpm))/.008)*Math.exp(-(t%(60/bpm))*4);
  const bass=.20*(Math.sin(2*Math.PI*f*t)+.25*Math.sin(4*Math.PI*f*t))*env;
  const chord=bar?[174.614,220,261.626]:[164.814,196,261.626];
  const pad=chord.reduce((sum,hz)=>sum+Math.sin(2*Math.PI*hz*t)*.035,0)*Math.min(1,(t%2.5)/.03,(2.5-t%2.5)/.05);
  for(let c=0;c<2;c++){
   tracks.ritmo[c][i]=percussion[c][i%percussion[c].length];tracks.bajo[c][i]=bass;
   tracks.armonia[c][i]=pad*(c===0?.85:1)+.018*Math.sin(2*Math.PI*(bar?440:392)*t)*Math.exp(-p*12)*(c===0?1:.55);
  }
 }
 tracks.mezcla=[new Float32Array(length),new Float32Array(length)];
 for(let c=0;c<2;c++)for(let i=0;i<length;i++)tracks.mezcla[c][i]=tracks.ritmo[c][i]+tracks.bajo[c][i]+tracks.armonia[c][i];
 return {sampleRate,tracks,duration};
}
function delivery({lufs,truePeak,target=-14,ceiling=-1,tolerance=.5}){
 const gain=target-lufs,predicted=truePeak+gain;
 return {gain,predicted,withinLoudness:Math.abs(gain)<=tolerance,withinPeak:truePeak<=ceiling,normalizationSafe:predicted<=ceiling};
}
const api={clamp,dbToGain,gainToDb,compressionDb,delayMs,roomModes,bufferLatency,sineSumGain,statistics,trim,wav16,beatPattern,demo,delivery};
if(typeof module==='object'&&module.exports)module.exports=api;else root.ProductionModels=api;
})(typeof window!=='undefined'?window:globalThis);
