// Datos sintetizados (no copiados literalmente) de:
// - Manual del Ingeniero de Mezclas, Capítulo 5 (ecualización)
// - Aprende a Utilizar tu Procesador Dinámico (compresión, de-esser, técnicas de mezcla)
// - Tabla de Frecuencias de referencia de estudio (notas de sesión)
// - Tabla de Sugerencias de Ecualización — Bunker Audio (bunker-audio.com)

const BANDS = [
  { id: 'sub',   label: 'Subgraves', low: 16,   high: 60 },
  { id: 'bajo',  label: 'Graves',    low: 60,   high: 250 },
  { id: 'mb',    label: 'Medios bajos', low: 250, high: 2000 },
  { id: 'ma',    label: 'Medios altos', low: 2000, high: 4000 },
  { id: 'pres',  label: 'Presencia', low: 4000, high: 6000 },
  { id: 'brillo',label: 'Brillo',    low: 6000, high: 16000 },
];

const GOLDEN_RULES = [
  'Primero identifica el problema con el oído; usa el analizador solo como apoyo visual.',
  'Si una mezcla suena turbia, revisa la acumulación de medios-graves antes de aplicar cortes automáticos.',
  'Un corte estrecho sirve para resonancias; un ajuste ancho cambia más el color general.',
  'Realzar una banda aumenta también ruido, bleed y armónicos presentes en esa zona.',
  'No existe una frecuencia “correcta” universal: instrumento, arreglo, micrófono y contexto cambian la decisión.',
];

const SIBILANCE_TABLE = [
  { tipo: 'Voz femenina aguda', rango: '7 – 10 kHz' },
  { tipo: 'Voz femenina media', rango: '6.5 – 8.5 kHz' },
  { tipo: 'Voz femenina grave', rango: '6 – 8 kHz' },
  { tipo: 'Voz masculina aguda', rango: '6.5 – 8.5 kHz' },
  { tipo: 'Voz masculina media', rango: '6 – 8 kHz' },
  { tipo: 'Voz masculina grave', rango: '5 – 7 kHz' },
];

const TECHNIQUES = {
  serie: {
    title: 'Compresión en serie',
    body: 'Dos o más compresores procesan la misma señal uno después de otro. Permite repartir el control de picos y de nivel entre etapas; un solo compresor insertado no constituye compresión en serie.',
    tips: [
      'Reparte el trabajo entre etapas y compara con bypass a un volumen similar; la reducción necesaria depende de la grabación.',
      'Puede separar el control de picos del control de nivel sostenido; úsala solo si mejora el resultado.',
    ],
  },
  paralela: {
    title: 'Compresión paralela (New York Compression)',
    body: 'Se duplica la señal (por un bus o auxiliar): a la copia se le aplica compresión agresiva, mientras la señal original se mantiene limpia o casi sin comprimir. Luego se mezclan ambas, sumando el cuerpo de la señal comprimida sin perder los transitorios de la original.',
    tips: [
      'Muy útil en baterías, guitarras eléctricas o incluso el bus completo de la mezcla.',
      'Compresores FET (rápidos y agresivos) son una elección típica para la señal duplicada.',
      'Preserva el punch de los transitorios mientras añade peso y presencia de fondo.',
    ],
  },
};

