import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const baseUrl=process.env.BASE_URL||'http://127.0.0.1:4190';
const mode=process.argv[2]||'duel';
const browser=await chromium.launch();
const pages=[];
let stage='open';

async function openTrainer(name){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',error=>console.log(name,'PAGEERROR',error.message));
  await page.goto(`${baseUrl}/?test=1`,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:new RegExp(name)}).first().click();
  await page.getByRole('link',{name:/Together/}).click();
  await page.waitForSelector('[data-mp="create"]');
  pages.push({context,page,name});
  return page;
}

async function waitFor(page,predicate,label,timeout=30000){
  try{await page.waitForFunction(predicate,null,{timeout});}
  catch(error){
    console.log('STOPPED',label,{stage,text:(await page.locator('#together').innerText()).slice(-700),debug:await page.evaluate(()=>window.__pocketTogetherDebug?.())});
    throw error;
  }
}

async function lobbyState(page){
  return page.evaluate(()=>{
    const debug=window.__pocketTogetherDebug?.();
    const entries=Object.values(debug?.lobby||{});
    return {members:debug?.members||[],connected:debug?.connected||[],players:entries.map(entry=>({id:entry.player.id,side:entry.player.side,ready:entry.ready,team:entry.player.team}))};
  });
}

async function battleState(page){
  return page.evaluate(()=>({
    arena:!!document.querySelector('.mp-arena'),
    busy:document.body.innerText.includes('공격 연출 중'),
    turn:document.querySelector('.turn-banner')?.innerText||'',
    units:[...document.querySelectorAll('.mp-unit')].map(unit=>({player:unit.dataset.playerId||'',card:unit.dataset.cardId||'',foe:unit.dataset.foeId||'',hp:unit.querySelector('.unit-hp small')?.innerText||''}))
  }));
}

async function clickIfEnabled(page,selector){
  return page.evaluate(selector=>{const element=document.querySelector(selector);if(!element||element.disabled)return false;element.click();return true;},selector);
}

async function run(){
  const count=mode==='duo'?4:2;
  const host=await openTrainer('Tony');
  if(['raid','dungeon','tag'].includes(mode))await host.getByRole('button',{name:new RegExp({raid:'Boss Raid',dungeon:'Dungeon',tag:'Tag vs 2 AI'}[mode])}).click();
  const guests=[];
  for(let i=0;i<count-1;i++)guests.push(await openTrainer(i%2?'Tony':'Kai'));

  stage='create';
  await host.locator('[data-mp="create"]').click();
  const roomCode=(await host.locator('.room-code').innerText()).trim();
  assert.match(roomCode,/^[A-Z2-9]{6}$/);
  stage='join';
  for(const guest of guests){
    await guest.locator('#mp-code').fill(roomCode);
    await guest.locator('[data-mp="join"]').click();
  }
  stage='relay';
  await host.waitForFunction(expected=>{const debug=window.__pocketTogetherDebug?.();return debug?.members?.length===expected&&debug.members.every(member=>member.accepted&&member.connected)&&debug.connected.length===expected-1},count,{timeout:30000});
  console.log(mode,'RELAY PASS',roomCode);

  stage='teams';
  if(mode==='duel'){
    await guests[0].getByRole('button',{name:'Orange'}).click();
    await waitFor(host,()=>Object.values(window.__pocketTogetherDebug?.().lobby||{}).filter(entry=>entry.player.side===1).length===1,'orange side');
  }else if(mode==='duo'){
    await guests[0].getByRole('button',{name:'Orange'}).click();
    await guests[2].getByRole('button',{name:'Orange'}).click();
    await waitFor(host,()=>{const entries=Object.values(window.__pocketTogetherDebug?.().lobby||{});return entries.filter(entry=>entry.player.side===0).length===2&&entries.filter(entry=>entry.player.side===1).length===2},'2v2 sides');
  }
  stage='ready';
  for(const item of [host,...guests])await item.locator('[data-mp="ready"]').click();
  await host.waitForFunction(expected=>{const entries=Object.values(window.__pocketTogetherDebug?.().lobby||{});return entries.length===expected&&entries.every(entry=>entry.ready===true)},count,{timeout:30000});
  stage='start';
  await waitFor(host,()=>{const button=document.querySelector('[data-mp="start"]');return !!button&&!button.disabled},'start enabled');
  const lobby=await lobbyState(host);console.log(mode,'READY PASS',lobby.players.map(player=>({side:player.side,ready:player.ready,team:player.team})));
  await host.locator('[data-mp="start"]').click();
  stage='arena';
  await Promise.all([host,...guests].map(page=>page.waitForSelector('.mp-arena',{timeout:30000})));
  const initial=await Promise.all([host,...guests].map(battleState));
  console.log(mode,'ARENA',initial);
  stage='action';
  let changed=false;
  for(let round=0;round<80&&!changed;round++){
    for(const page of [host,...guests])await clickIfEnabled(page,'[data-mp="answer:0"]');
    await host.waitForTimeout(120);
    for(const page of [host,...guests]){
      await clickIfEnabled(page,'[data-mp="move:team"]');
      await clickIfEnabled(page,'[data-mp="move:duo"]');
      await clickIfEnabled(page,'[data-mp="attack:basic"]');
      await clickIfEnabled(page,'[data-mp^="attack:basic:"]');
      await clickIfEnabled(page,'[data-mp="move:guard"]');
    }
    await host.waitForTimeout(350);
    const states=await Promise.all([host,...guests].map(battleState));
    changed=states.some(state=>state.turn!==initial[0].turn||state.units.some((unit,index)=>unit.hp!==initial[0].units[index]?.hp));
    if(changed){
      assert(states.every(state=>state.arena),'all browsers retain arena');
      assert(states.every(state=>state.units.length>=2),'all browsers show combat units');
      console.log(mode,'ACTION SYNC',states);
    }
  }
  assert(changed,'no synchronized action progress');
  let final=[];
  for(let attempt=0;attempt<40;attempt++){
    final=await Promise.all([host,...guests].map(battleState));
    if(final.every(state=>!state.busy))break;
    await host.waitForTimeout(250);
  }
  console.log(mode,'BUSY FINAL',final.map(state=>state.busy));
  assert(final.every(state=>!state.busy),'attack presentation is not stuck');
  console.log(mode,'PASS',{roomCode,final});
}

try{await run();}
catch(error){console.error(mode,'FAIL',stage,error.message);process.exitCode=1;}
finally{await Promise.all(pages.map(({context})=>context.close()));await browser.close();}