'use strict';
document.getElementById('run').onclick=async()=>{
 const M=window.ProductionModels,results=[],assert=(ok,text)=>{if(!ok)throw Error(text);},near=(a,b,e=.01)=>Math.abs(a-b)<e;
 try{
  for(const type of ['lowpass','highpass'])for(const sections of [1,2,4]){
   const ctx=new OfflineAudioContext(2,48000,48000),freq=Float32Array.from({length:1001},(_,i)=>50*400**(i/1000)),total=new Float32Array(freq.length).fill(1),at=new Float32Array([1000]);let cut=1;
   for(let i=0;i<sections;i++){const filter=ctx.createBiquadFilter();M.configureFilter(filter,{type,frequency:1000,gain:0,q:4,sections},i,48000);const mag=new Float32Array(freq.length),phase=new Float32Array(freq.length),c=new Float32Array(1);filter.getFrequencyResponse(freq,mag,phase);filter.getFrequencyResponse(at,c,new Float32Array(1));cut*=c[0];for(let j=0;j<freq.length;j++)total[j]*=mag[j];}
   const db=M.gainToDb(cut);assert(near(db,-3.0103,.005),type+' corte '+db);assert(Math.max(...total)<=1.00001,type+' realce no esperado');results.push({test:type+' '+sections*12+' dB/oct',cutDb:+db.toFixed(5),pass:true});
  }
  for(const kind of ['mono','identical','left','right','opposite']){
   const ctx=new OfflineAudioContext(2,48000,48000),buffer=ctx.createBuffer(kind==='mono'?1:2,48000,48000),left=buffer.getChannelData(0);
   for(let i=0;i<left.length;i++)left[i]=kind==='right'?0:.5*Math.sin(2*Math.PI*1000*i/48000);
   if(kind!=='mono'){const right=buffer.getChannelData(1);for(let i=0;i<right.length;i++)right[i]=kind==='left'?0:kind==='opposite'?-left[i]:.5*Math.sin(2*Math.PI*1000*i/48000);}
   const source=ctx.createBufferSource();source.buffer=buffer;const meter=M.createStereoMeter(ctx,source);source.start();const paused=ctx.suspend(.15),rendered=ctx.startRendering();await paused;const reading=M.readStereoMeter(meter);assert(near(reading.peakDb,-6.0206,.02),kind+' pico '+reading.peakDb);const rms=kind==='left'||kind==='right'?-12.0412:-9.0309;assert(near(reading.rmsDb,rms,.04),kind+' RMS '+reading.rmsDb);if(kind==='left')assert(reading.channels[1].peak===0,'canal derecho silencioso');if(kind==='right')assert(reading.channels[0].peak===0,'canal izquierdo silencioso');await ctx.resume();await rendered;results.push({test:'meter '+kind,peakDb:+reading.peakDb.toFixed(3),rmsDb:+reading.rmsDb.toFixed(3),pass:true});
  }
  document.getElementById('result').textContent=JSON.stringify({passed:results.length,failed:0,results},null,2);
 }catch(error){document.getElementById('result').textContent=JSON.stringify({passed:results.length,failed:1,error:error.message,results},null,2);}
};
