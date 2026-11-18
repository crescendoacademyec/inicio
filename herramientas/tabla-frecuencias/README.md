# Tabla de Frecuencias

Herramienta de mezcla y producción para adultos: consulta por instrumento, EQ con audio, dinámica/mastering visuales, mapas de mezcla, entrenamiento, analizador y diccionario. «Empieza aquí» propone tres prácticas por experiencia y objetivos; el catálogo sigue disponible para consulta libre.

Servir la raíz del repositorio por HTTP y abrir `herramientas/tabla-frecuencias/`.

## Práctica y continuidad

- Entrenamiento principal: sesiones de 5/10 rondas y progreso por habilidad. Tiene su propio respaldo auditivo exportable/importable.
- Práctica complementaria: ruido rosa, Boost/Cut, tono puro y ocho ejercicios de procesamiento; contador e historial separados. Muestra aciertos por módulo, sin presentarlos como dominio global. Ganancia y dificultad del examen se fijan al iniciar cada ronda; en Aprender cambian el audio al momento. Repetir una ronda conserva su devolución y acceso a la siguiente.
- Respaldo complementario: JSON identificado y validado, con compatibilidad para el antiguo `crescendo-progreso.json`. Importar reemplaza solo esos módulos, recupera la sesión actual y conserva una copia anterior accesible. El progreso principal se restaura con su propio importador.
- Mapas: JSON identificado, importación de versiones anteriores y validación de pistas/coordenadas. Importar deja intactos los mapas guardados y permite recuperar la escena previa con sus cambios sin guardar. Guarda la escena importada para conservarla entre visitas.
- Analizador: selección explícita de suma mono, L o R, con lectura actual y peak hold separados, resolución de bins y consulta numérica de una frecuencia. Cambiar el análisis no modifica la escucha estéreo. No mide SPL, sonoridad ni pico temporal.

## Validación

```sh
node --test herramientas/tabla-frecuencias/tests/*.test.cjs shared/listening-engine.test.cjs shared/music-compendium/compendium.test.cjs shared/gate-lab/model.test.cjs
```

Pruebas adicionales con Web Audio real, sin salida audible: abrir `tests/audio-browser.html` desde el servidor y pulsar Ejecutar pruebas. Comprueban cancelación mono frente a canales separados y el cambio efectivo Boost/Cut de la cadena de entrenamiento.

## Mesa de escucha y curvas personales

- Tabla ampliable: vista completa y regiones predefinidas o un intervalo personalizado. La regla permanece visible al recorrer las filas. Los rangos fuera de la ventana se ocultan, sin crear barras falsas en los extremos.
- Cursor y explorador muestran Hz y nota temperada (La4 = 440 Hz). Se puede superponer una fundamental y sus armónicos 2.º–16.º. Es una serie teórica, no un espectro medido ni una afirmación sobre la percusión inarmónica.
- Fichas con un detalle fotográfico disponible o una ilustración identificada por familia, referencias de registro y parciales, y accesos a la escucha de una zona.
- El ecualizador procesa localmente archivos compatibles de hasta 30 MB, en fragmentos de hasta 20 segundos, o una demo expresamente identificada como sintética. No hay reproducción ni carga de archivos automática.
- A/B y zona aislada conservan la posición; hay pausa, parada, repetición y control de volumen. A/B puede igualarse en RMS. Se reserva margen común de muestras y se conserva la proporción entre canales; RMS no es una medición de sonoridad perceptual.
- Las etapas IIR audibles usan los mismos coeficientes de las curvas a 96 kHz. HPF/LPF son cascadas Butterworth de órdenes 1, 2, 3, 4, 6 u 8 según la pendiente. La zona aislada usa HPF/LPF de 24 dB/octava sobre el original.
- Hasta 50 curvas personales por navegador: nombre, instrumento, notas y bandas. Exportación/importación JSON versionada, con validación de tipos y límites. El JSON contiene parámetros y notas, no audio; no es un preset propietario de un plugin de DAW. Si el navegador bloquea el almacenamiento, se puede cargar un JSON y exportar la curva actual.

Archivos principales: `workbench-model.js` (modelos y validación), `eq-audio.js` (procesamiento y transporte), `workbench-ui.js` (zoom, armónicos y curvas), `instrument-visuals.js` y `workbench.css`.
