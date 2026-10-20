(function (root) {
  'use strict';
  function frequencyAtPosition(x, left, width, view={low:20,high:20000}) {
    if (!Number.isFinite(width) || width <= 0) return null;
    const position = Math.max(0, Math.min(1, (x - left) / width));
    return view.low * Math.pow(view.high/view.low, position);
  }
  root.FrequencyCursor = { frequencyAtPosition };
  if (typeof document === 'undefined') return;
  const tooltip = document.createElement('div');
  tooltip.className = 'frequency-cursor-label';
  tooltip.hidden = true;
  document.body.appendChild(tooltip);
  const guides = [];
  function hide() {
    tooltip.hidden = true;
    guides.forEach(line => { line.hidden = true; });
  }
  document.querySelectorAll('.chart-inner').forEach(chart => {
    const ruler = chart.querySelector('.freq-ruler');
    const view=()=>chart.id==='chartInner'?(window.CrescendoFrequencyViewport||{low:20,high:20000}):{low:20,high:20000};
    const noteLabel=f=>window.FrequencyWorkbench?' · '+window.FrequencyWorkbench.note(f).name:'';
    if (!ruler) return;
    const guide = document.createElement('div');
    guide.className = 'frequency-cursor-line';
    guide.hidden = true;
    guide.setAttribute('aria-hidden', 'true');
    chart.appendChild(guide);
    guides.push(guide);
    const control=document.createElement('label');control.className='frequency-touch-control';
    control.append('Explorar frecuencia (táctil o flechas) ');
    const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='1000';slider.step='1';slider.value='0';slider.setAttribute('aria-label','Explorar frecuencia');
    const output=document.createElement('output');output.textContent='20 Hz';
    control.append(slider,output);chart.after(control);
    const updateTouch=()=>{
      const hz=frequencyAtPosition(Number(slider.value),0,1000,view()),bounds=ruler.getBoundingClientRect();
      const text=hz<1000?`${Math.round(hz)} Hz`:`${(hz/1000).toLocaleString('es',{maximumFractionDigits:2})} kHz`;
      output.textContent=text+noteLabel(hz);slider.setAttribute('aria-valuetext',text+noteLabel(hz));
      guide.hidden=false;guide.style.left=`${bounds.left-chart.getBoundingClientRect().left+bounds.width*Number(slider.value)/1000}px`;
    };slider.addEventListener('input',updateTouch);window.addEventListener('crescendo:chart-zoom',()=>{if(chart.id==='chartInner')updateTouch();});

    chart.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const bounds = ruler.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || !bounds.width) {
        hide(); return;
      }
      const frequency = frequencyAtPosition(event.clientX, bounds.left, bounds.width,view());
      tooltip.textContent = frequency < 1000 ? `≈ ${Math.round(frequency)} Hz` : `≈ ${(frequency / 1000).toLocaleString('es', {maximumFractionDigits: 2})} kHz`;
      tooltip.textContent+=noteLabel(frequency);
      tooltip.hidden = false;
      guide.hidden = false;
      guide.style.left = `${event.clientX - chart.getBoundingClientRect().left}px`;
      const label = tooltip.getBoundingClientRect();
      tooltip.style.left = `${Math.max(8, Math.min(event.clientX + 14, innerWidth - label.width - 8))}px`;
      tooltip.style.top = `${Math.max(8, Math.min(event.clientY - label.height - 12, innerHeight - label.height - 8))}px`;
    });
    chart.addEventListener('pointerleave', hide);
    chart.addEventListener('pointerdown', hide);
  });
  window.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
  window.addEventListener('crescendo:view-change', hide);
  window.addEventListener('crescendo:catalog-filter', hide);window.addEventListener('crescendo:chart-zoom',hide);
})(typeof module === 'object' ? module.exports : window);
