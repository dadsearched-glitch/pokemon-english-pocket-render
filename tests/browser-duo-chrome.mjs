import pw from '/home/workdir/tools/node_modules/playwright-core/index.js';
import assert from 'node:assert/strict';
const {chromium}=pw;

const url=process.env.BASE_URL||'http://127.0.0.1:4190';
const browser=await chromium.launch({
  executablePath:'/usr/bin/google-chrome',
  headless:true,
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--enable-features=WebRTC-HideLocalIpsWithMdns=false']
});

async function openTrainer(name){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>console.log(name,'pageerror',e.message));
  await page.goto(url+'/?test=1',{waitUntil:'domcontentloaded',timeout:30000});
  await page.getByRole('button',{name:new RegExp(name)}).first().click();
  await page.getByRole('link',{name:/Together/}).click();
  await page.waitForSelector('[data-mp="create"]',{timeout:20000});
  return {context,page,name};
}
const textOf=page=>page.locator('#together').innerText();
const play=async page=>{
  for(let i=0;i<900;i++){
    const state=await page.evaluate(()=>{
      const t=document.body.innerText;
      if(/우리 팀 승리|좋은 대결이었어요|함께 끝까지|연결이 복구되지/.test(t))return 'done';
      const click=sel=>{const el=document.querySelector(sel);if(el&&!el.disabled){el.click();return true;}return false;};
      if(click('[data-mp="answer:0"]'))return 'answer';
      const basic=[...document.querySelectorAll('[data-mp^="attack:basic"]')].find(b=>!b.disabled);
      if(basic){basic.click();return 'attack';}
      if(click('[data-mp="move:guard"]'))return 'guard';
      return 'wait';
    });
    if(state==='done')return true;
    await page.waitForTimeout(state==='wait'?220:60);
  }
  return false;
};

try{
  const host=await openTrainer('Tony');
  const guests=[await openTrainer('Kai'),await openTrainer('Tony'),await openTrainer('Kai')];
  await host.page.getByRole('button',{name:/Create room/}).click();
  const code=(await host.page.locator('.room-code').innerText()).trim();
  assert.match(code,/^[A-Z2-9]{6}$/);
  for(const g of guests){
    await g.page.locator('#mp-code').fill(code);
    await g.page.getByRole('button',{name:/Join room/}).click();
  }
  for(let i=0;i<3;i++){
    await host.page.getByRole('button',{name:/참가 요청/}).first().click({timeout:20000});
  }
  await host.page.waitForFunction(()=>/연결 3/.test(document.body.innerText),null,{timeout:50000});
  await guests[0].page.getByRole('button',{name:'Orange'}).click();
  await guests[2].page.getByRole('button',{name:'Orange'}).click();
  for(const who of [host,...guests])await who.page.getByRole('button',{name:/Ready/}).click();
  await host.page.waitForFunction(()=>(document.body.innerText.match(/Ready ✓/g)||[]).length>=4,null,{timeout:25000});
  const lobby=await textOf(host.page);
  assert.match(lobby,/Blue 2/);
  assert.match(lobby,/Orange 2/);
  await host.page.getByRole('button',{name:/Start battle/}).click();
  await host.page.waitForSelector('.mp-arena',{timeout:25000});
  assert.match(await textOf(host.page),/2 vs 2/);
  const finished=await Promise.all([play(host.page),...guests.map(g=>play(g.page))]);
  if(finished.some(ok=>!ok)){
    for(const who of [host,...guests])console.log(who.name,(await textOf(who.page)).slice(0,400));
  }
  assert(finished.every(Boolean),'4-human 2v2 did not finish');
  const end=await textOf(host.page);
  assert.match(end,/우리 팀 승리|좋은 대결이었어요|함께 끝까지/);
  const medals=await Promise.all([host,...guests].map(async who=>{
    const t=await textOf(who.page);
    const m=(t.match(/(\d+)\s*🏅/)||[])[1];
    const s=(t.match(/Pack Shards\s+(\d+)/)||t.match(/(\d+)\s*\/\s*5\s*🧩/)||[])[1];
    return {name:who.name,medals:Number(m||0),shards:Number(s||0),ack:/보상 저장 확인/.test(t)?t.match(/보상 저장 확인\s+(\d+\/\d+)/)?.[1]:null};
  }));
  for(const row of medals)assert.equal(row.shards,0,'PvP shards must stay 0');
  console.log('BROWSER_4P_2V2_OK',{code,end:end.slice(0,180).replace(/\s+/g,' '),medals});
}finally{
  await browser.close();
}
