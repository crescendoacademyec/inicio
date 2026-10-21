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

### Reemplazar una figura

Selecciona una duración en la paleta (o con su atajo) y pulsa la cabeza de una nota existente para sustituir su duración en el mismo tiempo. Por ejemplo, después de un tresillo de corcheas, una negra en el tiempo 2 puede convertirse en blanca sin borrarla antes. El editor aprovecha los silencios disponibles y ajusta las figuras siguientes al tiempo restante: con tresillo de corcheas, negra y blanca en 4/4, al convertir la negra en blanca, la blanca posterior queda como negra en el cuarto tiempo, conservando su altura. Al reducir la duración (blancas a negras, negras a corcheas, etc.), el tiempo liberado se completa con silencios y las figuras siguientes conservan su posición. Las figuras totalmente cubiertas se retiran; si un resto necesita varias figuras, se escriben ligadas. Se rechazan los cambios que excedan el compás o corten un grupo irregular. Admite puntillos, ambas claves y deshacer/rehacer. Con una figura distinta seleccionada, el clic reemplaza la duración aunque ya hayas escrito otras notas con esa figura. Si la duración coincide, el clic selecciona la nota para moverla con las flechas. Alt+clic permite seleccionar una nota sin cambiar su duración.

### Dibujar notas con ligadura

Elige una figura y activa la ligadura de frase o de prolongación. Dibuja la primera nota y luego la segunda: la ligadura se añade al escribir la segunda y el botón se desactiva. Puedes cambiar la figura entre ambas notas y cruzar una barra de compás. La prolongación exige notas consecutivas de la misma altura efectiva, incluida la armadura y las alteraciones. También puedes elegir notas ya escritas, o combinar una nota existente con una nueva. Esc o el propio botón cancelan la ligadura pendiente.

### Borrado selectivo y estructura

El botón con la goma, junto al selector de tonalidad, activa el borrador. Pulsa la cabeza de una nota o una marca (dinámica, cifrado, regulador o signo de repetición) para quitarla. Al borrar una cabeza de un acorde, permanecen las demás; al borrar una nota de un grupo irregular queda un silencio con la misma duración para conservar el grupo. El tiempo eliminado de las notas normales se completa automáticamente con silencios. Esc o el botón desactivan el borrador; escoger una figura vuelve a la escritura.

Las barras se resaltan en dorado al pasar el puntero y muestran una indicación. Un clic normal o derecho abre sus opciones junto a la barra. El menú permite añadir un compás desde la barra, antes o después del compás, o quitarlo. Estas operaciones afectan a ambas claves, desplazan sus notas y marcas y conservan los cambios de compás y tonalidad. Deshacer y rehacer restauran también el número de compases.
