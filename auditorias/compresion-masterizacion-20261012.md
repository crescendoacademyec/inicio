# Compresión y masterización: investigación e implementación

Consulta: 12 de octubre de 2026. Material original de Crescendo, basado en fuentes primarias (fabricantes, entrevistas directas y plataformas oficiales de los docentes). No se transcribieron cursos de pago ni se atribuyen a los artistas valores que la fuente pública no revela.

## Fuentes y alcance

| Fuente | Qué aporta | Cómo se aplica |
| --- | --- | --- |
| [Universal Audio: principios](https://www.uaudio.com/blog/audio-compression-basics) | Funciones y familias de compresión | 14 propuestas editoriales por aplicación, no recetas universales |
| [Universal Audio: 1176](https://www.uaudio.com/blogs/ua/1176-collection-tips) | Rangos temporales y relación Input/compresión | Un ejemplo dentro del rango publicado; sin equivalencias inventadas entre posiciones y milisegundos |
| [Waves: manual de Scheps Omni Channel](https://www.waves.com/1lib/pdf/plugins/scheps-omni-channel.pdf) | Voz 4:1 y descripción de ataque/release; bombo y wet/dry | Se conserva el ratio vocal publicado; umbral y tiempos concretos elegidos por Crescendo |
| [Puremix: Michael Brauer](https://www.puremix.com/blog/michael-brauers-parallel-vocal-compression-technique) | Retornos vocales con varios compresores | Ejercicio de una rama paralela; no pretende reproducir Brauerize completo |
| [Waves: Chris Lord-Alge](https://www.waves.com/chris-lord-alge-balance-before-compression) | Balance antes de compresión | Estudio de intervención moderada, no preset personal |
| [Waves: Tom Lord-Alge](https://www.waves.com/inside-the-mix-tom-lord-alge) | Elección de compresores según toms y toma | Ejercicio genérico; 8 ms no se presenta como tiempo del CLA-76 |
| [Mix with the Masters: Jaycen Joshua y Dave Pensado](https://mixwiththemasters.com/videos/jaycen-joshua-advanced-mix-techniques/part/2) | Temario público sobre buses y dinámica | Estudio editorial de recuperación de bus; no transcripción del curso |
| [Bob Katz: Compression](https://www.digido.com/portfolio-item/compression/) | Dinámica musical y crítica a hipercompresión | Flujo de mastering con compresión opcional y ligera |
| [Universal Audio: Emily Lazar](https://www.uaudio.com/blogs/ua/emily-lazar) | Diagnóstico, comunicación y revisión de mezcla | Flujo que comienza con ratio 1:1: decidir antes de procesar |
| [Ian Shepherd: Punchbag Analogy](https://productionadvice.co.uk/compression-punchbag/) | Impacto, compresión y limitación | Flujo de comparación que prioriza impacto, sin atribuirle números propios |
| [MyMixLab: Luca Pretolesi](https://new.mymixlab.com/Courses/Course/9129) | Presentación pública de curso de mastering hip-hop por etapas | Flujo editorial; sin acceder a ajustes de pago ni simular sus plugins |
| [iZotope: compresión en mastering](https://www.izotope.com/community/blog/how-to-use-compression-in-mastering) | Uso condicional y diferencias respecto de mezcla | Flujo transparente, proceso opcional |
| [iZotope: cadena](https://www.izotope.com/community/blog/what-is-an-ideal-mastering-signal-chain) | Decisiones y relación entre procesos | Cadena ilustrada con pasos y verificaciones, no receta obligatoria |
| [FabFilter: manual](https://www.fabfilter.com/downloads/pdf/help/ffproc-manual.pdf) | Controles, knee, detección | Glosario y distinciones respecto del modelo genérico |
| [Spotify: normalización](https://support.spotify.com/nl-en/artists/article/loudness-normalization/) | Normalización y recomendaciones de mastering | −14 LUFS de reproducción no se presenta como requisito universal de entrega |

## Qué se añadió

- 21 propuestas de compresión y 5 flujos de masterización, con fuentes, alcance, objetivos y ejemplos de herramientas para contrastar en el DAW.
- Búsqueda entre 57 instrumentos y bus de mezcla. Cada fuente tiene al menos dos propuestas de su familia; no se publicitan como 57 conjuntos únicos de valores investigados individualmente.
- Controles de umbral, ratio, ataque, release, knee, makeup y mezcla seca/comprimida; nivel sintético de prueba independiente.
- Curva de transferencia y evolución temporal de entrada, salida y reducción. Bypass y restauración de propuesta.
- Masterización: cadena ilustrada, compresión opcional, ceiling de referencia editable y comprobaciones de sonoridad, picos, codificación, formato y entregables.
- Acceso desde la ficha de compresión de cada instrumento y nueva pestaña en Tabla de frecuencias.
- El mismo código/datos aparece en Producción: Mezcla / Compresión (mezcla-3), Mastering / Cadena (mastering-3). Producción continúa oculta del catálogo público.
- Se corrigieron definiciones antiguas de ataque, release y ratio para no describir ataque como una espera fija antes de actuar.

## Modelo y límites explícitos

Modelo feed-forward didáctico: knee cuadrático, reducción estática y suavizado exponencial de reducción en dB, con constantes temporales de ataque/release. Dos escalones de nivel sintético durante dos segundos. Mezcla paralela por amplitudes correlacionadas, con makeup solo sobre rama comprimida. No se simulan audio, detección RMS/óptica, saturación, sidechain filtrado, multibanda, varias rutas, lookahead ni limitador. El ceiling se dibuja como referencia; no limita la señal.

No se miden LUFS ni true peak; el techo visual en dBFS no garantiza un techo dBTP. La normalización no se usa para prometer volumen. Los niveles dibujados se recortan a −48…+12 dBFS y la escala de reducción a 24 dB, con aviso visible. Los resultados numéricos conservan su valor calculado.

## Validación

40 pruebas pasan: modelo de ratio/knee, identidad y mezcla paralela por amplitudes, ataque progresivo y recuperación, validez de presets/fuentes y cobertura de familias, regresión EQ, modelos/enseñanza/ejercicios auditivos de Producción y enlaces locales.

Verificación UI: ficha de guitarra → Compresión → explorador conserva instrumento; cambiar ataque modifica la curva temporal y restaurar recupera valores; ratio 1:1 de Lazar da reducción cero; iframe de mastering carga los cinco flujos y ajusta altura sin overflow horizontal.

Capturas: `/tmp/crescendo-compresion-20261012.png` y `/tmp/crescendo-mastering-20261012.png`.
