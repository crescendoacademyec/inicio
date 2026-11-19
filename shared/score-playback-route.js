/* MusicXML itinerary and OSMD cursor adapter: one performed route for all instruments. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CrescendoScoreRoute=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
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

  function fromElement(score){
    if((score.localName||score.tagName)!=='score-partwise')return null;
    const warnings=new Set(),parts=children(score,'part').map(p=>partMeasures(p,warnings));
    if(!parts.length)return [];
    const count=Math.max(...parts.map(p=>p.length)),measures=[];
    for(let i=0;i<count;i++){const present=parts.map(p=>p[i]).filter(Boolean);measures.push({...present[0],forward:present.some(m=>m.forward),backward:present.find(m=>m.backward)?.backward||null,endings:present.find(m=>m.endings.length)?.endings||[],controls:Object.assign({},...present.map(m=>m.controls))});}
    return itinerary(measures);
  }
  function snapshot(iterator){
    const copy=Object.assign(Object.create(Object.getPrototypeOf(iterator)),iterator);
    for(const key of Object.keys(copy)){const value=copy[key];if(Array.isArray(value))copy[key]=value.slice();else if(value instanceof Map)copy[key]=new Map(value);}
    return copy;
  }
  // OSMD draws the original score; its cursor visits the performed order, including jumps.
  function install(engine,route,OSMD=globalThis.opensheetmusicdisplay){
    if(!Array.isArray(route)||!route.length||!engine.cursor)return;
    if(!engine.__crescendoRender){
      const render=engine.render;engine.__crescendoRender=true;
      engine.render=function(...args){const result=render.apply(this,args);install(this,route,OSMD);return result;};
    }
    const cursor=engine.cursor;
    if(cursor.__crescendoRoute){cursor.reset();return;}
    const linear=new OSMD.MusicPartManagerIterator(engine.Sheet),byMeasure=new Map();
    linear.handleRepetitionsAtMeasureBegin=function(){};
    linear.handleRepetitionsAtMeasureEnd=function(){this.currentMeasureIndex++;};
    let guard=0;linear.moveToNextVisibleVoiceEntry(false);
    while(!linear.EndReached){
      if(++guard>100000)throw Error('La partitura supera el límite de pasos de reproducción.');
      const index=linear.CurrentMeasureIndex;if(!byMeasure.has(index))byMeasure.set(index,[]);
      byMeasure.get(index).push(snapshot(linear));linear.moveToNextVisibleVoiceEntry(false);
    }
    let elapsed=0;const boundaries=[];
    const sequence=route.flatMap((index,visit)=>{
      const values=byMeasure.get(index)||[],length=values[0]?.CurrentMeasure?.Duration?.RealValue||0,start=elapsed;elapsed+=length;
      if(visit===route.length-1||route[visit+1]!==index+1)boundaries.push(elapsed);
      return values.map(value=>({value,visit,time:start+value.CurrentSourceTimestamp.RealValue-value.CurrentMeasure.AbsoluteTimestamp.RealValue}));
    });
    if(!sequence.length||sequence.length>200000)throw Error('El recorrido musical está vacío o supera el límite de reproducción.');
    function iteratorAt(position=0){
      let at=position;const move=delta=>{at=Math.max(-1,Math.min(sequence.length,at+delta));};
      const methods={moveToNext:()=>move(1),moveToNextVisibleVoiceEntry:()=>move(1),moveToPrevious:()=>move(-1),moveToPreviousVisibleVoiceEntry:()=>move(-1),clone:()=>iteratorAt(at)};
      return new Proxy({}, {get(_target,key){
        const entry=sequence[Math.max(0,Math.min(sequence.length-1,at))];
        if(key==='CrescendoPerformedTimestamp')return at>=sequence.length?elapsed:entry.time;
        if(key==='CrescendoUntilJump')return Math.max(0,(boundaries.find(time=>time>entry.time+1e-7)??elapsed)-entry.time);
        if(key==='CrescendoVisit')return sequence[Math.max(0,Math.min(sequence.length-1,at))].visit;
        if(key==='EndReached')return at>=sequence.length;if(key==='FrontReached')return at<0;
        if(key in methods)return methods[key];
        const current=sequence[Math.max(0,Math.min(sequence.length-1,at))].value,value=current[key];
        return typeof value==='function'?value.bind(current):value;
      }});
    }
    cursor.__crescendoRoute={route:[...route],steps:sequence.length};
    cursor.resetIterator=function(){this.iterator=iteratorAt();};cursor.reset();
    if(engine.container?.dataset){engine.container.dataset.playbackRoute=route.join(',');engine.container.dataset.playbackSteps=String(sequence.length);}
    return cursor.__crescendoRoute;
  }
  return {fromElement,itinerary,install};
});
