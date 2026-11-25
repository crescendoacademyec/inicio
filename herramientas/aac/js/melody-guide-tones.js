/* Optional practice part. Source melody is never rewritten. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AACGuideTones=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';const mod=n=>(n%12+12)%12;
 function tones(symbol){
  const m=String(symbol||'').replace(/[♭]/g,'b').replace(/[♯]/g,'#').match(/^([A-G])([b#]{0,2})([^/]*)/);if(!m)return [];
  const pc=mod({C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2].includes('b')?-m[2].length:m[2].length)),q=m[3].replace(/[△Δ∆]/g,'maj').replace(/^[−–-]/,'m').replace(/ø/,'m7b5').replace(/^°|^o(?=7|$)/g,'dim');
  const noThird=/sus|no3|5$/.test(q)&&!/[b#]5/.test(q);
  const minor=/^(m(?!aj)|min|dim)/.test(q),third=minor?3:4,result=noThird?[]:[mod(pc+third)];
  if(/7|9|11|13/.test(q))result.push(mod(pc+(/dim7/.test(q)?9:/maj|M7/.test(q)?11:10)));
  return result;
 }
 function safe(midi,melody){return melody.every(n=>{const d=Math.abs(midi-n);return d!==0&&d!==1&&d!==13;});}
 function choose(pcs,melody,previous=[]){
  const chosen=[];
  pcs.forEach((pc,i)=>{const candidates=[];for(let n=36;n<=59;n++)if(mod(n)===pc&&safe(n,melody)&&!chosen.includes(n))candidates.push(n);
   candidates.sort((a,b)=>Math.abs(a-(previous[i]??48))-Math.abs(b-(previous[i]??48))||a-b);if(candidates.length)chosen.push(candidates[0]);
  });return chosen.sort((a,b)=>a-b);
 }
 function plan(chords,notes,length,previous=[]){
  chords=[...chords].sort((a,b)=>a.beat-b.beat);
  const boundaries=[...new Set([0,length,...chords.map(c=>c.beat),...notes.flatMap(n=>[n.start,n.end])])].filter(b=>b>=0&&b<=length).sort((a,b)=>a-b),segments=[];
  for(let i=0;i<boundaries.length-1;i++){
   const start=boundaries[i],end=boundaries[i+1],chord=chords.filter(c=>c.beat<=start+1e-8).at(-1),melody=notes.filter(n=>n.start<end-1e-8&&n.end>start+1e-8).map(n=>n.midi),pcs=tones(chord?.symbol),pitches=choose(pcs,melody,previous);
   const last=segments.at(-1);if(last&&JSON.stringify(last.pitches)===JSON.stringify(pitches))last.end=end;else segments.push({start,end,pitches,omitted:pcs.length-pitches.length});if(pitches.length)previous=pitches;
  }return segments;
 }
 function durations(beats){
  const types=[[4,'whole'],[2,'half'],[1,'quarter'],[.5,'eighth'],[.25,'16th'],[.125,'32nd'],[.0625,'64th']];
  const exact=[];for(const [b,type]of types){exact.push({beats:b,type,dots:0},{beats:b*1.5,type,dots:1},{beats:b*2/3,type,dots:0,tuplet:true});}exact.sort((a,b)=>b.beats-a.beats);
  const parts=[];while(beats>1e-7){let part=exact.find(p=>Math.abs(p.beats-beats)<1e-7)||exact.find(p=>!p.tuplet&&p.beats<=beats+1e-7);if(!part)part={beats,type:null,dots:0};parts.push(part);beats-=part.beats;}return parts;
 }
 function add(xml,Core,Transport=globalThis.CrescendoMusicXML){
  const doc=Core.document(xml),score=doc.documentElement,part=score.querySelector('part');if(!part)return {xml,omitted:0};
  score.querySelectorAll('part[id="AAC-GUIDE-TONES"],score-part[id="AAC-GUIDE-TONES"]').forEach(n=>n.remove());
  const make=(tag,text)=>{const n=doc.createElementNS(score.namespaceURI,tag);if(text!==undefined)n.textContent=String(text);return n;};
  const definition=make('score-part');definition.setAttribute('id','AAC-GUIDE-TONES');definition.append(make('part-name','Tonos guía'));score.querySelector('part-list').append(definition);
  const guide=make('part');guide.setAttribute('id','AAC-GUIDE-TONES');score.append(guide);const harmony=Core.harmony(xml);let divisions=1,capacity=4,fifths=0,previous=[],carried='',omitted=0;
  const sourceParts=[...score.children].filter(n=>n.localName==='part'&&n!==guide);
  const melodyBars=sourceParts.map(p=>[...p.children].filter(n=>n.localName==='measure'));
  const performed=sourceParts.map(p=>Transport.partMeasures(p,new Set()));
  melodyBars[0].forEach((measure,index)=>{
   const d=measure.querySelector('divisions');if(d)divisions=+d.textContent;const key=measure.querySelector('fifths');if(key)fifths=+key.textContent;const time=measure.querySelector('time');if(time)capacity=time.querySelector('beats').textContent.split('+').reduce((a,b)=>a+Number(b),0)*4/+time.querySelector('beat-type').textContent;
   const notes=[];let actual=0;
   for(const bars of performed){const bar=bars[index];if(!bar)continue;actual=Math.max(actual,bar.length);for(const n of bar.notes)notes.push({midi:n.midi,start:n.beat,end:n.beat+n.length});}
   const length=measure.getAttribute('implicit')==='yes'?actual:Math.max(actual,capacity),chords=harmony[index]?.chords||[],events=plan([{beat:0,symbol:carried},...chords],notes,length,previous);if(chords.length)carried=chords.at(-1).symbol;
   const target=make('measure');target.setAttribute('number',measure.getAttribute('number')||index+1);if(measure.getAttribute('implicit'))target.setAttribute('implicit',measure.getAttribute('implicit'));
   const attrs=make('attributes');attrs.append(make('divisions',divisions));for(const key of measure.querySelectorAll('attributes > key,attributes > time'))attrs.append(key.cloneNode(true));const clef=make('clef');clef.append(make('sign','F'),make('line',4));if(index===0)attrs.append(clef);target.append(attrs);
   for(const segment of events){
    omitted+=segment.omitted;const pitches=segment.pitches.length?segment.pitches:[null],chunks=durations(segment.end-segment.start);
    chunks.forEach((chunk,ci)=>pitches.forEach((midi,i)=>{
     const n=make('note');if(i)n.append(make('chord'));if(midi===null)n.append(make('rest'));else{const sp=Core.spelling(midi,fifths),pitch=make('pitch');pitch.append(make('step',sp.step),make('alter',sp.alter),make('octave',sp.octave));n.append(pitch);}
     n.append(make('duration',Math.round(chunk.beats*divisions)));
     const ties=midi===null?[]:[...(ci>0?['stop']:[]),...(ci<chunks.length-1?['start']:[])];for(const type of ties){const tie=make('tie');tie.setAttribute('type',type);n.append(tie);}
     n.append(make('voice',1));if(chunk.type)n.append(make('type',chunk.type));if(chunk.dots)n.append(make('dot'));
     if(chunk.tuplet){const ratio=make('time-modification');ratio.append(make('actual-notes',3),make('normal-notes',2));n.append(ratio);}
     if(ties.length){const notations=make('notations');for(const type of ties){const tied=make('tied');tied.setAttribute('type',type);notations.append(tied);}n.append(notations);}target.append(n);
    }));if(segment.pitches.length)previous=segment.pitches;
   }
   for(const b of measure.querySelectorAll(':scope > barline'))target.append(b.cloneNode(true));guide.append(target);
  });return {xml:new XMLSerializer().serializeToString(doc),omitted};
 }
 return {tones,safe,choose,plan,durations,add};
});
