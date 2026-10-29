/* Progressive disclosure: keep the musical choices in view, reveal setup on demand. */
(function(){
'use strict';
const panel=document.querySelector('.panel');if(!panel)return;
const $=id=>document.getElementById(id),field=id=>$(id)?.closest('.field');
function disclosure(label,className){const d=document.createElement('details'),s=document.createElement('summary');d.className=className;s.textContent=label;d.append(s);return d;}
panel.classList.add('panel-compact');
const primary=document.createElement('div');primary.className='explore-primary';
const typeField=document.createElement('div');typeField.className='field';typeField.innerHTML='<label for="materialKind">Contenido</label><select id="materialKind"><option value="scale">Escalas y modos</option><option value="arpeggio">Arpegios</option><option value="chordType">Acordes</option></select>';
const material=document.createElement('div');material.className='material-choice';
for(const id of ['scale','arpeggio','chordType'])material.append(field(id));
primary.append(field('instrument'),field('root'),typeField,material,field('pos'));
const advanced=disclosure('Ajustes del instrumento y visualización','explore-settings'),advancedGrid=document.createElement('div');advancedGrid.className='explore-settings-grid';
for(const id of ['tuning','capo','orientation','labelMode','pattern','voicingRange','keySignature','minus','volume']){const f=field(id);if(f)advancedGrid.append(f);}
const advancedActions=document.createElement('div');advancedActions.className='explore-settings-actions';
for(const id of ['clearAllBtn','clearSelectionBtn'])advancedActions.append($(id));
advancedActions.append(document.querySelector('.interaction-mode-picker'));advanced.append(advancedGrid,advancedActions);
const actions=document.querySelector('.field-frets');panel.append(primary,actions,advanced);
// The original Timbre select is controlled by the instrument sound menu.
const soundField=field('soundType');if(soundField)advancedGrid.append(soundField);
const kind=$('materialKind');let chosen='scale';
function sync(){
 const actual=$('arpeggio').value?'arpeggio':$('chordType').value?'chordType':$('scale').value?'scale':chosen;chosen=actual;kind.value=actual;
 for(const id of ['scale','arpeggio','chordType'])field(id).hidden=id!==actual;
 field('pos').hidden=actual==='chordType';
}
kind.onchange=()=>{chosen=kind.value;const select=$(chosen);if(!select.value){const fallback=chosen==='scale'?'mayor':chosen==='arpeggio'?'mayor':null;select.value=fallback||[...select.options].find(o=>o.value)?.value||'';}select.dispatchEvent(new Event('change',{bubbles:true}));sync();};
for(const id of ['scale','arpeggio','chordType','instrument','root'])$(id).addEventListener('change',sync);
new MutationObserver(sync).observe($('chordSymbol'),{childList:true,characterData:true,subtree:true});sync();
const viewer=document.querySelector('.bottom-row'),reference=disclosure('Partitura de referencia · PDF, imagen o MusicXML','reference-score');viewer.before(reference);reference.append(viewer);
const assistant=$('fingeringPanel');if(assistant)reference.append(assistant);const phrase=$('phrasePlanDetail');if(phrase)phrase.textContent='La digitación tiene en cuenta articulaciones y técnicas.';
const legend=document.querySelector('.legend');if(legend)reference.before(legend);
// Canvas and score renderers measure their containers when the panel is revealed.
reference.addEventListener('toggle',()=>{if(reference.open)window.dispatchEvent(new Event('resize'));});
$('pdfUpload')?.addEventListener('change',()=>{reference.open=true;});
const hero=document.querySelector('.hero');if(hero){hero.querySelector('.eyebrow')?.remove();hero.querySelector('p').textContent='Explora el diapasón o sigue el recorrido de los cuatro niveles.';}
})();
