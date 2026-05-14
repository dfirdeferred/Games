/**
 * Complete Chess rules engine.
 * Board: 8x8, null = empty, or {type, color}.
 * Row 0 = black's back rank (top), Row 7 = white's back rank (bottom).
 */

// --- Piece-square tables (from white's perspective; flip for black) ---
const PST_PAWN = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 25, 25, 10,  5,  5],
  [ 0,  0,  0, 20, 20,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0],
];

const PST_KNIGHT = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const PST_BISHOP = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const PST_ROOK = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0],
];

const PST_QUEEN = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
];

const PST_KING = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20],
];

const PST = { pawn: PST_PAWN, knight: PST_KNIGHT, bishop: PST_BISHOP, rook: PST_ROOK, queen: PST_QUEEN, king: PST_KING };
const MATERIAL = { pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 0 };

function piece(type, color) {
  return { type, color };
}

export function createGame() {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let c = 0; c < 8; c++) {
    board[0][c] = piece(backRank[c], 'black');
    board[1][c] = piece('pawn', 'black');
    board[6][c] = piece('pawn', 'white');
    board[7][c] = piece(backRank[c], 'white');
  }
  return {
    board,
    currentPlayer: 'white',
    castlingRights: { whiteKing: true, whiteQueen: true, blackKing: true, blackQueen: true },
    enPassantTarget: null,
    halfMoveClock: 0,
    moveHistory: [],
    gameOver: false,
    result: null,
  };
}

function cloneState(state) {
  return {
    board: state.board.map(r => r.map(p => p ? { ...p } : null)),
    currentPlayer: state.currentPlayer,
    castlingRights: { ...state.castlingRights },
    enPassantTarget: state.enPassantTarget ? { ...state.enPassantTarget } : null,
    halfMoveClock: state.halfMoveClock,
    moveHistory: [...state.moveHistory],
    gameOver: state.gameOver,
    result: state.result,
  };
}

function opponent(color) {
  return color === 'white' ? 'black' : 'white';
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'king' && p.color === color) return { row: r, col: c };
    }
  }
  return null;
}

/**
 * Check if a square is attacked by the given color.
 */
function isSquareAttacked(board, row, col, byColor) {
  // Pawn attacks
  const pawnDir = byColor === 'white' ? 1 : -1; // direction pawns come FROM
  for (const dc of [-1, 1]) {
    const pr = row + pawnDir;
    const pc = col + dc;
    if (inBounds(pr, pc)) {
      const p = board[pr][pc];
      if (p && p.type === 'pawn' && p.color === byColor) return true;
    }
  }

  // Knight attacks
  const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  for (const [dr, dc] of knightMoves) {
    const nr = row + dr, nc = col + dc;
    if (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.type === 'knight' && p.color === byColor) return true;
    }
  }

  // King attacks
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr, nc = col + dc;
      if (inBounds(nr, nc)) {
        const p = board[nr][nc];
        if (p && p.type === 'king' && p.color === byColor) return true;
      }
    }
  }

  // Sliding pieces: rook/queen (straight), bishop/queen (diagonal)
  const straightDirs = [[0,1],[0,-1],[1,0],[-1,0]];
  for (const [dr, dc] of straightDirs) {
    for (let i = 1; i < 8; i++) {
      const nr = row + dr * i, nc = col + dc * i;
      if (!inBounds(nr, nc)) break;
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'rook' || p.type === 'queen')) return true;
        break;
      }
    }
  }

  const diagDirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
  for (const [dr, dc] of diagDirs) {
    for (let i = 1; i < 8; i++) {
      const nr = row + dr * i, nc = col + dc * i;
      if (!inBounds(nr, nc)) break;
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'bishop' || p.type === 'queen')) return true;
        break;
      }
    }
  }

  return false;
}

export function isInCheck(state, color) {
  const king = findKing(state.board, color);
  if (!king) return false;
  return isSquareAttacked(state.board, king.row, king.col, opponent(color));
}

/**
 * Generate pseudo-legal moves (not filtered for check yet).
 */
