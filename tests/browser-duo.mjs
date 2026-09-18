import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const url=process.env.BASE_URL||'http://127.0.0.1:4190';
const browser=await chromium.launch({args:['--enable-features=WebRTC-HideLocalIpsWithMdns=false']});

async function openTrainer(name){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>console.log(name,'pageerror',e.message));
  await page.goto(url+'/?test=1',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:new RegExp(name)}).first().click();
  await page.getByRole('link',{name:/Together/}).click();
  await page.waitForSelector('[data-mp="create"]');
  return {context,page,name};
}

const play=async page=>{
  for(let i=0;i<700;i++){
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
    await page.waitForTimeout(state==='wait'?250:70);
  }
  return false;
};

try{
  const host=await openTrainer('Tony');
  const g1=await openTrainer('Kai');
  const g2=await openTrainer('Tony');
  const g3=await openTrainer('Kai');
  await host.page.getByRole('button',{name:/Create room/}).click();
  const code=(await host.page.locator('.room-code').innerText()).trim();
  assert.match(code,/^[A-Z2-9]{6}$/);
  for(const g of [g1,g2,g3]){
    await g.page.locator('#mp-code').fill(code);
    await g.page.getByRole('button',{name:/Join room/}).click();
  }
  for(let i=0;i<3;i++)await host.page.getByRole('button',{name:/참가 요청/}).first().click({timeout:20000});
  await host.page.waitForFunction(()=>document.body.innerText.includes('연결 3'),{timeout:40000});
  await g1.page.getByRole('button',{name:'Orange'}).click();
  await g3.page.getByRole('button',{name:'Orange'}).click();
  for(const who of [host,g1,g2,g3])await who.page.getByRole('button',{name:/Ready/}).click();
  await host.page.waitForFunction(()=>(document.body.innerText.match(/Ready ✓/g)||[]).length>=4,{timeout:20000});
  await host.page.getByRole('button',{name:/Start battle/}).click();
  await host.page.waitForSelector('.mp-arena',{timeout:20000});
  await host.page.waitForFunction(()=>document.body.innerText.includes('2 vs 2'),{timeout:10000});
  const started=await Promise.all([play(host.page),play(g1.page),play(g2.page),play(g3.page)]);
  assert(started.every(Boolean),'4-human 2v2 did not finish');
  const text=await host.page.innerText('#together');
  assert.match(text,/우리 팀 승리|좋은 대결이었어요|함께 끝까지/);
  console.log('BROWSER_4P_2V2_OK',{code,snippet:text.slice(0,240).replace(/\s+/g,' ')});
}finally{
  await browser.close();
}
