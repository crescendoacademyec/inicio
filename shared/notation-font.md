# Bravura in course examples and score engraving

- `concept-examples.css` loads the bundled Bravura OTF directly. Clefs, noteheads and accidentals use SMuFL code points; ordinary labels retain the interface font.
- The teaching keyboard uses eight white keys and five overlapping black keys. Its 0–12 labels count chromatic distance, including Mi–Fa and Si–Do.
- `opensheetmusicdisplay-1.8.4.min.js` is the existing OSMD distribution with its standard notation outlines regenerated from that same Bravura OTF. SVG paths therefore retain their design on computers without Bravura installed. The engraving engine and MusicXML input are unchanged.
- `tools/bravura-vexflow-map.json` maps the engine's legacy glyph IDs to official SMuFL code points (https://github.com/w3c/smufl/blob/gh-pages/metadata/glyphnames.json). The mapping covers standard clefs, meter digits, noteheads, accidentals, flags, rests, articulations, dynamics, ornaments and navigation symbols. Unmapped specialist legacy/percussion symbols are retained for compatibility.
- The shared engine is loaded locally by the courses, ear training and virtual instruments, including the metronome's imported-score viewer. Crescendo Editor and the metronome's exercise editor already use bundled Bravura.

Regenerate after changing the OTF or mapping (Python with FontTools):

```sh
python tools/build-bravura-engraving.py
```

The generated bundle includes the source OTF SHA256. Regeneration is deterministic and needs no network access. Bravura is licensed under SIL OFL 1.1; see `Bravura-LICENSE.txt`. OSMD/VexFlow retain their existing licenses.

Manual visual check: `auditorias/2026-10-19/bravura-regression.html` compares treble/bass clefs, 4/4 and 3/4, accidentals, flags, rests and the direct OTF renderer.
