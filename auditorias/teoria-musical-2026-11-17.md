# Auditoría de Teoría y Lectura Musical

Fecha: 17 de noviembre de 2026.

## Dictamen

El curso tiene una base conceptual y pedagógica sólida y una identidad visual profesional. Integra explicaciones, ejemplos, laboratorios, entrenadores, lectura guiada y evaluación. No obstante, no puede considerarse íntegramente correcto ni igualmente preparado para todas las edades: hay errores en la corrección de ejercicios, incoherencias de pulso y registro y una evaluación insuficiente de las habilidades prácticas prometidas.

Hoy encaja mejor como recurso de apoyo docente y como curso introductorio para adolescentes y adultos. Para niños requiere mediación y una ruta con instrucciones, carga de lectura y actividades adaptadas. Estas apreciaciones son juicio de diseño; no constituyen resultados de estudios con alumnos.

## Alcance y límites

- Revisión de `data.js`, la definición de las 23 unidades en `app.js` (10 de fundamentos, 7 aplicadas y 6 avanzadas), las actividades, generadores, corrección, evaluaciones, progreso, HTML, CSS y ejemplos compartidos relacionados.
- Ejecución de los ocho archivos de pruebas existentes: ocho aprobados. Muchas comprobaciones son estructurales y de presencia de contenido; su aprobación no valida por sí sola la exactitud musical ni la eficacia educativa.
- Prueba adicional, sin modificar la aplicación, del generador de dictado y del cómputo de duración de 6/8.
- Inspección de la portada pública en navegador. En esta sesión no aparecieron las tarjetas de los tres niveles y «Comenzar el curso» no abrió el curso; el comportamiento persistió después de recargar. No se ha establecido la causa ni que afecte a todos los visitantes. Debe reproducirse en un navegador habitual y comprobar la carga de dependencias.
- No se pudo completar una revisión visual y auditiva de todas las actividades publicadas. No se certifica accesibilidad WCAG, funcionamiento en todos los dispositivos ni eficacia con niños o adultos reales.
- No se modificó código de producto como parte de esta auditoría.

## Fortalezas que conviene conservar

1. La definición de música es deliberadamente abierta y evita reducirla exclusivamente a emociones o a ritmo, melodía y armonía.
2. Diferencia altura, duración, intensidad y timbre; conecta notación, sonido e instrumento.
3. Explica las duraciones como relaciones y aclara que «negra = un pulso» depende del contexto.
4. Distingue compases simples y compuestos y aclara que el acento métrico no obliga a tocar siempre más fuerte.
5. Distingue número y cualidad interválica, enarmonía temperada y escritura funcional.
6. Ofrece objetivos y conocimientos previos, práctica por capas, cuenta previa y recuperación del pulso después de un error.
7. Incluye articulación, textura, forma y fraseo, evitando limitar la lectura a nombres de notas.
8. Explicita que seleccionar una respuesta no evalúa la afinación de la voz y que la prueba práctica es autoevaluación.
9. Tiene enlace para saltar al contenido, etiquetas accesibles en numerosos controles, mensajes `aria-live`, estilos de foco y consideración de movimiento reducido. Son buenas bases, sin equivaler a una auditoría de accesibilidad aprobada.

## Hallazgos prioritarios

### A1 · Alta · El dictado puede corregir incorrectamente una repetición

Ubicación: `app.js:1581` y `app.js:1703`.

`generateTrackNotes` puede repetir la nota al alcanzar un extremo de su conjunto de alturas. El clasificador de contorno no contempla diferencia cero: la asigna a «Grado conjunto descendente». Al mismo tiempo, ofrece «Repetición exacta» como distractor incorrecto.

Una ejecución de 1.000 frases de la unidad de dictado produjo 298 comienzos repetidos. Ejemplo observado: C5–C5–G4. Ese porcentaje corresponde a esa ejecución aleatoria y no es una tasa garantizada.

Impacto: el alumno puede escuchar correctamente y recibir una corrección falsa.

Recomendación: tratar diferencia cero como repetición; generar distractores según la frase efectiva; comprobar dirección y número diatónico, además de distancia cromática. Añadir pruebas de extremos, repeticiones y saltos.

### A2 · Alta · La cuenta previa de 6/8 no usa la misma unidad que la frase

