"""Run with: python3 -m unittest discover -s herramientas/aac/tests -p 'test_photo_references.py'."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

APP = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('references', APP / 'tools/preparar-referencias.py')
refs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(refs)


class ReferencePlanTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.index = json.loads(refs.INDEX.read_text())
        cls.melodies = json.loads((APP / 'Melodías/catalog.json').read_text())['examples']
        cls.plan = refs.plan(cls.index, cls.melodies)

    def test_every_indexed_song_and_continuation_page_is_accounted_for(self):
        sources = []
        for ref in self.plan:
            sources.append({'book': ref['book'], 'pdfStart': ref['pdfStart'], 'pdfEnd': ref['pdfEnd']})
            sources.extend(ref['otherEditions'])
            self.assertEqual([p['pdfPage'] for p in ref['pages']], list(range(ref['pdfStart'], ref['pdfEnd'] + 1)))
        self.assertEqual(len(sources), len(self.index['sources']))
        for book, meta in self.index['books'].items():
            rows = sorted((s for s in sources if s['book'] == book), key=lambda s: s['pdfStart'])
            covered = [p for s in rows for p in range(s['pdfStart'], s['pdfEnd'] + 1)]
            self.assertEqual(covered, list(range(meta['firstMusicPdfPage'], meta['pages'] + 1)))
            self.assertEqual(len(rows), {'berklee': 355, 'sixth': 400}[book])

    def test_duplicates_merge_but_distinct_compositions_survive(self):
        self.assertEqual(len(self.plan), 638)
        self.assertEqual(sum(len(r['otherEditions']) for r in self.plan), 117)
        for title in ['E.S.P', 'WOODYN’ YOU', 'ALL OF ME']:
            matches = [r for r in self.plan if refs.aliases(title).intersection(set().union(*(refs.aliases(a) for a in r['aliases'])))]
            self.assertEqual(len(matches), 1, title)
            self.assertEqual(len(matches[0]['otherEditions']), 1, title)
        for title in ['YESTERDAY', 'YESTERDAYS']:
            self.assertEqual(len([r for r in self.plan if title in r['aliases']]), 1)
        self.assertEqual(len([r for r in self.plan if r['title'].startswith('HUMPTY DUMPTY')]), 2)

    def test_original_five_images_and_their_editions_are_preserved(self):
        known = [m for m in self.melodies if m.get('sourceImage')]
        self.assertEqual(len(known), 5)
        for melody in known:
            ref = next(r for r in self.plan if r['id'] == melody['id'])
            self.assertEqual(ref['pages'][0]['image'], melody['sourceImage'])
            self.assertEqual(ref['pdfStart'], melody['pdfPage'])
            self.assertEqual(ref['sourceFile'], melody['sourceBook'])
            self.assertTrue(ref['pages'][0]['retainedOriginal'])

    def test_no_output_path_collisions_or_directory_escapes(self):
        paths = [p['image'] for r in self.plan for p in r['pages']]
        self.assertEqual(len(paths), len(set(paths)))
        for path in paths:
            self.assertTrue((APP / path).resolve().is_relative_to(refs.OUTPUT))

    def test_conflicting_source_pages_fail_before_extraction(self):
        broken = copy.deepcopy(self.index)
        broken['sources'].append(dict(broken['sources'][0]))
        with self.assertRaisesRegex(ValueError, 'Dos comienzos'):
            refs.plan(broken, self.melodies)

    def test_completed_library_matches_plan_and_image_bytes(self):
        catalog = json.loads((refs.OUTPUT / 'catalog.json').read_text())
        actual = copy.deepcopy(catalog['references'])
        for ref in actual:
            for page in ref['pages']:
                path = APP / page['image']
                self.assertEqual(refs.sha(path), page.pop('sha256'))
                self.assertEqual(refs.image_size(path), (page.pop('width'), page.pop('height')))
        self.assertEqual(actual, self.plan)
        self.assertEqual(catalog['summary']['referencePages'], 802)
        expected = {APP / p['image'] for r in self.plan for p in r['pages']}
        found = set((refs.OUTPUT / 'temas').rglob('*.jpg')) | set(refs.OUTPUT.glob('*.png'))
        self.assertEqual(found, expected)


if __name__ == '__main__':
    unittest.main()
