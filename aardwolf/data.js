// Aardwolf MUD - Game Data
// Classes, abilities, monsters, loot tables, and template provider

export const CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    description: 'A battle-hardened fighter who excels in melee combat and can take a beating.',
    stats: { str: 16, dex: 12, int: 8, wis: 8, con: 15, cha: 10 },
    hpPerLevel: 14,
    manaPerLevel: 3,
    abilities: ['power_strike', 'shield_bash', 'battle_cry'],
    abilityUnlocks: { 3: 'cleave', 5: 'second_wind', 7: 'berserker_rage' },
  },
  mage: {
    id: 'mage',
    name: 'Mage',
    description: 'A master of arcane arts who devastates foes with powerful spells.',
    stats: { str: 7, dex: 10, int: 18, wis: 14, con: 8, cha: 10 },
    hpPerLevel: 8,
    manaPerLevel: 12,
    abilities: ['fireball', 'ice_shard', 'arcane_bolt'],
    abilityUnlocks: { 3: 'lightning_storm', 5: 'mana_shield', 7: 'meteor' },
  },
  thief: {
    id: 'thief',
    name: 'Thief',
    description: 'A cunning rogue who strikes from the shadows with deadly precision.',
    stats: { str: 10, dex: 18, int: 12, wis: 8, con: 10, cha: 11 },
    hpPerLevel: 10,
    manaPerLevel: 5,
    abilities: ['backstab', 'poison_blade', 'smoke_bomb'],
    abilityUnlocks: { 3: 'dual_strike', 5: 'eviscerate', 7: 'assassinate' },
  },
  cleric: {
    id: 'cleric',
    name: 'Cleric',
    description: 'A divine healer who protects allies and smites the unholy.',
    stats: { str: 10, dex: 8, int: 12, wis: 18, con: 12, cha: 12 },
    hpPerLevel: 11,
    manaPerLevel: 10,
    abilities: ['heal', 'smite', 'divine_light'],
    abilityUnlocks: { 3: 'sanctuary', 5: 'holy_nova', 7: 'resurrection' },
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    description: 'A skilled tracker and archer at home in the wilderness.',
    stats: { str: 12, dex: 16, int: 10, wis: 13, con: 11, cha: 9 },
    hpPerLevel: 11,
    manaPerLevel: 6,
    abilities: ['aimed_shot', 'rapid_fire', 'trap'],
    abilityUnlocks: { 3: 'volley', 5: 'camouflage', 7: 'deadeye' },
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    description: 'A holy warrior who blends martial prowess with divine magic.',
    stats: { str: 14, dex: 8, int: 10, wis: 14, con: 14, cha: 13 },
    hpPerLevel: 13,
    manaPerLevel: 7,
    abilities: ['holy_strike', 'lay_on_hands', 'shield_of_faith'],
    abilityUnlocks: { 3: 'consecrate', 5: 'divine_storm', 7: 'avenging_wrath' },
  },
  psionicist: {
    id: 'psionicist',
    name: 'Psionicist',
    description: 'A mind-bender who wields psychic energy to crush enemies from within.',
    stats: { str: 7, dex: 12, int: 16, wis: 16, con: 9, cha: 11 },
    hpPerLevel: 9,
    manaPerLevel: 11,
    abilities: ['mind_blast', 'psychic_drain', 'telekinesis'],
    abilityUnlocks: { 3: 'confusion', 5: 'mind_crush', 7: 'dominate' },
  },
};

