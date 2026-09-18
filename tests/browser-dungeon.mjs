import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const url=process.env.BASE_URL||'http://127.0.0.1:4190';
const browser=await chromium.launch();
async function open(name){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>console.log(name,'pageerror',e.message));
  await page.goto(url+'/?test=1',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:new RegExp(name)}).first().click();
  await page.getByRole('link',{name:/Together/}).click();
  await page.waitForSelector('[data-mp="create"]');
  await page.getByRole('button',{name:/Dungeon/}).click();
  return {context,page};
}
const play=async page=>{
  for(let i=0;i<500;i++){
    const state=await page.evaluate(()=>{
      const t=document.body.innerText;
      if(/던전 클리어|여기서 멈췄|연결이 복구/.test(t))return 'done';
      const click=sel=>{const el=document.querySelector(sel);if(el&&!el.disabled){el.click();return true;}return false;};
      const first=prefix=>{const el=[...document.querySelectorAll(`[data-mp^="${prefix}"]`)].find(b=>!b.disabled);if(el){el.click();return true;}return false;};
      if(click('[data-mp="answer:0"]'))return 'answer';
      if(first('vote:'))return 'vote';
      if(click('[data-mp="move:team"]'))return 'team';
      if(click('[data-mp="attack:basic"]'))return 'attack';
      if(click('[data-mp="move:guard"]'))return 'guard';
      return 'wait';
    });
    if(state==='done')return true;
    await page.waitForTimeout(state==='wait'?250:80);
  }
  return false;
};
try{
  const host=await open('Tony'),guest=await open('Kai');
  await host.page.getByRole('button',{name:/Create room/}).click();
  const code=(await host.page.locator('.room-code').innerText()).trim();
  await guest.page.locator('#mp-code').fill(code);
  await guest.page.getByRole('button',{name:/Join room/}).click();
  await host.page.getByRole('button',{name:/참가 요청/}).click({timeout:15000});
  await host.page.waitForFunction(()=>document.body.innerText.includes('연결 1'),{timeout:20000});
  await guest.page.waitForFunction(()=>document.body.innerText.includes('연결 1'),{timeout:20000});
  await host.page.getByRole('button',{name:/Ready/}).click();
  await guest.page.getByRole('button',{name:/Ready/}).click();
  await host.page.waitForFunction(()=>(document.body.innerText.match(/Ready ✓/g)||[]).length>=2,{timeout:15000});
  await host.page.getByRole('button',{name:/Start dungeon/}).click();
  await host.page.waitForSelector('.mp-arena',{timeout:15000});
  await host.page.screenshot({path:'screenshots/dungeon-start.png'});
  const [h,g]=await Promise.all([play(host.page),play(guest.page)]);
  if(!h||!g){
    console.log('HOST', (await host.page.innerText('#together')).slice(0,800));
    console.log('GUEST', (await guest.page.innerText('#together')).slice(0,800));
  }
  assert(h&&g,'dungeon did not finish');
  const text=await host.page.innerText('#together');
  assert.match(text,/던전 클리어|여기서 멈췄/);
  console.log('BROWSER_DUNGEON_OK',text.slice(0,260).replace(/\s+/g,' '));
  await host.page.screenshot({path:'screenshots/dungeon-end.png'});
}finally{await browser.close();}
