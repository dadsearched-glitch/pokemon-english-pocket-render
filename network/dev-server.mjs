import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createSignaling} from './signaling.mjs';
const root=path.resolve('web'),rooms=createSignaling();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg'};
const server=http.createServer(async(req,res)=>{
 if(await rooms(req,res))return;
 if(res.headersSent||res.writableEnded)return;
 try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://pocket-english.internal').pathname));if(file!==root&&!file.startsWith(root+path.sep))throw Error();if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);}catch{res.writeHead(400);res.end('Bad request');}
});
server.on('upgrade',(req,socket,head)=>rooms.upgrade(req,socket,head));
server.listen(Number(process.env.PORT||4190),'0.0.0.0',()=>{const port=process.env.PORT||4190;const addresses=Object.values(os.networkInterfaces()).flat().filter(a=>a&&a.family==='IPv4'&&!a.internal).map(a=>'http://'+a.address+':'+port);console.log('Together server listening on 0.0.0.0:'+port+(addresses.length?' | LAN '+addresses.join(', '):''));});
