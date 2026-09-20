// Server relay transport. PeerRoom keeps the public contract used by multiplayer.js,
// but all game envelopes now travel over one authenticated WebSocket connection.
export class PeerRoom {
  constructor({onchange=()=>{},onmessage=()=>{},onerror=()=>{},onstatus=()=>{}}={}) {
    Object.assign(this,{onchange,onmessage,onerror,onstatus});
    this.peers=new Map(); this.closed=false; this.status='idle'; this.debug=[];
    this.socket=null; this.connectedIds=new Set();
  }
  log(id,event,extra={}) { const entry={at:Date.now(),id,event,...extra}; this.debug=[...this.debug.slice(-39),entry]; this.onstatus(entry); }
  async request(path='',body) {
    const r=await fetch('/api/rooms'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(this.token?{Authorization:'Bearer '+this.token}:{})},...(body?{body:JSON.stringify(body)}:{})});
    let data; try { data=await r.json(); } catch { data='Connection failed.'; }
    if(r.status===404){this.closed=true;this.status='gone';}
    if(!r.ok) throw Error(typeof data==='string'?data:(data?.error||'Connection failed.'));
    return data;
  }
  async open(code) {
    if(code&&!/^[A-Za-z0-9]{6}$/.test(String(code).trim())) throw Error('방 코드 6자리를 확인해 주세요.');
    const v=await this.request(code?'/'+code.trim().toUpperCase()+'/join':'',{});
    Object.assign(this,{code:v.code,id:v.self,host:v.host,token:v.token,status:'waiting'}); this.update(v); this.connectSocket(); return this;
  }
  credentials(){return {code:this.code,id:this.id,host:this.host,token:this.token};}
  async resume(c){Object.assign(this,c);const v=await this.request('/'+this.code+'/reconnect',{});this.update(v);this.connectSocket();return this;}
  get isHost(){return this.id===this.host;}
  async accept(id){await this.request('/'+this.code+'/accept',{id});}
  update(v){
    this.members=v.members||[];
    this.expires=v.expires;
    this.started=!!v.started;
    // The relay reports socket presence separately from room membership. This
    // keeps the existing connected() contract without treating a disconnected
    // member as ready to receive game envelopes.
    this.connectedIds=new Set(this.members.filter(m=>m.id!==this.id&&m.connected).map(m=>m.id));
    for(const id of this.connectedIds)this.ensurePeer(id);
    this.onchange();
  }
  connectSocket(){
    if(this.socket&&this.socket.readyState<=1)return;
    const scheme=location.protocol==='https:'?'wss':'ws';
    const ws=new WebSocket(`${scheme}://${location.host}/api/rooms/${this.code}/ws?token=${encodeURIComponent(this.token)}`);
    this.socket=ws;
    ws.onopen=()=>{this.status='connected';this.log(this.id,'relay-open');this.onchange();};
    ws.onclose=()=>{this.connectedIds.clear();this.status=this.closed?'gone':'reconnecting';this.onchange();};
    ws.onerror=()=>this.onerror('Server relay connection failed.');
    ws.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.type==='relay:members'){this.update(m.view);return;}if(m.type==='relay:message'){this.connectedIds.add(m.from);this.ensurePeer(m.from);this.onmessage(m.from,m.envelope);}}catch{this.onerror('Invalid relay message.');}};
  }
  ensurePeer(id){if(id===this.id)return; if(!this.peers.has(id))this.peers.set(id,{id,memberDetected:true});}
  connected(){return [...this.connectedIds];}
  peerState(id){const connected=this.connectedIds.has(id);return {memberDetected:!!this.members?.some(m=>m.id===id),peerCreated:this.peers.has(id),relayState:connected?'open':'waiting',connectionState:connected?'connected':'new',lastError:''};}
  send(to,envelope){if(!this.socket||this.socket.readyState!==WebSocket.OPEN){this.onerror('Relay is not connected.');return false;}this.socket.send(JSON.stringify({kind:'message',to,envelope}));this.log(to,'relay-send');return true;}
  broadcast(envelope){if(!this.socket||this.socket.readyState!==WebSocket.OPEN){this.onerror('Relay is not connected.');return false;}this.socket.send(JSON.stringify({kind:'broadcast',envelope}));this.log('room','relay-broadcast');return true;}
  async leave(){try{await this.request('/'+this.code+'/leave',{});}finally{this.close();}}
  close(){this.closed=true;try{this.socket?.close();}catch{}this.status='closed';}
}
