import {createServer} from 'node:http';
import {createReadStream,existsSync,statSync} from 'node:fs';
import {extname,join,normalize,resolve,sep} from 'node:path';

const root=resolve('dist');
const type={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  let file=normalize(join(root,pathname));
  if(file!==root&&!file.startsWith(root+sep)){response.writeHead(403).end();return}
  if(existsSync(file)&&statSync(file).isDirectory())file=join(file,'index.html');
  if(!existsSync(file)||!statSync(file).isFile()){response.writeHead(404).end();return}
  response.writeHead(200,{'content-type':type[extname(file)]||'application/octet-stream'});
  createReadStream(file).pipe(response);
}).listen(4181,'127.0.0.1',()=>console.log('Prévia em http://127.0.0.1:4181/'));
