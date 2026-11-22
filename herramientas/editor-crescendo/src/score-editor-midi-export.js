(function(root){'use strict';
 const PPQ=960,encode=text=>Array.from(new TextEncoder().encode(String(text))),ascii=text=>Array.from(text,c=>c.charCodeAt(0));
 const bytes=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];
 function variable(value){let n=Math.round(value);if(!Number.isFinite(n)||n<0||n>0x0fffffff)throw Error('La duración excede el formato MIDI.');const out=[n&127];while(n=Math.floor(n/128))out.unshift((n&127)|128);return out;}
 function meta(type,data){return [0xff,type,...variable(data.length),...data];}
 function clock(changes=[]){
  const sorted=changes.filter(change=>Number.isFinite(change.ms)&&change.ms>=0&&Number.isFinite(change.bpm)&&change.bpm>0).sort((a,b)=>a.ms-b.ms),tempos=[];
  for(const change of [{ms:0,bpm:120},...sorted]){const previous=tempos.at(-1);if(previous?.ms===change.ms)tempos[tempos.length-1]={...change};else if(previous?.bpm!==change.bpm)tempos.push({...change});}
  let ticks=0;tempos.forEach((change,index)=>{if(index)ticks+=(change.ms-tempos[index-1].ms)*tempos[index-1].bpm*PPQ/60000;change.tick=ticks;});
  const tick=ms=>{const at=Math.max(0,Number(ms)||0),tempo=tempos.findLast(change=>change.ms<=at)||tempos[0];return Math.round(tempo.tick+(at-tempo.ms)*tempo.bpm*PPQ/60000);};
  return {tempos,tick};
 }
 function track(events,endTick){
  events.sort((a,b)=>a.tick-b.tick||a.order-b.order);const data=[];let previous=0;
  for(const event of events){data.push(...variable(event.tick-previous));for(const byte of event.data)data.push(byte);previous=event.tick;}
  data.push(...variable(Math.max(previous,endTick)-previous),0xff,0x2f,0);
  return [...ascii('MTrk'),...bytes(data.length),...data];
 }
 function serialize({title='Partitura',parts=[],events=[],tempos=[],meters=[],durationMs=0}){
  if(!parts.length)throw Error('No hay instrumentos para exportar.');
  const time=clock(tempos),endTick=time.tick(events.reduce((end,event)=>Math.max(end,event.endMs),durationMs||0));
  const conductor=[{tick:0,order:-9,data:meta(3,encode(title))}];
  for(const tempo of time.tempos){const micros=Math.round(60000000/tempo.bpm);if(micros<1||micros>0xffffff)throw Error('Tempo fuera del rango MIDI.');conductor.push({tick:time.tick(tempo.ms),order:-8,data:meta(0x51,[(micros>>>16)&255,(micros>>>8)&255,micros&255])});}
  for(const meter of meters){const numerator=String(meter.top||4).split('+').reduce((sum,n)=>sum+Number(n),0),denominator=Number(meter.bottom||4),power=Math.log2(denominator);if(!Number.isInteger(numerator)||numerator<1||numerator>255||!Number.isInteger(power)||power<0||power>7)throw Error('Compás fuera del rango MIDI.');conductor.push({tick:time.tick(meter.ms),order:-7,data:meta(0x58,[numerator,power,24,8])});}
  const tracks=[track(conductor,endTick)];
  parts.forEach((part,index)=>{
   const channel=(index%15)+(index%15>=9?1:0),port=Math.floor(index/15),selected=events.filter(event=>part.systemIndices.includes(event.systemIndex||0));
   if(port>127)throw Error('El conjunto excede los puertos disponibles en MIDI.');
   const pan=Number.isFinite(Number(part.pan))?Math.max(-1,Math.min(1,Number(part.pan))):0;
   const data=[{tick:0,order:-9,data:meta(3,encode(part.name))},{tick:0,order:-8,data:meta(0x21,[port])},{tick:0,order:-7,data:meta(0x20,[channel])},{tick:0,order:-6,data:[0xc0|channel,Math.max(0,Math.min(127,(part.program||1)-1))]},{tick:0,order:-5,data:[0xb0|channel,7,Math.round(Math.max(0,Math.min(100,part.volume??80))*1.27)]},{tick:0,order:-4,data:[0xb0|channel,10,Math.round(64+pan*(pan<0?64:63))]}];
   for(const event of selected){
    if(!Number.isInteger(event.midi)||event.midi<0||event.midi>127||!Number.isFinite(event.startMs)||!Number.isFinite(event.endMs)||event.startMs<0||event.endMs<=event.startMs)throw Error(`Nota MIDI no válida en ${part.name}.`);
    const start=time.tick(event.startMs),end=Math.max(start+1,time.tick(event.endMs));
    data.push({tick:start,order:2,data:[0x90|channel,event.midi,Math.round(Math.max(1,Math.min(127,event.velocity||88)))]},{tick:end,order:1,data:[0x80|channel,event.midi,0]});
   }
   tracks.push(track(data,endTick));
  });
  const header=[...ascii('MThd'),...bytes(6),0,1,(tracks.length>>>8)&255,tracks.length&255,(PPQ>>>8)&255,PPQ&255],size=header.length+tracks.reduce((sum,track)=>sum+track.length,0),result=new Uint8Array(size);let cursor=header.length;result.set(header);for(const data of tracks){result.set(data,cursor);cursor+=data.length;}return result;
 }
 const crcTable=Array.from({length:256},(_,i)=>{let n=i;for(let j=0;j<8;j++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
 function crc32(data){let crc=0xffffffff;for(const byte of data)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
 // MIDI is small enough to store without compression. This local ZIP writer
 // keeps separate-track export available without a CDN or an extra download.
 function zip(files){
  if(files.length>65535)throw Error('Demasiados archivos para el ZIP.');const chunks=[],central=[];let offset=0;
  for(const file of files){const name=new Uint8Array(encode(file.name)),data=file.data instanceof Uint8Array?file.data:new Uint8Array(file.data),crc=crc32(data);
   if(name.length>65535||data.length>0xffffffff)throw Error('Archivo demasiado grande para el ZIP.');
   const header=new Uint8Array(30+name.length),h=new DataView(header.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint16(12,33,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);header.set(name,30);chunks.push(header,data);
   const record=new Uint8Array(46+name.length),v=new DataView(record.buffer);v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint16(8,0x800,true);v.setUint16(14,33,true);v.setUint32(16,crc,true);v.setUint32(20,data.length,true);v.setUint32(24,data.length,true);v.setUint16(28,name.length,true);v.setUint32(42,offset,true);record.set(name,46);central.push(record);offset+=header.length+data.length;
  }
  const centralSize=central.reduce((n,c)=>n+c.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,centralSize,true);v.setUint32(16,offset,true);
  const result=new Uint8Array(offset+centralSize+22);let cursor=0;for(const chunk of [...chunks,...central,end]){result.set(chunk,cursor);cursor+=chunk.length;}return result;
 }
 const api={PPQ,clock,serialize,zip};if(typeof module!=='undefined')module.exports=api;else root.JMLScoreMidiExport=api;
})(typeof window==='undefined'?globalThis:window);
