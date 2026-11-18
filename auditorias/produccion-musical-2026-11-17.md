# Auditoría de Producción Musical · 17 de noviembre de 2026

Estado: hallazgos P01–P10 corregidos. El diagnóstico siguiente documenta la versión anterior; el cierre al final describe la implementación y su validación.

## Dictamen

La base del curso es sólida y mantiene un enfoque pedagógico, interactivo y profesional. La secuencia de escucha, preparación, captura, edición, mezcla y entrega tiene sentido. Los proyectos piden decisiones y evidencias, las preguntas ofrecen explicación y se distingue honestamente entre simulación, procesamiento audible y trabajo en un DAW.

No consideraría todo correcto todavía: hay fallos reproducibles en filtros, medición estéreo e importación de progreso, además de problemas de comparación y enlaces. La propuesta sirve especialmente para adolescentes y adultos acompañados por un profesor. Para niños y principiantes necesita un recorrido de entrada más corto, tareas graduadas y menos lectura simultánea. La edad por sí sola no determina el nivel: deben importar experiencia, autonomía y conocimientos previos.

La auditoría anterior de octubre ya identifica necesidades de itinerario y demostraciones de DAW. Esta revisión añade comprobaciones sobre la implementación actual; no invalida la decisión de compartir multitracks y revisar evidencias directamente en clase. No hace falta construir un sistema de entregas o calificación docente para resolver los hallazgos siguientes.

## Alcance y evidencia

- Lectura de las 48 lecciones y sus 48 preguntas, los 12 proyectos, ampliaciones, modelos matemáticos, motor de audio, ilustraciones y atlas visual.
- Revisión de las dependencias de escucha, diccionario y gate/expansor. Los catálogos completos de EQ, compresión y mapas de mezcla compartidos con Tabla de frecuencias requieren su auditoría específica posterior.
- Navegador local: curso, devolución incorrecta, evaluación, proyecto, EQ, audio local sintético y navegación entre lecciones. Muestra móvil a 375 × 812, incluida recarga desde ese tamaño; sin desbordamiento horizontal global en esa muestra. El índice se cierra correctamente al cargar en móvil.
- **40 pruebas existentes aprobadas**, con este comando:

```sh
node --test herramientas/produccion-musical/tests/*.test.cjs shared/tool-routes.test.cjs shared/listening-engine.test.cjs shared/gate-lab/model.test.cjs
```

- Sondas adicionales sobre el importador real y las señales del ejercicio de fades. Las pruebas existentes no detectan los fallos de Web Audio documentados abajo; aprobarlas no demuestra que todo el contenido o procesamiento sea correcto.
- Contraste de fuentes primarias el 17/11/2026. No es una certificación de accesibilidad ni una evaluación experimental de resultados de aprendizaje.

## Hallazgos y correcciones propuestas

### P01 · Alta · Los filtros anunciados como Butterworth no usan el Q correcto de Web Audio

**Ubicación:** `herramientas/produccion-musical/audio-lab.js`, líneas 18 y 33; afirmación en `curriculum.js`, lección `mezcla-2`, e `index.html`.

Se calculan los factores Q lineales de las secciones Butterworth y se asignan directamente a `BiquadFilterNode.Q`. En pasa altos y pasa bajos, esa API interpreta Q en decibelios; para una campana lo interpreta linealmente. Véase [Web Audio, BiquadFilterNode.Q](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-q).

En navegador, pasa bajos de 12 dB/octava a unos 998 Hz: el punto de la curva más próximo al corte queda alrededor de **+0,68 dB**. Una respuesta Butterworth debe estar aproximadamente a −3,01 dB en su corte y no tener ese realce. Texto, gráfico y sonido enseñan una propiedad distinta de la prometida. El retorno del delay también asigna `.707` a un pasa bajos.

**Corrección:** convertir cada Q lineal a `20 × log10(Q)` al configurar esos filtros, utilizando la misma conversión en el gráfico y el procesador. Revisar también el filtro del retorno. Conservar Q lineal para los tipos que lo requieren.

**Aceptación:** comprobar pasa altos y bajos de 12/24/48 dB/octava con la API real del navegador, corte cercano a −3,01 dB, ausencia de realce Butterworth y coincidencia entre curva y audio. No extender esta conversión indiscriminadamente al DSP propio de los ejercicios.

### P02 · Alta · Pico y RMS se calculan desde la suma mono de una fuente estéreo

**Ubicación:** `audio-lab.js`, conexión de la línea 13 y función `draw`.

