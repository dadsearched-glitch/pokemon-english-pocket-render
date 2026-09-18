// Lightweight vector UI; scenery is a separately generated raster asset.
const paths={
 home:'<path d="m3 11 9-8 9 8v10H4V11M9 21v-8h6v8"/>',
 book:'<path d="M12 5v16M12 5C8 2 4 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-2-10 1Z"/>',
 headphones:'<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 12H2v8h5v-8H4Zm16 0h2v8h-5v-8h3Z"/>',
 read:'<path d="M5 2h10l4 4v16H5V2Zm10 0v5h4M8 11h8M8 15h8M8 19h5"/>',
 puzzle:'<path d="M3 9h5V5a3 3 0 1 1 6 0v4h7v6h-4a3 3 0 1 0 0 6H3V9Z"/>',
 mic:'<rect x="8" y="2" width="8" height="13" rx="4"/><path d="M4 11v1a8 8 0 0 0 16 0v-1M12 20v3M8 23h8"/>',
 repeat:'<path d="M20 8a9 9 0 0 0-16-2L1 9m0-6v6h6M4 16a9 9 0 0 0 16 2l3-3m0 6v-6h-6"/>',
 cards:'<rect x="6" y="3" width="14" height="19" rx="2"/><path d="m3 18-2-15a2 2 0 0 1 2-2h12M9 12l4-4 4 4-4 4-4-4Z"/>',
 battle:'<path d="m3 3 5 1 11 13-2 2L4 8 3 3ZM16 4l5-1-1 5-5 5M4 16l4 4M3 21l4-4M16 20l4-4M17 17l4 4"/>',
 star:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>',
 back:'<path d="m10 5-7 7 7 7M3 12h19"/>',
 sound:'<path d="m11 3-6 5H2v8h3l6 5V3Zm5 4a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16"/>',
 settings:'<path d="m9 2-1 3-3 1-3 3 2 3-2 3 3 3 3 1 1 3h6l1-3 3-1 3-3-2-3 2-3-3-3-3-1-1-3H9Z"/><circle cx="12" cy="12" r="4"/>',
 map:'<path d="m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3V5Zm7-3v17m6-14v17"/>',
 lock:'<rect x="5" y="10" width="14" height="12" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 15v3"/>',
 check:'<path d="m4 12 5 5L21 5"/>',
 spark:'<path d="m12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z"/>',
 shield:'<path d="m12 2 9 4v6c0 5-6 9-9 10-3-1-9-5-9-10V6l9-4Z"/>',
 bolt:'<path d="m14 1-12 13h8l-1 9 13-14h-9l1-8Z"/>'
};
export const uiIcon=name=>`<span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.star}</svg></span>`;
export const REGIONS=[['School days','학교에서 시작하는 모험','01 — 04'],['Around town','우리 동네의 작은 발견','05 — 08'],['Beyond the gate','책과 자연 속으로','09 — 12'],['Better together','함께 배우는 생활 영어','13 — 16'],['Our world','세상을 더 가까이','17 — 20'],['Next adventures','생각을 나누고 도전해요','21 — 24']];
export const regionFor=chapter=>Math.floor(chapter/4);
export function ambientFX(cls=''){return `<div class="fireflies ${cls}" aria-hidden="true">${Array.from({length:7},(_,i)=>`<i style="--n:${i}"></i>`).join('')}</div>`;}
export function mapScene(units,p,region,selected,sandbox){
 const completed=i=>(i===p.chapter?p.done:p.unitProgress?.[i]?.done)?.length===6;
 const available=i=>sandbox||i===0||i===p.chapter||completed(i)||completed(i-1);
 const positions=[[23,78],[70,58],[29,37],[66,17]];
 return `<div class="island-map" role="group" aria-label="${REGIONS[region][0]} unit map">${ambientFX()}<svg class="map-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="trail-shadow" d="M23 78C23 67 70 72 70 58S29 51 29 37 66 30 66 17"/><path d="M23 78C23 67 70 72 70 58S29 51 29 37 66 30 66 17"/></svg>${positions.map(([x,y],j)=>{const i=region*4+j,done=completed(i),open=available(i);return `<button class="map-node ${done?'cleared':''} ${i===p.chapter?'here':''} ${i===selected?'chosen':''} ${!open?'locked':''}" style="--x:${x}%;--y:${y}%" data-action="map-select:${i}" aria-label="Unit ${i+1}: ${units[i].name}${done?', complete':!open?', locked':''}" aria-pressed="${i===selected}"><span class="node-disc">${done?uiIcon('check'):!open?uiIcon('lock'):String(i+1).padStart(2,'0')}</span><span class="node-label">${i===p.chapter?'YOU ARE HERE':units[i].name}</span></button>`;}).join('')}<span class="map-compass" aria-hidden="true">N<span>✧</span></span><div class="map-caption">${uiIcon('map')} ${REGIONS[region][0]} <span>YEAR ${units[0].year}</span></div></div>`;
}
