#!/usr/bin/env python3
"""Local AAC pilot and native score conversion. No external service is used."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from urllib.parse import urlparse
import argparse,json,os,subprocess,tempfile,threading,sys,webbrowser,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[3]
MUSESCORE=Path(os.environ.get('AAC_MUSESCORE_BIN','/Applications/MuseScore 4.app/Contents/MacOS/mscore'))
CONVERSION=threading.Lock()
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def end_headers(self):
  self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()
 def json(self,status,value):
  data=json.dumps(value,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
 def do_GET(self):
  if urlparse(self.path).path=='/api/aac-melody/health':return self.json(200,{'ok':True,'service':'AAC Melody Pilot','nativeExport':MUSESCORE.is_file()})
  if any(part.startswith('.') for part in urlparse(self.path).path.split('/') if part):return self.send_error(404)
  super().do_GET()
 def do_POST(self):
  if self.path!='/api/aac-melody/export':return self.json(404,{'error':'Ruta no encontrada'})
  origin=self.headers.get('Origin')
  if origin and origin not in {f'http://127.0.0.1:{self.server.server_port}',f'http://localhost:{self.server.server_port}'}:return self.json(403,{'error':'Solo se aceptan solicitudes de esta aplicación local'})
  try:
   length=int(self.headers.get('Content-Length','0'))
   if not 0<length<=5*1024*1024:return self.json(413,{'error':'La partitura supera el límite local'})
   body=json.loads(self.rfile.read(length));xml=body['musicxml'];format=body.get('format','mscz')
   if format not in {'mscz','pdf'}:raise ValueError('Formato no compatible')
   if not isinstance(xml,str) or len(xml)>4*1024*1024 or '<!ENTITY' in xml.upper():raise ValueError('MusicXML no compatible')
   root=ET.fromstring(xml)
   if root.tag.split('}')[-1]!='score-partwise':raise ValueError('Se necesita MusicXML partwise')
   if not MUSESCORE.is_file():return self.json(503,{'error':'Configura AAC_MUSESCORE_BIN con MuseScore Studio instalado'})
   with CONVERSION,tempfile.TemporaryDirectory(prefix='aac-score-export-') as temporary:
    folder=Path(temporary);source=folder/'score.musicxml';target=folder/('score.'+format);source.write_text(xml)
    env=dict(os.environ,QT_QPA_PLATFORM='cocoa' if sys.platform=='darwin' else 'offscreen',XDG_CACHE_HOME=str(folder/'cache'),XDG_CONFIG_HOME=str(folder/'config'),TMPDIR=str(folder))
    process=subprocess.run([str(MUSESCORE),'-o',str(target),str(source)],cwd=folder,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=120)
    if process.returncode or not target.is_file():raise RuntimeError('MuseScore no pudo convertir la partitura. '+process.stdout.decode(errors='replace')[-600:])
    data=target.read_bytes()
   self.send_response(200);self.send_header('Content-Type','application/pdf' if format=='pdf' else 'application/octet-stream');self.send_header('Content-Disposition','attachment; filename="partitura.'+format+'"');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
  except (ValueError,KeyError,TypeError,ET.ParseError) as error:self.json(422,{'error':str(error)})
  except subprocess.TimeoutExpired:self.json(504,{'error':'La exportación tardó demasiado. El proyecto actual se conserva.'})
  except Exception as error:self.json(500,{'error':str(error)})
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8815);parser.add_argument('--open',action='store_true');args=parser.parse_args()
 server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler);print(f'Biblioteca Melodías AAC: http://127.0.0.1:{args.port}/herramientas/aac/?melody=library',flush=True)
 if args.open:webbrowser.open(f'http://127.0.0.1:{args.port}/herramientas/aac/?melody=library')
 try:server.serve_forever()
 except KeyboardInterrupt:pass
 finally:server.server_close()
if __name__=='__main__':main()
