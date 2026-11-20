/* Indexed catalog search: render a bounded list even for thousands of songs. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AACMelodyLibrarySearch=api;
})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const normalize=value=>String(value||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 function createIndex(catalog){return catalog.map(row=>({row,title:normalize(row.title),text:normalize(`${row.title} ${row.composer||''}`)}));}
 function find(index,query,limit=40){
  const term=normalize(query),tokens=term.split(' ').filter(Boolean);
  const matches=index.filter(item=>tokens.every(token=>item.text.includes(token)));
  if(term)matches.sort((a,b)=>rank(a)-rank(b));
  function rank(item){return item.title===term?0:item.title.startsWith(term)?1:tokens.every(token=>item.title.includes(token))?2:3;}
  return {total:matches.length,results:matches.slice(0,Math.max(0,limit)).map(item=>item.row)};
 }
 function mount({input,list,status,select}){
  const popup=list.parentElement,picker=input.parentElement;let index=[],shown=[],active=-1,selectedTitle='';
  function close(){popup.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;}
  function highlight(next){
   active=next;[...list.children].forEach((option,i)=>option.setAttribute('aria-selected',String(i===active)));
   if(active>=0){input.setAttribute('aria-activedescendant',list.children[active].id);list.children[active].scrollIntoView({block:'nearest'});}else input.removeAttribute('aria-activedescendant');
  }
  function choose(row){selectedTitle=row.title;input.value=row.title;close();select.value=row.id;select.dispatchEvent(new Event('change'));}
  function open(){
   const result=find(index,input.value===selectedTitle?'':input.value);shown=result.results;list.replaceChildren();active=-1;input.removeAttribute('aria-activedescendant');
   status.textContent=result.total===0?'No se encontraron melodías.':result.total>shown.length?`${shown.length} de ${result.total} temas. Escribe para acotar la búsqueda.`:`${result.total} ${result.total===1?'tema encontrado':'temas encontrados'}.`;
   for(const row of shown){const option=document.createElement('div');option.id=`melody-result-${list.children.length}`;option.setAttribute('role','option');option.setAttribute('aria-selected','false');const title=document.createElement('strong'),composer=document.createElement('small');title.textContent=row.title;composer.textContent=row.composer||'Compositor no indicado';option.append(title,composer);option.addEventListener('pointerdown',event=>event.preventDefault());option.addEventListener('click',()=>choose(row));list.append(option);}
   popup.hidden=false;input.setAttribute('aria-expanded','true');
  }
  input.addEventListener('focus',()=>{input.select();open();});input.addEventListener('click',()=>{if(popup.hidden)open();});input.addEventListener('input',open);
  input.addEventListener('keydown',event=>{
   if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();if(popup.hidden)open();if(shown.length)highlight((active+(event.key==='ArrowDown'?1:active<0?0:-1)+shown.length)%shown.length);}
   else if(event.key==='Enter'&&!popup.hidden){event.preventDefault();if(shown[active>=0?active:0])choose(shown[active>=0?active:0]);}
   else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();input.value=selectedTitle;close();}
  });
  input.addEventListener('blur',()=>{input.value=selectedTitle;close();});
  document.addEventListener('pointerdown',event=>{if(!picker.contains(event.target)){input.value=selectedTitle;close();}});
  return {setCatalog(catalog){index=createIndex(catalog);if(!popup.hidden)open();},sync(title){const value=title||'';if(value===selectedTitle&&document.activeElement===input&&!popup.hidden)return;selectedTitle=value;input.value=selectedTitle;close();}};
 }
 return {normalize,createIndex,find,mount};
});
