// DOM-free CLI adapter; conversion logic is shared with the instrument applications.
const fs=require('node:fs'),reader=require('../../../shared/score-file-reader.js');
class Element {
 constructor(node){this.localName=node.tag;this.attributes=node.attrs;this.children=node.children.map(child=>new Element(child));this.textContent=node.text;}
 getAttribute(key){return this.attributes[key]??null;}
}
try{process.stdout.write(JSON.stringify(reader.convertElement(new Element(JSON.parse(fs.readFileSync(0,'utf8'))))));}
catch(error){process.stderr.write(error.message+'\n');process.exitCode=1;}
