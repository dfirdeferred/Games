import {
  createGame, playCards, playJester, yieldTurn,
  discardCards, canPlayCombo, getAttackValue, acknowledgePassDevice
} from './game.js';
import { SUIT_SYMBOLS, RANK_NAMES } from '../shared/cards.js';
import { renderCard } from '../shared/card-ui.js';
import { showModal } from '../shared/modal.js';
import { RULES_HTML } from './rules.js';

const gameArea = document.getElementById('game-area');
const rulesBtn = document.getElementById('rules-btn');

let state = null;
let selectedIndices = new Set();
let selectedPlayerCount = 1;

rulesBtn.addEventListener('click', () => showModal('How to Play - Regicide', RULES_HTML));

// === Initial render: setup screen ===
renderSetup();

function renderSetup() {
  cleanupOverlays();
  state = null;
  selectedIndices.clear();
  selectedPlayerCount = 1;

  gameArea.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'setup-screen';

  div.innerHTML = `
    <h2>Regicide</h2>
    <p>A cooperative card game. Defeat 12 enemies to win!</p>
    <p style="color: var(--text-secondary); font-size: 0.9rem;">Select number of players:</p>
    <div class="player-count-options" id="pc-options"></div>
    <button class="btn btn-primary" id="start-btn">Start Game</button>
  `;

  gameArea.appendChild(div);

  const pcOpts = div.querySelector('#pc-options');
  for (let i = 1; i <= 4; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn' + (i === selectedPlayerCount ? ' selected' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => {
      selectedPlayerCount = i;
      pcOpts.querySelectorAll('.btn').forEach((b, idx) => {
        b.classList.toggle('selected', idx + 1 === i);
      });
    });
    pcOpts.appendChild(btn);
  }

  div.querySelector('#start-btn').addEventListener('click', () => {
    state = createGame(selectedPlayerCount);
    selectedIndices.clear();
    render();
  });
}

function cleanupOverlays() {
  document.querySelectorAll('.pass-overlay').forEach(el => el.remove());
}

function render() {
  if (!state) return;

  cleanupOverlays();

  if (state.phase === 'gameOver') {
    renderGameOver();
    return;
  }

  if (state.phase === 'passDevice') {
    renderPassDevice();
    return;
  }

  gameArea.innerHTML = '';

  // Message
  const msg = document.createElement('div');
  msg.className = 'message important';
  msg.textContent = state.message;
  gameArea.appendChild(msg);

  // Enemy area
  if (state.currentEnemy) {
    renderEnemyArea();
  }

  // Game info row
  renderGameInfo();

  if (state.phase === 'play') {
    renderPlayPhase();
  } else if (state.phase === 'discard') {
    renderDiscardPhase();
  }

  // Player info bar (multiplayer)
  renderPlayerBar();
}

function renderEnemyArea() {
  const enemy = state.currentEnemy;
  const area = document.createElement('div');
  area.className = 'enemy-area';

  // Enemy label
  const label = document.createElement('div');
  label.className = 'enemy-label';
  const rankName = { 11: 'Jack', 12: 'Queen', 13: 'King' }[enemy.card.rank];
  label.textContent = `${rankName} of ${enemy.card.suit.charAt(0).toUpperCase() + enemy.card.suit.slice(1)}`;
  area.appendChild(label);

  // Enemy card (large)
  const card = renderCard(enemy.card);
  area.appendChild(card);

  // HP bar
  const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  const hpBarContainer = document.createElement('div');
  hpBarContainer.className = 'enemy-hp-bar';
  hpBarContainer.innerHTML = `
    <div class="hp-bar-container">
      <div class="hp-bar-fill" style="width: ${hpPct}%; background: ${
        hpPct > 50 ? 'var(--hp-green)' : hpPct > 25 ? 'var(--hp-yellow)' : 'var(--hp-red)'
      };"></div>
      <div class="hp-bar-text">${enemy.hp} / ${enemy.maxHp} HP</div>
    </div>
  `;
  area.appendChild(hpBarContainer);

  // Stats
  const stats = document.createElement('div');
  stats.className = 'enemy-stats';
  const atkReduced = enemy.spadesReduction > 0;
  stats.innerHTML = `
    <div class="stat">ATK: <span class="stat-value${atkReduced ? ' reduced' : ''}">${enemy.attack}</span>
    ${atkReduced ? `<span style="font-size:0.8rem;color:var(--text-secondary)">(base ${enemy.baseAttack})</span>` : ''}</div>
    <div class="stat">Castle: <span class="stat-value">${state.castleDeck.length}</span></div>
  `;
  area.appendChild(stats);

  gameArea.appendChild(area);
}

