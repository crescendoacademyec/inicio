const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/theory-visuals.js','utf8'),context);
const notes=context.window.TheoryVisuals.symbolNotes;
test('symbol guide spells every chord tone in thirds after transposition',()=>{
 const formulas={maj7:[0,4,7,11],m7:[0,3,7,10],'7':[0,4,7,10],'m7♭5':[0,3,6,10]};
 for(let root=0;root<12;root++)for(const [suffix,intervals]of Object.entries(formulas)){
   const spelled=notes(root,suffix).split(' · ');
   assert.equal(spelled.length,4);
   spelled.forEach((note,i)=>{const letter=note[0],alter=[...note.slice(1)].reduce((n,a)=>n+(a==='♯'?1:-1),0);assert.equal((12+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[letter]+alter)%12,(root+intervals[i])%12);if(i)assert.equal(('CDEFGAB'.indexOf(letter)-'CDEFGAB'.indexOf(spelled[i-1][0])+7)%7,2);});
 }
 assert.equal(notes(0,'m7♭5'),'C · E♭ · G♭ · B♭');
 assert.equal(notes(6,'maj7'),'G♭ · B♭ · D♭ · F');
});
