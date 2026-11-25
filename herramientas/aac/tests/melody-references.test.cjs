const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../js/melody-references.js');
const page=id=>({image:`Melodías/referencias/temas/${id}/pagina-01.jpg`});
const ref=(id,title)=>({id,title,pages:[page(id)]});
test('reference lookup handles title articles, accents and parenthetical aliases without fuzzy title collisions',()=>{
 const resolve=R.createIndex([ref('agua','Água de Beber (Water to Drink)'),ref('child','A Child Is Born'),ref('yesterday','Yesterday'),ref('yesterdays','Yesterdays')]);
 assert.equal(resolve({title:'Agua de Beber (alternate version)'}).references[0].id,'agua');
 assert.equal(resolve({title:'Child Is Born'}).references[0].id,'child');
 assert.deepEqual(resolve({title:'Yesterday'}).references.map(r=>r.id),['yesterday']);
 assert.equal(resolve({title:'Yesterday Once More'}).references.length,0);
});
test('same-title works require a composer choice while explicit composer labels disambiguate',()=>{
 const library=[{title:'Rain',composer:'Peter DeRose'},{title:'Rain',composer:'Eugene Ford'}],resolve=R.createIndex([ref('rain','Rain')],library);
 assert.equal(resolve(library[0]).ambiguous,true);
 const humpty=R.createIndex([ref('chick','Humpty Dumpty – Chick Corea'),ref('ornette','Humpty Dumpty – Ornette Coleman')]);
 assert.deepEqual(humpty({title:'Humpty Dumpty',composer:'Chick Corea'}).references.map(r=>r.id),['chick']);
 assert.deepEqual(humpty({title:'Humpty Dumpty',composer:'Ornette Coleman'}).references.map(r=>r.id),['ornette']);
});
test('reference images allow catalog subfolders and reject traversal and remote content',()=>{
 for(const p of ['Melodías/referencias/all-of-me.png',page('500-miles-high').image,'private-pilot/c-jam-blues/source.png'])assert.equal(R.safeImage(p),true);
 for(const p of ['https://example.com/image.jpg','Melodías/referencias/../secret.png','Melodías/referencias/temas/../../x.jpg','javascript:alert(1)'])assert.equal(R.safeImage(p),false);
});
test('all three view combinations remain independent and keep shared controls for analysis',()=>{
 const vm=require('node:vm'),source=fs.readFileSync(require.resolve('../js/melody.js'),'utf8'),start=source.indexOf(' function setViews('),end=source.indexOf(' launch.addEventListener(',start);
 const el=()=>({hidden:false,attrs:{},setAttribute(k,v){this.attrs[k]=v},classList:{toggle(){}}}),digital=el(),photo=el(),comparison=el(),panel=el(),workspace=el(),launch=el(),photoToggle=el(),chartToggle=el();panel.querySelector=()=>comparison;
 const palette=el(),context={document:{querySelector:()=>palette},stickyGeometry(){},panel,workspace,launch,photoToggle,chartToggle,current:{id:'song'},playing:false,stop(){},$:id=>id==='melodyDigitalView'?digital:photo};vm.createContext(context);vm.runInContext(source.slice(start,end),context);
 for(const score of [false,true])for(const image of [false,true])for(const chart of [false,true]){
  context.setViews(score,image,chart);assert.equal(digital.hidden,!score);assert.equal(photo.hidden,!image);assert.equal(workspace.hidden,!chart);assert.equal(panel.hidden,!(score||image||chart));assert.equal(comparison.hidden,!score&&!image);
  assert.equal(launch.attrs['aria-pressed'],String(score));assert.equal(photoToggle.attrs['aria-pressed'],String(image));assert.equal(chartToggle.attrs['aria-pressed'],String(chart));
  assert.equal(palette.hidden,!chart);
 }
});
test('resizing the combined views resumes playback unless the user stopped it during rendering',async()=>{
 const vm=require('node:vm'),source=fs.readFileSync(require.resolve('../js/melody.js'),'utf8'),body=source.slice(source.indexOf(' let resizeTimer='),source.indexOf(' async function init()'));
 let observer,timer,finish,resumed=0;const c={current:{},panel:{hidden:false},playing:true,playToken:0,clearTimeout(){},setTimeout(fn){timer=fn;return 1},ResizeObserver:class{constructor(fn){observer=fn}observe(){}},$:()=>({}),payload:()=>({}),display(){c.playToken++;c.playing=false;return new Promise(resolve=>{finish=resolve})},async play(){resumed++},status(){}};
 vm.createContext(c);vm.runInContext(body,c);observer([{contentRect:{width:700}}]);const rendering=timer();finish();await rendering;assert.equal(resumed,1);
 c.playing=true;observer([{contentRect:{width:900}}]);const cancelled=timer();c.playToken++;finish();await cancelled;assert.equal(resumed,1);
});
test('every matched reference in the real library resolves to existing local images',()=>{
 const app=path.resolve(__dirname,'..'),library=JSON.parse(fs.readFileSync(path.join(app,'Melodías/catalog.json'))).examples,refs=JSON.parse(fs.readFileSync(path.join(app,'Melodías/referencias/catalog.json'))).references,resolve=R.createIndex(refs,library);
 let matched=0;for(const entry of library){const result=resolve(entry);if(result.references.length)matched++;for(const ref of result.references)for(const p of ref.pages){assert.equal(R.safeImage(p.image),true);assert.equal(fs.existsSync(path.join(app,p.image)),true);}}
 assert.ok(matched>390);
});
test('startup opens the reviewed Autumn Leaves edition and saves the previous melody workspace first',async()=>{
 const vm=require('node:vm'),source=fs.readFileSync(require.resolve('../js/melody.js'),'utf8'),body=source.slice(source.indexOf(' async function openInitialMelody()'),source.indexOf(' async function init()'));
 const catalog=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../Melodías/catalog.json'))).examples,autumn=catalog.find(e=>e.id==='autumn-leaves'),calls=[],previous={document:{melody:{id:'a-felicidade',xml:'previous'}}};
 assert.equal(autumn.reviewStatus,'source-corrected');assert.equal(R.safeImage(autumn.sourceImage),true);
 const c={DEFAULT_MELODY_ID:'autumn-leaves',catalog,window:{CrescendoAACMelodyBridge:{getMelody:()=>previous.document.melody,captureWorkspace:()=>previous}},drafts:{async save(state){assert.equal(state,previous);calls.push('save')}},async activateMelody(entry){assert.equal(entry,autumn);calls.push('open')},async display(){assert.fail('A different previous melody must not be the startup theme')}};
 vm.createContext(c);vm.runInContext(body,c);await c.openInitialMelody();assert.deepEqual(calls,['save','open']);
});
