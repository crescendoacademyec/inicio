# Auditoría de Tabla de frecuencias · 17 de noviembre de 2026

Estado: T01–T10 corregidos. El diagnóstico conserva los problemas de la versión revisada (`533e039`); el cierre documenta los cambios y su validación.

## Dictamen y público

**La herramienta tiene una base útil, interactiva y profesional para adultos que estudian mezcla y producción, pero todavía contiene errores que pueden enseñar o reproducir algo distinto de lo anunciado.** Su mayor fortaleza es conectar consulta por instrumento, representación visual, procesamiento audible y entrenamiento. No es todavía un recorrido autónomo suficientemente guiado para un adulto que empieza desde cero.

Por indicación expresa de la escuela, esta evaluación es exclusivamente para adultos. No se propone una adaptación infantil ni se considera la ausencia de contenidos infantiles un defecto. La progresión debe distinguir experiencia y objetivos: adulto principiante, estudiante con DAW y usuario avanzado. Las recomendaciones educativas de este informe son juicio de diseño pedagógico; no son resultados de un estudio con alumnos.

## Alcance y evidencia

- Revisión del catálogo y sus convenciones, sugerencias EQ, propuestas de dinámica/mastering, laboratorio de procesamiento, ejercicios antiguos y motor compartido, mapas de mezcla, analizador y exportaciones. Lectura de las fuentes y auditorías previas del repositorio.
- La interfaz muestra 58 referencias y 65 instrumentos/buses en EQ. La incorporación reciente al entrenamiento general ofrece cinco habilidades de EQ/filtros más repaso; convive con ocho ejercicios adicionales de procesamiento y tres módulos antiguos.
- Navegador local: ficha de voz → cargar sugerencias en EQ; laboratorio → examen de ruido rosa → responder → detener → reproducir → volver a responder. El error de frecuencia y el bloqueo de navegación se reprodujeron en la interfaz.
- Sondas Node sobre el parser real, el módulo Direction extraído con nodos de audio simulados y la conversión Hz/nota. La sonda de Direction verifica los parámetros renderizados y las conexiones; no sustituye una prueba auditiva con personas.
- **78 pruebas existentes aprobadas**, sin fallos:

```sh
node --test herramientas/tabla-frecuencias/tests/*.test.cjs shared/listening-engine.test.cjs shared/music-compendium/compendium.test.cjs shared/gate-lab/model.test.cjs
```

- Contraste de documentación primaria de Web Audio y FabFilter el 17/11/2026. No se activó micrófono ni captura de pestañas. No se certifican accesibilidad completa, cada combinación de navegador/dispositivo, ni todos los resultados sonoros de cada propuesta del catálogo.
- Los arreglos y coordenadas de mapas son propuestas editoriales, no mediciones de discos. No se exige que reproduzcan mezclas comerciales. Los fallos de permisos/ruteo del analizador corregidos en septiembre siguen cubiertos por sus pruebas y no se vuelven a presentar como pendientes.

## Hallazgos

### T01 · Alta · Los rangos con Hz y kHz cargan una frecuencia equivocada

**Ubicación:** `eq-response.js`, `frequencyFromText`; recomendaciones de voz y caja en `data.js`; carga desde `app.js` y `eq-visual.js`.

El parser aplica ×1000 a los dos números si encuentra «kHz» en cualquier punto. `800 Hz–1.5 kHz` y `500 Hz–1.5 kHz` terminan en **20.000 Hz**, por el límite aplicado después de calcular el centro. Sus centros geométricos correctos son aproximadamente **1.095 Hz** y **866 Hz**.

En navegador, «Ver todas las sugerencias en el ecualizador» de Voz mostró: «Banda 1: Campana (PEQ), 20000 Hz… 800 Hz–1.5 kHz». No es solo un texto incorrecto: la banda se utiliza también para procesar audio.

