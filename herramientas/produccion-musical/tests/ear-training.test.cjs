const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../ear-training.js'),M=require('../models.js');
test('Auditory pairs match RMS and retain peak headroom without mutating originals',()=>{const a=Float32Array.from([-.9,.5,.2,-.1]),b=Float32Array.from([-.1,.03,.2,-.4]),copy=a.slice();const pair=E.match(a,b),stats=pair.map(x=>M.statistics([x]));assert.ok(Math.abs(stats[0].rms-stats[1].rms)<1e-7);assert.ok(stats.every(s=>s.peak<=.700001));assert.deepEqual(a,copy);});
test('Cancellation remains silent and matching never introduces NaN',()=>{const [a,b]=E.match(Float32Array.from([-.2,.2]),new Float32Array(2));assert.ok(a.every(Number.isFinite));assert.ok(b.every(v=>v===0));});
test('Saturation changes shape while clean control is identical',()=>{const x=Float32Array.from([-.3,-.01,0,.01,.3]);assert.deepEqual(E.distort(x,0),x);assert.ok(E.distort(x,1)[4]<x[4]);assert.ok(Math.abs(E.distort(x,2)[4]-.055)<1e-8);assert.equal(E.distort(x,1)[2],0);});
test('All five topics have three distinct answer choices',()=>{assert.equal(Object.keys(E.topics).length,5);for(const [,options]of Object.values(E.topics)){assert.equal(new Set(options).size,3);}});
