export function createParty(characters, playerAssignments = null) {
  // playerAssignments: array mapping charIndex -> playerIndex
  // null means solo (one player controls all)
  const playerCount = playerAssignments
    ? Math.max(...playerAssignments) + 1
    : 1;

  return {
    characters,
    playerAssignments: playerAssignments || characters.map(() => 0),
    playerCount,
    activeCharIndex: 0,
    activePlayerIndex: 0,
  };
}

export function getActiveCharacter(partyState) {
  return partyState.characters[partyState.activeCharIndex];
}

export function getActivePlayer(partyState) {
  return partyState.activePlayerIndex;
}

export function getPlayerForChar(partyState, charIndex) {
  return partyState.playerAssignments[charIndex];
}

export function needsPassDevice(partyState, previousPlayerIndex) {
  return partyState.playerCount > 1 &&
    partyState.activePlayerIndex !== previousPlayerIndex;
}

export function advanceActiveCharacter(partyState) {
  const next = (partyState.activeCharIndex + 1) % partyState.characters.length;
  return {
    ...partyState,
    activeCharIndex: next,
    activePlayerIndex: partyState.playerAssignments[next],
  };
}

export function updateCharacterInParty(partyState, charIndex, updatedChar) {
  const characters = [...partyState.characters];
  characters[charIndex] = updatedChar;
  return { ...partyState, characters };
}

export function getAliveCharacters(partyState) {
  return partyState.characters.filter(c => c.hp > 0);
}

export function isPartyAlive(partyState) {
  return partyState.characters.some(c => c.hp > 0);
}
