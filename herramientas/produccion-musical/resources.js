(function(root){
'use strict';
const sources = [
{"id": "suno-terms", "type": "IA", "title": "Suno · Condiciones vigentes", "url": "https://suno.com/terms-of-service", "note": "Condiciones efectivas desde septiembre de 2026: planes, descargas, Remixes y modelos de voz."},
{"id": "suno-policy", "type": "IA", "title": "Suno · Política de descargas", "url": "https://suno.com/blog/suno-updates-tos", "note": "Anuncio oficial de agosto de 2026; se contrasta con las condiciones y no solo con FAQ antiguas."},
{"id": "senadi-2026", "type": "Industria", "title": "SENADI · Registro de obras, instructivo 2026", "url": "https://www.derechosintelectuales.gob.ec/wp-content/uploads/2026/02/INSTRUCTIVO-PROCESO-PARA-REGISTRO-DE-OBRAS_2026.pdf", "note": "Requisitos de obras musicales y fonogramas; la solicitud en línea no elimina la entrega física indicada."},
{"id": "senadi-sgc", "type": "Industria", "title": "SENADI · Gestión colectiva", "url": "https://www.derechosintelectuales.gob.ec/sociedades-de-gestion-colectiva/", "note": "Funciones de SAYCE, SOPROFON y SARIME."},
{"id": "sayce-works", "type": "Industria", "title": "SAYCE · Declaración de repertorio", "url": "https://sayce.com.ec/registro-de-nuevas-obras-musicales-para-socios/", "note": "Trámite de repertorio para socios; distinto del registro estatal y de distribución."},
{"id": "cc", "type": "Industria", "title": "Creative Commons · Preguntas frecuentes", "url": "https://creativecommons.org/faq/index.html", "note": "Licencias, atribución, restricciones y adaptaciones."},
{"id": "ifpi-isrc", "type": "Industria", "title": "IFPI · Manual ISRC", "url": "https://www.ifpi.org/wp-content/uploads/2021/02/ISRC_Handbook.pdf", "note": "Identifica grabaciones; no sustituye el registro de derechos."},
{"id": "proximity", "type": "Grabación", "title": "DPA · Efecto de proximidad", "url": "https://www.dpamicrophones.com/mic-university/background-knowledge/proximity-effect-in-microphones-explained/", "note": "Distancia, tipo de fuente y respuesta grave."},
{"id": "inverse-square", "type": "Acústica", "title": "DPA · Ley del inverso del cuadrado", "url": "https://www.dpamicrophones.com/dictionary/i/inverse-square-law/", "note": "Aproximación en campo libre y caída de nivel con distancia."},
{"id": "haas", "type": "Mezcla", "title": "DPA · Efecto Haas", "url": "https://www.dpamicrophones.com/dictionary/h/haas-effect/", "note": "Precedencia y primera llegada."},
{"id": "aliasing", "type": "Audio digital", "title": "FabFilter · Oversampling", "url": "https://www.fabfilter.com/help/pro-mb/using/oversampling", "note": "Aliasing, muestreo interno y recursos de procesamiento."},
{"id": "apple-delivery", "type": "Entrega", "title": "Apple · Audio Asset Guide", "url": "https://help.apple.com/itc/videoaudioassetguide/en.lproj/static.html", "note": "Resoluciones admitidas y requisitos adicionales de Apple Digital Masters."},
{"id": "youtube-delivery", "type": "Entrega", "title": "YouTube · Codificación recomendada", "url": "https://support.google.com/youtube/answer/1722171?hl=es", "note": "Configuración de carga audiovisual y audio a 48 kHz."},
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
