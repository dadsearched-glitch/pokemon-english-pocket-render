import {byId,TYPES} from './data.js';
import {PROTOCOL,GAME,uuid,alive,validPlayer,validFighter,validSeq} from './multiplayer-model.js';

export const RAID_LADDERS={
 electric:{name:'Electric',boss:181,stars:{1:{hp:240,shields:0,card:172},2:{hp:320,shields:0,card:25},3:{hp:420,shields:1,card:135},4:{hp:540,shields:2,card:181},5:{hp:680,shields:2,card:null,cosmetic:'electric-arena'}}},
 fire:{name:'Fire',boss:6,stars:{1:{hp:240,shields:0,card:4},2:{hp:320,shields:0,card:37},3:{hp:420,shields:1,card:6},4:{hp:540,shields:2,card:null,cosmetic:'fire-aura'},5:{hp:680,shields:2,card:null,cosmetic:'fire-team'}}},
 water:{name:'Water',boss:9,stars:{1:{hp:240,shields:0,card:54},2:{hp:320,shields:0,card:7},3:{hp:420,shields:1,card:147},4:{hp:540,shields:2,card:131},5:{hp:680,shields:2,card:9}}},
 grass:{name:'Grass',boss:3,stars:{1:{hp:240,shields:0,card:152},2:{hp:320,shields:0,card:1},3:{hp:420,shields:1,card:3},4:{hp:540,shields:2,card:null,cosmetic:'forest-arena'},5:{hp:680,shields:2,card:null,cosmetic:'leaf-team'}}},
 psychic:{name:'Psychic',boss:150,stars:{1:{hp:240,shields:0,card:35},2:{hp:320,shields:0,card:94},3:{hp:420,shields:1,card:448},4:{hp:540,shields:2,card:151},5:{hp:680,shields:2,card:150}}},
 normal:{name:'Normal',boss:143,stars:{1:{hp:240,shields:0,card:39},2:{hp:320,shields:0,card:133},3:{hp:420,shields:1,card:143},4:{hp:540,shields:2,card:149},5:{hp:680,shields:2,card:null,cosmetic:'champion-arena'}}}
};
export const RAID_STARS=[1,2,3,4,5];
export const raidSpec=(ladder,star)=>RAID_LADDERS[ladder]?.stars[star]||null;
export const raidQuestionToken=(s,id)=>s.id+':'+s.round+':'+id;

export function createRaid(players,roomId,{ladder,star,bondLevel=1},now=Date.now()){
 const spec=raidSpec(ladder,star),boss=byId(RAID_LADDERS[ladder]?.boss);
 if(players.length!==2||!players.every(validPlayer)||players[0].id===players[1].id||!spec||!boss)throw Error('Boss Raid needs two trainers, a ladder and a star.');
 bondLevel=Math.max(1,Math.min(5,Number.isInteger(bondLevel)?bondLevel:1));
 const shieldMax=spec.shields?70+star*12:0;
 return {protocol:PROTOCOL,game:GAME,id:uuid(),roomId,mode:'raid',ladder,star,version:0,createdAt:now,endedAt:null,
  players:players.map(p=>({...p,side:0,team:p.team.map(id=>({id,hp:byId(id).hp,max:byId(id).hp})),active:0,energy:0,guard:false,cheer:0,down:false})),
  boss:{id:boss.id,hp:spec.hp,max:spec.hp,shield:0,shieldMax,shieldsLeft:spec.shields,phase:0},
  bondLevel,gauge:bondLevel>=5?1:0,round:0,phase:'question',winner:null,seq:{},event:null,attacks:0,paused:false,answers:{},moves:{},downRounds:0};
}

