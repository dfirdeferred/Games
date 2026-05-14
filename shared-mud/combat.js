export function initCombat(party, enemies, rng) {
  const participants = [];

  party.forEach((char, i) => {
    if (char.hp > 0) {
      participants.push({
        id: `player_${i}`,
        type: 'player',
        charIndex: i,
        initiative: rng.nextInt(1, 20) + Math.floor(char.stats.dex / 2),
        row: char.row || 'front',
      });
    }
  });

  enemies.forEach((enemy, i) => {
    participants.push({
      id: `enemy_${i}`,
      type: 'enemy',
      enemyIndex: i,
      enemy: { ...enemy, hp: enemy.maxHp || enemy.hp },
      initiative: rng.nextInt(1, 20) + (enemy.speed || 5),
      row: enemy.row || 'front',
    });
  });

  participants.sort((a, b) => b.initiative - a.initiative);

  return {
    participants,
    turnIndex: 0,
    round: 1,
    log: [],
    status: 'active',
    loot: null,
  };
}

export function getCurrentTurnParticipant(combat) {
  return combat.participants[combat.turnIndex];
}

export function isPlayerTurn(combat) {
  const p = getCurrentTurnParticipant(combat);
  return p && p.type === 'player';
}

export function getAliveEnemies(combat) {
  return combat.participants.filter(p => p.type === 'enemy' && p.enemy.hp > 0);
}

export function getAlivePlayers(combat) {
  return combat.participants.filter(p => p.type === 'player');
}

export function performAttack(combat, party, attackerIdx, targetId, ability, rng, abilityDefs) {
  combat = deepCloneCombat(combat);
  const attacker = party[attackerIdx];
  const target = combat.participants.find(p => p.id === targetId);
  if (!target || (target.type === 'enemy' && target.enemy.hp <= 0)) {
    combat.log.push({ text: 'Invalid target.', type: 'system' });
    return { combat, party: [...party], damage: 0 };
  }

  let multiplier = 1;
  let manaCost = 0;
  let abilityName = 'Attack';
  let damageType = 'physical';
  let healAmount = 0;
  let aoeTargets = null;

  if (ability && abilityDefs[ability]) {
    const aDef = abilityDefs[ability];
    multiplier = aDef.multiplier || 1;
    manaCost = aDef.manaCost || 0;
    abilityName = aDef.name;
    damageType = aDef.damageType || 'physical';
    healAmount = aDef.healAmount || 0;
    if (aDef.target === 'all_enemies') aoeTargets = getAliveEnemies(combat);
    if (aDef.target === 'all_allies') aoeTargets = getAlivePlayers(combat);
  }

  // Check mana
  let newParty = party.map(c => ({ ...c }));
  if (manaCost > 0) {
    if (newParty[attackerIdx].mana < manaCost) {
      combat.log.push({ text: `Not enough mana for ${abilityName}!`, type: 'system' });
      return { combat, party: newParty, damage: 0 };
    }
    newParty[attackerIdx].mana -= manaCost;
  }

  // Handle healing abilities
  if (healAmount > 0) {
    if (target.type === 'player') {
      const healTarget = newParty[target.charIndex];
      const actual = Math.min(healAmount + attacker.stats.wis, healTarget.maxHp - healTarget.hp);
      newParty[target.charIndex] = { ...healTarget, hp: healTarget.hp + actual };
      combat.log.push({ text: `${attacker.name} uses ${abilityName} on ${healTarget.name}, healing ${actual} HP!`, type: 'heal' });
    }
    return { combat, party: newParty, damage: 0 };
  }

  // Calculate damage
  const basePower = damageType === 'magic'
    ? attacker.stats.int + attacker.stats.wis
    : attacker.attackPower || (attacker.stats.str + (attacker.equipment?.weapon?.stats?.attack || 0));

  const isCrit = rng.next() < 0.05;
  const critMult = isCrit ? 2 : 1;

  const targets = aoeTargets || [target];
  let totalDamage = 0;

  for (const t of targets) {
    if (t.type === 'enemy' && t.enemy.hp > 0) {
      const armor = t.enemy.defense || 0;
      const dmg = Math.max(1, Math.round(basePower * multiplier * critMult - armor));
      t.enemy.hp -= dmg;
      totalDamage += dmg;

      const critText = isCrit ? ' CRITICAL!' : '';
      combat.log.push({
        text: `${attacker.name} uses ${abilityName} on ${t.enemy.name} for ${dmg} damage!${critText}`,
        type: 'combat',
      });

      if (t.enemy.hp <= 0) {
        t.enemy.hp = 0;
        combat.log.push({ text: `${t.enemy.name} is defeated!`, type: 'combat' });
      }
    }
  }

  // Check victory
  if (getAliveEnemies(combat).length === 0) {
    combat.status = 'victory';
    combat.log.push({ text: 'All enemies defeated!', type: 'system' });
  }

  return { combat, party: newParty, damage: totalDamage };
}