**Corrección y aceptación:** interpretar la unidad de cada extremo, admitir coma/punto decimal y rangos con unidad compartida; comprobar los ejemplos reales del catálogo de principio a fin. No convertir silenciosamente una expresión ambigua en un corte a 20 kHz.

### T02 · Alta · Boost/Cut puede anunciar un corte y reproducir el realce anterior

**Ubicación:** `ear.js`, módulos Direction y Noise: `start`, `setupGraph`, `applyLearn` y manejadores de ganancia/dificultad.

El sonido modificado se prerenderiza con `ProcessingDSP.filter` y se conecta directamente a `wetGain`. Después, los botones modifican un `filterNode` que no recibe esa señal. En Direction, seleccionar una frecuencia prepara un realce; al pulsar Cut durante la reproducción, la interfaz muestra el corte pero conserva ese audio.

Sonda reproducible: preparar 1 kHz/+6 dB → Boost → Cut. El DSP se llamó únicamente con **+6**, mientras el estado visible pasó a «1000 Hz · −6 dB cut». La misma desconexión afecta cambios de ganancia durante la reproducción en Noise. Además, algunas devoluciones utilizan la ganancia global actual en lugar de conservar la ganancia de la ronda.

**Corrección y aceptación:** usar una sola cadena efectiva o regenerar las variantes al cambiar parámetros, conservando posición y comparación de nivel. Guardar frecuencia, signo y ganancia en la ronda. Verificar espectralmente que Boost/Cut y 3/6/12 dB cambian lo que se escucha y que la devolución describe la señal de esa ronda.

### T03 · Alta · Repetir una ronda respondida bloquea el avance

**Ubicación:** `ear.js`, Noise y Tone: manejador de reproducción, `renderRound` y guarda `answered`.

Después de responder, detener y reproducir de nuevo, `renderRound` elimina la devolución, recrea opciones aparentemente disponibles y oculta «Siguiente». Sin embargo, `answered` sigue siendo verdadero y las respuestas no hacen nada.

Se reprodujo en ruido rosa: una respuesta registrada, detener → reproducir, opciones activas sin devolución ni Siguiente; seleccionar después la respuesta correcta no registró nada ni recuperó la navegación. Tone contiene el mismo recorrido de estado.

**Corrección y aceptación:** repetir audio debe conservar el resultado y el acceso a la siguiente ronda. Solo una nueva ronda debe reiniciar evaluación y opciones. Probar responder → detener → repetir → siguiente, sin doble puntuación.

### T04 · Media · La ficha de toms confunde recuperación del compresor con cierre de gate

**Ubicación:** `data.js`, compresión de Toms y comentario de Tom de Piso.

Se aconseja usar hold para no cortar la resonancia y se afirma que un release muy corto corta la cola. En un compresor descendente, release describe la recuperación de ganancia; no es el cierre de una puerta. Su efecto sobre cola, bombeo y siguiente golpe depende de señal, detector, ataque y compensación. Algunos compresores sí tienen hold, por lo que no corresponde afirmar que ese control sea exclusivo de los gates.

