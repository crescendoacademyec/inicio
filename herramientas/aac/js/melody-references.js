/* Photo references are guides to the work, not proof of the digital edition. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AACMelodyReferences=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const normalize=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 function keys(title){
  const base=String(title||'').split(' · ')[0].replace(/\s*\((?:alternate version|piano version|version alternativa)\)\s*$/i,'');
  const labels=[base,base.replace(/\([^)]*\)/g,' '),...[...base.matchAll(/\(([^)]*)\)/g)].map(m=>m[1])];
  return [...new Set(labels.flatMap(s=>[normalize(s),normalize(s.replace(/^(?:the|an|a)\s+/i,''))]).filter(s=>s.length>2))];
 }
 function safeImage(path){return typeof path==='string'&&/^(?:private-pilot\/[a-z0-9-]+\/[a-zA-Z0-9._-]+|Melodías\/referencias\/(?:temas\/[a-z0-9-]+\/)?[a-zA-Z0-9._-]+)$/.test(path)&&!path.split('/').includes('..');}
 function createIndex(references,library=[]){
  const index=new Map(),authors=new Map();
  for(const ref of references)for(const key of new Set([ref.title,...ref.aliases||[]].flatMap(keys))){if(!index.has(key))index.set(key,[]);index.get(key).push(ref);}
  for(const entry of library)for(const key of keys(entry.title)){if(!authors.has(key))authors.set(key,new Set());if(entry.composer)authors.get(key).add(normalize(entry.composer));}
  return function resolve(edition){
   if(!edition)return {references:[],ambiguous:false};
   const titleKeys=keys(edition.title),matches=new Map(),qualified=new Map();
   if(edition.composer)for(const title of [edition.title,String(edition.title).split(' · ')[0].replace(/\([^)]*\)/g,' ')])for(const ref of index.get(normalize(title+' '+edition.composer))||[])qualified.set(ref.id,ref);
   for(const key of titleKeys)for(const ref of index.get(key)||[])matches.set(ref.id,ref);
   if(qualified.size){matches.clear();for(const [id,ref]of qualified)matches.set(id,ref);}
   const found=[...matches.values()].filter(ref=>ref.pages?.some(p=>safeImage(p.image)));
   const composers=new Set(titleKeys.flatMap(k=>[...authors.get(k)||[]]));
   return {references:found,ambiguous:found.length>1||(!qualified.size&&composers.size>1)};
  };
 }
 return {normalize,keys,safeImage,createIndex};
});
