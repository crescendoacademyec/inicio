# Auditoría de las herramientas musicales de Crescendo

Fecha local: 17 de noviembre de 2026. Base revisada: `6a81b18`.

Seguimiento: las correcciones y su validación del 18 de noviembre se documentan en `auditorias/correcciones-musicales-2026-11-18.md`. Este informe conserva el diagnóstico original.

## Dictamen

Las herramientas tienen una base útil, una identidad visual consistente y bastante funcionalidad probada. Las 14 páginas de esta revisión abren y presentan sus controles. Sin embargo, no corresponde afirmar que todo funciona correctamente: aparecen errores de audio, de duración musical, de evaluación auditiva y de conservación del documento. Hay 16 hallazgos agrupados a continuación; siete tienen prioridad alta.

La recomendación es corregir primero esos comportamientos, después estabilizar las pruebas y finalmente pulir accesibilidad y presentación. No hace falta rehacer las aplicaciones ni agregar más funciones antes de resolverlos.

Esta entrega es una auditoría. No modifica el funcionamiento de las aplicaciones ni contiene un commit o push de correcciones.

## Alcance y comprobaciones

Bingo está excluido. Las páginas de escuela y gestión de alumnos no forman parte de esta revisión de herramientas musicales. Las cinco páginas de teoría revisadas recientemente participan en la regresión automatizada, sin repetir aquí su auditoría completa de contenido.

| Herramienta | Comprobación realizada | Resultado y pendientes |
|---|---|---|
| Piano Virtual | Carga, validador, bancos de acordes, regresiones de partitura, gestión de voces | Abre; error al superponer ataques de la misma nota: M01. |
| Diapasón Virtual | Carga y vista de escala, validador, bancos/modelos/estudio, reproducción de partitura | Bancos y regresiones ejecutadas; colores incorrectos M04; acceso al diapasón M16. |
| Requinteando | Carga, validador, bancos de guitarra/ukelele, clasificación de alturas | Abre; comparte M04. |
| Bass Virtual | Carga, validador, regresiones de silencios/polifonía, clasificación de alturas | Abre; comparte M04. |
| Folk Virtual | Carga, validador, regresiones de silencios/polifonía, clasificación de alturas | Abre; comparte M04. |
| Cuerdas Frotadas | Carga, validador, pentagrama en vivo y análisis sintético de vibrato | Abre; vibrato dependiente del muestreo de pantalla M03. |
| Afinador | Carga, afinaciones, regresión de armónicos y permisos simulados | Afinaciones/armónicos comprobados; concurrencia del micrófono M08. |
| Ear Training Pro | Carga, recorrido de respuesta/ayuda, validador, generadores, pruebas de intervalos | Tres problemas de evaluación y uno de repaso: M05, M12, M13. |
| Speed | Carga WAV, inicio de reproducción, exportación real, funciones de loop y cancelación | WAV/MOV/M4A descargados; MP3 falla; M07, M09, M10. |
| Metrónomo | Inicio/parada, cambio visible a 6/8, planificador real, pruebas de editor/audio/exportación | Inicio/parada funcionan; clic y editor discrepan en 6/8 y 7/8: M02. |
| Editor Crescendo | Carga y pruebas de entrada, transposición, instrumentos, compases, exportación y sincronización | Sin fallo nuevo reproducido en las comprobaciones ejecutadas. No equivale a validar cualquier partitura importada. |
| Analizador Armónico Crescendo — AAC | Carga, parser, cadencia ii–V–I e inspección de importación | Cadencia Dm7–G7–Cmaj7 coherente; importación M06 y cifrado M11. |
| ChordSync Pro | Carga, análisis local de WAV sintético, worker y núcleo Python | Análisis termina; resultados de acordes ocultos M14. No se probó reconocimiento con micrófono físico ni backend neuronal. |
| Historia del Jazz | Carga, búsqueda de Miles Davis, cronología y organización de las 17 entradas | La búsqueda devuelve cinco estilos pertinentes. No apareció un fallo funcional nuevo; conviene reforzar fuentes y escucha guiada. |
| Teoría y Lectura Musical | Regresión automatizada de la revisión anterior | Una ilustración dejó de enlazarse por el título del bloque: M15. |
| Armonía Funcional | Regresión automatizada de la revisión anterior | Una prueba compartida usa una expectativa antigua: M15. |
| Armonía Jazz | Regresión automatizada de la revisión anterior | Una prueba compartida ya no consigue exponer la función que verifica: M15. |
| Producción Musical | Regresión automatizada de la revisión anterior | Sin fallo nuevo en las pruebas ejecutadas; se mantiene el público adulto. |
| Tabla de Frecuencias | Regresión automatizada de la revisión anterior | Sin fallo nuevo en las pruebas ejecutadas; se mantiene el público adulto. |

