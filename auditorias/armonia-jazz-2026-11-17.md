# Auditoría de Armonía Jazz

Fecha: 17 de noviembre de 2026. Estado posterior: correcciones implementadas y verificadas. Los hallazgos siguientes describen la versión previa; el cierre al final documenta su resolución.

## Dictamen

El curso tiene amplitud, recursos de práctica y una orientación musical valiosa. La ruta paralela de improvisación desde el nivel 1 es un acierto: permite trabajar oído, pulso y motivos sin esperar a estudiar toda la armonía contemporánea. Sin embargo, hay errores concretos en explicaciones, ejemplos y una clave del cuestionario. La corrección debe priorizar esas incoherencias antes de ampliar el contenido.

Está mejor preparado para adolescentes y adultos con base musical y acompañamiento docente que para niños principiantes en estudio autónomo. Un niño con formación instrumental puede aprovechar actividades seleccionadas; el recorrido completo necesita una adaptación por habilidades, instrucciones y carga de lectura. Estas apreciaciones son juicio de diseño, no resultados de pruebas con estudiantes.

## Alcance

- Lectura de las explicaciones y claves de los cinco niveles de `data.js`, revisión de la aplicación y de una muestra de ejemplos, mapas armónicos, bancos de piano y ruta de improvisación.
- Se contempló la carga adicional de `piano-bank.js` y `baga-lab.js`: la web tiene **79 temas**, no los 77 que se obtienen leyendo solo `data.js`.
- El banco contiene **114 preguntas de elección múltiple**. Las opciones se barajan al iniciar el intento; no se considera un defecto que muchas respuestas correctas ocupen inicialmente el mismo índice en el archivo.
- `node --test herramientas/armonia-jazz/*.test.js herramientas/armonia-jazz/*.test.cjs` reportó **8 pruebas aprobadas, ninguna falló**. No valida por sí solo las afirmaciones de la teoría.
- Se reprodujeron, con datos de prueba y sin modificar la aplicación, un fallo de migración del progreso y los intervalos de las estructuras superiores señaladas.
- Navegación local y revisión de una muestra a 1280 y 375 píxeles. Se confirmó en pantalla el cifrado incorrecto `CD/C`. En la muestra móvil el ancho del documento fue de 375 píxeles, sin desbordamiento global.
- No se certifica cada digitación, grabación, transposición, activo de la biblioteca, variante del generador o requisito WCAG. La inspección visual corresponde a la versión local; no demuestra por sí sola el estado de publicación de cada archivo.

| Nivel | Temas en la web | Preguntas |
| --- | ---: | ---: |
| 1. Fundamentos | 15 | 20 |
| 2. Intermedio | 16 | 19 |
| 3. Avanzado | 18 | 20 |
| 4. Contemporánea y Composición | 17 | 24 |
| 5. Lenguaje, oído e improvisación | 13 | 31 |
| **Total** | **79** | **114** |

## Fortalezas

- Se relacionan armonía, melodía, forma, ritmo e interpretación; no se limita el aprendizaje a memorizar escalas.
- Hay laboratorios, notación, audio, instrumentos, biblioteca de standards, ejemplos transportables y una ruta paralela de improvisación.
- Cada nivel incluye preparación y proyecto aplicado. Las consignas de cantar, tocar, transportar y escuchar el resultado ofrecen una buena base para trabajo docente.
- La explicación de swing evita reducirlo a una proporción fija de tresillos. Se recomienda frasear con una sola nota y trabajar a tempos controlables.
- La conducción correcta de notas guía sí aparece en el nivel 5: Do→Si y Fa común en Dm7→G7; después Si común y Fa→Mi en G7→Cmaj7.
- Los módulos añadidos de sextas/disminuidos y Baga distinguen acorde, voicing, registro y convenciones propias del método. Conviene conservar esa precisión y extenderla al texto anterior.
- La identidad visual es coherente con el resto de Crescendo.

