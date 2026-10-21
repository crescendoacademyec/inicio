# Metrónomo Crescendo — lector avanzado

Versión del metrónomo con header Crescendo, favicon y lector ampliado.

## Lector
- Imagen
- PDF
- MusicXML / XML
- MXL
- OpenSheetMusicDisplay
- Cursor
- Anterior / siguiente
- Play / pausa / stop del cursor
- Loop A–B
- Count-in
- Sincronización opcional con el metrónomo
- Zoom

## Publicación
Se conserva `<base href="/metronomo/">` según la ruta aprobada.
La referencia a `fondo_metronomo.jpg` fue eliminada porque ese recurso no existe.

### Escritura y cifrado de acordes

La paleta de signos incluye **Cm7 (Cifrado de acordes)**. Selecciona ese botón y pulsa la posición del compás: escribe el símbolo y pulsa Guardar o Enter. Al volver a elegir la misma posición puedes editarlo o eliminarlo. Escape cancela. Los cifrados se conservan al deshacer/rehacer y al exportar la partitura; MusicXML conserva raíz, calidad, bajo y posición cuando el cifrado es convencional (por ejemplo F#m7/C#), o texto libre en los demás casos.

Los compases reservan al menos 26 píxeles entre los ataques más próximos; las figuras, líneas de escritura, vista previa y reproducción comparten el intervalo temporal de cada compás. Los pasajes densos amplían la partitura horizontalmente. Se puede navegar con la barra de desplazamiento o el gesto horizontal del trackpad (Shift + rueda también desplaza horizontalmente).

### Armaduras, alteraciones y compases variables

- **Armadura** en la segunda paleta selecciona la armadura inicial, de siete bemoles a siete sostenidos. Cada opción indica la tonalidad mayor y su relativa menor. La armadura se aplica a ambas claves y al sonido de las notas.
- **♯, ♭ y ♮** preparan una alteración para la siguiente nota; se desactivan después de escribirla. En modo acorde se aplica a la cabeza escrita. La alteración rige para esa nota y octava en el mismo pentagrama hasta la siguiente barra de compás; el becuadro permite cancelar una alteración de la armadura.
- **Clic derecho dentro de un compás o sobre su barra** abre el menú junto al puntero. «Compás desde aquí» y «Armadura desde aquí» rigen desde ese compás hasta el siguiente cambio. Los cambios se dibujan con Bravura y se incluyen en deshacer/rehacer, reproducción y PNG/PDF/MusicXML. Si la nueva capacidad dejaría notas o marcas fuera del compás, el cambio se rechaza conservando la escritura.
- Las blancas y figuras largas pueden comenzar en pulsos interiores y al terminar figuras previas: dos corcheas pueden seguirse de una blanca en el tiempo 2. Las líneas y la vista previa utilizan exactamente esas posiciones, filtradas por el espacio necesario para la figura.

Los compases variables utilizan una línea de tiempo acumulada: notas, silencios, barras de reproducción, repeticiones y exportación respetan la duración de cada compás. El conteo previo sigue el primer compás del ejercicio.

### Ajustar la altura con el teclado

Pulsa la cabeza de una nota existente para seleccionarla y usa ↑ o ↓ para moverla un semitono. Al subir se escriben sostenidos (Do → Do♯ → Re); al bajar, bemoles (Re → Re♭ → Do). Se respetan las armaduras, la duración y la posición rítmica. En un acorde se mueve la cabeza seleccionada. Los cambios admiten deshacer y rehacer.
