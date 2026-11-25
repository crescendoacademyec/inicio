#!/usr/bin/env python3
"""Build/check the official AAC melody catalog; originals remain byte-for-byte intact."""
import argparse, hashlib, json, re, subprocess, sys, unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path

APP=Path(__file__).resolve().parents[1]
FOLDER=APP/'Melodías'
XML_ID='{http://www.w3.org/XML/1998/namespace}id'

def local(node): return node.tag.split('}')[-1]
def nodes(root,name): return [node for node in root.iter() if local(node)==name]
def value(root,name,default=''): return next((''.join(n.itertext()).strip() for n in root.iter() if local(n)==name),default)
def digest(data): return hashlib.sha256(data).hexdigest()
def slug(title):
 text=unicodedata.normalize('NFKD',title).encode('ascii','ignore').decode().lower()
 return re.sub('[^a-z0-9]+','-',text).strip('-') or 'melodia'
def parse(data):
 if len(data)>8*1024*1024 or b'<!ENTITY' in data.upper(): raise ValueError('XML no compatible o superior a 8 MB')
 return ET.fromstring(data)
def ast(node):
 return {'tag':local(node),'attrs':{('xml:id' if k==XML_ID else k):v for k,v in node.attrib.items()},'text':''.join(node.itertext()),'children':[ast(c) for c in node]}
