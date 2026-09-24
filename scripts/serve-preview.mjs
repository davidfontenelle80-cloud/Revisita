// Local-only app preview. Never serves Git/configuration/secret files.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('.');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
http.createServer(async(req,res)=>{
 try{
  let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/Revisita\//,'/');
  if(name==='/')name='/index.html';
  if(!/^\/(index\.html|sw\.js|manifest\.json|favicon\.ico|css\/[\w.-]+|js\/[\w.-]+|icons\/[\w.-]+)$/.test(name)){res.writeHead(404).end();return;}
  const content=await fs.readFile(path.join(root,name));
  res.writeHead(200,{'content-type':types[path.extname(name)]||'application/octet-stream','cache-control':'no-store'}).end(content);
 }catch{res.writeHead(404).end();}
}).listen(4173,'127.0.0.1',()=>console.log('Revisita preview: http://127.0.0.1:4173/Revisita/'));
