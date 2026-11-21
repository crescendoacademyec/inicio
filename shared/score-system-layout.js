/* Pure system packing and ordered manual boundary edits. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CrescendoSystemLayout=api;})(typeof globalThis==='object'?globalThis:this,function(){
 function normalize(breaks,count){return [...new Set((breaks||[]).filter(i=>Number.isInteger(i)&&i>0&&i<count))].sort((a,b)=>a-b);}
 function pack({starts,widths,header=0,available=Infinity,max=4,breaks=null,padding=24,constrainManual=false}){
  const rows=[],manual=Array.isArray(breaks),boundaries=normalize(breaks,widths.length);
  for(let first=0;first<widths.length;){
   const origin=first?starts[first]-header:0;
   const limit=manual?(boundaries.find(i=>i>first)??widths.length)-1:Math.min(widths.length-1,first+max-1);
   let last=first;
   if(manual&&!constrainManual)last=limit;
   else while(last<limit&&starts[last+1]+widths[last+1]-origin+padding<=available+1e-7)last++;
   const end=starts[last]+widths[last];rows.push({first,last,origin,end,width:end-origin+padding});first=last+1;
  }
  return rows;
 }
 function justify({widths,header=0,available=Infinity,max=4,breaks=null,padding=24,constrainManual=false}){
  const startsFor=values=>{let x=header;return values.map(width=>{const start=x;x+=width;return start;});};
  const starts=startsFor(widths);
  if(!Number.isFinite(available)||available<=0)return {starts,widths:widths.slice(),available};
  const rows=pack({starts,widths,header,available,max,breaks,padding,constrainManual}),target=Math.max(available,...rows.map(row=>row.width));
  const fitted=widths.slice();
  for(const row of rows){
   const extra=Math.max(0,target-row.width)/(row.last-row.first+1);
   for(let i=row.first;i<=row.last;i++)fitted[i]+=extra;
  }
  return {starts:startsFor(fitted),widths:fitted,available:target};
 }
 function move(rows,index,direction){const at=rows.findIndex(r=>index>=r.first&&index<=r.last);if(at<0||direction<0&&at===0||direction>0&&index===rows[at].first)return null;const breaks=rows.slice(1).map(r=>r.first),row=rows[at];if(direction<0){const pos=breaks.indexOf(row.first);breaks.splice(pos,1);if(index<row.last)breaks.push(index+1);}else{if(rows[at+1])breaks.splice(breaks.indexOf(rows[at+1].first),1);breaks.push(index);}return normalize(breaks,rows.at(-1).last+1);}
 function edit(breaks,index,operation,count){if(!Array.isArray(breaks))return null;return normalize(breaks.filter(i=>operation==='insert'||i!==index).map(i=>i>=index?i+(operation==='insert'?1:-1):i),count);}
 return {normalize,pack,justify,move,edit};
});
