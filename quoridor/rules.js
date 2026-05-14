export const RULES_HTML = `
<h3>Objective</h3>
<p>Be the first player to move your pawn to the opposite side of the board. Player 1 (black) starts at the top and must reach the bottom row. Player 2 (white) starts at the bottom and must reach the top row.</p>

<h3>Setup</h3>
<p>The game is played on a 9x9 grid. Each player starts with a pawn in the center of their home row and 10 walls.</p>

<h3>On Your Turn</h3>
<p>You must do <strong>one</strong> of the following:</p>
<ul>
  <li><strong>Move your pawn</strong> one step in any cardinal direction (north, south, east, or west) to an adjacent empty cell.</li>
  <li><strong>Place a wall</strong> to impede your opponent's progress. Walls are two cells long and are placed between cells.</li>
</ul>

<h3>Pawn Movement</h3>
<ul>
  <li>Pawns move one cell at a time: up, down, left, or right.</li>
  <li>You cannot move through walls.</li>
  <li><strong>Jumping:</strong> If your opponent's pawn is adjacent to yours and no wall is between you, you can jump over them to the cell directly behind them.</li>
  <li>If a wall or the board edge prevents a straight jump, you may jump diagonally (move to either side of the opponent's pawn, if no wall blocks).</li>
</ul>

<h3>Wall Placement</h3>
<ul>
  <li>Each wall spans exactly 2 cells and is placed in the grooves between cells.</li>
  <li>Walls can be horizontal or vertical.</li>
  <li>Walls cannot overlap with other walls.</li>
  <li><strong>Critical rule:</strong> You may never place a wall that completely blocks a player from reaching their goal row. Both players must always have at least one possible path.</li>
  <li>Each player has 10 walls total. Once placed, walls cannot be moved.</li>
</ul>

<h3>Winning</h3>
<p>The first player to reach any cell on their opponent's home row wins immediately.</p>

<h3>Strategy Tips</h3>
<ul>
  <li>Balance between advancing your pawn and placing walls to slow your opponent.</li>
  <li>Don't use all your walls too early - you may need them later.</li>
  <li>Try to force your opponent into long detours while keeping your own path short.</li>
  <li>Walls placed near the center of the board tend to be more effective.</li>
  <li>Watch your opponent's wall count - if they're out of walls, you only need to advance.</li>
</ul>
`;
