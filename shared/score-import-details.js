(function(root){'use strict';
const children=(n,name)=>Array.from(n?.children||[]).filter(c=>(c.localName||c.tagName)===name),child=(n,name)=>children(n,name)[0],text=n=>n?.textContent?.trim()||'',number=(n,fallback=0)=>n&&Number.isFinite(Number(text(n)))?Number(text(n)):fallback;
const types={'16th':'sixteenth','32nd':'thirty-second','64th':'sixty-fourth','128th':'one-twenty-eighth'};
const kinds={major:'',minor:'m',dominant:'7','dominant-seventh':'7','major-seventh':'maj7','minor-seventh':'m7',diminished:'dim','diminished-seventh':'dim7','half-diminished':'m7b5',augmented:'aug','augmented-seventh':'aug7','major-sixth':'6','minor-sixth':'m6','suspended-second':'sus2','suspended-fourth':'sus4','major-ninth':'maj9','dominant-ninth':'9','minor-ninth':'m9','major-11th':'maj11','dominant-11th':'11','minor-11th':'m11','major-13th':'maj13','dominant-13th':'13','minor-13th':'m13',power:'5',other:'',none:''};
function noteName(n,prefix){if(!n)return '';const alter=number(child(n,prefix+'-alter'));return text(child(n,prefix+'-step'))+(alter>0?'#'.repeat(alter):'b'.repeat(-alter));}
function harmony(n){
 if(text(child(n,'kind'))==='none')return 'N.C.';
 const tonic=noteName(child(n,'root'),'root');if(!tonic)return null;
 const kind=child(n,'kind'),suffix=kind?.getAttribute('text')||kinds[text(kind)]||'',degrees=[];
 for(const degree of children(n,'degree')){const value=number(child(degree,'degree-value')),alter=number(child(degree,'degree-alter')),type=text(child(degree,'degree-type'));if(!value)continue;const token=type==='subtract'?'omit'+value:(alter>0?'#'.repeat(alter):'b'.repeat(-alter))+value;if(!suffix.includes(token))degrees.push(token);}
 const bass=noteName(child(n,'bass'),'bass');return tonic+suffix+(degrees.length?'('+degrees.join(',')+')':'')+(bass?'/'+bass:'');
}
function directions(n,tick=0,divisions=1,units=1){
 const at=tick+number(child(n,'offset'))/divisions*units,out=[],sound=child(n,'sound'),bodies=children(n,'direction-type'),words=bodies.flatMap(b=>children(b,'words')).map(text).filter(Boolean).join(' ');
 const has=name=>bodies.some(b=>child(b,name)),attr=name=>sound?.getAttribute(name),yes=name=>{const v=attr(name);return v&&v!=='no';};
 let navigation=has('segno')||yes('segno')?'segno':has('coda')||yes('coda')?'coda':yes('tocoda')?'toCoda':yes('dacapo')?'dc':yes('dalsegno')?'ds':yes('fine')?'fine':null;
 const label=words.replace(/[.\s]/g,'').toLowerCase();
 if(!navigation){if(/^d[ac]c?apo|^dc/.test(label))navigation='dc';else if(/^dalsegno|^ds/.test(label))navigation='ds';else if(/^(?:to|al)coda$/.test(label))navigation='toCoda';else if(label==='fine')navigation='fine';}
 if(['dc','ds'].includes(navigation))navigation+=/coda/.test(label)?'Coda':/fine/.test(label)?'Fine':'';
 if(navigation)out.push({kind:'navigation',navigation,tick:at,text:words,target:attr(navigation.startsWith('ds')?'dalsegno':navigation==='toCoda'?'tocoda':navigation)||undefined});
 for(const body of bodies){
  const met=child(body,'metronome'),bpm=number(child(met,'per-minute'));if(bpm>0)out.push({kind:'tempo',tick:at,bpm,unitDurationId:types[text(child(met,'beat-unit'))]||text(child(met,'beat-unit'))||'quarter',dots:children(met,'beat-unit-dot').length});
  const dynamic=child(body,'dynamics');for(const mark of Array.from(dynamic?.children||[])){const name=mark.localName||mark.tagName;if(name!=='other-dynamics')out.push({kind:'dynamic',tick:at,text:name});}
  for(const rehearsal of children(body,'rehearsal'))out.push({kind:'words',tick:at,text:text(rehearsal)});
 }
 if(!out.some(x=>x.kind==='tempo')&&Number(attr('tempo'))>0)out.push({kind:'tempo',tick:at,bpm:Number(attr('tempo')),unitDurationId:'quarter',dots:0});
 if(words&&!navigation)out.push({kind:'words',tick:at,text:words});return out;
}
const api={harmony,directions};if(typeof module!=='undefined')module.exports=api;else root.CrescendoScoreImportDetails=api;
})(typeof window==='undefined'?globalThis:window);
