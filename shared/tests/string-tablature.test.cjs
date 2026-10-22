const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),Strings=require('../../herramientas/editor-crescendo/src/score-editor-guitar.js');
function fixture(){
 const created=[];
 class Node{constructor(tag){this.tag=tag;this.attrs={};this.listeners={};this.children=[];this.classList={add(){}};this.value='';}setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}appendChild(node){this.children.push(node);node.parent=this;return node;}remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);}addEventListener(k,fn){this.listeners[k]=fn;}focus(){}select(){}}
 const document={createElement:tag=>{const n=new Node(tag);created.push(n);return n;},createElementNS:(_,tag)=>{const n=new Node(tag);created.push(n);return n;}};
 const c={document,DOMPoint:class{constructor(x,y){this.x=x;this.y=y;}matrixTransform(){return this;}}};vm.createContext(c);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../string-tablature.js'),'utf8'),c);
 const svg=new Node('svg');svg.getScreenCTM=()=>({inverse(){return {};}});return {api:c.CrescendoStringTab,svg,created,event:(x,y,key)=>({clientX:x,clientY:y,key,preventDefault(){},stopPropagation(){}})};
}
test('clicking another string in a note column edits that note in place without a dialog',()=>{
 const f=fixture(),applied=[];f.api.column({svg:f.svg,x:100,y:20,instrument:Strings.forInstrument('guitar'),positions:[{string:2,fret:1,midi:60}],key:'note',onApply:(p,s,n)=>applied.push({old:p.midi,string:s,fret:n})});
 f.svg.children[0].listeners.pointerdown(f.event(100,54));
 const input=f.created.find(n=>n.tag==='input');assert.equal(input.attrs['aria-label'],'Cuerda 3: traste');input.value='10';assert.equal(applied.length,0);input.listeners.keydown(f.event(0,0,'Enter'));
 assert.deepEqual(applied,[{old:60,string:3,fret:10}]);assert.ok(!f.created.some(n=>n.tag==='dialog'));assert.equal(f.svg.children.length,1);
});
test('Escape cancels and invalid digitations stay in the same input for correction',()=>{
 const f=fixture(),calls=[];f.api.edit({svg:f.svg,x:100,y:20,instrument:Strings.forInstrument('violin'),position:{string:1,fret:0},onApply:(...args)=>calls.push(args)});
 const input=f.created.find(n=>n.tag==='input');input.value='25';input.listeners.keydown(f.event(0,0,'Enter'));assert.equal(input.attrs['aria-invalid'],'true');assert.equal(calls.length,0);input.listeners.keydown(f.event(0,0,'Escape'));assert.equal(f.svg.children.length,0);assert.equal(calls.length,0);
});
