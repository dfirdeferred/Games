/**
 * Breakthrough game logic.
 * Board: 8x8, 0=empty, 1=black, 2=white.
 * Black starts rows 0-1, moves downward (increasing row).
 * White starts rows 6-7, moves upward (decreasing row).
 */

const SIZE = 8;

export function createGame() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (let c = 0; c < SIZE; c++) {
    board[0][c] = 1;
    board[1][c] = 1;
    board[6][c] = 2;
    board[7][c] = 2;
  }
  return {
    board,
    currentPlayer: 2, // white moves first
    gameOver: false,
    winner: null,
  };
}

function cloneState(state) {
  return {
    board: state.board.map(r => [...r]),
    currentPlayer: state.currentPlayer,
    gameOver: state.gameOver,
    winner: state.winner,
  };
}

export function getValidMoves(state) {
  const moves = [];
  const p = state.currentPlayer;
  const dir = p === 1 ? 1 : -1; // black goes down, white goes up

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (state.board[r][c] !== p) continue;
      const nr = r + dir;
      if (nr < 0 || nr >= SIZE) continue;

      // Straight forward - only if empty
      if (state.board[nr][c] === 0) {
        moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: c });
      }
      // Diagonal forward-left
      if (c - 1 >= 0 && state.board[nr][c - 1] !== p) {
        // Can move diag if empty or enemy
        if (state.board[nr][c - 1] === 0 || state.board[nr][c - 1] !== p) {
          // But straight capture not allowed - only diagonal capture
          // Diagonal: can move to empty or capture enemy
          const target = state.board[nr][c - 1];
          if (target === 0 || target !== p) {
            moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: c - 1 });
          }
        }
      }
      // Diagonal forward-right
      if (c + 1 < SIZE && state.board[nr][c + 1] !== p) {
        const target = state.board[nr][c + 1];
        if (target === 0 || target !== p) {
          moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: c + 1 });
        }
      }
    }
  }
  return moves;
}

export function applyMove(state, move) {
  const s = cloneState(state);
  s.board[move.toRow][move.toCol] = s.board[move.fromRow][move.fromCol];
  s.board[move.fromRow][move.fromCol] = 0;
  s.currentPlayer = s.currentPlayer === 1 ? 2 : 1;

  // Check win conditions
  // Black wins by reaching row 7
  for (let c = 0; c < SIZE; c++) {
    if (s.board[7][c] === 1) {
      s.gameOver = true;
      s.winner = 1;
      return s;
    }
  }
  // White wins by reaching row 0
  for (let c = 0; c < SIZE; c++) {
    if (s.board[0][c] === 2) {
      s.gameOver = true;
      s.winner = 2;
      return s;
    }
  }

  // Check if either player has no pieces
  let blackCount = 0, whiteCount = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (s.board[r][c] === 1) blackCount++;
      if (s.board[r][c] === 2) whiteCount++;
    }
  }
  if (blackCount === 0) {
    s.gameOver = true;
    s.winner = 2;
  } else if (whiteCount === 0) {
    s.gameOver = true;
    s.winner = 1;
  }

  // Check if current player has no moves
  if (!s.gameOver && getValidMoves(s).length === 0) {
    s.gameOver = true;
    s.winner = s.currentPlayer === 1 ? 2 : 1;
  }

  return s;
}

/**
 * Evaluate from black's perspective (player 1 = maximizing).
 * Positive = good for black, negative = good for white.
 */
export function evaluate(state) {
  if (state.gameOver) {
    return state.winner === 1 ? 10000 : -10000;
  }

  let score = 0;
  let blackCount = 0, whiteCount = 0;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = state.board[r][c];
      if (p === 1) {
        blackCount++;
        // Black wants to reach row 7, advancement = r
        score += 10 + r * 3;
      } else if (p === 2) {
        whiteCount++;
        // White wants to reach row 0, advancement = (7 - r)
        score -= 10 + (7 - r) * 3;
      }
    }
  }

  return score;
}

export function isTerminal(state) {
  return state.gameOver;
}

export function getResult(state) {
  if (!state.gameOver) return null;
  return state.winner; // 1 or 2
}
