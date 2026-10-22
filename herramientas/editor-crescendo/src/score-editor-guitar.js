(function(root){'use strict';
 const profiles={
  guitar:{id:'guitar',name:'Guitarra',tuning:[64,59,55,50,45,40],labels:['Mi4','Si3','Sol3','Re3','La2','Mi2'],fretted:true},
  bass:{id:'bass',name:'Bajo',tuning:[43,38,33,28],labels:['Sol2','Re2','La1','Mi1'],fretted:true},
  ukulele:{id:'ukulele',name:'Ukelele',tuning:[69,64,60,67],labels:['La4','Mi4','Do4','Sol4'],fretted:true},
  violin:{id:'violin',name:'Violín',tuning:[76,69,62,55],labels:['Mi5','La4','Re4','Sol3'],fretted:false}
 };
 // Same first, third and fifth position guides as the bowed-string instrument app.
 const violinPositions={I:[[1,1],[2,1],[3,2],[4,2],[5,3],[6,3],[7,4]],III:[[5,1],[6,1],[7,2],[8,2],[9,3],[10,3],[11,4]],V:[[9,1],[10,1],[11,2],[12,2],[13,3],[14,3],[15,4]]};
 function technique(semitones,preferred='I'){
  if(semitones===0)return {finger:0,position:'aire'};
  for(const position of [preferred,...Object.keys(violinPositions).filter(p=>p!==preferred)]){
   const found=violinPositions[position]?.find(([offset])=>offset===semitones);
   if(found)return {finger:found[1],position};
  }
  return {finger:null,position:'libre'};
 }
 function create(profile){
 const tuning=profile.tuning;
 function midi(string,fret){return Number.isInteger(string)&&string>=1&&string<=tuning.length&&Number.isInteger(fret)&&fret>=0&&fret<=24?tuning[string-1]+fret:null;}
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
 return {...profile,midi,positions,fingering};
 }
 const forInstrument=id=>profiles[id]?create(profiles[id]):null;
 const api={...forInstrument('guitar'),profiles,forInstrument,violinPositions,technique};if(typeof module!=='undefined')module.exports=api;else root.JMLScoreGuitar=api;
})(typeof window==='undefined'?globalThis:window);
