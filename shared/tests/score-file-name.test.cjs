const {test}=require('node:test'),assert=require('node:assert/strict');
const File=require('../score-file-name.js'),Clipboard=require('../measure-clipboard.js');
test('export filenames retain user titles and accents, replace unsafe characters and avoid duplicate extensions',()=>{
 assert.equal(File.filename('  Mi canción.pdf  ','png'),'Mi canción.png');
 assert.equal(File.filename('Tema: uno/dos?','musicxml'),'Tema- uno-dos-.musicxml');
 assert.equal(File.filename(' . ','pdf'),'Ejercicio.pdf');
});
test('whole-measure copies remap notes, tuplets and internal ties without retaining ties to other measures',()=>{
 const original={events:[{id:'a',offset:0,beats:1/3,groupId:'triplet',tieToId:'b',stringFingerings:{guitar:[{string:2,fret:1,midi:60}]}},{id:'b',offset:1/3,beats:1/3,groupId:'triplet',tieFromId:'a',slurToId:'external'}],marks:[{id:'mark',entryId:'a',endEntryId:'b'}]};
 let n=0;const copy=Clipboard.clone(original,()=>`new-${++n}`);
 assert.notEqual(copy.events[0].id,'a');assert.equal(copy.events[0].tieToId,copy.events[1].id);assert.equal(copy.events[1].tieFromId,copy.events[0].id);
 assert.equal(copy.events[0].groupId,copy.events[1].groupId);assert.notEqual(copy.events[0].groupId,'triplet');assert.equal(copy.events[1].slurToId,undefined);
 assert.equal(copy.marks[0].entryId,copy.events[0].id);assert.deepEqual(copy.events[0].stringFingerings,original.events[0].stringFingerings);assert.equal(original.events[0].id,'a');
});
test('paste validates destination capacity, including Crescendo ticks and fractional tuplets',()=>{
 assert.equal(Clipboard.fits([{offset:3,beats:1}],4),true);assert.equal(Clipboard.fits([{offset:3,beats:1}],3),false);
 assert.equal(Clipboard.fits([{offset:2+2/3,beats:1/3}],3),true);assert.equal(Clipboard.fits([{tickStart:384,ticks:192}],768,'tickStart','ticks'),true);
});
