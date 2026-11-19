#!/usr/bin/env python3
"""Extract complete, deduplicated Real Book reference images; never edits melodies."""
import argparse, collections, hashlib, json, re, shutil, struct, subprocess, sys, unicodedata
from pathlib import Path
APP=Path(__file__).resolve().parents[1]
INDEX=APP/'data/realbook-reference-index.json'
OUTPUT=APP/'Melodías/referencias'

def normalized(value):
 text=unicodedata.normalize('NFKD',value).encode('ascii','ignore').decode().lower()
 key=re.sub('[^a-z0-9]','',text)
 return {'woodynyou':'woodyyou'}.get(key,key)
def aliases(title):
 values={title,re.sub(r'\([^)]*\)','',title),*re.findall(r'\(([^)]+)\)',title)}
 for value in tuple(values): values.add(re.sub(r'^(the|a|an)\s+','',value,flags=re.I))
 return {normalized(v) for v in values if len(normalized(v))>=3}
def slug(title):
 value=unicodedata.normalize('NFKD',title).encode('ascii','ignore').decode().lower()
 return re.sub('[^a-z0-9]+','-',value).strip('-')
def sha(path):
 h=hashlib.sha256()
 with path.open('rb') as stream:
  for chunk in iter(lambda:stream.read(1024*1024),b''):h.update(chunk)
 return h.hexdigest()
def image_size(path):
 data=path.read_bytes()
 if data.startswith(b'\x89PNG\r\n\x1a\n'):return struct.unpack('>II',data[16:24])
 if not data.startswith(b'\xff\xd8') or not data.endswith(b'\xff\xd9'):raise ValueError('Imagen incompleta: '+str(path))
 pos=2
 while pos<len(data):
  if data[pos]!=255:pos+=1;continue
  while data[pos]==255:pos+=1
  marker=data[pos];pos+=1
  if marker in (0xd8,0xd9,0x01) or 0xd0<=marker<=0xd7:continue
  length=struct.unpack('>H',data[pos:pos+2])[0]
  if marker in [0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]:
   height,width=struct.unpack('>HH',data[pos+3:pos+7]);return width,height
  pos+=length
 raise ValueError('JPEG sin dimensiones: '+str(path))
def plan(index,melodies):
 sources=[]
 for book,meta in index['books'].items():
  rows=sorted((dict(row) for row in index['sources'] if row['book']==book),key=lambda r:r['pdfStart'])
  if len({r['pdfStart'] for r in rows})!=len(rows):raise ValueError('Dos comienzos en la misma página de '+book)
  if rows[0]['pdfStart']!=meta['firstMusicPdfPage']:raise ValueError('Falta el primer tema de '+book)
  for i,row in enumerate(rows):
   row['pdfEnd']=rows[i+1]['pdfStart']-1 if i+1<len(rows) else meta['pages']
   if not 1<=row['pdfStart']<=row['pdfEnd']<=meta['pages']:raise ValueError('Rango de páginas incorrecto')
   if row['pdfEnd']-row['pdfStart']>5:raise ValueError('Rango sospechosamente largo: '+row['title'])
   sources.append(row)
 groups=[]
 for row in sources:
  keys=aliases(row['title']);matches=[g for g in groups if g['keys']&keys]
  if len(matches)>1:raise ValueError('Correspondencia ambigua: '+row['title'])
  if matches:
   group=matches[0]
   if any(s['book']==row['book'] for s in group['sources']):raise ValueError('Homónimos dentro de un libro: '+row['title'])
   group['sources'].append(row);group['keys']|=keys
  else:groups.append({'sources':[row],'keys':set(keys)})
 references=[];used=set()
 for group in groups:
  candidates=group['sources'];known=next((m for m in melodies if m.get('sourceImage') and any(index['books'][s['book']]['filename']==m.get('sourceBook') and s['pdfStart']==m.get('pdfPage') for s in candidates)),None)
  selected=next((s for s in candidates if known and index['books'][s['book']]['filename']==known.get('sourceBook') and s['pdfStart']==known.get('pdfPage')),None) or sorted(candidates,key=lambda s:(s['book']!='berklee',s['pdfStart']))[0]
  identifier=known['id'] if known else slug(selected['title'])
  if identifier in used:identifier+='-'+selected['book']
  if identifier in used:raise ValueError('Identificador duplicado: '+identifier)
  used.add(identifier)
  pages=[]
  for offset,number in enumerate(range(selected['pdfStart'],selected['pdfEnd']+1)):
   image=known['sourceImage'] if offset==0 and known else f'Melodías/referencias/temas/{identifier}/pagina-{offset+1:02d}.jpg'
   pages.append({'pdfPage':number,'printedPage':number-index['books'][selected['book']]['printedToPdfOffset'],'image':image,'retainedOriginal':bool(offset==0 and known)})
  references.append({'id':identifier,'title':known['title'] if known else selected['title'],'aliases':sorted({s['title'] for s in candidates}),
                     'book':selected['book'],'sourceFile':index['books'][selected['book']]['filename'],'sourceSHA256':index['books'][selected['book']]['sha256'],
                     'pdfStart':selected['pdfStart'],'pdfEnd':selected['pdfEnd'],'printedPage':selected['printedPage'],'indexPdfPage':selected['indexPdfPage'],
                     'pages':pages,'otherEditions':[s for s in candidates if s is not selected],
                     'editionNote':'Foto de referencia del libro indicado; debe contrastarse con la edición XML/MEI antes de vincularla como su fuente.'})
 return sorted(references,key=lambda r:normalized(r['title']))
