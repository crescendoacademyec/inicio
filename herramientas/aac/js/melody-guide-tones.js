/* Optional practice part. Source melody is never rewritten. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AACGuideTones=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';const mod=n=>(n%12+12)%12;
 function chordInfo(symbol){
  const m=String(symbol||'').replace(/[♭]/g,'b').replace(/[♯]/g,'#').match(/^([A-G])([b#]{0,2})([^/]*)/);if(!m)return null;
  const pc=mod({C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2].includes('b')?-m[2].length:m[2].length)),q=m[3].replace(/[△Δ∆]/g,'maj7').replace(/^[−–-]/,'m').replace(/ø/,'m7b5').replace(/^°|^o(?=7|$)/g,'dim');
  const minor=/^(m(?!aj)|min|dim)/.test(q),suspended=/sus/.test(q),third=/sus2/.test(q)?2:suspended?5:minor?3:4;
  // Never invent an unwritten seventh: triads use their fifth and sixth chords
  // use their sixth. Suspensions retain the second/fourth in place of a third.
  const extension=q.replace(/add\s*\(?\s*(?:2|4|9|11|13)\)?/g,''),hasSeventh=/7|9|11|13/.test(extension);
  const fifth=/dim|b5/.test(q)?6:/aug|\+|#5/.test(q)?8:7,companion=hasSeventh?(/dim(?!.*maj)/.test(q)?9:/maj|M(?:7|9|11|13)/.test(q)?11:10):/6/.test(extension)?9:fifth;
  return {step:m[1],pc,third,thirdDegree:/sus2/.test(q)?2:suspended?4:3,fifth,companion,companionDegree:hasSeventh?7:/6/.test(extension)?6:5};
 }
 function tones(symbol,useFifth=false){const chord=chordInfo(symbol);return chord?[mod(chord.pc+chord.third),mod(chord.pc+(useFifth?chord.fifth:chord.companion))]:[];}
 function spelling(midi,symbol){
  const chord=chordInfo(symbol);if(!chord)return null;
  const pc=mod(midi),degree=pc===mod(chord.pc+chord.third)?chord.thirdDegree:pc===mod(chord.pc+chord.companion)?chord.companionDegree:pc===mod(chord.pc+chord.fifth)?5:null;if(!degree)return null;
  const letters='CDEFGAB',natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11},step=letters[(letters.indexOf(chord.step)+degree-1)%7],alter=mod(pc-natural[step]+6)-6;
  return {step,alter,octave:(midi-natural[step]-alter)/12-1};
 }
 function safe(midi,melody){return melody.every(n=>{const d=Math.abs(midi-n);return d!==0&&d!==1&&d!==13;});}
 function choose(pcs,melody,previous=[],register=melody,alternatives=[]){
  if(!pcs.length)return [];
  function candidatesFor(pc){let notes=[];for(let n=21;n<=108;n++)if(mod(n)===pc&&safe(n,melody))notes.push(n);
   // Dense imported passages can block every consonant octave. Keep the chord
   // tones without ever sharing a physical key with the melody.
   if(!notes.length)for(let n=21;n<=108;n++)if(mod(n)===pc&&!melody.includes(n))notes.push(n);
   if(!notes.length)throw Error('No hay una octava libre para los tonos guía de este pasaje.');return notes;
  }
  // C3–B3 is the home register. Neighbouring octaves are available for collisions
  // or low melodies, without chasing the right hand into many ledger lines.
  const ceiling=melody.length?Math.min(...melody):Infinity,target=register.length?Math.min(59,Math.min(...register)-5):59,prior=[...previous].sort((a,b)=>a-b);
  const cost=notes=>{const top=notes.at(-1),span=top-notes[0],movement=prior.length?notes.reduce((sum,n,i)=>sum+Math.abs(n-(prior[i]??n)),0):0;
   const outsideRegister=notes.reduce((sum,n)=>sum+(n<48?48-n:n>59?n-59:0),0);
   return Math.max(0,top-ceiling+1)*100+Math.max(0,span-12)*100+outsideRegister*12+Math.abs(top-target)*3+movement*.8+span*.1;
  };
  let best=null,bestCost=Infinity;
  for(const [variant,pitches]of [pcs,...alternatives].entries()){
   const candidates=pitches.map(candidatesFor);
   function combine(index,notes){if(index===candidates.length){const sorted=[...notes].sort((a,b)=>a-b),value=cost(sorted)+(variant?36:0);if(value<bestCost){best=sorted;bestCost=value;}return;}for(const n of candidates[index])if(!notes.includes(n))combine(index+1,[...notes,n]);}
   combine(0,[]);
  }return best||[];
 }
 function plan(chords,notes,length,previous=[]){
  chords=[...chords].sort((a,b)=>a.beat-b.beat);
  const changes=[];
  for(const chord of chords){if(chord.beat<0||chord.beat>=length)continue;if(changes.at(-1)?.beat===chord.beat)changes.pop();changes.push(chord);}
  chords=changes.filter((chord,index)=>!index||chord.symbol!==changes[index-1].symbol);
  const boundaries=[...new Set([0,length,...chords.map(c=>c.beat)])].sort((a,b)=>a-b),segments=[];
  for(let i=0;i<boundaries.length-1;i++){
   const start=boundaries[i],end=boundaries[i+1],chord=chords.filter(c=>c.beat<=start+1e-8).at(-1),melody=notes.filter(n=>n.start<end-1e-8&&n.end>start+1e-8).map(n=>n.midi),pcs=tones(chord?.symbol),fifth=tones(chord?.symbol,true),pitches=choose(pcs,melody,previous,melody,JSON.stringify(pcs)===JSON.stringify(fifth)?[]:[fifth]);
   segments.push({start,end,pitches,symbol:chord?.symbol||'',omitted:pcs.length-pitches.length});if(pitches.length)previous=pitches;
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
     const n=make('note');if(i)n.append(make('chord'));if(midi===null)n.append(make('rest'));else{const sp=spelling(midi,segment.symbol)||Core.spelling(midi,fifths),pitch=make('pitch');pitch.append(make('step',sp.step),make('alter',sp.alter),make('octave',sp.octave));n.append(pitch);}
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
 return {tones,spelling,safe,choose,plan,durations,add};
});
