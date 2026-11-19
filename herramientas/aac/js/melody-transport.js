/* MusicXML transport shared by cursor, keyboard, metronome and piano. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CrescendoMusicXML=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const children=(node,tag)=>Array.from(node?.children||[]).filter(n=>!tag||n.localName===tag||n.tagName===tag);
  const child=(node,tag)=>children(node,tag)[0]||null;
  const text=(node,tag,fallback='')=>child(node,tag)?.textContent??fallback;
  const num=(node,tag,fallback=0)=>{const value=Number(text(node,tag,fallback));return Number.isFinite(value)?value:fallback;};
  const all=(node,tag)=>children(node).flatMap(n=>[...(n.localName===tag||n.tagName===tag?[n]:[]),...all(n,tag)]);
  const attr=(node,key)=>node?.getAttribute(key);
  const EPS=1e-7;

  function meter(time, previous) {
    if(!time)return previous;
    const groups=String(text(time,'beats','4')).split('+').map(Number).filter(n=>n>0);
    const denominator=num(time,'beat-type',4),beats=groups.reduce((a,b)=>a+b,0)||4;
    return {beats,beatType:denominator>0?denominator:4,groups:groups.length>1?groups:null};
  }
  function tempoAtDirection(direction) {
    const sound=child(direction,'sound'),soundTempo=Number(attr(sound,'tempo'));
    if(soundTempo>0)return soundTempo;
    const metronome=all(direction,'metronome')[0];if(!metronome)return null;
    const unit={whole:4,half:2,quarter:1,eighth:.5,'16th':.25,'32nd':.125}[text(metronome,'beat-unit')];
    const bpm=num(metronome,'per-minute');return bpm>0&&unit?bpm*unit*(2-Math.pow(.5,children(metronome,'beat-unit-dot').length)):null;
  }
  function partMeasures(part,warnings) {
    let divisions=1,currentMeter={beats:4,beatType:4,groups:null},transpose={all:0};
    return children(part,'measure').map((measure,index)=>{
      let beat=0,end=0,last=0;
      const out={index,number:attr(measure,'number'),notes:[],tempos:[],meter:currentMeter,
        forward:false,backward:null,endings:[],controls:{}};
      for(const item of children(measure)) {
        const tag=item.localName||item.tagName;
        if(tag==='attributes') {
          divisions=Math.max(1,num(item,'divisions',divisions)); currentMeter=meter(child(item,'time'),currentMeter);out.meter=currentMeter;
          for(const tr of children(item,'transpose')) {
            const amount=num(tr,'chromatic')+12*num(tr,'octave-change'),staff=attr(tr,'number');
            if(staff)transpose[staff]=amount;else transpose={all:amount};
            if(child(tr,'double'))warnings.add('La duplicación de octava de <double> requiere revisión.');
          }
          continue;
        }
        if(tag==='direction') {
          const offset=num(item,'offset')/divisions,tempo=tempoAtDirection(item);
          if(tempo)out.tempos.push({beat:beat+offset,tempo});
          const sound=child(item,'sound');
          if(sound)for(const key of ['segno','coda','dacapo','dalsegno','tocoda','fine']) {
            const value=attr(sound,key);if(value)out.controls[key]=value;
          }
          continue;
        }
        if(tag==='barline') {
          for(const repeat of children(item,'repeat')) {
            if(attr(repeat,'direction')==='forward')out.forward=true;
            if(attr(repeat,'direction')==='backward')out.backward={times:Math.max(2,Math.min(100,Number(attr(repeat,'times'))||2)),afterJump:attr(repeat,'after-jump')==='yes'};
          }
          for(const ending of children(item,'ending'))out.endings.push({type:attr(ending,'type'),numbers:(attr(ending,'number')||'').split(',').map(Number).filter(Number.isFinite)});
          continue;
        }
        const length=Math.max(0,num(item,'duration')/divisions);
        if(tag==='backup'){beat=Math.max(0,beat-length);continue;}
        if(tag==='forward'){beat+=length;end=Math.max(end,beat);continue;}
        if(tag!=='note')continue;
        const chord=!!child(item,'chord'),onset=chord?last:beat;if(!chord)last=beat;
        const pitch=child(item,'pitch'),step=text(pitch,'step'),staff=text(item,'staff','1'),voice=text(item,'voice','1');
        if(pitch && Object.hasOwn({C:0,D:2,E:4,F:5,G:7,A:9,B:11},step) && length>0) {
          const writtenMidi=12*(num(pitch,'octave',4)+1)+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[step]+num(pitch,'alter');
          const midi=writtenMidi+(transpose[staff]??transpose.all);
          if(midi>=0&&midi<=127) {
            const ties=children(item,'tie').length?children(item,'tie'):all(item,'tied');
            out.notes.push({midi,writtenMidi,beat:onset,length,staff,voice,
              tieStart:ties.some(t=>attr(t,'type')==='start'),tieStop:ties.some(t=>attr(t,'type')==='stop')});
          } else warnings.add('Hay notas fuera del rango MIDI reproducible.');
        }
        if(child(item,'grace'))warnings.add('Las notas de adorno sin duración necesitan revisión de reproducción.');
        if(child(item,'unpitched'))warnings.add('La percusión sin altura no se reproduce con el piano.');
        if(!chord)beat+=length;end=Math.max(end,beat,onset+length);
      }
      out.length=end||currentMeter.beats*4/currentMeter.beatType;
      return out;
    });
  }

  function itinerary(measures) {
    const stack=[],regions=[],states=new Map(),starts=new Map(),segni=new Map(),codas=new Map();let activeEnding=null;
    measures.forEach((m,i)=>{
      if(m.forward)stack.push(i);
      if(m.backward){const region={start:stack.length?stack.pop():0,end:i,...m.backward};regions.push(region);starts.set(i,region);}
      const begin=m.endings.find(e=>e.type==='start');if(begin)activeEnding=begin.numbers;
      m.ending=activeEnding;
      if(m.endings.some(e=>e.type==='stop'||e.type==='discontinue'))activeEnding=null;
      if(m.controls.segno)segni.set(m.controls.segno,i);
      if(m.controls.coda)codas.set(m.controls.coda,i);
    });
    for(const region of regions) {
      if(!measures[region.end].ending)continue;
      const endings=[];
      for(let pos=region.start;pos<measures.length;pos++) {
        if(pos>region.end&&!measures[pos].ending)break;
        endings.push(...(measures[pos].ending||[]));
      }
      region.times=Math.max(region.times,...endings);
    }
    const route=[],usedJumps=new Set();let i=0,lastPass=1,afterJump=false,iterations=0;
    while(i<measures.length) {
      if(++iterations>20000)throw Error('La ruta de repeticiones excede el límite de seguridad. Revisa las marcas de salto.');
      const m=measures[i],containing=regions.filter(r=>i>=r.start&&i<=r.end).sort((a,b)=>(a.end-a.start)-(b.end-b.start));
      const pass=containing.length?(states.get(containing[0].end)||1):lastPass;
      const play=!m.ending||m.ending.includes(pass);
      if(play)route.push(i);
      if(play && afterJump && m.controls.fine)break;
      const coda=m.controls.tocoda;
      if(play&&afterJump&&coda&&!usedJumps.has('coda:'+i)&&codas.has(coda)) {
        usedJumps.add('coda:'+i);i=codas.get(coda);continue;
      }
      if(play&&!usedJumps.has('jump:'+i)&&(m.controls.dacapo==='yes'||m.controls.dalsegno)) {
        const target=m.controls.dacapo==='yes'?0:segni.get(m.controls.dalsegno);
        if(target!=null){usedJumps.add('jump:'+i);states.clear();lastPass=1;afterJump=true;i=target;continue;}
      }
      const repeat=starts.get(i);
      if(repeat&&(!afterJump||repeat.afterJump)) {
        const current=states.get(i)||1;
        if(current<repeat.times) {
          states.set(i,current+1);
          for(const nested of regions)if(nested.end!==i&&nested.start>=repeat.start&&nested.end<=repeat.end)states.delete(nested.end);
          i=repeat.start;continue;
        }
        lastPass=current;states.delete(i);
      }else if(!m.ending)lastPass=1;
      i++;
    }
    return route;
  }

  function parse(xml, options={}) {
    const Parser=options.DOMParser||globalThis.DOMParser;
    if(!Parser)throw Error('No hay un lector XML disponible.');
    const doc=new Parser().parseFromString(xml,'application/xml');
    if(all(doc,'parsererror').length)throw Error('El MusicXML no es válido.');
    const score=child(doc,'score-partwise');if(!score)throw Error('Se necesita una partitura MusicXML score-partwise.');
    const warnings=new Set(),parts=children(score,'part').map(p=>({id:attr(p,'id'),measures:partMeasures(p,warnings)}));
    if(!parts.length)throw Error('La partitura no contiene partes.');
    const count=Math.max(...parts.map(p=>p.measures.length)),measures=[];
    let sourceBeat=0;
    for(let i=0;i<count;i++) {
      const present=parts.map(p=>p.measures[i]).filter(Boolean),primary=present[0];
      const m={...primary,index:i,length:Math.max(...present.map(m=>m.length)),sourceStart:sourceBeat};
      // Repeat/ending instructions often appear in just one part.
      m.forward=present.some(m=>m.forward);m.backward=present.find(m=>m.backward)?.backward||null;
      m.endings=present.find(m=>m.endings.length)?.endings||[];
      m.controls=Object.assign({},...present.map(m=>m.controls));
      m.tempos=present.flatMap(m=>m.tempos);measures.push(m);sourceBeat+=m.length;
    }
    const field=all(score,'miscellaneous-field').find(n=>attr(n,'name')==='crescendo:measure-route');
    let route=field?JSON.parse(field.textContent):itinerary(measures);
    if(!Array.isArray(route)||!route.length||route.length>20000||route.some(index=>!Number.isInteger(index)||index<0||index>=measures.length))throw Error('El recorrido de compases no es válido.');
    const notes=[],visits=[],tempoChanges=[],clicks=[];
    let beat=0,currentTempo=120;
    for(const index of route) {
      const measure=measures[index],visit={index,sourceStart:measure.sourceStart,sourceEnd:measure.sourceStart+measure.length,startBeat:beat,endBeat:beat+measure.length};
      visits.push(visit);
      // Restore the source tempo when a repeat jumps backwards over a tempo change.
      let sourceTempo=120;
      for(let i=0;i<=index;i++)for(const change of measures[i].tempos)if(i<index||change.beat<=0)sourceTempo=change.tempo;
      if(sourceTempo!==currentTempo){tempoChanges.push({beat,tempo:sourceTempo});currentTempo=sourceTempo;}
      for(const change of measure.tempos.sort((a,b)=>a.beat-b.beat)) {
        if(change.beat<0||change.beat>measure.length)continue;
        tempoChanges.push({beat:beat+change.beat,tempo:change.tempo});currentTempo=change.tempo;
      }
      const {beats,beatType,groups}=measure.meter,step=4/beatType*(beats>3&&beats%3===0?3:1);
      if(groups){let t=0;for(const [j,group] of groups.entries()){if(t<measure.length-EPS)clicks.push({beat:beat+t,accent:j===0});t+=group*4/beatType;}}
      else for(let t=0;t<measure.length-EPS;t+=step)clicks.push({beat:beat+t,accent:t===0});
      for(const part of parts)for(const n of part.measures[index]?.notes||[])
        notes.push({...n,part:part.id,sourceBeat:measure.sourceStart+n.beat,sourceEndBeat:measure.sourceStart+n.beat+n.length,beat:beat+n.beat,endBeat:beat+n.beat+n.length});
      beat+=measure.length;
      if(notes.length>500000)throw Error('La partitura expandida contiene demasiadas notas para reproducirla.');
    }
    tempoChanges.sort((a,b)=>a.beat-b.beat);
    const secondsAt=value=>{let seconds=0,last=0,tempo=120;for(const change of tempoChanges){if(change.beat>value)break;seconds+=(change.beat-last)*60/tempo;last=change.beat;tempo=change.tempo;}return seconds+(value-last)*60/tempo;};
    const merged=[],pending=new Map();
    for(const note of notes.sort((a,b)=>a.beat-b.beat)) {
      const key=`${note.part}:${note.staff}:${note.voice}:${note.midi}`,previous=pending.get(key);
      if(note.tieStop&&previous&&Math.abs(previous.endBeat-note.beat)<EPS&&Math.abs(previous.sourceEndBeat-note.sourceBeat)<EPS) {
        previous.endBeat=note.endBeat;previous.sourceEndBeat=note.sourceEndBeat;previous.length=previous.endBeat-previous.beat;
        if(!note.tieStart)pending.delete(key);
      }else {
        const event={...note};merged.push(event);
        if(note.tieStart)pending.set(key,event);else pending.delete(key);
      }
    }
    const events=merged.map(n=>({...n,start:secondsAt(n.beat),dur:secondsAt(n.endBeat)-secondsAt(n.beat)}));
    for(const visit of visits){visit.start=secondsAt(visit.startBeat);visit.end=secondsAt(visit.endBeat);}
    return {events,duration:Math.max(secondsAt(beat),0,...events.map(n=>n.start+n.dur)),visits,tempoChanges,
      baseTempo:tempoChanges.find(c=>c.beat===0)?.tempo||120,secondsAt,warnings:[...warnings],
      clicks:clicks.map(c=>({...c,time:secondsAt(c.beat)}))};
  }
  return {parse,itinerary};
});
