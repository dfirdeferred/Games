// ===== GUILDS (classDefs) =====
export const GUILDS = {
  healer: {
    id: 'healer',
    name: 'Healer',
    description: 'Masters of restorative magic. They mend wounds and shield allies from the biting cold.',
    stats: { str: 8, dex: 10, int: 12, wis: 16, con: 10, cha: 12 },
    hpPerLevel: 8,
    manaPerLevel: 12,
    abilities: ['heal', 'purify'],
    row: 'back',
    abilityUnlocks: { 3: 'group_heal', 5: 'divine_ward', 7: 'resurrect' },
  },
  tank: {
    id: 'tank',
    name: 'Guardian',
    description: 'Iron-willed defenders who stand between their allies and the frozen horrors of the deep.',
    stats: { str: 14, dex: 10, int: 8, wis: 10, con: 16, cha: 10 },
    hpPerLevel: 14,
    manaPerLevel: 4,
    abilities: ['taunt', 'shield_wall'],
    row: 'front',
    abilityUnlocks: { 3: 'frost_slam', 5: 'fortify', 7: 'last_stand' },
  },
  dps: {
    id: 'dps',
    name: 'Berserker',
    description: 'Ferocious warriors who channel primal fury into devastating strikes.',
    stats: { str: 16, dex: 14, int: 8, wis: 8, con: 12, cha: 8 },
    hpPerLevel: 11,
    manaPerLevel: 4,
    abilities: ['power_strike', 'rend'],
    row: 'front',
    abilityUnlocks: { 3: 'whirlwind', 5: 'backstab', 7: 'execute' },
  },
  support: {
    id: 'support',
    name: 'Shaman',
    description: 'Wielders of spirit magic who bolster allies and hex enemies with ancient curses.',
    stats: { str: 8, dex: 10, int: 14, wis: 14, con: 10, cha: 12 },
    hpPerLevel: 9,
    manaPerLevel: 10,
    abilities: ['battle_shout', 'weaken'],
    row: 'back',
    abilityUnlocks: { 3: 'frostbite', 5: 'spirit_link', 7: 'blizzard' },
  },
  crafter: {
    id: 'crafter',
    name: 'Artificer',
    description: 'Resourceful inventors who craft potions and gadgets from the materials of the frozen wastes.',
    stats: { str: 10, dex: 12, int: 14, wis: 12, con: 10, cha: 10 },
    hpPerLevel: 9,
    manaPerLevel: 8,
    abilities: ['craft_potion', 'tinker_bomb'],
    row: 'back',
    abilityUnlocks: { 3: 'reinforce', 5: 'alchemical_fire', 7: 'masterwork' },
  },
};

// ===== RACES =====
export const RACES = [
  {
    id: 'human',
    name: 'Human',
    description: 'Versatile and adaptable. Humans gain a small bonus to all stats.',
    statBonuses: { str: 1, dex: 1, int: 1, wis: 1, con: 1, cha: 1 },
    passive: 'Adaptable: +1 to all stats.',
  },
  {
    id: 'elf',
    name: 'Elf',
    description: 'Graceful and magically attuned. Elves excel in intellect and dexterity.',
    statBonuses: { str: -1, dex: 3, int: 3, wis: 1, con: -2, cha: 2 },
    passive: 'Arcane Affinity: +3 INT, +3 DEX, reduced CON.',
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Stout and resilient. Dwarves are born for the frozen mountains and deep caverns.',
    statBonuses: { str: 2, dex: -1, int: 0, wis: 2, con: 4, cha: -1 },
    passive: 'Stone Endurance: +4 CON, +2 STR, reduced DEX.',
  },
  {
    id: 'orc',
    name: 'Orc',
    description: 'Powerful and fierce. Orcs dominate in raw physical combat.',
    statBonuses: { str: 4, dex: 1, int: -2, wis: -1, con: 3, cha: -2 },
    passive: 'Brutal Strength: +4 STR, +3 CON, reduced INT/CHA.',
  },
  {
    id: 'halfling',
    name: 'Halfling',
    description: 'Quick and clever. Halflings are lucky and hard to pin down.',
    statBonuses: { str: -2, dex: 4, int: 1, wis: 1, con: -1, cha: 3 },
    passive: 'Lucky: +4 DEX, +3 CHA, reduced STR.',
  },
];

