// Aardwolf MUD - Game Logic
import { createGameState, getAvailableActions, processAction } from '../shared-mud/engine.js';
import { createCharacter } from '../shared-mud/character.js';
import { getExplorationPercent } from '../shared-mud/dungeon.js';
import { CLASSES, ABILITY_DEFS, LOOT_TABLES, EXPLORATION_RANKS, createTemplateProvider } from './data.js';

const GAME_ID = 'aardwolf';
const TOTAL_FLOORS = 4;

export function createAardwolfGame(characterName, classId, playerCount = 1, playerAssignments = null) {
  const classDef = CLASSES[classId];
  if (!classDef) throw new Error(`Unknown class: ${classId}`);

  const characters = [];
  const assignments = [];

  if (playerCount <= 1) {
    characters.push(createCharacter(characterName || 'Adventurer', classDef));
    assignments.push(0);
  } else {
    for (let i = 0; i < playerCount; i++) {
      const name = i === 0 ? (characterName || 'Player 1') : `Player ${i + 1}`;
      characters.push(createCharacter(name, classDef));
      assignments.push(i);
    }
  }

  const templateProvider = createTemplateProvider();

  const state = createGameState({
    gameId: GAME_ID,
    seed: Date.now(),
    totalFloors: TOTAL_FLOORS,
    characters,
    playerAssignments: assignments,
    templateProvider,
    abilityDefs: ABILITY_DEFS,
    lootTables: LOOT_TABLES,
    classDefs: CLASSES,
  });

  // Add initial room description messages
  const room = state.dungeon.floors[0].rooms[state.dungeon.currentRoom];
  state.messages.push(
    { text: `Welcome to the dungeon, ${characters[0].name}!`, type: 'system', turn: 0 },
    { text: `--- ${room.title} ---`, type: 'room-title', turn: 0 },
    { text: room.description, type: 'room-desc', turn: 0 },
    { text: `Exits: ${Object.keys(room.exits).join(', ')}`, type: 'exits', turn: 0 },
  );

  return state;
}

export function getExplorationRank(state) {
  const pct = getExplorationPercent(state.dungeon);
  let rank = EXPLORATION_RANKS[0];
  for (const r of EXPLORATION_RANKS) {
    if (pct >= r.minPercent) rank = r;
  }
  return { ...rank, percent: pct };
}

export function processAardwolfAction(state, action) {
  const templateProvider = createTemplateProvider();
  const newState = processAction(state, action, templateProvider);
  return newState;
}

export function getAardwolfActions(state) {
  return getAvailableActions(state);
}

export { GAME_ID };
