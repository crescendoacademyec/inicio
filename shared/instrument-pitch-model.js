/* Shared sounding-pitch geometry extracted from Piano Virtual and Diapasón Virtual.
 * String arrays run from first/high string to sixth/low string. C4 = MIDI 60. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CrescendoInstrumentPitch=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
 const GUITAR_TUNINGS=[
  {value:'standard',label:'Estándar · E A D G B E',pitches:[64,59,55,50,45,40]},
  {value:'drop_d',label:'Drop D · D A D G B E',pitches:[64,59,55,50,45,38]},
  {value:'dadgad',label:'DADGAD · D A D G A D',pitches:[62,57,55,50,45,38]},
  {value:'open_g',label:'Open G · D G D G B D',pitches:[62,59,55,50,43,38]},
  {value:'open_d',label:'Open D · D A D F# A D',pitches:[62,57,54,50,45,38]}
 ];
 function noteInfo(midi){if(!Number.isInteger(midi)||midi<0||midi>127)throw Error('Altura MIDI no válida');const idx=midi%12,name=NAMES[idx];return {midi,name,octave:Math.floor(midi/12)-1,isBlack:name.includes('#'),freq:440*2**((midi-69)/12),idx};}
 function keyboardLayout(min,max){if(!Number.isInteger(min)||!Number.isInteger(max)||min<0||max>127||min>max)throw Error('Rango de teclado no válido');const notes=Array.from({length:max-min+1},(_,i)=>noteInfo(min+i)),whiteCount=notes.filter(n=>!n.isBlack).length;if(!whiteCount)throw Error('Incluye al menos una tecla blanca');const whiteWidth=100/whiteCount,blackWidth=whiteWidth*.58;let wi=0;return notes.map(n=>({...n,left:n.isBlack?wi*whiteWidth-blackWidth/2:wi++*whiteWidth,width:n.isBlack?blackWidth:whiteWidth}));}
 function guitarPositions(midi,pitches=GUITAR_TUNINGS[0].pitches,maxFret=22){if(!Number.isInteger(midi)||midi<0||midi>127)return [];if(!Array.isArray(pitches)||pitches.length!==6||pitches.some(n=>!Number.isInteger(n)||n<0||n>127)||!Number.isInteger(maxFret)||maxFret<0||maxFret>36)throw Error('Afinación o número de trastes no válido');return pitches.flatMap((open,index)=>{const fret=midi-open;return fret>=0&&fret<=maxFret?[{string:index+1,fret,midi}]:[];});}
 // Dynamic programming suggests a melodic route with small fret/string movement.
 // Null is explicit for out-of-range notes; no octave substitution is made.
 function guitarRoute(events,pitches,maxFret=22,preferredFret=5){const result=Array(events.length).fill(null);let segment=[];function flush(){if(!segment.length)return;let costs=[],parents=[];segment.forEach((item,i)=>{const row=item.options.map((p,j)=>{if(!i)return Math.abs(p.fret-preferredFret)*.7;let best=Infinity,parent=0;segment[i-1].options.forEach((prev,k)=>{const cost=costs[i-1][k]+Math.abs(p.fret-prev.fret)+.65*Math.abs(p.string-prev.string)+.08*Math.abs(p.fret-preferredFret);if(cost<best){best=cost;parent=k;}});(parents[i]||=[])[j]=parent;return best;});costs.push(row);});let at=costs.at(-1).indexOf(Math.min(...costs.at(-1)));for(let i=segment.length-1;i>=0;i--){result[segment[i].index]=segment[i].options[at];at=parents[i]?.[at]??0;}segment=[];}
 events.forEach((e,index)=>{const options=guitarPositions(e.midi,pitches,maxFret);if(!options.length){flush();return;}segment.push({index,options});});flush();return result;}
 return {NAMES,GUITAR_TUNINGS,noteInfo,keyboardLayout,guitarPositions,guitarRoute};
});
