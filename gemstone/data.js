// GemStone IV - Data Definitions
// Professions, abilities, skills, monsters, loot, quests, and rich room templates

// ============================================================
// PROFESSIONS (classDefs)
// ============================================================
export const PROFESSIONS = {
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    description: 'A master of arms whose blade speaks louder than words.',
    stats: { str: 16, dex: 12, int: 8, wis: 8, con: 14 },
    hpPerLevel: 14,
    manaPerLevel: 2,
    abilities: ['slash', 'shield_bash'],
    skills: { edged_weapons: 5, blunt_weapons: 3, perception: 2 },
    abilityUnlocks: { 3: 'cleave', 5: 'berserker_rage', 7: 'whirlwind' },
  },
  rogue: {
    id: 'rogue',
    name: 'Rogue',
    description: 'A shadow-walker who strikes where armor fails.',
    stats: { str: 10, dex: 16, int: 10, wis: 8, con: 10 },
    hpPerLevel: 10,
    manaPerLevel: 3,
    abilities: ['backstab', 'cheap_shot'],
    skills: { edged_weapons: 3, stealth: 6, perception: 4 },
    abilityUnlocks: { 3: 'shadow_strike', 5: 'eviscerate', 7: 'assassinate' },
  },
  wizard: {
    id: 'wizard',
    name: 'Wizard',
    description: 'An arcanist who bends the elements to devastating effect.',
    stats: { str: 6, dex: 10, int: 18, wis: 12, con: 8 },
    hpPerLevel: 7,
    manaPerLevel: 12,
    abilities: ['arcane_bolt', 'fireball'],
    skills: { arcane_lore: 6, perception: 3, foraging: 1 },
    abilityUnlocks: { 3: 'lightning_bolt', 5: 'ice_storm', 7: 'meteor_swarm' },
  },
  cleric: {
    id: 'cleric',
    name: 'Cleric',
    description: 'A vessel of divine power, mending flesh and smiting evil.',
    stats: { str: 12, dex: 8, int: 10, wis: 16, con: 12 },
    hpPerLevel: 11,
    manaPerLevel: 8,
    abilities: ['smite', 'heal'],
    skills: { blunt_weapons: 4, spiritual_lore: 5, healing: 4 },
    abilityUnlocks: { 3: 'divine_shield', 5: 'holy_fire', 7: 'resurrection_light' },
  },
  empath: {
    id: 'empath',
    name: 'Empath',
    description: 'A sensitive soul who draws wounds into themselves to heal others.',
    stats: { str: 8, dex: 10, int: 12, wis: 18, con: 10 },
    hpPerLevel: 8,
    manaPerLevel: 10,
    abilities: ['heal', 'empathic_transfer'],
    skills: { healing: 7, spiritual_lore: 4, perception: 3 },
    abilityUnlocks: { 3: 'greater_heal', 5: 'purify', 7: 'mass_heal' },
  },
  sorcerer: {
    id: 'sorcerer',
    name: 'Sorcerer',
    description: 'A wielder of dark and elemental forces, feared by all.',
    stats: { str: 7, dex: 10, int: 17, wis: 14, con: 8 },
    hpPerLevel: 7,
    manaPerLevel: 11,
    abilities: ['dark_bolt', 'soul_drain'],
    skills: { arcane_lore: 5, spiritual_lore: 4, perception: 2 },
    abilityUnlocks: { 3: 'implosion', 5: 'bone_shatter', 7: 'voidstrike' },
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    description: 'A warden of the wild, tracking prey through any terrain.',
    stats: { str: 12, dex: 14, int: 10, wis: 12, con: 12 },
    hpPerLevel: 11,
    manaPerLevel: 5,
    abilities: ['arrow_shot', 'natures_touch'],
    skills: { ranged_weapons: 5, foraging: 5, perception: 4, stealth: 2 },
    abilityUnlocks: { 3: 'volley', 5: 'entangle', 7: 'call_lightning' },
  },
  bard: {
    id: 'bard',
    name: 'Bard',
    description: 'A weaver of song whose melodies bolster allies and bewilder foes.',
    stats: { str: 10, dex: 14, int: 14, wis: 10, con: 10 },
    hpPerLevel: 9,
    manaPerLevel: 7,
    abilities: ['battle_song', 'discordant_note'],
    skills: { edged_weapons: 3, arcane_lore: 3, perception: 4, stealth: 2 },
    abilityUnlocks: { 3: 'lullaby', 5: 'war_chant', 7: 'symphony_of_blades' },
  },
  monk: {
    id: 'monk',
    name: 'Monk',
    description: 'A martial artist whose body is the ultimate weapon.',
    stats: { str: 14, dex: 16, int: 8, wis: 12, con: 12 },
    hpPerLevel: 12,
    manaPerLevel: 3,
    abilities: ['roundhouse_kick', 'palm_strike'],
    skills: { blunt_weapons: 4, stealth: 3, perception: 3 },
    abilityUnlocks: { 3: 'flying_kick', 5: 'iron_fist', 7: 'quivering_palm' },
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    description: 'A holy knight whose faith is both shield and sword.',
    stats: { str: 14, dex: 8, int: 10, wis: 14, con: 14 },
    hpPerLevel: 13,
    manaPerLevel: 6,
    abilities: ['holy_strike', 'heal'],
    skills: { edged_weapons: 4, spiritual_lore: 4, healing: 3, perception: 2 },
    abilityUnlocks: { 3: 'lay_on_hands', 5: 'divine_smite', 7: 'radiant_aura' },
  },
};

