export const RULES_HTML = `
<h3>Objective</h3>
<p>Checkmate your opponent's king. This means the king is under attack and cannot escape.</p>

<h3>Piece Movements</h3>
<ul>
  <li><strong>King (&#9812;/&#9818;):</strong> Moves one square in any direction.</li>
  <li><strong>Queen (&#9813;/&#9819;):</strong> Moves any number of squares in any direction (horizontal, vertical, or diagonal).</li>
  <li><strong>Rook (&#9814;/&#9820;):</strong> Moves any number of squares horizontally or vertically.</li>
  <li><strong>Bishop (&#9815;/&#9821;):</strong> Moves any number of squares diagonally.</li>
  <li><strong>Knight (&#9816;/&#9822;):</strong> Moves in an "L" shape: two squares in one direction and one square perpendicular. Knights can jump over other pieces.</li>
  <li><strong>Pawn (&#9817;/&#9823;):</strong> Moves one square forward (two from starting position). Captures diagonally forward.</li>
</ul>

<h3>Special Moves</h3>
<ul>
  <li><strong>Castling:</strong> The king moves two squares toward a rook, and the rook jumps to the other side. Requirements: neither piece has moved, no pieces between them, king is not in check, and king does not pass through check.</li>
  <li><strong>En Passant:</strong> If a pawn advances two squares from its starting position and lands beside an enemy pawn, the enemy pawn may capture it as if it had moved only one square. This must be done immediately.</li>
  <li><strong>Promotion:</strong> When a pawn reaches the opposite end of the board, it must be promoted to a queen, rook, bishop, or knight.</li>
</ul>

<h3>Check and Checkmate</h3>
<ul>
  <li><strong>Check:</strong> When a king is under attack. The player must escape check on their next move.</li>
  <li><strong>Checkmate:</strong> When a king is in check and cannot escape. The game is over.</li>
  <li><strong>Stalemate:</strong> When a player is not in check but has no legal moves. The game is a draw.</li>
</ul>

<h3>Draw Conditions</h3>
<ul>
  <li>Stalemate</li>
  <li>50-move rule: 50 consecutive moves by each player without a pawn move or capture</li>
</ul>
`;
