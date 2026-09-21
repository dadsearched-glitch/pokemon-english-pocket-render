import test from 'node:test';
import assert from 'node:assert/strict';
import {PROTOCOL,GAME,createMatch,applyAction,questionToken} from '../web/multiplayer-model.js';
import {createRaid} from '../web/raid-model.js';
import {createDungeon,createTag} from '../web/coop-model.js';
import {duelPerspective,humanUnits,foeUnits} from '../web/multiplayer-view.js';

const A='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const B='bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const room='ROOM01';
const player=(id,name,side,team)=>({id,name,year:4,side,team});
const tony=player(A,'Tony',0,[25,6,9]);
const kai=player(B,'Kai',1,[94,150,181]);

function cmd(state,playerId,extra){return {protocol:PROTOCOL,game:GAME,matchId:state.id,version:state.version,playerId,seq:(state.seq[playerId]||0)+1,...extra};}

test('duel perspective always shows the viewer selected active card against the opponent selected active card',()=>{
 let state=createMatch([tony,kai],room,1);
 let view=duelPerspective(state,A);
 assert.equal(view.self.playerId,A);
 assert.equal(view.opponent.playerId,B);
 assert.equal(view.self.cardId,25);
 assert.equal(view.opponent.cardId,94);
 assert.ok(tony.team.includes(view.self.cardId));
 assert.ok(kai.team.includes(view.opponent.cardId));

 // Tony misses, so the actor changes to Kai. The old renderer incorrectly used
 // the current actor's target as the displayed opponent, duplicating Tony on screen.
 state=applyAction(state,cmd(state,A,{type:'question_result',questionToken:questionToken(state),correct:false}),2);
 assert.equal(state.actor,B);
 view=duelPerspective(state,A);
 assert.equal(view.self.cardId,25);
 assert.equal(view.opponent.cardId,94);

 // Kai earns energy and attacks Tony; the viewer perspective still stays Tony vs Kai.
 state=applyAction(state,cmd(state,B,{type:'question_result',questionToken:questionToken(state),correct:true}),3);
 state=applyAction(state,cmd(state,B,{type:'battle_action',move:'basic',target:A}),4);
 view=duelPerspective(state,A);
 assert.ok(tony.team.includes(view.self.cardId));
 assert.ok(kai.team.includes(view.opponent.cardId));
 assert.notEqual(view.self.playerId,view.opponent.playerId);
});

test('co-op view exposes both human active units and the correct number of opponents for each mode',()=>{
 const raid=createRaid([tony,kai],room,{ladder:'electric',star:1},1);
 assert.equal(humanUnits(raid).length,2);
 assert.equal(foeUnits(raid).length,1);
 const dungeon=createDungeon([tony,kai],room,{theme:'forest'},1);
 assert.equal(humanUnits(dungeon).length,2);
 assert.equal(foeUnits(dungeon).length,1);
 const tag=createTag([tony,kai],room,1);
 assert.equal(humanUnits(tag).length,2);
 assert.equal(foeUnits(tag).length,2);
 for(const state of [raid,dungeon,tag])for(const unit of humanUnits(state)){
  const owner=state.players.find(p=>p.id===unit.playerId);
  assert.ok(owner.team.some(slot=>String(slot.id)===String(unit.cardId)),'active unit must come from that player selected team');
 }
});
