import { RNG } from './rng.js';
import { generateDungeon, getCurrentRoom, moveRoom, moveToNextFloor, markCleared, getExplorationPercent } from './dungeon.js';
import { initCombat, performAttack, performEnemyTurn, advanceTurn, isPlayerTurn, getCurrentTurnParticipant, getAliveEnemies, canUseAbility } from './combat.js';
import { addXp, healCharacter, restoreCharacter, recalcDerived, equipItem, addToInventory, removeFromInventory } from './character.js';
import { generateLoot } from './inventory.js';
import { createParty, updateCharacterInParty, getActiveCharacter, isPartyAlive, getPlayerForChar } from './party.js';

export function createGameState(config) {
  const seed = config.seed || Date.now();
  const rng = new RNG(seed);
  const dungeon = generateDungeon(config.totalFloors || 5, rng, config.templateProvider);

  // Mark entrance as visited
  dungeon.floors[0].rooms[dungeon.floors[0].entranceId].visited = true;

  const party = createParty(config.characters, config.playerAssignments);

  return {
    phase: 'explore',
    gameId: config.gameId,
    dungeon,
    party,
    combat: null,
    seed,
    rngState: rng.seed,
    turnCount: 0,
    messages: [],
    config: {
      abilityDefs: config.abilityDefs || {},
      lootTables: config.lootTables || [],
      classDefs: config.classDefs || {},
      templateProvider: null, // not serializable, re-attach on load
      gameId: config.gameId,
      totalFloors: config.totalFloors || 5,
    },
    pendingLoot: null,
    pendingLevelUp: null,
    won: false,
  };
}

export function getRng(state) {
  return new RNG(state.rngState++);
}

function addMessage(state, text, type = 'normal') {
  return {
    ...state,
    messages: [...state.messages.slice(-50), { text, type, turn: state.turnCount }],
  };
}

