(function(root){'use strict';
const Structure=root.CrescendoRhythmStructure||(typeof require==='function'?require('./rhythm-structure.js'):null);
const TICKS=13440,durations=[['one-twenty-eighth',.03125,'8','Garrapatea'],['sixty-fourth',.0625,'7','Semifusa'],['thirty-second',.125,'6','Fusa'],['sixteenth',.25,'5','Semicorchea'],['eighth',.5,'4','Corchea'],['quarter',1,'3','Negra'],['half',2,'2','Blanca'],['whole',4,'1','Redonda'],['breve',8,'0','Cuadrada']];
const clampStaffIndex=index=>Math.max(-8,Math.min(20,index));
const ticks=b=>Math.round(b*TICKS),factor=d=>[1,1.5,1.75][d||0];
let decorationId=0;
function decorate(state,events,position,staff=1,capacity=4){
 const notes=events.filter(e=>(e.staff||1)===staff&&!e.grace&&e.kind!=='rest'&&e.bar===position.bar),note=notes.find(e=>Math.abs((e.offset||0)-position.beat)<.0001);
 if(!note)return 'Selecciona una nota existente para aplicar esta marca.';
 if(!note.id)note.id='rhythm-note-'+(++decorationId);
 if(['staccato','accent'].includes(state.tool)){note[state.tool]=!note[state.tool];return '';}
 if(!state.decorationStart){state.decorationStart=note.id;return 'Selecciona la segunda nota de la ligadura.';}
 const first=events.find(e=>e.id===state.decorationStart);if(!first){state.decorationStart=null;return 'Selecciona la primera nota otra vez.';}
 if(first===note){state.decorationStart=null;return 'Selecciona dos notas distintas.';}
 const absolute=e=>(Array.isArray(capacity)?capacity.slice(0,e.bar).reduce((n,c)=>n+c,0):e.bar*capacity)+(e.offset||0),a=absolute(first),b=absolute(note),start=a<b?first:note,end=a<b?note:first;
 if(state.tool==='tie'&&(JSON.stringify([...(start.notes||[start.note])].sort())!==JSON.stringify([...(end.notes||[end.note])].sort())||start.midi!==end.midi||!!start.ottava!==!!end.ottava||Math.abs(absolute(start)+start.beats-absolute(end))>.0001))return 'La prolongación une notas consecutivas de la misma altura.';
 const field=state.tool==='tie'?'tieToId':state.tool==='glissando'?'glissandoToId':'slurToId';if(start[field]===end.id)delete start[field];else start[field]=end.id;
 state.decorationStart=null;state.tool='';return '';
}

function gridStep(state){return state.beats*factor(state.dots)*(state.actual?state.normal/state.actual:1);}
function create(){return {duration:'quarter',beats:1,rest:false,dots:0,actual:0,normal:0,groupIndex:0,groupId:0};}
function select(state,action,value){if(action==='accidental'){state.accidental=state.accidental===value?null:value;state.rest=false;}else if(action==='tool'){state.tool=state.tool===value?'':value;state.grace=false;state.decorationStart=null;}else if(action==='chord'){state.chord=!state.chord;state.rest=false;state.tool='';}else if(action==='ottava'){state.ottava=!state.ottava;}else if(action==='grace'){state.grace=!state.grace;state.rest=false;state.tool='';state.decorationStart=null;}else if(action==='duration'){const d=durations.find(d=>d[0]===value);if(d){state.duration=d[0];state.beats=d[1];state.groupIndex=0;state.dots=0;}}else if(action==='rest')state.rest=!state.rest;else if(action==='dots')state.dots=state.dots===value?0:value;else if(action==='tuplet'){state.actual=state.actual===value?0:value;state.normal=value===3?2:4;state.groupIndex=0;state.dots=0;}}
function append(state,events,note,capacity,bars,staff=1,position=null){
 const capacities=Array.isArray(capacity)?capacity:Array(bars).fill(capacity),starts=[0];capacities.forEach(c=>starts.push(starts.at(-1)+ticks(c)));
 const used=position?(starts[position.bar]||0)+ticks(position.beat):events.filter(e=>!e.grace&&(e.staff||1)===staff).reduce((n,e)=>Math.max(n,(starts[e.bar||0]||0)+ticks(e.offset||0)+ticks(e.beats)),0);
 const bar=position?position.bar:Math.max(0,starts.findIndex((start,i)=>i<bars&&used<starts[i+1])),offset=used-(starts[bar]||0),remaining=ticks(capacities[bar]||0)-offset;
 if(bar>=bars||used>=starts[bars])return 'El ejercicio ya está completo. Deshaz o limpia para modificarlo.';
 const accidental=state.accidental||null,plain=Structure.parsePitch(note).plain;
 if(state.grace){events.push({id:'rhythm-note-'+(++decorationId),staff,note,accidental,beats:0,grace:true,graceUnitBeats:Math.min(.5,state.beats),offset:offset/TICKS,bar});state.accidental=null;return '';}
 if(state.chord&&!state.rest){const existing=events.find(e=>!e.grace&&e.kind!=='rest'&&(e.staff||1)===staff&&e.bar===bar&&Math.abs((e.offset||0)-offset/TICKS)<.0001);if(existing){existing.notes=[...new Set([...(existing.notes||[existing.note]),note])];if(existing.accidental){existing.accidentalsByNote={...existing.accidentalsByNote,[Structure.parsePitch(existing.note).plain]:existing.accidental};delete existing.accidental;}if(accidental)existing.accidentalsByNote={...existing.accidentalsByNote,[plain]:accidental};state.accidental=null;return '';}}
 if(state.actual&&state.groupIndex&&state.groupStaff!==staff)return 'Termina el grupo en el pentagrama donde lo empezaste.';
 const base=state.beats*factor(state.dots),eventTicks=ticks(base*(state.actual?state.normal/state.actual:1));
 if(eventTicks>remaining)return 'Esa figura no cabe en el compás. Elige una menor o completa con silencios.';
 if(state.actual&&state.groupIndex===0&&eventTicks*state.actual>remaining)return 'El grupo completo no cabe en este compás. Elige una figura menor.';
 if(state.actual&&state.groupIndex===0){state.groupId++;state.groupStaff=staff;}
 const e={id:'rhythm-note-'+(++decorationId),staccato:state.tool==='staccato',accent:state.tool==='accent',ottava:!!state.ottava,staff,offset:offset/TICKS,note,accidental:state.rest?null:accidental,beats:eventTicks/TICKS,bar,kind:state.rest?'rest':undefined};
 if(state.actual){Object.assign(e,{tupletActual:state.actual,tupletNormal:state.normal,tupletUnitBeats:base,tuplet:state.groupIndex===0?'start':state.groupIndex===state.actual-1?'stop':'',writingGroupId:state.groupId,writingGroupIndex:state.groupIndex});if(++state.groupIndex===state.actual){state.groupIndex=0;state.actual=0;}}
 if(position)for(let i=events.length-1;i>=0;i--){const old=events[i];if(!old.grace&&(old.staff||1)===staff&&old.bar===bar&&ticks(old.offset||0)<offset+eventTicks&&ticks(old.offset||0)+ticks(old.beats)>offset)events.splice(i,1);}
 events.push(e);if(!state.rest)state.accidental=null;return '';
}
function notation(events,capacity,bars){const result=[];for(const staff of [1,2])for(let bar=0;bar<bars;bar++){const barCapacity=Array.isArray(capacity)?capacity[bar]:capacity;let cursor=0;const selected=events.filter(e=>(e.staff||1)===staff&&(e.bar||0)===bar);let legacy=0;const ordered=selected.map(e=>{const offset=e.offset??legacy;legacy=offset+e.beats;return {...e,offset};}).sort((a,b)=>a.offset-b.offset);const rest=end=>{while(cursor<ticks(end)){const remaining=ticks(end)-cursor,beatRemaining=TICKS-cursor%TICKS;const length=Math.min(remaining,beatRemaining);const value=[4,2,1,.5,.25,.125,.0625,.03125].find(v=>ticks(v)<=length);const duration=value?ticks(value):length;result.push({staff,bar,kind:'rest',beats:duration/TICKS});cursor+=duration;}};if(!ordered.length){result.push({staff,bar,kind:'rest',measureRest:true,beats:barCapacity});continue;}for(const e of ordered){if(e.grace){result.push(e);continue;}rest(e.offset);result.push(e);cursor=ticks(e.offset+e.beats);}rest(barCapacity);}return result;}
function figureForEvent(e){const base=e.tupletUnitBeats||e.graceUnitBeats||e.beats;return durations.find(d=>Math.abs(d[1]-base)<.00001)||durations.find(d=>Math.abs(d[1]*1.5-base)<.00001)||durations.find(d=>Math.abs(d[1]*1.75-base)<.00001)||durations.find(d=>d[0]==='quarter');}
function beamGroups(events,meter='4/4'){
 const [top,bottom]=meter.split('/').map(Number),beat=top>3&&top%3===0&&bottom===8?1.5:4/bottom,groups=[];let current=[],offset=0,lastBucket=-1;
 const flush=()=>{if(current.length>1)groups.push(current);current=[];};
 events.forEach((e,index)=>{const duration=figureForEvent(e),flags=Math.max(0,Math.round(Math.log2(.5/duration[1]))+1),bucket=Math.floor((offset+.00001)/beat);if(e.grace||e.kind==='rest'||!flags||bucket!==lastBucket||e.tuplet==='start')flush();if(!e.grace&&e.kind!=='rest'&&flags)current.push({index,flags});offset+=e.beats;lastBucket=bucket;if(e.tuplet==='stop'||Math.abs(offset/beat-Math.round(offset/beat))<.00001)flush();});flush();return groups;
}

function diatonic(note){const m=/^([A-G])(?:[#b]?)(-?\d+)$/.exec(note||'C5');return Number(m[2])*7+'CDEFGAB'.indexOf(m[1]);}
function noteAtIndex(index,staff=1){const value=(staff===2?28:40)-index;return 'CDEFGAB'[((value%7)+7)%7]+Math.floor(value/7);}
function chordGraphic(id,x,ys,down,beamed=false){
 const noStem=['whole','breve'].includes(id),white=['half','whole','breve'].includes(id),head=id==='whole'?0xE0A2:white?0xE0A3:0xE0A4,stemX=x+(down?-6:6),tip=down?Math.max(...ys)+35:Math.min(...ys)-35,sorted=[...ys].sort((a,b)=>a-b);let shape='';
 sorted.forEach((y,i)=>{const adjacent=i&&Math.abs(y-sorted[i-1])<6,shift=adjacent?(down?-10:10):0;shape+=`<text class="chord-notehead" x="${x-6+shift}" y="${y}" font-family="Bravura Metronome" font-size="40" fill="#222">${String.fromCodePoint(head)}</text>`;});
 if(!noStem&&!beamed){shape+=`<line x1="${stemX}" x2="${stemX}" y1="${down?Math.min(...ys):Math.max(...ys)}" y2="${tip}" stroke="#222" stroke-width="1.2"/>`;const flags={'eighth':1,'sixteenth':2,'thirty-second':3,'sixty-fourth':4,'one-twenty-eighth':5}[id];if(flags)shape+=`<text x="${stemX}" y="${tip}" font-family="Bravura Metronome" font-size="40" fill="#222">${String.fromCodePoint((down?0xE241:0xE240)+(flags-1)*2)}</text>`;}
 return `<g class="rhythm-chord" data-stem="${down?'down':'up'}">${shape}</g>`;
}

function stemDown(note,staff=1){const m=/^([A-G])(?:[#b]?)(-?\d+)$/.exec(note||'C5');if(!m)return false;return Number(m[2])*7+'CDEFGAB'.indexOf(m[1])>=(staff===2?22:34);}
function noteGraphic(id,x,y,down,glyphs,color='#222',className='rhythm-note'){
 const g=glyphs[id];if(!g)return '';const flags={'eighth':1,'sixteenth':2,'thirty-second':3,'sixty-fourth':4,'one-twenty-eighth':5}[id]||0,noStem=['whole','breve'].includes(id),k=.04;
 let shape;if(down&&flags){const stemX=x-6,end=y+35;shape=`<text x="${x-6}" y="${y}" font-family="Bravura Metronome" font-size="40" font-weight="normal" fill="${color}">&#xE0A4;</text><line x1="${stemX}" x2="${stemX}" y1="${y}" y2="${end}" stroke="${color}" stroke-width="1.2"/><text x="${stemX}" y="${end}" font-family="Bravura Metronome" font-size="40" font-weight="normal" fill="${color}">${String.fromCodePoint(0xE241+(flags-1)*2)}</text>`;}
 else shape=`<path d="${g.d}" transform="translate(${down&&!noStem?x+160*k:x-160*k} ${y}) scale(${down&&!noStem?-k:k})" fill="${color}"/>`;
 return `<g class="${className}" data-stem="${noStem?'none':down?'down':'up'}">${shape}</g>`;
}

function render(events,{clef='treble',meter='4/4',bars=4,width=900,glyphs={},marks=[],selected=null}={}){
 const timeline=Structure.timeline(meter,marks,bars),grand=clef==='grand',staves=grand?[1,2]:[clef==='bass'?2:1],rowHeight=grand?380:220,rows=Math.ceil(bars/4),left=24,header=90+Math.max(...timeline.keys.map(key=>Structure.keyWidth(key))),spacing=10;
 // Reserve room for the smallest onset gap, using one shared linear time axis.
 // The hit boxes expose this same interval to guides, preview and playback.
 let shortest=1;
 for(const staff of staves)for(let bar=0;bar<bars;bar++){
  const capacity=timeline.capacities[bar],selected=events.filter(e=>!e.grace&&(e.staff||1)===staff&&(e.bar||0)===bar),points=[0,capacity];
  for(const e of selected){points.push(e.offset||0);if(e.beats>0)shortest=Math.min(shortest,e.beats);}
  points.sort((a,b)=>a-b);for(let i=1;i<points.length;i++)if(points[i]-points[i-1]>.00001)shortest=Math.min(shortest,points[i]-points[i-1]);
 }
 const maxSignatureWidth=Math.max(0,...timeline.keys.map((key,bar)=>bar%4===0?0:(key!==timeline.keys[bar-1]?Structure.keyWidth(key,timeline.keys[bar-1]):0)+(timeline.meters[bar].label!==timeline.meters[bar-1].label?34:0)));
 const barWidth=Math.max(220,(Math.max(680,width)-left*2-header)/4,Math.max(...timeline.capacities)/shortest*(events.some(e=>e.accidental||e.accidentalsByNote||/[#b]/.test(e.note||''))?36:26)+60+maxSignatureWidth),w=left*2+header+barWidth*4;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const pitches={1:['A5','G5','F5','E5','D5','C5','B4','A4','G4','F4','E4','D4','C4'],2:['C4','B3','A3','G3','F3','E3','D3','C3','B2','A2','G2','F2','E2']};
 const notePositions=new Map();let drawing='';const notationEvents=notation(Structure.resolve(events,marks),timeline.capacities,bars);
 for(let row=0;row<rows;row++)for(let si=0;si<staves.length;si++){
  const staff=staves[si],top=row*rowHeight+100+si*160,count=Math.min(4,bars-row*4),right=left+header+count*barWidth;
  for(let line=0;line<5;line++)drawing+=`<line x1="${left}" y1="${top+line*spacing}" x2="${right}" y2="${top+line*spacing}" stroke="#222"/>`;
  drawing+=`<text x="${left+6}" y="${top+(staff===1?30:10)}" font-family="Bravura Metronome" font-weight="normal" font-style="normal" font-size="40">${String.fromCodePoint(staff===1?0xE050:0xE062)}</text>`;
  const firstBar=row*4,key=timeline.keys[firstBar],keyWidth=Structure.keyWidth(key),[numerator,denominator]=timeline.meters[firstBar].label.split('/');drawing+=Structure.keySVG(key,0,left+46,top,staff);drawing+=`<text x="${left+55+keyWidth}" y="${top+10}" font-family="Bravura Metronome" font-weight="normal" font-style="normal" font-size="40">${[...numerator].map(n=>String.fromCodePoint(0xE080+Number(n))).join('')}</text><text x="${left+55+keyWidth}" y="${top+30}" font-family="Bravura Metronome" font-weight="normal" font-style="normal" font-size="40">${[...denominator].map(n=>String.fromCodePoint(0xE080+Number(n))).join('')}</text>`;
  for(let local=0;local<count;local++){
   const bar=row*4+local,capacity=timeline.capacities[bar],barMeter=timeline.meters[bar],keyChange=local>0&&timeline.keys[bar]!==timeline.keys[bar-1],meterChange=local>0&&barMeter.label!==timeline.meters[bar-1].label,signatureWidth=(keyChange?Structure.keyWidth(timeline.keys[bar],timeline.keys[bar-1]):0)+(meterChange?34:0),start=left+header+local*barWidth,end=start+barWidth,inputStart=start+signatureWidth+(marks.some(m=>m.bar===bar&&m.type==='repeatStart')?36:24),inputEnd=end-18;
   drawing+=`<rect class="rhythm-measure-hit" data-bar="${bar}" data-staff="${staff}" data-start="${inputStart}" data-end="${inputEnd}" data-top="${top}" data-capacity="${capacity}" data-meter="${barMeter.label}" x="${start}" y="${top-65}" width="${barWidth}" height="170" fill="transparent"/><line x1="${end}" x2="${end}" y1="${top}" y2="${top+40}" stroke="#222" stroke-width="1.5"/><text x="${start+3}" y="${top-16}" font-size="10" fill="#888">${bar+1}</text>`;
   if(keyChange)drawing+=Structure.keySVG(timeline.keys[bar],timeline.keys[bar-1],start+6,top,staff);
   if(meterChange){const x=start+6+(keyChange?Structure.keyWidth(timeline.keys[bar],timeline.keys[bar-1]):0);for(const [number,y] of [[barMeter.top,top+10],[barMeter.bottom,top+30]])drawing+=`<text class="rhythm-meter-change" x="${x}" y="${y}" font-family="Bravura Metronome" font-size="40">${[...String(number)].map(n=>String.fromCodePoint(0xE080+Number(n))).join('')}</text>`;}
   drawing+=(root.CrescendoRhythmMarks||(typeof require==='function'?require('./rhythm-marks.js'):null))?.svg(marks,{bar,staff,firstStaff:staves[0],top,start,end,inputStart,inputEnd,capacity,capacities:timeline.capacities})||'';
   const barEvents=notationEvents.filter(e=>e.staff===staff&&e.bar===bar),groups=beamGroups(barEvents,barMeter.label),beamed=new Set(groups.flatMap(g=>g.map(n=>n.index))),anchors=[];
   let offset=0;for(const [eventIndex,e] of barEvents.entries()){
    const ornaments=e.grace?barEvents.filter(n=>n.grace&&Math.abs(n.offset-e.offset)<.0001):[];const x=inputStart+(inputEnd-inputStart)*(e.grace?e.offset:offset)/capacity-(e.grace?15+(ornaments.length-1-ornaments.indexOf(e))*10:0);offset+=e.beats;
    if(e.measureRest){drawing+=`<rect x="${(start+end)/2-5}" y="${top+10}" width="10" height="4" fill="#222"/>`;continue;}
    const base=e.tupletUnitBeats||e.graceUnitBeats||e.beats,d=durations.find(d=>Math.abs(d[1]-base)<.00001)||durations.find(d=>Math.abs(d[1]*1.5-base)<.00001)||durations.find(d=>Math.abs(d[1]*1.75-base)<.00001)||durations.find(d=>d[0]==='quarter'),dots=e.tupletActual?0:Math.abs(base-d[1]*1.75)<.00001?2:Math.abs(base-d[1]*1.5)<.00001?1:0;
    let y=top+20;
    anchors[eventIndex]={x,y};
    if(e.kind==='rest'){
     const codes={'breve':0xE4E2,'whole':0xE4E3,'half':0xE4E4,'quarter':0xE4E5,'eighth':0xE4E6,'sixteenth':0xE4E7,'thirty-second':0xE4E8,'sixty-fourth':0xE4E9,'one-twenty-eighth':0xE4EA};
     drawing+=`<text x="${x-4}" y="${y}" font-family="Bravura Metronome" font-weight="normal" font-style="normal" font-size="40">${String.fromCodePoint(codes[d[0]])}</text>`;
    }else{
     let note=e.note;if(!note&&e.midi!==undefined){const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];note=names[e.midi%12]+(Math.floor(e.midi/12)-1);}
     const chord=e.notes||[note],ys=chord.map(n=>top+20+((staff===2?22:34)-diatonic(n))*5),average=ys.reduce((a,b)=>a+b,0)/ys.length,down=average<=top+20;y=average;
     anchors[eventIndex]={x,y,headTop:Math.min(...ys),headBottom:Math.max(...ys)};
     if(e.id)notePositions.set(e.id,{x,y,staff,row});
     if(chord.length>1)drawing+=chordGraphic(d[0],x,ys,down,beamed.has(eventIndex));
     else if(beamed.has(eventIndex))drawing+=`<text class="beamed-notehead" x="${x-6}" y="${y}" font-family="Bravura Metronome" font-size="40" font-weight="normal">&#xE0A4;</text>`;
     else{const graphic=noteGraphic(d[0],x,y,down,glyphs,'#222',e.grace?'rhythm-grace-note':'rhythm-note');drawing+=e.grace?`<g transform="translate(${x*.4} ${y*.4}) scale(.6)">${graphic}</g>`:graphic;}
     if(e.grace)drawing+=`<path d="M${x} ${y+(down?12:-12)}l10 ${down?9:-9}" stroke="#222" stroke-width="1"/>`;
     if(e.staccato)drawing+=`<circle class="rhythm-staccato" cx="${x}" cy="${y+(down?-10:10)}" r="1.8" fill="#222"/>`;
     if(e.accent)drawing+=`<text class="rhythm-accent" x="${x-5}" y="${y+(down?-14:20)}" font-family="Bravura Metronome" font-size="30">${String.fromCodePoint(down?0xE4A0:0xE4A1)}</text>`;
     for(const [ni,headY] of ys.entries()){
      const sourceIndex=events.findIndex(raw=>e.id?raw.id===e.id:raw.bar===e.bar&&(raw.staff||1)===staff&&Math.abs((raw.offset||0)-e.offset)<.0001&&!!raw.grace===!!e.grace);
      const sortedYs=[...ys].sort((a,b)=>a-b),sortedIndex=sortedYs.indexOf(headY),shift=chord.length>1&&sortedIndex>0&&Math.abs(headY-sortedYs[sortedIndex-1])<6?(down?-10:10):0;
      drawing+=`<ellipse class="rhythm-head-target" data-event="${sourceIndex}" data-head="${ni}" cx="${x+shift}" cy="${headY}" rx="7" ry="3.5" fill="${selected?.index===sourceIndex&&selected?.head===ni?'#d5aa4566':'transparent'}" stroke="${selected?.index===sourceIndex&&selected?.head===ni?'#b88820':'none'}" pointer-events="none"/>`;
      const accidental=e.displayAccidentals?.[ni];if(accidental)drawing+=`<text class="rhythm-accidental" data-accidental="${accidental}" x="${x-20}" y="${headY}" font-family="Bravura Metronome" font-size="40">${String.fromCodePoint({sharp:0xE262,flat:0xE260,natural:0xE261}[accidental])}</text>`;
      for(let line=-2;line>=Math.max(-10,(headY-top)/5);line-=2)drawing+=`<line class="rhythm-ledger-line" x1="${x-9}" x2="${x+9}" y1="${top+line*5}" y2="${top+line*5}" stroke="#222"/>`;
      for(let line=10;line<=Math.min(18,(headY-top)/5);line+=2)drawing+=`<line class="rhythm-ledger-line" x1="${x-9}" x2="${x+9}" y1="${top+line*5}" y2="${top+line*5}" stroke="#222"/>`;
     }
     if(e.ottava)drawing+=`<g class="rhythm-ottava"><text x="${x-5}" y="${Math.max(14,Math.min(top-35,Math.min(...ys)-50))}" font-family="Georgia,serif" font-style="italic" font-size="13">8va</text><path d="M${x+20} ${Math.max(11,Math.min(top-38,Math.min(...ys)-53))}h${Math.max(15,(inputEnd-inputStart)*e.beats/capacity-20)}v6" stroke="#222" fill="none" stroke-dasharray="3 3"/></g>`;
    }
    for(let dot=0;dot<dots;dot++)drawing+=`<circle cx="${x+12+dot*5}" cy="${y-5}" r="1.5" fill="#222"/>`;
   }
   for(const group of groups){
    const notes=group.map(n=>({...n,...anchors[n.index]})),down=notes.reduce((a,n)=>a+n.y,0)/notes.length<=top+20,direction=down?-1:1;
    const beamY=down?Math.max(...notes.map(n=>n.headBottom??n.y))+35:Math.min(...notes.map(n=>n.headTop??n.y))-35;
    const stemX=n=>n.x+(down?-6:6);
    drawing+='<g class="rhythm-beam-group">';
    for(const n of notes)drawing+=`<line class="beamed-stem" x1="${stemX(n)}" x2="${stemX(n)}" y1="${down?(n.headTop??n.y):(n.headBottom??n.y)}" y2="${beamY}" stroke="#222" stroke-width="1.2"/>`;
    const beam=(x1,x2,level)=>{const y=beamY+direction*(level-1)*5;drawing+=`<path class="rhythm-beam" data-level="${level}" d="M${x1} ${y}H${x2}v${direction*3}H${x1}Z" fill="#222"/>`;};
    for(let level=1;level<=Math.max(...notes.map(n=>n.flags));level++){
     let run=[];const flush=()=>{if(run.length>1)beam(stemX(run[0]),stemX(run.at(-1)),level);else if(run.length){const n=run[0],i=notes.indexOf(n),neighbor=notes[i===notes.length-1?i-1:i+1],hook=Math.min(10,Math.abs(stemX(neighbor)-stemX(n))/3);beam(stemX(n),stemX(n)+(i===notes.length-1?-hook:hook),level);}run=[];};
     for(const n of notes){if(n.flags>=level)run.push(n);else flush();}flush();
    }
    drawing+='</g>';
   }
   let tuplet=[];
   const drawTuplet=()=>{if(!tuplet.length)return;const first=tuplet[0],last=tuplet.at(-1),startX=anchors[first].x-7,endX=Math.max(startX+24,anchors[last].x+10),y=Math.max(14,Math.min(top-14,...tuplet.map(i=>anchors[i].y-47))),center=(startX+endX)/2,number=barEvents[first].tupletActual;
    drawing+=`<g class="rhythm-tuplet" data-actual="${number}"><path class="rhythm-tuplet-bracket" d="M${startX} ${y+4}V${y}H${center-8}M${center+8} ${y}H${endX}v4" fill="none" stroke="#222" stroke-width="1.2"/><text class="rhythm-tuplet-number" x="${center}" y="${y+4}" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="13" fill="#222">${number}</text></g>`;tuplet=[];};
   barEvents.forEach((e,i)=>{if(!e.tupletActual){drawTuplet();return;}if(e.tuplet==='start')drawTuplet();tuplet.push(i);if(e.tuplet==='stop'||tuplet.length===e.tupletActual)drawTuplet();});drawTuplet();
  }
 }
 for(const e of events)for(const [field,cls] of [['tieToId','rhythm-tie'],['slurToId','rhythm-slur'],['glissandoToId','rhythm-glissando']]){
  if(!e[field])continue;const a=notePositions.get(e.id),b=notePositions.get(e[field]);if(!a||!b||a.staff!==b.staff)continue;
  const curve=(x1,y1,x2,y2)=>{if(cls==='rhythm-glissando'){const start=x1+10,end=x2-10;if(end>start)drawing+=`<g class="rhythm-glissando"><path d="M${start} ${y1}L${end} ${y2}" fill="none" stroke="#222" stroke-width="1.2"/><text x="${(start+end)/2}" y="${(y1+y2)/2-5}" text-anchor="middle" font-family="serif" font-size="10">gliss.</text></g>`;return;}const lift=cls==='rhythm-tie'?12:20;drawing+=`<path class="${cls}" d="M${x1} ${y1+8}C${x1+(x2-x1)/3} ${y1+lift} ${x2-(x2-x1)/3} ${y2+lift} ${x2} ${y2+8}" fill="none" stroke="#222" stroke-width="1.4"/>`;};
  if(a.row===b.row)curve(a.x,a.y,b.x,b.y);else{curve(a.x,a.y,w-left,a.y);curve(left+header,b.y,b.x,b.y);}
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" class="rhythm-stable-score" data-grand="${grand}" width="${w}" height="${rows*rowHeight}" viewBox="0 0 ${w} ${rows*rowHeight}" role="img" aria-label="Partitura editable de ${bars} compases">${drawing}</svg>`;
}

const previousExercises=new Map();
function generate({capacity=4,bars=4,kind='steady',base=1,clef='treble',random=Math.random}={}){
 const pick=values=>values[Math.min(values.length-1,Math.floor(random()*values.length))],staff=clef==='bass'?2:1,pitches=staff===2?['C3','D3','E3','F3','G3']:['C5','D5','E5','F5','G5'];
 const mode=kind==='steady'&&Math.abs(base-1/3)<.00001?'triplets':kind;
 const key=[capacity,bars,kind,base,clef].join(':');
 function build(){
  const events=[];let lastPitch=pick(pitches);
  for(let bar=0;bar<bars;bar++){
   let cursor=0;const limit=ticks(capacity);
   const push=(beats,rest=false,extra={})=>{const pitch=pick(pitches.filter(n=>n!==lastPitch));lastPitch=pitch;events.push({staff,bar,offset:cursor/TICKS,beats,note:pitch,kind:rest?'rest':undefined,...extra});cursor+=ticks(beats);};
   while(cursor<limit){
    const remaining=limit-cursor;
    if(mode==='triplets'&&remaining>=ticks(.5)){
     const unit=remaining>=TICKS?.5:.25,groupTicks=ticks(unit*2),each=groupTicks/3;
     // Emit a whole group atomically so no tuplet is truncated at a barline.
     for(let i=0;i<3;i++)push(each/TICKS,random()<.18,{tupletActual:3,tupletNormal:2,tupletUnitBeats:unit,tuplet:i===0?'start':i===2?'stop':''});
     continue;
    }
    if(mode==='syncopation'){
     const motifs=[[{beats:.5,rest:true},{beats:1},{beats:.5}],[{beats:.5},{beats:1},{beats:.5}],[{beats:.5,rest:true},{beats:.5}],[{beats:1.5},{beats:.5}],[{beats:.5},{beats:.5,rest:true}]];
     const fits=motifs.filter(m=>ticks(m.reduce((n,e)=>n+e.beats,0))<=remaining);
     if(fits.length){for(const e of pick(fits))push(e.beats,!!e.rest);continue;}
    }
    const values=mode==='steady'?[base]:mode==='mixed'?[.25,.5,1,1.5,2]:[Math.abs(base-1/3)<.00001?.5:base,.5,1];
    const available=values.filter(v=>ticks(v)>0&&ticks(v)<=remaining);
    const duration=available.length?pick(available):pick([2,1,.5,.25,.125,.0625,.03125].filter(v=>ticks(v)<=remaining));
    if(!duration)throw new Error('El compás no admite estas subdivisiones.');
    push(duration,mode==='rests'?random()<.35:false);
   }
  }
  if(mode==='rests'&&events.length>1){if(!events.some(e=>e.kind==='rest'))pick(events).kind='rest';if(events.every(e=>e.kind==='rest'))events[0].kind=undefined;}
  return events;
 }
 let result,signature;for(let attempt=0;attempt<24;attempt++){result=build();signature=JSON.stringify(result);if(signature!==previousExercises.get(key))break;}
 previousExercises.set(key,signature);return result;
}

function history(){const past=[],future=[];return {get canUndo(){return past.length>0;},get canRedo(){return future.length>0;},commit(before,after){if(before===after)return;past.push(before);if(past.length>100)past.shift();future.length=0;},undo(current){if(!past.length)return null;future.push(current);return past.pop();},redo(current){if(!future.length)return null;past.push(current);return future.pop();}};}
const api={clampStaffIndex,diatonic,noteAtIndex,stemDown,noteGraphic,history,decorate,beamGroups,generate,gridStep,render,notation,TICKS,durations,ticks,factor,create,select,append};if(typeof module!=='undefined')module.exports=api;else root.CrescendoRhythmWriting=api;
})(typeof window==='undefined'?globalThis:window);
