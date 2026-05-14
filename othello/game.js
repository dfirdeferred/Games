/**
 * Othello / Reversi – pure game-logic engine.
 * Board values: 0 = empty, 1 = black, 2 = white.
 */

const SIZE = 8;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
];

/* ---- helpers ---- */

function opponent(player) {
  return player === BLACK ? WHITE : BLACK;
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

/* ---- public API ---- */

export function createGame() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  // Standard centre setup
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;

  return {
    board,
    currentPlayer: BLACK,
    passCount: 0,
    gameOver: false,
  };
}

/**
 * Return the list of opponent discs that would be flipped
 * if `player` places a disc at (row, col).
 */
export function getFlips(board, row, col, player) {
  if (board[row][col] !== EMPTY) return [];

  const opp = opponent(player);
  const flips = [];

  for (const [dr, dc] of DIRS) {
    const line = [];
    let r = row + dr;
    let c = col + dc;

    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r][c] === opp) {
      line.push([r, c]);
      r += dr;
      c += dc;
    }

    // Must end on a friendly disc and have captured at least one
    if (line.length > 0 && r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r][c] === player) {
      flips.push(...line);
    }
  }

  return flips;
}

export function isValidMove(state, row, col) {
  if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return false;
  return getFlips(state.board, row, col, state.currentPlayer).length > 0;
}

export function getValidMoves(state) {
  const moves = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (getFlips(state.board, r, c, state.currentPlayer).length > 0) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

/**
 * Apply a move (or null for a pass) and return a new state.
 */
export function applyMove(state, move) {
  const newBoard = cloneBoard(state.board);
  let passCount = 0;

  if (move === null) {
    // Pass
    passCount = state.passCount + 1;
  } else {
    const { row, col } = move;
    const flips = getFlips(newBoard, row, col, state.currentPlayer);
    newBoard[row][col] = state.currentPlayer;
    for (const [r, c] of flips) {
      newBoard[r][c] = state.currentPlayer;
    }
    passCount = 0;
  }

  const next = opponent(state.currentPlayer);
  const gameOver = passCount >= 2;

  return {
    board: newBoard,
    currentPlayer: next,
    passCount,
    gameOver,
  };
}

export function getScore(state) {
  let black = 0;
  let white = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (state.board[r][c] === BLACK) black++;
      else if (state.board[r][c] === WHITE) white++;
    }
  }
  return { black, white };
}

export function isTerminal(state) {
  if (state.gameOver) return true;
  // Also terminal if neither player can move
  const curMoves = getValidMoves(state);
  if (curMoves.length > 0) return false;
  const oppState = { ...state, currentPlayer: opponent(state.currentPlayer) };
  const oppMoves = getValidMoves(oppState);
  return oppMoves.length === 0;
}

/**
 * Heuristic evaluation (positive = good for BLACK / player 1).
 */
export function evaluate(state) {
  const { board } = state;

  // Corner positions
  const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
  // X-squares (diagonally adjacent to corners) – bad to hold
  const xSquares = [[1, 1], [1, 6], [6, 1], [6, 6]];
  // Edge positions (excluding corners)
  const edges = [];
  for (let i = 1; i < 7; i++) {
    edges.push([0, i], [7, i], [i, 0], [i, 7]);
  }

  let score = 0;

  // Corner control (weight 25)
  for (const [r, c] of corners) {
    if (board[r][c] === BLACK) score += 25;
    else if (board[r][c] === WHITE) score -= 25;
  }

  // X-square penalty (weight -10)
  for (const [r, c] of xSquares) {
    if (board[r][c] === BLACK) score -= 10;
    else if (board[r][c] === WHITE) score += 10;
  }

  // Edge control (weight 5)
  for (const [r, c] of edges) {
    if (board[r][c] === BLACK) score += 5;
    else if (board[r][c] === WHITE) score -= 5;
  }

  // Mobility (weight 3)
  const blackMobility = getValidMoves({ ...state, currentPlayer: BLACK }).length;
  const whiteMobility = getValidMoves({ ...state, currentPlayer: WHITE }).length;
  score += (blackMobility - whiteMobility) * 3;

  // Disc count (weight 1)
  const { black, white } = getScore(state);
  score += (black - white) * 1;

  return score;
}