export function getAvailableActions(state) {
  const actions = [];
  const room = getCurrentRoom(state.dungeon);
  const activeChar = getActiveCharacter(state.party);

  switch (state.phase) {
    case 'explore': {
      // Movement
      for (const [dir, targetId] of Object.entries(room.exits)) {
        const targetRoom = state.dungeon.floors[state.dungeon.currentFloor].rooms[targetId];
        const label = targetRoom.visited ? `Go ${dir}` : `Go ${dir} (?)`;
        actions.push({ label, action: { type: 'move', direction: dir }, category: 'move' });
      }

      // Stairs
      if (room.type === 'stairs' && room.cleared) {
        if (state.dungeon.currentFloor + 1 < state.dungeon.floors.length) {
          actions.push({ label: 'Descend stairs', action: { type: 'descend' }, category: 'move' });
        } else {
          actions.push({ label: 'Escape the dungeon!', action: { type: 'escape' }, category: 'special' });
        }
      }

      // Combat (if enemies present)
      if (room.enemies && room.enemies.length > 0 && !room.cleared) {
        actions.push({ label: 'Fight!', action: { type: 'fight' }, category: 'combat' });
      }

      // Rest (safe rooms)
      if (room.type === 'safe') {
        actions.push({ label: 'Rest (full heal)', action: { type: 'rest' }, category: 'special' });
      }

      // Shop
      if (room.type === 'shop' && room.shopItems && room.shopItems.length > 0) {
        actions.push({ label: 'Browse shop', action: { type: 'shop' }, category: 'special' });
      }

      // Pick up items
      if (room.items && room.items.length > 0) {
        room.items.forEach((item, i) => {
          actions.push({ label: `Pick up ${item.name}`, action: { type: 'pickup', index: i }, category: 'loot' });
        });
      }

      // Inventory management
      if (activeChar.inventory.length > 0) {
        actions.push({ label: 'Use item', action: { type: 'openInventory' }, category: 'inventory' });
      }
      break;
    }

    case 'combat': {
      if (!state.combat || state.combat.status !== 'active') break;
      if (!isPlayerTurn(state.combat)) break;

      const enemies = getAliveEnemies(state.combat);

      // Basic attack
      enemies.forEach(e => {
        actions.push({ label: `Attack ${e.enemy.name}`, action: { type: 'attack', targetId: e.id }, category: 'combat' });
      });

      // Abilities
      if (activeChar.abilities) {
        for (const abId of activeChar.abilities) {
          const abDef = state.config.abilityDefs[abId];
          if (!abDef) continue;
          const usable = canUseAbility(activeChar, abId, state.config.abilityDefs);
          if (abDef.target === 'single_ally' || abDef.target === 'self') {
            actions.push({
              label: `${abDef.name} (${abDef.manaCost || 0} MP)`,
              action: { type: 'ability', ability: abId, targetId: `player_${state.party.activeCharIndex}` },
              disabled: !usable,
              category: 'ability',
            });
          } else {
            enemies.forEach(e => {
              actions.push({
                label: `${abDef.name} → ${e.enemy.name} (${abDef.manaCost || 0} MP)`,
                action: { type: 'ability', ability: abId, targetId: e.id },
                disabled: !usable,
                category: 'ability',
              });
            });
          }
        }
      }

      // Use item in combat
      const consumables = activeChar.inventory.filter(item => item.type === 'consumable');
      consumables.forEach((item, i) => {
        const idx = activeChar.inventory.indexOf(item);
        actions.push({ label: `Use ${item.name}`, action: { type: 'useItem', index: idx }, category: 'item' });
      });

      break;
    }

    case 'loot': {
      if (state.pendingLoot) {
        state.pendingLoot.items.forEach((item, i) => {
          actions.push({ label: `Take ${item.name}`, action: { type: 'takeLoot', index: i }, category: 'loot' });
        });
      }
      actions.push({ label: 'Continue', action: { type: 'endLoot' }, category: 'special' });
      break;
    }

    case 'levelUp': {
      actions.push({ label: 'STR +1', action: { type: 'allocate', stat: 'str' }, category: 'stat' });
      actions.push({ label: 'DEX +1', action: { type: 'allocate', stat: 'dex' }, category: 'stat' });
      actions.push({ label: 'INT +1', action: { type: 'allocate', stat: 'int' }, category: 'stat' });
      actions.push({ label: 'WIS +1', action: { type: 'allocate', stat: 'wis' }, category: 'stat' });
      actions.push({ label: 'CON +1', action: { type: 'allocate', stat: 'con' }, category: 'stat' });
      break;
    }

    case 'shop': {
      const room2 = getCurrentRoom(state.dungeon);
      if (room2.shopItems) {
        room2.shopItems.forEach((item, i) => {
          const affordable = activeChar.gold >= item.value;
          actions.push({
            label: `Buy ${item.name} (${item.value}g)`,
            action: { type: 'buy', index: i },
            disabled: !affordable,
            category: 'shop',
          });
        });
      }
      actions.push({ label: 'Leave shop', action: { type: 'leaveShop' }, category: 'special' });
      break;
    }

    case 'inventory': {
      activeChar.inventory.forEach((item, i) => {
        if (item.slot) {
          actions.push({ label: `Equip ${item.name}`, action: { type: 'equip', index: i }, category: 'inventory' });
        }
        if (item.type === 'consumable') {
          actions.push({ label: `Use ${item.name}`, action: { type: 'useItem', index: i }, category: 'inventory' });
        }
        actions.push({ label: `Drop ${item.name}`, action: { type: 'drop', index: i }, category: 'inventory' });
      });
      actions.push({ label: 'Back', action: { type: 'closeInventory' }, category: 'special' });
      break;
    }
  }

  return actions;
}

