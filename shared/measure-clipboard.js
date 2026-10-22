(function(root){'use strict';let serial=0;
 function clone(value,makeId=()=>`measure-copy-${Date.now()}-${++serial}`){const copy=JSON.parse(JSON.stringify(value)),ids=new Map();
  function collect(v){if(!v||typeof v!=='object')return;for(const key of ["id","groupId","tupletGroupId"])if(v[key]&&!ids.has(v[key]))ids.set(v[key],makeId());Object.values(v).forEach(collect);}collect(copy);
  const references=new Set(['entryId','endEntryId','tieToId','tieFromId','slurToId','glissandoToId']);
  function remap(v){if(!v||typeof v!=='object')return;for(const [key,item]of Object.entries(v)){if(key==='id')v[key]=ids.get(item);else if(typeof item==='string'&&ids.has(item))v[key]=ids.get(item);else if(references.has(key)&&item&&!ids.has(item))delete v[key];else remap(item);}}remap(copy);return copy;
 }
 function fits(entries,capacity,start='offset',duration='beats'){return entries.every(e=>(Number(e[start])||0)+(Number(e[duration])||0)<=capacity+1e-6);}
 const api={clone,fits};if(typeof module!=='undefined')module.exports=api;else root.CrescendoMeasureClipboard=api;
})(typeof window==='undefined'?globalThis:window);
