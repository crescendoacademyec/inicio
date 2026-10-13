# Compendio de producción musical

Contenido y UI compartidos por Producción musical y Tabla de frecuencias.

- 71 fichas conceptuales originales, 12 guías de diagnóstico y perfiles de 58 instrumentos/7 buses obtenidos del catálogo compartido: 136 fichas de consulta al cargar las dependencias.
- Búsqueda normalizada por palabras, alias españoles/ingleses, contenido y categorías; resultados alfabéticos. Diagnósticos separados de definiciones.
- Definición, aplicación, precaución, ejemplo, conceptos relacionados, lección y referencia por ficha. Ejercicios y cifras originales de Crescendo; no presets del fabricante.
- Modelos gráficos interactivos de transferencia estática, distancia/SBIR, factor de cresta, duraciones musicales y recorte de onda. Son demostraciones, no mediciones ni emulaciones.
- Curso conserva sus 48 lecciones y progreso. Las fichas se enlazan y despliegan como ampliaciones de la unidad correspondiente; Recursos comparte el nuevo índice conceptual.
- La búsqueda de instrumentos no duplica recomendaciones: consume `EQ_INSTRUMENTS`, `eqReview`, `cuts` y `boosts`. Los enlaces a EQ cargan el instrumento con `?instrument=ID`.

## Fuentes y alcance

Referencias primarias enlazadas por ficha: manuales FabFilter (EQ, compresión, expansión, multibanda y estéreo), Genelec (acústica), Indiana University (audio digital), Waves (ruteo) e iZotope (reverb, modulación, saturación, metering, dither, stems). Revisión 2026-10-12.

La referencia respalda el concepto; no atribuye a la fuente las demostraciones, tablas editoriales ni valores de práctica. Natural Phase se identifica como modo específico de FabFilter. No se confunden RMS/LUFS/LRA/cresta, fase/polaridad, filtrado del detector/EQ del audio, ni stems/pistas individuales.

El ejemplo SBIR supone pared detrás de fuente puntual, f≈343/(4d); no predice toda una sala. El de transferencia es hard-knee y estático; no representa temporización ni limitador. El ejemplo de cresta requiere la misma ventana y referencia RMS. Las fracciones musicales sirven de orientación; no son presets obligatorios de predelay. Los modelos de clipping no reproducen audio. Los enlaces de práctica abren laboratorios existentes para escuchar y contrastar.

Pruebas: `node --test shared/music-compendium/compendium.test.cjs`. Verifican integridad de enlaces y referencias, búsqueda/alias/categorías, y consumo del catálogo real de instrumentos/buses.
