# Producción musical · Crescendo Academy

Ruta pública: https://crescendoacademyec.github.io/inicio/herramientas/produccion-musical/

Aplicación estática con 12 materias, 48 lecciones, 12 proyectos y 9 laboratorios. Incluye 48 preguntas de lectura, 48 casos de aplicación, 12 tareas de lección y 2 consignas verificables en los controles de EQ/compresión. El instrumento de ejemplos puede cargar Soundfont Player desde CDN. Consultar [INVESTIGACION.md](INVESTIGACION.md) para el mapa curricular, fuentes, alcance y criterios pedagógicos.

## Archivos

- `curriculum.js`: contenido original, dependencias, preguntas y proyectos.
- `resources.js`: biblioteca de fuentes oficiales y herramientas.
- `illustrations.js`: 48 gráficos originales con títulos, descripción accesible y explicación.
- `lesson-extensions.js` y `extensions.css`: ampliaciones de 21 lecciones, fotos, patrones, plugins, Ecuador y Suno.
- `teaching-labs.js`: ADSR audible y modelos interactivos de aliasing/proximidad.
- `instrument-eq.html` y `embedded-eq.js`: anfitrión del EQ original de Tabla de frecuencias con altura adaptable.
- `assets/photos.json`: créditos, procedencia y licencias de siete fotografías locales.
- `AUDITORIA.md`: cobertura, límites y prioridades pedagógicas.
- `models.js`: cálculos, generación de demo/patrones, edición y exportación PCM16.
- `audio-lab.js`: procesamiento Web Audio, controles y visualizadores.
- `app.js`: rutas por hash e interfaz de estudio.
- `progress.js`: formato de progreso identificado, migración de copias antiguas e importación con recuperación de la copia anterior.
- `learning-design.js`: seis experiencias iniciales, orientación, casos de evaluación, tareas y rúbricas graduadas.
- `styles.css`: diseño adaptable y reducción de movimiento.

## Ejecución y verificación

Desde la raíz del repositorio:

```sh
python3 -m http.server 8767
node --test herramientas/produccion-musical/tests/*.test.cjs shared/tool-routes.test.cjs
```

Abrir `/herramientas/produccion-musical/`. El audio requiere una interacción del usuario. La aplicación no solicita micrófono, no sube archivos y detiene la escucha al abandonar la sección o pasar a segundo plano.

Las rutas `#curso/mezcla/mezcla-2`, `#laboratorio/eq`, `#proyectos/mastering` y `#evaluacion/sonido` admiten enlaces directos. El progreso usa `crescendo-production-v1` en localStorage, con exportación/importación JSON. Las marcas antiguas de proyecto se conservan como declaraciones; sus niveles nuevos empiezan sin revisar. El formato actual tiene `app: crescendo-production` y versión 2; conserva la misma clave local y migra las copias completas de versión 1. Antes de importar se valida el formato y se conserva la copia anterior en `crescendo-production-v1-respaldo`; si falla el respaldo, no se reemplaza el curso. «Recuperar copia anterior» intercambia ambas versiones. Una copia auditiva o de otro curso se rechaza. Los apuntes se limitan a 10 000 caracteres y el archivo importado a 1 MB. Audio, ajustes de procesadores y checklist temporal de entrega no forman parte de esa copia.

## Verificaciones manuales de la entrega inicial de octubre

Navegación, respuestas incorrectas/correctas, evaluación 4/4, guardado tras recarga, bitácora de proyecto, exportación e importación de progreso, escucha EQ/compresión, pendientes de paso, cancelación de fase, cálculos, referencias de entrega, secuenciador y descarga WAV. Comprobados escritorio de 1280 px y móvil de 390 px sin desbordamiento horizontal general. Los proyectos de DAW necesitan revisión docente de las evidencias.

## Práctica auditiva

Ruta `#escucha`: 20 habilidades de EQ, dinámica, mezcla, espacio estéreo, edición y síntesis. Motor compartido con Tabla de frecuencias, sesiones de 5/10 rondas, dificultad adaptativa, repaso y progreso local con exportación e importación propias, separadas del curso. Demos originales sintetizadas; multitracks y revisión docente siguen fuera de la plataforma. Véase [documentación del entrenamiento](../../shared/ENTRENAMIENTO-AUDITIVO.md).

## Correcciones del 17 de noviembre de 2026

Ver [auditoría y cierre](../../auditorias/produccion-musical-2026-11-17.md). Primeros pasos muestra seis experiencias con tiempos orientativos, evidencia y teoría desplegable; el curso completo conserva las 48 lecciones. La forma de trabajo puede ser acompañada o autónoma, sin restricción por edad ni bloqueo por diagnóstico. Los registros de lectura, tareas, escucha y proyecto son distintos.

Los filtros de paso convierten Q lineal a la convención de Web Audio. El pico es el máximo de L/R antes de mono y del volumen de escucha; el RMS promedia energía de ambos canales y duplica una fuente mono a L/R. El visualizador se identifica como suma mono. La compensación de B no cambia A; su bypass evita EQ, compresión, retorno de delay y esa compensación, conservando la entrada común.

Para comprobar los filtros y medidores en la API real, abre `tests/browser-audio.html` desde el servidor y pulsa «Ejecutar comprobaciones». Renderiza offline, sin micrófono ni sonido. Cubre seis filtros y cinco configuraciones de canales. No reemplaza escucha crítica, revisión docente ni comprobación en todos los navegadores.
