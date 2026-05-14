export const RULES_HTML = `
<h3>Objective</h3>
<p>Connect your two sides of the board with an unbroken chain of stones. Red connects the top edge to the bottom edge. Blue connects the left edge to the right edge.</p>

<h3>The Board</h3>
<p>Hex is played on an 11x11 rhombus-shaped board of hexagonal cells. Each cell has six neighbors. The four edges of the board are colored: the top and bottom edges are red, and the left and right edges are blue.</p>

<h3>Gameplay</h3>
<ul>
  <li>Red plays first, then players alternate turns.</li>
  <li>On your turn, place one stone on any empty hexagonal cell.</li>
  <li>Once placed, stones are never moved or removed.</li>
  <li>The first player to complete a connected path of their stones between their two sides wins.</li>
</ul>

<h3>Swap Rule</h3>
<p>Because going first is an advantage, the <strong>swap rule</strong> is used: after Red's first move, Blue may choose to <strong>swap</strong> instead of placing a stone. This takes Red's stone position as Blue's own, and Red must then play elsewhere. This discourages Red from playing too strong an opening move.</p>

<h3>No Draws</h3>
<p>A key property of Hex is that <strong>draws are impossible</strong>. The board will always be completely filled or a winner found. One player must always win.</p>

<h3>Strategy Tips</h3>
<ul>
  <li><strong>Center control:</strong> The center of the board is the most valuable area, as stones there can connect in many directions.</li>
  <li><strong>Bridges:</strong> Two stones separated by a specific pattern can always be connected regardless of the opponent's move - these are called "virtual connections" or "bridges."</li>
  <li><strong>Edge templates:</strong> Certain patterns near the edges guarantee a connection to that edge.</li>
  <li><strong>Block early:</strong> If your opponent is building toward a connection, disrupt their path before it becomes unstoppable.</li>
</ul>
`;