function renderGameInfo() {
  const row = document.createElement('div');
  row.className = 'game-info-row';
  row.innerHTML = `
    <div class="info-item">Tavern: <span class="info-value">${state.tavernDeck.length}</span></div>
    <div class="info-item">Discard: <span class="info-value">${state.discardPile.length}</span></div>
    <div class="info-item">Defeated: <span class="info-value">${state.enemiesDefeated} / 12</span></div>
  `;
  gameArea.appendChild(row);
}

function renderPlayPhase() {
  const hand = state.hands[state.currentPlayer];

  // Hand label
  const handArea = document.createElement('div');
  handArea.className = 'hand-area';

  const handLabel = document.createElement('h3');
  handLabel.textContent = state.playerCount > 1
    ? `Player ${state.currentPlayer + 1}'s Hand (${hand.length} cards)`
    : `Your Hand (${hand.length} cards)`;
  handArea.appendChild(handLabel);

  // Cards
  const handCards = document.createElement('div');
  handCards.className = 'hand-cards';

  hand.forEach((card, idx) => {
    const isSelected = selectedIndices.has(idx);
    const el = renderCard(card, {
      selected: isSelected,
      onClick: () => {
        if (selectedIndices.has(idx)) {
          selectedIndices.delete(idx);
        } else {
          selectedIndices.add(idx);
        }
        render();
      }
    });
    handCards.appendChild(el);
  });

  handArea.appendChild(handCards);
  gameArea.appendChild(handArea);

  // Combo validation message
  const comboErr = document.createElement('div');
  comboErr.className = 'combo-error';
  if (selectedIndices.size > 0) {
    const selCards = [...selectedIndices].map(i => hand[i]);
    if (!canPlayCombo(selCards)) {
      comboErr.textContent = getComboErrorMessage(selCards);
    } else {
      const atk = getAttackValue(selCards);
      comboErr.style.color = 'var(--success)';
      comboErr.textContent = `Attack: ${atk}`;
    }
  }
  gameArea.appendChild(comboErr);

  // Action buttons
  const actionBar = document.createElement('div');
  actionBar.className = 'action-bar';

  // Play button
  const playBtn = document.createElement('button');
  playBtn.className = 'btn btn-primary';
  playBtn.textContent = 'Play Selected';
  const selCards = [...selectedIndices].map(i => hand[i]);
  playBtn.disabled = selectedIndices.size === 0 || !canPlayCombo(selCards);
  playBtn.addEventListener('click', () => {
    const indices = [...selectedIndices];
    state = playCards(state, indices);
    selectedIndices.clear();
    render();
  });
  actionBar.appendChild(playBtn);

  // Yield button
  const yieldBtn = document.createElement('button');
  yieldBtn.className = 'btn';
  yieldBtn.textContent = 'Yield';
  yieldBtn.disabled = state.firstPlayAgainstEnemy;
  yieldBtn.addEventListener('click', () => {
    state = yieldTurn(state);
    selectedIndices.clear();
    render();
  });
  actionBar.appendChild(yieldBtn);

  gameArea.appendChild(actionBar);

  // Jester area (solo mode)
  if (state.playerCount === 1 && state.jesterCount > 0) {
    const jesterArea = document.createElement('div');
    jesterArea.className = 'jester-area';

    const jesterBtn = document.createElement('button');
    jesterBtn.className = 'btn btn-small';
    jesterBtn.textContent = 'Play Jester';
    jesterBtn.addEventListener('click', () => {
      state = playJester(state);
      selectedIndices.clear();
      render();
    });
    jesterArea.appendChild(jesterBtn);

    const jesterLabel = document.createElement('span');
    jesterLabel.className = 'jester-count';
    jesterLabel.textContent = `${state.jesterCount} Jester${state.jesterCount !== 1 ? 's' : ''} remaining`;
    jesterArea.appendChild(jesterLabel);

    gameArea.appendChild(jesterArea);
  }
}

