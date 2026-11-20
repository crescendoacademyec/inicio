#!/usr/bin/env python3
"""Resumable, local source inventory for AAC. Source discovery is not melody approval."""
from __future__ import annotations

import argparse
import collections
import difflib
import hashlib
import json
import re
import unicodedata
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
PRIVATE = APP / 'private-pilot'
BOOKS = {
    'berklee': {'filename': 'Berklee Real Book.pdf', 'offset': 1, 'toc': range(5, 11)},
    'sixth': {'filename': 'Real-book-sixth-edition.pdf', 'offset': -1, 'toc': range(3, 9)},
}


def normalized(value):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', str(value)).encode('ascii', 'ignore').decode().lower())


def aliases(value):
    """Keep translations/alternate titles, without merging different compositions."""
    value = re.sub(r'\s+', ' ', value).strip(' .·_')
    variants = {value}
    parens = re.findall(r'\(([^)]+)\)', value)
    variants.update(parens)
    variants.add(re.sub(r'\([^)]*\)', '', value))
    for item in tuple(variants):
        if re.match(r'^the\s+', item, re.I):
            variants.add(re.sub(r'^the\s+', '', item, flags=re.I))
    return {normalized(item) for item in variants if len(normalized(item)) > 2}


def ocr_rows(observations):
    """Pair each TOC title with its page column by geometry, not OCR reading order."""
    result = []
    for side in (0, 1):
        lines = [line for line in observations if (line['x'] >= .51) == bool(side)]
        groups = []
        for line in sorted(lines, key=lambda item: -(item['y'] + item['height'] / 2)):
            center = line['y'] + line['height'] / 2
            group = next((g for g in reversed(groups) if abs(g['center'] - center) < .006), None)
            if group is None:
                group = {'center': center, 'lines': []}
                groups.append(group)
            group['lines'].append(line)
        for group in groups:
            items = sorted(group['lines'], key=lambda item: item['x'])
            result.append({'text': ' '.join(item['text'] for item in items),
                           'confidence': min(item.get('confidence', 0) for item in items),
                           'column': side, 'y': group['center'], 'x': items[0]['x']})
    return result


def parse_toc(rows, first_page=10, last_page=500):
    records, pending = [], []
    previous, pending_x = None, None
    for row in rows:
        if previous and ('column' in row and row.get('column') != previous.get('column') or
                         'y' in row and abs(row['y'] - previous.get('y', row['y'])) > .028):
            pending = []
        previous = row
        text = re.sub(r'\s+', ' ', row['text']).strip()
        if not text or re.fullmatch(r'[A-Z](?:\s+[Cc]ont\.?)?', text) or 'brought to you' in text.lower():
            pending = []
            continue
        if normalized(text) in {'therealbook', 'realbook', 'berkleerealbook'}:
            pending = []
            continue
        match = re.search(r'[\s.·_]+(\d{1,3})\s*$', text)
        if match is None and re.fullmatch(r'\d{1,3}', text):
            match = re.fullmatch(r'(\d{1,3})', text)
        if match:
            page = int(match.group(1))
            fragment = text[:match.start()].strip(' .·_')
            if pending and 'x' in row and pending_x is not None and row['x'] < pending_x + .012 and not fragment.startswith('('):
                pending = []
            title = ' '.join([*pending, fragment]).strip(' .·_')
            if first_page <= page <= last_page and len(normalized(title)) >= 3:
                records.append({'title': title, 'printedPage': page,
                                'indexConfidence': row.get('confidence', 1), 'rawIndexLine': text})
            pending = []
        else:
            # A wrapped title has at most a few lines. Do not concatenate a damaged whole column.
            if 'x' in row and pending_x is not None and row['x'] < pending_x + .012:
                pending = []
            pending = (pending + [text.strip(' .·_')])[-3:]
            pending_x = row.get('x')
    return records


def source_aliases(source):
    parts = re.split(r'\s+[–—-]\s+', source['title'], maxsplit=1)
    return aliases(parts[0]), parts[1] if len(parts) > 1 else ''


def add_spans(records, book, page_count):
    pages = sorted({record['printedPage'] for record in records})
    result = []
    for record in records:
        start = record['printedPage'] + BOOKS[book]['offset']
        next_page = next((page for page in pages if page > record['printedPage']), None)
        end = min(page_count, next_page + BOOKS[book]['offset'] - 1) if next_page else page_count
        if not 1 <= start <= end <= page_count:
            continue
        keys, composer_hint = source_aliases(record)
        result.append({**record, 'id': f'{book}-{start:04d}', 'book': book, 'pdfStart': start,
                       'pdfEnd': end, 'titleKeys': sorted(keys), 'composerHint': composer_hint,
                       'spanNeedsReview': end - start > 5})
    return result


