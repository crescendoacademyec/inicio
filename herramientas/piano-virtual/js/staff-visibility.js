/* Always start with the live staff visible; preserve the loaded viewer when toggling. */
(function(){
'use strict';
const button=document.getElementById('toggleLiveStaff');
const panel=document.getElementById('liveStaffPanel');
const layout=panel?.closest('.staff-wrap');
if(!button||!panel||!layout)return;
function show(visible){
 panel.hidden=!visible;
 layout.classList.toggle('staff-hidden',!visible);
 button.setAttribute('aria-pressed',String(visible));
 button.title=visible?'Ocultar pentagrama':'Mostrar pentagrama';
}
show(true);
button.addEventListener('click',()=>show(button.getAttribute('aria-pressed')!=='true'));
})();
