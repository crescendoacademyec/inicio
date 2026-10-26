const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8');
function fn(name){const start=source.indexOf('  function '+name+'(');assert.ok(start>=0,name);let p=source.indexOf('(',start),n=1;for(p++;n;p++){if(source[p]==='(')n++;if(source[p]===')')n--;}let i=source.indexOf('{',p),depth=1;for(i++;depth;i++){if(source[i]==='{')depth++;if(source[i]==='}')depth--;}return source.slice(start,i);}
function fixture(meter,active=0){
 const measures=()=>Array.from({length:8},(_,i)=>({entries:i<4?[{id:'n'+i,type:'note',tickStart:0,ticks:8}]:[]}));
 const state={meter,activeSystemIndex:active,systems:[{measures:measures()},{measures:measures()}],marks:[],textItems:[],cursorMeasure:0};state.measures=state.systems[active].measures;
 const c={state,window:{},EPSILON:.0001,DEFAULT_METER:{top:'4',bottom:'4'},suppressSystemSync:false,renderSystemIndex:active};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/score-editor-meter.js'),'utf8'),c);c.Meter=c.window.JMLScoreMeter;c.normalizeMeter=c.Meter.normalize;
 Object.assign(c,{entryStaffSteps:()=>[0],setEntryAccidental(){},effectiveEntryAccidental:()=>'natural',diatonicAccidentalForMeasure:()=>'natural',entryDiatonicStepForStaffStep:()=>0,syncActiveSystemMeasures(){state.systems[state.activeSystemIndex].measures=state.measures;},activeSystemIndex:()=>active,ensureAllSystemsMeasure(){},saveHistory(){},syncActiveMeterToCursor(){},entryVoice:()=>1,isMeasureRestEntry:e=>e.measureRest,normalizeTernaryTiedUnitPairs(){},verifyAllMeasureDurations(){},forceScoreSpacingRefresh(){},normalizeMeasure(){},makeMeasureRest:t=>({type:'rest',ticks:t,measureRest:true}),render(){c.scoreSystems();},ensureMeasure(i){while(state.measures.length<=i)state.measures.push({entries:[]});},splitEntryRhythmically(entry,start){const result=[];let left=entry.ticks;do{const target=c.measureIndexAndTickFromAbsolute(start),ticks=Math.min(left,c.measureTicksForIndex(target.measureIndex)-target.tick);result.push({absoluteStart:start,entry:{...entry,ticks,tieToNext:left>ticks}});start+=ticks;left-=ticks;}while(left>.0001);return result;}});
 for(const name of ['scoreSystems','withSystemContext','meterForMeasureIndex','measureTicksForIndex','measureStartAbsoluteTick','measureIndexAndTickFromAbsolute','flattenScoreEntries','rebuildMeasuresFromAbsoluteItems','setMeterAtMeasure'])vm.runInContext(fn(name),c);
 return c;
}
test('meter changes keep the rebuilt active staff reference on either staff, not obsolete bars',()=>{
 for(const active of [0,1]){const c=fixture({top:'2',bottom:'4'},active);c.setMeterAtMeasure({top:'4',bottom:'4'},0);
 for(const sys of c.state.systems){const notes=sys.measures.flatMap((m,i)=>m.entries.filter(e=>e.type==='note').map(e=>[i,e.tickStart,e.ticks]));assert.deepEqual(JSON.parse(JSON.stringify(notes)),[[0,0,8],[0,8,8],[1,0,8],[1,8,8]]);}
 assert.equal(c.state.measures,c.state.systems[active].measures);
 c.setMeterAtMeasure({top:'2',bottom:'4'},0);for(const sys of c.state.systems)assert.equal(sys.measures.flatMap(m=>m.entries).filter(e=>e.type==='note').reduce((n,e)=>n+e.ticks,0),32);
 }
});
test('local meters continue until the next signature and text follows musical time',()=>{
 const c=fixture({top:'2',bottom:'4'});c.state.textItems=[{measureIndex:2,tickStart:0,text:'Am'}];c.setMeterAtMeasure({top:'4',bottom:'4'},0);assert.equal(c.state.textItems[0].measureIndex,1);assert.equal(c.state.textItems[0].tickStart,0);
 c.state.systems[0].measures[2].meter={top:'3',bottom:'4'};assert.equal(c.measureTicksForIndex(3),12);c.state.systems[0].measures[5].meter={top:'2',bottom:'4'};assert.equal(c.measureTicksForIndex(6),8);
});
