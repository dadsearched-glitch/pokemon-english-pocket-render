const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function pickerCard(card,selected=false){
  const image=card.cardImage||card.art;
  const rarity=card.rarity||'common';
  const finish=card.finish||'normal';
  return `<span class="team-picker-card ${selected?'is-selected':''} rarity-${escapeHtml(String(rarity).toLowerCase())} finish-${escapeHtml(String(finish).toLowerCase())}">
    <span class="team-picker-art"><img src="${escapeHtml(image)}" alt="${escapeHtml(card.name)}" loading="lazy"></span>
    <span class="team-picker-copy"><b>${escapeHtml(card.name)}</b><small>${escapeHtml(rarity)} · ${escapeHtml(card.type||'')}</small><small>HP ${escapeHtml(card.hp||'—')} · ${escapeHtml(card.power||card.move||'Battle')}</small></span>
    ${selected?'<strong class="team-picker-mark">✓ SELECTED</strong>':''}
    <span class="team-picker-foil" aria-hidden="true"></span>
  </span>`;
}

export function renderTeamPicker({cards,selected,max=3,action,button,filter='',inputId='team-picker-filter',label='YOUR TEAM'}){
  const chosen=new Set(selected.map(String));
  const visibleCards=cards.filter(card=>String(card.name).toLowerCase().includes(String(filter).toLowerCase()));
  const selectButton=button||((content,actionName,attrs='')=>`<button data-action="${actionName}" ${attrs}>${content}</button>`);
  const actionName=id=>`${action}:${id}`;
  const selectedCards=selected.map(String).map(id=>cards.find(card=>String(card.id)===id)).filter(Boolean);
  const slots=Array.from({length:max},(_,index)=>{
    const card=selectedCards[index];
    return `<div class="team-picker-slot ${card?'filled':''}" aria-label="Slot ${index+1}">
      <span class="team-picker-slot-label">SLOT ${index+1}${index===0?' · ACTIVE':''}</span>
      ${card?pickerCard(card,true):'<span class="team-picker-empty">+</span>'}
    </div>`;
  }).join('');
  const grid=visibleCards.map(card=>{
    const isChosen=chosen.has(String(card.id));
    return selectButton(pickerCard(card,isChosen),actionName(card.id),`class="team-picker-button ${isChosen?'is-selected':''}" aria-pressed="${isChosen}" aria-label="Select ${escapeHtml(card.name)}"`);
  }).join('');
  return `<section class="team-picker" aria-label="${escapeHtml(label)}">
    <div class="team-picker-heading"><div><p class="eyebrow">${escapeHtml(label)}</p><h2>${selected.length}/${max} selected</h2></div><span>Slot order controls your opening card</span></div>
    <div class="team-picker-slots">${slots}</div>
    ${filter!==false?`<label class="team-picker-search">Card search<input id="${escapeHtml(inputId)}" value="${escapeHtml(filter)}" placeholder="Pokémon name" autocomplete="off"></label>`:''}
    <div class="team-picker-grid">${grid}</div>
  </section>`;
}