export const ABILITY_DEFS = {
  // Warrior
  power_strike: {
    name: 'Power Strike',
    description: 'A mighty blow that deals extra damage.',
    manaCost: 5,
    multiplier: 1.8,
    damageType: 'physical',
    target: 'single_enemy',
  },
  shield_bash: {
    name: 'Shield Bash',
    description: 'Slam your shield into the enemy.',
    manaCost: 4,
    multiplier: 1.3,
    damageType: 'physical',
    target: 'single_enemy',
  },
  battle_cry: {
    name: 'Battle Cry',
    description: 'Rally yourself, restoring some HP.',
    manaCost: 6,
    multiplier: 0,
    damageType: 'physical',
    target: 'self',
    healAmount: 20,
  },
  cleave: {
    name: 'Cleave',
    description: 'Swing wide, hitting all enemies.',
    manaCost: 10,
    multiplier: 1.2,
    damageType: 'physical',
    target: 'all_enemies',
  },
  second_wind: {
    name: 'Second Wind',
    description: 'Catch your breath and heal significantly.',
    manaCost: 12,
    multiplier: 0,
    damageType: 'physical',
    target: 'self',
    healAmount: 40,
  },
  berserker_rage: {
    name: 'Berserker Rage',
    description: 'Enter a rage, dealing massive damage.',
    manaCost: 18,
    multiplier: 3.0,
    damageType: 'physical',
    target: 'single_enemy',
  },

  // Mage
  fireball: {
    name: 'Fireball',
    description: 'Hurl a ball of fire at an enemy.',
    manaCost: 8,
    multiplier: 2.0,
    damageType: 'magic',
    target: 'single_enemy',
  },
  ice_shard: {
    name: 'Ice Shard',
    description: 'Launch a piercing shard of ice.',
    manaCost: 5,
    multiplier: 1.5,
    damageType: 'magic',
    target: 'single_enemy',
  },
  arcane_bolt: {
    name: 'Arcane Bolt',
    description: 'A quick bolt of raw arcane energy.',
    manaCost: 3,
    multiplier: 1.2,
    damageType: 'magic',
    target: 'single_enemy',
  },
  lightning_storm: {
    name: 'Lightning Storm',
    description: 'Call down lightning on all foes.',
    manaCost: 14,
    multiplier: 1.4,
    damageType: 'magic',
    target: 'all_enemies',
  },
  mana_shield: {
    name: 'Mana Shield',
    description: 'Channel mana into a protective barrier.',
    manaCost: 10,
    multiplier: 0,
    damageType: 'magic',
    target: 'self',
    healAmount: 25,
  },
  meteor: {
    name: 'Meteor',
    description: 'Summon a devastating meteor from the sky.',
    manaCost: 22,
    multiplier: 3.5,
    damageType: 'magic',
    target: 'single_enemy',
  },

  // Thief
  backstab: {
    name: 'Backstab',
    description: 'Strike from the shadows for extra damage.',
    manaCost: 6,
    multiplier: 2.2,
    damageType: 'physical',
    target: 'single_enemy',
  },
  poison_blade: {
    name: 'Poison Blade',
    description: 'Coat your weapon in venom.',
    manaCost: 5,
    multiplier: 1.6,
    damageType: 'physical',
    target: 'single_enemy',
  },
  smoke_bomb: {
    name: 'Smoke Bomb',
    description: 'Throw a smoke bomb, damaging all enemies.',
    manaCost: 8,
    multiplier: 0.9,
    damageType: 'physical',
    target: 'all_enemies',
  },
  dual_strike: {
    name: 'Dual Strike',
    description: 'Attack twice in rapid succession.',
    manaCost: 8,
    multiplier: 2.0,
    damageType: 'physical',
    target: 'single_enemy',
  },
  eviscerate: {
    name: 'Eviscerate',
    description: 'A brutal finishing move.',
    manaCost: 14,
    multiplier: 2.8,
    damageType: 'physical',
    target: 'single_enemy',
  },
  assassinate: {
    name: 'Assassinate',
    description: 'Strike at a vital point for lethal damage.',
    manaCost: 20,
    multiplier: 4.0,
    damageType: 'physical',
    target: 'single_enemy',
  },

  // Cleric
  heal: {
    name: 'Heal',
    description: 'Restore health to yourself.',
    manaCost: 6,
    multiplier: 0,
    damageType: 'magic',
    target: 'self',
    healAmount: 30,
  },
  smite: {
    name: 'Smite',
    description: 'Strike an enemy with holy wrath.',
    manaCost: 7,
    multiplier: 1.8,
    damageType: 'magic',
    target: 'single_enemy',
  },
  divine_light: {
    name: 'Divine Light',
    description: 'Blast enemies with radiant energy.',
    manaCost: 5,
    multiplier: 1.3,
    damageType: 'magic',
    target: 'single_enemy',
  },
  sanctuary: {
    name: 'Sanctuary',
    description: 'Invoke a powerful healing prayer.',
    manaCost: 10,
    multiplier: 0,
    damageType: 'magic',
    target: 'self',
    healAmount: 45,
  },
  holy_nova: {
    name: 'Holy Nova',
    description: 'A burst of holy energy damages all foes.',
    manaCost: 14,
    multiplier: 1.5,
    damageType: 'magic',
    target: 'all_enemies',
  },
  resurrection: {
    name: 'Resurrection',
    description: 'Channel immense divine power to heal.',
    manaCost: 20,
    multiplier: 0,
    damageType: 'magic',
    target: 'self',
    healAmount: 80,
  },

  // Ranger
  aimed_shot: {
    name: 'Aimed Shot',
    description: 'Take careful aim for a precise shot.',
    manaCost: 6,
    multiplier: 2.0,
    damageType: 'physical',
    target: 'single_enemy',
  },
  rapid_fire: {
    name: 'Rapid Fire',
    description: 'Fire a flurry of arrows.',
    manaCost: 5,
    multiplier: 1.4,
    damageType: 'physical',
    target: 'single_enemy',
  },
  trap: {
    name: 'Trap',
    description: 'Set a trap that damages all foes.',
    manaCost: 8,
    multiplier: 1.0,
    damageType: 'physical',
    target: 'all_enemies',
  },
  volley: {
    name: 'Volley',
    description: 'Rain arrows on all enemies.',
    manaCost: 12,
    multiplier: 1.3,
    damageType: 'physical',
    target: 'all_enemies',
  },
  camouflage: {
    name: 'Camouflage',
    description: 'Blend into surroundings and recover.',
    manaCost: 8,
    multiplier: 0,
    damageType: 'physical',
    target: 'self',
    healAmount: 30,
  },
  deadeye: {
    name: 'Deadeye',
    description: 'A perfect shot to a critical weak point.',
    manaCost: 18,
    multiplier: 3.5,
    damageType: 'physical',
    target: 'single_enemy',
  },

  // Paladin
  holy_strike: {
    name: 'Holy Strike',
    description: 'Channel divine energy into your weapon.',
    manaCost: 6,
    multiplier: 1.7,
    damageType: 'magic',
    target: 'single_enemy',
  },
  lay_on_hands: {
    name: 'Lay on Hands',
    description: 'Heal yourself with a touch of light.',
    manaCost: 8,
    multiplier: 0,
    damageType: 'magic',
    target: 'self',
    healAmount: 35,
  },
  shield_of_faith: {
    name: 'Shield of Faith',
    description: 'Raise a holy barrier, restoring health.',
    manaCost: 5,
    multiplier: 0,
    damageType: 'magic',
    target: 'self',
    healAmount: 15,
  },
  consecrate: {
    name: 'Consecrate',
    description: 'Sanctify the ground beneath all foes.',
    manaCost: 10,
    multiplier: 1.2,
    damageType: 'magic',
    target: 'all_enemies',
  },
  divine_storm: {
    name: 'Divine Storm',
    description: 'Unleash a whirlwind of holy power.',
    manaCost: 14,
    multiplier: 1.5,
    damageType: 'magic',
    target: 'all_enemies',
  },
  avenging_wrath: {
    name: 'Avenging Wrath',
    description: 'Channel the full fury of the divine.',
    manaCost: 20,
    multiplier: 3.2,
    damageType: 'magic',
    target: 'single_enemy',
  },

  // Psionicist
  mind_blast: {
    name: 'Mind Blast',
    description: 'Assault the mind of your target.',
    manaCost: 6,
    multiplier: 1.8,
    damageType: 'magic',
    target: 'single_enemy',
  },
  psychic_drain: {
    name: 'Psychic Drain',
    description: 'Siphon mental energy to heal yourself.',
    manaCost: 7,
    multiplier: 0,
    damageType: 'magic',
    target: 'self',
    healAmount: 25,
  },
  telekinesis: {
    name: 'Telekinesis',
    description: 'Hurl objects at all enemies with your mind.',
    manaCost: 9,
    multiplier: 1.1,
    damageType: 'magic',
    target: 'all_enemies',
  },
  confusion: {
    name: 'Confusion',
    description: 'Scramble an enemy\'s thoughts for damage.',
    manaCost: 8,
    multiplier: 1.6,
    damageType: 'magic',
    target: 'single_enemy',
  },
  mind_crush: {
    name: 'Mind Crush',
    description: 'Crush the will of your opponent.',
    manaCost: 15,
    multiplier: 2.5,
    damageType: 'magic',
    target: 'single_enemy',
  },
  dominate: {
    name: 'Dominate',
    description: 'Overwhelm the mind with psionic force.',
    manaCost: 22,
    multiplier: 3.8,
    damageType: 'magic',
    target: 'single_enemy',
  },
};

