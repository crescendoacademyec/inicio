# Melodías

Biblioteca oficial de AAC: **3330 entradas**, con 2490 fuentes MEI y 840 MusicXML. Reúne las fuentes distintas del lote completo de Realbook y conserva los cinco temas iniciales: C-Jam Blues, Blue Bossa, Autumn Leaves, All of Me y Footprints.

## Añadir archivos

Puedes colocar aquí los próximos `.mei`, `.musicxml` o `.xml` que quieras incorporar y avisar para su revisión. Conserva el archivo descargado; no hace falta crear una melodía nueva desde los acordes.

Después de revisar un lote, desde la raíz del repositorio:

```sh
python3 herramientas/aac/tools/actualizar-melodias.py
python3 herramientas/aac/tools/actualizar-melodias.py --check
```

El actualizador detecta el contenido real, informa de extensiones incorrectas, conserva los originales y genera las partituras y el catálogo de AAC. Una entrada nueva se marca **pendiente de revisión musical**. Una edición de un original invalida su revisión anterior. Los errores de entrada impiden reemplazar el catálogo válido.

## Organización

- Archivos en esta carpeta: las fuentes originales, con su extensión correcta.
- `partituras/`: MusicXML que utiliza AAC; para las fuentes MEI se conserva su recorrido de interpretación en los metadatos.
- `referencias/`: fotos completas de 638 obras distintas de los dos Real Books aportados, incluidas las cinco imágenes guía iniciales. El [índice de referencias](referencias/INDICE.md) reúne las 802 páginas; su catálogo conserva las ediciones repetidas sin duplicar las fotos.
- `correcciones/`: versiones revisadas, vinculadas a la huella de la fuente para conservar las correcciones al regenerar el catálogo.
- `catalog.json`: títulos, compositores, tempo, procedencia, huellas SHA-256, notas, compases y estado de revisión.

Los originales permanecen intactos. Las correcciones posteriores deben quedar documentadas en el catálogo y conservar una referencia de la edición de origen.

Las fotos y las partituras digitales tienen catálogos separados. Tener una foto disponible no añade automáticamente una melodía reproducible: la biblioteca digital se actualiza mediante su catálogo. Una foto de otro libro o edición debe contrastarse antes de asociarla como fuente de un XML/MEI.

## Revisión e interpretación

Los cinco temas iniciales fueron corregidos contra las fuentes aportadas; el catálogo detalla el alcance de cada ejemplo (tema principal, anacrusas y posibles introducciones/codas excluidas). El resto tiene comprobación técnica de lectura, conservación de notas y recorrido. Esa comprobación no equivale a una revisión editorial de cada nota contra otra edición.

AAC reproduce repeticiones, casillas, D.C./D.S., coda y Fine codificados en MusicXML. En MEI sigue `expansion/@plist`. Sonido, cursor, piano, guitarra y MIDI comparten el recorrido. Una indicación escrita únicamente como texto ambiguo requiere revisión manual; el programa no inventa secciones de solos.

La armonía original se conserva; los cambios de acordes y el análisis automático pertenecen al estudio editable del usuario. Los borradores del navegador no modifican estos originales.

## Lote Realbook de noviembre de 2026

El informe inicial `auditoria-20261125/INFORME.txt` documenta el primer lote. El complemento `auditoria-20261125-complemento/INFORME.txt` registra los 17 archivos entregados después: 14 fuentes nuevas y 3 idénticas a fuentes existentes, con comprobación de lectura, dibujo y reproducción. Descargas permanece intacta. Las ediciones alternativas y los cinco pilotos se conservan por separado. La lectura y reproducción se comprueban automáticamente; no se afirma una revisión editorial de cada nota.

Practice añade tonos guía en clave de fa sin reescribir la melodía original. Busca otra octava para evitar teclas compartidas; omite un tono si no hay posición segura. El pentagrama de práctica participa en sonido y exportaciones mientras el botón está activo.
