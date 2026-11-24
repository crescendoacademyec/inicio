const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const bank=require('../js/guitar-chords.js'),ui=fs.readFileSync(path.join(__dirname,'../js/guitar-bank-ui.js'),'utf8');
function fn(name){const start=ui.indexOf('    function '+name+'(');let end=ui.indexOf('{',start),depth=1;for(end++;depth;end++){if(ui[end]==='{')depth++;if(ui[end]==='}')depth--;}return ui.slice(start,end);}
test('every chord has all identifying tones, legal four-finger coverage and no barre crossing lower sounding strings',()=>{
 for(const e of bank.entries){
  const notes=bank.midis(e),tones=new Set(notes.map(m=>(m-bank.roots[e.root]+120)%12)),required=bank.qualities[e.quality][1].filter(t=>!(t===7&&bank.qualities[e.quality][1].length===5));
  required.forEach(t=>assert.ok(tones.has(t),e.name+' misses '+t));assert.equal(notes.length,e.frets.filter(f=>f!==null).length);
  assert.ok(new Set(e.fingers.filter(f=>f>0)).size<=4);assert.ok(e.barres.length<=1);
  e.frets.forEach((f,s)=>{if(f===null)assert.equal(e.fingers[s],null);else if(f===0)assert.equal(e.fingers[s],0);else assert.ok(e.fingers[s]>=1&&e.fingers[s]<=4);});
  for(let finger=1;finger<=4;finger++){
   const strings=e.fingers.flatMap((f,s)=>f===finger?[s]:[]);if(strings.length<2)continue;
   const b=e.barres.find(b=>b.finger===finger);assert.ok(b);assert.ok(strings.every(s=>e.frets[s]===b.fret));assert.ok(e.frets.slice(b.from,b.to+1).every(f=>f===null||f>=b.fret));
  }
 }
 for(const root of Object.keys(bank.roots))for(const q of bank.qualityOrder)assert.ok(bank.entries.some(e=>e.root===root&&e.quality===q),root+q);
 assert.equal(bank.fingering([1,2,3,4,2,3]),null);assert.equal(bank.fingering([1,3,5,7,9,11]),null);
});
test('familiar C major mutes low E, retains open G/E, and never sounds a muted string',()=>{
 const e=bank.entries.find(e=>e.root==='C'&&e.quality===''&&JSON.stringify(e.frets)==='[null,3,2,0,1,0]');assert.ok(e);assert.deepEqual(bank.midis(e),[48,52,55,60,64]);assert.deepEqual(bank.midis(e,'requinto',2),[55,59,62,67,71]);
});
test('diagram marks mute/open correctly, uses assigned fingers, and selection retains open notes without selecting muted strings',()=>{
 const e={...bank.entries.find(e=>JSON.stringify(e.frets)==='[null,3,2,0,1,0]'),displayName:'C'},c={selected:null,rootSel:{},chordTypeSel:{},scaleSel:{},manualSelections:new Set(),hoverCell:null,bankSelectionActive:false,visibleFrets:12,posSel:{},refresh(){},selectedKey:(s,f)=>s+'-'+f,bank,config:{instrument:'guitar',instrumentLabel:'Guitarra',tuningLabels:['E','A','D','G','B','E']},capoSemitones:()=>0,displayNames:['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'],status:{},grid:{querySelectorAll:()=>[]}};
 vm.createContext(c);vm.runInContext(fn('diagram')+fn('applySelection'),c);const svg=c.diagram(e);assert.equal((svg.match(/>×</g)||[]).length,1);assert.equal((svg.match(/>○</g)||[]).length,2);assert.equal((svg.match(/<circle/g)||[]).length,3);assert.ok(!svg.includes('undefined'));c.applySelection(e);assert.equal(c.bankSelectionActive,true);assert.deepEqual([...c.manualSelections],['4-3','3-2','2-0','1-1','0-0']);c.applySelection(e,[2]);assert.deepEqual([...c.manualSelections],['3-2']);
});
test('all string apps omit the retired disclosure and both served fretboard copies suppress only open bank markers',()=>{
 for(const app of ['diapason-virtual','requinteando','bass-virtual','folk-virtual','cuerdas-frotadas']){const html=fs.readFileSync(path.join(__dirname,'../../',app,'index.html'),'utf8');assert.ok(!html.includes('src="../../shared/fretboard-access.js'));}
 for(const app of ['diapason-virtual','requinteando'])for(const file of ['index.html','js/fretboard.js']){const source=fs.readFileSync(path.join(__dirname,'../../',app,file),'utf8');assert.ok(source.includes('if (bankSelectionActive && displayFret===0) continue;'));assert.ok(source.includes('manualSelections.clear();bankSelectionActive=false;'));}
 assert.equal(fs.readFileSync(path.join(__dirname,'../../requinteando/js/guitar-chords.js'),'utf8'),fs.readFileSync(path.join(__dirname,'../js/guitar-chords.js'),'utf8'));
});
