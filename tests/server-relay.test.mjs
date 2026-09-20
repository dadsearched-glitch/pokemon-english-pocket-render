import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {WebSocket} from 'ws';
import {createSignaling} from '../network/signaling.mjs';
const openSockets=[];

function start(){const rooms=createSignaling();const server=http.createServer((req,res)=>rooms(req,res));server.on('upgrade',(req,s,h)=>rooms.upgrade(req,s,h));return new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server)));}
async function create(base){const r=await fetch(base+'/api/rooms',{method:'POST',body:'{}'});return r.json();}
async function join(base,code){const r=await fetch(base+'/api/rooms/'+code+'/join',{method:'POST',body:'{}'});return r.json();}
function socket(base,p){return new Promise((resolve,reject)=>{const u=new URL(base+'/api/rooms/'+p.code+'/ws');u.searchParams.set('token',p.token);const ws=new WebSocket(u);openSockets.push(ws);ws.once('open',()=>resolve(ws));ws.once('error',reject);});}
function stop(server){for(const ws of openSockets.splice(0))ws.terminate();return new Promise(r=>server.close(r));}
function next(ws,predicate=()=>true){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('relay message timeout')),5000);const on=e=>{try{const value=JSON.parse(e.toString());if(!predicate(value)){ws.once('message',on);return;}clearTimeout(timer);resolve(value);}catch(err){clearTimeout(timer);reject(err);}};ws.once('message',on);ws.once('error',e=>{clearTimeout(timer);reject(e);});});}
function nextRaw(ws){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('health message timeout')),5000);ws.once('message',value=>{clearTimeout(timer);resolve(value.toString());});ws.once('error',error=>{clearTimeout(timer);reject(error);});});}
test('PRODUCTION WS HEALTH PASS',async()=>{const server=await start(),base='http://127.0.0.1:'+server.address().port;try{const ws=new WebSocket(base.replace('http:','ws:')+'/ws-health'),message=nextRaw(ws);await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});assert.equal(await message,'WS_HEALTH_OK');console.log('PRODUCTION WS HEALTH PASS');}finally{await stop(server);}});
test('SERVER RELAY 2P PASS',async()=>{const server=await start(),base='http://127.0.0.1:'+server.address().port;try{const h=await create(base),g=await join(base,h.code),a=await socket(base,h),b=await socket(base,g);a.send(JSON.stringify({kind:'broadcast',envelope:{type:'snapshot',protocol:1,game:'test',payload:{turn:1}}}));const got=await next(b,m=>m.type==='relay:message');assert.equal(got.from,h.self);assert.equal(got.envelope.type,'snapshot');b.send(JSON.stringify({kind:'message',to:h.self,envelope:{type:'action',payload:{move:'charge'}}}));const back=await next(a,m=>m.type==='relay:message');assert.equal(back.from,g.self);assert.equal(back.envelope.type,'action');console.log('SERVER RELAY 2P PASS');}finally{await stop(server);}});
test('SERVER RELAY 4P PASS',async()=>{const server=await start(),base='http://127.0.0.1:'+server.address().port;try{const h=await create(base),players=[h,await join(base,h.code),await join(base,h.code),await join(base,h.code)],sockets=[];for(const p of players)sockets.push(await socket(base,p));sockets[0].send(JSON.stringify({kind:'broadcast',envelope:{type:'snapshot',mode:'duo',players:4}}));for(const ws of sockets.slice(1)){const m=await next(ws,x=>x.type==='relay:message');assert.equal(m.envelope.players,4);}sockets[0].send(JSON.stringify({kind:'message',to:players[3].self,envelope:{type:'action',playerId:players[0].self}}));const m=await next(sockets[3],x=>x.type==='relay:message');assert.equal(m.envelope.type,'action');console.log('SERVER RELAY 4P PASS');}finally{await stop(server);}});
test('SERVER RELAY RECONNECT PASS',async()=>{
 const server=await start(),base='http://127.0.0.1:'+server.address().port;
 try{
  const h=await create(base),g=await join(base,h.code),a=await socket(base,h),b=await socket(base,g);
  b.close();
  await new Promise(resolve=>setTimeout(resolve,30));
  const reconnect=await fetch(base+'/api/rooms/'+g.code+'/reconnect',{method:'POST',headers:{Authorization:'Bearer '+g.token}});
  assert.equal(reconnect.status,200);
  const resumed=await socket(base,g);
  a.send(JSON.stringify({kind:'message',to:g.self,envelope:{type:'reconnect_check',matchId:'reconnect-test'}}));
  const got=await next(resumed,m=>m.type==='relay:message');
  assert.equal(got.envelope.type,'reconnect_check');
  console.log('SERVER RELAY RECONNECT PASS');
 }finally{await stop(server);}
});
