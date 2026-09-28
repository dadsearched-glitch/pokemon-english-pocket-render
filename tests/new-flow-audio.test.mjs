import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {COURSES} from '../web/course.js';
import {createProfile,freshSave,reviewWord} from '../web/model.js';
import {startSoloDaily,soloDailyQuestion,answerSoloDaily,soloDailySituation,answerSoloSituation,soloDailyPhrase} from '../web/solo-daily.js';
import {diagnosticItems} from '../web/learning-insights.js';

const manifest=JSON.parse(readFileSync(new URL('../web/audio-manifest.json',import.meta.url),'utf8'));
const audioPath=text=>{let hash=0;for(const char of text)hash=(Math.imul(31,hash)+char.charCodeAt(0))>>>0;return `audio/${hash.toString(16)}.mp3`;};
function assertPlayable(text,context){
 assert.ok(typeof text==='string'&&text.length>0,`${context}: empty spoken text`);
 assert.equal(manifest[text],audioPath(text),`${context}: missing or wrong Molly audio mapping`);
 assert.ok(statSync(new URL(`../web/${manifest[text]}`,import.meta.url)).size>1000,`${context}: empty audio`);
}

test('every daily and Year-preview Listen action resolves to a bundled Molly file',()=>{
 const now=new Date(2026,8,29,12).getTime();
 for(let year=1;year<=6;year++){
  for(const [i,item] of diagnosticItems(year).entries())assertPlayable(item.audio,`Year ${year} preview ${i+1}`);
  for(let unit=0;unit<24;unit++){
   const save=freshSave();createProfile(save,'Audio check',year);const p=save.profiles[save.active];p.chapter=unit;
   for(const word of COURSES[year][unit].words)reviewWord(p,word[0],true,now-86400000);
   assert.ok(startSoloDaily(p,now));
   for(let i=0;i<3;i++){const q=soloDailyQuestion(p);assertPlayable(q.word,`Year ${year} Unit ${unit+1} daily word ${i+1}`);assert.equal(answerSoloDaily(p,q.correct,now),true);}
   const situation=soloDailySituation(p);assert.equal(answerSoloSituation(p,situation.correct,now),true);
   assertPlayable(soloDailyPhrase(p),`Year ${year} Unit ${unit+1} daily phrase`);
  }
 }
});
