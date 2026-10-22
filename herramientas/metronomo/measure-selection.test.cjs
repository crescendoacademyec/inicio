const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),S=require('./rhythm-structure.js'),W=require('./rhythm-writing.js'),Clipboard=require('../../shared/measure-clipboard.js');
function fixture(){
 const start=source.indexOf('    function handleRhythmMeasureClipboard('),end=source.indexOf("    ['keydown','copy','paste']",start);
 const c={rhythmMouseMode:true,selectedRhythmBar:0,rhythmMeasureClipboard:null,rhythmEditorEvents:[{id:'a',bar:0,offset:0,beats:1,note:'F4',stringFingerings:{guitar:[{string:1,fret:2,midi:66}]}},{id:'b',bar:1,offset:0,beats:1,note:'C4'}],rhythmMarks:[{type:'key',bar:0,fifths:1},{type:'key',bar:1,fifths:0}],rhythmStructure:S,rhythmHistory:W.history(),UI:{rhythmLab:{hidden:false},rhythmStatus:{}},window:{CrescendoMeasureClipboard:Clipboard},rhythmTimeline:()=>({capacities:[4,4]}),renderRhythmScore:m=>c.message=m,rhythmSnapshot:()=>JSON.stringify({events:c.rhythmEditorEvents,marks:c.rhythmMarks})};
 vm.createContext(c);vm.runInContext(source.slice(start,end),c);return c;
}
test('mouse copy/paste works with Windows keyboard and native Mac clipboard, preserves key-signature pitches and fingerings, and supports undo',()=>{
 for(const native of [false,true]){
  const c=fixture(),before=c.rhythmSnapshot(),clipboard={};const event=(type,key)=>({type,key,ctrlKey:!native,target:{closest:()=>false},preventDefault(){},stopImmediatePropagation(){},clipboardData:{setData:(k,v)=>clipboard[k]=v}});
  c.handleRhythmMeasureClipboard(event(native?'copy':'keydown','c'));if(native)assert.equal(JSON.parse(clipboard['text/plain']).type,'crescendo-rhythm-measure');
  c.selectedRhythmBar=1;c.handleRhythmMeasureClipboard(event(native?'paste':'keydown','v'));
  const pasted=c.rhythmEditorEvents.find(e=>e.bar===1);assert.notEqual(pasted.id,'a');assert.equal(pasted.accidentalsByNote.F4,'sharp');assert.equal(S.resolve(c.rhythmEditorEvents,c.rhythmMarks).find(e=>e.bar===1).note,'F#4');assert.equal(pasted.stringFingerings.guitar[0].fret,2);assert.equal(c.rhythmMarks.find(m=>m.bar===1).fifths,0);assert.equal(c.message,'Compás pegado.');assert.equal(c.rhythmHistory.undo(c.rhythmSnapshot()),before);
 }
});
test('measure paste rejects overflow and ignores editable fields',()=>{
 const c=fixture(),e={type:'copy',target:{closest:()=>false},preventDefault(){},stopImmediatePropagation(){}};c.handleRhythmMeasureClipboard(e);c.selectedRhythmBar=1;c.rhythmTimeline=()=>({capacities:[4,.5]});const before=c.rhythmSnapshot();c.handleRhythmMeasureClipboard({...e,type:'paste'});assert.equal(c.rhythmSnapshot(),before);assert.match(c.UI.rhythmStatus.textContent,/no cabe/);c.rhythmMeasureClipboard=null;c.handleRhythmMeasureClipboard({...e,target:{closest:()=>true}});assert.equal(c.rhythmMeasureClipboard,null);
});
