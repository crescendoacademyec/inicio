/* Recorridos, identificadores estables y evidencias de aprendizaje. */
(function(global){
  'use strict';
  var explanations=[
    [
      'Dm7 apila Re–Fa–La–Do: fundamental, tercera menor, quinta y séptima menor.',
      'En una escala mayor, las terceras del quinto grado producen 1–3–5–♭7: séptima dominante.',
      'El séptimo grado mayor produce 1–♭3–♭5–♭7: semidisminuido, no séptima disminuida.',
      'En Fa mayor, el quinto grado es Do. Do–Mi–Sol–Si♭ forma C7.',
      'Re→Sol y Sol→Do equivalen a quintas descendentes o cuartas ascendentes; el registro puede cambiar.',
      'Tercera y séptima distinguen muchas calidades y facilitan el enlace. El bajo u otra voz puede aportar la fundamental.',
      'La barra indica el bajo: C7 conserva Do–Mi–Sol–Si♭ y coloca Mi como nota más grave.',
      'La 11 natural sobre Imaj7 puede rozar con su tercera. Es una pauta de realización, no una prohibición de usarla.',
      'm7♭5 contiene tercera menor, quinta disminuida y séptima menor. Con ♭♭7 sería disminuido completo.',
      'Sus4 sustituye la tercera por la cuarta; sin tercera no define por sí solo mayor o menor.',
      'La sexta se añade a la tríada: 1–3–5–6. La tercera decide si el acorde es mayor o menor.',
      'Sobre Re, las terceras diatónicas de Do mayor son Re–Fa–La–Do: Dm7.',
      'Las notas de Do mayor desde Re forman Re dórico. Reconocer esa colección no cambia automáticamente la tónica global de la pieza.',
      'Un lead sheet ofrece melodía y acordes; el intérprete decide el acompañamiento y la disposición.',
      'Se vuelve al signo, se continúa hasta la indicación de salto y entonces se pasa a la coda.',
      'Head in, solos y head out es una organización frecuente; cada interpretación puede acordar otra forma.',
      'V7 reúne sensible y séptima, cuya resolución puede dirigir hacia la tónica.',
      'iii puede prolongar o sustituir una función tónica en este modelo. Su función concreta depende de la frase y la melodía.',
      'El ritmo armónico mide la duración y ubicación de los cambios, aunque el tempo de la música no cambie.',
      'Las notas largas y acentuadas necesitan un soporte vertical deliberado y ayudan a escoger sustituciones.'
    ],
    [
      'En Do menor: Re–Fa–La♭–Do, Sol–Si–Re–Fa–La♭ y Do menor. El Si natural fortalece el dominante.',
      'Un dominante aplicado prepara un grado distinto de la tónica global; no obliga a modular.',
      'La7 contiene Do♯, sensible temporal hacia Re. Por eso A7 puede preparar Dm7 como V/ii.',
      'Dos fundamentales a seis semitonos generan dominantes con el mismo tritono enarmónico.',
      'Sol y Re♭ están a tritono. G7 y Db7 comparten Si/Do♭ y Fa con otra escritura.',
      'El cuarto modo de la mayor eleva la cuarta respecto a la mayor paralela: lidio, con ♯11.',
      'Mixolidio contiene tercera mayor y séptima menor. Otras escalas pueden servir según las alteraciones y el destino.',
      'El blues estándar tiene doce compases, aunque también existen blues de otras extensiones.',
      'En la variante jazz de doce compases, los compases 9–10 pueden preparar la tónica con ii–V. No es obligatorio en todos los blues.',
      'Elevar el séptimo grado crea la sensible: en Do menor, Si natural permite G7.',
      'En G7: Si y Fa. En Db7: Fa y Do♭; Si y Do♭ son equivalentes en temperamento igual.',
      'Do→Fa→Si♭ son quintas descendentes; el mismo destino puede realizarse como cuarta ascendente.',
      'La menor melódica ascendente tiene sexta mayor: en Do, Fa–La–Do–Mi♭ produce F7.',
      'En Do menor melódica, vi es Am7♭5 y vii es Bm7♭5; comprueba apilando terceras.',
      'Do♯–Mi–Sol–Si♭ son las notas de A7(♭9) sin La. Ese análisis tiene sentido aquí porque resuelve hacia Dm.',
      'V→vi evita la tónica esperada y prolonga la frase; la cadencia requiere considerar el cierre musical.',
      '9 y ♭13 son una posibilidad hacia menor. ♭9 o ♯9 también pueden justificarse por melodía, función y resolución.',
      'El cuarto modo de menor melódica contiene 3, ♯11 y ♭7: lidio dominante.',
      'Mayor armónica rebaja el sexto grado de la mayor, manteniendo tercera y sensible mayores.'
    ],
    [
      'El intercambio toma material de escalas con la misma tónica; la tonalidad global puede conservarse.',
      'Fm7 contiene La♭, nota del menor paralelo de Do. La melodía y la conducción deciden su utilidad.',
      'La colección alterada ofrece ♭9, ♯9, ♯11/♭5 y ♭13/♯5. Un voicing no necesita incluirlas todas a la vez.',
      'A7 es V/ii: Do♯ resuelve a Re. El turnaround continúa hacia G7 y vuelve a Do.',
      'La forma AABA habitual reúne cuatro secciones de ocho compases. Existen variantes que deben comprobarse en el chart.',
      'El puente habitual enlaza III7–VI7–II7–V7: cada dominante prepara el siguiente por quinta.',
      'La disminuida tono–semitono contiene la estructura 1–♭3–♭5–♭♭7; no se confunde con la forma semitono–tono del dominante.',
      'La alterada es el séptimo modo de menor melódica y conserva tercera y séptima del dominante mediante reescritura enarmónica.',
      'Am7 comparte Do–Mi–Sol con Cmaj7. La sustitución depende de la melodía y la función en esa frase.',
      'Los acordes cromáticos de paso conectan apoyos mediante voces dirigidas, no por añadir notas externas al azar.',
      'Tonos enteros contiene 3, ♯4 y ♯5; puede colorear un dominante aumentado. Comprueba la quinta y las tensiones del símbolo.',
      'Mi♭7 puede ser subV de La7 y preparar Dm7; la etiqueta cromática no reemplaza el análisis de su destino.',
      '3–5–7–9 es una convención A de acorde aislado. El módulo Baga distingue su propia nomenclatura por progresión.',
      'La identidad del cliché está en la voz cromática que puede seguirse mientras las demás cambian poco.',
      'Tres terceras mayores suman doce semitonos y dividen la octava en tres centros equivalentes.',
      'En un conjunto con bajista, este puede aportar la fundamental. En piano solo también puede tocarse por separado.',
      'La modulación directa cambia de centro sin un acorde pivote; una frase posterior confirma el nuevo centro.',
      'Constant structure conserva la calidad o estructura interna. Las distancias entre fundamentales no tienen que ser simétricas.',
      'Cambiar de escala sobre el mismo acorde modifica las tensiones elegidas; no altera automáticamente la función.',
      'La misma nota puede ser parte estructural o tensión de varios acordes. Después se comprueban bajo, función y conducción.'
    ],
    [
      'La construcción cuartal apila cuartas; su contexto y bajo determinan el color y el análisis.',
      'McCoy Tyner es una referencia del lenguaje cuartal. Escucha cómo combina registro, ritmo y pedales.',
      'La–Do♯–Mi respecto a Sol son 9–♯11–13. Re–Fa♯–La daría 5–7 mayor–9 y no esas tensiones.',
      'En una progresión no funcional pueden predominar color y conducción sin un ciclo dominante–tónica tradicional.',
      'El pandiatonicismo mantiene una colección diatónica, pero permite disposiciones y combinaciones libres.',
      'Lidio dominante es IV y alterada es VII de la menor melódica; comparten escala madre, no la misma tónica modal.',
      'Lidio dominante contiene 1–2–3–♯4–5–6–♭7 y puede aportar ♯11 al dominante.',
      'Un contrafact escribe otra melodía sobre una progresión existente. Se debe conservar y reconocer su forma.',
      'Se cuenta desde la voz superior de una posición cerrada y se baja la segunda voz una octava.',
      'Muchas inversiones Drop 2 se adaptan a cuatro cuerdas. La comodidad concreta depende del registro y de la digitación.',
      'Drop 2&4 baja dos voces numeradas desde arriba, conservando las clases de altura del acorde.',
      'La melodía se mantiene arriba; la voz que se desplaza es la segunda desde arriba, no la propia melodía.',
      'Una disposición demasiado grave puede perder definición. Abre los intervalos o cambia el registro según el timbre.',
      'El acompañamiento debe escuchar y dejar espacio al solista. La densidad depende de la frase y del conjunto.',
      'En un poliacorde se superponen dos estructuras completas; una inversión solo cambia la nota de bajo.',
      'Repetir y variar un motivo conserva identidad mientras produce continuidad y contraste.',
      'El tercer modo de menor melódica es lidio aumentado: contiene ♯4 y ♯5.',
      'Prolongar un centro modal permite explorar su color. No equivale simplemente a asignar un modo a cada acorde de paso.',
      'El pedal de dominante sostiene el quinto grado mientras cambian elementos de la armonía superior.',
      'Primero se fija un eje y se refleja cada clase de altura; después se reordena el registro y se analiza el resultado.',
      'I7 en blues puede funcionar como tónica estilística aunque su calidad sea dominante. No es siempre V/IV.',
      'En C/D, Re es ajeno a la tríada Do–Mi–Sol. En D7/F♯, Fa♯ sí pertenece a D7 y crea una inversión.',
      'Un triad pair usa dos tríadas sin notas comunes para organizar seis sonidos; la escala y el acorde dan contexto.',
      'Un ostinato repite una figura completa; un pedal mantiene o reitera una altura como ancla.'
    ],
    [
      'La pentatónica menor usa tercera y séptima menores; no contiene todos los grados de la escala menor.',
      'La ♯4/♭5 crea la blue note entre cuarta y quinta; su articulación y resolución forman parte del lenguaje.',
      'Mi, Sol y Si son 9, 11 y 13 de Re; La y Re también pertenecen a esa pentatónica.',
      'Acentuar o sentir 2 y 4 ayuda al impulso del swing; el fraseo no se reduce a acentuar siempre esos pulsos.',
      'Una anticipación llega antes del punto métrico esperado y necesita mantener claro el pulso.',
      'Una sola altura permite concentrarse en subdivisión, duración, silencios y colocación antes de añadir armonía.',
      'La séptima mayor cromática se añade a mixolidio y puede conectar ♭7 con la fundamental.',
      'La nota entre quinta y sexta convierte esta variante bebop mayor en una colección de ocho sonidos.',
      'Menor 6 pentatónica contiene 1–2–♭3–5–6. Su sexta es mayor; no es la pentatónica menor habitual.',
      'El enclosure aproxima la nota objetivo desde sus lados; su eficacia se oye en la resolución.',
      'Elegir una llegada clara permite organizar las notas cromáticas como aproximaciones y no como material aleatorio.',
      'La tercera y la séptima permiten reconocer la cualidad y seguir la dirección entre acordes.',
      'Fa es la séptima de G7 y desciende a Mi, tercera de Cmaj7.',
      'Las notas guía conectadas describen la armonía aun con pocas notas, si el pulso y las llegadas son claros.',
      'Una secuencia conserva una idea y la desplaza; el oyente puede reconocer su parentesco.',
      'Una permutación cambia el orden de un material ya elegido, conservando sus notas.',
      'Presentar, variar y responder crea relación entre frases. No hace falta cambiar de idea en cada pulso.',
      'Antes de superponer recursos, reconoce función, fundamentales y forma del ii–V–I.',
      'VI7 prepara ii como dominante aplicado; en Do, A7 contiene Do♯ y conduce a Dm7.',
      'La continuidad melódica conecta objetivos entre los cambios; no exige detener una escala y comenzar otra en cada acorde.',
      'Dos tríadas complementarias ofrecen un vocabulario de seis sonidos y contornos reconocibles.',
      'El regreso deliberado a una nota objetivo permite oír el contraste outside dentro de la forma.',
      'Cada músico debe conservar y contar la forma para responder después de cuatro compases.',
      'Transponer tonos enteros por un tono repite la colección. Un semitono produce la otra colección.',
      'Sin claridad rítmica y una llegada, sumar alteraciones no crea por sí solo una frase convincente.',
      'La forma organiza dónde estás; las fundamentales permiten seguir los cambios antes de ornamentarlos.',
      'Nombrar un concepto no garantiza reconocerlo o aplicarlo. Estas habilidades requieren evidencia práctica aparte del cuestionario.',
      'ivm7–♭VII7–Imaj7 es una forma habitual de backdoor; su color y conducción difieren de V7–I.',
      'El cuarto pulso puede aproximarse al acorde siguiente por grado o cromatismo. La llegada da sentido a la aproximación.',
      'Las notas guía en puntos estructurales pueden hacer audible la armonía. El contexto rítmico permite otras soluciones.',
      'Una nota cromática cobra dirección cuando alcanza un objetivo reconocible y conserva el pulso.'
    ]
  ];
  var prefixes=[
    ['1.1','1.2','1.2','1.3','1.3','1.5','1.6','1.4','1.1','1.1','1.1','1.2','1.7','1.8','1.8','1.8','1.9','1.9','1.9b','1.9c'],
    ['2.2','2.3','2.3','2.4','2.4','2.5','2.5','2.6','2.6','2.1','2.4','2.7','2.8','2.8','2.9','2.10','2.3','2.10b','2.10c'],
    ['3.1','3.1','3.2','3.4','3.5','3.5','3.6','3.6','3.3','3.3','3.6','3.4','3.7','3.8','3.9','3.7','3.11','3.10','3.11b','3.11c'],
    ['4.1','4.1','4.2','4.3','4.3','4.4','4.4','4.5','4.6','4.6','4.6','4.6','4.6','4.6','4.2','4.5','4.4','4.7','4.8','4.9','4.10','4.11','4.12b','4.12c'],
    ['5.1','5.1','5.1','5.2','5.2','5.2','5.3','5.3','5.1','5.3','5.3','5.4','5.4','5.4','5.5','5.5','5.5','5.6','5.6','5.6','5.7','5.7','5.9','5.10','5.7','5.8','5.8','5.8','5.11','5.11','5.11']
  ];
  function id(level,topic){return topic.id || level.slug+'-'+(topic.curriculumRole||topic.title.split(' ')[0]);}
  function stage(level,topic){
    if(topic.curriculumRole)return 0;
    var prefix=id(level,topic).slice(level.slug.length+1);
    if(level.id===1)return 1;
    if(level.id===2)return ['2.1','2.2','2.6','2.10'].includes(prefix)?1:2;
    if(level.id===3)return ['3.1','3.3','3.4','3.5','3.7','3.8','3.11','3.11c','3.13'].includes(prefix)?2:3;
    if(level.id===4)return 3;
    return ['5.2','5.4','5.5','5.6','5.8','5.9','5.11'].includes(prefix)?1:prefix==='5.7'||prefix==='5.10'?3:2;
  }
  function routeStage(route){return route==='essential'?1:route==='expanded'?2:3;}
  function indices(level,route){
    var max=routeStage(route);
    if(!level.topics.some(function(t){return !t.curriculumRole&&stage(level,t)<=max;}))return [];
    return level.topics.map(function(t,i){return stage(level,t)<=max?i:-1;}).filter(function(i){return i>=0;});
  }
  function questions(level,route){var visible=new Set(indices(level,route).map(function(i){return id(level,level.topics[i]);}));return level.quiz.filter(function(q){return visible.has(q.studyTopicId);});}
  LEVELS.forEach(function(level,index){
    level.topics.forEach(function(topic){topic.id=id(level,topic);});
    level.quiz.forEach(function(question,q){question.explanation=explanations[index][q];question.studyTopicId=level.slug+'-'+prefixes[index][q];});
  });
  function migrate(saved){
    saved=saved&&typeof saved==='object'?saved:{};
    var levelIndex=Number.isInteger(saved.levelIndex)&&saved.levelIndex>=0&&saved.levelIndex<LEVELS.length?saved.levelIndex:0, level=LEVELS[levelIndex], shift=Number(saved.curriculumVersion||1)<2?1:0;
    function keys(value){
      var out={};if(!value||typeof value!=='object'||Array.isArray(value))return out;
      Object.keys(value).forEach(function(key){var match=/^(n[1-5])-(\d+)$/.exec(key);if(Number(saved.curriculumVersion||1)<3&&match){var target=LEVELS.find(function(l){return l.slug===match[1];}),topic=target.topics[Number(match[2])+shift];if(topic)out[id(target,topic)]=value[key];}else out[key]=value[key];});return out;
    }
    var topicIndex=Number.isInteger(saved.topicIndex)?saved.topicIndex+shift:0;
    if(saved.topicId){var found=level.topics.findIndex(function(t){return id(level,t)===saved.topicId;});if(found>=0)topicIndex=found;}
    topicIndex=Math.max(0,Math.min(level.topics.length-1,topicIndex));
    return Object.assign({},saved,{levelIndex:levelIndex,topicIndex:topicIndex,topicId:id(level,level.topics[topicIndex]),curriculumVersion:3,route:['essential','expanded','complete'].includes(saved.route)?saved.route:'complete',studiedTopics:keys(saved.studiedTopics),practiceChecks:keys(saved.practiceChecks),studyDates:keys(saved.studyDates)});
  }
  function task(prompt,fields,explanation){return {prompt:prompt,fields:fields,explanation:explanation};}
  var TASKS={
    'n1-1.3':task('Construye ii–V–I en Fa mayor.',[['ii',['Gm7','G7'],'Gm7'],['V',['C7','Cm7'],'C7'],['I',['Fmaj7','Fm7'],'Fmaj7']],'Fa mayor contiene Si♭: Gm7 prepara C7 y Fmaj7 es la llegada.'),
    'n1-1.5':task('Completa ambas voces de Dm7–G7–Cmaj7 sin cambiar su octava.',[['Do4 →',['Si3 → Si3','Si4 → Si4'],'Si3 → Si3'],['Fa4 →',['Fa4 → Mi4','Mi4 → Fa4'],'Fa4 → Mi4']],'Do baja un semitono y Si permanece; Fa permanece y luego baja a Mi. Registro y continuidad son parte del enlace.'),
    'n2-2.2':task('Transporta iiø–V–i de Do menor a Re menor.',[['iiø',['Em7(b5)','E7'],'Em7(b5)'],['V7(b9)',['A7(b9)','Am7'],'A7(b9)'],['i',['Dm','D'],'Dm']],'Mi–Sol–Si♭–Re prepara La7(♭9); Do♯, su tercera, asciende a Re.'),
    'n2-2.9':task('Distingue dos usos del disminuido.',[['C–C°7–C',['Nota común: C','Dominante de Re'],'Nota común: C'],['C#°7–Dm',['A7(b9) sin A','Tónica de Do'],'A7(b9) sin A']],'El primero conserva Do como ancla. El segundo contiene la sensible Do♯ y prepara Re menor.'),
    'n3-3.8':task('Identifica la voz móvil de Cm–Cm(maj7)–Cm7–Cm6.',[['Línea',['Do5–Si4–Si♭4–La4','Sol4–Sol♯4–La4–Sol♯4'],'Do5–Si4–Si♭4–La4'],['Dirección',['Descendente','Ascendente'],'Descendente']],'La fundamental duplicada en la voz superior baja cromáticamente; el Do del soporte puede mantenerse.'),
    'n3-3.10':task('Completa la división simétrica de la octava.',[['C–Eb–Gb–A',['3 semitonos; 4 partes','4 semitonos; 3 partes'],'3 semitonos; 4 partes'],['C–E–Ab',['4 semitonos; 3 partes','3 semitonos; 4 partes'],'4 semitonos; 3 partes']],'Cuatro terceras menores o tres terceras mayores completan doce semitonos. Una calidad constante también puede moverse sin esa simetría.'),
    'n3-3.11':task('En Cmaj7–Am7–D7–Gmaj7, analiza Am7 desde los dos centros.',[['En Do',['vi7','ii7'],'vi7'],['En Sol',['ii7','vi7'],'ii7']],'Am7 pertenece a ambos campos; D7 prepara Sol. Para hablar de modulación, escucha la confirmación y prolongación del nuevo centro.'),
    'n4-4.2':task('Construye las tensiones 9–♯11–13 sobre G7.',[['Tríada superior',['A–C#–E','D–F#–A'],'A–C#–E'],['Soporte guía',['B–F','Bb–F#'],'B–F']],'La, Do♯ y Mi son 9, ♯11 y 13 de Sol. Si y Fa conservan la identidad dominante.'),
    'n4-4.11':task('Construye D7/F# y comprueba su identidad.',[['Notas',['F#–A–C–D','F#–A–C–D–E'],'F#–A–C–D'],['Bajo',['Tercera de D7','Fundamental de D7'],'Tercera de D7']],'La barra cambia el bajo; no añade Mi ni convierte automáticamente el acorde en F♯m7♭5(♭13).'),
    'n4-4.9':task('Aplica el eje Do–Sol: p se refleja en 7−p módulo 12.',[['Do →',['Sol','La'],'Sol'],['G7 → clases de',['Fm6','Fm7'],'Fm6']],'Sol–Si–Re–Fa se refleja en Do–La♭–Fa–Re, que puede reordenarse como Fa–La♭–Do–Re.'),
    'n5-5.4':task('Transporta dos líneas guía de ii–V–I a Fa mayor: Gm7–C7–Fmaj7.',[['Voz desde Si♭3',['Si♭3–Si♭3–La3','Si♭3–Si3–Do4'],'Si♭3–Si♭3–La3'],['Voz desde Fa4',['Fa4–Mi4–Mi4','Fa4–Sol4–La4'],'Fa4–Mi4–Mi4']],'La tercera de Gm7 se conserva como séptima de C7 y baja a La; su séptima Fa baja a Mi y después permanece.'),
    'n5-5.11':task('Diseña una llegada de walking hacia Sol en el siguiente compás.',[['Pulso 4 de aproximación',['Fa#2','Do#2'],'Fa#2'],['Pulso 1 siguiente',['Sol2','La2'],'Sol2']],'Fa♯2 asciende por semitono a Sol2. Es una solución de aproximación; otras líneas pueden ser válidas si se justifican y se conserva el pulso.')
  };
  function gradeTask(key,answers){var t=TASKS[key];if(!t)return null;return {correct:t.fields.filter(function(f,i){return answers[i]===f[2];}).length,total:t.fields.length,explanation:t.explanation};}
  global.JazzLearning={id:id,stage:stage,indices:indices,questions:questions,migrate:migrate,tasks:TASKS,gradeTask:gradeTask};
})(window);
