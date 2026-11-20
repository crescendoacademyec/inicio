(function(root){'use strict';
function parse(text){
 const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw Error('MusicXML no válido.');
 const part=doc.querySelector('score-partwise > part');if(!part)throw Error('Se requiere MusicXML score-partwise.');
 const measures=[...part.querySelectorAll(':scope > measure')];if(!measures.length||measures.length>256)throw Error('El ejercicio debe tener entre 1 y 256 compases.');
 const events=[],marks=[],pending=new Map(),endings=new Map(),voicesByStaff=new Map(),systemBreaks=[];let divisions=1,meter='4/4',capacity=4,clef='treble',id=0;
 const value=(node,selector,fallback='')=>node.querySelector(selector)?.textContent.trim()||fallback;
 measures.forEach((measure,bar)=>{let cursor=0,last=0,extent=0;const lastVoices=new Map();
  for(const node of measure.children){
   if(node.localName==='attributes'){
    divisions=Number(value(node,'divisions',String(divisions)));
    if(!(divisions>0))throw Error('Divisiones MusicXML no válidas.');
    const top=value(node,'time > beats'),bottom=value(node,'time > beat-type');if(top&&bottom){meter=top+'/'+bottom;capacity=Number(top)*4/Number(bottom);if(!(capacity>0))throw Error('Compás no válido.');marks.push({type:'meter',bar,meter});}
    const fifths=value(node,'key > fifths');if(fifths!=='')marks.push({type:'key',bar,fifths:Number(fifths)});
    if(Number(value(node,'staves','1'))>1)clef='grand';else if(value(node,'clef > sign')==='F'&&bar===0)clef='bass';
    continue;
   }
   const beats=Number(value(node,':scope > duration','0'))/divisions;
   if(node.localName==='backup'){extent=Math.max(extent,cursor);cursor-=beats;continue;}if(node.localName==='forward'){cursor+=beats;extent=Math.max(extent,cursor);continue;}
   if(node.localName==='harmony'){const name=root.CrescendoScoreImportDetails.harmony(node);if(name)marks.push({type:'chord',bar,offset:cursor+Number(value(node,'offset','0'))/divisions,text:name});continue;}
   if(node.localName==='direction'){
    for(const d of root.CrescendoScoreImportDetails.directions(node,cursor,divisions)){
     if(d.kind==='navigation')marks.push({type:{dcFine:'dc',dsFine:'ds',dc:'dcPlain',ds:'dsPlain'}[d.navigation]||d.navigation,bar,offset:d.tick,target:d.target});
     else if(d.kind==='dynamic')marks.push({type:'dynamic',bar,offset:d.tick,staff:Number(value(node,'staff','1')),value:d.text});
     else if(d.kind==='words')marks.push({type:'text',bar,offset:d.tick,text:d.text});
     else if(d.kind==='tempo')marks.push({type:'tempo',bar,offset:d.tick,bpm:d.bpm,unitDurationId:d.unitDurationId,dots:d.dots});
    }continue;
   }
   if(node.localName==='barline'){
    const repeat=node.querySelector('repeat'),ending=node.querySelector('ending'),style=value(node,'bar-style');
    if(repeat)marks.push({type:repeat.getAttribute('direction')==='forward'?'repeatStart':'repeatEnd',bar,times:Number(repeat.getAttribute('times'))||2,afterJump:repeat.getAttribute('after-jump')==='yes'});
    if(style==='light-heavy')marks.push({type:'barFinal',bar});else if(style==='light-light')marks.push({type:'barDouble',bar});
    if(ending){const number=ending.getAttribute('number')||'1';if(ending.getAttribute('type')==='start'){const m={type:'volta',bar,number,endBar:bar};marks.push(m);endings.set(number,m);}else if(endings.has(number)){endings.get(number).endBar=bar;endings.delete(number);}}
    continue;
   }
   if(node.localName!=='note')continue;
   const chord=!!node.querySelector('chord'),grace=!!node.querySelector('grace'),rest=!!node.querySelector('rest'),staff=Number(value(node,'staff','1'))===2?2:clef==='bass'?2:1,offset=chord?last:cursor;
   if(!grace&&(!(beats>0)||offset<-.0001||offset+beats>capacity+.0001))throw Error(`La duración excede el compás ${measure.getAttribute('number')||bar+1} o no es válida. Revisa la partitura de origen.`);
   const voice=value(node,'voice',chord?lastVoices.get(staff)||'1':'1');if(!chord&&!grace)lastVoices.set(staff,voice);const voiceKey=bar+':'+staff;if(!voicesByStaff.has(voiceKey))voicesByStaff.set(voiceKey,new Set());voicesByStaff.get(voiceKey).add(voice);if(voicesByStaff.get(voiceKey).size>1)throw Error('Esta parte tiene varias voces en un pentagrama. Ábrela en Editor Crescendo para conservarlas.');
   if(rest)events.push({id:'import-'+(++id),kind:'rest',bar,offset,staff,beats});
   if(!rest){const step=value(node,'pitch > step'),octave=value(node,'pitch > octave'),alter=Number(value(node,'pitch > alter','0'));if(!/^[A-G]$/.test(step)||!/^[-]?\d+$/.test(octave)||Math.abs(alter)>1)throw Error('Altura o alteración no compatible.');
    const note=step+(alter===1?'#':alter===-1?'b':'')+octave;let entry=chord?events.find(e=>e.bar===bar&&e.offset===offset&&e.staff===staff&&!e.grace):null;
    if(entry){entry.notes=[...(entry.notes||[entry.note]),note];entry.accidentalsByNote[step+octave]=alter===1?'sharp':alter===-1?'flat':'natural';}else{entry={id:'import-'+(++id),bar,offset,staff,note,accidentalsByNote:{[step+octave]:alter===1?'sharp':alter===-1?'flat':'natural'},beats:grace?0:beats,grace:grace||undefined};events.push(entry);}
    const actual=Number(value(node,'time-modification > actual-notes','0')),normal=Number(value(node,'time-modification > normal-notes','0'));if(actual&&normal)Object.assign(entry,{tupletActual:actual,tupletNormal:normal,tupletUnitBeats:beats*actual/normal});
    const key=staff+':'+note;if(node.querySelector('tie[type="stop"]')&&pending.has(key))pending.get(key).tieToId=entry.id;if(node.querySelector('tie[type="start"]'))pending.set(key,entry);else pending.delete(key);
   }
   if(!chord){last=cursor;if(!grace)cursor+=beats;}extent=Math.max(extent,cursor);
  }
  const print=measure.querySelector(':scope > print');if(bar>0&&(print?.getAttribute('new-system')==='yes'||print?.getAttribute('new-page')==='yes'))systemBreaks.push(bar);
  if((measure.getAttribute('implicit')==='yes'||measure.getAttribute('number')==='0')&&extent>0&&extent<capacity-.0001)marks.push({type:'measureDuration',bar,beats:extent,implicit:true});
 });const storedLayout=doc.querySelector('miscellaneous-field[name="crescendo:system-breaks"]');if(storedLayout){const value=JSON.parse(storedLayout.textContent);if(!Array.isArray(value))throw Error('Distribución de sistemas no válida.');marks.push({type:'systemLayout',bar:0,breaks:root.CrescendoSystemLayout.normalize(value,measures.length)});}else if(systemBreaks.length)marks.push({type:'systemLayout',bar:0,breaks:systemBreaks});const encoded=doc.querySelector('miscellaneous-field[name="crescendo:measure-route"]');if(encoded){const route=JSON.parse(encoded.textContent);root.CrescendoPerformancePlan.route(measures.length,[],{count:measures.length,route});marks.push({type:'playbackRoute',bar:0,route,count:measures.length});}return {creators:root.CrescendoScoreHeading.fromXml(doc),title:doc.querySelector('work > work-title')?.textContent||doc.querySelector('movement-title')?.textContent||'',events,marks,bars:measures.length,clef,warning:doc.querySelectorAll("score-partwise > part").length>1?"Se importó la primera parte del archivo.":""};
}
root.CrescendoRhythmImport={parse};
})(typeof window==='undefined'?globalThis:window);
