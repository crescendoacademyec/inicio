# Auditoría de ejemplos junto a la explicación

Fecha: 19 de octubre de 2026. Alcance: Teoría y Lectura Musical, Armonía Funcional, Armonía Jazz y Producción Musical.

## Problema encontrado

Los laboratorios eran útiles, pero no siempre aparecía una representación del concepto antes de llegar a la práctica. En el archivo base de Armonía Funcional había 165 conceptos: 37 declaraban un diagrama de piano; muchos otros dependían del material interactivo final. La primera unidad empleaba tono, semitono, cualidad y grados antes de explicar esas referencias con ejemplos locales.

Producción ya tenía 48 ilustraciones originales, pero su plantilla reunía los párrafos primero y mostraba el dibujo después de toda la lectura. Jazz concentraba numerosos apoyos en montajes de laboratorio al final de cada tema. Lectura tenía buenos ejemplos en algunas secciones y otras se apoyaban principalmente en texto.

## Correcciones aplicadas

- Se incorporan ejemplos escritos expresamente para cada concepto o bloque: pentagramas con Bravura, comparaciones de acordes, secuencias temporales, tablas, ondas y mapas de procesos. Cada uno lleva una explicación de lo que se debe observar. Las etapas de un procedimiento usan esquemas; las alturas e intervalos usan notación.
- La primera unidad funcional empieza por semitono, tono y octava. Explica que se cuentan pasos cromáticos, no las notas de los extremos; que Mi–Fa y Si–Do son semitonos; que una octava justa contiene doce semitonos; y que el patrón mayor es T–T–S–T–T–T–S. El patrón aparece también entre las notas del ejemplo, con nombres y registros. Se comparan otras familias de escalas.
- Se distingue tamaño escrito de intervalo y distancia cromática: Do–Mi y Do–Mi♭ son terceras, pero miden cuatro y tres semitonos. Se incluye la escritura de dobles alteraciones.
- La explicación de alterar intervalos precisa que se mantiene fija la nota inferior; transponer ambas notas por igual no cambia la cualidad del intervalo.
- El préstamo modal se explica con notas reales y escalas paralelas. Se corrige el ejemplo que trataba material mayor natural como préstamo en una tonalidad mayor. Las dos preguntas asociadas se reescriben para evaluar Fm en Do mayor y el Fa♯ de Re mayor en un contexto de La menor, sin presentarlos como las únicas posibilidades.
- Se respeta la operación Skip 2 específica del curso: segunda nota desde abajo hacia arriba, elevada una octava. Se distingue de Drop 2, que cuenta desde arriba y baja una octava.
- El texto introductorio de jazz deja de presentar la séptima como requisito general para todo acorde de jazz. Los ejemplos comparan tríadas, sextas, tétradas, semidisminuidos y disminuidos según el tema.
- En jazz el ejemplo se inserta después del párrafo introductorio, antes del resto del desarrollo y los montajes finales. Incluye los temas añadidos por piano-bank y Baga, no solo el archivo de datos inicial.
- En producción cada párrafo conceptual tiene su esquema. Las 48 ilustraciones existentes se conservan y se sitúan junto al párrafo correspondiente. Se distinguen frecuencia, amplitud y timbre con comparaciones de ondas; señal/control, proceso/destino y entradas/salidas con mapas de flujo.
- Se mantienen los laboratorios, entrenadores, audio y preguntas finales para practicar después de comprender el ejemplo. No se modifica el progreso guardado.

## Cobertura comprobada

| Curso | Cobertura del material explicativo |
| --- | --- |
| Armonía Funcional | 178 conceptos en 35 temas, incluidos los cinco niveles que construye la aplicación. |
| Teoría y Lectura Musical | 83 títulos de bloque del currículo base y las ampliaciones de niveles 2 y 3; los recorridos seleccionan y reutilizan algunos bloques. |
| Armonía Jazz | 79 temas de los cinco niveles, incluyendo rutas, proyectos, referencia de repertorio y los dos temas añadidos por módulos de laboratorio. |
| Producción Musical | 144 párrafos conceptuales de 48 lecciones, además de las 48 ilustraciones originales conservadas. |

El catálogo contiene tres alias adicionales para conceptos que el curso funcional mueve de unidad durante su normalización. No se cuentan como conceptos nuevos. La relación de claves y ejemplos está en `cobertura-ejemplos.csv`.

La cobertura garantiza que hay un ejemplo asociado, no que todos los dibujos sean del mismo tipo ni que cada ejemplo sea un ejercicio interactivo. Los proyectos y protocolos se explican con mapas de decisiones; los conceptos de altura y construcción de acordes, con pentagramas.

## Verificación

- Pruebas que recorren los datos y también las transformaciones reales de las aplicaciones: ningún concepto o tema de este alcance queda sin clave de ejemplo.
- Todas las alturas del catálogo se analizan y todos los ejemplos se renderizan sin coordenadas inválidas. Se comprueba la diferencia entre escritura y semitonos, las posiciones de Mi/Fa en el pentagrama y la coincidencia matemática del patrón mayor y menor con las notas dibujadas.
- Comprobación de que los ejemplos están dentro de la lectura y de que se conservan los laboratorios finales.
- Pruebas existentes de acordes, transposiciones, cuestionarios, lectura, solfeo, ritmo, generadores, modelos de audio y producción.
- Inspección visual en navegador de la primera unidad funcional, lectura, cifrado jazz y sonido/producción. Los ejemplos funcionales ocupan las dos columnas de su plantilla, sin quedar estrechos junto al término. Se revisa además producción a 390 px: los ejemplos no ensanchan la página.

## Límites y mantenimiento

Los pentagramas son ejemplos didácticos, no transcripciones ni ejercicios para imprimir con valor rítmico implícito. Las barras temporales indican unidades de duración; los gráficos de audio son modelos esquemáticos. La notación usa la fuente Bravura incluida en el repositorio y no depende de una fuente musical instalada en el sistema.

Los ejemplos se asignan mediante claves explícitas de tema/término o lección/párrafo, no mediante coincidencias de palabras. Si cambia un título o se añade contenido, `shared/concept-examples.test.cjs` debe detectar la falta de cobertura. Los materiales específicos de un método se identifican como tales y no se convierten en prohibiciones musicales universales.
