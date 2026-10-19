const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..');
test('the engraved standard symbols originate from the bundled Bravura font, not a system font',()=>{
 const source=fs.readFileSync(path.join(__dirname,'opensheetmusicdisplay-1.8.4.min.js'),'utf8');
 const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'herramientas/editor-crescendo/assets/fonts/Bravura.otf'))).digest('hex');
 assert.ok(source.includes('Bravura source SHA256: '+hash));
 const start=source.indexOf('const u={"glyphs":')+'const u='.length;
 const font=JSON.parse(source.slice(start,source.indexOf(';function d(',start)));
 assert.match(font.familyName,/Bravura/);
 const map=JSON.parse(fs.readFileSync(path.join(root,'tools/bravura-vexflow-map.json')));
 for(const [id,entry] of Object.entries(map)){
  assert.ok(font.glyphs[id].o.startsWith('m '),entry.name);
  assert.ok(font.glyphs[id].x_max>font.glyphs[id].x_min,entry.name);
  assert.ok(font.glyphs[id].ha>0,entry.name);
  assert.doesNotMatch(font.glyphs[id].o,/NaN|Infinity/);
 }
 // At 38pt the notehead spans a little over one 10px staff space.
 const head=font.glyphs.vb,width=(head.x_max-head.x_min)*72*38/(100*font.resolution);
 assert.ok(width>11&&width<13);
 for(const name of ['gClef','fClef','noteheadBlack','noteheadHalf','noteheadWhole','restQuarter','restWhole','timeSig4','accidentalSharp','flag16thDown','dynamicPiano'])assert.ok(Object.values(map).some(m=>m.name===name),name);
});
test('all shared engraving consumers load the local Bravura distribution',()=>{
 const pages=['armonia-funcional','armonia-jazz','teoria-lectura-musical','ear-training','metronomo','piano-virtual','bass-virtual','cuerdas-frotadas','diapason-virtual','requinteando','folk-virtual'];
 for(const name of pages){const html=fs.readFileSync(path.join(root,'herramientas',name,'index.html'),'utf8');assert.match(html,/src="\.\.\/\.\.\/shared\/opensheetmusicdisplay-1\.8\.4\.min\.js\?v=20261019-bravura-1"/,name);assert.doesNotMatch(html,/https:\/\/[^" ]*opensheetmusicdisplay/);}
});
