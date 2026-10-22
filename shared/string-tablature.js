(function(root){'use strict';
 let active=null;const chosen=new Map(),ns='http://www.w3.org/2000/svg';
 function cancel(){if(!active)return;const old=active;active=null;old.node.remove();}
 // The input lives on the clicked string, inside the TAB itself.
 function edit({svg,x,y,instrument,position,string=position.string,onApply,key=''}){
  const draft=active?.key===key?active.input.value:String(position.fret);cancel();
  const node=document.createElementNS(ns,'foreignObject');node.setAttribute('x',x-18);node.setAttribute('y',y+(string-1)*17-11);node.setAttribute('width',38);node.setAttribute('height',24);node.classList.add('string-tab-inline');
  const input=document.createElement('input');input.type='text';input.inputMode='numeric';input.value=draft;input.setAttribute('aria-label',`Cuerda ${string}: ${instrument.fretted?'traste':'banda'}`);input.autocomplete='off';node.appendChild(input);svg.appendChild(node);
  const session={node,input,key};active=session;
  const commit=()=>{if(active!==session)return;const value=input.value.trim(),fret=Number(value);
   if(!/^\d{1,2}$/.test(value)||instrument.midi(string,fret)===null){input.setAttribute('aria-invalid','true');input.title='Escribe un número de 0 a 24.';return;}
   active=null;const result=onApply(string,fret,position.position||'I');
   if(result===false||typeof result==='string'&&result){active=session;input.setAttribute('aria-invalid','true');input.title=result||'No se puede aplicar esa digitación.';input.focus();return;}
   node.remove();
  };
  input.addEventListener('pointerdown',e=>e.stopPropagation());input.addEventListener('click',e=>e.stopPropagation());
  input.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();commit();}else if(e.key==='Escape'){e.preventDefault();cancel();}});
  input.addEventListener('blur',commit);input.addEventListener('input',()=>input.removeAttribute('aria-invalid'));
  input.focus({preventScroll:true});input.select();return session;
 }
 function column({svg,container=svg,x,y,instrument,positions,key,onApply}){
  const hit=document.createElementNS(ns,'rect');Object.entries({x:x-12,y:y-8,width:24,height:(instrument.tuning.length-1)*17+16,fill:'transparent',class:'string-tab-column'}).forEach(([k,v])=>hit.setAttribute(k,v));container.appendChild(hit);
  const open=(event,p,string=p.string)=>{
   event.preventDefault();event.stopPropagation();chosen.set(key,p);
   if(string!==p.string){
    const fret=p.midi-instrument.tuning[string-1];
    if(instrument.midi(string,fret)===p.midi){cancel();const result=onApply(p,string,fret,p.position||'I');if(result!==false&&!(typeof result==='string'&&result))return;}
    const session=edit({svg,x,y,instrument,position:p,string,key,onApply:(s,f,pos)=>onApply(p,s,f,pos)});session.input.value='';session.input.setAttribute('aria-invalid','true');session.input.title='La nota no tiene una posición disponible en esta cuerda.';return;
   }
   edit({svg,x,y,instrument,position:p,string,key,onApply:(s,f,pos)=>onApply(p,s,f,pos)});
  };
  hit.addEventListener('pointerdown',event=>{const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());const string=Math.max(1,Math.min(instrument.tuning.length,Math.round((point.y-y)/17)+1));const p=positions.find(p=>p.string===string)||positions.find(p=>p.midi===chosen.get(key)?.midi)||positions[0];if(p)open(event,p,string);});
  return (event,p)=>open(event,p);
 }
 const api={edit,column,cancel};if(typeof module!=='undefined')module.exports=api;else root.CrescendoStringTab=api;
})(typeof window==='undefined'?globalThis:window);
