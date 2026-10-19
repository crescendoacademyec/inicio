const {test}=require('node:test'),assert=require('node:assert/strict');
const {dimensions}=require('../js/chrome-fit.js');
test('both chrome rows use the same proportional fit at common Windows effective widths',()=>{
 for(const available of [1920,1536,1440,1366,1280,1093,1024,960,800,700,640,390]){
  const {width,scale}=dimensions(available,1312);
  assert.ok(scale>0&&scale<=1);
  assert.ok(Math.abs(width*scale-available)<.001);
  assert.ok(width>=1312);
 }
 assert.equal(dimensions(1440,1280).scale,1);
 assert.equal(dimensions(1024,1280).scale,.8);
 assert.equal(dimensions(960,1280).scale,.75);
 assert.equal(dimensions(1280,1600).scale,.8);
});
