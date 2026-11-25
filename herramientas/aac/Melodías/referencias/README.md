# Referencias de partituras

[Abrir el índice por título](INDICE.md).

Esta carpeta reúne **638 obras distintas y 802 páginas** procedentes de los dos PDF aportados:

| Libro | Entradas en su índice | Páginas musicales del PDF |
| --- | ---: | --- |
| Berklee Real Book.pdf | 355 | 11–486 |
| Real-book-sixth-edition.pdf | 400 | 9–461 |

Las 755 entradas contienen 117 obras presentes en ambos libros. Se conserva una edición por obra, con todas sus páginas de continuación. El catálogo registra la ubicación de la otra edición. Se prioriza Berklee, salvo los cinco ejemplos iniciales, cuya fuente e imagen se conservan. «Yesterday» y «Yesterdays» permanecen separados, igual que las dos composiciones tituladas «Humpty Dumpty» de Chick Corea y Ornette Coleman.

## Organización

- Las cinco imágenes PNG iniciales siguen en esta carpeta, con sus nombres originales.
- `temas/<identificador>/pagina-01.jpg`, `pagina-02.jpg`, etc.: páginas completas, en orden, sin recortar pentagramas. Las nuevas imágenes se extraen a 180 ppp en JPEG de calidad 90.
- `INDICE.md`: títulos y enlaces a cada página.
- `catalog.json`: títulos alternativos, libro elegido, páginas del PDF e impresas, otras ediciones, dimensiones y huellas SHA-256 de las imágenes y de los PDF de origen.

El número de página del PDF cuenta desde la portada; la numeración impresa puede ser distinta. En Berklee, página PDF = impresa + 1; en la sexta edición, página PDF = impresa − 1.

Estas fotos sirven para revisar las melodías que se incorporen después. No certifican que un XML/MEI corresponda a la misma edición, tonalidad, forma o arreglo. AAC permite mostrarlas junto a las melodías mediante coincidencias de título, artículos y títulos alternativos. Se presentan como referencias del libro, con una advertencia sobre posibles diferencias de edición. Los títulos con compositores ambiguos requieren elección explícita; no se presentan como fuentes verificadas. Las cinco fuentes iniciales contrastadas conservan su vínculo. Se muestran todas las páginas de continuación. Esta asociación no cambia notas, acordes ni el estado de revisión.

## Regenerar y verificar

Desde la raíz del repositorio, con Python 3 y Poppler (`pdftoppm`):

```sh
python3 herramientas/aac/tools/preparar-referencias.py --dry-run
python3 herramientas/aac/tools/preparar-referencias.py --books /ruta/a/los/pdf
python3 herramientas/aac/tools/preparar-referencias.py --check
python3 -m unittest discover -s herramientas/aac/tests -p 'test_photo_references.py'
```

La carpeta de libros predeterminada es el Escritorio. Se comprueba la huella de ambos PDF antes de generar imágenes. El índice de entrada está en `herramientas/aac/data/realbook-reference-index.json`; sus títulos y números se contrastaron con los índices de ambos documentos y sus encabezados. Los rangos de continuación terminan antes del siguiente tema.

La extracción guarda avances cada diez temas y puede reanudarse. Solo reutiliza imágenes cuya huella, edición y página coincidan con el catálogo previo. `--check` verifica la biblioteca sin necesitar los PDF ni modificar archivos. No regenera ni revisa las partituras XML/MEI.

AAC tiene tres vistas independientes: **Melodía** (partitura digital reproducible), **Partitura** (foto del libro) y **Análisis** (lienzo editable). Al abrir la aplicación siempre se activa solo Melodía. Las otras vistas pueden combinarse durante la sesión. El informe `../auditoria-20261125-complemento/referencias.json` documenta el cruce realizado el 25/11/2026.
