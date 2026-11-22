const {test}=require('node:test'),assert=require('node:assert/strict'),M=require('../src/score-editor-midi-export.js'),{spawnSync}=require('node:child_process');
function decode(bytes){const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);assert.equal(Buffer.from(bytes.slice(0,4)).toString(),'MThd');const ppq=view.getUint16(12),count=view.getUint16(10),tracks=[];let p=14;
 function vlq(){let n=0,b;do{b=bytes[p++];n=n*128+(b&127);}while(b&128);return n;}
 for(let i=0;i<count;i++){assert.equal(Buffer.from(bytes.slice(p,p+4)).toString(),'MTrk');const end=p+8+view.getUint32(p+4),events=[];p+=8;let tick=0;while(p<end){tick+=vlq();const status=bytes[p++];if(status===255){const type=bytes[p++],size=vlq(),data=[...bytes.slice(p,p+size)];p+=size;events.push({tick,type,data});}else{const size=[0xc0,0xd0].includes(status&0xf0)?1:2,data=[...bytes.slice(p,p+size)];p+=size;events.push({tick,status,data});}}tracks.push(events);}
 assert.equal(p,bytes.length);return {format:view.getUint16(8),ppq,tracks};}
const part=(index=0)=>({name:'Violín '+index,program:41,volume:80,systemIndices:[index]});
test('format 1 has a conductor, named instrument tracks, program changes, velocity and isolated channels',()=>{
 const file=decode(M.serialize({title:'Arreglo José',parts:[{...part(),name:'Piano',program:1,systemIndices:[0,1]},part(2)],events:[{systemIndex:0,midi:60,startMs:0,endMs:500},{systemIndex:1,midi:48,startMs:0,endMs:1000},{systemIndex:2,midi:76,startMs:500,endMs:1000,velocity:99}],tempos:[{ms:0,bpm:120}],meters:[{ms:0,top:'3+2',bottom:8}],durationMs:2000}));
 assert.equal(file.format,1);assert.equal(file.tracks.length,3);assert.equal(file.ppq,960);
 assert.equal(new TextDecoder().decode(new Uint8Array(file.tracks[1].find(e=>e.type===3).data)),'Piano');
 assert.deepEqual(file.tracks[0].find(e=>e.type===0x58).data,[5,3,24,8]);assert.equal(file.tracks[1].find(e=>e.status===0xc0).data[0],0);assert.equal(file.tracks[2].find(e=>e.status===0xc1).data[0],40);
 assert.deepEqual(file.tracks[1].filter(e=>(e.status&0xf0)===0x90).map(e=>e.data[0]),[60,48]);assert.deepEqual(file.tracks[2].find(e=>e.status===0x91).data,[76,99]);
 file.tracks.forEach(track=>assert.equal(track.at(-1).tick,3840));
});
test('tempo changes and swung onsets round trip from milliseconds within a tick of precision',()=>{
 const changes=[{ms:0,bpm:120},{ms:1000,bpm:60},{ms:3000,bpm:120}],clock=M.clock(changes);
 assert.equal(clock.tick(500),960);assert.equal(clock.tick(1000),1920);assert.equal(clock.tick(3000),3840);assert.equal(clock.tick(4000),5760);
 const file=decode(M.serialize({parts:[part()],tempos:changes,events:[{systemIndex:0,midi:67,startMs:333.333,endMs:450},{systemIndex:0,midi:69,startMs:2000,endMs:2600}],durationMs:4000}));
 assert.equal(file.tracks[0].filter(e=>e.type===0x51).length,3);
 assert.equal(file.tracks[1].find(e=>e.status===0x90).tick,640);assert.equal(file.tracks[1].filter(e=>e.status===0x90)[1].tick,2880);
 assert.deepEqual(file.tracks[0].filter(e=>e.type===0x51).map(e=>e.data.reduce((n,b)=>n*256+b,0)),[500000,1000000,500000]);
});
test('a big band with more than 15 pitched instruments gets distinct MIDI port/channel pairs',()=>{
 const parts=Array.from({length:22},(_,i)=>part(i)),file=decode(M.serialize({parts,events:parts.map((p,i)=>({systemIndex:i,midi:60,startMs:0,endMs:1000}))})),pairs=file.tracks.slice(1).map(track=>[track.find(e=>e.type===0x21).data[0],track.find(e=>e.type===0x20).data[0]]);
 assert.equal(new Set(pairs.map(pair=>pair.join(':'))).size,22);assert.ok(pairs.every(pair=>pair[1]!==9));assert.deepEqual(pairs[15],[1,0]);
});
test('repeated notes release before the next onset and invalid pitches are reported instead of changed',()=>{
 const file=decode(M.serialize({parts:[part()],events:[{systemIndex:0,midi:60,startMs:0,endMs:500},{systemIndex:0,midi:60,startMs:500,endMs:1000}]}));
 assert.deepEqual(file.tracks[1].filter(e=>e.tick===960).map(e=>e.status),[0x80,0x90]);
 assert.throws(()=>M.serialize({parts:[part()],events:[{systemIndex:0,midi:130,startMs:0,endMs:100}]}),/no válida/);
});
test('the per-instrument ZIP is a standard UTF-8 archive with verified CRCs and valid independent MIDI files',()=>{
 const data=M.serialize({parts:[part()],events:[{systemIndex:0,midi:60,startMs:0,endMs:500}]}),zip=M.zip([{name:'01-Violín I.mid',data},{name:'02-Trompeta.mid',data}]);
 const result=spawnSync('python3',['-c',"import io,sys,zipfile; z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())); assert z.testzip() is None; assert z.namelist()==['01-Violín I.mid','02-Trompeta.mid']; assert all(z.read(n)[:4]==b'MThd' for n in z.namelist()); print('OK')"],{input:zip});assert.equal(result.status,0,result.stderr.toString());
});
test('editor volta boundaries are exclusive in notation and inclusive only in the playback route',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),source=fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8'),start=source.indexOf('  function buildPlaybackPerformancePlan('),end=source.indexOf('  function midiExportParts(',start),Plan=require('../../../shared/score-performance-plan.js');
 const c={state:{measures:[{},{},{}],marks:[{type:'barline',barlineType:'repeat-start',boundaryIndex:0},{type:'barline',barlineType:'repeat-end',boundaryIndex:2},{type:'ending',startMeasureIndex:1,endMeasureIndex:2,label:'1.'},{type:'ending',startMeasureIndex:2,endMeasureIndex:3,label:'2.'}]},measureStartAbsoluteTick:i=>i*16,window:{CrescendoPerformancePlan:Plan},playbackMsForTick:t=>t*125,MidiPlayback:{tickForMs:ms=>ms/125},EPSILON:.0001};
 vm.createContext(c);vm.runInContext(source.slice(start,end),c);const plan=c.buildPlaybackPerformancePlan([],[]);assert.deepEqual([...plan.visits].map(v=>v.bar),[0,1,0,2]);
});

test('MIDI exports pan CC10 on the correct channel with exact left, center and right positions',()=>{
 const file=decode(M.serialize({parts:[-1,0,1,.5,-.5,undefined,'bad',5].map((pan,i)=>({...part(i),pan})),events:[]}));
 assert.deepEqual(file.tracks.slice(1).map((track,i)=>{const event=track.find(e=>e.status===(0xb0|i)&&e.data[0]===10);assert.equal(event.tick,0);return event.data[1];}),[0,64,127,96,32,64,64,127]);
});
