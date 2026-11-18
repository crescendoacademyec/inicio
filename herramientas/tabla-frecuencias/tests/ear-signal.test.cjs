const {test}=require('node:test'),assert=require('node:assert/strict');
const {create}=require('../ear-signal.js'),D=require('../processing-dsp.js').ProcessingDSP;
function audio(){
 const sources=[];const node=()=>({gain:{value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v}},connect(){},disconnect(){},start(...args){this.started=args},stop(){this.stopped=true}});
 const ctx={sampleRate:16000,currentTime:0,createGain:node,createBuffer(c,n,sr){const data=new Float32Array(n);return {sampleRate:sr,copyToChannel(input){data.set(input)},getChannelData(){return data}}},createBufferSource(){const n=node();sources.push(n);return n}};
 return {ctx,sources,node};
}
function amplitude(data,f,sr){let re=0,im=0;for(let i=0;i<data.length;i++){const w=2*Math.PI*f*i/sr;re+=data[i]*Math.cos(w);im+=data[i]*Math.sin(w);}return Math.hypot(re,im)/data.length;}
test('audible boost/cut and gain changes rerender the same synchronized reference at its current position',()=>{
 const {ctx,sources,node}=audio();let generated=0;
 const make=(ctx,seconds)=>{generated++;const b=ctx.createBuffer(1,ctx.sampleRate*seconds,ctx.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=.1*(Math.sin(2*Math.PI*1000*i/ctx.sampleRate)+Math.sin(2*Math.PI*250*i/ctx.sampleRate));return b;};
 const p=create(ctx,node(),make,D);p.play(1000,6,true);const boost=sources[1].buffer.getChannelData(0);ctx.currentTime=1.25;p.updateGain(-6);const cut=sources[3].buffer.getChannelData(0);
 const ratio=data=>20*Math.log10(amplitude(data,1000,ctx.sampleRate)/amplitude(data,250,ctx.sampleRate));
 assert.ok(ratio(boost)>5);assert.ok(ratio(cut)<-5);assert.equal(generated,1);
 assert.deepEqual(sources[2].started,sources[3].started);assert.ok(Math.abs(sources[2].started[1]-1.25)<1e-8);
 ctx.currentTime=2;p.updateGain(-12);assert.ok(ratio(sources[5].buffer.getChannelData(0))<-10);assert.equal(generated,1);
 p.setWet(false);p.setWet(true);p.stop();assert.ok(sources.every(s=>s.stopped));
 p.play(1000,3,true);assert.equal(generated,2);assert.equal(sources.at(-1).started[1],0);
});