Ubicación: `app.js:392`, `app.js:1573` y `app.js:1876`.

La cuenta previa genera dos pulsos separados por 60/BPM, de acuerdo con el pulso principal de 6/8. Sin embargo, cada corchea de la frase dura 0,5 de ese intervalo. Seis corcheas ocupan tres intervalos de la cuenta previa cuando deberían ocupar dos.

Ejemplo: a 60 BPM de negra con puntillo, la cuenta previa ocupa dos segundos y un compás de seis corcheas se reproduce en tres segundos. Debe durar dos segundos si conserva ese pulso principal. El botón «Escuchar modelo» de las prácticas generadas usa además un intervalo uniforme por nota, independiente de la figura.

Impacto: se explica correctamente la subdivisión ternaria, pero se entrena una relación temporal incompatible.

Recomendación: definir explícitamente la figura de BPM y compartir una conversión de unidades entre cuenta previa, reproducción, modelo, metrónomo y notación.

Referencia conceptual: https://musictheory.pugetsound.edu/mt21c/meter.html

### A3 · Alta · Las octavas de los patrones de escalas pueden contradecir el audio

Ubicación: `app.js:767`, especialmente `updateFluency`.

Los nombres de octava se calculan con el número de grado desde la tónica, sin ajustar el cruce de Si a Do. Para Si mayor ascendente, el patrón etiqueta Si4–Do♯4–Re♯4…–Si5; el audio construido a partir de Si4 sube realmente a Do♯5–Re♯5…–Si5.

Impacto: una explicación escrita puede enseñar un registro distinto del que suena, precisamente al practicar transporte a otras tónicas.

Recomendación: derivar la octava del registro absoluto de cada sonido, conservando su grafía diatónica. Verificar ascensos y descensos desde todas las tónicas.

### A4 · Alta · Las evaluaciones no demuestran la fluidez prometida

Ubicación: `app.js:1703`, `app.js:2595`, `app.js:2604` y `app.js:2690`.

Las prácticas de lectura generada comprueban sobre todo la primera nota; la de dictado pregunta por el contorno inicial. La evaluación aplicada tiene siete preguntas textuales y la avanzada seis. El nivel avanzado puede concluir con «Dominio muy sólido» sin interpretar una partitura avanzada.

La prueba práctica guiada es una autoevaluación de dos compases en 4/4. Su carácter está explicado con honestidad; el problema es utilizar resultados conceptuales como evidencia demasiado amplia de dominio.

Recomendación: separar «comprensión conceptual», «lectura realizada» y «habilidad observada». Añadir evidencias de ritmo, alturas, continuidad y expresión mediante rúbrica docente, entrada MIDI, pulsaciones u otras tareas adecuadas. No es indispensable implementar reconocimiento de voz para mejorar esto.

### A5 · Media · La retroalimentación de las evaluaciones desaparece demasiado rápido

Ubicación: `app.js:2720`.

Se muestra «Correcto» o «Respuesta incorrecta» y se avanza automáticamente a los 420 ms. No hay explicación del error en ese paso.

Impacto: dificulta leer, comprender y corregir; afecta especialmente a lectores principiantes y a quienes necesitan más tiempo.

Recomendación: explicación breve, respuesta correcta visible y botón «Continuar». Mantener la devolución más desarrollada que ya existe en otras prácticas.

### A6 · Media · Algunas prácticas revelan la respuesta o apenas la ponen a prueba

Ubicación: `app.js:1609`, `app.js:1664`, `app.js:1690` y `app.js:1872`.

- La práctica de métrica pregunta la agrupación que el selector y el encabezado ya muestran. En 8/8 y 11/8 hay una única agrupación disponible, por lo que puede quedar una sola respuesta.
- Las frases muestran etiquetas con los nombres de las notas mientras se pregunta la primera nota.
- «Nuevo ejemplo» en cambio tonal y navegación reconstruye esencialmente el mismo escenario, aunque cambie el orden de las opciones.

Esto puede servir como demostración inicial. No debe confundirse con una comprobación independiente.

Recomendación: separar modos «Aprender con ayudas» y «Comprobar sin ayudas»; generar situaciones realmente variadas y distractores plausibles.

### A7 · Media · El nivel avanzado contiene poca complejidad rítmica integrada

