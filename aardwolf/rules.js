// Aardwolf MUD - Rules / How to Play
export const RULES_HTML = `
<h3>Objective</h3>
<p>Explore the dungeon, defeat the boss on each floor, and descend the stairs to reach deeper levels.
Survive all floors and escape to win. Dying means starting over.</p>

<h3>Classes</h3>
<table>
  <tr><th>Class</th><th>Role</th><th>Key Stats</th></tr>
  <tr><td>Warrior</td><td>Melee Tank</td><td>STR, CON</td></tr>
  <tr><td>Mage</td><td>Ranged Damage</td><td>INT, WIS</td></tr>
  <tr><td>Thief</td><td>Burst Damage</td><td>DEX, STR</td></tr>
  <tr><td>Cleric</td><td>Healer</td><td>WIS, CON</td></tr>
  <tr><td>Ranger</td><td>Ranged Physical</td><td>DEX, STR</td></tr>
  <tr><td>Paladin</td><td>Holy Hybrid</td><td>STR, WIS</td></tr>
  <tr><td>Psionicist</td><td>Psychic Caster</td><td>INT, WIS</td></tr>
</table>

<h3>Combat</h3>
<p>Combat is turn-based. Initiative is determined by DEX and a random roll at the start of each fight.</p>
<ul>
  <li><strong>Attack</strong> &mdash; basic physical attack based on STR and weapon.</li>
  <li><strong>Abilities</strong> &mdash; special moves that cost Mana (MP). Physical abilities scale with STR/weapon; magic abilities scale with INT + WIS.</li>
  <li><strong>Items</strong> &mdash; use consumables like potions during combat.</li>
  <li>Defeat all enemies to win the encounter and collect loot and XP.</li>
</ul>

<h3>Exploration</h3>
<ul>
  <li>Move between rooms using directional actions (north, south, east, west).</li>
  <li>Unvisited rooms are marked with <strong>(?)</strong>.</li>
  <li>Your <strong>Exploration Rank</strong> increases as you visit more rooms, boosting loot quality.</li>
</ul>
<table>
  <tr><th>Rank</th><th>Rooms Visited</th><th>Loot Boost</th></tr>
  <tr><td>Novice</td><td>0%</td><td>None</td></tr>
  <tr><td>Scout</td><td>20%</td><td>+1</td></tr>
  <tr><td>Explorer</td><td>40%</td><td>+2</td></tr>
  <tr><td>Pathfinder</td><td>60%</td><td>+3</td></tr>
  <tr><td>Cartographer</td><td>80%</td><td>+4</td></tr>
  <tr><td>Dungeon Master</td><td>95%</td><td>+5</td></tr>
</table>

<h3>Room Types</h3>
<ul>
  <li><strong>Corridors &amp; Chambers</strong> &mdash; may contain enemies or items.</li>
  <li><strong>Safe Rooms</strong> &mdash; rest to fully restore HP, MP, and movement.</li>
  <li><strong>Shops</strong> &mdash; spend gold to buy equipment and consumables.</li>
  <li><strong>Stairs</strong> &mdash; guarded by a boss. Defeat the boss to descend.</li>
</ul>

<h3>Items &amp; Equipment</h3>
<ul>
  <li>Items come in four rarities: <span style="color:#aaa">Common</span>, <span style="color:#2ecc71">Uncommon</span>, <span style="color:#3498db">Rare</span>, <span style="color:#9b59b6">Epic</span>.</li>
  <li>Equipment slots: <strong>Weapon, Armor, Shield, Accessory</strong>.</li>
  <li>Open your inventory to equip, use, or drop items.</li>
  <li>Inventory holds up to 10 items.</li>
</ul>

<h3>Leveling Up</h3>
<p>Earn XP from defeating enemies. When you level up:</p>
<ul>
  <li>You gain <strong>3 stat points</strong> to allocate freely.</li>
  <li>HP and MP are fully restored.</li>
  <li>New abilities unlock at levels 3, 5, and 7.</li>
</ul>

<h3>Hot-Seat Multiplayer</h3>
<p>Choose 2-4 players for hot-seat mode. Each player controls their own character on the same device.
A "pass device" screen appears between turns.</p>

<h3>Tips</h3>
<ul>
  <li>Rest at safe rooms before tackling bosses.</li>
  <li>Explore thoroughly for better loot drops.</li>
  <li>Keep health potions in your inventory for emergencies.</li>
  <li>Your game is auto-saved after every action.</li>
</ul>
`;
