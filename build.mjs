import fs from 'node:fs';
import path from 'node:path';
// The editable source lives in web/. Publish an ordinary public static game.
const output=path.resolve('dist');if(path.dirname(output)!==process.cwd())throw Error('Unexpected build root');
fs.rmSync(output,{recursive:true,force:true});fs.cpSync('web',output,{recursive:true});
console.log('Built public Pocket English game.');