// ============================================================
// ABILITY DEFINITIONS
// ============================================================
export const ABILITY_DEFS = {
  // ---- Instant abilities ----
  slash: {
    id: 'slash', name: 'Slash', manaCost: 0, multiplier: 1.2,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'edged_weapons',
    description: 'A swift blade strike.',
  },
  backstab: {
    id: 'backstab', name: 'Backstab', manaCost: 5, multiplier: 2.0,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'stealth',
    description: 'Strike from the shadows for devastating damage.',
  },
  shield_bash: {
    id: 'shield_bash', name: 'Shield Bash', manaCost: 3, multiplier: 1.0,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'blunt_weapons',
    description: 'Slam your shield into the foe.',
  },
  cheap_shot: {
    id: 'cheap_shot', name: 'Cheap Shot', manaCost: 3, multiplier: 1.4,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'stealth',
    description: 'A dirty but effective strike.',
  },
  smite: {
    id: 'smite', name: 'Smite', manaCost: 8, multiplier: 1.6,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'spiritual_lore',
    description: 'Call down divine wrath upon the unholy.',
  },
  arrow_shot: {
    id: 'arrow_shot', name: 'Arrow Shot', manaCost: 0, multiplier: 1.3,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'ranged_weapons',
    description: 'Loose a precise arrow.',
  },
  roundhouse_kick: {
    id: 'roundhouse_kick', name: 'Roundhouse Kick', manaCost: 4, multiplier: 1.5,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'blunt_weapons',
    description: 'A spinning kick that catches foes off guard.',
  },
  holy_strike: {
    id: 'holy_strike', name: 'Holy Strike', manaCost: 6, multiplier: 1.5,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'spiritual_lore',
    description: 'Infuse your weapon with holy light.',
  },
  palm_strike: {
    id: 'palm_strike', name: 'Palm Strike', manaCost: 2, multiplier: 1.3,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'blunt_weapons',
    description: 'A focused open-hand blow.',
  },
  dark_bolt: {
    id: 'dark_bolt', name: 'Dark Bolt', manaCost: 5, multiplier: 1.4,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'arcane_lore',
    description: 'A bolt of shadow energy.',
  },
  arcane_bolt: {
    id: 'arcane_bolt', name: 'Arcane Bolt', manaCost: 4, multiplier: 1.3,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'arcane_lore',
    description: 'A searing bolt of raw arcane energy.',
  },
  discordant_note: {
    id: 'discordant_note', name: 'Discordant Note', manaCost: 5, multiplier: 1.3,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'arcane_lore',
    description: 'A jarring note that rattles your enemy.',
  },
  cleave: {
    id: 'cleave', name: 'Cleave', manaCost: 8, multiplier: 1.1,
    damageType: 'physical', target: 'all_enemies', skillUsed: 'edged_weapons',
    description: 'A sweeping blow that strikes all foes.',
  },
  shadow_strike: {
    id: 'shadow_strike', name: 'Shadow Strike', manaCost: 10, multiplier: 2.2,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'stealth',
    description: 'Merge with darkness and strike.',
  },
  flying_kick: {
    id: 'flying_kick', name: 'Flying Kick', manaCost: 8, multiplier: 1.8,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'blunt_weapons',
    description: 'Leap through the air with a devastating kick.',
  },
  volley: {
    id: 'volley', name: 'Volley', manaCost: 10, multiplier: 1.0,
    damageType: 'physical', target: 'all_enemies', skillUsed: 'ranged_weapons',
    description: 'Rain arrows upon all enemies.',
  },

  // ---- Healing abilities ----
  heal: {
    id: 'heal', name: 'Heal', manaCost: 8, healAmount: 25,
    damageType: 'magic', target: 'single_ally', skillUsed: 'healing',
    description: 'Mend wounds with spiritual energy.',
    preparationRequired: true,
  },
  empathic_transfer: {
    id: 'empathic_transfer', name: 'Empathic Transfer', manaCost: 6, healAmount: 20,
    damageType: 'magic', target: 'single_ally', skillUsed: 'healing',
    description: 'Draw the wounds of another into yourself.',
  },
  natures_touch: {
    id: 'natures_touch', name: "Nature's Touch", manaCost: 6, healAmount: 18,
    damageType: 'magic', target: 'single_ally', skillUsed: 'healing',
    description: 'Call upon nature to mend flesh.',
  },
  greater_heal: {
    id: 'greater_heal', name: 'Greater Heal', manaCost: 16, healAmount: 50,
    damageType: 'magic', target: 'single_ally', skillUsed: 'healing',
    preparationRequired: true,
    description: 'A powerful invocation of restorative power.',
  },
  lay_on_hands: {
    id: 'lay_on_hands', name: 'Lay on Hands', manaCost: 14, healAmount: 40,
    damageType: 'magic', target: 'single_ally', skillUsed: 'healing',
    preparationRequired: true,
    description: 'Channel divine grace through your touch.',
  },
  purify: {
    id: 'purify', name: 'Purify', manaCost: 12, healAmount: 30,
    damageType: 'magic', target: 'single_ally', skillUsed: 'healing',
    description: 'Cleanse body and spirit of affliction.',
  },
  mass_heal: {
    id: 'mass_heal', name: 'Mass Heal', manaCost: 25, healAmount: 30,
    damageType: 'magic', target: 'all_allies', skillUsed: 'healing',
    preparationRequired: true,
    description: 'Bathe the entire party in restorative light.',
  },
  divine_shield: {
    id: 'divine_shield', name: 'Divine Shield', manaCost: 10, healAmount: 15,
    damageType: 'magic', target: 'self', skillUsed: 'spiritual_lore',
    description: 'Wrap yourself in a shield of divine energy.',
  },

  // ---- Buff/debuff ----
  battle_song: {
    id: 'battle_song', name: 'Battle Song', manaCost: 6, multiplier: 0.5,
    damageType: 'magic', target: 'all_enemies', skillUsed: 'arcane_lore',
    description: 'An inspiring melody that harms foes with sonic force.',
  },
  lullaby: {
    id: 'lullaby', name: 'Lullaby', manaCost: 10, multiplier: 0.3,
    damageType: 'magic', target: 'all_enemies', skillUsed: 'arcane_lore',
    description: 'A soothing song that weakens all enemies.',
  },
  war_chant: {
    id: 'war_chant', name: 'War Chant', manaCost: 14, multiplier: 1.0,
    damageType: 'magic', target: 'all_enemies', skillUsed: 'arcane_lore',
    description: 'A thunderous war cry that damages all foes.',
  },

  // ---- SPELLS (preparationRequired: true, higher multipliers) ----
  fireball: {
    id: 'fireball', name: 'Fireball', manaCost: 12, multiplier: 2.5,
    damageType: 'magic', target: 'all_enemies', skillUsed: 'arcane_lore',
    preparationRequired: true,
    description: 'Conjure a sphere of roaring flame. Requires preparation.',
  },
  lightning_bolt: {
    id: 'lightning_bolt', name: 'Lightning Bolt', manaCost: 10, multiplier: 2.8,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'arcane_lore',
    preparationRequired: true,
    description: 'Call a searing bolt of lightning from the ether.',
  },
  ice_storm: {
    id: 'ice_storm', name: 'Ice Storm', manaCost: 16, multiplier: 2.2,
    damageType: 'magic', target: 'all_enemies', skillUsed: 'arcane_lore',
    preparationRequired: true,
    description: 'Unleash a maelstrom of razor-sharp ice shards.',
  },
  meteor_swarm: {
    id: 'meteor_swarm', name: 'Meteor Swarm', manaCost: 25, multiplier: 3.5,
    damageType: 'magic', target: 'all_enemies', skillUsed: 'arcane_lore',
    preparationRequired: true,
    description: 'Summon a rain of celestial fire upon all foes.',
  },
  implosion: {
    id: 'implosion', name: 'Implosion', manaCost: 14, multiplier: 2.6,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'arcane_lore',
    preparationRequired: true,
    description: 'Collapse the air around your enemy, crushing them inward.',
  },
  bone_shatter: {
    id: 'bone_shatter', name: 'Bone Shatter', manaCost: 18, multiplier: 3.0,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'arcane_lore',
    preparationRequired: true,
    description: 'Rend the very skeleton of your foe apart.',
  },
  voidstrike: {
    id: 'voidstrike', name: 'Voidstrike', manaCost: 24, multiplier: 3.8,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'arcane_lore',
    preparationRequired: true,
    description: 'Tear a hole in reality itself, annihilating what it touches.',
  },
  soul_drain: {
    id: 'soul_drain', name: 'Soul Drain', manaCost: 8, multiplier: 1.5,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'spiritual_lore',
    preparationRequired: true,
    description: 'Siphon the life force from your enemy.',
  },
  holy_fire: {
    id: 'holy_fire', name: 'Holy Fire', manaCost: 14, multiplier: 2.4,
    damageType: 'magic', target: 'all_enemies', skillUsed: 'spiritual_lore',
    preparationRequired: true,
    description: 'Sacred flames that scour the unholy from existence.',
  },
  resurrection_light: {
    id: 'resurrection_light', name: 'Resurrection Light', manaCost: 20, healAmount: 60,
    damageType: 'magic', target: 'single_ally', skillUsed: 'healing',
    preparationRequired: true,
    description: 'A blinding radiance that restores even grievous wounds.',
  },
  divine_smite: {
    id: 'divine_smite', name: 'Divine Smite', manaCost: 16, multiplier: 2.5,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'spiritual_lore',
    preparationRequired: true,
    description: 'Channel the full fury of the divine upon a single foe.',
  },
  radiant_aura: {
    id: 'radiant_aura', name: 'Radiant Aura', manaCost: 20, healAmount: 25,
    damageType: 'magic', target: 'all_allies', skillUsed: 'spiritual_lore',
    preparationRequired: true,
    description: 'Emanate a brilliant light that heals all nearby allies.',
  },
  entangle: {
    id: 'entangle', name: 'Entangle', manaCost: 10, multiplier: 1.8,
    damageType: 'magic', target: 'all_enemies', skillUsed: 'foraging',
    preparationRequired: true,
    description: 'Roots burst from the ground to ensnare all enemies.',
  },
  call_lightning: {
    id: 'call_lightning', name: 'Call Lightning', manaCost: 16, multiplier: 2.6,
    damageType: 'magic', target: 'single_enemy', skillUsed: 'arcane_lore',
    preparationRequired: true,
    description: 'Summon a bolt of natural lightning from the heavens.',
  },
  berserker_rage: {
    id: 'berserker_rage', name: 'Berserker Rage', manaCost: 6, multiplier: 2.0,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'edged_weapons',
    description: 'Enter a furious rage, striking with reckless power.',
  },
  whirlwind: {
    id: 'whirlwind', name: 'Whirlwind', manaCost: 12, multiplier: 1.4,
    damageType: 'physical', target: 'all_enemies', skillUsed: 'edged_weapons',
    description: 'Spin in a deadly arc, striking everything nearby.',
  },
  eviscerate: {
    id: 'eviscerate', name: 'Eviscerate', manaCost: 14, multiplier: 2.8,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'stealth',
    description: 'A lethal strike targeting vital organs.',
  },
  assassinate: {
    id: 'assassinate', name: 'Assassinate', manaCost: 20, multiplier: 3.5,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'stealth',
    preparationRequired: true,
    description: 'Study your prey, then deliver a single perfect killing blow.',
  },
  iron_fist: {
    id: 'iron_fist', name: 'Iron Fist', manaCost: 10, multiplier: 2.2,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'blunt_weapons',
    description: 'Harden your fist to the strength of iron and strike.',
  },
  quivering_palm: {
    id: 'quivering_palm', name: 'Quivering Palm', manaCost: 18, multiplier: 3.2,
    damageType: 'physical', target: 'single_enemy', skillUsed: 'blunt_weapons',
    preparationRequired: true,
    description: 'Touch an enemy with a vibration that destroys from within.',
  },
  symphony_of_blades: {
    id: 'symphony_of_blades', name: 'Symphony of Blades', manaCost: 18, multiplier: 2.0,
    damageType: 'magic', target: 'all_enemies', skillUsed: 'arcane_lore',
    preparationRequired: true,
    description: 'An intricate melody that manifests as spectral blades.',
  },
};

