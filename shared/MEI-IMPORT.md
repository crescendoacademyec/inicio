# Importación MEI en instrumentos Crescendo

Piano Virtual, Diapasón Virtual, Requinteando, Bass Virtual y Cuerdas Frotadas aceptan `.mei` en **Cargar partitura**. El lector también detecta MEI guardado erróneamente como `.xml`. MusicXML y MXL mantienen su flujo habitual.

`score-file-reader.js` convierte localmente la notación MEI moderna a MusicXML para reutilizar OSMD y los reproductores/tutores existentes. No envía la partitura a un servidor ni modifica el archivo original. Conserva título/compositor/derechos, alturas, armaduras, duraciones, voces, acordes, silencios, tresillos, ligaduras, tempo y cifrado. La altura sonora MEI declarada se aplica una sola vez; sin transporte declarado se utiliza altura de concierto, incluso en guitarra/bajo.

## Alcance

- Una partitura `<score>`, pentagramas modernos con capas y duraciones explícitas o simbólicas, hasta 8 MB.
- Repeticiones y casillas se conservan visualmente. Para MEI, el reproductor sigue la secuencia declarada en `expansion/@plist`, incluidos regresos y coda; para MusicXML, calcula el recorrido a partir de barras, casillas y las instrucciones `sound` de D.C./D.S., coda y Fine. Las referencias MEI incompletas o circulares producen un error claro. El mismo recorrido gobierna cursor, sonido y digitación, incluso después de redibujar la página.
- Notación antigua, tablatura MEI, aparatos críticos, compases abreviados y partes con diferentes transportes requieren exportar MusicXML desde un editor. Los elementos reconocidos como incompatibles producen un mensaje, evitando omisiones silenciosas de notas.
- Cambios de armadura/compás en `scoreDef` se conservan; cambios dentro de una capa requieren MusicXML.
- La maquetación se recalcula con OSMD: no reproduce exactamente el diseño editorial de origen.

## Verificación

`node --test shared/score-file-reader.test.cjs`

`node auditorias/run-musical-tests.cjs`

La validación local usó las 20 entradas MEI de la carpeta del usuario (19 distintas, 3.180 notas contando el duplicado). Se conservaron notas y compases; se contrastaron duraciones ppq y alturas explícitas contra el XML original. Se probaron cargas reales en los cinco instrumentos y reproducción con teclas activas en Piano Virtual. Las partituras de usuario y sus conversiones no forman parte del repositorio.

Se abrieron en Piano las 37 copias distintas de la carpeta y se comparó el recorrido real del cursor con el esperado. Se corrigió el error de OSMD `parentVoiceEntry` de `Alone-Together.musicxml`: el algoritmo de colocación de silencios ahora omite entradas gráficas sin voces. El MusicXML de origen permanece intacto. Estas pruebas verifican carga, conservación de notas y recorrido; no sustituyen una revisión musical editorial de cada edición.

## Adaptador del cursor

`score-playback-route.js` construye una secuencia de pasos sobre los compases originales de OSMD. Sus clones avanzan independientemente para calcular duraciones; pausa, reinicio, navegación, loops A/B y redibujado conservan el orden de interpretación. Los límites de expansión evitan recorridos circulares infinitos.

La copia local de OSMD 1.8.4 conserva Bravura e incluye una guarda de acceso (`graphicalVoiceEntries[0]?.parentVoiceEntry`) al colocar silencios entre entradas de armonía. Los cinco instrumentos solicitan la nueva revisión con el parámetro `20261119-rest-placement`.
