const {test}=require('node:test'),assert=require('node:assert/strict'),L=require('./score-system-layout.js'),P=require('./score-print.js');
const data={starts:[100,300,500,700,900,1100,1300,1500],widths:Array(8).fill(200),header:100,available:950};
test('automatic and manual systems retain musical order without empty systems',()=>{const rows=L.pack(data);assert.deepEqual(rows.map(r=>[r.first,r.last]),[[0,3],[4,7]]);assert.deepEqual(L.move(rows,4,-1),[5]);assert.deepEqual(L.move(rows,2,1),[2]);assert.equal(L.move(rows,0,-1),null);assert.equal(L.move(rows,4,1),null);const manual=L.pack({...data,breaks:[3,5]});assert.deepEqual(manual.map(r=>[r.first,r.last]),[[0,2],[3,4],[5,7]]);assert.deepEqual(manual.flatMap(r=>Array.from({length:r.last-r.first+1},(_,i)=>r.first+i)),[0,1,2,3,4,5,6,7]);});
test('manual breaks reindex during insertion/removal and explicit single systems remain manual',()=>{assert.deepEqual(L.edit([3,5],2,'insert',9),[4,6]);assert.deepEqual(L.edit([4,6],2,'remove',8),[3,5]);assert.deepEqual(L.pack({...data,breaks:[]}).map(r=>[r.first,r.last]),[[0,7]]);});
test('A4 pagination keeps whole systems within margins and numbers every system once',()=>{const rows=Array.from({length:20},()=>({width:1000,height:250})),p=P.paginate(rows);assert.equal(p.pages.length,4);assert.deepEqual(p.pages.flatMap(page=>page.map(r=>r.index)),Array.from({length:20},(_,i)=>i));for(const page of p.pages)for(const row of page){assert.ok(row.y>=78);assert.ok(row.y+row.height<=841.89-36-25+.001);assert.ok(row.x+row.width<=595.28-36+.001);}});
test('oversized systems report a clear layout error instead of producing unreadable pages',()=>{assert.throws(()=>P.paginate([{width:9000,height:200}]),/Distribuye/);assert.throws(()=>P.paginate([]),/No hay sistemas/);});
test('justification fills the actual systems, including short final and dense systems',()=>{
 for(const widths of [Array(8).fill(200),[380,390,500,410,200,300,450]]){
  const original=widths.slice(),fitted=L.justify({widths,header:100,available:900,padding:0});
  const rows=L.pack({...fitted,header:100,padding:0});
  assert.deepEqual(widths,original);
  rows.forEach(row=>assert.ok(Math.abs(row.end-row.origin-900)<1e-7));
  fitted.widths.forEach((width,i)=>assert.ok(width>=original[i]));
  assert.deepEqual(rows.flatMap(row=>Array.from({length:row.last-row.first+1},(_,i)=>row.first+i)),widths.map((_,i)=>i));
 }
});
test('fractional exact-fit widths do not push the last bar onto another system',()=>{
 for(const available of [805.3,979.8,1068.1,1200.7]){
  const fitted=L.justify({widths:Array(8).fill(120),header:102.3,available,padding:0});
  const rows=L.pack({...fitted,header:102.3,padding:0});
  assert.deepEqual(rows.map(row=>[row.first,row.last]),[[0,3],[4,7]]);
  rows.forEach(row=>assert.ok(Math.abs(row.width-available)<1e-7));
 }
});
test('justification keeps manual boundaries and accommodates oversized bars without shrinking notes',()=>{
 const fitted=L.justify({...data,padding:0,breaks:[3,5]});
 const rows=L.pack({...fitted,header:100,padding:0,breaks:[3,5]});
 assert.deepEqual(rows.map(row=>[row.first,row.last]),[[0,2],[3,4],[5,7]]);
 rows.forEach(row=>assert.ok(Math.abs(row.width-950)<1e-7));
 const wide=L.justify({widths:[1000,100,100],header:100,available:800,padding:0});
 assert.equal(wide.available,1100);assert.equal(wide.widths[0],1000);
 assert.deepEqual(L.pack({...wide,header:100,padding:0}).map(row=>[row.first,row.last]),[[0,0],[1,2]]);
});
test('imported manual systems that exceed the sheet width reflow within equal margins',()=>{
 const widths=[240,240,240,280,200,200,200,200],options={header:104,available:1068,padding:0,breaks:[4],constrainManual:true};
 const fitted=L.justify({...options,widths}),rows=L.pack({...options,...fitted});
 assert.deepEqual(rows.map(row=>[row.first,row.last]),[[0,2],[3,3],[4,7]]);
 rows.forEach(row=>assert.ok(Math.abs(row.width-1068)<1e-7));
 assert.deepEqual(rows.flatMap(row=>Array.from({length:row.last-row.first+1},(_,i)=>row.first+i)),[0,1,2,3,4,5,6,7]);
});
