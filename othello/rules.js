export const RULES_HTML = `
<h3>Objective</h3>
<p>Have the most discs of your colour on the board when the game ends.</p>

<h3>Setup</h3>
<p>The game begins with four discs placed in the centre of the 8&times;8 board &mdash;
two black and two white arranged diagonally. Black moves first.</p>

<h3>How to Play</h3>
<p>On your turn, place a disc on an empty square so that it <strong>brackets</strong>
one or more of your opponent's discs between the disc you just placed and another
disc of your colour already on the board. Bracketing can happen in any of the
eight directions (horizontal, vertical, or diagonal).</p>
<p>All bracketed opponent discs are <strong>flipped</strong> to your colour.</p>

<h3>Passing</h3>
<p>If you have no valid move you must pass. If neither player can move, the game ends.</p>

<h3>Game End</h3>
<p>The game ends when neither player can make a move (usually when the board is full).
The player with the most discs wins. If both players have the same number of discs, the game is a draw.</p>

<h3>Strategy Tips</h3>
<ul>
  <li><strong>Corners are king</strong> &mdash; once taken, a corner disc can never be flipped.</li>
  <li>Avoid the squares diagonally adjacent to corners (X-squares) early on, as they give your opponent access to the corner.</li>
  <li>Edges are also valuable because they are harder to outflank.</li>
  <li>Maximise your <em>mobility</em> (number of available moves) &mdash; having more options gives you more control.</li>
  <li>In the early game, try to keep a low disc count; having fewer discs often means more moves.</li>
</ul>
`;
