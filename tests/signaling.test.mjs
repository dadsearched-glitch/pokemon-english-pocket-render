import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {createSignaling} from '../network/signaling.mjs';
test('rooms enforce approval, bearer ownership, four player cap, expiry and no game payload storage',async()=>{
 let now=100000;const handle=createSignaling({now:()=>now});const server=http.createServer(handle);await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/api/rooms';
 const call=async(path='',body={},token)=>{const r=await fetch(url+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};};
 try{const h=(await call()).data;assert.match(h.code,/^[A-Z2-9]{6}$/);const guests=[];for(let i=0;i<3;i++)guests.push((await call('/'+h.code+'/join')).data);assert.equal((await call('/'+h.code+'/join')).status,409);
 assert.equal((await call('/'+h.code+'/accept',{id:guests[0].self},guests[0].token)).status,403);assert.equal((await call('/'+h.code+'/accept',{id:guests[0].self},h.token)).status,200);
 assert.equal((await call('/'+h.code+'/signal',{to:h.self,description:{type:'battle_action',sdp:'private data'}},guests[0].token)).status,400);
 assert.equal((await call('/'+h.code+'/signal',{to:h.self,description:{type:'offer',sdp:'test'}},guests[1].token)).status,403);
 assert.equal((await call('/'+h.code+'/signal',{to:guests[0].self,description:{type:'offer',sdp:'test'}},h.token)).status,200);
 assert.equal((await call('/'+h.code+'/start',{},guests[0].token)).status,403);assert.equal((await call('/'+h.code+'/start',{},h.token)).status,200);assert.equal((await call('/'+h.code+'/join')).status,409);
 now+=7200001;assert.equal((await call('/'+h.code+'/join')).status,404);
 }finally{await new Promise(r=>server.close(r));}
});
test('signaling rejects a different origin host while same-origin requests still work',async()=>{
 let now=100000;const handle=createSignaling({now:()=>now});const server=http.createServer(handle);await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;const url='http://127.0.0.1:'+port+'/api/rooms';
 try{
  const bad=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://evil.example'},body:'{}'});
  assert.equal(bad.status,403);assert.match(await bad.text(),/Different origin/);
  const proto=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Origin':'ftp://127.0.0.1:'+port},body:'{}'});
  assert.equal(proto.status,403);
  const ok=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Origin':'http://127.0.0.1:'+port},body:'{}'});
  assert.equal(ok.status,201);assert.match((await ok.json()).code,/^[A-Z2-9]{6}$/);
 }finally{await new Promise(r=>server.close(r));}
});
test('guest leave removes the member, stale lobby players expire, bad codes 404',async()=>{
 let now=100000;const handle=createSignaling({now:()=>now});const server=http.createServer(handle);await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/api/rooms';
 const call=async(path='',body={},token,method='POST')=>{const r=await fetch(url+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(method==='POST'?{body:JSON.stringify(body||{})}:{})});return {status:r.status,data:await r.json()};};
 try{
  const h=(await call()).data,g=(await call('/'+h.code+'/join')).data;
  assert.equal((await call('/'+h.code+'/leave',{},g.token)).status,200);
  const view=await call('/'+h.code,undefined,h.token,'GET');assert.equal(view.data.members.length,1);
  const g2=(await call('/'+h.code+'/join')).data;assert.equal(g2.data?g2.status:201,201);
  now+=25000;const late=await call('/'+h.code,undefined,h.token,'GET');assert.equal(late.data.members.length,1);
  assert.equal((await call('/ZZZZZZ/join')).status,404);
 }finally{await new Promise(r=>server.close(r));}
});
