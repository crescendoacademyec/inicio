const {test}=require('node:test');const assert=require('node:assert/strict');
const guitar=require('../src/score-editor-guitar.js');
test('standard tuning and typed frets produce exact sounding MIDI',()=>{assert.equal(guitar.midi(6,0),40);assert.equal(guitar.midi(1,12),76);assert.equal(guitar.midi(2,1),60);for(const args of [[0,1],[7,1],[1,-1],[1,25],[1,1.5]])assert.equal(guitar.midi(...args),null);});
test('one playable fingering for a C major chord, with unique strings',()=>{const result=guitar.fingering([48,52,55,60,64]);assert.equal(result.length,5);assert.equal(new Set(result.map(p=>p.string)).size,5);result.forEach(p=>assert.equal(guitar.midi(p.string,p.fret),p.midi));});
test('chosen equivalent fingering survives rendering and ignores stale pitches',()=>{const saved=[{string:2,fret:5,midi:64}];assert.deepEqual(guitar.fingering([64],saved),saved);assert.equal(guitar.fingering([65],saved)[0].midi,65);});
test('impossible chords are not rendered with overlapping strings',()=>{assert.deepEqual(guitar.fingering([40,41]),[]);assert.deepEqual(guitar.fingering([100]),[]);});
test('bass, reentrant ukulele and violin use instrument-specific tunings',()=>{
 const bass=guitar.forInstrument('bass'),uke=guitar.forInstrument('ukulele'),violin=guitar.forInstrument('violin');
 assert.deepEqual(bass.tuning,[43,38,33,28]);assert.equal(bass.midi(4,0),28);
 assert.deepEqual(uke.tuning,[69,64,60,67]);assert.equal(uke.midi(4,0),67);assert.equal(uke.midi(3,0),60);
 assert.deepEqual(violin.tuning,[76,69,62,55]);assert.equal(violin.midi(4,0),55);assert.equal(violin.fretted,false);
 for(const id of ['bass','ukulele','violin']){const instrument=guitar.forInstrument(id);assert.equal(instrument.midi(5,0),null);const result=instrument.fingering(instrument.tuning);assert.equal(result.length,4);assert.equal(new Set(result.map(p=>p.string)).size,4);}
 assert.equal(guitar.forInstrument('piano'),null);
});
test('violin bands map to fingers and hand positions rather than frets',()=>{
 assert.deepEqual(guitar.technique(0),{finger:0,position:'aire'});
 assert.deepEqual(guitar.technique(2),{finger:1,position:'I'});
 assert.deepEqual(guitar.technique(5,'III'),{finger:1,position:'III'});
 assert.deepEqual(guitar.technique(5,'I'),{finger:3,position:'I'});
 assert.deepEqual(guitar.technique(15),{finger:4,position:'V'});
 assert.deepEqual(guitar.technique(24),{finger:null,position:'libre'});
 const violin=guitar.forInstrument('violin');const saved=[{string:3,fret:5,midi:67,finger:1,position:'III'}];
 assert.deepEqual(violin.fingering([67],saved),saved);
});
test('saved fingerings from another instrument are validated against the current tuning',()=>{
 const original=[{string:2,fret:5,midi:64}];
 const uke=guitar.forInstrument('ukulele').fingering([64],original);
 assert.notDeepEqual(uke,original);uke.forEach(p=>assert.equal(guitar.forInstrument('ukulele').midi(p.string,p.fret),64));
});
