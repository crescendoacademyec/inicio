# Instrument selection in the four courses

`CourseSound` stores a shared Piano / Guitarra / Bajo preference in localStorage, exposes the selected SoundFont player and renders an accessible black dropdown. Existing course playback engines keep their timing, voicings and cancellation logic; Jazz playback now follows the selected timbre instead of overriding it with a legacy guitar argument.

`CourseInstruments` connects that selection to the teaching diagrams:

- New concept scores carry their exact MIDI pitches, spelling and diatonic positions as escaped `data-ci-source` metadata.
- Existing OpenSheetMusicDisplay scores supply pitches through their MusicXML, including flats and sharps.
- Existing piano renderers annotate their own pitches for examples without MusicXML.
- The adapter preserves existing piano/guitar diagrams and event handlers, adds missing views, and hides only instrument views. Score panels stay visible. Legacy real guitar voicings and inversion controls remain available.
- Four-string bass diagrams use standard E1–A1–D2–G2 tuning. Fret maps show pitch classes; clicking a position sounds its actual register. Piano keys retain the exact MIDI register of the score.
- Instrument-specific maps in chromatic reading, reharmonization and Baga voicings follow the same preference. Redundant reharmonization view buttons were removed.
- Production has instrument examples in frequency/register, MIDI and sampling lessons. Its technical waveform/DSP demonstrations retain their instructional signals.

Menus in the five string instrument apps share the black/gold `string-sound-menu.css`; Piano Virtual also shows its selected instrument name and a black menu.

Validation: the course regression suite and instrument/SoundFont tests pass (60 tests), plus Piano Virtual's dependency/unique-ID validation. Browser checks covered all three instruments in Functional's chord explorer and Reading's scale lab, transposition to D, Jazz's instrument lab and Baga voicings, chromatic reading, Production's MIDI example, and the black menus in Diapasón and Piano Virtual.
