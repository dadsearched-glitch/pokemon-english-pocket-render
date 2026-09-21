import {byId,TYPES} from './data.js';
export const reducedEffects=setting=>setting==='reduced'||(setting!=='full'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
export function battleSequence(root,before,after,move,{effects,onEnd,sound=()=>{}}){
 const animations=new Set();let cancelled=false,finishCalled=false;
 const finish=()=>{if(finishCalled)return;finishCalled=true;layer.remove();root.classList.remove('cinematic-running');onEnd();};
 const layer=document.createElement('div');layer.className='cinematic-layer';layer.setAttribute('aria-hidden','true');
 const arena=root.querySelector('.arena');if(!arena){queueMicrotask(onEnd);return {cancel(){}};}arena.append(layer);root.classList.add('cinematic-running');
 const reduced=reducedEffects(effects),duration=n=>reduced?Math.min(n,130):n;
 layer.dataset.motion=reduced?'reduced':'full';
 const animate=async(el,frames,ms,extra={})=>{if(!el||cancelled)return;const a=el.animate(frames,{duration:reduced&&el.classList.contains('special-cutin')?1600:duration(ms),easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards',...extra});animations.add(a);try{await a.finished;}catch{}animations.delete(a);};
 const node=(cls,text='')=>{const el=document.createElement('div');el.className=cls;if(text)el.textContent=text;layer.append(el);return el;};
 const actor=byId(before.team[before.active].id),foe=byId(before.enemies[before.enemy].id),type=actor.type;
 layer.style.setProperty('--cine-colour',TYPES[type].colour);layer.dataset.type=type;
 const own=root.querySelector('.player-mon'),enemy=root.querySelector('.enemy-mon');
 const hp=async(zone,value,max,damage)=>{const n=root.querySelector('.'+zone+' .hp-label span'),bar=root.querySelector('.'+zone+' .hp-track i');if(n)n.textContent=value+'/'+max+' HP';const label=node('damage-number '+zone,'−'+damage);await Promise.all([animate(bar,[{width:bar?.style.width},{width:100*value/max+'%'}],650),animate(label,[{opacity:0,transform:'translateY(15px) scale(.7)'},{opacity:1,offset:.2,transform:'translateY(0) scale(1.25)'},{opacity:0,transform:'translateY(-52px) scale(1)'}],900)]);label.remove();};
 const genericBurst=async()=>{const glyph={electric:'ϟ',fire:'◆',water:'●',grass:'❧',psychic:'✧',dark:'☾',fighting:'✦',normal:'★',metal:'⬡',dragon:'◇'}[type]||'✦';const tasks=[],count=reduced?3:16;for(let i=0;i<count;i++){const p=node('type-particle',glyph),angle=i/count*Math.PI*2,reach=72+(i%4)*23;p.style.color=TYPES[type].colour;tasks.push(animate(p,[{opacity:0,transform:'translate(0,0) scale(.2)'},{opacity:1,offset:.15},{opacity:0,transform:`translate(${Math.cos(angle)*reach}px,${Math.sin(angle)*reach}px) rotate(${i*35}deg) scale(${i%2?1.2:.55})`}],520+i%3*50).then(()=>p.remove()));}const core=node('v3-solo-impact');tasks.push(animate(core,[{opacity:0,transform:'scale(.2) rotate(-12deg)'},{opacity:1,offset:.25,transform:'scale(1.03) rotate(0deg)'},{opacity:0,transform:'scale(1.5) rotate(15deg)'}],520).then(()=>core.remove()));for(let i=0;i<8;i++){const ray=node('v3-solo-ray');const ang=i*45+(i%2?7:-7),len=55+(i%3)*18;ray.style.width=len+'px';tasks.push(animate(ray,[{opacity:0,transform:`rotate(${ang}deg) scaleX(.15)`},{opacity:1,offset:.2,transform:`rotate(${ang}deg) scaleX(1)`},{opacity:0,transform:`rotate(${ang}deg) translateX(20px) scaleX(.55)`}],420+i*16).then(()=>ray.remove()));}await Promise.all(tasks);};
 const typeAttack=async(special)=>{
  const attackAnimate=(el,frames,ms,extra)=>animate(el,frames,special?ms*1.45:ms,extra);
  if(reduced)return genericBurst();
  const fx=node(`typed-attack type-${type} ${special?'is-special':''}`),tasks=[];
  if(type==='electric'){
   for(let i=0;i<(special?7:4);i++){const bolt=document.createElement('i');bolt.className='bolt';bolt.style.left=`${48+(i%5)*4}%`;bolt.style.top=`${18+(i%3)*5}%`;fx.append(bolt);tasks.push(attackAnimate(bolt,[{opacity:0,transform:'translate(-38% ,45%) scale(.5) rotate(-22deg)'},{opacity:1,offset:.18},{opacity:1,offset:.65},{opacity:0,transform:'translate(40%,-35%) scale(1.25) rotate(8deg)'}],420+i*28));}
   const flash=node('screen-flash electric-flash');tasks.push(attackAnimate(flash,[{opacity:0},{opacity:.8,offset:.35},{opacity:0}],260).then(()=>flash.remove()));
  }else if(type==='fire'){
   for(let i=0;i<(special?18:10);i++){const ember=document.createElement('i');ember.className='ember';ember.style.left=`${45+(i%6)*6}%`;ember.style.top=`${50-(i%4)*5}%`;fx.append(ember);tasks.push(attackAnimate(ember,[{opacity:0,transform:'translate(-80px,65px) scale(.3)'},{opacity:1,offset:.2},{opacity:0,transform:`translate(${40+(i%5)*18}px,${-40-(i%4)*25}px) scale(${.7+(i%3)*.25})`}],520+i*18));}
  }else if(type==='water'){
   const wave=document.createElement('i');wave.className='wave';fx.append(wave);tasks.push(attackAnimate(wave,[{opacity:0,transform:'translate(-45% ,35%) scale(.25) rotate(-18deg)'},{opacity:1,offset:.2},{opacity:0,transform:'translate(28%,-18%) scale(1.35) rotate(-4deg)'}],620));for(let i=0;i<(special?12:7);i++){const drop=document.createElement('i');drop.className='drop';drop.style.left=`${50+(i%5)*7}%`;drop.style.top=`${42-(i%4)*4}%`;fx.append(drop);tasks.push(attackAnimate(drop,[{opacity:0,transform:'translate(-20px,10px) scale(.4)'},{opacity:1,offset:.25},{opacity:0,transform:`translate(${20+i*7}px,${-30-(i%4)*13}px) scale(.8)`}],520+i*22));}
  }else if(type==='grass'){
   for(let v=0;v<(special?3:2);v++){const vine=document.createElement('i');vine.className='vine';vine.style.top=`${48+v*4}%`;fx.append(vine);tasks.push(attackAnimate(vine,[{opacity:0,transform:'translate(-55px,48px) rotate(-30deg) scaleX(.08)'},{opacity:1,offset:.25,transform:`translate(0,0) rotate(${-28+v*4}deg) scaleX(1)`},{opacity:0,transform:`translate(38px,-24px) rotate(${-28+v*4}deg) scaleX(1.08)`}],560+v*70));}
   for(let i=0;i<(special?14:8);i++){const leaf=document.createElement('i');leaf.className='leaf';leaf.style.left=`${45+(i%6)*6}%`;leaf.style.top=`${48-(i%4)*3}%`;fx.append(leaf);tasks.push(attackAnimate(leaf,[{opacity:0,transform:'translate(-70px,55px) rotate(0deg) scale(.5)'},{opacity:1,offset:.2},{opacity:0,transform:`translate(${35+(i%5)*20}px,${-35-(i%4)*18}px) rotate(${210+i*35}deg) scale(1)`}],560+i*18));}
  }else if(type==='psychic'){
   for(let i=0;i<(special?5:3);i++){const ring=document.createElement('i');ring.className='psy-ring';ring.style.setProperty('--i',i);fx.append(ring);tasks.push(attackAnimate(ring,[{opacity:0,transform:'translate(-35%,30%) scale(.2)'},{opacity:.85,offset:.25},{opacity:0,transform:'translate(25%,-22%) scale(1.55) rotate(55deg)'}],600+i*90));}
  }else if(type==='dark'){
   for(let i=0;i<(special?5:3);i++){const slash=document.createElement('i');slash.className='dark-slash';slash.style.setProperty('--i',i);fx.append(slash);tasks.push(attackAnimate(slash,[{opacity:0,transform:'translate(-70px,70px) rotate(-34deg) scaleX(.2)'},{opacity:1,offset:.3},{opacity:0,transform:'translate(80px,-45px) rotate(-34deg) scaleX(1.3)'}],430+i*70));}
   const shade=node('screen-flash dark-flash');tasks.push(attackAnimate(shade,[{opacity:0},{opacity:.55,offset:.35},{opacity:0}],420).then(()=>shade.remove()));
  }else if(type==='metal'){
   for(let i=0;i<(special?10:6);i++){const shard=document.createElement('i');shard.className='metal-shard';shard.style.left=`${48+(i%5)*6}%`;shard.style.top=`${43-(i%4)*4}%`;fx.append(shard);tasks.push(attackAnimate(shard,[{opacity:0,transform:'translate(-80px,50px) rotate(0deg) scale(.4)'},{opacity:1,offset:.25},{opacity:0,transform:`translate(${45+(i%4)*20}px,${-25-(i%5)*18}px) rotate(${160+i*30}deg) scale(1)`}],520+i*20));}
  }else if(type==='dragon'){
   const beam=document.createElement('i');beam.className='dragon-beam';fx.append(beam);tasks.push(attackAnimate(beam,[{opacity:0,transform:'translate(-42%,42%) rotate(-30deg) scaleX(.1)'},{opacity:1,offset:.22},{opacity:1,offset:.68},{opacity:0,transform:'translate(18%,-12%) rotate(-30deg) scaleX(1.35)'}],650));
  }else if(type==='fighting'){
   for(let i=0;i<(special?4:2);i++){const fist=document.createElement('i');fist.className='impact-fist';fist.style.setProperty('--i',i);fx.append(fist);tasks.push(attackAnimate(fist,[{opacity:0,transform:'translate(-85px,65px) scale(.5)'},{opacity:1,offset:.55,transform:'translate(30px,-20px) scale(1.25)'},{opacity:0,transform:'translate(55px,-35px) scale(1.6)'}],420+i*90));}
  }else{
   for(let i=0;i<(special?10:6);i++){const star=document.createElement('i');star.className='normal-star';star.style.left=`${48+(i%5)*7}%`;star.style.top=`${45-(i%4)*5}%`;fx.append(star);tasks.push(attackAnimate(star,[{opacity:0,transform:'translate(-60px,50px) scale(.2)'},{opacity:1,offset:.25},{opacity:0,transform:`translate(${35+(i%4)*24}px,${-25-(i%4)*22}px) rotate(${i*45}deg) scale(1.2)`}],500+i*25));}
  }
  tasks.push(genericBurst());await Promise.all(tasks);fx.remove();
 };
 const cameraHit=async(special)=>{if(reduced)return;const strength=special?1.055:1.025;await animate(arena,[{transform:'scale(1) translate(0,0)'},{transform:`scale(${strength}) translate(-1.2%,1%)`,offset:.48},{transform:'scale(1) translate(0,0)'}],special?620:420);};
 const run=async()=>{
  if(move==='switch'){const banner=node('move-banner','SWITCH · '+byId(after.team[after.active].id).name);await animate(own,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.05)'}],300);if(cancelled)return;const img=own?.querySelector('img');if(img){const c=byId(after.team[after.active].id);img.src=c.art;img.alt=c.name;}await animate(own,[{opacity:0,transform:'scale(.05)'},{opacity:1,transform:'scale(1.12)'},{opacity:1,transform:'scale(1)'}],550);banner.remove();return;}
  if(['basic','special'].includes(move)){
   const special=move==='special',rare=actor.isEx||actor.rarity==='EX'||actor.specialArt;
   if(special){const cut=document.createElement('div');cut.className='special-cutin'+(rare?' ex-cutin':'');const portrait=document.createElement('img');portrait.src=actor.art;portrait.alt='';const label=document.createElement('strong');label.textContent=(rare?'EX · ':'')+actor.name;const skill=document.createElement('small');skill.textContent=actor.power;label.append(skill);cut.append(portrait,label);layer.append(cut);await animate(cut,reduced?[{opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.82},{opacity:0}]:[{opacity:0,transform:'translateX(-115%) skewX(-8deg)'},{opacity:1,transform:'translateX(0) skewX(-8deg)',offset:.16},{opacity:1,transform:'translateX(0) skewX(-8deg)',offset:.78},{opacity:0,transform:'translateX(115%) skewX(-8deg)'}],1150,{easing:'cubic-bezier(.2,.7,.2,1)'});cut.remove();}
   if(cancelled)return;const banner=node('move-banner',special?actor.power:actor.move),lines=node('speed-lines');
   await animate(own,reduced?[{opacity:.7},{opacity:1}]:[{transform:'scale(1)'},{transform:'scale(1.18) translate(-4%,8%)'}],special?850:300);
   await animate(own,reduced?[{opacity:1},{opacity:.8}]:[{transform:'scale(1.18)'},{transform:special?'translate(52%,-68%) scale(1.42)':'translate(45%,-58%) scale(1.34)'}],special?550:260);
   if(cancelled)return;sound('hit');const damage=before.enemies[before.enemy].hp-after.enemies[before.enemy].hp;
   const shake=reduced?Promise.resolve():animate(arena,[{transform:'translateX(0)'},{transform:'translateX(-7px)'},{transform:'translateX(7px)'},{transform:'translateX(-4px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],320);
   await Promise.all([typeAttack(special),cameraHit(special),hp('enemy-zone',after.enemies[before.enemy].hp,before.enemies[before.enemy].max,damage),animate(enemy,[{filter:'brightness(1)'},{filter:'brightness(2.1) saturate(1.4)',offset:.25},{filter:'brightness(.65)',offset:.45},{filter:'brightness(1)'}],520),shake]);
   if(TYPES[foe.type]?.weak===type&&!cancelled){const effective=node('solo-effective','SUPER EFFECTIVE!');await animate(effective,[{opacity:0,transform:'translate(-50%,10px) scale(.7)'},{opacity:1,offset:.2,transform:'translate(-50%,0) scale(1.08)'},{opacity:1,offset:.65},{opacity:0,transform:'translate(-50%,-24px) scale(.95)'}],720);effective.remove();}
   lines.remove();banner.remove();await animate(own,[{transform:special?'translate(52%,-68%) scale(1.42)':'translate(45%,-58%) scale(1.34)'},{transform:'translate(0,0) scale(1)',opacity:1}],300);
  }
  if(cancelled)return;
  const taken=before.team[before.active].hp-after.team[before.active].hp;
  if(taken>0){const banner=node('move-banner enemy-turn',move==='guard'?'SHIELD · Protected!':foe.name+' · Counterattack');await animate(enemy,reduced?[{opacity:.7},{opacity:1}]:[{transform:'translate(0,0)'},{transform:'translate(-30%,35%) scale(1.2)'},{transform:'translate(0,0)'}],550);if(!cancelled){sound('hit');await hp('player-zone',after.team[before.active].hp,actor.hp,taken);}banner.remove();}
  if(after.enemy!==before.enemy&&!cancelled){const banner=node('move-banner','NEXT CHALLENGER');await animate(enemy,[{opacity:1},{opacity:0,transform:'scale(.1)'}],300);banner.remove();}
 };
 run().catch(()=>{}).finally(finish);
 return {cancel(){cancelled=true;for(const a of animations)a.cancel();finish();}};
}
