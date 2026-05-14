// Aardwolf MUD - UI Entry Point
import { createAardwolfGame, processAardwolfAction, getAardwolfActions, getExplorationRank, GAME_ID } from './game.js';
import { CLASSES } from './data.js';
import { Terminal } from '../shared-mud/terminal.js';
import { renderSidebar, renderCompactBar } from '../shared-mud/sidebar.js';
import { saveGame, loadGame, hasSave, deleteSave } from '../shared-mud/save.js';
import { getActiveCharacter, needsPassDevice } from '../shared-mud/party.js';
import { getExplorationPercent } from '../shared-mud/dungeon.js';
import { showModal } from '../shared/modal.js';
import { RULES_HTML } from './rules.js';
import { createTemplateProvider } from './data.js';

const gameArea = document.getElementById('game-area');
let state = null;
let terminal = null;
let lastRenderedMsgIndex = 0;
let previousPlayerIndex = 0;

// Elements cache
let sidebarEl = null;
let compactBarEl = null;
let actionsEl = null;

// ----- Boot -----
function boot() {
  document.getElementById('rules-btn').addEventListener('click', () => showModal('How to Play', RULES_HTML));

  if (hasSave(GAME_ID)) {
    showMainMenu(true);
  } else {
    showSetup();
  }
}

// ----- Main Menu (Continue / New Game) -----
function showMainMenu(hasSaveData) {
  gameArea.innerHTML = '';
  gameArea.style.maxWidth = '';
  const wrap = document.createElement('div');
  wrap.className = 'mud-setup';
  wrap.innerHTML = `
    <h2>Aardwolf</h2>
    <p>A roguelike dungeon crawler inspired by the classic MUD.</p>
    <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center;">
      ${hasSaveData ? '<button class="btn btn-primary" id="continue-btn">Continue</button>' : ''}
      <button class="btn" id="new-game-btn">New Game</button>
    </div>
  `;
  gameArea.appendChild(wrap);

  if (hasSaveData) {
    document.getElementById('continue-btn').addEventListener('click', () => {
      state = loadGame(GAME_ID);
      if (state) {
        // Re-attach non-serializable config
        state.config.templateProvider = null;
        lastRenderedMsgIndex = 0;
        startGame();
      } else {
        showSetup();
      }
    });
  }
  document.getElementById('new-game-btn').addEventListener('click', () => {
    deleteSave(GAME_ID);
    showSetup();
  });
}

