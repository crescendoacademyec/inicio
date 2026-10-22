(function(root){'use strict';
 // A single editor for per-note string assignments in both score applications.
 function edit({instrument,position,onApply}){
  const dialog=document.createElement('dialog');dialog.className='string-tab-editor';
  dialog.setAttribute('aria-label','Editar digitación');
  dialog.innerHTML=`<form><h3>Editar digitación · ${instrument.name}</h3><label>Cuerda <select name="string">${instrument.labels.map((name,i)=>`<option value="${i+1}">${i+1} · ${name}</option>`).join('')}</select></label><label>${instrument.fretted?'Traste':'Banda (semitonos)'} <input name="fret" type="number" min="0" max="24" step="1" required></label>${instrument.fretted?'':`<label>Posición <select name="position"><option>I</option><option>III</option><option>V</option></select></label>`}<p class="string-tab-error" role="status"></p><div><button type="button" data-cancel>Cancelar</button><button type="submit">Aplicar</button></div></form>`;
  const form=dialog.querySelector('form');form.elements.string.value=position.string;form.elements.fret.value=position.fret;
  if(form.elements.position)form.elements.position.value=['I','III','V'].includes(position.position)?position.position:'I';
  form.onsubmit=event=>{event.preventDefault();const string=Number(form.elements.string.value),fret=Number(form.elements.fret.value);if(instrument.midi(string,fret)===null)return;
   const result=onApply(string,fret,form.elements.position?.value||'I');
   if(typeof result==='string'&&result){dialog.querySelector('.string-tab-error').textContent=result;return;}
   if(result!==false)dialog.close();
  };
  dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.appendChild(dialog);dialog.showModal();form.elements.fret.focus();form.elements.fret.select();
 }
 const api={edit};if(typeof module!=='undefined')module.exports=api;else root.CrescendoStringTab=api;
})(typeof window==='undefined'?globalThis:window);
