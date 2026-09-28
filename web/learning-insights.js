import {questions} from './course.js';

const DAY=86400000;
const localDay=now=>{const d=new Date(now);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const KINDS=new Set(['listenAudio','listenRead','reading','speakingMatch','speakingSelf','situation','daily']);
export function recordLearningEvent(p,kind,now=Date.now()){
 if(!KINDS.has(kind))return false;
 p.learningEvidence||=[];p.learningEvidence.push({day:localDay(now),year:p.learningLevel,kind});
 if(p.learningEvidence.length>1000)p.learningEvidence.splice(0,p.learningEvidence.length-1000);
 return true;
}
export function parentInsights(p,year=p.learningLevel,now=Date.now()){
 const count={listenAudio:0,listenRead:0,reading:0,speakingMatch:0,speakingSelf:0,situation:0,daily:0,recent:0,previous:0};
 for(const e of p.learningEvidence||[]){if(e.year!==year||!KINDS.has(e.kind))continue;count[e.kind]++;const age=Math.floor((new Date(localDay(now)).getTime()-new Date(e.day).getTime())/DAY);if(age>=0&&age<7)count.recent++;else if(age>=7&&age<14)count.previous++;}
 return count;
}

function shuffled(options,seed){const order=options.map((_,i)=>i);for(let i=order.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[order[i],order[j]]=[order[j],order[i]];}return {options:order.map(i=>options[i]),correct:order.indexOf(0)};}
export function diagnosticItems(year){if(!Number.isInteger(year)||year<1||year>6)return [];
 const wordUnits=[0,8,16],items=wordUnits.map((chapter,i)=>{const q=questions(year,chapter,0)[i+1],mixed=shuffled(q.options,year*101+chapter*17+i);return {kind:'word',prompt:q.prompt,audio:q.audio,chapter,...mixed};});
 for(const [i,chapter] of [0,12].entries()){const q=questions(year,chapter,1)[0],mixed=shuffled(q.options,year*197+chapter*19+i);items.push({kind:'listen',prompt:'What does the speaker mean?',audio:q.audio,chapter,...mixed});}
 const q=questions(year,12,4)[0];items.push({kind:'speaking',prompt:q.prompt,audio:q.audio,chapter:12});return items;
}
export function startDiagnostic(p,year){const items=diagnosticItems(year);if(!items.length)return null;p.diagnostic={year,index:0,answers:[],heard:false,fallback:false};return p.diagnostic;}
export const currentDiagnostic=p=>p.diagnostic?diagnosticItems(p.diagnostic.year)[p.diagnostic.index]||null:null;
export function diagnosticHeard(p,{fallback=false}={}){const d=p.diagnostic,q=currentDiagnostic(p);if(!q||q.kind!=='listen')return false;d.heard=!fallback;d.fallback=Boolean(fallback);return true;}
export function answerDiagnostic(p,index){const d=p.diagnostic,q=currentDiagnostic(p);if(!d||!q||q.kind==='speaking'||!Number.isInteger(index)||index<0||index>=q.options.length||q.kind==='listen'&&!(d.heard||d.fallback))return null;const correct=index===q.correct;d.answers.push({kind:q.kind,correct,mode:q.kind==='listen'?(d.fallback?'read':'audio'):'word'});d.index++;d.heard=false;d.fallback=false;return correct;}
export function finishDiagnosticSpeaking(p,confident){const d=p.diagnostic,q=currentDiagnostic(p);if(!d||q?.kind!=='speaking'||typeof confident!=='boolean')return false;d.answers.push({kind:'speaking',correct:confident,mode:'self-report'});d.index++;return true;}
export function diagnosticRecommendation(p){const d=p.diagnostic;if(!d||currentDiagnostic(p))return null;const words=d.answers.filter(a=>a.kind==='word'&&a.correct).length,listen=d.answers.filter(a=>a.kind==='listen'&&a.correct&&a.mode==='audio').length,speaking=d.answers.some(a=>a.kind==='speaking'&&a.correct);const suggested=words<=1||listen===0?Math.max(1,d.year-1):words===3&&listen===2&&speaking?Math.min(6,d.year+1):d.year;return {year:d.year,suggested,words,listen,speaking,readFallback:d.answers.filter(a=>a.kind==='listen'&&a.mode==='read').length};}
