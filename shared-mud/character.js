export function createCharacter(name, classDef, raceDef = null) {
  const baseStats = { ...classDef.stats };
  if (raceDef && raceDef.statBonuses) {
    for (const [k, v] of Object.entries(raceDef.statBonuses)) {
      baseStats[k] = (baseStats[k] || 10) + v;
    }
  }

  const char = {
    name,
    classId: classDef.id,
    className: classDef.name,
    raceId: raceDef ? raceDef.id : 'human',
    raceName: raceDef ? raceDef.name : 'Human',
    level: 1,
    xp: 0,
    xpToNext: 100,
    stats: baseStats,
    hp: 0, maxHp: 0,
    mana: 0, maxMana: 0,
    movement: 100, maxMovement: 100,
    equipment: { weapon: null, armor: null, shield: null, accessory: null },
    inventory: [],
    maxInventory: 10,
    abilities: [...(classDef.abilities || [])],
    effects: [],
    roomsDiscovered: 0,
    explorationRank: 'Novice',
    skills: classDef.skills ? { ...classDef.skills } : {},
    gold: 0,
    statPoints: 0,
  };

  recalcDerived(char, classDef);
  char.hp = char.maxHp;
  char.mana = char.maxMana;
  return char;
}

export function recalcDerived(char, classDef) {
  const hpPerLevel = classDef.hpPerLevel || 10;
  const manaPerLevel = classDef.manaPerLevel || 5;
  char.maxHp = hpPerLevel * char.level + char.stats.con * 2;
  char.maxMana = manaPerLevel * char.level + char.stats.int + char.stats.wis;
  char.maxMovement = 80 + char.stats.dex + char.level * 2;

  // Equipment bonuses
  let atkBonus = 0, defBonus = 0;
  for (const item of Object.values(char.equipment)) {
    if (item && item.stats) {
      atkBonus += item.stats.attack || 0;
      defBonus += item.stats.defense || 0;
    }
  }
  char.attackPower = char.stats.str + atkBonus + Math.floor(char.level * 1.5);
  char.defense = Math.floor(char.stats.con / 2) + defBonus;
}

export function addXp(char, amount, classDef) {
  char = { ...char };
  char.xp += amount;
  let leveledUp = false;
  while (char.xp >= char.xpToNext) {
    char.xp -= char.xpToNext;
    char.level++;
    char.xpToNext = Math.floor(100 * Math.pow(1.4, char.level - 1));
    char.statPoints += 3;
    leveledUp = true;
    // Unlock new abilities at certain levels
    if (classDef.abilityUnlocks && classDef.abilityUnlocks[char.level]) {
      char.abilities = [...char.abilities, classDef.abilityUnlocks[char.level]];
    }
  }
  if (leveledUp) {
    recalcDerived(char, classDef);
    char.hp = char.maxHp;
    char.mana = char.maxMana;
    char.movement = char.maxMovement;
  }
  return { character: char, leveledUp };
}

export function allocateStatPoints(char, allocation, classDef) {
  char = { ...char, stats: { ...char.stats } };
  let spent = 0;
  for (const [stat, pts] of Object.entries(allocation)) {
    if (char.stats[stat] !== undefined && pts > 0) {
      char.stats[stat] += pts;
      spent += pts;
    }
  }
  char.statPoints -= spent;
  recalcDerived(char, classDef);
  return char;
}

export function equipItem(char, item) {
  char = {
    ...char,
    equipment: { ...char.equipment },
    inventory: [...char.inventory],
  };
  const slot = item.slot;
  if (!slot) return char;

  // Unequip existing
  if (char.equipment[slot]) {
    char.inventory.push(char.equipment[slot]);
  }
  // Remove from inventory
  const idx = char.inventory.indexOf(item);
  if (idx >= 0) char.inventory.splice(idx, 1);
  char.equipment[slot] = item;
  return char;
}

export function unequipItem(char, slot) {
  char = {
    ...char,
    equipment: { ...char.equipment },
    inventory: [...char.inventory],
  };
  if (char.equipment[slot]) {
    if (char.inventory.length < char.maxInventory) {
      char.inventory.push(char.equipment[slot]);
    }
    char.equipment[slot] = null;
  }
  return char;
}

export function addToInventory(char, item) {
  if (char.inventory.length >= char.maxInventory) return { character: char, added: false };
  char = { ...char, inventory: [...char.inventory, item] };
  return { character: char, added: true };
}

export function removeFromInventory(char, index) {
  char = { ...char, inventory: [...char.inventory] };
  const removed = char.inventory.splice(index, 1)[0];
  return { character: char, item: removed };
}

export function applyEffect(char, effect) {
  char = { ...char, effects: [...char.effects, { ...effect }] };
  return char;
}

export function tickEffects(char) {
  char = { ...char, effects: char.effects.map(e => ({ ...e, duration: e.duration - 1 })).filter(e => e.duration > 0) };
  return char;
}

export function healCharacter(char, amount) {
  char = { ...char };
  char.hp = Math.min(char.maxHp, char.hp + amount);
  return char;
}

export function restoreCharacter(char) {
  char = { ...char };
  char.hp = char.maxHp;
  char.mana = char.maxMana;
  char.movement = char.maxMovement;
  return char;
}

export function improveSkill(char, skillId, amount) {
  char = { ...char, skills: { ...char.skills } };
  char.skills[skillId] = (char.skills[skillId] || 0) + amount;
  return char;
}
