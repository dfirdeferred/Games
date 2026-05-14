import { SUIT_SYMBOLS, SUIT_COLORS, RANK_NAMES } from './cards.js';

export function renderCard(card, options = {}) {
  const el = document.createElement('div');

  if (options.faceDown) {
    el.className = 'card card-back';
    if (options.onClick) el.addEventListener('click', options.onClick);
    return el;
  }

  if (card.isJester) {
    el.className = 'card card-jester';
    if (options.selected) el.classList.add('selected');
    if (options.disabled) el.classList.add('disabled');
    el.innerHTML = `
      <div class="rank-top">★</div>
      <div class="suit-center">🃏</div>
      <div class="rank-bottom">★</div>
    `;
    if (options.onClick && !options.disabled) el.addEventListener('click', options.onClick);
    return el;
  }

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const rankStr = RANK_NAMES[card.rank] || card.rank;

  el.className = `card ${color}`;
  if (options.selected) el.classList.add('selected');
  if (options.disabled) el.classList.add('disabled');
  if (options.highlighted) el.classList.add('highlighted');
  if (options.className) el.classList.add(options.className);

  el.innerHTML = `
    <div class="rank-top">${rankStr}<br>${symbol}</div>
    <div class="suit-center">${symbol}</div>
    <div class="rank-bottom">${rankStr}<br>${symbol}</div>
  `;

  if (options.onClick && !options.disabled) {
    el.addEventListener('click', options.onClick);
    el.style.cursor = 'pointer';
  }

  return el;
}

export function renderCardMini(card) {
  const el = document.createElement('span');
  if (card.isJester) {
    el.className = 'card-mini';
    el.textContent = '🃏';
    return el;
  }
  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const rankStr = RANK_NAMES[card.rank] || card.rank;
  el.className = `card-mini ${color}`;
  el.textContent = `${rankStr}${symbol}`;
  return el;
}
