(function(){
'use strict';
function resize(){if(window.parent===window)return;window.parent.postMessage({type:'crescendo-instrument-eq-size',height:Math.ceil(document.body.getBoundingClientRect().height)+24},location.origin==='null'?'*':location.origin);}
new ResizeObserver(resize).observe(document.body);window.addEventListener('load',resize);
})();
