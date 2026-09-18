import {CARDS} from './data.js';
import {SAVE_KEY,freshSave,createProfile} from './model.js';
export const storageKey=test=>test?SAVE_KEY+'-sandbox':SAVE_KEY;
export function makeSandboxSave(){const s=freshSave();s.sandbox=true;createProfile(s,'Tony',4);createProfile(s,'Kai',3);s.active=null;for(const p of Object.values(s.profiles)){p.cards=CARDS.map(c=>c.id);p.packs=10;}return s;}
export function upgradeSandbox(s){if(!s.sandbox)return false;let changed=false;for(const p of Object.values(s.profiles)){const owned=new Set(p.cards.map(String));for(const c of CARDS){if(!owned.has(String(c.id))){p.cards.push(c.id);changed=true;}}}return changed;}
export const acceptsBackup=(save,test)=>Boolean(save?.sandbox)===test;