const GLOSSARY = [
  { t: 'Attack (Ataque)', d: 'Rapidez con que evoluciona la reducción o apertura al detectar un cambio de nivel. En un compresor no es una espera antes de empezar a actuar; la definición temporal varía entre modelos.' },
  { t: 'Threshold (Umbral)', d: 'Nivel a partir del cual el procesador dinámico comienza a afectar la señal.' },
  { t: 'Ratio', d: 'Relación entrada/salida en régimen estable por encima del umbral y fuera del knee. A 4:1, 4 dB adicionales de entrada producen 1 dB adicional de salida.' },
  { t: 'Release', d: 'Rapidez de recuperación de la ganancia cuando disminuye la reducción requerida. Depende del detector, la señal y el modelo; no exige que toda la señal caiga bajo el umbral.' },
  { t: 'Knee (Rodilla)', d: 'Forma en que la compresión se aplica alrededor del umbral: "duro" (abrupto) o "suave" (gradual).' },
  { t: 'Makeup gain', d: 'Ganancia de salida para compensar la reducción de nivel del compresor.' },
  { t: 'Gain reduction', d: 'Atenuación que aplica el compresor, expresada en dB; no es la ganancia de compensación.' },
  { t: 'Range (de Gate)', d: 'Cuánto se atenúa la señal cuando el gate está cerrado.' },
  { t: 'Hold', d: 'Tiempo que un gate permanece abierto después de que la señal cae por debajo del umbral, antes de iniciar el release.' },
  { t: 'Gate', d: 'Procesador que bloquea la señal por debajo de un umbral, usado para reducir bleed y ruido de fondo.' },
  { t: 'De-Esser', d: 'Compresor enfocado solo en una banda de frecuencia (típicamente 5–10 kHz) para controlar sibilancias vocales.' },
  { t: 'Compresión en Serie', d: 'Dos o más compresores procesan la señal consecutivamente, repartiendo el trabajo entre etapas.' },
  { t: 'Compresión Paralela', d: 'Se mezcla una copia muy comprimida con la señal original, sumando cuerpo sin perder transitorios.' },
  { t: 'Limiter', d: 'Compresor con ratio muy alto, usado para evitar que la señal sobrepase un techo y distorsione.' },
  { t: 'Transient (Transiente)', d: 'La parte inicial y más rápida de un sonido — el golpe o ataque, clave para la claridad y definición.' },
  { t: 'EQ (Ecualización)', d: 'Proceso de ajustar el balance de frecuencias de una señal: gráfico, paramétrico u otros tipos.' },
  { t: 'Bandas (de EQ)', d: 'Secciones de un ecualizador, cada una con su propia frecuencia central, ancho de banda (Q) y ganancia.' },
  { t: 'Q (Ancho de banda)', d: 'Determina qué tan ancho o angosto es el rango de frecuencias afectado por una banda de EQ.' },
  { t: 'Bus / Buss', d: 'Canal virtual o físico que agrupa varias señales para procesarlas juntas (ej. bus de batería).' },
  { t: 'Fader', d: 'Control deslizante que ajusta el nivel de una pista o canal en la consola o DAW.' },
  { t: 'Phase Cancellation', d: 'Pérdida o debilitamiento de frecuencias cuando dos señales similares se suman fuera de fase.' },
  { t: 'Room Acoustics', d: 'Cómo un espacio refleja, absorbe y difunde el sonido, afectando la grabación y la mezcla.' },
  { t: 'Normalization', d: 'Ajustar el nivel de una señal a un máximo predefinido sin alterar la relación entre sus partes.' },
  { t: 'Reverb', d: 'Efecto que simula el eco difuso de un espacio cerrado, dando profundidad y ambiente.' },
  { t: 'Delay', d: 'Efecto que repite la señal tras un tiempo definido, usado para eco, espacialidad o profundidad.' },
];

// ---------- Entrenamiento auditivo ----------
const EAR_OCTAVE_FREQS = [63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const EAR_GAINS_DB = [3, 6, 9, 12];
const EAR_31_BANDS = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630,
  800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000,
];

