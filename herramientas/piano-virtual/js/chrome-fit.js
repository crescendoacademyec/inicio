/* Fit the same desktop geometry to CSS viewport width, including OS/browser scaling. */
(function(global){
'use strict';
const BASE_WIDTH=1280;
function dimensions(available,required){
 const width=Math.ceil(Math.max(BASE_WIDTH,required||0,available||0));
 return {width,scale:available>0?Math.min(1,available/width):1};
}
if(typeof module==='object'&&module.exports)module.exports={dimensions};
if(!global.document)return;
const doc=global.document,bars=[...doc.querySelectorAll('.topbar,.controlbar')];
const frames=bars.map(bar=>{
 const frame=doc.createElement('div');frame.className='chrome-fit-frame';
 bar.before(frame);frame.appendChild(bar);bar.classList.add('chrome-fit-content');return frame;
});
let pending=false;
function contentWidth(bar){
 const style=global.getComputedStyle(bar),children=[...bar.children].filter(child=>global.getComputedStyle(child).display!=='none');

 return children.reduce((width,child)=>{const cs=global.getComputedStyle(child);return width+child.offsetWidth+(child.matches(".right-indicators")?0:(parseFloat(cs.marginLeft)||0))+(parseFloat(cs.marginRight)||0);},0)+Math.max(0,children.length-1)*(parseFloat(style.columnGap)||0)+(parseFloat(style.paddingLeft)||0)+(parseFloat(style.paddingRight)||0)+2;
}
function fit(){
 pending=false;if(!frames.length)return;
 const available=Math.min(...frames.map(frame=>frame.clientWidth));
 if(!available)return;
 const required=Math.max(...bars.map(contentWidth)),result=dimensions(available,required);
 bars.forEach(bar=>{
  const width=result.width+'px',zoom=String(result.scale);
  if(bar.style.width!==width)bar.style.width=width;
  if(bar.style.zoom!==zoom)bar.style.zoom=zoom;
 });
}
function schedule(){if(!pending){pending=true;global.requestAnimationFrame(fit);}}
const resize=new global.ResizeObserver(schedule);
frames.forEach(frame=>resize.observe(frame));bars.forEach(bar=>{resize.observe(bar);[...bar.children].forEach(child=>resize.observe(child));});
// Mode changes, MIDI labels and loaded sounds can change the row's natural width.
const mutation=new global.MutationObserver(records=>{if(records.some(record=>record.type!=='attributes'||!bars.includes(record.target)))schedule();});
bars.forEach(bar=>mutation.observe(bar,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','hidden','style']}));
global.addEventListener('resize',schedule,{passive:true});global.visualViewport?.addEventListener('resize',schedule,{passive:true});
doc.fonts?.ready.then(schedule);fit();
})(typeof window==='undefined'?globalThis:window);
