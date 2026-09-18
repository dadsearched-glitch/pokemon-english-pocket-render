import {initLevels,migrateLevels,validLevelProgress} from './learning-level.js';
import {COURSE_VERSION,enterUnit} from './course.js';
import {CARDS,BATTLE_CARDS,byId,TYPES} from './data.js';
import {SET_CARDS} from './catalogue.js';
export const SAVE_KEY='pocket-english-v1'; // Keep the v6 key so existing browser progress migrates in place.
export const SAVE_VERSION=2;
export const MAX_PROFILES=5;
const COMPANIONS=[25,133,7,4,1];
export const freshProfile=()=>({courseVersion:COURSE_VERSION,unitProgress:{},courseComplete:false,xp:0,chapter:0,done:[],partial:{},packs:0,opened:0,cards:[],pendingPack:null,review:{},mistakes:[],battles:0,wins:0,lessonCount:0,days:[],battle:null,route:'home'});
export const freshSave=()=>({version:SAVE_VERSION,active:null,profileOrder:[],profiles:{},sound:true,voice:'molly'});
const cleanName=name=>String(name??'').trim().replace(/\s+/g,' ').slice(0,18);
export function createProfile(save,name,level=3){
 const displayName=cleanName(name),year=Number(level);if(!displayName)return {ok:false,error:'이름을 입력해 주세요.'};
 const keys=Object.keys(save.profiles||{});if(keys.length>=MAX_PROFILES)return {ok:false,error:'프로필은 최대 5개까지 만들 수 있어요.'};
 if(keys.some(k=>(save.profiles[k].displayName||k).toLocaleLowerCase()===displayName.toLocaleLowerCase()))return {ok:false,error:'같은 이름의 프로필이 이미 있어요.'};
 if(![1,2,3,4,5,6].includes(year))return {ok:false,error:'Year 1~6 중에서 골라 주세요.'};
 let n=1,id='p1';while(save.profiles[id])id='p'+(++n);
 const p=freshProfile();p.displayName=displayName;p.companionId=COMPANIONS[keys.length%COMPANIONS.length];initLevels(p,year);
 save.profiles[id]=p;save.profileOrder||=[];save.profileOrder.push(id);save.active=id;return {ok:true,id,profile:p};
}
export function migrateSave(save){
 if(!save||typeof save!=='object'||!save.profiles||typeof save.profiles!=='object')return false;
 let changed=false;
 if(save.version===1){save.version=SAVE_VERSION;changed=true;}else if(save.version!==SAVE_VERSION)return false;
 if(save.voice!=='molly'){save.voice='molly';changed=true;}
 const keys=Object.keys(save.profiles);
 if(!Array.isArray(save.profileOrder)){save.profileOrder=[...keys];changed=true;}else{
  const order=save.profileOrder.filter((k,i,a)=>typeof k==='string'&&save.profiles[k]&&a.indexOf(k)===i);for(const k of keys)if(!order.includes(k))order.push(k);
  if(order.length!==save.profileOrder.length||order.some((k,i)=>k!==save.profileOrder[i])){save.profileOrder=order;changed=true;}
 }
 keys.forEach((key,i)=>{const p=save.profiles[key];if(!p.displayName){p.displayName=key;changed=true;}if(!Number.isFinite(Number(p.companionId))||!byId(p.companionId)){p.companionId=key==='Tony'?133:key==='Kai'?25:COMPANIONS[i%COMPANIONS.length];changed=true;}});
 if(save.active&&!save.profiles[save.active]){save.active=null;changed=true;}
 if(keys.length>MAX_PROFILES)return false;
 return migrateLevels(save)||changed;
}
export function completeMission(p,stage,now=Date.now()){
 if(p.done.includes(stage))return false;
 p.done.push(stage);p.done.sort();p.xp+=10;p.lessonCount++;delete p.partial[stage];
 const day=new Date(now).toLocaleDateString('en-CA');if(!p.days.includes(day))p.days.push(day);
 if(p.done.length===6)p.packs++;
 p.unitProgress||={};p.unitProgress[p.chapter]={done:[...p.done],partial:structuredClone(p.partial)};
 return true;
}
export function reviewWord(p,word,correct,now=Date.now(),meta={}){
 const assisted=Boolean(meta?.assisted),r=p.review[word]||{level:0,due:0,seen:0,lastSuccess:0};r.seen++;
 r.stats||={independent:0,assisted:0,misses:0};
 if(!correct){r.level=0;r.due=now;r.stats.misses++;r.lastMiss=now;}
 else if(assisted){r.stats.assisted++;r.lastAssisted=now;r.due=Math.min(r.due||Infinity,now+5*60*1000);if(!Number.isFinite(r.due))r.due=now+5*60*1000;}
 else{r.stats.independent++;r.lastIndependent=now;if(!r.lastSuccess||now-r.lastSuccess>=86400000){r.level=Math.min(5,r.level+1);r.lastSuccess=now;r.due=now+[0,1,3,7,14,30][r.level]*86400000;}else if(r.level===0){r.due=r.lastSuccess+86400000;}}
 p.review[word]=r;if((!correct||assisted)&&!p.mistakes.includes(word))p.mistakes.push(word);if(correct&&!assisted)p.mistakes=p.mistakes.filter(w=>w!==word);
}
export function dueWords(p,now=Date.now()){return [...new Set([...p.mistakes,...Object.keys(p.review).filter(w=>p.review[w].due<=now)])];}
export function nextChapter(p){if(p.done.length!==6)return false;if(p.chapter>=23){p.courseComplete=Array.from({length:24},(_,i)=>(i===p.chapter?p.done:p.unitProgress?.[i]?.done)?.length===6).every(Boolean);p.route='course';return true;}return enterUnit(p,p.chapter+1);}
export function openPack(p,random=Math.random){
 if(p.pendingPack)return p.pendingPack;
 if(p.packs<1)return null;
 const pick=pool=>pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
 const cards=[];for(let i=0;i<5;i++){
  let pool;
  if(i===3){const roll=random(),finish=roll<.08?'crown':roll<.20?'immersive':roll<.55?'rainbow':'illustration';pool=SET_CARDS.filter(c=>c.finish===finish);}
  else if(i===4){const roll=random(),finish=roll<.05?'crown':roll<.15?'immersive':roll<.50?'rainbow':'holo';pool=SET_CARDS.filter(c=>c.isEx&&c.finish===finish);}
  else{const roll=random();pool=SET_CARDS.filter(c=>(i>=2||c.battleEligible)&&(roll<.22?c.isEx:roll<.37?c.specialArt&&!c.isEx:!c.isEx&&!c.specialArt));}
  pool=pool.filter(c=>!cards.includes(c.id));
  if(!pool.length)pool=SET_CARDS.filter(c=>!cards.includes(c.id)&&(i===4?c.isEx:i===3?c.specialArt:c.battleEligible));
  const unseen=pool.filter(c=>!p.cards.includes(c.id));if(unseen.length&&random()<.8)pool=unseen;
  cards.push(pick(pool).id);
 }
 p.packs--;p.opened++;p.cards.push(...cards);p.pendingPack={cards,index:-1};return p.pendingPack;
}
export function revealNext(p){if(!p.pendingPack)return false;if(p.pendingPack.index>=4){p.pendingPack=null;return false;}p.pendingPack.index++;return true;}
export function startBattle(p,team){
 if(p.battle&&!p.battle.result)return p.battle;
 if(team.length!==3||new Set(team.map(String)).size!==3||!team.every(id=>p.cards.includes(id)&&byId(id)&&byId(id).battleEligible!==false))return null;
 const enemies=[BATTLE_CARDS[(p.battles*3+3)%BATTLE_CARDS.length],BATTLE_CARDS[(p.battles*3+6)%BATTLE_CARDS.length],BATTLE_CARDS[(p.battles*3+16)%BATTLE_CARDS.length]];
 p.battles++;p.battle={team:team.map(id=>({id,hp:byId(id).hp})),active:0,enemies:enemies.map(c=>({id:c.id,hp:80,max:80})),enemy:0,energy:0,combo:0,guard:false,turn:0,phase:'question',result:null,paid:false,log:'Answer to charge English Power.'};return p.battle;
}
function enemyHit(b,damage){let t=b.team[b.active];t.hp=Math.max(0,t.hp-Math.round(damage*(b.guard?.4:1)));b.guard=false;if(!t.hp){const next=b.team.findIndex(t=>t.hp>0);if(next<0){b.result='lost';b.phase='end';b.log='A brave try! Your team will be fully healed for the next match.';}else{b.active=next;b.log+=' A teammate steps in!';}}}
export function battleAnswer(p,correct){const b=p.battle;if(!b||b.result||b.phase!=='question')return false;
 b.turn++;if(correct){b.energy=Math.min(3,b.energy+1);b.combo++;b.phase='move';b.log='Great English! Choose a move, or charge again.';}else{b.combo=0;b.log='Keep trying! The opponent deals 10 damage.';enemyHit(b,10);}return true;
}
export function battleMove(p,move){const b=p.battle;if(!b||b.result||b.phase!=='move')return false;
 if(move==='charge'){if(b.energy>=3)return false;b.phase='question';b.log='Build more energy for your special move.';return true;}
 if(move==='guard'){b.guard=true;b.log='Shield up! Incoming damage reduced.';b.phase='question';enemyHit(b,16);return true;}
 if(!['basic','special'].includes(move)||b.energy<(move==='special'?3:1))return false;
 const own=byId(b.team[b.active].id),enemy=b.enemies[b.enemy],foe=byId(enemy.id),weak=TYPES[foe.type].weak===own.type;
 const damage=Math.round(((move==='special'?48:25)+Math.min(4,b.combo)*2)*(weak?1.35:1));b.energy-=move==='special'?3:1;enemy.hp=Math.max(0,enemy.hp-damage);b.log=`${move==='special'?own.power:own.move}! ${damage} damage${weak?' · Super effective!':''}`;
 if(enemy.hp===0){b.enemy++;if(b.enemy===b.enemies.length){b.enemy--;b.result='won';b.phase='end';if(!b.paid){p.xp+=20;p.wins++;b.paid=true;}b.log='Victory! Your team earned 20 XP.';return true;}b.log+=' Next opponent!';}else enemyHit(b,16);
 if(!b.result)b.phase='question';return true;
}
export function switchCard(p,index){const b=p.battle;if(!b||b.result||index===b.active||!b.team[index]?.hp)return false;b.active=index;b.log=`${byId(b.team[index].id).name} is ready!`;return true;}
export function validSave(s){
 if(s?.version!==SAVE_VERSION||!s.profiles||typeof s.profiles!=='object')return false;const keys=Object.keys(s.profiles);if(keys.length>MAX_PROFILES)return false;
 if(!Array.isArray(s.profileOrder)||s.profileOrder.length!==keys.length||new Set(s.profileOrder).size!==keys.length||s.profileOrder.some(k=>!s.profiles[k]))return false;
 const valid=keys.every(k=>{const p=s.profiles[k],name=p?.displayName;return p&&typeof name==='string'&&name.trim().length>0&&name.length<=18&&validLevelProgress(p)&&Number.isFinite(p.xp)&&Number.isInteger(p.chapter)&&p.chapter>=0&&p.chapter<24&&Array.isArray(p.cards)&&p.cards.every(id=>!!byId(id))&&Array.isArray(p.done)&&p.done.every(i=>Number.isInteger(i)&&i>=0&&i<6)&&new Set(p.done).size===p.done.length&&Number.isInteger(p.packs)&&p.packs>=0&&p.review&&p.partial;});
 return valid&&(!s.active||Boolean(s.profiles[s.active]));
}
