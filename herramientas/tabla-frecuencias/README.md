# Tabla de Frecuencias — Fase 4

Incluye Fases 1–3 más:
- sesiones de práctica;
- metas por rondas;
- resumen e historial de sesiones;
- foco sugerido;
- revisión de lenguaje y recomendaciones de EQ/compresión;
- semántica más clara para percusión.

Abrir `index.html`.

## Mesa de escucha y curvas personales

- Tabla ampliable: vista completa y regiones predefinidas o un intervalo personalizado. La regla permanece visible al recorrer las filas. Los rangos fuera de la ventana se ocultan, sin crear barras falsas en los extremos.
- Cursor y explorador muestran Hz y nota temperada (La4 = 440 Hz). Se puede superponer una fundamental y sus armónicos 2.º–16.º. Es una serie teórica, no un espectro medido ni una afirmación sobre la percusión inarmónica.
- Fichas con un detalle fotográfico disponible o una ilustración identificada por familia, referencias de registro y parciales, y accesos a la escucha de una zona.
- El ecualizador procesa localmente archivos compatibles de hasta 30 MB, en fragmentos de hasta 20 segundos, o una demo expresamente identificada como sintética. No hay reproducción ni carga de archivos automática.
- A/B y zona aislada conservan la posición; hay pausa, parada, repetición y control de volumen. A/B puede igualarse en RMS. Se reserva margen común de muestras y se conserva la proporción entre canales; RMS no es una medición de sonoridad perceptual.
- Las etapas IIR audibles usan los mismos coeficientes de las curvas a 96 kHz. HPF/LPF son cascadas Butterworth de órdenes 1, 2, 3, 4, 6 u 8 según la pendiente. La zona aislada usa HPF/LPF de 24 dB/octava sobre el original.
- Hasta 50 curvas personales por navegador: nombre, instrumento, notas y bandas. Exportación/importación JSON versionada, con validación de tipos y límites. El JSON contiene parámetros y notas, no audio; no es un preset propietario de un plugin de DAW. Si el navegador bloquea el almacenamiento, se puede cargar un JSON y exportar la curva actual.

Archivos principales: `workbench-model.js` (modelos y validación), `eq-audio.js` (procesamiento y transporte), `workbench-ui.js` (zoom, armónicos y curvas), `instrument-visuals.js` y `workbench.css`.
