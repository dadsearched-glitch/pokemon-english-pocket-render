import {vocabularyFor,unitFor} from './course.js';
import {LEGACY_CARDS} from './data.js';
import {reviewWord} from './model.js';
import {initRewards,localDay} from './rewards.js';
import {recordLearningEvent} from './learning-insights.js';

const pickWords=(p,now)=>{
 const pool=vocabularyFor(p.learningLevel).slice(0,(p.chapter+1)*4),known=pool.filter(w=>p.review?.[w[0]]);
 const due=new Set([...p.mistakes,...Object.keys(p.review).filter(w=>p.review[w]?.due<=now)]);
 const day=localDay(now),score=w=>{let n=2166136261;for(const c of day+':'+w[0]){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;};
 return known.sort((a,b)=>Number(due.has(b[0]))-Number(due.has(a[0]))||score(a)-score(b)).slice(0,3).map(w=>w[0]);
};
export const dailyAvailable=p=>vocabularyFor(p.learningLevel).slice(0,(p.chapter+1)*4).filter(w=>p.review?.[w[0]]).length>=3;
export const dailyComplete=(p,now=Date.now())=>p.soloDaily?.date===localDay(now)&&p.soloDaily.rewarded===true;
export function startSoloDaily(p,now=Date.now()){
 const date=localDay(now);
 if(p.soloDaily?.date===date&&(p.soloDaily.rewarded||p.soloDaily.year===p.learningLevel))return p.soloDaily;
 const words=pickWords(p,now);if(words.length<3)return null;
 p.soloDaily={date,year:p.learningLevel,unit:p.chapter,words,index:0,situationDone:false,rewarded:false,misses:0};return p.soloDaily;
}
export function soloDailyQuestion(p){const d=p.soloDaily;if(!d||d.rewarded||d.index>=d.words.length)return null;
 const pool=vocabularyFor(d.year),target=pool.find(w=>w[0]===d.words[d.index]);if(!target)return null;
 const easy=d.year<=3||(d.year===4&&d.unit<8),field=easy?1:2;
 const distractors=[...new Map(pool.filter(w=>w[0]!==target[0]&&w[field]!==target[field]).map(w=>[w[field],w])).values()].slice(0,3);
 const options=[target,...distractors].map(w=>w[field]);
 let seed=0;for(const char of `${d.date}:${target[0]}`)seed=(Math.imul(seed,33)+char.charCodeAt(0))>>>0;
 const order=options.map((_,i)=>i);for(let i=order.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 return {word:target[0],options:order.map(i=>options[i]),correct:order.indexOf(0),step:d.index+1,total:d.words.length};
}
export function answerSoloDaily(p,index,now=Date.now()){
 const d=p.soloDaily,q=soloDailyQuestion(p);if(!d||d.date!==localDay(now)||d.year!==p.learningLevel||!q||!Number.isInteger(index))return null;
 const correct=index===q.correct;reviewWord(p,q.word,correct,now);
 if(correct)d.index++;else d.misses++;
 return correct;
}
export function soloDailySituation(p){const d=p.soloDaily;if(!d||d.rewarded||d.index!==d.words.length||d.situationDone)return null;const u=unitFor(d.year,d.unit),other=unitFor(d.year,(d.unit+1)%24),choices=[u.s[0],u.s[1],other.s[0]],context=(u.story.match(/[^.!?]+[.!?]?/)||[u.story])[0].trim();let seed=0;for(const char of `${d.date}:${d.year}:${d.unit}`)seed=(Math.imul(seed,33)+char.charCodeAt(0))>>>0;const order=choices.map((_,i)=>i);for(let i=order.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[order[i],order[j]]=[order[j],order[i]];}return {context,prompt:u.l[0],options:order.map(i=>choices[i]),correct:order.indexOf(0)};}
export function answerSoloSituation(p,index,now=Date.now()){const d=p.soloDaily,q=soloDailySituation(p);if(!d||d.date!==localDay(now)||d.year!==p.learningLevel||!q||!Number.isInteger(index)||index<0||index>=q.options.length)return null;const correct=index===q.correct;if(correct){d.situationDone=true;recordLearningEvent(p,'situation',now);}else d.situationMisses=(d.situationMisses||0)+1;return correct;}
export function soloDailyPhrase(p){const d=p.soloDaily;if(!d||d.rewarded||d.index!==d.words.length||!d.situationDone)return null;return unitFor(d.year,d.unit).s[0];}
export function finishSoloDaily(p,now=Date.now()){
 const d=p.soloDaily;if(!d||d.date!==localDay(now)||d.rewarded||!soloDailyPhrase(p))return null;
 initRewards(p);d.rewarded=true;p.soloDays=(p.soloDays||0)+1;
 p.multiplayer.shards=Math.min(999,p.multiplayer.shards+1);
 const reward={shard:true,pack:false,card:null};
 if(p.multiplayer.shards>=5){p.multiplayer.shards-=5;p.packs++;reward.pack=true;}
 if(p.soloDays%5===0){const card=LEGACY_CARDS.find(c=>!p.cards.some(id=>String(id)===String(c.id)));if(card){p.cards.push(card.id);reward.card=card.id;}}
 d.reward=reward;recordLearningEvent(p,'daily',now);return reward;
}
