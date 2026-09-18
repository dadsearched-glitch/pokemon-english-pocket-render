import test from 'node:test';import assert from 'node:assert/strict';
import {freshSave,createProfile} from '../web/model.js';
import {PROTOCOL,GAME} from '../web/multiplayer-model.js';
import {createRaid,applyRaidAction,raidQuestionToken,validRaid,RAID_LADDERS} from '../web/raid-model.js';
import {initRewards,rewardRaid,validRewards,localDay} from '../web/rewards.js';
function trainers(){return [{id:'a'.repeat(32),name:'Tony',year:4,side:0,team:[25,6,9]},{id:'b'.repeat(32),name:'Kai',year:3,side:1,team:[1,4,7]}];}
function cmd(s,playerId,payload){return {protocol:PROTOCOL,game:GAME,matchId:s.id,version:s.version,playerId,seq:(s.seq[playerId]||0)+1,...payload};}
function bothAnswer(s,correct=true){for(const p of s.players){s=applyRaidAction(s,cmd(s,p.id,{type:'question_result',questionToken:raidQuestionToken(s,p.id),correct}));assert(s);}return s;}
function bothBasic(s){for(const p of [...s.players]){if(s.phase==='end')break;if(p.down||s.moves[p.id])continue;const next=applyRaidAction(s,cmd(s,p.id,{type:'battle_action',move:s.gauge>=3?'team':'basic'}));if(next)s=next;}return s;}
test('two humans raid a 1-star boss, first-clear grants the legacy card once, PVP shards stay 0',()=>{
 let s=createRaid(trainers(),'ROOM',{ladder:'electric',star:1});assert(validRaid(s));assert.equal(s.players.length,2);assert.equal(s.boss.id,RAID_LADDERS.electric.boss);
 for(let i=0;s.phase!=='end'&&i<200;i++){s=bothAnswer(s);if(s.phase==='move')s=bothBasic(s);}
 assert.equal(s.phase,'end');assert.equal(s.winner,'raiders');assert(validRaid(s));
 const save=freshSave();createProfile(save,'Tony',4);const p=save.profiles[save.active];initRewards(p);p.multiplayer.id='a'.repeat(32);p.cards=[];p.xp=10;p.packs=1;
 const once=rewardRaid(p,s);assert(once);assert(once.cards.includes(172));assert.equal(once.xp,10);assert.equal(once.packs,1);assert.equal(once.multiplayer.shards,1);assert.equal(once.multiplayer.medals,4);assert(validRewards(once));
 assert.equal(rewardRaid(once,s),null);
 const again=structuredClone(once);again.multiplayer.ledger=[];again.multiplayer.ledgerFloor=0;s={...s,id:'c'.repeat(32)};const repeat=rewardRaid(again,s);assert.equal(repeat.cards.filter(id=>id===172).length,1);assert.equal(repeat.multiplayer.shards,1);
});
test('wrong answers still let the partner act and cheer revives a fainted trainer',()=>{
 let s=createRaid(trainers(),'ROOM',{ladder:'fire',star:1});
 s=bothAnswer(s,true);s=bothBasic(s);assert.equal(s.gauge,1);
 s=applyRaidAction(s,cmd(s,s.players[0].id,{type:'question_result',questionToken:raidQuestionToken(s,s.players[0].id),correct:false}));
 s=applyRaidAction(s,cmd(s,s.players[1].id,{type:'question_result',questionToken:raidQuestionToken(s,s.players[1].id),correct:true}));
 assert.equal(s.phase,'move');assert.equal(s.gauge,1);
 s.players[0].team.forEach(c=>c.hp=0);s.players[0].down=true;s.phase='question';s.answers={};s.moves={};
 s=applyRaidAction(s,cmd(s,s.players[0].id,{type:'question_result',questionToken:raidQuestionToken(s,s.players[0].id),correct:true}));
 s=applyRaidAction(s,cmd(s,s.players[1].id,{type:'question_result',questionToken:raidQuestionToken(s,s.players[1].id),correct:true}));
 s.phase='question';s.answers={};s.round++;
 s=applyRaidAction(s,cmd(s,s.players[0].id,{type:'question_result',questionToken:raidQuestionToken(s,s.players[0].id),correct:true}));
 assert.equal(s.players[0].down,false);assert(s.players[0].team.some(c=>c.hp>0));
});
test('team bond starts raid gauge at level 5 and rescues after one correct cheer at level 4',()=>{
 const levelFive=createRaid(trainers(),'ROOM',{ladder:'electric',star:1,bondLevel:5});
 assert.equal(levelFive.bondLevel,5);assert.equal(levelFive.gauge,1);assert(validRaid(levelFive));
 let levelFour=createRaid(trainers(),'ROOM',{ladder:'electric',star:1,bondLevel:4});
 levelFour.players[0].team.forEach(c=>c.hp=0);levelFour.players[0].down=true;levelFour.answers={};
 levelFour=applyRaidAction(levelFour,cmd(levelFour,levelFour.players[0].id,{type:'question_result',questionToken:raidQuestionToken(levelFour,levelFour.players[0].id),correct:true}));
 assert.equal(levelFour.players[0].down,false);assert(levelFour.players[0].team.some(c=>c.hp>0));
});
test('abandoned or mismatched raid snapshots pay nothing',()=>{
 const s=createRaid(trainers(),'ROOM',{ladder:'water',star:1});const save=freshSave();createProfile(save,'Kai',3);const p=save.profiles[save.active];initRewards(p);p.multiplayer.id='a'.repeat(32);
 assert.equal(rewardRaid(p,{...s,phase:'end',winner:'abandoned',endedAt:Date.now(),attacks:4}),null);
 assert.equal(validRaid({...s,winner:'draw'}),false);
 assert.equal(localDay(Date.parse('2026-09-17T12:00:00')).length,10);
});
