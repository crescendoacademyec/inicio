(function(root){'use strict';
  function create(canvas, activate){
    const details=document.createElement('details');details.className='fretboard-access';
    const summary=document.createElement('summary');summary.textContent='Tocar con teclado o lector de pantalla';details.append(summary);
    const help=document.createElement('p');help.textContent='Usa las flechas para recorrer cuerdas y trastes; Enter o Espacio para tocar. Tab permite salir del tablero. Los roles se refieren al material seleccionado.';details.append(help);
    const grid=document.createElement('div');grid.className='fretboard-access-grid';grid.setAttribute('role','group');grid.setAttribute('aria-label','Posiciones del diapasón');details.append(grid);canvas.after(details);
    let signature='',buttons=[],columns=1;
    function update(cells, width){
      const next=JSON.stringify(cells.map(c=>[c.s,c.displayFret,c.label,c.role]));
      if(next===signature){cells.forEach((cell,i)=>{if(cell.selected!=null)buttons[i]?.setAttribute('aria-pressed',String(cell.selected));});return;}signature=next;columns=width;
      const focused=buttons.findIndex(b=>b===document.activeElement);
      grid.replaceChildren();buttons=[];grid.style.setProperty('--fret-columns',String(width));
      for(const cell of cells){
        const button=document.createElement('button');button.type='button';
        button.textContent=cell.label;button.setAttribute('aria-label',`Cuerda ${cell.s+1}, traste ${cell.displayFret}: ${cell.label}${cell.role?', '+cell.role:''}`);
        if(cell.selected!=null)button.setAttribute('aria-pressed',String(cell.selected));
        button.tabIndex=buttons.length===Math.max(0,focused)?0:-1;
        button.addEventListener('click',()=>activate(cell));
        button.addEventListener('focus',()=>buttons.forEach(b=>b.tabIndex=b===button?0:-1));
        buttons.push(button);grid.append(button);
      }
      if(focused>=0&&details.open)buttons[Math.min(focused,buttons.length-1)]?.focus();
    }
    grid.addEventListener('keydown',event=>{
      if(event.key===' '||event.key==='Enter'){event.stopPropagation();return;}
      const index=buttons.indexOf(document.activeElement),delta={ArrowRight:1,ArrowLeft:-1,ArrowDown:columns,ArrowUp:-columns}[event.key];
      if(index<0||delta===undefined)return;event.preventDefault();event.stopPropagation();buttons[Math.max(0,Math.min(buttons.length-1,index+delta))]?.focus();
    });
    return {update};
  }
  root.CrescendoFretboardAccess={create};
})(window);
