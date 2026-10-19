/* Shared instrument preference, SoundFont cache and course instrument menu. */
(function(global){
  'use strict';
  const choices={piano:'acoustic_grand_piano',guitar:'acoustic_guitar_nylon',bass:'electric_bass_finger'};
  const labels={piano:'Piano',guitar:'Guitarra',bass:'Bajo'};
  const key='crescendo-course-timbre-v1',listeners=new Set(),cache=new WeakMap();
  const icon='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
  let selected='piano',audioContext=null,audioToken=0,nodes=[];
  try{const saved=global.localStorage.getItem(key);if(choices[saved])selected=saved;}catch(_){}
  function stop(){audioToken++;nodes.forEach(node=>{try{node.stop();}catch(_){}});nodes=[];}
  function set(value){
    if(!choices[value]||value===selected)return;
    stop();selected=value;
    try{global.localStorage.setItem(key,value);}catch(_){}
    if(global.document?.documentElement)global.document.documentElement.dataset.courseInstrument=value;
    global.document?.querySelectorAll('[data-course-sound]').forEach(el=>{el.value=value;});
    global.document?.querySelectorAll('[data-course-sound-menu]').forEach(updateMenu);
    listeners.forEach(fn=>fn(value));
  }
  function entry(ctx,options){
    const instrument=choices[options.instrument] ? options.instrument : selected;
    let destinations=cache.get(ctx);if(!destinations){destinations=new Map();cache.set(ctx,destinations);}
    const destination=options.destination||ctx.destination;
    let instruments=destinations.get(destination);if(!instruments){instruments=new Map();destinations.set(destination,instruments);}
    if(!instruments.has(instrument))instruments.set(instrument,{});
    return {state:instruments.get(instrument),instrument,destination};
  }
  async function getPlayer(ctx,options={}){
    if(!ctx)return null;
    const {state,instrument,destination}=entry(ctx,options);
    if(!state.promise){
      state.promise=Promise.resolve().then(()=>global.Soundfont.instrument(ctx,choices[instrument],{destination,soundfont:'MusyngKite'}))
        .then(player=>{state.player=player;return player;})
        .catch(error=>{state.promise=null;throw error;});
    }
    try{return await state.promise;}catch(error){
      const status=global.document?.querySelector('[data-course-sound-status]');
      if(status)status.textContent='No se pudo cargar el instrumento. Comprueba la conexión y vuelve a intentarlo.';
      throw error;
    }
  }
  function peek(ctx,options={}){return ctx?entry(ctx,options).state.player:null;}
  async function play(notes,{duration=.8,melodic=false}={}){
    stop();const token=audioToken;
    if(!audioContext){const AC=global.AudioContext||global.webkitAudioContext;if(!AC)return;audioContext=new AC();}
    if(audioContext.state==='suspended')await audioContext.resume();
    const player=await getPlayer(audioContext);if(token!==audioToken||!player)return;
    const start=audioContext.currentTime+.025;
    notes.forEach((note,i)=>{const midi=typeof note==='number'?note:note.midi;if(!Number.isFinite(midi))return;const node=player.play(midi,start+(melodic?i*.35:0),{duration,gain:.65});if(node)nodes.push(node);});
  }
  function updateMenu(menu){
    const trigger=menu.querySelector('.course-sound-trigger');
    trigger.innerHTML=icon+'<span>'+labels[selected]+'</span><span aria-hidden="true">▾</span>';
    trigger.setAttribute('aria-label','Instrumento: '+labels[selected]);
    menu.querySelectorAll('[data-course-sound-choice]').forEach(option=>{const active=option.dataset.courseSoundChoice===selected;option.setAttribute('aria-selected',String(active));option.classList.toggle('selected',active);});
  }
  function mountMenu(old){
    const menu=global.document.createElement('div');menu.className='course-sound-menu';menu.dataset.courseSoundMenu='';
    menu.innerHTML='<button type="button" class="course-sound-trigger" aria-haspopup="listbox" aria-expanded="false"></button><div class="course-sound-options" role="listbox" aria-label="Instrumento de los ejemplos" hidden>'+Object.keys(choices).map(id=>'<button type="button" role="option" class="course-sound-choice" data-course-sound-choice="'+id+'">'+labels[id]+'</button>').join('')+'</div><span data-course-sound-status role="status"></span>';
    old.replaceWith(menu);
    const trigger=menu.querySelector('.course-sound-trigger'),list=menu.querySelector('.course-sound-options');
    const close=(focus=false)=>{list.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();};
    const open=()=>{global.document.querySelectorAll('[data-course-sound-menu]').forEach(other=>{if(other!==menu){other.querySelector('.course-sound-options').hidden=true;other.querySelector('.course-sound-trigger').setAttribute('aria-expanded','false');}});list.hidden=false;const alignLeft=menu.getBoundingClientRect().right<list.offsetWidth+8;list.style.left=alignLeft?'0':'auto';list.style.right=alignLeft?'auto':'0';trigger.setAttribute('aria-expanded','true');list.querySelector('[aria-selected="true"]').focus();};
    trigger.addEventListener('click',()=>list.hidden?open():close());
    menu.addEventListener('click',event=>{const option=event.target.closest('[data-course-sound-choice]');if(option){set(option.dataset.courseSoundChoice);close(true);}});
    menu.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();close(true);}
      if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
        event.preventDefault();if(list.hidden){open();return;}
        const options=[...list.querySelectorAll('[role="option"]')],index=options.indexOf(global.document.activeElement);
        const next=event.key==='Home'?0:event.key==='End'?options.length-1:(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;options[next].focus();
      }
    });
    global.document.addEventListener('click',event=>{if(!menu.contains(event.target))close();});
    menu.addEventListener('focusout',event=>{if(!menu.contains(event.relatedTarget))close();});
    updateMenu(menu);
  }
  global.CourseSound={getPlayer,peek,set,get:()=>selected,play,stop,labels,choices,onChange:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
  function mount(){
    global.document.documentElement.dataset.courseInstrument=selected;
    global.document.querySelectorAll('[data-course-sound]').forEach(el=>{if(!el.querySelector('option[value="bass"]')){const option=global.document.createElement('option');option.value='bass';option.textContent=labels.bass;el.appendChild(option);}el.value=selected;el.addEventListener('change',()=>set(el.value));});
    global.document.querySelectorAll('[data-course-sound-toggle]').forEach(mountMenu);
    global.addEventListener?.('pagehide',stop);
  }
  if(global.document){if(global.document.readyState==='loading')global.document.addEventListener('DOMContentLoaded',mount);else mount();}
})(window);
