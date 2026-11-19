/* Snapshot OSMD's source-note positions once; playback never walks or rewinds its iterator. */
(function(){'use strict';
 const NS='http://www.w3.org/2000/svg';let points=[],lines=[],display=null,rows=[],sheetHost=null,showAnalysis=true,active='';
 function build(osmd,timeline,analysis,host,metadata={}){
  display=osmd;showAnalysis=metadata.showAnalysis!==false;rows=analysis||[];sheetHost=host;points=[];active='';lines.forEach(n=>n.remove());lines=[];
  const trace=[];host.dataset.sourceMeasures=JSON.stringify(osmd.Sheet.SourceMeasures.map(m=>({number:m.MeasureNumber,duration:m.Duration.RealValue,start:m.AbsoluteTimestamp.RealValue,entries:m.VerticalSourceStaffEntryContainers.map(e=>e.Timestamp.RealValue)})));const cursor=osmd.cursor;cursor.hide();cursor.reset();const it=cursor.Iterator,first=new Map();
  for(const v of timeline.visits)if(!first.has(v.index))first.set(v.index,v.sourceStart);
  for(let count=0;!it.EndReached&&count<200000;count++){
   if(count<7)trace.push({n:count,measure:it.CurrentMeasureIndex,beat:it.CurrentSourceTimestamp.RealValue,visible:it.CurrentVisibleVoiceEntries().length,actual:it.CurrentVisibleVoiceEntries()[0]?.ParentSourceStaffEntry?.VerticalContainerParent?.ParentMeasure?.measureListIndex,front:it.FrontReached});
   if(it.CurrentVisibleVoiceEntries().length){const measure=it.CurrentMeasureIndex,sourceStart=osmd.Sheet.SourceMeasures[measure]?.AbsoluteTimestamp.RealValue*4||0,beat=it.CurrentSourceTimestamp.RealValue*4-sourceStart;
    cursor.show();const element=cursor.cursorElement,page=element.parentElement,svg=page.querySelector('svg');
    if(svg&&Number.isFinite(beat)&&!points.some(p=>p.measure===measure&&Math.abs(p.beat-beat)<1e-7))points.push({measure,beat,x:parseFloat(element.style.left)+15*osmd.Zoom,y:parseFloat(element.style.top),height:element.height,page,svg});
    cursor.hide();
   }
   it.moveToNextVisibleVoiceEntry(false);
  }
  cursor.hide();points.sort((a,b)=>a.measure-b.measure||a.beat-b.beat);
  for(const svg of host.querySelectorAll('svg')){svg.querySelectorAll('.aac-score-analysis').forEach(n=>n.remove());const line=document.createElementNS(NS,'line');line.setAttribute('class','aac-note-cursor');line.setAttribute('stroke','#ef8500');line.setAttribute('stroke-width','3');line.style.display='none';svg.append(line);lines.push(line);}
  const firstSVG=host.querySelector('svg');if(firstSVG&&metadata.composer){firstSVG.querySelectorAll('.aac-score-credit').forEach(n=>n.remove());const credit=document.createElementNS(NS,'text'),factor=scale(firstSVG);credit.setAttribute('class','aac-score-credit');credit.setAttribute('x',(parseFloat(firstSVG.getAttribute('width'))-22)*factor);credit.setAttribute('y',52*factor);credit.setAttribute('font-size',12*factor);credit.setAttribute('font-family','Georgia,serif');credit.setAttribute('text-anchor','end');credit.textContent=metadata.composer;firstSVG.append(credit);}
  host.dataset.systemStarts=JSON.stringify(systemStarts(osmd));
  drawAnalysis();
  osmd.GraphicSheet.MeasureList.forEach((items,index)=>{const measure=items?.[0],point=points.find(p=>p.measure===index);if(!measure||!point)return;const factor=scale(point.svg),box=measure.PositionAndShape,hit=document.createElementNS(NS,'rect');hit.setAttribute('class','aac-measure-target');hit.setAttribute('x',box.AbsolutePosition.x*10*osmd.Zoom*factor);hit.setAttribute('y',(point.y-5)*factor);hit.setAttribute('width',box.Size.width*10*osmd.Zoom*factor);hit.setAttribute('height',(point.height+12)*factor);hit.setAttribute('fill','transparent');hit.setAttribute('tabindex','0');hit.setAttribute('role','button');hit.setAttribute('aria-label',`Seleccionar compás ${index+1} para ajustar salto`);hit.dataset.measure=index;hit.addEventListener('click',event=>{event.stopPropagation();select(index);});hit.addEventListener('keydown',event=>{if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();event.stopPropagation();window.AACMelodyReflow(index,event.key==='ArrowUp'?'up':'down');}});point.svg.append(hit);});host.dataset.cursorTrace=JSON.stringify(trace);host.dataset.cursorPositions=String(points.length);host.dataset.cursorMap=JSON.stringify(points.map(p=>({measure:p.measure,beat:p.beat})));
 }
 function systemStarts(osmd){
  const starts=[];let previous=null;
  osmd.GraphicSheet.MeasureList.forEach((items,index)=>{const position=items?.[0]?.PositionAndShape.AbsolutePosition;if(position&&(!previous||Math.abs(position.y-previous.y)>1e-5||position.x<previous.x-1e-5))starts.push(index);previous=position;});return starts;
 }
 function scale(svg){return (svg.viewBox.baseVal.width||parseFloat(svg.getAttribute('width')))/(parseFloat(svg.getAttribute('width'))||1);}
 function drawAnalysis(){
  const list=display.GraphicSheet.MeasureList;
  rows.forEach((row,index)=>{const ps=points.filter(p=>p.measure===index);if(!ps.length)return;const anchor=ps[0],factor=scale(anchor.svg),gmeasure=list[index]?.[0],containers=(gmeasure?.staffEntries||[]).flatMap(e=>e.graphicalChordContainers||[]),slots=row.slots.filter(s=>s.chord);
   slots.forEach((slot,i)=>{const before=ps.filter(p=>p.beat<=slot.beat+1e-7).at(-1)||anchor,next=ps.find(p=>p.beat>slot.beat),fraction=next?(slot.beat-before.beat)/(next.beat-before.beat):0;
    let x=containers[i]?.PositionAndShape?.AbsolutePosition?.x*10*display.Zoom;
    if(!Number.isFinite(x))x=before.x+(next?fraction*(next.x-before.x):0);
    const texts=showAnalysis?[slot.degree,slot.mode,[slot.sectionLabel||((i===0)?row.sectionLabel:''),slot.originScale].filter(Boolean).join(' · ')].filter(Boolean):[];
    const hit=document.createElementNS(NS,'rect');hit.setAttribute('class','aac-chord-target');hit.setAttribute('x',(x-40)*factor);hit.setAttribute('y',(anchor.y-26)*factor);hit.setAttribute('width',80*factor);hit.setAttribute('height',25*factor);hit.setAttribute('fill','transparent');hit.setAttribute('tabindex','0');hit.setAttribute('role','button');hit.setAttribute('aria-label',`Cambiar acorde ${slot.chord}, compás ${index+1}`);Object.assign(hit.dataset,{sourceMeasure:String(index),sourceBeat:String(slot.beat),field:'chord'});hit.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();window.AACMelodyOpenScoreTarget(hit,event).catch(error=>{sheetHost.dataset.interactionError=error.message;});});hit.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();const r=hit.getBoundingClientRect();window.AACMelodyOpenScoreTarget(hit,{clientX:r.left,clientY:r.bottom});}});anchor.svg.append(hit);
    const group=document.createElementNS(NS,'g');group.setAttribute('class','aac-score-analysis');group.dataset.measure=index;group.dataset.slot=slot.index;
    const linesText=texts.flatMap(text=>wrap(text,Math.max(14,Math.floor((ps.length>1?Math.max(95,(ps.at(-1).x-anchor.x+60)/slots.length):150)/6))));
    linesText.forEach((text,j)=>{const t=document.createElementNS(NS,'text');t.textContent=text;t.setAttribute('x',x*factor);t.setAttribute('y',(anchor.y-32-(linesText.length-1-j)*14)*factor);t.setAttribute('text-anchor','middle');t.setAttribute('font-size',12*factor);t.setAttribute('font-family','Georgia,serif');t.setAttribute('fill','#704b20');group.append(t);});anchor.svg.append(group);
   });
  });
 }
 function wrap(text,max){const result=[];let line='';for(const word of text.split(/\s+/)){if(line&&line.length+word.length+1>max){result.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)result.push(line);return result;}
 function update(frame,follow=false){if(!display||!frame)return;sheetHost.dataset.playbackBeat=String(frame.writtenBeat);sheetHost.dataset.playbackTime=String(frame.time);sheetHost.dataset.activeMidi=frame.active.map(n=>n.e.midi).join(',');const local=frame.localBeat,ps=points.filter(p=>p.measure===frame.measure),point=ps.filter(p=>p.beat<=local+1e-7).at(-1)||ps[0];if(!point)return;const signature=point.measure+':'+point.beat;if(signature===active)return;active=signature;lines.forEach(n=>n.style.display='none');const line=[...point.svg.querySelectorAll('.aac-note-cursor')][0],factor=scale(point.svg);line.setAttribute('x1',(point.x-3)*factor);line.setAttribute('x2',(point.x-3)*factor);line.setAttribute('y1',(point.y-5)*factor);line.setAttribute('y2',(point.y+point.height+5)*factor);line.style.display='';sheetHost.dataset.cursorMeasure=String(point.measure);sheetHost.dataset.cursorBeat=String(point.beat);if(follow)reveal(line);}
 function reveal(element){
  if(!element)return;const box=element.getBoundingClientRect(),host=sheetHost.getBoundingClientRect(),dock=document.querySelector('.melody-instruments:not([hidden])'),bottom=Math.min(innerHeight,dock?.getBoundingClientRect().top??innerHeight)-12,top=Math.max(86,document.querySelector('.melody-sticky')?.getBoundingClientRect().bottom||0)+8;
  if(box.top<host.top+8)sheetHost.scrollTop-=host.top+8-box.top;else if(box.bottom>host.bottom-8)sheetHost.scrollTop+=box.bottom-host.bottom+8;
  const visible=element.getBoundingClientRect();if(visible.bottom>bottom)window.scrollBy({top:visible.bottom-bottom,behavior:'instant'});else if(visible.top<top)window.scrollBy({top:visible.top-top,behavior:'instant'});
 }
 function select(index,notify=true){sheetHost.querySelectorAll('.aac-measure-target').forEach(n=>n.classList.toggle('aac-selected-measure',+n.dataset.measure===index));sheetHost.querySelector(`.aac-measure-target[data-measure="${index}"]`)?.focus({preventScroll:true});reveal(sheetHost.querySelector('.aac-selected-measure'));if(notify)window.AACMelodyMeasureSelected?.(index);}
 window.AACMelodyScoreView={build,update,select,systemStarts};
})();
