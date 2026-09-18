import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {freshSave,freshProfile,validSave,migrateSave,createProfile,completeMission,startBattle,battleAnswer,battleMove,switchCard} from '../web/model.js';
import {migrateCourse,COURSES,questions} from '../web/course.js';
import {switchLevel,syncCourse,snapshotCourse} from '../web/learning-level.js';

test('legacy Tony Y5 and Kai Y3 survive defaults, switches, rewards and JSON restoration',()=>{
 const s={version:1,active:'Tony',profiles:{Tony:freshProfile(),Kai:freshProfile()},voice:'mitchell',sound:false};
 for(const [i,p] of Object.values(s.profiles).entries()){p.chapter=i+3;p.done=[0,2];p.partial={4:{index:1,review:[],words:[],order:[]}};p.review={borrow:{level:3,due:1234}};p.mistakes=['borrow'];p.unitProgress={0:{done:[0,1,2,3,4,5],partial:{}}};p.cards=[25,6,9];p.xp=123;p.packs=4;startBattle(p,p.cards);}
 const old=structuredClone(s);assert.equal(migrateSave(s),true);migrateCourse(s);assert.equal(s.profiles.Tony.learningLevel,4);assert.equal(s.profiles.Kai.learningLevel,3);
 assert.deepEqual(s.profiles.Tony.legacyLearningV5,snapshotCourse(old.profiles.Tony));assert.deepEqual(s.profiles.Kai.legacyLearningV5,snapshotCourse(old.profiles.Kai));const migratedY5=structuredClone(s.profiles.Tony.courseProgress.year5);assert.deepEqual(migratedY5.done,old.profiles.Tony.done);assert.deepEqual(migratedY5.partial,{});assert.ok(migratedY5.contentMigrationHistory.length);assert.deepEqual(s.profiles.Kai.partial,old.profiles.Kai.partial);
 const p=s.profiles.Tony;completeMission(p,0);syncCourse(p);const y4=snapshotCourse(p);for(const y of [5,3,4,5,4])switchLevel(p,y);assert.deepEqual(snapshotCourse(p),y4);assert.deepEqual(p.courseProgress.year5,migratedY5);
 assert.deepEqual(p.cards,old.profiles.Tony.cards);assert.equal(p.xp,133);assert.equal(p.packs,4);assert.deepEqual(p.battle,old.profiles.Tony.battle);assert.equal(s.voice,'molly');assert.equal(s.sound,false);
 const restored=JSON.parse(JSON.stringify(s));assert.ok(validSave(restored));assert.equal(migrateCourse(restored),false);assert.deepEqual(restored,s);restored.profiles.Tony.courseProgress.year5.chapter=-1;assert.equal(validSave(restored),false);
});
test('Y3/Y4/Y5 samples use graded hints, supplied speaking and complete fixed voice inventory',()=>{
 const hash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))>>>0;return h.toString(16);};
 for(const year of [3,4,5]){const course=COURSES[year];assert.equal(course.length,24);assert.equal(new Set(course.flatMap(u=>u.words.map(w=>w[0]))).size,96);
 for(const chapter of [0,8,16,23]){const u=course[chapter];for(let stage=0;stage<6;stage++)for(const q of questions(year,chapter,stage)){if(q.options)assert.equal(new Set(q.options).size,q.options.length);if(q.kind==='speaking')assert.ok(u.s.includes(q.prompt));if(q.audio)for(const voice of [''])assert.ok(fs.statSync('web/audio/'+voice+hash(q.audio)+'.mp3').size>1000);}
 const q=questions(year,chapter,0)[1];assert.equal(Boolean(q.hint),year===5||(year===4&&chapter>=8));assert.equal(q.hintOpen,year===4&&chapter>=8&&chapter<16);
 }}
});
test('full battle retains existing damage, switching and exactly-once victory reward',()=>{
 const s=freshSave();createProfile(s,'Tony',4);const p=s.profiles[s.active];p.cards=[6,9,3];startBattle(p,p.cards);const initial=p.xp;
 battleAnswer(p,true);assert.ok(battleMove(p,'basic'));assert.ok(p.battle.enemies[0].hp<80);assert.ok(p.battle.team[0].hp<140);assert.ok(switchCard(p,1));
 let actions=0,specials=0;while(!p.battle.result&&actions++<100){if(p.battle.phase==='question')battleAnswer(p,true);if(p.battle.energy<3)battleMove(p,'charge');else{battleMove(p,'special');specials++;}}
 assert.equal(p.battle.result,'won');assert.ok(specials>=3);assert.equal(p.xp,initial+20);assert.equal(p.wins,1);assert.equal(battleMove(p,'special'),false);assert.equal(battleAnswer(p,true),false);assert.equal(p.xp,initial+20);
});