Ubicación: `app.js:29–35`, `app.js:1573` y `app.js:1703`.

Las frases generadas de primera vista se construyen principalmente con una única figura por contexto: negras o corcheas. La lectura final en 5/4 usa negras; no integra sistemáticamente los ritmos, silencios, ligaduras, cambios tonales y navegación previamente estudiados. Las dos voces de los ejercicios de gran pentagrama también comparten duraciones y ataques en las configuraciones actuales.

Recomendación: una progresión de repertorio breve con dificultades combinadas, voces con independencia rítmica y un cierre que recupere las competencias del nivel. Hasta entonces, «introducción a la lectura avanzada» describiría mejor su alcance.

## Precisiones musicales y de alcance curricular

### B1 · Frase regular y período

Ubicación: `data.js:186`.

El texto asocia «frase cuadrada» con antecedente y respuesta y presenta 4+4. Conviene diferenciar regularidad de extensión y organización en período: antecedente y consecuente son dos frases relacionadas con un plan cadencial, no una propiedad obligatoria de una frase regular.

Referencia: https://sfcm.edu/study/majors/academics/music-theory-and-musicianship/sfcm-theory/online-materials/analysis-lectures/periods

### B2 · Solfeo cromático: convención válida, pero exigente para principiantes hispanohablantes

Ubicación: `data.js:43` y tabla correspondiente.

El curso aclara que B se canta Ti y G♯ se canta Si, con Do fijo. Es una convención explícita del método, no un error por sí misma. Sin embargo, aparece pronto y compite con los nombres españoles que se acaban de presentar.

Recomendación: mantener «Si = B» en la ruta inicial de nombres y ofrecer el sistema cromático como una ampliación claramente identificada. Explicar su uso musical con ejemplos de canto y evitar que sea un prerrequisito para comenzar a leer.

### B3 · Tonalidad, armadura y función

La unidad de relativas y los ejemplos compartidos aclaran bien que compartir armadura no implica compartir tónica. Conviene reforzarlo en la definición introductoria: una armadura no identifica por sí sola una única tonalidad.

En `mountTonalityLab`, los grados I, iii y vi reciben «Tónica», ii y IV «Subdominante», y V y vii° «Dominante». Esta es una reducción funcional didáctica que debe identificarse como esquema de la tonalidad mayor sujeto a contexto. No describe una función invariable de cada nota o acorde.

### B4 · Alteraciones y silencios

La regla de accidental por misma nota y octava hasta la barra es una buena base. Falta explicitar la excepción importante de una nota ligada a través de la barra: conserva su alteración mientras se prolonga. La regla del becuadro debe evitar interpretarse como «volver siempre a la armadura»; devuelve la nota a su estado natural en su ámbito.

«Silencio» debería definirse como ausencia de sonido de la voz o parte correspondiente durante su duración, no como ausencia de todo sonido de la obra ni solo como ausencia de ataque. Esto importa en texturas con varias voces.

### B5 · Cobertura antes del salto a contenidos avanzados

No hay escala menor melódica en el catálogo `SCALES`. La clave de do se presenta, pero no cuenta con una ruta de práctica comparable a sol y fa. Las armaduras se trabajan con un conjunto limitado de ejemplos y no se integran de manera amplia en repertorio menor.

No son errores por omisión en un curso introductorio. Sí conviene ampliar estas bases antes de presentarlo como formación avanzada completa o equivalente a un programa externo. El temario de ABRSM sirve como referencia de cobertura, no como currículo que esta web deba copiar ni como certificación de equivalencia.

Referencias:
- https://www.abrsm.org/sites/default/files/2023-09/music-theory-syllabus-outline-grades-1-5-from-2020.pdf
- https://musictheory.pugetsound.edu/mt21c/MinorKeySignatures.html

## Secuencia pedagógica propuesta

La secuencia actual tiene sentido conceptual. Para un principiante conviene repartir más la explicación y acercar la acción al concepto recién introducido.

Modelo recomendado para cada microlección:

1. Escuchar, cantar o marcar un fenómeno breve.
2. Ver un ejemplo resuelto con una explicación corta.
3. Imitarlo con apoyos.
4. Resolver una variante sin ayudas.
5. Leer o crear una frase que use el concepto.
6. Revisitarlo en otra sesión junto con contenido anterior.