// ----- Setup Screen -----
function showSetup() {
  gameArea.innerHTML = '';
  gameArea.style.maxWidth = '800px';

  let selectedClass = 'warrior';
  let playerCount = 1;

  const wrap = document.createElement('div');
  wrap.className = 'mud-setup';

  wrap.innerHTML = `
    <h2>Create Your Character</h2>
    <label style="color:var(--text-secondary); font-size:0.9rem;">Character Name</label>
    <input type="text" id="char-name" placeholder="Enter name..." maxlength="20" value="">
    <label style="color:var(--text-secondary); font-size:0.9rem; margin-top:8px;">Choose Class</label>
    <div class="class-grid" id="class-grid"></div>
    <label style="color:var(--text-secondary); font-size:0.9rem; margin-top:8px;">Players</label>
    <div class="player-count-btns" id="player-btns"></div>
    <button class="btn btn-primary" id="start-btn" style="margin-top:16px;">Enter the Dungeon</button>
  `;
  gameArea.appendChild(wrap);

  // Render class cards
  const classGrid = document.getElementById('class-grid');
  for (const [id, cls] of Object.entries(CLASSES)) {
    const card = document.createElement('div');
    card.className = 'class-card' + (id === selectedClass ? ' selected' : '');
    card.dataset.classId = id;
    card.innerHTML = `<h3>${cls.name}</h3><p>${cls.description}</p>`;
    card.addEventListener('click', () => {
      selectedClass = id;
      classGrid.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
    classGrid.appendChild(card);
  }

  // Render player count buttons
  const playerBtns = document.getElementById('player-btns');
  for (let i = 1; i <= 4; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-small' + (i === playerCount ? ' selected' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => {
      playerCount = i;
      playerBtns.querySelectorAll('.btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    playerBtns.appendChild(btn);
  }

  // Start button
  document.getElementById('start-btn').addEventListener('click', () => {
    const name = document.getElementById('char-name').value.trim() || 'Adventurer';
    state = createAardwolfGame(name, selectedClass, playerCount);
    lastRenderedMsgIndex = 0;
    startGame();
  });
}

// ----- Game Screen -----
function startGame() {
  gameArea.innerHTML = '';
  gameArea.style.maxWidth = '';
  gameArea.classList.add('mud-layout-wrap');

  const layout = document.createElement('div');
  layout.className = 'mud-layout';

  // Compact bar (mobile)
  compactBarEl = document.createElement('div');
  compactBarEl.className = 'mud-compact-bar';
  layout.appendChild(compactBarEl);

  // Terminal
  const termWrap = document.createElement('div');
  termWrap.className = 'mud-terminal-wrap';
  layout.appendChild(termWrap);

  terminal = new Terminal(termWrap);

  // Sidebar
  sidebarEl = document.createElement('div');
  sidebarEl.className = 'mud-sidebar';
  layout.appendChild(sidebarEl);

  // Actions
  actionsEl = document.createElement('div');
  actionsEl.className = 'mud-actions';
  layout.appendChild(actionsEl);

  gameArea.appendChild(layout);

  renderAll();
}

// ----- Render -----
function renderAll() {
  if (!state) return;

  // Check game over
  if (state.phase === 'gameOver') {
    showGameOver();
    return;
  }

  const activeChar = getActiveCharacter(state.party);

  // Terminal messages (only new ones)
  terminal.renderMessages(state.messages, lastRenderedMsgIndex);
  lastRenderedMsgIndex = state.messages.length;

  // Sidebar
  const rank = getExplorationRank(state);
  const rankClass = rank.name.toLowerCase().replace(/\s+/g, '-');
  const extraSections = [
    {
      title: 'Exploration',
      html: `
        <div class="sidebar-row">
          <span class="exploration-rank rank-${rankClass}">${rank.name}</span>
        </div>
        <div class="sidebar-row" style="font-size:0.75rem; color:var(--text-secondary);">
          ${rank.percent}% explored &middot; Floor ${state.dungeon.currentFloor + 1}/${state.dungeon.floors.length}
        </div>
      `,
    },
  ];
  renderSidebar(sidebarEl, activeChar, extraSections);
  renderCompactBar(compactBarEl, activeChar);

  // Actions
  renderActions();
}

function renderActions() {
  actionsEl.innerHTML = '';
  if (state.phase === 'gameOver') return;

  const actions = getAardwolfActions(state);
  for (const act of actions) {
    const btn = document.createElement('button');
    btn.className = `btn btn-small cat-${act.category || 'special'}`;
    btn.textContent = act.label;
    if (act.disabled) {
      btn.disabled = true;
    }
    btn.addEventListener('click', () => handleAction(act.action));
    actionsEl.appendChild(btn);
  }
}

function handleAction(action) {
  previousPlayerIndex = state.party.activePlayerIndex;
  state = processAardwolfAction(state, action);
  saveGame(GAME_ID, state);

  // Check if we need pass-device overlay
  if (state.party.playerCount > 1 && state.phase !== 'gameOver') {
    if (needsPassDevice(state.party, previousPlayerIndex)) {
      showPassOverlay(state.party.activePlayerIndex);
      return;
    }
  }

  renderAll();
}

function showPassOverlay(playerIndex) {
  const overlay = document.createElement('div');
  overlay.className = 'pass-overlay';
  overlay.innerHTML = `
    <h2>Pass to Player ${playerIndex + 1}</h2>
    <p>Tap or click anywhere to continue</p>
  `;
  overlay.addEventListener('click', () => {
    overlay.remove();
    renderAll();
  });
  document.body.appendChild(overlay);
}

// ----- Game Over -----
function showGameOver() {
  // Render final terminal messages
  terminal.renderMessages(state.messages, lastRenderedMsgIndex);
  lastRenderedMsgIndex = state.messages.length;

  actionsEl.innerHTML = '';

  const activeChar = getActiveCharacter(state.party);
  const rank = getExplorationRank(state);

  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';
  overlay.innerHTML = `
    <div class="game-over-box">
      <h2 class="${state.won ? 'win' : 'lose'}">${state.won ? 'Victory!' : 'Defeat'}</h2>
      <p>${state.won ? 'You escaped the dungeon!' : 'Your adventure ends here...'}</p>
      <div style="text-align:left; margin:16px 0; font-size:0.9rem; color:var(--text-secondary);">
        <div>Level: <strong style="color:var(--text-primary)">${activeChar.level}</strong></div>
        <div>Floor: <strong style="color:var(--text-primary)">${state.dungeon.currentFloor + 1}</strong></div>
        <div>Exploration: <strong style="color:var(--text-primary)">${rank.percent}%</strong> (${rank.name})</div>
        <div>Gold: <strong style="color:var(--accent-gold)">${activeChar.gold}</strong></div>
        <div>Turns: <strong style="color:var(--text-primary)">${state.turnCount}</strong></div>
      </div>
      <button class="btn btn-primary" id="play-again-btn">Play Again</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('play-again-btn').addEventListener('click', () => {
    overlay.remove();
    deleteSave(GAME_ID);
    state = null;
    showSetup();
  });
}

// ----- Init -----
boot();
