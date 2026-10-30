/* The visible sound menu owns its options and selection, without a hidden select. */
(function(root){
'use strict';
root.BassSoundMenu={create({controls,source,onChange}){
  let options=[],selected='';
  const menu=document.createElement('div');menu.className='string-sound-menu';menu.id='stringSoundMenu';
  menu.innerHTML='<button type="button" class="string-sound-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="bassSoundOptions" title="Cambiar sonido"><span class="string-sound-value">Cargando…</span><span class="string-sound-chevron" aria-hidden="true">▾</span></button><div id="bassSoundOptions" class="string-sound-options" role="listbox" aria-label="Sonido del bajo" hidden></div>';
  controls.insertBefore(menu,source||null);
  const trigger=menu.querySelector('.string-sound-trigger'),label=menu.querySelector('.string-sound-value'),list=menu.querySelector('.string-sound-options');
  const close=()=>{list.hidden=true;trigger.setAttribute('aria-expanded','false');menu.classList.remove('open');};
  function render(){
    label.textContent=options.find(o=>o.value===selected)?.label||'Cargando…';
    list.replaceChildren(...options.map(option=>{
      const item=document.createElement('button');item.type='button';item.className='string-sound-option'+(option.value===selected?' selected':'');
      item.role='option';item.dataset.value=option.value;item.setAttribute('aria-selected',String(option.value===selected));item.textContent=option.label;
      item.addEventListener('click',()=>{
        const changed=selected!==option.value;selected=option.value;render();close();trigger.focus();if(changed)onChange(selected);
      });return item;
    }));
  }
  trigger.addEventListener('click',()=>{const opening=list.hidden;list.hidden=!opening;trigger.setAttribute('aria-expanded',String(opening));menu.classList.toggle('open',opening);});
  document.addEventListener('click',event=>{if(!menu.contains(event.target))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const wasOpen=!list.hidden;close();if(wasOpen)trigger.focus();}});
  const syncState=()=>{menu.dataset.state=source?.classList.contains('loading')?'loading':source?.classList.contains('osc')?'error':'ready';};
  if(source){source.hidden=true;source.setAttribute('aria-hidden','true');new MutationObserver(syncState).observe(source,{attributes:true,attributeFilter:['class']});}
  syncState();
  return {get value(){return selected;},setOptions(next,preferred){
    options=next.map(o=>({value:o.value,label:o.label}));selected=options.some(o=>o.value===preferred)?preferred:options[0]?.value||'';render();close();return selected;
  }};
}};
})(window);