Actualmente se agrupan numerosos bloques teóricos antes de llegar a laboratorios y entrenadores. Propongo una idea principal por pantalla o tramo, con ampliaciones opcionales, sin eliminar el acceso a una vista de referencia completa.

Los contadores del entrenador se reinician al montarlo; el progreso global pondera 75% de unidades marcadas como estudiadas y 25% de prácticas rápidas. Esto registra actividad, pero no acredita retención ni transferencia. Conviene conservarlo como avance de estudio y añadir dominio por habilidades basado en varias evidencias, en días distintos.

La práctica espaciada, la recuperación activa, las conexiones entre representaciones y los ejemplos resueltos tienen respaldo en la guía del Institute of Education Sciences. El beneficio concreto de una futura implementación en Crescendo requerirá observación con alumnos.

Referencia: https://ies.ed.gov/ncee/wwc/PracticeGuide/1

## Niños y adultos

Las siguientes franjas son propuestas de diseño, no umbrales de desarrollo ni resultados validados.

| Público | Adecuación actual | Adaptación aconsejada |
|---|---|---|
| Niños que todavía no leen con autonomía | Baja para uso independiente | Mediación docente o familiar; consignas orales; imitación, movimiento, canto y elecciones visuales |
| Niños con lectura autónoma | Utilizable con acompañamiento | Microlecciones, vocabulario explicado, pocas decisiones por tarea y pequeños retos con ayudas graduales |
| Adolescentes y adultos principiantes | Buena base de estudio | Diagnóstico práctico, metas claras, tempo regulable y control de las ayudas |
| Adultos con experiencia | Útil como repaso | Posibilidad de saltar contenidos ya dominados y retos que combinen oído, lectura y escritura |
| Docentes | Buen repertorio de recursos | Guía de sesión, rúbricas, selección de actividades y exportación de evidencias |

No hace falta infantilizar el diseño ni construir dos currículos incompatibles. Se puede compartir el núcleo musical y ofrecer una presentación guiada y otra de estudio autónomo. Para niños propondría bloques iniciales de unos 5–8 minutos, ajustables después de observar su uso; para adultos, sesiones flexibles con acceso rápido al objetivo y al ejercicio.

## Interactividad y profesionalidad

La interactividad es real: modificar escalas, intervalos, cualidades de sonido, articulación, forma o relaciones rítmicas cambia las representaciones o el audio. La oportunidad principal consiste en convertir exploración en aprendizaje verificable: predecir, actuar, comparar y explicar.

La identidad visual de la portada es coherente y sobria. El lenguaje académico y algunos rótulos —por ejemplo, «voicings», «tétradas», «jerarquía»— necesitan ayuda contextual o entrada posterior para principiantes.

Antes de afirmar accesibilidad profesional completa faltan comprobaciones de teclado y foco después de cambios de vista, ampliación, contraste efectivo, tamaños táctiles, lector de pantalla y alternativas al contenido exclusivamente visual o auditivo. Las bases presentes deben conservarse.

La prueba pública de carga queda pendiente de reproducir en un entorno normal. Revisar dependencias externas y ofrecer un estado de carga o error recuperable evitaría que una portada visible aparente estar lista cuando el curso aún no responde.

## Orden de actuación recomendado

1. Corregir dictado, unidad de pulso en 6/8 y octavas; reproducir la incidencia de carga.
2. Mejorar explicación de errores y separar práctica con ayudas de comprobación sin ayudas.
3. Alinear evaluación y progreso con habilidades realmente demostradas.
4. Dividir unidades densas en microlecciones y añadir repasos acumulativos.
5. Completar las bases y la integración práctica antes de ampliar la dificultad avanzada.
6. Validar con alumnos de edades y experiencia distintas: observar comprensión de consignas, errores, uso de ayudas y retención en otra sesión. Usar esa evidencia para ajustar longitud y dificultad.

## Seguimiento · primera corrección implementada el 17 de noviembre

Cambios locales posteriores al dictamen original:

