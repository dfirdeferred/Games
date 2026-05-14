const RARITY_MULTIPLIERS = { common: 1, uncommon: 1.3, rare: 1.7, epic: 2.2 };
const RARITY_WEIGHTS = [60, 25, 12, 3]; // common, uncommon, rare, epic
const RARITIES = ['common', 'uncommon', 'rare', 'epic'];
const RARITY_COLORS = { common: '#aaa', uncommon: '#2ecc71', rare: '#3498db', epic: '#9b59b6' };

export { RARITY_COLORS };

export function createItem(template, level, rng, rarityBoost = 0) {
  const weights = [...RARITY_WEIGHTS];
  // Boost rarer drops
  weights[1] += rarityBoost * 5;
  weights[2] += rarityBoost * 3;
  weights[3] += rarityBoost * 1;

  const rarity = rng.pickWeighted(RARITIES, weights);
  const mult = RARITY_MULTIPLIERS[rarity];
  const stats = {};

  if (template.stats) {
    for (const [k, v] of Object.entries(template.stats)) {
      stats[k] = Math.max(1, Math.round((v + level * 0.5) * mult));
    }
  }

  return {
    id: template.id + '_' + rng.nextInt(1000, 9999),
    templateId: template.id,
    name: rarity === 'common' ? template.name : `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${template.name}`,
    type: template.type,
    subtype: template.subtype || null,
    slot: template.slot || null,
    rarity,
    stats,
    effects: template.effects ? [...template.effects] : [],
    value: Math.round((template.value || 10) * mult * (1 + level * 0.2)),
    description: template.description || '',
    stackable: template.stackable || false,
    quantity: 1,
    healAmount: template.healAmount ? Math.round(template.healAmount * mult * (1 + level * 0.1)) : undefined,
    manaAmount: template.manaAmount ? Math.round(template.manaAmount * mult * (1 + level * 0.1)) : undefined,
  };
}

export function generateLoot(enemyLevel, rng, lootTables, count = null) {
  const numItems = count !== null ? count : (rng.next() < 0.6 ? 1 : rng.next() < 0.5 ? 2 : 0);
  const items = [];
  const goldAmount = rng.nextInt(enemyLevel * 2, enemyLevel * 5);

  for (let i = 0; i < numItems; i++) {
    const template = rng.pick(lootTables);
    items.push(createItem(template, enemyLevel, rng));
  }

  return { items, gold: goldAmount };
}

export function canEquip(character, item) {
  if (!item.slot) return false;
  return true;
}

export function compareItems(equipped, candidate) {
  const diff = {};
  const eStats = equipped ? equipped.stats : {};
  const cStats = candidate.stats || {};
  const allKeys = new Set([...Object.keys(eStats), ...Object.keys(cStats)]);
  for (const k of allKeys) {
    diff[k] = (cStats[k] || 0) - (eStats[k] || 0);
  }
  return diff;
}