function markDown(p){if(!alive(p)){p.down=true;p.energy=0;}}
function maybeShield(s){
 const b=s.boss;if(b.shield>0||b.shieldsLeft<=0)return;
 const ratio=b.hp/b.max;
 if(s.star===3&&b.phase===0&&ratio<=.5){b.shield=b.shieldMax;b.shieldsLeft--;b.phase=1;}
 if(s.star>=4&&((b.phase===0&&ratio<=.66)||(b.phase===1&&ratio<=.33))){b.shield=b.shieldMax;b.shieldsLeft--;b.phase++;}
}
function strikeBoss(s,p,move){
 const own=byId(p.team[p.active].id),foe=byId(s.boss.id),cost=move==='special'?3:move==='team'?0:1;
 if(move!=='team'&&p.energy<cost)return 0;
 const base=move==='team'?90:move==='special'?40:22;
 let dmg=Math.round(base*(TYPES[foe.type].weak===own.type?1.35:1));
 if(s.boss.shield>0){const vs=move==='team'?dmg*2:dmg,hit=Math.min(s.boss.shield,vs);s.boss.shield-=hit;dmg=move==='team'?Math.max(0,dmg-Math.floor(hit/2)):Math.max(0,dmg-hit);}
 s.boss.hp=Math.max(0,s.boss.hp-dmg);if(move!=='team')p.energy-=cost;s.attacks++;
 return dmg;
}
function nextRound(s,now){
 s.round++;s.answers={};s.moves={};s.phase='question';
 if(s.round>=80){s.phase='end';s.winner='boss';s.endedAt=now;}
}
function resolve(s,now){
 const living=s.players.filter(p=>!p.down&&alive(p));
 const teamed=living.find(p=>s.moves[p.id]?.move==='team');
 s.event=null;
 if(teamed&&s.gauge>=3){const dmg=strikeBoss(s,teamed,'team');s.gauge=0;s.event={move:'team',actor:teamed.id,own:teamed.team[teamed.active].id,foe:s.boss.id,damage:dmg,before:s.boss.hp+dmg,after:s.boss.hp,max:s.boss.max};}
 for(const p of living){
  const cmd=s.moves[p.id];if(!cmd)continue;
  if(cmd.move==='guard')p.guard=true;
  else if(cmd.move==='switch'){if(Number.isInteger(cmd.index)&&cmd.index!==p.active&&p.team[cmd.index]?.hp)p.active=cmd.index;}
  else if(['basic','special'].includes(cmd.move)&&!(teamed&&cmd.move&&s.event?.move==='team'&&p.id===teamed.id)){
   if((cmd.move==='special'?3:1)<=p.energy){const before=s.boss.hp,dmg=strikeBoss(s,p,cmd.move);if(!s.event)s.event={move:cmd.move,actor:p.id,own:p.team[p.active].id,foe:s.boss.id,damage:dmg,before,after:s.boss.hp,max:s.boss.max};}
  }
 }
 maybeShield(s);
 if(s.boss.hp<=0){s.phase='end';s.winner='raiders';s.endedAt=now;return;}
 if(!living.length){s.downRounds++;if(s.downRounds>=3){s.phase='end';s.winner='boss';s.endedAt=now;}else nextRound(s,now);return;}
 s.downRounds=0;
 const t=living[s.round%living.length],raw=16+s.star*5,dmg=Math.round(t.guard?raw*.4:raw);t.guard=false;
 const card=t.team[t.active],before=card.hp;card.hp=Math.max(0,card.hp-dmg);
 if(!card.hp){const i=t.team.findIndex(c=>c.hp>0);if(i>=0)t.active=i;else markDown(t);}
 if(!s.players.some(alive)){s.players.forEach(markDown);s.downRounds++;}
 nextRound(s,now);
}