Un único `AnalyserNode` entrega las muestras utilizadas por ambos medidores. Su análisis temporal reduce los canales a mono, incluso cuando la escucha sigue en estéreo. [Web Audio, reducción temporal a mono](https://www.w3.org/TR/webaudio/#time-domain-down-mixing).

**Reproducción:** WAV sintético estéreo, seno de 1 kHz, amplitud 0,5, L y R con polaridades opuestas; entrada y salida a 0 dB y «Escuchar en mono» desactivado. Cada canal tiene pico de **−6,02 dBFS** y RMS aproximado de **−9,03 dBFS**. La interfaz mostró pico cercano a **−102 dBFS**, debido a la cancelación en el análisis. El pequeño residuo depende de la cuantización del archivo.

Esto puede ocultar niveles elevados de los canales y confundir pérdida en mono con silencio del archivo estéreo.

**Corrección:** medir L/R por separado, mostrar pico por canal o máximo de ambos y definir la convención del RMS estéreo. Si se conserva el visualizador mono, identificarlo expresamente y separarlo de la medición de canales.

**Aceptación:** probar mono, estéreo idéntico, solo L, solo R y L=−R; la cancelación de la suma debe poder observarse sin borrar la información de nivel de los canales.

### P03 · Alta · El importador acepta archivos de otro tipo y reemplaza el curso por progreso vacío

**Ubicación:** `herramientas/produccion-musical/app.js`, `sanitize` y `importProgress`.

La única comprobación de identidad es `version === 1`. Una copia del entrenamiento auditivo también tiene esa versión, con campos `stats` y `sessions`. Al pasarla por el importador real se acepta y se transforma en un curso vacío con `current: sonido-1`. Incluso `{version: 1, hello: 'world'}` se acepta.

La importación sustituye el estado actual y anuncia éxito. Se intenta guardar una copia previa local, lo cual mitiga el problema, pero no valida el archivo ni ofrece una restauración visible de esa copia. El estudiante puede confundir fácilmente los dos respaldos que descarga desde esta misma aplicación.

**Corrección:** añadir identificador de aplicación/formato y validación de estructura; admitir los respaldos antiguos legítimos mediante reconocimiento explícito. Rechazar archivos de escucha u otros cursos sin modificar estado ni respaldo. Hacer recuperable la copia anterior. El progreso auditivo necesita un mecanismo propio de restauración, o una explicación clara de que su JSON solo sirve como registro exportado.

**Aceptación:** ida y vuelta del curso, compatibilidad antigua, rechazo de JSON ajeno, conservación del estado ante error y recuperación después de una importación válida.

### P04 · Media · La compensación de salida modifica A y B por igual

**Ubicación:** `audio-lab.js`, `apply` y `compare`.

La compensación de salida se aplica con independencia de `bypass`. Si una compresión baja el nivel y el alumno lo compensa en B, al alternar a «A · Sin efectos» esa misma compensación también modifica A. No se mantiene una referencia estable para comparar a nivel semejante, como piden las lecciones.

**Corrección:** separar ganancia común de salida y compensación del proceso, o guardar ajustes independientes A/B. Explicar qué etapas evita el bypass. No hace falta prometer igualación automática de sonoridad.

**Aceptación:** conservar estable la referencia A al ajustar la compensación de B y alternar repetidamente, en EQ y compresión.

### P05 · Media · El ejercicio de fades contiene clics ajenos al contraste que pide reconocer

**Ubicación:** `shared/listening-engine.js`, rama `artifacts` de `create`.

La referencia y las variantes de fade lineal y S comienzan cada nota periódica con una cosenoide de amplitud distinta de cero, tras un tramo de silencio. La sonda sobre el audio generado muestra, al segundo 1, un salto de **0 a aproximadamente 0,22** en la referencia y en las variantes con fade.

La rampa global de reproducción suaviza el comienzo del archivo, pero no los nuevos ataques internos. Por ello también hay discontinuidades en ejemplos que deberían permitir distinguir el clic del corte frente a un borde suavizado. El objetivo puede reconocerse por el final, pero queda contaminado por otros clics.

**Corrección:** dar a todos los ejemplos un ataque común suave; dejar la discontinuidad deliberada exclusivamente en el borde evaluado. Mantener duración, fuente y comparación de nivel controladas.

**Aceptación:** inspección de todas las uniones internas y escucha humana de referencia, corte abrupto, fade lineal y S. Comprobar también los efectos en Tabla de frecuencias, que comparte este motor.

### P06 · Media · Algunas prácticas y enlaces de consulta llevan a una herramienta o lección diferente del objetivo

**Ubicación:** campos `lab` de `curriculum.js`, `shared/music-compendium/data.js` y enlaces de repaso de `shared/listening-engine.js`.

Ejemplos concretos:

| Objetivo | Destino actual | Destino o comportamiento recomendado |
| --- | --- | --- |
| Síntesis y ADSR, `midi-2` | Botón genérico abre EQ | Ir al generador ADSR ya incluido en la lección |
| Micrófonos y distancia, `grabacion-1` | Laboratorio visual de fase | Prueba de captura en DAW y enlace al modelo de proximidad |
| Diccionario: ADSR | `midi/midi-3`, sampling | `midi/midi-2` |
| Diccionario: comping | `edicion/edicion-1`, cortes/fades | `edicion/edicion-2` |
| Diccionario: reverb/predelay | `profundidad/profundidad-2`, delay | `profundidad/profundidad-1` |
| Diccionario: Mid/Side y mono | `profundidad/profundidad-1`, reverb | `profundidad/profundidad-3` |

La consulta de compresión paralela también apunta a imagen estéreo en vez de a `profundidad-4`. La devolución auditiva agrupa fase con balance y todos los temas espaciales con reverb; conviene asignar el repaso por habilidad concreta.

**Corrección:** distinguir práctica dentro de la lección, laboratorio del navegador y trabajo en DAW. Enlazar a la sección pertinente y conservar un retorno al punto de estudio. No hace falta añadir un nuevo sintetizador o grabador: varias herramientas necesarias ya existen.

### P07 · Media · La evaluación repite las cuatro preguntas de lectura y ofrece poca transferencia

**Ubicación:** `app.js`, `assessment`; preguntas de `curriculum.js`.

Se barajan preguntas y opciones correctamente, y la devolución explica la respuesta. Sin embargo, la evaluación de una materia reutiliza exactamente sus cuatro comprobaciones de lectura. Varios distractores se descartan sin comprender el concepto: una entrada de micrófono frente a «eliminar todas las reflexiones», o tratamiento acústico frente a «aumento automático de resolución digital».

Esto sirve como comprobación inicial, tal como lo presenta la página, pero un 4/4 aporta poca evidencia de aplicar el contenido a una situación nueva.

**Corrección:** mantener preguntas sencillas durante el estudio e incorporar variantes a la evaluación: cálculos con otros valores, elección de ruta a partir de un diagrama, diagnóstico de una comparación y decisiones justificadas. Añadir tareas con resultados observables donde el laboratorio pueda comprobarlos; separar comprensión conceptual, reconocimiento auditivo y desempeño en el proyecto.

**Aceptación:** que el alumno deba transferir la regla a un caso nuevo, reciba explicación de su error y pueda volver al tema exacto. No convertir una respuesta múltiple en acreditación profesional.

### P08 · Media · Falta un recorrido de entrada graduado para niños y adultos principiantes

**Ubicación:** ruta de estudio y presentación de lecciones.

Los filtros «Fundamentos / Construcción / Finalización» clasifican materias, pero no constituyen un diagnóstico ni un itinerario adaptado. La primera lección ya reúne período, longitud de onda, dBFS/SPL, timbre, pentagrama, piano y varios gráficos. Es coherente como consulta, pero la cantidad de conceptos simultáneos puede superar lo necesario para una primera experiencia.

**Corrección:** proponer una ruta inicial de tareas breves: reconocer grave/agudo y fuerte/suave, crear un patrón, comparar dos versiones, grabar una frase, editar un borde y entregar un fragmento. Presentar primero una consigna y un control; desplegar fórmulas, tablas y ampliaciones después. Añadir diagnóstico corto, requisitos y tiempos orientativos de práctica revisables por el docente.

Para niños: lenguaje directo, demostración antes de explicación extensa, respuesta oral o práctica y acompañamiento. Para adultos: acceso a fundamentos sin tono infantil, opción de acelerar según experiencia y proyectos relacionados con sus objetivos. La ruta avanzada debe seguir disponible para ambos.

El ejercicio de Suno ya ofrece alternativa con maquetas propias sin cuenta: conservarla. Su uso no debe ser requisito de la ruta infantil; las edades indicadas en el curso coinciden con las [condiciones oficiales consultadas](https://suno.com/terms).

### P09 · Media · Los proyectos tienen buenos criterios, pero faltan descriptores para graduar el logro

**Ubicación:** `curriculum.js`, `project.rubric`; interfaz de proyectos.

Se piden evidencias útiles y la interfaz aclara que las casillas son autoevaluación para conversar en clase. Esa distinción es correcta y debe conservarse. El límite está en que «Puedo rastrear una señal» o «La comparación A/B está compensada» solo admiten sí/no, sin explicar qué se espera de un primer intento frente a un trabajo autónomo.

**Corrección:** agregar descriptores breves: necesita ayuda, lo realiza con apoyo, lo realiza de forma autónoma; acompañar con un ejemplo de evidencia y siguiente paso. Permitir dejar «sin revisar». Priorizar pocos criterios centrales por proyecto.

La revisión puede seguir realizándose fuera de la plataforma, con los materiales que entrega la escuela. No se propone subir archivos, evaluar automáticamente interpretaciones ni crear un sistema docente adicional.

### P10 · Media · El cambio de lección pierde el foco de navegación

**Ubicación:** `app.js`, `course` y `route`.

Al activar «Escucha crítica y referencias →» desde la primera lección, el artículo se reemplaza y se desplaza la página al inicio. El foco queda en `BODY`, aunque el nuevo encabezado ya tiene `tabindex="-1"`. No se llama a su método `focus`.

Quien navega con teclado pierde el punto de continuidad y no recibe una colocación explícita en el nuevo contenido.

**Corrección:** trasladar el foco al encabezado o región principal después de una navegación iniciada por el usuario; conservar el comportamiento del enlace para saltar al contenido. Revisar lo mismo en proyecto, evaluación, consulta y laboratorio.

**Aceptación:** recorrido completo solo con teclado, foco visible y secuencia comprensible después de cada cambio. La prueba móvil y los nombres de gráficos existentes no sustituyen una revisión con lector de pantalla.

## Contenido que conviene conservar

- Diferencias entre nivel digital, presión acústica y sonoridad; entre RMS, LUFS, pico de muestra y true peak.
- Cálculos de período, subdivisiones, duración del búfer, modos axiales y compresión estática en los ejemplos revisados.
- Distinción entre tratamiento y aislamiento, ganancia de captura y fader, inversión de polaridad y retardo, MIDI y audio, sustain como nivel, stems y multitracks.
- Comparación de gain staging con el kick como ejemplo original, con sus límites bien declarados: no convertir esos rangos en una norma obligatoria.
- Separación de reverberación en DAW, fase visual, EQ audible y EQ orientativa por instrumento. El problema de P06 es el destino de ciertas prácticas, no que todas deban ejecutar un DAW en el navegador.
- Proyectos con fuentes identificadas, decisiones musicales y revisión del exportado completo. Los plugins se presentan por función y se recomienda comenzar con los incluidos en el DAW.
- Las ilustraciones generadas con IA están identificadas como tales; las fotografías de modelos reales incluyen atribución. No inferir exactitud de montaje o directividad solo por una ilustración.

## Fuentes vigentes contrastadas

Las referencias de sonoridad se usan con contexto: la guía de [Spotify](https://support.spotify.com/us/artists/article/loudness-normalization/) distingue normalización de reproducción y consejos de mastering; [EBU R 128](https://tech.ebu.ch/publications/r128) corresponde a programa broadcast. No encontré motivo para reemplazarlo por una receta universal de −14 LUFS.

El texto de Suno coincide en lo esencial con sus [condiciones vigentes desde septiembre de 2026](https://suno.com/terms) y su [anuncio sobre descargas](https://suno.com/blog/suno-updates-tos): mantener fecha de consulta y revisión periódica, sin tratar permiso contractual como garantía de copyright.

La guía de Ecuador distingue protección y registro, de acuerdo con [SENADI](https://www.derechosintelectuales.gob.ec/registro-de-obras-de-derecho-de-autor/). Los requisitos de entrega física descritos están respaldados por su [instructivo de 2026](https://www.derechosintelectuales.gob.ec/wp-content/uploads/2026/02/INSTRUCTIVO-PROCESO-PARA-REGISTRO-DE-OBRAS_2026.pdf). Esta comprobación se refiere a la explicación educativa; no certifica contratos o expedientes particulares.

## Orden recomendado

1. P01–P03: corregir procesamiento, medición y conservación de progreso, con pruebas que reproduzcan los fallos.
2. P04–P06 y P10: asegurar comparación útil, ejemplos limpios, destinos pertinentes y navegación continua.
3. P07–P09: incorporar evaluación de transferencia, recorrido inicial y rúbricas graduadas, sin aumentar innecesariamente el volumen teórico.
4. Actualizar la documentación de octubre y sus recuentos al cerrar la corrección; conservar el historial de esta auditoría.

La siguiente página de la secuencia acordada, después de corregir Producción Musical, es Tabla de frecuencias. Sus herramientas compartidas deben tener comprobaciones de regresión al modificar código usado por ambas aplicaciones.


## Cierre de correcciones · 17 de noviembre de 2026

- **P01:** procesador y gráfico comparten la configuración de secciones de filtro. Q se convierte a dB solo para pasa altos/bajos de Web Audio; también se corrigió el retorno del delay. La respuesta real de los seis filtros dio −3,0103 dB en el corte sin realce.
- **P02:** medición separada L/R antes del plegado mono y del volumen de escucha. Se muestra pico máximo y picos de ambos canales; el RMS declara su convención. El gráfico se identifica como suma mono. Mono, estéreo idéntico, solo L, solo R y polaridades opuestas se comprobaron en renderización real offline.
- **P03:** formato del curso identificado y versión 2, reconocimiento de las copias completas antiguas, rechazo de copias ajenas antes de escribir, respaldo previo obligatorio y botón para intercambiar la copia anterior. Las marcas y notas antiguas se conservan; los niveles nuevos de rúbrica no heredan una aprobación automática. La escucha tiene exportación e importación propias.
- **P04:** la compensación actúa solo en B. A conserva la entrada común y evita filtros, compresión, retorno de delay y compensación de B. La comparación sigue siendo manual y está explicada.
- **P05:** cada nota del ejercicio de fades empieza con el mismo ataque suave de 10 ms; la discontinuidad intencional se conserva únicamente en el corte que se debe reconocer. Se comprobaron las uniones internas de las señales generadas y la conservación del contraste final.
- **P06:** prácticas identificadas como trabajo en DAW, herramienta de la lección o complemento de laboratorio; enlaces a ADSR y proximidad abren el recurso y trasladan el foco. Los destinos del diccionario y de las veinte habilidades auditivas se alinearon con su lección. Hay retorno desde el laboratorio a la lección actual.
- **P07:** banco adicional de 48 casos de aplicación, diferente de las 48 preguntas de lectura; mantiene devolución y enlaces al tema. Hay 12 tareas de lección con corrección propia y dos consignas que comprueban directamente los controles de EQ y compresión. Los resultados de lectura, tareas, escucha y proyecto se distinguen.
- **P08:** recorrido de seis experiencias con objetivos, tres acciones, tiempos orientativos y evidencia. En esas experiencias la teoría y las prácticas adicionales se despliegan después; el primer contraste A/B tiene sonidos propios. Se puede elegir trabajo acompañado o autónomo y usar una orientación inicial sin bloquear contenidos. Los usuarios antiguos mantienen por defecto el curso completo.
- **P09:** criterios de proyecto con estados sin revisar, necesita ayuda, con apoyo y autónomo; ejemplos de evidencia y bitácora con siguiente paso. Se conserva la revisión directa con el docente. La guía descargada incluye niveles y declaraciones anteriores.
- **P10:** el foco pasa al encabezado o recurso pertinente tras navegar; se conserva el enlace para saltar al contenido. La muestra móvil cierra el índice al cargar y conserva ancho global de 375 píxeles en lección, proyecto y entrenamiento.

### Verificación del cierre

**113 pruebas automatizadas aprobadas**: 48 de Producción y componentes de escucha/gate/rutas, más 65 de Tabla de frecuencias y diccionario compartido. Se añadieron regresiones de formatos, migración, recuperación, rechazo sin escritura, señales de fades, casos nuevos, tareas, rutas y renderizado. La prueba previa del atlas ahora verifica la salida del renderizador, en lugar del orden textual de las funciones del archivo.

**11 comprobaciones adicionales con Web Audio real aprobadas** mediante `herramientas/produccion-musical/tests/browser-audio.html`: seis respuestas Butterworth y cinco configuraciones de canales. Con L=−R, el pico leído es aproximadamente −6,021 dBFS y el RMS −9,036 dBFS, sin confundir la cancelación mono con silencio de los canales.

En la aplicación se comprobaron migración de sesión previa, cambio a Primeros pasos, reproducción A/B y corrección de la tarea, persistencia de rúbrica y notas tras recargar, evaluación con resultado 4/4, destino ADSR con foco y consigna de EQ corregida sobre los controles reales. Las muestras móviles de lección, proyecto y escucha conservaron el ancho de 375 píxeles. Se restauró el tamaño normal del navegador después de la prueba.

La sintaxis y las rutas de recursos se verificaron. La validación técnica y de reproducción no constituye una evaluación perceptiva formal, un estudio de aprendizaje ni una certificación de accesibilidad completa.
