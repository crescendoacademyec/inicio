// Shared regression gate for musical tools. Bingo is intentionally excluded.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const apps=['aac','afinador','armonia-funcional','armonia-jazz','bass-virtual','chordsyncpro','cuerdas-frotadas','diapason-virtual','ear-training','editor-crescendo','folk-virtual','historia-del-jazz','metronomo','piano-virtual','produccion-musical','requinteando','speed','tabla-frecuencias','teoria-lectura-musical'];
function tests(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const target=path.join(dir,entry.name);
  return entry.isDirectory()&&!['node_modules','vendor','lib','assets','__pycache__'].includes(entry.name)?tests(target):entry.isFile()&&/\.test\.(?:cjs|mjs|js)$/.test(entry.name)?[target]:[];
});}
const files=[...apps.flatMap(app=>tests(path.join(root,'herramientas',app))),...tests(path.join(root,'shared')),...tests(__dirname)].sort();
const run=spawnSync(process.execPath,['--test',...files],{cwd:root,stdio:'inherit'});
if(run.status!==0)process.exit(run.status||1);
for(const app of apps){
  const file=path.join(root,'herramientas',app,'tests','validate.js');if(!fs.existsSync(file))continue;
  const validation=spawnSync(process.execPath,[file],{cwd:root,stdio:'inherit'});if(validation.status!==0)process.exit(validation.status||1);
}
