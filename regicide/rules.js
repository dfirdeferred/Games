export const RULES_HTML = `
<h3>Objective</h3>
<p>Regicide is a cooperative card game for 1-4 players. Work together to defeat 12 enemies
(4 Jacks, 4 Queens, and 4 Kings) using a standard deck of playing cards. Defeat all 12 to win!</p>

<h3>Setup</h3>
<ul>
  <li><strong>Castle Deck:</strong> 12 face cards form the enemy deck. Shuffle Jacks, Queens, and Kings
    separately, then stack them: Jacks on top, Queens in the middle, Kings on the bottom.</li>
  <li><strong>Tavern Deck:</strong> The remaining 40 cards (A through 10 of each suit) are shuffled
    to form the tavern draw pile.</li>
  <li><strong>Hand Size:</strong> 1 player = 8 cards, 2 players = 7, 3 players = 6, 4 players = 5.</li>
  <li>Flip the top castle card to reveal the first enemy.</li>
  <li><strong>Solo Mode:</strong> The player receives 2 Jester tokens.</li>
</ul>

<h3>Enemy Stats</h3>
<table>
  <tr><th>Enemy</th><th>HP</th><th>Attack</th></tr>
  <tr><td>Jack</td><td>20</td><td>10</td></tr>
  <tr><td>Queen</td><td>30</td><td>15</td></tr>
  <tr><td>King</td><td>40</td><td>20</td></tr>
</table>

<h3>Turn Structure</h3>
<ol>
  <li><strong>Play Phase:</strong> Play a card or combo from your hand, or yield (skip to enemy attack).
    You cannot yield if no one has played a card against the current enemy yet.</li>
  <li><strong>Suit Power Phase:</strong> The suit(s) of your played card(s) trigger special powers
    (see below). If the enemy's suit matches, that power is <strong>blocked</strong>.</li>
  <li><strong>Damage Phase:</strong> Deal damage to the enemy equal to the total attack value
    of your played cards (doubled if clubs power is active).</li>
  <li><strong>Enemy Counterattack:</strong> If the enemy survives, it attacks! You must discard
    cards from your hand whose values total at least the enemy's current attack. If you can't
    cover the full damage, remaining damage passes to the next player. If no one can cover it,
    the game is lost.</li>
</ol>

<h3>Card Values</h3>
<p>Ace = 1, cards 2-10 = face value. Face cards (J/Q/K) are enemies only and cannot be played.</p>

<h3>Combos</h3>
<table>
  <tr><th>Combo Type</th><th>Allowed Ranks</th><th>Example</th></tr>
  <tr><td>Single card</td><td>Any (A-10)</td><td>7<span class="suit-red">&hearts;</span></td></tr>
  <tr><td>Pair (2 cards)</td><td>2-5 only</td><td>4<span class="suit-red">&hearts;</span> + 4<span class="suit-black">&spades;</span> = 8 damage</td></tr>
  <tr><td>Triple (3 cards)</td><td>2-3 only</td><td>3<span class="suit-red">&hearts;</span> + 3<span class="suit-black">&clubs;</span> + 3<span class="suit-red">&diams;</span> = 9 damage</td></tr>
  <tr><td>Quad (4 cards)</td><td>2 only</td><td>All four 2s = 8 damage</td></tr>
</table>

<h3>Suit Powers</h3>
<table>
  <tr><th>Suit</th><th>Power</th><th>Effect Value</th></tr>
  <tr><td><span class="suit-red">&hearts; Hearts</span></td>
    <td>Heal the tavern</td>
    <td>Shuffle discard pile, move N cards from discard to bottom of tavern deck (N = hearts card values played)</td></tr>
  <tr><td><span class="suit-red">&diams; Diamonds</span></td>
    <td>Draw cards</td>
    <td>Draw N cards distributed among all players starting with current player (N = diamond card values played)</td></tr>
  <tr><td><span class="suit-black">&clubs; Clubs</span></td>
    <td>Double damage</td>
    <td>The total attack damage is doubled</td></tr>
  <tr><td><span class="suit-black">&spades; Spades</span></td>
    <td>Weaken enemy</td>
    <td>Reduce enemy's attack by N for the rest of this fight (N = spade card values played)</td></tr>
</table>
<p><strong>Important:</strong> If the enemy's suit matches a played suit, that suit's power is blocked!
For combos with mixed suits, each suit's power activates individually using that suit's card values.</p>

<h3>Defeating an Enemy</h3>
<ul>
  <li>If enemy HP reaches <strong>exactly 0</strong>: the enemy card goes to the bottom of the tavern deck (recyclable).</li>
  <li>If enemy HP goes <strong>below 0</strong>: the enemy card goes to the discard pile.</li>
  <li>After defeating an enemy, flip the next castle card. If none remain, you win!</li>
</ul>

<h3>Enemy Counterattack &amp; Discarding</h3>
<ul>
  <li>The enemy's attack = base attack minus any spades reductions (minimum 0).</li>
  <li>The current player must discard cards from their hand whose values sum to at least the enemy's attack.</li>
  <li>If the current player runs out of cards, remaining damage passes clockwise to the next player.</li>
  <li>If no player can cover the remaining damage, the game is <strong>lost</strong>.</li>
</ul>

<h3>Solo Mode: Jesters</h3>
<ul>
  <li>In solo mode, you start with 2 Jester tokens (not real cards).</li>
  <li>Playing a Jester: discard your entire hand and draw 8 new cards from the tavern.</li>
  <li>The Jester deals no damage and activates no suit power.</li>
  <li>After playing a Jester, the enemy still counterattacks.</li>
  <li>Each Jester can only be used once (removed from game after use).</li>
</ul>

<h3>Win &amp; Lose Conditions</h3>
<ul>
  <li><strong>Win:</strong> Defeat all 12 enemies (4 Jacks, 4 Queens, 4 Kings).</li>
  <li><strong>Lose:</strong> Any player cannot cover an enemy's counterattack damage and no other players can help.</li>
</ul>
`;