- A1: el dictado reconoce repeticiones y calcula pasos/saltos por distancia diatónica. Sus distractores ya no incluyen como incorrecta la respuesta real.
- A2: cuenta previa, frase y modelo sin cuenta comparten la unidad de pulso de 6/8. Se conserva la duración escrita en negras para la notación y se convierte al tiempo del pulso principal para reproducir. La interfaz identifica la figura de BPM.
- A3: los patrones de escalas calculan nombre, octava y MIDI desde el mismo registro absoluto. Se corrigió también la conversión de Do bemol y Si sostenido a través de la octava.
- A4: se aclara el alcance conceptual de las evaluaciones y de sus resultados. Sigue pendiente incorporar evidencia práctica más completa de fluidez e interpretación.
- A5: las 39 preguntas de diagnóstico y evaluación tienen explicación específica y avance manual mediante «Continuar».
- A6: las lecturas generadas de niveles 2 y 3 no muestran nombres de notas como ayuda para la respuesta. Las agrupaciones irregulares tienen cuatro opciones diferentes y se identifican como práctica guiada. Queda pendiente ampliar escenarios y separar de forma general los modos con/sin ayudas.
- B1–B4: se precisaron período y frase regular, ámbito del silencio, notas ligadas a través de barra, becuadro, armadura compartida, familias funcionales contextuales y carácter opcional del solfeo cromático.
- La descarga externa del reproductor de timbres pasó a ser asíncrona para no bloquear los scripts del curso. Se comprobó que la versión local abre y permite navegar; no se ha publicado ni verificado este cambio en producción.

Validación: 15 pruebas aprobadas (8 archivos previos y 7 pruebas nuevas de comportamiento), comprobación de sintaxis, diff sin errores y verificación del inicio del curso y del flujo de respuesta/explicación/continuación en navegador local.

Pendientes de la auditoría: evaluación práctica más completa; integración de dificultades en repertorio avanzado; microlecciones y repaso acumulativo; ampliación de bases; adaptación guiada para niños y validación con alumnos; revisión completa de accesibilidad y dispositivos.

## Seguimiento · segunda corrección implementada el 17 de noviembre

- Las lecturas aplicadas incluyen cuatro compases completos con variedad de figuras. Los contextos de integración añaden silencios, puntillos, ligaduras y armadura. El audio respeta silencios y prolongaciones sin repetir el ataque.
- Cada frase de lectura incorpora cinco comprobaciones: alturas en tres puntos distintos, reconocimiento de figura y presencia de silencios. Se guardan resultados separados de altura y ritmo e indicación de uso de ayudas. No se presentan como medición automática de ejecución instrumental o vocal.
- El dictado compara una frase completa de dos compases con tres partituras distintas. Las respuestas se habilitan después de escuchar el modelo completo; al responder aparece la solución y su revisión.
- La evaluación práctica ofrece tres contextos: inicial en 4/4, aplicado en 6/8 e integración en 5/4 con armadura. La autoevaluación de interpretación tiene un registro separado.
- Las dos voces del gran pentagrama tienen ritmos distintos, comparten un solo eje temporal de notación y reproducen sus ataques según la duración real, no según el índice de nota.
- Los resultados objetivos se conservan en un historial local limitado a 40 registros. El porcentaje de estudio representa unidades marcadas como estudiadas; no se mezcla con una supuesta calificación de dominio.
- «Paso a paso» muestra un bloque conceptual cada vez y conserva la idea visitada en cada unidad. «Vista completa» sigue disponible y el cambio de vista no regenera la práctica en curso. Se incorporó una consigna breve de explicación del ejemplo.
- El inicio ofrece sugerencias de repaso para uno o tres días después, según el resultado reciente. Son recomendaciones flexibles y no una afirmación de retención demostrada.
- Se añadió clave de do en tercera al entrenador de notas y menor melódica clásica al laboratorio y contenido de escalas, diferenciando ascenso y descenso. El entrenador de escalas de este curso limita sus preguntas a las cuatro escalas principales estudiadas; el catálogo de los demás cursos mantiene su alcance.
- Los escenarios de cambio de armadura ahora muestran partituras generadas con armaduras reales y alteraciones locales. «Nuevo ejemplo» alterna escenarios distintos. Navegación alterna D.S. al Coda, D.C. al Fine y D.S. al Fine con recorridos explícitos.

