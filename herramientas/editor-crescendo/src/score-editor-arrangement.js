(function (root) {
  'use strict';
  const natural = [0, 2, 4, 5, 7, 9, 11];
  const mod = (n, d) => ((n % d) + d) % d;
  function midi(diatonicStep, alter = 0) {
    return 60 + Math.floor(diatonicStep / 7) * 12 + natural[mod(diatonicStep, 7)] + alter;
  }
  function transpose(note, from, to) {
    const diatonicStep = note.diatonicStep + (from.diatonic || 0) - (to.diatonic || 0);
    const target = midi(note.diatonicStep, note.alter || 0) + (from.transpose || 0) - (to.transpose || 0);
    return { ...note, diatonicStep, alter: target - midi(diatonicStep) };
  }
  // Rank is applied independently at every rhythmic event. A missing rank is
  // silence, never a duplicated last note. Written voices remain independent.
  function extract(items, { mode = 'high', rank = 1, voice = 1, selected = null } = {}) {
    const chosen = selected && new Map(selected.map(ref => [ref.entryId, new Set(selected.filter(r => r.entryId === ref.entryId).map(r => r.staffStep))]));
    return items.filter(item => (item.voice || 1) === voice).map(item => {
      let notes = [...item.notes].sort((a, b) => midi(b.diatonicStep, b.alter) - midi(a.diatonicStep, a.alter));
      if (mode === 'low') notes.reverse();
      if (mode === 'selected') notes = notes.filter(note => chosen?.get(item.entry.id)?.has(note.staffStep));
      else if (mode !== 'voice') notes = notes.slice(Math.max(0, rank - 1), Math.max(0, rank - 1) + 1);
      const tied = notes.some(note => item.entry.tieToNext && note.staffStep === (item.entry.tieStaffStep ?? item.entry.staffStep ?? item.notes[0]?.staffStep));
      return { ...item, notes, tieToNext: tied };
    });
  }
  function conflicts(items, targets, voice = 1) {
    return targets.filter(target => target.entry.type === 'note' && (target.voice || 1) === voice && items.some(item => item.measureIndex === target.measureIndex && item.entry.tickStart < target.entry.tickStart + target.entry.ticks - 1e-7 && target.entry.tickStart < item.entry.tickStart + item.entry.ticks - 1e-7));
  }
  function remapReferences(state, before, after) {
    const indices = new Map(after.map((system, i) => [system.id, i]));
    for (const key of ['marks', 'textItems']) state[key] = (state[key] || []).flatMap(item => {
      if (item.systemIndex == null) return [item];
      const next = indices.get(before[item.systemIndex]?.id);
      return next == null ? [] : [{ ...item, systemIndex: next }];
    });
  }
  function mount(options) {
    const I = root.JMLScoreInstruments, host = document.getElementById('ipad-panel-instruments') || document.body;
    function node(tag, text, className) { const n = document.createElement(tag); if (text) n.textContent = text; if (className) n.className = className; return n; }
    function button(text, action, parent, className) { const b = node('button', text, className); b.type = 'button'; b.onclick = action; parent?.append(b); return b; }
    function field(label, control, parent) { const n = node('label', null, 'arrangement-field'); control.setAttribute('aria-label',label); n.append(node('span', label), control); parent.append(n); return control; }
    function select(choices, value) { const n = node('select'); for (const [id, text] of choices) { const opt = node('option', text); opt.value = id; n.append(opt); } n.value = String(value); return n; }
    function instrumentSelect(value) { return select(Object.entries(I.instruments).map(([id, sound]) => [id, sound.name]), value); }
    function input(value = '') { const n = node('input'); n.value = value; n.maxLength = 100; return n; }
    function dialog(title) {
      const d = node('dialog', null, 'arrangement-dialog'); d.setAttribute('aria-label', title);
      const header = node('header'); header.append(node('h2', title)); button('Cerrar', () => d.close(), header);
      const body = node('div', null, 'arrangement-body'), status = node('p', '', 'arrangement-status'); status.setAttribute('role', 'status');
      d.append(header, body, status); document.body.append(d); d.addEventListener('close', () => d.remove());
      d.addEventListener('keydown', e => e.stopPropagation()); d.addEventListener('pointerdown', e => e.stopPropagation());
      d.showModal(); return { d, body, status };
    }
    function roster() {
      const { body, status } = dialog('Instrumentos de la partitura');
      body.append(node('p', 'Añade instrumentos y elige el pentagrama donde quieres escribir. Cada uno conserva su propio sonido.'));
      const add = node('div', null, 'arrangement-add'), sound = field('Instrumento nuevo', instrumentSelect('violin'), add), name = field('Nombre en la partitura', input('Violín'), add);
      sound.onchange = () => { name.value = I.instruments[sound.value].name; };
      button('Añadir instrumento', () => { options.add(sound.value, name.value); draw(); status.textContent = 'Instrumento añadido. Puedes añadir otro.'; }, add);
      const start=button('Comenzar solo con este instrumento',()=>{options.start(sound.value,name.value);draw();status.textContent='Instrumento inicial listo.';},add);
      start.disabled=!options.empty();start.title='Disponible cuando la partitura aún no contiene notas.';
      body.append(add);
      const list = node('div', null, 'arrangement-roster'); body.append(list);
      function draw() {
        list.replaceChildren();
        options.systems().forEach((system, index) => {
          const row = node('div', null, 'arrangement-staff'); row.dataset.staffId = system.id;
          button(`${index + 1} · ${system.name || I.instruments[I.normalize(system.instrumentId)].name}`, () => { options.activate(index); draw(); }, row, options.active() === index ? 'is-active' : '');
          const rename = field('Nombre', input(system.name || I.instruments[I.normalize(system.instrumentId)].name), row); rename.onchange = () => options.change(index, { name: rename.value });
          const instrument = field('Sonido', instrumentSelect(system.instrumentId), row); instrument.onchange = () => { options.change(index, { instrumentId: instrument.value }); draw(); };
          const mute = node('input'); mute.type = 'checkbox'; mute.checked = !!system.muted; field('Silenciar', mute, row); mute.onchange = () => options.change(index, { muted: mute.checked });
          for (const [text, delta] of [['↑', -1], ['↓', 1]]) { const b = button(text, () => { options.move(index, delta); draw(); }, row); b.title = delta < 0 ? 'Subir pentagrama' : 'Bajar pentagrama'; b.disabled = index + delta < 0 || index + delta >= options.systems().length; }
          const remove = button('Quitar', async () => { if (await options.remove(index)) draw(); }, row); remove.disabled = options.systems().length <= 1;
          list.append(row);
        });
      }
      draw();
    }
    function distribute() {
      const { d, body, status } = dialog('Enviar voces a instrumentos');
      const sourceIndex = options.active(), source = options.systems()[sourceIndex];
      body.append(node('p', `Origen: ${source.name || I.instruments[I.normalize(source.instrumentId)].name}. La voz 1 es la nota más aguda o más grave de cada acorde, según el orden elegido. La copia conserva el ritmo; si falta esa nota, escribe silencio.`));
      const settings = node('div', null, 'arrangement-settings'); body.append(settings);
      const scope = field('Tramo', select([['selection', 'Selección actual'], ['all', 'Todo el pentagrama']], options.hasSelection() ? 'selection' : 'all'), settings);
      const mode = field('Separar por', select([['high', 'Altura: de agudo a grave'], ['low', 'Altura: de grave a agudo'], ['voice', 'Voz escrita completa (L1–L4)'], ['selected', 'Cabezas de nota seleccionadas']], 'high'), settings);
      const sourceVoice = field('Voz escrita de origen', select([1,2,3,4].map(n => [n, `L${n}`]), options.voice()), settings);
      const mappings = node('div', null, 'arrangement-mappings'); body.append(mappings);
      let rows = [];
      function addRow(instrumentId = 'violin', ordinal = rows.length + 1) {
        const row = node('div', null, 'arrangement-mapping');
        const rank = node('input'); rank.type = 'number'; rank.min = 1; rank.max = 128; rank.value = ordinal; field('Nota nº', rank, row);
        const target = field('Destino', select([['new', 'Nuevo instrumento'], ...options.systems().flatMap((s, index) => index !== sourceIndex ? [[index, s.name || `Pentagrama ${index + 1}`]] : [])], 'new'), row);
        const sound = field('Instrumento', instrumentSelect(instrumentId), row), name = field('Nombre', input(I.instruments[instrumentId].name), row);
        sound.onchange = () => { name.value = I.instruments[sound.value].name; };
        target.onchange = () => { sound.disabled = name.disabled = target.value !== 'new'; };
        const data = { row, rank, target, sound, name }; rows.push(data); mappings.append(row);
        button('×', () => { rows = rows.filter(r => r !== data); row.remove(); }, row).setAttribute('aria-label', 'Quitar destino');
      }
      const actions = node('div', null, 'arrangement-actions'); body.append(actions);
      button('Añadir destino', () => addRow(), actions);
      button('Cuarteto de cuerdas', () => { mappings.replaceChildren(); rows = []; ['violin','violin','viola','cello'].forEach((id, i) => addRow(id, i + 1)); rows[0].name.value='Violín I';rows[1].name.value='Violín II'; }, actions);
      button('Sección de metales', () => { mappings.replaceChildren(); rows = []; ['trumpet','trumpet','trombone','trombone'].forEach((id, i) => addRow(id, i + 1)); rows.forEach((row,i)=>{row.name.value=['Trompeta I','Trompeta II','Trombón I','Trombón II'][i];}); }, actions);
      const replace = node('input'); replace.type = 'checkbox'; field('Reemplazar notas existentes en el destino dentro del tramo enviado', replace, body);
      const mute = node('input'); mute.type = 'checkbox'; field('Silenciar el piano o instrumento de origen después de copiar', mute, body);
      button('Copiar voces a los instrumentos', async () => {
        try {
          if (!rows.length) throw Error('Añade al menos un destino.');
          const result = await options.distribute({ sourceIndex, scope: scope.value, mode: mode.value, voice: Number(sourceVoice.value), replace: replace.checked, mute: mute.checked, rows: rows.map(r => ({ rank: Number(r.rank.value), target: r.target.value === 'new' ? null : Number(r.target.value), instrumentId: r.sound.value, name: r.name.value })) });
          if (result) d.close();
        } catch (error) { status.textContent = error.message; }
      }, body, 'arrangement-submit');
      addRow();
    }
    function mixer() {
      const { d, body } = dialog('Consola de canales');
      d.addEventListener('close',()=>options.previewMix?.([],{}));
      body.append(node('p', 'M silencia el instrumento. S deja escuchar solo los instrumentos marcados; puedes activar varios solos a la vez.'));
      const transport = node('div', null, 'arrangement-actions');
      button('Reproducir / pausa', options.play, transport); button('Detener', options.stop, transport); body.append(transport);
      const list = node('div', null, 'arrangement-mixer'); body.append(list);
      function draw() {
        list.replaceChildren(); const systems = options.systems(), parts = new Map();
        systems.forEach((system,index)=>{const key=system.partId||system.id;if(!parts.has(key))parts.set(key,[]);parts.get(key).push(index);});
        for(const indices of parts.values()){
          const index=indices[0],system=systems[index],row=node('section',null,'arrangement-channel');
          row.classList.toggle('is-muted',!I.audible(system,systems));
          row.append(node('h3',system.name||I.instruments[I.normalize(system.instrumentId)].name));
          row.append(node('p',I.instruments[I.normalize(system.instrumentId)].name));
          const toggles=node('div',null,'arrangement-actions');row.append(toggles);
          for(const [key,label,title]of [['muted','M','Silenciar instrumento'],['solo','S','Solo del instrumento']]){
            const b=button(label,()=>{options.mix(indices,{[key]:!system[key]});draw();},toggles,system[key]?'is-active':'');b.title=title;b.setAttribute('aria-label',title+' · '+(system.name||'instrumento'));b.setAttribute('aria-pressed',String(!!system[key]));
          }
          const volume=node('input');volume.type='range';volume.min=0;volume.max=100;volume.step=1;volume.value=system.volume??80;
          const output=node('output',volume.value+'%');field('Volumen',volume,row);row.append(output);
          volume.oninput=()=>{output.textContent=volume.value+'%';options.previewMix?.(indices,{volume:Number(volume.value)});};
          volume.onchange=()=>options.mix(indices,{volume:Number(volume.value)});
          list.append(row);
        }
      }
      button('Desactivar todos los solos',()=>{options.mix(options.systems().map((_,i)=>i),{solo:false});draw();},transport);draw();
    }
    button('Instrumentos de la partitura…', roster, host, 'ipad-primary-action');
    button('Enviar voces a instrumentos…', distribute, host, 'ipad-primary-action');
    button('Consola de canales…', mixer, host, 'ipad-primary-action');
    return { roster, distribute, mixer };
  }
  const api = { midi, transpose, extract, conflicts, remapReferences, mount };
  if (typeof module !== 'undefined') module.exports = api; else root.JMLScoreArrangement = api;
})(typeof window === 'undefined' ? globalThis : window);
