import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const url=process.env.BASE_URL||'http://127.0.0.1:4190';
const browser=await chromium.launch();
async function open(name,width=390){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(url+'/?test=1',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:new RegExp(name)}).first().click();
  await page.getByRole('link',{name:/Together/}).click();
  await page.waitForSelector('[data-mp="create"]');
  return {context,page};
}
try{
  const a=await open('Tony',390);
  await a.page.screenshot({path:'screenshots/together-mobile.png',fullPage:true});
  await a.page.getByRole('button',{name:/Boss Raid/}).click();
  await a.page.waitForSelector('text=Electric');
  await a.page.screenshot({path:'screenshots/together-raid-mobile.png',fullPage:true});
  const b=await open('Kai',1280);
  await b.page.setViewportSize({width:1280,height:800});
  await b.page.screenshot({path:'screenshots/together-desktop.png',fullPage:true});
  await b.page.locator('#mp-code').fill('!!!!!!');
  await b.page.getByRole('button',{name:/Join room/}).click();
  assert.match(await b.page.innerText('#together'),/방 코드 6자리/);
  await b.page.locator('#mp-code').fill('ZZZZZZ');
  await b.page.getByRole('button',{name:/Join room/}).click();
  await b.page.waitForFunction(()=>document.body.innerText.includes('찾을 수 없')||document.body.innerText.includes('expired')||document.body.innerText.includes('방'),{timeout:10000});
  assert.match(await b.page.innerText('#together'),/Create room|방 만들기/);
  await a.page.getByRole('button',{name:/Trainer Duel/}).click();
  await a.page.getByRole('button',{name:/Create room/}).click();
  await a.page.waitForSelector('.room-code');
  await a.page.getByRole('button',{name:/Ready/}).click();
  await a.page.waitForFunction(() => /준비 취소|Cancel ready/.test(document.body.innerText));
  await a.page.locator('.mp-cards button[aria-pressed="true"]').first().click();
  await a.page.waitForSelector('text=Ready · 준비 완료');
  await a.page.getByRole('button',{name:/방 나가기/}).click();
  await a.page.waitForSelector('[data-mp="create"]');
  const home=await (await browser.newContext({viewport:{width:390,height:844}})).newPage();
  await home.goto(url+'/?test=1',{waitUntil:'networkidle'});
  await home.getByRole('button',{name:/Tony/}).first().click();
  await home.screenshot({path:'screenshots/home-mobile.png',fullPage:true});
  await home.setViewportSize({width:1280,height:800});
  await home.screenshot({path:'screenshots/home-desktop.png',fullPage:true});
  const overflow=await a.page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2);
  assert.equal(overflow,false);
  console.log('BROWSER_LOBBY_OK');
}finally{await browser.close();}
