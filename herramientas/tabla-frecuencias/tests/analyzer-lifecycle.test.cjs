const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){
 const elements=new Map(),listeners={},documentListeners={},revoked=[],contexts=[];
 function el(id){if(!elements.has(id)){const classes=new Set(id==='viewAnalyzer'?['active']:[]),handlers={};elements.set(id,{id,handlers,style:{},value:id==='analyzerFftSelect'?'8192':'0.82',checked:false,paused:true,textContent:'',innerHTML:'',classList:{contains:x=>classes.has(x),add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)},addEventListener:(t,f)=>(handlers[t]??=[]).push(f),getBoundingClientRect:()=>({width:640,height:200,left:0,top:0}),getContext:()=>new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})}),pause(){this.paused=true;},querySelectorAll:()=>[],getAttribute:()=>null});}return elements.get(id);}
 const node=()=>({outputs:new Set(),connect(n){this.outputs.add(n);return n;},disconnect(){this.outputs.clear();}});
 class AC{constructor(){this.state='running';this.destination=node();this.sampleRate=48000;this.created=0;contexts.push(this);}createChannelSplitter(){return node();}createAnalyser(){const a=Object.assign(node(),{fftSize:8192,frequencyBinCount:4096,getByteFrequencyData(data){data.fill(0);if(this.peak)data[this.peak]=200;}});(this.analysers??=[]).push(a);this.analyser??=a;return a;}createMediaElementSource(){if(this.created++)throw Error('duplicate media source');return node();}createMediaStreamSource(){return node();}resume(){return Promise.resolve();}}
 let frame;
 let getUserMedia=()=>Promise.resolve({getTracks:()=>[],getAudioTracks:()=>[]}),getDisplayMedia=getUserMedia;
 const window={AudioContext:AC,CrescendoVisibleInstruments:[],addEventListener:(t,f)=>(listeners[t]??=[]).push(f)};
 const context={window,document:{getElementById:el,addEventListener:(t,f)=>documentListeners[t]=f},navigator:{mediaDevices:{getUserMedia:(...a)=>getUserMedia(...a),getDisplayMedia:(...a)=>getDisplayMedia(...a)}},URL:{createObjectURL:()=>Math.random().toString(),revokeObjectURL:u=>revoked.push(u)},requestAnimationFrame:f=>(frame=f,1),cancelAnimationFrame(){},console};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../analyzer.js'),'utf8'),context);documentListeners.DOMContentLoaded();
 return {el,contexts,revoked,frame:()=>frame?.(),setMic:f=>getUserMedia=f,setShare:f=>getDisplayMedia=f,emit:async(id,type,event={})=>{for(const f of el(id).handlers[type]||[])await f(event);},view:()=>{el('viewAnalyzer').classList.remove('active');for(const f of listeners['crescendo:view-change'])f({detail:{view:'chart'}});}};
}
test('multiple files reuse the media source and mic cannot inherit speaker monitoring',async()=>{const f=fixture();for(const name of ['one.wav','two.wav','three.wav'])await f.emit('analyzerFileInput','change',{target:{files:[{name}]}});assert.equal(f.contexts[0].created,1);assert.equal(f.revoked.length,2);assert.ok(f.contexts[0].analyser.outputs.size);await f.emit('analyzerMicBtn','click');assert.equal(f.contexts[0].analyser.outputs.size,0);});
test('late mic permission is discarded after leaving analyzer',async()=>{const f=fixture();let finish,stops=0;f.setMic(()=>new Promise(r=>finish=r));const pending=f.emit('analyzerMicBtn','click');f.view();finish({getTracks:()=>[{stop(){stops++;}}]});await pending;assert.equal(stops,1);assert.equal(f.contexts[0].analyser.outputs.size,0);});
test('late tab capture is discarded after leaving analyzer',async()=>{const f=fixture();let finish,stops=0;f.setShare(()=>new Promise(r=>finish=r));const pending=f.emit('analyzerShareTabBtn','click');f.view();finish({getTracks:()=>[{stop(){stops++;}}]});await pending;assert.equal(stops,1);});

test('spectrum selector reads separate channels and clears only current peak at the floor',async()=>{
 const f=fixture();await f.emit('analyzerFileInput','change',{target:{files:[{name:'stereo.wav'}]}});await f.emit('analyzerAudioEl','play');
 const ac=f.contexts[0];ac.analysers[1].peak=170;ac.analysers[2].peak=340;
 f.el('analyzerChannel').value='left';await f.emit('analyzerChannel','change');f.frame();const left=f.el('analyzerPeakNow').textContent;assert.match(left,/Hz/);const hold=f.el('analyzerPeakHold').textContent;
 ac.analysers[1].peak=0;f.frame();assert.match(f.el('analyzerPeakNow').textContent,/Sin pico detectable/);assert.equal(f.el('analyzerPeakHold').textContent,hold);
 f.el('analyzerChannel').value='right';await f.emit('analyzerChannel','change');f.frame();assert.notEqual(f.el('analyzerPeakNow').textContent,left);
 f.el('analyzerChannel').value='mono';await f.emit('analyzerChannel','change');f.frame();assert.match(f.el('analyzerPeakNow').textContent,/Sin pico detectable/);assert.match(f.el('analyzerResolution').textContent,/5.86 Hz/);
});
