import {byId,TYPES} from './data.js';
import {PROTOCOL,GAME,uuid,alive,validPlayer,validFighter,validSeq} from './multiplayer-model.js';

export const DUNGEON_THEMES={
 forest:{name:'Forest Trail',wild:[1,152],boss:3,badge:'dungeon-forest'},
 tide:{name:'Tide Path',wild:[7,54],boss:9,badge:'dungeon-tide'},
 ember:{name:'Ember Hollow',wild:[4,37],boss:6,badge:'dungeon-ember'}
};
export const DUNGEON_ITEMS=['berry','orb','charm','shield','spark'];
export const DUNGEON_ITEM_LABEL={berry:'Berry · 열매',orb:'Orb · 구슬',charm:'Charm · 부적',shield:'Shield · 방패',spark:'Spark · 스파크'};
export const dungeonToken=(s,id)=>s.id+':'+s.node+':'+s.round+':'+id;
const rng=seed=>{let x=parseInt(String(seed).replace(/[^a-f0-9]/g,'').slice(0,8),16)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};};

function fighter(p){return {...p,side:0,team:p.team.map(id=>({id,hp:byId(id).hp,max:byId(id).hp})),active:0,energy:0,guard:false,down:false,cheer:0};}
function hitFoe(s,p,foe,move,bonus=1){
 const own=byId(p.team[p.active].id),card=byId(foe.id),cost=move==='special'?3:move==='duo'||move==='team'?0:1;
 if(move!=='duo'&&move!=='team'&&p.energy<cost)return 0;
 const base=move==='duo'||move==='team'?80:move==='special'?40:22;
 let dmg=Math.round(base*bonus*(TYPES[card.type].weak===own.type?1.35:1)*(s.items?.includes('charm')&&own.type===card.type?1.15:1));
 if(foe.guard){dmg=Math.round(dmg*.4);foe.guard=false;}
 foe.hp=Math.max(0,foe.hp-dmg);if(move!=='duo'&&move!=='team')p.energy-=cost;s.attacks++;return dmg;
}
function afterFaint(p,s){
 if(p.team[p.active].hp)return;
 if(s.items?.includes('shield')){p.team[p.active].hp=Math.max(1,Math.round(p.team[p.active].max*.35));s.items=s.items.filter(i=>i!=='shield');return;}
 const i=p.team.findIndex(c=>c.hp>0);if(i>=0)p.active=i;else p.down=true;
}

