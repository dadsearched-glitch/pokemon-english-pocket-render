import test from 'node:test';import assert from 'node:assert/strict';
import {freshSave,createProfile,validSave,migrateSave} from '../web/model.js';
import {acceptsBackup} from '../web/sandbox.js';
import {initRewards,validRewards,acceptsProfileRewards,buyCosmetic,knownCosmeticId} from '../web/rewards.js';

function profile(){
  const save=freshSave();createProfile(save,'Tony',4);const p=save.profiles[save.active];
  initRewards(p);p.multiplayer.id='a'.repeat(32);return {save,p};
}
function clone(p){return structuredClone(p);}
function importGate(save,testMode=false){
  const data=structuredClone(save);
  migrateSave(data);
  return !!(validSave(data)&&acceptsBackup(data,testMode)&&acceptsProfileRewards(data));
}

test('known cosmetics accept shop, discovery, raid and dungeon ids only',()=>{
  assert.equal(knownCosmeticId('title-explorer'),true);
  assert.equal(knownCosmeticId('disc-25'),true);
  assert.equal(knownCosmeticId('electric-arena'),true);
  assert.equal(knownCosmeticId('dungeon-forest'),true);
  assert.equal(knownCosmeticId('not-a-real-cosmetic'),false);
  assert.equal(knownCosmeticId('title'),false);
});

test('validRewards rejects unknown cosmetic IDs and mismatched equipped slots',()=>{
  const {p}=profile();
  assert.equal(validRewards(p),true);
  p.multiplayer.cosmetics=['not-a-real-cosmetic'];assert.equal(validRewards(p),false);
  p.multiplayer.cosmetics=['title-explorer'];p.multiplayer.equipped={title:'frame-leaf'};assert.equal(validRewards(p),false);
  p.multiplayer.equipped={frame:'title-explorer'};assert.equal(validRewards(p),false);
  p.multiplayer.equipped={title:'title-explorer'};assert.equal(validRewards(p),true);
  p.multiplayer.equipped={title:'title-explorer'};p.multiplayer.cosmetics=[];assert.equal(validRewards(p),false);
});

test('validRewards rejects missing coopDay fields and wrong raid/bond shapes',()=>{
  const {p}=profile();
  p.multiplayer.coopDay={date:'2026-09-17',raid:0,dungeon:0};assert.equal(validRewards(p),false);
  p.multiplayer.coopDay={date:'2026-09-17',raid:0,dungeon:0,tag:0};assert.equal(validRewards(p),true);
  p.multiplayer.raid.stars={electric:'3'};assert.equal(validRewards(p),false);
  p.multiplayer.raid.stars={electric:3};assert.equal(validRewards(p),true);
  p.multiplayer.raid.stars={moon:2};assert.equal(validRewards(p),false);
  p.multiplayer.raid.stars={electric:3};
  p.multiplayer.raid.first={'electric:1':123};assert.equal(validRewards(p),false);
  p.multiplayer.raid.first={'nope:1':'b'.repeat(32)};assert.equal(validRewards(p),false);
  p.multiplayer.raid.first={'electric:1':'b'.repeat(32)};assert.equal(validRewards(p),true);
  p.multiplayer.bond=['x'];assert.equal(validRewards(p),false);
  p.multiplayer.bond={'not-an-id':'x'};assert.equal(validRewards(p),false);
  p.multiplayer.bond={[['a'.repeat(32),'b'.repeat(32)].sort().join(':')]:{xp:-1,level:1}};assert.equal(validRewards(p),false);
  p.multiplayer.bond={[['a'.repeat(32),'b'.repeat(32)].sort().join(':')]:{xp:2,level:9}};assert.equal(validRewards(p),false);
  p.multiplayer.bond={[['a'.repeat(32),'b'.repeat(32)].sort().join(':')]:{xp:2,level:1,name:'Kai'}};assert.equal(validRewards(p),true);
  p.multiplayer.shards='0';assert.equal(validRewards(p),false);
  p.multiplayer.shards=0;p.multiplayer.equipped=[];assert.equal(validRewards(p),false);
});

test('initRewards sanitizes malformed schema 2 without dropping a healthy profile identity',()=>{
  const {p}=profile();const id=p.multiplayer.id;
  p.multiplayer.cosmetics=['nope','title-explorer'];
  p.multiplayer.equipped={title:'title-explorer',arena:'arena-dusk'};
  p.multiplayer.coopDay={date:'2026-09-17'};
  p.multiplayer.raid={first:{bad:1},stars:{electric:'2'},cosmetics:['zzz']};
  p.multiplayer.bond={x:{xp:-4,level:0}};
  assert.equal(initRewards(p),true);
  assert.equal(p.multiplayer.id,id);
  assert.deepEqual(p.multiplayer.cosmetics,['title-explorer']);
  assert.equal(p.multiplayer.equipped.title,'title-explorer');
  assert.equal(p.multiplayer.equipped.arena,undefined);
  assert.equal(p.multiplayer.coopDay.tag,0);
  assert.deepEqual(p.multiplayer.raid.stars,{});
  assert.deepEqual(p.multiplayer.bond,{});
  assert.equal(validRewards(p),true);
});

test('backup import gate uses the same rewards validation as validRewards',()=>{
  const {save,p}=profile();
  assert.equal(importGate(save,false),true);
  p.multiplayer.medals=20;const good=buyCosmetic(p,'title-explorer');save.profiles[save.active]=good;
  assert.equal(importGate(save,false),true);
  const broken=structuredClone(save);
  broken.profiles[broken.active].multiplayer.cosmetics=['ghost-frame'];
  assert.equal(validRewards(broken.profiles[broken.active]),false);
  assert.equal(importGate(broken,false),false);
  const missingDay=structuredClone(save);
  missingDay.profiles[missingDay.active].multiplayer.coopDay={date:'2026-09-17',raid:1};
  assert.equal(importGate(missingDay,false),false);
  const sandbox=structuredClone(save);sandbox.sandbox=true;
  assert.equal(importGate(sandbox,false),false);
  assert.equal(importGate(sandbox,true),true);
});

test('schema 1 profiles without together fields still validate and migrate in place',()=>{
  const {p}=profile();
  p.multiplayer={schema:1,id:'c'.repeat(32),medals:2,played:1,wins:1,losses:0,ledger:[],ledgerFloor:0,lastOpponent:[]};
  assert.equal(validRewards(p),true);
  assert.equal(initRewards(p),true);
  assert.equal(p.multiplayer.schema,2);
  assert.equal(validRewards(p),true);
  assert.equal(Array.isArray(p.multiplayer.cosmetics),true);
});