export function processAction(state, action, templateProvider) {
  const rng = getRng(state);
  let s = { ...state, rngState: rng.seed };
  const activeCharIdx = s.party.activeCharIndex;
  const activeChar = getActiveCharacter(s.party);
  const classDef = s.config.classDefs[activeChar.classId] || {};

  switch (action.type) {
    case 'move': {
      const newDungeon = moveRoom(s.dungeon, action.direction);
      if (!newDungeon) return addMessage(s, 'You cannot go that way.', 'system');
      s.dungeon = newDungeon;
      s.turnCount++;

      // Movement cost
      let char = { ...activeChar, movement: activeChar.movement - 2 };
      s.party = updateCharacterInParty(s.party, activeCharIdx, char);

      const room = getCurrentRoom(s.dungeon);
      s = addMessage(s, `--- ${room.title} ---`, 'room-title');
      s = addMessage(s, room.description, 'room-desc');

      if (!room.visited) {
        char = { ...char, roomsDiscovered: (char.roomsDiscovered || 0) + 1 };
        s.party = updateCharacterInParty(s.party, activeCharIdx, char);
      }

      // List exits
      const exitList = Object.keys(room.exits).join(', ');
      s = addMessage(s, `Exits: ${exitList}`, 'exits');

      if (room.enemies && room.enemies.length > 0 && !room.cleared) {
        const names = room.enemies.map(e => e.name).join(', ');
        s = addMessage(s, `You encounter: ${names}!`, 'combat');
      }

      if (room.items && room.items.length > 0) {
        const itemNames = room.items.map(i => i.name).join(', ');
        s = addMessage(s, `You see: ${itemNames}`, 'loot');
      }

      if (room.type === 'safe') s = addMessage(s, 'This is a safe room. You can rest here.', 'system');
      if (room.type === 'shop') s = addMessage(s, 'A merchant has set up shop here.', 'system');
      if (room.type === 'stairs' && room.cleared) s = addMessage(s, 'Stairs leading deeper into the dungeon.', 'system');

      return s;
    }

    case 'fight': {
      const room = getCurrentRoom(s.dungeon);
      if (!room.enemies || room.enemies.length === 0) return s;
      const combat = initCombat(s.party.characters, room.enemies, rng);
      s.combat = combat;
      s.phase = 'combat';
      s = addMessage(s, 'Combat begins!', 'combat');
      // If first turn is enemy, process it
      s = processEnemyTurns(s);
      return s;
    }

    case 'attack': {
      if (s.phase !== 'combat') return s;
      const result = performAttack(s.combat, s.party.characters, activeCharIdx, action.targetId, null, rng, s.config.abilityDefs);
      s.combat = result.combat;
      s.party = updatePartyFromArray(s.party, result.party);
      for (const msg of result.combat.log.slice(s.combat._lastLogLen || 0)) {
        s = addMessage(s, msg.text, msg.type);
      }
      s.combat._lastLogLen = s.combat.log.length;

      if (s.combat.status === 'victory') return handleVictory(s, rng);
      if (s.combat.status === 'defeat') return handleDefeat(s);

      s.combat = advanceTurn(s.combat);
      s = processEnemyTurns(s);
      return s;
    }

    case 'ability': {
      if (s.phase !== 'combat') return s;
      const result = performAttack(s.combat, s.party.characters, activeCharIdx, action.targetId, action.ability, rng, s.config.abilityDefs);
      s.combat = result.combat;
      s.party = updatePartyFromArray(s.party, result.party);
      for (const msg of result.combat.log.slice(s.combat._lastLogLen || 0)) {
        s = addMessage(s, msg.text, msg.type);
      }
      s.combat._lastLogLen = s.combat.log.length;

      if (s.combat.status === 'victory') return handleVictory(s, rng);
      if (s.combat.status === 'defeat') return handleDefeat(s);

      s.combat = advanceTurn(s.combat);
      s = processEnemyTurns(s);
      return s;
    }

    case 'useItem': {
      const item = activeChar.inventory[action.index];
      if (!item) return s;
      let char = { ...activeChar };
      if (item.healAmount) {
        char = healCharacter(char, item.healAmount);
        s = addMessage(s, `${char.name} uses ${item.name} and heals ${item.healAmount} HP!`, 'heal');
      }
      if (item.manaAmount) {
        char.mana = Math.min(char.maxMana, char.mana + item.manaAmount);
        s = addMessage(s, `${char.name} uses ${item.name} and restores ${item.manaAmount} MP!`, 'heal');
      }
      const { character: updChar } = removeFromInventory(char, action.index);
      s.party = updateCharacterInParty(s.party, activeCharIdx, updChar);

      if (s.phase === 'combat') {
        s.combat = advanceTurn(s.combat);
        s = processEnemyTurns(s);
      }
      return s;
    }

    case 'rest': {
      let chars = s.party.characters.map(c => restoreCharacter(c));
      s.party = { ...s.party, characters: chars };
      s = addMessage(s, 'Your party rests and fully recovers.', 'heal');
      return s;
    }

    case 'descend': {
      const newDungeon = moveToNextFloor(s.dungeon);
      if (!newDungeon) return s;
      s.dungeon = newDungeon;
      const room = getCurrentRoom(s.dungeon);
      s = addMessage(s, `You descend to floor ${s.dungeon.currentFloor + 1}...`, 'system');
      s = addMessage(s, `--- ${room.title} ---`, 'room-title');
      s = addMessage(s, room.description, 'room-desc');
      const exitList = Object.keys(room.exits).join(', ');
      s = addMessage(s, `Exits: ${exitList}`, 'exits');
      return s;
    }

    case 'escape': {
      s.phase = 'gameOver';
      s.won = true;
      const pct = getExplorationPercent(s.dungeon);
      s = addMessage(s, `You escape the dungeon! Exploration: ${pct}%`, 'system');
      return s;
    }

    case 'pickup': {
      const room = getCurrentRoom(s.dungeon);
      const item = room.items[action.index];
      if (!item) return s;
      const { character: updChar, added } = addToInventory(activeChar, item);
      if (!added) return addMessage(s, 'Inventory full!', 'system');
      s.party = updateCharacterInParty(s.party, activeCharIdx, updChar);

      // Remove item from room
      s.dungeon = {
        ...s.dungeon,
        floors: s.dungeon.floors.map((f, fi) => fi === s.dungeon.currentFloor ? {
          ...f, rooms: {
            ...f.rooms, [s.dungeon.currentRoom]: {
              ...f.rooms[s.dungeon.currentRoom],
              items: f.rooms[s.dungeon.currentRoom].items.filter((_, i) => i !== action.index)
            }
          }
        } : f),
      };
      s = addMessage(s, `Picked up ${item.name}.`, 'loot');
      return s;
    }

    case 'takeLoot': {
      if (!s.pendingLoot) return s;
      const item = s.pendingLoot.items[action.index];
      if (!item) return s;
      const { character: updChar, added } = addToInventory(activeChar, item);
      if (!added) return addMessage(s, 'Inventory full!', 'system');
      s.party = updateCharacterInParty(s.party, activeCharIdx, updChar);
      s.pendingLoot = {
        ...s.pendingLoot,
        items: s.pendingLoot.items.filter((_, i) => i !== action.index),
      };
      s = addMessage(s, `Took ${item.name}.`, 'loot');
      return s;
    }

    case 'endLoot': {
      s.pendingLoot = null;
      // Check for level up
      const char = getActiveCharacter(s.party);
      if (char.statPoints > 0) {
        s.phase = 'levelUp';
        s.pendingLevelUp = activeCharIdx;
        s = addMessage(s, `${char.name} has ${char.statPoints} stat points to allocate!`, 'system');
      } else {
        s.phase = 'explore';
      }
      return s;
    }

    case 'allocate': {
      let char = { ...getActiveCharacter(s.party), stats: { ...getActiveCharacter(s.party).stats } };
      char.stats[action.stat] += 1;
      char.statPoints -= 1;
      recalcDerived(char, classDef);
      s.party = updateCharacterInParty(s.party, activeCharIdx, char);
      s = addMessage(s, `${action.stat.toUpperCase()} increased to ${char.stats[action.stat]}.`, 'system');

      if (char.statPoints <= 0) {
        s.phase = 'explore';
        s.pendingLevelUp = null;
        s = addMessage(s, 'All stat points allocated. Onward!', 'system');
      }
      return s;
    }

    case 'shop': {
      s.phase = 'shop';
      s = addMessage(s, 'Welcome, adventurer! Browse my wares.', 'system');
      return s;
    }

    case 'buy': {
      const room = getCurrentRoom(s.dungeon);
      const item = room.shopItems[action.index];
      if (!item || activeChar.gold < item.value) return s;
      let char = { ...activeChar, gold: activeChar.gold - item.value };
      const { character: updChar, added } = addToInventory(char, item);
      if (!added) return addMessage(s, 'Inventory full!', 'system');
      s.party = updateCharacterInParty(s.party, activeCharIdx, updChar);
      // Remove from shop
      s.dungeon = {
        ...s.dungeon,
        floors: s.dungeon.floors.map((f, fi) => fi === s.dungeon.currentFloor ? {
          ...f, rooms: {
            ...f.rooms, [s.dungeon.currentRoom]: {
              ...f.rooms[s.dungeon.currentRoom],
              shopItems: f.rooms[s.dungeon.currentRoom].shopItems.filter((_, i) => i !== action.index)
            }
          }
        } : f),
      };
      s = addMessage(s, `Bought ${item.name} for ${item.value} gold.`, 'loot');
      return s;
    }

    case 'leaveShop': {
      s.phase = 'explore';
      return s;
    }

    case 'openInventory': {
      s = { ...s, phase: 'inventory', _previousPhase: s.phase };
      return s;
    }

    case 'closeInventory': {
      s = { ...s, phase: s._previousPhase || 'explore' };
      delete s._previousPhase;
      return s;
    }

    case 'equip': {
      const item = activeChar.inventory[action.index];
      if (!item || !item.slot) return s;
      let char = equipItem(activeChar, item);
      recalcDerived(char, classDef);
      s.party = updateCharacterInParty(s.party, activeCharIdx, char);
      s = addMessage(s, `Equipped ${item.name}.`, 'system');
      return s;
    }

    case 'drop': {
      const { character: updChar, item } = removeFromInventory(activeChar, action.index);
      s.party = updateCharacterInParty(s.party, activeCharIdx, updChar);
      s = addMessage(s, `Dropped ${item.name}.`, 'system');
      return s;
    }

    default:
      return s;
  }
}

