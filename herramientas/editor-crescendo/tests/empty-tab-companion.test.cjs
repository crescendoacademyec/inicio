const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),I=require('../src/score-editor-instruments.js');
const software='Jaramillo Music Lab - Cuaderno de estudio',pairs=[{staff:3,of:1},{staff:4,of:2}];
function systems(){return [{initialClefId:'clef-g',measures:[{entries:[{type:'note',diatonicStep:35,ticks:2}]}]},{initialClefId:'clef-g',measures:[{entries:[{type:'rest',ticks:24}]}]}];}
test('recognizes the old duplicate guitar companion without touching musical data',()=>{
 const s=systems(),before=JSON.stringify(s);assert.equal(I.hasLegacyEmptyTabCompanion(s,pairs,software),true);assert.equal(JSON.stringify(s),before);
});
test('retains real second staves, annotations, piano bass clef and third-party scores',()=>{
 for(const modify of [s=>s[1].measures[0].entries.push({type:'note'}),s=>s[1].initialClefId='clef-f',s=>s[1].measures[0].entries[0].lyrics=[{text:'Texto'}],s=>s.push(s[0])]){const s=systems();modify(s);assert.equal(I.hasLegacyEmptyTabCompanion(s,pairs,software),false);}
 assert.equal(I.hasLegacyEmptyTabCompanion(systems(),pairs,'MuseScore'),false);
 assert.equal(I.hasLegacyEmptyTabCompanion(systems(),pairs,software,[{staff:2,kind:'dynamic'}]),false);
 assert.equal(I.hasLegacyEmptyTabCompanion(systems(),[],software),false);
});
test('new defaults use one staff for each solo instrument and two for piano',()=>{
 const source=fs.readFileSync(require.resolve('../src/app.js'),'utf8'),code=source.slice(source.indexOf('  function createDefaultSystems('),source.indexOf('  const initialSystems'));
 const c={window:{},InstrumentSounds:I,createInitialMeasures:count=>Array.from({length:count},()=>({entries:[]})),createSystemId:()=>String(Math.random())};vm.createContext(c);vm.runInContext(code,c);
 for(const [id,p] of Object.entries(I.instruments)){const s=c.createDefaultSystems(8,id);assert.equal(s.length,id==='piano'?2:1,id);assert.equal(s[0].initialClefId,p.clef);assert.equal(s[0].measures.length,8);if(id==='piano')assert.equal(s[1].initialClefId,'clef-f');}
});
test('changing a legacy default to guitar removes only the unused automatic bass companion',()=>{
 const source=fs.readFileSync(require.resolve('../src/app.js'),'utf8'),code=source.slice(source.indexOf('  function changeScoreInstrument('),source.indexOf('  function moveScoreInstrument('));
 for(const populated of [false,true]){let undo=0;const staffs=[{instrumentId:'piano',partId:'legacy-piano',initialClefId:'clef-g',name:'Piano',measures:[{entries:[{type:'note',id:'melody'}]}]},{instrumentId:'piano',partId:'legacy-piano',initialClefId:'clef-f',name:'Piano',measures:[{entries:[{type:populated?'note':'rest',id:'bass'}]}]}];
 const c={window:{},state:{systems:staffs,marks:[],textItems:[],midiPlayback:{}},scoreSystems:()=>staffs,saveHistory:()=>undo++,createSystemId:()=> 'part-new',Arrangement:{remapReferences(){}},stopMidiPlayback(){},arrangementSourceItems:()=>[],systemInstrumentProfile:s=>I.instruments[s.instrumentId],InstrumentSounds:I,transposedInstrumentKey:k=>k,withSystemContext:(_,fn)=>fn(),setActiveSystemIndex(){},invalidateLayoutCache(){},render(){}};vm.createContext(c);vm.runInContext(code,c);c.changeScoreInstrument(0,{instrumentId:'guitar'});assert.equal(staffs.length,populated?2:1);assert.equal(staffs[0].measures[0].entries[0].id,'melody');assert.equal(undo,1);}
});
