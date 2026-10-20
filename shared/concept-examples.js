(function(root){'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const catalogs={functional:{},reading:{},jazz:{},production:{}};
function add(course,key,spec){catalogs[course][key]=spec;}
const names={C:'Do',D:'Re',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'},naturals={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function pitch(note){const m=/^([A-G])([#b]*)(-?\d+)$/.exec(note);if(!m)throw Error('Nota no válida: '+note);return {octave:Number(m[3]),step:Number(m[3])*7+'CDEFGAB'.indexOf(m[1]),label:names[m[1]]+m[2].replace(/#/g,'♯').replace(/b/g,'♭'),midi:(Number(m[3])+1)*12+naturals[m[1]]+[...m[2]].reduce((a,c)=>a+(c==='#'?1:-1),0),acc:m[2]};}
function staff(groups,{clef,labels=true,intervalSteps=[],pianoProvided=false,compact=false,instrument=true,instrumentContext={}}={}){groups=typeof groups==='string'?groups.split(' '):groups;const all=groups.flatMap(group=>String(group).split('+').map(pitch));clef=clef||(Math.max(...all.map(p=>p.midi))<60?'bass':'treble');const refStep=clef==='bass'?22:34,maxY=Math.max(...all.map(p=>66+(refStep-p.step)*5)),minY=Math.min(...all.map(p=>66+(refStep-p.step)*5)),labelY=Math.max(136,maxY+28),viewTop=Math.min(0,minY-15),viewHeight=Math.max(158,labelY+20)-viewTop;const w=compact?Math.max(240,groups.length*43+65):Math.max(500,groups.length*65+65),ref=clef==='bass'?22:34;let s='';for(let i=0;i<5;i++)s+=`<path d="M12 ${46+i*10}H${w-12}" class="ce-staff-line"/>`;s+=`<text x="20" y="${clef==='bass'?56:76}" class="ce-music" font-size="40">${String.fromCodePoint(clef==='bass'?0xE062:0xE050)}</text>`;for(const [i,group] of groups.entries()){const x=groups.length===1?w/2:70+i*(w-110)/(groups.length-1),notes=String(group).split('+').map(pitch),ys=notes.map(p=>66+(ref-p.step)*5),down=ys.reduce((a,b)=>a+b,0)/ys.length<=66;for(const p of notes){const y=66+(ref-p.step)*5;for(let k=36;k>=y;k-=10)s+=`<path d="M${x-10} ${k}h20" class="ce-staff-line"/>`;for(let k=96;k<=y;k+=10)s+=`<path d="M${x-10} ${k}h20" class="ce-staff-line"/>`;let clusterStart=p.step;while(notes.some(n=>n.step===clusterStart-1))clusterStart--;const headShift=(p.step-clusterStart)%2?(down?-10:10):0;s+=`<text x="${x-6+headShift}" y="${y}" class="ce-music" font-size="40">&#xE0A4;</text>`;if(p.acc)s+=`<text x="${x-22}" y="${y}" class="ce-music" font-size="32">${String.fromCodePoint(p.acc==='##'?0xE263:p.acc==='bb'?0xE264:p.acc[0]==='#'?0xE262:0xE260)}</text>`;}if(intervalSteps[i])s+=`<text x="${x+(w-110)/Math.max(1,groups.length-1)/2}" y="114" text-anchor="middle" class="ce-step-label">${esc(intervalSteps[i])}</text>`;s+=`<path d="M${x+(down?-6:6)} ${down?Math.min(...ys):Math.max(...ys)}v${down?32:-32}" class="ce-staff-line"/>`;if(labels)s+=`<text x="${x}" y="${labelY}" text-anchor="middle" class="ce-note-label">${notes.map(p=>esc(p.label+p.octave)).join('·')}</text>`;}
const score=`<div class="ce-scroll ce-score" tabindex="0" role="region" aria-label="Ejemplo en pentagrama"><svg viewBox="0 ${viewTop} ${w} ${viewHeight}" role="img" aria-label="Clave de ${clef==='bass'?'fa':'sol'}: ${esc(groups.join(' · '))}">${s}</svg></div>`;return instrument&&root.CourseInstruments?root.CourseInstruments.group(score,all,{pianoProvided,kind:groups.length===1&&String(groups[0]).includes('+')?'chord':'scale',...instrumentContext}):score;}
function steps(items){return `<ol class="ce-steps">${items.map((x,i)=>`<li><span>${esc(x)}</span>${i<items.length-1?'<b aria-hidden="true">→</b>':''}</li>`).join('')}</ol>`;}
// Instructional diagrams keep notation in the bundled Bravura font.
function diagram(spec){
 const glyph=(x,y,code,size=40)=>`<text x="${x}" y="${y}" class="ce-music" style="font-size:${size}px">&#x${code.toString(16)};</text>`;
 const label=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" class="ce-diagram-label">${esc(t)}</text>`;
 const line=(x,y,x2,y2)=>`<path d="M${x} ${y}L${x2} ${y2}" class="ce-staff-line"/>`;
 const stave=()=>Array.from({length:5},(_,i)=>line(20,46+i*10,540,46+i*10)).join('');
 let content='',height=155;
 if(spec.type==='staff'){
  content=stave();for(let i=0;i<5;i++)content+=label(55+i*94,115,(i+1)+'.ª línea')+glyph(50+i*94,86-i*10,0xe0a4);
  content+=label(280,25,'Las líneas se cuentan desde abajo');
 }else if(spec.type==='meter'){
  const groups=spec.groups,total=groups.reduce((a,b)=>a+b,0),spacing=420/total;
  content=stave()+glyph(25,76,0xe050)+glyph(66,66,0xe080+(spec.numerator||total))+glyph(66,86,0xe080+(spec.denominator||8));
  let at=0;groups.forEach((count,g)=>{const start=108+at*spacing,end=start+(count-1)*spacing;
   for(let j=0;j<count;j++){const x=start+j*spacing;content+=glyph(x-6,76,0xe0a4)+line(x+6,76,x+6,41)+label(x,112,at+j+1);}
   if((spec.noteValue||8)===8){if(count>1)content+=`<path d="M${start+6} 41H${end+6}" stroke="currentColor" stroke-width="4"/>`;else content+=glyph(start+6,41,0xe240);}
   content+=`<path d="M${start-9} 124v5H${end+12}v-5" class="ce-staff-line"/>`+label((start+end)/2,148,'Grupo '+(g+1));at+=count;
  });height=168;
 }else if(spec.type==='rests'){
  content=stave()+glyph(25,76,0xe050);for(let i=0;i<4;i++){const x=125+i*115;content+=(i%2?glyph(x-5,66,0xe4e5):glyph(x-6,76,0xe0a4)+line(x+6,76,x+6,41))+label(x,125,'Pulso '+(i+1));}
 }else if(spec.type==='dynamics'){
  content=stave()+glyph(25,76,0xe050);for(let i=0;i<4;i++){const x=115+i*120;content+=glyph(x-6,76,0xe0a4)+line(x+6,76,x+6,41);}
  content+=glyph(100,123,0xe520,32)+glyph(460,123,0xe522,32)+`<path d="M175 113L420 104M175 113L420 122" class="ce-staff-line"/>`;
 }else if(spec.type==='polyrhythm'){
  content=label(280,24,'Un mismo ciclo: seis subdivisiones iguales');
  [[2,3,'2 golpes'],[3,2,'3 golpes']].forEach(([n,step,name],r)=>{const y=65+r*55;content+=label(52,y+4,name)+line(110,y,510,y);for(let i=0;i<6;i++)content+=`<circle cx="${120+i*76}" cy="${y}" r="${i%step===0?8:3}" fill="${i%step===0?'#d4a84f':'#999'}"/>`+label(120+i*76,y+25,i+1);});height=165;
 }else if(spec.type==='conversion'){
  height=155;let analog='',samples='';for(let i=0;i<=120;i++){const x=30+i*1.6,y=72-30*Math.sin(i/120*4*Math.PI);analog+=(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2);}
  for(let i=0;i<=16;i++){const x=340+i*11,y=72-Math.round(3*Math.sin(i/16*4*Math.PI))*10;samples+=line(x,72,x,y)+`<circle cx="${x}" cy="${y}" r="3" fill="#d4a84f"/>`;}
  content=`<path d="${analog}" class="ce-wave"/>`+label(274,76,'A/D →')+samples+label(125,130,'Señal analógica continua')+label(430,130,'Muestras digitales');
 }else if(spec.type==='tempo'){
  [60,90,120].forEach((bpm,r)=>{const y=32+r*55;content+=label(58,y+5,bpm+' BPM')+line(120,y,500,y);for(let i=0;i<=bpm/30;i++)content+=`<circle cx="${120+i*380/(bpm/30)}" cy="${y}" r="6" fill="#d4a84f"/>`;});content+=label(310,190,'El mismo intervalo: 2 segundos');height=205;
 }else if(spec.type==='fifths'){
  height=310;const keys=['Do','Sol','Re','La','Mi','Si','Fa♯ / Sol♭','Re♭','La♭','Mi♭','Si♭','Fa'];
  content=`<circle cx="280" cy="150" r="105" class="ce-axis"/>`;
  keys.forEach((key,i)=>{const a=(i/12)*Math.PI*2-Math.PI/2,x=280+112*Math.cos(a),y=150+112*Math.sin(a);content+=label(x,y,key);});content+=label(280,145,'Quintas →')+label(280,167,'← Cuartas');
 }else if(spec.type==='form'){
  const sections=spec.sections,unit=480/sections.reduce((a,b)=>a+b.bars,0);let x=40;
  sections.forEach((section,i)=>{const w=section.bars*unit;content+=`<rect x="${x}" y="35" width="${w-3}" height="55" rx="5" fill="${section.label==='B'?'#d4a84f55':'#d4a84f22'}" stroke="#d4a84f"/>`+label(x+w/2,57,section.label)+label(x+w/2,78,section.bars+' compases');for(let b=1;b<section.bars;b++)content+=`<path d="M${x+b*unit} 94v8" class="ce-axis"/>`;x+=w;});content+=label(280,130,'El ancho representa la duración de cada sección');
 }
 return `<div class="ce-scroll ce-diagram${['staff','meter','rests','dynamics'].includes(spec.type)?' ce-score':''}"><svg viewBox="0 0 560 ${height}" role="img" aria-label="${esc(spec.label||spec.type)}">${content}</svg></div>`;
}
function keyboard(){
  const whites=[['Do',0],['Re',2],['Mi',4],['Fa',5],['Sol',7],['La',9],['Si',11],['Do',12]];
  const blacks=[['Do♯',1,1],['Re♯',3,2],['Fa♯',6,4],['Sol♯',8,5],['La♯',10,6]];
  return `<div class="ce-keyboard-scroll" data-ci-view="piano"><div class="ce-keys" role="img" aria-label="Piano de Do a Do: ocho teclas blancas y cinco negras superpuestas. Los números de 0 a 12 cuentan semitonos desde Do."><div class="ce-white-keys">${whites.map(([n,i])=>`<span class="ce-key ce-white-key${i===0?' ce-key-origin':''}" data-semitone="${i}"><b>${n}</b><small>${i}</small></span>`).join('')}</div>${blacks.map(([n,i,boundary])=>`<span class="ce-key ce-black-key${i===1?' ce-key-step':''}" data-semitone="${i}" style="--key-boundary:${boundary}"><b>${n}</b><small>${i}</small></span>`).join('')}</div></div><p class="ce-key-note">Los números cuentan semitonos desde Do. Cada tecla consecutiva está a 1 semitono: Do → Do♯. Mi–Fa y Si–Do también están a 1 semitono, sin tecla negra entre ellas. Do–Re = 2 semitonos.</p>`;
}
function rhythm(values){const unit=48,total=values.reduce((a,v)=>a+Number(v),0),w=Math.max(500,total*unit+90);let at=50,s='';values.forEach((v,i)=>{s+=`<rect x="${at}" y="38" width="${Number(v)*unit-3}" height="36" rx="4" class="ce-time"/><text x="${at+Number(v)*unit/2}" y="61" text-anchor="middle">${esc(v)} pulso${Number(v)===1?'':'s'}</text>`;at+=Number(v)*unit;});for(let i=0;i<=total;i++)s+=`<path d="M${50+i*unit} 83v8" class="ce-staff-line"/>`;return `<div class="ce-scroll"><svg viewBox="0 0 ${w} 115" role="img" aria-label="Duraciones sucesivas en pulsos: ${values.join(', ')}">${s}<text x="${w-30}" y="109" text-anchor="end">Tiempo →</text></svg></div>`;}
function wave(mode='frequency'){const w=560,h=155;let s='';for(const [r,cycles,amp] of mode==='amplitude'?[[0,3,12],[1,3,30]]:mode==='timbre'?[[0,3,25],[1,3,25]]:[[0,2,25],[1,4,25]]){const y=40+r*70;let d='';for(let i=0;i<=200;i++){const t=i/200,a=Math.sin(t*cycles*Math.PI*2),val=mode==='timbre'&&r?(a+.35*Math.sin(t*cycles*Math.PI*6))/1.35:a;d+=(i?'L':'M')+(90+t*445).toFixed(1)+' '+(y-val*amp).toFixed(1);}s+=`<path d="M90 ${y}H535" class="ce-axis"/><path d="${d}" class="ce-wave"/><text x="10" y="${y+4}">${mode==='amplitude'?(r?'Mayor':'Menor'):mode==='timbre'?(r?'Armónicos':'Senoide'):(r?'200 Hz':'100 Hz')}</text>`;}return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(mode)}: comparación sobre el mismo intervalo temporal">${s}<text x="535" y="150" text-anchor="end">${mode==='frequency'?'Intervalo mostrado: 20 ms →':'Mismo intervalo de tiempo →'}</text></svg>`;}
function draw(spec){let html='';if(spec.diagram)html+=diagram(spec.diagram);if(spec.diagrams)html+=spec.diagrams.map(diagram).join('');if(spec.notes)html+=staff(spec.notes,{clef:spec.clef,intervalSteps:spec.intervalSteps,pianoProvided:!!spec.keyboard,instrument:spec.instrument!==false,compact:!!spec.compact,labels:spec.labels!==false});if(spec.compare)html+=spec.compare.map(c=>`<div class="ce-comparison"><b>${esc(c.label)}</b>${staff(c.notes,{clef:c.clef||spec.clef,compact:!!spec.compactChords,instrumentContext:c.instrumentContext})}</div>`).join('');if(spec.steps)html+=steps(spec.steps);if(spec.keyboard)html+=keyboard();if(spec.rhythm)html+=rhythm(spec.rhythm);if(spec.wave)html+=wave(spec.wave);if(spec.table)html+=`<div class="ce-scroll"><table><tbody>${spec.table.map(r=>`<tr>${r.map((c,i)=>`<${i?'td':'th'} scope="${i?'':'row'}">${esc(c)}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</tbody></table></div>`;return html;}
function render(course,key){const spec=catalogs[course]?.[key];if(!spec)return '';return `<figure class="concept-example${spec.compactChords?' ce-compact-chords':''}" data-concept-example="${esc(course+':'+key)}"><figcaption><strong>${esc(spec.title)}</strong></figcaption>${draw(spec)}<p class="ce-explanation">${esc(spec.caption)}</p>${spec.use?`<p class="ce-use"><b>Para qué sirve:</b> ${esc(spec.use)}</p>`:''}</figure>`;}
// Overview cards show the relationship itself, with no additional instrument panels.
if(root.document)root.document.addEventListener('DOMContentLoaded',()=>{
 const previews={sound:{wave:'frequency'},rhythm:{notes:'G4 G4 G4 G4'},melody:{notes:'C4 E4 G4'},harmony:{notes:'C4+E4+G4'},reading:{notes:'C4 D4 E4 F4'},interval:{notes:'C4 E4'},scale:{notes:'C4 D4 E4 F4 G4 A4 B4 C5'},tonality:{notes:'G3+B3+D4+F4 C4+E4+G4'},functional:{notes:'D4+F4+A4 G3+B3+D4+F4 C4+E4+G4'}};
 for(const node of root.document.querySelectorAll('[data-ce-map]')){const spec=previews[node.dataset.ceMap];if(spec){const visual=root.document.createElement('div');visual.className='concept-example ce-map-example';visual.innerHTML=draw({...spec,instrument:false,compact:true,labels:false});node.append(visual);}}
});
const api={catalogs,add,render,staff,pitch,draw};if(typeof module==='object'&&module.exports)module.exports=api;else root.CourseExamples=api;
})(typeof window==='undefined'?globalThis:window);