**Corrección y aceptación:** explicar el objetivo de envolvente, escuchar ataque/cuerpo/cola y separar una eventual recomendación de gate. Evitar una relación universal «release corto = cola cortada». Referencia de recuperación y dependencia del programa: [FabFilter, controles temporales](https://www.fabfilter.com/help/pro-c/using/timecontrols).

### T05 · Media · El glosario y algunas ayudas contradicen explicaciones más precisas de la propia app

**Ubicación:** `data.js`, glosario y técnicas; `dynamics-reference.js`, ayuda Ratio/knee.

- De-esser se define como compresión «solo en una banda». Puede detectar sibilancia en una banda y atenuar toda la señal, o procesar una banda. [FabFilter documenta ambos modos](https://www.fabfilter.com/help/pro-ds/using/advancedcontrols).
- Gate se presenta como bloqueo, aunque su range puede dejar una atenuación finita. Conviene distinguir gate y expansión, en coherencia con el laboratorio.
- Compresión paralela promete conservar transitorios de manera absoluta. La combinación y la comparación de nivel, fase/latencia y cantidad de rama procesada deben formar parte de la explicación.
- La definición de limiter puede interpretarse como garantía de techo/distorsión; debe distinguir el objetivo del procesador y sample peak/true peak, como ya hace la sección de mastering.
- «Normalization» describe solo una normalización por pico sin nombrarla; falta distinguirla de normalización de sonoridad.
- «Ratio es la pendiente» es matemáticamente impreciso: en la transferencia salida frente a entrada, por encima del knee y sin makeup variable, la pendiente es **1/ratio**. El ejemplo 4:1 del glosario sí está bien. [FabFilter, relación entrada/salida](https://www.fabfilter.com/help/pro-c/using/dynamicscontrols).

**Corrección y aceptación:** alinear las definiciones breves con el diccionario compartido y los límites ya declarados por la app. Revisar también los paneles antiguos, no solo el diccionario nuevo.

### T06 · Media · El límite agudo de guitarra no coincide con la nota escrita

**Ubicación:** `data.js`, `guit-ac`; perfil de nylon derivado.

El rango es `[82.4, 1174.7]`, mientras la descripción dice E2–E6. **1.174,7 Hz corresponde a D6**; E6 es aproximadamente 1.318,5 Hz con A4=440. El error se hereda en nylon.

**Corrección y aceptación:** elegir y declarar la extensión concreta del modelo/trastes, y hacer coincidir notas, números y gráfico. Evitar presentar una sola extensión como máxima universal de todas las guitarras.

### T07 · Media · El analizador no identifica su suma mono y conserva un pico «actual» cuando desaparece la señal

**Ubicación:** `analyzer.js`, creación de `AnalyserNode` y `drawFrame`; panel del analizador en `index.html`.

El análisis usa un solo `AnalyserNode`, que reduce a mono para calcular su espectro, aunque la reproducción permanezca estéreo. L y R con polaridad opuesta pueden cancelarse en ese análisis. La interfaz no explica esa convención ni permite contrastar canales. Es una deducción del ruteo y la API, no una reproducción con archivo realizada en esta auditoría. [Web Audio, reducción a mono](https://www.w3.org/TR/webaudio/#time-domain-down-mixing).

Además, el código actualiza «Pico dominante» solo si algún bin supera cero. Cuando todos quedan en el piso de la escala, la última lectura permanece como si fuera actual. Peak hold sí debe poder conservarla; la lectura actual debe indicar ausencia de pico detectable, sin confundir piso de medición con silencio absoluto.

**Corrección y aceptación:** identificar suma mono y ofrecer canales o una lectura complementaria; limpiar la lectura actual al caer al piso. Probar L=R, solo L/R, L=−R y señal seguida de silencio. Como mejora, mostrar resolución aproximada `sampleRate/FFT` y aclarar que dBFS de un bin espectral no es pico temporal ni SPL calibrado.

### T08 · Media · Parte de los archivos exportados no se puede restaurar desde la interfaz

**Ubicación:** `ear.js`, `crescendo:export-progress`; `mix-map.js`, `mixExport`.

«Exportar progreso» del bloque antiguo descarga sesiones y varias claves de almacenamiento, pero carece de importador para ese formato. «Descargar mapa JSON» tampoco tiene importador de mapas. Son registros utilizables externamente, pero no respaldos recuperables desde la app. Esto limita continuar el trabajo en otro navegador/equipo.

El progreso del motor auditivo nuevo **sí tiene importación propia**, y las curvas EQ también tienen otro flujo de recuperación; no deben presentarse todos los JSON como equivalentes.

**Corrección y aceptación:** añadir importadores con identidad de formato/versión, validación y recuperación del estado previo, o nombrar claramente las exportaciones como registros de consulta. Probar ida y vuelta entre dos estados limpios, archivo ajeno y archivo inválido sin sustituir datos válidos.

### T09 · Media · Hay dos conceptos de sesión y progreso sin suficiente delimitación

**Ubicación:** `index.html`, `practiceSessionCard`; `ear.js`, PracticeSession; `listening-integration.js` y motor compartido.

El bloque principal propone sesiones de 5/10 rondas con progreso por habilidad. Más abajo aparece otra «Sesión actual» con meta 20; registra módulos antiguos y ejercicios que emiten `crescendo:practice-result`, pero no las respuestas del bloque principal. Para un alumno, ambos parecen resumir la misma práctica aunque contabilizan cosas distintas.

**Corrección y aceptación:** presentar una sesión principal y módulos complementarios con alcance explícito, o construir un resumen común conservando métricas por habilidad. No sumar precisiones heterogéneas como si fueran una medida única de dominio. Verificar que cada respuesta aparezca en el lugar que promete la interfaz.

### T10 · Mejora pedagógica · Falta un punto de entrada y una progresión práctica para adultos

**Ubicación:** portada de la herramienta y navegación entre sus siete áreas.

La cantidad de referencias y controles resulta útil para consulta; un adulto principiante no recibe suficiente orientación para elegir una primera tarea, saber qué necesita conocer y comprobar que transfirió lo aprendido a una grabación. La convivencia de varios motores de ejercicios aumenta esa carga.

**Propuesta:** un acceso «Empieza aquí» por objetivo y experiencia, manteniendo libre la consulta avanzada. Tres prácticas breves: (1) localizar una zona y relacionarla con una nota/fundamental; (2) diagnosticar un exceso y comparar una sola intervención a nivel semejante; (3) justificar una decisión en contexto con audio propio o material compartido en clase. Vincular cada práctica con conceptos, herramienta y evidencia de salida. No hace falta crear un sistema de entregas: el profesor puede revisar el audio y las decisiones en clase.

La secuencia recomendada es escuchar → describir el problema → formular una hipótesis → cambiar una variable → comparar A/B → comprobar en contexto → explicar la decisión. La meta es criterio transferible al DAW, no memorizar cifras de presets. Para usuarios avanzados, accesos directos y límites de cada modelo deben permanecer visibles.

## Qué conviene conservar

- Distinción explícita entre registro de notas, zona de mezcla y espectro medido; alturas sonoras y convenciones documentadas.
- Advertencias sobre armónicos teóricos, parciales inarmónicos de percusión y dependencia del patch del sintetizador.
- Recomendaciones condicionales y regla de escuchar antes de aplicar cortes. Las fuentes distinguen principios documentados de números editoriales.
- EQ con audio, comparación y compensación RMS identificada como aproximada; carga local de material para trabajar casos reales.
- Dinámica y mapas identificados como modelos visuales, con unidades y límites; mastering distingue compresión simulada, medición y entrega real en DAW.
- Material sintético original y herramientas compartidas con el curso, que permiten mantener conceptos y comportamiento consistentes al corregirlos.

## Orden recomendado de implementación

1. T01–T03: errores de frecuencia, señal audible y bloqueo de práctica, con regresiones específicas.
2. T04–T07: precisión del contenido, coherencia Hz/nota y lectura del analizador.
3. T08–T09: continuidad del trabajo y claridad del progreso.
4. T10: recorrido adulto por objetivos y tareas, verificando que un principiante pueda completar la primera práctica sin recorrer toda la biblioteca.

Las 78 pruebas de la auditoría inicial eran una base de regresión. El cierre siguiente describe las correcciones posteriores autorizadas por la escuela.


## Cierre de correcciones

| Hallazgo | Cambio aplicado |
| --- | --- |
| T01 | Unidades por extremo, coma/punto decimal y rangos con unidad compartida. Las sugerencias de voz/caja cargan sus centros correctos. Expresiones fuera de rango o sin unidad no se convierten silenciosamente a 20 kHz. |
| T02 | `ear-signal.js` es la cadena audible común de ruido rosa y Boost/Cut. Regenera el par nivelado sobre la misma fuente al cambiar ganancia, sincroniza A/B y conserva su posición con transición breve. Cada ronda fija su ganancia; la dificultad posterior se aplica a la siguiente. |
| T03 | Reproducir no reconstruye la evaluación: conserva devolución, opciones deshabilitadas y Siguiente, sin puntuar dos veces. |
| T04–T05 | Toms, ataque de caja, glosario, paralela y ayuda de ratio se alinean con recuperación de ganancia, detector/banda procesada y límites de los modelos. Se distinguen normalización por pico/sonoridad y techo de muestra/true peak. |
| T06 | Acero y nylon declaran una ventana de 20 trastes E2–D6, coherente con 1.174,7 Hz. |
| T07 | Análisis seleccionable de suma mono, L y R; peak hold separado y reiniciado al cambiar canal/FFT; lectura actual limpia al piso. Resolución de bins, límites del espectro y consulta de frecuencia mediante teclado. La selección no altera la escucha estéreo. |
| T08 | Respaldo complementario y mapas importables con identidad, validación y compatibilidad antigua. La práctica conserva la copia previa recuperable y restaura la sesión; el mapa se abre sin sobrescribir los guardados y permite recuperar la escena anterior. Archivos ajenos se rechazan antes de modificar estado. |
| T09 | Se distinguen entrenamiento principal y práctica complementaria, sus sesiones, historiales y respaldos. Se muestran resultados por módulo y aciertos concretos, sin una nota agregada de dominio. |
| T10 | «Empieza aquí» ofrece tres tareas para adultos según experiencia, con prerrequisitos, propósito, herramienta y comprobación: nota/frecuencia, comparación de una intervención y decisión en una mezcla propia o de clase. |

Se actualizan README, fuentes y versiones de recursos. El curso de Producción Musical recibe la versión nueva del catálogo compartido; no se altera su secuencia de lecciones.

### Validación final

**126 pruebas Node aprobadas, sin fallos**, incluidas las regresiones nuevas y las comprobaciones del curso que consume los datos compartidos:

```sh
node --test herramientas/tabla-frecuencias/tests/*.test.cjs shared/listening-engine.test.cjs shared/music-compendium/compendium.test.cjs shared/gate-lab/model.test.cjs herramientas/produccion-musical/tests/*.test.cjs shared/tool-routes.test.cjs
```

**Cuatro comprobaciones con Web Audio real aprobadas** en `herramientas/tabla-frecuencias/tests/audio-browser.html`, mediante OfflineAudioContext sin reproducción ni permisos de micrófono:

- Con L=−R, ambos canales conservan su espectro (−20,06 dBFS espectrales en esta prueba), mientras la suma mono se cancela. Estos valores de bin no son el pico temporal del seno.
- La cadena audible cambia efectivamente de realce a corte: contraste relativo de la componente a 1 kHz respecto de 250 Hz de +5,78 a −5,78 dB, tras el procesamiento y la comparación de nivel.
- La salida permanece finita y conserva margen de amplitud.

Navegador de escritorio: recomendación de voz cargada a **1.095 Hz**, guía y acceso al entrenamiento, responder/detener/repetir/siguiente, descarga e importación del respaldo con recuperación de la sesión, rechazo de un mapa en el importador de práctica sin cambiar su contador, importación de mapa y recuperación de Pop. Sintaxis de los nueve scripts nuevos/modificados y referencias locales aprobadas. Captura de la guía: `/tmp/tabla-frecuencias-corregida.png`.

La herramienta de navegador no aplicó el tamaño móvil solicitado (las páginas conservaron 1.280 px), por lo que esta validación no afirma una comprobación móvil nueva. Se conserva el CSS adaptativo y el recorrido pasa a una columna por debajo de 850 px. Tampoco se presenta esta validación como una certificación de accesibilidad ni de resultados pedagógicos con alumnos.
