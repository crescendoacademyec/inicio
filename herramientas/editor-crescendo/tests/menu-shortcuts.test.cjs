const {test}=require('node:test'),assert=require('node:assert/strict'),S=require('../src/score-editor-menu-shortcuts.js');
function event(key,extra={}){return {key,target:{closest:()=>false},preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra};}
test('menu hints use Mac or Windows conventions and the requested bindings are distinct',()=>{
 assert.equal(S.format({key:'n',primary:true},true),'⌘N');assert.equal(S.format({key:'s',primary:true,shift:true},false),'Ctrl+Shift+S');assert.equal(S.format({key:'Escape'}),'Esc');assert.equal(S.format({key:' '}),'Espacio');
 const newProject=S.rules.find(r=>r.selector==='[data-shortcut-command="new"]'),open=S.rules.find(r=>r.selector==='[data-shortcut-command="open"]'),save=S.rules.find(r=>r.selector==='[data-shortcut-command="export"]');
 for(const primary of ['metaKey','ctrlKey']){assert.equal(S.matches(event('N',{[primary]:true}),newProject),true);assert.equal(S.matches(event('a',{[primary]:true}),open),true);assert.equal(S.matches(event('s',{[primary]:true}),save),true);assert.equal(S.matches(event('a',{[primary]:true,shiftKey:true}),open),false);}
 const chords=S.rules.map(r=>[!!r.primary,!!r.shift,!!r.alt,r.key.toLowerCase()].join(':'));assert.equal(new Set(chords).size,chords.length);
});
test('shortcuts show on the right, invoke their menu action once and preserve native text selection and modal input',()=>{
 const attrs={},control={textContent:'Abrir proyecto…',disabled:false,hints:[],clicks:0,getAttribute:key=>attrs[key],setAttribute:(key,value)=>attrs[key]=value,append(node){this.hints.push(node);},click(){this.clicks++;}},listeners={},doc={modal:false,querySelector(selector){return selector==='#open'?control:this.modal?{}:null;},createElement(){return {setAttribute(){}};},addEventListener:(key,handler)=>listeners[key]=handler,removeEventListener:key=>delete listeners[key]};
 const mounted=S.install({document:doc,mac:true,definitions:[{selector:'#open',key:'a',primary:true}]});assert.equal(attrs['aria-label'],'Abrir proyecto…');assert.equal(attrs['aria-keyshortcuts'],'Meta+a');assert.equal(control.hints[0].textContent,'⌘A');
 let e=event('a',{metaKey:true});listeners.keydown(e);assert.equal(control.clicks,1);assert.equal(e.prevented,true);assert.equal(e.stopped,true);
 listeners.keydown(event('a',{metaKey:true,repeat:true}));assert.equal(control.clicks,1);listeners.keydown(event('a',{metaKey:true,target:{closest:()=>true}}));assert.equal(control.clicks,1);
 doc.modal=true;listeners.keydown(event('a',{metaKey:true}));assert.equal(control.clicks,1);doc.modal=false;control.disabled=true;listeners.keydown(event('a',{metaKey:true}));assert.equal(control.clicks,1);mounted.destroy();assert.equal(listeners.keydown,undefined);
});
test('existing note-entry shortcuts are only annotated, and shifted digit chords use physical codes',()=>{
 let called=0,handler;const control={textContent:'Compás',getAttribute:()=>null,setAttribute(){},append(){},click(){called++;}},doc={querySelector:s=>s==='#meter'?control:null,createElement:()=>({setAttribute(){}}),addEventListener:(_,fn)=>handler=fn};S.install({document:doc,definitions:[{selector:'#meter',key:'m',shift:true,existing:true}]});handler(event('M',{shiftKey:true}));assert.equal(called,0);
 assert.equal(S.matches(event(')',{code:'Digit0',metaKey:true,shiftKey:true}),{key:'0',code:'Digit0',primary:true,shift:true}),true);
});
test('Reorganize leaves the browser reload shortcut untouched and uses its own distinct chord',()=>{
 const spec=S.rules.find(r=>r.selector.includes('#reflowButton'));
 let clicks=0,handler;const control={textContent:'Reorganizar',getAttribute:()=>null,setAttribute(){},append(){},click(){clicks++;}},doc={querySelector:s=>s===spec.selector?control:null,createElement:()=>({setAttribute(){}}),addEventListener:(_,fn)=>handler=fn};S.install({document:doc,definitions:[spec]});
 for(const primary of ['metaKey','ctrlKey']){const browserReload=event('R',{[primary]:true,shiftKey:true});handler(browserReload);assert.equal(browserReload.prevented,undefined);const reorganize=event('R',{[primary]:true,shiftKey:true,altKey:true});handler(reorganize);assert.equal(reorganize.prevented,true);}
 assert.equal(clicks,2);assert.equal(S.format(spec,true),'⌘⌥⇧R');assert.equal(S.matches(event('r',{metaKey:true,altKey:true}),spec),false);
});
