(function(root){'use strict';
 const natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11},letters='CDEFGAB';
 const defaults=['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
 const roots=['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];
 const mod=n=>(n%12+12)%12;
 function pc(name){const m=/^([A-G])([#b♯♭]*)$/.exec(String(name));return m?mod(natural[m[1]]+[...m[2]].reduce((n,c)=>n+(['#','♯'].includes(c)?1:-1),0)):-1;}
 function name(value,context=''){const sharp=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],flat=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];return (context?(/[b♭]/.test(context)||context==='F'?flat:sharp):defaults)[mod(value)];}
 function degree(interval,suffix=''){
  const iv=mod(interval);if(iv===3)return /#9/.test(suffix)?1:2;if(iv===6)return /#11/.test(suffix)?3:4;
  if(iv===8)return /b13|♭13/.test(suffix)?5:4;if(iv===9)return /dim|º|°/.test(suffix)?6:5;
  return {0:0,1:1,2:1,4:2,5:3,7:4,10:6,11:6}[iv];
 }
 function spell(midi,rootName='',suffix=''){
  const rootPc=pc(rootName),fallback=name(midi,rootName);
  const step=rootPc<0?null:degree(mod(midi-rootPc),suffix);
  let letter=step===null?fallback[0]:letters[(letters.indexOf(rootName[0])+step)%7];
  let alter=mod(midi-natural[letter]+6)-6;
  if(Math.abs(alter)>2){letter=fallback[0];alter=mod(midi-natural[letter]+6)-6;}
  const accidental=alter<0?'b'.repeat(-alter):'#'.repeat(alter),octave=Math.round((midi-natural[letter]-alter)/12)-1;
  return {letter,alter,octave,name:letter+accidental,accidental};
 }
 const api={pc,name,spell,roots,defaults,degree};if(typeof module!=='undefined')module.exports=api;else root.CrescendoPitchSpelling=api;
})(typeof window==='undefined'?globalThis:window);
