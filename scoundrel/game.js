import { createStandardDeck, shuffle } from '../shared/cards.js';

/**
 * Scoundrel - Solo dungeon-crawl card game engine.
 * Pure state machine: every function returns a new state object.
 */

/* ── helpers ─────────────────────────────────────────────── */

function buildScoundrelDeck() {
  const full = createStandardDeck();
  // Remove red face cards (J/Q/K of hearts & diamonds) and red aces (A of hearts & diamonds)
  // In shared/cards.js: rank 1 = A, 11 = J, 12 = Q, 13 = K
  const filtered = full.filter(c => {
    const isRedSuit = c.suit === 'hearts' || c.suit === 'diamonds';
    if (!isRedSuit) return true;
    // Remove red aces and red face cards
    if (c.rank === 1 || c.rank === 11 || c.rank === 12 || c.rank === 13) return false;
    return true;
  });
  return shuffle(filtered); // 44 cards
}

export function getCardType(card) {
  if (card.suit === 'clubs' || card.suit === 'spades') return 'monster';
  if (card.suit === 'diamonds') return 'weapon';
  return 'potion'; // hearts
}

export function getCardValue(card) {
  // 2-10 = face value, J=11, Q=12, K=13, A=14
  if (card.rank === 1) return 14; // Ace
  return card.rank; // 2-13 already correct
}

function clone(state) {
  return {
    ...state,
    deck: [...state.deck],
    room: state.room.map(c => ({ ...c })),
    discard: [...state.discard],
    weapon: state.weapon ? { ...state.weapon, card: { ...state.weapon.card } } : null,
  };
}

/* ── public API ──────────────────────────────────────────── */

export function createGame() {
  const deck = buildScoundrelDeck();
  const room = deck.splice(0, 4);
  return {
    phase: 'room',
    deck,
    room,
    discard: [],
    hp: 20,
    maxHp: 20,
    weapon: null,
    cardsPlayedThisRoom: 0,
    healUsedThisRoom: false,
    lastRoomSkipped: false,
    score: 0,
    message: 'A new dungeon awaits. Choose a card to play.',
    won: false,
  };
}

export function canPlayCard(state, roomIndex) {
  if (state.phase !== 'room') return false;
  if (roomIndex < 0 || roomIndex >= state.room.length) return false;
  // Normal room: play 3 of 4, leave 1 for next room
  // End-game (deck empty): must play all remaining cards
  const mustPlayAll = state.deck.length === 0;
  if (!mustPlayAll && state.cardsPlayedThisRoom >= 3) return false;
  return true;
}

export function canSkipRoom(state) {
  if (state.phase !== 'room') return false;
  if (state.lastRoomSkipped) return false;
  if (state.cardsPlayedThisRoom > 0) return false;
  // Must have room of exactly 4 cards
  if (state.room.length !== 4) return false;
  return true;
}

export function playCard(state, roomIndex) {
  if (!canPlayCard(state, roomIndex)) return state;

  const s = clone(state);
  const card = s.room.splice(roomIndex, 1)[0];
  const type = getCardType(card);
  const value = getCardValue(card);

  if (type === 'monster') {
    playMonster(s, card, value);
  } else if (type === 'weapon') {
    playWeapon(s, card, value);
  } else {
    playPotion(s, card, value);
  }

  s.discard.push(card);
  s.cardsPlayedThisRoom++;

  // Check death
  if (s.hp <= 0) {
    s.hp = 0;
    s.phase = 'gameOver';
    s.won = false;
    s.score = 0;
    s.message = 'You have been slain in the dungeon.';
    return s;
  }

  // Determine if room is complete:
  // - Normal room (started with 4 cards): play 3, leave 1
  // - End-game room (deck was empty, started with <4): play all
  const deckWasEmpty = s.deck.length === 0;
  const roomDone = s.cardsPlayedThisRoom >= 3 || (deckWasEmpty && s.room.length === 0);

  if (roomDone) {
    startNextRoom(s);
  }

  return s;
}

function playMonster(s, card, monsterValue) {
  const monsterRank = card.rank; // raw rank for comparison

  if (s.weapon) {
    if (s.weapon.lastDefeatedRank >= monsterRank) {
      // Can use weapon
      const damage = Math.max(0, monsterValue - s.weapon.value);
      s.hp -= damage;
      s.weapon.lastDefeatedRank = monsterRank;
      if (damage > 0) {
        s.message = `Fought monster with weapon, took ${damage} damage.`;
      } else {
        s.message = `Defeated the monster with your weapon! No damage taken.`;
      }
    } else {
      // Weapon can't fight this monster — lose weapon, take full damage
      s.message = `Weapon too weak for this monster! Lost weapon, took ${monsterValue} damage.`;
      s.weapon = null;
      s.hp -= monsterValue;
    }
  } else {
    // No weapon — take full damage
    s.hp -= monsterValue;
    s.message = `No weapon! Took ${monsterValue} damage bare-handed.`;
  }
}

function playWeapon(s, card, value) {
  if (s.weapon) {
    s.message = `Equipped new weapon (strength ${value}), discarded old weapon.`;
  } else {
    s.message = `Equipped weapon with strength ${value}.`;
  }
  s.weapon = { card: { ...card }, value, lastDefeatedRank: Infinity };
}

function playPotion(s, card, value) {
  if (s.healUsedThisRoom) {
    s.message = `Already used a potion this room. Card wasted.`;
  } else {
    const before = s.hp;
    s.hp = Math.min(s.maxHp, s.hp + value);
    const healed = s.hp - before;
    s.healUsedThisRoom = true;
    if (healed > 0) {
      s.message = `Healed ${healed} HP! (${s.hp}/${s.maxHp})`;
    } else {
      s.message = `Already at full health. Potion wasted.`;
    }
  }
}

function startNextRoom(s) {
  // The 1 remaining card stays; deal 3 from deck
  s.lastRoomSkipped = false;
  s.cardsPlayedThisRoom = 0;
  s.healUsedThisRoom = false;

  if (s.deck.length === 0 && s.room.length === 0) {
    // Win! All cards resolved
    s.phase = 'gameOver';
    s.won = true;
    s.score = s.hp;
    s.message = `You escaped the dungeon! Score: ${s.hp} HP.`;
    return;
  }

  const toDeal = Math.min(3, s.deck.length);
  for (let i = 0; i < toDeal; i++) {
    s.room.push(s.deck.shift());
  }

  // If room has cards, continue playing
  if (s.room.length === 0) {
    s.phase = 'gameOver';
    s.won = true;
    s.score = s.hp;
    s.message = `You escaped the dungeon! Score: ${s.hp} HP.`;
  } else if (s.room.length < 4) {
    // Fewer than 4 cards — must play all remaining
    s.message = `Final stretch! ${s.room.length} cards remain.`;
  } else {
    s.message = `New room entered. Choose wisely.`;
  }
}

export function skipRoom(state) {
  if (!canSkipRoom(state)) return state;

  const s = clone(state);
  // All 4 room cards go to bottom of deck
  while (s.room.length > 0) {
    s.deck.push(s.room.shift());
  }
  s.lastRoomSkipped = true;
  s.healUsedThisRoom = false;
  s.cardsPlayedThisRoom = 0;

  // Deal new 4
  const toDeal = Math.min(4, s.deck.length);
  for (let i = 0; i < toDeal; i++) {
    s.room.push(s.deck.shift());
  }

  s.message = 'Skipped the room. Cannot skip again next room.';
  return s;
}
