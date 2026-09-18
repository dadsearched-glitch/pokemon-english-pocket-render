import {CARDS} from './web/data.js';
import {COURSES} from './web/course.js';
import fs from 'node:fs';
const texts=[...new Set(['Kia ora, trainer! Let us go on an adventure.',...Object.values(COURSES).flat().flatMap(u=>[...u.words.map(w=>w[0]),...u.s,u.story]),...CARDS.flatMap(c=>[c.move,c.power])])];
fs.writeFileSync('audio-texts.json',JSON.stringify(texts,null,2));
