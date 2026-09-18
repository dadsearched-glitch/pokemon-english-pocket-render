import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CARDS,LEGACY_CARDS,byId,TYPES} from '../web/data.js';
import {SET_CARDS} from '../web/catalogue.js';
import {freshSave,validSave,createProfile,migrateSave,openPack,startBattle,battleMove} from '../web/model.js';
import {upgradeSandbox,makeSandboxSave,storageKey,acceptsBackup} from '../web/sandbox.js';

test('A1 includes all 286 separate card prints and preserves 24 legacy IDs and voiced adventure moves',()=>{
 assert.equal(SET_CARDS.length,286);assert.equal(CARDS.length,310);assert.equal(new Set(CARDS.map(c=>String(c.id))).size,310);
 const manifest=JSON.parse(fs.readFileSync(new URL('../web/audio-manifest.json',import.meta.url)));
 for(const c of SET_CARDS){assert.ok(c.cardImage.startsWith('https://assets.tcgdex.net/'));assert.ok(TYPES[c.type]);assert.ok(manifest[c.move],c.move);assert.ok(manifest[c.power],c.power);assert.equal(byId(c.id),c);}
 for(const c of LEGACY_CARDS)assert.equal(byId(c.id),c);
 assert.equal(SET_CARDS.filter(c=>c.specialArt).length,60);assert.equal(SET_CARDS.filter(c=>c.finish==='crown').length,3);
 assert.equal(byId('A1-265').rarityLabel,'Two Star');assert.equal(byId('A1-279').finish,'rainbow');
});
test('seeded pack sample reaches every A1 card, preserves guarantees and supports reload without duplicate rewards',()=>{
 let seed=4173;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const base=freshSave();createProfile(base,'Tony',4);const p=base.profiles[base.active];p.packs=10000;const reached=new Set();let initialEx=0;
 for(let n=0;n<10000;n++){const pack=openPack(p,random),draw=pack.cards.map(byId);assert.equal(new Set(pack.cards).size,5);assert.ok(draw[3].specialArt);assert.ok(draw[4].isEx);assert.ok(draw.filter(c=>c.battleEligible).length>=3);assert.ok(draw.every(c=>c.set==='A1'));draw.forEach(c=>reached.add(c.id));initialEx+=draw.slice(0,3).filter(c=>c.isEx).length;p.pendingPack=null;p.cards=[];}
 assert.equal(reached.size,286);assert.ok(initialEx/30000>.20&&initialEx/30000<.24);
 const s=freshSave();createProfile(s,'Tony',4);const key=s.active;s.profiles[key].packs=1;openPack(s.profiles[key],random);s.profiles[key].pendingPack.index=2;const resumed=JSON.parse(JSON.stringify(s));assert.ok(validSave(resumed));assert.equal(openPack(resumed.profiles[key]).index,2);assert.equal(resumed.profiles[key].cards.length,5);assert.equal(resumed.profiles[key].packs,0);
});
test('old normal and sandbox saves retain progress and unfinished legacy packs; sandbox adds all new cards only once',()=>{
 const normal=freshSave();createProfile(normal,'Tony',4);const key=normal.active;normal.profiles[key]={...normal.profiles[key],xp:80,cards:[25,6,9,3,6],done:[0,1],pendingPack:{cards:[25,6,9,3,6],index:2}};
 const before=JSON.stringify(normal);assert.ok(validSave(normal));assert.equal(upgradeSandbox(normal),false);assert.equal(JSON.stringify(normal),before);
 const sandbox=JSON.parse(before);sandbox.sandbox=true;assert.ok(upgradeSandbox(sandbox));assert.ok(validSave(sandbox));assert.equal(sandbox.profiles[key].xp,80);assert.equal(sandbox.profiles[key].pendingPack.index,2);assert.equal(new Set(sandbox.profiles[key].cards).size,310);assert.equal(sandbox.profiles[key].cards.filter(id=>id===6).length,2);assert.equal(upgradeSandbox(sandbox),false);assert.equal(JSON.stringify(normal),before);
 assert.notEqual(storageKey(true),storageKey(false));assert.equal(acceptsBackup(sandbox,false),false);
});
test('new string card IDs battle with valid moves; collection-only trainers cannot enter team',()=>{
 const sandbox=makeSandboxSave(),p=sandbox.profiles[sandbox.profileOrder[0]];const trainer=SET_CARDS.find(c=>!c.battleEligible);assert.equal(startBattle(p,[trainer.id,'A1-284','A1-285']),null);
 assert.ok(startBattle(p,['A1-284','A1-285','A1-286']));p.battle.energy=3;p.battle.phase='move';assert.ok(battleMove(p,'special'));assert.ok(p.battle.log.includes('damage'));assert.equal(p.battle.energy,0);
});