// Monster templates organized by tier (floor ranges)
export const MONSTERS = [
  // Tier 1: Floors 1-2
  [
    { name: 'Giant Rat', hp: 20, attack: 5, defense: 1, speed: 6 },
    { name: 'Kobold', hp: 25, attack: 6, defense: 2, speed: 5 },
    { name: 'Cave Spider', hp: 18, attack: 7, defense: 1, speed: 8 },
    { name: 'Skeleton', hp: 28, attack: 6, defense: 3, speed: 4 },
    { name: 'Goblin Scout', hp: 22, attack: 5, defense: 2, speed: 7 },
  ],
  // Tier 2: Floors 3-4
  [
    { name: 'Orc Warrior', hp: 45, attack: 10, defense: 5, speed: 5 },
    { name: 'Dark Elf', hp: 35, attack: 12, defense: 3, speed: 8 },
    { name: 'Stone Golem', hp: 60, attack: 8, defense: 9, speed: 2 },
    { name: 'Wraith', hp: 38, attack: 11, defense: 2, speed: 7 },
    { name: 'Venomous Serpent', hp: 30, attack: 13, defense: 2, speed: 9 },
  ],
  // Tier 3: Floors 5-6
  [
    { name: 'Troll', hp: 75, attack: 15, defense: 7, speed: 4 },
    { name: 'Vampire', hp: 55, attack: 18, defense: 5, speed: 8 },
    { name: 'Fire Elemental', hp: 50, attack: 20, defense: 4, speed: 6 },
    { name: 'Minotaur', hp: 80, attack: 16, defense: 8, speed: 5 },
  ],
  // Tier 4: Floors 7-8
  [
    { name: 'Lich', hp: 90, attack: 22, defense: 8, speed: 6 },
    { name: 'Death Knight', hp: 100, attack: 20, defense: 12, speed: 5 },
    { name: 'Elder Dragon', hp: 120, attack: 25, defense: 10, speed: 7 },
    { name: 'Demon Lord', hp: 110, attack: 24, defense: 9, speed: 8 },
  ],
];

