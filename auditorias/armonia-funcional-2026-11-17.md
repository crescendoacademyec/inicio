# Auditoría de Armonía Funcional

Fecha: 17 de noviembre de 2026.

Estado posterior: se implementaron las correcciones y mejoras descritas en el cierre al final de este informe. Los hallazgos siguientes documentan la versión auditada antes de corregirla.

## Dictamen

La página tiene una estructura de aprendizaje razonable, recursos interactivos útiles y una presentación visual cuidada. Es una buena base para acompañar clases y para el estudio de adolescentes y adultos con nociones musicales. No todo el contenido ni toda la evaluación son correctos: hay errores reproducibles de notación, una afirmación incorrecta sobre el bajo, una contradicción entre dos procedimientos de voicing y criterios de corrección que pueden penalizar respuestas válidas.

Para niños principiantes necesita una ruta más breve, concreta y acompañada. No basta con permitirles abrir los mismos cinco niveles: el lenguaje, la cantidad de conceptos y las tareas deben graduarse según conocimientos y autonomía. Este juicio procede del diseño observado; no de pruebas con alumnos.

## Alcance y comprobaciones

- Revisión de los cinco niveles que realmente construye la aplicación después de normalizar y reorganizar los datos, sus explicaciones, consignas y claves de respuesta. No se tomó el orden original de `data.js` como si fuera el recorrido actual.
- Inspección de los generadores, aceptación de respuestas, laboratorios, evaluación, progreso, ejemplos compartidos y taller de práctica relacionados.
- Navegación local por fundamentos y contenidos finales; revisión visual de una muestra a 1280 y 375 píxeles de ancho. En la vista móvil observada no hubo desbordamiento horizontal del documento. Esto no certifica todos los diagramas ni todos los dispositivos.
- La página pública abrió y permitió entrar al módulo. Se reprodujo también allí el error AF01 leyendo la notación generada. La primera navegación tardó en responder; finalmente cargó. No se concluye que exista una caída del sitio.
- `node --test herramientas/armonia-funcional/*.test.js`: 12 archivos aprobados, ninguno falló. Incluyen comprobaciones de 624 combinaciones de acordes/fundamentales y 132 de escalas/tonalidades. Estas pruebas no cubren todos los problemas musicales descritos aquí.
- Pruebas adicionales de solo lectura: las 39 respuestas modelo de selección de piano reciben puntuación completa; otras realizaciones válidas pueden recibir solo 0,45 puntos.
- No se escuchó de forma exhaustiva cada combinación de audio ni se realizó una certificación WCAG o un estudio de eficacia educativa.
- Esta auditoría no modifica la aplicación.

| Nivel actual | Temas | Conceptos | Preguntas |
| --- | ---: | ---: | ---: |
| 1. Conocimientos esenciales | 4 | 25 | 36 |
| 2. Armonía diatónica y progresiones | 5 | 22 | 15 |
| 3. Cifrado de acordes y extensiones | 12 | 67 | 131 |
| 4. Principios de voicing | 7 | 45 | 55 |
| 5. Conexiones funcionales y preparación para jazz | 7 | 19 | 15 |
| **Total** | **35** | **178** | **252** |

## Fortalezas que conviene conservar

1. La ruta fundamentos → armonía diatónica → cifrado → voicings → conexiones funcionales tiene sentido. Coloca el campo armónico y las progresiones antes del catálogo amplio de extensiones.
2. Hay interacción real: selección de notas en piano, exploradores, transposición de ejemplos, reproducción, comparación de acordes y laboratorio de rearmonización. No es únicamente lectura con un examen final.
3. Los ejemplos combinan texto, notación y teclado. Las explicaciones iniciales de semitono, tono, octava y alteración de un extremo del intervalo son especialmente útiles.
4. Se distinguen fundamental y bajo, estado e inversión, y tonicización y modulación. Los ejemplos de préstamo desde escalas paralelas aportan contexto.
5. Ya existen desafíos breves con explicación inmediata, cuestionarios de diez preguntas, selección por sección y banco completo. Conviene conservar estas alternativas.
6. El tratamiento de la cuarta justa y varias reglas de voicing ya incluye advertencias de contexto o de método. No deben eliminarse esas aclaraciones ni convertir diferencias entre escuelas en supuestos errores.
7. La identidad visual es coherente, hay navegación por temas, controles de audio y enlace para saltar al contenido. La apariencia es adecuada para un recurso académico.

## Hallazgos prioritarios

