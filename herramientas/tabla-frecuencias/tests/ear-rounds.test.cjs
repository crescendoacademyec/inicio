const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function fixture(){
 const elements=new Map(),ready=[],events={},plays=[];
 const classes=()=>({add(){},remove(){},toggle(){}});
 function element(id='',dataset={}){let html='';const e={id,dataset,style:{},classList:classes(),disabled:false,textContent:'',value:'',handlers:{},children:[],addEventListener(t,f){(this.handlers[t]??=[]).push(f)},querySelectorAll(){return this.children},closest(){return this},setAttribute(){}};
 Object.defineProperty(e,'innerHTML',{get:()=>html,set:v=>{html=v;e.textContent=v;e.children=[...v.matchAll(/<button[^>]*data-(freq|dir)="([^"]+)"[^>]*>/g)].map(m=>element('',{[m[1]]:m[2]}));}});return e;}
 const $=id=>{if(!elements.has(id))elements.set(id,element(id));return elements.get(id)};
 const window={FrequencyBackup:require('../backup-model.js'),addEventListener(t,f){(events[t]??=[]).push(f)},dispatchEvent(e){for(const f of events[e.type]||[])f(e)},EarSignal:{create(){return {play(f,g,restart){plays.push({f,g,restart})},setWet(){},updateGain(g){plays.push({g})},stop(){}}}},AudioContext:class{constructor(){this.state='running';this.destination={}}createGain(){return {gain:{value:0},connect(){}}}createOscillator(){return {frequency:{setValueAtTime(){}},connect(){},start(){},stop(){},disconnect(){}}}}};
 $('earDirOptions').innerHTML='<button data-dir="boost"></button><button data-dir="cut"></button>';
 const storage=new Map();const ctx={window,document:{getElementById:$,querySelectorAll:()=>[],addEventListener(t,f){if(t==='DOMContentLoaded')ready.push(f)}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setInterval:()=>1,clearInterval(){},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},console};
 vm.createContext(ctx);for(const file of ['data.js','ear.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx);ready.forEach(f=>f());
 return {$,plays,emit(type){window.dispatchEvent({type})},click(e){for(const f of e.handlers.click||[])f({target:e})},chip(id,dataset){const target=element('',dataset);for(const f of $(id).handlers.click||[])f({target})}};
}
for(const prefix of ['ear','earTone'])test(prefix+' replay preserves answered state, feedback and next without double scoring',()=>{
 const f=fixture();f.click(f.$(prefix+'PlayBtn'));f.click(f.$(prefix+'Options').children[0]);
 const feedback=f.$(prefix+'Feedback').textContent,score=f.$(prefix+'Score').textContent,buttons=f.$(prefix+'Options').children;
 f.click(f.$(prefix+'PlayBtn'));f.click(f.$(prefix+'PlayBtn'));
 assert.equal(f.$(prefix+'Feedback').textContent,feedback);assert.equal(f.$(prefix+'NextBtn').style.display,'');assert.ok(buttons.every(b=>b.disabled));
 f.click(buttons[0]);assert.equal(f.$(prefix+'Score').textContent,score);
 f.click(f.$(prefix+'NextBtn'));assert.equal(f.$(prefix+'NextBtn').style.display,'none');assert.ok(f.$(prefix+'Options').children.every(b=>!b.disabled));
});
test('an active noise round retains its gain when settings change and when replayed',()=>{
 const f=fixture();f.click(f.$('earPlayBtn'));const first=f.plays.at(-1);f.chip('earGainChips',{gain:'12'});f.click(f.$('earOptions').children[0]);assert.match(f.$('earFeedback').textContent,/6 dB/);
 f.click(f.$('earPlayBtn'));f.click(f.$('earPlayBtn'));assert.equal(f.plays.at(-1).g,first.g);
 f.click(f.$('earNextBtn'));assert.equal(Math.abs(f.plays.at(-1).g),12);
});
test('Direction learns cut and changes gain, while quiz feedback retains the round gain',()=>{
 const f=fixture();f.click(f.$('earDirLearnGrid').children[0]);f.click(f.$('earDirLearnCut'));assert.equal(f.plays.at(-1).g,-6);f.chip('earDirGainChips',{gain:'3'});assert.equal(f.plays.at(-1).g,-3);
 f.emit('crescendo:view-change');f.click(f.$('earDirPlayBtn'));f.chip('earDirGainChips',{gain:'12'});f.click(f.$('earDirOptions').children[0]);assert.match(f.$('earDirFeedback').textContent,/3 dB/);
 f.click(f.$('earDirPlayBtn'));f.click(f.$('earDirPlayBtn'));assert.equal(Math.abs(f.plays.at(-1).g),3);
});