Resultados globales:

- 102 archivos de pruebas Node: **488 unidades reportadas, 484 aprobadas y 4 fallidas**. No se presenta la suite como aprobada.
- 172 unidades JavaScript propias, entre archivos y scripts inline de las 14 aplicaciones: **sin errores de sintaxis**. Se excluyen bibliotecas distribuidas/minificadas de terceros.
- Los siete `validate.js` de instrumentos y Ear Training terminan correctamente.
- Núcleo Python de ChordSync: **3 pruebas aprobadas**, ejecutando `python3 test_core.py` desde `herramientas/chordsyncpro/server`.
- Regresiones antiguas de reproducción: al completar únicamente en memoria el fixture de Speed con `fallbackMedia: null`, pasan sus **62 aserciones**. El archivo del repositorio se deja sin modificar.
- Speed: WAV exportado con 2 canales, 44.100 Hz y 8 segundos; MOV y M4A producen descargas con sus contenedores correspondientes. Esto no certifica la fidelidad de cada algoritmo ni todos los códecs de entrada anunciados.

Las cargas iniciales no interrumpieron el renderizado. Durante el uso, Speed sí emitió el aviso de biblioteca duplicada y el error de exportación descrito en M09.

## Hallazgos de prioridad alta

### M01. Piano: una nota superpuesta puede quedar sin posibilidad de detenerse

**Ubicación:** `herramientas/piano-virtual/js/audio.js:182`; entradas MIDI en `js/midi.js:108`.

`noteOn` guarda una sola voz por número MIDI en `activeSources`. Un segundo ataque de la misma altura sobrescribe el identificador anterior si no estaba en el conjunto de notas sostenidas. Dos entradas MIDI o una entrada MIDI junto a la tecla de pantalla pueden llegar a esta situación.

**Evidencia:** dos ataques de Do4 crean dos osciladores; `noteOff` detiene uno y deja cero identificadores recuperables. El primer oscilador del sintetizador de respaldo queda activo; el botón de pánico tampoco conserva su referencia. Con muestras, el decaimiento puede disimular el problema, pero la gestión de voces sigue perdiendo el identificador.

**Corrección y aceptación:** definir la propiedad de cada voz o detener la anterior antes de sustituirla. Probar ataques repetidos, entradas simultáneas, sustain, pérdida de foco y pánico; ninguna voz debe quedar fuera del control de parada.

### M02. Metrónomo: 6/8 y 7/8 duran el doble en el clic que en el editor

**Ubicación:** `herramientas/metronomo/index.html:2130`, `:2345` y conteo de partitura en `:1888`.

`parsePattern` usa únicamente el numerador como `totalBeats`, mientras el planificador trata cada unidad como una negra. El editor sí considera el denominador. Seleccionar 6/8 conserva la figura de negra y muestra seis unidades, sin explicar otro convenio de tempo.

**Evidencia del planificador real, negra = 60:**

| Compás | Duración del clic principal | Duración del compás en el editor |
|---|---:|---:|
| 4/4 | 4 s | 4 s |
| 6/8 | 6 s | 3 s |
| 7/8 | 7 s | 3,5 s |

**Corrección y aceptación:** compartir el modelo de compás y la unidad explícita del tempo entre clic, editor, visualización y conteo previo. En 6/8, ofrecer la agrupación de dos pulsos de negra con puntillo o seis corcheas con la equivalencia indicada; no reinterpretar silenciosamente la cifra de tempo. Verificar duración, acentos y sincronía en 4/4, 6/8 y 7/8.

### M03. Cuerdas Frotadas: el mismo vibrato recibe mediciones distintas según los fotogramas

**Ubicación:** `herramientas/cuerdas-frotadas/js/vibrato.js:39–56`.

Las muestras se recogen con `requestAnimationFrame`; antes de medir se aplica una media de cinco muestras sin tener en cuenta el tiempo entre ellas. Ese filtro elimina una parte diferente de la oscilación según la frecuencia de muestreo visual.