// ============================================================
// SKILL DEFINITIONS
// ============================================================
export const SKILL_DEFS = {
  edged_weapons: { id: 'edged_weapons', name: 'Edged Weapons', xpPerUse: 2 },
  blunt_weapons: { id: 'blunt_weapons', name: 'Blunt Weapons', xpPerUse: 2 },
  ranged_weapons: { id: 'ranged_weapons', name: 'Ranged Weapons', xpPerUse: 2 },
  arcane_lore: { id: 'arcane_lore', name: 'Arcane Lore', xpPerUse: 3 },
  spiritual_lore: { id: 'spiritual_lore', name: 'Spiritual Lore', xpPerUse: 3 },
  healing: { id: 'healing', name: 'Healing', xpPerUse: 3 },
  stealth: { id: 'stealth', name: 'Stealth', xpPerUse: 2 },
  perception: { id: 'perception', name: 'Perception', xpPerUse: 1 },
  foraging: { id: 'foraging', name: 'Foraging', xpPerUse: 2 },
};

// ============================================================
// MONSTERS
// ============================================================
export const MONSTERS = [
  { name: 'Shadow Wraith', hp: 22, maxHp: 22, attack: 7, defense: 2, speed: 8, xp: 15 },
  { name: 'Cave Troll', hp: 35, maxHp: 35, attack: 10, defense: 5, speed: 3, xp: 20 },
  { name: 'Spectral Knight', hp: 30, maxHp: 30, attack: 9, defense: 6, speed: 5, xp: 22 },
  { name: 'Bone Shambler', hp: 18, maxHp: 18, attack: 6, defense: 1, speed: 4, xp: 12 },
  { name: 'Venomous Creeper', hp: 15, maxHp: 15, attack: 8, defense: 0, speed: 7, xp: 14 },
  { name: 'Dark Acolyte', hp: 20, maxHp: 20, attack: 11, defense: 2, speed: 6, xp: 18 },
  { name: 'Granite Gargoyle', hp: 28, maxHp: 28, attack: 8, defense: 8, speed: 4, xp: 20 },
  { name: 'Mist Phantom', hp: 16, maxHp: 16, attack: 9, defense: 1, speed: 10, xp: 16 },
  { name: 'Iron Sentinel', hp: 40, maxHp: 40, attack: 7, defense: 10, speed: 2, xp: 22 },
  { name: 'Crimson Bat Swarm', hp: 12, maxHp: 12, attack: 5, defense: 0, speed: 12, xp: 10 },
  { name: 'Lurking Ghoul', hp: 24, maxHp: 24, attack: 8, defense: 3, speed: 6, xp: 16 },
  { name: 'Plague Rat', hp: 10, maxHp: 10, attack: 4, defense: 0, speed: 9, xp: 8 },
  { name: 'Whispering Shade', hp: 19, maxHp: 19, attack: 10, defense: 1, speed: 8, xp: 17 },
  { name: 'Stone Basilisk', hp: 32, maxHp: 32, attack: 9, defense: 7, speed: 3, xp: 24 },
  { name: 'Fell Warg', hp: 26, maxHp: 26, attack: 11, defense: 3, speed: 7, xp: 19 },
];

