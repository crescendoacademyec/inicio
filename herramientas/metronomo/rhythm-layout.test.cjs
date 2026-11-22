const {test}=require('node:test'),assert=require('node:assert/strict'),W=require('./rhythm-writing.js');
function geometry(events,options){
 const svg=W.render(events,options),attr=(text,key)=>new RegExp(`(?:^|\\s)${key}="([^"]+)"`).exec(text)?.[1],root=svg.slice(0,svg.indexOf('>')),boxes=[...svg.matchAll(/<rect class="rhythm-measure-hit"[^>]+/g)].map(m=>Object.fromEntries(['data-bar','data-staff','data-start','data-end','data-top','x','width'].map(k=>[k,Number(attr(m[0],k))])));
 return {svg,width:Number(attr(root,'width')),height:Number(attr(root,'height')),rowHeight:Number(attr(root,'data-row-height')),starts:attr(root,'data-system-starts').split(',').map(Number),boxes};
}
function checkMargins(g){
 const rows=Map.groupBy(g.boxes,b=>b['data-top']);
 for(const boxes of rows.values()){
  assert.ok(Math.abs(boxes.at(-1).x+boxes.at(-1).width-(g.width-24))<1e-6,'right staff edge has the same 24px outer margin');
  for(let i=1;i<boxes.length;i++)assert.ok(Math.abs(boxes[i].x-boxes[i-1].x-boxes[i-1].width)<1e-6,'no gaps or overlap between measures');
  for(const b of boxes)assert.ok(b['data-start']>b.x&&b['data-end']<b.x+b.width,'writing and playback stay inside the measure');
 }
 const staffLines=[...g.svg.matchAll(/<line x1="24" y1="[^"]+" x2="([^"]+)" y2="[^"]+" stroke="#222"\/>/g)];assert.ok(staffLines.length>=rows.size*5);staffLines.forEach(m=>assert.ok(Math.abs(Number(m[1])-(g.width-24))<1e-6));
}
test('automatic systems fill the sheet between equal margins, including four empty bars and short final systems',()=>{
 for(const width of [720,900,980,1200])for(const bars of [1,4,5,8,9]){
  const g=geometry([],{width,bars});assert.equal(g.width,width);checkMargins(g);assert.equal(g.boxes.length,bars);
  if(width>=900&&bars===4){assert.deepEqual(g.starts,[0]);assert.ok(g.boxes.every(b=>Math.abs(b.width-g.boxes[0].width)<1e-6));}
 }
});
test('manual breaks and dense passages keep every bar in order and justify every resulting system',()=>{
 const dense=Array.from({length:16},(_,i)=>({id:String(i),bar:0,offset:i/4,beats:.25,note:i%2?'F#5':'C5'}));
 for(const events of [[],dense])for(const breaks of [[2,5],[4],[]]){
  const g=geometry(events,{bars:7,width:980,marks:[{type:'systemLayout',bar:0,breaks}]});checkMargins(g);assert.deepEqual(g.boxes.map(b=>b['data-bar']),[0,1,2,3,4,5,6]);assert.ok(g.width>=980);
  if(events.length){const box=g.boxes[0];assert.ok((box['data-end']-box['data-start'])/16>=36);}
 }
});
test('compact vertical spacing keeps staff and TAB systems within the rendered and exportable sheet',()=>{
 for(const clef of ['treble','bass','grand'])for(const tabHeight of [0,166]){
  const g=geometry([],{bars:8,width:980,clef,tabHeight}),staves=clef==='grand'?2:1;assert.equal(g.rowHeight,(160+tabHeight)*staves);assert.equal(g.height,g.rowHeight*g.starts.length);
  const tops=[...new Set(g.boxes.map(b=>b['data-top']))];for(let i=1;i<tops.length;i++)assert.equal(tops[i]-tops[i-1],160+tabHeight);
  assert.ok(tops.at(-1)+40+(tabHeight?116-40+85:0)<g.height);checkMargins(g);
 }
});
test('local key and meter changes reserve space even when a manual system crosses the fourth bar',()=>{
 const marks=[{type:'systemLayout',bar:0,breaks:[3]},{type:'key',bar:4,fifths:-5},{type:'meter',bar:4,meter:'3/4'}],events=Array.from({length:12},(_,i)=>({bar:4,offset:i/4,beats:.25,note:'C5'}));
 const g=geometry(events,{bars:6,width:2400,marks}),box=g.boxes.find(b=>b['data-bar']===4);checkMargins(g);assert.ok((box['data-end']-box['data-start'])/12>=26);assert.ok(g.svg.includes('rhythm-meter-change'));
});
