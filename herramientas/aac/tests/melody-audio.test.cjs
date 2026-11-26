const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../js/melody.js'),'utf8');
test('piano and guitar decode separate samples for the same concert pitch',async()=>{
 const select={value:'piano'},decoded=[],bank=type=>({C4:'data:audio/mp3;base64,'+Buffer.from(type).toString('base64')});
 const context={$:()=>select,cache:new Map(),window:{MIDI:{Soundfont:{acoustic_grand_piano:bank('piano'),acoustic_guitar_nylon:bank('guitar')}}},ctx:{decodeAudioData:async bytes=>{const value=Buffer.from(bytes).toString();decoded.push(value);return value;}},atob:data=>Buffer.from(data,'base64').toString('binary')};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf(' const soundBank='),source.indexOf(' function scheduleWindow(')),context);
 assert.equal(await context.sample(60),'piano');select.value='guitar';assert.equal(await context.sample(60),'guitar');select.value='piano';assert.equal(await context.sample(60),'piano');assert.deepEqual(decoded,['piano','guitar']);
});
test('changing timbre while samples load cannot start playback with the previous instrument',async()=>{
 let bank='acoustic_grand_piano';const pending=[],loads=[],heard=[],P=require('../js/melody-practice.js');
 const context={timeline:{duration:8,events:[{midi:60,start:0,dur:1}]},playing:false,position:0,playToken:0,loopEnabled:false,activeLoop:null,ctx:{currentTime:0,resume:async()=>{}},window:{AACMelodyPractice:P},soundBank:()=>bank,loadInstrument:name=>{loads.push(name);return new Promise(resolve=>pending.push(resolve));},sample:async(midi,name)=>name+':'+midi,scheduleWindow:(from,to,at,buffers)=>heard.push([...buffers.values()]),setInterval:()=>1,requestAnimationFrame:()=>1,playbackButton(){},status(){},update(){},now:()=>0,stop(){throw Error('Unexpected stop');},$(){return {};}};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf(' async function play(){'),source.indexOf(' async function native(')),context);
 const playback=context.play();await new Promise(setImmediate);bank='acoustic_guitar_nylon';pending.shift()();await new Promise(setImmediate);pending.shift()();await playback;
 assert.deepEqual(loads,['acoustic_grand_piano','acoustic_guitar_nylon']);assert.equal(heard.length,1);assert.equal(heard[0][0],'acoustic_guitar_nylon:60');assert.equal(context.playing,true);
});
test('instrument changes during playback keep the current time and restart scheduling',()=>{
 let listener;const calls=[],context={playing:true,position:0,now:()=>12.5,stop:reset=>calls.push(['stop',reset]),play:()=>calls.push(['play']),$:()=>({addEventListener:(event,fn)=>{assert.equal(event,'change');listener=fn;}})};
 vm.createContext(context);const line=source.split('\n').find(line=>line.includes("$('melodyInstrumentView').addEventListener"));vm.runInContext(line,context);listener();assert.equal(context.position,12.5);assert.deepEqual(calls,[['stop',false],['play']]);context.playing=false;listener();assert.equal(calls.length,2);
});
test('both bundled sample banks cover the piano register used by the guide tones',()=>{
 const context={};vm.createContext(context);
 for(const bank of ['acoustic_grand_piano','acoustic_guitar_nylon']){vm.runInContext(fs.readFileSync(require.resolve('../assets/'+bank+'.js'),'utf8'),context);const samples=context.MIDI.Soundfont[bank],names=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];for(let midi=21;midi<=108;midi++)assert.match(samples[names[midi%12]+(Math.floor(midi/12)-1)],/^data:audio\/mp3;base64,/,bank+':'+midi);}
});