export const BOSSES = [
  { name: 'The Pale Lord', hp: 80, maxHp: 80, attack: 14, defense: 8, speed: 6, xp: 60 },
  { name: 'Ancient Golem', hp: 120, maxHp: 120, attack: 12, defense: 14, speed: 2, xp: 75 },
  { name: 'The Lich Pharos', hp: 90, maxHp: 90, attack: 18, defense: 6, speed: 7, xp: 80 },
  { name: 'Dread Wyrm', hp: 140, maxHp: 140, attack: 16, defense: 10, speed: 5, xp: 100 },
  { name: 'The Void Herald', hp: 160, maxHp: 160, attack: 20, defense: 12, speed: 8, xp: 120 },
];

// ============================================================
// LOOT TABLES
// ============================================================
export const LOOT_TABLES = [
  // Weapons
  {
    id: 'iron_longsword', name: 'Iron Longsword', type: 'weapon', slot: 'weapon', subtype: 'edged',
    stats: { attack: 4 }, value: 15,
    description: 'A sturdy blade, well-balanced.',
    loreDescription: 'Forged in the river-town of Solhaven, this longsword bears the mark of the Ironwright Guild. Its edge has been honed on a whetstone blessed by clerics of Ronan.',
  },
  {
    id: 'silver_rapier', name: 'Silver Rapier', type: 'weapon', slot: 'weapon', subtype: 'edged',
    stats: { attack: 5 }, value: 25,
    description: 'A slender, elegant thrusting blade.',
    loreDescription: 'The silver inlay along its guard depicts vines of the Wyrdeep Forest. It was crafted for a duellist of House Illistim, though how it ended up here remains a mystery.',
  },
  {
    id: 'oak_staff', name: 'Gnarled Oak Staff', type: 'weapon', slot: 'weapon', subtype: 'blunt',
    stats: { attack: 3 }, value: 12,
    description: 'A twisted staff humming with faint energy.',
    loreDescription: 'Cut from a lightning-struck oak in the Trollfang range, this staff still carries a residual charge. Runes of warding have been burned into its grain by an unknown hand.',
  },
  {
    id: 'war_hammer', name: 'Dwarven War Hammer', type: 'weapon', slot: 'weapon', subtype: 'blunt',
    stats: { attack: 6 }, value: 30,
    description: 'A heavy hammer of dwarven make.',
    loreDescription: 'The head of this hammer is carved from a single block of kroderine ore, mined from the deepest shafts beneath Zul Logoth. The haft is bound in dire bear leather.',
  },
  {
    id: 'hunting_bow', name: 'Yew Hunting Bow', type: 'weapon', slot: 'weapon', subtype: 'ranged',
    stats: { attack: 4 }, value: 18,
    description: 'A well-made bow of flexible yew.',
    loreDescription: 'The grain of this bow whispers of the Wyrdeep, where the yew tree stood for centuries before the ranger who felled it shaped it by hand over a fortnight.',
  },
  // Armor
  {
    id: 'chainmail', name: 'Chainmail Hauberk', type: 'armor', slot: 'armor',
    stats: { defense: 4 }, value: 20,
    description: 'Interlocking steel rings.',
    loreDescription: 'Each link was individually riveted by an apprentice armorer of Wehnimer\'s Landing. It smells faintly of the oil used to prevent rust during the long journey here.',
  },
  {
    id: 'leather_vest', name: 'Studded Leather Vest', type: 'armor', slot: 'armor',
    stats: { defense: 2 }, value: 10,
    description: 'Light armor reinforced with metal studs.',
    loreDescription: 'Tanned from the hide of a Rhan elk, this vest has been reinforced with silver studs arranged in a pattern that some say wards off minor curses.',
  },
  {
    id: 'mithril_shield', name: 'Mithril Buckler', type: 'armor', slot: 'shield',
    stats: { defense: 3 }, value: 35,
    description: 'A lightweight but strong shield.',
    loreDescription: 'Light as breath and strong as conviction, this buckler was hammered from mithril found in the ruins of Ta\'Illistim. An inscription reads: "Steadfast in shadow."',
  },
  // Accessories
  {
    id: 'amulet_protection', name: 'Amulet of Protection', type: 'accessory', slot: 'accessory',
    stats: { defense: 2 }, value: 22,
    description: 'A glowing amulet.',
    loreDescription: 'A teardrop-shaped sapphire set in silver filigree. When held to candlelight, a faint sigil of Lorminstra is visible within the gem\'s depths, a prayer against untimely death.',
  },
  {
    id: 'ring_might', name: 'Ring of Might', type: 'accessory', slot: 'accessory',
    stats: { attack: 2 }, value: 20,
    description: 'A ring that pulses with power.',
    loreDescription: 'This band of cold iron is set with a chip of fire opal. Warriors who wear it report a warmth spreading through their sword arm, and a hunger for battle they cannot explain.',
  },
  // Consumables
  {
    id: 'health_potion', name: 'Tincture of Healing', type: 'consumable',
    healAmount: 30, value: 8,
    description: 'Restores health.',
    loreDescription: 'A rose-gold liquid in a crystal vial, distilled from ambrominas leaf and blessed spring water. It tastes faintly of honey and lightning.',
  },
  {
    id: 'mana_potion', name: 'Essence of Mana', type: 'consumable',
    manaAmount: 25, value: 10,
    description: 'Restores mana.',
    loreDescription: 'This cobalt-blue elixir shimmers with motes of light. Brewed by the Faendryl alchemists, it restores the wellspring of magical energy within the drinker.',
  },
  {
    id: 'greater_health_potion', name: 'Draught of Restoration', type: 'consumable',
    healAmount: 60, value: 20,
    description: 'Greatly restores health.',
    loreDescription: 'A thick, amber draught sealed with wax bearing the sigil of the Empath Guild. The liquid seems to pulse gently, as though it carries a heartbeat of its own.',
  },
  {
    id: 'herb_bundle', name: 'Acantha Leaf Bundle', type: 'consumable',
    healAmount: 15, value: 4,
    description: 'A bundle of healing herbs.',
    loreDescription: 'These pale green leaves were gathered from the windswept slopes of Thanatoph. Rangers swear by their restorative properties, chewing them to dull pain on long hunts.',
  },
];