class MEIConverter:
 def __init__(self): self.process=None
 def convert(self,root): return self.request(ast(root))
 def validate(self,root): return self.request({"validate":True,"node":ast(root)})
 def request(self,payload):
  if self.process is None: self.process=subprocess.Popen(['node',str(APP/'tools/convert-mei.cjs'),'--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,text=True)
  self.process.stdin.write(json.dumps(payload)+'\n');self.process.stdin.flush()
  line=self.process.stdout.readline()
  if not line: raise ValueError('El conversor MEI terminó sin devolver una partitura')
  result=json.loads(line)
  if result.get('error'): raise ValueError(result['error'])
  return result
 def close(self):
  if self.process:
   self.process.stdin.close();self.process.stdout.close();self.process.wait()

def prepare(path,previous,used,converter=None):
 data=path.read_bytes();root=parse(data);kind=local(root)
 if kind not in {'mei','score-partwise'}: raise ValueError('Se necesita MEI o MusicXML score-partwise')
 correct='.mei' if kind=='mei' else '.musicxml'
 if path.suffix.lower()!=correct: raise ValueError('La extensión debe ser '+correct+' según el contenido')
 source='Melodías/'+unicodedata.normalize('NFC',path.name);old=previous.get(source,{})
 if old.get('musicxml') and old.get('musicxmlSHA256'):
  generated=path.parent/'partituras'/Path(old['musicxml']).name
  if generated.is_file() and digest(generated.read_bytes())!=old['musicxmlSHA256']:
   raise ValueError('Hay cambios manuales en '+generated.name+'. Conserva esa edición en correcciones/ y actualiza el catálogo antes de regenerar.')
 if old.get('sourceSHA256')!=digest(data): old={}
 if kind=='mei':
  if converter: result=converter(root)
  else:
   run=subprocess.run(['node',str(APP/'tools/convert-mei.cjs')],input=json.dumps(ast(root)),text=True,capture_output=True,check=True);result=json.loads(run.stdout)
  canonical=result['content'];route=result.get('playbackRoute');converted=parse(canonical.encode())
  if route:
   identification=converted.find('identification')
   if identification is None: identification=ET.SubElement(converted,'identification')
   field=next((n for n in nodes(identification,'miscellaneous-field') if n.get('name')=='crescendo:measure-route'),None)
   if field is None:
    misc=ET.SubElement(identification,'miscellaneous');field=ET.SubElement(misc,'miscellaneous-field',{'name':'crescendo:measure-route'})
   field.text=json.dumps(route,separators=(',',':'))
   # Explicit encoding preserves the catalog bytes across Python 3.9 and 3.12+.
   canonical=ET.tostring(converted,encoding='UTF-8',xml_declaration=True).decode('UTF-8')
  source_notes=len(nodes(root,'note'))
 else:
  canonical=data.decode('utf-8-sig');converted=root;source_notes=sum(1 for n in nodes(root,'note') if any(local(c)=='pitch' for c in n))
 if old.get('correctionFile'):
  if old.get('correctionSourceSHA256')!=digest(data): raise ValueError('La corrección no corresponde a esta edición de origen')
  correction=(path.parent/old['correctionFile']).resolve();allowed=(path.parent/'correcciones').resolve()
  if allowed not in correction.parents: raise ValueError('La corrección debe estar dentro de correcciones/')
  corrected=correction.read_bytes();converted=parse(corrected)
  if local(converted)!='score-partwise': raise ValueError('La corrección debe ser MusicXML score-partwise')
  canonical=corrected.decode('utf-8-sig')
 title=value(converted,'work-title') or value(converted,'movement-title') or path.stem
 composer=next((''.join(c.itertext()).strip() for c in nodes(converted,'creator') if c.get('type')=='composer'),'')
 identifier=old.get('id') or slug(title)
 if identifier in used: identifier+='-'+digest(data)[:8]
 if identifier in used: raise ValueError('Entrada duplicada: '+title)
 used.add(identifier)
 notes=sum(1 for n in nodes(converted,'note') if any(local(c)=='pitch' for c in n));measures=len(nodes(converted,'measure'))
 if (not old.get('correctionFile') and notes!=source_notes) or not notes or not measures: raise ValueError('La conversión no conserva las notas de '+title)
 tempo=next((float(n.get('tempo')) for n in nodes(converted,'sound') if n.get('tempo') and 20<=float(n.get('tempo'))<=360),120)
 entry={**old,'id':identifier,'title':old.get('title',title),'composer':composer,'sourceFile':source,'sourceFormat':'mei' if kind=='mei' else 'musicxml','sourceSHA256':digest(data),'musicxml':'Melodías/partituras/'+identifier+'.musicxml','musicxmlSHA256':digest(canonical.encode()),'tempo':tempo,'noteCount':notes,'measureCount':measures}
 entry.setdefault('reviewStatus','pending-musical-review')
 entry.setdefault('reviewSummary','Archivo incorporado · revisión musical pendiente.')
 entry.setdefault('sourceLabel','Partitura digital aportada por el usuario')
 entry.setdefault('swing',bool(re.search(r'\bswing\b',' '.join(''.join(n.itertext()) for n in nodes(converted,'words')),re.I)))
 return entry,canonical

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true');parser.add_argument('--folder',type=Path,default=FOLDER);args=parser.parse_args();folder=args.folder.resolve()
 catalog=folder/'catalog.json';old=json.loads(catalog.read_text()) if catalog.is_file() else {'examples':[]};previous={r['sourceFile']:r for r in old.get('examples',[])}
 files=sorted(p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in {'.mei','.musicxml','.xml'});planned=[];used=set()
 normalized=[]
 for path in files:
  target=folder/unicodedata.normalize('NFC',path.name)
  if path.name!=target.name:
   if target.exists():
    if not path.samefile(target): raise ValueError('Nombres Unicode duplicados: '+path.name)
   elif args.check: raise ValueError('Normaliza el nombre Unicode: '+path.name)
   else: path.rename(target)
  normalized.append(target)
 files=normalized
 converter=MEIConverter()
 try:
  for path in files:
   try: planned.append(prepare(path,previous,used,converter.convert))
   except (ValueError,ET.ParseError,subprocess.CalledProcessError) as error:
    detail=error.stderr.strip() if isinstance(error,subprocess.CalledProcessError) else str(error);raise ValueError(path.name+': '+detail) from error
 finally: converter.close()
 entries=sorted((entry for entry,_ in planned),key=lambda row:(unicodedata.normalize('NFKD',row['title']).casefold(),row['id']))
 result={'schema':'aac-melody-library-v1','examples':entries,'summary':{'themes':len(entries),'meiSources':sum(e['sourceFormat']=='mei' for e in entries),'musicxmlSources':sum(e['sourceFormat']=='musicxml' for e in entries)}}
 if args.check:
  if result!=old: raise ValueError('El catálogo no coincide con los originales. Ejecuta actualizar-melodias.py tras revisar los cambios.')
  for entry,content in planned:
   path=folder/'partituras'/Path(entry['musicxml']).name
   if not path.is_file() or path.read_bytes()!=content.encode(): raise ValueError('Partitura generada desactualizada: '+path.name)
 else:
  # Complete validation precedes any write; a bad incoming file preserves the previous catalog.
  (folder/'partituras').mkdir(exist_ok=True)
  for entry,content in planned: (folder/'partituras'/Path(entry['musicxml']).name).write_text(content)
  temporary=catalog.with_suffix('.json.tmp');temporary.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');temporary.replace(catalog)
 print(json.dumps(result['summary'],ensure_ascii=False))
if __name__=='__main__':
 try: main()
 except Exception as error: print(str(error),file=sys.stderr);sys.exit(1)
