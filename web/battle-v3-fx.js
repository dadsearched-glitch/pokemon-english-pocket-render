import {byId,TYPES} from './data.js';

const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let audioCtx=null;

function audio(){
 try{
  if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  return audioCtx;
 }catch{return null;}
}
function tone(freq=440,duration=.08,volume=.035,type='sine',delay=0){
 const ctx=audio();if(!ctx)return;
 const start=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();
 o.type=type;o.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+.01);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
 o.connect(g).connect(ctx.destination);o.start(start);o.stop(start+duration+.02);
}
function noise(duration=.1,volume=.025,delay=0){
 const ctx=audio();if(!ctx)return;
 const n=Math.max(1,Math.floor(ctx.sampleRate*duration)),buffer=ctx.createBuffer(1,n,ctx.sampleRate),data=buffer.getChannelData(0);
 for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n);
 const src=ctx.createBufferSource(),g=ctx.createGain(),filter=ctx.createBiquadFilter(),start=ctx.currentTime+delay;
 src.buffer=buffer;filter.type='highpass';filter.frequency.value=450;g.gain.setValueAtTime(volume,start);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
 src.connect(filter).connect(g).connect(ctx.destination);src.start(start);
}
function sound(kind){
 if(kind==='charge'){tone(330,.08,.028,'triangle');tone(520,.1,.025,'triangle',.07);}
 else if(kind==='special'){tone(180,.14,.035,'sawtooth');tone(540,.16,.03,'square',.08);noise(.16,.018,.05);}
 else if(kind==='team'){tone(260,.12,.03,'triangle');tone(390,.12,.03,'triangle',.08);tone(780,.22,.035,'sine',.17);noise(.2,.025,.16);}
 else if(kind==='hit'){tone(92,.11,.045,'square');noise(.13,.045);}
 else if(kind==='break'){tone(760,.07,.025,'square');tone(420,.12,.035,'square',.05);noise(.18,.05,.03);}
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
function center(el,arena){
 const r=el.getBoundingClientRect(),a=arena.getBoundingClientRect();
 return {x:r.left-a.left+r.width/2,y:r.top-a.top+r.height*.46,w:r.width,h:r.height};
}
function create(layer,cls,text=''){
 const el=document.createElement('i');el.className=cls;if(text)el.textContent=text;layer.append(el);return el;
}
function div(layer,cls,text=''){
 const el=document.createElement('div');el.className=cls;if(text)el.textContent=text;layer.append(el);return el;
}
function anim(el,frames,options){
 if(!el)return Promise.resolve();
 try{const a=el.animate(frames,{fill:'both',easing:'cubic-bezier(.2,.72,.18,1)',...options});return a.finished.catch(()=>{});}catch{return Promise.resolve();}
}
function moveTitle(event,card){
 if(event.move==='team')return 'TEAM ATTACK';
 if(event.move==='duo')return 'TAG FINISH';
 return event.move==='special'?(card?.power||'SPECIAL MOVE'):(card?.move||'ATTACK');
}
function eventType(event){return byId(event.own)?.type||'normal';}
function targetCard(event){return byId(event.foe);}
function isEffective(event){const own=byId(event.own),foe=targetCard(event);return !!(own&&foe&&TYPES[foe.type]?.weak===own.type);}
function stateShield(state){return state?.mode==='raid'?state.boss?.shield||0:0;}
function stateShieldMax(state){return state?.mode==='raid'?state.boss?.shieldMax||0:0;}

function actorTarget(root,event){
 const arena=root.querySelector('.mp-arena');if(!arena)return {};
 const units=[...arena.querySelectorAll('.mp-unit')];
 let actor=units.find(el=>el.dataset.playerId===event.actor);
 if(!actor)actor=units.find(el=>String(el.dataset.cardId)===String(event.own));
 let target=event.target?units.find(el=>el.dataset.playerId===event.target):null;
 if(!target)target=units.find(el=>String(el.dataset.cardId)===String(event.foe)&&el!==actor&&el.classList.contains('foe-unit'));
 if(!target)target=units.find(el=>String(el.dataset.cardId)===String(event.foe)&&el!==actor);
 if(!target)target=arena.querySelector('.foe-unit');
 return {arena,actor,target};
}
function hpTween(target,event,reduced){
 const bar=target?.querySelector('.unit-hp .hp-track i');if(!bar||!event.max)return Promise.resolve();
 const before=clamp(100*event.before/event.max),after=clamp(100*event.after/event.max);
 bar.style.width=before+'%';
 return anim(bar,[{width:before+'%'},{width:after+'%'}],{duration:reduced?120:650,easing:'cubic-bezier(.3,.7,.2,1)'}).then(()=>{bar.style.width=after+'%';});
}
function shieldTween(target,beforeState,afterState,reduced){
 const bar=target?.querySelector('.unit-shield i b'),max=stateShieldMax(afterState)||stateShieldMax(beforeState);if(!bar||!max)return Promise.resolve();
 const before=clamp(100*stateShield(beforeState)/max),after=clamp(100*stateShield(afterState)/max);
 bar.style.width=before+'%';
 return anim(bar,[{width:before+'%'},{width:after+'%'}],{duration:reduced?120:520}).then(()=>{bar.style.width=after+'%';});
}
function banner(layer,event,card,type){
 const el=div(layer,'v3-move-banner');
 el.style.setProperty('--fx',TYPES[type]?.colour||'#ffe47c');
 const kicker=document.createElement('small');kicker.textContent=event.move==='team'?'CO-OP FINISHER':event.move==='duo'?'TAG CHAIN FINISHER':event.move==='special'?'SPECIAL MOVE':'ATTACK';
 const strong=document.createElement('strong');strong.textContent=moveTitle(event,card);
 const typeEl=document.createElement('span');typeEl.textContent=`${TYPES[type]?.symbol||'✦'} ${type.toUpperCase()}`;
 el.append(kicker,strong,typeEl);return el;
}
function specialCutin(layer,card,type,label,team=false){
 const el=div(layer,'v3-special-cutin'+(card?.isEx||String(card?.rarity).toLowerCase()==='ex'?' is-ex':'')+(team?' is-team':''));
 el.style.setProperty('--fx',TYPES[type]?.colour||'#ffe47c');
 if(card?.art){const img=document.createElement('img');img.src=card.art;img.alt='';el.append(img);}
 const copy=document.createElement('div');const small=document.createElement('small');small.textContent=team?'POWER LINK':'SPECIAL MOVE';const b=document.createElement('b');b.textContent=card?.name||'TEAM';const s=document.createElement('span');s.textContent=label;copy.append(small,b,s);el.append(copy);return el;
}
function impact(layer,point,type,special=false){
 const colour=TYPES[type]?.colour||'#fff0a0',tasks=[];
 const core=create(layer,'v3-impact-core');core.style.cssText=`left:${point.x}px;top:${point.y}px;--fx:${colour}`;
 tasks.push(anim(core,[{opacity:0,transform:'translate(-50%,-50%) scale(.25) rotate(-15deg)'},{opacity:1,offset:.25,transform:'translate(-50%,-50%) scale(1.05) rotate(0deg)'},{opacity:0,transform:'translate(-50%,-50%) scale(1.55) rotate(18deg)'}],{duration:special?620:430}).then(()=>core.remove()));
 const rays=special?12:8;
 for(let i=0;i<rays;i++){
  const ray=create(layer,'v3-impact-ray');const ang=(360/rays)*i+(i%2?8:-8),len=(special?86:58)+(i%3)*18;
  ray.style.cssText=`left:${point.x}px;top:${point.y}px;--fx:${colour};--a:${ang}deg;--len:${len}px`;
  tasks.push(anim(ray,[{opacity:0,transform:`rotate(${ang}deg) scaleX(.15)`},{opacity:.95,offset:.18,transform:`rotate(${ang}deg) scaleX(1)`},{opacity:0,transform:`rotate(${ang}deg) translateX(${special?28:18}px) scaleX(.6)`}],{duration:420+i*16}).then(()=>ray.remove()));
 }
 const shards=special?14:8;
 for(let i=0;i<shards;i++){
  const shard=create(layer,`v3-impact-shard type-${type}`),a=i/shards*Math.PI*2,dist=(special?95:65)+(i%4)*13;
  shard.style.cssText=`left:${point.x}px;top:${point.y}px;--fx:${colour}`;
  tasks.push(anim(shard,[{opacity:0,transform:'translate(-50%,-50%) scale(.3) rotate(0)'},{opacity:1,offset:.18},{opacity:0,transform:`translate(calc(-50% + ${Math.cos(a)*dist}px),calc(-50% + ${Math.sin(a)*dist}px)) scale(${.7+(i%3)*.18}) rotate(${140+i*37}deg)`}],{duration:500+(i%4)*45}).then(()=>shard.remove()));
 }
 return Promise.all(tasks);
}
function travelLine(layer,a,b,type,special=false){
 const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)*180/Math.PI,colour=TYPES[type]?.colour||'#fff';
 const beam=create(layer,`v3-travel v3-travel-${type}${special?' is-special':''}`);
 beam.style.cssText=`left:${a.x}px;top:${a.y}px;width:${len}px;--angle:${angle}deg;--fx:${colour}`;
 return anim(beam,[{opacity:0,transform:`rotate(${angle}deg) scaleX(.04)`},{opacity:1,offset:.18,transform:`rotate(${angle}deg) scaleX(.9)`},{opacity:.9,offset:.62,transform:`rotate(${angle}deg) scaleX(1)`},{opacity:0,transform:`rotate(${angle}deg) scaleX(1.05)`}],{duration:special?620:390}).then(()=>beam.remove());
}
function particles(layer,a,b,type,special=false){
 const tasks=[],count=special?16:9,colour=TYPES[type]?.colour||'#fff';
 if(type==='psychic'){
  for(let i=0;i<(special?4:2);i++){const ring=create(layer,'v3-psy-ring');ring.style.cssText=`left:${b.x}px;top:${b.y}px;--fx:${colour}`;tasks.push(anim(ring,[{opacity:0,transform:`translate(-50%,-50%) scale(.25) rotate(${i*18}deg)`},{opacity:.85,offset:.3},{opacity:0,transform:`translate(-50%,-50%) scale(${1.4+i*.22}) rotate(${55+i*30}deg)`}],{duration:520+i*90}).then(()=>ring.remove()));}return Promise.all(tasks);
 }
 if(type==='dark'){
  for(let i=0;i<(special?5:3);i++){const slash=create(layer,'v3-dark-slash');slash.style.cssText=`left:${b.x-70+i*15}px;top:${b.y-40+i*18}px;--fx:${colour}`;tasks.push(anim(slash,[{opacity:0,transform:'rotate(-35deg) scaleX(.15)'},{opacity:1,offset:.35,transform:'rotate(-35deg) scaleX(1.1)'},{opacity:0,transform:'translate(35px,-25px) rotate(-35deg) scaleX(1.35)'}],{duration:360+i*60}).then(()=>slash.remove()));}return Promise.all(tasks);
 }
 if(type==='grass'){
  for(let j=0;j<(special?3:2);j++){const vine=create(layer,'v3-vine');const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)*180/Math.PI;vine.style.cssText=`left:${a.x}px;top:${a.y+j*7-7}px;width:${len}px;--angle:${angle+(j-1)*3}deg;--fx:${colour}`;tasks.push(anim(vine,[{opacity:0,transform:`rotate(${angle}deg) scaleX(.05) scaleY(.7)`},{opacity:1,offset:.25,transform:`rotate(${angle+(j-1)*3}deg) scaleX(1) scaleY(1)`},{opacity:0,transform:`rotate(${angle+(j-1)*3}deg) scaleX(1.03) scaleY(.7)`}],{duration:special?680:440}).then(()=>vine.remove()));}
 }
 for(let i=0;i<count;i++){
  const p=create(layer,`v3-particle type-${type}`),r=(i+1)/(count+1),jitter=(i%5-2)*(special?13:8),x=a.x+(b.x-a.x)*r,y=a.y+(b.y-a.y)*r+jitter;
  p.style.cssText=`left:${x}px;top:${y}px;--fx:${colour};--r:${(i*47)%360}deg`;
  const endX=(i%2?1:-1)*(18+(i%4)*8),endY=-18+(i%5)*9;
  tasks.push(anim(p,[{opacity:0,transform:'translate(-50%,-50%) scale(.35) rotate(0)'},{opacity:1,offset:.22},{opacity:0,transform:`translate(calc(-50% + ${endX}px),calc(-50% + ${endY}px)) scale(1.1) rotate(${160+i*31}deg)`}],{duration:380+(i%5)*45,delay:(i%4)*18}).then(()=>p.remove()));
 }
 return Promise.all(tasks);
}
function damagePop(layer,point,event,shieldDamage=0){
 const text=event.damage>0?`−${event.damage}`:shieldDamage>0?`SHIELD −${shieldDamage}`:'HIT';
 const pop=div(layer,'v3-damage-pop',text);pop.style.cssText=`left:${point.x}px;top:${point.y}px`;
 return anim(pop,[{opacity:0,transform:'translate(-50%,8px) scale(.55)'},{opacity:1,offset:.18,transform:'translate(-50%,-8px) scale(1.25)'},{opacity:1,offset:.58,transform:'translate(-50%,-28px) scale(1)'},{opacity:0,transform:'translate(-50%,-72px) scale(.92)'}],{duration:900}).then(()=>pop.remove());
}
function callout(layer,text,cls=''){
 const c=div(layer,'v3-callout '+cls,text);return anim(c,[{opacity:0,transform:'translate(-50%,-50%) scale(.65)'},{opacity:1,offset:.2,transform:'translate(-50%,-50%) scale(1.08)'},{opacity:1,offset:.68,transform:'translate(-50%,-50%) scale(1)'},{opacity:0,transform:'translate(-50%,-65%) scale(.96)'}],{duration:850}).then(()=>c.remove());
}

