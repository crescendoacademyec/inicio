(function(root){
'use strict';
const sources = [
{id:'monitor-placement',type:'Acústica',title:'Genelec · Colocación de monitores',url:'https://www.genelec.com/monitor-placement',note:'Triángulo equilátero, orientación hacia el punto de escucha y simetría de colocación.'},
{id:'berklee-grid',type:'Mallas',title:'Berklee · Music Production and Engineering, 2026F',url:'https://www.berklee.edu/sites/default/files/2026-05/2026f-music-production-and-engineering-degree-grid.pdf',note:'Malla vigente consultada: escucha, tecnología, MIDI, grabación multipista, mezcla, negocio y proyectos.'},
{id:'berklee-online',type:'Mallas',title:'Berklee Online · Music Production',url:'https://online.berklee.edu/music-degrees/undergraduate/music-production',note:'Programa de producción que incorpora acústica, técnica de micrófonos, voz, mastering y proyecto final.'},
{id:'fullsail-music',type:'Mallas',title:'Full Sail · Music Production',url:'https://www.fullsail.edu/degree-course-listing/music-production-bachelor-of-science-online',note:'Creación, estructura, arreglos, producción para medios y proyectos de portafolio.'},
{id:'fullsail-audio',type:'Mallas',title:'Full Sail · Audio Production',url:'https://www.fullsail.edu/degree-course-listing/audio-production-bachelor-of-science-online',note:'Escucha, edición avanzada, mezcla, voz, posproducción y audio para videojuegos.'},
{id:'fullsail-recording',type:'Mallas',title:'Full Sail · Recording Arts',url:'https://www.fullsail.edu/degree-course-listing/recording-arts-bachelor-of-science-campus',note:'Grabación de sesiones, producción vocal, electrónica y trabajo de estudio.'},
{id:'critical',type:'Escucha',title:'Berklee · Critical Listening 1',url:'https://online.berklee.edu/courses/critical-listening-1',note:'Programa de escucha analítica y entrenamiento para describir decisiones sonoras.'},
{id:'vocal',type:'Grabación',title:'Berklee · Vocal Production',url:'https://online.berklee.edu/courses/vocal-production',note:'Preparación, interpretación, dirección y producción de la voz.'},
{id:'mastering',type:'Mastering',title:'Berklee · Audio Mastering Techniques',url:'https://online.berklee.edu/courses/audio-mastering-techniques',note:'Monitoreo, análisis, procesamiento, secuencia y entrega.'},
{id:'shure',type:'Grabación',title:'Shure · Técnicas de micrófonos',url:'https://www.shure.com/en-US/docs/education/Microphone-Techniques-for-Recording',note:'Guía de colocación y elección del micrófono. Texto en inglés.'},
{id:'dpa-phase',type:'Grabación',title:'DPA · Polaridad, fase y retardo',url:'https://www.dpamicrophones.com/mic-university/technology/polarity-phase-and-delay/',note:'Diferencias entre inversión de polaridad y desplazamiento temporal.'},
{id:'dpa-stereo',type:'Grabación',title:'DPA · Técnicas estéreo',url:'https://www.dpamicrophones.com/mic-university/audio-production/stereo-recording-techniques-and-setups/',note:'Diferencias de nivel y tiempo, XY, pares separados y Mid/Side.'},
{id:'rew',type:'Acústica',title:'REW · Simulación de una sala',url:'https://www.roomeqwizard.com/help/help_en-GB/html/modalsim.html',note:'Modos y comportamiento aproximado de salas rectangulares.'},
{id:'routing',type:'DAW',title:'Ableton · Routing y entradas/salidas',url:'https://www.ableton.com/es/live-manual/12/routing-and-i-o/',note:'Fuentes, destinos, envíos y retornos. Los conceptos se trasladan a otros DAW.'},
{id:'digital',type:'DAW',title:'Ableton · Audio Fact Sheet',url:'https://www.ableton.com/en/live-manual/12/audio-fact-sheet/',note:'Procesamiento digital, resolución, exportación y dither.'},
{id:'warp',type:'Edición',title:'Ableton · Clips, tempo y warping',url:'https://www.ableton.com/en/live-manual/12/audio-clips-tempo-and-warping/',note:'Edición temporal y elección de algoritmos según la fuente.'},
{id:'effects',type:'Mezcla',title:'Ableton · Referencia de efectos',url:'https://www.ableton.com/en/live-manual/12/live-audio-effect-reference/',note:'Manual de parámetros para contrastar el comportamiento de procesadores.'},
{id:'synth',type:'MIDI',title:'Ableton · Referencia de instrumentos',url:'https://www.ableton.com/en/live-manual/12/live-instrument-reference/',note:'Osciladores, envolventes, filtros y modulación.'},
{id:'eq',type:'Mezcla',title:'iZotope · Ecualización sustractiva',url:'https://www.izotope.com/community/blog/7-tips-for-using-subtractive-eq-when-mixing-audio',note:'Escucha en contexto y decisiones de atenuación.'},
{id:'masking',type:'Mezcla',title:'iZotope · Enmascaramiento',url:'https://www.izotope.com/en/learn/unmasking-your-mix-with-neutron',note:'Relación entre arreglo, ocupación espectral y separación de fuentes.'},
{id:'dynamics',type:'Mezcla',title:'iZotope · Compresión transparente',url:'https://www.izotope.com/community/blog/tips-for-more-transparent-compression',note:'Balance entre control de nivel y conservación del carácter.'},
{id:'itu',type:'Mastering',title:'ITU-R BS.1770-5 · Sonoridad y true peak',url:'https://www.itu.int/rec/R-REC-BS.1770-5-202311-I/en',note:'Referencia técnica para medir sonoridad de programa y picos verdaderos.'},
{id:'ebu',type:'Mastering',title:'EBU R 128 · Normalización de sonoridad',url:'https://tech.ebu.ch/publications/r128',note:'Referencia de radiodifusión; el destino determina las especificaciones.'},
{id:'spotify',type:'Mastering',title:'Spotify · Normalización y entrega',url:'https://support.spotify.com/us/artists/article/loudness-normalization/',note:'Recomendaciones publicadas por Spotify; revisar antes de cada entrega.'},
{id:'wipo',type:'Profesión',title:'OMPI · Propiedad intelectual y música',url:'https://www.wipo.int/en/web/music',note:'Distingue obra musical, interpretación y fonograma.'},
{id:'reaper',type:'DAW',title:'REAPER · Guía oficial',url:'https://www.reaper.fm/userguide.php',note:'Guías de operación y edición para llevar los ejercicios a una sesión real.'},
{id:'arrangement',type:'Producción',title:'Full Sail · Musical Arrangement',url:'https://www.fullsail.edu/courses/mpr3311',note:'Instrumentación y organización de recursos acústicos y electrónicos.'},
{id:'engineering',type:'Grabación',title:'Full Sail · Audio Engineering Techniques',url:'https://www.fullsail.edu/courses/mpr4416',note:'Métodos de producción y resolución de problemas técnicos.'},
{id:'game',type:'Medios',title:'Full Sail · Game Music Composition',url:'https://www.fullsail.edu/courses/mpr3452',note:'Relación entre música, diseño y comportamiento interactivo.'}
];
const tools=[
{title:'Tabla de frecuencias y EQ visual',url:'../tabla-frecuencias/',note:'Consulta instrumentos, filtros, Q y pendientes; compara con lo que escuchas.'},
{title:'Piano Virtual',url:'../piano-virtual/',note:'Prueba notas, voicings y relaciones armónicas para tus arreglos.'},
{title:'Metrónomo',url:'../metronomo/',note:'Pulso, subdivisión y práctica rítmica antes de editar una interpretación.'},
{title:'Entrenamiento auditivo',url:'../ear-training/',note:'Desarrolla reconocimiento de alturas, intervalos y acordes.'},
{title:'Armonía funcional',url:'../armonia-funcional/',note:'Conecta progresiones, tensión y resolución con la producción.'},
{title:'Teoría y lectura musical',url:'../teoria-lectura-musical/',note:'Refuerza figuras, compás, escalas y organización musical.'},
{title:'Velocidad y tono',url:'../speed/',note:'Escucha fragmentos, crea loops y estudia interpretaciones.'},
{title:'Editor Crescendo',url:'../editor-crescendo/',note:'Anota motivos, progresiones y arreglos.'}
];
const api={sources,tools,reviewed:'2026-10-10'};
if(typeof module==='object'&&module.exports)module.exports=api;else root.ProductionResources=api;
})(typeof window!=='undefined'?window:globalThis);
