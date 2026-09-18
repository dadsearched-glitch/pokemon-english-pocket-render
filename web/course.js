import {COURSES,COURSE_VERSION,DATA_REVISION,CHANGED_UNITS} from './course-content.js';
export {COURSES,COURSE_VERSION};
import {migrateLevels,syncCourse,LEVELS} from './learning-level.js';
export const courseFor=profile=>COURSES[profile]||COURSES.Kai;
export const unitFor=(profile,chapter)=>courseFor(profile)[Math.max(0,Math.min(courseFor(profile).length-1,chapter))];
export const vocabularyFor=profile=>courseFor(profile).flatMap(u=>u.words);
export function migrateCourse(save){
 let changed=migrateLevels(save);
 for(const p of Object.values(save.profiles)){
  syncCourse(p);
  for(const y of LEVELS){
   const c=p.courseProgress['year'+y];if(c.learningDataRevision===DATA_REVISION)continue;
   const history=[];
   for(const index of CHANGED_UNITS[y]){
    if(index===c.chapter&&Object.keys(c.partial||{}).length){history.push({unit:index+1,partial:structuredClone(c.partial)});c.partial={};}
    const old=c.unitProgress?.[index];if(old&&Object.keys(old.partial||{}).length){history.push({unit:index+1,partial:structuredClone(old.partial)});old.partial={};}
   }
   if(history.length){c.contentMigrationHistory||=[];c.contentMigrationHistory.push({from:c.learningDataRevision||'v7.1.1',to:DATA_REVISION,units:history});}
   if(y===5){const removed=['precaution','significance','assumption','contradict','counterargument','transferable'];for(const word of removed)if(c.review[word]){c.legacyVocabulary||={};c.legacyVocabulary[word]=structuredClone(c.review[word]);delete c.review[word];}c.mistakes=c.mistakes.filter(w=>!removed.includes(w));}
   c.learningDataRevision=DATA_REVISION;changed=true;
  }
  Object.assign(p,structuredClone(p.courseProgress['year'+p.learningLevel]));
  if(p.courseVersion!==COURSE_VERSION){p.previousCourseVersion=p.courseVersion;p.courseVersion=COURSE_VERSION;changed=true;}
  if(changed&&['lesson','summary'].includes(p.route))p.route='home';
 }
 return changed;
}
export function enterUnit(p,index,{sandbox=false}={}){if(!Number.isInteger(index)||index<0||index>=24)return false;const completed=i=>(i===p.chapter?p.done:p.unitProgress?.[i]?.done)?.length===6;if(!sandbox&&index>0&&!completed(index-1)&&index!==p.chapter)return false;p.unitProgress||={};p.unitProgress[p.chapter]={done:[...p.done],partial:structuredClone(p.partial)};const next=p.unitProgress[index];p.chapter=index;p.done=next?[...next.done]:[];p.partial=next?structuredClone(next.partial):{};p.route='home';return true;}
function wordQuestion(profile,chapter,w,{review=false,retry=false}={}){const u=unitFor(profile,chapter),easy=u.year<=3||(u.year===4&&chapter<8),pool=[...u.words,...vocabularyFor(profile).slice(0,(chapter+1)*4)];const wrong=[...new Map(pool.filter(x=>x[0]!==w[0]).map(x=>[x[easy?1:2],x])).values()].slice(0,3);return {kind:'choice',prompt:w[0],sub:retry?'TRY AGAIN · 힌트 없이 다시 떠올려요.':review?'REVIEW · 배운 단어를 떠올려요.':easy?'Choose the meaning · 알맞은 뜻을 골라요.':'Choose the meaning that fits this unit.',audio:w[0],word:w[0],retry,hint:retry?null:(easy?null:w[1]),hintOpen:!retry&&!easy&&u.year===4&&chapter<16,options:[w[easy?1:2],...wrong.map(x=>x[easy?1:2])],correct:0};}
export function questions(profile,chapter,stage,review=[],retry=[]){const u=unitFor(profile,chapter),pool=vocabularyFor(profile),retryWords=[...new Set(retry)].map(word=>pool.find(x=>x[0]===word)).filter(Boolean);if(stage===0)return [{kind:'learn',prompt:'Meet four useful words',sub:u.focus,teach:u.words},...u.words.map(w=>wordQuestion(profile,chapter,w)),...retryWords.map(w=>wordQuestion(profile,chapter,w,{review:true,retry:true}))];
 if(stage===1){const other=courseFor(profile)[(chapter+1)%24];return [{kind:'listen',prompt:'What does the speaker mean?',sub:'Listen for the meaning, not just one word.',audio:u.s[0],options:u.l,correct:0},{kind:'listen',prompt:'Which sentence did you hear?',sub:'Listen carefully to the whole sentence.',audio:u.s[1],options:[u.s[1],u.s[0],other.s[1]],correct:0}];}
 if(stage===2)return u.r.map((r,i)=>({kind:'reading',prompt:r[0],sub:i?'Use clues in the text · 글 속 근거로 생각해요.':'Find the information in the text.',story:u.story,glossary:[...u.words,...(u.exposure||[])],audio:u.story,options:r.slice(1),correct:0}));
 if(stage===3)return [{kind:'sentence',prompt:'Build the sentence',sub:u.focus,audio:u.s[0],words:u.s[0].split(' ')}];
 if(stage===4)return u.s.map(sentence=>({kind:'speaking',prompt:sentence,sub:'Listen, then say the sentence clearly.',audio:sentence}));
 const prior=review.map(w=>pool.find(x=>x[0]===w)).filter(Boolean).filter(w=>!u.words.some(x=>x[0]===w[0])).slice(0,2);return [...u.words,...prior].map(w=>wordQuestion(profile,chapter,w,{review:true})).concat(retryWords.map(w=>wordQuestion(profile,chapter,w,{review:true,retry:true})));}
export function battlePrompt(profile,p){const pool=vocabularyFor(profile).slice(0,(p.chapter+1)*4),turn=p.battle.turn,offset=(p.battles*7+p.chapter*4)%pool.length;const w=pool[(offset+turn)%pool.length],q=wordQuestion(profile,p.chapter,w,{review:true});return {word:w[0],options:q.options,order:q.options.map((_,i)=>(i+turn)%q.options.length)};}
