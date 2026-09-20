import {randomBytes,randomUUID} from 'node:crypto';
import {WebSocketServer} from 'ws';
const CODE='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const token=()=>randomBytes(24).toString('hex');
const MAX_ENVELOPE=60000;
export function createSignaling({now=Date.now}={}){
 const rooms=new Map(),rates=new Map(),wss=new WebSocketServer({noServer:true});
 const logUpgrade=(event,req,extra='')=>console.log(`WS ${event} pathname=${new URL(req.url,'http://relay').pathname} upgrade=${req.headers.upgrade||''} connection=${req.headers.connection||''}${extra?' '+extra:''}`);
 const rejectUpgrade=(socket,status,message)=>{socket.write(`HTTP/1.1 ${status} ${message}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);socket.destroy();};
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
  const u=new URL(req.url,'http://relay'),pathname=u.pathname,tokenValue=u.searchParams.get('token');
  logUpgrade('UPGRADE',req,`room=${pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/ws$/)?.[1]||''} tokenPresent=${tokenValue?'true':'false'}`);
  if(pathname==='/ws-health'){
   console.log('WS HANDLE_UPGRADE START health');
   wss.handleUpgrade(req,socket,head,ws=>{console.log('WS HANDLE_UPGRADE OK health');ws.send('WS_HEALTH_OK');ws.close();});
   return;
  }
  const code=pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/ws$/)?.[1],r=code&&rooms.get(code);
  if(!code){console.log('WS UPGRADE REJECT 404 invalid route');rejectUpgrade(socket,404,'Not Found');return;}
  if(!r){console.log(`WS UPGRADE REJECT 404 room missing room=${code}`);rejectUpgrade(socket,404,'Not Found');return;}
  const p=r.members.find(x=>x.token===tokenValue);
  if(!p){console.log(`WS UPGRADE REJECT 403 invalid token room=${code}`);rejectUpgrade(socket,403,'Forbidden');return;}
  try{
   console.log(`WS HANDLE_UPGRADE START room=${code} member=${p.id}`);
   wss.handleUpgrade(req,socket,head,ws=>{console.log(`WS HANDLE_UPGRADE OK room=${code} member=${p.id}`);p.socket=ws;ws.on('message',raw=>{try{if(raw.length>MAX_ENVELOPE)throw Error();const msg=JSON.parse(raw.toString());if(!msg||!['message','broadcast'].includes(msg.kind)||typeof msg.envelope!=='object'||Array.isArray(msg.envelope)||typeof msg.envelope.type!=='string'||msg.envelope.type.length>64)throw Error();const targets=msg.kind==='message'?[r.members.find(x=>x.id===msg.to)]:r.members.filter(x=>x.id!==p.id);for(const t of targets)if(t?.socket?.readyState===1)t.socket.send(JSON.stringify({type:'relay:message',from:p.id,envelope:msg.envelope}));}catch{ws.send(JSON.stringify({type:'relay:error',error:'Invalid game envelope.'}));}});ws.on('close',()=>{if(p.socket===ws){p.socket=null;notify(r);}});ws.send(JSON.stringify({type:'relay:members',view:view(r,p)}));notify(r);});
  }catch(error){console.log(`WS UPGRADE REJECT 500 room=${code} reason=${error.message}`);rejectUpgrade(socket,500,'Internal Server Error');}
 };
 return handler;
}