// ===== ABILITY DEFINITIONS =====
export const ABILITY_DEFS = {
  // Healer
  heal: {
    id: 'heal',
    name: 'Heal',
    manaCost: 8,
    multiplier: 0,
    target: 'single_ally',
    damageType: 'holy',
    healAmount: 25,
    description: 'Restore HP to a single ally.',
  },
  purify: {
    id: 'purify',
    name: 'Purify',
    manaCost: 6,
    multiplier: 0,
    target: 'single_ally',
    damageType: 'holy',
    healAmount: 10,
    description: 'Cleanse and lightly heal an ally.',
  },
  group_heal: {
    id: 'group_heal',
    name: 'Group Heal',
    manaCost: 18,
    multiplier: 0,
    target: 'all_allies',
    damageType: 'holy',
    healAmount: 15,
    description: 'Heal the entire party.',
  },
  divine_ward: {
    id: 'divine_ward',
    name: 'Divine Ward',
    manaCost: 14,
    multiplier: 0,
    target: 'single_ally',
    damageType: 'holy',
    healAmount: 35,
    description: 'A powerful single-target heal.',
  },
  resurrect: {
    id: 'resurrect',
    name: 'Resurrect',
    manaCost: 30,
    multiplier: 0,
    target: 'single_ally',
    damageType: 'holy',
    healAmount: 50,
    description: 'Revive a fallen ally with partial HP.',
  },

  // Tank
  taunt: {
    id: 'taunt',
    name: 'Taunt',
    manaCost: 4,
    multiplier: 0.8,
    target: 'single_enemy',
    damageType: 'physical',
    healAmount: 0,
    description: 'Draw enemy attention. Deals minor damage.',
  },
  shield_wall: {
    id: 'shield_wall',
    name: 'Shield Wall',
    manaCost: 8,
    multiplier: 0,
    target: 'self',
    damageType: 'physical',
    healAmount: 15,
    description: 'Brace yourself, restoring some HP.',
  },
  frost_slam: {
    id: 'frost_slam',
    name: 'Frost Slam',
    manaCost: 6,
    multiplier: 1.4,
    target: 'single_enemy',
    damageType: 'physical',
    healAmount: 0,
    description: 'A heavy ice-infused strike.',
  },
  fortify: {
    id: 'fortify',
    name: 'Fortify',
    manaCost: 10,
    multiplier: 0,
    target: 'self',
    damageType: 'physical',
    healAmount: 25,
    description: 'Steel your resolve and recover HP.',
  },
  last_stand: {
    id: 'last_stand',
    name: 'Last Stand',
    manaCost: 15,
    multiplier: 2.0,
    target: 'single_enemy',
    damageType: 'physical',
    healAmount: 0,
    description: 'A desperate, devastating blow.',
  },

  // DPS
  power_strike: {
    id: 'power_strike',
    name: 'Power Strike',
    manaCost: 5,
    multiplier: 1.6,
    target: 'single_enemy',
    damageType: 'physical',
    healAmount: 0,
    description: 'A focused, powerful attack.',
  },
  rend: {
    id: 'rend',
    name: 'Rend',
    manaCost: 4,
    multiplier: 1.3,
    target: 'single_enemy',
    damageType: 'physical',
    healAmount: 0,
    description: 'A tearing strike that wounds deeply.',
  },
  whirlwind: {
    id: 'whirlwind',
    name: 'Whirlwind',
    manaCost: 10,
    multiplier: 1.0,
    target: 'all_enemies',
    damageType: 'physical',
    healAmount: 0,
    description: 'Strike all enemies in a spinning attack.',
  },
  backstab: {
    id: 'backstab',
    name: 'Backstab',
    manaCost: 8,
    multiplier: 2.2,
    target: 'single_enemy',
    damageType: 'physical',
    healAmount: 0,
    description: 'A deadly strike from the shadows.',
  },
  execute: {
    id: 'execute',
    name: 'Execute',
    manaCost: 12,
    multiplier: 2.5,
    target: 'single_enemy',
    damageType: 'physical',
    healAmount: 0,
    description: 'Finish off a weakened foe.',
  },

  // Support
  battle_shout: {
    id: 'battle_shout',
    name: 'Battle Shout',
    manaCost: 6,
    multiplier: 0,
    target: 'self',
    damageType: 'magic',
    healAmount: 8,
    description: 'Rally yourself with a war cry.',
  },
  weaken: {
    id: 'weaken',
    name: 'Weaken',
    manaCost: 7,
    multiplier: 1.2,
    target: 'single_enemy',
    damageType: 'magic',
    healAmount: 0,
    description: 'Curse an enemy, dealing magic damage.',
  },
  frostbite: {
    id: 'frostbite',
    name: 'Frostbite',
    manaCost: 10,
    multiplier: 1.5,
    target: 'single_enemy',
    damageType: 'magic',
    healAmount: 0,
    description: 'Freeze an enemy with bitter cold.',
  },
  spirit_link: {
    id: 'spirit_link',
    name: 'Spirit Link',
    manaCost: 12,
    multiplier: 0,
    target: 'single_ally',
    damageType: 'magic',
    healAmount: 20,
    description: 'Channel spirits to heal an ally.',
  },
  blizzard: {
    id: 'blizzard',
    name: 'Blizzard',
    manaCost: 18,
    multiplier: 1.3,
    target: 'all_enemies',
    damageType: 'magic',
    healAmount: 0,
    description: 'Unleash a devastating ice storm on all foes.',
  },

  // Crafter
  craft_potion: {
    id: 'craft_potion',
    name: 'Throw Vial',
    manaCost: 5,
    multiplier: 1.1,
    target: 'single_enemy',
    damageType: 'magic',
    healAmount: 0,
    description: 'Hurl a caustic vial at an enemy.',
  },
  tinker_bomb: {
    id: 'tinker_bomb',
    name: 'Tinker Bomb',
    manaCost: 8,
    multiplier: 1.0,
    target: 'all_enemies',
    damageType: 'physical',
    healAmount: 0,
    description: 'Lob a makeshift bomb at all enemies.',
  },
  reinforce: {
    id: 'reinforce',
    name: 'Reinforce',
    manaCost: 6,
    multiplier: 0,
    target: 'single_ally',
    damageType: 'physical',
    healAmount: 12,
    description: 'Patch up an ally with quick repairs.',
  },
  alchemical_fire: {
    id: 'alchemical_fire',
    name: 'Alchemical Fire',
    manaCost: 12,
    multiplier: 1.8,
    target: 'single_enemy',
    damageType: 'magic',
    healAmount: 0,
    description: 'Engulf a foe in alchemical flames.',
  },
  masterwork: {
    id: 'masterwork',
    name: 'Masterwork',
    manaCost: 15,
    multiplier: 0,
    target: 'self',
    damageType: 'physical',
    healAmount: 30,
    description: 'Apply mastercraft repairs to yourself.',
  },
};

