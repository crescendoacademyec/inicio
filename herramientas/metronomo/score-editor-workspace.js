(function(root){'use strict';
 function create({stop,tempo,openRhythm}){
  const panel=document.getElementById('scoreEditorWorkspace'),frame=document.getElementById('scoreEditorFrame'),trigger=document.getElementById('exerciseToggleBtn'),back=document.getElementById('scoreEditorBack'),generator=document.getElementById('scoreEditorRhythmGenerator');
  let background=[];
  panel.addEventListener('keydown',event=>event.stopPropagation());
  function close(){background.forEach(([node,inert])=>node.inert=inert);background=[];frame.contentWindow?.postMessage({type:'crescendo-metronome-editor-stop'},root.location.origin);panel.hidden=true;document.body.classList.remove('has-score-editor');trigger.setAttribute('aria-expanded','false');trigger.classList.remove('open');trigger.focus();}
  function open(){stop();background=[...document.querySelectorAll('body > header,body > main,body > footer')].map(node=>[node,node.inert]);background.forEach(([node])=>node.inert=true);document.getElementById('rhythmLab').hidden=true;if(!frame.getAttribute('src')){const url=new URL('../editor-crescendo/',document.baseURI);url.searchParams.set('workspace','metronome');url.searchParams.set('v','20261121-3');url.searchParams.set('bpm',String(tempo()));frame.src=url.href;}panel.hidden=false;document.body.classList.add('has-score-editor');trigger.setAttribute('aria-expanded','true');trigger.classList.add('open');back.focus();}
  function showRhythm(){stop();openRhythm();trigger.setAttribute('aria-expanded','true');trigger.classList.add('open');}
  trigger.addEventListener('click',()=>{const lab=document.getElementById('rhythmLab');if(!lab.hidden){stop();lab.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.classList.remove('open');}else showRhythm();});back.addEventListener('click',close);generator.addEventListener('click',()=>{close();showRhythm();});
  root.addEventListener('pagehide',()=>frame.contentWindow?.postMessage({type:'crescendo-metronome-editor-stop'},root.location.origin));
  return {open,close};
 }
 root.CrescendoMetronomeScoreEditor={create};
})(typeof window==='undefined'?globalThis:window);