def candidates_for(item, sources):
    keys = aliases(item['title'])
    exact = [source for source in sources if keys.intersection(source['titleKeys'])]
    composer = normalized(item.get('composer', ''))
    exact = [source for source in exact if not source['composerHint'] or
             normalized(source['composerHint']) in composer or composer in normalized(source['composerHint'])]
    if exact:
        counts = collections.Counter(source['book'] for source in exact)
        ambiguous = any(count > 1 for count in counts.values())
        return ('ambiguous-source' if ambiguous else 'source-located'), exact
    possible = []
    for source in sources:
        score = max((difflib.SequenceMatcher(None, a, b).ratio() for a in keys for b in source['titleKeys']
                     if a[:1] == b[:1] and min(len(a), len(b)) / max(len(a), len(b)) > .7), default=0)
        if score >= .88:
            possible.append({**source, 'similarity': round(score, 4)})
    return ('possible-source', sorted(possible, key=lambda item: -item['similarity'])[:4]) if possible else ('source-missing', [])


def build_manifest(index, sources, pilot):
    rows = []
    for item in index:
        status, candidates = candidates_for(item, sources)
        known = next((p for p in pilot if aliases(p['title']).intersection(aliases(item['title']))), None)
        if known:
            status = 'reviewed-head'
        selected = next((s for s in candidates if known and BOOKS[s['book']]['filename'] == known['sourceBook']
                         and s['pdfStart'] == known['pdfPage']), None)
        if selected is None and status == 'source-located':
            selected = sorted(candidates, key=lambda s: (s['book'] != 'berklee', s['spanNeedsReview'], s['pdfStart']))[0]
        rows.append({**item, 'id': hashlib.sha256(item['path'].encode()).hexdigest()[:16],
                     'status': status, 'melodyReady': bool(known), 'selectedSource': selected['id'] if selected else None,
                     'sourceCandidates': [s['id'] for s in candidates],
                     'possibleMatches': [{'source': s['id'], 'similarity': s['similarity']} for s in candidates if 'similarity' in s],
                     **({'pilotId': known['id'], 'musicxml': known['musicxml'], 'scope': known.get('checkSummary', '')} if known else {})})
    return {'schema': 'aac-melody-library-v1', 'entries': rows,
            'summary': {'entries': len(rows), 'melodiesReady': sum(r['melodyReady'] for r in rows),
                        'statuses': dict(collections.Counter(row['status'] for row in rows))}}


def inventory(args):
    from pypdf import PdfReader
    destination = Path(args.output)
    destination.mkdir(parents=True, exist_ok=True)
    sources, books = [], []
    ocr = {}
    for file in args.sixth_ocr:
        for line in Path(file).read_text().splitlines():
            record = json.loads(line)
            page = int(re.search(r'(\d+)\.png$', record['file']).group(1))
            if record.get('error'):
                raise RuntimeError(f'OCR page {page}: {record["error"]}')
            ocr[page] = record
    for key, config in BOOKS.items():
        path = Path(args.books) / config['filename']
        reader = PdfReader(path)
        records = []
        for page in config['toc']:
            if key == 'berklee':
                text = reader.pages[page - 1].extract_text() or ''
                rows = [{'text': line, 'confidence': 1} for line in text.splitlines()]
            else:
                if page not in ocr:
                    raise RuntimeError(f'Missing OCR for sixth-edition index page {page}')
                rows = ocr_rows(ocr[page]['lines'])
            records.extend({**record, 'indexPdfPage': page} for record in parse_toc(rows, last_page=len(reader.pages) + 1))
        seen = set()
        records = [r for r in records if not ((r['title'], r['printedPage']) in seen or seen.add((r['title'], r['printedPage'])))]
        sources.extend(add_spans(records, key, len(reader.pages)))
        books.append({'id': key, 'filename': config['filename'], 'path': str(path), 'pages': len(reader.pages),
                      'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'indexTitles': len(records)})
    pilot = json.loads((PRIVATE / 'catalog.json').read_text())['examples']
    index = json.loads((APP / 'data/library-index.json').read_text())
    manifest = build_manifest(index, sources, pilot)
    manifest['books'] = books
    write_json(destination / 'sources.json', {'books': books, 'sources': sources})
    write_json(destination / 'manifest.json', manifest)
    for status in ('source-missing', 'possible-source', 'ambiguous-source'):
        lines = ['Título\tCompositor\tArchivo AAC']
        lines.extend('\t'.join([row['title'], row.get('composer', ''), row['path']]) for row in manifest['entries'] if row['status'] == status)
        (destination / f'{status}.tsv').write_text('\n'.join(lines) + '\n')
    print(json.dumps({'books': books, **manifest['summary']}, ensure_ascii=False, indent=2))


def write_json(path, value):
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    command = sub.add_parser('inventory')
    command.add_argument('--books', default=str(Path.home() / 'Desktop'))
    command.add_argument('--sixth-ocr', nargs='+', required=True)
    command.add_argument('--output', default=str(PRIVATE / 'library'))
    command.set_defaults(run=inventory)
    args = parser.parse_args()
    args.run(args)


if __name__ == '__main__':
    main()
