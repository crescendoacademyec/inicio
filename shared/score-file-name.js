(function(root){'use strict';
 function filename(value,extension){const name=String(value||'').trim().replace(/[\\/:*?"<>|\u0000-\u001f]/g,'-').replace(/\.(png|pdf|xml|musicxml|json)$/i,'').replace(/[. ]+$/,'');return (name||'Ejercicio')+'.'+extension;}
 function ask({suggested='Ejercicio',extension='pdf'}={}){return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='score-file-name';dialog.setAttribute('aria-label','Guardar archivo');
  dialog.innerHTML='<form><h3>Guardar archivo</h3><label>Nombre del archivo<input name="filename" required autocomplete="off"></label><p></p><div><button type="button">Cancelar</button><button type="submit">Guardar</button></div></form>';
  const input=dialog.querySelector('input');input.value=String(suggested).replace(/\.(png|pdf|xml|musicxml|json)$/i,'');dialog.querySelector('p').textContent='Formato: '+extension.toUpperCase();
  let result=null;dialog.querySelector('form').onsubmit=event=>{event.preventDefault();result=filename(input.value,extension);dialog.close();};dialog.querySelector('button[type=button]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{dialog.remove();resolve(result);},{once:true});document.body.appendChild(dialog);dialog.showModal();input.focus();input.select();
 });}
 const api={filename,ask};if(typeof module!=='undefined')module.exports=api;else root.CrescendoScoreFile=api;
})(typeof window==='undefined'?globalThis:window);
