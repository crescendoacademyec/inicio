/* Mapa escala–acorde para la práctica de improvisación jazz. */
(function (global) {
  "use strict";
  var NAMES = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
  var SCALE = {
    ionian:[0,2,4,5,7,9,11], dorian:[0,2,3,5,7,9,10], phrygian:[0,1,3,5,7,8,10],
    lydian:[0,2,4,6,7,9,11], mixolydian:[0,2,4,5,7,9,10], aeolian:[0,2,3,5,7,8,10],
    locrian:[0,1,3,5,6,8,10], harmonicMinor:[0,2,3,5,7,8,11], melodicMinor:[0,2,3,5,7,9,11],
    altered:[0,1,3,4,6,8,10], diminishedHW:[0,1,3,4,6,7,9,10], wholeTone:[0,2,4,6,8,10]
  };
  var SCALE_NAMES = {ionian:"Jónica / mayor",dorian:"Dórica",phrygian:"Frigia",lydian:"Lidia",mixolydian:"Mixolidia",aeolian:"Eólica",locrian:"Locria",harmonicMinor:"Menor armónica",melodicMinor:"Menor melódica",altered:"Alterada",diminishedHW:"Disminuida semitono–tono",wholeTone:"Tonos enteros"};
  /* El catálogo del laboratorio visual es la fuente única de escalas y modos. */
  if (global.ChordLab && global.ChordLab.scales) Object.keys(global.ChordLab.scales).forEach(function (id) {
    SCALE[id] = global.ChordLab.scales[id].intervals.slice();
    SCALE_NAMES[id] = global.ChordLab.scales[id].label;
  });
  /* Respaldo para las pruebas y para una carga parcial; en la página se reemplaza
     por el catálogo completo del laboratorio visual. */
  Object.assign(SCALE,{harmonicMajor:[0,2,4,5,7,8,11],locrianSharp2Natural6:[0,2,3,5,6,9,10],dorianFlat2:[0,1,3,5,7,9,10],lydianFlat3:[0,2,3,6,7,9,11],mixolydianFlat2:[0,1,4,5,7,9,10],lydianSharp2:[0,3,4,6,7,9,11],superLocrianFlat7:[0,1,3,4,6,8,9],lydianAugmented:[0,2,4,6,8,9,11],lydianDominant:[0,2,4,6,7,9,10],mixolydianFlat6:[0,2,4,5,7,8,10],locrianSharp2:[0,2,3,5,6,8,10]});
  Object.assign(SCALE_NAMES,{harmonicMajor:"Mayor armónica",locrianSharp2Natural6:"Locria ♯2, 6",dorianFlat2:"Dórica ♭2",lydianFlat3:"Lidia ♭3",mixolydianFlat2:"Mixolidia ♭2",lydianSharp2:"Lidia ♯2",superLocrianFlat7:"Superlocria ♭♭7",lydianAugmented:"Lidia aumentada",lydianDominant:"Lidia dominante",mixolydianFlat6:"Mixolidia ♭6",locrianSharp2:"Locria ♯2"});
  var ROWS = [
    {id:"major", name:"Escala mayor", scale:"ionian", qualities:["maj7","m7","m7","maj7","7","m7","m7♭5"], modes:["ionian","dorian","phrygian","lydian","mixolydian","aeolian","locrian"]},
    {id:"harmonic", name:"Menor armónica", scale:"harmonicMinor", qualities:["m(maj7)","m7♭5","maj7♯5","m7","7","maj7","°7"], modes:["harmonicMinor","locrian","ionian","dorian","phrygian","lydian","diminishedHW"]},
    {id:"melodic", name:"Menor melódica", scale:"melodicMinor", qualities:["m(maj7)","m7","maj7♯5","7","7","m7♭5","m7♭5"], modes:["melodicMinor","dorian","lydianAugmented","lydianDominant","mixolydianFlat6","locrianSharp2","altered"]},
    {id:"harmonicMajor", name:"Mayor armónica", scale:"harmonicMajor", qualities:["maj7","m7♭5","m7","m(maj7)","7","maj7♯5","°7"], modes:["harmonicMajor","locrianSharp2Natural6","dorianFlat2","lydianFlat3","mixolydianFlat2","lydianSharp2","superLocrianFlat7"]}
  ];
  var INTERVALS = {"maj7":[0,4,7,11],"m7":[0,3,7,10],"7":[0,4,7,10],"m7♭5":[0,3,6,10],"m(maj7)":[0,3,7,11],"maj7♯5":[0,4,8,11],"7♯11":[0,4,7,10],"°7":[0,3,6,9]};
  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];
  function pc(n){ return ((n % 12) + 12) % 12; }
  function chordName(root, quality){ return NAMES[pc(root)] + quality; }
  function degreeCipher(row, degree, quality){
    /* El cifrado se compara contra la escala mayor paralela: ♭IIImaj7,
       V7, Imaj7… Así muestra la fórmula del campo, no solo el ordinal. */
    var reference=[0,2,4,5,7,9,11], interval=SCALE[row.scale][degree];
    if(degree>=reference.length) return "G"+(degree+1)+quality;
    var delta=pc(interval-reference[degree]), accidental=delta===11?"♭":delta===1?"♯":delta===10?"♭♭":delta===2?"♯♯":"", numeral=ROMAN[degree];
    if((quality.indexOf("m")===0 && quality.indexOf("maj")!==0) || quality.indexOf("°")===0) numeral=numeral.toLowerCase();
    return accidental+numeral+quality;
  }
  function scaleFor(row, degree){ return row.modes[degree]; }
  function scaleNotes(root, id){ return SCALE[id].map(function(i){ return pc(root + i); }); }
  function chordNotes(root, quality){ return (INTERVALS[quality] || INTERVALS["7"]).map(function(i){ return pc(root + i); }); }
  var INTERVAL_NAMES={0:"1",1:"♭2",2:"2",3:"♭3",4:"3",5:"4",6:"♭5",7:"5",8:"♭6",9:"6",10:"♭7",11:"7"};
  var TENSION_NAMES={1:"♭9",2:"9",3:"♯9",5:"11",6:"♯11",8:"♭13",9:"13"};
  function modeIntervals(scale, degree){
    var source=SCALE[scale], base=source[degree], out=[];
    for(var i=0;i<source.length;i++) out.push(pc(source[(degree+i)%source.length]-base));
    return out;
  }
  var ROW_MODE_NAMES={
    major:["Jónica / mayor","Dórica","Frigia","Lidia","Mixolidia","Eólica","Locria"],
    harmonic:["Menor armónica","Locria ♮6","Jónica ♯5","Dórica ♯4","Frigia dominante","Lidia ♯2","Superlocria ♭♭7"],
    melodic:["Menor melódica","Dórica ♭2","Lidia aumentada","Lidia dominante","Mixolidia ♭6","Locria ♯2","Alterada"],
    harmonicMajor:["Mayor armónica","Locria ♯2 ♮6","Frigia ♭4","Lidia ♭3","Mixolidia ♭2","Lidia aumentada ♯2","Superlocria ♭♭7"]
  };
  /* Las sugerencias deben partir del modo real de cada campo. Reutilizar
     una escala genérica (p. ej. Frigia para V de menor armónica) alteraba
     notas del acorde y, por tanto, también las tensiones disponibles. */
  ROWS.forEach(function(row){
    row.modes=row.modes.map(function(_, degree){
      var id="dictionary-"+row.id+"-mode-"+degree;
      SCALE[id]=modeIntervals(row.scale,degree);
      SCALE_NAMES[id]=(ROW_MODE_NAMES[row.id]||[])[degree]||row.name+" · modo "+(degree+1);
      return id;
    });
  });
  function qualityFromIntervals(intervals){
    var key=intervals.join(","), known={"0,4,7,11":"maj7","0,3,7,10":"m7","0,4,7,10":"7","0,3,6,10":"m7♭5","0,3,7,11":"m(maj7)","0,4,8,11":"maj7♯5","0,3,6,9":"°7","0,4,8,10":"7♯5","0,4,6,10":"7♯11"};
    return known[key] || "("+intervals.map(function(n){return INTERVAL_NAMES[n];}).join("–")+")";
  }
  function readableModeName(intervals, fallback){
    var match=Object.keys(SCALE).filter(function(id){
      return id.indexOf("generated-")!==0 && SCALE[id].length===intervals.length && SCALE[id].every(function(note,index){return note===intervals[index];});
    })[0];
    /* Algunas rotaciones de colecciones simétricas no tienen un nombre
       universal. Se mantiene el nombre de la colección, nunca “modo 1”. */
    return match ? SCALE_NAMES[match] : SCALE_NAMES[fallback];
  }
  function displayQuality(quality){
    /* Las fórmulas internas son necesarias para dibujar y escuchar la
       estructura; no pertenecen a la tabla resumida. */
    return quality.charAt(0)==="(" ? "" : quality;
  }
  function generatedRow(scaleId){
    var source=SCALE[scaleId], modes=[], qualities=[], chords=[];
    for(var d=0;d<source.length;d++){
      var mode=modeIntervals(scaleId,d), key="generated-"+scaleId+"-"+d;
      SCALE[key]=mode; SCALE_NAMES[key]=readableModeName(mode,scaleId);
      modes.push(key);
      var chord=[]; for(var step=0;step<4;step++) chord.push(mode[(step*2)%mode.length]);
      qualities.push(qualityFromIntervals(chord)); chords.push(chord);
    }
    return {id:"generated-"+scaleId,name:SCALE_NAMES[scaleId],scale:scaleId,qualities:qualities,modes:modes,chords:chords};
  }
  function allRows(){
    var known={}; ROWS.forEach(function(row){known[row.scale]=true;});
    return ROWS.concat(Object.keys(SCALE).filter(function(id){return !known[id]&&id.indexOf("generated-")!==0&&id.indexOf("dictionary-")!==0;}).sort(function(a,b){return SCALE_NAMES[a].localeCompare(SCALE_NAMES[b]);}).map(generatedRow));
  }
  /* Sustained chord extensions: avoid minor ninths above chord tones.
     Altered dominants admit ♭9/♯9/♭13; voice ♭13 instead of the natural fifth.
     This is a chord-scale guide, not a prohibition on melodic passing notes. */
  function tensions(notes, chord, root){
    var dominant=chord.indexOf(pc(root+4))>-1 && chord.indexOf(pc(root+10))>-1;
    return notes.filter(function(n){
      var rel=pc(n-root);
      if(chord.indexOf(n)>-1 || !TENSION_NAMES[rel])return false;
      if(dominant && [1,3,8].indexOf(rel)>-1)return true;
      return !chord.some(function(tone){return pc(n-tone)===1;});
    }).map(function(n){return TENSION_NAMES[pc(n-root)];}).filter(function(v,i,a){return a.indexOf(v)===i;});
  }
  function degreeData(row, degree, key){
    var root=pc((key||0)+SCALE[row.scale][degree]), intervals=row.chords?row.chords[degree]:INTERVALS[row.qualities[degree]], mode=scaleFor(row,degree), chord=intervals.map(function(i){return pc(root+i);}), notes=scaleNotes(root,mode);
    return {root:root,intervals:intervals,mode:mode,chord:chord,notes:notes,tensions:tensions(notes,chord,root)};
  }
  function writtenNotes(root, intervals, steps){
    if(!steps && intervals.length!==7)return intervals.map(function(i){return NAMES[pc(root+i)].replace(/♭/g,'b')+(4+Math.floor((root+i)/12));});
    var tonic=NAMES[pc(root)], letters="CDEFGAB", natural=[0,2,4,5,7,9,11], start=letters.indexOf(tonic[0]);
    return intervals.map(function(interval,i){
      var position=start+(steps?steps[i]:i), degree=position%7, octave=4+Math.floor(position/7), target=60+root+interval, delta=target-((octave+1)*12+natural[degree]);
      return letters[degree]+(delta<0?"b".repeat(-delta):"#".repeat(delta))+octave;
    });
  }
  function visual(title, root, intervals, steps, stack, context){
    if(!global.CourseExamples)return '';
    var pitches=writtenNotes(root,intervals,steps);
    return '<section class="csd-example"><h4>'+title+'</h4>'+global.CourseExamples.staff(stack?[pitches.join('+')]:pitches,{compact:true,instrumentContext:context})+'</section>';
  }
  function alternatives(quality, primary) {
    var result=[primary];
    if(quality==="maj7") result.push("lydian");
    if(quality==="m7") result.push("dorian", "aeolian");
    if(quality==="7") result.push("mixolydian", "altered", "diminishedHW");
    if(quality==="m7♭5") result.push("locrian", "locrianSharp2");
    if(quality==="7♯11") result.push("lydianDominant", "wholeTone");
    if(quality==="maj7♯5") result.push("lydianAugmented");
    if(quality==="°7") result.push("diminishedHW");
    return result.filter(function(v,i,a){return SCALE[v] && a.indexOf(v)===i;});
  }
  function mount(el) {
    if(!el) return;
    var baseIds=ROWS.map(function(row){return row.scale;}), state={key:0,rowId:"major",degree:0,alternative:0,shown:baseIds.slice(),pickerOpen:false};
    function selected(rows){var row=rows.filter(function(item){return item.id===state.rowId;})[0]||rows[0], offset=SCALE[row.scale][state.degree], root=pc(state.key+offset), quality=row.qualities[state.degree], primary=scaleFor(row,state.degree), options=alternatives(quality,primary), scale=options[state.alternative]||primary, chordIntervals=row.chords?row.chords[state.degree]:(INTERVALS[quality]||INTERVALS["7"]); return {row:row,root:root,quality:quality,primary:primary,options:options,scale:scale,chordIntervals:chordIntervals};}
    function render(){
      var rows=allRows(), visible=rows.filter(function(row){return state.shown.indexOf(row.scale)>-1;}), pick=selected(visible.length?visible:rows), notes=scaleNotes(pick.root,pick.scale), chord=pick.chordIntervals.map(function(interval){return pc(pick.root+interval);}), available=tensions(notes,chord,pick.root);
      var table='<div class="csd-table-wrap"><table class="csd-table"><tbody>';
      visible.forEach(function(row){table+='<tr><th scope="row">'+row.name+'<small>'+row.qualities.length+' grados</small></th>';row.qualities.forEach(function(q,di){var root=pc(state.key+SCALE[row.scale][di]), active=row.id===pick.row.id&&di===state.degree, quality=displayQuality(q), cipher=degreeCipher(row,di,quality), mode=SCALE_NAMES[scaleFor(row,di)], chordLabel=chordName(root,quality), summary=degreeData(row,di,state.key).tensions, tensionText=summary.length?summary.join(" · "):"—";table+='<td><button class="csd-cell '+(active?'active':'')+'" data-row="'+row.id+'" data-degree="'+di+'" aria-label="'+cipher+', '+chordLabel+', '+mode+', Tensiones: '+tensionText+'"><em class="csd-cell-copy"><span class="csd-degree">'+cipher+'</span><span class="csd-chord">'+chordLabel+'</span><span class="csd-mode">'+mode+'</span><span class="csd-cell-tensions">T: '+tensionText+'</span></em></button></td>';});table+='</tr>';});
      if(!visible.length)table+='<tr><td class="csd-empty" colspan="9">No hay escalas seleccionadas. Abre “Escalas en tabla” para elegir una o pulsa “Campos principales”.</td></tr>';
      table+='</tbody></table></div>';
      var libraryOptions=Object.keys(SCALE).filter(function(id){return id.indexOf("generated-")!==0&&id.indexOf("dictionary-")!==0;}).sort(function(a,b){return SCALE_NAMES[a].localeCompare(SCALE_NAMES[b]);});
      var visuals=visual("Acorde",pick.root,pick.chordIntervals,[0,2,4,6],true,{root:pick.root})+visual("Escala y tensiones",pick.root,SCALE[pick.scale],null,false,{root:pick.root,chordPcs:chord,tensionPcs:notes.filter(function(n){return tensions([n],chord,pick.root).length>0;})});
      el.innerHTML='<section class="csd"><header><div><p class="kicker">Mapa de improvisación</p><h3>Diccionario escala–acorde</h3><p>Selecciona una tonalidad y una celda. Las escalas sugeridas son puntos de partida: confirma siempre la melodía, función y resolución.</p></div><div class="csd-selectors"><label>Tonalidad <select data-key>'+NAMES.map(function(n,i){return '<option value="'+i+'" '+(i===state.key?'selected':'')+'>'+n+'</option>';}).join('')+'</select></label><details class="csd-scale-picker" '+(state.pickerOpen?'open':'')+'><summary>Escalas en tabla · '+visible.length+' de '+rows.length+'</summary><div><button type="button" data-show-all>Todas las escalas</button><button type="button" data-show-base>Campos principales</button><button type="button" data-show-none>Deseleccionar escalas</button><div class="csd-scale-checks">'+libraryOptions.map(function(id){return '<label><input type="checkbox" data-show-scale="'+id+'" '+(state.shown.indexOf(id)>-1?'checked':'')+'> '+SCALE_NAMES[id]+'</label>';}).join('')+'</div></div></details></div></header>'+table+'<div class="csd-detail"><div><p class="kicker">'+pick.row.name+' · grado '+(ROMAN[state.degree]||("G"+(state.degree+1)))+'</p><h3>'+chordName(pick.root,pick.quality)+'</h3><p class="csd-tones">Notas del acorde: <b>'+chord.map(function(n){return NAMES[n];}).join(' · ')+'</b></p><div class="csd-scales">'+pick.options.map(function(id,i){return '<button data-scale="'+i+'" class="'+(i===state.alternative?'active':'')+'">'+SCALE_NAMES[id]+'<small>'+scaleNotes(pick.root,id).map(function(n){return NAMES[n];}).join(' · ')+'</small></button>';}).join('')+'</div><p class="csd-tensions"><b>Tensiones disponibles:</b> '+(available.length?available.join(' · '):'No añade tensiones fuera de la estructura.')+'</p><p class="small-note">Escala activa: <b>'+SCALE_NAMES[pick.scale]+'</b>. La tabla resume el modo principal; este panel sigue la escala activa. Se omiten las notas de paso que forman una novena menor sobre el acorde, salvo alteraciones habituales de dominantes. La ♭13 en dominantes sustituye a la quinta; la 13 dórica depende de la función y la disposición de voces.</p><div class="csd-actions"><button data-play="chord">▶ Escuchar acorde</button><button data-play="scale">▶ Escuchar escala</button></div></div><div class="csd-visuals">'+visuals+'</div></div></section>';
      el.querySelector('[data-key]').onchange=function(e){state.key=Number(e.target.value);state.alternative=0;state.pickerOpen=false;render();};
      el.querySelector('[data-show-all]').onclick=function(){state.shown=rows.map(function(row){return row.scale;});state.pickerOpen=true;render();};
      el.querySelector('[data-show-base]').onclick=function(){state.shown=baseIds.slice();state.pickerOpen=true;render();};
      el.querySelector('[data-show-none]').onclick=function(){state.shown=[];state.pickerOpen=true;render();};
      el.querySelectorAll('[data-show-scale]').forEach(function(box){box.onchange=function(){var id=box.dataset.showScale;if(box.checked&&state.shown.indexOf(id)<0)state.shown.push(id);if(!box.checked)state.shown=state.shown.filter(function(item){return item!==id;});state.pickerOpen=true;render();};});
      el.querySelectorAll('[data-row]').forEach(function(btn){btn.onclick=function(){state.rowId=btn.dataset.row;state.degree=Number(btn.dataset.degree);state.alternative=0;state.pickerOpen=false;render();};});
      el.querySelectorAll('[data-scale]').forEach(function(btn){btn.onclick=function(){state.alternative=Number(btn.dataset.scale);state.pickerOpen=false;render();};});
      el.querySelectorAll('[data-play]').forEach(function(btn){btn.onclick=function(){if(!global.TheoryVisuals)return;var midi=(btn.dataset.play==='chord'?pick.chordIntervals:SCALE[pick.scale]).map(function(n){return 60+pick.root+n;});global.TheoryVisuals.playNotes(midi,{melodic:btn.dataset.play==='scale',duration:btn.dataset.play==='scale'?.3:1.3,gain:.55});};});
    }
    render();
  }
  global.ChordScaleDictionary={mount:mount,ROWS:ROWS,SCALE:SCALE,chordName:chordName,scaleNotes:scaleNotes,allRows:allRows,degreeCipher:degreeCipher,tensions:tensions,degreeData:degreeData,writtenNotes:writtenNotes,displayQuality:displayQuality};
  if(typeof module!=="undefined") module.exports=global.ChordScaleDictionary;
})(typeof window!=="undefined"?window:globalThis);
