import { createGameState, getAvailableActions, processAction } from '../shared-mud/engine.js';
import { createCharacter, addToInventory, removeFromInventory } from '../shared-mud/character.js';
import { updateCharacterInParty, getActiveCharacter } from '../shared-mud/party.js';
import { getCurrentRoom } from '../shared-mud/dungeon.js';
import { GUILDS, RACES, ABILITY_DEFS, LOOT_TABLES, CRAFTING_RECIPES, createTemplateProvider } from './data.js';

/**
 * Create an Icesus game state.
 * @param {Array} partyConfig - [{name, guildId, raceId}]
 * @param {number} playerCount - 1-4 hot-seat players
 */
export function createIcesusGame(partyConfig, playerCount = 1) {
  const templateProvider = createTemplateProvider();

  // Build characters
  const characters = partyConfig.map(cfg => {
    const guild = GUILDS[cfg.guildId];
    const race = RACES.find(r => r.id === cfg.raceId) || RACES[0];
    const char = createCharacter(cfg.name, guild, race);
    char.row = guild.row;
    return char;
  });

  // Assign players in round-robin for hot-seat
  const playerAssignments = characters.map((_, i) => i % playerCount);

  // Build classDefs lookup
  const classDefs = {};
  for (const [k, v] of Object.entries(GUILDS)) {
    classDefs[k] = v;
  }

  const state = createGameState({
    gameId: 'icesus',
    totalFloors: 5,
    characters,
    playerAssignments,
    templateProvider,
    abilityDefs: ABILITY_DEFS,
    lootTables: LOOT_TABLES,
    classDefs,
  });

  // Add initial room description
  const room = getCurrentRoom(state.dungeon);
  state.messages = [
    { text: '=== Welcome to the Frozen Depths of Icesus ===', type: 'system', turn: 0 },
    { text: `Your party of ${characters.length} braves the icy caverns...`, type: 'system', turn: 0 },
    { text: `--- ${room.title} ---`, type: 'room-title', turn: 0 },
    { text: room.description, type: 'room-desc', turn: 0 },
    { text: `Exits: ${Object.keys(room.exits).join(', ')}`, type: 'exits', turn: 0 },
  ];

  return state;
}

/**
 * Check if a character has the materials for a recipe.
 */
export function canCraft(character, recipe) {
  if (character.classId !== 'crafter') return false;
  for (const req of recipe.materials) {
    const count = character.inventory.filter(
      item => item.type === 'material' && item.templateId === req.templateId
    ).length;
    if (count < req.count) return false;
  }
  return true;
}

/**
 * Perform crafting: consume materials, produce item.
 */
export function performCraft(state, recipeIndex) {
  const recipe = CRAFTING_RECIPES[recipeIndex];
  if (!recipe) return state;

  const charIdx = state.party.activeCharIndex;
  let char = { ...getActiveCharacter(state.party), inventory: [...getActiveCharacter(state.party).inventory] };

  if (!canCraft(char, recipe)) return state;

  // Remove materials
  for (const req of recipe.materials) {
    let removed = 0;
    while (removed < req.count) {
      const idx = char.inventory.findIndex(
        item => item.type === 'material' && item.templateId === req.templateId
      );
      if (idx === -1) break;
      char.inventory.splice(idx, 1);
      removed++;
    }
  }

  // Add result item
  const resultItem = {
    ...recipe.result,
    id: recipe.result.id + '_crafted_' + Date.now(),
    templateId: recipe.result.id,
    rarity: 'uncommon',
  };

  if (char.inventory.length < char.maxInventory) {
    char.inventory.push(resultItem);
  }

  let s = { ...state };
  s.party = updateCharacterInParty(s.party, charIdx, char);
  s.messages = [
    ...s.messages.slice(-50),
    { text: `${char.name} crafts: ${resultItem.name}!`, type: 'loot', turn: s.turnCount },
  ];

  return s;
}

/**
 * Get available actions, adding crafting when applicable.
 */
export function getIcesusActions(state) {
  const actions = getAvailableActions(state);
  const room = getCurrentRoom(state.dungeon);
  const activeChar = getActiveCharacter(state.party);

  // Add crafting at safe rooms for crafters
  if (state.phase === 'explore' && room.type === 'safe' && activeChar.classId === 'crafter') {
    CRAFTING_RECIPES.forEach((recipe, i) => {
      const craftable = canCraft(activeChar, recipe);
      const matList = recipe.materials.map(m => {
        const tpl = LOOT_TABLES.find(l => l.id === m.templateId);
        return `${m.count}x ${tpl ? tpl.name : m.templateId}`;
      }).join(', ');
      actions.push({
        label: `Craft ${recipe.name} (${matList})`,
        action: { type: 'craft', recipeIndex: i },
        disabled: !craftable,
        category: 'craft',
      });
    });
  }

  return actions;
}

/**
 * Process an action, handling crafting and delegating the rest.
 */
export function processIcesusAction(state, action) {
  if (action.type === 'craft') {
    return performCraft(state, action.recipeIndex);
  }

  // Re-attach template provider for dungeon generation on descend
  const templateProvider = createTemplateProvider();
  return processAction(state, action, templateProvider);
}