// ===== MONSTERS =====
export const MONSTERS = [
  // Tier 1 (floors 1-2)
  { id: 'ice_rat', name: 'Ice Rat', maxHp: 18, attack: 4, defense: 1, speed: 7, row: 'front', tier: 1 },
  { id: 'frost_spider', name: 'Frost Spider', maxHp: 22, attack: 5, defense: 1, speed: 6, row: 'front', tier: 1 },
  { id: 'snow_bat', name: 'Snow Bat', maxHp: 14, attack: 3, defense: 0, speed: 9, row: 'back', tier: 1 },
  { id: 'frozen_skeleton', name: 'Frozen Skeleton', maxHp: 25, attack: 6, defense: 2, speed: 4, row: 'front', tier: 1 },
  // Tier 2 (floors 2-3)
  { id: 'ice_wolf', name: 'Ice Wolf', maxHp: 35, attack: 8, defense: 3, speed: 8, row: 'front', tier: 2 },
  { id: 'glacier_beetle', name: 'Glacier Beetle', maxHp: 40, attack: 7, defense: 5, speed: 3, row: 'front', tier: 2 },
  { id: 'frost_wraith', name: 'Frost Wraith', maxHp: 28, attack: 9, defense: 2, speed: 7, row: 'back', tier: 2 },
  { id: 'ice_troll', name: 'Ice Troll', maxHp: 50, attack: 10, defense: 4, speed: 4, row: 'front', tier: 2 },
  // Tier 3 (floors 3-4)
  { id: 'blizzard_elemental', name: 'Blizzard Elemental', maxHp: 55, attack: 12, defense: 5, speed: 6, row: 'back', tier: 3 },
  { id: 'frost_giant', name: 'Frost Giant', maxHp: 75, attack: 14, defense: 7, speed: 3, row: 'front', tier: 3 },
  { id: 'ice_drake', name: 'Ice Drake', maxHp: 60, attack: 13, defense: 6, speed: 7, row: 'front', tier: 3 },
  { id: 'glacial_lich', name: 'Glacial Lich', maxHp: 45, attack: 15, defense: 3, speed: 5, row: 'back', tier: 3 },
  // Tier 4 (floor 5)
  { id: 'ancient_ice_wyrm', name: 'Ancient Ice Wyrm', maxHp: 90, attack: 18, defense: 8, speed: 5, row: 'front', tier: 4 },
  { id: 'permafrost_golem', name: 'Permafrost Golem', maxHp: 100, attack: 16, defense: 12, speed: 2, row: 'front', tier: 4 },
  { id: 'void_frost_mage', name: 'Void Frost Mage', maxHp: 55, attack: 20, defense: 4, speed: 6, row: 'back', tier: 4 },
];