function getPseudoLegalMoves(state) {
  const moves = [];
  const color = state.currentPlayer;
  const board = state.board;
  const opp = opponent(color);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== color) continue;

      const addMove = (tr, tc, promo = null) => {
        moves.push({ from: { row: r, col: c }, to: { row: tr, col: tc }, promotion: promo });
      };

      const addSliding = (dirs) => {
        for (const [dr, dc] of dirs) {
          for (let i = 1; i < 8; i++) {
            const nr = r + dr * i, nc = c + dc * i;
            if (!inBounds(nr, nc)) break;
            const target = board[nr][nc];
            if (!target) {
              addMove(nr, nc);
            } else {
              if (target.color === opp) addMove(nr, nc);
              break;
            }
          }
        }
      };

      switch (p.type) {
        case 'pawn': {
          const dir = color === 'white' ? -1 : 1;
          const startRow = color === 'white' ? 6 : 1;
          const promoRow = color === 'white' ? 0 : 7;
          const promoTypes = ['queen', 'rook', 'bishop', 'knight'];

          // Forward one
          const f1r = r + dir;
          if (inBounds(f1r, c) && !board[f1r][c]) {
            if (f1r === promoRow) {
              for (const pt of promoTypes) addMove(f1r, c, pt);
            } else {
              addMove(f1r, c);
            }
            // Forward two from start
            if (r === startRow) {
              const f2r = r + dir * 2;
              if (!board[f2r][c]) {
                addMove(f2r, c);
              }
            }
          }

          // Diagonal captures
          for (const dc of [-1, 1]) {
            const nc = c + dc;
            if (!inBounds(f1r, nc)) continue;
            const target = board[f1r][nc];
            if (target && target.color === opp) {
              if (f1r === promoRow) {
                for (const pt of promoTypes) addMove(f1r, nc, pt);
              } else {
                addMove(f1r, nc);
              }
            }
            // En passant
            if (state.enPassantTarget && state.enPassantTarget.row === f1r && state.enPassantTarget.col === nc) {
              addMove(f1r, nc);
            }
          }
          break;
        }

        case 'knight': {
          const jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
          for (const [dr, dc] of jumps) {
            const nr = r + dr, nc = c + dc;
            if (!inBounds(nr, nc)) continue;
            const target = board[nr][nc];
            if (!target || target.color === opp) addMove(nr, nc);
          }
          break;
        }

        case 'bishop':
          addSliding([[1,1],[1,-1],[-1,1],[-1,-1]]);
          break;

        case 'rook':
          addSliding([[0,1],[0,-1],[1,0],[-1,0]]);
          break;

        case 'queen':
          addSliding([[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]);
          break;

        case 'king': {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr, nc = c + dc;
              if (!inBounds(nr, nc)) continue;
              const target = board[nr][nc];
              if (!target || target.color === opp) addMove(nr, nc);
            }
          }

          // Castling
          const kingRow = color === 'white' ? 7 : 0;
          if (r === kingRow && c === 4) {
            // Kingside
            const ksRight = color === 'white' ? 'whiteKing' : 'blackKing';
            if (state.castlingRights[ksRight]) {
              if (!board[kingRow][5] && !board[kingRow][6]) {
                const rookPiece = board[kingRow][7];
                if (rookPiece && rookPiece.type === 'rook' && rookPiece.color === color) {
                  // Can't castle out of, through, or into check
                  if (!isSquareAttacked(board, kingRow, 4, opp) &&
                      !isSquareAttacked(board, kingRow, 5, opp) &&
                      !isSquareAttacked(board, kingRow, 6, opp)) {
                    addMove(kingRow, 6);
                  }
                }
              }
            }
            // Queenside
            const qsRight = color === 'white' ? 'whiteQueen' : 'blackQueen';
            if (state.castlingRights[qsRight]) {
              if (!board[kingRow][1] && !board[kingRow][2] && !board[kingRow][3]) {
                const rookPiece = board[kingRow][0];
                if (rookPiece && rookPiece.type === 'rook' && rookPiece.color === color) {
                  if (!isSquareAttacked(board, kingRow, 4, opp) &&
                      !isSquareAttacked(board, kingRow, 3, opp) &&
                      !isSquareAttacked(board, kingRow, 2, opp)) {
                    addMove(kingRow, 2);
                  }
                }
              }
            }
          }
          break;
        }
      }
    }
  }

  return moves;
}

/**
 * Apply a move without checking legality (for testing check).
 */
function applyMoveRaw(state, move) {
  const s = cloneState(state);
  const board = s.board;
  const from = move.from;
  const to = move.to;
  const movingPiece = board[from.row][from.col];

  // En passant capture
  if (movingPiece.type === 'pawn' && s.enPassantTarget &&
      to.row === s.enPassantTarget.row && to.col === s.enPassantTarget.col) {
    // Remove the captured pawn
    const capturedRow = from.row; // The pawn is on the same row as the moving pawn
    board[capturedRow][to.col] = null;
  }

  // Move piece
  board[to.row][to.col] = board[from.row][from.col];
  board[from.row][from.col] = null;

  // Promotion
  if (move.promotion && movingPiece.type === 'pawn') {
    board[to.row][to.col] = piece(move.promotion, movingPiece.color);
  }

  // Castling - move rook
  if (movingPiece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    if (to.col === 6) {
      // Kingside
      board[to.row][5] = board[to.row][7];
      board[to.row][7] = null;
    } else if (to.col === 2) {
      // Queenside
      board[to.row][3] = board[to.row][0];
      board[to.row][0] = null;
    }
  }

  return s;
}

/**
 * Get fully legal moves (filtered for check).
 */
