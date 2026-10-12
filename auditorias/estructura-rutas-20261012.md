# Estructura y rutas · 12 de octubre de 2026

La raíz local continúa siendo `herramientas-pedagogicas`. No se creó una carpeta `inicio`; `/inicio/` es el prefijo del repositorio en GitHub Pages.

- `index.html`: escuela.
- `herramientas/index.html`: catálogo público.
- `herramientas/<programa>/`: los 20 programas, incluidos los cursos ocultos.
- `mi-crescendo/`: portal.
- `escuela/`, `shared/`, `auditorias/`: recursos institucionales, recursos comunes e informes/pruebas.

Se retiraron las 20 carpetas antiguas de programas de la raíz. Solo contenían redirecciones y metadatos de Finder; se conservó una copia local previa en `/tmp/crescendo-carpetas-antiguas-20261012/`, incluidos los metadatos modificados de ChordSync. Los enlaces externos o marcadores que aún utilicen rutas antiguas requieren actualizarse a `/inicio/herramientas/<programa>/`.

## Revisión

`node --test shared/tool-routes.test.cjs`: cuatro comprobaciones aprobadas.

1. Todos los programas tienen índice dentro de herramientas y no tienen carpeta duplicada en la raíz.
2. Enlaces y recursos locales de todas las páginas HTML del sitio: navegación, imágenes, scripts, CSS, audio/vídeo, iframes y CSS embebido, respetando las etiquetas base.
3. Recursos de las hojas CSS y rutas literales de navegación en scripts/datos originales.
4. Importaciones y reexportaciones locales de módulos JavaScript.

Se excluyen bibliotecas de terceros, endpoints de servidor `/api/`, enlaces externos, rutas construidas dinámicamente y archivos de pruebas. Esta comprobación verifica existencia y estructura; no afirma probar cada función de cada aplicación ni disponibilidad de servicios externos.

Las rutas entre la escuela, catálogo, Mi Crescendo y programas ya apuntaban a herramientas y se conservaron. Se corrigieron referencias preexistentes a fuentes no distribuidas en AAC y Editor Crescendo usando sus alternativas locales; el fondo del editor ahora apunta a una imagen existente. Las fuentes musicales Bravura distribuidas se conservan.

Comprobación en navegador local: catálogo, apertura de Piano Virtual desde su tarjeta y carga del Editor Crescendo. El catálogo mantiene sus 12 herramientas públicas; los programas ocultos permanecen ocultos.

## Comprobación general adicional

Al ejecutar las pruebas de shared, producción y auditorías, pasaron 31 y falló una prueba antigua de `auditorias/playback-regression.test.cjs`: el contexto simulado del cambiador de velocidad no define `fallbackMedia`. Tanto esa prueba como `herramientas/speed/index.html` son idénticos al commit anterior. No se modificó la reproducción para realizar esta reorganización. Después se añadió y aprobó la cuarta comprobación de rutas (importaciones de módulos).
