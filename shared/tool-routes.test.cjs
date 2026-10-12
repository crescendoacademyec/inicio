const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const origin='https://crescendoacademyec.github.io';
const prefix='/inicio/';
const apps=fs.readdirSync(path.join(root,'herramientas'),{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name);
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>{const p=path.join(dir,x.name);return x.isDirectory()?(['.git','vendor','node_modules','tests','server'].includes(x.name)?[]:files(p)):[p];});}
const pages=files(root).filter(p=>p.endsWith('.html')&&!p.includes(path.sep+'auditorias'+path.sep));
function baseFor(file){let page=file;if(!file.endsWith('.html')){let dir=path.dirname(file);while(dir!==root&&!fs.existsSync(path.join(dir,'index.html')))dir=path.dirname(dir);page=path.join(dir,'index.html');}
 const url=new URL(prefix+path.relative(root,page).split(path.sep).join('/'),origin);
 const html=fs.existsSync(page)?fs.readFileSync(page,'utf8'):'';
 const base=html.match(/<base\b[^>]*href=["']([^"']+)["']/i);return base?new URL(base[1],url):url;
}
function check(file,value,base,errors){if(!value||/^(?:#|data:|blob:|mailto:|tel:|javascript:)/i.test(value)||/[{}<>\\]/.test(value))return;
 let url;try{url=new URL(value.replace(/&amp;/g,'&'),base);}catch{return;}
 if(url.origin!==origin||url.pathname.startsWith('/api/'))return;
 if(!url.pathname.startsWith(prefix)){errors.push(`${path.relative(root,file)}: fuera del sitio: ${value}`);return;}
 const local=path.join(root,decodeURIComponent(url.pathname.slice(prefix.length)));
 if(!fs.existsSync(local))errors.push(`${path.relative(root,file)}: falta ${value}`);
 else if(fs.statSync(local).isDirectory()&&!fs.existsSync(path.join(local,'index.html'))&&/\/$/.test(url.pathname))errors.push(`${path.relative(root,file)}: directorio sin index: ${value}`);
}
test('all programs live only inside herramientas, with school and portal at root',()=>{
 assert.ok(fs.existsSync(path.join(root,'index.html')));assert.ok(fs.existsSync(path.join(root,'mi-crescendo/index.html')));
 for(const app of apps){assert.ok(fs.existsSync(path.join(root,'herramientas',app,'index.html')),app);assert.ok(!fs.existsSync(path.join(root,app)),`Carpeta de programa duplicada en la raíz: ${app}`);}
});
test('every local page link, image, script, stylesheet, iframe and inline CSS resolves',()=>{
 const errors=[];for(const file of pages){const html=fs.readFileSync(file,'utf8'),base=baseFor(file);for(const tag of html.matchAll(/<(?:a|link|script|img|source|video|audio|iframe|object)\b[^>]*>/gi))for(const m of tag[0].matchAll(/\b(?:href|src|poster|data)\s*=\s*["']([^"']+)["']/gi))check(file,m[1],base,errors);for(const m of html.matchAll(/url\(\s*["']?([^"')\s]+)/g))check(file,m[1],base,errors);}
 assert.deepEqual([...new Set(errors)],[]);
});
test('local CSS assets and literal application navigation resolve from their actual base',()=>{
 const errors=[];for(const file of files(root)){if(/\.min\.|\.test\.|\.spec\./.test(file)||fs.statSync(file).size>1000000)continue;const ext=path.extname(file);if(!['.css','.js','.json'].includes(ext))continue;
 const text=fs.readFileSync(file,'utf8');if(ext==='.css'){const base=new URL(prefix+path.relative(root,file).split(path.sep).join('/'),origin);for(const m of text.matchAll(/url\(\s*["']?([^"')\s]+)/g))check(file,m[1],base,errors);}
 else {const base=baseFor(file);for(const m of text.matchAll(/\b(?:href|src|url)\s*[:=]\s*["']([^"'\n]+)["']/g))check(file,m[1],base,errors);}
 }
 assert.deepEqual([...new Set(errors)],[]);
});
test('local module imports and re-exports resolve relative to their source file',()=>{
 const errors=[];for(const file of files(root)){if(!file.endsWith('.js')||/\.min\.|\.test\./.test(file)||fs.statSync(file).size>1000000)continue;
 const text=fs.readFileSync(file,'utf8'),base=new URL(prefix+path.relative(root,file).split(path.sep).join('/'),origin);
 for(const m of text.matchAll(/\b(?:from\s*|import\s*\(?\s*)["'](\.{1,2}\/[^"'\n]+)["']/g))check(file,m[1],base,errors);
 }assert.deepEqual([...new Set(errors)],[]);
});
