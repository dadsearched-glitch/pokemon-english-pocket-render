import {randomBytes,randomUUID} from 'node:crypto';
import {WebSocketServer} from 'ws';
const CODE='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const token=()=>randomBytes(24).toString('hex');
const MAX_ENVELOPE=60000;
export function createSignaling({now=Date.now}={}){
 const rooms=new Map(),rates=new Map(),wss=new WebSocketServer({noServer:true});
 const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
 const view=(r,p)=>({code:r.code,host:r.host,self:p.id,expires:r.expires,started:!!r.started,members:r.members.map(({id,accepted=true,socket})=>({id,accepted,connected:socket?.readyState===1})),relay:true});
 const notify=r=>{for(const p of r.members)if(p.socket?.readyState===1)p.socket.send(JSON.stringify({type:'relay:members',view:view(r,p)}));};
 const member=(r,t)=>{const p=r.members.find(x=>x.token===t);if(!p)fail(403,'Room permission expired.');p.seen=now();return p;};
 const clean=()=>{for(const [id,r] of rooms)if(r.expires<now()){for(const p of r.members)p.socket?.close();rooms.delete(id);}for(const [k,v] of rates)if(v.until<now())rates.delete(k);};
 const send=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
 const handler=async(req,res)=>{
  const url=new URL(req.url,'http://pocket-english.internal');if(!url.pathname.startsWith('/api/rooms'))return false;clean();
  try{
   if(req.headers.origin){const o=new URL(req.headers.origin),host=String(req.headers.host||'');if(!['http:','https:'].includes(o.protocol)||host&&o.host!==host)fail(403,'Different origin.');}
   let body={};if(req.method==='POST'){let raw='';for await(const c of req){raw+=c;if(raw.length>40000)fail(413,'Message too large.');}try{body=JSON.parse(raw||'{}');}catch{fail(400,'Invalid JSON.');}}
   const parts=url.pathname.split('/').filter(Boolean),code=parts[2],action=parts[3];
   if(req.method==='POST'&&(!code||action==='join')){const ip=req.socket.remoteAddress,v=rates.get(ip)||{n:0,until:now()+60000};if(++v.n>30)fail(429,'Please wait before trying another room.');rates.set(ip,v);}
   if(req.method==='POST'&&!code){let c;do{c=Array.from(randomBytes(6),n=>CODE[n%CODE.length]).join('');}while(rooms.has(c));const p={id:randomUUID(),token:token(),accepted:true,seen:now()},r={code:c,host:p.id,created:now(),expires:now()+600000,members:[p]};rooms.set(c,r);return send(res,201,{...view(r,p),token:p.token});}
   const r=rooms.get(code);if(!r)fail(404,'Room not found or expired.');
   if(req.method==='POST'&&action==='join'){if(r.started)fail(409,'The match has already started.');if(r.members.length>=4)fail(409,'This room already has four players.');const p={id:randomUUID(),token:token(),accepted:true,seen:now()};r.members.push(p);notify(r);return send(res,201,{...view(r,p),token:p.token});}
   const p=member(r,(req.headers.authorization||'').replace(/^Bearer\s+/i,''));
   if(req.method==='GET'&&!action)return send(res,200,view(r,p));
   if(req.method==='POST'&&action==='reconnect'){p.seen=now();return send(res,200,view(r,p));}
   if(req.method==='POST'&&action==='accept'){if(p.id!==r.host)fail(403,'Only the host can accept a player.');const other=r.members.find(x=>x.id===body.id);if(!other)fail(404,'Player left.');other.accepted=true;notify(r);return send(res,200,{ok:true});}
   if(req.method==='POST'&&action==='start'){if(p.id!==r.host)fail(403,'Host only.');r.started=true;r.expires=now()+7200000;notify(r);return send(res,200,{ok:true});}
   if(req.method==='POST'&&action==='leave'){if(p.id===r.host){rooms.delete(code);for(const x of r.members)x.socket?.close();}else{r.members=r.members.filter(x=>x!==p);p.socket?.close();notify(r);}return send(res,200,{ok:true});}
   fail(404,'Unknown room action.');
  }catch(e){send(res,e.status||500,e.status?{error:e.message}:{error:'Room service error.'});}return true;
 };
 handler.upgrade=(req,socket,head)=>{
  try{const u=new URL(req.url,'http://relay'),m=u.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/ws$/),r=m&&rooms.get(m[1]),p=r&&r.members.find(x=>x.token===u.searchParams.get('token'));if(!r||!p){socket.destroy();return;}
   wss.handleUpgrade(req,socket,head,ws=>{p.socket=ws;ws.on('message',raw=>{try{if(raw.length>MAX_ENVELOPE)throw Error();const msg=JSON.parse(raw.toString());if(!msg||!['message','broadcast'].includes(msg.kind)||typeof msg.envelope!=='object'||Array.isArray(msg.envelope)||typeof msg.envelope.type!=='string'||msg.envelope.type.length>64)throw Error();const targets=msg.kind==='message'?[r.members.find(x=>x.id===msg.to)]:r.members.filter(x=>x.id!==p.id);for(const t of targets)if(t?.socket?.readyState===1)t.socket.send(JSON.stringify({type:'relay:message',from:p.id,envelope:msg.envelope}));}catch{ws.send(JSON.stringify({type:'relay:error',error:'Invalid game envelope.'}));}});ws.on('close',()=>{if(p.socket===ws){p.socket=null;notify(r);}});ws.send(JSON.stringify({type:'relay:members',view:view(r,p)}));notify(r);});
  }catch{socket.destroy();}
 };
 return handler;
}
