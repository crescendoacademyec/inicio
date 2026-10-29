# Grabación de referencia y sincronización

La barra **Audio / YouTube** está junto a los controles de compases, sobre la partitura. Admite un archivo local de audio/video o un enlace oficial de YouTube y conserva los controles de escritura disponibles. Los archivos locales se guardan en IndexedDB del navegador; el proyecto conserva su identificador, nombre y marcadores. Al trasladar el proyecto a otro navegador se debe volver a vincular el archivo local. Los enlaces YouTube se conservan en el proyecto.

El transporte ofrece reproducción/pausa, detener, retroceder dos segundos, posición, velocidad sin cambio de tono para audio local, seguimiento de partitura y repetición A–B. Al ocultar la barra se pausa la grabación. El video de YouTube permanece visible en su reproductor oficial y necesita que el propietario permita su inserción.

La sincronización inicial utiliza el tempo y los compases de la partitura. Para corregir una interpretación con tempo variable, selecciona un compás, busca su comienzo en el audio y pulsa **Vincular con este instante**. Los tiempos entre marcadores se interpolan usando el mapa de tempo; después del último marcador se extrapola el último ritmo medido hasta el final del último compás. Los marcadores deben avanzar en tiempo. Se pueden editar y quitar en **Fuente y sincronización avanzada**, sin borrar la transcripción.

La detección de inicio de archivos menores de 20 MB analiza el umbral de energía; no es un reconocimiento automático de notas ni una alineación acústica completa. En grabaciones largas se utiliza el comienzo del archivo y se ajusta con marcadores. Las marcas y cambios de fuente participan en deshacer/rehacer; el archivo local se conserva para permitir recuperar versiones anteriores.

Implementación: `src/score-editor-recording-sync.js`, integración de controladores en `src/app.js` y diseño en `ipad-shell.css`. Pruebas: `node --test herramientas/editor-crescendo/tests/*.test.cjs`. API oficial: https://developers.google.com/youtube/iframe_api_reference.
