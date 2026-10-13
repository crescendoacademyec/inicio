# Gate y expansor con audio

Motor y pantalla compartidos por Tabla de frecuencias y Producción musical. La pantalla vive en un iframe para mantener sus estilos aislados.

Incluye 12 propuestas didácticas originales para seis fuentes sintéticas, cuatro ejercicios guiados y archivos locales (máximo 30 MB, primeros 20 segundos, dos canales). Los archivos se decodifican en el navegador; no se envían al servidor. Las demos vocales no tienen palabras y la guitarra es una cuerda pulsada esquemática: para trabajar dicción o sustain real se debe usar una grabación local.

## Modelo

Detector enlazado por máximo absoluto entre canales, envolvente de pico y filtros de detector de un polo (6 dB/octava). El umbral abre; umbral menos histéresis cierra tras hold. Gate y expansión descendente tienen atenuación limitada por range. Ataque y release suavizan ganancia en dB con constantes exponenciales. Sin lookahead, knee ni emulación de hardware. A/B conserva la misma ganancia de escucha, sin compensar RMS global por los silencios eliminados. Los cambios reinician la reproducción; navegar a otra sección la detiene.

## Referencias

- [Waves: Audio Gating Basics](https://www.waves.com/audio-gating-basics)
- [FabFilter Pro-G: tiempos y estilos](https://www.fabfilter.com/help/pro-g/using/timecontrols)
- [FabFilter Pro-G: detector y modo experto](https://www.fabfilter.com/help/pro-g/using/expertmode)

Las referencias fundamentan objetivos y criterios. Los números son propuestas de Crescendo, no presets oficiales de fabricantes o artistas.

## Verificación

`node --test shared/gate-lab/model.test.cjs`

Comprueba paso transparente, rango, tiempos, histéresis, expansión, filtrado del detector sin ecualizar la salida, enlace estéreo y salida finita de todas las propuestas.
