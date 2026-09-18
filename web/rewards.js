import {uuid,validSnapshot} from './multiplayer-model.js';
import {validRaid,raidSpec,RAID_LADDERS} from './raid-model.js';
import {validDungeon,DUNGEON_THEMES,validTag} from './coop-model.js';

const emptyRaid=()=>({first:{},stars:{},cosmetics:[]});
const emptyDay=()=>({date:'',raid:0,dungeon:0,tag:0});
export const localDay=(now=Date.now())=>{const d=new Date(now);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
export function pairKey(a,b){return [a,b].sort().join(':');}
function ensureBond(m,me,partner){if(!partner)return null;const key=pairKey(me.id,partner.id);m.bond[key]||(m.bond[key]={xp:0,level:1,name:partner.name||''});return key;}
function bumpBond(m,key){if(!key)return;m.bond[key].xp++;m.bond[key].level=Math.min(5,1+Math.floor(m.bond[key].xp/3));}

export const SHOP=[
 {id:'title-explorer',kind:'title',cost:10,name:'Explorer title'},
 {id:'frame-leaf',kind:'frame',cost:10,name:'Leaf frame'},
 {id:'entrance-spark',kind:'entrance',cost:15,name:'Entrance glint'},
 {id:'victory-banner',kind:'victory',cost:20,name:'Victory banner'},
 {id:'aura-type',kind:'aura',cost:25,name:'Type aura'},
 {id:'arena-dusk',kind:'arena',cost:30,name:'Dusk arena'},
 {id:'team-skin',kind:'team',cost:40,name:'Team Attack skin'}
];
export const DISCOVERY=[
 [25,'disc-25','Explorer badge','badge'],
 [50,'disc-50','Profile frame','frame'],
 [100,'disc-100','Collection background','binder'],
 [150,'disc-150','Battle banner','victory'],
 [200,'disc-200','Pack-room theme','pack'],
 [250,'disc-250','Trainer aura','aura'],
 [310,'disc-310','Master Collector','title']
];
export const sparkOf=(cards,id)=>Math.max(0,cards.filter(x=>String(x)===String(id)).length-1);
export const sparkTier=n=>n>=7?'master':n>=4?'trail':n>=2?'glint':n>=1?'aura':'none';
export const COSMETIC_KINDS=['title','frame','entrance','victory','aura','arena','team','badge','binder','pack'];
const COSMETIC_ID=/^[a-f0-9]{32}$|^[a-z0-9-]{3,40}$/;
const PLAYER_ID=/^[a-f0-9]{32}$/;
const RAID_COSMETICS=['electric-arena','fire-aura','fire-team','forest-arena','leaf-team','champion-arena'];
const DUNGEON_COSMETICS=Object.values(DUNGEON_THEMES).map(t=>t.badge);
export function knownCosmeticId(id){
 return SHOP.some(x=>x.id===id)||DISCOVERY.some(x=>x[1]===id)||RAID_COSMETICS.includes(id)||DUNGEON_COSMETICS.includes(id);
}
function kindOf(id){const shop=SHOP.find(x=>x.id===id);if(shop)return shop.kind;const disc=DISCOVERY.find(x=>x[1]===id);return disc?disc[3]:null;}
function validBondMap(bond){
 if(!bond||typeof bond!=='object'||Array.isArray(bond))return false;
 return Object.entries(bond).every(([key,v])=>{
  const parts=String(key).split(':');
  if(parts.length!==2||parts[0]===parts[1]||!parts.every(id=>PLAYER_ID.test(id)))return false;
  return v&&typeof v==='object'&&!Array.isArray(v)&&Number.isSafeInteger(v.xp)&&v.xp>=0&&v.xp<=1e6&&Number.isInteger(v.level)&&v.level>=1&&v.level<=5&&(v.name==null||(typeof v.name==='string'&&v.name.length<=18));
 });
}
function validRaidProgress(raid){
 if(!raid||typeof raid!=='object'||Array.isArray(raid)||typeof raid.first!=='object'||Array.isArray(raid.first)||typeof raid.stars!=='object'||Array.isArray(raid.stars)||!Array.isArray(raid.cosmetics))return false;
 if(raid.cosmetics.some(id=>typeof id!=='string'||!knownCosmeticId(id)))return false;
 if(!Object.entries(raid.first).every(([k,v])=>{
  const [ladder,star]=String(k).split(':');
  return RAID_LADDERS[ladder]&&String(Number(star))===star&&Number(star)>=1&&Number(star)<=5&&PLAYER_ID.test(v);
 }))return false;
 return Object.entries(raid.stars).every(([ladder,star])=>RAID_LADDERS[ladder]&&Number.isInteger(star)&&star>=1&&star<=5);
}
function validCoopDay(day){
 return day&&typeof day==='object'&&!Array.isArray(day)&&typeof day.date==='string'&&day.date.length<=16&&[0,1].includes(day.raid)&&[0,1].includes(day.dungeon)&&[0,1].includes(day.tag);
}
export function equippedLook(p){
 const e=p?.multiplayer?.equipped;if(!e||typeof e!=='object')return '';
 return COSMETIC_KINDS.filter(k=>typeof e[k]==='string'&&e[k]).map(k=>'equip-'+k+' equip-'+e[k]).join(' ');
}
export function equippedTitle(p){
 const id=p?.multiplayer?.equipped?.title;
 return id==='title-explorer'?'Explorer':id==='disc-310'?'Master Collector':'';
}
export function syncDiscovery(p){
 if(!p.multiplayer)return false;const unique=new Set((p.cards||[]).map(String)).size;let added=false;
 if(!Array.isArray(p.multiplayer.cosmetics))p.multiplayer.cosmetics=[];
 if(!Array.isArray(p.multiplayer.badges))p.multiplayer.badges=[];
 for(const [n,id] of DISCOVERY){if(unique>=n&&!p.multiplayer.cosmetics.includes(id)){p.multiplayer.cosmetics.push(id);if(!p.multiplayer.badges.includes(id))p.multiplayer.badges.push(id);added=true;}}
 return added;
}

function cleanStringList(list,allow=knownCosmeticId){return Array.isArray(list)?[...new Set(list.map(x=>String(x)).filter(id=>typeof id==='string'&&allow(id)))].slice(0,64):[];}
function cleanEquipped(equipped,owned){
 if(!equipped||typeof equipped!=='object'||Array.isArray(equipped))return {};
 const next={};
 for(const kind of COSMETIC_KINDS){
  const id=equipped[kind];
  if(typeof id==='string'&&owned.includes(id)&&kindOf(id)===kind)next[kind]=id;
 }
 return next;
}
function cleanBond(bond){
 if(!bond||typeof bond!=='object'||Array.isArray(bond))return {};
 const next={};
 for(const [key,v] of Object.entries(bond)){
  const parts=String(key).split(':');
  if(parts.length!==2||parts[0]===parts[1]||!parts.every(id=>PLAYER_ID.test(id)))continue;
  if(!v||typeof v!=='object'||Array.isArray(v)||!Number.isSafeInteger(v.xp)||v.xp<0||!Number.isInteger(v.level)||v.level<1||v.level>5)continue;
  next[key]={xp:v.xp,level:v.level,name:typeof v.name==='string'?v.name.slice(0,18):''};
 }
 return next;
}
function cleanRaid(raid){
 const next=emptyRaid();
 if(!raid||typeof raid!=='object'||Array.isArray(raid))return next;
 if(raid.first&&typeof raid.first==='object'&&!Array.isArray(raid.first)){
  for(const [k,v] of Object.entries(raid.first)){
   const [ladder,star]=String(k).split(':');
   if(RAID_LADDERS[ladder]&&String(Number(star))===star&&Number(star)>=1&&Number(star)<=5&&PLAYER_ID.test(v))next.first[k]=v;
  }
 }
 if(raid.stars&&typeof raid.stars==='object'&&!Array.isArray(raid.stars)){
  for(const [ladder,star] of Object.entries(raid.stars)){
   if(RAID_LADDERS[ladder]&&Number.isInteger(star)&&star>=1&&star<=5)next.stars[ladder]=star;
  }
 }
 next.cosmetics=cleanStringList(raid.cosmetics,knownCosmeticId);
 return next;
}
export function initRewards(p){
 if(!p.multiplayer){
  p.multiplayer={schema:2,id:uuid(),medals:0,played:0,wins:0,losses:0,ledger:[],ledgerFloor:0,lastOpponent:[],shards:0,bond:{},raid:emptyRaid(),badges:[],coopDay:emptyDay(),cosmetics:[],equipped:{}};
  syncDiscovery(p);return true;
 }
 const m=p.multiplayer;let changed=false;
 if(m.schema===1){m.schema=2;changed=true;}
 if(m.schema!==2)return changed;
 for(const k of ['medals','played','wins','losses','ledgerFloor']){if(!Number.isSafeInteger(m[k])||m[k]<0){m[k]=0;changed=true;}}
 if(!Array.isArray(m.ledger)){m.ledger=[];changed=true;}
 if(!Number.isSafeInteger(m.shards)||m.shards<0||m.shards>999){m.shards=0;changed=true;}
 const bond=cleanBond(m.bond);if(JSON.stringify(m.bond)!==JSON.stringify(bond)){m.bond=bond;changed=true;}
 const raid=cleanRaid(m.raid);if(JSON.stringify(m.raid)!==JSON.stringify(raid)){m.raid=raid;changed=true;}
 if(!Array.isArray(m.badges)||m.badges.some(x=>typeof x!=='string'||!/^[a-z0-9-]{3,40}$/.test(x))){m.badges=cleanStringList(m.badges,id=>/^[a-z0-9-]{3,40}$/.test(id));changed=true;}
 if(!validCoopDay(m.coopDay)){m.coopDay=emptyDay();changed=true;}
 if(!Array.isArray(m.cosmetics)||m.cosmetics.some(id=>!knownCosmeticId(id))){m.cosmetics=cleanStringList(m.cosmetics,knownCosmeticId);changed=true;}
 const owned=m.cosmetics,eq=cleanEquipped(m.equipped,owned);
 if(!m.equipped||typeof m.equipped!=='object'||Array.isArray(m.equipped)||JSON.stringify(m.equipped)!==JSON.stringify(eq)){m.equipped=eq;changed=true;}
 if(!Array.isArray(m.lastOpponent)||m.lastOpponent.some(id=>!PLAYER_ID.test(id))){m.lastOpponent=Array.isArray(m.lastOpponent)?m.lastOpponent.filter(id=>PLAYER_ID.test(id)).slice(0,4):[];changed=true;}
 if(syncDiscovery(p))changed=true;
 return changed;
}
export function validRewards(p){
 const m=p.multiplayer;if(!m)return true;
 if(![1,2].includes(m.schema)||!/^[a-f0-9]{32}$/.test(m.id)||['medals','played','wins','losses','ledgerFloor'].some(k=>!Number.isSafeInteger(m[k])||m[k]<0))return false;
 if(!Array.isArray(m.ledger)||m.ledger.length>512||m.ledger.some(r=>!r||typeof r!=='object'||!/^[a-f0-9]{32}$/.test(r.id)||!Number.isSafeInteger(r.at)||r.at<0)||new Set(m.ledger.map(r=>r.id)).size!==m.ledger.length)return false;
 if(m.schema===1)return m.shards==null&&m.raid==null&&m.bond==null&&m.coopDay==null&&m.cosmetics==null&&m.equipped==null;
 if(!Number.isSafeInteger(m.shards)||m.shards<0||m.shards>999)return false;
 if(!validBondMap(m.bond)||!validRaidProgress(m.raid)||!Array.isArray(m.badges)||m.badges.some(x=>typeof x!=='string'||!/^[a-z0-9-]{3,40}$/.test(x))||!validCoopDay(m.coopDay))return false;
 if(!Array.isArray(m.cosmetics)||m.cosmetics.length>64||m.cosmetics.some(id=>!knownCosmeticId(id)))return false;
 if(!m.equipped||typeof m.equipped!=='object'||Array.isArray(m.equipped))return false;
 const owned=m.cosmetics;
 for(const [kind,id] of Object.entries(m.equipped)){
  if(!COSMETIC_KINDS.includes(kind)||typeof id!=='string'||!knownCosmeticId(id)||!owned.includes(id)||kindOf(id)!==kind)return false;
 }
 if(m.lastOpponent!=null&&(!Array.isArray(m.lastOpponent)||m.lastOpponent.some(id=>!PLAYER_ID.test(id))))return false;
 if(m.ledgerFloor!=null&&(!Number.isSafeInteger(m.ledgerFloor)||m.ledgerFloor<0))return false;
 return true;
}
export function acceptsProfileRewards(save){
 return !!(save&&save.profiles&&typeof save.profiles==='object'&&Object.values(save.profiles).every(validRewards));
}
function remember(m,id,at){m.ledger.push({id,at});m.ledger.sort((a,b)=>a.at-b.at);while(m.ledger.length>512)m.ledgerFloor=Math.max(m.ledgerFloor,m.ledger.shift().at);}
function claimed(m,state){return state.endedAt<=m.ledgerFloor||m.ledger.some(r=>r.id===state.id);}
function startDay(m,now){const day=localDay(now);if(m.coopDay.date!==day)m.coopDay={date:day,raid:0,dungeon:0,tag:0};}

export function rewardResult(profile,state,now=Date.now()){
 if(!validSnapshot(state)||state.phase!=='end'||![0,1,'draw'].includes(state.winner)||!Number.isSafeInteger(state.endedAt)||state.endedAt>now+60000||state.attacks<1)return null;
 const p=structuredClone(profile);initRewards(p);const m=p.multiplayer,me=state.players.find(p=>p.id===m.id);
 if(!me||claimed(m,state))return null;
 const won=state.winner===me.side,draw=state.winner==='draw';m.medals+=won?3:2;m.played++;if(won)m.wins++;else if(!draw)m.losses++;
 m.lastOpponent=state.players.filter(p=>p.side!==me.side).map(p=>p.id);
 remember(m,state.id,state.endedAt);return p;
}

export function rewardRaid(profile,state,now=Date.now()){
 if(!validRaid(state)||state.phase!=='end'||!['raiders','boss'].includes(state.winner)||!Number.isSafeInteger(state.endedAt)||state.endedAt>now+60000)return null;
 const p=structuredClone(profile);initRewards(p);const m=p.multiplayer,me=state.players.find(x=>x.id===m.id);
 if(!me||claimed(m,state))return null;
 startDay(m,now);const partner=state.players.find(x=>x.id!==me.id),key=ensureBond(m,me,partner);
 m.played++;
 if(state.winner==='raiders'){
  const medals={1:4,2:4,3:5,4:6,5:7}[state.star]||4;m.medals+=medals;m.wins++;
  const spec=raidSpec(state.ladder,state.star),flag=state.ladder+':'+state.star;
  if(!m.raid.first[flag]){
   m.raid.first[flag]=state.id;
   if(spec.card&&!p.cards.some(id=>String(id)===String(spec.card)))p.cards.push(spec.card);
   else if(spec.card)m.medals+=2;
   if(spec.cosmetic&&!m.raid.cosmetics.includes(spec.cosmetic))m.raid.cosmetics.push(spec.cosmetic);
   const badge=state.ladder+'-'+state.star;if(!m.badges.includes(badge))m.badges.push(badge);
  }
  m.raid.stars[state.ladder]=Math.max(m.raid.stars[state.ladder]||0,state.star);
  if(m.coopDay.raid===0){m.shards++;m.coopDay.raid=1;}
  bumpBond(m,key);
 }else if(state.attacks>=3){m.medals+=1;m.losses++;}
 else m.losses++;
 m.lastOpponent=partner?[partner.id]:[];
 remember(m,state.id,state.endedAt);syncDiscovery(p);return p;
}

export function rewardDungeon(profile,state,now=Date.now()){
 if(!validDungeon(state)||state.phase!=='end'||!['clear','fail'].includes(state.winner)||!Number.isSafeInteger(state.endedAt)||state.endedAt>now+60000)return null;
 const p=structuredClone(profile);initRewards(p);const m=p.multiplayer,me=state.players.find(x=>x.id===m.id);
 if(!me||claimed(m,state))return null;
 startDay(m,now);const partner=state.players.find(x=>x.id!==me.id),key=ensureBond(m,me,partner);
 m.played++;
 if(state.winner==='clear'){
  m.medals+=6;m.wins++;bumpBond(m,key);
  const badge=DUNGEON_THEMES[state.theme]?.badge;if(badge&&!m.badges.includes(badge))m.badges.push(badge);
  if(badge&&!m.cosmetics.includes(badge))m.cosmetics.push(badge);
  if(m.coopDay.dungeon===0){m.shards++;m.coopDay.dungeon=1;}
 }else if(state.node>=2||state.attacks>=2){m.medals+=2;m.losses++;}
 else m.losses++;
 m.lastOpponent=partner?[partner.id]:[];
 remember(m,state.id,state.endedAt);return p;
}

export function rewardTag(profile,state,now=Date.now()){
 if(!validTag(state)||state.phase!=='end'||!['humans','ai'].includes(state.winner)||!Number.isSafeInteger(state.endedAt)||state.endedAt>now+60000)return null;
 const p=structuredClone(profile);initRewards(p);const m=p.multiplayer,me=state.players.find(x=>x.id===m.id);
 if(!me||claimed(m,state))return null;
 startDay(m,now);const partner=state.players.find(x=>x.id!==me.id),key=ensureBond(m,me,partner);
 m.played++;
 if(state.winner==='humans'){m.medals+=4;m.wins++;bumpBond(m,key);if(m.coopDay.tag===0){m.shards++;m.coopDay.tag=1;}if(!m.badges.includes('tag-win'))m.badges.push('tag-win');}
 else{m.medals+=2;m.losses++;}
 m.lastOpponent=partner?[partner.id]:[];
 remember(m,state.id,state.endedAt);return p;
}

export function craftPack(profile){
 const p=structuredClone(profile);initRewards(p);if(p.multiplayer.shards<5)return null;
 p.multiplayer.shards-=5;p.packs+=1;return p;
}
export function buyCosmetic(profile,id){
 const item=SHOP.find(x=>x.id===id);if(!item)return null;
 const p=structuredClone(profile);initRewards(p);if(p.multiplayer.medals<item.cost||p.multiplayer.cosmetics.includes(id))return null;
 p.multiplayer.medals-=item.cost;p.multiplayer.cosmetics.push(id);p.multiplayer.equipped[item.kind]=id;return p;
}
export function equipCosmetic(profile,id){
 const p=structuredClone(profile);initRewards(p);
 const item=SHOP.find(x=>x.id===id)||DISCOVERY.find(x=>x[1]===id);if(!item||!p.multiplayer.cosmetics.includes(id))return null;
 const kind=item.kind||item[3];p.multiplayer.equipped[kind]=id;return p;
}
