(function(root){'use strict';
 // Drawing palette and techniques shared with diapason-virtual/js/fretboard.js,
 // bass-virtual/js/fretboard.js and cuerdas-frotadas/js/app.js.
 const palette={wood:['#3a2417','#20120a','#0f0704'],bowed:['#5a3a24','#2c1810','#150b06'],metal:['#f2f2f0','#9a9a97','#55534f'],string:'rgba(255,247,226,.92)',guide:'rgba(243,224,187,.3)'};
 function mount(board,instrument){
  const canvas=document.createElement('canvas');canvas.className='editor-string-board-surface';canvas.setAttribute('aria-hidden','true');board.prepend(canvas);
  function draw(){
   const width=Math.max(board.clientWidth,54+25*54),count=instrument.tuning.length,height=count*28+12,left=108,right=width,top=6,bottom=height-6,frets=24,fw=(right-left)/frets,center=height/2;
   const ratio=window.devicePixelRatio||1;canvas.width=Math.ceil(width*ratio);canvas.height=Math.ceil(height*ratio);canvas.style.width=width+'px';canvas.style.height=height+'px';const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);
   const stringY=(s,t)=>center+(s-(count-1)/2)*28*(instrument.fretted?1:.72+.28*t);
   const colors=instrument.fretted?palette.wood:palette.bowed;
   const outline=()=>{ctx.beginPath();if(instrument.fretted)ctx.roundRect(left,top,right-left,bottom-top,12);else{ctx.moveTo(left,stringY(0,0)-10);ctx.lineTo(right,stringY(0,1)-10);ctx.lineTo(right,stringY(count-1,1)+10);ctx.lineTo(left,stringY(count-1,0)+10);ctx.closePath();}};outline();
   const bg=ctx.createLinearGradient(0,top,0,bottom);colors.forEach((color,i)=>bg.addColorStop(i===1?.52:i/2,color));ctx.fillStyle=bg;ctx.fill();ctx.save();ctx.clip();
   if(instrument.fretted){ctx.globalAlpha=.22;for(let i=0;i<22;i++){const y=top+8+(i*11)%(bottom-top);ctx.strokeStyle=i%2?'#4a2e1c':'#170c06';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,y);ctx.bezierCurveTo(left+(right-left)*.25,y+8,left+(right-left)*.65,y-7,right,y+3);ctx.stroke();}ctx.globalAlpha=1;
    ctx.fillStyle=palette.guide;for(const f of [3,5,7,9,12,15,17,19,22,24]){const x=left+(f-.5)*fw;for(const y of f%12===0?[top+(bottom-top)*.32,top+(bottom-top)*.68]:[center]){ctx.beginPath();ctx.arc(x,y,4.6,0,Math.PI*2);ctx.fill();}}
   }
   const metal=ctx.createLinearGradient(0,top,0,bottom);[[0,palette.metal[0]],[.18,palette.metal[1]],[.5,palette.metal[2]],[.82,palette.metal[1]],[1,palette.metal[0]]].forEach(([at,color])=>metal.addColorStop(at,color));
   for(let f=0;f<=frets;f++){const x=left+f*fw,t=f/frets;ctx.beginPath();ctx.moveTo(x,instrument.fretted?top:stringY(0,t)-6);ctx.lineTo(x,instrument.fretted?bottom:stringY(count-1,t)+6);if(f===0){ctx.strokeStyle=palette.string;ctx.lineWidth=6;}else if(instrument.fretted){ctx.strokeStyle=metal;ctx.lineWidth=2.6;}else{const color={1:'#4ea1e0',3:'#6fcf5b',4:'#f2b544',6:'#f2e34f'}[f];ctx.strokeStyle=color||'rgba(255,250,240,.35)';ctx.lineWidth=color?5:1.4;ctx.setLineDash(color?[]:[3,3]);}ctx.stroke();ctx.setLineDash([]);}
   for(let s=0;s<count;s++){ctx.beginPath();ctx.moveTo(left,stringY(s,0));ctx.lineTo(right,stringY(s,1));ctx.strokeStyle=palette.string;ctx.lineWidth=instrument.fretted?1.4+s*.28:1.3+s*.55;ctx.stroke();}ctx.restore();outline();ctx.lineWidth=1.5;ctx.strokeStyle='rgba(243,224,187,.78)';ctx.stroke();
   board.style.gridTemplateColumns=`54px 54px repeat(24,${fw}px)`;
   board.querySelectorAll('button').forEach(button=>{if(!instrument.fretted){const s=Number(button.dataset.string)-1,f=Number(button.dataset.fret),t=Math.max(0,(f-.5)/24);button.style.translate=`0 ${stringY(s,t)-(20+s*28)}px`;}else button.style.removeProperty('translate');});
  }
  const observer=new ResizeObserver(draw);observer.observe(board);requestAnimationFrame(draw);return ()=>observer.disconnect();
 }
 root.CrescendoEditorStringBoard={mount,palette};
})(window);
