import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {COURSES,questions,migrateCourse,enterUnit} from '../web/course.js';
import {DATA_REVISION,CHANGED_UNITS} from '../web/course-content.js';
import {freshSave,createProfile,migrateSave,validSave,completeMission} from '../web/model.js';
import {switchLevel,syncCourse,LEVELS,snapshotCourse} from '../web/learning-level.js';
import {makeSandboxSave} from '../web/sandbox.js';
const map=JSON.parse(fs.readFileSync('Y1_Y6_CORE_WORDS.json','utf8').replace(/^\uFEFF/,'')).years;
test('144 units exactly match 576 authoritative unique words; all six stages have distinct valid answers',()=>{
 const all=[];const limits={1:[20,35],2:[30,45],3:[40,60],4:[55,75],5:[65,90],6:[80,110]};
 for(const y of LEVELS){assert.equal(COURSES[y].length,24);
 for(const [i,u] of COURSES[y].entries()){
  assert.deepEqual(u.words.map(w=>w[0]),map[y][i].core_words);all.push(...u.words.map(w=>w[0]));
  assert(u.words.every(w=>w.length===3&&w.every(Boolean)));
  const count=u.story.split(/\s+/).length;assert(count>=limits[y][0]&&count<=limits[y][1],y+':'+(i+1));
  for(let stage=0;stage<6;stage++)for(const q of questions(y,i,stage)){if(q.options){assert.equal(new Set(q.options).size,q.options.length);assert(q.options[q.correct]);}if(q.kind==='speaking')assert(u.s.includes(q.prompt));}
 }}
 assert.equal(all.length,576);assert.equal(new Set(all).size,576);
});
test('each year six-stage rewards and switches survive JSON without sharing progress',()=>{
 const s=freshSave();createProfile(s,'Learner',3);migrateCourse(s);const p=s.profiles[s.active];
 for(const y of LEVELS){switchLevel(p,y);assert.equal(p.done.length,0);for(let st=0;st<6;st++){assert(questions(y,0,st).length);assert(completeMission(p,st,1000));assert.equal(completeMission(p,st,1000),false);}syncCourse(p);}
 assert.equal(p.xp,360);assert.equal(p.packs,6);
 const restored=JSON.parse(JSON.stringify(s));assert(validSave(restored));assert.equal(migrateCourse(restored),false);
 for(const y of LEVELS){switchLevel(restored.profiles[restored.active],y);assert.equal(restored.profiles[restored.active].done.length,6);}
});
test('v7 migration preserves completed history and globals, archives only changed partial units and old Y5 mastery',()=>{
 const s=freshSave();createProfile(s,'Tony',4);const p=s.profiles[s.active];
 p.levelSchema=1;for(const c of Object.values(p.courseProgress))delete c.learningDataRevision;delete p.learningDataRevision;delete p.courseProgress.year1;delete p.courseProgress.year2;delete p.courseProgress.year6;
 p.xp=370;p.cards=[25,6];p.packs=8;p.wins=4;p.battles=7;p.battle={test:'unchanged'};p.pendingPack={test:'unchanged'};
 p.chapter=2;p.done=[0];p.partial={1:{index:1}};syncCourse(p);
 const y5=p.courseProgress.year5;y5.chapter=3;y5.done=[0,1];y5.partial={4:{index:1}};y5.review={precaution:{level:4},evidence:{level:2}};y5.unitProgress={0:{done:[0,1,2,3,4,5],partial:{}},3:{done:[0,1],partial:{4:{index:1}}}};
 const unchanged=JSON.stringify({xp:p.xp,cards:p.cards,packs:p.packs,wins:p.wins,battles:p.battles,battle:p.battle,pendingPack:p.pendingPack});
 assert(migrateSave(s));assert(migrateCourse(s));
 assert.equal(p.learningLevel,4);assert.deepEqual(p.partial,{1:{index:1}});
 const migrated=p.courseProgress.year5;assert.equal(migrated.chapter,3);assert.deepEqual(migrated.done,[0,1]);assert.deepEqual(migrated.partial,{});assert(migrated.contentMigrationHistory[0].units.length);
 assert.equal(migrated.legacyVocabulary.precaution.level,4);assert.equal(migrated.review.evidence.level,2);assert.equal(migrated.review.warning,undefined);
 assert.deepEqual(migrated.unitProgress[0].done,[0,1,2,3,4,5]);
 assert.equal(JSON.stringify({xp:p.xp,cards:p.cards,packs:p.packs,wins:p.wins,battles:p.battles,battle:p.battle,pendingPack:p.pendingPack}),unchanged);
 assert.equal(migrateCourse(s),false);
});
test('parent defaults, vocabulary language boundaries and hints across every year',()=>{
 const s=makeSandboxSave();assert.equal(s.profiles[s.profileOrder[0]].learningLevel,4);assert.equal(s.profiles[s.profileOrder[1]].learningLevel,3);
 for(const y of LEVELS)for(const i of [0,7,8,15,16,23]){
 const q=questions(y,i,0)[1],w=COURSES[y][i].words[0],ko=y<=3||(y===4&&i<8);
 assert.equal(q.options[0],w[ko?1:2]);assert.equal(Boolean(q.hint),!ko);
 assert.equal(Boolean(q.hintOpen),y===4&&i>=8&&i<16);
 }
});

test('a newly-created learner keeps in-progress answers on first reload',()=>{
 const s=freshSave();createProfile(s,'New learner',1);const p=s.profiles[s.active];p.partial={0:{index:2,order:[0,1,2,3],review:[],words:[]}};syncCourse(p);
 const restored=JSON.parse(JSON.stringify(s));migrateSave(restored);migrateCourse(restored);
 assert.deepEqual(restored.profiles[restored.active].partial,p.partial);
});