// ============================================================
// QUESTS
// ============================================================
export const QUESTS = [
  {
    id: 'lost_amulet',
    name: 'The Lost Amulet',
    description: 'A spectral voice pleads for the return of a sacred amulet, stolen by the creatures that now infest these halls.',
    stages: [
      { id: 'find_clue', description: 'Search the corridors for signs of the stolen amulet.', triggerRoomType: 'corridor', rewardXp: 30 },
      { id: 'recover_amulet', description: 'Defeat the creatures guarding the amulet.', triggerRoomType: 'chamber', triggerFloor: 2, rewardXp: 60, rewardItem: 'amulet_protection' },
    ],
  },
  {
    id: 'voice_shadows',
    name: 'Voice in the Shadows',
    description: 'A whispering presence follows you through the darkness, offering cryptic warnings of a great evil deeper below.',
    stages: [
      { id: 'first_whisper', description: 'Listen to the whisper in the dark corridors.', triggerRoomType: 'corridor', rewardXp: 20 },
      { id: 'second_whisper', description: 'Follow the voice deeper into the dungeon.', triggerRoomType: 'corridor', triggerFloor: 3, rewardXp: 40 },
      { id: 'revelation', description: 'Confront the source of the whispers.', triggerRoomType: 'stairs', triggerFloor: 4, rewardXp: 80 },
    ],
  },
  {
    id: 'ancient_guardian',
    name: 'The Ancient Guardian',
    description: 'Legend speaks of an ancient guardian bound to protect these depths. Perhaps its power can be turned to your aid.',
    stages: [
      { id: 'find_inscription', description: 'Discover an inscription hinting at the guardian\'s resting place.', triggerRoomType: 'chamber', rewardXp: 25 },
      { id: 'awaken', description: 'Reach the guardian\'s chamber and prove your worth.', triggerRoomType: 'stairs', triggerFloor: 3, rewardXp: 70, rewardItem: 'ring_might' },
    ],
  },
  {
    id: 'herb_gatherer',
    name: 'The Herb Gatherer\'s Request',
    description: 'A note pinned to the wall begs any brave soul to gather rare acantha leaves from the deeper levels.',
    stages: [
      { id: 'find_note', description: 'Read the herbalist\'s plea near the entrance.', triggerRoomType: 'entrance', rewardXp: 10 },
      { id: 'gather_herbs', description: 'Search the safe rooms for acantha leaves.', triggerRoomType: 'safe', triggerFloor: 2, rewardXp: 35, rewardItem: 'herb_bundle' },
      { id: 'gather_more', description: 'Find rarer specimens deeper below.', triggerRoomType: 'safe', triggerFloor: 4, rewardXp: 50, rewardItem: 'greater_health_potion' },
    ],
  },
  {
    id: 'merchants_debt',
    name: 'The Merchant\'s Debt',
    description: 'A trapped merchant offers a reward if you can clear the path to the surface for him.',
    stages: [
      { id: 'meet_merchant', description: 'Find the stranded merchant.', triggerRoomType: 'shop', rewardXp: 15 },
      { id: 'clear_path', description: 'Clear the monsters near the stairs.', triggerRoomType: 'stairs', triggerFloor: 2, rewardXp: 50, rewardItem: 'silver_rapier' },
    ],
  },
];

