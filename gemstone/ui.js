// GemStone IV - UI / Main Entry Point

import { Terminal } from '../shared-mud/terminal.js';
import { renderSidebar, renderCompactBar } from '../shared-mud/sidebar.js';
import { saveGame, loadGame, hasSave, deleteSave } from '../shared-mud/save.js';
import { getActiveCharacter } from '../shared-mud/party.js';
import { showModal } from '../shared/modal.js';
import { PROFESSIONS, ABILITY_DEFS, SKILL_DEFS, QUESTS } from './data.js';
import { createGemstoneGame, processGemstoneAction, getGemstoneActions } from './game.js';
import { RULES_HTML } from './rules.js';

const GAME_ID = 'gemstone';
const AUTO_SAVE_INTERVAL = 5000;

let state = null;
let terminal = null;
let lastRenderedMsgCount = 0;
let autoSaveTimer = null;

// ============================================================
// Boot
// ============================================================
function boot() {
  document.getElementById('rules-btn').addEventListener('click', () => {
    showModal('How to Play - GemStone IV', RULES_HTML);
  });

  if (hasSave(GAME_ID)) {
    showResumePrompt();
  } else {
    showSetup();
  }
}

// ============================================================
// Resume Prompt
// ============================================================
function showResumePrompt() {
  const area = document.getElementById('game-area');
  area.innerHTML = '';
  area.className = 'game-area';

  const wrap = document.createElement('div');
  wrap.className = 'mud-setup';
  wrap.innerHTML = `
    <h2>GemStone IV</h2>
    <p>A saved game was found. Would you like to continue your journey through the depths?</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
      <button class="btn btn-primary" id="resume-btn">Continue</button>
      <button class="btn btn-danger" id="new-btn">New Game</button>
    </div>
  `;
  area.appendChild(wrap);

  document.getElementById('resume-btn').addEventListener('click', () => {
    const saved = loadGame(GAME_ID);
    if (saved) {
      state = saved;
      // Restore non-serialized fields
      if (!state.preparingSpell) state.preparingSpell = null;
      if (!state.quests) state.quests = [];
      startGame();
    } else {
      showSetup();
    }
  });

  document.getElementById('new-btn').addEventListener('click', () => {
    deleteSave(GAME_ID);
    showSetup();
  });
}