export const BOSSES = [
  { name: 'Goblin King', hp: 80, attack: 12, defense: 6, speed: 5 },
  { name: 'Shadow Necromancer', hp: 120, attack: 18, defense: 7, speed: 6 },
  { name: 'Infernal Warden', hp: 180, attack: 24, defense: 10, speed: 5 },
  { name: 'Aardwolf the Devourer', hp: 250, attack: 30, defense: 14, speed: 7 },
];

export const LOOT_TABLES = [
  // Weapons
  { id: 'sword', name: 'Iron Sword', type: 'weapon', subtype: 'sword', slot: 'weapon', stats: { attack: 4 }, value: 15, description: 'A sturdy iron blade.' },
  { id: 'axe', name: 'Battle Axe', type: 'weapon', subtype: 'axe', slot: 'weapon', stats: { attack: 5 }, value: 18, description: 'A heavy double-edged axe.' },
  { id: 'staff', name: 'Oak Staff', type: 'weapon', subtype: 'staff', slot: 'weapon', stats: { attack: 3 }, value: 12, description: 'A gnarled wooden staff humming with latent energy.' },
  { id: 'dagger', name: 'Steel Dagger', type: 'weapon', subtype: 'dagger', slot: 'weapon', stats: { attack: 3 }, value: 10, description: 'A quick, sharp blade.' },
  { id: 'bow', name: 'Longbow', type: 'weapon', subtype: 'bow', slot: 'weapon', stats: { attack: 4 }, value: 14, description: 'A yew longbow with good draw weight.' },

  // Armor
  { id: 'leather_armor', name: 'Leather Armor', type: 'armor', subtype: 'leather', slot: 'armor', stats: { defense: 3 }, value: 12, description: 'Supple leather padding.' },
  { id: 'chain_armor', name: 'Chainmail', type: 'armor', subtype: 'chain', slot: 'armor', stats: { defense: 5 }, value: 22, description: 'Interlocked steel rings.' },
  { id: 'plate_armor', name: 'Plate Armor', type: 'armor', subtype: 'plate', slot: 'armor', stats: { defense: 8 }, value: 35, description: 'Heavy steel plates forged for war.' },

  // Shields
  { id: 'wooden_shield', name: 'Wooden Shield', type: 'shield', subtype: 'shield', slot: 'shield', stats: { defense: 2 }, value: 8, description: 'A round wooden shield.' },
  { id: 'iron_shield', name: 'Iron Shield', type: 'shield', subtype: 'shield', slot: 'shield', stats: { defense: 4 }, value: 18, description: 'A heavy iron kite shield.' },

  // Accessories
  { id: 'ring_str', name: 'Ring of Might', type: 'accessory', subtype: 'ring', slot: 'accessory', stats: { attack: 2 }, value: 20, description: 'A ring that pulses with raw power.' },
  { id: 'amulet_def', name: 'Amulet of Warding', type: 'accessory', subtype: 'amulet', slot: 'accessory', stats: { defense: 3 }, value: 22, description: 'A protective charm on a silver chain.' },

  // Consumables
  { id: 'health_potion', name: 'Health Potion', type: 'consumable', subtype: 'potion', slot: null, stats: {}, value: 8, description: 'A vial of red liquid.', healAmount: 30 },
  { id: 'mana_potion', name: 'Mana Potion', type: 'consumable', subtype: 'potion', slot: null, stats: {}, value: 8, description: 'A vial of blue liquid.', manaAmount: 25 },
  { id: 'greater_health', name: 'Greater Health Potion', type: 'consumable', subtype: 'potion', slot: null, stats: {}, value: 18, description: 'A large flask of crimson elixir.', healAmount: 60 },
];