### AF01 · Alta · El explorador pierde la octava escrita al superar el séptimo grado

Ubicación: `herramientas/armonia-funcional/app.js:2301`, función `mountScaleExplorer`; relación con `spell` y `sequence` en `shared/music-practice.js`.

Se utiliza `degrees[index] % 7` al construir la grafía. Esto conserva la clase de grado, pero descarta su desplazamiento de octava. En Do mayor lineal, el último sonido genera `<step>C</step><alter>12</alter><octave>4</octave>` en lugar de Do5 sin alteración. El problema también aparece en las tríadas por grado, por ejemplo en el Do superior de Fa–La–Do y en el Re superior de Sol–Si–Re.

Comprobado en la aplicación local y en la página pública. El audio de ese recorrido se construye con distancias cromáticas ascendentes; la escritura generada no representa correctamente ese registro. No se atribuye aquí una interpretación sonora concreta al motor de notación: el error ya está en los datos que recibe.

**Corrección propuesta:** conservar el grado diatónico completo al escribir, junto con la altura absoluta. Verificar escala, terceras, tríadas y tétradas desde las doce tónicas, especialmente los cruces de Si a Do.

### AF02 · Alta · Se enseña y evalúa que el bajo «no se enlaza»

Ubicación: `data.js:128`, `data.js:642` y `data.js:1156`. En la secuencia actual corresponde al nivel 4, tema «Notas guía, voces y enlace armónico» y preguntas 43 y 54.

La frase «El bajo generalmente contiene las fundamentales de los acordes y no se enlaza» aparece como explicación y como respuesta correcta. El bajo también tiene conducción: puede conservar notas, moverse por grados o saltos, usar inversiones y dibujar una línea melódica. El propio nivel 2 muestra inversiones que suavizan esa línea.

**Corrección propuesta:** decir «En este ejercicio comenzamos con fundamentales en el bajo y trabajamos primero el enlace de las voces superiores». Después comparar una progresión con bajo en fundamentales y otra con inversiones. Actualizar también las dos claves de evaluación.

