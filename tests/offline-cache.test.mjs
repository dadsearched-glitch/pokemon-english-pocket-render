import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

test('first offline launch caches the entry page, its local CSS and every imported app module',()=>{
 const root=new URL('../web/',import.meta.url),read=file=>readFileSync(new URL(file,root),'utf8');
 const source=read('sw.js'),match=source.match(/CORE=(\[[^;]+\])/);
 assert.ok(match,'service worker core list exists');
 const cached=new Set(JSON.parse(match[1].replaceAll("'",'"')));
 const html=read('index.html');
 for(const [,file] of html.matchAll(/href="\.(\/[^\"]+\.css)"/g))assert.ok(cached.has('.'+file),`${file} missing from first offline install`);
 const queue=['app.js'],seen=new Set();
 while(queue.length){const file=queue.shift();if(seen.has(file))continue;seen.add(file);assert.ok(cached.has('./'+file),`${file} missing from first offline install`);
  const code=read(file);for(const [,imported] of code.matchAll(/(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]\.\/(.+?\.js)['"]/g))queue.push(join(file,'..',imported).replaceAll('\\','/'));
 }
});
