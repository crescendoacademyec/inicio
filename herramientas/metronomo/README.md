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
