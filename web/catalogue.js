import {A1_CATALOGUE} from './a1-catalogue.js';

const typeMap={Lightning:'electric',Fire:'fire',Water:'water',Grass:'grass',Psychic:'psychic',Colorless:'normal',Fighting:'fighting',Darkness:'dark',Metal:'metal',Dragon:'dragon'};
// Adventure moves reuse the game's recorded voices and short-match balance.
// The printed TCG card has its own rules; these are separate English-game moves.
const moves={electric:['Quick Spark','Thunder Dash'],fire:['Ember','Flame Spiral'],water:['Bubble','Wave Crash'],grass:['Vine Tap','Leaf Storm'],psychic:['Mind Pulse','Psychic Nova'],normal:['Quick Step','Star Rush'],fighting:['Aura Tap','Aura Sphere'],dark:['Shadow Tap','Night Burst'],metal:['Body Bump','Dream Smash'],dragon:['Wing Rush','Dragon Comet']};
export const SET_CARDS=A1_CATALOGUE.map(raw=>{
 // TCGdex currently leaves these two printed two-star cards as "None".
 // Cross-check: https://pocket.limitlesstcg.com/cards/A1/265 (versions list includes 279).
 if(['A1-265','A1-279'].includes(raw.id))raw={...raw,rarity:'Two Star'};
 const type=typeMap[raw.types?.[0]]||'normal',battleEligible=raw.category==='Pokemon';
 const specialArt=/star|crown/i.test(raw.rarity),isEx=/\bex\b/i.test(raw.name);
 const finish=/crown/i.test(raw.rarity)?'crown':/Three Star/i.test(raw.rarity)?'immersive':/Two Star/i.test(raw.rarity)?'rainbow':/One Star/i.test(raw.rarity)?'illustration':(isEx||raw.rarity==='Three Diamond')?'holo':'normal';
 return {id:raw.id,name:raw.name,type,hp:battleEligible?Math.max(80,Math.min(160,raw.hp||100)):0,rarity:isEx?'EX':(specialArt||raw.rarity==='Three Diamond')?'rare':'common',rarityLabel:raw.rarity,finish,specialArt,battleEligible,isEx,set:'A1',cardImage:raw.image+'/high.webp',thumbnail:raw.image+'/low.webp',art:raw.dexId?.[0]?`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${raw.dexId[0]}.png`:raw.image+'/low.webp',move:moves[type][0],power:moves[type][1]};
});
export const isSpecial=c=>c.specialArt||c.rarity==='EX';
export const finishLabel=c=>({crown:'♛ CROWN',immersive:'★★★ IMMERSIVE ART',rainbow:'★★ SPECIAL ART',illustration:'★ ILLUSTRATION',holo:'✧ HOLO'}[c.finish]||(c.rarity==='EX'?'✦ EX':c.rarity==='rare'?'★ RARE':'◆ BASIC'));
