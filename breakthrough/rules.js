export const RULES_HTML = `
<h3>Objective</h3>
<p>Be the first player to move one of your pawns to the opposite side of the board (your opponent's home row).</p>

<h3>Setup</h3>
<p>Each player starts with 16 pawns arranged in two rows. Black occupies rows 1-2 (top) and White occupies rows 7-8 (bottom).</p>

<h3>Movement</h3>
<ul>
  <li>Pawns move one square forward: straight ahead or diagonally forward.</li>
  <li>Pawns can <strong>never</strong> move backward or sideways.</li>
  <li>Black pawns move downward; White pawns move upward.</li>
</ul>

<h3>Capturing</h3>
<ul>
  <li>You can capture an opponent's pawn by moving diagonally forward into its square.</li>
  <li>You <strong>cannot</strong> capture by moving straight forward.</li>
  <li>Capturing is optional, not forced.</li>
</ul>

<h3>Winning</h3>
<ul>
  <li><strong>Reach the goal:</strong> Move any of your pawns to the opponent's home row.</li>
  <li><strong>Eliminate all opponents:</strong> If your opponent has no pawns left, you win.</li>
</ul>

<h3>Strategy Tips</h3>
<ul>
  <li>Advance pawns in groups to protect each other diagonally.</li>
  <li>Try to create a "breakthrough" - a pawn with a clear path to the goal.</li>
  <li>Control the center of the board for more movement options.</li>
  <li>Sometimes sacrificing a pawn to open a path is worth it.</li>
</ul>
`;
