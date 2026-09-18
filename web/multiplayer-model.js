import {byId,TYPES} from './data.js';
export const PROTOCOL=1,GAME='8.1-together-preview-1';
export const uuid=()=>{const b=crypto.getRandomValues(new Uint8Array(16));return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');};
export const alive=p=>p.team.some(c=>c.hp>0);
export function publicPlayer(profile,team,side){
 if(!Array.isArray(team)||team.length!==3||new Set(team.map(String)).size!==3||!team.every(id=>profile.cards.some(x=>String(x)===String(id))&&byId(id)?.battleEligible!==false&&byId(id)))throw Error('Choose three different owned Pokémon.');
 return {id:profile.multiplayer.id,name:profile.displayName.slice(0,18),year:profile.learningLevel,side,team:team.map(id=>byId(id).id)};
}
export function validPlayer(p){return p&&/^[a-f0-9]{32}$/.test(p.id)&&typeof p.name==='string'&&p.name.length>0&&p.name.length<=18&&Number.isInteger(p.year)&&p.year>=1&&p.year<=6&&[0,1].includes(p.side)&&Array.isArray(p.team)&&p.team.length===3&&new Set(p.team.map(String)).size===3&&p.team.every(id=>byId(id)&&byId(id).battleEligible!==false);}
export function validFighter(p){return validPlayer({...p,team:p.team?.map(c=>c.id)})&&Number.isInteger(p.active)&&p.active>=0&&p.active<3&&Number.isInteger(p.energy)&&p.energy>=0&&p.energy<=3&&typeof p.guard==='boolean'&&Array.isArray(p.team)&&p.team.every(c=>{const card=byId(c.id);return card&&Number.isFinite(c.hp)&&Number.isFinite(c.max)&&c.hp>=0&&c.hp<=c.max&&c.max===card.hp&&TYPES[card.type];});}
function validSeq(seq){return seq&&typeof seq==='object'&&!Array.isArray(seq)&&Object.entries(seq).every(([id,n])=>/^[a-f0-9]{32}$/.test(id)&&Number.isInteger(n)&&n>=0&&n<=1e6);}
export function createMatch(players,roomId,now=Date.now()){
 if(![2,4].includes(players.length)||!players.every(validPlayer)||new Set(players.map(p=>p.id)).size!==players.length||players.filter(p=>p.side===0).length!==players.length/2)throw Error('Ready requires 1 vs 1 or 2 vs 2 with balanced teams.');
 const a=players.filter(p=>p.side===0),b=players.filter(p=>p.side===1),order=a.flatMap((p,i)=>[p,b[i]]);
 return {protocol:PROTOCOL,game:GAME,id:uuid(),roomId,mode:players.length===4?'duo':'duel',version:0,createdAt:now,endedAt:null,players:order.map(p=>({...p,team:p.team.map(id=>({id,hp:byId(id).hp,max:byId(id).hp})),active:0,energy:0,guard:false})),turn:0,actor:order[0].id,phase:'question',winner:null,seq:{},event:null,attacks:0,paused:false};
}
function next(s){s.turn++;if(s.turn>=600){s.phase='end';s.winner='draw';return;}let i=s.players.findIndex(p=>p.id===s.actor);for(let n=0;n<s.players.length;n++){i=(i+1)%s.players.length;if(alive(s.players[i]))break;}s.actor=s.players[i].id;s.phase='question';}
export function questionToken(s){return s.id+':'+s.turn+':'+s.actor;}
export function applyAction(state,cmd,now=Date.now()){
 if(!state||state.phase==='end'||state.paused||cmd.protocol!==PROTOCOL||cmd.game!==GAME||cmd.matchId!==state.id||cmd.version!==state.version||cmd.playerId!==state.actor||cmd.seq!==(state.seq[cmd.playerId]||0)+1)return null;
 const s=structuredClone(state),p=s.players.find(p=>p.id===cmd.playerId);if(!p)return null;
 s.event=null;
 if(cmd.type==='question_result'){
  if(s.phase!=='question'||cmd.questionToken!==questionToken(s)||typeof cmd.correct!=='boolean')return null;
  if(cmd.correct){p.energy=Math.min(3,p.energy+1);s.phase='move';}else next(s);
 }else if(cmd.type==='battle_action'){
  if(s.phase!=='move')return null;
  if(cmd.move==='guard'){p.guard=true;next(s);}
  else if(cmd.move==='charge'){next(s);}
  else if(cmd.move==='switch'){if(!Number.isInteger(cmd.index)||cmd.index===p.active||!p.team[cmd.index]?.hp)return null;p.active=cmd.index;next(s);}
  else if(['basic','special'].includes(cmd.move)){
   const cost=cmd.move==='special'?3:1,target=s.players.find(t=>t.id===cmd.target&&t.side!==p.side&&alive(t));if(!target||p.energy<cost)return null;
   const own=byId(p.team[p.active].id),foe=byId(target.team[target.active].id),before=target.team[target.active].hp;
   const damage=Math.round((cmd.move==='special'?48:25)*(TYPES[foe.type].weak===own.type?1.35:1)*(target.guard?.4:1));p.energy-=cost;target.guard=false;target.team[target.active].hp=Math.max(0,before-damage);s.attacks++;
   s.event={actor:p.id,target:target.id,own:own.id,foe:foe.id,before,after:target.team[target.active].hp,max:target.team[target.active].max,move:cmd.move,damage};
   if(!target.team[target.active].hp){const i=target.team.findIndex(c=>c.hp>0);if(i>=0)target.active=i;}
   if(!s.players.some(t=>t.side!==p.side&&alive(t))){s.phase='end';s.winner=p.side;s.endedAt=now;}else next(s);
  }else return null;
 }else return null;
 s.version++;s.seq[p.id]=cmd.seq;if(s.phase==='end'&&!s.endedAt)s.endedAt=now;return s;
}
export function validSnapshot(s){
 if(!s||s.protocol!==PROTOCOL||s.game!==GAME||!/^[a-f0-9]{32}$/.test(s.id)||![2,4].includes(s.players?.length)||!Number.isInteger(s.version)||s.version<0||s.version>1e7)return false;
 if(!['duel','duo'].includes(s.mode)||!['question','move','end'].includes(s.phase)||![null,0,1,'draw','abandoned'].includes(s.winner)||typeof s.paused!=='boolean')return false;
 if(!Number.isInteger(s.turn)||s.turn<0||s.turn>600||!Number.isInteger(s.attacks)||s.attacks<0)return false;
 if(s.phase!=='end'&&!s.players.some(p=>p.id===s.actor))return false;
 if(!validSeq(s.seq)||!s.players.every(validFighter))return false;
 if(s.endedAt!=null&&!Number.isSafeInteger(s.endedAt))return false;
 return true;
}
export {validSeq};
