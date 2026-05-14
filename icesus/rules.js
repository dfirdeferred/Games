export const RULES_HTML = `
<h3>Overview</h3>
<p>Icesus is a party-based roguelike dungeon crawler set in a frozen underworld. Lead a party of 2-4 adventurers through five floors of icy caverns, battling monsters, collecting loot, and crafting supplies to survive.</p>

<h3>Party Creation</h3>
<p>Build your party by choosing a name, guild, and race for each member. A balanced party with different roles is key to survival.</p>

<h3>The Five Guilds</h3>
<table>
  <tr><th>Guild</th><th>Role</th><th>Row</th><th>Specialty</th></tr>
  <tr><td>Healer</td><td>Healer</td><td>Back</td><td>Restores HP, group heals, and revival magic</td></tr>
  <tr><td>Guardian</td><td>Tank</td><td>Front</td><td>High HP, taunts enemies, absorbs damage</td></tr>
  <tr><td>Berserker</td><td>DPS</td><td>Front</td><td>Massive damage, cleave attacks, executions</td></tr>
  <tr><td>Shaman</td><td>Support</td><td>Back</td><td>Buffs allies, debuffs enemies, area magic</td></tr>
  <tr><td>Artificer</td><td>Crafter</td><td>Back</td><td>Crafts potions and gear from materials found in the dungeon</td></tr>
</table>

<h3>The Five Races</h3>
<table>
  <tr><th>Race</th><th>Passive</th><th>Key Stats</th></tr>
  <tr><td>Human</td><td>Adaptable: +1 all stats</td><td>Balanced</td></tr>
  <tr><td>Elf</td><td>Arcane Affinity</td><td>DEX, INT</td></tr>
  <tr><td>Dwarf</td><td>Stone Endurance</td><td>CON, STR</td></tr>
  <tr><td>Orc</td><td>Brutal Strength</td><td>STR, CON</td></tr>
  <tr><td>Halfling</td><td>Lucky</td><td>DEX, CHA</td></tr>
</table>

<h3>Front & Back Row</h3>
<p>Each character is assigned to the <strong>front row</strong> or <strong>back row</strong> based on their guild:</p>
<ul>
  <li><strong>Front row</strong> (Guardians, Berserkers): Enemies attack the front row first. These characters should have high HP and defense.</li>
  <li><strong>Back row</strong> (Healers, Shamans, Artificers): Only targeted if the front row is empty. These characters focus on magic and support.</li>
</ul>
<p>Enemies also have rows. You can attack any enemy regardless of their position.</p>

<h3>Combat</h3>
<p>Combat is turn-based. Initiative is rolled at the start of each fight based on DEX. On your turn you can:</p>
<ul>
  <li><strong>Attack</strong> - Basic physical attack on an enemy</li>
  <li><strong>Use Ability</strong> - Cast a spell or special move (costs mana)</li>
  <li><strong>Use Item</strong> - Consume a potion or thrown weapon</li>
</ul>
<p>New abilities are unlocked at levels 3, 5, and 7.</p>

<h3>Crafting</h3>
<p>The Artificer guild can craft items at safe rooms. Collect materials (Iron Ore, Frost Crystals, Yeti Fur, etc.) from defeated enemies and explored rooms, then combine them into potions, weapons, and armor using known recipes.</p>

<h3>Hot-Seat Multiplayer</h3>
<p>Up to 4 players can play on the same device. Each player controls one or more characters. When it is a different player's turn, a pass-device screen appears so the next player can take over.</p>

<h3>Exploration</h3>
<p>Each floor contains rooms connected by passages. Find the stairs guarded by a boss to descend deeper. Safe rooms restore your party. Shops sell equipment and supplies. Survive all 5 floors to escape the frozen depths and win!</p>

<h3>Tips</h3>
<ul>
  <li>Always have at least one front-row character to protect your back row.</li>
  <li>Keep your Healer's mana topped up for boss fights.</li>
  <li>Crafters should hoard materials for powerful recipes.</li>
  <li>Rest at safe rooms before tackling the stairs boss.</li>
  <li>Equip gear as soon as you find upgrades.</li>
</ul>
`;
