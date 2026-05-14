import { createGame, playCard, skipRoom, canPlayCard, canSkipRoom, getCardType, getCardValue } from './game.js';
import { cardName, RANK_NAMES } from '../shared/cards.js';
import { renderCard, renderCardMini } from '../shared/card-ui.js';
import { showModal } from '../shared/modal.js';
import { RULES_HTML } from './rules.js';

const gameArea = document.getElementById('game-area');
let state = createGame();

// Wire up rules button
document.getElementById('rules-btn').addEventListener('click', () => {
  showModal('How to Play — Scoundrel', RULES_HTML);
});

render(state);

/* ── Render ──────────────────────────────────────────────── */

function render(s) {
  gameArea.innerHTML = '';

  // Status bar
  gameArea.appendChild(buildStatusBar(s));

  // Message
  const msg = document.createElement('div');
  msg.className = 'scoundrel-message';
  msg.textContent = s.message;
  gameArea.appendChild(msg);

  // Room cards
  gameArea.appendChild(buildRoomArea(s));

  // Room progress
  if (s.phase === 'room') {
    const progress = document.createElement('div');
    progress.className = 'room-progress';
    const mustPlayAll = s.deck.length === 0;
    const remaining = mustPlayAll ? s.room.length : 3 - s.cardsPlayedThisRoom;
    progress.innerHTML = `Cards to play: <span>${remaining}</span>`;
    gameArea.appendChild(progress);
  }

  // Actions
  gameArea.appendChild(buildActions(s));

  // Game over overlay
  if (s.phase === 'gameOver') {
    gameArea.appendChild(buildGameOver(s));
  }
}

/* ── Status bar ──────────────────────────────────────────── */

function buildStatusBar(s) {
  const bar = document.createElement('div');
  bar.className = 'status-bar';

  // HP section
  const hpSection = document.createElement('div');
  hpSection.className = 'hp-section';

  const hpLabel = document.createElement('label');
  hpLabel.textContent = 'HP';
  hpSection.appendChild(hpLabel);

  const hpPct = Math.max(0, s.hp / s.maxHp * 100);
  let hpColor = 'var(--hp-green)';
  if (hpPct <= 25) hpColor = 'var(--hp-red)';
  else if (hpPct <= 50) hpColor = 'var(--hp-yellow)';

  const hpContainer = document.createElement('div');
  hpContainer.className = 'hp-bar-container';
  hpContainer.innerHTML = `
    <div class="hp-bar-fill" style="width:${hpPct}%;background:${hpColor}"></div>
    <div class="hp-bar-text">${s.hp} / ${s.maxHp}</div>
  `;
  hpSection.appendChild(hpContainer);
  bar.appendChild(hpSection);

  // Weapon display
  const weaponDiv = document.createElement('div');
  weaponDiv.className = 'weapon-display';

  const wLabel = document.createElement('span');
  wLabel.className = 'weapon-label';
  wLabel.textContent = 'Weapon: ';
  weaponDiv.appendChild(wLabel);

  if (s.weapon) {
    const mini = renderCardMini(s.weapon.card);
    weaponDiv.appendChild(mini);

    const info = document.createElement('span');
    info.className = 'weapon-info';
    info.textContent = ` (${s.weapon.value})`;
    weaponDiv.appendChild(info);

    const binding = document.createElement('span');
    binding.className = 'weapon-binding';
    if (s.weapon.lastDefeatedRank === Infinity) {
      binding.textContent = ' | Max target: Any';
    } else {
      const rankName = RANK_NAMES[s.weapon.lastDefeatedRank] || s.weapon.lastDefeatedRank;
      binding.textContent = ` | Max target: ${rankName}`;
    }
    weaponDiv.appendChild(binding);
  } else {
    const none = document.createElement('span');
    none.className = 'weapon-none';
    none.textContent = 'None';
    weaponDiv.appendChild(none);
  }
  bar.appendChild(weaponDiv);

  // Deck count
  const deckDiv = document.createElement('div');
  deckDiv.className = 'deck-count';
  deckDiv.innerHTML = `Deck: <span>${s.deck.length}</span>`;
  bar.appendChild(deckDiv);

  return bar;
}

/* ── Room area ───────────────────────────────────────────── */

function buildRoomArea(s) {
  const area = document.createElement('div');
  area.className = 'room-area';

  const label = document.createElement('div');
  label.className = 'room-label';
  label.textContent = s.phase === 'room' ? 'Current Room' : 'Game Over';
  area.appendChild(label);

  const row = document.createElement('div');
  row.className = 'room-cards';

  s.room.forEach((card, idx) => {
    const playable = canPlayCard(s, idx);
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.marginBottom = '24px';

    const el = renderCard(card, {
      disabled: !playable,
      onClick: playable ? () => {
        state = playCard(state, idx);
        render(state);
      } : undefined,
    });
    wrapper.appendChild(el);

    // Type tag under card
    const type = getCardType(card);
    const tag = document.createElement('div');
    tag.className = `card-type-tag ${type}`;
    const value = getCardValue(card);
    if (type === 'monster') {
      tag.textContent = `Monster (${value})`;
    } else if (type === 'weapon') {
      tag.textContent = `Weapon (${value})`;
    } else {
      tag.textContent = `Potion (+${value})`;
    }
    wrapper.appendChild(tag);

    row.appendChild(wrapper);
  });

  area.appendChild(row);
  return area;
}

/* ── Actions ─────────────────────────────────────────────── */

function buildActions(s) {
  const area = document.createElement('div');
  area.className = 'actions-area';

  if (s.phase === 'room') {
    const skipBtn = document.createElement('button');
    skipBtn.className = 'btn';
    skipBtn.textContent = 'Skip Room';
    const canSkip = canSkipRoom(s);
    skipBtn.disabled = !canSkip;
    if (canSkip) {
      skipBtn.addEventListener('click', () => {
        state = skipRoom(state);
        render(state);
      });
    }
    area.appendChild(skipBtn);
  }

  return area;
}

/* ── Game Over ───────────────────────────────────────────── */

function buildGameOver(s) {
  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';

  const box = document.createElement('div');
  box.className = 'game-over-box';

  const heading = document.createElement('h2');
  heading.className = s.won ? 'win' : 'lose';
  heading.textContent = s.won ? 'Victory!' : 'Defeated';
  box.appendChild(heading);

  const detail = document.createElement('p');
  if (s.won) {
    detail.textContent = `You escaped the dungeon with ${s.score} HP remaining!`;
  } else {
    detail.textContent = 'You perished in the dungeon.';
  }
  box.appendChild(detail);

  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'Play Again';
  btn.addEventListener('click', () => {
    state = createGame();
    render(state);
  });
  box.appendChild(btn);

  overlay.appendChild(box);
  return overlay;
}
