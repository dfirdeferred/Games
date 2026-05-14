// GemStone IV - Game Logic
// Wraps the shared MUD engine with GemStone-specific mechanics:
// spell preparation, skill-use tracking, quest progression, item examination

import { createGameState, getAvailableActions, processAction } from '../shared-mud/engine.js';
import { createCharacter, improveSkill, recalcDerived } from '../shared-mud/character.js';
import { getActiveCharacter, updateCharacterInParty } from '../shared-mud/party.js';
import { getCurrentRoom } from '../shared-mud/dungeon.js';
import { PROFESSIONS, ABILITY_DEFS, SKILL_DEFS, LOOT_TABLES, QUESTS, createTemplateProvider } from './data.js';

// ============================================================
// Create a new GemStone game
// ============================================================
export function createGemstoneGame(characterName, professionId, playerCount = 1, playerAssignments = null) {
  const profession = PROFESSIONS[professionId];
  if (!profession) throw new Error(`Unknown profession: ${professionId}`);

  const templateProvider = createTemplateProvider();
  const character = createCharacter(characterName, profession);

  const config = {
    gameId: 'gemstone',
    totalFloors: 5,
    characters: [character],
    playerAssignments: playerAssignments || [0],
    templateProvider,
    abilityDefs: ABILITY_DEFS,
    lootTables: LOOT_TABLES,
    classDefs: PROFESSIONS,
  };

  let state = createGameState(config);

  // Initialize GemStone-specific state
  state.preparingSpell = null; // { ability, targetId }
  state.quests = QUESTS.map(q => ({
    questId: q.id,
    currentStage: 0,
    completed: false,
    discovered: false,
  }));
  state.skillLog = []; // recent skill improvement messages

  // Initial room description
  const room = getCurrentRoom(state.dungeon);
  state.messages = [
    { text: '--- ' + room.title + ' ---', type: 'room-title', turn: 0 },
    { text: room.description, type: 'room-desc', turn: 0 },
    { text: `Exits: ${Object.keys(room.exits).join(', ')}`, type: 'exits', turn: 0 },
    { text: `You are ${characterName}, a ${profession.name}. The depths await.`, type: 'system', turn: 0 },
  ];

  // Check quest triggers for the entrance
  state = checkQuestTriggers(state);

  return state;
}

// ============================================================
// Process action with GemStone extras
// ============================================================
export function processGemstoneAction(state, action) {
  const templateProvider = createTemplateProvider();

  // --- Handle examine action ---
  if (action.type === 'examine') {
    return handleExamine(state, action);
  }

  // --- Handle cast prepared spell ---
  if (action.type === 'castPrepared') {
    return handleCastPrepared(state, templateProvider);
  }

  // --- Handle cancel preparation ---
  if (action.type === 'cancelPrepare') {
    return cancelPreparation(state);
  }

  // --- If player does anything else while preparing, lose preparation ---
  if (state.preparingSpell && action.type !== 'ability') {
    state = cancelPreparation(state);
  }

  // --- Handle spell preparation (ability with preparationRequired) ---
  if (action.type === 'ability') {
    const abDef = ABILITY_DEFS[action.ability];
    if (abDef && abDef.preparationRequired) {
      // If already preparing this spell, this is the cast
      if (state.preparingSpell && state.preparingSpell.ability === action.ability) {
        return handleCastPrepared(state, templateProvider);
      }
      // Start preparation
      return startPreparation(state, action.ability, action.targetId);
    }
    // Not a prepared spell -- lose any existing preparation
    if (state.preparingSpell) {
      state = cancelPreparation(state);
    }
  }

  // --- Track skill use for combat actions ---
  let skillUsed = null;
  if (action.type === 'attack') {
    // Basic attack uses weapon type
    const activeChar = getActiveCharacter(state.party);
    const weapon = activeChar.equipment?.weapon;
    if (weapon && weapon.subtype === 'ranged') {
      skillUsed = 'ranged_weapons';
    } else if (weapon && weapon.subtype === 'blunt') {
      skillUsed = 'blunt_weapons';
    } else {
      skillUsed = 'edged_weapons';
    }
  } else if (action.type === 'ability') {
    const abDef = ABILITY_DEFS[action.ability];
    if (abDef && abDef.skillUsed) {
      skillUsed = abDef.skillUsed;
    }
  }

  // --- Process the core action ---
  let newState = processAction(state, action, templateProvider);

  // --- Apply skill improvement ---
  if (skillUsed && SKILL_DEFS[skillUsed]) {
    const charIdx = newState.party.activeCharIndex;
    let char = getActiveCharacter(newState.party);
    const oldVal = char.skills[skillUsed] || 0;
    char = improveSkill(char, skillUsed, SKILL_DEFS[skillUsed].xpPerUse);
    const newVal = char.skills[skillUsed];
    newState.party = updateCharacterInParty(newState.party, charIdx, char);

    // Log skill improvement at thresholds
    const oldRank = Math.floor(oldVal / 10);
    const newRank = Math.floor(newVal / 10);
    if (newRank > oldRank) {
      const msg = { text: `Your ${SKILL_DEFS[skillUsed].name} skill has improved! (Rank ${newRank})`, type: 'skill-up', turn: newState.turnCount };
      newState.messages = [...newState.messages, msg];
    }
  }

  // --- Perception skill on room entry ---
  if (action.type === 'move' || action.type === 'descend') {
    const charIdx = newState.party.activeCharIndex;
    let char = getActiveCharacter(newState.party);
    char = improveSkill(char, 'perception', SKILL_DEFS.perception.xpPerUse);
    newState.party = updateCharacterInParty(newState.party, charIdx, char);
  }

  // --- Foraging skill in safe rooms ---
  if (action.type === 'rest') {
    const charIdx = newState.party.activeCharIndex;
    let char = getActiveCharacter(newState.party);
    char = improveSkill(char, 'foraging', SKILL_DEFS.foraging.xpPerUse);
    newState.party = updateCharacterInParty(newState.party, charIdx, char);
  }

  // --- Quest tracking on room entry ---
  if (action.type === 'move' || action.type === 'descend') {
    newState = checkQuestTriggers(newState);
  }

  // Preserve gemstone-specific state
  if (newState.preparingSpell === undefined) newState.preparingSpell = state.preparingSpell;
  if (newState.quests === undefined) newState.quests = state.quests;

  return newState;
}

