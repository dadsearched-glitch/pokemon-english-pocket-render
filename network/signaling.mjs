import {randomBytes,randomUUID} from 'node:crypto';
const CODE='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const token=()=>randomBytes(24).toString('hex');
export function createSignaling({now=Date.now}={}){
 const rooms=new Map(),rates=new Map();
 function fail(status,message){throw Object.assign(new Error(message),{status});}
 function stale(r){if(r.started)return;r.members=r.members.filter(p=>p.id===r.host||((p.seen||r.created)+20000>now()));if(!r.members.some(p=>p.id===r.host))rooms.delete(r.code);}
 function clean(){for(const [id,r]of rooms){if(r.expires<now())rooms.delete(id);else stale(r);}for(const[k,v]of rates)if(v.until<now())rates.delete(k);}
 function member(r,t){const p=r.members.find(p=>p.token===t);if(!p)fail(403,'Room permission expired.');p.seen=now();return p;}
 function view(r,p){return {code:r.code,host:r.host,self:p.id,expires:r.expires,started:!!r.started,members:r.members.map(({id,accepted,generation=0})=>({id,accepted,generation})),signals:p.signals};}
 return async function handle(req,res){
    const url=new URL(req.url,'http://pocket-english.internal');if(!url.pathname.startsWith('/api/rooms'))return false;
  const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
  try{
   clean();
   if(req.headers.origin){
    try{
     const o=new URL(req.headers.origin);
     if(!['http:','https:'].includes(o.protocol))fail(403,'Different origin.');
     const host=String(req.headers.host||'');
     if(host&&o.host!==host)fail(403,'Different origin.');
    }catch(e){if(e.status)throw e;fail(403,'Different origin.');}
   }
   let body={};if(req.method==='POST'){let raw='';for await(const c of req){raw+=c;if(raw.length>40000)fail(413,'Message too large.');}try{body=JSON.parse(raw||'{}');}catch{fail(400,'Invalid JSON.');}}
   const segments=url.pathname.split('/').filter(Boolean),code=segments[2],action=segments[3];
   if(req.method==='POST'&&(!code||action==='join')){const ip=req.socket.remoteAddress;const v=rates.get(ip)||{n:0,until:now()+60000};if(++v.n>30)fail(429,'Please wait before trying another room.');rates.set(ip,v);}
   if(req.method==='POST'&&!code){if(rooms.size>=200)fail(503,'Rooms full.');let code;do{code=Array.from(randomBytes(6),n=>CODE[n%CODE.length]).join('');}while(rooms.has(code));const p={id:randomUUID(),token:token(),accepted:true,signals:[],seen:now()};const r={code,host:p.id,created:now(),expires:now()+600000,members:[p],seq:0};rooms.set(code,r);send(201,{...view(r,p),token:p.token});return true;}
   const r=rooms.get(code);if(!r)fail(404,'Room not found or expired.');
   if(req.method==='POST'&&action==='join'){if(r.started)fail(409,'The match has already started.');if(r.members.length>=4)fail(409,'This room already has four players.');const p={id:randomUUID(),token:token(),accepted:false,signals:[],seen:now()};r.members.push(p);send(201,{...view(r,p),token:p.token});return true;}
   const p=member(r,req.headers.authorization?.replace(/^Bearer /,''));
   if(req.method==='POST'&&action==='reconnect'){p.generation=(p.generation||0)+1;p.signals=[];p.seen=now();send(200,view(r,p));return true;}
   if(req.method==='POST'&&action==='start'){if(p.id!==r.host)fail(403,'Host only.');r.started=true;r.expires=now()+7200000;send(200,{ok:true});return true;}
   if(req.method==='GET'&&!action){send(200,view(r,p));return true;}
   if(req.method==='POST'&&action==='accept'){if(p.id!==r.host)fail(403,'Only the host can accept a player.');const other=r.members.find(x=>x.id===body.id);if(!other)fail(404,'Player left.');other.accepted=true;other.seen=now();send(200,{ok:true});return true;}
   if(req.method==='POST'&&action==='signal'){
    const other=r.members.find(x=>x.id===body.to);if(!p.accepted||!other?.accepted||(p.id!==r.host&&other.id!==r.host))fail(403,'Peer not approved.');
    if(!['offer','answer'].includes(body.description?.type)||typeof body.description.sdp!=='string'||body.description.sdp.length>32000)fail(400,'Invalid negotiation.');
    if(other.signals.length>=30)fail(429,'Negotiation queue full.');
    other.signals.push({seq:++r.seq,from:p.id,description:{type:body.description.type,sdp:body.description.sdp}});send(200,{ok:true});return true;
   }
   if(req.method==='POST'&&action==='ack'){p.signals=p.signals.filter(x=>x.seq>Number(body.seq));send(200,{ok:true});return true;}
   if(req.method==='POST'&&action==='leave'){if(p.id===r.host)rooms.delete(code);else r.members=r.members.filter(x=>x!==p);send(200,{ok:true});return true;}
   fail(404,'Unknown room action.');
  }catch(e){send(e.status||500,e.status?e.message:'Room service error.');}return true;
 };
}
