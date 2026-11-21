(function(root){'use strict';
 // Coordinates stay in the score's continuous x-space; each row viewport
 // translates its own segment. Continuations start after its clef/header.
 function segments({x1,x2,y1=0,y2=y1,startMeasure,endMeasure},rows,starts){
  if(!(x2>x1))return [];
  return rows.flatMap((row,index)=>{
   if(endMeasure<row.first||startMeasure>row.last)return [];
   const openStart=startMeasure<row.first,openEnd=endMeasure>row.last;
   const a=openStart?starts[row.first]+4:x1,b=openEnd?row.end-5:x2;
   if(b<=a+2)return [];
   const interpolate=x=>y1+(y2-y1)*Math.max(0,Math.min(1,(x-x1)/(x2-x1)));
   return [{rowIndex:index,x1:a,x2:b,y1:openStart?interpolate(a):y1,y2:openEnd?interpolate(b):y2,openStart,openEnd}];
  });
 }
 const api={segments};if(typeof module!=='undefined')module.exports=api;else root.JMLScoreSystemSpans=api;
})(typeof window==='undefined'?globalThis:window);
