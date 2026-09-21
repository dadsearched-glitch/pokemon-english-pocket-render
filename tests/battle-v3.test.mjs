import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Battle V3 assets are linked by the solo and multiplayer entry pages',()=>{
  assert.equal(existsSync(new URL('../web/battle-v3.css',import.meta.url)),true);
  assert.equal(existsSync(new URL('../web/battle-v3-fx.js',import.meta.url)),true);
  assert.match(read('web/index.html'),/battle-v3\.css/);
  assert.match(read('web/multiplayer.html'),/battle-v3\.css/);
});

test('multiplayer uses the shared cinematic Battle V3 FX engine with typed organic effects',()=>{
  const multiplayer=read('web/multiplayer.js');
  const fx=read('web/battle-v3-fx.js');
  assert.match(multiplayer,/playMultiplayerBattleFX/);
  assert.match(fx,/v3-impact-shard/);
  assert.match(fx,/v3-impact-ray/);
  assert.match(fx,/v3-vine/);
  assert.match(fx,/v3-psy-ring/);
  assert.match(fx,/v3-dark-slash/);
  assert.match(fx,/SHIELD BREAK!/);
  assert.match(fx,/TAG FINISH!/);
  assert.match(fx,/TEAM ATTACK!/);
});

test('Battle V3 mode renderers keep duel, 2v2, raid, dungeon and tag visually distinct',()=>{
  const src=read('web/multiplayer.js');
  for(const token of ['mode-duel','mode-duo','mode-raid','mode-dungeon','mode-tag'])assert.match(src,new RegExp(token));
  assert.match(src,/dungeon-route-mini/);
  assert.match(src,/raid-stage-title/);
  assert.match(src,/tag-side tag-ai/);
  assert.match(src,/duo-team duo-blue/);
});

test('duel lobby blocks unbalanced Blue Orange teams both in UI and start handler',()=>{
  const src=read('web/multiplayer.js');
  assert.match(src,/canStart=allReady&&balanced/);
  assert.match(src,/1v1 needs 1 Blue \+ 1 Orange/);
  assert.match(src,/1대1은 Blue 1명 \+ Orange 1명이어야 해요/);
  assert.match(src,/2대2는 Blue 2명 \+ Orange 2명이어야 해요/);
});

test('standalone Battle V3 FX lab is bundled and reuses production FX code',()=>{
  assert.equal(existsSync(new URL('../web/battle-v3-preview.html',import.meta.url)),true);
  const preview=read('web/battle-v3-preview.js');
  assert.match(preview,/playMultiplayerBattleFX/);
  assert.match(preview,/BATTLE V3 PREVIEW/);
  assert.match(preview,/TEAM \/ TAG FINISH/);
});
