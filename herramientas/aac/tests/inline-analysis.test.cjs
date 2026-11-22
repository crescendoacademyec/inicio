const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/app.js'),'utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert.ok(start>=0,name);let p=source.indexOf('(',start),depth=1;for(p++;depth;p++){if(source[p]==='(')depth++;if(source[p]===')')depth--;}let end=source.indexOf('{',p);depth=1;for(end++;depth;end++){if(source[end]==='{')depth++;if(source[end]==='}')depth--;}return source.slice(start,end);}
function setup(value='Fmaj7',initial='Fmaj7',extra={}){
 const classes=new Set(),writes=[],context={kind:'slot',page:0,measure:0,slot:0,field:'chord'},slot={chord:'Fmaj7',degree:'Imaj7',mode:'Jónico',originScale:'F mayor'},c={inlineContext:context,els:{inlineEditor:{value,dataset:{initialValue:initial,...extra},classList:{contains:k=>classes.has(k),add:k=>classes.add(k),remove:k=>classes.delete(k)}}},song:{pages:[{measures:[{slots:[slot]}]}]},setValueFromContext:(ctx,v)=>{writes.push({ctx,v});slot.chord=v;slot.degree='';},setDirty:()=>c.dirty=true,evaluationIssues:{clear:()=>c.cleared=true},renderAll:()=>c.rendered=true,hideDegreeSuggestionMenu(){},normalizeInlineStructureToken:v=>['|:',':|','1.'].includes(v)?v:null,maybeAutoDetectFormFromBar(){},window:{Reharmonization:{}},selected:{page:0,measure:0},selectedSlot:0,suppressNextClick:false,rhythmEditingActive:false,selectedConnector:null,showReharmonizationMenu:()=>c.menuOpened=true,showInlineEditor:()=>c.editorOpened=true};
 vm.createContext(c);for(const name of ['inlineValueHasChanges','hideInlineEditor','commitInlineChordOrStructure','shouldOpenReharmonizationMenu','handleSvgClick','handleSvgDoubleClick'])vm.runInContext(fn(name),c);return {c,writes,slot};
}
test('blur or Enter with unchanged, blank or whitespace text preserves every analysis field and dirty state',()=>{
 for(const value of ['Fmaj7','','  ','\n']){
  const t=setup(value),before=JSON.stringify(t.slot);t.c.hideInlineEditor(false);assert.equal(JSON.stringify(t.slot),before);assert.equal(t.writes.length,0);assert.equal(t.c.dirty,undefined);assert.equal(t.c.cleared,undefined);assert.equal(t.c.inlineContext,null);
  const nav=setup(value);assert.equal(nav.c.commitInlineChordOrStructure(nav.c.inlineContext,value).changed,false);assert.equal(nav.writes.length,0);
 }
});
test('a real nonempty edit is committed, cancellation is safe, and hidden answers remain protected until typed',()=>{
 const t=setup('F7');t.c.hideInlineEditor(false);assert.equal(t.writes[0].v,'F7');assert.equal(t.c.dirty,true);
 const cancel=setup('F7');cancel.c.hideInlineEditor(true);assert.equal(cancel.writes.length,0);
 const hidden=setup('','Imaj7',{suppressedHiddenAnalysisValue:'true'});hidden.c.hideInlineEditor(false);assert.equal(hidden.writes.length,0);
 const typed=setup('Imaj7','Imaj7',{suppressedHiddenAnalysisValue:'true',dirty:'true'});typed.c.hideInlineEditor(false);assert.equal(typed.writes.length,1);
 const token=setup('|:');assert.equal(token.c.commitInlineChordOrStructure(token.c.inlineContext,'|:').changed,true);assert.equal(token.c.song.pages[0].measures[0].leftBar,'|:');
});
test('single click opens chord alternatives in both modes and double click opens manual editing',()=>{
 const target={dataset:{kind:'slot',field:'chord',page:'0',measure:'0',slot:'0'}},event=detail=>({detail,target:{closest:()=>target},stopPropagation(){},preventDefault(){},clientX:100,clientY:100});
 for(const mode of ['manual','assisted']){
  const t=setup();t.c.assistanceMode=mode;assert.equal(t.c.shouldOpenReharmonizationMenu(target),true);t.c.handleSvgClick(event(1));assert.equal(t.c.menuOpened,true);assert.equal(t.c.editorOpened,undefined);t.c.handleSvgClick(event(2));assert.equal(t.c.editorOpened,undefined);t.c.handleSvgDoubleClick(event(2));assert.equal(t.c.editorOpened,true);assert.equal(t.writes.length,0);
 }
 const t=setup();assert.equal(t.c.shouldOpenReharmonizationMenu({dataset:{...target.dataset,field:'degree'}}),false);t.c.window.Reharmonization=null;assert.equal(t.c.shouldOpenReharmonizationMenu(target),false);
});
