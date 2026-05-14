import { createIcesusGame, processIcesusAction, getIcesusActions } from './game.js';
import { GUILDS, RACES, ABILITY_DEFS, createTemplateProvider } from './data.js';
import { RULES_HTML } from './rules.js';
import { Terminal } from '../shared-mud/terminal.js';
import { renderSidebar } from '../shared-mud/sidebar.js';
import { saveGame, loadGame, hasSave, deleteSave } from '../shared-mud/save.js';
import { getActiveCharacter, needsPassDevice, getPlayerForChar } from '../shared-mud/party.js';
import { getCurrentRoom } from '../shared-mud/dungeon.js';
import { showModal } from '../shared/modal.js';

const GAME_ID = 'icesus';
const gameArea = document.getElementById('game-area');

let state = null;
let terminal = null;
let lastRenderedMsgIndex = 0;
let previousPlayerIndex = 0;
let setupData = {
  playerCount: 1,
  partySize: 2,
  characters: [],
  currentCharIndex: 0,
};

// ===== BOOT =====
document.getElementById('rules-btn').addEventListener('click', () => {
  showModal('How to Play - Icesus', RULES_HTML);
});

if (hasSave(GAME_ID)) {
  showResumeScreen();
} else {
  showSetupStep1();
}

// ===== RESUME SCREEN =====
function showResumeScreen() {
  gameArea.innerHTML = '';
  const wrap = el('div', 'party-setup');
  wrap.innerHTML = `
    <h2>Welcome Back to Icesus</h2>
    <p>You have a saved game. Would you like to continue or start fresh?</p>
    <div class="setup-buttons">
      <button class="btn btn-primary" id="resume-btn">Continue</button>
      <button class="btn btn-danger" id="new-btn">New Game</button>
    </div>
  `;
  gameArea.appendChild(wrap);

  document.getElementById('resume-btn').addEventListener('click', () => {
    state = loadGame(GAME_ID);
    if (state) {
      // Re-attach template provider
      state.config.templateProvider = createTemplateProvider();
      lastRenderedMsgIndex = 0;
      startGameScreen();
    } else {
      showSetupStep1();
    }
  });

  document.getElementById('new-btn').addEventListener('click', () => {
    deleteSave(GAME_ID);
    showSetupStep1();
  });
}

// ===== SETUP FLOW =====
function renderStepDots(total, current) {
  let html = '<div class="step-indicator">';
  for (let i = 0; i < total; i++) {
    const cls = i < current ? 'done' : i === current ? 'active' : '';
    html += `<div class="step-dot ${cls}"></div>`;
  }
  html += '</div>';
  return html;
}