export function createDungeon(players,roomId,{theme='forest'}={},now=Date.now()){
 const spec=DUNGEON_THEMES[theme];if(players.length!==2||!players.every(validPlayer)||players[0].id===players[1].id||!spec)throw Error('Dungeon needs two trainers and a trail.');
 const seed=uuid(),r=rng(seed),pick=arr=>arr[Math.floor(r()*arr.length)];
 const nodes=[
  {type:'battle',foe:spec.wild[0],hp:90},
  {type:'vote',options:[pick(DUNGEON_ITEMS),pick(DUNGEON_ITEMS.filter(i=>true))]},
  {type:'quiz'},
  {type:'camp'},
  {type:'boss',foe:spec.boss,hp:170}
 ];
 if(nodes[1].options[0]===nodes[1].options[1])nodes[1].options[1]=DUNGEON_ITEMS.find(i=>i!==nodes[1].options[0]);
 const s={protocol:PROTOCOL,game:GAME,id:seed,roomId,mode:'dungeon',theme,version:0,createdAt:now,endedAt:null,players:players.map(fighter),
  nodes,node:0,items:[],foe:null,gauge:0,round:0,phase:'question',winner:null,seq:{},event:null,attacks:0,paused:false,answers:{},moves:{},votes:{}};
 enterNode(s,now);return s;
}
function enterNode(s,now){
 const n=s.nodes[s.node];
 if(!n){s.phase='end';s.winner='clear';s.endedAt=now;return;}
 s.answers={};s.moves={};s.votes={};s.round=0;s.event=null;
 if(n.type==='camp'){s.players.forEach(p=>p.team.forEach(c=>{c.hp=c.max;}));s.players.forEach(p=>{p.down=false;p.energy=Math.min(3,p.energy+1);});s.node++;enterNode(s,now);return;}
 if(n.type==='vote'){s.phase='vote';s.foe=null;return;}
 if(n.type==='quiz'){s.phase='quiz';s.foe=null;return;}
 s.foe={id:n.foe,hp:n.hp,max:n.hp};s.phase='question';s.gauge=s.items.includes('spark')?1:0;
 if(s.items.includes('orb'))s.players.forEach(p=>p.energy=Math.min(3,p.energy+1));
 if(s.items.includes('berry')){s.players.forEach(p=>{const c=p.team[p.active];c.hp=Math.min(c.max,c.hp+40);});s.items=s.items.filter(i=>i!=='berry');}
}
function resolveDungeonBattle(s,now){
 const living=s.players.filter(p=>!p.down&&alive(p));
 const teamed=living.find(p=>['team','duo'].includes(s.moves[p.id]?.move));
 s.event=null;
 if(teamed&&s.gauge>=3){const before=s.foe.hp,dmg=hitFoe(s,teamed,s.foe,'team');s.gauge=0;s.event={move:'team',actor:teamed.id,own:teamed.team[teamed.active].id,foe:s.foe.id,damage:dmg,before,after:s.foe.hp,max:s.foe.max};}
 for(const p of living){
  const cmd=s.moves[p.id];if(!cmd||['team','duo'].includes(cmd.move))continue;
  if(cmd.move==='guard')p.guard=true;
  else if(cmd.move==='switch'&&p.team[cmd.index]?.hp)p.active=cmd.index;
  else if(['basic','special'].includes(cmd.move)&&p.energy>=(cmd.move==='special'?3:1)){
   const before=s.foe.hp,dmg=hitFoe(s,p,s.foe,cmd.move);if(!s.event)s.event={move:cmd.move,actor:p.id,own:p.team[p.active].id,foe:s.foe.id,damage:dmg,before,after:s.foe.hp,max:s.foe.max};
  }
 }
 if(s.foe.hp<=0){s.node++;enterNode(s,now);return;}
 if(living.length){
  const t=living[s.round%living.length],raw=14,dmg=Math.round(t.guard?raw*.4:raw);t.guard=false;
  t.team[t.active].hp=Math.max(0,t.team[t.active].hp-dmg);afterFaint(t,s);
 }
 s.round++;s.answers={};s.moves={};s.phase='question';
 if(!s.players.some(alive)){s.phase='end';s.winner='fail';s.endedAt=now;}
 if(s.round>=40){s.phase='end';s.winner='fail';s.endedAt=now;}
}
export function applyDungeonAction(state,cmd,now=Date.now()){
 if(!state||state.mode!=='dungeon'||state.phase==='end'||state.paused||cmd.protocol!==PROTOCOL||cmd.game!==GAME||cmd.matchId!==state.id)return null;
 if(!Number.isInteger(cmd.version)||cmd.version>state.version||cmd.seq!==(state.seq[cmd.playerId]||0)+1)return null;
 const s=structuredClone(state),p=s.players.find(x=>x.id===cmd.playerId);if(!p)return null;
 if(cmd.type==='vote'){
  if(s.phase!=='vote'||!s.nodes[s.node].options.includes(cmd.item)||s.votes[p.id])return null;
  s.votes[p.id]=cmd.item;
  if(s.players.every(x=>s.votes[x.id])){const a=s.votes[s.players[0].id],b=s.votes[s.players[1].id],pick=a===b?a:s.nodes[s.node].options[0];if(!s.items.includes(pick))s.items.push(pick);s.node++;enterNode(s,now);}
 }else if(cmd.type==='question_result'){
  if(!['question','quiz'].includes(s.phase)||cmd.questionToken!==dungeonToken(s,p.id)||typeof cmd.correct!=='boolean'||s.answers[p.id]!==undefined)return null;
  s.answers[p.id]=cmd.correct;if(cmd.correct&&s.phase==='question'&&!p.down)p.energy=Math.min(3,p.energy+1);
  if(s.players.every(x=>s.answers[x.id]!==undefined)){
   if(s.phase==='quiz'){if(Object.values(s.answers).some(Boolean)&&!s.items.includes('berry'))s.items.push('berry');s.node++;enterNode(s,now);}
   else{const up=s.players.filter(x=>!x.down);if(up.length>=2&&up.every(x=>s.answers[x.id]))s.gauge=Math.min(3,s.gauge+1);s.phase=up.length?'move':'question';s.moves={};if(!up.length){s.phase='end';s.winner='fail';s.endedAt=now;}}
  }
 }else if(cmd.type==='battle_action'){
  if(s.phase!=='move'||p.down||s.moves[p.id])return null;
  if(!['guard','charge','switch','basic','special','team'].includes(cmd.move))return null;
  if(cmd.move==='team'&&s.gauge<3)return null;
  if(['basic','special'].includes(cmd.move)&&p.energy<(cmd.move==='special'?3:1))return null;
  s.moves[p.id]={move:cmd.move,index:cmd.index};
  if(s.players.filter(x=>!x.down).every(x=>s.moves[x.id]))resolveDungeonBattle(s,now);
 }else return null;
 s.version++;s.seq[p.id]=cmd.seq;if(s.phase==='end'&&!s.endedAt)s.endedAt=now;return s;
}
export function validDungeon(s){
 if(!s||s.mode!=='dungeon'||s.protocol!==PROTOCOL||s.game!==GAME||!/^[a-f0-9]{32}$/.test(s.id)||s.players?.length!==2||!DUNGEON_THEMES[s.theme])return false;
 if(!['question','move','vote','quiz','end'].includes(s.phase)||![null,'clear','fail','abandoned'].includes(s.winner)||typeof s.paused!=='boolean')return false;
 if(!Number.isInteger(s.node)||s.node<0||s.node>5||!Array.isArray(s.items)||!validSeq(s.seq)||!s.players.every(validFighter))return false;
 return true;
}

