# Ediciones corregidas

Las correcciones musicales se guardan aquí como `.musicxml`. Así se conservan los originales descargados y la siguiente actualización no borra el trabajo de revisión.

La entrada de `catalog.json` debe registrar `correctionFile` (por ejemplo, `correcciones/tema.musicxml`) y `correctionSourceSHA256` con la huella de la fuente revisada. Se actualizan también `reviewStatus`, `reviewSummary` y `reviewLog` para explicar el cambio.

Después se ejecuta `actualizar-melodias.py`. Si la fuente original cambia, se invalida la revisión anterior. Las partituras de `partituras/` son generadas: el actualizador se detiene si detecta modificaciones manuales sin registrar, para evitar sobrescribirlas.