// Step 1: Player count
function showSetupStep1() {
  setupData = { playerCount: 1, partySize: 2, characters: [], currentCharIndex: 0 };
  gameArea.innerHTML = '';
  const wrap = el('div', 'party-setup');

  const totalSteps = 3; // player count, char creation (counted as 1 dot), summary
  wrap.innerHTML = `
    ${renderStepDots(totalSteps, 0)}
    <h2>Assemble Your Party</h2>
    <h3>How many players? (Hot-Seat)</h3>
    <p>Multiple players can share the device, each controlling different party members.</p>
    <div class="player-count-grid" id="pc-grid"></div>
    <div style="margin-top:16px">
      <h3>Party size?</h3>
      <div class="party-size-grid" id="ps-grid"></div>
    </div>
    <button class="btn btn-primary" id="step1-next" style="margin-top:18px">Next</button>
  `;
  gameArea.appendChild(wrap);

  const pcGrid = document.getElementById('pc-grid');
  for (let i = 1; i <= 4; i++) {
    const btn = el('button', 'player-count-btn' + (i === 1 ? ' selected' : ''));
    btn.textContent = i;
    btn.addEventListener('click', () => {
      setupData.playerCount = i;
      // Ensure partySize >= playerCount
      if (setupData.partySize < i) setupData.partySize = i;
      pcGrid.querySelectorAll('.player-count-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      renderPartySizeGrid();
    });
    pcGrid.appendChild(btn);
  }

  function renderPartySizeGrid() {
    const psGrid = document.getElementById('ps-grid');
    psGrid.innerHTML = '';
    for (let s = Math.max(2, setupData.playerCount); s <= 4; s++) {
      const btn = el('button', 'party-size-btn' + (s === setupData.partySize ? ' selected' : ''));
      btn.innerHTML = `${s}<span>chars</span>`;
      btn.addEventListener('click', () => {
        setupData.partySize = s;
        psGrid.querySelectorAll('.party-size-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      psGrid.appendChild(btn);
    }
    // Fix selection if current partySize out of range
    if (setupData.partySize < Math.max(2, setupData.playerCount)) {
      setupData.partySize = Math.max(2, setupData.playerCount);
    }
  }

  renderPartySizeGrid();

  document.getElementById('step1-next').addEventListener('click', () => {
    setupData.characters = [];
    setupData.currentCharIndex = 0;
    showCharCreation(0);
  });
}

// Step 2: Character creation (one at a time)
function showCharCreation(charIndex) {
  setupData.currentCharIndex = charIndex;
  const totalSteps = 2 + setupData.partySize; // step1 + N chars + summary
  gameArea.innerHTML = '';
  const wrap = el('div', 'party-setup');

  const defaultNames = ['Aldric', 'Elowen', 'Thrain', 'Mira'];
  const savedChar = setupData.characters[charIndex] || {};
  const defaultName = savedChar.name || defaultNames[charIndex] || `Hero ${charIndex + 1}`;
  const selectedGuild = savedChar.guildId || '';
  const selectedRace = savedChar.raceId || '';

  const playerNum = (charIndex % setupData.playerCount) + 1;

  wrap.innerHTML = `
    ${renderStepDots(totalSteps, 1 + charIndex)}
    <h2>Character ${charIndex + 1} of ${setupData.partySize}</h2>
    <p style="font-size:0.8rem;color:#6ec6ff">Player ${playerNum}'s character</p>
    <div class="char-creation">
      <div>
        <label style="color:var(--text-secondary);font-size:0.85rem;">Name</label><br>
        <input type="text" id="char-name" value="${defaultName}" maxlength="16">
      </div>
      <h3 style="margin-top:16px">Choose a Guild</h3>
      <div class="guild-grid" id="guild-grid"></div>
      <h3 style="margin-top:16px">Choose a Race</h3>
      <div class="race-grid-icesus" id="race-grid"></div>
      <div class="setup-buttons" style="margin-top:16px">
        ${charIndex > 0 ? '<button class="btn btn-small" id="char-back">Back</button>' : ''}
        <button class="btn btn-primary" id="char-next" disabled>
          ${charIndex < setupData.partySize - 1 ? 'Next Character' : 'Review Party'}
        </button>
      </div>
    </div>
  `;
  gameArea.appendChild(wrap);

  let chosenGuild = selectedGuild;
  let chosenRace = selectedRace;

  // Render guild cards
  const guildGrid = document.getElementById('guild-grid');
  const roleLabels = { healer: 'Healer', tank: 'Tank', dps: 'Damage', support: 'Support', crafter: 'Crafter' };
  for (const [gId, guild] of Object.entries(GUILDS)) {
    const card = el('div', 'guild-card' + (gId === chosenGuild ? ' selected' : ''));
    card.innerHTML = `
      <h4>${guild.name}</h4>
      <div class="guild-role">${roleLabels[gId]} - ${guild.row} row</div>
      <p>${guild.description}</p>
    `;
    card.addEventListener('click', () => {
      chosenGuild = gId;
      guildGrid.querySelectorAll('.guild-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      checkReady();
    });
    guildGrid.appendChild(card);
  }

  // Render race cards
  const raceGrid = document.getElementById('race-grid');
  for (const race of RACES) {
    const card = el('div', 'race-card-icesus' + (race.id === chosenRace ? ' selected' : ''));
    const bonusStr = Object.entries(race.statBonuses)
      .filter(([, v]) => v !== 0)
      .map(([k, v]) => `${k.toUpperCase()} ${v > 0 ? '+' : ''}${v}`)
      .join(', ');
    card.innerHTML = `
      <h4>${race.name}</h4>
      <p>${race.description}</p>
      <div class="race-passive">${bonusStr}</div>
    `;
    card.addEventListener('click', () => {
      chosenRace = race.id;
      raceGrid.querySelectorAll('.race-card-icesus').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      checkReady();
    });
    raceGrid.appendChild(card);
  }

  const nextBtn = document.getElementById('char-next');

  function checkReady() {
    nextBtn.disabled = !(chosenGuild && chosenRace);
  }
  checkReady();

  nextBtn.addEventListener('click', () => {
    const name = document.getElementById('char-name').value.trim() || defaultName;
    setupData.characters[charIndex] = { name, guildId: chosenGuild, raceId: chosenRace };
    if (charIndex < setupData.partySize - 1) {
      showCharCreation(charIndex + 1);
    } else {
      showPartySummary();
    }
  });

  const backBtn = document.getElementById('char-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const name = document.getElementById('char-name').value.trim() || defaultName;
      if (chosenGuild && chosenRace) {
        setupData.characters[charIndex] = { name, guildId: chosenGuild, raceId: chosenRace };
      }
      showCharCreation(charIndex - 1);
    });
  }
}

// Step 3: Party summary
function showPartySummary() {
  const totalSteps = 2 + setupData.partySize;
  gameArea.innerHTML = '';
  const wrap = el('div', 'party-setup');

  const frontRow = setupData.characters.filter(c => GUILDS[c.guildId].row === 'front');
  const backRow = setupData.characters.filter(c => GUILDS[c.guildId].row === 'back');

  let frontHTML = frontRow.map(c => `
    <div class="formation-char">
      <span class="char-name">${c.name}</span>
      <span class="char-guild">${GUILDS[c.guildId].name} (${RACES.find(r => r.id === c.raceId).name})</span>
    </div>
  `).join('');

  let backHTML = backRow.map(c => `
    <div class="formation-char">
      <span class="char-name">${c.name}</span>
      <span class="char-guild">${GUILDS[c.guildId].name} (${RACES.find(r => r.id === c.raceId).name})</span>
    </div>
  `).join('');

  if (!frontHTML) frontHTML = '<div class="formation-char" style="color:var(--hp-red)">No front row!</div>';
  if (!backHTML) backHTML = '<div class="formation-char" style="color:var(--text-secondary)">None</div>';

  wrap.innerHTML = `
    ${renderStepDots(totalSteps, totalSteps - 1)}
    <h2>Party Formation</h2>
    <p>Review your party before entering the Frozen Depths.</p>
    <div class="party-summary">
      <div class="formation-preview">
        <div class="formation-row">
          <h4>Front Row</h4>
          ${frontHTML}
        </div>
        <div class="formation-row">
          <h4>Back Row</h4>
          ${backHTML}
        </div>
      </div>
      ${frontRow.length === 0 ? '<p style="color:var(--hp-red);font-weight:600">Warning: No front row characters! Enemies will target your back row directly.</p>' : ''}
      <div class="setup-buttons">
        <button class="btn btn-small" id="summary-back">Edit Party</button>
        <button class="btn btn-primary" id="start-btn">Enter the Frozen Depths</button>
      </div>
    </div>
  `;
  gameArea.appendChild(wrap);

  document.getElementById('summary-back').addEventListener('click', () => {
    showCharCreation(setupData.partySize - 1);
  });

  document.getElementById('start-btn').addEventListener('click', () => {
    state = createIcesusGame(setupData.characters, setupData.playerCount);
    lastRenderedMsgIndex = 0;
    previousPlayerIndex = 0;
    startGameScreen();
  });
}

// ===== GAME SCREEN =====
function startGameScreen() {
  gameArea.innerHTML = '';
  gameArea.className = 'game-area';
  gameArea.style.maxWidth = 'none';
  gameArea.style.padding = '0';

  const layout = el('div', 'mud-layout');

  // Compact bar (mobile)
  const compactBar = el('div', 'mud-compact-bar');
  compactBar.id = 'compact-bar';
  layout.appendChild(compactBar);

  // Terminal
  const termWrap = el('div', 'mud-terminal-wrap');
  termWrap.id = 'terminal-wrap';
  layout.appendChild(termWrap);

  // Sidebar
  const sidebar = el('div', 'mud-sidebar');
  sidebar.id = 'sidebar';
  layout.appendChild(sidebar);

  // Actions
  const actionsBar = el('div', 'mud-actions');
  actionsBar.id = 'actions-bar';
  layout.appendChild(actionsBar);

  gameArea.appendChild(layout);

  terminal = new Terminal(termWrap);
  renderGame();
}

function renderGame() {
  if (!state) return;

  // Check game over
  if (state.phase === 'gameOver') {
    showGameOver();
    return;
  }

  // Check pass device
  const activeChar = getActiveCharacter(state.party);
  const currentPlayerIdx = state.party.activePlayerIndex;

  if (state.party.playerCount > 1 && needsPassDevice(state.party, previousPlayerIndex)) {
    showPassOverlay(currentPlayerIdx, () => {
      previousPlayerIndex = currentPlayerIdx;
      renderGame();
    });
    return;
  }

  // Render messages
  terminal.renderMessages(state.messages, lastRenderedMsgIndex);
  lastRenderedMsgIndex = state.messages.length;

  // Render sidebar
  renderIcesusSidebar();

  // Render compact bar
  renderCompactBarCustom();

  // Render actions
  renderActions();

  // Auto-save
  saveGame(GAME_ID, state);
}

function renderIcesusSidebar() {
  const sidebar = document.getElementById('sidebar');
  const activeChar = getActiveCharacter(state.party);

  // Build party section
  const partyHTML = state.party.characters.map((c, i) => {
    const hpPct = c.maxHp > 0 ? Math.max(0, (c.hp / c.maxHp) * 100) : 0;
    const hpColor = hpPct <= 25 ? 'var(--hp-red)' : hpPct <= 50 ? 'var(--hp-yellow)' : 'var(--hp-green)';
    const isActive = i === state.party.activeCharIndex;
    const guild = GUILDS[c.classId];
    const rowLabel = (guild ? guild.row : c.row || 'front').toUpperCase();

    return `
      <div class="party-member-compact">
        <div class="member-header">
          <span class="member-name ${isActive ? 'is-active' : ''}">${c.name}</span>
          <span class="member-row-tag">${rowLabel}</span>
        </div>
        <div class="member-header">
          <span class="member-role">${c.className} Lv.${c.level}</span>
          <span class="member-role">HP ${c.hp}/${c.maxHp}</span>
        </div>
        <div class="mini-hp-bar">
          <div class="mini-hp-fill" style="width:${hpPct}%;background:${hpColor}"></div>
        </div>
      </div>
    `;
  }).join('');

  // Turn indicator during combat
  let turnHTML = '';
  if (state.phase === 'combat' && state.combat) {
    turnHTML = `<div class="turn-indicator">${activeChar.name}'s Turn</div>`;
  }

  const extraSections = [
    { title: 'Party', html: partyHTML },
  ];

  // Add formation section
  const frontChars = state.party.characters.filter((c, i) => {
    const g = GUILDS[c.classId];
    return (g ? g.row : 'front') === 'front';
  });
  const backChars = state.party.characters.filter((c, i) => {
    const g = GUILDS[c.classId];
    return (g ? g.row : 'front') === 'back';
  });

  const formationHTML = `
    <div class="formation-display">
      <div class="row-group">
        <div class="row-label">Front</div>
        ${frontChars.map(c => {
          const isDead = c.hp <= 0;
          const isAct = c === activeChar;
          return `<div class="row-member ${isDead ? 'dead' : ''} ${isAct ? 'active' : ''}">${c.name}</div>`;
        }).join('') || '<div class="row-member dead">empty</div>'}
      </div>
      <div class="row-group">
        <div class="row-label">Back</div>
        ${backChars.map(c => {
          const isDead = c.hp <= 0;
          const isAct = c === activeChar;
          return `<div class="row-member ${isDead ? 'dead' : ''} ${isAct ? 'active' : ''}">${c.name}</div>`;
        }).join('') || '<div class="row-member dead">empty</div>'}
      </div>
    </div>
  `;
  extraSections.push({ title: 'Formation', html: formationHTML });

  sidebar.innerHTML = '';
  if (turnHTML) sidebar.innerHTML = turnHTML;
  renderSidebar(sidebar, activeChar, extraSections);
}

function renderCompactBarCustom() {
  const bar = document.getElementById('compact-bar');
  if (!bar) return;
  const c = getActiveCharacter(state.party);
  bar.innerHTML = `
    <div class="compact-bar">
      <span class="compact-name">${c.name} Lv.${c.level}</span>
      <span class="compact-resource">HP ${c.hp}/${c.maxHp}</span>
      <span class="compact-resource">MP ${c.mana}/${c.maxMana}</span>
      <span class="compact-resource gold">G ${c.gold || 0}</span>
    </div>
  `;
}

function renderActions() {
  const actionsBar = document.getElementById('actions-bar');
  actionsBar.innerHTML = '';

  const actions = getIcesusActions(state);

  for (const a of actions) {
    const btn = el('button', `btn btn-small cat-${a.category || 'special'}`);
    btn.textContent = a.label;
    if (a.disabled) {
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => {
        state = processIcesusAction(state, a.action);
        renderGame();
      });
    }
    actionsBar.appendChild(btn);
  }
}

// ===== PASS DEVICE OVERLAY =====
function showPassOverlay(playerIndex, callback) {
  const overlay = el('div', 'pass-overlay');
  overlay.innerHTML = `
    <h2>Pass the Device</h2>
    <p class="player-label">Player ${playerIndex + 1}'s Turn</p>
    <p>Tap anywhere when ready</p>
  `;
  overlay.addEventListener('click', () => {
    overlay.remove();
    callback();
  });
  document.body.appendChild(overlay);
}

// ===== GAME OVER =====
function showGameOver() {
  // Render final messages
  terminal.renderMessages(state.messages, lastRenderedMsgIndex);
  lastRenderedMsgIndex = state.messages.length;

  const actionsBar = document.getElementById('actions-bar');
  actionsBar.innerHTML = '';

  const overlay = el('div', 'game-over-overlay');
  const box = el('div', 'game-over-box');

  if (state.won) {
    box.innerHTML = `
      <h2 class="win">Victory!</h2>
      <p>Your party has escaped the Frozen Depths of Icesus!</p>
      <button class="btn btn-primary" id="go-play-again">Play Again</button>
    `;
  } else {
    box.innerHTML = `
      <h2 class="lose">Defeat</h2>
      <p>Your party has perished in the frozen darkness...</p>
      <button class="btn btn-primary" id="go-play-again">Try Again</button>
    `;
  }

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById('go-play-again').addEventListener('click', () => {
    overlay.remove();
    deleteSave(GAME_ID);
    state = null;
    terminal = null;
    lastRenderedMsgIndex = 0;
    previousPlayerIndex = 0;
    gameArea.style.maxWidth = '';
    gameArea.style.padding = '';
    showSetupStep1();
  });
}

// ===== HELPERS =====
function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}
