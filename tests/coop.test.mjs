import test from 'node:test';import assert from 'node:assert/strict';
import {freshSave,createProfile} from '../web/model.js';
import {PROTOCOL,GAME} from '../web/multiplayer-model.js';
import {createDungeon,applyDungeonAction,dungeonToken,validDungeon,createTag,applyTagAction,tagToken,validTag} from '../web/coop-model.js';
import {initRewards,rewardDungeon,rewardTag,buyCosmetic,equipCosmetic,sparkOf,sparkTier,syncDiscovery,validRewards,SHOP,DISCOVERY,equippedLook} from '../web/rewards.js';

function trainers(){return [{id:'a'.repeat(32),name:'Tony',year:4,side:0,team:[25,6,9]},{id:'b'.repeat(32),name:'Kai',year:3,side:1,team:[1,4,7]}];}
function cmd(s,playerId,payload){return {protocol:PROTOCOL,game:GAME,matchId:s.id,version:s.version,playerId,seq:(s.seq[playerId]||0)+1,...payload};}
function profileWith(id){const save=freshSave();createProfile(save,'Tony',4);const p=save.profiles[save.active];initRewards(p);p.multiplayer.id=id;p.xp=10;p.packs=1;return p;}
function bothAnswer(s,token,apply,correct=true){for(const p of s.players){s=apply(s,cmd(s,p.id,{type:'question_result',questionToken:token(s,p.id),correct}));assert(s);}return s;}
function bothMove(s,apply,move){for(const p of [...s.players]){if(s.phase==='end')break;if(p.down||s.moves[p.id])continue;const next=apply(s,cmd(s,p.id,{type:'battle_action',move:move(s,p)}));if(next)s=next;}return s;}

test('two humans clear a forest dungeon, camp heals automatically, rewards pay once with a daily shard',()=>{
 let s=createDungeon(trainers(),'ROOM',{theme:'forest'});assert(validDungeon(s));assert.equal(s.nodes.length,5);assert.equal(s.nodes[3].type,'camp');
 for(let i=0;s.phase!=='end'&&i<400;i++){
  if(s.phase==='vote'){const item=s.nodes[s.node].options[0];for(const p of s.players){s=applyDungeonAction(s,cmd(s,p.id,{type:'vote',item}));assert(s);}continue;}
  if(s.phase==='quiz'||s.phase==='question'){s=bothAnswer(s,dungeonToken,applyDungeonAction);continue;}
  if(s.phase==='move'){s=bothMove(s,applyDungeonAction,st=>st.gauge>=3?'team':'basic');continue;}
  throw Error('stuck '+s.phase+' node '+s.node);
 }
 assert.equal(s.phase,'end');assert.equal(s.winner,'clear');assert(validDungeon(s));
 const p=profileWith('a'.repeat(32)),once=rewardDungeon(p,s);
 assert(once);assert.equal(once.xp,10);assert.equal(once.packs,1);assert.deepEqual(once.cards,p.cards);
 assert.equal(once.multiplayer.medals,6);assert.equal(once.multiplayer.shards,1);assert(once.multiplayer.badges.includes('dungeon-forest'));
 assert.equal(rewardDungeon(once,s),null);assert(validRewards(once));
 const again=structuredClone(once);again.multiplayer.ledger=[];again.multiplayer.ledgerFloor=0;
 const repeat=rewardDungeon(again,{...s,id:'c'.repeat(32)});
 assert.equal(repeat.multiplayer.shards,1);assert.equal(repeat.multiplayer.medals,12);
});

test('dungeon vote disagreement shares the first option, never unique loot',()=>{
 let s=createDungeon(trainers(),'ROOM',{theme:'tide'});
 for(let i=0;s.phase!=='vote'&&i<80;i++){
  if(s.phase==='question')s=bothAnswer(s,dungeonToken,applyDungeonAction);
  else if(s.phase==='move')s=bothMove(s,applyDungeonAction,()=>'basic');
  else throw Error('unexpected '+s.phase);
 }
 const [a,b]=s.nodes[s.node].options;assert.notEqual(a,b);
 s=applyDungeonAction(s,cmd(s,s.players[0].id,{type:'vote',item:a}));
 s=applyDungeonAction(s,cmd(s,s.players[1].id,{type:'vote',item:b}));
 assert(s.items.includes(a));assert.equal(s.items.includes(b),false);
});

test('tag 2 humans vs 2 AI reach a win, duo requires chain 3, rewards 4 medals plus a daily shard',()=>{
 let s=createTag(trainers(),'ROOM');assert(validTag(s));assert.equal(s.foes.length,2);assert.equal(s.foes[0].id,25);assert.equal(s.foes[1].id,6);
 assert.equal(applyTagAction(s,cmd(s,s.players[0].id,{type:'battle_action',move:'duo'})),null);
 for(let i=0;s.phase!=='end'&&i<400;i++){
  if(s.phase==='question'){s=bothAnswer(s,tagToken,applyTagAction);continue;}
  if(s.phase==='move'){s=bothMove(s,applyTagAction,st=>st.chain>=3?'duo':'basic');continue;}
  throw Error('stuck '+s.phase);
 }
 assert.equal(s.phase,'end');assert.equal(s.winner,'humans');assert(validTag(s));
 const p=profileWith('a'.repeat(32)),once=rewardTag(p,s);
 assert.equal(once.multiplayer.medals,4);assert.equal(once.multiplayer.shards,1);assert(once.multiplayer.badges.includes('tag-win'));
 assert.equal(once.xp,10);assert.deepEqual(once.cards,p.cards);assert.equal(rewardTag(once,s),null);
});

