import { createCard, shuffle, SUIT_SYMBOLS } from '../shared/cards.js';

// === Enemy Stats ===
export function getEnemyStats(rank) {
  if (rank === 11) return { hp: 20, attack: 10 };
  if (rank === 12) return { hp: 30, attack: 15 };
  if (rank === 13) return { hp: 40, attack: 20 };
  return { hp: 0, attack: 0 };
}

// === Card attack value (A=1, 2-10 face value) ===
function cardValue(card) {
  if (card.rank === 1) return 1;
  if (card.rank >= 2 && card.rank <= 10) return card.rank;
  return 0; // J/Q/K have no play value (they are enemies)
}

export function getAttackValue(cards) {
  return cards.reduce((sum, c) => sum + cardValue(c), 0);
}

// === Combo validation ===
export function canPlayCombo(cards) {
  if (!cards || cards.length === 0) return false;
  if (cards.length === 1) return true;

  // All cards must share the same rank
  const rank = cards[0].rank;
  if (!cards.every(c => c.rank === rank)) return false;

  if (cards.length === 2) return rank >= 2 && rank <= 5;
  if (cards.length === 3) return rank >= 2 && rank <= 3;
  if (cards.length === 4) return rank === 2;
  return false;
}

// === Hand size by player count ===
function maxHandSize(playerCount) {
  return [8, 7, 6, 5][playerCount - 1] || 5;
}

// === Build castle deck ===
function buildCastleDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const jacks = shuffle(suits.map(s => createCard(11, s)));
  const queens = shuffle(suits.map(s => createCard(12, s)));
  const kings = shuffle(suits.map(s => createCard(13, s)));
  // Jacks on top (drawn first), queens middle, kings bottom
  return [...jacks, ...queens, ...kings];
}

// === Build tavern deck (A-10 of all suits) ===
function buildTavernDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const deck = [];
  for (const suit of suits) {
    for (let rank = 1; rank <= 10; rank++) {
      deck.push(createCard(rank, suit));
    }
  }
  return shuffle(deck);
}

// === Flip next enemy from castle deck ===
function flipEnemy(state) {
  if (state.castleDeck.length === 0) return state;
  const card = state.castleDeck[0];
  const stats = getEnemyStats(card.rank);
  return {
    ...state,
    castleDeck: state.castleDeck.slice(1),
    currentEnemy: {
      card,
      maxHp: stats.hp,
      hp: stats.hp,
      baseAttack: stats.attack,
      attack: stats.attack,
      spadesReduction: 0
    },
    firstPlayAgainstEnemy: true,
    playedCards: [],
    totalDamageToEnemy: 0
  };
}

// === Create initial game state ===
export function createGame(playerCount) {
  playerCount = Math.max(1, Math.min(4, playerCount));
  const handSize = maxHandSize(playerCount);
  let tavern = buildTavernDeck();
  const castle = buildCastleDeck();

  const hands = [];
  for (let i = 0; i < playerCount; i++) {
    hands.push(tavern.slice(0, handSize));
    tavern = tavern.slice(handSize);
  }

  let state = {
    phase: 'play',
    playerCount,
    currentPlayer: 0,
    hands,
    castleDeck: castle,
    tavernDeck: tavern,
    discardPile: [],
    currentEnemy: null,
    playedCards: [],
    totalDamageToEnemy: 0,
    jesterCount: playerCount === 1 ? 2 : 0,
    firstPlayAgainstEnemy: true,
    discardTarget: 0,
    discardedSoFar: 0,
    enemiesDefeated: 0,
    message: '',
    won: false,
    maxHandSize: handSize
  };

  state = flipEnemy(state);
  state.message = enemyRevealMessage(state.currentEnemy);
  return state;
}

function enemyRevealMessage(enemy) {
  if (!enemy) return '';
  const rankName = { 11: 'Jack', 12: 'Queen', 13: 'King' }[enemy.card.rank];
  const sym = SUIT_SYMBOLS[enemy.card.suit];
  return `A ${rankName} of ${enemy.card.suit} ${sym} appears! (${enemy.hp} HP, ${enemy.attack} ATK)`;
}

// === Next player index ===
function nextPlayer(state) {
  return (state.currentPlayer + 1) % state.playerCount;
}

