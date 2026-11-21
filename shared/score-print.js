/* Local vector PDF export. Musical glyphs and text become font outlines. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CrescendoScorePrint=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';const NS='http://www.w3.org/2000/svg',base=typeof document==='object'?new URL('.',document.currentScript.src):null;let libraries,fonts;
 function paginate(rows,{pageWidth=595.28,pageHeight=841.89,margin=36,header=42,footer=25}={}){
  if(!rows.length)throw Error('No hay sistemas para exportar.');
  const width=pageWidth-2*margin,height=pageHeight-2*margin-header-footer,scale=Math.min(width/Math.max(...rows.map(r=>r.width)),height/Math.max(...rows.map(r=>r.height)));
  if(!(scale>0)||scale<.2)throw Error('El sistema es demasiado ancho o alto. Distribuye los compases en más sistemas antes de exportar.');
  const pages=[];let page=[],used=0;for(let i=0;i<rows.length;i++){const h=rows[i].height*scale;if(page.length&&(rows[i].breakBefore||used+h>height+.001)){pages.push(page);page=[];used=0;}page.push({index:i,x:(pageWidth-rows[i].width*scale)/2,y:margin+header+used,width:rows[i].width*scale,height:h});used+=h;}if(page.length)pages.push(page);return {pages,scale,pageWidth,pageHeight,margin};
 }
 function script(url){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(Error('No se pudo cargar el exportador local de PDF.'));document.head.append(s);});}
 async function load(){if(!libraries)libraries=(async()=>{await script(new URL('../vendor/score-export/jspdf.umd.min.js',base));await script(new URL('../vendor/score-export/svg2pdf.umd.min.js',base));await script(new URL('../vendor/score-export/opentype.min.js',base));})();await libraries;
  if(!fonts)fonts=Promise.all(['Regular','Bold','Italic','BoldItalic'].map(async name=>{const r=await fetch(new URL('../vendor/score-export/NotoSerif-'+name+'.ttf',base));if(!r.ok)throw Error('No se pudo cargar la fuente del PDF.');return opentype.parse(await r.arrayBuffer());}).concat([(async()=>{const r=await fetch(new URL('../herramientas/editor-crescendo/assets/fonts/Bravura.otf',base));if(!r.ok)throw Error('No se pudo cargar Bravura.');return opentype.parse(await r.arrayBuffer());})()]));return fonts;
 }
 const musicMap={'♩':'\uE1D5','♪':'\uE1D7','♯':'\uE262','♭':'\uE260','♮':'\uE261','𝄋':'\uE047','𝄌':'\uE048'};
 async function outline(svg){const faces=await load(),host=document.createElement('div');host.style.cssText='position:absolute;left:-100000px;top:0;visibility:hidden;background:white';host.append(svg);document.body.append(host);
  try{await document.fonts.ready;
   for(const node of [...svg.querySelectorAll('text')]){
    const content=node.textContent;if(!content)continue;const group=document.createElementNS(NS,'g');for(const name of ['transform','opacity','clip-path'])if(node.hasAttribute(name))group.setAttribute(name,node.getAttribute(name));
    const runs=[],walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let text;while(text=walker.nextNode())for(const char of text.textContent)runs.push({char,element:text.parentElement});let offset=0;
    const visibleRuns=runs.filter((r,i)=>!(/\s/u.test(r.char)&&(i===0||i===runs.length-1||/\s/u.test(runs[i-1].char))));
    for(const run of visibleRuns){const style=getComputedStyle(run.element),size=parseFloat(style.fontSize)||24,music=/Bravura|Improviso/i.test(style.fontFamily)||/[\uE000-\uF8FF]/u.test(run.char)||musicMap[run.char],char=musicMap[run.char]||run.char,textFont=faces[(Number(style.fontWeight)>=600?1:0)+(/italic|oblique/.test(style.fontStyle)?2:0)],font=music&&faces[4].charToGlyph(char).index?faces[4]:textFont;
     const pos=node.getStartPositionOfChar(offset);offset++;if(/\s/u.test(char))continue;
     if(!font.charToGlyph(char).index)throw Error('No se puede exportar el símbolo «'+run.char+'» con las fuentes disponibles.');
     const path=document.createElementNS(NS,'path');path.setAttribute('d',font.getPath(char,pos.x,pos.y,size).toPathData(3));path.setAttribute('fill','#111');group.append(path);
    }
    node.replaceWith(group);
   }
   return svg;
  }finally{host.remove();}
 }
 function clean(source){const copy=source.cloneNode(true),original=[source,...source.querySelectorAll('*')],clones=[copy,...copy.querySelectorAll('*')];original.forEach((node,i)=>{const style=getComputedStyle(node);for(const key of ['fill','stroke','stroke-width','font-family','font-size','font-weight','font-style','text-anchor','opacity','visibility']){const value=style.getPropertyValue(key);if(value)clones[i].style.setProperty(key,value);}});
  copy.querySelectorAll('.measure-selection,.measure-copy-hit,.string-tab-column,.string-tab-inline,#playbackLine,.input-cursor,.cursor,.cursor-line,.input-event-preview,.input-rhythm-ruler,.pointer-input-preview,[class*="hitbox"],[class*="hit-box"],.entry-zone,.rhythm-head-target,.rhythm-measure-hit,[class*="-hit"],[fill="transparent"]').forEach(n=>n.remove());
  copy.querySelectorAll('*').forEach(n=>{if(n.style.stroke&&n.style.stroke!=='none'&&!/255, 255, 255|white/.test(n.style.stroke))n.style.stroke='#111';if(n.style.fill&&n.style.fill!=='none'&&n.style.fill!=='transparent'&&!/^rgba\([^)]*,\s*0(?:\.0+)?\)$/.test(n.style.fill)&&!/255, 255, 255|white/.test(n.style.fill))n.style.fill='#111';});return copy;
 }
 function split(svg,{rowHeight,starts=null}={}){const native=[...svg.querySelectorAll('svg[data-score-row]')],box=svg.viewBox.baseVal;
  if(native.length)return native.map(n=>{const row=n.cloneNode(true);row.setAttribute('x','0');row.setAttribute('y','0');row.setAttribute('xmlns',NS);return {svg:row,width:Number(n.getAttribute('width')),height:Number(n.getAttribute('height')),breakBefore:n.dataset.pageBreak==='true'};});
  const height=rowHeight||Number(svg.dataset.rowHeight)||box.height,count=starts?.length||Math.round(box.height/height);return Array.from({length:count},(_,i)=>{const row=svg.cloneNode(true);row.setAttribute('viewBox',`0 ${i*height} ${box.width} ${height}`);row.setAttribute('width',box.width);row.setAttribute('height',height);row.style.overflow='hidden';return {svg:row,width:box.width,height};});
 }
 function trim(rows){
  const host=document.createElement('div');host.style.cssText='position:absolute;left:-100000px;top:0;visibility:hidden';document.body.append(host);
  try{for(const row of rows){host.append(row.svg);const vb=row.svg.viewBox.baseVal,inverse=row.svg.getScreenCTM().inverse();let top=Infinity,bottom=-Infinity;
    for(const n of row.svg.querySelectorAll('path,line,rect,circle,ellipse,polygon,polyline')){if(n.closest('defs'))continue;const style=getComputedStyle(n);if(style.display==='none'||Number(style.opacity)===0||((style.fill==='none'||style.fill==='transparent')&&style.stroke==='none'))continue;
     const b=n.getBBox(),matrix=inverse.multiply(n.getScreenCTM()),points=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(matrix));
     const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x)),a=Math.min(...points.map(p=>p.y)),z=Math.max(...points.map(p=>p.y));if(right<vb.x||left>vb.x+vb.width||z<vb.y||a>vb.y+vb.height)continue;top=Math.min(top,Math.max(vb.y,a));bottom=Math.max(bottom,Math.min(vb.y+vb.height,z));
    }
    if(Number.isFinite(top)&&bottom>=top){const y=Math.max(vb.y,top-14),height=Math.min(vb.y+vb.height,bottom+14)-y;row.svg.setAttribute('viewBox',`${vb.x} ${y} ${vb.width} ${height}`);row.svg.setAttribute('height',height);row.height=height;}const origin=row.svg.viewBox.baseVal, x=origin.x, y=origin.y, width=origin.width, height=origin.height;
    const group=document.createElementNS(NS,'g');group.setAttribute('transform',`translate(${-x} ${-y})`);while(row.svg.firstChild)group.append(row.svg.firstChild);row.svg.append(group);row.svg.setAttribute('viewBox',`0 0 ${width} ${height}`);row.svg.remove();
  }}finally{host.remove();}return rows;
 }
 async function pdf(source,{title='Partitura',creators=[],rowHeight,starts,pageWidth=595.28,pageHeight=841.89,margin=36}={}){await load();const copy=clean(source);await outline(copy);const rows=trim(split(copy,{rowHeight,starts})),doc=new jspdf.jsPDF({unit:'pt',format:[pageWidth,pageHeight],orientation:pageWidth>pageHeight?'landscape':'portrait',compress:true});
  doc.setProperties({title,author:creators.map(c=>c.name).join('; '),creator:'Crescendo Academy'});
  doc.setFont('times','bold');doc.setFontSize(16);const titleLines=doc.splitTextToSize(String(title||'Partitura sin título'),pageWidth-2*margin);
  doc.setFont('times','normal');doc.setFontSize(10);const creditLines=globalThis.CrescendoScoreHeading.lines(creators).flatMap(line=>doc.splitTextToSize(line,pageWidth-2*margin)),header=42+(titleLines.length-1)*18+(creditLines.length?8+creditLines.length*12:0),layout=paginate(rows,{header,pageWidth,pageHeight,margin});
  for(let i=0;i<layout.pages.length;i++){if(i)doc.addPage();doc.setFont('times','bold');doc.setFontSize(16);titleLines.forEach((line,n)=>doc.text(line,layout.pageWidth/2,margin+7+n*18,{align:'center'}));
   doc.setFont('times','normal');doc.setFontSize(10);creditLines.forEach((line,n)=>doc.text(line,layout.pageWidth-margin,margin+7+(titleLines.length-1)*18+20+n*12,{align:'right'}));
   doc.setFontSize(9);doc.text(`${i+1} / ${layout.pages.length}`,layout.pageWidth-margin,layout.pageHeight-Math.min(24,margin),{align:'right'});
   for(const slot of layout.pages[i]){doc.saveGraphicsState();await doc.svg(rows[slot.index].svg,{x:slot.x,y:slot.y,width:slot.width,height:slot.height});doc.restoreGraphicsState();}
  }
  return new Blob([doc.output('arraybuffer')],{type:'application/pdf'});
 }

 return {paginate,pdf,clean,split,outline};
});