test('shop cosmetics spend medals only, spark counts duplicates without deleting cards, discovery unlocks names',()=>{
 const p=profileWith('a'.repeat(32));p.multiplayer.medals=40;p.cards=[25,25,25,6];
 assert.equal(sparkOf(p.cards,25),2);assert.equal(sparkTier(2),'glint');assert.equal(sparkOf(p.cards,6),0);assert.equal(sparkTier(0),'none');
 const before=[...p.cards];
 const bought=buyCosmetic(p,'title-explorer');assert(bought);assert.equal(bought.multiplayer.medals,30);
 assert(bought.multiplayer.cosmetics.includes('title-explorer'));assert.equal(bought.multiplayer.equipped.title,'title-explorer');
 assert.deepEqual(bought.cards,before);assert.equal(buyCosmetic(bought,'title-explorer'),null);
 assert.equal(buyCosmetic(p,'nope'),null);
 const equipped=equipCosmetic(bought,'title-explorer');assert.equal(equipped.multiplayer.equipped.title,'title-explorer');
 const d=profileWith('b'.repeat(32));d.cards=Array.from({length:25},(_,i)=>i+1);
 assert.equal(syncDiscovery(d),true);assert(d.multiplayer.cosmetics.includes('disc-25'));
 assert.equal(DISCOVERY[0][2],'Explorer badge');assert.equal(SHOP[0].cost,10);assert(validRewards(d));
 const short=profileWith('c'.repeat(32));short.cards=[1,2,3];syncDiscovery(short);
 assert.equal(short.multiplayer.cosmetics.includes('disc-25'),false);
});


test('tag defender guard reduces the next incoming hit and does not weaken the defender attack',()=>{
 const hitZard=(s,apply)=>{
  for(const p of [...s.players]){
   if(s.phase==='end'||p.down||s.moves[p.id])continue;
   const next=apply(s,cmd(s,p.id,{type:'battle_action',move:'basic',target:6}));
   if(next)s=next;
  }
  return s;
 };
 let s=createTag(trainers(),'ROOM');
 s=bothAnswer(s,tagToken,applyTagAction);
 const zard=()=>s.foes.find(f=>f.id===6),tony=()=>s.players[0];
 const beforeZ=zard().hp,beforeTony=tony().team[0].hp;
 s=hitZard(s,applyTagAction);
 assert.equal(s.round,1);assert.equal(zard().guard,true);
 assert.equal(zard().hp,beforeZ-44);
 assert.equal(tony().team[0].hp,beforeTony-18);
 s=bothAnswer(s,tagToken,applyTagAction);
 const midZ=zard().hp,midTony=tony().team[0].hp,midKai=s.players[1].team[0].hp;
 s=hitZard(s,applyTagAction);
 assert.equal(zard().guard,false);
 assert.equal(zard().hp,midZ-31);
 assert.equal(tony().team[0].hp,midTony-18);
 assert.equal(s.players[1].team[0].hp,midKai-18);
});

test('malformed rewards cosmetics, equipped slots and coopDay are rejected until sanitized',()=>{
 const p=profileWith('a'.repeat(32));
 p.multiplayer.cosmetics='leaf';assert.equal(validRewards(p),false);
 p.multiplayer.cosmetics=[null,1,'!!!'];assert.equal(validRewards(p),false);
 p.multiplayer.cosmetics=['title-explorer'];p.multiplayer.equipped=['title-explorer'];assert.equal(validRewards(p),false);
 p.multiplayer.equipped={title:12};assert.equal(validRewards(p),false);
 p.multiplayer.equipped={title:'title-explorer',nope:'x'};assert.equal(validRewards(p),false);
 p.multiplayer.equipped={title:'title-explorer'};p.multiplayer.coopDay={date:1,raid:2};assert.equal(validRewards(p),false);
 p.multiplayer.coopDay={date:'2026-09-17',raid:0,dungeon:0,tag:0};assert.equal(validRewards(p),true);
 const dirty=profileWith('b'.repeat(32));
 dirty.multiplayer.cosmetics=[1,'title-explorer','???'];
 dirty.multiplayer.equipped={title:'title-explorer',arena:[],nope:'x'};
 dirty.multiplayer.coopDay={date:null};
 assert.equal(initRewards(dirty),true);
 assert.deepEqual(dirty.multiplayer.cosmetics,['title-explorer']);
 assert.equal(dirty.multiplayer.equipped.title,'title-explorer');
 assert.equal(dirty.multiplayer.equipped.arena,undefined);
 assert.equal(dirty.multiplayer.coopDay.raid,0);
 assert(validRewards(dirty));
 assert.equal(equippedLook(dirty).includes('equip-title-explorer'),true);
});

test('abandoned dungeon or tag snapshots pay nothing',()=>{
 const d=createDungeon(trainers(),'ROOM',{theme:'ember'}),tg=createTag(trainers(),'ROOM'),p=profileWith('a'.repeat(32));
 assert.equal(rewardDungeon(p,{...d,phase:'end',winner:'abandoned',endedAt:Date.now(),attacks:4}),null);
 assert.equal(rewardTag(p,{...tg,phase:'end',winner:'abandoned',endedAt:Date.now(),attacks:4}),null);
 assert.equal(validDungeon({...d,winner:'draw'}),false);
 assert.equal(validTag({...tg,winner:'raiders'}),false);
});
