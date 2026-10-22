(function(root){'use strict';
 const tuning=[64,59,55,50,45,40];
 function midi(string,fret){return Number.isInteger(string)&&string>=1&&string<=6&&Number.isInteger(fret)&&fret>=0&&fret<=24?tuning[string-1]+fret:null;}
 function positions(note){return tuning.flatMap((open,index)=>note>=open&&note<=open+24?[{string:index+1,fret:note-open,midi:note}]:[]);}
 // One playable position per pitch; never place two chord notes on the same string.
 function fingering(notes,saved=[]){
  const ordered=[...new Set(notes)].sort((a,b)=>a-b);let best=null,bestCost=Infinity;
  function visit(index,chosen,used){if(index===ordered.length){const frets=chosen.map(p=>p.fret).filter(Boolean);const span=frets.length?Math.max(...frets)-Math.min(...frets):0;const cost=span*10+chosen.reduce((n,p)=>n+p.fret,0);if(cost<bestCost){bestCost=cost;best=chosen.slice();}return;}
   const note=ordered[index],stored=saved.find(p=>p.midi===note&&midi(p.string,p.fret)===note);
   const candidates=stored?[stored]:positions(note);
   candidates.forEach(p=>{if(!used.has(p.string)){used.add(p.string);chosen.push(p);visit(index+1,chosen,used);chosen.pop();used.delete(p.string);}});
  }
  visit(0,[],new Set());return best||[];
 }
 const api={tuning,midi,positions,fingering};if(typeof module!=='undefined')module.exports=api;else root.JMLScoreGuitar=api;
})(typeof window==='undefined'?globalThis:window);
