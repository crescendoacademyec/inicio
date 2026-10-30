/* Keep instrument controls in their original grid and the reference score visible. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const viewer=document.querySelector('.bottom-row');if(!viewer)return;
const reference=document.createElement('section');reference.className='reference-score';
reference.setAttribute('aria-labelledby','referenceScoreTitle');
const heading=document.createElement('h2');heading.id='referenceScoreTitle';heading.textContent='Partitura de referencia';
viewer.before(reference);reference.append(heading,viewer);
const assistant=$('fingeringPanel');if(assistant)reference.append(assistant);
const phrase=$('phrasePlanDetail');if(phrase)phrase.textContent='La digitación tiene en cuenta articulaciones y técnicas.';
const legend=document.querySelector('.legend');if(legend)reference.before(legend);
const hero=document.querySelector('.hero');if(hero){hero.querySelector('.eyebrow')?.remove();hero.querySelector('p').textContent='Explora el diapasón o sigue el recorrido de los cuatro niveles.';}
})();
