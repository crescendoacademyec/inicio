# Correcciones de las herramientas musicales

Fecha: 18 de noviembre de 2026. Seguimiento de la auditoría de la base `6a81b18`.

## Cambios aplicados

| Caso | Corrección |
|---|---|
| M01 · Piano | Un ataque repetido libera la voz anterior antes de sustituir su identificador, también si procede de otra entrada. Sustain y pánico conservan el control de las voces. |
| M02 · Metrónomo | El clic usa la misma capacidad del compás que el editor, en unidades de negra. 6/8 ofrece dos negras con puntillo y 7/8 corcheas; el tempo en negras y la frecuencia de clic se explicitan. Se corrigen el conteo previo, los límites de compás y la precisión de las figuras con puntillo. |
| M03 · Cuerdas Frotadas | El cálculo usa alturas sin la media de cinco fotogramas que anulaba el vibrato. El semiancho se define como la mitad del recorrido P5–P95; la entrada retardada usa tiempos reales. |
| M04 · Instrumentos | Los colores de las colecciones pentatónicas y simétricas se calculan por intervalos reales. Se aclara el contexto de las tensiones. Cambios aplicados en Diapasón, Bass, Folk y Requinteando, incluyendo sus fuentes inline y archivos correspondientes. |
| M05 · Ear Training | Antes del acorde se reproduce su fundamental: inversiones y disposiciones abiertas cuentan con una referencia que permite interpretar la calidad. |
| M06 · AAC | Se validan estructura, aplicación y versión antes de importar. Los JSON ajenos se rechazan sin cambiar el documento; una importación válida permanece en el historial de Deshacer. Se protege el trabajo pendiente y se recupera el estado anterior si falla la aplicación del archivo. |
| M07 · Speed | Generaciones de archivo y reproducción descartan operaciones tardías. Detener, quitar o sustituir un archivo cancela el inicio pendiente y limpia ambos motores. Una exportación pendiente también descarta resultados de una sesión sustituida. |
| M08 · Micrófono | Afinador y Cuerdas Frotadas permiten cancelar la solicitud pendiente y cierran capturas que llegan tarde. Se limpian pistas y recursos si falla la inicialización y al abandonar la página. |
| M09 · Speed | Núcleo y encoders usan una instancia compatible y versiones fijadas. MP3 vuelve a exportar; las pestañas anuncian correctamente la selección. Los errores visibles de exportación están en español. |
| M10 · Speed | Teclado y ratón comparten la función de loop y actualizan la fuente activa. Las marcas A/B son botones accesibles; el control de repetición expone su estado. |
| M11 · AAC | `6/9` se reconoce como sufijo de acorde: `C6/9/E` conserva la novena y el bajo Mi. |
| M12 · Ear Training | El conjunto de objetivos del repaso queda separado de los distractores. Un único concepto fallado conserva opciones de comparación. Las selecciones de un solo concepto incorporan distractores próximos. |
| M13 · Ear Training | Se requiere completar una reproducción antes de responder, incluidos los atajos numéricos. Los intentos con ayuda tienen su contador y no alteran los porcentajes de reconocimiento autónomo. Se evita que un temporizador antiguo salte un ejercicio nuevo. |
| M14 · ChordSync | La opción “Ver acordes y escuchar el análisis” permite abrir la progresión, el reproductor y las exportaciones. Tonalidad, tempo y compás se rotulan como estimaciones. Se informa cuando no se identifica un acorde; los controles internos de evaluación permanecen en la edición administrativa local. |
| M15 · Pruebas y contenido | Se actualizan los fixtures antiguos sin quitar sus comprobaciones musicales; navegación y reinicio se verifican ejecutando sus acciones. Se restituye el ejemplo de las tres formas menores. La suite y los validadores pasan a ser requisito previo al despliegue de Pages. |
| M16 · Accesibilidad | Los cuatro diapasones ofrecen una vista de botones por cuerda/traste, octava sonora y rol musical. Se recorre con flechas y se activa con Enter/Espacio, sin interferir con los atajos del lector de partituras. |

Historia del Jazz incorpora fuentes del Herbie Hancock Institute y una actividad de escucha que pide identificar versión, año y un momento concreto. Se mantiene el enfoque adulto de Producción Musical y Tabla de Frecuencias.

Las referencias a recursos modificados llevan nuevas versiones para renovar la caché. La auditoría original y sus resultados se conservan como evidencia histórica; sus probes leen explícitamente `6a81b18`. Las regresiones nuevas verifican el código actual.

## Validación

- Suite final Node: **504 pruebas aprobadas, 0 fallidas**. Los siete validadores terminan correctamente.
- Pruebas específicas nuevas: 16, incluyendo cancelación durante procesamiento, sustitución por una sesión nueva, cierre de una reproducción nativa tardía y compatibilidad del mapa de notas de Folk.
- Sintaxis de 49 unidades modificadas, incluidos scripts inline: sin errores.
- Núcleo Python de ChordSync: 3 pruebas aprobadas.

Comprobaciones realizadas en el navegador de escritorio:

- Speed: descargas WAV, MOV, MP3 y M4A con el mismo WAV de ocho segundos de la auditoría. El WAV completo conserva dos canales, 44.100 Hz y ocho segundos. El WAV del loop A–B marcado por teclado dura cinco segundos.
- AAC: comparación del contenido SVG antes y después de rechazar un JSON ajeno, sin cambios. Una importación válida muestra su título/acorde y Deshacer recupera el contenido anterior.
- Ear Training: opciones deshabilitadas antes de la escucha y habilitadas al terminar; responder tras usar ayuda deja el contador autónomo en 0/0 y aumenta “con ayuda”. El nivel de acordes presenta la referencia de fundamental.
- Diapasones: vista accesible disponible en las cuatro aplicaciones; flecha derecha desplaza el foco y Enter toca la posición. Mi de Do pentatónica mayor se anuncia como sonido estructural.
- Metrónomo: inicio/parada y 6/8 con dos pulsos visibles; la duración coincide con el editor en las regresiones de 4/4, 6/8 y 7/8.
- ChordSync: apertura de resultados y estados de incertidumbre; Historia del Jazz: fuentes y actividad visibles. Piano, Afinador y Cuerdas Frotadas cargan con sus recursos actualizados.

Para repetir la validación automatizada:

```sh
node auditorias/run-musical-tests.cjs
```

Las pruebas Python se ejecutan con `python3 test_core.py` desde `herramientas/chordsyncpro/server`.

## Límites

Los ciclos de permiso, voces y vibrato se comprueban con recursos simulados o contornos sintéticos. Queda pendiente la validación física de micrófonos/controladores MIDI y la revisión en Safari/iOS/Android. Las exportaciones de audio se comprobaron en el navegador disponible; su compatibilidad puede variar entre navegadores.

La separación de intentos asistidos se aplica a los registros nuevos; los resultados anteriores no contienen información suficiente para reclasificarlos. ChordSync sigue siendo un analizador estimativo: la corrección de acceso a sus resultados no certifica la precisión sobre un catálogo de grabaciones reales.

Bingo y los cambios ajenos de `.DS_Store` quedan fuera de este trabajo.
