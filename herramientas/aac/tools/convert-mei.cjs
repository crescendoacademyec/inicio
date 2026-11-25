// DOM-free CLI adapter; conversion logic is shared with the instrument applications.
const fs=require('node:fs'),reader=require('../../../shared/score-file-reader.js');
class Element {
 constructor(node){this.localName=node.tag;this.attributes=node.attrs;this.children=node.children.map(child=>new Element(child));this.textContent=node.text;}
 getAttribute(key){return this.attributes[key]??null;}
}
function convert(input){
 if(input.validate){
  const transport=require('../js/melody-transport.js'),core=require('../js/melody-core.js');
  class Parser{parseFromString(){return {children:[new Element(input.node)]};}}
  const t=transport.parse('',{DOMParser:Parser});core.midi(t);
  if(!t.events.length||!Number.isFinite(t.duration)||t.duration<=0)throw Error('La partitura no produce una melodía reproducible.');
  return {duration:t.duration,attacks:t.events.length,visits:t.visits.length,warnings:t.warnings};
 }
 return reader.convertElement(new Element(input));
}
if(process.argv.includes('--batch')){
 const lines=require('node:readline').createInterface({input:process.stdin,crlfDelay:Infinity});
 lines.on('line',line=>{try{process.stdout.write(JSON.stringify(convert(JSON.parse(line)))+'\n');}catch(error){process.stdout.write(JSON.stringify({error:error.message})+'\n');}});
}else{
 try{process.stdout.write(JSON.stringify(convert(JSON.parse(fs.readFileSync(0,'utf8')))));}
 catch(error){process.stderr.write(error.message+'\n');process.exitCode=1;}
}
