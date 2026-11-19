# Biblioteca de melodías de AAC

Desde la raíz del repositorio:

```sh
python3 herramientas/aac/tools/serve-melody-pilot.py --open
```

También se puede abrir `Abrir Melodías.command` en macOS. Dirección: http://127.0.0.1:8815/herramientas/aac/?melody=library.

## Vistas y temas

Los botones **Melodía y partitura** y **Análisis separado** permiten ver fuente/partitura, solo el lienzo de análisis o ambos. **Ver análisis** controla las anotaciones superpuestas sobre el pentagrama. Ocultar una vista conserva sus datos.

Seleccionar un ejemplo carga el análisis correspondiente a esa edición, en su tonalidad y con sus compases escritos. Las ediciones de cada tema se conservan en borradores privados del navegador, separados por tema y fuente MusicXML. Si no existe un borrador, se genera una propuesta editable de análisis a partir de los acordes de la fuente. Esa propuesta automática necesita revisión musical; no equivale a un análisis curado. No se reutiliza el análisis de otro tema por tener la misma cantidad de compases.

**Original de la fuente** conserva sus acordes. **Estudio / reharmonización** muestra los acordes editables y el análisis de AAC. Haz clic directamente sobre un acorde de la partitura para abrir el mismo menú de sustituciones que usa el lienzo. **Crear estudio desde el original** reconstruye el estudio desde los cifrados originales. La imagen guía permanece intacta. Los conectores gráficos del lienzo siguen disponibles en la vista separada; sobre el pentagrama aparecen los campos de texto del análisis.

## Cabecera de reproducción y práctica

La cabecera fija reúne el título y el transporte, y debajo los controles de tema, importación y análisis. Los iconos tienen nombres accesibles y descripciones al pasar el mouse. El botón triangular alterna reproducción/pausa; el cuadrado detiene. Anterior/siguiente y **Desde** eligen el compás de inicio. También se puede seleccionar un compás en la partitura.

**A** y **B** marcan los compases de inicio y final de la frase, incluidos ambos extremos. El icono de repetición activa/desactiva el bucle. Los ajustes permiten elegir A/B directamente, transportar, cambiar corcheas rectas/swing 2:1 y activar el metrónomo. El tramo sigue el recorrido de repeticiones escrito. Seleccionar una posición fuera del tramo desactiva el bucle. La programación de audio anticipa las vueltas con el reloj de Web Audio; la partitura y ambas guías consumen un único estado del reloj audible. Se recortan las notas al final de B, incluidas las ligaduras largas. El bucle es una herramienta de práctica y no modifica las exportaciones musicales.

El swing 2:1 conserva los tresillos y es una proporción fija de práctica, no una interpretación humana adaptativa. C-Jam Blues, Autumn Leaves y All of Me comienzan con swing; Blue Bossa y Footprints con valores rectos. El piano reproduce solo la melodía; el usuario ejecuta los acordes.

## Distribución manual

Selecciona un compás y usa **↑ / ↓**. Se desplaza el salto de sistema sin cambiar el orden musical: hacia arriba se incorpora el compás seleccionado y los anteriores de su línea; hacia abajo, el seleccionado y los siguientes comienzan la nueva línea. El ajuste de escala permite respetar los saltos elegidos; si la línea queda demasiado llena, se rechaza el cambio y se conserva la distribución anterior. **Distribución automática** restablece el espaciado adaptativo.

Los saltos de Original y Estudio se guardan por separado en el JSON y en los borradores; MusicXML conserva los saltos de la vista exportada. Un editor externo puede volver a distribuirlos según su configuración y tamaño de página.

## Guías instrumentales

Piano, guitarra o ambos aparecen en un panel fijo inferior de ancho completo. Se comparten las superficies visuales originales de Piano Virtual y Diapasón Virtual, además del modelo de alturas, geometría, afinaciones y posiciones. La guitarra conserva madera oscura, trastes plateados y puntos guía.

Ambas guías muestran altura sonora real. Sol4 de concierto corresponde a MIDI 67; no se baja una octava por seleccionar guitarra. Si MusicXML declara Sol4 escrito con transposición -12, se muestra Sol3/MIDI 55, aplicando esa transposición una sola vez. Se indican las notas fuera de rango. En guitarra, el círculo lleno sugiere una posición y los contornos muestran alternativas de la misma altura. La ruta no asigna dedos ni garantiza una digitación definitiva.

## Exportación y archivos privados

**Archivo → Exportar melodía y análisis** ofrece MIDI, MusicXML, PDF, PNG y SVG. El selector Página elige la imagen. MusicXML permite continuar en Dorico o MuseScore; se retiró la descarga .mscz. PDF usa MuseScore Studio instalado como motor local (`AAC_MUSESCORE_BIN` permite configurar su ruta). El servicio escucha solo en 127.0.0.1 y no envía partituras a servicios externos.

El JSON de AAC, versión 45, incorpora MusicXML original/actual, tempo, transporte, fraseo, bucle, saltos y revisión. Las fuentes visuales siguen siendo recursos locales. La biblioteca oficial y sus fuentes están en `Melodías/`, con catálogo y estados de revisión. Los intermediarios OMR, documentos completos y archivos de auditoría de `private-pilot/` siguen excluidos de Git.

## Alcance y comprobación

La biblioteca contiene 42 temas: los cinco iniciales (C-Jam Blues, Blue Bossa, Autumn Leaves, All of Me y Footprints) y 37 partituras digitales aportadas por el usuario. Véase `Melodías/README.md` para incorporar más archivos. Las introducciones/codas excluidas se indican en cada ejemplo y en `private-pilot/REVISION.md`. Audiveris necesitó correcciones manuales de alturas, octavas, ritmos y compases; una lectura OMR sin revisar no se considera una transcripción final. La autorización para ampliar la biblioteca ya existe; la transcripción masiva todavía no se ha realizado.

```sh
node --test herramientas/aac/tests/*.test.cjs shared/instrument-pitch-model.test.cjs
node auditorias/run-musical-tests.cjs
```

Las pruebas cubren alturas, octavas, repeticiones, casillas, ligaduras, swing, límites de bucle, programación continua, separación de borradores y conservación de saltos. La comprobación en navegador también es necesaria: un MusicXML con una dirección sin `direction-type` podía conservar el audio y hacer que OSMD omitiera el primer compás. Se corrigió esa estructura y se verificaron las dos corcheas Sol4 iniciales de C-Jam Blues.