export const BOSSES = [
  { id: 'frost_queen', name: 'The Frost Queen', maxHp: 80, attack: 12, defense: 5, speed: 6, row: 'front', floor: 1 },
  { id: 'ice_warden', name: 'Warden of the Frozen Gate', maxHp: 120, attack: 15, defense: 8, speed: 4, row: 'front', floor: 2 },
  { id: 'blizzard_lord', name: 'Lord of Blizzards', maxHp: 160, attack: 18, defense: 7, speed: 7, row: 'back', floor: 3 },
  { id: 'glacial_behemoth', name: 'Glacial Behemoth', maxHp: 220, attack: 22, defense: 10, speed: 3, row: 'front', floor: 4 },
  { id: 'icesus_avatar', name: 'Avatar of Icesus', maxHp: 300, attack: 28, defense: 12, speed: 5, row: 'front', floor: 5 },
];

// ===== LOOT TABLES =====
export const LOOT_TABLES = [
  // Weapons
  { id: 'ice_sword', name: 'Frost-Edged Sword', type: 'weapon', slot: 'weapon', stats: { attack: 4 }, value: 15, description: 'A blade coated in perpetual frost.' },
  { id: 'frozen_axe', name: 'Frozen War Axe', type: 'weapon', slot: 'weapon', stats: { attack: 6 }, value: 25, description: 'An axe forged from glacial iron.' },
  { id: 'icicle_dagger', name: 'Icicle Dagger', type: 'weapon', slot: 'weapon', stats: { attack: 3 }, value: 10, description: 'A dagger carved from an eternal icicle.' },
  { id: 'frost_staff', name: 'Frost Staff', type: 'weapon', slot: 'weapon', stats: { attack: 5 }, value: 20, description: 'A staff that channels winter magic.' },
  // Armor
  { id: 'fur_cloak', name: 'Frost Bear Cloak', type: 'armor', slot: 'armor', stats: { defense: 3 }, value: 15, description: 'A thick cloak of frost bear fur.' },
  { id: 'ice_plate', name: 'Glacial Plate', type: 'armor', slot: 'armor', stats: { defense: 6 }, value: 30, description: 'Armor plated with enchanted ice.' },
  { id: 'snow_leather', name: 'Snowhide Armor', type: 'armor', slot: 'armor', stats: { defense: 4 }, value: 20, description: 'Supple leather treated against the cold.' },
  // Shields
  { id: 'ice_buckler', name: 'Ice Buckler', type: 'shield', slot: 'shield', stats: { defense: 2 }, value: 12, description: 'A small shield rimmed with ice.' },
  { id: 'frozen_tower', name: 'Frozen Tower Shield', type: 'shield', slot: 'shield', stats: { defense: 5 }, value: 28, description: 'A massive shield of solid ice.' },
  // Accessories
  { id: 'frost_ring', name: 'Ring of Frost Resistance', type: 'accessory', slot: 'accessory', stats: { defense: 1, attack: 1 }, value: 18, description: 'Warms the wearer against magical cold.' },
  { id: 'icy_amulet', name: 'Amulet of the North', type: 'accessory', slot: 'accessory', stats: { attack: 2, defense: 1 }, value: 22, description: 'An ancient northern talisman.' },
  // Consumables
  { id: 'health_potion', name: 'Warming Tonic', type: 'consumable', healAmount: 25, value: 8, description: 'A hot brew that restores health.' },
  { id: 'mana_potion', name: 'Frost Elixir', type: 'consumable', manaAmount: 20, value: 10, description: 'A shimmering elixir that restores mana.' },
  { id: 'greater_health', name: 'Greater Warming Tonic', type: 'consumable', healAmount: 50, value: 20, description: 'A potent restorative brew.' },
  // Crafting materials
  { id: 'iron_ore', name: 'Iron Ore', type: 'material', value: 5, description: 'Raw iron from the frozen mines.' },
  { id: 'frost_crystal', name: 'Frost Crystal', type: 'material', value: 8, description: 'A crystal pulsing with cold energy.' },
  { id: 'yeti_fur', name: 'Yeti Fur', type: 'material', value: 6, description: 'Thick, warm fur from a mountain yeti.' },
  { id: 'glacial_essence', name: 'Glacial Essence', type: 'material', value: 12, description: 'Concentrated essence of pure frost.' },
  { id: 'bone_dust', name: 'Bone Dust', type: 'material', value: 4, description: 'Ground bones from frozen undead.' },
];

