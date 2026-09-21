import {byId} from './data.js';

export function activeUnit(player){
 if(!player||!Array.isArray(player.team)||!Number.isInteger(player.active))return null;
 const slot=player.team[player.active];
 if(!slot)return null;
 const card=byId(slot.id);
 if(!card)return null;
 return {
  playerId:player.id,
  playerName:player.name,
  side:player.side,
  active:player.active,
  cardId:card.id,
  card,
  hp:slot.hp,
  max:slot.max??card.hp,
  energy:player.energy||0,
  down:player.down===true,
  guard:player.guard===true
 };
}

export function duelPerspective(match,viewerId){
 if(!match||!Array.isArray(match.players))return {self:null,opponent:null};
 const viewer=match.players.find(p=>p.id===viewerId)||match.players[0]||null;
 if(!viewer)return {self:null,opponent:null};
 const liveOpponent=match.players.find(p=>p.side!==viewer.side&&p.team?.some(c=>c.hp>0));
 const opponent=liveOpponent||match.players.find(p=>p.side!==viewer.side)||null;
 return {self:activeUnit(viewer),opponent:activeUnit(opponent)};
}

export function humanUnits(match){
 return (match?.players||[]).map(activeUnit).filter(Boolean);
}

export function sideUnits(match,side){
 return humanUnits(match).filter(unit=>unit.side===side);
}

export function foeUnits(match){
 if(!match)return [];
 if(match.mode==='raid'){
  const card=byId(match.boss?.id);
  return card?[{foeId:'boss',cardId:card.id,card,hp:match.boss.hp,max:match.boss.max,shield:match.boss.shield||0,shieldMax:match.boss.shieldMax||0,role:'boss'}]:[];
 }
 if(match.mode==='dungeon'){
  const card=byId(match.foe?.id);
  return card?[{foeId:'dungeon',cardId:card.id,card,hp:match.foe.hp,max:match.foe.max,role:'encounter'}]:[];
 }
 if(match.mode==='tag'){
  return (match.foes||[]).map((foe,index)=>{const card=byId(foe.id);return card?{foeId:'ai-'+index,cardId:card.id,card,hp:foe.hp,max:foe.max,role:foe.role||'ai'}:null;}).filter(Boolean);
 }
 return [];
}
