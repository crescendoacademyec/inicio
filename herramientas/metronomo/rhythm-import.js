(function(root){'use strict';
function parse(text){
 const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw Error('MusicXML no válido.');
 const part=doc.querySelector('score-partwise > part');if(!part)throw Error('Se requiere MusicXML score-partwise.');
 const measures=[...part.querySelectorAll(':scope > measure')];if(!measures.length||measures.length>16)throw Error('El ejercicio debe tener entre 1 y 16 compases.');
 const events=[],marks=[],pending=new Map();let divisions=1,meter='4/4',capacity=4,clef='treble',id=0;
 const value=(node,selector,fallback='')=>node.querySelector(selector)?.textContent.trim()||fallback;
 measures.forEach((measure,bar)=>{let cursor=0,last=0;
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
   if(node.localName==='backup'){cursor-=beats;continue;}if(node.localName==='forward'){cursor+=beats;continue;}
   if(node.localName==='harmony'){const name=value(node,'root > root-step'),alter=Number(value(node,'root > root-alter','0')),kind=value(node,'kind','major'),suffix={major:'',minor:'m',dominant:'7','major-seventh':'maj7','minor-seventh':'m7',diminished:'dim','half-diminished':'m7b5'}[kind]??kind;marks.push({type:'chord',bar,offset:cursor,text:name+(alter===1?'#':alter===-1?'b':'')+suffix});continue;}
   if(node.localName!=='note')continue;
   const chord=!!node.querySelector('chord'),grace=!!node.querySelector('grace'),rest=!!node.querySelector('rest'),staff=Number(value(node,'staff','1'))===2?2:clef==='bass'?2:1,offset=chord?last:cursor;
   if(!grace&&(!(beats>0)||offset<-.0001||offset+beats>capacity+.0001))throw Error('Duración de nota fuera del compás.');
   if(!rest){const step=value(node,'pitch > step'),octave=value(node,'pitch > octave'),alter=Number(value(node,'pitch > alter','0'));if(!/^[A-G]$/.test(step)||!/^[-]?\d+$/.test(octave)||Math.abs(alter)>1)throw Error('Altura o alteración no compatible.');
    const note=step+(alter===1?'#':alter===-1?'b':'')+octave;let entry=chord?events.find(e=>e.bar===bar&&e.offset===offset&&e.staff===staff&&!e.grace):null;
    if(entry){entry.notes=[...(entry.notes||[entry.note]),note];}else{entry={id:'import-'+(++id),bar,offset,staff,note,beats:grace?0:beats,grace:grace||undefined};events.push(entry);}
    const actual=Number(value(node,'time-modification > actual-notes','0')),normal=Number(value(node,'time-modification > normal-notes','0'));if(actual&&normal)Object.assign(entry,{tupletActual:actual,tupletNormal:normal,tupletUnitBeats:beats*actual/normal});
    const key=staff+':'+note;if(node.querySelector('tie[type="stop"]')&&pending.has(key))pending.get(key).tieToId=entry.id;if(node.querySelector('tie[type="start"]'))pending.set(key,entry);else pending.delete(key);
   }
   if(!chord){last=cursor;if(!grace)cursor+=beats;}
  }
 });return {events,marks,bars:measures.length,clef,warning:doc.querySelectorAll("score-partwise > part").length>1?"Se importó la primera parte del archivo.":""};
}
root.CrescendoRhythmImport={parse};
})(typeof window==='undefined'?globalThis:window);
