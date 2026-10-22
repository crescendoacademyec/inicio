const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Pitch=require('../pitch-spelling.js'),patterns=require('../piano-chord-patterns.js');
test('fundamentals include both spellings without changing their pitch class',()=>{
 for(const [sharp,flat] of [['C#','Db'],['D#','Eb'],['F#','Gb'],['G#','Ab'],['A#','Bb']]){assert.ok(Pitch.roots.includes(sharp));assert.ok(Pitch.roots.includes(flat));assert.equal(Pitch.pc(sharp),Pitch.pc(flat));}
 assert.equal(Pitch.pc(''),-1);assert.equal(Pitch.name(3),'Eb');
});
test('Ebmaj7 spells Eb G Bb D and preserves octave at enharmonic boundaries',()=>{
 assert.deepEqual([51,55,58,62].map(midi=>Pitch.spell(midi,'Eb','maj7').name),['Eb','G','Bb','D']);
 assert.deepEqual(Pitch.spell(60,'C#','maj7'),{letter:'B',alter:1,octave:3,name:'B#',accidental:'#'});
 assert.equal(Pitch.spell(55,'D#','maj7').name,'F##');
});
test('all instrument roots retain the exact sounding MIDI when spelled',()=>{
 const natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
 for(const root of Pitch.roots)for(const interval of [0,4,7,11]){
  const midi=48+Pitch.pc(root)+interval,sp=Pitch.spell(midi,root,'maj7');assert.equal((sp.octave+1)*12+natural[sp.letter]+sp.alter,midi);
 }
});
test('piano recognition and live staff agree on Ebmaj7 with no double accidentals',()=>{
 const context=vm.createContext({window:{CrescendoChordPatterns:patterns,CrescendoPitchSpelling:Pitch},formatPc:Pitch.name,currentSignature:()=>({type:null}),NOTE_NAMES_EN:['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],currentLang:'es',currentKeyPc:null});
 vm.runInContext(fs.readFileSync('herramientas/piano-virtual/js/chords.js','utf8').split('// ---------- GRADOS')[0],context);
 vm.runInContext(fs.readFileSync('herramientas/piano-virtual/js/staff.js','utf8').split('const pianoLiveStaff=')[0],context);
 const result=vm.runInContext('(()=>{const midi=[51,55,58,62],chord=identifyChord(midi);return {root:chord.rootName,suffix:chord.suffix,notes:midi.map(n=>spellStaffMidi(n,chord).name)}})()',context);
 assert.equal(result.root,'Eb');assert.equal(result.suffix,'maj7');assert.deepEqual([...result.notes],['Eb','G','Bb','D']);
 assert.ok(patterns.every(p=>!/[∆Δ△]/.test(p.name)));
 assert.equal(vm.runInContext('fallbackStaffSpelling(63).name',context),'Eb');
});
test('published instrument pages load the shared spelling and accept flat roots',()=>{
 for(const app of ['diapason-virtual','bass-virtual','requinteando','cuerdas-frotadas']){
  const html=fs.readFileSync(`herramientas/${app}/index.html`,'utf8');assert.match(html,/shared\/pitch-spelling.js/);
  const script=app==='cuerdas-frotadas'?fs.readFileSync(`herramientas/${app}/js/app.js`,'utf8'):html;
  assert.match(script,/CrescendoPitchSpelling.roots.forEach/);assert.doesNotMatch(script,/NOTE.indexOf\(root/);
 }
});

test('maj7 remains a major chord in Roman numeral analysis',()=>{
 const context=vm.createContext({currentKeyPc:0,currentScaleMode:'major',MODE_INTERVALS:{major:[0,2,4,5,7,9,11]}});
 const source=fs.readFileSync('herramientas/piano-virtual/js/chords.js','utf8');
 vm.runInContext(source.slice(source.indexOf('const ROMAN_DEGREES'),source.indexOf('const chordDetailsPanel')),context);
 assert.equal(vm.runInContext("computeRomanNumeral(0,0,'maj7')",context),'I');
 assert.equal(vm.runInContext("computeRomanNumeral(2,0,'m7')",context),'ii');
});