Validación acumulada: 31 pruebas aprobadas, incluida la suite del motor compartido de práctica (que verifica 800 preguntas), comprobación de sintaxis y diff sin errores. En navegador local se verificaron entrada al curso, avance entre ideas, registro de comprobaciones, ayudas opcionales, reproducción y corrección de dictado completo, gran pentagrama, menor melódica clásica, clave de do, cambios de escenario tonal y sugerencias de repaso. No se observaron errores de consola en los recorridos inspeccionados.

La validación con alumnos de distintas edades, la auditoría completa de accesibilidad y las pruebas sistemáticas en dispositivos siguen pendientes. Las correcciones están locales: no se ha realizado commit, push ni publicación de esta ronda.

## Seguimiento · tercera corrección: teclado y pantallas pequeñas

- Se corrigió un desbordamiento de la cuadrícula que llegaba a ensanchar la lección a 928 px en una pantalla de 360 px. Los bloques principales ahora pueden reducirse; las tablas y ejemplos anchos mantienen su desplazamiento interno. También se corrigió una cadena de términos rítmicos sin espacios que desbordaba la vista completa.
- Al cambiar de vista o unidad, el foco llega al título del contenido visible. La apertura inicial mediante un enlace con fragmento no fuerza ese movimiento. El alto real de la barra fija se mide para evitar que cubra el destino del desplazamiento.
- Las ideas incluyen controles inferiores para avanzar y comenzar la práctica. Al cambiar de idea, el título nuevo recibe el foco; ya no es necesario volver al principio del bloque para continuar.
- Los niveles usan botones nativos agrupados con su estado pulsado, en lugar de un patrón ARIA de pestañas incompleto.
- Las correcciones de evaluaciones, lectura, dictado y entrenadores revisados reciben foco sin provocar un salto de desplazamiento. En el diagnóstico, Tab pasa de la explicación a «Continuar»; la pregunta siguiente recibe el foco. Al cerrar el resultado se vuelve al botón que inicia la evaluación.
- Las tablas y ejemplos que realmente desbordan pueden recibir foco y desplazarse con flechas. El marcado conserva el papel de imagen de las partituras. Cuando el contenido cabe, se retira el punto de tabulación añadido.
- Se ampliaron controles principales, campos numéricos, deslizadores, menús y etiquetas de autoevaluación. Las zonas espaciales del dibujo de manos conservan su geometría para evitar solapamientos; no se afirma que todos los objetivos de la interfaz midan 44 px.
- Se cancelan reproducciones antiguas al reconstruir laboratorios de métrica/polirritmia. Los controles reconstruidos conservan un destino de foco. La edición manual de polirritmias utiliza «Aplicar combinación» y valida enteros entre 2 y 8, evitando mostrar un patrón aplicado distinto de los valores que se acaban de confirmar.

### Comprobaciones realizadas

- Las 23 unidades se recorrieron a 320 px, comprobando ancho y destino de foco. En vista guiada todas conservaron el ancho de página. La vista completa permitió detectar y corregir el caso adicional de ritmo, cuya corrección se volvió a verificar a 320 px.
- Se comprobaron adicionalmente anchos de 360, 768 y 1280 px en los recorridos inspeccionados. No se mantuvo ninguna modificación temporal del tamaño del navegador.
- Se completaron diez preguntas de diagnóstico mediante Enter y Tab: foco en corrección, Continuar y título de la siguiente pregunta en las diez. Cerrar devolvió el foco a «Iniciar diagnóstico».
- Una tabla de tempo se desplazó horizontalmente con ArrowRight manteniendo el ancho de página en 320 px.
- La combinación 5:3 se aplicó y representó correctamente. El valor 9 mostró el mensaje de validación sin alterar el patrón aplicado.
- Validación acumulada: 35 pruebas aprobadas, incluida la suite compartida de práctica; sintaxis y diff sin errores. No se observaron errores de consola en los recorridos finales inspeccionados.

Referencias de criterio: [orden del foco, W3C](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [tamaño de objetivos, W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) y [patrón de pestañas, W3C](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). El tamaño de 44 px usado para los controles principales es una decisión de facilidad de uso; el criterio mínimo AA citado es 24 px con excepciones.

Pendiente: verificación con lectores de pantalla reales, pruebas en dispositivos físicos y observación con alumnos. Esta revisión no constituye una certificación completa de WCAG. Los cambios permanecen locales, sin commit ni push.