// === Apply suit powers ===
function applySuitPowers(state, cards, totalAttack) {
  const enemySuit = state.currentEnemy.card.suit;
  let newState = { ...state };
  let clubsActive = false;

  // Gather suit contributions
  const suitValues = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
  for (const c of cards) {
    suitValues[c.suit] += cardValue(c);
  }

  // Check each suit power (blocked if matches enemy suit)
  // Spades: reduce enemy attack
  if (suitValues.spades > 0 && enemySuit !== 'spades') {
    const reduction = suitValues.spades;
    const enemy = { ...newState.currentEnemy };
    enemy.spadesReduction += reduction;
    enemy.attack = Math.max(0, enemy.baseAttack - enemy.spadesReduction);
    newState.currentEnemy = enemy;
  }

  // Hearts: recycle from discard to tavern bottom
  if (suitValues.hearts > 0 && enemySuit !== 'hearts') {
    const n = Math.min(suitValues.hearts, newState.discardPile.length);
    if (n > 0) {
      const shuffledDiscard = shuffle(newState.discardPile);
      const toRecycle = shuffledDiscard.slice(0, n);
      const remaining = shuffledDiscard.slice(n);
      newState.discardPile = remaining;
      newState.tavernDeck = [...newState.tavernDeck, ...toRecycle];
    }
  }

  // Diamonds: draw cards distributed among players
  if (suitValues.diamonds > 0 && enemySuit !== 'diamonds') {
    let n = suitValues.diamonds;
    let hands = newState.hands.map(h => [...h]);
    let tavern = [...newState.tavernDeck];
    let player = newState.currentPlayer;
    let drawn = 0;
    while (drawn < n && tavern.length > 0) {
      if (hands[player].length < newState.maxHandSize) {
        hands[player].push(tavern.shift());
        drawn++;
      }
      // Move to next player regardless (skip if at max)
      let next = (player + 1) % newState.playerCount;
      // Check if all players at max
      let allMax = hands.every(h => h.length >= newState.maxHandSize);
      if (allMax) break;
      // Find next player who can receive
      let checked = 0;
      while (hands[next].length >= newState.maxHandSize && checked < newState.playerCount) {
        next = (next + 1) % newState.playerCount;
        checked++;
      }
      player = next;
    }
    newState.hands = hands;
    newState.tavernDeck = tavern;
  }

  // Clubs: double damage
  if (suitValues.clubs > 0 && enemySuit !== 'clubs') {
    clubsActive = true;
  }

  return { state: newState, clubsActive };
}

// === Deal damage to enemy and check defeat ===
function damageEnemy(state, damage) {
  const enemy = { ...state.currentEnemy };
  enemy.hp -= damage;
  let newState = { ...state, currentEnemy: enemy };

  if (enemy.hp <= 0) {
    // Enemy defeated
    const defeatedCard = enemy.card;
    newState.enemiesDefeated++;

    if (enemy.hp === 0) {
      // Exactly 0: card goes to bottom of tavern
      newState.tavernDeck = [...newState.tavernDeck, defeatedCard];
    } else {
      // Below 0: card goes to discard
      newState.discardPile = [...newState.discardPile, defeatedCard];
    }

    if (newState.castleDeck.length === 0) {
      // All enemies defeated - WIN!
      return {
        ...newState,
        currentEnemy: null,
        phase: 'gameOver',
        won: true,
        message: 'Victory! All enemies have been defeated!'
      };
    }

    // Flip next enemy
    newState = flipEnemy(newState);
    const msg = `Enemy defeated! ${enemyRevealMessage(newState.currentEnemy)}`;
    newState.message = msg;

    // Advance to next player
    if (newState.playerCount > 1) {
      newState.currentPlayer = nextPlayer(newState);
      newState.phase = 'passDevice';
    } else {
      newState.phase = 'play';
    }

    return newState;
  }

  return newState;
}

// === Enemy counterattack ===
function enemyCounterattack(state) {
  const enemyAtk = state.currentEnemy.attack;
  if (enemyAtk <= 0) {
    // No damage, advance turn
    return advanceTurn(state);
  }

  // Enter discard phase
  return {
    ...state,
    phase: 'discard',
    discardTarget: enemyAtk,
    discardedSoFar: 0,
    message: `Enemy attacks for ${enemyAtk} damage! Discard cards totaling at least ${enemyAtk}.`
  };
}

// === Advance turn to next player ===
function advanceTurn(state) {
  if (state.playerCount === 1) {
    return { ...state, phase: 'play', message: 'Your turn. Play cards or yield.' };
  }
  const np = nextPlayer(state);
  return {
    ...state,
    currentPlayer: np,
    phase: 'passDevice',
    message: `Pass device to Player ${np + 1}.`
  };
}

// === Play cards from hand ===
export function playCards(state, cardIndices) {
  if (state.phase !== 'play') return state;

  const hand = state.hands[state.currentPlayer];
  const indices = [...cardIndices].sort((a, b) => b - a); // sort descending for removal
  const cards = cardIndices.map(i => hand[i]);

  if (!canPlayCombo(cards)) {
    return { ...state, message: 'Invalid combo selection.' };
  }

  const attackValue = getAttackValue(cards);

  // Remove cards from hand
  const newHand = [...hand];
  for (const i of indices) {
    newHand.splice(i, 1);
  }

  // Cards go to discard
  let newState = {
    ...state,
    hands: state.hands.map((h, idx) => idx === state.currentPlayer ? newHand : h),
    playedCards: cards,
    discardPile: [...state.discardPile, ...cards],
    firstPlayAgainstEnemy: false
  };

  // Apply suit powers
  const { state: afterPowers, clubsActive } = applySuitPowers(newState, cards, attackValue);
  newState = afterPowers;

  // Calculate total damage
  const totalDamage = clubsActive ? attackValue * 2 : attackValue;

  // Build message
  const cardNames = cards.map(c => {
    const rankStr = c.rank === 1 ? 'A' : c.rank.toString();
    return `${rankStr}${SUIT_SYMBOLS[c.suit]}`;
  }).join(' + ');
  let msg = `Played ${cardNames} for ${totalDamage} damage${clubsActive ? ' (doubled by clubs!)' : ''}.`;

  newState.message = msg;

  // Deal damage
  newState = damageEnemy(newState, totalDamage);

  // If enemy survived, counterattack
  if (newState.currentEnemy && newState.currentEnemy.hp > 0 && newState.phase !== 'gameOver') {
    newState = enemyCounterattack(newState);
  }

  return newState;
}

