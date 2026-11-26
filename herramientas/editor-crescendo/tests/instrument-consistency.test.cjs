const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const I=require('../src/score-editor-instruments.js'),Guitar=require('../src/score-editor-guitar.js'),source=fs.readFileSync(require.resolve('../src/app.js'),'utf8');
const change=source.slice(source.indexOf('  function changeScoreInstrument('),source.indexOf('  function moveScoreInstrument('));
const tabs=source.slice(source.indexOf('  function systemShowsTab('),source.indexOf('  function systemExtraHeight('));
function setup(from,single=false){
 let serial=0,history=0,renders=0;const make=(id,partId)=>({id,partId,instrumentId:from,name:I.instruments[from].name,initialClefId:id==='left'?'clef-f':I.instruments[from].clef,tabVisible:true,measures:[{entries:[]}]}),systems=[make('right','part'),make('left','part')];
 if(!single)systems.push(make('independent','other-part'));
 const context={window:{JMLScoreWorkspace:{singleInstrument:single}},state:{systems,marks:[],midiPlayback:{}},InstrumentSounds:I,Guitar,guitarTabVisible:true,scoreSystems:()=>systems,createSystemId:()=>String(++serial),saveHistory:()=>history++,stopMidiPlayback(){},arrangementSourceItems:()=>[],systemInstrumentProfile:s=>I.instruments[s.instrumentId],transposedInstrumentKey:key=>key,withSystemContext:(_index,fn)=>fn(),setActiveSystemIndex(){},invalidateLayoutCache(){},render:()=>renders++};
 vm.createContext(context);vm.runInContext(change+tabs,context);return {context,systems,history:()=>history,renders:()=>renders};
}
test('every instrument transition updates both linked staves, resets inherited TAB and preserves independent parts',()=>{
 const ids=Object.keys(I.instruments);let checked=0;
 for(const single of [false,true])for(const from of ids)for(const to of ids){
  if(from===to)continue;const c=setup(from,single),independent=single?null:JSON.stringify(c.systems[2]);c.context.changeScoreInstrument(1,{instrumentId:to});
  for(const [index,staff]of c.systems.slice(0,2).entries()){
   assert.equal(staff.instrumentId,to,`${from} → ${to}`);assert.equal(staff.name,I.instruments[to].name);assert.equal(staff.initialClefId,to==='piano'?(index?'clef-f':'clef-g'):I.instruments[to].clef);assert.equal(staff.tabVisible,undefined);
   assert.equal(c.context.systemShowsTab(staff),!!Guitar.forInstrument(to)?.fretted,`${from} → ${to}: tablature`);
  }
  assert.equal(c.systems[0].partId,c.systems[1].partId);if(!single)assert.equal(JSON.stringify(c.systems[2]),independent);assert.equal(c.history(),1);assert.equal(c.renders(),1);checked++;
 }
 assert.equal(checked,ids.length*(ids.length-1)*2);
});
test('custom part names and an explicitly enabled TAB remain until the instrument actually changes',()=>{
 const c=setup('violin');c.systems[0].name=c.systems[1].name='Mi sección';assert.equal(c.context.systemShowsTab(c.systems[0]),true);
 c.context.changeScoreInstrument(0,{name:'Cuerdas'});assert.equal(c.systems[0].tabVisible,true);assert.equal(c.systems[1].name,'Cuerdas');
 c.context.changeScoreInstrument(0,{instrumentId:'cello'});assert.equal(c.systems[0].name,'Cuerdas');assert.equal(c.systems[1].name,'Cuerdas');assert.equal(c.context.systemShowsTab(c.systems[0]),false);
});
