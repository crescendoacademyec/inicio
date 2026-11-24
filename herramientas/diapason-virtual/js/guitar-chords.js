/*
 * Diccionario original de posiciones para guitarra/requinto.
 * Vocabulario armónico contrastado con All the Chords (Jeffrey Kunde, 2020):
 * tríadas, suspendidos, sextas, séptimas y extensiones habituales. Las
 * formas base se transportan y verifican sin reproducir las páginas del libro.
 * Guitarra estándar y requinto estándar tienen el mismo patrón interválico
 * entre cuerdas; por eso las digitaciones son transferibles.
 */
(function(global){
  const roots={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
  const qualities={
    '':['Mayor',[0,4,7]], m:['Menor',[0,3,7]], aug:['Aumentado',[0,4,8]], dim:['Disminuido',[0,3,6]],
    sus2:['Suspendido 2',[0,2,7]], sus4:['Suspendido 4',[0,5,7]],
    '6':['Sexta',[0,4,7,9]], m6:['Menor sexta',[0,3,7,9]],
    maj7:['Séptima mayor',[0,4,7,11]], '7':['Séptima dominante',[0,4,7,10]], m7:['Menor séptima',[0,3,7,10]],
    m7b5:['Semidisminuido',[0,3,6,10]], dim7:['Disminuido séptima',[0,3,6,9]],
    '9':['Novena dominante',[0,2,4,7,10]], maj9:['Novena mayor',[0,2,4,7,11]], m9:['Novena menor',[0,2,3,7,10]]
  };
  const qualityOrder=['','m','aug','dim','sus2','sus4','6','m6','maj7','7','m7','m7b5','dim7','9','maj9','m9'];
  const tuning=[40,45,50,55,59,64]; // E A D G B E, de grave a aguda
  const pc=(n)=>((n%12)+12)%12;

  // Reviewed E/A/D movable forms; null means a muted string, never an open one.
  // Ninth voicings may omit only the fifth, retaining root, third, seventh and ninth.
  const shapes={
    '':[[0,2,2,1,0,0],[null,0,2,2,2,0],[null,null,0,2,3,2]],
    m:[[0,2,2,0,0,0],[null,0,2,2,1,0],[null,null,0,2,3,1]],
    aug:[[0,null,2,1,1,null],[null,0,3,2,2,1],[null,null,0,3,3,2]],
    dim:[[0,1,2,0,null,null],[null,0,1,2,1,null],[null,null,0,1,3,1]],
    sus2:[[null,null,2,4,5,2],[null,0,2,2,0,0],[null,null,0,2,3,0]],
    sus4:[[0,2,2,2,0,0],[null,0,2,2,3,0],[null,null,0,2,3,3]],
    '6':[[null,null,2,4,2,4],[null,0,2,2,2,2],[null,null,0,2,0,2]],
    m6:[[null,null,2,4,2,3],[null,0,2,2,1,2],[null,null,0,2,0,1]],
    maj7:[[0,null,1,1,0,null],[null,0,2,1,2,0],[null,null,0,2,2,2]],
    '7':[[0,2,0,1,0,0],[null,0,2,0,2,0],[null,null,0,2,1,2]],
    m7:[[0,2,0,0,0,0],[null,0,2,0,1,0],[null,null,0,2,1,1]],
    m7b5:[[0,null,0,0,3,3],[null,0,1,0,1,null],[null,null,0,1,1,1]],
    dim7:[[0,null,2,3,2,3],[null,0,1,2,1,2],[null,null,0,1,0,1]],
    '9':[[0,null,0,1,0,2],[null,0,-1,0,0,null],[null,null,0,-1,1,0]],
    maj9:[[0,null,1,1,0,2],[null,0,-1,1,0,null],[null,null,0,-1,2,0]],
    m9:[[0,2,0,0,0,2],[null,0,-2,0,0,null],[null,null,0,-2,1,0]]
  };
  const openForms={C:{'':[null,3,2,0,1,0],m:[null,3,1,0,1,null],maj7:[null,3,2,0,0,0],'7':[null,3,2,3,1,0]},G:{'':[3,2,0,0,0,3],'7':[3,2,0,0,0,1],maj7:[3,2,0,0,0,2]}};
  function fingering(frets){
    if(frets.length!==6||frets.some(f=>f!==null&&(!Number.isInteger(f)||f<0||f>22)))return null;
    const stopped=frets.flatMap((f,s)=>f>0?[s]:[]);
    if(!stopped.length)return {fingers:frets.map(f=>f===0?0:null),barres:[]};
    const values=stopped.map(s=>frets[s]);
    if(Math.max(...values)-Math.min(...values)>3)return null;
    const plans=[{covered:[],barre:null}];
    for(let from=0;from<6;from++)for(let to=from+1;to<6;to++){
      const fret=frets[from];if(!(fret>0)||frets[to]!==fret)continue;
      if(frets.slice(from,to+1).some(f=>f!==null&&f<fret))continue;
      plans.push({covered:stopped.filter(s=>s>=from&&s<=to&&frets[s]===fret),barre:{from,to,fret}});
    }
    plans.sort((a,b)=>(stopped.length-a.covered.length+(a.barre?1:0))-(stopped.length-b.covered.length+(b.barre?1:0)));
    for(const plan of plans){
      const groups=stopped.filter(s=>!plan.covered.includes(s)).map(s=>({fret:frets[s],strings:[s]}));
      if(plan.barre)groups.push({fret:plan.barre.fret,strings:plan.covered,barre:plan.barre});
      if(groups.length>4)continue;
      groups.sort((a,b)=>a.fret-b.fret||a.strings[0]-b.strings[0]);
      const fingers=frets.map(f=>f===0?0:null),barres=[];
      groups.forEach((g,i)=>{g.strings.forEach(s=>fingers[s]=i+1);if(g.barre)barres.push({...g.barre,finger:i+1});});
      return {fingers,barres};
    }
    return null;
  }
  function midis(entry,instrument='guitar',capo=0){
    const transposition=instrument==='requinto'?5:0;
    return entry.frets.flatMap((f,i)=>f===null?[]:[tuning[i]+transposition+f+capo]);
  }
  function validate(entry){
    const quality=qualities[entry.quality];if(!quality||roots[entry.root]===undefined||!fingering(entry.frets))return false;
    const notes=midis(entry),tones=new Set(notes.map(n=>pc(n-roots[entry.root]))),required=quality[1].filter(t=>!(quality[1].length===5&&t===7));
    return notes.length>=3&&required.every(t=>tones.has(t))&&[...tones].every(t=>quality[1].includes(t))&&pc(notes[0]-roots[entry.root])===0;
  }
  const entries=[];
  for(const [root,rootPc] of Object.entries(roots))for(const quality of qualityOrder){
    const choices=[];
    if(openForms[root]?.[quality])choices.push(openForms[root][quality]);
    shapes[quality].forEach((shape,i)=>{
      let shift=pc(rootPc-[4,9,2][i]);
      while(shape.some(f=>f!==null&&f+shift<0))shift+=12;
      for(;shift<=12;shift+=12)choices.push(shape.map(f=>f===null?null:f+shift));
    });
    const seen=new Set();
    choices.sort((a,b)=>Math.max(...a)-Math.max(...b));
    for(const frets of choices){
      const key=JSON.stringify(frets);if(seen.has(key))continue;seen.add(key);
      const entry={root,quality,name:root+quality,frets};if(!validate(entry))continue;
      const positive=frets.filter(f=>f>0),low=Math.min(...positive);
      entry.position=Math.max(...frets)<=4?1:low<=7?2:3;
      Object.assign(entry,fingering(frets),{id:`${root}-${quality||'maj'}-${seen.size}`,source:'Formas revisadas · vocabulario de All the Chords',omitted:qualities[quality][1].filter(t=>!new Set(midis(entry).map(n=>pc(n-rootPc))).has(t))});
      entries.push(entry);
    }
  }
  const api={entries,roots,qualities,qualityOrder,midis,validate,fingering};
  global.GuitarChordBank=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
