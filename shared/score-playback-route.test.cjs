const test=require('node:test'),assert=require('node:assert/strict');
const Route=require('./score-playback-route.js'),Timing=require('./score-playback-timing.js');
const m=(extra={})=>({endings:[],controls:{},forward:false,backward:null,...extra});
const ending=(type,...numbers)=>({type,numbers});
test('ordinary repeat, nested repeats and three passes',()=>{
 assert.deepEqual(Route.itinerary([m({forward:true}),m({backward:{times:2}}),m()]),[0,1,0,1,2]);
 assert.deepEqual(Route.itinerary([m({forward:true}),m({forward:true,backward:{times:2}}),m({backward:{times:2}})]),[0,1,1,2,0,1,1,2]);
 assert.deepEqual(Route.itinerary([m({backward:{times:3}})]),[0,0,0]);
});
test('first/second endings and multi-bar endings',()=>{
 assert.deepEqual(Route.itinerary([m({forward:true}),m({endings:[ending('start',1)]}),m({endings:[ending('stop',1)],backward:{times:2}}),m({endings:[ending('start',2),ending('discontinue',2)]})]),[0,1,2,0,3]);
});
test('D.C. al Fine and D.S. al Coda perform exactly once',()=>{
 assert.deepEqual(Route.itinerary([m(),m({controls:{fine:'yes'}}),m({controls:{dacapo:'yes'}})]),[0,1,2,0,1]);
 assert.deepEqual(Route.itinerary([m(),m({controls:{segno:'S'}}),m({controls:{tocoda:'C'}}),m({controls:{dalsegno:'S'}}),m({controls:{coda:'C'}}),m()]),[0,1,2,3,1,2,4,5]);
});
const e=(localName,attrs={},children=[],textContent='')=>({localName,children,textContent,getAttribute:k=>attrs[k]??null});
test('reads repeat and sound controls directly from MusicXML',()=>{
 const root=e('score-partwise',{},[e('part',{},[e('measure',{},[e('barline',{},[e('repeat',{direction:'forward'})])]),e('measure',{},[e('barline',{},[e('repeat',{direction:'backward',times:'2'})])])])]);
 assert.deepEqual(Route.fromElement(root),[0,1,0,1]);
});
// Simulate the iterator boundary exposed by OSMD, including empty rest/visible entries.
class Iterator{
 constructor(){this.pos=-1;this.currentMeasureIndex=0;this.currentTimeStamp={RealValue:0};this.music=[0,0,1,2];}
 get EndReached(){return this.pos>=this.music.length;}
 get CurrentMeasureIndex(){return this.currentMeasureIndex;}
 get CurrentMeasure(){return{Duration:{RealValue:1},AbsoluteTimestamp:{RealValue:this.currentMeasureIndex}};}
 get CurrentSourceTimestamp(){return this.currentTimeStamp;}
 get CurrentVoiceEntries(){return[{Notes:[]}];}
 CurrentVisibleVoiceEntries(){return this.CurrentVoiceEntries;}
 moveToNextVisibleVoiceEntry(){this.pos++;this.currentMeasureIndex=this.music[this.pos]??3;this.currentTimeStamp={RealValue:this.currentMeasureIndex+(this.pos===1?.5:0)};}
}
function engine(){let cursor;const result={Sheet:{},render(){this.cursor={reset(){this.resetIterator();},resetIterator(){this.iterator=new Iterator();},update(){}};return 'rendered';}};result.render();return result;}
test('cursor visits the explicit route, clones independently, resets and survives redraw',()=>{
 const eng=engine();Route.install(eng,[0,1,0,2],{MusicPartManagerIterator:Iterator});
 const walk=()=>{const it=eng.cursor.iterator,found=[];let guard=0;while(!it.EndReached&&guard++<20){found.push([it.CurrentMeasureIndex,it.CrescendoVisit]);it.moveToNext();}return found;};
 const expected=[[0,0],[0,0],[1,1],[0,2],[0,2],[2,3]];
 assert.deepEqual(walk(),expected);eng.cursor.reset();const copy=eng.cursor.iterator.clone();copy.moveToNext();assert.equal(eng.cursor.iterator.CurrentSourceTimestamp.RealValue,0);assert.equal(copy.CurrentSourceTimestamp.RealValue,.5);
 assert.equal(eng.render(),'rendered');assert.deepEqual(walk(),expected);
});
test('repeat boundary duration finishes the measure instead of using the backward delta',()=>{
 const eng=engine();Route.install(eng,[0,0],{MusicPartManagerIterator:Iterator});const it=eng.cursor.iterator;it.moveToNext();assert.equal(Timing.stepSeconds(it,120),1);it.moveToNext();assert.equal(Timing.stepSeconds(it,120),1);
});
test('forward jumps skip the omitted music in time as well as in the cursor',()=>{
 const eng=engine();Route.install(eng,[0,2],{MusicPartManagerIterator:Iterator});const it=eng.cursor.iterator;it.moveToNext();assert.equal(Timing.stepSeconds(it,120),1);it.moveToNext();assert.equal(Timing.stepSeconds(it,120),2);
});
test('ties and releases stop at a repeat, coda jump or Fine boundary',()=>{
 const eng=engine();Route.install(eng,[0,2],{MusicPartManagerIterator:Iterator});const note={Length:{RealValue:4}};assert.equal(Timing.tiedSeconds(note,120,eng.cursor.iterator),2);eng.cursor.iterator.moveToNext();assert.equal(Timing.tiedSeconds(note,120,eng.cursor.iterator),1);
});