**Evidencia:** un contorno idéntico de cinco segundos, 6 Hz y ±30 cents obtiene ±0,0 cents y velocidad indetectable a 30 muestras/s, ±18,5 a 60 y ±25,8 a 120. El mensaje compara esos valores con el objetivo y puede atribuir al alumno una ejecución demasiado estrecha.

**Corrección y aceptación:** separar el suavizado de pantalla del cálculo, usar tiempos reales/remuestreo y definir si la anchura representa pico o dispersión central. El mismo contorno debe producir resultados equivalentes con distintas tasas y pérdidas de muestras, dentro de una tolerancia documentada.

### M04. Cuatro instrumentos clasifican notas estructurales como tensiones

**Ubicación:** función inline `toneRole` de Diapasón `index.html:1579`, Requinteando `:1455`, Bass `:1636` y Folk `:1476`.

La clasificación depende de la posición en el arreglo de la escala. En las escalas especiales usa `index % 3`, que no representa el intervalo ni su relación con el acorde.

**Evidencia:** en Do pentatónica mayor `[Do, Re, Mi, Sol, La]`, Mi aparece como tensión. En la pentatónica dominante `[Do, Re, Mi, Sol, Si♭]`, Sol recibe esa clasificación. Sobre Do mayor/Do7, esas notas pertenecen al acorde de referencia; la tríada mayor se construye con fundamental, tercera y quinta. [Referencia musical: Open Music Theory, tríadas](https://viva.pressbooks.pub/openmusictheory/chapter/triads/).

**Corrección y aceptación:** calcular intervalos reales respecto de la fundamental y explicitar el contexto armónico. No convertir “no disponible” en una prohibición universal. Verificar los colores en todas las familias de escalas y transposiciones. El caso de arpegios del Diapasón tiene una rama independiente; no se afirma que todos sus arpegios estén mal.

### M05. Ear Training: un mismo audio puede tener dos respuestas admitidas musicalmente

**Ubicación:** `herramientas/ear-training/js/generators.js:142`.

Con inversiones y fundamentales aleatorias, una sexta mayor y una séptima menor pueden producir exactamente las mismas alturas. El cuestionario no aporta una fundamental de referencia antes de responder, pero solo acepta la etiqueta sorteada.

**Evidencia reproducible con semilla fija:** el generador produce `[71, 73, 76, 80]` tanto para Re♭m7 como para Mi6, ofreciendo “Menor séptima” y “Sexta mayor”. La secuencia, duración y velocidad MIDI son iguales.

**Corrección y aceptación:** proporcionar contexto de fundamental, restringir el bajo/voicing cuando se evalúa la calidad o aceptar interpretaciones equivalentes. Ningún ejercicio debe marcar como error una respuesta igualmente válida con la información sonora ofrecida.

### M06. AAC: un JSON ajeno puede sustituir el documento por uno vacío

**Ubicación:** `herramientas/aac/js/app.js:2385`, `:2418`, `:4097` y `:13538`.

`normalizeImportedState` envía cualquier objeto a `normalizeSong`, que completa los datos ausentes con un documento nuevo. `importJson` aplica ese estado y reinicia el historial sin validar una estructura de exportación reconocible ni proteger los cambios del documento abierto.

**Evidencia:** inspección del recorrido completo y prueba aislada del contrato del importador con `{version:1, stats:{}, sessions:[]}`: el objeto llega al normalizador sin rechazo. La prueba usa un normalizador sustituido y no importa sobre un documento real del usuario; el comportamiento de creación por defecto y sustitución se confirma leyendo las funciones reales.

**Corrección y aceptación:** validar el formato actual y los formatos antiguos soportados antes de modificar el estado. Un archivo ajeno o incompleto debe dejar documento, nombre e historial intactos. Mantener una vía de recuperación del documento sustituido y proteger los cambios pendientes.

### M07. Speed: quitar el archivo no invalida una reproducción pendiente

**Ubicación:** `herramientas/speed/index.html:1186` y `:1433–1460`.

`startPlayback` espera el procesamiento y después arranca sin comprobar que el archivo o la intención de reproducir siguen vigentes. “Eliminar audio” y “Abrir otro archivo” limpian la interfaz, pero no invalidan ese inicio pendiente.

**Evidencia:** iniciar, simular la retirada mientras el procesamiento espera y resolverlo después deja `audioBuffer` ausente pero una fuente iniciada e `isPlaying = true`. Es una prueba de la función real con procesamiento diferido, no una afirmación sobre la frecuencia de ocurrencia en cada dispositivo.

Además, ambos botones llaman a `disposeSource` pero no a `disposeFallbackMedia`; la ruta de reproducción directa merece la misma protección.

**Corrección y aceptación:** usar una generación de sesión/reproducción; invalidarla al detener, retirar o sustituir el archivo. Parar ambos motores y descartar resultados tardíos. Una cancelación no debe activar el motor alternativo.

## Hallazgos de prioridad media

### M08. Afinador: dos solicitudes pendientes pueden dejar un micrófono sin detener

**Ubicación:** `herramientas/afinador/index.html:1472`.

`listening` solo cambia tras resolver `getUserMedia`. Dos clics mientras espera el permiso abren dos solicitudes; las variables globales conservan únicamente el último stream y contexto. En el probe, detener cierra el segundo par y deja el primero abierto: pistas detenidas `[false, true]`, contextos cerrados `[false, true]`.

**Corregir:** estado de solicitud pendiente, descarte y cierre de resultados tardíos, limpieza si falla la inicialización. Verificar doble clic, permiso tardío y parada. Cuerdas Frotadas tiene una estructura parecida en `toggleIntonationMic`; revisar allí el mismo ciclo, sin dar por reproducido el caso físico en esa app.

### M09. Speed: MP3 falla y la biblioteca de conversión se carga dos veces

**Ubicación:** `herramientas/speed/index.html:824` y `:1757`.

**Reproducción en navegador:** cargar el WAV sintético de 8 segundos, seleccionar MP3 y exportar. La aplicación muestra `Error al exportar` por configuración de encoder no soportada: MP3, 192.000 bps, 2 canales, 44.100 Hz. En el mismo entorno, WAV, MOV y M4A sí producen descargas.

La consola informa de carga duplicada de Mediabunny. La página importa `mediabunny@1/+esm`, mientras ambos encoders obtenidos del CDN importan `mediabunny@1.65.2/+esm`. La separación de instancias y registros de encoder es una causa probable, pendiente de confirmación tras unificar las importaciones. No se atribuye el fallo a un archivo de entrada inválido ni se afirma que falle en todos los navegadores. Módulos consultados: [encoder MP3](https://cdn.jsdelivr.net/npm/@mediabunny/mp3-encoder@1/+esm) y [encoder AAC](https://cdn.jsdelivr.net/npm/@mediabunny/aac-encoder@1/+esm).

**Corregir:** una sola versión/instancia, registro sobre esa instancia, comprobación de capacidades y errores en español. Repetir las cuatro exportaciones y abrir los resultados. También actualizar `aria-selected` de las pestañas: actualmente el árbol accesible sigue anunciando WAV tras elegir otro formato (`setExportFormat`, línea 1693).

### M10. Speed: las teclas A/B anuncian un loop que la fuente no ejecuta

**Ubicación:** `herramientas/speed/index.html:1821`; comparar con controles de ratón alrededor de `:1526`.

El atajo actualiza `loopA`, `loopB`, `loopActive` y el mensaje, pero no modifica `currentSource.loop`, `loopStart` y `loopEnd`. El probe marca A=2 y B=5: la interfaz dice “Loop activo: 2 → 5”, mientras la fuente conserva `loop: false`.

**Corregir:** una sola función para aplicar el loop desde teclado, botones y reproducción directa; verificar mientras suena y estando pausado.

### M11. AAC: `C6/9` se interpreta como `C6`

**Ubicación:** `herramientas/aac/js/tonal-analysis.js:171` y normalización visible en `js/app.js:324`.

Dividir siempre por `/` confunde el sufijo 6/9 con una inversión. `C6/9` pierde la novena; `C6/9/E` pierde además el bajo Mi. Las variantes `C69`, `Cm69` y el caso normal `C7/E` sí pasan por el parser con la estructura esperada.

**Corregir:** distinguir el sufijo de la nota de bajo, preservar el símbolo mostrado y comprobar alias mayores/menores, accidentes e inversiones.

### M12. Ear Training: repasar un único error deja una sola respuesta

**Ubicación:** `herramientas/ear-training/js/generators.js:111` y `:142`.

El filtro de conceptos fallados restringe tanto el objetivo como los distractores. Con un único acorde fallado, el ejercicio genera una sola opción: responder correctamente ya no demuestra discriminación auditiva.

**Corregir:** separar los conceptos a repasar de los distractores plausibles. Si se desea estudio de un único sonido, presentarlo como exploración sin puntuarlo como identificación.

### M13. Ear Training: el registro mezcla escucha autónoma, ayuda visual y respuestas sin escuchar

**Ubicación:** `herramientas/ear-training/js/app.js:180–216`.

Las opciones están habilitadas antes de reproducir. En navegador fue posible registrar una respuesta sin pulsar Escuchar. La ayuda visual muestra el pentagrama de la respuesta antes de contestar y luego se registra el resultado por la misma vía, sin una marca de asistencia.

La ayuda es pedagógicamente útil; lo que falta es distinguir qué se ha evaluado. **Corregir:** identificar intentos asistidos y separar su progreso del reconocimiento auditivo autónomo. En evaluación, exigir una reproducción válida o informar claramente que el intento no midió escucha. El texto “Lo que escuchaste” tampoco debería aparecer cuando todavía no se reprodujo nada.

### M14. ChordSync: el modo archivo oculta los acordes que promete descubrir

**Ubicación:** `herramientas/chordsyncpro/index.html:373` y presentación en `:415`.

Una regla `display:none!important` oculta timeline, acorde actual, reproductor y exportación de resultados. Tras analizar el WAV de prueba aparecen tonalidad, BPM, compás y notas de escala, sin una progresión visible. La introducción sigue prometiendo descubrir los acordes de la canción.

**Corregir:** acordar el alcance del modo simplificado: ofrecer acceso claro a los acordes o describirlo como detector estimado de tonalidad/tempo y explorador de escala. No basta con que el motor los calcule si el usuario no puede verlos.

También conviene rotular tempo, compás y tonalidad como estimaciones, con incertidumbre cuando corresponda. El audio sintético sin percusión devolvió 60 BPM y 4/4; no se usa este ejemplo ambiguo para afirmar que esas cifras sean musicalmente falsas ni para medir precisión sobre grabaciones reales.

### M15. Pruebas desactualizadas y un ejemplo que ya no aparece

Tres de los cuatro fallos de la suite son problemas del propio harness, no pruebas de una caída de las aplicaciones:

1. `auditorias/playback-regression.test.cjs`: falta `fallbackMedia` en el contexto aislado de Speed; con esa única incorporación temporal pasan las 62 aserciones.
2. `shared/course-layout.test.js`: exige una cadena literal de una implementación anterior de Armonía Funcional.
3. `shared/musical-audit.test.js`: intenta modificar una cadena de exportación antigua de Jazz; la sustitución ya no ocurre y `suffixIntervals` no queda disponible para la prueba.

El cuarto sí señala una pérdida de cobertura visual: `shared/concept-examples.test.cjs` detecta que **“Tres formas de la escala menor”** no existe como clave del catálogo. La aplicación pide el ejemplo por ese título y obtiene una cadena vacía. La comprobación adicional encontró **1 bloque sin ejemplo entre 93** de Lectura Musical. El texto teórico del bloque sigue presente y explica las tres formas.

**Corregir:** actualizar fixtures e inyecciones sin debilitar las aserciones, restaurar el ejemplo y preferir identificadores estables a títulos editoriales. Incorporar estas pruebas al control previo al despliegue. La suite debe terminar sin fallos reales ni fallos conocidos ignorados.

### M16. Diapasón: las notas del canvas no tienen una alternativa operable con teclado

**Ubicación:** `herramientas/diapason-virtual/index.html:1228` y manejadores del tablero.

El árbol accesible presenta el diapasón como un contenedor con el nombre de la escala, sin notas individuales operables. El canvas no tiene foco ni una cuadrícula semántica de posiciones. Los atajos encontrados controlan imagen o reproducción de partitura; no sustituyen el acto de elegir una cuerda/traste.

**Corregir:** navegación por cuerda/traste con flechas y activación con Enter/Espacio, o una vista equivalente de botones con nombre de nota y posición. Exponer también el rol musical mediante texto, sin depender exclusivamente del color. Revisar el patrón en los otros diapasones; este hallazgo está confirmado en Diapasón Virtual y no constituye una certificación completa de accesibilidad de todas las páginas.

## Diseño, contenido y enseñanza

**Lo que conviene conservar.** La identidad oscura y dorada es reconocible; las vistas examinadas en escritorio mantienen una presentación ordenada. El modo Básico/Pro del metrónomo, Aprender/Practicar/Progreso de Ear Training y el estudio guiado del Diapasón son buenas decisiones. La relación entre instrumento, pentagrama y audio ofrece valor pedagógico. Las pruebas existentes cubren cuestiones musicales importantes como silencios, ligaduras, transposición y duración, además de validar estructuras.

**Carga inicial de controles.** Los diapasones exponen de entrada muchas selecciones y vocabulario avanzado. En la captura de escritorio algunos valores quedan truncados. Para iniciación, conviene una ruta visible de tres pasos: elegir instrumento, escuchar/tocar y completar una tarea breve; desplegar afinaciones especiales, voicings y opciones de partitura cuando se necesiten. Aprovechar el estudio guiado existente. Esto es una mejora de presentación, no una razón para eliminar herramientas avanzadas.

**Niños y adultos.** Los instrumentos, el afinador y el metrónomo pueden apoyar clases de ambos públicos si el docente selecciona los controles y objetivos adecuados. Ear Training necesita una entrada por conocimientos previos y rondas cortas con distractores válidos; el número de funciones no garantiza progresión. AAC, ChordSync y las opciones armónicas avanzadas requieren conceptos previos y no deberían presentarse como una actividad autónoma inicial para niños. Producción Musical y Tabla de Frecuencias conservan expresamente su orientación a adultos, conforme a lo indicado por la escuela.

**Historia del Jazz.** La cronología general de estilos examinada es compatible con la organización histórica del programa del Herbie Hancock Institute, y la página ya avisa que las etapas se solapan. No se detectó en esa muestra una secuencia básica equivocada. Falta una bibliografía explícita y las búsquedas abiertas en YouTube no garantizan una versión concreta de la grabación. Conviene citar fuentes por tema y añadir escucha con grabación, intérprete, año y una pregunta sobre un momento identificable. No se certificaron una por una todas las fechas, grabaciones ni atribuciones. [Programa histórico de Jazz in America](https://www.jazzinamerica.org/Overview/Syllabus), [ejemplo de periodización con solapamientos](https://www.jazzinamerica.org/lessonplan/8/6/209).

**Lenguaje y estados.** Unificar “fundamental/tónica” según contexto, acentos de nombres de modos y mensajes de error en español. Explicar qué mide cada herramienta y diferenciar una estimación automática de un resultado confirmado. Los fallos M02–M05 y M12–M13 afectan directamente a lo que el alumno aprende o a cómo se interpreta su desempeño; deben ir antes de mejoras cosméticas.

## Orden propuesto de trabajo

1. Duración y audio: M01, M02, M03 y M07.
2. Corrección musical y evaluación: M04, M05, M11, M12 y M13.
3. Conservación de documentos y recursos: M06 y M08.
4. Exportación y coherencia de controles/resultados: M09, M10 y M14.
5. Suite limpia, accesibilidad y pulido pedagógico: M15, M16 y recomendaciones de presentación/fuentes.

Cada bloque debería cerrar con reproducción del caso original, comprobación de la solución y una prueba de regresión útil. Concurrencia, cancelación y geometría temporal merecen pruebas de comportamiento, no solo búsquedas de cadenas en el código.

## Evidencia y límites

- Probes de las funciones de la base auditada `6a81b18`, leída mediante `git show`, con entradas sintéticas y recursos simulados: `auditorias/herramientas-musicales-2026-11-17-probes.cjs`. Ejecutar desde la raíz con `node auditorias/herramientas-musicales-2026-11-17-probes.cjs`; imprime los resultados. Son reproducciones diagnósticas, no una suite que deba aprobar los errores actuales.
- Resultados conservados: `auditorias/herramientas-musicales-2026-11-17-resultados.json`, con lista de archivos de prueba, resultados, límites de los mocks y comprobaciones de descargas.
- Capturas: `herramientas-musicales-2026-11-17-diapason.png`, `herramientas-musicales-2026-11-17-chordsync.png` y `herramientas-musicales-2026-11-17-speed-mp3.png`, dentro de esta carpeta.

La revisión usa el repositorio servido por HTTP local y el navegador de escritorio disponible, con vista observada de 1280 × 720. No se activaron permisos de micrófono ni controladores MIDI físicos. Los casos de recursos y alturas se probaron con mocks o señales sintéticas; no sustituyen una medición acústica con instrumentos reales. No se verificaron físicamente Safari/iOS/Android, latencia de hardware, cada formato audiovisual anunciado, toda exportación de partitura ni exactitud de ChordSync sobre un corpus de canciones. Tampoco se realizó una auditoría de seguridad integral ni una certificación de accesibilidad.

Estas limitaciones acotan lo que se puede afirmar: “sin fallo nuevo encontrado en lo probado” no significa “aplicación certificada sin errores”.
