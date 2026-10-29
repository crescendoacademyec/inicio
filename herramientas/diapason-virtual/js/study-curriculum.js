/* Course order follows the contents of the four user-supplied Guitarra volumes.
 * Explanations and generated exercises are original; book scores are not bundled. */
(function(root){'use strict';
const u=(id,title,goal,reference,preset)=>({id,title,goal,reference,preset});
const levels=[
 {id:1,title:'Fundamentos y mapa del diapasón',book:'Guitarra 1',units:[
 u('1-penta-minor','Pentatónica menor','Reconoce 1–♭3–4–5–♭7 y localiza la fundamental en cada uno de los cinco modelos.','pp. 4–5',{kind:'patterns',scale:'pentatonica_menor'}),
 u('1-blues-minor','Pentatónica menor blues','Compara la pentatónica con la nota de paso ♭5 y escucha su resolución.','p. 5',{kind:'patterns',scale:'blues'}),
 u('1-cycle','Ciclo de cuartas por regiones','Transporta el modelo procurando mantener la región. Alterna subir en una tonalidad y bajar en la siguiente.','p. 6',{kind:'cycles',scale:'pentatonica_menor',cycle:5}),
 u('1-motifs','Desarrollo de motivos','Transforma una célula melódica: cambia orden y ritmo sin perder su identidad.','pp. 7–8',{kind:'patterns',scale:'pentatonica_menor',pattern:'motif',rhythm:'motif'}),
 u('1-super','Superposiciones y ciclos alternativos','Escucha una pentatónica de Em sobre Dm7 y reconoce la 9 y la 13 respecto al acorde base.','p. 9',{kind:'super',rootName:'D',quality:'m7',upper:'pentaMinor',upperRoot:2,reference:'dorian'}),
 u('1-penta-major','Pentatónica mayor y blues mayor','Estudia los modelos mayores; después añade la nota de paso ♯2 desde el selector de escala.','pp. 10–11',{kind:'patterns',scale:'pentatonica_mayor'}),
 u('1-triads','Tríadas cerradas e inversiones','Compara mayor, menor, aumentada y disminuida. Identifica qué nota queda en el bajo.','pp. 12–15',{kind:'cycles',chord:'mayor|triad_s4',cycle:5}),
 u('1-blues','Blues mayor y menor','Practica la forma de doce compases; compara la progresión mayor con la menor antes de improvisar.','p. 16',{kind:'voices',progression:'blues'}),
 u('1-iivi','ii–V–I con tríadas','Enlaza Dm–G–C; busca inversiones próximas y observa las notas comunes.','p. 16',{kind:'voices',progression:'iiTriads',triadLayout:'closed'}),
 u('1-arps','Tríadas en arpegio','Recorre los modelos de las cuatro calidades de tríada; delimita una octava y comienza por la fundamental.','pp. 17–19',{kind:'patterns',arpeggio:'mayor'}),
 u('1-major','Escala mayor desde sus grados','Estudia los cinco modelos y recorre una o dos octavas desde distintos grados.','p. 20',{kind:'patterns',scale:'mayor'}),
 u('1-drop2','Tétradas Drop 2','Compara maj7, m7, 7, m7♭5, 7sus4 y 7♯5 en sus inversiones.','pp. 21–23',{kind:'extensions',quality:'maj7',family:'drop2'}),
 u('1-apply','Aplicación y repertorio','Aplica los recursos a una pieza propia o autorizada. Puedes cargar su MusicXML en el visor de la app.','pp. 24–29',{kind:'voices',progression:'iiMajor'})
 ]},
 {id:2,title:'Arpegios, modos y superposiciones',book:'Guitarra 2',units:[
 u('2-drop3','Tétradas Drop 3','Compara la apertura de Drop 3 con Drop 2 y practica los enlaces por cuartas.','pp. 5–10',{kind:'extensions',family:'drop3',quality:'maj7'}),
 u('2-arps','Tétradas en cinco modelos','Estudia cada región de maj7, m7, 7, m7♭5, 7sus4 y 7♯5, con referencia al acorde.','pp. 11–17',{kind:'patterns',arpeggio:'maj7'}),
 u('2-major-modes','Modos de la escala mayor','Relaciona cada modo con su grado y acorde. Cambiar de modo modifica la relación con la fundamental.','pp. 18–26',{kind:'cycles',scale:'dorico',cycle:5}),
 u('2-mode-color','Sonoridad y nota característica','Escucha el modo sobre un acorde base y busca la nota que define su color; activa su aro en la leyenda al explorar.','pp. 27–35',{kind:'super',scale:'dorico',quality:'m7',upper:'pentaMinor',upperRoot:2,reference:'dorian'}),
 u('2-open','Tríadas abiertas','Separa las voces y estudia las tres inversiones de cada calidad, una posición por vez.','pp. 36–38',{kind:'open',triad:'major'}),
 u('2-diatonic','Ciclos diatónicos de tríadas','Recorre segundas, terceras, cuartas, quintas, sextas y séptimas; compara disposición cerrada y abierta.','pp. 39–42',{kind:'cycles',cycleMode:'diatonic',diatonicVoices:3,triadLayout:'open',degreeCycle:2}),
 u('2-super','Superposición de tríadas','Relaciona las notas de una tríada superior con un acorde independiente y observa las tensiones resultantes.','pp. 43–45',{kind:'super',quality:'m7',upper:'minor',upperRoot:7,reference:'dorian'}),
 u('2-pairs','Pares de tríadas','Alterna Dm–Em y otros pares sobre un acorde base; compara A–B y A–B–B–A.','pp. 46–48',{kind:'pairs',quality:'m7',upper:'minor',upperRoot:0,secondUpper:'minor',secondRoot:2,reference:'dorian'}),
 u('2-apply','Aplicación y repertorio','Lleva los enlaces y pares a una pieza propia. Compara cómo cambia la función de las mismas notas con otro acorde base.','pp. 49–70',{kind:'voices',progression:'iiMajor',family:'drop3'})
 ]},
 {id:3,title:'Escalas menores, simetría y tensiones',book:'Guitarra 3',units:[
 u('3-melodic','Menor melódica y m(maj7)','Compara la escala menor melódica con el arpegio m(maj7) y transporta los modelos.','pp. 5–7',{kind:'patterns',scale:'menor_melodica'}),
 u('3-modes','Modos de menor melódica y superposición','Relaciona lidia aumentada, lidia dominante, mixolidia ♭6 y alterada con los acordes adecuados.','pp. 8–15',{kind:'pairs',scale:'lidio_dominante',quality:'dom7',upper:'dom7b5',upperRoot:0,secondUpper:'maj7b5',secondRoot:10,reference:'current'}),
 u('3-whole','Escala por tonos','Reconoce su simetría y escucha las tensiones sobre dominantes aumentados.','pp. 16–18',{kind:'patterns',scale:'por_tonos'}),
 u('3-ninth','Acordes con 9 y ♭9','Compara las tensiones con la tercera y la séptima; observa cuándo se omite la quinta.','pp. 19–23',{kind:'extensions',quality:'nine',family:'drop2'}),
 u('3-quartal','Armonía cuartal e inversiones','Apila cuartas diatónicas; distingue cuartas justas y aumentadas y compara tres o cuatro voces.','pp. 24–29',{kind:'quartal',scale:'mayor',voices:3}),
 u('3-mixed','Cuartas combinadas con Drop 2','Alterna ambos recursos dentro de un mismo ii–V–I y después en los siete grados.','pp. 25–29',{kind:'mixed',scale:'mayor',mixedProgression:'iiMajor'}),
 u('3-harmonic','Menor armónica','Compara ♭6 y 7 y reconoce el salto de segunda aumentada dentro de los modelos.','pp. 31–33',{kind:'patterns',scale:'menor_armonica'}),
 u('3-harmonic-modes','Modos de menor armónica','Relaciona los modos con su acorde y practica especialmente frigia dominante y superlocria ♭♭7.','pp. 34–35',{kind:'patterns',scale:'mixolidio_b2b6'}),
 u('3-diminished','Escala disminuida','Compara tono–semitono y semitono–tono y escucha la repetición simétrica.','pp. 36–38',{kind:'patterns',scale:'disminuida_WH'}),
 u('3-domdim','Dominante disminuida','Escucha el arpegio disminuido medio tono arriba de un dominante y reconoce sus tensiones.','pp. 39–40',{kind:'super',quality:'sevenFlat9',upper:'dim7',upperRoot:1,scale:'disminuida_HW'}),
 u('3-dim-arps','Arpegio dim7','Estudia los cuatro modelos simétricos y la escritura de la séptima disminuida.','pp. 41–42',{kind:'patterns',arpeggio:'dim7'}),
 u('3-sixths','Drop 2: dim7, 6 y m6','Compara las equivalencias de notas y el cambio de fundamental entre acordes relativos.','pp. 43–46',{kind:'extensions',quality:'m6',family:'drop2'}),
 u('3-altered','Drop 2 con quintas alteradas','Estudia m(maj7), maj7♯5, maj7♭5, m7♯5 y 7♭5 en sus inversiones.','pp. 47–52',{kind:'extensions',quality:'maj7b5',family:'drop2'}),
 u('3-tensions','Otras disposiciones con tensiones','Compara maj9, 6/9, m9 y dominantes con 9, ♭9, ♯9, 13 o ♭13, con cuatro y cinco voces.','pp. 53–58',{kind:'extensions',quality:'nineThirteen',family:'drop3'}),
 u('3-drop3','Drop 3 con tensiones','Aplica maj7♯5, 13, ♯11 y ♯9 dentro de progresiones y regiones estables.','pp. 59–62',{kind:'extensions',quality:'sevenSharp11',family:'drop3'})
 ]},
 {id:4,title:'Estructuras híbridas y lenguaje avanzado',book:'Guitarra 4',units:[
 u('4-7b5','Arpegio 7♭5','Compara el arpegio con 7 y úsalo sobre dominantes y como superposición.','pp. 5–7',{kind:'patterns',arpeggio:'dom7b5'}),
 u('4-maj7b5','Arpegio maj7♭5','Estudia sus dos modelos horizontales y la combinación con 7♭5.','pp. 8–10',{kind:'pairs',quality:'dom7',upper:'dom7b5',upperRoot:0,secondUpper:'maj7b5',secondRoot:10}),
 u('4-suspended','Estructuras 1–4–5 y 1–2–5','Compara las dos estructuras de tres notas y escucha cómo cambia su función al cambiar la fundamental.','pp. 11–15',{kind:'patterns',arpeggio:'sus145'}),
 u('4-hybrid','Acordes híbridos: tríada sobre bajo','Elige una tríada y un bajo independiente. Identifica la inversión de la tríada superior.','pp. 16–19',{kind:'hybrid',triad:'major',upperRoot:7}),
 u('4-double-drop','Drop 2&3 y doble Drop 3','Recorre los cuatro tipos de orden de voces del esquema de referencia por los grados de la escala.','p. 20',{kind:'extensions',voicingSource:'reference',referenceFamily:'drop23',degree:'all'}),
 u('4-triad-cycles','Ciclos de tríadas en menor melódica','Recorre todos los órdenes diatónicos con tríadas abiertas y cerradas; después transporta a doce tonalidades.','pp. 22–23',{kind:'cycles',cycleMode:'diatonic',scale:'menor_melodica',diatonicVoices:3,triadLayout:'open',degreeCycle:2}),
 u('4-tetrad-cycles','Ciclos de tétradas en menor melódica','Practica los siete grados con Drop 2 y distintos órdenes de recorrido.','p. 24',{kind:'cycles',cycleMode:'diatonic',scale:'menor_melodica',diatonicVoices:4,family:'drop2',degreeCycle:3}),
 u('4-creative','Arpegios creativos en menor melódica','Combina pares y motivos; crea una permutación propia en vez de repetir únicamente el ascenso de la escala.','pp. 25–27',{kind:'patterns',scale:'menor_melodica',pattern:'custom',customPattern:[0,2,1,3]}),
 u('4-major-harmonic','Mayor armónica y sus modos','Compara la mayor con ♭6 y relaciona sus grados con tríadas y tétradas.','pp. 28–31',{kind:'cycles',cycleMode:'diatonic',scale:'mayor_armonica',diatonicVoices:4,degreeCycle:1}),
 u('4-guide','Bloques libres y voz guía','Mantén una voz y mueve las otras diatónica o cromáticamente; compara el regreso al contexto tonal.','pp. 32–36',{kind:'guide',guideSource:'quartal',hold:'top',guideMotion:'chromatic'}),
 u('4-outside','Outside y estructuras visuales','Desplaza una forma por trastes o cuerdas; diferencia conservar la figura visual de conservar su estructura interválica.','pp. 37–41',{kind:'outside',outsideArticulation:'melodic',cellSize:3,shift:'strings',group:'low'}),
 u('4-cells','Células de cinco, seis y siete notas','Combina 3+2, 4+2 y 3+4; escucha el desplazamiento rítmico y termina con una resolución.','pp. 42–47',{kind:'outside',outsideArticulation:'melodic',cellSize:7,shift:'frets',rhythm:'triplets'})
 ]}
];
if(typeof module!=='undefined')module.exports=levels;else root.CrescendoStudyCurriculum=levels;
})(typeof window==='undefined'?globalThis:window);
