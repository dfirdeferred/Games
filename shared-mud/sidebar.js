import { RARITY_COLORS } from './inventory.js';

export function renderSidebar(container, character, extraSections = []) {
  container.innerHTML = '';

  // Character header
  const header = el('div', 'sidebar-section');
  header.innerHTML = `
    <div class="sidebar-name">${character.name}</div>
    <div class="sidebar-class">${character.raceName || ''} ${character.className} Lv.${character.level}</div>
    <div class="sidebar-xp">XP: ${character.xp} / ${character.xpToNext}</div>
  `;
  container.appendChild(header);

  // Resources
  const resources = el('div', 'sidebar-section');
  resources.appendChild(renderBar('HP', character.hp, character.maxHp, getHpColor(character.hp, character.maxHp)));
  resources.appendChild(renderBar('MP', character.mana, character.maxMana, '#3498db'));
  resources.appendChild(renderBar('MV', character.movement, character.maxMovement, '#2ecc71'));
  container.appendChild(resources);

  // Stats
  const stats = el('div', 'sidebar-section');
  stats.innerHTML = `<div class="sidebar-label">Stats</div>`;
  const grid = el('div', 'sidebar-stats-grid');
  for (const [k, v] of Object.entries(character.stats)) {
    grid.innerHTML += `<div class="stat-item"><span class="stat-name">${k.toUpperCase()}</span><span class="stat-val">${v}</span></div>`;
  }
  stats.appendChild(grid);
  container.appendChild(stats);

  // Combat stats
  const combat = el('div', 'sidebar-section');
  combat.innerHTML = `
    <div class="sidebar-label">Combat</div>
    <div class="sidebar-row">ATK: <span class="stat-val">${character.attackPower || 0}</span> DEF: <span class="stat-val">${character.defense || 0}</span></div>
    <div class="sidebar-row">Gold: <span class="stat-val gold">${character.gold || 0}</span></div>
  `;
  container.appendChild(combat);

  // Equipment
  const equip = el('div', 'sidebar-section');
  equip.innerHTML = `<div class="sidebar-label">Equipment</div>`;
  for (const [slot, item] of Object.entries(character.equipment)) {
    const itemText = item ? `<span style="color:${RARITY_COLORS[item.rarity] || '#aaa'}">${item.name}</span>` : '<span class="empty">empty</span>';
    equip.innerHTML += `<div class="sidebar-row">${slot}: ${itemText}</div>`;
  }
  container.appendChild(equip);

  // Inventory
  const inv = el('div', 'sidebar-section');
  inv.innerHTML = `<div class="sidebar-label">Inventory (${character.inventory.length}/${character.maxInventory})</div>`;
  if (character.inventory.length === 0) {
    inv.innerHTML += `<div class="sidebar-row empty">Empty</div>`;
  } else {
    for (const item of character.inventory) {
      inv.innerHTML += `<div class="sidebar-row" style="color:${RARITY_COLORS[item.rarity] || '#aaa'}">${item.name}</div>`;
    }
  }
  container.appendChild(inv);

  // Extra sections (game-specific)
  for (const section of extraSections) {
    const sec = el('div', 'sidebar-section');
    sec.innerHTML = `<div class="sidebar-label">${section.title}</div>`;
    sec.innerHTML += section.html;
    container.appendChild(sec);
  }
}

export function renderCompactBar(container, character) {
  container.innerHTML = `
    <div class="compact-bar">
      <span class="compact-name">${character.name} Lv.${character.level}</span>
      <span class="compact-resource">HP ${character.hp}/${character.maxHp}</span>
      <span class="compact-resource">MP ${character.mana}/${character.maxMana}</span>
      <span class="compact-resource gold">G ${character.gold || 0}</span>
    </div>
  `;
}

function renderBar(label, current, max, color) {
  const pct = max > 0 ? Math.max(0, (current / max) * 100) : 0;
  const bar = el('div', 'sidebar-bar');
  bar.innerHTML = `
    <div class="bar-label">${label}</div>
    <div class="hp-bar-container" style="flex:1">
      <div class="hp-bar-fill" style="width:${pct}%;background:${color}"></div>
      <div class="hp-bar-text">${current} / ${max}</div>
    </div>
  `;
  return bar;
}

function getHpColor(hp, max) {
  const pct = max > 0 ? (hp / max) * 100 : 0;
  if (pct <= 25) return 'var(--hp-red)';
  if (pct <= 50) return 'var(--hp-yellow)';
  return 'var(--hp-green)';
}

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}
