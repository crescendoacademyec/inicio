(function (global) {
  // Todos los íconos de la app se dibujan en línea, sin depender de ningún
  // archivo externo (sprite, fuente de íconos, etc.). Así los botones
  // siempre muestran su gráfico sin importar cómo se sirva la página.
  const INLINE_ICONS = Object.freeze({
    "panel-left": [
      '<rect x="3" y="3" width="18" height="18" rx="2"/>',
      '<path d="M9 3v18"/>'
    ].join(""),
    "panel-right": [
      '<rect x="3" y="3" width="18" height="18" rx="2"/>',
      '<path d="M15 3v18"/>'
    ].join(""),
    save: [
      '<path d="M15.2 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.8a2 2 0 0 0-.6-1.4l-3.8-3.8a2 2 0 0 0-1.4-.6z"/>',
      '<path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/>',
      '<path d="M7 3v4a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V3.4"/>'
    ].join(""),
    eraser: [
      '<path d="M20 20H8.5L3.7 15.2a1 1 0 0 1 0-1.4l9.6-9.6a1 1 0 0 1 1.4 0l6.3 6.3a1 1 0 0 1 0 1.4L14.5 18"/>',
      '<path d="M9 13.5 15.5 20"/>'
    ].join(""),
    "undo-2": [
      '<path d="M9 14 4 9l5-5"/>',
      '<path d="M4 9h10.5A5.5 5.5 0 0 1 20 14.5v0A5.5 5.5 0 0 1 14.5 20H11"/>'
    ].join(""),
    "redo-2": [
      '<path d="M15 14 20 9l-5-5"/>',
      '<path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/>'
    ].join(""),
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    speaker: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    metronome: [
      '<path d="M8 21h8"/>',
      '<path d="M6.5 21 9.5 3h5l3 18"/>',
      '<path d="m12 7 4 7"/>',
      '<circle cx="16" cy="14" r="1"/>'
    ].join(""),
    pause: [
      '<rect x="6" y="4" width="4" height="16" rx="1"/>',
      '<rect x="14" y="4" width="4" height="16" rx="1"/>'
    ].join(""),
    piano: '<rect x="5" y="11" width="38" height="40" rx="3" fill="#25282d" stroke="#d5d9df" stroke-width="1.5"/><path d="M8 20h32v26H8z" fill="#f8f3e8" stroke="#c7c8ca" stroke-width="1"/><path d="M12.6 20v26m4.6-26v26m4.6-26v26m4.6-26v26M31 20v26m4.6-26v26" stroke="#4b4f55" stroke-width=".8"/><path d="M11 20h3v15h-3zm5 0h3v15h-3zm9 0h3v15h-3zm5 0h3v15h-3zm5 0h3v15h-3z" fill="#22252b" stroke="none"/><path d="M9 15h30" stroke="#d6ac61" stroke-width="1.5"/>',
    guitar: '<path d="M20 27c-7-5-13-1-12 5 .3 3 4 5 3 8-1 2-7 5-6 12 1 7 9 10 19 10s18-3 19-10c1-7-5-10-6-12-1-3 3-5 3-8 1-6-5-10-12-5" fill="#ba773d" stroke="#f0c587" stroke-width="1.7"/><path d="M21 12h6v29h-6z" fill="#3a2923" stroke="#e1b77c" stroke-width="1"/><rect x="19" y="2" width="10" height="12" rx="2" fill="#9e6134" stroke="#eac58f" stroke-width="1.3"/><path d="M17 5h2m10 0h2M17 9h2m10 0h2M17 12h2m10 0h2" stroke="#d5d9df" stroke-width="2"/><circle cx="24" cy="43" r="5" fill="#242124" stroke="#f1d19c" stroke-width="1.5"/><path d="M17 54h14" stroke="#382923" stroke-width="3"/><path d="M22.5 5v49M24 5v49M25.5 5v49" stroke="#eee0c9" stroke-width=".6"/><path d="M21 19h6m-6 5h6m-6 5h6m-6 5h6" stroke="#b6b9bd" stroke-width=".7"/>',
    requinto: '<path d="M20 31c-6-4-12-1-11 4 .4 3 4 5 3 7-1 2-6 5-5 11 1 6 8 9 17 9s16-3 17-9c1-6-4-9-5-11-1-2 3-4 3-7 1-5-5-8-11-4" fill="#d09a52" stroke="#f0d49b" stroke-width="1.7"/><path d="M21 14h6v29h-6z" fill="#3b2924" stroke="#e0bd8b" stroke-width="1"/><rect x="19" y="3" width="10" height="12" rx="2" fill="#a57243" stroke="#efd3a0" stroke-width="1.3"/><path d="M17 6h2m10 0h2M17 10h2m10 0h2M17 13h2m10 0h2" stroke="#d5d9df" stroke-width="2"/><circle cx="24" cy="45" r="4.5" fill="#242124" stroke="#f1d19c" stroke-width="1.5"/><path d="M18 55h12" stroke="#382923" stroke-width="3"/><path d="M22.5 6v49M24 6v49M25.5 6v49" stroke="#eee0c9" stroke-width=".6"/><path d="M21 20h6m-6 5h6m-6 5h6m-6 5h6m-6 5h6" stroke="#b6b9bd" stroke-width=".7"/>',
    bass: '<path d="M20 31c-1-9-7-9-8-6 4 9-1 11-5 17-6 9-3 18 7 20 9 2 20 0 24-7 4-8-4-13-7-16-3-3-1-8 2-11-5-2-8 3-8 9" fill="#804b34" stroke="#d9b793" stroke-width="1.5"/><path d="M20 12h6v35h-6z" fill="#30282a" stroke="#c0a784" stroke-width="1"/><path d="M20 13V3l7-2 1 12z" fill="#b78752" stroke="#efd1a3" stroke-width="1.2"/><path d="M27 3h4m-4 4h4m-4 4h4M20 5h-3" stroke="#d9dee5" stroke-width="2"/><path d="M17 46h14m-14 5h14m-12 6h10" stroke="#dedfe1" stroke-width="2.3"/><path d="M21.5 5v52M23 4v53M24.5 3v54" stroke="#eee0c9" stroke-width=".65"/><path d="M20 20h6m-6 5h6m-6 5h6m-6 5h6" stroke="#b6b9bd" stroke-width=".7"/><circle cx="33" cy="52" r="1.4" fill="#e5c896" stroke="none"/>',
    ukulele: '<path d="M21 27c-7-4-12 0-11 5 .5 3 4 5 3 7-1 3-7 6-6 13 1 7 8 10 17 10s16-3 17-10c1-7-5-10-6-13-1-2 2-4 3-7 1-5-4-9-11-5" fill="#a36c42" stroke="#e0bc8c" stroke-width="1.7"/><path d="M21 13h6v27h-6z" fill="#3a2a25" stroke="#c69c6c" stroke-width="1"/><rect x="19" y="2" width="10" height="12" rx="2" fill="#a36c42" stroke="#e0bc8c" stroke-width="1.3"/><path d="M16 5h3m10 0h3M16 11h3m10 0h3" stroke="#d9dee5" stroke-width="2"/><circle cx="24" cy="42" r="4.5" fill="#252124" stroke="#e5c998" stroke-width="1.3"/><path d="M18 54h12" stroke="#322624" stroke-width="3"/><path d="M22 5v49m1.3-49v49m1.4-49v49M26 5v49" stroke="#eee0c9" stroke-width=".6"/><path d="M21 19h6m-6 5h6m-6 5h6m-6 5h6" stroke="#b6b9bd" stroke-width=".7"/>',
    violin: '<path d="M19 24c-9-4-13 4-9 10 4 1 4 6 0 7-7 10-2 20 11 20s18-10 11-20c-4-1-4-6 0-7 4-6 0-14-9-10" fill="#ad6532" stroke="#edbd78" stroke-width="1.7"/><path d="M19 12h4v27h-4z" fill="#30272a" stroke="#e3b274" stroke-width="1"/><path d="M19 14V8c-7-6-1-10 3-6 2 3 0 5-1 6" fill="#b4773c" stroke="#edbd78" stroke-width="1.5"/><path d="M17 10h8m-8 3h8" stroke="#d5d9df" stroke-width="1.7"/><path d="M15 39c-5-2-4 4-2 5l-1 5m15-10c5-2 4 4 2 5l1 5" stroke="#442a23" stroke-width="1.3"/><path d="M17 47h8l-2 11h-4z" fill="#35282a" stroke="none"/><path d="M17 44h8" stroke="#f0cf9e" stroke-width="2"/><path d="M20 8v47m2-47v47" stroke="#eee0c9" stroke-width=".6"/><path d="m43 4-7 56m9-55-7 56" stroke="#c39a63" stroke-width="1.3"/>',
    maximize: [
      '<path d="M8 3H5a2 2 0 0 0-2 2v3"/>',
      '<path d="M21 8V5a2 2 0 0 0-2-2h-3"/>',
      '<path d="M3 16v3a2 2 0 0 0 2 2h3"/>',
      '<path d="M16 21h3a2 2 0 0 0 2-2v-3"/>'
    ].join(""),
    x: [
      '<line x1="18" y1="6" x2="6" y2="18"/>',
      '<line x1="6" y1="6" x2="18" y2="18"/>'
    ].join(""),
    "arrow-left": [
      '<line x1="19" y1="12" x2="5" y2="12"/>',
      '<polyline points="12 19 5 12 12 5"/>'
    ].join(""),
    "chevron-up": '<polyline points="18 15 12 9 6 15"/>',
    "chevron-down": '<polyline points="6 9 12 15 18 9"/>',
    "folder-open": [
      '<path d="M3 8V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1"/>',
      '<path d="M3 8h18l-1.7 9.3a2 2 0 0 1-2 1.7H6.7a2 2 0 0 1-2-1.7z"/>'
    ].join(""),
    "pencil-line": [
      '<path d="M12 20h9"/>',
      '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'
    ].join(""),
    "music-2": [
      '<circle cx="8" cy="18" r="3"/>',
      '<path d="M11 18V3l9-1v13"/>'
    ].join(""),
    music: [
      '<path d="M9 18V5l12-2v13"/>',
      '<circle cx="6" cy="18" r="3"/>',
      '<circle cx="18" cy="16" r="3"/>'
    ].join(""),
    type: [
      '<polyline points="4 7 4 4 20 4 20 7"/>',
      '<line x1="9" y1="20" x2="15" y2="20"/>',
      '<line x1="12" y1="4" x2="12" y2="20"/>'
    ].join(""),
    "list-ordered": [
      '<line x1="10" y1="6" x2="21" y2="6"/>',
      '<line x1="10" y1="12" x2="21" y2="12"/>',
      '<line x1="10" y1="18" x2="21" y2="18"/>',
      '<path d="M4 4h2v4"/>',
      '<path d="M4 8h3"/>',
      '<path d="M4 15c0-1 2-1.5 2-2.5S5 11 4 11.5"/>',
      '<path d="M4 19h3"/>'
    ].join(""),
    "circle-help": [
      '<circle cx="12" cy="12" r="9"/>',
      '<path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"/>',
      '<line x1="12" y1="17" x2="12.01" y2="17"/>'
    ].join(""),
    "mouse-pointer-2": '<path d="M4 4l7.07 17 2.51-7.39L21 11.07Z"/>',
    "square-pen": [
      '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>',
      '<path d="M18.4 2.6a2.1 2.1 0 0 1 3 3L11 16l-4 1 1-4Z"/>'
    ].join(""),
    "link-2": [
      '<path d="M9 17H7a5 5 0 0 1 0-10h2"/>',
      '<path d="M15 7h2a5 5 0 1 1 0 10h-2"/>',
      '<line x1="8" y1="12" x2="16" y2="12"/>'
    ].join(""),
    braces: [
      '<path d="M8 3a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2"/>',
      '<path d="M16 3a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2"/>'
    ].join(""),
    "move-horizontal": [
      '<polyline points="18 8 22 12 18 16"/>',
      '<polyline points="6 8 2 12 6 16"/>',
      '<line x1="2" y1="12" x2="22" y2="12"/>'
    ].join(""),
    "wand-sparkles": [
      '<path d="m3 21 9-9"/>',
      '<path d="M12.2 6.2 15 3l6 6-3 3z"/>',
      '<path d="M15 4V2"/>',
      '<path d="M20 9h2"/>',
      '<path d="M17.8 6.2 19 5"/>'
    ].join(""),
    "rows-3": [
      '<rect x="3" y="3" width="18" height="5" rx="1"/>',
      '<rect x="3" y="9.5" width="18" height="5" rx="1"/>',
      '<rect x="3" y="16" width="18" height="5" rx="1"/>'
    ].join(""),
    "panel-top": [
      '<rect x="3" y="3" width="18" height="18" rx="2"/>',
      '<path d="M3 9h18"/>'
    ].join(""),
    timer: [
      '<line x1="10" y1="2" x2="14" y2="2"/>',
      '<line x1="12" y1="14" x2="12" y2="9"/>',
      '<circle cx="12" cy="14" r="8"/>'
    ].join(""),
    hash: [
      '<line x1="4" y1="9" x2="20" y2="9"/>',
      '<line x1="4" y1="15" x2="20" y2="15"/>',
      '<line x1="10" y1="3" x2="8" y2="21"/>',
      '<line x1="16" y1="3" x2="14" y2="21"/>'
    ].join(""),
    sparkles: '<path d="M12 2l1.7 5.6L19 9.3l-5.3 1.7L12 16.6l-1.7-5.6L5 9.3l5.3-1.7Z"/>',
    "audio-lines": [
      '<line x1="4" y1="8" x2="4" y2="16"/>',
      '<line x1="9" y1="4" x2="9" y2="20"/>',
      '<line x1="14" y1="7" x2="14" y2="17"/>',
      '<line x1="19" y1="10" x2="19" y2="14"/>'
    ].join(""),
    "between-horizontal-end": [
      '<rect x="3" y="3" width="7" height="18" rx="1"/>',
      '<rect x="14" y="3" width="7" height="18" rx="1"/>',
      '<path d="M10 12h4"/>',
      '<path d="m12 9 3 3-3 3"/>'
    ].join(""),
    "columns-3": [
      '<rect x="3" y="3" width="18" height="18" rx="2"/>',
      '<line x1="9" y1="3" x2="9" y2="21"/>',
      '<line x1="15" y1="3" x2="15" y2="21"/>'
    ].join(""),
    badge: [
      '<circle cx="12" cy="12" r="9"/>',
      '<path d="m9 12 2 2 4-4"/>'
    ].join(""),
    "audio-waveform": '<path d="M2 13a2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 0 2 2"/>',
    scan: [
      '<path d="M3 7V5a2 2 0 0 1 2-2h2"/>',
      '<path d="M17 3h2a2 2 0 0 1 2 2v2"/>',
      '<path d="M21 17v2a2 2 0 0 1-2 2h-2"/>',
      '<path d="M7 21H5a2 2 0 0 1-2-2v-2"/>'
    ].join(""),
    "file-plus-2": [
      '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/>',
      '<path d="M14 2v6h6"/>',
      '<path d="M9 15h6"/>',
      '<path d="M12 12v6"/>'
    ].join("")
  });
  const PANEL_STORAGE_KEY = "jml-score-ipad-shell-v1";
  const DURATION_LABELS = Object.freeze({
    breve: "Cuadrada",
    whole: "Redonda",
    half: "Blanca",
    quarter: "Negra",
    eighth: "Corchea",
    sixteenth: "Semicorchea",
    "thirty-second": "Fusa",
    "sixty-fourth": "Semifusa",
    "one-twenty-eighth": "Garrapatea"
  });

  const NAV_ITEMS = Object.freeze([
    { id: "document", label: "Archivo", icon: "folder-open" },
    { id: "write", label: "Escribir", icon: "pencil-line" },
    { id: "notation", label: "Notación", icon: "music-2" },
    { id: "text", label: "Texto", icon: "type" },
    { id: "instruments", label: "Instrumentos", icon: "music-2" },
    { id: "scenes", label: "Escenas", icon: "list-ordered" },
    { id: "playback", label: "Reproducir", icon: "play" },
    { id: "help", label: "Ayuda", icon: "circle-help" }
  ]);

  const TOOL_GROUPS = Object.freeze({
    write: [
      { selector: "#selectToolButton", label: "Seleccionar", icon: "mouse-pointer-2" },
      { selector: "#editModeButton", label: "Editar", icon: "square-pen" },
      { selector: "#figureMenuButton", label: "Figuras", icon: "music" },
      { selector: "[data-palette='ties']", label: "Ligaduras", icon: "link-2" },
      { selector: "[data-palette='tuplets']", label: "Tuplets", icon: "braces" },
      { selector: "#shiftModeButton", label: "Desplazar", icon: "move-horizontal" },
      { selector: "[data-palette='tools']", label: "Voicings", icon: "wand-sparkles" },
      { selector: "#reflowButton", label: "Reorganizar", icon: "rows-3" }
    ],
    notation: [
      { selector: "[data-palette='meters']", label: "Compás", icon: "panel-top" },
      { selector: "[data-palette='tempo']", label: "Tempo", icon: "timer" },
      { selector: "[data-palette='clefs']", label: "Claves", icon: "music" },
      { selector: "#keySignatureButton", label: "Armadura", icon: "hash" },
      { selector: "[data-palette='articulations']", label: "Articulaciones", icon: "sparkles" },
      { selector: "#dynamicsButton", label: "Dinámicas", icon: "audio-lines" },
      { selector: "[data-palette='navigation']", label: "D.C. / D.S.", icon: "repeat" },
      { selector: "[data-palette='endings']", label: "Casillas", icon: "between-horizontal-end" },
      { selector: "[data-palette='bars']", label: "Barras", icon: "columns-3" }
    ],
    text: [
      { selector: "#textModeButton", label: "Texto", icon: "type" },
      { selector: "#chordModeButton", label: "Cifrado", icon: "badge" }
    ],
    playback: [
      { selector: "#playbackButton", label: "Reproducir", icon: "play" },
      { selector: "#jazzModeButton", label: "Interpretación jazz", icon: "audio-waveform" },
      { selector: "[data-palette='canvas']", label: "Vista del lienzo", icon: "scan" }
    ]
  });

  function icon(name, className = "") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (className) svg.setAttribute("class", className);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", ["piano", "guitar", "requinto", "bass", "ukulele", "violin"].includes(name) ? "0 0 48 64" : "0 0 24 24");
    svg.innerHTML = INLINE_ICONS[name] || "";
    return svg;
  }

  function element(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function readLayoutPreferences() {
    try {
      const value = JSON.parse(localStorage.getItem(PANEL_STORAGE_KEY) || "{}");
      return {
        activePanel: NAV_ITEMS.some((item) => item.id === value.activePanel) ? value.activePanel : "write",
        leftVisible: value.leftVisible === true,
        rightVisible: value.rightVisible !== false,
        keyboardVisible: value.keyboardVisible !== false
      };
    } catch {
      return {
        activePanel: "write",
        leftVisible: false,
        rightVisible: true,
        keyboardVisible: true
      };
    }
  }

  function saveLayoutPreferences(state) {
    try {
      localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify({
        activePanel: state.activePanel,
        leftVisible: state.leftVisible,
        rightVisible: state.rightVisible,
        keyboardVisible: state.keyboardVisible
      }));
    } catch {
      // The editor remains usable when browser storage is unavailable.
    }
  }

  function createIconButton(options = {}) {
    const button = element("button", options.className || "ipad-icon-button");
    button.type = "button";
    button.title = options.label || "";
    button.setAttribute("aria-label", options.label || "");
    if (options.icon) button.appendChild(icon(options.icon));
    if (options.text) button.appendChild(element("span", "ipad-button-text", options.text));
    return button;
  }

  function proxyButton(config, context) {
    const source = document.querySelector(config.selector);
    if (!source) return null;
    const button = element("button", "ipad-tool-button");
    button.type = "button";
    button.title = source.title || source.getAttribute("aria-label") || config.label;
    button.setAttribute("aria-label", button.title);
    button.append(icon(config.icon), element("span", "", config.label));
    button.dataset.proxyFor=config.selector;
    const sync = () => {
      const active = source.classList.contains("is-active") || source.getAttribute("aria-pressed") === "true";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.disabled = source.disabled;
      const expanded = source.getAttribute("aria-expanded");
      if (expanded != null) button.setAttribute("aria-expanded", expanded);
    };
    sync();
    new MutationObserver(sync).observe(source, {
      attributes: true,
      attributeFilter: ["class", "disabled", "aria-pressed", "aria-expanded", "title", "aria-label"]
    });
    button.addEventListener("click", () => {
      source.click();
      if (source.classList.contains("palette-trigger") || source.dataset.palette) {
        context.setRightVisible(true);
      }
      requestAnimationFrame(sync);
    });
    return button;
  }

  function sectionHeader(eyebrow, title, description = "") {
    const header = element("header", "ipad-panel-heading");
    header.append(
      element("span", "ipad-eyebrow", eyebrow),
      element("h2", "", title)
    );
    if (description) header.appendChild(element("p", "", description));
    return header;
  }

  function createControlSection(title) {
    const section = element("section", "ipad-control-section");
    section.appendChild(element("h3", "", title));
    return section;
  }

  function moveLegacyPanel(selector, destination) {
    const panel = document.querySelector(selector);
    if (!panel) return null;
    panel.classList.add("ipad-legacy-panel");
    destination.appendChild(panel);
    return panel;
  }

  function createStateRow(label, id) {
    const row = element("div", "ipad-state-row");
    row.append(
      element("span", "", label),
      element("strong", "")
    );
    row.querySelector("strong").id = id;
    return row;
  }

  function setup(options = {}) {
    if (document.querySelector(".cuaderno-ipad-shell")) return null;
    const workbench = document.querySelector(".editor-workbench");
    const legacyMain = document.querySelector("main.app-shell");
    if (!workbench || !legacyMain) return null;

    const preferences = readLayoutPreferences();
    const state = {
      ...preferences,
      leftVisible: false,
      lastFocus: null
    };

    const root = element("div", "cuaderno-ipad-shell is-compact-menubar");
    root.dataset.leftVisible = String(state.leftVisible);
    root.dataset.rightVisible = String(state.rightVisible);
    root.dataset.keyboardVisible = String(state.keyboardVisible);

    const rail = element("nav", "ipad-navigation-rail");
    rail.setAttribute("aria-label", "Áreas del editor");

    const brand = element("a", "ipad-navigation-brand");
    brand.href = "https://crescendoacademyec.github.io/inicio/";
    brand.title = "Volver a Herramientas";
    brand.setAttribute("aria-label", "Editor Crescendo");
    brand.append(
      element("span", "ipad-brand-mark", "EC"),
      element("span", "ipad-brand-caption", "Crescendo")
    );
    rail.appendChild(brand);

    const navButtons = new Map();
    NAV_ITEMS.forEach((item) => {
      const button = element("button", "ipad-navigation-button");
      button.type = "button";
      button.id = `ipad-nav-${item.id}`;
      button.dataset.panel = item.id;
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", "ipadToolsMenu");
      button.append(icon(item.icon), element("span", "", item.label));
      rail.appendChild(button);
      navButtons.set(item.id, button);
    });
    const main = element("main", "ipad-app-main");
    const header = element("header", "ipad-workspace-header");
    const headerLeft = element("div", "ipad-header-left");
    const toggleLeft = createIconButton({ icon: "panel-left", label: "Mostrar u ocultar herramientas" });
    const heading = element("div", "ipad-screen-heading");
    heading.append(
      element("span", "ipad-eyebrow", "Editor Crescendo"),
      element("h1", "", "Ejercicio sin título")
    );
    const documentSubtitle = element("span", "ipad-document-subtitle", "Partitura editable");
    heading.appendChild(documentSubtitle);
    headerLeft.append(heading);

    const headerCenter = element("div", "ipad-header-center");
    const clearButton = createIconButton({ icon: "eraser", label: "Limpiar toda la escritura de ambos pentagramas" });
    const saveButton = createIconButton({ icon: "save", label: "Guardar o exportar", text: "Exportar", className: "ipad-header-action ipad-save-action" });
    const undoProxy = createIconButton({ icon: "undo-2", label: "Deshacer" });
    const redoProxy = createIconButton({ icon: "redo-2", label: "Rehacer" });
    const playProxy = createIconButton({ icon: "play", label: "Reproducir o detener" });
    const metronomeProxy = createIconButton({ icon: "metronome", label: "Activar metrónomo" });
    const bpmGroup = element("div", "ipad-bpm-group");
    const bpmDown = createIconButton({ icon: "chevron-down", label: "Bajar tempo", className: "ipad-bpm-step" });
    const bpmValue = element("input", "ipad-bpm-value");
    bpmValue.type = "number"; bpmValue.min = "20"; bpmValue.max = "320"; bpmValue.step = "1";
    bpmValue.value = "140"; bpmValue.inputMode = "numeric";
    bpmValue.setAttribute("aria-label", "Tempo de la partitura en BPM");
    const beatIndicator = element("output", "editor-metronome-beat", "—");
    beatIndicator.dataset.editorMetronomeBeat = "";
    beatIndicator.setAttribute("aria-label", "Metrónomo detenido");
    const bpmUp = createIconButton({ icon: "chevron-up", label: "Subir tempo", className: "ipad-bpm-step" });
    bpmGroup.append(bpmDown, bpmValue, bpmUp);
    function createSoundSelector(mobile = false) {
      const label = element("label", `ipad-sound-selector${mobile ? " ipad-sound-selector--mobile" : ""}`);
      const select = document.createElement("select");
      select.setAttribute("aria-label", "Instrumento del pentagrama activo");
      select.title = "Instrumento del pentagrama activo";
      for (const [value, sound] of Object.entries(global.JMLScoreInstruments.instruments)) {
        const option = document.createElement("option");option.value = value;option.textContent = sound.name;select.appendChild(option);
      }
      select.value = global.JMLScoreInstruments.readPreference();
      document.addEventListener("editor-instrument-select", event => {
        const selected = global.JMLScoreInstruments.normalize(event.detail?.instrument);
        select.value = selected;
      });
      document.addEventListener("editor-active-instrument", event => { select.value = event.detail.instrument; });
      select.addEventListener("change", () => {
        document.querySelectorAll('.ipad-sound-selector select').forEach(other => { other.value = select.value; });
        document.dispatchEvent(new CustomEvent("editor-instrument-select", { detail: { instrument: select.value } }));
      });
      label.appendChild(select);
      return label;
    }
    headerCenter.append(clearButton, saveButton, undoProxy, redoProxy, playProxy, metronomeProxy, beatIndicator, bpmGroup, createSoundSelector());

    const headerRight = element("div", "ipad-header-actions");
    const saveStatus = element("span", "ipad-save-status");
    saveStatus.dataset.state = "saved";
    saveStatus.append(element("span", "ipad-status-dot"), element("span", "", "Guardado"));
    const keyboardToggle = createIconButton({ icon: "piano", label: "Mostrar u ocultar el piano" });
    keyboardToggle.id = "instrumentViewToggle";
    keyboardToggle.setAttribute("aria-controls", "midiKeyboardPanel");
    let visibleInstrument = global.JMLScoreInstruments.readPreference();
    function syncInstrumentToggle(instrument = visibleInstrument) {
      visibleInstrument = global.JMLScoreInstruments.normalize(instrument);
      const name = global.JMLScoreInstruments.instruments[visibleInstrument].name.toLocaleLowerCase("es");
      const hasBoard = !!global.JMLScoreGuitar?.forInstrument(visibleInstrument);
      const target = hasBoard ? `el diapasón de ${name}` : "el piano";
      keyboardToggle.replaceChildren(icon(hasBoard ? visibleInstrument : "piano"));
      keyboardToggle.dataset.instrument = visibleInstrument;
      keyboardToggle.title = `${state.keyboardVisible ? "Ocultar" : "Mostrar"} ${target}`;
      keyboardToggle.setAttribute("aria-label", `Mostrar u ocultar ${target}`);
    }
    document.addEventListener("editor-instrument-select", event => syncInstrumentToggle(event.detail?.instrument));
    document.addEventListener("editor-active-instrument", event => syncInstrumentToggle(event.detail?.instrument));
    syncInstrumentToggle();
    const toggleRight = createIconButton({ icon: "panel-right", label: "Mostrar u ocultar inspector" });
    const fullscreenProxy = createIconButton({ icon: "maximize", label: "Pantalla completa" });
    headerRight.append(createSoundSelector(true), saveStatus, keyboardToggle, toggleRight, fullscreenProxy);
    saveStatus.classList.add("ipad-autosave-indicator");
    saveStatus.setAttribute("role", "status");
    header.append(headerLeft, headerCenter, headerRight);

    const body = element("div", "ipad-workspace-body");
    const leftPanel = element("aside", "ipad-tools-panel");
    leftPanel.id = "ipadToolsMenu";
    leftPanel.setAttribute("role", "dialog");
    leftPanel.setAttribute("aria-label", "Herramientas");
    leftPanel.hidden = true;
    const leftHeader = element("div", "ipad-side-header");
    const leftHeading = element("div");
    leftHeading.append(element("span", "ipad-eyebrow", "HERRAMIENTAS"), element("h2", "", "Escribir"));
    const leftClose = createIconButton({ icon: "x", label: "Cerrar herramientas" });
    leftHeader.append(leftHeading, leftClose);
    const leftContent = element("div", "ipad-side-content");
    leftPanel.append(leftHeader, leftContent);

    const workspace = element("section", "ipad-score-workspace");
    workspace.setAttribute("aria-label", "Partitura");
    workspace.append(workbench);

    const rightPanel = element("aside", "ipad-inspector-panel");
    rightPanel.setAttribute("aria-label", "Inspector");
    const rightHeader = element("div", "ipad-side-header");
    const rightHeading = element("div");
    rightHeading.append(element("span", "ipad-eyebrow", "INSPECTOR"), element("h2", "", "Estado actual"));
    const rightClose = createIconButton({ icon: "x", label: "Cerrar inspector" });
    rightHeader.append(rightHeading, rightClose);
    const rightContent = element("div", "ipad-side-content ipad-inspector-content");
    const sessionSection = createControlSection("Escritura");
    sessionSection.classList.add("ipad-state-section");
    sessionSection.append(
      createStateRow("Modo", "ipadStateMode"),
      createStateRow("Voz", "ipadStateVoice"),
      createStateRow("Figura", "ipadStateDuration"),
      createStateRow("Grid", "ipadStateGrid")
    );
    const positionSection = createControlSection("Posición");
    const positionText = element("p", "ipad-inspector-copy", "Compás 1 · 1/4");
    positionText.id = "ipadCursorStatus";
    positionSection.appendChild(positionText);
    const paletteSection = createControlSection("Opciones");
    paletteSection.classList.add("ipad-palette-section");
    const paletteHint = element("p", "ipad-inspector-empty", "Selecciona una herramienta para ver sus opciones.");
    const paletteHost = element("div", "ipad-palette-host");
    paletteHost.appendChild(paletteHint);
    paletteSection.appendChild(paletteHost);
    const documentSection = createControlSection("Documento");
    const documentState = element("p", "ipad-inspector-copy", "Guardado");
    documentState.id = "ipadDocumentStatus";
    documentSection.appendChild(documentState);
    rightContent.append(paletteSection, sessionSection, positionSection, documentSection);
    rightPanel.append(rightHeader, rightContent);

    const scrim = element("button", "ipad-panel-scrim");
    scrim.type = "button";
    scrim.setAttribute("aria-label", "Cerrar paneles");
    body.append(leftPanel, workspace, rightPanel, scrim);
    main.append(header, body);
    root.append(rail, main);
    const midiKeyboardPanel = document.getElementById("midiKeyboardPanel");
    if (midiKeyboardPanel) root.appendChild(midiKeyboardPanel);

    document.body.appendChild(root);
    document.querySelector(".app-header")?.classList.add("is-ipad-shell-hidden");
    document.querySelector(".page-bg")?.classList.add("is-ipad-shell-hidden");
    workbench.classList.add("is-ipad-workbench");
    workbench.querySelector(".editor-menu--primary")?.classList.add("is-ipad-shell-source");

    const manual = document.getElementById("manualOverlay");
    if (manual) document.body.appendChild(manual);

    const panels = new Map();
    NAV_ITEMS.forEach((item) => {
      const panel = element("section", "ipad-panel-page");
      panel.id = `ipad-panel-${item.id}`;
      panel.dataset.panelPage = item.id;
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", `ipad-nav-${item.id}`);
      leftContent.appendChild(panel);
      panels.set(item.id, panel);
    });

    const documentPanel = panels.get("document");
    documentPanel.classList.add("editor-file-menu");
    const legacyFiles=element('div','editor-file-sources');legacyFiles.hidden=true;documentPanel.append(legacyFiles);
    moveLegacyPanel(".exercise-app-menu__panel--file",legacyFiles);
    moveLegacyPanel("#versionHistoryHost",legacyFiles);
    function fileCommand(label,action,command){const button=element('button','editor-file-command',label);button.type='button';if(command)button.dataset.shortcutCommand=command;button.onclick=action;documentPanel.append(button);return button;}
    function sourceCommand(id,label){const button=document.getElementById(id);button.textContent=label;button.setAttribute('aria-label',label);button.className='editor-file-command';documentPanel.append(button);return button;}
    function fileDialog(title,nodes){
      const dialog=document.createElement('dialog');dialog.className='arrangement-dialog project-library-dialog';dialog.setAttribute('aria-label',title);const head=element('header'),h=element('h2','',title),close=element('button','','Cerrar');close.type='button';close.onclick=()=>dialog.close();head.append(h,close);const content=element('div','arrangement-body');content.append(...nodes);dialog.append(head,content);document.body.append(dialog);dialog.addEventListener('keydown',event=>event.stopPropagation());dialog.addEventListener('close',()=>{legacyFiles.append(...nodes);dialog.remove();});dialog.showModal();return dialog;
    }
    const newDocumentButton=fileCommand('Nuevo proyecto…',null,'new');
    fileCommand('Abrir proyecto…',()=>{
      const select=document.getElementById('exerciseSelect'),label=select.closest('label'),open=document.getElementById('loadExerciseButton'),remove=document.getElementById('deleteExerciseButton');
      open.textContent='Abrir seleccionado';open.setAttribute('aria-label','Abrir seleccionado');remove.textContent='Eliminar de biblioteca';
      const body=element('div','project-library-controls');const file=element('button','','Abrir archivo de proyecto…');file.type='button';file.onclick=()=>{document.getElementById('importExerciseInput').click();dialog.close();};body.append(file,label,open,remove);const dialog=fileDialog('Abrir proyecto',[body]);dialog.addEventListener('close',()=>legacyFiles.append(label,open,remove));
    },'open');
    sourceCommand('saveExerciseButton','Guardar en biblioteca');
    sourceCommand('exportExerciseButton','Guardar como…');
    const exportFileButton=fileCommand('Guardar o exportar…',()=>openExport(),'export');
    fileCommand('Importar partitura…',()=>document.getElementById('importMusicXmlInput').click(),'import');
    documentPanel.append(element('hr','editor-file-divider'));
    fileCommand('Configurar proyecto…',()=>document.dispatchEvent(new CustomEvent('editor-project-settings')),'project');
    fileCommand('Historial de versiones…',()=>fileDialog('Historial de versiones',[document.getElementById('versionHistoryHost')]),'history');

    const buildToolPanel = (panelId, eyebrow, title, description, groupTitle) => {
      const panel = panels.get(panelId);
      panel.appendChild(sectionHeader(eyebrow, title, description));
      const group = createControlSection(groupTitle);
      const grid = element("div", "ipad-tool-grid");
      (TOOL_GROUPS[panelId] || []).forEach((config) => {
        const button = proxyButton(config, context);
        if (button) grid.appendChild(button);
      });
      group.appendChild(grid);
      panel.appendChild(group);
      return panel;
    };

    const context = {
      setRightVisible(visible) {
        if (visible) setLeftVisible(false);
        state.rightVisible = visible;
        root.dataset.rightVisible = String(visible);
        toggleRight.setAttribute("aria-pressed", visible ? "true" : "false");
        saveLayoutPreferences(state);
      }
    };

    const writePanel = buildToolPanel("write", "ESCRITURA", "Notas y figuras", "Elige el modo de entrada y la estructura rítmica.", "Herramientas");
    const gridSection = createControlSection("Resolución del cursor");
    const originalGrid = document.getElementById("gridDurationSelect");
    if (originalGrid) {
      const label = element("label", "ipad-field");
      label.appendChild(element("span", "", "Grid"));
      const select = originalGrid.cloneNode(true);
      select.removeAttribute("id");
      select.value = originalGrid.value;
      select.addEventListener("change", () => {
        originalGrid.value = select.value;
        originalGrid.dispatchEvent(new Event("change", { bubbles: true }));
      });
      originalGrid.addEventListener("change", () => { select.value = originalGrid.value; });
      label.appendChild(select);
      gridSection.appendChild(label);
    }
    writePanel.appendChild(gridSection);
    const selectAll=element('button','ipad-primary-action','Seleccionar todo');selectAll.type='button';selectAll.dataset.shortcutCommand='select-all';selectAll.onclick=()=>document.dispatchEvent(new CustomEvent('editor-select-all'));writePanel.append(selectAll);

    buildToolPanel("notation", "NOTACIÓN", "Símbolos", "Compases, claves, articulaciones y estructura.", "Paletas");
    const textPanel = buildToolPanel("text", "TEXTO", "Texto y cifrado", "Añade indicaciones, cifrados y formato editorial.", "Herramientas");
    const textToolbar = document.getElementById("textToolbar");
    if (textToolbar) {
      textToolbar.classList.add("ipad-text-toolbar");
      textPanel.appendChild(textToolbar);
    }

    const scenesPanel = panels.get("scenes");
    scenesPanel.appendChild(sectionHeader("SECUENCIA", "Escenas", "Crea pasos de repaso o un recorrido bloqueado de ejercicio."));
    moveLegacyPanel(".exercise-app-menu__panel--scenes", scenesPanel);

    const playbackPanel = buildToolPanel("playback", "REPRODUCCIÓN", "Escucha", "Reproduce la partitura mediante una salida MIDI local.", "Transporte");
    const bpmSection = createControlSection("Tempo");
    const originalBpm = document.getElementById("playbackBpmInput");
    if (originalBpm) {
      const label = element("label", "ipad-field");
      label.appendChild(element("span", "", "BPM"));
      const input = originalBpm.cloneNode(true);
      input.removeAttribute("id");
      input.value = originalBpm.value;
      const commit = () => {
        originalBpm.value = input.value;
        originalBpm.dispatchEvent(new Event("change", { bubbles: true }));
        input.value = originalBpm.value;
      };
      input.addEventListener("change", commit);
      originalBpm.addEventListener("change", () => { input.value = originalBpm.value; });
      document.addEventListener("editor-tempo-change", e => { if(document.activeElement !== input) input.value = String(e.detail.bpm); });
      label.appendChild(input);
      bpmSection.appendChild(label);
    }
    const midiState = element("p", "ipad-inline-status", "Buscando dispositivos MIDI...");
    midiState.id = "ipadMidiStatus";
    bpmSection.appendChild(midiState);
    playbackPanel.appendChild(bpmSection);
    const recordingSection = createControlSection("Grabación");
    moveLegacyPanel("#recordingPanelHost", recordingSection);
    playbackPanel.appendChild(recordingSection);

    const helpPanel = panels.get("help");
    helpPanel.appendChild(sectionHeader("AYUDA", "Manual", "Consulta las funciones y los atajos del editor."));
    moveLegacyPanel(".exercise-app-menu__panel--help", helpPanel);
    const shortcutSection = createControlSection("Atajos esenciales");
    shortcutSection.innerHTML += `
      <dl class="ipad-shortcut-list">
        <div><dt>Espacio</dt><dd>Reproducir / detener</dd></div>
        <div><dt>Enter</dt><dd>Entrar / salir de escritura</dd></div>
        <div><dt>Esc</dt><dd>Volver a selección</dd></div>
        <div><dt>Cmd/Ctrl + Z</dt><dd>Deshacer</dd></div>
      </dl>
    `;
    legacyFiles.append(shortcutSection);const shortcutHelp=element('button','ipad-primary-action','Atajos del teclado…');shortcutHelp.type='button';shortcutHelp.dataset.shortcutCommand='shortcut-help';shortcutHelp.onclick=()=>{const list=element('div','project-shortcut-reference');for(const control of document.querySelectorAll('.ipad-panel-page button[aria-keyshortcuts]')){const row=element('div'),label=element('span','',control.getAttribute('aria-label')||control.textContent.trim()),hint=element('kbd','',control.querySelector('kbd')?.textContent||control.getAttribute('aria-keyshortcuts'));row.append(label,hint);list.append(row);}fileDialog('Atajos del teclado',[list]);};helpPanel.append(shortcutHelp);

    const durationDrawer = document.getElementById("durationDrawer");
    if (durationDrawer) {
      durationDrawer.classList.add("ipad-context-drawer");
      paletteHost.appendChild(durationDrawer);
      const drawerObserver = new MutationObserver(() => {
        const open = !durationDrawer.classList.contains("is-hidden");
        paletteHint.hidden = open;
        paletteSection.classList.toggle("has-options", open);
        const palette = durationDrawer.dataset.activePalette || "";
        rightHeading.querySelector("h2").textContent = open
          ? ({
              figures: "Figuras",
              ties: "Ligaduras",
              tuplets: "Tuplets",
              meters: "Compás",
              tempo: "Tempo",
              clefs: "Claves",
              articulations: "Articulaciones",
              keys: "Armadura",
              dynamics: "Dinámicas",
              endings: "Casillas",
              navigation: "Navegación",
              canvas: "Vista",
              tools: "Voicings",
              bars: "Barras",
              jazz: "Jazz",
              scenes: "Escenas",
              selection: "Selección"
            }[palette] || "Opciones")
          : "Estado actual";
        if (open) context.setRightVisible(true);
      });
      drawerObserver.observe(durationDrawer, { attributes: true, attributeFilter: ["class", "data-active-palette"] });
    }

    const proxyClick = (proxy, sourceSelector) => {
      const source = document.querySelector(sourceSelector);
      if (!source) {
        proxy.disabled = true;
        return;
      }
      proxy.addEventListener("click", () => source.click());
      const sync = () => {
        proxy.disabled = source.disabled;
        proxy.classList.toggle("is-active", source.classList.contains("is-active"));
        proxy.setAttribute("aria-pressed", source.getAttribute("aria-pressed") || "false");
      };
      sync();
      new MutationObserver(sync).observe(source, {
        attributes: true,
        attributeFilter: ["disabled", "class", "aria-pressed"]
      });
    };
    proxyClick(undoProxy, "#undoButton");
    proxyClick(redoProxy, "#redoButton");
    proxyClick(playProxy, "#playbackButton");
    proxyClick(metronomeProxy, "#metronomeButton");
    const openExport = (initialFormat = 'pdf') => {
      const dialog = document.createElement("dialog");dialog.className="editor-export-dialog";dialog.setAttribute("aria-label","Guardar o exportar partitura");
      dialog.innerHTML='<form><h2>Guardar o exportar</h2><label>Formato<select name="format"><option value="pdf">PDF</option><option value="png">Imagen PNG</option><option value="musicxml">MusicXML</option><option value="midi">MIDI</option><option value="json">Proyecto editable (JSON)</option></select></label><fieldset data-midi-options hidden><label>Contenido MIDI<select name="midiScope"><option value="all">Conjunto completo · una pista por instrumento</option><option value="separate">Un MIDI por instrumento · archivo ZIP</option></select></label><label class="export-mix-check"><input type="checkbox" name="respectMix">Respetar mute y solos de la consola</label></fieldset><label data-notation-options>Contenido de la partitura<select name="notation"><option value="staves">Solo pentagramas</option><option value="tabs">Pentagramas y tablaturas</option></select></label><label>Nombre<input name="filename" required autocomplete="off"></label><div class="export-folder"><button type="button" data-folder>Elegir carpeta</button><span data-folder-name>Descargas del navegador</span></div><p data-folder-help></p><div class="export-actions"><button type="button" data-cancel>Cancelar</button><button type="submit">Exportar</button></div></form>';
      const name=dialog.querySelector('[name=filename]'),format=dialog.querySelector('[name=format]'),scope=dialog.querySelector('[name=midiScope]');name.value=heading.querySelector('h1').textContent;format.value=initialFormat;
      for(const part of options.midiParts?.()||[]){const option=document.createElement('option');option.value='part:'+part.id;option.textContent='Solo '+part.name;scope.append(option);}
      dialog.querySelector('[name=notation]').value=options.defaultTabs?.()?'tabs':'staves';const updateMidi=()=>{dialog.querySelector('[data-midi-options]').hidden=format.value!=='midi';dialog.querySelector('[data-notation-options]').hidden=!['pdf','png','musicxml'].includes(format.value)||!options.hasTabInstruments?.();};format.onchange=updateMidi;updateMidi();
      let directory=null;
      const folder=dialog.querySelector('[data-folder]');
      folder.disabled=!global.showDirectoryPicker;
      dialog.querySelector('[data-folder-help]').textContent=global.showDirectoryPicker?'Se usará la carpeta de descargas del navegador, salvo que elijas otra carpeta.':'La carpeta se gestiona desde las opciones de descarga del navegador. Activa «Preguntar dónde guardar» para elegirla en cada exportación.';
      folder.onclick=async()=>{try{directory=await global.showDirectoryPicker({mode:'readwrite'});dialog.querySelector('[data-folder-name]').textContent=directory.name;}catch(error){if(error.name!=='AbortError')dialog.querySelector('[data-folder-help]').textContent=error.message;}};
      dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
      dialog.querySelector('form').onsubmit=async event=>{
        event.preventDefault();const selected=format.value,extension=selected==='midi'?(scope.value==='separate'?'zip':'mid'):selected,filename=global.CrescendoScoreFile.filename(name.value,extension);let fileHandle=null;
        try{
          saveButton.classList.add('is-active');
          document.dispatchEvent(new CustomEvent('editor-export',{detail:{format:selected,filename,directory,fileHandle,midiScope:scope.value,respectMix:dialog.querySelector('[name=respectMix]').checked,includeTabs:dialog.querySelector('[name=notation]').value==='tabs'}}));dialog.close();
        }catch(error){if(error.name!=='AbortError')dialog.querySelector('[data-folder-help]').textContent=error.message;}
      };
      dialog.onclose=()=>dialog.remove();document.body.appendChild(dialog);dialog.showModal();name.focus();name.select();
    };
    saveButton.addEventListener('click',()=>openExport());

    document.addEventListener('editor-export-finished',()=>saveButton.classList.remove('is-active'));
    const measureControls=element('div','ipad-measure-controls');
    const minusMeasure=createIconButton({icon:'minus',label:'Quitar el compás seleccionado'});
    const measureCount=element('output','ipad-measure-count','8');measureCount.setAttribute('aria-label','Número de compases');
    const plusMeasure=createIconButton({icon:'plus',label:'Añadir un compás al final'});
    minusMeasure.replaceChildren(element('span','','−'));plusMeasure.replaceChildren(element('span','','+'));
    minusMeasure.onclick=()=>document.dispatchEvent(new CustomEvent('editor-measures',{detail:{delta:-1}}));
    plusMeasure.onclick=()=>document.dispatchEvent(new CustomEvent('editor-measures',{detail:{delta:1}}));
    measureControls.setAttribute('aria-label','Compases');measureControls.append(element('span','','Compases'),minusMeasure,measureCount,plusMeasure);headerCenter.append(measureControls);
    document.addEventListener('editor-measure-count',event=>{measureCount.textContent=String(event.detail.count);minusMeasure.disabled=event.detail.count<=1;});
    document.addEventListener('editor-autosaved',()=>{saveStatus.dataset.state='saved';saveStatus.title='Guardado automáticamente en este navegador';saveStatus.setAttribute('aria-label',saveStatus.title);});
    proxyClick(clearButton, "#clearScoreButton");
    proxyClick(fullscreenProxy, "#fullscreenButton");

    const playbackSource = document.querySelector("#playbackButton");
    if (playbackSource) {
      const syncPlayIcon = () => {
        const running = playbackSource.classList.contains("is-active");
        playProxy.replaceChildren(icon(running ? "pause" : "play"));
        playProxy.setAttribute("aria-label", running ? "Pausar reproducción" : playbackSource.dataset.paused==="true"?"Continuar reproducción":"Reproducir");
        playProxy.title = running ? "Pausar reproducción" : playbackSource.dataset.paused==="true"?"Continuar reproducción":"Reproducir";
      };
      syncPlayIcon();
      new MutationObserver(syncPlayIcon).observe(playbackSource, { attributes: true, attributeFilter: ["class","data-paused"] });
    }

    const metronomeSource = document.querySelector("#metronomeButton");
    if (metronomeSource) {
      const syncMetronomeLabel = () => {
        const active = metronomeSource.classList.contains("is-active");
        const label = active ? "Desactivar metrónomo" : "Activar metrónomo";
        metronomeProxy.setAttribute("aria-label", label);
        metronomeProxy.title = label;
      };
      syncMetronomeLabel();
      new MutationObserver(syncMetronomeLabel).observe(metronomeSource, {
        attributes: true,
        attributeFilter: ["class", "aria-pressed"]
      });
    }

    const bpmSource = document.querySelector("#playbackBpmInput");
    if (bpmSource) {
      const commitBpm = (next) => {
        const clamped = Math.max(Number(bpmSource.min) || 20, Math.min(Number(bpmSource.max) || 320, next));
        bpmSource.value = String(clamped);
        bpmSource.dispatchEvent(new Event("change", { bubbles: true }));
      };
      let bpmDraft = null;
      const syncBpmDisplay = () => { if(bpmDraft === null && document.activeElement !== bpmValue) bpmValue.value = bpmSource.value; };
      document.addEventListener("editor-tempo-change", e => { if(bpmDraft === null && document.activeElement !== bpmValue) bpmValue.value = String(e.detail.bpm); });
      const commitDraft = () => {
        if(bpmDraft !== null) {
          const value = bpmDraft; bpmDraft = null;
          if(value.trim() && Number.isFinite(Number(value))) commitBpm(Number(value));
        }
        bpmValue.value = bpmSource.value;
      };
      bpmValue.addEventListener("input", () => { bpmDraft = bpmValue.value; });
      bpmValue.addEventListener("focus", () => bpmValue.select());
      bpmValue.addEventListener("change", commitDraft);
      bpmValue.addEventListener("blur", commitDraft);
      bpmValue.addEventListener("keydown", e => {
        if(e.key === "Enter") { e.preventDefault(); commitDraft(); bpmValue.blur(); }
        if(e.key === "Escape") { e.preventDefault(); bpmDraft = null; bpmValue.value = bpmSource.value; bpmValue.blur(); }
      });
      syncBpmDisplay();
      bpmSource.addEventListener("change", syncBpmDisplay);
      bpmSource.addEventListener("input", syncBpmDisplay);
      bpmDown.addEventListener("click", () => commitBpm((Number(bpmSource.value) || 140) - 4));
      bpmUp.addEventListener("click", () => commitBpm((Number(bpmSource.value) || 140) + 4));
    } else {
      bpmGroup.hidden = true;
    }

    function setLeftVisible(visible) {
      if (visible && window.matchMedia("(max-width: 1180px)").matches) {
        state.rightVisible = false;
        root.dataset.rightVisible = "false";
        toggleRight.setAttribute("aria-pressed", "false");
      }
      state.leftVisible = visible;
      root.dataset.leftVisible = String(visible);
      toggleLeft.setAttribute("aria-pressed", visible ? "true" : "false");
      leftPanel.hidden = !visible;
      navButtons.forEach((button, id) => {
        const open = visible && id === state.activePanel;
        button.setAttribute("aria-expanded", String(open));
        button.classList.toggle("is-active", open);
      });
      if (visible) positionMenu();
      saveLayoutPreferences(state);
    }

    function positionMenu() {
      const button = navButtons.get(state.activePanel);
      if (!button) return;
      const bounds = button.getBoundingClientRect();
      const width = Math.min(330, window.innerWidth - 16);
      leftPanel.style.left = `${Math.max(8, Math.min(bounds.left, window.innerWidth - width - 8))}px`;
      leftPanel.style.top = `${Math.ceil(rail.getBoundingClientRect().bottom)}px`;
    }
    window.addEventListener("resize", () => { if (state.leftVisible) positionMenu(); });
    rail.addEventListener("scroll", () => { if (state.leftVisible) positionMenu(); });
    document.addEventListener("pointerdown", event => {
      if (state.leftVisible && !leftPanel.contains(event.target) && !rail.contains(event.target) && !toggleLeft.contains(event.target)) setLeftVisible(false);
    });

    function setKeyboardVisible(visible) {
      state.keyboardVisible = visible;
      window.dispatchEvent(new CustomEvent("crescendo:keyboard-visibility", { detail: { visible } }));
      root.dataset.keyboardVisible = String(visible);
      keyboardToggle.setAttribute("aria-pressed", visible ? "true" : "false");
      syncInstrumentToggle();
      saveLayoutPreferences(state);
      window.dispatchEvent(new Event("resize"));
    }

    function activatePanel(panelId, options = {}) {
      const nextId = panels.has(panelId) ? panelId : "write";
      const clickedActive = state.activePanel === nextId;
      state.activePanel = nextId;
      leftPanel.dataset.panel = nextId;
      if (options.toggle && clickedActive) {
        setLeftVisible(!state.leftVisible);
      } else if (!options.preserveVisibility) {
        setLeftVisible(true);
      }
      panels.forEach((panel, id) => {
        const active = id === nextId;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
      navButtons.forEach((button, id) => {
        const active = id === nextId;
        button.classList.toggle("is-active", active && state.leftVisible);
        button.setAttribute("aria-expanded", String(active && state.leftVisible));
        button.tabIndex = 0;
      });
      const navItem = NAV_ITEMS.find((item) => item.id === nextId);
      leftHeading.querySelector("h2").textContent = navItem?.label || "Herramientas";
      leftPanel.setAttribute("aria-label", navItem?.label || "Herramientas");
      if (state.leftVisible) positionMenu();
      saveLayoutPreferences(state);
    }

    navButtons.forEach((button, panelId) => {
      button.addEventListener("click", () => activatePanel(panelId, { toggle: true }));
      button.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();activatePanel(panelId);
          [...panels.get(panelId).querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled])')].find(node=>node.getClientRects().length)?.focus();return;
        }
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const items = [...navButtons.values()];
        const index = items.indexOf(button);
        const nextIndex = event.key === "Home"
          ? 0
          : event.key === "End"
            ? items.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
        items[nextIndex].focus();
        if (state.leftVisible) activatePanel(items[nextIndex].dataset.panel);
      });
    });

    toggleLeft.addEventListener("click", () => setLeftVisible(!state.leftVisible));
    leftClose.addEventListener("click", () => { setLeftVisible(false);navButtons.get(state.activePanel)?.focus(); });
    leftPanel.addEventListener("focusout", event => {
      if (event.relatedTarget && !leftPanel.contains(event.relatedTarget) && !rail.contains(event.relatedTarget) && !toggleLeft.contains(event.relatedTarget)) setLeftVisible(false);
    });
    leftPanel.addEventListener("click", event => {
      if (event.target.closest("button")) setLeftVisible(false);
    });
    toggleRight.addEventListener("click", () => context.setRightVisible(!state.rightVisible));
    rightClose.addEventListener("click", () => context.setRightVisible(false));
    keyboardToggle.addEventListener("click", () => setKeyboardVisible(!state.keyboardVisible));
    scrim.addEventListener("click", () => {
      setLeftVisible(false);
      context.setRightVisible(false);
    });
    newDocumentButton.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("jml-editor-new-document"));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (state.leftVisible) {
        event.preventDefault();event.stopPropagation();setLeftVisible(false);
        navButtons.get(state.activePanel)?.focus();
      } else if (window.matchMedia("(max-width: 1180px)").matches && state.rightVisible) context.setRightVisible(false);
    }, true);

    function syncInputState() {
      const html = document.documentElement;
      const phase = html.dataset.inputPhase || "select";
      const voice = html.dataset.inputVoice || "1";
      const duration = html.dataset.inputDuration || "quarter";
      const grid = html.dataset.inputGrid || "eighth";
      const modeLabel = phase === "write"
        ? (html.dataset.inputChord === "true" ? "Acorde" : "Escritura")
        : phase === "edit"
          ? "Edición"
          : "Selección";
      document.getElementById("ipadStateMode").textContent = modeLabel;
      document.getElementById("ipadStateVoice").textContent = `Línea ${voice}`;
      document.getElementById("ipadStateDuration").textContent = DURATION_LABELS[duration] || duration;
      document.getElementById("ipadStateGrid").textContent = DURATION_LABELS[grid] || grid;
    }

    new MutationObserver(syncInputState).observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-input-phase",
        "data-input-voice",
        "data-input-duration",
        "data-input-grid",
        "data-input-chord"
      ]
    });

    const cursorSource = document.getElementById("cursorLabel");
    const syncCursor = () => {
      const text = cursorSource?.textContent?.trim() || "Selección · Compás 1";
      positionText.textContent = text;
    };
    if (cursorSource) {
      new MutationObserver(syncCursor).observe(cursorSource, { childList: true, subtree: true, characterData: true });
    }

    function updateDocumentState(detail = {}) {
      const title = String(detail.title || "Ejercicio sin título").trim() || "Ejercicio sin título";
      heading.querySelector("h1").textContent = title;
      documentSubtitle.textContent = detail.description || "Partitura editable";
      const dirty = detail.dirty === true;
      const storageError = detail.storageError === true;
      saveStatus.dataset.state = storageError ? "error" : detail.autosavePending ? "saving" : "saved";
      saveStatus.title = storageError ? "No se pudo guardar automáticamente" : detail.autosavePending ? "Guardando automáticamente…" : "Guardado automático en este navegador";
      saveStatus.setAttribute("aria-label",saveStatus.title);
      const changeCount = Number(detail.unsavedChangeCount) || 0;
      saveStatus.lastElementChild.textContent = "";
      documentState.textContent = storageError
        ? (detail.status || "El almacenamiento local no está disponible.")
        : "Guardado automático en este navegador. Puedes deshacer y rehacer los cambios.";
      if (detail.sceneMode) {
        root.dataset.sceneMode = detail.sceneMode;
      }
      if (detail.midiStatus) midiState.textContent = detail.midiStatus;
    }

    document.addEventListener("jml-editor-state", (event) => updateDocumentState(event.detail));
    const statusSource = document.getElementById("exerciseStatus");
    if (statusSource) {
      new MutationObserver(() => {
        const text = statusSource.textContent.trim();
        if (text) documentState.textContent = text;
      }).observe(statusSource, { childList: true, subtree: true, characterData: true });
    }

    activatePanel(state.activePanel, { preserveVisibility: true });
    setLeftVisible(state.leftVisible);
    context.setRightVisible(state.rightVisible);
    setKeyboardVisible(state.keyboardVisible);
    syncInputState();
    syncCursor();

    legacyMain.classList.add("is-ipad-shell-hidden");
    document.documentElement.dataset.ipadShell = "ready";
    window.dispatchEvent(new Event("resize"));

    return Object.freeze({
      root,
      activatePanel,
      setKeyboardVisible,
      setLeftVisible,
      setRightVisible: context.setRightVisible,
      updateDocumentState
    });
  }

  global.JMLScoreIpadShell = Object.freeze({ setup });
})(window);