function renderDiscardPhase() {
  const hand = state.hands[state.currentPlayer];
  const remaining = state.discardTarget - state.discardedSoFar;

  // Discard info
  const info = document.createElement('div');
  info.className = 'discard-info';
  info.innerHTML = `
    <p>Enemy attacks! Cover the damage by discarding cards.</p>
    <div class="damage-counter">${state.discardedSoFar} / ${state.discardTarget}</div>
    <div class="discard-progress">
      <div class="discard-progress-fill" style="width: ${Math.min(100, (state.discardedSoFar / state.discardTarget) * 100)}%"></div>
    </div>
    <p>${remaining} damage remaining</p>
  `;
  gameArea.appendChild(info);

  // Hand
  const handArea = document.createElement('div');
  handArea.className = 'hand-area';

  const handLabel = document.createElement('h3');
  handLabel.textContent = state.playerCount > 1
    ? `Player ${state.currentPlayer + 1}'s Hand (${hand.length} cards)`
    : `Your Hand (${hand.length} cards)`;
  handArea.appendChild(handLabel);

  if (hand.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = 'var(--text-secondary)';
    emptyMsg.textContent = 'No cards in hand!';
    handArea.appendChild(emptyMsg);
    gameArea.appendChild(handArea);

    // Auto-pass: current player has no cards, pass to next
    setTimeout(() => {
      state = discardCards(state, []);
      render();
    }, 800);
    return;
  }

  const handCards = document.createElement('div');
  handCards.className = 'hand-cards';

  hand.forEach((card, idx) => {
    const isSelected = selectedIndices.has(idx);
    const el = renderCard(card, {
      selected: isSelected,
      onClick: () => {
        if (selectedIndices.has(idx)) {
          selectedIndices.delete(idx);
        } else {
          selectedIndices.add(idx);
        }
        render();
      }
    });
    handCards.appendChild(el);
  });

  handArea.appendChild(handCards);
  gameArea.appendChild(handArea);

  // Selected value preview
  const selectedValue = [...selectedIndices].reduce((sum, i) => {
    const c = hand[i];
    return sum + (c.rank === 1 ? 1 : c.rank);
  }, 0);

  const preview = document.createElement('div');
  preview.className = 'combo-error';
  if (selectedIndices.size > 0) {
    preview.style.color = selectedValue >= remaining ? 'var(--success)' : 'var(--text-secondary)';
    preview.textContent = `Selected value: ${selectedValue}${selectedValue >= remaining ? ' (enough!)' : ` (need ${remaining})`}`;
  }
  gameArea.appendChild(preview);

  // Action buttons
  const actionBar = document.createElement('div');
  actionBar.className = 'action-bar';

  const discardBtn = document.createElement('button');
  discardBtn.className = 'btn btn-danger';
  discardBtn.textContent = 'Confirm Discard';
  discardBtn.disabled = selectedIndices.size === 0 || selectedValue < remaining;
  discardBtn.addEventListener('click', () => {
    const indices = [...selectedIndices];
    state = discardCards(state, indices);
    selectedIndices.clear();
    render();
  });
  actionBar.appendChild(discardBtn);

  // Discard all button for convenience
  if (hand.length > 0) {
    const totalHandValue = hand.reduce((sum, c) => sum + (c.rank === 1 ? 1 : c.rank), 0);
    if (totalHandValue < remaining) {
      // Can't cover - must discard all and pass to next player
      const discardAllBtn = document.createElement('button');
      discardAllBtn.className = 'btn btn-danger';
      discardAllBtn.textContent = 'Discard All (Not Enough)';
      discardAllBtn.addEventListener('click', () => {
        const indices = hand.map((_, i) => i);
        state = discardCards(state, indices);
        selectedIndices.clear();
        render();
      });
      actionBar.appendChild(discardAllBtn);
    }
  }

  gameArea.appendChild(actionBar);
}

