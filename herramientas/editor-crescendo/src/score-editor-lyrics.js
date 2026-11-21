(function(root){'use strict';
 function normalize(items){return (Array.isArray(items)?items:[]).filter(item=>item&&String(item.text||'').trim()).map(item=>({number:Math.max(1,Math.min(8,Math.round(Number(item.number)||1))),text:String(item.text).trim().slice(0,240),syllabic:['begin','middle','end'].includes(item.syllabic)?item.syllabic:'single',extend:!!item.extend}));}
 function syllables(text,number=1){return String(text||'').trim().split(/\s+/).filter(Boolean).flatMap(word=>{const parts=word.split('-').filter(Boolean);return parts.map((text,index)=>({number,text,syllabic:parts.length===1?'single':index===0?'begin':index===parts.length-1?'end':'middle'}));});}
 function replace(items,number,item){return normalize([...normalize(items).filter(lyric=>lyric.number!==number),...(item?[{...item,number}]:[])]).sort((a,b)=>a.number-b.number);}
 const api={normalize,syllables,replace};if(typeof module!=='undefined')module.exports=api;else root.JMLScoreLyrics=api;
})(typeof window==='undefined'?globalThis:window);