// === Play Jester (solo only) ===
export function playJester(state) {
  if (state.phase !== 'play') return state;
  if (state.playerCount !== 1) return state;
  if (state.jesterCount <= 0) return state;

  // Discard entire hand
  const discarded = [...state.hands[0]];

  // Draw 8 new cards
  let tavern = [...state.tavernDeck];
  const newHand = tavern.splice(0, Math.min(8, tavern.length));

  let newState = {
    ...state,
    hands: [newHand],
    tavernDeck: tavern,
    discardPile: [...state.discardPile, ...discarded],
    jesterCount: state.jesterCount - 1,
    message: 'Jester played! Hand discarded and redrawn. No damage dealt.'
  };

  // Jester counts as a play (no longer firstPlayAgainstEnemy)
  newState.firstPlayAgainstEnemy = false;

  // No damage, no suit power. Go to enemy counterattack.
  newState = enemyCounterattack(newState);

  return newState;
}

// === Yield (skip to enemy attack) ===
export function yieldTurn(state) {
  if (state.phase !== 'play') return state;
  if (state.firstPlayAgainstEnemy) {
    return { ...state, message: 'Cannot yield - someone must play at least one card against this enemy first.' };
  }

  let newState = { ...state, playedCards: [], message: 'Yielded turn.' };
  newState = enemyCounterattack(newState);
  return newState;
}

// === Discard cards to cover enemy damage ===
export function discardCards(state, cardIndices) {
  if (state.phase !== 'discard') return state;

  const hand = state.hands[state.currentPlayer];
  const indices = [...cardIndices].sort((a, b) => b - a);
  const cards = cardIndices.map(i => hand[i]);
  const totalValue = cards.reduce((sum, c) => sum + cardValue(c), 0);

  // Remove from hand
  const newHand = [...hand];
  for (const i of indices) {
    newHand.splice(i, 1);
  }

  const newDiscardedSoFar = state.discardedSoFar + totalValue;
  const remaining = state.discardTarget - newDiscardedSoFar;

  let newState = {
    ...state,
    hands: state.hands.map((h, idx) => idx === state.currentPlayer ? newHand : h),
    discardPile: [...state.discardPile, ...cards],
    discardedSoFar: newDiscardedSoFar
  };

  if (remaining <= 0) {
    // Damage fully covered, advance turn
    return advanceTurn(newState);
  }

  // Check if current player has cards left
  if (newHand.length === 0) {
    // Pass remainder to next player
    const np = nextPlayer(newState);
    if (np === state.currentPlayer) {
      // Solo mode or wrapped around - can't cover
      // Check if any player has cards
      const anyCards = newState.hands.some(h => h.length > 0);
      if (!anyCards) {
        return {
          ...newState,
          phase: 'gameOver',
          won: false,
          message: 'Game Over! Unable to cover enemy damage.'
        };
      }
    }

    // Find next player with cards
    let checkPlayer = np;
    let checked = 0;
    while (newState.hands[checkPlayer].length === 0 && checked < newState.playerCount) {
      checkPlayer = (checkPlayer + 1) % newState.playerCount;
      checked++;
    }

    if (checked >= newState.playerCount || newState.hands[checkPlayer].length === 0) {
      return {
        ...newState,
        phase: 'gameOver',
        won: false,
        message: 'Game Over! Unable to cover enemy damage.'
      };
    }

    newState.currentPlayer = checkPlayer;
    newState.message = `${remaining} damage remaining. Player ${checkPlayer + 1} must discard.`;

    if (newState.playerCount > 1) {
      newState.phase = 'passDevice';
      newState._resumePhase = 'discard';
    }

    return newState;
  }

  newState.message = `${newDiscardedSoFar} / ${state.discardTarget} damage covered. Discard more cards.`;
  return newState;
}

// === Acknowledge pass device screen ===
export function acknowledgePassDevice(state) {
  if (state.phase !== 'passDevice') return state;

  // If we were in the middle of a discard chain
  if (state._resumePhase === 'discard') {
    const remaining = state.discardTarget - state.discardedSoFar;
    const newState = { ...state };
    delete newState._resumePhase;
    newState.phase = 'discard';
    newState.message = `${remaining} damage remaining. Discard cards totaling at least ${remaining}.`;
    return newState;
  }

  return { ...state, phase: 'play', message: 'Your turn. Play cards or yield.' };
}
