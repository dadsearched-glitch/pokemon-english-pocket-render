import {DATA_REVISION} from './course-content.js';
// Learning banks contain only learning state, never cards, packs, XP or battles.
export const LEVELS=[1,2,3,4,5,6];
const fields=['chapter','done','partial','review','mistakes','unitProgress','courseComplete','speakingMatches','speakingSelfChecks','learningDataRevision','legacyVocabulary','contentMigrationHistory'];
export function emptyProgress(){return {chapter:0,done:[],partial:{},review:{},mistakes:[],unitProgress:{},courseComplete:false,speakingMatches:0,speakingSelfChecks:0};}
export function snapshotCourse(p){const base=emptyProgress();for(const key of fields)if(p[key]!==undefined)base[key]=structuredClone(p[key]);return base;}
function applyCourse(p,c){for(const key of fields)delete p[key];Object.assign(p,structuredClone(c));}
const banks=()=>Object.fromEntries(LEVELS.map(y=>['year'+y,{...emptyProgress(),learningDataRevision:DATA_REVISION}]));
export function syncCourse(p){if(LEVELS.includes(p.learningLevel)&&p.courseProgress)p.courseProgress['year'+p.learningLevel]=snapshotCourse(p);}
export function initLevels(p,level=3){level=Number(level);if(!LEVELS.includes(level))level=3;p.courseProgress=banks();p.learningLevel=level;p.levelSchema=2;applyCourse(p,p.courseProgress['year'+level]);return p;}
export function migrateLevels(save){let changed=false;for(const [key,p] of Object.entries(save.profiles||{})){
 if([1,2].includes(p.levelSchema)&&p.courseProgress){
  syncCourse(p);
  for(const y of LEVELS)if(!p.courseProgress['year'+y]){p.courseProgress['year'+y]=emptyProgress();changed=true;}
  if(p.levelSchema!==2){p.levelSchema=2;changed=true;}
  continue;
 }
 const label=p.displayName||p.name||key,legacyYear=label==='Tony'||key==='Tony'?5:3;
 p.legacyLearningV5=snapshotCourse(p);p.courseProgress=banks();p.courseProgress['year'+legacyYear]=snapshotCourse(p);
 p.learningLevel=label==='Tony'||key==='Tony'?4:3;p.levelSchema=2;applyCourse(p,p.courseProgress['year'+p.learningLevel]);
 if(['lesson','summary','course'].includes(p.route))p.route='home';changed=true;
 }return changed;}
export function switchLevel(p,level){level=Number(level);if(!LEVELS.includes(level)||level===p.learningLevel)return false;syncCourse(p);p.learningLevel=level;applyCourse(p,p.courseProgress['year'+level]);if(!p.pendingPack)p.route='home';return true;}
export function validLevelProgress(p){if(p.levelSchema===undefined)return true;if(![1,2].includes(p.levelSchema)||!LEVELS.includes(p.learningLevel)||!p.courseProgress)return false;const years=p.levelSchema===1?[3,4,5]:LEVELS;return years.every(y=>{const c=p.courseProgress['year'+y];return c&&Number.isInteger(c.chapter)&&c.chapter>=0&&c.chapter<24&&Array.isArray(c.done)&&c.done.every(n=>Number.isInteger(n)&&n>=0&&n<6)&&new Set(c.done).size===c.done.length&&c.partial&&c.review&&Array.isArray(c.mistakes)&&c.unitProgress;});}
