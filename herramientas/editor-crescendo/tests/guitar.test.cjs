const {test}=require('node:test');const assert=require('node:assert/strict');
const guitar=require('../src/score-editor-guitar.js');
test('standard tuning and typed frets produce exact sounding MIDI',()=>{assert.equal(guitar.midi(6,0),40);assert.equal(guitar.midi(1,12),76);assert.equal(guitar.midi(2,1),60);for(const args of [[0,1],[7,1],[1,-1],[1,25],[1,1.5]])assert.equal(guitar.midi(...args),null);});
test('one playable fingering for a C major chord, with unique strings',()=>{const result=guitar.fingering([48,52,55,60,64]);assert.equal(result.length,5);assert.equal(new Set(result.map(p=>p.string)).size,5);result.forEach(p=>assert.equal(guitar.midi(p.string,p.fret),p.midi));});
test('chosen equivalent fingering survives rendering and ignores stale pitches',()=>{const saved=[{string:2,fret:5,midi:64}];assert.deepEqual(guitar.fingering([64],saved),saved);assert.equal(guitar.fingering([65],saved)[0].midi,65);});
test('impossible chords are not rendered with overlapping strings',()=>{assert.deepEqual(guitar.fingering([40,41]),[]);assert.deepEqual(guitar.fingering([100]),[]);});
