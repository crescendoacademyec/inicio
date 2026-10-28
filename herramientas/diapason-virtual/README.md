# Diapasón Virtual · Revisión profesional

Esta versión parte de la Fase 5 y aplica una revisión musical, responsive y estructural.

## Correcciones musicales
- Corrige la altura sonora del requinto A–D–G–C–E–A una octava abajo respecto de la versión anterior.
- Guitarra, ukelele y requinto conservan altura sonora para audio/diapasón y se muestran una octava arriba en el pentagrama, siguiendo la escritura habitual de la familia de guitarra.
- MusicXML se convierte de altura escrita a altura sonora con -12 semitonos para los tres instrumentos.
- El diapasón respeta spelling enharmónico según la fundamental (Db/Eb/Gb/Ab/Bb cuando corresponde).
- “Grados” ahora muestra alteraciones funcionales (♭3, ♯4/♭5, ♭7…) en lugar de numerar simplemente el orden de la escala.
- 3NPS se habilita solo para escalas heptatónicas; para escalas de 5/6/8 notas vuelve automáticamente a Libre.

## UX / responsive
- Compactación adicional para portátiles de 13 pulgadas entre 1180 y 1450 px.
- Panel de controles aprovecha mejor el ancho antes de saltar a diseños de tablet/móvil.
- El selector Modelo muestra digitaciones independientes y ofrece Todo el diapasón. El enfoque de 3 notas por cuerda conserva siete digitaciones para escalas heptatónicas.

## Estructura
- `js/fretboard.js`: teoría, instrumento, audio y diapasón.
- `js/staff.js`: pentagrama.
- `js/metronome.js`: metrónomo y pulso.
- `js/score.js`: PDF, imágenes, web, MusicXML, reproducción, tutor y digitación de frase.
- `js/ukulele-chords.js` y `js/ukulele-bank-ui.js`: banco específico de ukelele.
- `js/guitar-chords.js` y `js/guitar-bank-ui.js`: bancos separados de guitarra estándar y requinto estándar. Incluye 561 posturas verificadas en tres registros; el requinto conserva las formas y presenta los nombres una cuarta justa arriba.
- `tests/validate.js`: comprobación básica de IDs y dependencias.
- `tests/guitar-bank.test.js`: verificación de notas, posiciones e igualdad interválica entre guitarra y requinto.

## Publicación
Sube `index.html`, `css/`, `js/` y cualquier recurso adicional que ya use tu repositorio. La versión `diapason-virtual-standalone.html` se incluye para pruebas/archivo.

## Modelos de estudio y color modal
- `js/study-models.js` define celdas cuerda/traste, no ventanas de trastes. Las cinco digitaciones de Do mayor siguen Guitarra 1 de Mateus Starling, p.20; las bases de menor melódica y armónica siguen Guitarra 3, pp.5 y 31. Los demás modos de siete notas adaptan las alturas de los modelos por grado.
- Las pentatónicas conservan cinco modelos y las escalas blues agregan sus notas de paso. Las escalas simétricas usan digitaciones compactas con repetición propia, sin inventar cinco modelos diferentes.
- El selector Arpegio es independiente del de acordes: las cinco regiones de séptimas siguen la referencia de Guitarra 2, p.11; sus grados se adaptan a tríadas y demás calidades. Guitarra 4, pp.5–6, fundamenta también la inclusión de 7♭5.
- Transposición coherente de las regiones, afinaciones, capo y requinto; los puntos se calculan a partir de alturas sonoras. La vista de pentagrama conserva el convenio escrito de la aplicación.
- Un aro violeta identifica las notas características sin reemplazar el relleno funcional. Se puede activar o desactivar desde la leyenda. Algunas escalas necesitan más de una nota de referencia; no se asigna una nota modal única a pentatónicas o escalas simétricas.
- Referencias teóricas: [Berklee: modos mayores y menores](https://online.berklee.edu/takenote/music-modes-major-and-minor/) y [Open Music Theory: modos diatónicos](https://viva.pressbooks.pub/openmusictheory/chapter/diatonic-modes/).
- Verificación: `node --test herramientas/diapason-virtual/tests/*.test.js` y `node herramientas/diapason-virtual/tests/validate.js`.

## Estudio guiado
- El botón **Estudio guiado** abre nueve apartados: ciclos, motivos/patrones, tríadas abiertas, superposiciones, armonía cuartal, acordes híbridos, voicings con tensiones, conducción de voces y estructuras outside.
- `js/study-lab-engine.js` es el motor musical independiente de la interfaz. Calcula posiciones compactas de una nota por cuerda desde las alturas de la afinación activa. Valida rango, cuerdas e inversión real del bajo; informa cuando una combinación no cabe, sin inventar notas ni borrar voces.
- Los ciclos usan su período real: cuartas/quintas recorren doce raíces, terceras mayores tres y terceras menores cuatro. Los recorridos melódicos pueden seguir terceras, grupos de 3/4 o un motivo 1–3–2–4, con figuras y motivos rítmicos configurables.
- Los bloques cuartales son diatónicos; las tríadas abiertas separan la voz central una octava. Los híbridos mantienen un bajo independiente por debajo de la tríada. La conducción de voces propone enlaces entre digitaciones compactas cercanas y muestra los movimientos y notas comunes.
- Las superposiciones permiten escuchar pentatónicas, tríadas y tétradas sobre un acorde base sostenido. El color se calcula desde ese acorde y una escala de referencia explícita. Rojo significa fuera de la referencia o una 11 sobre tercera mayor; no implica una prohibición universal de uso.
- La reproducción usa el timbre y volumen de la app, ilumina posiciones concretas y actualiza el pentagrama Bravura. Ofrece pausa, detener, pasos individuales, BPM y repetición. Cerrar o volver a exploración restaura el diapasón original.
- Los arpegios **1–4–5** y **1–2–5** también están disponibles en el selector principal. Los menús Drop 2/3 incluyen nuevas fórmulas de cuatro voces con séptimas, sextas y tensiones; el panel de estudio añade bloques de cinco voces cuando el instrumento y la posición lo permiten.
- Ejercicios y diagramas originales calculados; referencias de temas: Guitarra 1 pp.6–18; Guitarra 2 pp.36–48; Guitarra 3 pp.13–29 y 43–60; Guitarra 4 pp.11–43. No se distribuyen páginas ni repertorio de los libros.
- Pruebas adicionales: `tests/study-lab.test.js` verifica los nueve temas en doce tonalidades para guitarra/requinto, orden real de voces Drop, bajo de híbridos, cuartas diatónicas, ritmos, grupos de cuerdas, afinaciones alternativas, capo y ukelele.
