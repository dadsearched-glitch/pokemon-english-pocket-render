import test from 'node:test';import assert from 'node:assert/strict';
import {freshSave,createProfile,validSave} from '../web/model.js';
import {PROTOCOL,GAME,createMatch,applyAction,questionToken,alive,validSnapshot,publicPlayer} from '../web/multiplayer-model.js';
import {initRewards,rewardResult,validRewards,craftPack} from '../web/rewards.js';
function players(n){return Array.from({length:n},(_,i)=>({id:String(i+1).padStart(32,'0'),name:'Player '+i,year:i+1,side:i%2,team:[25,6,9]}));}
function cmd(s,payload){return {protocol:PROTOCOL,game:GAME,matchId:s.id,version:s.version,playerId:s.actor,seq:(s.seq[s.actor]||0)+1,...payload};}
function answer(s,correct=true){return applyAction(s,cmd(s,{type:'question_result',questionToken:questionToken(s),correct}));}
function attack(s){const p=s.players.find(p=>p.id===s.actor),t=s.players.find(t=>t.side!==p.side&&alive(t));return applyAction(s,cmd(s,{type:'battle_action',move:'basic',target:t.id}));}
test('four humans alternate sides, wrong answer yields turn, invalid and repeated commands rejected',()=>{let s=createMatch(players(4),'LOCAL');const a=cmd(s,{type:'question_result',questionToken:questionToken(s),correct:true});let n=applyAction(s,a);assert(n);assert.equal(applyAction(n,a),null);assert.equal(applyAction(s,{...a,game:'old'}),null);assert.equal(applyAction(s,{...a,playerId:players(4)[1].id}),null);s=attack(n);assert.equal(s.players.find(p=>p.id===s.actor).side,1);s=answer(s,false);assert.equal(s.players.find(p=>p.id===s.actor).side,0);assert.equal(s.turn,2);});
test('guard persists through opponents charge and reduces next incoming hit only',()=>{let s=createMatch(players(2),'LOCAL');s=answer(s);s=applyAction(s,cmd(s,{type:'battle_action',move:'guard'}));s=answer(s);s=applyAction(s,cmd(s,{type:'battle_action',move:'charge'}));assert(s.players[0].guard);s=answer(s);s=applyAction(s,cmd(s,{type:'battle_action',move:'charge'}));s=answer(s);s=attack(s);assert.equal(s.players[0].team[0].hp,80);assert.equal(s.players[0].guard,false);});
test('full 1v1 and 2v2 reach a result and reward each profile once, no XP cards packs change',()=>{for(const count of [2,4]){let s=createMatch(players(count),'LOCAL');for(let i=0;s.phase!=='end'&&i<600;i++){s=answer(s);s=attack(s);}assert.equal(s.phase,'end');assert.notEqual(s.winner,'draw');assert(validSnapshot(s));for(const who of players(count)){const save=freshSave();createProfile(save,who.name,who.year);const p=save.profiles[save.active];initRewards(p);p.multiplayer.id=who.id;const result=rewardResult(p,s);assert(result);assert.equal(result.xp,p.xp);assert.deepEqual(result.cards,p.cards);assert.equal(result.packs,p.packs);assert.equal(rewardResult(result,s),null);assert(validRewards(result));save.profiles[save.active]=result;assert(validSave(JSON.parse(JSON.stringify(save))));}}});
test('migration adds a stable ID without touching learning and old saves still validate',()=>{const s=freshSave();createProfile(s,'Kai',3);const p=s.profiles[s.active],before=JSON.stringify(p);assert(initRewards(p));const id=p.multiplayer.id;assert.equal(initRewards(p),false);assert.equal(p.multiplayer.id,id);const clean=structuredClone(p);delete clean.multiplayer;assert.equal(JSON.stringify(clean),before);assert(validSave(s));});
test('unbalanced sides, duplicate identity, absent cards and incomplete rewards rejected',()=>{const ps=players(4);ps[0].side=1;assert.throws(()=>createMatch(ps,'R'));ps[0].side=0;ps[1].id=ps[0].id;assert.throws(()=>createMatch(ps,'R'));assert.equal(rewardResult({},createMatch(players(2),'R')),null);});
test('publicPlayer rejects a short selection and snapshots reject malformed winner seq hp',()=>{
 const s=freshSave();createProfile(s,'Tony',4);const p=s.profiles[s.active];p.cards=[25,6,9];initRewards(p);
 assert.throws(()=>publicPlayer(p,[25,6],0));
 assert.doesNotThrow(()=>publicPlayer(p,[25,6,9],0));
 let m=createMatch(players(2),'R');assert(validSnapshot(m));
 assert.equal(validSnapshot({...m,winner:'nope'}),false);
 assert.equal(validSnapshot({...m,seq:{bad:1}}),false);
 const broken=structuredClone(m);broken.players[0].team[0].hp=999;assert.equal(validSnapshot(broken),false);
 const typed=structuredClone(m);typed.players[0].team[0].max=1;assert.equal(validSnapshot(typed),false);
 m={...m,phase:'end',winner:'abandoned',endedAt:1,attacks:3};assert.equal(rewardResult(p,m),null);
});
test('five shards craft one existing pack and never auto spend',()=>{
 const s=freshSave();createProfile(s,'Kai',3);const p=s.profiles[s.active];initRewards(p);p.packs=2;p.xp=40;
 assert.equal(craftPack(p),null);p.multiplayer.shards=5;const n=craftPack(p);assert.equal(n.packs,3);assert.equal(n.multiplayer.shards,0);assert.equal(n.xp,40);assert.equal(p.packs,2);
});
