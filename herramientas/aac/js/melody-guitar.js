/* One automatic fingering per sounding pitch; four frets are the default. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('../../../shared/instrument-pitch-model.js'));else root.AACMelodyGuitar=factory(root.CrescendoInstrumentPitch);})(typeof globalThis==='object'?globalThis:this,function(Pitch){
 'use strict';
 const better=(a,b)=>!b||a.count>b.count||a.count===b.count&&(a.priority>b.priority||a.priority===b.priority&&a.cost<b.cost);
 function fingering(midis,tuning,maxFret=22,previous=null){
  midis=[...new Set(midis)];if(!midis.length)return {positions:[],missing:[],range:null};
  const options=midis.map(midi=>Pitch.guitarPositions(midi,tuning,maxFret)),prior=new Map((previous?.positions||[]).map(p=>[p.midi,p]));
  function solve(start,width){
   const range={start,end:start+width-1,width};let states=new Map([[0,{count:0,priority:0,cost:0,positions:[]}]]);
   options.forEach((all,index)=>{const choices=all.filter(p=>p.fret===0||p.fret>=range.start&&p.fret<=range.end),next=new Map(states);
    for(const [mask,state]of states)for(const p of choices){const bit=1<<(p.string-1);if(mask&bit)continue;const old=prior.get(p.midi),movement=old?Math.abs(p.fret-old.fret)+Math.abs(p.string-old.string)*2:0;
     const candidate={count:state.count+1,priority:state.priority+midis.length-index,cost:state.cost+movement*2+Math.abs(p.fret-(start+(width-1)/2))*.1,positions:[...state.positions,p]},key=mask|bit;
     if(better(candidate,next.get(key)))next.set(key,candidate);
    }states=next;
   });
   let best;for(const state of states.values())if(better(state,best))best=state;
   return {...best,range,cost:best.cost+Math.abs(start-(previous?.range?.start||5))*.75};
  }
  const full=solve(1,maxFret),goal=full.count;let best;
  // A fifth fret is a hand extension; wider simultaneous spans would present
  // impossible fingerings as playable. Single-note melodies can always shift.
  for(let width=Math.min(4,maxFret);width<=Math.min(5,maxFret);width++){
   let candidate;for(let start=1;start<=maxFret-width+1;start++){const result=solve(start,width);if(better(result,candidate))candidate=result;}
   if(!best||candidate.count>best.count||candidate.count===best.count&&candidate.priority>best.priority)best=candidate;
   if(candidate.count===goal&&candidate.priority===full.priority)break;
  }
  return {positions:best.positions,missing:midis.filter(midi=>!best.positions.some(p=>p.midi===midi)),range:best.range};
 }
 function build(timeline,tuning,maxFret=22){
  const events=timeline?.events||[],changes=new Map(),active=new Map(),frames=[];let previous=null;
  const firstPart=events.find(e=>e.part!=='AAC-GUIDE-TONES')?.part;
  const change=(time,key,index)=>{if(!changes.has(time))changes.set(time,{start:[],end:[]});changes.get(time)[key].push(index);};
  events.forEach((e,index)=>{if(e.dur>0){change(e.start,'start',index);change(e.start+e.dur,'end',index);}});
  for(const [time,delta]of [...changes].sort((a,b)=>a[0]-b[0])){
   for(const index of delta.end)active.delete(index);for(const index of delta.start)active.set(index,events[index]);
   const notes=[...active].sort((a,b)=>Number(b[1].part===firstPart)-Number(a[1].part===firstPart)||a[0]-b[0]),value=fingering(notes.map(([,e])=>e.midi),tuning,maxFret,previous);
   frames.push({time,...value});if(value.positions.length)previous=value;
  }
  return frames;
 }
 function frameAt(frames,time){let lo=0,hi=frames.length-1,result=null;while(lo<=hi){const mid=(lo+hi)>>1;if(frames[mid].time<=time+1e-9){result=frames[mid];lo=mid+1;}else hi=mid-1;}return result;}
 return {fingering,build,frameAt};
});