// ===== CRAFTING RECIPES =====
export const CRAFTING_RECIPES = [
  {
    id: 'craft_warming_tonic',
    name: 'Warming Tonic',
    materials: [{ templateId: 'frost_crystal', count: 1 }, { templateId: 'bone_dust', count: 1 }],
    result: { id: 'health_potion', name: 'Warming Tonic', type: 'consumable', healAmount: 25, value: 8 },
  },
  {
    id: 'craft_frost_elixir',
    name: 'Frost Elixir',
    materials: [{ templateId: 'frost_crystal', count: 2 }],
    result: { id: 'mana_potion', name: 'Frost Elixir', type: 'consumable', manaAmount: 20, value: 10 },
  },
  {
    id: 'craft_greater_tonic',
    name: 'Greater Warming Tonic',
    materials: [{ templateId: 'frost_crystal', count: 2 }, { templateId: 'glacial_essence', count: 1 }],
    result: { id: 'greater_health', name: 'Greater Warming Tonic', type: 'consumable', healAmount: 50, value: 20 },
  },
  {
    id: 'craft_frost_blade',
    name: 'Frost-Edged Blade',
    materials: [{ templateId: 'iron_ore', count: 2 }, { templateId: 'frost_crystal', count: 1 }],
    result: { id: 'ice_sword', name: 'Frost-Edged Sword', type: 'weapon', slot: 'weapon', stats: { attack: 4 }, value: 15 },
  },
  {
    id: 'craft_fur_cloak',
    name: 'Frost Bear Cloak',
    materials: [{ templateId: 'yeti_fur', count: 2 }, { templateId: 'bone_dust', count: 1 }],
    result: { id: 'fur_cloak', name: 'Frost Bear Cloak', type: 'armor', slot: 'armor', stats: { defense: 3 }, value: 15 },
  },
  {
    id: 'craft_ice_buckler',
    name: 'Ice Buckler',
    materials: [{ templateId: 'iron_ore', count: 1 }, { templateId: 'glacial_essence', count: 1 }],
    result: { id: 'ice_buckler', name: 'Ice Buckler', type: 'shield', slot: 'shield', stats: { defense: 2 }, value: 12 },
  },
  {
    id: 'craft_frost_bomb',
    name: 'Frost Bomb',
    materials: [{ templateId: 'glacial_essence', count: 1 }, { templateId: 'bone_dust', count: 2 }],
    result: { id: 'frost_bomb', name: 'Frost Bomb', type: 'consumable', healAmount: 0, value: 15, description: 'Deals 30 damage to one enemy.' },
  },
];