export const tagToken=(s,id)=>s.id+':'+s.round+':'+id;
export function createTag(players,roomId,now=Date.now()){
 if(players.length!==2||!players.every(validPlayer)||players[0].id===players[1].id)throw Error('Tag battle needs two trainers against two AI.');
 const foes=[{id:25,role:'attacker'},{id:6,role:'defender'}].map(f=>({...f,hp:byId(f.id).hp,max:byId(f.id).hp,energy:1,guard:false}));
 return {protocol:PROTOCOL,game:GAME,id:uuid(),roomId,mode:'tag',version:0,createdAt:now,endedAt:null,players:players.map(fighter),
  foes,chain:0,round:0,phase:'question',winner:null,seq:{},event:null,attacks:0,paused:false,answers:{},moves:{}};
}
function livingFoes(s){return s.foes.filter(f=>f.hp>0);}
function resolveTag(s,now){
 const living=s.players.filter(p=>!p.down&&alive(p));
 const duo=living.find(p=>s.moves[p.id]?.move==='duo');
 s.event=null;
 if(duo&&s.chain>=3){
  const t=livingFoes(s)[0];if(t){const before=t.hp,dmg=hitFoe(s,duo,t,'duo');s.chain=0;s.event={move:'duo',actor:duo.id,own:duo.team[duo.active].id,foe:t.id,damage:dmg,before,after:t.hp,max:t.max};}
 }
 for(const p of living){
  const cmd=s.moves[p.id];if(!cmd||cmd.move==='duo')continue;
  if(cmd.move==='guard')p.guard=true;
  else if(cmd.move==='switch'&&p.team[cmd.index]?.hp)p.active=cmd.index;
  else if(['basic','special'].includes(cmd.move)){
   const t=s.foes.find(f=>String(f.id)===String(cmd.target)&&f.hp>0)||livingFoes(s)[0];
   if(t&&p.energy>=(cmd.move==='special'?3:1)){const before=t.hp,dmg=hitFoe(s,p,t,cmd.move);if(!s.event)s.event={move:cmd.move,actor:p.id,own:p.team[p.active].id,foe:t.id,damage:dmg,before,after:t.hp,max:t.max};}
  }
 }
 if(!livingFoes(s).length){s.phase='end';s.winner='humans';s.endedAt=now;return;}
 for(const [i,foe] of s.foes.entries()){
  if(!foe.hp)continue;
  const targets=s.players.filter(p=>!p.down&&alive(p));if(!targets.length)break;
  const t=targets[(s.round+i)%targets.length];
  if(foe.role==='defender'&&s.round%2===0){foe.guard=true;continue;}
  const raw=Math.round(18*(t.guard?.4:1));t.guard=false;
  t.team[t.active].hp=Math.max(0,t.team[t.active].hp-raw);afterFaint(t,s);
 }
 s.round++;s.answers={};s.moves={};s.phase='question';
 if(!s.players.some(alive)){s.phase='end';s.winner='ai';s.endedAt=now;}
 if(s.round>=50){s.phase='end';s.winner='ai';s.endedAt=now;}
}
export function applyTagAction(state,cmd,now=Date.now()){
 if(!state||state.mode!=='tag'||state.phase==='end'||state.paused||cmd.protocol!==PROTOCOL||cmd.game!==GAME||cmd.matchId!==state.id)return null;
 if(!Number.isInteger(cmd.version)||cmd.version>state.version||cmd.seq!==(state.seq[cmd.playerId]||0)+1)return null;
 const s=structuredClone(state),p=s.players.find(x=>x.id===cmd.playerId);if(!p)return null;
 if(cmd.type==='question_result'){
  if(s.phase!=='question'||cmd.questionToken!==tagToken(s,p.id)||typeof cmd.correct!=='boolean'||s.answers[p.id]!==undefined)return null;
  s.answers[p.id]=cmd.correct;if(cmd.correct&&!p.down)p.energy=Math.min(3,p.energy+1);
  if(s.players.every(x=>s.answers[x.id]!==undefined)){
   const up=s.players.filter(x=>!x.down);
   if(up.length>=2&&up.every(x=>s.answers[x.id]))s.chain=Math.min(3,s.chain+1);
   s.phase=up.length?'move':'question';s.moves={};if(!up.length){s.phase='end';s.winner='ai';s.endedAt=now;}
  }
 }else if(cmd.type==='battle_action'){
  if(s.phase!=='move'||p.down||s.moves[p.id])return null;
  if(!['guard','charge','switch','basic','special','duo'].includes(cmd.move))return null;
  if(cmd.move==='duo'&&s.chain<3)return null;
  if(['basic','special'].includes(cmd.move)&&p.energy<(cmd.move==='special'?3:1))return null;
  s.moves[p.id]={move:cmd.move,target:cmd.target,index:cmd.index};
  if(s.players.filter(x=>!x.down).every(x=>s.moves[x.id]))resolveTag(s,now);
 }else return null;
 s.version++;s.seq[p.id]=cmd.seq;if(s.phase==='end'&&!s.endedAt)s.endedAt=now;return s;
}
export function validTag(s){
 if(!s||s.mode!=='tag'||s.protocol!==PROTOCOL||s.game!==GAME||!/^[a-f0-9]{32}$/.test(s.id)||s.players?.length!==2||s.foes?.length!==2)return false;
 if(!['question','move','end'].includes(s.phase)||![null,'humans','ai','abandoned'].includes(s.winner)||typeof s.paused!=='boolean')return false;
 if(!Number.isInteger(s.chain)||s.chain<0||s.chain>3||!validSeq(s.seq)||!s.players.every(validFighter))return false;
 return s.foes.every(f=>byId(f.id)&&Number.isFinite(f.hp)&&f.hp>=0&&f.hp<=f.max);
}