// ============================================================
// Get actions with GemStone extras
// ============================================================
export function getGemstoneActions(state) {
  const baseActions = getAvailableActions(state);
  const activeChar = getActiveCharacter(state.party);
  const extraActions = [];

  // --- Cast prepared spell button ---
  if (state.preparingSpell && state.phase === 'combat') {
    const abDef = ABILITY_DEFS[state.preparingSpell.ability];
    if (abDef) {
      extraActions.push({
        label: `Cast ${abDef.name}!`,
        action: { type: 'castPrepared' },
        category: 'spell',
      });
      extraActions.push({
        label: 'Cancel Spell',
        action: { type: 'cancelPrepare' },
        category: 'special',
      });
    }
  }

  // --- Examine actions for inventory items ---
  if (state.phase === 'explore' || state.phase === 'inventory') {
    activeChar.inventory.forEach((item, i) => {
      if (item.loreDescription || (LOOT_TABLES.find(t => t.id === item.templateId)?.loreDescription)) {
        extraActions.push({
          label: `Examine ${item.name}`,
          action: { type: 'examine', itemIndex: i, source: 'inventory' },
          category: 'examine',
        });
      }
    });

    // Examine equipped items
    for (const [slot, item] of Object.entries(activeChar.equipment)) {
      if (item) {
        const template = LOOT_TABLES.find(t => t.id === item.templateId);
        if (item.loreDescription || (template && template.loreDescription)) {
          extraActions.push({
            label: `Examine ${item.name}`,
            action: { type: 'examine', slot, source: 'equipment' },
            category: 'examine',
          });
        }
      }
    }
  }

  // --- Examine items on the ground ---
  if (state.phase === 'explore') {
    const room = getCurrentRoom(state.dungeon);
    if (room.items) {
      room.items.forEach((item, i) => {
        if (item.loreDescription) {
          extraActions.push({
            label: `Examine ${item.name}`,
            action: { type: 'examine', itemIndex: i, source: 'room' },
            category: 'examine',
          });
        }
      });
    }
  }

  // Filter out prepared spell abilities from base actions when preparing
  let filteredBase = baseActions;
  if (state.preparingSpell) {
    // When preparing, remove other combat/ability actions except cast and cancel
    filteredBase = baseActions.filter(a => {
      if (a.action.type === 'ability' || a.action.type === 'attack') return false;
      return true;
    });
  }

  return [...filteredBase, ...extraActions];
}

// ============================================================
// Internal helpers
// ============================================================

function addMsg(state, text, type) {
  return {
    ...state,
    messages: [...state.messages.slice(-50), { text, type, turn: state.turnCount }],
  };
}

function startPreparation(state, abilityId, targetId) {
  const abDef = ABILITY_DEFS[abilityId];
  state = { ...state };
  state.preparingSpell = { ability: abilityId, targetId };
  state = addMsg(state, `You begin to prepare ${abDef.name}... The air around you shimmers with gathering energy.`, 'spell-prepare');
  return state;
}

function cancelPreparation(state) {
  if (!state.preparingSpell) return state;
  const abDef = ABILITY_DEFS[state.preparingSpell.ability];
  state = { ...state, preparingSpell: null };
  state = addMsg(state, `Your concentration breaks. The ${abDef ? abDef.name : 'spell'} fizzles and dissipates.`, 'system');
  return state;
}

