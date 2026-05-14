// GemStone IV - Rules / How to Play

export const RULES_HTML = `
<h3>Welcome to GemStone IV</h3>
<p>You have entered the depths beneath the DragonSpine Mountains, a vast network of corridors, chambers, and caverns teeming with danger and ancient secrets. Your goal: descend through five floors, defeat the guardians of each level, and escape alive.</p>

<h3>The Ten Professions</h3>
<table>
  <tr><th>Profession</th><th>Focus</th><th>Style</th></tr>
  <tr><td>Warrior</td><td>Physical</td><td>High HP, melee attacks, cleave and whirlwind</td></tr>
  <tr><td>Rogue</td><td>Physical</td><td>Stealth, backstabs, high burst damage</td></tr>
  <tr><td>Wizard</td><td>Arcane Magic</td><td>Powerful spells: Fireball, Lightning Bolt, Meteor Swarm</td></tr>
  <tr><td>Cleric</td><td>Spiritual</td><td>Healing and divine offensive magic</td></tr>
  <tr><td>Empath</td><td>Healing</td><td>Best healer, empathic transfer of wounds</td></tr>
  <tr><td>Sorcerer</td><td>Dark Magic</td><td>Soul drain, implosion, voidstrike</td></tr>
  <tr><td>Ranger</td><td>Nature</td><td>Ranged attacks, tracking, nature magic</td></tr>
  <tr><td>Bard</td><td>Songs</td><td>Buff/debuff songs that affect all enemies</td></tr>
  <tr><td>Monk</td><td>Martial</td><td>Unarmed combat, kicks, quivering palm</td></tr>
  <tr><td>Paladin</td><td>Holy Combat</td><td>Mix of healing and divine offensive power</td></tr>
</table>

<h3>Skill-Use Progression</h3>
<p>Skills improve through use, not by spending points. Every time you swing a sword, your <strong>Edged Weapons</strong> skill increases. Cast a spell, and your <strong>Arcane Lore</strong> grows. Rest in a safe room, and your <strong>Foraging</strong> knowledge deepens. Move to a new room, and your <strong>Perception</strong> sharpens.</p>
<p>Skills are tracked in the sidebar. When you reach a new rank (every 10 points), you will see a notification. Higher skill ranks increase your effectiveness with those abilities.</p>
<p>The nine skills are:</p>
<ul>
  <li><strong>Edged Weapons</strong> &mdash; Swords, daggers, axes</li>
  <li><strong>Blunt Weapons</strong> &mdash; Maces, hammers, staves, unarmed strikes</li>
  <li><strong>Ranged Weapons</strong> &mdash; Bows and thrown weapons</li>
  <li><strong>Arcane Lore</strong> &mdash; Knowledge of elemental and arcane magic</li>
  <li><strong>Spiritual Lore</strong> &mdash; Knowledge of divine and spiritual forces</li>
  <li><strong>Healing</strong> &mdash; Mending wounds and restoring life</li>
  <li><strong>Stealth</strong> &mdash; Moving unseen, striking from shadows</li>
  <li><strong>Perception</strong> &mdash; Awareness, noticing hidden details</li>
  <li><strong>Foraging</strong> &mdash; Finding herbs, understanding nature</li>
</ul>

<h3>Spell Preparation</h3>
<p>Powerful spells require <strong>two turns</strong> to cast. On the first turn, you <em>prepare</em> the spell &mdash; you will see a glowing indicator and a "Cast!" button. On the second turn, you release the spell for devastating effect.</p>
<p><strong>Warning:</strong> If you perform any other action (attacking, using an item, moving) while preparing a spell, your concentration breaks and the spell fizzles! Prepared spells have higher damage multipliers to compensate for the extra turn.</p>
<p>Abilities that require preparation are marked with "(Prep)" in their description.</p>

<h3>Quests</h3>
<p>As you explore, you may discover quests &mdash; narrative threads woven into the dungeon. Quest triggers are tied to specific room types and floors. When you enter a room that matches a quest stage's conditions, the quest advances automatically.</p>
<p>Quest rewards include experience points and sometimes rare items. Active quests and their current objectives are displayed in the sidebar.</p>

<h3>Item Examination</h3>
<p>Every item in GemStone has a story. Use the <strong>Examine</strong> button to reveal an item's lore description &mdash; flavor text that reveals the item's history, craftsmanship, and provenance. Examination costs no turns.</p>

<h3>Exploration</h3>
<p>Each floor is a network of interconnected rooms. Navigate using directional buttons (Go north, Go south, etc.). Unexplored rooms are marked with (?). Clear enemies from the stairs room to descend to the next floor.</p>
<p>Safe rooms allow you to rest and fully recover. Shops let you purchase equipment and supplies with gold earned from combat.</p>

<h3>Combat</h3>
<p>When you encounter enemies, choose to fight. Combat is turn-based with initiative determining order. You can attack, use abilities, cast spells, or use items. Defeat all enemies to claim victory, earn XP, and collect loot.</p>
<p>Upon leveling up, you receive 3 stat points to allocate among STR, DEX, INT, WIS, and CON.</p>

<h3>The World</h3>
<p>GemStone IV is a world of deep lore and rich atmosphere. Pay attention to room descriptions &mdash; they paint the picture of the ancient, dangerous place you have entered. The prose is the game's soul. Read carefully, and the dungeon will come alive around you.</p>
`;