export function performEnemyTurn(combat, party, rng) {
  combat = deepCloneCombat(combat);
  const participant = getCurrentTurnParticipant(combat);
  if (!participant || participant.type !== 'enemy' || participant.enemy.hp <= 0) {
    return { combat, party: party.map(c => ({ ...c })) };
  }

  const enemy = participant.enemy;
  const alivePlayers = combat.participants.filter(p => p.type === 'player');
  if (alivePlayers.length === 0) return { combat, party: party.map(c => ({ ...c })) };

  // Simple AI: attack front row first, pick lowest HP
  const frontRow = alivePlayers.filter(p => p.row === 'front' && party[p.charIndex].hp > 0);
  const backRow = alivePlayers.filter(p => p.row === 'back' && party[p.charIndex].hp > 0);
  const targets = frontRow.length > 0 ? frontRow : backRow;

  if (targets.length === 0) return { combat, party: party.map(c => ({ ...c })) };

  // Pick lowest HP target
  const target = targets.reduce((best, p) =>
    party[p.charIndex].hp < party[best.charIndex].hp ? p : best
  );

  const newParty = party.map(c => ({ ...c }));
  const targetChar = newParty[target.charIndex];
  const armor = targetChar.defense || 0;
  const damage = Math.max(1, (enemy.attack || enemy.stats?.str || 5) - armor);

  targetChar.hp -= damage;
  combat.log.push({
    text: `${enemy.name} attacks ${targetChar.name} for ${damage} damage!`,
    type: 'enemy-attack',
  });

  if (targetChar.hp <= 0) {
    targetChar.hp = 0;
    combat.log.push({ text: `${targetChar.name} has fallen!`, type: 'combat' });
    // Remove from participants
    combat.participants = combat.participants.filter(p => !(p.type === 'player' && p.charIndex === target.charIndex));
    // Recheck turn index
    if (combat.turnIndex >= combat.participants.length) {
      combat.turnIndex = 0;
      combat.round++;
    }

    // Check defeat
    const anyAlive = newParty.some(c => c.hp > 0);
    if (!anyAlive) {
      combat.status = 'defeat';
      combat.log.push({ text: 'Your party has been defeated...', type: 'system' });
    }
  }

  return { combat, party: newParty };
}

export function advanceTurn(combat) {
  combat = deepCloneCombat(combat);
  if (combat.status !== 'active') return combat;

  // Skip dead participants
  let safety = 0;
  do {
    combat.turnIndex = (combat.turnIndex + 1) % combat.participants.length;
    if (combat.turnIndex === 0) combat.round++;
    safety++;
  } while (
    safety < combat.participants.length * 2 &&
    ((combat.participants[combat.turnIndex].type === 'enemy' && combat.participants[combat.turnIndex].enemy.hp <= 0) ||
     (combat.participants[combat.turnIndex].type === 'player' && combat.participants[combat.turnIndex]._dead))
  );

  return combat;
}

export function canUseAbility(character, abilityId, abilityDefs) {
  const def = abilityDefs[abilityId];
  if (!def) return false;
  if (def.manaCost && character.mana < def.manaCost) return false;
  return true;
}

function deepCloneCombat(combat) {
  return {
    ...combat,
    participants: combat.participants.map(p => ({
      ...p,
      enemy: p.enemy ? { ...p.enemy } : undefined,
    })),
    log: [...combat.log],
  };
}
