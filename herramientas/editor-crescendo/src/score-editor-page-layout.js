(function(root){'use strict';
 const papers={a4:[595.28,841.89],letter:[612,792],a3:[841.89,1190.55]};
 const defaults=Object.freeze({paper:'a4',orientation:'portrait',margin:12.7,bars:4,staffGap:138,systemGap:95,pageBreaks:[]});
 function normalize(value={}){value=value&&typeof value==='object'?value:{};const n=(key,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(value[key]))?Number(value[key]):defaults[key]));return {paper:papers[value.paper]?value.paper:'a4',orientation:value.orientation==='landscape'?'landscape':'portrait',margin:n('margin',6,40),bars:Math.round(n('bars',1,12)),staffGap:n('staffGap',110,260),systemGap:n('systemGap',60,240),pageBreaks:[...new Set((Array.isArray(value.pageBreaks)?value.pageBreaks:[]).filter(i=>Number.isInteger(i)&&i>0))].sort((a,b)=>a-b)};}
 function printOptions(value){const settings=normalize(value),[a,b]=papers[settings.paper];return {pageWidth:settings.orientation==='landscape'?b:a,pageHeight:settings.orientation==='landscape'?a:b,margin:settings.margin*72/25.4};}
 function mount({get,apply,selectedMeasure}){
  const host=document.getElementById('ipad-panel-document');if(!host)return;
  const button=document.createElement('button');button.type='button';button.className='ipad-primary-action';button.textContent='Configurar página…';host.append(button);
  button.onclick=()=>{
   const settings=normalize(get()),dialog=document.createElement('dialog');dialog.className='arrangement-dialog';dialog.setAttribute('aria-label','Configurar página');
   const header=document.createElement('header'),title=document.createElement('h2');title.textContent='Página y distribución';header.append(title);
   const form=document.createElement('form');form.className='arrangement-body';const fields={};
   function field(key,label,choices,min,max){const row=document.createElement('label');row.className='arrangement-field';const text=document.createElement('span');text.textContent=label;
    const input=document.createElement(choices?'select':'input');if(choices)for(const [value,name]of choices){const option=document.createElement('option');option.value=value;option.textContent=name;input.append(option);}else{input.type='number';input.min=min;input.max=max;input.step=key==='margin'?'.1':'1';}input.value=settings[key];input.setAttribute('aria-label',label);row.append(text,input);form.append(row);fields[key]=input;
   }
   field('paper','Papel',[['a4','A4'],['letter','Carta'],['a3','A3']]);field('orientation','Orientación',[['portrait','Vertical'],['landscape','Horizontal']]);
   field('margin','Márgenes iguales de impresión (mm)',null,6,40);field('bars','Máximo de compases por sistema automático',null,1,12);field('staffGap','Distancia entre pentagramas (px)',null,110,260);field('systemGap','Separación entre sistemas (px)',null,60,240);
   const info=document.createElement('p');info.textContent='Los saltos manuales de sistema se conservan. La densidad se ajusta al espacio mínimo que necesitan las notas.';form.append(info);
   let pageBreaks=settings.pageBreaks.slice();const breaks=document.createElement('p');form.append(breaks);const update=()=>{breaks.textContent=pageBreaks.length?'Salto de página antes de los compases: '+pageBreaks.map(i=>i+1).join(', '):'Sin saltos manuales de página.';};update();
   const chosen=selectedMeasure();if(Number.isInteger(chosen)&&chosen>0){const add=document.createElement('button');add.type='button';add.textContent=`Alternar salto de página antes del compás ${chosen+1}`;add.onclick=()=>{pageBreaks=pageBreaks.includes(chosen)?pageBreaks.filter(i=>i!==chosen):[...pageBreaks,chosen].sort((a,b)=>a-b);update();};form.append(add);}
   const clear=document.createElement('button');clear.type='button';clear.textContent='Quitar saltos de página';clear.onclick=()=>{pageBreaks=[];update();};form.append(clear);
   const actions=document.createElement('div');actions.className='arrangement-actions';const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancelar';cancel.onclick=()=>dialog.close();const save=document.createElement('button');save.type='submit';save.textContent='Aplicar';actions.append(cancel,save);form.append(actions);
   form.onsubmit=event=>{event.preventDefault();apply(normalize({...Object.fromEntries(Object.entries(fields).map(([key,input])=>[key,input.value])),pageBreaks}));dialog.close();};
   dialog.append(header,form);document.body.append(dialog);dialog.addEventListener('keydown',event=>event.stopPropagation());dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
  };
 }
 const api={defaults,normalize,printOptions,mount};if(typeof module!=='undefined')module.exports=api;else root.JMLScorePageLayout=api;
})(typeof window==='undefined'?globalThis:window);
