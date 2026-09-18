import {test} from 'node:test';
import {CARDS} from '../web/data.js';
import assert from 'node:assert/strict';
import {storageKey,makeSandboxSave,acceptsBackup} from '../web/sandbox.js';
import {freshSave,validSave,openPack,startBattle} from '../web/model.js';
test('sandbox uses independent storage and cannot restore into real game',()=>{assert.notEqual(storageKey(true),storageKey(false));const normal=freshSave(),sandbox=makeSandboxSave();assert.ok(validSave(sandbox));assert.equal(acceptsBackup(sandbox,false),false);assert.equal(acceptsBackup(normal,true),false);assert.equal(acceptsBackup(sandbox,true),true);const before=JSON.stringify(normal),tony=sandbox.profileOrder[0],kai=sandbox.profileOrder[1];openPack(sandbox.profiles[tony]);startBattle(sandbox.profiles[tony],[25,6,9]);assert.equal(sandbox.profiles[tony].cards.length,CARDS.length+5);assert.ok(sandbox.profiles[tony].battle);assert.equal(JSON.stringify(normal),before);assert.equal(sandbox.profiles[kai].cards.length,CARDS.length);});
