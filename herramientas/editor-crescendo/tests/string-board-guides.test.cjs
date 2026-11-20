const {test}=require('node:test'),assert=require('node:assert/strict');
const {bandColor,positionRatio}=require('../../../shared/editor-string-board.js');
test('violin guides use the Cuerdas chromatic references through the whole board',()=>{
 const colors={2:'#4ea1e0',4:'#6fcf5b',5:'#f2b544',7:'#f2e34f',9:'#4ea1e0',11:'#6fcf5b',12:'#f2b544',14:'#f2e34f',16:'#4ea1e0',18:'#6fcf5b',19:'#f2b544',21:'#f2e34f',23:'#4ea1e0'};
 for(let semitone=0;semitone<=24;semitone++)assert.equal(bandColor(semitone),colors[semitone]||null,`offset ${semitone}`);
});
test('violin bands align with the center of each playable chromatic cell',()=>{
 assert.equal(positionRatio(0,24),0);
 for(let semitone=1;semitone<=24;semitone++){
  const left=76,width=1056,cellWidth=44;
  assert.equal(left+width*positionRatio(semitone,24),left+(semitone-1)*cellWidth+cellWidth/2);
 }
});