function handleCastPrepared(state, templateProvider) {
  if (!state.preparingSpell) return state;
  const { ability, targetId } = state.preparingSpell;
  state = { ...state, preparingSpell: null };

  // Fire the actual ability through the engine
  const action = { type: 'ability', ability, targetId };
  let newState = processAction(state, action, templateProvider);

  // Skill improvement for the spell
  const abDef = ABILITY_DEFS[ability];
  if (abDef && abDef.skillUsed && SKILL_DEFS[abDef.skillUsed]) {
    const charIdx = newState.party.activeCharIndex;
    let char = getActiveCharacter(newState.party);
    const oldVal = char.skills[abDef.skillUsed] || 0;
    // Spells give extra skill XP since they take 2 turns
    char = improveSkill(char, abDef.skillUsed, SKILL_DEFS[abDef.skillUsed].xpPerUse * 2);
    const newVal = char.skills[abDef.skillUsed];
    newState.party = updateCharacterInParty(newState.party, charIdx, char);

    const oldRank = Math.floor(oldVal / 10);
    const newRank = Math.floor(newVal / 10);
    if (newRank > oldRank) {
      newState = addMsg(newState, `Your ${SKILL_DEFS[abDef.skillUsed].name} skill has improved! (Rank ${newRank})`, 'skill-up');
    }
  }

  // Preserve quest state
  newState.quests = state.quests;
  newState.preparingSpell = null;
  return newState;
}

function handleExamine(state, action) {
  let item = null;
  const activeChar = getActiveCharacter(state.party);

  if (action.source === 'inventory') {
    item = activeChar.inventory[action.itemIndex];
  } else if (action.source === 'equipment') {
    item = activeChar.equipment[action.slot];
  } else if (action.source === 'room') {
    const room = getCurrentRoom(state.dungeon);
    item = room.items[action.itemIndex];
  }

  if (!item) return addMsg(state, 'There is nothing to examine.', 'system');

  // Find lore description
  let lore = item.loreDescription;
  if (!lore) {
    const template = LOOT_TABLES.find(t => t.id === item.templateId);
    if (template) lore = template.loreDescription;
  }
  if (!lore) lore = item.description || 'You examine it closely but find nothing remarkable.';

  state = addMsg(state, `--- Examining: ${item.name} ---`, 'examine-title');
  state = addMsg(state, lore, 'examine-lore');
  return state;
}

function checkQuestTriggers(state) {
  if (!state.quests) return state;

  const room = getCurrentRoom(state.dungeon);
  const currentFloor = state.dungeon.currentFloor + 1; // 1-indexed

  let quests = state.quests.map(q => ({ ...q }));
  let modified = false;

  for (let qi = 0; qi < quests.length; qi++) {
    const questState = quests[qi];
    if (questState.completed) continue;

    const questDef = QUESTS.find(q => q.id === questState.questId);
    if (!questDef) continue;
    if (questState.currentStage >= questDef.stages.length) continue;

    const stage = questDef.stages[questState.currentStage];

    // Check trigger conditions
    if (stage.triggerRoomType !== room.type) continue;
    if (stage.triggerFloor && stage.triggerFloor !== currentFloor) continue;

    // Trigger matched -- advance quest
    if (!questState.discovered) {
      questState.discovered = true;
      state = addMsg(state, `--- New Quest: ${questDef.name} ---`, 'quest-new');
      state = addMsg(state, questDef.description, 'quest-desc');
    }

    state = addMsg(state, `Quest "${questDef.name}" - ${stage.description}`, 'quest-update');

    // Give rewards
    if (stage.rewardXp) {
      const charIdx = state.party.activeCharIndex;
      let char = getActiveCharacter(state.party);
      char = { ...char, xp: char.xp + stage.rewardXp };
      state.party = updateCharacterInParty(state.party, charIdx, char);
      state = addMsg(state, `Quest reward: ${stage.rewardXp} XP`, 'quest-reward');
    }

    if (stage.rewardItem) {
      const itemTemplate = LOOT_TABLES.find(t => t.id === stage.rewardItem);
      if (itemTemplate) {
        const charIdx = state.party.activeCharIndex;
        let char = getActiveCharacter(state.party);
        const newItem = { ...itemTemplate, id: itemTemplate.id + '_quest_' + Date.now() };
        if (char.inventory.length < char.maxInventory) {
          char = { ...char, inventory: [...char.inventory, newItem] };
          state.party = updateCharacterInParty(state.party, charIdx, char);
          state = addMsg(state, `Quest reward: ${newItem.name}`, 'quest-reward');
        }
      }
    }

    // Advance stage
    questState.currentStage++;
    if (questState.currentStage >= questDef.stages.length) {
      questState.completed = true;
      state = addMsg(state, `Quest completed: "${questDef.name}"!`, 'quest-complete');
    }

    modified = true;
  }

  if (modified) {
    state = { ...state, quests };
  }

  return state;
}