export const EXPLORATION_RANKS = [
  { name: 'Novice', minPercent: 0, lootBoost: 0 },
  { name: 'Scout', minPercent: 20, lootBoost: 1 },
  { name: 'Explorer', minPercent: 40, lootBoost: 2 },
  { name: 'Pathfinder', minPercent: 60, lootBoost: 3 },
  { name: 'Cartographer', minPercent: 80, lootBoost: 4 },
  { name: 'Dungeon Master', minPercent: 95, lootBoost: 5 },
];

// Room template data
const ROOM_TEMPLATES = {
  entrance: [
    { title: 'Dungeon Entrance', description: 'Crumbling stone steps descend into darkness. The air smells of damp earth and forgotten ages.' },
    { title: 'Gaping Maw', description: 'The dungeon entrance yawns open like the mouth of a great beast. Cold air rushes upward from below.' },
    { title: 'Broken Gates', description: 'Rusted iron gates hang from shattered hinges. Something moved in the shadows beyond.' },
    { title: 'Ancient Threshold', description: 'Worn runes frame the archway, their faint glow the only welcome you will find here.' },
    { title: 'Collapsed Entry', description: 'Rubble partially blocks the passage ahead. You squeeze through into the musty gloom.' },
  ],
  corridor: [
    { title: 'Narrow Corridor', description: 'The walls press close, slick with moisture. Your footsteps echo ahead into nothing.' },
    { title: 'Winding Passage', description: 'The passage twists and turns, carved roughly through ancient stone.' },
    { title: 'Torchlit Hall', description: 'Sputtering torches line the walls, casting dancing shadows that play tricks on your eyes.' },
    { title: 'Crumbling Tunnel', description: 'Dust sifts from cracks in the ceiling. This section could collapse at any moment.' },
    { title: 'Mossy Corridor', description: 'Thick green moss carpets the floor and walls. The air is thick with the smell of rot.' },
    { title: 'Bone-Strewn Path', description: 'Bones of past adventurers litter the ground. A grim reminder of the dangers ahead.' },
  ],
  chamber: [
    { title: 'Dark Chamber', description: 'A spacious room opens before you, pillars supporting a vaulted ceiling lost in shadow.' },
    { title: 'Flooded Hall', description: 'Ankle-deep water fills this chamber. Something ripples beneath the murky surface.' },
    { title: 'Ruined Library', description: 'Collapsed bookshelves and scattered pages fill this once-grand reading room.' },
    { title: 'Fungal Grotto', description: 'Luminescent mushrooms sprout from every surface, bathing the chamber in an eerie blue glow.' },
    { title: 'Torture Chamber', description: 'Rusted chains and cruel devices line the walls. Dark stains mark the stone floor.' },
    { title: 'Ancient Armory', description: 'Weapon racks line the walls, most empty. A few corroded blades remain.' },
  ],
  safe: [
    { title: 'Hidden Sanctuary', description: 'A warm glow emanates from crystalline formations. The air feels pure and still here.' },
    { title: 'Abandoned Camp', description: 'Someone left behind a bedroll and cold fire pit. It seems safe enough to rest.' },
    { title: 'Sacred Alcove', description: 'A small shrine stands untouched by the dungeon\'s corruption. Peace fills this space.' },
    { title: 'Spring Chamber', description: 'A natural spring bubbles up through the stone floor. The water is cool and refreshing.' },
    { title: 'Sealed Room', description: 'Heavy stone doors keep the darkness at bay. Protective wards still glow faintly on the walls.' },
  ],
  shop: [
    { title: 'Underground Market', description: 'A resourceful merchant has set up shop at this crossroads. How they got here is a mystery.' },
    { title: 'Goblin Bazaar', description: 'A shrewd goblin trader squats behind piles of salvaged goods, eyes glinting with greed.' },
    { title: 'Wandering Peddler', description: 'A cloaked figure beckons from behind a makeshift counter. "Finest goods in the deep," they whisper.' },
    { title: 'Supply Cache', description: 'Crates and barrels are stacked neatly against the wall. A sign reads: "Take what you need. Leave gold."' },
    { title: 'Enchanter\'s Nook', description: 'Glowing runes cover the walls of this small chamber where a hooded figure sells their wares.' },
  ],
  stairs: [
    { title: 'Descending Stairway', description: 'Worn stone steps spiral downward into deeper darkness. A foul wind rises from below.' },
    { title: 'Collapsed Shaft', description: 'A vertical shaft drops into the next level. Crude handholds have been carved into the rock.' },
    { title: 'Grand Staircase', description: 'A wide marble staircase descends between towering statues of forgotten heroes.' },
    { title: 'Iron Ladder', description: 'A rusted iron ladder disappears through a hole in the floor. It groans under your weight.' },
    { title: 'Root Passage', description: 'Massive tree roots form a natural stairway down. The air grows colder with each step.' },
  ],
};

