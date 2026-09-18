import {spawn} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';

const ROOT=process.cwd();
const BASE_URL=process.env.BASE_URL||'http://127.0.0.1:4190';
const browserTests=[
  'tests/browser-lobby.mjs',
  'tests/browser-duel.mjs',
  'tests/browser-raid.mjs',
  'tests/browser-dungeon.mjs',
  'tests/browser-tag.mjs',
  'tests/browser-duo.mjs'
];

function run(cmd,args,opts={}){
  return new Promise((resolve,reject)=>{
    const child=spawn(cmd,args,{cwd:ROOT,stdio:'inherit',shell:process.platform==='win32'&&cmd==='npm',...opts});
    child.on('error',reject);
    child.on('exit',code=>code===0?resolve():reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`)));
  });
}

function waitFor(url,timeout=15000){
  const started=Date.now();
  return new Promise((resolve,reject)=>{
    const probe=()=>{
      const req=http.get(url,res=>{res.resume();resolve();});
      req.on('error',()=>{
        if(Date.now()-started>timeout)reject(new Error(`Server did not start: ${url}`));
        else setTimeout(probe,250);
      });
      req.setTimeout(1000,()=>req.destroy());
    };
    probe();
  });
}

console.log('\n=== 1/3 Unit/integration tests ===');
await run('npm',['test']);

try{ await import('playwright'); }
catch{
  console.error('\nPlaywright is not installed. In the VS Code terminal run:');
  console.error('  npm install --no-save --package-lock=false playwright');
  console.error('  npx playwright install chromium');
  console.error('Then run: npm run verify:all');
  process.exit(2);
}

fs.mkdirSync('screenshots',{recursive:true});
console.log('\n=== 2/3 Start multiplayer signaling/dev server ===');
const server=spawn(process.execPath,['network/dev-server.mjs'],{
  cwd:ROOT,
  stdio:'inherit',
  env:{...process.env,PORT:'4190'}
});

let failed=false;
try{
  await waitFor(BASE_URL);
  console.log('\n=== 3/3 Browser multiplayer tests ===');
  for(const test of browserTests){
    console.log(`\n--- ${test} ---`);
    await run(process.execPath,[test],{env:{...process.env,BASE_URL}});
  }
  console.log('\nALL AUTOMATED VERIFICATION PASSED');
}catch(err){
  failed=true;
  console.error('\nAUTOMATED VERIFICATION FAILED:',err.message);
}finally{
  server.kill('SIGTERM');
}
process.exit(failed?1:0);
