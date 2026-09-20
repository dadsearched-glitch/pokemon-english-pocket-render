import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createSignaling} from '../network/signaling.mjs';
test('rooms enforce bearer ownership, four player cap and relay-only envelopes',async()=>{
 const handle=createSignaling(),server=http.createServer(handle);await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/api/rooms';
 const call=async(path='',body={},token)=>{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};};
 try{const h=(await call()).data,players=[h];for(let i=0;i<3;i++)players.push((await call('/'+h.code+'/join')).data);assert.equal((await call('/'+h.code+'/join')).status,409);assert.equal((await call('/'+h.code+'/signal',{},players[1].token)).status,404);assert.equal((await call('/'+h.code+'/start',{},players[1].token)).status,403);assert.equal((await call('/'+h.code+'/start',{},h.token)).status,200);}
 finally{await new Promise(r=>server.close(r));}
});
