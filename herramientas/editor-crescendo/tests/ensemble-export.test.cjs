const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/score-editor-musicxml-export.js'),'utf8'),c);
const measure=(staves,keySignature={accidental:'natural',count:0})=>({number:1,ticks:16,meter:{top:4,bottom:4},keySignature,staves:staves.map((pitch,index)=>({number:index+1,voices:[{number:1,events:[{type:'note',duration:16,durationId:'whole',pitch}]}]}))});
test('MusicXML exports independent parts with their own clefs, GM sounds, written keys and octave transpositions',()=>{
 const xml=c.window.JMLScoreMusicXml.serialize({title:'Cuerdas & metales',creators:[{type:'arranger',name:'Ana & José'}],parts:[
  {partName:'Piano',divisions:32,staves:[{clefId:'clef-g'},{clefId:'clef-f'}],midi:{program:1,volume:0},measures:[measure([{step:'C',octave:4},{step:'C',octave:3}])]},
  {partName:'Trompeta en Si♭',divisions:32,staves:[{clefId:'clef-g'}],transpose:{diatonic:-1,chromatic:-2},midi:{program:57,channel:2},measures:[measure([{step:'D',octave:4}],{accidental:'sharp',count:2})]},
  {partName:'Contrabajo',divisions:32,staves:[{clefId:'clef-f'}],transpose:{diatonic:-7,chromatic:-12},midi:{program:44,channel:3},measures:[measure([{step:'C',octave:4}])]},
  {partName:'Sax tenor',divisions:32,staves:[{clefId:'clef-g'}],transpose:{diatonic:-8,chromatic:-14},midi:{program:67,channel:4},measures:[measure([{step:'D',octave:5}],{accidental:'sharp',count:2})]}
 ]});
 const script=`import sys,xml.etree.ElementTree as E
r=E.fromstring(sys.stdin.read());p=r.findall('part');d=r.findall('part-list/score-part')
assert len(p)==len(d)==4
assert [n.findtext('midi-instrument/midi-program') for n in d]==['1','57','44','67']
assert d[0].findtext('midi-instrument/volume')=='0'
assert len({n.find('score-instrument').get('id') for n in d})==4
assert p[0].findtext('measure/attributes/staves')=='2'
assert p[1].findtext('measure/attributes/key/fifths')=='2'
assert p[1].findtext('measure/attributes/transpose/chromatic')=='-2'
assert p[2].findtext('measure/attributes/transpose/chromatic')=='0'
assert p[2].findtext('measure/attributes/transpose/octave-change')=='-1'
assert p[3].findtext('measure/attributes/transpose/diatonic')=='-1'
assert p[3].findtext('measure/attributes/transpose/octave-change')=='-1'
assert r.findtext('identification/creator')=='Ana & José'
print('OK')`;
 const result=spawnSync('python3',['-c',script],{input:xml,encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/OK/);
});
