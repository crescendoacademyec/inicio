/* Performed order shared by the notation editors. Times are milliseconds. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./score-playback-route.js'):root.CrescendoScoreRoute);if(typeof module==='object'&&module.exports)module.exports=api;else root.CrescendoPerformancePlan=api;})(typeof globalThis==='object'?globalThis:this,function(Route){
 'use strict';const EPS=1e-7;
 function edit(encoded,index,operation){
  if(!encoded)return null;const count=encoded.count,insert=operation==='insert';
  if(!Number.isInteger(index)||index<0||index>(insert?count:count-1))throw Error('Índice de compás no válido.');
  let route=insert?encoded.route.flatMap(bar=>bar===index?[index,bar+1]:bar>=index?[bar+1]:[bar]):encoded.route.filter(bar=>bar!==index).map(bar=>bar>index?bar-1:bar);
  if(insert&&index===count){route=encoded.route.flatMap(bar=>bar===count-1?[bar,index]:[bar]);}
  if(!route.length)route=Array.from({length:count+(insert?1:-1)},(_,i)=>i);
  return {count:count+(insert?1:-1),route};
 }
 function resize(encoded,count){if(encoded&&(!Number.isInteger(encoded.count)||encoded.count<1||encoded.count>5000||!Array.isArray(encoded.route)))throw Error('Recorrido de compases no válido.');let value=encoded;if(!value)return null;while(value.count<count)value=edit(value,value.count,'insert');while(value.count>count)value=edit(value,value.count-1,'remove');return value;}
 function rebar(encoded,oldStarts,newStarts){
  if(!encoded)return null;const route=[],source=resize(encoded,oldStarts.length-1).route;
  for(let i=0;i<source.length;){let last=i;while(last+1<source.length&&source[last+1]===source[last]+1)last++;
   const first=newStarts.findIndex(t=>Math.abs(t-oldStarts[source[i]])<EPS),end=newStarts.findIndex(t=>Math.abs(t-oldStarts[source[last]+1])<EPS);
   if(first<0||end<0)throw Error('Los saltos del recorrido quedan dentro de un compás con esta métrica. No se modificó la partitura.');
   for(let bar=first;bar<end;bar++)route.push(bar);i=last+1;
  }
  return {count:newStarts.length-1,route};
 }
 function route(count,marks=[],encoded=null){
  if(encoded){const value=resize(encoded,count);if(!Array.isArray(value.route)||!value.route.length||value.route.length>20000||value.route.some(i=>!Number.isInteger(i)||i<0||i>=count))throw Error('Recorrido de compases no válido.');return [...value.route];}
  const measures=Array.from({length:count},()=>({forward:false,backward:null,endings:[],controls:{}}));
  for(const m of marks){const at=measures[m.bar];if(!at)continue;
   if(m.type==='repeatStart')at.forward=true;
   if(m.type==='repeatEnd')at.backward={times:Math.max(2,Number(m.times)||2),afterJump:!!m.afterJump};
   if(m.type==='volta'){at.endings.push({type:'start',numbers:String(m.number||1).split(/[, ]+/).map(Number)});measures[Math.min(count-1,m.endBar??m.bar)].endings.push({type:'stop',numbers:[]});}
   const nav=m.navigation||m.type;
   if(nav==='segno'||nav==='coda')at.controls[nav]=m.target||nav;
   else if(['dc','dcPlain','dcFine','dcCoda'].includes(nav))at.controls.dacapo='yes';
   else if(['ds','dsPlain','dsFine','dsCoda'].includes(nav))at.controls.dalsegno=m.target||'segno';
   else if(nav==='toCoda')at.controls.tocoda=m.target||'coda';else if(nav==='fine')at.controls.fine='yes';
  }
  return Route.itinerary(measures);
 }
 function compile({route,starts,events,msForTick,tickForMs}){
  const visits=[],expanded=[];let elapsed=0;
  route.forEach((bar,index)=>{const sourceStart=msForTick(starts[bar]),sourceEnd=msForTick(starts[bar+1]);if(!(sourceEnd>sourceStart))throw Error('Compás sin duración válida.');visits.push({bar,index,start:elapsed,end:elapsed+sourceEnd-sourceStart,sourceStart,sourceEnd});elapsed+=sourceEnd-sourceStart;});
  for(const visit of visits){let last=visit.index;while(last+1<visits.length&&visits[last+1].bar===visits[last].bar+1)last++;const until=visits[last].sourceEnd;
   const discontinuous=visit.index===0||visits[visit.index-1].bar!==visit.bar-1;
   for(const event of events){const onset=event.startMs>=visit.sourceStart-EPS&&event.startMs<visit.sourceEnd-EPS,held=discontinuous&&event.startMs<visit.sourceStart-EPS&&event.endMs>visit.sourceStart+EPS;if(!onset&&!held)continue;
    const start=Math.max(event.startMs,visit.sourceStart),end=Math.min(event.endMs,until);if(end<=start)continue;
    expanded.push({...event,startMs:visit.start+start-visit.sourceStart,endMs:visit.start+end-visit.sourceStart,visit:visit.index});
   }
  }
  return {events:expanded.sort((a,b)=>a.startMs-b.startMs),visits,durationMs:elapsed,
   offsetForTick(tick,visitIndex=null){if(tick>=starts.at(-1))return elapsed;const bar=Math.max(0,starts.findIndex((t,i)=>i+1<starts.length&&tick<starts[i+1]-EPS)),visit=Number.isInteger(visitIndex)&&visits[visitIndex]?.bar===bar?visits[visitIndex]:visits.find(v=>v.bar===bar);return visit?visit.start+msForTick(tick)-visit.sourceStart:elapsed;},
   visitAtMs(ms){return (visits.find(v=>ms<v.end-EPS)||visits.at(-1))?.index??0;},
   tickAtMs(ms){if(ms>=elapsed)return starts.at(-1);const visit=visits.find(v=>ms<v.end-EPS)||visits.at(-1);if(!visit)return 0;return tickForMs(visit.sourceStart+Math.max(0,ms-visit.start));}
  };
 }
 return {edit,resize,rebar,route,compile};
});