export function playMultiplayerBattleFX(root,before,after,event,{onEnd=()=>{}}={}){
 let cancelled=false,done=false,layer=null;const finish=()=>{if(done)return;done=true;layer?.remove();root.classList.remove('v3-cinematic-running');onEnd();};
 const {arena,actor,target}=actorTarget(root,event);if(!arena||!target){queueMicrotask(finish);return {cancel:finish};}
 layer=document.createElement('div');layer.className='v3-cinematic-layer';arena.append(layer);root.classList.add('v3-cinematic-running');
 const reduced=reducedMotion(),type=eventType(event),card=byId(event.own),special=['special','team','duo'].includes(event.move),team=['team','duo'].includes(event.move),effective=isEffective(event),a=center(actor||arena,arena),b=center(target,arena),shieldBefore=stateShield(before),shieldAfter=stateShield(after),shieldDamage=Math.max(0,shieldBefore-shieldAfter),shieldBreak=shieldBefore>0&&shieldAfter===0;
 layer.dataset.type=type;layer.style.setProperty('--fx',TYPES[type]?.colour||'#fff0a0');
 const title=banner(layer,event,card,type);
 const tasks=[];
 const run=async()=>{
  try{
   sound(team?'team':special?'special':'charge');
   await anim(title,[{opacity:0,transform:'translateY(-24px) scale(.96)'},{opacity:1,offset:.2,transform:'translateY(0) scale(1)'},{opacity:1,offset:.75},{opacity:0,transform:'translateY(-8px)'}],{duration:reduced?260:special?760:520});
   title.remove();if(cancelled)return;
   if(special&&!reduced){const cut=specialCutin(layer,card,type,moveTitle(event,card),team);await anim(cut,[{opacity:0,transform:'translateX(-110%) skewX(-7deg)'},{opacity:1,offset:.15,transform:'translateX(0) skewX(-7deg)'},{opacity:1,offset:.72},{opacity:0,transform:'translateX(110%) skewX(-7deg)'}],{duration:team?900:780,easing:'cubic-bezier(.22,.7,.16,1)'});cut.remove();}
   if(cancelled)return;
   const allies=team?[...arena.querySelectorAll('.human-unit:not(.is-down)')]:[];
   if(team){for(const u of allies)u.classList.add('v3-team-charged');await sleep(reduced?40:180);}
   const actorStage=actor?.querySelector('.unit-stage')||actor;
   const targetStage=target.querySelector('.unit-stage')||target;
   const dx=(b.x-a.x)*.17,dy=(b.y-a.y)*.17;
   if(actorStage)tasks.push(anim(actorStage,reduced?[{filter:'brightness(1)'},{filter:'brightness(1.2)'}]:[{transform:'translate(0,0) scale(1)'},{transform:`translate(${dx*.35}px,${dy*.35}px) scale(1.06)`,offset:.45},{transform:`translate(${dx}px,${dy}px) scale(${special?1.16:1.1})`}],{duration:special?360:260}));
   if(team&&!reduced){for(const [i,u] of allies.entries()){const stage=u.querySelector('.unit-stage')||u;tasks.push(anim(stage,[{filter:'brightness(1)'},{filter:'brightness(1.6) drop-shadow(0 0 12px var(--unit-color))',offset:.6},{filter:'brightness(1.2)'}],{duration:420,delay:i*60}));}}
   await Promise.all(tasks.splice(0));if(cancelled)return;
   sound('hit');
   const camera=anim(arena,reduced?[{filter:'brightness(1)'},{filter:'brightness(1.06)'}]:[{transform:'translate(0,0) scale(1)'},{transform:`translate(${special?-4:-2}px,${special?3:2}px) scale(${special?1.025:1.012})`,offset:.35},{transform:'translate(3px,-2px) scale(1.008)',offset:.62},{transform:'translate(0,0) scale(1)'}],{duration:special?520:360});
   const hit=anim(targetStage,reduced?[{filter:'brightness(1)'},{filter:'brightness(1.5)'},{filter:'brightness(1)'}]:[{transform:'translate(0,0)',filter:'brightness(1)'},{transform:'translate(-8px,2px)',filter:'brightness(2)',offset:.22},{transform:'translate(8px,-2px)',filter:'brightness(.7)',offset:.42},{transform:'translate(-4px,1px)',offset:.62},{transform:'translate(0,0)',filter:'brightness(1)'}],{duration:special?560:420});
   await Promise.all([travelLine(layer,a,b,type,special),particles(layer,a,b,type,special),impact(layer,b,type,special),damagePop(layer,b,event,shieldDamage),hpTween(target,event,reduced),shieldTween(target,before,after,reduced),camera,hit]);
   if(effective&&!cancelled)await callout(layer,'SUPER EFFECTIVE!','is-effective');
   if(shieldBreak&&!cancelled){sound('break');await callout(layer,'SHIELD BREAK!','is-break');}
   if(event.after===0&&!cancelled)await callout(layer,'K.O.!','is-ko');
   if(team&&!cancelled)await callout(layer,event.move==='duo'?'TAG FINISH!':'TEAM ATTACK!','is-team');
   if(actorStage&&!cancelled)await anim(actorStage,[{transform:`translate(${dx}px,${dy}px) scale(${special?1.16:1.1})`},{transform:'translate(0,0) scale(1)'}],{duration:260});
  }finally{
   for(const u of arena.querySelectorAll('.v3-team-charged'))u.classList.remove('v3-team-charged');
   finish();
  }
 };
 const maxMs=reduced?1600:special?5200:3600,safety=setTimeout(finish,maxMs);
 run().catch(()=>{}).finally(()=>clearTimeout(safety));
 return {cancel(){cancelled=true;clearTimeout(safety);finish();}};
}
