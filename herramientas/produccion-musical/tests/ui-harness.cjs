const fs=require('node:fs'),vm=require('node:vm');
module.exports=function(){
 const elements=new Map();
 const element=id=>{if(!elements.has(id))elements.set(id,{id,value:'',innerHTML:'',textContent:'',hidden:false,open:false,dataset:{},addEventListener(){},setAttribute(){},removeAttribute(){},focus(){},scrollIntoView(){},closest(){return element(id+'-label');},querySelector(){return element(id+'-child');},querySelectorAll(){return [];}});return elements.get(id);};
 const C=require('../curriculum.js'),L=require('../learning-design.js');
 const window={addEventListener(){},dispatchEvent(){},scrollTo(){},matchMedia:()=>({matches:false})};
 const noop=()=>{},store=new Map(),context={window,document:{getElementById:element,querySelectorAll:()=>[]},location:{hash:'#ruta',origin:'http://localhost'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},CustomEvent:class{},setTimeout,clearTimeout,ProductionCurriculum:C,ProductionLearning:L,ProductionResources:require('../resources.js'),ProductionProgress:require('../progress.js'),ProductionIllustrations:require('../illustrations.js'),ProductionExtensions:{render:()=>'',bind:noop},ProductionLab:{stop:noop,show:noop},ProductionEar:{stop:noop,show:noop},ProductionTeachingLabs:{stop:noop}};
 window.ProductionVisualAtlas=require('../visual-atlas.js');
 const source=fs.readFileSync(require.resolve('../app.js'),'utf8').replace(/\}\)\(\);\s*$/, 'globalThis.harness={course,assessment,project,state,route};})();');
 vm.runInNewContext(source,context);return {...context.harness,elements,element,C,L};
};
