import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {freshSave,freshProfile,createProfile,migrateSave,validSave,MAX_PROFILES,reviewWord,dueWords,startBattle} from '../web/model.js';
import {questions} from '../web/course.js';
import {snapshotCourse,switchLevel} from '../web/learning-level.js';

test('new installs support up to five named local profiles with independent default years',()=>{
 const s=freshSave();assert.equal(Object.keys(s.profiles).length,0);const years=[3,4,5,3,4];
 for(let i=0;i<MAX_PROFILES;i++){const r=createProfile(s,'Trainer '+(i+1),years[i]);assert.ok(r.ok);r.profile.xp=i*10;r.profile.cards=i?[25]:[];}
 assert.equal(Object.keys(s.profiles).length,5);assert.equal(s.profileOrder.length,5);assert.deepEqual(s.profileOrder.map(k=>s.profiles[k].learningLevel),years);assert.ok(validSave(s));
 const blocked=createProfile(s,'Sixth',3);assert.equal(blocked.ok,false);assert.match(blocked.error,/최대 5개/);assert.equal(Object.keys(s.profiles).length,5);
 assert.notEqual(s.profiles[s.profileOrder[0]],s.profiles[s.profileOrder[1]]);assert.equal(s.profiles[s.profileOrder[0]].xp,0);assert.equal(s.profiles[s.profileOrder[4]].xp,40);
});

test('v6 Tony/Kai save migrates in-place without losing Tony Y5, cards, XP, packs or battle',()=>{
 const legacy={version:1,active:'Tony',profiles:{Tony:freshProfile(),Kai:freshProfile()},voice:'mitchell',sound:false,effects:'full'};
 const t=legacy.profiles.Tony;t.chapter=2;t.done=[0,1];t.review={evidence:{level:3,due:123,seen:4,lastSuccess:100}};t.mistakes=['evidence'];t.cards=[6,9,3];t.xp=260;t.packs=7;startBattle(t,t.cards);const before=structuredClone(legacy);
 assert.equal(migrateSave(legacy),true);assert.equal(legacy.version,2);assert.deepEqual(legacy.profileOrder,['Tony','Kai']);assert.equal(legacy.profiles.Tony.displayName,'Tony');assert.equal(legacy.profiles.Kai.displayName,'Kai');
 assert.equal(legacy.profiles.Tony.learningLevel,4);assert.equal(legacy.profiles.Kai.learningLevel,3);assert.deepEqual(legacy.profiles.Tony.courseProgress.year5,snapshotCourse(before.profiles.Tony));
 assert.deepEqual(legacy.profiles.Tony.cards,before.profiles.Tony.cards);assert.equal(legacy.profiles.Tony.xp,260);assert.equal(legacy.profiles.Tony.packs,7);assert.deepEqual(legacy.profiles.Tony.battle,before.profiles.Tony.battle);assert.equal(legacy.voice,'molly');assert.equal(legacy.sound,false);assert.equal(legacy.effects,'full');assert.ok(validSave(legacy));
 switchLevel(legacy.profiles.Tony,5);assert.equal(legacy.profiles.Tony.chapter,2);assert.deepEqual(legacy.profiles.Tony.done,[0,1]);
});

test('assisted recall stays due until a later clean retry, and retry question is appended in the same vocabulary session',()=>{
 const s=freshSave();createProfile(s,'Learner',3);const p=s.profiles[s.active],word='borrow',now=100000;
 reviewWord(p,word,false,now);reviewWord(p,word,true,now+1000,{assisted:true});assert.ok(p.mistakes.includes(word));assert.ok(dueWords(p,now+1001).includes(word));assert.equal(p.review[word].stats.assisted,1);assert.equal(p.review[word].level,0);
 reviewWord(p,word,true,now+2000,{assisted:false});assert.ok(!p.mistakes.includes(word));assert.equal(p.review[word].stats.independent,1);assert.equal(p.review[word].level,1);assert.ok(!dueWords(p,now+3000).includes(word));
 const base=questions(3,0,0,[],[]),retry=questions(3,0,0,[],[base[1].word]);assert.equal(retry.length,base.length+1);assert.equal(retry.at(-1).word,base[1].word);assert.equal(retry.at(-1).retry,true);assert.equal(retry.at(-1).hint,null);assert.match(retry.at(-1).sub,/TRY AGAIN/);
});

test('v7 source contains EX-only reveal gate, type-specific battle VFX and tablet-wide layout',()=>{
 const app=fs.readFileSync(new URL('../web/app.js',import.meta.url),'utf8'),cine=fs.readFileSync(new URL('../web/cinematic.js',import.meta.url),'utf8'),css=fs.readFileSync(new URL('../web/v7.css',import.meta.url),'utf8');
 assert.match(app,/c\?\.isEx\|\|c\?\.rarity==='EX'/);for(const type of ['electric','fire','water','grass','psychic','dark','metal','dragon','fighting'])assert.match(cine,new RegExp(`type==='${type}'`));assert.match(cine,/normal-star/);assert.match(css,/@media\(min-width:760px\)/);assert.match(css,/max-width:1080px/);assert.match(css,/\.ex-room/);assert.match(css,/\.typed-attack/);
});