// ===== TEMPLATE PROVIDER =====
export function createTemplateProvider() {
  const roomTemplates = {
    entrance: [
      { title: 'Frozen Cave Entrance', description: 'A biting wind howls through the mouth of an ice-crusted cavern. Icicles hang like jagged teeth from the ceiling, and the ground is slick with frost. The air smells of ancient stone and frozen earth.' },
      { title: 'Glacial Rift Opening', description: 'A deep crack in the glacier reveals a passage descending into blue-white darkness. Sheets of ice line the walls, reflecting faint light in ghostly patterns.' },
      { title: 'Snowbound Tunnel', description: 'Snow drifts pile high at the entrance of a natural tunnel. Inside, the temperature drops sharply and the silence is absolute save for the creak of settling ice.' },
    ],
    corridor: [
      { title: 'Frozen Passage', description: 'A narrow corridor of solid ice stretches ahead. The walls glimmer with trapped air bubbles, and your breath forms thick clouds of mist.' },
      { title: 'Ice-Bound Hallway', description: 'The passage is lined with pillars of frozen stone. Frost patterns cover every surface like delicate lacework.' },
      { title: 'Permafrost Tunnel', description: 'The ground beneath your feet is frozen solid, centuries of permafrost creating a floor smoother than polished marble.' },
      { title: 'Glacial Drift', description: 'A long, gently sloping passage carved by ancient meltwater. The ice here is tinged blue and translucent.' },
      { title: 'Windswept Corridor', description: 'An eerie wind channels through this corridor, carrying fine ice crystals that sting exposed skin.' },
    ],
    chamber: [
      { title: 'Frozen Cavern', description: 'A vast cavern opens before you, its ceiling lost in darkness above. Stalagmites of ice rise from the floor like a frozen forest.' },
      { title: 'Crystal Ice Chamber', description: 'The walls of this chamber are studded with enormous ice crystals that catch and fracture light into prismatic displays.' },
      { title: 'Frost-Rimed Hall', description: 'A grand hall with vaulted ceilings of ice. Ancient runes glow faintly beneath the frozen surface of the walls.' },
      { title: 'Glacier Heart', description: 'You stand in the heart of the glacier itself. The ice around you is thousands of years old, compressed into deep sapphire blue.' },
      { title: 'Avalanche Grotto', description: 'This cavern was carved by a massive collapse. Boulders of ice and stone lie scattered across the floor.' },
    ],
    safe: [
      { title: 'Warm Spring Chamber', description: 'A natural hot spring bubbles up through the ice here, filling the chamber with blessed warmth and steam. The air is almost comfortable.' },
      { title: 'Sheltered Ice Alcove', description: 'A small alcove protected from the bitter wind. Someone has left the remains of a campfire and a pile of furs.' },
      { title: 'Ancient Shrine of Warmth', description: 'A shrine to a forgotten god radiates gentle heat. The ice has retreated from its base, leaving a circle of dry stone floor.' },
    ],
    shop: [
      { title: 'Frozen Merchant Camp', description: 'A hardy merchant has set up camp in a widened section of tunnel. Furs, supplies, and weapons are laid out on icy shelves.' },
      { title: 'Ice Dwarf Trading Post', description: 'A cramped but well-stocked trading post run by ice dwarves. Lanterns of captive flame light the frosted displays.' },
    ],
    stairs: [
      { title: 'Descending Ice Shaft', description: 'A spiraling shaft of ice descends deeper into the frozen earth. The air grows colder and the ice grows darker with each step downward.' },
      { title: 'Frozen Stairwell', description: 'Steps carved from solid ice lead down into the abyss. The walls close in, and a faint rumbling echoes from below.' },
    ],
  };

  return {
    getRoomTemplate(type, floorLevel, rng) {
      const templates = roomTemplates[type] || roomTemplates.corridor;
      return rng.pick(templates);
    },

    generateEnemies(floorLevel, rng) {
      const tier = Math.min(4, Math.ceil(floorLevel / 1.5));
      const eligible = MONSTERS.filter(m => m.tier <= tier && m.tier >= tier - 1);
      const count = rng.nextInt(1, Math.min(3, 1 + Math.floor(floorLevel / 2)));
      const enemies = [];
      for (let i = 0; i < count; i++) {
        const template = rng.pick(eligible);
        const scale = 1 + (floorLevel - 1) * 0.15;
        enemies.push({
          ...template,
          maxHp: Math.round(template.maxHp * scale),
          hp: Math.round(template.maxHp * scale),
          attack: Math.round(template.attack * scale),
          defense: Math.round(template.defense * scale),
        });
      }
      return enemies;
    },

    generateBoss(floorLevel, rng) {
      const boss = BOSSES.find(b => b.floor === floorLevel) || BOSSES[BOSSES.length - 1];
      const scale = 1 + (floorLevel - 1) * 0.1;
      return [{
        ...boss,
        maxHp: Math.round(boss.maxHp * scale),
        hp: Math.round(boss.maxHp * scale),
        attack: Math.round(boss.attack * scale),
        defense: Math.round(boss.defense * scale),
      }];
    },

    generateRoomItems(floorLevel, rng) {
      const materials = LOOT_TABLES.filter(l => l.type === 'material');
      const consumables = LOOT_TABLES.filter(l => l.type === 'consumable');
      const pool = [...materials, ...materials, ...consumables]; // weight materials higher
      const item = rng.pick(pool);
      return [{ ...item, id: item.id + '_' + rng.nextInt(1000, 9999) }];
    },

    generateShopItems(floorLevel, rng) {
      const eligible = LOOT_TABLES.filter(l => l.type !== 'material');
      const count = rng.nextInt(3, 5);
      const items = [];
      for (let i = 0; i < count; i++) {
        const template = rng.pick(eligible);
        const scale = 1 + (floorLevel - 1) * 0.2;
        items.push({
          ...template,
          id: template.id + '_shop_' + rng.nextInt(1000, 9999),
          value: Math.round((template.value || 10) * scale),
          stats: template.stats ? Object.fromEntries(
            Object.entries(template.stats).map(([k, v]) => [k, Math.round(v * scale)])
          ) : undefined,
          healAmount: template.healAmount ? Math.round(template.healAmount * scale) : undefined,
          manaAmount: template.manaAmount ? Math.round(template.manaAmount * scale) : undefined,
        });
      }
      return items;
    },
  };
}