function processEnemyTurns(s) {
  while (s.combat && s.combat.status === 'active' && !isPlayerTurn(s.combat)) {
    const rng = getRng(s);
    const result = performEnemyTurn(s.combat, s.party.characters, rng);
    s.combat = result.combat;
    s.party = updatePartyFromArray(s.party, result.party);

    for (const msg of s.combat.log.slice(s.combat._lastLogLen || 0)) {
      s = addMessage(s, msg.text, msg.type);
    }
    s.combat._lastLogLen = s.combat.log.length;

    if (s.combat.status === 'victory') return handleVictory(s, rng);
    if (s.combat.status === 'defeat') return handleDefeat(s);

    s.combat = advanceTurn(s.combat);
  }
  return s;
}

function handleVictory(s, rng) {
  s.dungeon = markCleared(s.dungeon);
  const room = getCurrentRoom(s.dungeon);
  const avgLevel = Math.ceil(s.party.characters.reduce((sum, c) => sum + c.level, 0) / s.party.characters.length);
  const floorLevel = s.dungeon.currentFloor + 1;
  const enemies = room.enemies || [];
  const xpPerEnemy = 20 + floorLevel * 10;
  const totalXp = enemies.length * xpPerEnemy;

  // Generate loot
  const loot = generateLoot(floorLevel + avgLevel, rng, s.config.lootTables);
  s.pendingLoot = loot;

  // Award XP and gold
  const xpPerChar = Math.ceil(totalXp / s.party.characters.length);
  let anyLevelUp = false;
  const chars = s.party.characters.map(c => {
    if (c.hp <= 0) return c;
    const classDef = s.config.classDefs[c.classId] || {};
    const { character, leveledUp } = addXp(c, xpPerChar, classDef);
    if (leveledUp) anyLevelUp = true;
    return { ...character, gold: character.gold + loot.gold };
  });
  s.party = { ...s.party, characters: chars };

  s = addMessage(s, `Victory! Gained ${xpPerChar} XP and ${loot.gold} gold.`, 'system');
  if (loot.items.length > 0) {
    s = addMessage(s, `Loot: ${loot.items.map(i => i.name).join(', ')}`, 'loot');
  }
  if (anyLevelUp) {
    s = addMessage(s, 'Level up!', 'system');
  }

  s.phase = 'loot';
  s.combat = null;
  return s;
}

function handleDefeat(s) {
  s.phase = 'gameOver';
  s.won = false;
  s.combat = null;
  s = addMessage(s, 'Game Over. Your party has been defeated.', 'system');
  return s;
}

function updatePartyFromArray(partyState, charArray) {
  return { ...partyState, characters: charArray };
}
