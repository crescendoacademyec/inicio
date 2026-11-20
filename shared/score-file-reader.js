/* Local MEI (modern staff notation) -> MusicXML bridge for the existing score players. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CrescendoScoreFile=Object.assign({},root.CrescendoScoreFile,api);})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const tag=n=>n?.localName||n?.tagName?.split(':').at(-1),children=n=>Array.from(n?.children||n?.childNodes||[]).filter(x=>x.nodeType===undefined||x.nodeType===1),attr=(n,k)=>n?.getAttribute(k)??null;
 const descendants=(n,name)=>children(n).flatMap(c=>[...(tag(c)===name?[c]:[]),...descendants(c,name)]),child=(n,name)=>children(n).find(c=>tag(c)===name),text=n=>String(n?.textContent||'').trim();
 const escape=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),el=(name,value='',attributes={})=>`<${name}${Object.entries(attributes).filter(([,v])=>v!==null&&v!==undefined).map(([k,v])=>` ${k}="${escape(v)}"`).join('')}>${value}</${name}>`,word=(name,value,attributes)=>el(name,escape(value),attributes);
 const id=n=>attr(n,'xml:id')||attr(n,'id'),ref=value=>String(value||'').replace(/^#/,''),natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11},accidentals={n:0,s:1,f:-1,ss:2,x:2,ff:-2,ns:1,nf:-1},accidentalNames={n:'natural',s:'sharp',f:'flat',ss:'double-sharp',x:'double-sharp',ff:'flat-flat',ns:'natural-sharp',nf:'natural-flat'};
 const durationTypes={'1':'whole','2':'half','4':'quarter','8':'eighth','16':'16th','32':'32nd','64':'64th','128':'128th','256':'256th',breve:'breve',long:'long',maxima:'maxima'};
 const gcd=(a,b)=>b?gcd(b,a%b):a,lcm=(a,b)=>a/gcd(a,b)*b;
 function parseXML(xml,Parser=globalThis.DOMParser){
  if(typeof xml!=='string'||xml.length>8*1024*1024||/<!ENTITY/i.test(xml))throw Error('La partitura XML no es compatible o supera 8 MB.');
  if(!Parser)throw Error('El navegador no dispone de lector XML.');
  const doc=new Parser().parseFromString(xml.replace(/^\uFEFF/,''),'application/xml');
  if(tag(doc.documentElement)==='parsererror'||descendants(doc,'parsererror').length)throw Error('El archivo contiene XML incompleto o incorrecto.');return doc;
 }
 function keySignature(value){if(value===null||value==='')return null;if(value==='0')return 0;const m=value.match(/^([1-7])([sf])$/);if(!m)throw Error('Esta armadura MEI todavía no es compatible: '+value);return +m[1]*(m[2]==='f'?-1:1);}
 function config(node,old={}){
  const value={fifths:0,mode:'major',beats:'4',unit:4,clef:'G',line:2,clefOctave:0,transpose:0,explicitTranspose:false,ppq:null,lines:5,...old},key=child(node,'keySig'),meter=child(node,'meterSig'),clef=child(node,'clef');
  const sig=attr(key,'sig')??attr(node,'key.sig');if(sig!==null)value.fifths=keySignature(sig);value.mode=attr(key,'mode')||attr(node,'key.mode')||value.mode;
  value.beats=attr(meter,'count')||attr(node,'meter.count')||value.beats;value.unit=+(attr(meter,'unit')||attr(node,'meter.unit')||value.unit);value.timeSymbol=attr(meter,'sym')||attr(node,'meter.sym')||value.timeSymbol;
  value.clef=attr(clef,'shape')||attr(node,'clef.shape')||value.clef;value.line=+(attr(clef,'line')||attr(node,'clef.line')||value.line);
  const displacement=attr(clef,'dis')||attr(node,'clef.dis'),place=attr(clef,'dis.place')||attr(node,'clef.dis.place');
  if(displacement)value.clefOctave=({8:1,15:2,22:3}[displacement]||0)*(place==='below'?-1:1);
  const transpose=attr(node,'trans.semi');if(transpose!==null){value.transpose=+transpose;value.explicitTranspose=true;}
  if(attr(node,'ppq')!==null)value.ppq=+attr(node,'ppq');if(attr(node,'lines')!==null)value.lines=+attr(node,'lines');
  const label=child(node,'label');value.label=text(label)||attr(node,'label')||value.label;
  if(!Number.isFinite(value.unit)||value.unit<=0||!/^[1-9]\d*(?:\+[1-9]\d*)*$/.test(value.beats)||!Number.isFinite(value.transpose))throw Error('Compás o transposición MEI no válido.');
  return value;
 }
 function convertElement(root){
  if(tag(root)!=='mei')throw Error('El documento no es MEI.');
  const scores=descendants(root,'score');if(scores.length!==1)throw Error('Selecciona un MEI con una sola partitura. Exporta los movimientos o partes por separado.');
  const score=scores[0],warnings=[],unsupported=['neume','mensur','ligature','tabGrp','nc','multiRest','mRpt','mRpt2','beatRpt','halfmRpt','tupletSpan','app','choice','subst'];
  for(const name of unsupported)if(descendants(score,name).length)throw Error(`El elemento MEI «${name}» aún no es compatible con este reproductor. Exporta esa partitura como MusicXML.`);
  if(descendants(score,'note').length>100000)throw Error('La partitura contiene demasiadas notas.');
  const definitions=descendants(score,'staffDef'),staffNumbers=[...new Set(definitions.map(n=>attr(n,'n')||'1'))];if(!staffNumbers.length)throw Error('El MEI no define sus pentagramas.');
  const state=new Map(staffNumbers.map(n=>[n,config(null)])),records=[];let global=config(null),divisions=20160;
  for(const def of definitions){const ppq=+attr(def,'ppq');if(Number.isInteger(ppq)&&ppq>0)divisions=lcm(divisions,ppq);}
  if(divisions>10000000)throw Error('La resolución rítmica MEI supera el límite del reproductor.');
  function visit(node){
   if(tag(node)==='scoreDef'){
    global=config(node,global);for(const n of staffNumbers)state.set(n,config(node,state.get(n)));
    for(const def of descendants(node,'staffDef')){const n=attr(def,'n')||'1';state.set(n,config(def,state.get(n)||global));}return;
   }
   if(tag(node)==='measure'){
    records.push({node,configs:new Map([...state].map(([n,c])=>[n,{...c}])),endings:[]});
    for(const staff of children(node).filter(n=>tag(n)==='staff')){
     const number=attr(staff,'n')||'1';
     for(const change of descendants(staff,'clef'))state.set(number,config({getAttribute:()=>null,children:[change]},state.get(number)));
    }return;
   }
   const first=records.length;for(const c of children(node))visit(c);
   if(tag(node)==='ending'&&records.length>first){const number=(attr(node,'n')||'1').replace(/[^0-9,]/g,'');records[first].endings.push({type:'start',number});records.at(-1).endings.push({type:attr(records.at(-1).node,'right')?.includes('rpt')?'stop':'discontinue',number});}
  }
  visit(score);if(!records.length||records.length>5000)throw Error('El MEI no contiene compases compatibles.');
  const marks=new Map(),addMark=(target,value)=>{if(!target)return;const key=ref(target);if(!marks.has(key))marks.set(key,[]);marks.get(key).push(value);};
  for(const [name,xmlName]of [['tie','tied'],['slur','slur'],['fermata','fermata'],['fing','fingering']])descendants(score,name).forEach((node,i)=>{
   if(name==='fermata'||name==='fing'){addMark(attr(node,'startid'),{name:xmlName,text:name==='fing'?text(node):''});return;}
   addMark(attr(node,'startid'),{name:xmlName,type:'start',number:(i%6)+1});addMark(attr(node,'endid'),{name:xmlName,type:'stop',number:(i%6)+1});
  });
  let noteCount=0,restCount=0;const offsets=new Set();
  function attributes(c,first){
   const offset=c.explicitTranspose?c.transpose:c.clefOctave*12;offsets.add(offset);
   return el('attributes',(first?word('divisions',divisions):'')+el('key',word('fifths',c.fifths)+word('mode',c.mode))+
    el('time',word('beats',c.beats)+word('beat-type',c.unit),{symbol:c.timeSymbol==='cut'?'cut':c.timeSymbol==='common'?'common':null})+
    el('clef',word('sign',c.clef)+word('line',c.line)+(c.clefOctave?word('clef-octave-change',c.clefOctave):''))+
    el('transpose',word('diatonic',0)+word('chromatic',offset)));
  }
  function duration(node,parent,c,ratio=1){
   const ppq=attr(node,'dur.ppq')??attr(parent,'dur.ppq'),dur=attr(node,'dur')||attr(parent,'dur'),dots=+(attr(node,'dots')??attr(parent,'dots')??descendants(node,'dot').length);
   if(tag(node)==='mRest'||tag(node)==='mSpace')return {ticks:Math.round(c.beats.split('+').reduce((a,b)=>a+(+b),0)*4/c.unit*divisions),dur:'1',dots:0};
   if(!dur||!durationTypes[dur])throw Error('Duración MEI no compatible: '+dur);
   const quarters=ppq!==null&&+ppq>0&&c.ppq?+ppq/c.ppq:({breve:8,long:16,maxima:32}[dur]||4/+dur)*(2-2**(-dots))*ratio,ticks=quarters*divisions;
   if(!Number.isFinite(ticks)||ticks<=0||Math.abs(Math.round(ticks)-ticks)>1e-5)throw Error('No se puede representar exactamente esta duración MEI.');
   return {ticks:Math.round(ticks),dur,dots};
  }
  function events(layer,c){
   const out=[];
   function walk(node,tuplets=[],beams=[]){
    const name=tag(node);
    if(['note','rest','space','mRest','mSpace','chord'].includes(name)){
     const ratio=tuplets.reduce((r,t)=>r*t.base/t.num,1),d=duration(node,null,c,ratio);
     out.push({node,...d,tuplets:[...tuplets],beams:[...beams]});return;
    }
    if(name==='tuplet'){const num=+(attr(node,'num')||3),base=+(attr(node,'numbase')||2);if(!(num>0&&base>0))throw Error('Tresillo/grupo irregular MEI incorrecto.');tuplets=[...tuplets,{node,num,base}];}
    if(name==='beam')beams=[...beams,node];
    if(['keySig','meterSig'].includes(name))throw Error('Los cambios de armadura o compás dentro de una voz MEI requieren MusicXML.');
    if(name==='clef'){out.push({node,clef:true});return;}
    for(const ch of children(node))walk(ch,tuplets,beams);
   }
   walk(layer);return out;
  }
  // Resolve accidental carry in score time, rather than in serialized voice order.
  function pitchesForMeasure(lists,c,tieState){
   const timed=[];lists.forEach(list=>{let time=0;for(const event of list){if(event.clef)continue;const notes=tag(event.node)==='chord'?children(event.node).filter(n=>tag(n)==='note'):[event.node];for(const n of notes)if(tag(n)==='note')timed.push({n,event,time});if(!attr(event.node,'grace'))time+=event.ticks;}});
   timed.sort((a,b)=>a.time-b.time);const state=new Map(),pitches=new Map();
   for(const {n,event} of timed){
    const step=(attr(n,'pname')||'').toUpperCase(),octave=attr(n,'oct'),key=step+octave,logical=attr(n,'accid')||attr(child(n,'accid'),'accid'),gestural=attr(n,'accid.ges')||attr(child(n,'accid'),'accid.ges'),token=gestural||logical;
    if(token&&!(token in accidentals))throw Error('Alteración MEI no compatible: '+token);
    const tie=attr(n,'tie')||attr(event.node,'tie')||'',marksHere=[...(marks.get(id(n))||[]),...(marks.get(id(event.node))||[])],stop=/[tm]/.test(tie)||marksHere.some(m=>m.name==='tied'&&m.type==='stop'),start=/[im]/.test(tie)||marksHere.some(m=>m.name==='tied'&&m.type==='start'),order=c.fifths<0?'BEADGCF':'FCGDAEB',keyAlter=order.slice(0,Math.abs(c.fifths)).includes(step)?Math.sign(c.fifths):0;
    const alter=token?accidentals[token]:(stop&&tieState.has(key)?tieState.get(key):(state.get(key)??keyAlter));
    pitches.set(n,alter);if(logical)state.set(key,accidentals[logical]);if(stop)tieState.delete(key);if(start)tieState.set(key,alter);
   }return pitches;
  }
  function noteXML(event,n,index,voice,c,pitches,all){
   const chord=tag(event.node)==='chord',rest=['rest','space','mRest','mSpace'].includes(tag(n)),hidden=['space','mSpace'].includes(tag(n)),logical=attr(n,'accid')||attr(child(n,'accid'),'accid'),gestural=attr(n,'accid.ges')||attr(child(n,'accid'),'accid.ges');
   let pitch='';
   if(rest){restCount++;pitch=el('rest','',{measure:tag(n)==='mRest'||tag(n)==='mSpace'?'yes':null});}
   else{
    const step=(attr(n,'pname')||'').toUpperCase(),octave=+attr(n,'oct');if(!(step in natural)||attr(n,'oct')===null||!Number.isInteger(octave))throw Error('Una nota MEI no tiene altura u octava.');
    const token=gestural||logical;if(token&&!(token in accidentals))throw Error('Alteración MEI no compatible: '+token);
    const alter=pitches.get(n);
    if(12*(octave+1)+natural[step]+alter<0||12*(octave+1)+natural[step]+alter>127)throw Error('Nota MEI fuera del rango MIDI.');
    pitch=el('pitch',word('step',step)+word('alter',alter)+word('octave',octave));noteCount++;
   }
   const extras=[...(marks.get(id(n))||[]),...(chord?(marks.get(id(event.node))||[]):[])],tie=attr(n,'tie')||attr(event.node,'tie')||'';
   if(/[im]/.test(tie))extras.push({name:'tied',type:'start'});if(/[tm]/.test(tie))extras.push({name:'tied',type:'stop'});
   const unique=[...new Map(extras.map(m=>[m.name+':'+m.type+':'+(m.name==='slur'?m.number:''),m])).values()],ties=unique.filter(m=>m.name==='tied');
   let notation=unique.filter(m=>m.name!=='fingering').map(m=>word(m.name,m.text||'',{type:m.type,number:m.name==='slur'?m.number:null})).join('');
   const articulations=(attr(n,'artic')||attr(child(n,'artic'),'artic')||'').split(/\s+/).filter(Boolean).map(a=>({stacc:'staccato',ten:'tenuto',acc:'accent',marc:'strong-accent',stacciss:'staccatissimo',spicc:'spiccato'})[a]).filter(Boolean);
   if(articulations.length)notation+=el('articulations',articulations.map(a=>el(a)).join(''));
   const technical=unique.filter(m=>m.name==='fingering').map(m=>word('fingering',m.text)).join('');if(technical)notation+=el('technical',technical);
   let timeMod='',beamXML='';
   if(event.tuplets.length){const actual=event.tuplets.reduce((r,t)=>r*t.num,1),normal=event.tuplets.reduce((r,t)=>r*t.base,1);timeMod=el('time-modification',word('actual-notes',actual)+word('normal-notes',normal));
    if(!index)event.tuplets.forEach((t,k)=>{const group=all.filter(e=>e.tuplets?.some(x=>x.node===t.node));if(group[0]===event)notation+=el('tuplet','',{type:'start',number:k+1,bracket:attr(t.node,'bracket.visible')==='false'?'no':'yes'});if(group.at(-1)===event)notation+=el('tuplet','',{type:'stop',number:k+1});});
   }
   if(!rest&&!index&&+event.dur>=8)event.beams.forEach((beam,k)=>{const group=all.filter(e=>e.beams?.includes(beam)&&+e.dur>=8&&!['rest','space'].includes(tag(e.node))),i=group.indexOf(event);if(group.length>1)beamXML+=word('beam',i===0?'begin':i===group.length-1?'end':'continue',{number:k+1});});
   const lyric=children(n).filter(v=>tag(v)==='verse').map(v=>el('lyric',word('text',text(v)),{number:attr(v,'n')||1})).join('');
   return el('note',(index?el('chord'):'')+(attr(n,'grace')?el('grace'):'')+pitch+(!attr(n,'grace')?word('duration',event.ticks):'')+ties.map(m=>el('tie','',{type:m.type})).join('')+word('voice',voice)+word('type',durationTypes[event.dur])+el('dot').repeat(event.dots)+(logical?word('accidental',accidentalNames[logical]):'')+timeMod+(attr(n,'stem.dir')?word('stem',attr(n,'stem.dir')):'')+(attr(n,'head.shape')==='slash'?word('notehead','slash'):'')+beamXML+(notation?el('notations',notation):'')+lyric,{'print-object':hidden?'no':null,color:attr(n,'color')});
  }
  function direction(node,c){
   const value=text(node),name=tag(node),beat=+(attr(node,'tstamp')||1)-1,offset=Math.round(beat*4/c.unit*divisions),placement=attr(node,'place')||'above';
   if(name==='harm'){
    const symbol=value.replace(/♭/g,'b').replace(/♯/g,'#').replace(/−/g,'-'),m=symbol.match(/^([A-G])([b#]?)(.*?)(?:\/([A-G])([b#]?))?$/);
    if(m){const suffix=m[3],kind={'':'major',m:'minor','-':'minor',m7:'minor-seventh','-7':'minor-seventh',maj7:'major-seventh',M7:'major-seventh','7':'dominant','6':'major-sixth',m6:'minor-sixth',dim:'diminished',dim7:'diminished-seventh','ø':'half-diminished',m7b5:'half-diminished',sus4:'suspended-fourth',aug:'augmented'}[suffix]||'other';return el('harmony',el('root',word('root-step',m[1])+(m[2]?word('root-alter',m[2]==='b'?-1:1):''))+word('kind',kind,{text:suffix})+(m[4]?el('bass',word('bass-step',m[4])+(m[5]?word('bass-alter',m[5]==='b'?-1:1):'')):'')+word('offset',offset));}
   }
   if(name==='repeatMark'){const func=attr(node,'func');if(['segno','coda'].includes(func))return el('direction',el('direction-type',el(func))+word('offset',offset)+el('sound','',{[func]:id(node)||func}),{placement});}
   const unit=+(attr(node,'mm.unit')||4),mm=+(attr(node,'mm')||0),bpm=+(attr(node,'midi.bpm')||mm*4/unit||0);
   if(name==='tempo'&&mm>0){const label=value.replace(/[\uE000-\uF8FF]/g,'').replace(/\s*=\s*\d+(?:\.\d+)?\s*$/,'').trim(),beatUnit=durationTypes[String(unit)]||'quarter',metronome=el('metronome',word('beat-unit',beatUnit)+el('beat-unit-dot').repeat(+(attr(node,'mm.dots')||0))+word('per-minute',mm));return el('direction',(label?el('direction-type',word('words',label)):'')+el('direction-type',metronome)+word('offset',offset)+el('sound','',{tempo:bpm}),{placement});}
   const type=name==='dynam'&&/^(p{1,6}|f{1,6}|mp|mf|sfz|fp)$/.test(value)?el('dynamics',el(value)):word(name==='reh'?'rehearsal':'words',value||'Tempo');
   return el('direction',el('direction-type',type)+word('offset',offset)+(bpm>0?el('sound','',{tempo:bpm}):''),{placement});
  }
  function barline(value,side,endings){
   const repeat=String(value||'').includes('rpt')?(side==='left'?'forward':'backward'):null,style={end:'light-heavy',dbl:'light-light',rptstart:'heavy-light',rptend:'light-heavy',rptboth:'light-heavy',invis:'none',dashed:'dashed'}[value];
   const ending=endings.filter(e=>side==='left'?e.type==='start':e.type!=='start').map(e=>el('ending','',{number:e.number,type:e.type})).join('');return repeat||style||ending?el('barline',(style?word('bar-style',style):'')+ending+(repeat?el('repeat','',{direction:repeat}):''),{location:side}):'';
  }
  const parts=staffNumbers.map((number,partIndex)=>{
   let previous=null;const tieState=new Map();
   const measures=records.map((record,measureIndex)=>{
    const c=record.configs.get(number)||global,staff=children(record.node).find(s=>tag(s)==='staff'&&(attr(s,'n')||'1')===number),layers=staff?children(staff).filter(n=>tag(n)==='layer'):[],signature=JSON.stringify(c);
    let music=signature!==previous?attributes(c,measureIndex===0):'';previous=signature;
    music+=barline(attr(record.node,'left'),'left',record.endings);
    for(const node of children(record.node))if(['harm','tempo','dir','reh','dynam','repeatMark'].includes(tag(node))&&(!attr(node,'staff')||attr(node,'staff').split(/\s+/).includes(number)))music+=direction(node,c);
    const lists=layers.map(layer=>events(layer,c)),pitches=pitchesForMeasure(lists,c,tieState);let previousLength=0;
    if(!layers.length)music+=el('note',el('rest','',{measure:'yes'})+word('duration',Math.round(c.beats.split('+').reduce((a,b)=>a+(+b),0)*4/c.unit*divisions)));
    layers.forEach((layer,voiceIndex)=>{
     if(voiceIndex&&previousLength)music+=el('backup',word('duration',previousLength));previousLength=0;
     const list=lists[voiceIndex];
     for(const event of list){
      if(event.clef){const next=config({getAttribute:()=>null,children:[event.node]},c);music+=el('attributes',el('clef',word('sign',next.clef)+word('line',next.line)+(next.clefOctave?word('clef-octave-change',next.clefOctave):'')));continue;}
      const notes=tag(event.node)==='chord'?children(event.node).filter(n=>tag(n)==='note'):[event.node];
      if(!notes.length)throw Error('Acorde MEI sin notas.');notes.forEach((n,i)=>{music+=noteXML(event,n,i,attr(layer,'n')||voiceIndex+1,c,pitches,list);});if(!attr(event.node,'grace'))previousLength+=event.ticks;
     }
    });
    music+=barline(attr(record.node,'right'),'right',record.endings);
    return el('measure',music,{number:attr(record.node,'n')??measureIndex+1,implicit:attr(record.node,'metcon')==='false'?'yes':null});
   }).join('');return el('part',measures,{id:'P'+(partIndex+1)});
  }).join('');
  if(offsets.size>1)throw Error('Este MEI combina partes con transportes distintos. Exporta cada instrumento por separado como MusicXML.');
  const head=child(root,'meiHead'),titles=descendants(head||root,'title'),composer=descendants(head||root,'composer')[0]||descendants(head||root,'persName').find(n=>attr(n,'role')==='composer'),rights=descendants(head||root,'distributor').map(text).join(' · '),title=text(titles[0])||'Partitura MEI';
  const expansions=descendants(score,'expansion');let playbackRoute=null;
  if(expansions.length){
   const ids=new Map(),indices=new Map(records.map((r,i)=>[r.node,i])),visiting=new Set();
   const indexIds=n=>{if(id(n))ids.set(id(n),n);children(n).forEach(indexIds);};indexIds(score);
   const expand=node=>{
    if(visiting.has(node))throw Error('La expansión MEI contiene referencias circulares.');visiting.add(node);
    let result=[];const expansion=tag(node)==='expansion'?node:child(node,'expansion');
    if(expansion){for(const target of (attr(expansion,'plist')||'').trim().split(/\s+/).filter(Boolean)){const section=ids.get(ref(target));if(!section)throw Error('La expansión MEI contiene una sección inexistente.');result.push(...expand(section));}}
    else if(tag(node)==='measure')result=[indices.get(node)];
    else for(const ch of children(node))if(['section','ending','measure'].includes(tag(ch)))result.push(...expand(ch));
    visiting.delete(node);if(result.length>20000)throw Error('La expansión MEI supera el límite de compases.');return result;
   };
   playbackRoute=expand(expansions[0]);if(!playbackRoute.length||playbackRoute.some(i=>!Number.isInteger(i)))throw Error('La expansión MEI no identifica sus compases.');
  }
  const partList=el('part-list',staffNumbers.map((n,i)=>el('score-part',word('part-name',records[0].configs.get(n)?.label||('Pentagrama '+n)),{id:'P'+(i+1)})).join(''));
  return {content:'<?xml version="1.0" encoding="UTF-8"?>'+el('score-partwise',el('work',word('work-title',title))+el('identification',(composer?word('creator',text(composer),{type:'composer'}):'')+(rights?word('rights',rights):'')+el('encoding',word('software','Crescendo · importador MEI'))+(playbackRoute?el('miscellaneous',word('miscellaneous-field',JSON.stringify(playbackRoute),{name:'crescendo:measure-route'})):''))+partList+parts,{version:'4.0'}),format:'mei',soundOffset:[...offsets][0]||0,noteCount,restCount,warnings,playbackRoute};
 }
 function convert(xml,Parser){const doc=parseXML(xml,Parser),name=tag(doc.documentElement);if(name==='mei')return convertElement(doc.documentElement);if(!['score-partwise','score-timewise'].includes(name))throw Error('El XML no contiene una partitura MEI o MusicXML.');return {content:xml,format:'musicxml',soundOffset:null,warnings:[]};}
 async function read(file){
  if(!file||file.size>8*1024*1024)throw Error('Selecciona una partitura de hasta 8 MB.');
  if(/\.mxl$/i.test(file.name))return {content:await file.arrayBuffer(),format:'mxl',soundOffset:null,warnings:[]};
  const source=await file.text(),doc=parseXML(source),name=tag(doc.documentElement);
  if(name==='mei')return convertElement(doc.documentElement);
  if(!['score-partwise','score-timewise'].includes(name))throw Error('El XML no contiene una partitura MEI o MusicXML.');
  return {content:source,format:'musicxml',soundOffset:null,warnings:[],playbackRoute:globalThis.CrescendoScoreRoute?.fromElement(doc.documentElement)??null};
 }
 async function readXml(file){
  const loaded=await read(file);if(loaded.format!=='mxl')return loaded;
  const Zip=globalThis.JSZip;if(!Zip)throw Error('No se pudo cargar el lector MXL. Usa MusicXML sin comprimir o MEI.');
  const zip=await Zip.loadAsync(loaded.content),container=zip.file('META-INF/container.xml');let name;
  if(container){const doc=parseXML(await container.async('string'));name=doc.querySelector('rootfile')?.getAttribute('full-path');}
  const entry=name?zip.file(name):Object.values(zip.files).find(f=>!f.dir&&/\.(musicxml|xml)$/i.test(f.name)&&!/^META-INF\//i.test(f.name));
  if(!entry)throw Error('No hay una partitura MusicXML dentro del MXL.');
  if(entry._data?.uncompressedSize>8*1024*1024)throw Error('La partitura descomprimida supera 8 MB.');
  const content=await entry.async('string');if(content.length>8*1024*1024)throw Error('La partitura descomprimida supera 8 MB.');
  return {...convert(content),format:'mxl'};
 }
 return {read,readXml,convert,convertElement,parseXML};
});
