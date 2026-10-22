(function(root){'use strict';
 const EPS=1e-7;
 const figures=[[8,'cuadrada'],[4,'redonda'],[2,'blanca'],[1,'negra'],[.5,'corchea'],[.25,'semicorchea'],[.125,'fusa'],[.0625,'semifusa'],[.03125,'garrapatea']];
 const values=figures.flatMap(([beats,name])=>[1,1.5,1.75].map((factor,i)=>({beats:beats*factor,name:name+['',' con puntillo',' con doble puntillo'][i]}))).sort((a,b)=>b.beats-a.beats);
 function plan({capacities,bar=0,offset=0,duration,maxBars=256}){
  const remaining=(capacities[bar]??capacities.at(-1))-offset;
  if(!(duration>remaining+EPS)||remaining<=EPS||bar<0)return null;
  const segments=[];let left=duration,index=bar,start=offset;
  while(left>EPS&&index<maxBars){const capacity=capacities[index]??capacities.at(-1);let room=Math.min(left,capacity-start);if(!(room>EPS))return null;
   while(room>EPS){const part=values.find(v=>v.beats<=room+EPS);if(!part)return null;segments.push({bar:index,offset:start,beats:part.beats,name:part.name});start+=part.beats;room-=part.beats;left-=part.beats;}
   index++;start=0;
  }
  if(left>EPS)return null;
  return {remaining,duration,segments,bars:segments.at(-1).bar+1};
 }
 const number=value=>Number(value.toFixed(4)).toLocaleString('es');
 function message(plan){const time=number(plan.remaining);return `La figura no cabe: solo ${plan.remaining===1?'queda':'quedan'} ${time} ${plan.remaining===1?'tiempo':'tiempos'} de negra en este compás. Puedes conservar su duración con ${plan.segments.map(p=>p.name).join(' + ')}, unidas por ligaduras entre compases. ¿Quieres escribirla así?`;}
 const api={plan,message};if(typeof module!=='undefined')module.exports=api;else root.CrescendoOverflowWriting=api;
})(typeof window==='undefined'?globalThis:window);