export function createTemplateProvider() {
  return {
    getRoomTemplate(type, floorLevel, rng) {
      const templates = ROOM_TEMPLATES[type] || ROOM_TEMPLATES.corridor;
      return rng.pick(templates);
    },

    generateEnemies(floorLevel, rng) {
      const tierIndex = Math.min(Math.floor((floorLevel - 1) / 2), MONSTERS.length - 1);
      const tier = MONSTERS[tierIndex];
      const count = rng.nextInt(1, 3);
      const enemies = [];
      for (let i = 0; i < count; i++) {
        const template = rng.pick(tier);
        const scale = 1 + (floorLevel - 1) * 0.15;
        enemies.push({
          name: template.name,
          hp: Math.round(template.hp * scale),
          maxHp: Math.round(template.hp * scale),
          attack: Math.round(template.attack * scale),
          defense: Math.round(template.defense * scale),
          speed: template.speed,
          xp: Math.round(20 + floorLevel * 10),
        });
      }
      return enemies;
    },

    generateBoss(floorLevel, rng) {
      const bossIndex = Math.min(Math.floor((floorLevel - 1) / 2), BOSSES.length - 1);
      const template = BOSSES[bossIndex];
      const scale = 1 + (floorLevel - 1) * 0.2;
      return [{
        name: template.name,
        hp: Math.round(template.hp * scale),
        maxHp: Math.round(template.hp * scale),
        attack: Math.round(template.attack * scale),
        defense: Math.round(template.defense * scale),
        speed: template.speed,
        xp: Math.round(80 + floorLevel * 20),
      }];
    },

    generateRoomItems(floorLevel, rng) {
      const consumables = LOOT_TABLES.filter(t => t.type === 'consumable');
      const template = rng.pick(consumables);
      const { createItem } = { createItem: (tmpl, lvl, r) => {
        // Inline simple item creation for room items
        return {
          id: tmpl.id + '_' + r.nextInt(1000, 9999),
          templateId: tmpl.id,
          name: tmpl.name,
          type: tmpl.type,
          subtype: tmpl.subtype || null,
          slot: tmpl.slot || null,
          rarity: 'common',
          stats: { ...(tmpl.stats || {}) },
          value: tmpl.value || 5,
          description: tmpl.description || '',
          healAmount: tmpl.healAmount,
          manaAmount: tmpl.manaAmount,
        };
      }};
      return [createItem(template, floorLevel, rng)];
    },

    generateShopItems(floorLevel, rng) {
      const count = rng.nextInt(3, 5);
      const items = [];
      const used = new Set();
      for (let i = 0; i < count; i++) {
        let template;
        let attempts = 0;
        do {
          template = rng.pick(LOOT_TABLES);
          attempts++;
        } while (used.has(template.id) && attempts < 10);
        used.add(template.id);

        const scale = 1 + floorLevel * 0.25;
        const stats = {};
        if (template.stats) {
          for (const [k, v] of Object.entries(template.stats)) {
            stats[k] = Math.max(1, Math.round(v * scale));
          }
        }
        items.push({
          id: template.id + '_shop_' + rng.nextInt(1000, 9999),
          templateId: template.id,
          name: template.name,
          type: template.type,
          subtype: template.subtype || null,
          slot: template.slot || null,
          rarity: 'common',
          stats,
          value: Math.round((template.value || 10) * scale),
          description: template.description || '',
          healAmount: template.healAmount ? Math.round(template.healAmount * scale) : undefined,
          manaAmount: template.manaAmount ? Math.round(template.manaAmount * scale) : undefined,
        });
      }
      return items;
    },
  };
}
