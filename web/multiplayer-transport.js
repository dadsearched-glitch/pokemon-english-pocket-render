// Same-origin temporary negotiation only. Game payloads travel on WebRTC, not HTTP.
export class PeerRoom{
 constructor({onchange=()=>{},onmessage=()=>{},onerror=()=>{}}={}){Object.assign(this,{onchange,onmessage,onerror});this.peers=new Map();this.closed=false;this.status='idle';}
 async request(path='',body){const r=await fetch('/api/rooms'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(this.token?{Authorization:'Bearer '+this.token}:{})},...(body?{body:JSON.stringify(body)}:{})});let data;try{data=await r.json();}catch{data='Connection failed.';}if(r.status===404){this.closed=true;this.status='gone';}if(!r.ok)throw Error(typeof data==='string'?data:'Connection failed.');return data;}
 async open(code){if(code&&!/^[A-Za-z0-9]{6}$/.test(String(code).trim()))throw Error('방 코드 6자리를 확인해 주세요.');const v=await this.request(code?'/'+code.trim().toUpperCase()+'/join':'',{});Object.assign(this,{code:v.code,id:v.self,host:v.host,token:v.token,status:'waiting'});this.update(v);this.poll();return this;}
 credentials(){return {code:this.code,id:this.id,host:this.host,token:this.token};}
 async resume(c){Object.assign(this,c);const v=await this.request('/'+this.code+'/reconnect',{});this.update(v);this.poll();return this;}
 get isHost(){return this.id===this.host;}
 async accept(id){await this.request('/'+this.code+'/accept',{id});await this.tick();}
 update(v){this.members=v.members;this.expires=v.expires;this.started=!!v.started;this.onchange();}
 async poll(){if(this.closed)return;try{await this.tick();}catch(e){this.onerror(e.message);if(this.status==='gone'){this.closed=true;this.onchange();return;}}if(!this.closed)this.timer=setTimeout(()=>this.poll(),1200);}
 async tick(){if(this.busy||this.closed)return;this.busy=true;try{const v=await this.request('/'+this.code);this.update(v);if(this.isHost)for(const p of v.members)if(p.id!==this.id&&p.accepted){const old=this.peers.get(p.id);if(old&&(old.generation!==p.generation||['failed','closed'].includes(old.pc.connectionState))){old.pc.close();this.peers.delete(p.id);}if(!this.peers.has(p.id)){await this.offer(p.id);this.peers.get(p.id).generation=p.generation;}}
  for(const s of v.signals){try{await this.signal(s);}finally{await this.request('/'+this.code+'/ack',{seq:s.seq});}}
  }finally{this.busy=false;}
 }
 peer(id){let entry=this.peers.get(id);if(entry)return entry;const pc=new RTCPeerConnection({iceServers:[]});entry={pc,channel:null};this.peers.set(id,entry);pc.ondatachannel=e=>this.bind(id,e.channel);pc.onconnectionstatechange=()=>{this.onchange();};return entry;}
 bind(id,ch){const p=this.peers.get(id);p.channel=ch;ch.onopen=()=>{this.status='connected';this.onchange();};ch.onclose=()=>this.onchange();ch.onmessage=e=>{if(typeof e.data!=='string'||e.data.length>60000)return;try{this.onmessage(id,JSON.parse(e.data));}catch{this.onerror('Invalid peer message.');}};}
 async gather(pc){if(pc.iceGatheringState==='complete')return;await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pc.removeEventListener('icegatheringstatechange',done);reject(Error('Network negotiation timed out.'));},12000);function done(){if(pc.iceGatheringState==='complete'){clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',done);resolve();}}pc.addEventListener('icegatheringstatechange',done);done();});}
 async offer(id){const p=this.peer(id);this.bind(id,p.pc.createDataChannel('pocket-v1',{ordered:true}));await p.pc.setLocalDescription(await p.pc.createOffer());await this.gather(p.pc);await this.request('/'+this.code+'/signal',{to:id,description:p.pc.localDescription});}
 async signal(s){if(s.description.type==='offer'&&!this.isHost){this.peers.get(s.from)?.pc.close();this.peers.delete(s.from);}const p=this.peer(s.from);if(s.description.type==='offer'){if(this.isHost)return;await p.pc.setRemoteDescription(s.description);await p.pc.setLocalDescription(await p.pc.createAnswer());await this.gather(p.pc);await this.request('/'+this.code+'/signal',{to:s.from,description:p.pc.localDescription});}else if(this.isHost&&p.pc.signalingState==='have-local-offer')await p.pc.setRemoteDescription(s.description);}
 send(id,data){const ch=this.peers.get(id)?.channel;if(ch?.readyState!=='open'||ch.bufferedAmount>100000)return false;ch.send(JSON.stringify(data));return true;}
 broadcast(data){for(const id of this.peers.keys())this.send(id,data);}
 connected(){return [...this.peers].filter(([,p])=>p.channel?.readyState==='open').map(([id])=>id);}
 async close(){this.closed=true;clearTimeout(this.timer);for(const p of this.peers.values())p.pc.close();if(this.code)await this.request('/'+this.code+'/leave',{}).catch(()=>{});}
}