export function applyRaidAction(state,cmd,now=Date.now()){
 if(!state||state.mode!=='raid'||state.phase==='end'||state.paused||cmd.protocol!==PROTOCOL||cmd.game!==GAME||cmd.matchId!==state.id)return null;
 if(!Number.isInteger(cmd.version)||cmd.version>state.version||cmd.seq!==(state.seq[cmd.playerId]||0)+1)return null;
 const s=structuredClone(state),p=s.players.find(x=>x.id===cmd.playerId);if(!p)return null;
 if(cmd.type==='question_result'){
  if(s.phase!=='question'||cmd.questionToken!==raidQuestionToken(s,p.id)||typeof cmd.correct!=='boolean'||s.answers[p.id]!==undefined)return null;
  s.answers[p.id]=cmd.correct;
  if(p.down){if(cmd.correct){p.cheer=(p.cheer||0)+1;const cheersNeeded=s.bondLevel>=4?1:2;if(p.cheer>=cheersNeeded){const i=p.team.findIndex(c=>c.hp<=0);if(i>=0){p.team[i].hp=Math.max(1,Math.round(p.team[i].max*(s.bondLevel>=4?.45:.35)));p.active=i;p.down=false;p.cheer=0;}}}}
  else if(cmd.correct)p.energy=Math.min(3,p.energy+1);
  if(s.players.every(x=>s.answers[x.id]!==undefined)){
   const up=s.players.filter(x=>!x.down);
   if(up.length>=2&&up.every(x=>s.answers[x.id]))s.gauge=Math.min(3,s.gauge+1);
   s.moves={};s.phase=up.length?'move':'question';
   if(!up.length){s.downRounds++;if(s.downRounds>=3){s.phase='end';s.winner='boss';s.endedAt=now;}else{s.answers={};s.round++;}}
  }
 }else if(cmd.type==='battle_action'){
  if(s.phase!=='move'||p.down||s.moves[p.id])return null;
  if(cmd.move==='switch'&&(!Number.isInteger(cmd.index)||cmd.index===p.active||!p.team[cmd.index]?.hp))return null;
  if(cmd.move==='team'&&s.gauge<3)return null;
  if(['basic','special'].includes(cmd.move)&&p.energy<(cmd.move==='special'?3:1))return null;
  if(!['guard','charge','switch','basic','special','team'].includes(cmd.move))return null;
  s.moves[p.id]={move:cmd.move,index:cmd.index};
  if(s.players.filter(x=>!x.down).every(x=>s.moves[x.id]))resolve(s,now);
 }else return null;
 s.version++;s.seq[p.id]=cmd.seq;if(s.phase==='end'&&!s.endedAt)s.endedAt=now;return s;
}

export function validRaid(s){
 if(!s||s.protocol!==PROTOCOL||s.game!==GAME||s.mode!=='raid'||!/^[a-f0-9]{32}$/.test(s.id)||s.players?.length!==2||!Number.isInteger(s.version)||s.version<0||s.version>1e7)return false;
 if(!RAID_LADDERS[s.ladder]||!RAID_STARS.includes(s.star)||!['question','move','end'].includes(s.phase)||![null,'raiders','boss','abandoned'].includes(s.winner)||typeof s.paused!=='boolean')return false;
 if(!Number.isInteger(s.bondLevel)||s.bondLevel<1||s.bondLevel>5||!Number.isInteger(s.round)||s.round<0||s.round>80||!Number.isInteger(s.gauge)||s.gauge<0||s.gauge>3||!Number.isInteger(s.attacks)||s.attacks<0)return false;
 if(!validSeq(s.seq)||!s.players.every(p=>validFighter(p)&&typeof p.down==='boolean'))return false;
 const b=s.boss,card=byId(b?.id);if(!card||!Number.isFinite(b.hp)||b.hp<0||b.hp>b.max||b.max!==raidSpec(s.ladder,s.star).hp)return false;
 if(!Number.isInteger(b.shield)||b.shield<0||b.shield>b.shieldMax||!Number.isInteger(b.shieldsLeft)||b.shieldsLeft<0)return false;
 if(s.endedAt!=null&&!Number.isSafeInteger(s.endedAt))return false;
 return true;
}
