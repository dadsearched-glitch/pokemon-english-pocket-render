import test from 'node:test';
import assert from 'node:assert/strict';
import {markHintSeen,usedHelp} from '../web/recall-quality.js';
import {questions} from '../web/course.js';
import {freshProfile,reviewWord,migrateSave,validSave} from '../web/model.js';
import {initLevels,switchLevel,syncCourse,snapshotCourse} from '../web/learning-level.js';

test('hint-open, hint-close/reload, wrong and clean answers retain distinct recall quality',()=>{
 for(const scenario of ['clean','hint','wrong','default-open']){
  const q=questions(scenario==='default-open'?4:5,scenario==='default-open'?8:0,0)[1];
  let state={attempts:0};
  if(scenario==='hint')markHintSeen(state,q);
  if(scenario==='wrong')state.attempts=1;
  state=JSON.parse(JSON.stringify(state)); // persistence after closing/reloading
  const p=freshProfile(),assisted=usedHelp(state,q);
  reviewWord(p,q.word,true,100000,{assisted});
  assert.equal(assisted,scenario!=='clean');
  assert.equal(p.review[q.word].level,assisted?0:1);
  assert.equal(p.review[q.word].stats.assisted,assisted?1:0);
  if(assisted){
   const retry=questions(q.hintOpen?4:5,q.hintOpen?8:0,0,[],[q.word]).at(-1);
   assert.equal(usedHelp({attempts:0,hintSeen:false},retry),false);
   reviewWord(p,q.word,true,101000,{assisted:false});
   assert.equal(p.review[q.word].level,1);
  }
 }
});

test('already-banked v6 saves preserve all three years and global records through JSON migration',()=>{
 const p=freshProfile();initLevels(p,4);
 for(const year of [3,5,4]){switchLevel(p,year);p.chapter=year;p.done=[0];p.partial={1:{index:1}};p.review={['word'+year]:{level:year-2,due:123,seen:5}};syncCourse(p);}
 p.legacyLearningV5={chapter:7,done:[0,1],marker:'untouched'};
 Object.assign(p,{cards:[25,25,6],xp:370,packs:8,opened:4,wins:2,battles:3,pendingPack:{cards:[25,6,7,1,133],index:2}});
 const s={version:1,active:'Tony',profiles:{Tony:p,Kai:initLevels(freshProfile(),3)},voice:'mitchell',sound:false};
 const before=structuredClone(s);migrateSave(s);assert.ok(validSave(s));
 for(const key of ['cards','xp','packs','opened','wins','battles','pendingPack','legacyLearningV5','courseProgress'])assert.deepEqual(s.profiles.Tony[key],before.profiles.Tony[key]);
 for(const year of [3,5,4]){switchLevel(s.profiles.Tony,year);assert.deepEqual(snapshotCourse(s.profiles.Tony),before.profiles.Tony.courseProgress['year'+year]);}
 assert.equal(s.profiles.Kai.learningLevel,3);
});