// ============================================================
// TEMPLATE PROVIDER
// ============================================================
export function createTemplateProvider() {
  const roomTemplates = {
    entrance: [
      { title: 'Crumbling Gate', description: 'You stand before a crumbling stone gate, half-consumed by ivy and time. The air beyond is cold and carries the scent of wet earth and forgotten ages. Water trickles down the mossy walls in thin, silver threads.' },
      { title: 'Sunken Threshold', description: 'A flight of worn steps descends into the earth. Above, pale sunlight filters through a canopy of twisted roots. Below, darkness waits with the patience of centuries. The distant drip of water echoes like a slow heartbeat.' },
      { title: 'The Broken Arch', description: 'A once-magnificent archway frames the entrance, its keystone cracked and leaning. Carved figures along its columns have been worn smooth by ages of rain and neglect. A draft of cold air sighs outward, carrying whispers too faint to understand.' },
      { title: 'Mouth of the Deep', description: 'The passage opens like a wound in the hillside, its edges jagged with fractured granite. Pale lichen clings to every surface, glowing with a faint bioluminescence that barely illuminates the way forward. Somewhere below, something shifts.' },
      { title: 'The Warded Door', description: 'An iron-bound oak door stands ajar, its surface scored with protective runes that have long since faded. The threshold is worn concave by the passage of countless feet. Beyond, the air tastes of dust and old magic.' },
      { title: 'Fallen Watchtower', description: 'The base of a collapsed watchtower serves as the entrance. Rubble and shattered timbers frame a passage downward. Rain drips from the exposed sky above, pooling in the cracks between broken flagstones.' },
      { title: 'The Whispering Stair', description: 'A spiral staircase descends into shadow, each step carved from a different type of stone. The walls are lined with niches that once held candles; only the blackened wax remains. Every footstep produces an echo that sounds almost like a reply.' },
      { title: 'Pilgrim\'s Rest', description: 'This alcove was once a waystation for pilgrims, its walls painted with faded murals of a forgotten saint. A stone bench sits beneath a dry fountain, and the passage deeper yawns beyond a curtain of hanging roots.' },
    ],
    corridor: [
      { title: 'Narrow Passage', description: 'The corridor narrows until your shoulders nearly brush both walls. The stone here is slick with condensation, and the air carries a mineral tang. Somewhere ahead, a draft flickers an unseen flame.' },
      { title: 'Hall of Echoes', description: 'Your footsteps multiply in this long, vaulted hallway, returning to you as a chorus of phantom travelers. The ceiling is lost in darkness above. Faint scratches on the walls mark the passage of claws -- or desperate fingernails.' },
      { title: 'Flooded Corridor', description: 'Ankle-deep water fills this passage, black and still as ink. Each step sends ripples racing into the dark. The ceiling weeps steadily, and the cold seeps upward through your boots like a living thing.' },
      { title: 'Torchlit Passage', description: 'Guttering torches line the walls at irregular intervals, casting pools of wavering amber light between deep shadows. The flames bend toward you as you pass, as though drawn by your breath. Soot darkens the ceiling in thick layers.' },
      { title: 'Root-Choked Tunnel', description: 'Thick roots have forced their way through the ceiling, hanging like the fingers of some vast, buried hand. You push through curtains of pale tendrils that brush your face with unsettling softness. The air smells of turned earth.' },
      { title: 'Gallery of Faces', description: 'Stone faces protrude from the walls at eye level, their expressions frozen in various states of anguish or ecstasy. Whether they are carvings or something worse, you cannot say. Their empty eyes seem to follow your movement.' },
      { title: 'The Drafty Crossing', description: 'Two corridors intersect here beneath a cracked dome. A cold wind blows from the east, carrying with it the faint sound of distant chanting. Dust motes swirl in the crosscurrent like tiny stars.' },
      { title: 'Collapsed Gallery', description: 'Half the ceiling has caved in here, creating a slope of rubble that narrows the passage. Light filters through gaps in the debris above, thin and grey as winter dawn. The footing is treacherous with loose stone.' },
      { title: 'The Whispering Corridor', description: 'A low, constant susurrus fills this passage, as though the walls themselves are breathing. The stone is warm to the touch, almost feverish. Thin cracks in the mortar pulse with a faint, ruddy glow.' },
      { title: 'Bone-Strewn Path', description: 'The floor is littered with bones, yellowed and cracked with age. They crunch underfoot despite your best efforts at silence. Among the remains you notice both human and inhuman forms, intermingled without ceremony.' },
      { title: 'Mist-Shrouded Hall', description: 'A thick, cold mist clings to the floor of this passage, rising to knee height. Your legs disappear into it as you walk, and the mist swirls in your wake. The moisture beads on every surface, and distant echoes sound muffled and strange.' },
      { title: 'Frozen Passage', description: 'Ice coats the walls and ceiling in crystalline sheets, refracting your torchlight into a thousand tiny rainbows. Your breath hangs in clouds before you. The cold is sharp and absolute, as though winter itself has taken refuge here.' },
    ],
    chamber: [
      { title: 'Ruined Library', description: 'Toppled bookshelves line the walls of this once-grand library. Parchment and vellum litter the floor like fallen leaves, their ink faded to ghosts of words. The smell of ancient paper fills the room, sweet and melancholy.' },
      { title: 'Ritual Chamber', description: 'A circle of dark stone dominates the center of this room, its surface etched with sigils that seem to shift when viewed from the corner of your eye. Candle stubs ring the circle, their wax pooled into frozen rivers on the flagstones.' },
      { title: 'Throne of Bones', description: 'A grotesque throne assembled from countless bones sits upon a raised dais at the far end of this chamber. The eye sockets of the skulls worked into its armrests seem to watch you. The air is heavy with the smell of old incense and something darker beneath it.' },
      { title: 'Sunken Garden', description: 'This chamber was once an underground garden. Beds of dead soil line the walls, and the desiccated husks of strange plants reach toward a ceiling painted to resemble the sky. A single pale mushroom glows softly in one corner, defiant and alive.' },
      { title: 'The Forge', description: 'An enormous forge occupies the center of this room, its bellows long since rotted to leather scraps. The anvil remains, however, pitted and scarred by centuries of use. Scattered tools lie where their owners dropped them, as though they might return at any moment.' },
      { title: 'Ossuary', description: 'Bones are stacked with meticulous care along every wall, arranged in geometric patterns that suggest both reverence and madness. Skulls form rosettes; femurs create arched doorways. Rain drips from above, washing the oldest bones to a polished white.' },
      { title: 'Crystal Grotto', description: 'Natural crystal formations jut from the walls and ceiling, catching even the faintest light and scattering it into prismatic shards across the room. The largest crystal hums with a low, almost inaudible vibration. The air tastes of ozone.' },
      { title: 'Abandoned Barracks', description: 'Rows of rusted cot frames line the walls, their mattresses long since devoured by time and vermin. Dented helmets and broken sword hilts litter the floor. Scratched into the wall near one bunk are the words: "We held the line."' },
      { title: 'Chamber of Mirrors', description: 'Shattered mirrors hang from the walls at odd angles, reflecting your torchlight in fractured, multiplied beams. Your face appears in a dozen fragments, each showing a slightly different expression. The room feels watched, though you are alone.' },
      { title: 'The Weeping Room', description: 'Water streams down the walls in continuous, silent curtains, collecting in a shallow pool that covers the entire floor. The ceiling is lost in mist. The sound is constant, a gentle, encompassing hush that drowns out thought.' },
    ],
    safe: [
      { title: 'Sanctuary', description: 'A circle of warding stones surrounds a clean, dry space. The air here is noticeably warmer, and the oppressive atmosphere of the dungeon seems to part like a curtain. A faded prayer cloth has been draped over a makeshift altar.' },
      { title: 'Hidden Spring', description: 'A natural spring bubbles up through the stone floor, filling a shallow basin carved long ago by patient hands. The water is clear and cold, and drinking it brings a sense of calm clarity. Moss grows thick and green around the basin\'s edge.' },
      { title: 'Hermit\'s Cell', description: 'This small, tidy room was once home to a recluse. A straw pallet, a clay jug, and a shelf of carefully labeled herb jars remain. Someone has scratched a protective sigil into the door frame. The air smells of lavender and dust.' },
      { title: 'The Warm Hearth', description: 'A stone fireplace is built into the far wall, and impossibly, a low fire still burns within it, casting a golden glow across the room. There is no wood, no fuel -- only the steady, comforting flame. Its warmth unknots muscles you did not realize were tense.' },
      { title: 'Grove of Moonlight', description: 'An opening in the ceiling allows a shaft of pale light to fall upon a patch of living moss. Tiny white flowers bloom here in defiance of the darkness. The air carries the scent of night jasmine, and for a moment, the weight of the dungeon lifts.' },
      { title: 'Chapel of Silence', description: 'A small chapel with pews carved from stone. The altar bears a symbol you do not recognize, but its presence radiates calm. The silence here is not the silence of emptiness but of deliberate peace, as though the room itself is holding its breath in reverence.' },
      { title: 'The Still Pool', description: 'A perfectly round pool occupies the center of this room, its surface so still it appears to be a disc of polished obsidian. Your reflection stares back at you with disconcerting clarity. The air is cool and carries the taste of deep earth.' },
      { title: 'Resting Alcove', description: 'A series of stone niches are carved into the walls, each large enough to lie in. Clean straw and folded blankets have been left here by some unknown benefactor. A single candle burns steadily in a sconce, its flame unwavering despite the drafts.' },
    ],
    shop: [
      { title: 'Peddler\'s Nook', description: 'A weathered merchant has laid out goods on a threadbare carpet, surrounded by flickering candles. He nods as you approach, his eyes reflecting the flame-light with an unsettling steadiness. His wares are arranged with the precision of a jeweler.' },
      { title: 'The Buried Market', description: 'Crude shelves have been hammered into the walls, laden with goods salvaged from the dungeon and beyond. A woman with calloused hands and knowing eyes tends the stall. The smell of leather and metal polish mingles with torchsmoke.' },
      { title: 'Alchemist\'s Corner', description: 'Glass bottles of every hue line the shelves of this makeshift apothecary. A hooded figure measures powders on a delicate scale, their movements precise and unhurried. Bundles of dried herbs hang from the ceiling like inverted bouquets.' },
      { title: 'Arms Dealer\'s Cache', description: 'Weapons are displayed on racks with loving care, each blade oiled, each bow strung taut. The dealer, a scarred half-elf, watches you browse with professional detachment. A whetstone and cloth sit ready beside each piece.' },
      { title: 'Wandering Tinker', description: 'A gnomish figure has set up a collapsible workbench, surrounded by tools and trinkets. She grins broadly as you approach, gesturing to her wares with oil-stained fingers. Everything here has been repaired, refurbished, or cleverly reinvented.' },
      { title: 'The Quiet Bazaar', description: 'Several blankets have been spread upon the floor, each bearing the goods of a different unseen vendor. Prices are marked on small slate tiles. The arrangement feels curated, as though an invisible hand still tends this abandoned market.' },
      { title: 'Rune-seller\'s Alcove', description: 'A slight figure sits cross-legged behind a low table covered in stones bearing carved runes. Each stone pulses with faint inner light. The seller speaks in a whisper, as though the runes demand quiet respect.' },
      { title: 'The Deep Trader', description: 'A dwarf sits behind a stone counter, pipe clenched in his teeth, surrounded by goods of surprising quality for this depth. He eyes you appraisingly, calculating your worth and your coin purse with equal shrewdness.' },
    ],
    stairs: [
      { title: 'The Descending Stair', description: 'A broad staircase spirals downward into impenetrable darkness. The steps are worn smooth in the center by centuries of passage. A cold draft rises from below, carrying with it the scent of deeper earth and older stone.' },
      { title: 'Threshold of Depth', description: 'An ornate archway frames a steep descent. The stone here is darker, denser, and the silence is heavier. This is a boundary: beyond it, the dungeon grows older and more dangerous. You feel the weight of the earth above you.' },
      { title: 'The Broken Descent', description: 'The stairway has partially collapsed, forcing you to pick your way down a slope of broken flagstones and crumbled mortar. Darkness pools at the bottom like black water, and the air grows noticeably colder with each step.' },
      { title: 'Guardian\'s Landing', description: 'A wide landing precedes the stairs, flanked by stone sentinels whose weapons have long since crumbled to rust. Their stern faces still guard the passage with silent authority. Beneath your feet, the stone is engraved with warnings in a dead language.' },
      { title: 'The Spiral Down', description: 'A tight spiral staircase corkscrews into the earth. The walls are close, the air thin. Each revolution brings you deeper, and the quality of the silence changes -- becoming denser, more watchful, as though the darkness itself is taking notice.' },
      { title: 'Chasm Bridge', description: 'A narrow stone bridge spans a chasm of unknown depth. Below, you hear the distant rush of underground water and the occasional clatter of falling stone. The far side leads to stairs that descend into the next level.' },
      { title: 'The Iron Gate', description: 'A massive iron gate, green with verdigris, guards the way down. It stands open, but the mechanism of chains and counterweights suggests it could be sealed shut at any moment. Beyond, the stairs vanish into a darkness that swallows light.' },
      { title: 'Winding Cavern', description: 'The worked stone gives way to natural cavern as the path winds downward. Stalactites hang like fangs from the ceiling, and the floor is slick with mineral deposits. The transition from crafted dungeon to raw earth is gradual and unsettling.' },
    ],
  };

  function scaleEnemy(template, floorLevel) {
    const scale = 1 + (floorLevel - 1) * 0.35;
    return {
      ...template,
      hp: Math.round(template.hp * scale),
      maxHp: Math.round(template.maxHp * scale),
      attack: Math.round(template.attack * scale),
      defense: Math.round(template.defense * scale),
    };
  }

  return {
    getRoomTemplate(type, floorLevel, rng) {
      const templates = roomTemplates[type] || roomTemplates.corridor;
      return rng.pick(templates);
    },

    generateEnemies(floorLevel, rng) {
      const count = rng.nextInt(1, Math.min(3, 1 + Math.floor(floorLevel / 2)));
      const enemies = [];
      for (let i = 0; i < count; i++) {
        enemies.push(scaleEnemy(rng.pick(MONSTERS), floorLevel));
      }
      return enemies;
    },

    generateBoss(floorLevel, rng) {
      const bossIdx = Math.min(floorLevel - 1, BOSSES.length - 1);
      return [scaleEnemy(BOSSES[bossIdx], floorLevel)];
    },

    generateRoomItems(floorLevel, rng) {
      const consumables = LOOT_TABLES.filter(i => i.type === 'consumable');
      return [{ ...rng.pick(consumables), id: rng.pick(consumables).id + '_' + rng.nextInt(1000, 9999) }];
    },

    generateShopItems(floorLevel, rng) {
      const shuffled = rng.shuffle([...LOOT_TABLES]);
      const count = rng.nextInt(3, 5);
      return shuffled.slice(0, count).map(item => {
        const scaled = { ...item };
        if (scaled.stats) {
          scaled.stats = { ...scaled.stats };
          for (const k of Object.keys(scaled.stats)) {
            scaled.stats[k] = Math.round(scaled.stats[k] * (1 + floorLevel * 0.15));
          }
        }
        scaled.value = Math.round((scaled.value || 10) * (1 + floorLevel * 0.2));
        scaled.id = scaled.id + '_shop_' + rng.nextInt(1000, 9999);
        return scaled;
      });
    },
  };
}