const INSTRUMENTS = [
  {
    id: 'voz', name: 'Voz', cat: 'voz',
    range: [80, 1100],
    realRange: [82.4, 1046.5], rangeKind: 'register', rangeNote: 'Referencia vocal amplia; el registro real depende de la voz y la técnica.', harm: [1100, 12000],
    cuts: [{"f": "Graves no musicales", "r": "Reduce vibración o golpes de aire sin adelgazar la nota más grave de la frase."}, {"f": "800 Hz–1.5 kHz", "r": "Si una resonancia nasal distrae, localízala en esta voz; no presupongas que todo exceso está en 500 Hz."}, {"f": "Sibilancia y dureza", "r": "Busca la banda de las consonantes y considera de-esser; la dureza de las vocales puede estar en otra zona."}],
    boosts: [{"f": "1.5–3 kHz", "r": "Si falta lectura de palabras, prueba un realce pequeño y comprueba que no aumente dureza."}, {"f": "10–15 kHz", "r": "Shelf opcional si falta aire; también eleva soplo, ruido y sibilancia."}],
    tip: "No existe obligación de cortar antes de realzar. Distingue cuerpo, nasalidad, presencia y consonantes en esta grabación.",
    comp: {
      tipo: 'Óptico (tipo LA-2A) para suavidad musical, o FET si necesitas más control de picos.',
      ratio: '3:1 – 4:1',
      attack: 'Medio (evita cortar la transiente inicial de la palabra)',
      release: 'Medio (150–300 ms aprox.)',
      nota: 'Como punto de partida, una reducción moderada puede estabilizar picos. Ajusta ataque, release y de-esser según dicción, estilo y distancia al micrófono.',
    },
    deesser: true,
  },
  {
    id: 'piano', name: 'Piano · 88 teclas', cat: 'teclas',
    range: [80, 4600],
    realRange: [27.5, 4186.0], rangeKind: 'register', rangeNote: 'Piano acústico estándar de 88 teclas: A0–C8.', harm: [4600, 12000],
    cuts: [{"f": "200–500 Hz", "r": "Si el acompañamiento se vuelve turbio, prueba una reducción ancha pequeña; en solo esta región puede ser necesaria."}, {"f": "2–4 kHz", "r": "Si el martillo domina, reduce solo el exceso sin borrar articulación."}],
    boosts: [{"f": "60–200 Hz", "r": "Si falta peso, revisa primero fase y balance con el bajo."}, {"f": "5–12 kHz", "r": "Si necesita brillo, prueba un realce amplio moderado; conserva la perspectiva de la toma."}],
    tip: "Las fundamentales del piano de 88 teclas llegan a C8, unos 4.19 kHz; los armónicos se extienden más. Evita cortes estrechos indiscriminados.",
    comp: {
      tipo: 'Óptico o VCA suave.',
      ratio: '2:1 – 3:1',
      attack: 'Medio',
      release: 'Medio a largo',
      nota: 'La compresión sutil ayuda a nivelar entre pasajes suaves y acordes fuertes sin quitarle naturalidad al instrumento.',
    },
  },
  {
    id: 'guit-ac', name: 'Guitarra Acústica', cat: 'cuerdas',
    range: [80, 1000],
    realRange: [82.4, 1174.7], rangeKind: 'register', rangeNote: 'Guitarra estándar E2–E6 aprox.; el límite superior presupone acceso al registro agudo.', harm: [1000, 12000],
    cuts: [{"f": "200–350 Hz", "r": "Si hay exceso de caja, explora un corte ancho pequeño; no es una región inútil."}, {"f": "Resonancias localizadas", "r": "Busca notas que sobresalen y considera un corte estrecho o dinámico solo si molestan."}, {"f": "Graves no musicales", "r": "Ajusta el pasa-altos a las notas reales: E2 está en 82.4 Hz y otras afinaciones bajan más; 120 Hz no es un límite universal."}],
    boosts: [{"f": "125–240 Hz", "r": "Si falta cuerpo, prueba un refuerzo suave solo si no compite con el bajo."}, {"f": "1–2 kHz", "r": "Si falta articulación, compara un ajuste pequeño con nivel y arreglo."}, {"f": "5 kHz en adelante", "r": "Si falta brillo, un shelf suave puede ayudar; también aumenta púa, uñas y ruido."}],
    tip: "Una guitarra protagonista suele necesitar más extensión que un acompañamiento. El micrófono y la caja cambian las resonancias.",
    comp: {
      tipo: 'Óptico suave.',
      ratio: '2:1 – 4:1',
      attack: 'Medio (deja pasar el rasgueo inicial)',
      release: 'Medio',
      nota: 'Usa compresión ligera solo para nivelar dinámica entre rasgueo y punteo; demasiada compresión aplana el carácter acústico.',
    },
  },
  {
    id: 'guit-el', name: 'Guitarra Eléctrica', cat: 'cuerdas',
    range: [80, 1200],
    realRange: [82.4, 1318.5], rangeKind: 'register', rangeNote: 'Referencia amplia para guitarra eléctrica; afinación y número de trastes modifican los extremos.', harm: [1200, 8000],
    cuts: [{"f": "200–300 Hz", "r": "Si el riff acumula grosor, reduce solo el exceso; puede ser cuerpo útil."}, {"f": "2–5 kHz", "r": "Si la distorsión resulta áspera, comprueba pantalla/micrófono y luego la banda problemática."}, {"f": "Extremo grave", "r": "Filtra solo lo que estorba; afinaciones graves y guitarras extendidas invalidan un corte automático de 80–100 Hz."}],
    boosts: [{"f": "150–300 Hz", "r": "Si falta cuerpo, prueba una campana ancha suave en contexto."}, {"f": "1.5–2.5 kHz", "r": "Si el riff no se distingue, prueba presencia sin sumar también fizz."}],
    tip: "No asumas que realzar 3–8 kHz mejora toda distorsión. Una toma brillante puede necesitar reducción en esa misma zona.",
    comp: {
      tipo: 'FET rápido — añade carácter y presencia.',
      ratio: '4:1 – 8:1',
      attack: 'Rápido',
      release: 'Rápido a medio',
      nota: 'Si la pista ya está comprimida por amplificador, pedal o distorsión, puede necesitar poca compresión adicional. Ajusta según la dinámica real.',
    },
  },
  {
    id: 'bajo', name: 'Bajo Eléctrico', cat: 'cuerdas',
    range: [40, 1000],
    realRange: [30.87, 392.0], rangeKind: 'register', rangeNote: 'Incluye bajo de 5 cuerdas desde B0; instrumentos de 4 cuerdas comienzan normalmente en E1.', harm: [1000, 4000],
    cuts: [{"f": "125–400 Hz", "r": "Si hay retumbo o acumulación, localiza el exceso; no cortes toda esta franja por sistema."}, {"f": "Notas sobresalientes", "r": "Si solo ciertas notas se disparan, considera automatización o EQ dinámica."}],
    boosts: [{"f": "50–120 Hz", "r": "Si falta peso, comprueba afinación y relación con el bombo; B0 de cinco cuerdas está por debajo de esta zona."}, {"f": "400–800 Hz", "r": "Puede aportar carácter y legibilidad; el ataque más brillante de dedos o púa puede estar más arriba."}, {"f": "1–3 kHz", "r": "Si necesita definición o slap, prueba un ajuste pequeño sin exagerar cuerdas y trastes."}],
    tip: "80–160 Hz no es siempre la octava de la fundamental: depende de la nota. No etiquetes 1 kHz automáticamente como sonido delgado.",
    comp: {
      tipo: 'Óptico o VCA — control preciso y consistente.',
      ratio: '4:1 – 6:1',
      attack: 'Medio (deja pasar el ataque de dedos/púa)',
      release: 'Medio',
      nota: 'La compresión puede estabilizar el bajo frente al bombo, pero la cantidad depende de la ejecución, el género y el arreglo; evita tratarla como obligatoria.',
    },
  },
  {
    id: 'kick', name: 'Bombo (Kick)', cat: 'percusion',
    range: [40, 5000],
    rangeKind: 'energy',
    rangeNote: 'La barra representa energía espectral dominante, no un registro de notas fijo.', harm: [5000, 12000],
    cuts: [{"f": "250–500 Hz", "r": "Si el golpe suena encajonado, localiza y atenúa solo el exceso."}, {"f": "Subgrave no necesario", "r": "Prueba un pasa-altos por debajo del tono útil si hay vibración o energía sobrante; el corte depende de este bombo."}],
    boosts: [{"f": "50–100 Hz", "r": "Si falta peso, busca el tono real y la relación con el bajo; también puede necesitar reducción."}, {"f": "1–5 kHz", "r": "Si falta ataque, busca la zona de maza o click que sirve al estilo, sin añadir dureza."}],
    tip: "Un bombo acústico también tiene resonancias afinadas. Peso, tono, ataque y duración se deciden escuchando; no dependen solo de que sea EDM.",
    comp: {
      tipo: 'FET rápido y agresivo.',
      ratio: '4:1 – 10:1',
      attack: 'Rápido (controla el transiente) o lento (lo deja pasar y comprime la cola, según el punch que busques)',
      release: 'Rápido a medio',
      nota: 'Muy usado también en compresión paralela: una copia muy comprimida suma peso constante sin perder el golpe original.',
    },
  },
  {
    id: 'snare', name: 'Caja (Snare)', cat: 'percusion',
    range: [100, 8000],
    rangeKind: 'energy',
    rangeNote: 'La barra representa energía espectral dominante, no un registro de notas fijo.', harm: [8000, 16000],
    cuts: [{"f": "500 Hz–1.5 kHz", "r": "Si un anillo distrae, busca la frecuencia concreta; no toda resonancia indica mala afinación."}, {"f": "250–500 Hz", "r": "Si está encajonada, reduce una zona pequeña sin vaciar el cuerpo."}],
    boosts: [{"f": "150–250 Hz", "r": "Si falta peso del golpe, prueba cuerpo después de comprobar fase entre micrófonos."}, {"f": "2–5 kHz", "r": "Si falta ataque, prueba un realce moderado; puede aumentar bleed."}, {"f": "6–12 kHz", "r": "Si falta bordona o brillo, prueba un shelf suave; no todos los sonidos necesitan aire adicional."}],
    tip: "Localiza el problema a volumen cómodo y luego retira el realce de búsqueda. No hay un punto obligatorio de 2 kHz ni un boost fijo de 6 dB.",
    comp: {
      tipo: 'FET — rápido y con carácter.',
      ratio: '4:1 – 8:1',
      attack: 'Rápido a medio (deja pasar el transiente inicial del golpe)',
      release: 'Rápido (para recuperarse antes del siguiente golpe)',
      nota: 'Un release demasiado lento hace que el compresor siga actuando cuando llega el próximo golpe, aplastando la dinámica de la ejecución.',
    },
  },
  {
    id: 'toms', name: 'Toms', cat: 'percusion',
    range: [80, 5000],
    rangeKind: 'energy',
    rangeNote: 'La barra representa energía espectral dominante, no un registro de notas fijo.', harm: [5000, 12000],
    cuts: [{"f": "250–500 Hz", "r": "Si hay exceso de caja, busca el problema en cada tambor sin borrar su tono."}, {"f": "Extremos no necesarios", "r": "Ajusta filtros según tamaño, afinación y bleed; no cortes automáticamente bajo 80 Hz ni sobre 12 kHz."}],
    boosts: [{"f": "80–250 Hz", "r": "Si falta cuerpo, busca el tono real de cada tom; no refuerces todos a la misma frecuencia."}, {"f": "2–5 kHz", "r": "Si falta ataque, prueba un realce pequeño y escucha también los platos filtrados en esa pista."}],
    tip: "El realce y la atenuación de un Pultec usan curvas distintas; dos campanas idénticas y opuestas en un EQ digital se cancelan, no recrean ese efecto.",
    comp: {
      tipo: 'FET.',
      ratio: '4:1 – 6:1',
      attack: 'Medio',
      release: 'Medio (usa el hold para no cortar la resonancia natural)',
      nota: 'Un release muy corto corta la cola del tom de forma antinatural; dale espacio para que decaiga.',
    },
  },
  {
    id: 'tom-piso', name: 'Tom de Piso', cat: 'percusion',
    range: [60, 5000],
    rangeKind: 'energy',
    rangeNote: 'La barra representa energía espectral dominante, no un registro de notas fijo.', harm: [5000, 10000],
    cuts: [{"f": "200–500 Hz", "r": "Si se acumula cuerpo con bombo o bajo, prueba un recorte localizado solo durante el fill si procede."}],
    boosts: [{"f": "Tono grave del parche", "r": "Busca su altura concreta; no presupongas 60 Hz ni dibujes un refuerzo sin frecuencia identificada."}, {"f": "2–6 kHz", "r": "Si falta golpe de baqueta, prueba definición sin reforzar bleed de platos."}],
    tip: "La afinación y el tamaño determinan el tono. Su ataque no tiene por qué estar siempre más arriba que el del bombo.",
    comp: {
      tipo: 'FET.',
      ratio: '4:1 – 6:1',
      attack: 'Medio',
      release: 'Medio',
      nota: 'Igual que en los toms: cuida el release para no cortar la resonancia grave característica.',
    },
  },
  {
    id: 'hihat', name: 'Hi-Hat y Platillos', cat: 'percusion',
    range: [200, 16000],
    rangeKind: 'energy',
    rangeNote: 'La barra representa energía espectral dominante, no un registro de notas fijo.', harm: [16000, 20000],
    cuts: [{"f": "Medios y agudos agresivos", "r": "Localiza la zona punzante antes de reducirla; un control dinámico puede preservar el brillo entre golpes."}, {"f": "Bleed grave", "r": "En micrófono dedicado, filtra lo innecesario escuchando el cuerpo real del plato."}],
    boosts: [{"f": "7–12 kHz", "r": "Si falta textura brillante, prueba un shelf o campana suave; no lo sumes a otros realces equivalentes."}, {"f": "12–16 kHz", "r": "Aire opcional si la toma lo necesita; verifica ruido y aspereza."}],
    tip: "Hi-hat, ride y crash no tienen una banda de cuerpo universal de 200 Hz. Decide por pieza y por función.",
    comp: {
      tipo: 'Ligera o ninguna — los platillos suelen perder brillo natural si se comprimen mucho.',
      ratio: '2:1 (si se usa)',
      attack: 'Rápido',
      release: 'Rápido',
      nota: 'Muchas veces basta con automatizar volumen en vez de comprimir.',
    },
  },
  {
    id: 'overhead', name: 'Overheads / Rooms', cat: 'percusion',
    range: [100, 16000],
    rangeKind: 'energy',
    rangeNote: 'La barra representa energía espectral dominante, no un registro de notas fijo.', harm: [16000, 20000],
    cuts: [{"f": "Graves acumulados", "r": "Si otros micrófonos llevan los tambores, prueba un pasa-altos con cuidado; si esta es la imagen principal del kit, conserva su cuerpo."}, {"f": "Aspereza de platos", "r": "Atenúa la zona que molesta, estática o dinámicamente, sin asumir que todo brillo sobra."}],
    boosts: [{"f": "Brillo o cuerpo ausentes", "r": "También puede ser válido realzar suavemente; decide después de revisar fase, balance y función de estos micrófonos."}],
    tip: "Overheads y rooms no son solo platos ni deben recibir únicamente recortes. Escucha cada grupo y su suma con los micrófonos cercanos.",
    comp: {
      tipo: 'VCA en bus paralelo (compresión de bus tipo "New York").',
      ratio: '4:1 – 10:1 en el bus paralelo',
      attack: 'Medio a rápido',
      release: 'Medio a rápido',
      nota: 'Mezcla la versión comprimida con la original limpia para sumar aire y energía sin perder los transitorios de platillos.',
    },
  },
  {
    id: 'cuerdas', name: 'Cuerdas Frotadas', cat: 'cuerdas',
    range: [65, 4000],
    realRange: [41.2, 3520.0], rangeKind: 'register', rangeNote: 'Rango agregado de contrabajo a violín; cada instrumento ocupa solo una parte de esta extensión.', harm: [4000, 15000],
    cuts: [{"f": "200–500 Hz", "r": "Si la sección se vuelve turbia, revisa balance entre miembros antes de cortar cuerpo."}, {"f": "1–4 kHz", "r": "Si el arco resulta duro, atenúa solo el exceso; esta zona también aporta presencia."}],
    boosts: [{"f": "Articulación y brillo", "r": "Si se pierde la línea, revisa balance y prueba un ajuste ancho suave en la zona que realmente falte."}],
    tip: "No existe una sola frecuencia de cuerpo para todas las cuerdas. Conserva fundamentales de cello y contrabajo; no apliques un HPF común a la sección.",
    comp: {
      tipo: 'Vari-Mu u Óptico — cálido y musical.',
      ratio: '2:1 – 3:1',
      attack: 'Lento',
      release: 'Medio a largo',
      nota: 'Una compresión suave y lenta mantiene el carácter orgánico del arco sin aplastar el vibrato.',
    },
  },
  {
    id: 'metales', name: 'Viento-Metal (Metales)', cat: 'viento',
    range: [150, 5000],
    realRange: [41.2, 1174.7], rangeKind: 'register', rangeNote: 'Rango agregado orientativo para familia de metales; depende del instrumento y del intérprete.', harm: [5000, 15000],
    cuts: [{"f": "500–800 Hz", "r": "Si la sección suena encajonada o nasal, prueba una reducción localizada; puede ser parte del carácter."}, {"f": "1–5 kHz", "r": "Si los ataques resultan agresivos, considera control dinámico solo cuando aparezcan."}],
    boosts: [{"f": "Cuerpo según instrumento", "r": "Comprueba las notas de trompa, trombón y tuba antes de reforzar graves en el bus."}, {"f": "Brillo según toma", "r": "Un shelf suave puede abrir una toma apagada; no garantiza más tamaño ni cercanía."}],
    tip: "No llames sibilancia al brillo natural del metal. La plenitud de una tuba no se ajusta como la de una trompeta.",
    comp: {
      tipo: 'FET o VCA.',
      ratio: '3:1 – 6:1',
      attack: 'Rápido a medio',
      release: 'Medio',
      nota: 'Los ataques fuertes de metales se benefician de un attack no demasiado rápido, para no perder el "punch" inicial.',
    },
  },
  {
    id: 'organo', name: 'Órgano', cat: 'teclas',
    range: [30, 3000],
    realRange: [16.35, 4186.0], rangeKind: 'register', rangeNote: 'Referencia amplia de órgano/teclado; registros y stops pueden extender o modificar el espectro audible.', harm: [3000, 8000],
    cuts: [{"f": "Medios graves acumulados", "r": "Si acordes o pedal tapan el conjunto, revisa registración antes de reducir una banda."}, {"f": "Extremo grave innecesario", "r": "Filtra solo si el órgano no lleva el fundamento grave; los registros pueden bajar mucho."}],
    boosts: [{"f": "2–5 kHz", "r": "Si falta articulación, compara un ajuste pequeño con drawbars, stops y balance del Leslie."}, {"f": "Brillo de registros", "r": "Si falta apertura, cambia primero el sonido o la registración; no existe una cifra obligatoria."}],
    tip: "Órgano de tubos, Hammond y emulaciones no comparten un preset. Conserva la función musical del registro utilizado.",
    comp: {
      tipo: 'Suave, Óptico o VCA.',
      ratio: '2:1 – 3:1',
      attack: 'Medio',
      release: 'Medio',
      nota: 'Compresión ligera para nivelar entre acordes sostenidos y notas percutidas.',
    },
  },
  {
    id: 'congas', name: 'Congas', cat: 'percusion',
    range: [150, 8000],
    rangeKind: 'energy',
    rangeNote: 'La barra representa energía espectral dominante, no un registro de notas fijo.', harm: [8000, 14000],
    cuts: [{"f": "Resonancia que sobresale", "r": "Localiza el tono molesto de cada parche; no elimines todas sus resonancias naturales."}, {"f": "Slap áspero", "r": "Controla la zona que distrae solo en esos golpes si el tono abierto ya funciona."}],
    boosts: [{"f": "Cuerpo del tono abierto", "r": "Si falta peso, comprueba la afinación y la toma antes de realzar una frecuencia fija."}, {"f": "Articulación del slap", "r": "Si no se distingue, prueba nivel o un realce suave de ataque sin aumentar bleed."}],
    tip: "Congas no representa toda la percusión menor. Tono abierto, slap y golpe cerrado comparten parte del espectro; no son franjas independientes.",
    comp: {
      tipo: 'FET.',
      ratio: '4:1 – 6:1',
      attack: 'Rápido',
      release: 'Rápido',
      nota: 'Ayuda a nivelar la diferencia entre golpes abiertos y cerrados sin perder el carácter percusivo.',
    },
  },
];


// Rango mostrado: `range` conserva la zona práctica de mezcla; `realRange` indica el registro acústico orientativo cuando aplica.
