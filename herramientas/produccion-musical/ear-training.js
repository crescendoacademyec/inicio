(function(root){
'use strict';
const topics={eq:['Ecualización',['Graves','Medios','Agudos']],dinamica:['Dinámica',['Ataque rápido','Ataque lento','Sin compresión']],balance:['Balance',['Bajo más presente','Armonía más presente','Ritmo más presente']],fase:['Fase y suma',['Suma en fase','Cancelación parcial','Cancelación total']],distorsion:['Distorsión',['Sin saturación','Saturación suave','Recorte fuerte']]};
function match(a,b){const rms=x=>Math.sqrt(x.reduce((s,v)=>s+v*v,0)/x.length);const ra=rms(a),rb=rms(b);const aa=Float32Array.from(a),bb=Float32Array.from(b,v=>v*(rb>1e-9?ra/rb:1));let peak=0;for(let i=0;i<a.length;i++)peak=Math.max(peak,Math.abs(aa[i]),Math.abs(bb[i]));const gain=peak?Math.min(1,.7/peak):1;return [aa.map(v=>v*gain),bb.map(v=>v*gain)];}
function distort(x,kind){return Float32Array.from(x,v=>kind===0?v:kind===1?Math.tanh(v*8)/8:Math.max(-.055,Math.min(.055,v)));}
const api={topics,match,distort};if(typeof module==='object'&&module.exports){module.exports=api;return;}
let trainer;
root.ProductionEar={show(){if(!trainer){const view=document.getElementById('view-escucha');view.innerHTML='<p class="eyebrow">ESCUCHA · DECIDE · PRACTICA</p><h1>Entrena tu <em>criterio auditivo.</em></h1><div id="productionListening"></div><p>Los multitracks y la revisión docente se comparten directamente con el estudiante.</p>';trainer=root.CrescendoListening.mount(document.getElementById('productionListening'),{lessonBase:'./'});}},stop(){trainer?.stop();}};
})(typeof window!=='undefined'?window:globalThis);