export function getValidMoves(state) {
  const pseudoMoves = getPseudoLegalMoves(state);
  const legal = [];
  const color = state.currentPlayer;

  for (const move of pseudoMoves) {
    const newState = applyMoveRaw(state, move);
    // After the move, our king must not be in check
    const king = findKing(newState.board, color);
    if (king && !isSquareAttacked(newState.board, king.row, king.col, opponent(color))) {
      legal.push(move);
    }
  }

  return legal;
}

export function applyMove(state, move) {
  const s = cloneState(state);
  const board = s.board;
  const from = move.from;
  const to = move.to;
  const movingPiece = board[from.row][from.col];
  const capturedPiece = board[to.row][to.col];
  const color = movingPiece.color;

  let isCapture = !!capturedPiece;
  let isPawnMove = movingPiece.type === 'pawn';

  // En passant capture
  if (isPawnMove && s.enPassantTarget &&
      to.row === s.enPassantTarget.row && to.col === s.enPassantTarget.col) {
    const capturedRow = from.row;
    board[capturedRow][to.col] = null;
    isCapture = true;
  }

  // Move piece
  board[to.row][to.col] = board[from.row][from.col];
  board[from.row][from.col] = null;

  // Promotion
  if (move.promotion && isPawnMove) {
    board[to.row][to.col] = piece(move.promotion, color);
  }

  // Castling - move rook
  if (movingPiece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    if (to.col === 6) {
      board[to.row][5] = board[to.row][7];
      board[to.row][7] = null;
    } else if (to.col === 2) {
      board[to.row][3] = board[to.row][0];
      board[to.row][0] = null;
    }
  }

  // Update en passant target
  s.enPassantTarget = null;
  if (isPawnMove && Math.abs(to.row - from.row) === 2) {
    const epRow = (from.row + to.row) / 2;
    s.enPassantTarget = { row: epRow, col: to.col };
  }

  // Update castling rights
  if (movingPiece.type === 'king') {
    if (color === 'white') {
      s.castlingRights.whiteKing = false;
      s.castlingRights.whiteQueen = false;
    } else {
      s.castlingRights.blackKing = false;
      s.castlingRights.blackQueen = false;
    }
  }
  if (movingPiece.type === 'rook') {
    if (from.row === 7 && from.col === 7) s.castlingRights.whiteKing = false;
    if (from.row === 7 && from.col === 0) s.castlingRights.whiteQueen = false;
    if (from.row === 0 && from.col === 7) s.castlingRights.blackKing = false;
    if (from.row === 0 && from.col === 0) s.castlingRights.blackQueen = false;
  }
  // If a rook is captured, remove its castling rights
  if (to.row === 7 && to.col === 7) s.castlingRights.whiteKing = false;
  if (to.row === 7 && to.col === 0) s.castlingRights.whiteQueen = false;
  if (to.row === 0 && to.col === 7) s.castlingRights.blackKing = false;
  if (to.row === 0 && to.col === 0) s.castlingRights.blackQueen = false;

  // Update half-move clock
  if (isPawnMove || isCapture) {
    s.halfMoveClock = 0;
  } else {
    s.halfMoveClock++;
  }

  // Record move
  s.moveHistory.push(move);

  // Switch player
  s.currentPlayer = opponent(color);

  // Check for game over
  const nextMoves = getValidMoves(s);
  if (nextMoves.length === 0) {
    s.gameOver = true;
    if (isInCheck(s, s.currentPlayer)) {
      // Checkmate - the player who just moved wins
      s.result = color;
    } else {
      // Stalemate
      s.result = 'draw';
    }
  } else if (s.halfMoveClock >= 100) {
    // 50-move rule (100 half-moves)
    s.gameOver = true;
    s.result = 'draw';
  }

  return s;
}

/**
 * Evaluate position from white's perspective.
 * Positive = good for white, negative = good for black.
 */
export function evaluate(state) {
  if (state.gameOver) {
    if (state.result === 'white') return 50000;
    if (state.result === 'black') return -50000;
    return 0; // draw
  }

  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p) continue;

      const mat = MATERIAL[p.type];
      const pst = PST[p.type];

      if (p.color === 'white') {
        score += mat;
        // PST tables are from white's perspective, row 0 = opponent side
        score += pst[r][c];
      } else {
        score -= mat;
        // Flip row for black
        score -= pst[7 - r][c];
      }
    }
  }

  // Small bonus for mobility (if not too expensive)
  // We skip this for performance since minimax will call evaluate a lot

  return score;
}

export function isTerminal(state) {
  return state.gameOver;
}

export function getResult(state) {
  return state.result; // 'white', 'black', 'draw', or null
}

export function isCheckmate(state) {
  return state.gameOver && state.result !== 'draw' && state.result !== null;
}

export function isStalemate(state) {
  return state.gameOver && state.result === 'draw' && getValidMoves({ ...state, gameOver: false, currentPlayer: state.currentPlayer }).length === 0;
}
