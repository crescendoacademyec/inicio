"""Replace OSMD 1.8.4's embedded standard notation outlines with bundled Bravura.
Requires fonttools. Run from the repository root; output is committed, no runtime dependency.
The VexFlow legacy identifiers are mapped to official SMuFL glyphs in the adjacent JSON.
Unmapped legacy specialist/percussion identifiers remain available for compatibility.
"""
import json
import hashlib
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / 'shared/opensheetmusicdisplay-1.8.4.min.js'
FONT = ROOT / 'herramientas/editor-crescendo/assets/fonts/Bravura.otf'
# VexFlow uses 38pt at 10px staff spacing; Bravura uses 250 units per space.
SCALE = 10 / (72 * 38 / (100 * 1000) * 250)
class OutlinePen(BasePen):
    def __init__(self, glyphs, scale=SCALE, y_offset=0):
        super().__init__(glyphs); self.commands = []; self.scale = scale; self.y_offset = y_offset
    def emit(self, command, *points):
        self.commands.append(command + ' ' + ' '.join(str(round((v + (self.y_offset if axis else 0)) * self.scale, 4)) for point in points for axis, v in enumerate(point)))
    def _moveTo(self, p): self.emit('m', p)
    def _lineTo(self, p): self.emit('l', p)
    # VexFlow stores endpoints before the control points.
    def _curveToOne(self, p1, p2, p3): self.emit('b', p3, p1, p2)
    def _qCurveToOne(self, p1, p2): self.emit('q', p2, p1)
    def _closePath(self):
        if self._getCurrentPoint() != self.start: self.emit('l', self.start)
    def moveTo(self, p): self.start = p; super().moveTo(p)
    def _endPath(self): pass

source = TARGET.read_text()
start = source.index('const u={"glyphs":') + len('const u=')
end = source.index(';function d(', start)
# The distributed bundle stores this font block as JSON for repeatable builds.
legacy = json.loads(source[start:end])
font = TTFont(FONT)
glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
mapping = json.loads((ROOT / 'tools/bravura-vexflow-map.json').read_text())
for legacy_id, info in mapping.items():
    glyph = glyphs[cmap[int(info['codepoint'], 16)]]
    # SMuFL digits are centred on the origin; legacy VexFlow places them
    # from a baseline. Its meter uses 40pt, other music symbols use 38pt.
    digit = info['name'].startswith('timeSig') and info['name'][7:].isdigit()
    scale = 10 / (72 * 40 / (100 * 1000) * 250) if digit else SCALE
    pen = OutlinePen(glyphs, scale=scale, y_offset=250 if digit else 0); glyph.draw(pen)
    bounds = BoundsPen(glyphs); glyph.draw(bounds)
    xmin, ymin, xmax, ymax = bounds.bounds
    legacy['glyphs'][legacy_id] = {'x_min':round(xmin*scale,4), 'x_max':round(xmax*scale,4), 'ha':round(glyph.width*scale,4), 'o':' '.join(pen.commands)+' '}
legacy['familyName'] = 'Bravura (SMuFL; VexFlow legacy encoding)'
source = source[:start] + json.dumps(legacy, separators=(',',':')) + source[end:]
source = source.replace('DefaultVexFlowNoteFont="gonville"','DefaultVexFlowNoteFont="bravura"')
marker = '/* Standard notation outlines: bundled Bravura, SIL OFL 1.1; regenerate with tools/build-bravura-engraving.py. */\n'
source = __import__('re').sub(r'/\* Bravura source SHA256: [a-f0-9]+ \*/\n', '', source)
source = '/* Bravura source SHA256: ' + hashlib.sha256(FONT.read_bytes()).hexdigest() + ' */\n' + source
if marker not in source: source = marker + source
TARGET.write_text(source)
print(f'Embedded {len(mapping)} Bravura glyphs.')
