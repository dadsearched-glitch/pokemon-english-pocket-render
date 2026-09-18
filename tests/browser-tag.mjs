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
  await page.getByRole('button',{name:/Tag vs 2 AI/}).click();
  return {context,page};
}
const play=async page=>{
  for(let i=0;i<500;i++){
    const state=await page.evaluate(()=>{
      const t=document.body.innerText;
      if(/Tag 승리|좋은 대결이었어요|연결이 복구/.test(t))return 'done';
      const click=sel=>{const el=document.querySelector(sel);if(el&&!el.disabled){el.click();return true;}return false;};
      if(click('[data-mp="answer:0"]'))return 'answer';
      if(click('[data-mp="move:duo"]'))return 'duo';
      const basic=[...document.querySelectorAll('[data-mp^="attack:basic"]')].find(b=>!b.disabled);
      if(basic){basic.click();return 'attack';}
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
  await host.page.getByRole('button',{name:/Start tag/}).click();
  await host.page.waitForSelector('.mp-arena',{timeout:15000});
  await host.page.screenshot({path:'screenshots/tag-start.png'});
  const [h,g]=await Promise.all([play(host.page),play(guest.page)]);
  if(!h||!g){
    console.log('HOST', (await host.page.innerText('#together')).slice(0,800));
    console.log('GUEST', (await guest.page.innerText('#together')).slice(0,800));
  }
  assert(h&&g,'tag did not finish');
  const text=await host.page.innerText('#together');
  assert.match(text,/Tag 승리|좋은 대결이었어요/);
  console.log('BROWSER_TAG_OK',text.slice(0,260).replace(/\s+/g,' '));
  await host.page.screenshot({path:'screenshots/tag-end.png'});
}finally{await browser.close();}
