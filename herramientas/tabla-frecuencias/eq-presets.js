// Original Crescendo teaching proposals. Concrete editable curves, not manufacturer presets.
(function(){
 'use strict';
 // [Hz, dB, Q, optional shape]. Pass filters use 12 dB/octave.
 const curves={
 voz:[[[180,-2,.707,'lowshelf'],[1100,-1.5,1.4],[10000,1,.707,'highshelf']],[[280,-2,1],[2500,2.5,.8],[12000,1.5,.707,'highshelf']]],
 piano:[[[250,-1,.7],[6500,1,.707,'highshelf']],[[80,0,.707,'highpass'],[300,-2,1],[2500,-1.5,1]]],
 'guit-ac':[[[70,0,.707,'highpass'],[280,-2.5,.9],[6500,1.5,.707,'highshelf']],[[160,1.5,.8],[900,-1,1.5],[2200,1.5,.9]]],
 'guit-el':[[[180,1.5,.8],[750,1,.9],[3500,-1.5,1.2]],[[3200,-2,1.3],[6500,-2,.707,'highshelf'],[12000,0,.707,'lowpass']]],
 bajo:[[[55,1.5,.8],[220,-2,1.1],[700,1,.9]],[[100,-1,.8],[750,2,.9],[2200,1.5,1.2]]],
 kick:[[[65,2,.9],[320,-2,1.2]],[[75,-1,.9],[350,-2,1],[2200,2.5,1]]],
 snare:[[[190,2,1],[450,-1.5,1.3],[7000,1,.707,'highshelf']],[[900,-3,4],[2800,1.5,1],[9000,-1,.707,'highshelf']]],
 toms:[[[120,1.5,1],[350,-2,1.3],[3000,1,.9]],[[140,-1,1],[450,-2.5,1.4],[4000,2,1.1]]],
 'tom-piso':[[[70,2,1],[280,-2,1.2]],[[90,-1.5,1],[350,-2,1.3],[3500,2,1]]],
 hihat:[[[250,0,.707,'highpass'],[8000,1,.707,'highshelf']],[[3500,-2.5,1.5],[9500,-1.5,.707,'highshelf']]],
 overhead:[[[300,-1,.8],[7500,1,.707,'highshelf']],[[200,0,.707,'highpass'],[4000,-2,1.2],[10000,1,.707,'highshelf']]],
 cuerdas:[[[300,-1,.7],[3000,-1,1]],[[350,-1.5,.8],[1800,1.5,.9],[4500,-1,1.4]]],
 metales:[[[350,-1,.8],[8000,-1,.707,'highshelf']],[[700,-1.5,1.3],[3000,-2.5,1.5]]],
 organo:[[[90,1,.707,'lowshelf'],[330,-1.5,1],[2500,-1,.9]],[[100,0,.707,'highpass'],[450,-2,.9],[2500,-1.5,1]]],
 congas:[[[220,1.5,1],[650,-1.5,1.4]],[[280,1,.9],[4500,-2,1.8],[8500,-1,.707,'highshelf']]],
 requinto:[[[180,1,.8],[650,-1.5,1.2],[2400,1.5,.9]],[[3200,-2,1.8],[7000,-1,.707,'highshelf']]],
 violin:[[[320,1,.9],[3200,-2,1.3],[8500,-1,.707,'highshelf']],[[400,-1,.8],[1800,1.5,.9],[4000,-1,1.5]]],
 viola:[[[220,1.5,.9],[500,-1,1.2],[3500,-1.5,1.3]],[[350,-1,.8],[1600,1.5,1],[4500,-1,1.3]]],
 cello:[[[110,1,.8],[280,-1.5,1.1],[3200,-1,1.2]],[[140,-1.5,.9],[400,-1,1.2],[1800,1.5,.9]]],
 contrabajo:[[[75,1,.9],[220,-2,1.3],[1200,1.5,1]],[[100,1,.8],[300,-1.5,1],[2600,-2,1.5]]],
 arpa:[[[180,-1,.8],[4500,1,.707,'highshelf']],[[250,-2,1],[2800,-1.5,1.2],[8000,-1,.707,'highshelf']]],
 mandolina:[[[350,1,.9],[1000,-1.5,1.2],[6000,1,.707,'highshelf']],[[600,-1,.9],[3000,-2,1.5],[9000,-1,.707,'highshelf']]],
 ukelele:[[[300,1,.8],[900,-1.5,1.2],[4500,1,.707,'highshelf']],[[500,-1,.9],[2800,-2,1.3],[7000,-1,.707,'highshelf']]],
 flauta:[[[700,1,.8],[3500,-1,1.2],[10000,1,.707,'highshelf']],[[1800,1,.9],[6000,-2,1.3],[12000,-1,.707,'highshelf']]],
 piccolo:[[[1800,-1,1],[8000,1,.707,'highshelf']],[[3500,-2,1.3],[7000,-1.5,.707,'highshelf']]],
 oboe:[[[650,1,.9],[2000,-1,1.3]],[[1700,-2,1.5],[4500,-1,.707,'highshelf']]],
 'corno-ingles':[[[350,1,.9],[3500,-1.5,1.2]],[[500,-1,.9],[1500,1.5,1],[5000,-1,.707,'highshelf']]],
 clarinete:[[[250,1.5,.9],[900,-1,1.3]],[[2000,-2,1.5],[5500,-1,.707,'highshelf']]],
 fagot:[[[140,1,.9],[350,-1.5,1.2]],[[260,-1,.9],[1400,1.5,1],[4000,-1,1.4]]],
 'saxo-soprano':[[[2500,-2,1.3],[7500,-1,.707,'highshelf']],[[700,-1,1],[1800,1.5,.9],[5000,-1.5,1.5]]],
 'saxo-alto':[[[350,1,.9],[1200,-1.5,1.3]],[[700,-1,.9],[2000,1,.9],[4500,-1.5,1.3]]],
 'saxo-tenor':[[[180,-1,.707,'lowshelf'],[450,1,.9],[3500,-1.5,1.2]],[[350,-1.5,1],[2000,1.5,.9],[6500,1,.707,'highshelf']]],
 'saxo-baritono':[[[100,1.5,.9],[300,-1.5,1.1]],[[140,-2,.9],[450,-1,1],[1500,1.5,1]]],
 trompeta:[[[800,-1,1],[2200,1,.9],[7500,-1,.707,'highshelf']],[[2500,-2.5,1.5],[5500,-1.5,.707,'highshelf']]],
 trompa:[[[180,1.5,.9],[450,-1,1.1],[5000,-1,.707,'highshelf']],[[300,-1.5,1],[1400,1.5,.9]]],
 trombon:[[[140,1.5,.9],[450,-1.5,1.2]],[[700,-1,1.2],[2600,-2.5,1.5]]],
 tuba:[[[65,1,.9],[220,-1.5,1.1]],[[120,-1,.9],[350,-2,1.2],[1000,1.5,1]]],
 soprano:[[[3200,-2,1.5],[11000,1,.707,'highshelf']],[[300,-1.5,.9],[2200,1.5,.9],[8500,-1.5,2]]],
 mezzo:[[[300,1,.9],[1100,-1.5,1.3]],[[450,-1.5,1.1],[2400,1.5,.9],[11000,1,.707,'highshelf']]],
 contralto:[[[160,-1,.707,'lowshelf'],[350,1,.9]],[[500,-1.5,1.2],[2200,1.5,.9],[9000,1,.707,'highshelf']]],
 tenor:[[[180,-1,.707,'lowshelf'],[450,1,.9]],[[1000,-1.5,1.3],[3200,-2,1.5],[10000,1,.707,'highshelf']]],
 baritono:[[[140,-1.5,.707,'lowshelf'],[350,1,.9]],[[450,-1.5,1.1],[2200,1.5,.9],[10000,1,.707,'highshelf']]],
 'bajo-vocal':[[[100,1,.9],[300,-1.5,1.1]],[[220,-1,.9],[1200,1,.9],[2800,1.5,1]]],
 marimba:[[[180,1,.9],[3500,-1.5,1.2]],[[130,-2,1.2],[500,-1,1],[2400,1,.9]]],
 vibrafono:[[[650,-1,.9],[7000,1,.707,'highshelf']],[[2800,-2,1.3],[8000,-1,.707,'highshelf']]],
 'timbal-orquestal':[[[90,1.5,1],[280,-1.5,1.2]],[[120,-1,1],[350,-2,1.2],[2200,1,.9]]],
 'clavecín':[[[300,-1,.9],[5000,1,.707,'highshelf']],[[1500,-1.5,1.1],[6000,-1.5,.707,'highshelf']]],
 bongos:[[[300,1.5,1],[800,-1.5,1.3]],[[450,1,.9],[3500,-2,1.5],[8000,-1,.707,'highshelf']]],
 shaker:[[[300,0,.707,'highpass'],[8500,1.5,.707,'highshelf']],[[4500,-2,1.2],[10000,-2,.707,'highshelf']]],
 cajon:[[[90,1.5,1],[350,-2,1.2],[3000,1,.9]],[[110,-2,1],[500,-1.5,1.2],[2500,1.5,1]]],
 pandereta:[[[250,0,.707,'highpass'],[7500,-1.5,.707,'highshelf']],[[220,1,.9],[4000,-2,1.3],[10000,-1,.707,'highshelf']]],
 guiro:[[[700,-1,.9],[2400,1.5,1]],[[3000,-2,1.4],[8000,-1.5,.707,'highshelf']]],
 claves:[[[1200,1,1],[6000,-1,.707,'highshelf']],[[2400,-1.5,1.3],[7500,-1.5,.707,'highshelf']]],
 maracas:[[[500,0,.707,'highpass'],[7000,1,.707,'highshelf']],[[4500,-2,1.3],[9000,-1.5,.707,'highshelf']]],
 cencerro:[[[700,1,1],[2500,-1.5,1.6]],[[1800,-2,2],[5000,-1.5,.707,'highshelf']]],
 triangulo:[[[400,0,.707,'highpass'],[11000,1,.707,'highshelf']],[[6500,-2,1.5],[12000,-1,.707,'highshelf']]],
 sintetizador:[[[35,0,.707,'highpass'],[90,1.5,.9],[300,-2,1]],[[160,0,.707,'highpass'],[1800,-2,1],[6500,1,.707,'highshelf']]],
 };
 for(const instrument of INSTRUMENTS){
  if(!curves[instrument.id])throw Error('Faltan presets EQ: '+instrument.id);
  instrument.eqPresets=curves[instrument.id].map((curve,index)=>({id:instrument.id+'-'+(index+1),bands:curve.map(([frequency,gain,q,type='peaking'])=>({frequency,gain,q,type,slope:12,enabled:true,label:type==='highpass'?'Retirar extremo grave según la toma':type==='lowpass'?'Suavizar el extremo agudo':gain<0?'Reducir esta región si predomina':'Reforzar esta región si falta'}))}));
 }
 // Additional proposals are deliberately selective: no artist preset is assigned
 // to an instrument merely to increase its preset count. All numerical gains/Q
 // below are Crescendo's choices, including adaptations of published examples.
 const extra=(id,title,body,source,attribution,curve)=>{
  const instrument=INSTRUMENTS.find(i=>i.id===id);
  instrument.eqPresets.push({id:id+'-'+(instrument.eqPresets.length+1),title,body,source,attribution,bands:curve.map(([frequency,gain,q,type='peaking',slope=12])=>({frequency,gain,q,type,slope,enabled:true,label:(type==='highpass'?'Limitar subgrave':type==='lowpass'?'Limitar agudo':gain<0?'Reducir esta región':'Reforzar esta región')}))});
 };
 const inspired='Estudio inspirado: la fuente describe un enfoque, no esta curva. Todos los valores son una propuesta original de Crescendo; no es un preset del autor ni una emulación de sus plugins.';
 const adapted='Adaptación de ejemplo publicado: la referencia aporta el objetivo y los parámetros señalados como publicados; los demás valores, ganancias y Q son elecciones de Crescendo. Los filtros genéricos no reproducen exactamente el equipo del autor.';
 extra('voz','Chris Lord-Alge · presencia vocal (estudio)','La entrevista de Waves explica su elección de cadenas y curvas vocales, pero no publica sus valores completos. Este ejercicio propone presencia media y brillo ancho; reduce el shelf si aumenta la sibilancia. No incluye compresión, de-essing ni efectos de CLA Vocals.','eqCLA',inspired,[[200,-1.5,.8],[3000,2,.8],[8000,2,.707,'highshelf']]);
 extra('bajo','Chris Lord-Alge · medios y ataque (estudio)','CLA destaca el papel de los medios y del ataque junto con la distorsión en su enfoque para bajo. Aquí se estudia solo el balance de EQ para ayudar a leer la línea en altavoces pequeños; no se simulan sus circuitos ni la distorsión.','eqCLA',inspired,[[80,1,.8],[1100,2.5,.9],[2800,1.5,1]]);
 for(const [id,low,high] of [['guit-ac',140,8000],['piano',100,10000],['cuerdas',180,9000]])extra(id,'Chris Lord-Alge · shelves amplios (estudio)','CLA describe Unplugged como un enfoque de trazos anchos para piano, cuerdas y guitarra acústica. Compara una forma suave en ambos extremos con las propuestas correctivas; ajusta el extremo grave al arreglo. La curva no incorpora su compresión ni sus reverberaciones.','eqCLA',inspired,[[low,1.5,.707,'lowshelf'],[high,1.5,.707,'highshelf']]);
 extra('kick','Andrew Scheps · cuerpo y maza','El ejemplo del manual propone shelf a 60 Hz, aire a 12 kHz, maza entre 5 y 7.5 kHz y HPF a 30 Hz con 18 dB/octava. Elegimos 6 kHz dentro de ese intervalo y realces moderados. Es un ejemplo para comparar, no una obligación de añadir aire a todo bombo.','eqScheps',adapted,[[30,0,.707,'highpass',18],[60,2,.707,'lowshelf'],[6000,2,.7],[12000,1,.707,'highshelf']]);
 extra('voz','Andrew Scheps · apertura controlada','El manual propone controlar boom/plosivas, abrir el extremo agudo y tratar nasalidad entre 2.5 y 3.5 kHz con DS2. Este dibujo elige HPF a 70 Hz, shelf a 12 kHz y una reducción estática a 3 kHz: ilustra el objetivo, pero no reproduce el de-essing dinámico ni el shelf resonante del plugin.','eqScheps',adapted,[[70,0,.707,'highpass'],[3000,-1.5,1.8],[12000,1.5,.707,'highshelf']]);
 extra('overhead','Andrew Scheps · overheads de platos','El ejemplo distingue micrófonos dedicados a platos de una captura completa de batería y propone HPF de 12 dB/octava. Esta adaptación elige 180 Hz y un balance suave. Su tratamiento M/S se estudia en el manual; aquí ambas bandas afectan a una única respuesta, sin separación Mid/Side.','eqScheps',adapted,[[180,0,.707,'highpass'],[9000,1,.707,'highshelf']]);
 extra('kick','Jaycen Joshua · espacio para el bajo (estudio)','El temario público con Dave Pensado aborda enmascaramiento y consistencia del grave. Este ejercicio reserva el subgrave más profundo para el bajo y desplaza la lectura del bombo hacia 90 Hz y la maza. No transcribe ajustes del seminario ni reproduce su cadena de buses.','eqJaycen',inspired,[[30,0,.707,'highpass',24],[55,-2,1],[90,2,1],[3500,1.5,1]]);
 extra('bajo','Jaycen Joshua · subgrave despejado (estudio)','El seminario aborda referencia de graves, enmascaramiento y sidechain. Aquí se propone un bajo con peso en 45 Hz y menor energía alrededor de 90 Hz para contrastar con el bombo de este estudio. No significa que esas frecuencias correspondan a todas las notas; el sidechain no está representado.','eqJaycen',inspired,[[25,0,.707,'highpass',24],[45,1.5,.9],[90,-2,1.2],[800,1,.8]]);
 extra('voz','Jaycen Joshua · espacio y aspereza (estudio)','El temario incluye espacio vocal, control de aspereza y aire. Esta propuesta editorial compara menos medios bajos con un corte leve de presencia y un shelf alto; adáptala a la voz. El curso público no proporciona estos números y el dibujo no sustituye automatización ni EQ dinámica.','eqJaycen',inspired,[[250,-2,1],[3800,-1.5,1.5],[14000,1.5,.707,'highshelf']]);
 extra('voz','Finneas · capa vocal filtrada (estudio)','Su presentación de Therefore I Am aborda armonías, tratamiento vocal y diseño sonoro. Como ejercicio de contraste, esta curva limita extremos para una capa secundaria, nunca como receta de la voz principal de Billie Eilish. No es una transcripción de la sesión ni reproduce pitch, distorsión o efectos.','eqFinneas',inspired,[[300,0,.707,'highpass',24],[1600,1.5,.9],[4500,0,.707,'lowpass',24]]);
 extra('sintetizador','Finneas · textura secundaria (estudio)','El desglose de producción incluye sintetizadores y manipulación creativa de muestras. Esta curva editorial estrecha el espectro de una textura para contrastarla con bajo y voz; elige los cortes escuchando el patch. No son los ajustes de Therefore I Am ni una recreación de su sonido.','eqFinneas',inspired,[[350,0,.707,'highpass',12],[1200,-2,1.2],[6000,0,.707,'lowpass',12]]);
 extra('kick','Bombo con separación en medios bajos','Para un arreglo donde el bajo necesita conservar su zona media grave, compara este realce alrededor de 80 Hz con reducciones a 170 y 220 Hz. Mueve los cortes si pierdes cuerpo. La referencia explica separación por regiones; ganancias y Q son elecciones editoriales.','eqKickBass',adapted,[[80,2,1],[170,-1.5,1.3],[220,-1,1.5]]);
 extra('guit-ac','Arpegio suave sin exceso de dedos','Contrasta el arpegio con acompañamiento compacto: conserva el grave útil, reduce suavemente la fricción de dedos y evita un brillo agresivo. Estos valores complementan los criterios de captura y mezcla de la referencia; no son un preset publicado.','eqGuitar',inspired,[[90,0,.707,'highpass'],[3500,-1.5,1.5],[10000,-1,.707,'highshelf']]);
 extra('piano','Piano cálido al fondo del arreglo','Si la voz debe ocupar el primer plano, compara menos presencia y un extremo agudo más suave, manteniendo algo de cuerpo. Comprueba las octavas interpretadas y la suma con el bajo. Es otra propuesta de Crescendo a partir de criterios de mezcla de piano.','eqPiano',inspired,[[180,1,.8],[3200,-2,.9],[9000,-1.5,.707,'highshelf']]);
 extra('snare','Caja ligera y definida','Para una caja que deba atravesar un arreglo sin engordar los medios bajos, contrasta una reducción de cuerpo con un realce moderado del ataque. No uses esta curva si la toma ya es delgada; las frecuencias de resonancia dependen de afinación y microfonía.','eqDrums',inspired,[[200,-1.5,1],[550,-2,1.5],[4000,2,1]]);
 extra('hihat','Hi-hat discreto en mezcla vocal','Si el hi-hat compite con consonantes, prueba menos energía en medios altos y agudos, conservando su movimiento rítmico. Estos cortes son ilustrativos: una reducción de nivel o automatización puede resolverlo mejor que EQ. No equivale a aplicar un de-esser.','eqDrums',inspired,[[500,0,.707,'highpass'],[5500,-2,1.2],[11000,-2,.707,'highshelf']]);
 extra("guit-el","Kevin Parker / Tame Impala · guitarra de textura (estudio)","Contrasta una guitarra secundaria más oscura y centrada en medios. La fuente presenta su proceso, no estos ajustes; filtros y modulación no se reproducen aquí.","eqParker",inspired,[[130, 0, 0.707, "highpass"], [950, 2.5, 0.8], [2800, -2, 1.1], [6500, 0, 0.707, "lowpass"]]);
 extra("piano","FKJ · teclas orgánicas (estudio)","Ejercicio para dejar espacio al bajo conservando cuerpo y articulación. La entrevista documenta interpretación y producción; no publica esta curva.","eqFKJ",inspired,[[65, 0, 0.707, "highpass"], [260, -1.5, 1], [1600, 1.8, 0.8], [8500, -1, 0.707, "highshelf"]]);
 extra("piano","Anomalie · teclado protagonista (estudio)","Propuesta para acordes y solos en una fusión de jazz y electrónica. Conserva el ataque sin endurecerlo. La entrevista aporta contexto musical, no valores de EQ.","eqAnomalie",inspired,[[100, 0, 0.707, "highpass"], [420, -2, 1.1], [2400, 2.5, 0.9], [11000, 1, 0.707, "highshelf"]]);
 extra("guit-ac","Torres / Rengifo · guitarra en pop latino (estudio)","Estudio de contraste entre acompañamiento acústico y centro vocal. El desglose de Despacito es la referencia de producción; estos números no son su sesión.","eqTorres",inspired,[[120, 0, 0.707, "highpass"], [280, -2.5, 1.1], [2200, 2, 0.9], [10000, 1.5, 0.707, "highshelf"]]);
 extra("voz","Dan Nigro / Olivia Rodrigo · voz entre guitarras (estudio)","Ejercicio editorial para priorizar dicción en un arreglo de guitarras. No se atribuye esta EQ al productor ni al mezclador de una canción.","eqNigro",inspired,[[85, 0, 0.707, "highpass"], [550, -2, 1], [2600, 1.5, 0.8], [7500, -1.5, 1.6]]);
 extra("voz","Max Martin · foco melódico pop (estudio)","Referencia de composición y producción, sin ajustes técnicos de EQ publicados en esta fuente. Esta propuesta original compara un centro vocal más luminoso con las otras curvas.","eqMartin",inspired,[[105, 0, 0.707, "highpass"], [310, -1.8, 1.1], [4500, 1.2, 0.9], [15000, 2.5, 0.707, "highshelf"]]);
 extra("sintetizador","Tainy / Bad Bunny · capa híbrida (estudio)","La entrevista explora fusiones y contraste del arreglo. Este estudio filtra una capa electrónica secundaria para dejar espacio al grave; no reconstruye una pista de Bad Bunny.","eqTainy",inspired,[[240, 0, 0.707, "highpass", 24], [750, -2.5, 0.8], [2800, 2, 1], [9500, 0, 0.707, "lowpass"]]);
 extra("kick","Ovy / Karol G · golpe compacto (estudio)","Propuesta original para contrastar ataque y cuerpo en una base urbana. La fuente documenta producción, no estos valores ni una configuración universal de reguetón.","eqOvy",inspired,[[28, 0, 0.707, "highpass", 18], [72, 2.5, 1], [260, -2.5, 1.2], [4800, 1.8, 1]]);
 extra("voz","Rob Kinelski / Billie Eilish · cuerpo y aire (estudio)","En la entrevista de UA explica recortar algo de grave, a veces reforzar alrededor de 200 Hz y ajustar el shelf alto con un 1073. Aquí 75 Hz, ganancias, Q y shelf de 12 kHz son elecciones de Crescendo; no se modela el 1073.","eqKinelski",inspired,[[75, 0, 0.707, "highpass"], [200, 1.5, 0.8], [12000, 2, 0.707, "highshelf"]]);
 extra("guit-el","Rob Kinelski · medios de guitarra (estudio)","La entrevista describe usar Harrison 32C para reforzar medios sin aspereza. Compara este realce ancho con un extremo alto contenido; los números son editoriales y no se modela el canal.","eqKinelski",inspired,[[95, 0, 0.707, "highpass"], [1400, 2, 0.7], [4200, -1, 1.5], [9500, 0, 0.707, "lowpass"]]);
})();
