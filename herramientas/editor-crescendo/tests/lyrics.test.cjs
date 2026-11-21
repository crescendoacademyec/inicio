const {test}=require('node:test'),assert=require('node:assert/strict'),L=require('../src/score-editor-lyrics.js');
test('Spanish lyrics assign one syllable per note and retain word boundaries',()=>{
 assert.deepEqual(L.syllables('Can-ta con-mi-go',1).map(s=>[s.text,s.syllabic]),[['Can','begin'],['ta','end'],['con','begin'],['mi','middle'],['go','end']]);
 assert.deepEqual(L.syllables('  Luz   y   música  ').map(s=>s.text),['Luz','y','música']);
});
test('editing one verse preserves the others and empty text removes only that verse',()=>{
 const original=[{number:1,text:'Can',syllabic:'begin'},{number:2,text:'Sol',syllabic:'single'}];
 assert.equal(L.replace(original,1,{text:'Hoy'})[1].text,'Sol');assert.deepEqual(L.replace(original,1,null).map(s=>s.number),[2]);assert.equal(original[0].text,'Can');
 assert.deepEqual(L.normalize(null),[]);
});
test('lyrics accept a selected notehead even when the input cursor is not active',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync(require('node:path').join(__dirname,'../src/app.js'),'utf8'),start=source.indexOf('  async function editNoteLyrics('),end=source.indexOf('  function renderNoteLyrics(',start);let opened=false;
 const c={state:{cursorEntryId:null,activeNoteEntryId:'selected-head',measures:[{entries:[{id:'selected-head',type:'note',tickStart:0}]}]},entryVoice:()=>1,activeVoice:()=>1,Lyrics:L,requestEditorPopup:async()=>{opened=true;return null;},showEditorMessage:()=>assert.fail('Selected note must be accepted')};vm.createContext(c);vm.runInContext(source.slice(start,end),c);await c.editNoteLyrics();assert.equal(opened,true);
});
