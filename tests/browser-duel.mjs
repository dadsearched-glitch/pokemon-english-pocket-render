import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const url = process.env.BASE_URL || 'http://127.0.0.1:4190';
const browser = await chromium.launch({args:['--enable-features=WebRTC-HideLocalIpsWithMdns=false']});

async function openTrainer(name){
  const context = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page = await context.newPage();
  page.on('pageerror', e => console.log(name,'pageerror',e.message));
  page.on('console', m => {if(m.type()==='error')console.log(name,'console',m.text());});
  await page.goto(url+'/?test=1',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:new RegExp(name)}).first().click();
  await page.getByRole('link',{name:/Together/}).click();
  await page.waitForSelector('#together');
  await page.waitForSelector('[data-mp="create"]');
  return {context,page,name};
}

function dump(label,page){return page.locator('#together').innerText().then(t=>console.log('\n==== '+label+' ====\n'+t.slice(0,1200)));}

try{
  const host = await openTrainer('Tony');
  const guest = await openTrainer('Kai');
  await host.page.getByRole('button',{name:/Create room/}).click();
  await host.page.waitForSelector('.room-code');
  const code = (await host.page.locator('.room-code').innerText()).trim();
  assert.match(code,/^[A-Z2-9]{6}$/);
  await guest.page.locator('#mp-code').fill(code);
  await guest.page.getByRole('button',{name:/Join room/}).click();
  await host.page.getByRole('button',{name:/참가 요청/}).click({timeout:15000});
  await guest.page.waitForFunction(()=>document.body.innerText.includes('연결 1')||document.body.innerText.includes('Ready'),null,{timeout:20000});
  await host.page.waitForFunction(()=>document.body.innerText.includes('연결 1'),null,{timeout:20000});
  await guest.page.getByRole('button',{name:'Orange'}).click();
  await host.page.getByRole('button',{name:/Ready/}).click();
  await guest.page.getByRole('button',{name:/Ready/}).click();
  await host.page.waitForFunction(()=>(document.body.innerText.match(/Ready ✓/g)||[]).length>=2,{timeout:15000});
  await host.page.getByRole('button',{name:/Start battle/}).click();
  try{
    await host.page.waitForSelector('.mp-arena',{timeout:12000});
  }catch(e){
    await dump('HOST after start',host.page);
    await dump('GUEST after start',guest.page);
    await host.page.screenshot({path:'screenshots/duel-host-fail.png'});
    await guest.page.screenshot({path:'screenshots/duel-guest-fail.png'});
    throw e;
  }
  await guest.page.waitForSelector('.mp-arena',{timeout:20000});

  const play = async page => {
    for(let i=0;i<400;i++){
      const state = await page.evaluate(()=>{
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
      await page.waitForTimeout(state==='wait'?250:80);
    }
    return false;
  };
  const [hostDone, guestDone] = await Promise.all([play(host.page), play(guest.page)]);
  if(!hostDone||!guestDone){
    await dump('HOST end',host.page);await dump('GUEST end',guest.page);
  }
  assert(hostDone && guestDone, '1v1 did not finish');
  await host.page.waitForTimeout(800);
  const hostText = await host.page.locator('#together').innerText();
  const guestText = await guest.page.locator('#together').innerText();
  assert.match(hostText,/Adventure Medals/);
  assert.match(guestText,/Adventure Medals/);
  console.log('BROWSER_1V1_OK', {code, hostSnippet:hostText.slice(0,220).replace(/\s+/g,' '), guestSnippet:guestText.slice(0,220).replace(/\s+/g,' ')});
  await host.page.screenshot({path:'screenshots/duel-host-end.png'});
  await guest.page.screenshot({path:'screenshots/duel-guest-end.png'});
  await host.context.close();
  await guest.context.close();
}finally{
  await browser.close();
}
