/* Exact wood, guide dots and silver fret drawing extracted from Diapasón Virtual. */
(function(root){'use strict';
const COLORS={board1:'#3a2417',board2:'#20120a',board3:'#0f0704',fretmetalLight:'#f2f2f0',fretmetalMid:'#9a9a97',fretmetalDark:'#55534f',string:'rgba(255,247,226,.92)'};
function drawFretboardBase(ctx,g){const {width,canvasH,boardX,boardW,padY,boardH,stringGap,startY,fw,visibleFrets,offset=0,leftHanded=false,radius=14,stringCount=6}=g,colors={...COLORS,...g.colors},GUIDE_DOTS=[3,5,7,9,12,15,17,19,22];
    function roundedRectPath(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
      ctx.clearRect(0, 0, width, canvasH);

      roundedRectPath(boardX + 0.5, padY, boardW - 1, boardH, radius);
      ctx.save();
      ctx.clip();

      // Fondo oscuro del diapasón
      const bg = ctx.createLinearGradient(0, padY, 0, padY + boardH);
      bg.addColorStop(0, colors.board1);
      bg.addColorStop(0.52, colors.board2);
      bg.addColorStop(1, colors.board3);
      ctx.fillStyle = bg;
      ctx.fillRect(boardX, padY, boardW, boardH);

      // Vetas
      ctx.globalAlpha = 0.22;
      for (let i = 0; i < 22; i++) {
        const y = padY + 8 + (i * 11) % boardH;
        ctx.strokeStyle = i % 2 ? '#4a2e1c' : '#170c06';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(boardX, y);
        ctx.bezierCurveTo(boardX + boardW * 0.25, y + 8, boardX + boardW * 0.65, y - 7, boardX + boardW, y + 3);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Puntos guía
      ctx.fillStyle = 'rgba(243,224,187,0.3)';
      GUIDE_DOTS.forEach(gd => {
        const f = gd - offset - 1;
        if (f < 0 || f >= visibleFrets) return;
        const cx = leftHanded ? boardX + ((visibleFrets-f-1)*fw) + fw/2 : boardX + (f*fw) + fw/2;
        const dotR = 4.6;
        if (gd === 12) {
          ctx.beginPath(); ctx.arc(cx, padY + boardH * 0.32, dotR, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx, padY + boardH * 0.68, dotR, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(cx, padY + boardH / 2, dotR, 0, Math.PI * 2); ctx.fill();
        }
      });

      // Trastes
      const fretMetal = ctx.createLinearGradient(0, padY, 0, padY + boardH);
      fretMetal.addColorStop(0, colors.fretmetalLight);
      fretMetal.addColorStop(0.18, colors.fretmetalMid);
      fretMetal.addColorStop(0.5, colors.fretmetalDark);
      fretMetal.addColorStop(0.82, colors.fretmetalMid);
      fretMetal.addColorStop(1, colors.fretmetalLight);
      ctx.lineCap = 'butt';
      for (let f = 0; f <= visibleFrets; f++) {
        const x = boardX + ((leftHanded?visibleFrets-f:f) * fw);
        if (f === 0) {
          ctx.strokeStyle = colors.string;
          ctx.lineWidth = 6;
        } else {
          ctx.strokeStyle = fretMetal;
          ctx.lineWidth = 2.6;
        }
        ctx.beginPath();
        ctx.moveTo(x, padY);
        ctx.lineTo(x, padY + boardH);
        ctx.stroke();
        if (f > 0) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.strokeStyle = colors.fretmetalLight;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(x - 1, padY);
          ctx.lineTo(x - 1, padY + boardH);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Cuerdas
      ctx.strokeStyle = colors.string;
      for (let s = 0; s < stringCount; s++) {
        const y = startY + (s * stringGap);
        ctx.lineWidth = 1.4 + (s * 0.28);
        ctx.beginPath();
        ctx.moveTo(boardX, y);
        ctx.lineTo(boardX + boardW, y);
        ctx.stroke();
      }

      ctx.restore();

      roundedRectPath(boardX + 0.5, padY, boardW - 1, boardH, radius);
      ctx.strokeStyle = 'rgba(243,224,187,0.78)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

}
function drawNote(ctx,x,y,label,filled=true){ctx.save();ctx.shadowColor='rgba(0,0,0,.42)';ctx.shadowBlur=8;ctx.shadowOffsetY=3;ctx.beginPath();ctx.arc(x,y,14,0,Math.PI*2);ctx.fillStyle=filled?'#d4a84f':'#20120a';ctx.fill();ctx.strokeStyle='#d4a84f';ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.fillStyle=filled?'#161514':'#f3e0bb';ctx.font='900 11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x,y+.5);ctx.restore();}
root.CrescendoInstrumentSurfaces={drawFretboardBase,drawNote,COLORS};
})(window);