def save(path,data):
 tmp=path.with_suffix(path.suffix+'.tmp');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');tmp.replace(path)
def markdown(references):
 lines=['# Referencias fotográficas de los Real Books','','Una entrada por obra; las continuaciones permanecen juntas. Las ediciones duplicadas se registran en el catálogo, sin repetir sus imágenes.','','Estas fotos son referencias para la revisión futura de XML/MEI. No certifican que una partitura digital proceda de la misma edición.','','| Tema | Libro | Página impresa | Imágenes |','| --- | --- | --- | --- |']
 for ref in references:
  links=[]
  for i,page in enumerate(ref['pages']):
   relative=page['image'].split('Melodías/referencias/',1)[1];links.append(f'[{i+1}]({relative})')
  title=ref['title'].replace('|','\\|');lines.append(f"| {title} | {'Berklee' if ref['book']=='berklee' else 'Sexta edición'} | {ref['printedPage']} | {' · '.join(links)} |")
 return '\n'.join(lines)+'\n'
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--books',type=Path,default=Path.home()/'Desktop');parser.add_argument('--dpi',type=int,default=180);parser.add_argument('--dry-run',action='store_true');parser.add_argument('--check',action='store_true');args=parser.parse_args()
 index=json.loads(INDEX.read_text());melodies=json.loads((APP/'Melodías/catalog.json').read_text())['examples'];references=plan(index,melodies)
 summary={'indexedSources':len(index['sources']),'uniqueThemes':len(references),'duplicateEditions':sum(len(r['otherEditions']) for r in references),'referencePages':sum(len(r['pages']) for r in references),'preservedInitialImages':sum(p['retainedOriginal'] for r in references for p in r['pages'])}
 if args.dry_run:print(json.dumps(summary,ensure_ascii=False));return
 if not args.check:
  if not shutil.which('pdftoppm'):raise ValueError('Se necesita Poppler (pdftoppm)')
  for book in index['books'].values():
   source=args.books/book['filename']
   if sha(source)!=book['sha256']:raise ValueError('El PDF no corresponde al índice: '+source.name)
 recordPath=OUTPUT/'catalog.json';previous=json.loads(recordPath.read_text()) if recordPath.exists() else {}
 previousPages={p['image']:(r,p) for r in previous.get('references',[]) for p in r['pages']}
 rendering={'dpi':args.dpi,'format':'jpeg','quality':90,'cropBox':True}
 completed=0
 for ref in references:
  for page in ref['pages']:
   target=APP/page['image'];prior=previousPages.get(page['image']);old=prior[1] if prior else None
   sameSource=bool(prior and prior[0].get('sourceSHA256')==ref['sourceSHA256'] and prior[0].get('sourceFile')==ref['sourceFile'] and old.get('pdfPage')==page['pdfPage'])
   sameRendering=previous.get('rendering',{'dpi':180,'format':'jpeg','quality':90,'cropBox':True})==rendering
   if args.check:
    if not sameSource or not target.is_file() or not old or sha(target)!=old.get('sha256'):raise ValueError('Referencia sin verificar: '+str(target))
   elif not page['retainedOriginal'] and not(target.is_file() and sameSource and sameRendering and sha(target)==old.get('sha256')):
    if shutil.disk_usage(OUTPUT).free<128*1024*1024:raise ValueError('Espacio insuficiente para continuar; las imágenes completadas se conservan')
    target.parent.mkdir(parents=True,exist_ok=True);temporary=target.with_name('renderizando')
    subprocess.run(['pdftoppm','-f',str(page['pdfPage']),'-l',str(page['pdfPage']),'-r',str(args.dpi),'-cropbox','-singlefile','-jpeg','-jpegopt','quality=90',str(args.books/ref['sourceFile']),str(temporary)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    temporary.with_suffix('.jpg').replace(target)
   width,height=image_size(target)
   if min(width,height)<300:raise ValueError('La imagen no es legible: '+str(target))
   page.update(width=width,height=height,sha256=sha(target))
  completed+=1
  if not args.check and (completed%10==0 or completed==len(references)):
   save(recordPath,{'schema':'aac-photo-reference-library-v1','books':index['books'],'rendering':rendering,'summary':summary,'references':references[:completed]});print(f'{completed}/{len(references)} temas · {sum(len(r["pages"]) for r in references[:completed])} imágenes verificadas',flush=True)
 if args.check:
  if previous.get('summary')!=summary or previous.get('references')!=references or previous.get('books')!=index['books']:raise ValueError('El catálogo de referencias está incompleto o desactualizado')
 else:
  save(recordPath,{'schema':'aac-photo-reference-library-v1','books':index['books'],'rendering':rendering,'summary':summary,'references':references});(OUTPUT/'INDICE.md').write_text(markdown(references))
 print(json.dumps(summary,ensure_ascii=False))
if __name__=='__main__':
 try:main()
 except Exception as error:print(str(error),file=sys.stderr);sys.exit(1)