function renderPassDevice() {
  gameArea.innerHTML = '';

  const overlay = document.createElement('div');
  overlay.className = 'pass-overlay';

  const h2 = document.createElement('h2');
  h2.textContent = `Pass to Player ${state.currentPlayer + 1}`;
  overlay.appendChild(h2);

  const p = document.createElement('p');
  p.textContent = state.message || 'Tap "Ready" when the device has been passed.';
  p.style.maxWidth = '300px';
  p.style.textAlign = 'center';
  overlay.appendChild(p);

  const readyBtn = document.createElement('button');
  readyBtn.className = 'btn btn-primary';
  readyBtn.textContent = 'Ready';
  readyBtn.style.marginTop = '24px';
  readyBtn.addEventListener('click', () => {
    overlay.remove();
    state = acknowledgePassDevice(state);
    selectedIndices.clear();
    render();
  });
  overlay.appendChild(readyBtn);

  // Fixed overlay hides all game content
  document.body.appendChild(overlay);
}

function renderGameOver() {
  cleanupOverlays();
  gameArea.innerHTML = '';

  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';

  const box = document.createElement('div');
  box.className = 'game-over-box';

  const h2 = document.createElement('h2');
  h2.className = state.won ? 'win' : 'lose';
  h2.textContent = state.won ? 'Victory!' : 'Defeat';
  box.appendChild(h2);

  const p = document.createElement('p');
  p.textContent = state.won
    ? `All 12 enemies defeated! The kingdom is saved!`
    : `${state.message}`;
  box.appendChild(p);

  const stats = document.createElement('p');
  stats.textContent = `Enemies defeated: ${state.enemiesDefeated} / 12`;
  box.appendChild(stats);

  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'Play Again';
  btn.addEventListener('click', () => {
    // Remove any leftover overlays
    document.querySelectorAll('.pass-overlay').forEach(el => el.remove());
    renderSetup();
  });
  box.appendChild(btn);

  overlay.appendChild(box);
  gameArea.appendChild(overlay);
}

function getComboErrorMessage(cards) {
  if (cards.length === 1) return '';
  const ranks = cards.map(c => c.rank);
  const allSameRank = ranks.every(r => r === ranks[0]);

  if (!allSameRank) return 'All cards in a combo must be the same rank.';

  const rank = ranks[0];
  if (cards.length === 2 && (rank < 2 || rank > 5)) {
    return 'Pairs are only allowed for ranks 2-5.';
  }
  if (cards.length === 3 && (rank < 2 || rank > 3)) {
    return 'Triples are only allowed for ranks 2-3.';
  }
  if (cards.length === 4 && rank !== 2) {
    return 'Quads are only allowed for rank 2.';
  }
  if (cards.length > 4) {
    return 'Maximum 4 cards in a combo.';
  }
  return 'Invalid combo.';
}

function renderPlayerBar() {
  if (state.playerCount <= 1) return;

  const bar = document.createElement('div');
  bar.className = 'player-info-bar';

  for (let i = 0; i < state.playerCount; i++) {
    const badge = document.createElement('div');
    badge.className = 'player-badge' + (i === state.currentPlayer ? ' active' : '');
    badge.innerHTML = `
      Player ${i + 1}
      <span class="card-count">${state.hands[i].length} cards</span>
    `;
    bar.appendChild(badge);
  }

  gameArea.appendChild(bar);
}
