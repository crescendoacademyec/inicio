# Entrenamiento auditivo compartido

Tabla de frecuencias ofrece cinco habilidades de EQ; Producción musical reúne esas cinco y otras quince de dinámica, mezcla, espacio, edición y síntesis. La plataforma de producción permanece oculta del catálogo público.

## Uso y seguimiento

1. Elegir habilidad, fuente, dificultad y sesión de 5 o 10 rondas.
2. Reproducir A y B. Responder con las opciones o situar una banda en el EQ; en resonancias se puede escuchar la corrección antes de comprobarla.
3. Revisar respuesta, parámetros y enlace al concepto. Cada ronda cuenta solo el primer intento.
4. Consultar progreso por habilidad o repasar dificultades. La dificultad automática usa los últimos 12 resultados (mínimo 5); algunos contrastes son fijos.

El almacenamiento local `crescendo-listening-v1` comparte resultados entre ambas páginas del mismo dominio y navegador. El historial conserva 20 sesiones completadas. La descarga JSON auditiva es independiente del progreso de lectura; no incluye importación ni sincronización entre dispositivos. Las sesiones anteriores de Tabla conservan sus contadores independientes.

## Audio y límites pedagógicos

- Demos procedurales originales de cuatro segundos: maqueta musical, percusión y voz sintetizada. No son grabaciones de instrumentos o cantantes reales.
- DSP reutilizado de Tabla: filtros, compresión y síntesis. EQ y filtros permiten variar fuente; dinámica, edición y síntesis usan señales preparadas para cada objetivo.
- Igualación aproximada por RMS y margen de pico; diferencias de dB conservan la relación exacta. RMS no equivale a sonoridad LUFS. La cancelación completa conserva silencio.
- El EQ de respuesta es ilustrativo; su gráfico no es una medición del filtro. La corrección usa una banda paramétrica con Q fijo 1. La puntuación comprueba distancia en octavas y, en corrección, ganancia inversa con tolerancia de 2 dB.
- Pendientes de 12/24/48 dB/octava mediante etapas en cascada: cambia también la respuesta en el corte, según explica el ejercicio. El ecualizador libre conserva su propio diseño de filtros.
- Reverberación por reflexiones sintéticas, sin simulación de sala medida ni estimación de RT60. Las demostraciones de balance/enmascaramiento no prueban que toda competencia espectral se deba a un solo mecanismo.
- Reproducción explícita, volumen inicial reducido, rampas de transporte y parada al cambiar de vista o esconder la página. Estéreo requiere auriculares o una escucha estéreo adecuada.

Los multitracks, ejercicios en DAW y revisión docente continúan en los canales externos de la escuela. Los resultados de estas comparaciones son práctica formativa, no certificación de competencia.

## Verificación

`node --test shared/listening-engine.test.cjs shared/tool-routes.test.cjs herramientas/produccion-musical/tests/*.test.cjs herramientas/tabla-frecuencias/tests/*.test.cjs`

Pruebas del audio finito y acotado para las 20 habilidades, relación exacta de dB, estéreo/mono, evaluación del EQ, filtros shelf, saneamiento del progreso, adaptación y regresiones de las herramientas existentes. Verificación manual de reproducción, corrección, sesión completa, recarga y progreso compartido.