La conducción de acordes en estado fundamental ya considera el movimiento melódico del bajo; véase [University of Puget Sound: conducción de tríadas a cuatro voces](https://musictheory.pugetsound.edu/mt21c/VoiceLeadingFourPartsRootPosition.html).

### AF03 · Alta · La lección de Skip 2 y el laboratorio enseñan transformaciones distintas

Ubicación: `app.js:2009`, `app.js:2623`, `app.js:2644` y `shared/concept-example-catalog.js:115`.

El texto y su ejemplo definen «Skip 2» como subir una octava la segunda nota contada desde abajo. El ejemplo es Mi4–Sol4–Si4–Re5 → Mi4–Si4–Re5–Sol5 y aclara expresamente que no es Drop 2.

En la misma lección, el laboratorio rotulado «Skip 2 / Drop 2» baja la segunda voz desde arriba: calcula otra transformación. Por tanto, el problema no es que el procedimiento particular llamado Skip 2 sea inválido; es que la actividad lo equipara con uno diferente.

**Corrección propuesta:** mantener nombres y operaciones distintos. El laboratorio principal de esta lección debe reproducir el procedimiento que se pide en el ejercicio; Drop 2 puede aparecer como comparación explícita. La definición habitual de Drop 2 baja una octava la segunda voz superior; véase [Berklee: Voice Leading for Guitar](https://online.berklee.edu/takenote/voice-leading-for-guitar/).

### AF04 · Alta · El corrector exige disposiciones que la consigna no especifica

Ubicación: `app.js:488`, `app.js:1701` y `app.js:1761`; nivel 4, pregunta 32, `sourceId: 47`.

La consigna pide «bajo/acorde para Am7 con fundamental grave y notas guía en la mano derecha». La selección La2–Do4–Sol4 obtiene 1 punto. La2–Sol4–Do5 conserva fundamental grave, tercera y séptima en la derecha, pero obtiene 0,45. No se ha pedido una octava concreta ni una única separación entre manos.

El modo `shape` compara patrones de intervalos exactos con una lista de ejemplos. Es apropiado cuando se pide una transformación o disposición específica; resulta demasiado estricto para una consigna abierta. También hay preguntas de «registro ideal» corregidas mediante una única altura exacta, pese a que la explicación presenta el registro como región orientativa.

**Corrección propuesta:** evaluar identidad del acorde, nota del bajo, registro y disposición como criterios explícitos. Reservar la comparación exacta para consignas que indiquen las alturas o la transformación requerida. Explicar qué criterio produjo una puntuación parcial.

### AF05 · Media · Algunas preguntas pierden los matices de la explicación

Ubicación: `data.js:465`, `data.js:1124` y preguntas de duplicación y omisión; contraste con el texto inicial del tema «Acordes».

La explicación reconoce que se estudian acordes organizados por terceras y también estructuras suspendidas. Sin embargo, la pregunta 12 del nivel 1 define un acorde como «tres o más notas dispuestas por terceras» y la 56 da esa frase por verdadera sin condiciones. Una disposición abierta no muestra necesariamente terceras sucesivas y una estructura suspendida tampoco se define por esa construcción.

En otras preguntas se pregunta qué notas «nunca» pueden omitirse o qué nota «no se debe» duplicar, aunque la explicación ya presenta esas decisiones como criterios del método. Esto favorece memorizar prohibiciones descontextualizadas.

**Corrección propuesta:** distinguir acorde, construcción por terceras y disposición concreta. Formular las preguntas de estilo como «En el modelo de voicing que estamos practicando…». La pauta puede ser exigente dentro del ejercicio sin presentarse como ley general de la música.

### AF06 · Media · La tonalidad mayor se presenta como basada necesariamente en dos escalas

Ubicación: `data.js:159` y `data.js:786`; nivel 1, pregunta 30.

Se da como definición y respuesta correcta «natural mayor y mayor armónica». La mayor armónica existe y puede aportar recursos, pero presentarla como base general indispensable de la tonalidad mayor introduce una equivalencia pedagógica engañosa. Además, no se desarrolla allí su patrón ni su diferencia respecto a la mayor natural.

**Corrección propuesta:** explicar primero la organización tonal mayor y su colección diatónica. Introducir después el sexto grado rebajado, los préstamos o la mayor armónica como materiales y recursos específicos del enfoque elegido. La presentación básica de tónica, colección mayor y grados puede contrastarse con [Open Music Theory: escalas y grados](https://open-musictheory.github.io/docs/fundamentals/scales/).

### AF07 · Media · Algunas extensiones adicionales aparecen como si fueran obligatorias

Ubicación: `data.js:3004`, `data.js:3005` y `data.js:1532`; nivel 3, pregunta 48 y síntesis de reglas.

La respuesta única para A9(b13) incluye Re♯, que es su ♯11; para Mi♭7(♯9)b13 incluye La, también ♯11. Esas alteraciones no están pedidas por los cifrados y no se marcan como opcionales, a diferencia de otras respuestas del mismo ejercicio. Son colores posibles en un contexto, pero el alumno no debe deducir que los exige el símbolo.

También se afirma en la síntesis que la 13 «requiere una 9ª cualquiera», mientras otro tema aclara correctamente que la novena puede omitirse del voicing. Conviene mantener la distinción entre fórmula de referencia, notas indicadas en el cifrado, tensiones elegidas y realización concreta.

**Corrección propuesta:** retirar las ♯11 no solicitadas de las respuestas básicas o identificarlas explícitamente como opcionales; si se exigen, añadirlas al cifrado. Uniformar las explicaciones de la novena en acordes con trecena y conservar las advertencias de contexto de las reglas de color.

Las recomendaciones de registro y omisión son pautas de realización con excepciones conscientes, como explica [Open Music Theory: Jazz Voicings](https://viva.pressbooks.pub/openmusictheorycopy/chapter/jazz-voicings/).

## Mejoras de aprendizaje y evaluación

### AF08 · Media · Algunos laboratorios finales no trabajan el objetivo del tema

Ubicación: asignaciones `n5-*` en `app.js:2040` y familia `cadences` en `app.js:2852`.

La lección de dominantes secundarios sí tiene un ejemplo escrito correcto D7→G7 en Do mayor. Sin embargo, su laboratorio «Preparación dominante» ofrece V7–I, IV–I, ii–V y V7–vi; no permite comparar V/V→V o V/ii→ii en un centro tonal global constante. Cambiar la tónica del laboratorio no sustituye esa comparación contextual.

Algo parecido ocurre con el tema de modulación, que reutiliza rearmonización funcional, y con el de intercambio modal/sustitución tritonal, que abre un explorador de acordes aislados. Explorar sonidos ayuda, pero no demuestra por sí solo el proceso que anuncia el tema.

**Mejora propuesta:** añadir una progresión breve por objetivo: C–D7–G7–C; C–A7–Dm–G7–C; C–Fm–C; Dm7–D♭7–Cmaj7; y una comparación entre tonicización y establecimiento de un nuevo centro. Mostrar la resolución de notas guía y pedir al alumno explicar qué cambió.

### AF09 · Media · La evaluación práctica queda descompensada

El nivel 3 reúne 131 de las 252 preguntas, aproximadamente el 52 %. Los niveles 2 y 5 reúnen solo 15 cada uno y predominan las respuestas de reconocimiento textual. Los 39 ejercicios de piano son una fortaleza del nivel 4, pero no compensan por sí solos la escasez de tareas de análisis y construcción de progresiones en los otros niveles.

Cinco de los siete temas del nivel 5 no tienen «Desafío rápido» propio. Existe un taller compartido de funciones, cadencias, inversiones y enlace, pero no reemplaza una comprobación específica de dominantes secundarios, préstamos y modulación.

**Mejora propuesta:** mantener el catálogo extenso como referencia y ampliar las evidencias aplicadas: construir un campo armónico, localizar una cadencia en una frase, completar una progresión, justificar un préstamo y transportar dos enlaces. Distinguir reconocimiento conceptual de ejecución instrumental y análisis musical.

### AF10 · Media · Hace falta una ruta esencial y otra de profundización

La secuencia general es buena, pero exige pasar de cinco temas diatónicos a doce temas con 67 conceptos de cifrado y extensiones. Las variantes menos frecuentes compiten con habilidades fundamentales como escuchar tensión y reposo, mantener voces comunes y acompañar una frase.

**Mejora propuesta:** una ruta esencial con tríadas, séptimas habituales, inversiones, funciones, cadencias y shells; y una ruta de profundización con alteraciones, fórmulas menos frecuentes y voicings específicos. No eliminar el material avanzado: hacerlo opcional hasta que el estudiante pueda aplicarlo.

Cada lección esencial puede seguir el mismo ciclo: objetivo observable → escuchar/comparar → ejemplo resuelto → tarea guiada → tarea independiente → breve explicación del resultado. Añadir revisiones posteriores de contenidos anteriores. Alternar ejemplos y resolución, combinar representaciones y recuperar conocimientos son recomendaciones respaldadas por la [guía de aprendizaje del Institute of Education Sciences](https://ies.ed.gov/ncee/wwc/PracticeGuide/1); su aplicación concreta a esta web sigue siendo una propuesta de diseño.

### AF11 · Media · La devolución final muestra la solución, pero no diagnostica el error

Ubicación: `app.js:1803`, función `renderQuizResult`.

La revisión final muestra consigna, respuesta del alumno, puntuación y respuesta de referencia. Es útil, pero no explica por qué una selección de notas perdió puntos ni dirige al concepto que necesita repaso. Los desafíos por tema ya ofrecen una explicación breve y son un buen modelo para ampliar.

**Mejora propuesta:** mensajes como «Identificaste tercera y séptima; revisa la nota del bajo» o «La función es correcta, pero esta alteración no pertenece al cifrado solicitado», junto con acceso al tema correspondiente. Una puntuación de 0 a 5 no debería sustituir esa explicación.

## Niños, adolescentes y adultos

| Perfil | Adecuación actual | Ajuste recomendado |
| --- | --- | --- |
| Niños principiantes | Útil con acompañamiento, poco apropiada como recorrido autónomo completo. | Consignas cortas, una decisión a la vez, audición antes del nombre técnico, sesiones breves y ruta esencial. |
| Niños con formación previa | Pueden aprovechar teclado, comparación y construcción guiada. | Elegir actividades según habilidades reales, introducir símbolos gradualmente y separar la exploración del examen. |
| Adolescentes y adultos principiantes | La ruta inicial es aprovechable; la densidad del nivel 3 puede dificultar continuar. | Glosario, requisitos claros, ejemplos musicales completos y opción de posponer variantes avanzadas. |
| Adolescentes y adultos con base instrumental | Es el público al que mejor se ajusta hoy. | Corregir inconsistencias y aumentar aplicación, escucha contextual y retroalimentación. |

No hace falta infantilizar el diseño para atender niños. Hace falta graduar el recorrido y las instrucciones. Tampoco todos los adultos necesitan la misma carga: la experiencia previa resulta más útil que la edad para escoger el punto de entrada.

## Presentación y accesibilidad

La muestra visual conserva una identidad profesional y adapta la navegación a móvil. En pantalla pequeña, la cabecera y la barra fija de acciones ocupan una porción considerable de la vista; conviene probar con alumnos si dificultan llegar a los ejemplos y mantener el foco de lectura.

El documento no tiene un encabezado `h1`. Algunos teclados muestran una grafía contextual, como Mi♭, mientras su nombre accesible conserva la grafía enarmónica genérica de la tecla, Re♯. La altura sonora coincide, pero para enseñar ortografía musical conviene que el lector de pantalla reciba también el nombre contextual. Son mejoras concretas; no equivalen a una auditoría completa de accesibilidad.

## Orden recomendado para las correcciones

1. Corregir AF01–AF04 y añadir comprobaciones de los casos concretos: registro escrito, conducción del bajo, transformación Skip 2 y aceptación de voicings válidos.
2. Alinear teoría, ejemplos, preguntas y soluciones en AF05–AF07. No corregir únicamente el texto visible y dejar intacta la clave de evaluación.
3. Ajustar los laboratorios del nivel 5 y añadir actividades específicas de análisis y construcción.
4. Incorporar ruta esencial/profundización, devolución explicativa y adaptación para principiantes y niños.

El curso conserva un enfoque pedagógico e interactivo. Para considerarlo fiable como material profesional completo, la prioridad es que explicación, sonido, escritura, actividad y evaluación enseñen lo mismo.


## Cierre de correcciones · 17 de noviembre de 2026

- **AF01:** el grado diatónico conserva su octava. Se comprueba la notación realmente generada en 48 combinaciones de tónica y recorrido.
- **AF02:** teoría, respuesta de elección y verdadero/falso explican que el bajo también tiene conducción; un comparador permite escuchar fundamentales e inversiones.
- **AF03:** Skip 2 y Drop 2 tienen procedimientos, gráficos y audio distintos. El ejemplo de maj9 parte de la posición cerrada sin fundamental de la lección.
- **AF04:** los ejercicios abiertos aceptan otras octavas y disposiciones que respetan identidad, bajo, voz superior y distribución pedida. Los límites de registro aparecen antes de responder; las transformaciones específicas conservan su criterio exacto.
- **AF05–AF07:** se alinearon definición de acorde, tonalidad mayor, reglas del método, omisiones, novena opcional y notas exigidas por el cifrado. Se retiraron las ♯11 no solicitadas del ejercicio señalado.
- **AF08:** los laboratorios finales ofrecen dominantes aplicados, préstamo paralelo, sustitución tritonal y comparación entre tonicización y modulación; incluyen la notación de sus acordes y transposición.
- **AF09:** se añadieron 13 preguntas de construcción, análisis y transporte (seis al nivel diatónico y siete al final). Los 35 temas tienen desafío local. El banco completo contiene ahora 265 preguntas.
- **AF10:** se incorporaron recorrido esencial (25 temas) y completo (35), conceptos plegables en el esencial, objetivo y tarea guiada/independiente por tema, y recordatorios de repaso después de dos días. El progreso y los intentos guardados se conservan al cambiar de recorrido.
- **AF11:** la revisión explica fallos de identidad, registro y disposición en piano; las nuevas actividades y los conceptos corregidos incluyen justificaciones y acceso al tema de repaso. Se aclara el alcance conceptual del cuestionario.
- **Presentación:** encabezado principal, grafías contextuales accesibles del teclado y barra de acciones sin superposición en móvil. En la muestra de 375 píxeles, el documento conserva un ancho de 375 píxeles.

Validación final: 20 comprobaciones aprobadas mediante `node --test herramientas/armonia-funcional/*.test.js shared/course-instruments.test.cjs shared/music-practice.test.js`; sintaxis y `git diff --check` sin errores. Se verificaron en navegador la octava Do5, los conceptos plegables, el cambio de recorrido, el laboratorio de dominantes aplicados y su desafío, además del diseño móvil.

Se ejecutaron además dos comprobaciones compartidas que ya fallaban antes de estos cambios. Se reprodujeron cargando los archivos originales de HEAD: `shared/concept-examples.test.cjs` pide un ejemplo de «Tres formas de la escala menor» del curso de lectura, y `shared/course-layout.test.js` exige una asignación antigua `view = "all"`. Se documentan como incidencias previas; no se presentan como pruebas aprobadas.

La adaptación pedagógica sigue necesitando observación con estudiantes reales. Añadir una ruta esencial no constituye una validación experimental de eficacia para todas las edades.
