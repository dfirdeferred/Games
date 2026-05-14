export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const SUIT_SYMBOLS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
export const SUIT_COLORS = { hearts: 'red', diamonds: 'red', clubs: 'black', spades: 'black' };
export const RANK_NAMES = { 1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K' };

export function createCard(rank, suit) {
  return { rank, suit };
}

export function createStandardDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push(createCard(rank, suit));
    }
  }
  return deck;
}

export function shuffle(deck) {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

export function cardName(card) {
  if (card.isJester) return 'Jester';
  const rankStr = RANK_NAMES[card.rank] || card.rank;
  return `${rankStr}${SUIT_SYMBOLS[card.suit]}`;
}

export function cardLongName(card) {
  if (card.isJester) return 'Jester';
  const rankStr = RANK_NAMES[card.rank] || card.rank;
  const suitName = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
  return `${rankStr} of ${suitName}`;
}

export function isRed(card) {
  return card.suit === 'hearts' || card.suit === 'diamonds';
}

export function isBlack(card) {
  return card.suit === 'clubs' || card.suit === 'spades';
}
