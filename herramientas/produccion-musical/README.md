# Producción musical · Crescendo Academy

Ruta pública: https://crescendoacademyec.github.io/inicio/herramientas/produccion-musical/

Aplicación estática, sin dependencias externas, con 12 materias, 48 lecciones, 12 proyectos y 9 laboratorios. Consultar [INVESTIGACION.md](INVESTIGACION.md) para el mapa curricular, fuentes, alcance y criterios pedagógicos.

## Archivos

- `curriculum.js`: contenido original, dependencias, preguntas y proyectos.
- `resources.js`: biblioteca de fuentes oficiales y herramientas.
- `illustrations.js`: 48 gráficos originales con títulos, descripción accesible y explicación.
- `models.js`: cálculos, generación de demo/patrones, edición y exportación PCM16.
- `audio-lab.js`: procesamiento Web Audio, controles y visualizadores.
- `app.js`: rutas por hash, interfaz de estudio y progreso local.
- `styles.css`: diseño adaptable y reducción de movimiento.

## Ejecución y verificación

Desde la raíz del repositorio:

```sh
python3 -m http.server 8767
node --test herramientas/produccion-musical/tests/models.test.cjs shared/tool-routes.test.cjs
```

Abrir `/herramientas/produccion-musical/`. El audio requiere una interacción del usuario. La aplicación no solicita micrófono, no sube archivos y detiene la escucha al abandonar la sección o pasar a segundo plano.

Las rutas `#curso/mezcla/mezcla-2`, `#laboratorio/eq`, `#proyectos/mastering` y `#evaluacion/sonido` admiten enlaces directos. El progreso usa `crescendo-production-v1` en localStorage, con exportación/importación JSON. Antes de importar se intenta conservar la copia anterior en `crescendo-production-v1-respaldo`. Los apuntes se limitan a 10 000 caracteres y el archivo importado a 1 MB. Audio, ajustes de procesadores y checklist temporal de entrega no forman parte de esa copia.

## Verificaciones manuales de esta entrega

Navegación, respuestas incorrectas/correctas, evaluación 4/4, guardado tras recarga, bitácora de proyecto, exportación e importación de progreso, escucha EQ/compresión, pendientes de paso, cancelación de fase, cálculos, referencias de entrega, secuenciador y descarga WAV. Comprobados escritorio de 1280 px y móvil de 390 px sin desbordamiento horizontal general. Los proyectos de DAW necesitan revisión docente de las evidencias.