// ============================================================
// Setup Screen
// ============================================================
function showSetup() {
  const area = document.getElementById('game-area');
  area.innerHTML = '';
  area.className = 'game-area';

  const wrap = document.createElement('div');
  wrap.className = 'mud-setup';

  let selectedProfession = 'warrior';
  let selectedPlayerCount = 1;

  wrap.innerHTML = `
    <h2>GemStone IV</h2>
    <p>Enter the depths beneath the DragonSpine Mountains. Choose your name and profession, then descend into a world of rich narrative, ancient magic, and deadly peril.</p>

    <label style="color:var(--text-secondary);font-size:0.85rem">Character Name</label>
    <input type="text" id="char-name" placeholder="Enter your name" value="Silvanus" maxlength="20">

    <label style="color:var(--text-secondary);font-size:0.85rem;margin-top:8px">Choose Your Profession</label>
    <div class="profession-grid" id="prof-grid"></div>

    <label style="color:var(--text-secondary);font-size:0.85rem;margin-top:12px">Players</label>
    <div style="display:flex;gap:8px;justify-content:center" id="player-btns">
      <button class="btn btn-small selected" data-count="1">Solo</button>
      <button class="btn btn-small" data-count="2">2 Players</button>
    </div>

    <button class="btn btn-primary" id="start-btn" style="margin-top:16px;padding:12px 40px;font-size:1.1rem">Enter the Depths</button>
  `;

  area.appendChild(wrap);

  // Render profession cards
  const grid = document.getElementById('prof-grid');
  for (const [id, prof] of Object.entries(PROFESSIONS)) {
    const card = document.createElement('div');
    card.className = 'profession-card' + (id === selectedProfession ? ' selected' : '');
    card.dataset.id = id;
    card.innerHTML = `<h3>${prof.name}</h3><p>${prof.description}</p>`;
    card.addEventListener('click', () => {
      selectedProfession = id;
      grid.querySelectorAll('.profession-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
    grid.appendChild(card);
  }

  // Player count buttons
  const playerBtns = document.getElementById('player-btns');
  playerBtns.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedPlayerCount = parseInt(btn.dataset.count);
      playerBtns.querySelectorAll('.btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Start
  document.getElementById('start-btn').addEventListener('click', () => {
    const name = document.getElementById('char-name').value.trim() || 'Silvanus';
    state = createGemstoneGame(name, selectedProfession, selectedPlayerCount);
    startGame();
  });
}

// ============================================================
// Start Game (render layout)
// ============================================================
function startGame() {
  const area = document.getElementById('game-area');
  area.innerHTML = '';
  area.className = '';
  area.style.maxWidth = 'none';
  area.style.padding = '0';

  const layout = document.createElement('div');
  layout.className = 'mud-layout';

  // Compact bar (mobile)
  const compactBar = document.createElement('div');
  compactBar.className = 'mud-compact-bar';
  compactBar.id = 'compact-bar';

  // Terminal
  const termWrap = document.createElement('div');
  termWrap.className = 'mud-terminal-wrap';
  termWrap.id = 'terminal';

  // Actions
  const actionsPanel = document.createElement('div');
  actionsPanel.className = 'mud-actions';
  actionsPanel.id = 'actions-panel';

  // Sidebar
  const sidebar = document.createElement('div');
  sidebar.className = 'mud-sidebar';
  sidebar.id = 'sidebar';

  layout.appendChild(compactBar);
  layout.appendChild(termWrap);
  layout.appendChild(actionsPanel);
  layout.appendChild(sidebar);
  area.appendChild(layout);

  // Initialize terminal
  terminal = new Terminal(termWrap);
  lastRenderedMsgCount = 0;

  // Render initial state
  render();

  // Auto-save
  if (autoSaveTimer) clearInterval(autoSaveTimer);
  autoSaveTimer = setInterval(() => {
    if (state && state.phase !== 'gameOver') {
      saveGame(GAME_ID, state);
    }
  }, AUTO_SAVE_INTERVAL);
}

// ============================================================
// Render
// ============================================================
function render() {
  if (!state) return;

  // Check for game over
  if (state.phase === 'gameOver') {
    renderGameOver();
    return;
  }

  // Render terminal messages
  renderTerminal();

  // Render sidebar
  renderSidebarContent();

  // Render compact bar
  const compactBar = document.getElementById('compact-bar');
  if (compactBar) {
    renderCompactBar(compactBar, getActiveCharacter(state.party));
  }

  // Render actions
  renderActions();
}

function renderTerminal() {
  if (!terminal || !state) return;
  // Only render new messages
  terminal.renderMessages(state.messages, lastRenderedMsgCount);
  lastRenderedMsgCount = state.messages.length;
}

function renderSidebarContent() {
  const sidebarEl = document.getElementById('sidebar');
  if (!sidebarEl) return;

  const char = getActiveCharacter(state.party);
  const extraSections = [];

  // Spell preparation indicator
  if (state.preparingSpell) {
    const abDef = ABILITY_DEFS[state.preparingSpell.ability];
    extraSections.push({
      title: 'Preparing Spell',
      html: `
        <div class="spell-preparing">
          <div class="spell-preparing-label">Channeling...</div>
          <div class="spell-preparing-name">${abDef ? abDef.name : 'Unknown'}</div>
        </div>
      `,
    });
  }

  // Skills section
  const skillEntries = Object.entries(char.skills || {})
    .filter(([id]) => SKILL_DEFS[id])
    .sort((a, b) => b[1] - a[1]);

  if (skillEntries.length > 0) {
    let skillHtml = '<div class="skill-display">';
    for (const [skillId, value] of skillEntries) {
      const def = SKILL_DEFS[skillId];
      const rank = Math.floor(value / 10);
      const progress = (value % 10) / 10 * 100;
      skillHtml += `
        <div class="skill-row">
          <span class="skill-name">${def.name}</span>
          <span class="skill-value">${value}</span>
          <span class="skill-rank">Rk ${rank}</span>
          <div class="skill-bar-wrap">
            <div class="skill-bar-fill" style="width:${progress}%"></div>
          </div>
        </div>
      `;
    }
    skillHtml += '</div>';
    extraSections.push({ title: 'Skills', html: skillHtml });
  }

  // Quests section
  if (state.quests && state.quests.length > 0) {
    const discovered = state.quests.filter(q => q.discovered);
    if (discovered.length > 0) {
      let questHtml = '<div class="quest-log">';
      for (const qs of discovered) {
        const def = QUESTS.find(q => q.id === qs.questId);
        if (!def) continue;
        const nameClass = qs.completed ? 'quest-name completed' : 'quest-name';
        questHtml += `<div class="quest-entry">`;
        questHtml += `<div class="${nameClass}">${def.name}</div>`;
        if (!qs.completed && qs.currentStage < def.stages.length) {
          questHtml += `<div class="quest-objective">${def.stages[qs.currentStage].description}</div>`;
        } else if (qs.completed) {
          questHtml += `<div class="quest-objective" style="color:#2ecc71">Complete</div>`;
        }
        questHtml += `</div>`;
      }
      questHtml += '</div>';
      extraSections.push({ title: 'Quests', html: questHtml });
    }
  }

  renderSidebar(sidebarEl, char, extraSections);
}

function renderActions() {
  const panel = document.getElementById('actions-panel');
  if (!panel) return;
  panel.innerHTML = '';

  const actions = getGemstoneActions(state);

  for (const a of actions) {
    const btn = document.createElement('button');
    btn.className = `btn cat-${a.category || 'special'}`;
    btn.textContent = a.label;

    if (a.disabled) {
      btn.disabled = true;
    }

    btn.addEventListener('click', () => handleAction(a.action));
    panel.appendChild(btn);
  }
}

function handleAction(action) {
  if (!state || state.phase === 'gameOver') return;

  state = processGemstoneAction(state, action);
  render();

  // Save after significant actions
  if (['move', 'descend', 'fight', 'rest', 'endLoot', 'allocate'].includes(action.type)) {
    saveGame(GAME_ID, state);
  }
}

// ============================================================
// Game Over
// ============================================================
function renderGameOver() {
  // Render final terminal messages
  renderTerminal();

  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
  deleteSave(GAME_ID);

  const area = document.getElementById('game-area');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';

  const box = document.createElement('div');
  box.className = 'game-over-box';

  if (state.won) {
    box.innerHTML = `
      <h2 class="gs-victory">Triumph!</h2>
      <p>You have escaped the depths beneath the DragonSpine Mountains, emerging into the light with hard-won knowledge and scars that tell tales of their own.</p>
      <p style="color:var(--gs-silver);font-size:0.9rem">
        ${getActiveCharacter(state.party).name} the ${getActiveCharacter(state.party).className}<br>
        Level ${getActiveCharacter(state.party).level} | ${state.turnCount} turns
      </p>
    `;
  } else {
    box.innerHTML = `
      <h2 class="gs-defeat">Fallen</h2>
      <p>The darkness claims another soul. Your story ends here, beneath the crushing weight of stone and shadow.</p>
      <p style="color:var(--text-secondary);font-size:0.9rem">
        ${getActiveCharacter(state.party).name} the ${getActiveCharacter(state.party).className}<br>
        Level ${getActiveCharacter(state.party).level} | Floor ${state.dungeon.currentFloor + 1}
      </p>
    `;
  }

  const btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'display:flex;gap:12px;justify-content:center;margin-top:16px';

  const newGameBtn = document.createElement('button');
  newGameBtn.className = 'btn btn-primary';
  newGameBtn.textContent = 'New Game';
  newGameBtn.addEventListener('click', () => {
    overlay.remove();
    state = null;
    showSetup();
  });

  const menuBtn = document.createElement('a');
  menuBtn.className = 'btn';
  menuBtn.textContent = 'Main Menu';
  menuBtn.href = '../';

  btnWrap.appendChild(newGameBtn);
  btnWrap.appendChild(menuBtn);
  box.appendChild(btnWrap);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

// ============================================================
// Init
// ============================================================
document.addEventListener('DOMContentLoaded', boot);
