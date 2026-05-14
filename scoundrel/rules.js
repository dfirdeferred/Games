export const RULES_HTML = `
<h3>Objective</h3>
<p>Survive the dungeon and escape with as much health as possible.
You win by playing through the entire deck. Your score is your remaining HP.</p>

<h3>Setup</h3>
<p>A modified 44-card deck is used: a standard 52-card deck with the
<span class="suit-red">red face cards (J, Q, K of Hearts and Diamonds)</span>
and <span class="suit-red">red Aces (A of Hearts and Diamonds)</span> removed.</p>
<p>You start with <strong>20 HP</strong>. Four cards are dealt face-up as your first room.</p>

<h3>Card Types</h3>
<ul>
  <li><span class="suit-black">&clubs; Clubs</span> and
      <span class="suit-black">&spades; Spades</span> &mdash;
      <strong>Monsters</strong>: They deal damage equal to their value
      (2&ndash;10 face value, J=11, Q=12, K=13, A=14).</li>
  <li><span class="suit-red">&diams; Diamonds</span> &mdash;
      <strong>Weapons</strong>: Equip as your current weapon. Strength equals
      the card's value (2&ndash;10).</li>
  <li><span class="suit-red">&hearts; Hearts</span> &mdash;
      <strong>Potions</strong>: Heal HP equal to the card's value (2&ndash;10),
      up to your maximum of 20. Only one potion per room has effect.</li>
</ul>

<h3>Turn Flow</h3>
<p>Each room shows 4 face-up cards. You must play exactly <strong>3</strong> of
the 4 cards, in any order you choose. The remaining card carries over to the
next room, where 3 new cards are dealt to bring it back to 4.</p>

<h3>Fighting Monsters</h3>
<ul>
  <li><strong>No weapon equipped:</strong> You take full damage from the monster.</li>
  <li><strong>Weapon equipped:</strong> Damage is reduced to
      max(0, monster value &minus; weapon value). However, the weapon becomes
      "bound" to the rank of the last monster it defeated.</li>
</ul>

<h3>Weapon Binding</h3>
<p>After defeating a monster with a weapon, that weapon can only be used against
monsters of <strong>equal or lower rank</strong>. If you encounter a monster with
a higher rank than the last one your weapon defeated, you <strong>cannot</strong>
use the weapon &mdash; you fight bare-handed (taking full damage) and the weapon
is destroyed.</p>
<p>Equipping a new weapon replaces the old one. A freshly equipped weapon has
no restriction and can fight any monster.</p>

<h3>Potions</h3>
<p>Only one potion per room actually heals you. If you play a second potion in
the same room, it is discarded with no effect.</p>

<h3>Room Skipping</h3>
<p>Before playing any cards, you may skip the entire room. All 4 cards go to
the bottom of the deck and 4 new cards are dealt. You <strong>cannot skip two
rooms in a row</strong>.</p>

<h3>Winning &amp; Losing</h3>
<p>You <strong>win</strong> when the deck runs out and you finish the final room.
Your score equals your remaining HP.</p>
<p>You <strong>lose</strong> if your HP drops to 0 or below.</p>
`;
