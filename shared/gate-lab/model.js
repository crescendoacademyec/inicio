(function(root){'use strict';
const amp=d=>10**(d/20),db=x=>20*Math.log10(Math.max(1e-9,x));
function process(channels,sr,p={}){
 const opts={threshold:-26,attack:.5,hold:60,release:140,range:30,hysteresis:4,ratio:2,mode:'gate',hp:0,lp:0,...p};
 const length=channels[0].length,detector=new Float32Array(length),gain=new Float32Array(length),state=new Uint8Array(length),audio=channels.map(()=>new Float32Array(length));
 let env=0,g=-opts.range,opened=false,remaining=0;
 const hp=channels.map(()=>({prev:0,out:0})),lp=channels.map(()=>0),aHP=opts.hp?Math.exp(-2*Math.PI*opts.hp/sr):0,aLP=opts.lp?Math.exp(-2*Math.PI*opts.lp/sr):0;
 const attack=opts.attack<=0?0:Math.exp(-1/(sr*opts.attack/1000)),release=opts.release<=0?0:Math.exp(-1/(sr*opts.release/1000));
 const ea=Math.exp(-1/(sr*.0001)),er=Math.exp(-1/(sr*.01));
 for(let i=0;i<length;i++){
  let peak=0;
  channels.forEach((c,k)=>{let v=c[i];if(opts.hp){const h=hp[k];h.out=aHP*(h.out+v-h.prev);h.prev=v;v=h.out;}if(opts.lp){lp[k]=aLP*lp[k]+(1-aLP)*v;v=lp[k];}peak=Math.max(peak,Math.abs(v));});
  const ec=peak>env?ea:er;env=ec*env+(1-ec)*peak;const level=db(env);detector[i]=level;
  if(!opened&&level>=opts.threshold){opened=true;remaining=Math.round(opts.hold/1000*sr);}
  if(opened){if(level>=opts.threshold-opts.hysteresis)remaining=Math.round(opts.hold/1000*sr);else if(remaining>0)remaining--;else opened=false;}
  const target=opened?0:opts.mode==='expander'?Math.max(-opts.range,Math.min(0,(opts.ratio-1)*(level-(opts.threshold-opts.hysteresis)))):-opts.range;
  const coeff=target>g?attack:release;g=coeff*g+(1-coeff)*target;gain[i]=g;state[i]=opened?1:0;
  const multiplier=amp(g);channels.forEach((c,k)=>audio[k][i]=c[i]*multiplier);
 }
 return {audio,detector,gain,state,options:opts};
}
function demo(kind='kick',noiseType='pink',noiseDb=-38,bleedDb=-28,sr=24000){
 const seconds=6,n=sr*seconds,out=new Float32Array(n);let seed=121,pink=0,phase=0;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
 for(let i=0;i<n;i++){const t=i/sr,b=t%.75,white=random();pink=.97*pink+.03*white;let signal=0;
  if(kind==='kick')signal=.65*Math.sin(2*Math.PI*(52*b+2*(1-Math.exp(-40*b))))*Math.exp(-b*22)+white*.09*Math.exp(-b*110);
  if(kind==='snare')signal=(.3*Math.sin(2*Math.PI*185*b)+white*.42)*Math.exp(-b*22);
  if(kind==='tom')signal=.6*Math.sin(2*Math.PI*110*b)*Math.exp(-b*8)+white*.06*Math.exp(-b*65);
  if(kind==='percussion')signal=(white*.3+Math.sin(2*Math.PI*430*b)*.25)*Math.exp(-b*35);
  if(kind==='guitar'){const note=t%2;phase+=2*Math.PI*110/sr;signal=.35*(Math.sin(phase)+.3*Math.sin(2*phase)+.1*Math.sin(3*phase))*Math.exp(-note*2.5)*Math.min(1,note/.005);}
  if(kind==='voice'){const syl=t%1.5,v=syl<.8?Math.sin(Math.PI*syl/.8)**2:0;signal=.3*(Math.sin(2*Math.PI*155*t)+.2*Math.sin(2*Math.PI*775*t))*v+(syl>.85&&syl<1.02?white*.035:0);}
  const noise=noiseType==='white'?white:noiseType==='hum'?Math.sin(2*Math.PI*60*t)*.8+Math.sin(2*Math.PI*120*t)*.2:pink*5;
  const bleed=white*Math.exp(-(t%.25)*85);out[i]=(signal+noise*amp(noiseDb)+bleed*amp(bleedDb))*Math.min(1,t/.01,(seconds-t)/.025);
 }
 return {channels:[out],sr,seconds};
}
const presets=[
 ['kick','Bombo · separar bleed',-24,.2,45,100,35,5,50,1800,'gate',2,'Conserva el golpe más suave y comprueba que el detector no abra con otros tambores.'],
 ['kick-exp','Bombo · atenuación moderada',-28,.3,40,130,15,4,35,2000,'expander',2,'Compara limpieza suave con silencio más profundo.'],
 ['snare','Caja · ataque y bordona',-25,.2,70,160,25,4,120,9000,'gate',2,'Escucha ghost notes y caída de bordona antes de subir umbral.'],
 ['snare-exp','Caja · conservar ambiente',-30,.3,50,200,12,3,100,10000,'expander',2,'Mantén parte del ambiente y evita borrar golpes suaves.'],
 ['tom','Tom · caída completa',-26,.3,100,280,30,5,50,1500,'gate',2,'Alarga hold y release si se corta la resonancia útil.'],
 ['tom-short','Tom · cola más corta',-24,.3,45,100,25,4,50,2000,'gate',2,'Acortar una cola es una elección de arreglo, no una mejora automática.'],
 ['voice','Voz · pausas naturales',-35,1,100,230,12,5,90,10000,'expander',2,'En voz real comprueba consonantes, respiraciones y finales; automatizar puede ser preferible.'],
 ['voice-gate','Voz · pausa atenuada',-33,.5,120,250,18,5,80,10000,'gate',2,'No pretende eliminar ruido simultáneo al canto.'],
 ['guitar','Guitarra · preservar sustain',-37,.4,110,300,15,5,60,8000,'expander',2,'Busca el punto de cierre por debajo del final de nota que quieras conservar.'],
 ['guitar-gate','Guitarra · silencios definidos',-31,.3,60,130,35,6,65,9000,'gate',2,'Compara el ruido entre frases sin acortar demasiado la nota.'],
 ['percussion','Percusión · golpes separados',-26,.2,35,90,25,4,150,10000,'gate',2,'Ajusta al patrón y escucha los golpes más suaves.'],
 ['percussion-exp','Percusión · fondo discreto',-30,.4,60,180,12,4,100,10000,'expander',2,'Atenuar parcialmente evita cambios bruscos de ambiente.']
].map(([id,title,threshold,attack,hold,release,range,hysteresis,hp,lp,mode,ratio,note])=>({id,title,source:id.split('-')[0],settings:{threshold,attack,hold,release,range,hysteresis,hp,lp,mode,ratio},note}));
const api={process,demo,presets,amp,db};if(typeof module!=='undefined')module.exports=api;else root.GateLabModel=api;
})(typeof window!=='undefined'?window:globalThis);
