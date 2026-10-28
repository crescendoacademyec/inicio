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