## Correcciones musicales prioritarias

### J01 · Alta · Estructura superior incorrecta, también en el examen

Ubicación: `herramientas/armonia-jazz/data.js:842`, tema 4.2, y tercera pregunta del nivel 4.

Se afirma que una tríada de Re sobre G7 aporta 9, ♯11 y 13, y se da Re como respuesta correcta. Re–Fa♯–La respecto a Sol aporta **5, 7 mayor y 9**. Para obtener **9, ♯11 y 13**, la tríada es **La–Do♯–Mi**, es decir, La mayor sobre el soporte de G7.

El ejemplo compartido del tema sí usa Re sobre **C7**, donde Re–Fa♯–La aporta correctamente esas tensiones. Esto muestra una incoherencia entre texto, ilustración y evaluación.

Corrección: cambiar G7/Re por G7/La en la explicación y en la clave, o conservar la tríada de Re y cambiar el soporte a C7. Verificar las tres capas juntas.

### J02 · Alta · La explicación inicial de las notas guía invierte los papeles

Ubicación: `data.js:117`, tema 1.5.

Se dice que la séptima pasa a ser tercera y se ofrecen Fa→Fa y Si→Si como ejemplos. En realidad, Fa es tercera de Dm7 y séptima de G7; Si es tercera de G7 y séptima de Cmaj7. Esas notas comunes muestran **tercera→séptima**. La otra línea hace **séptima→tercera**: Do→Si y Fa→Mi.

Corrección: dibujar ambas voces con registros concretos y mantener la misma explicación en el nivel 1, el nivel 5, los shells y los audios. La economía de movimiento entre terceras y séptimas se desarrolla en [Berklee: Voice Leading for Guitar](https://online.berklee.edu/takenote/voice-leading-for-guitar/).

### J03 · Alta · Los ejemplos de cliché de línea contradicen su dirección

Ubicación: `data.js:688`, tema 3.8.

Se llama descendente a Sol–Sol♯–La–Sol♯, que primero asciende y luego desciende. Después se llama ascendente a Cm→Cm(maj7)→Cm7→Cm6 y se describe como una séptima que sube desde quinta a sexta. La línea habitual de ese segundo ejemplo es **Do–Si–Si♭–La**, descendente.

En el primer ejemplo, mantener Si y añadir La tampoco produce sin más el C6 anunciado: es necesario aclarar qué voces se conservan o desaparecen.

Corrección: comenzar con el cliché menor descendente, mostrar la voz móvil y separar un ejemplo ascendente real. Alinear símbolos, posiciones y reproducción.

### J04 · Alta · Constant structure mezcla intervalos y cualidades incompatibles

Ubicación: `data.js:720–723`, tema 3.10, y pregunta 18 del nivel 3.

- Do–Mi♭–Sol♭–La divide la octava en cuatro partes de **tercera menor**, no mayor. Las terceras mayores la dividen en tres partes.
- Cm7–Dm7 y Fm7–Gm7 no son pares ii–V: el segundo acorde de cada par sigue siendo menor, y los puntos de partida Do–Fa–Si♭–Mi♭ tampoco avanzan por terceras menores.
- Conservar la calidad o estructura no exige desplazamientos simétricos. El propio laboratorio presenta un desplazamiento por distancias variadas.

Corrección: separar calidad constante, conducción paralela y división simétrica. Si se quieren enseñar cadenas ii–V, construir sus calidades y destinos reales.

### J05 · Alta · Se confunde disminuido de nota común con dominante sin fundamental

Ubicación: `data.js:430–444`, tema 2.9, y pregunta 15 del nivel 2.

La posibilidad de reinterpretar las alturas de un disminuido como parte de un dominante ♭9 no significa que toda aparición tenga función dominante. El disminuido de nota común prolonga o adorna una armonía mediante notas comunes y vecinas.

El ejemplo de un disminuido medio tono por encima de la fundamental del acorde adornado no explica ese mecanismo: Do♯°7 no conserva Do como nota común. Do♯°7 puede entenderse como La7(♭9) sin La y conducir hacia Re; no es una explicación general de adorno de Do.

También se habla de «cuatro acordes disminuidos existentes» y luego de tres sonoridades. En temperamento igual hay tres colecciones distintas de séptima disminuida por clase de altura; sus transposiciones por tercera menor repiten la colección.

Corrección: comparar paso cromático, sensible/dominante sin fundamental y nota común con resoluciones explícitas. Matizar la pregunta del examen. Referencia: [Open Music Theory: Embellishing Chords](https://viva.pressbooks.pub/openmusictheory/chapter/jazz-embellishing-chords/).

### J06 · Alta · El laboratorio de acordes compuestos genera cifrados incorrectos

Ubicación: `theory-visuals.js:82` y configuración `compound`, tema 4.11.

El generador antepone la tónica a cadenas que ya contienen un cifrado completo. En Do muestra **`CD/C`** como ejemplo de híbrido; al cambiar la tónica no transporta independientemente las dos partes del símbolo. También presenta `Cmaj7/3` como ejemplo concreto de slash chord y un único `Cmaj7` como ejemplo de poliacorde.

Se confirmó `CD/C` en el navegador.

Corrección: representar por separado raíz y calidad de la estructura superior, bajo y segundo acorde. Generar, por ejemplo, C/D, D7/F♯ y una combinación explícita de dos acordes, con notas que coincidan con el símbolo.

### J07 · Media · Una equivalencia de acordes añade una nota inexistente

Ubicación: `data.js:1029`, tema 4.11.

D7/F♯ contiene Fa♯–La–Do–Re. F♯m7♭5(♭13) contiene además Mi, su séptima menor. No son literalmente el mismo conjunto de notas, como afirma el texto.

Corrección: enseñar D7/F♯ directamente como primera inversión de D7 y reservar la comparación enarmónica o de reinterpretación para conjuntos realmente equivalentes, o indicar de forma explícita las omisiones.

### J08 · Media · Hay nombres y grafías de modos inconsistentes

Ubicación: temas 2.1, 3.6 y 4.4; `data.js:874`.

- En Do dórico, el cuarto grado produce F7, no Fm7. La afirmación de que im7 e ivm7 proceden indistintamente de menor natural o dórica debe separarse por acorde.
- El sexto modo de la menor melódica es locrio **♮2** —también llamado locrio ♯2 respecto al locrio—, no «locrio ##2».
- La colección de La♭ menor melódica contiene Do♭. Puede reescribirse como Si al explicar G7alt, pero debe advertirse el cambio enarmónico; Si♭ como ♯9 y Re♭ como ♯11 tampoco conservan el nombre interválico escrito respecto a Sol. Conviene distinguir colección sonora y grafía armónica.

El diccionario interactivo ya contiene varios nombres y modos mejor definidos que estos párrafos; debe utilizarse una referencia coherente. Para diferenciar dórico y menor natural: [Open Music Theory: Modal Schemas](https://viva.pressbooks.pub/openmusictheorycopy/chapter/modal-schemas/).

### J09 · Media · El ejemplo de modulación directa no demuestra la afirmación

Ubicación: `data.js:734`, tema 3.11.

Se explica que el siguiente ii–V pertenece a la nueva tonalidad, pero el ejemplo Cmaj7 | Dm7–G7 | B♭maj7 contiene un ii–V de Do, no de Si♭. La llegada a Si♭ puede formar parte de una resolución inesperada y de una modulación posterior; aislada no demuestra el procedimiento descrito.

Corrección: usar un cambio directo seguido de confirmación en la nueva tonalidad, o un ii–V de Si♭ (Cm7–F7) si se quiere mostrar preparación. En la modulación por pivote, identificar cuál acorde pertenece a ambos campos y escribir las dos funciones. Separar claramente tonicización y establecimiento de centro.

### J10 · Media · La disposición de So What necesita una explicación consistente

Ubicación: `data.js:956`, tema 4.7.

Se afirma que Mi–La–Re–Sol–Si comienza un tono por debajo de Re; Mi está un tono **por encima**. Esa estructura tiene tres cuartas justas y una tercera mayor, pero, sobre un Re grave, aporta un color dórico extendido y omite Fa. No conviene presentarla como si fuera la única realización básica de Dm7.

Corrección: comparar las disposiciones Mi–La–Re–Sol–Si y Re–Sol–Do–Fa–La, con el bajo y la frase correspondientes. Explicar la estructura y su uso en contexto. Referencia estructural: [Berklee: Arranging a Jazz Classic for Solo Piano](https://www.berklee.edu/berklee-today/berklee-today-fall-2017/woodshed).

### J11 · Media · La armonía negativa se presenta sin un espejo verificable

Ubicación: tema 4.9 y configuración `negative` en `theory-visuals.js:202`.

El texto habla de «relativo menor espejado» sin fijar la correspondencia de notas. El laboratorio reproduce Imaj7–ivm7–♭II7–Imaj7, pero no muestra una progresión original y su transformación ni calcula un eje.

Con la reflexión habitual de clases de altura `p → 7 − p (mod 12)` para el eje Do–Sol, Do mayor se transforma en Do menor, y G7 en el conjunto de Fm6. Eso no equivale a aplicar indiscriminadamente ivm7 o ♭II7.

Corrección: fijar el eje y la tabla de correspondencias, transformar cada altura y después explicar el análisis y la utilidad musical. Distinguir un ejemplo de color de una operación de espejo.

### J12 · Media · Reglas de instrumentación demasiado absolutas

Ubicación: temas 4.6 y 4.12.

Se habla de «cuatro» juegos consecutivos de cuatro cuerdas, pero se enumeran tres; también aparecen rangos de cuerdas ambiguos para cuatro voces. Se presenta Drop 2&4 como prácticamente imposible en una guitarra, cuando la viabilidad depende de registro, inversión y digitación.

Además, hacer Drop 2 o Drop 3 no evita por sí mismo las quintas y octavas paralelas. Dos disposiciones movidas en paralelo pueden conservar esos intervalos entre las mismas voces.

Corrección: demostrar formas tocables y sus límites concretos; tratar la independencia de voces como una elección estilística y de arreglo, sin atribuirla automáticamente al nombre del voicing.

## Aprendizaje, evaluación y funcionamiento

### J13 · Media · El progreso antiguo puede quedar asignado al tema equivocado

Ubicación: `app.js:31–43` y `data.js`, función `enrichCurriculum`.

Se insertó una estación al inicio de cada nivel. La migración aumenta `topicIndex`, pero no desplaza las claves de `studiedTopics` y `practiceChecks` que usan posiciones numéricas.

Reproducción con un estado de versión 1: el antiguo `n1-0` era «Cifrado de acordes jazz». Al cargarlo, el tema visible pasa correctamente al índice 1, pero la marca `n1-0` queda en la nueva estación de preparación. El estudiante ve un progreso que ya no corresponde al contenido que estudió.

Corrección: migrar todas las claves relacionadas y, para futuras ampliaciones, utilizar identificadores de tema estables. Incluir en las pruebas el orden real de carga: los laboratorios añadidos elevan los niveles 2 y 3 a 16 y 18 temas.

### J14 · Media · La evaluación no explica el razonamiento ni verifica la interpretación

Las 114 preguntas son de reconocimiento mediante elección múltiple. Ninguna tiene actualmente un campo `explanation` redactado, aunque el constructor lo admite. La revisión final muestra respuesta y opción correcta, pero no desarrolla la razón del error ni conecta con el tema.

Los proyectos y cierres activos aportan valor, pero su registro consiste en casillas de autoevaluación. «Proyecto completo» o «Práctica completa» significa que se marcaron esas casillas, no que se haya evaluado una grabación o una interpretación.

Mejoras: añadir explicaciones, construcción de acordes y análisis de fragmentos; identificar la autoevaluación como tal; ofrecer una rúbrica breve para forma, pulso, conducción, melodía y resolución. Se puede mejorar mucho sin reconocimiento automático de audio. Conviene conservar las preguntas conceptuales y complementarlas con evidencia musical, como los modelos aplicados de [Open Music Theory](https://viva.pressbooks.pub/openmusictheory/chapter/jazz-embellishing-chords/).

### J15 · Media · Algunas decisiones de método necesitan contexto

Las tensiones de un dominante secundario no se determinan exclusivamente por si su destino es mayor o menor. «9 y ♭13» puede ser una elección útil; no es una combinación obligatoria para todos los destinos menores. La melodía, las notas guía, el estilo y la resolución pueden justificar ♭9, ♯9 y otras realizaciones.

También conviene separar tocar material de la escala madre sobre cambios diatónicos de establecer un nuevo centro modal en cada acorde. La práctica de jazz modal no se define simplemente como cambiar de modo sobre cada símbolo.

Las relaciones de superposición de la pentatónica menor 6 necesitan ejemplos con dos fundamentales explícitas: decir «desde su sexta» deja ambiguo de cuál acorde o escala se cuenta. La misma precaución se aplica a la nomenclatura A/B: el módulo Baga ya distingue su convención de otras convenciones por acorde.

### J16 · Media · La amplitud necesita una ruta inicial más acotada

Hay 79 temas, numerosas familias de voicing y listas extensas de repertorio. La preparación y los proyectos ordenan el trabajo, pero no indican suficientemente qué habilidades mínimas habilitan cada salto ni qué material puede posponerse.

Mejoras propuestas:

1. Ruta esencial: cifrado, tétradas diatónicas, ii–V–I, oído, pulso, shells y un fragmento breve de standard.
2. Ruta de ampliación: dominantes aplicados, sustituciones, formas, rootless y análisis de melodía.
3. Profundización: simetrías, Coltrane, estructuras superiores, armonía negativa y composición contemporánea.
4. Una grabación o fragmento concreto por objetivo, con tonalidad, compases y versión de referencia. Una lista de títulos por sí sola no establece la dificultad de interpretación.
5. Repasos breves y tareas con resultado observable, diferenciando ejemplo escuchado, concepto reconocido y habilidad practicada.

## Adecuación a edades y presentación

Para adolescentes y adultos con base instrumental, el contenido puede ser muy útil después de corregir los errores. Para principiantes adultos y niños conviene empezar por tareas cortas de escucha, una sola nota, respuestas rítmicas, pequeñas construcciones y transporte gradual. Los términos técnicos deben mantenerse, pero acompañarse de ejemplos y una carga de lectura razonable.

No es necesario esperar al nivel 5 para improvisar: la ruta paralela ya resuelve bien ese aspecto y debe conservarse. Tampoco conviene recomendar todo el material avanzado por edad: los conocimientos previos y la autonomía son criterios más útiles.

El diseño se percibe cuidado y coherente. En la muestra móvil no hubo desbordamiento general; la navegación y la barra fija ocupan una porción importante de la pantalla. No hay encabezado `h1` en el documento. Deben revisarse jerarquía de encabezados, uso por teclado, nombres accesibles, contraste y lectura de tablas antes de afirmar accesibilidad completa.

## Orden sugerido

1. Corregir J01–J07 y la clave de examen afectada, comprobando texto, ejemplo, sonido y respuesta juntos.
2. Alinear modos, modulaciones, So What y armonía negativa; matizar reglas de instrumentación y tensiones.
3. Corregir la migración del progreso y ampliar pruebas que carguen la página con sus dependencias reales.
4. Incorporar devolución explicativa, rúbricas y recorrido esencial, conservando la práctica de improvisación desde el inicio.

La prioridad es depurar y conectar el material existente. Añadir más teoría ahora aumentaría la carga sin resolver las contradicciones que puede encontrar el estudiante.


## Cierre de correcciones · 17 de noviembre de 2026

- **J01–J05:** se corrigieron la estructura superior de G7 y su clave de examen, ambas líneas de notas guía, los clichés ascendentes/descendentes, constant structure y la distinción entre disminuido de nota común y dominante sin fundamental. El ejemplo compartido y el laboratorio del cliché conservan la línea Do5–Si4–Si♭4–La4.
- **J06–J07:** el laboratorio representa por separado acorde superior, bajo y acorde inferior. Transporta, por ejemplo, D7/F♯ a E7/G♯ y C/D a D/E; el poliacorde muestra las dos estructuras apiladas. Las notas y el audio se calculan desde el mismo modelo. Se retiró la equivalencia incorrecta con F♯m7♭5(♭13).
- **J08–J10:** se alinearon dórico, locrio ♮2, grafías enarmónicas del material alterado, ejemplos de modulación y las dos disposiciones So What. Las disposiciones explícitas conservan sus octavas en el generador y el audio usa las alturas de la notación.
- **J11:** el laboratorio aplica la reflexión a cada clase de altura alrededor del eje elegido; permite comparar tríada mayor, V7 y ii–V–I con sus reflejos y escucharlos. Se muestra la correspondencia de las doce alturas, sin prometer equivalencia funcional automática.
- **J12:** se corrigieron los tres juegos consecutivos de cuatro cuerdas, las condiciones de digitación y la relación entre disposiciones Drop y conducción. Se incluye una realización tocable de Drop 2&4 con cuerdas y trastes concretos.
- **J13:** se migran marcas de estudio, práctica y fechas de las versiones 1 y 2. Los temas tienen identificadores explícitos estables y el tema seleccionado se recupera por identificador. Los intentos conservan sus preguntas y orden de respuestas originales; su revisión identifica si pertenecen a la versión anterior.
- **J14:** las 114 preguntas incluyen explicación y destino de repaso. Hay 12 tareas de construcción/análisis con devolución inmediata, además del cuestionario conceptual. Los proyectos tienen una rúbrica de autoevaluación o revisión docente y un campo para registrar evidencia y siguiente paso; las casillas de práctica se identifican como declaración del estudiante.
- **J15:** se contextualizan las tensiones de dominantes secundarios, colección acorde–escala frente a centro modal y superposiciones de menor 6 pentatónica con las dos fundamentales explícitas.
- **J16:** se incorporaron recorridos esencial, de ampliación y completo. Los temas y preguntas se filtran juntos; las marcas de progreso se conservan. Hay recordatorios de repaso y cinco fragmentos originales de cuatro compases, con tonalidad, tempo, partitura e instrucciones concretas. La ruta paralela de improvisación desde el comienzo se mantiene.
- **Presentación:** encabezado principal, enlace para saltar al contenido, foco visible y barra de acciones sin superposición en móvil. La muestra de 375 píxeles mantuvo un ancho global de 375 píxeles.

Validación: **21 comprobaciones aprobadas**, incluyendo las pruebas de Jazz y `shared/course-instruments.test.cjs`. Se cubrieron las doce transposiciones de acordes compuestos, la involución del espejo en doce tonalidades, las claves corregidas, explicación y destino de las 114 preguntas, las dos migraciones, estabilidad tras insertar un tema, conservación de intentos, rutas y tareas, y registro del cliché y So What. La sintaxis de los archivos modificados y `git diff --check` no reportaron errores.

En navegador se verificaron tabla y transporte de acordes compuestos, corrección de tarea, espejo original/reflejo, cambio de recorrido, rúbrica, renderizado de la partitura de proyecto y muestra móvil. No se presenta esto como estudio experimental de aprendizaje ni certificación completa de accesibilidad.
