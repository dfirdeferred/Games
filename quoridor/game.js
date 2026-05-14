/**
 * Quoridor game logic.
 * 9x9 grid. Two players with pawns and 10 walls each.
 * Player 0 starts at (0,4) top, goal row 8.
 * Player 1 starts at (8,4) bottom, goal row 0.
 * Walls are 2-cells long and block movement between cell pairs.
 */

const SIZE = 9;

export function createGame() {
  return {
    pawns: [
      { row: 0, col: 4 }, // Player 0 (top, goes down)
      { row: 8, col: 4 }, // Player 1 (bottom, goes up)
    ],
    walls: [],
    wallCounts: [10, 10],
    currentPlayer: 0,
    gameOver: false,
    winner: null,
  };
}

function cloneState(state) {
  return {
    pawns: state.pawns.map(p => ({ ...p })),
    walls: state.walls.map(w => ({ ...w })),
    wallCounts: [...state.wallCounts],
    currentPlayer: state.currentPlayer,
    gameOver: state.gameOver,
    winner: state.winner,
  };
}

/**
 * Check if a wall blocks movement from (r1,c1) to (r2,c2).
 */
export function isBlocked(state, fromRow, fromCol, toRow, toCol) {
  const dr = toRow - fromRow;
  const dc = toCol - fromCol;

  for (const w of state.walls) {
    if (w.orientation === 'h') {
      // Horizontal wall at (w.row, w.col) blocks:
      // (w.row, w.col) <-> (w.row+1, w.col) AND (w.row, w.col+1) <-> (w.row+1, w.col+1)
      if (dr === 1 && dc === 0) {
        // Moving down
        if (fromRow === w.row && (fromCol === w.col || fromCol === w.col + 1)) return true;
      } else if (dr === -1 && dc === 0) {
        // Moving up
        if (toRow === w.row && (toCol === w.col || toCol === w.col + 1)) return true;
      }
    } else {
      // Vertical wall at (w.row, w.col) blocks:
      // (w.row, w.col) <-> (w.row, w.col+1) AND (w.row+1, w.col) <-> (w.row+1, w.col+1)
      if (dc === 1 && dr === 0) {
        // Moving right
        if (fromCol === w.col && (fromRow === w.row || fromRow === w.row + 1)) return true;
      } else if (dc === -1 && dr === 0) {
        // Moving left
        if (toCol === w.col && (toRow === w.row || toRow === w.row + 1)) return true;
      }
    }
  }
  return false;
}

/**
 * BFS to check if a player can reach their goal row.
 */
export function hasPath(state, playerIdx) {
  const goalRow = playerIdx === 0 ? SIZE - 1 : 0;
  const start = state.pawns[playerIdx];
  const visited = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const queue = [{ row: start.row, col: start.col }];
  visited[start.row][start.col] = true;

  while (queue.length > 0) {
    const { row, col } = queue.shift();
    if (row === goalRow) return true;

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !visited[nr][nc]) {
        if (!isBlocked(state, row, col, nr, nc)) {
          visited[nr][nc] = true;
          queue.push({ row: nr, col: nc });
        }
      }
    }
  }
  return false;
}

/**
 * BFS shortest path length to goal for a player.
 */
export function shortestPathLength(state, playerIdx) {
  const goalRow = playerIdx === 0 ? SIZE - 1 : 0;
  const start = state.pawns[playerIdx];
  const visited = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const queue = [{ row: start.row, col: start.col, dist: 0 }];
  visited[start.row][start.col] = true;

  while (queue.length > 0) {
    const { row, col, dist } = queue.shift();
    if (row === goalRow) return dist;

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !visited[nr][nc]) {
        if (!isBlocked(state, row, col, nr, nc)) {
          visited[nr][nc] = true;
          queue.push({ row: nr, col: nc, dist: dist + 1 });
        }
      }
    }
  }
  return Infinity;
}

/**
 * Get valid pawn moves for current player, including jumping over opponent.
 */
function getValidPawnMoves(state) {
  const moves = [];
  const p = state.currentPlayer;
  const pawn = state.pawns[p];
  const opp = state.pawns[1 - p];
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  for (const [dr, dc] of dirs) {
    const nr = pawn.row + dr;
    const nc = pawn.col + dc;
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) continue;
    if (isBlocked(state, pawn.row, pawn.col, nr, nc)) continue;

    if (nr === opp.row && nc === opp.col) {
      // Opponent is adjacent - try to jump over
      const jr = nr + dr;
      const jc = nc + dc;
      if (jr >= 0 && jr < SIZE && jc >= 0 && jc < SIZE &&
          !isBlocked(state, nr, nc, jr, jc)) {
        // Jump straight over
        moves.push({ type: 'move', row: jr, col: jc });
      } else {
        // Can't jump straight - try diagonal jumps (perpendicular to blocked direction)
        const perpDirs = (dr === 0) ? [[1, 0], [-1, 0]] : [[0, 1], [0, -1]];
        for (const [pdr, pdc] of perpDirs) {
          const dr2 = nr + pdr;
          const dc2 = nc + pdc;
          if (dr2 >= 0 && dr2 < SIZE && dc2 >= 0 && dc2 < SIZE &&
              !isBlocked(state, nr, nc, dr2, dc2)) {
            moves.push({ type: 'move', row: dr2, col: dc2 });
          }
        }
      }
    } else {
      moves.push({ type: 'move', row: nr, col: nc });
    }
  }
  return moves;
}

/**
 * Check if a wall overlaps with existing walls.
 */
function wallOverlaps(walls, newWall) {
  for (const w of walls) {
    if (w.orientation === newWall.orientation) {
      if (w.orientation === 'h') {
        // Two horizontal walls overlap if same row and cols overlap
        if (w.row === newWall.row && Math.abs(w.col - newWall.col) <= 1) return true;
      } else {
        // Two vertical walls overlap if same col and rows overlap
        if (w.col === newWall.col && Math.abs(w.row - newWall.row) <= 1) return true;
      }
    } else {
      // Cross intersection: h at (hr, hc) and v at (vr, vc) intersect if hr===vr and hc===vc
      if (w.row === newWall.row && w.col === newWall.col) return true;
    }
  }
  return false;
}

/**
 * Get all valid wall placements for the current player.
 */
export function getValidWallPlacements(state) {
  const p = state.currentPlayer;
  if (state.wallCounts[p] <= 0) return [];

  const placements = [];
  for (let r = 0; r < SIZE - 1; r++) {
    for (let c = 0; c < SIZE - 1; c++) {
      for (const ori of ['h', 'v']) {
        const wall = { row: r, col: c, orientation: ori };
        if (wallOverlaps(state.walls, wall)) continue;

        // Check path not blocked - temporarily add wall
        const testState = cloneState(state);
        testState.walls.push(wall);
        if (hasPath(testState, 0) && hasPath(testState, 1)) {
          placements.push({ type: 'wall', row: r, col: c, orientation: ori });
        }
      }
    }
  }
  return placements;
}

export function getValidMoves(state) {
  if (state.gameOver) return [];
  const pawnMoves = getValidPawnMoves(state);
  const wallMoves = getValidWallPlacements(state);
  return [...pawnMoves, ...wallMoves];
}

export function applyMove(state, move) {
  const s = cloneState(state);

  if (move.type === 'move') {
    s.pawns[s.currentPlayer] = { row: move.row, col: move.col };

    // Check win
    const goalRow = s.currentPlayer === 0 ? SIZE - 1 : 0;
    if (move.row === goalRow) {
      s.gameOver = true;
      s.winner = s.currentPlayer;
    }
  } else if (move.type === 'wall') {
    s.walls.push({ row: move.row, col: move.col, orientation: move.orientation });
    s.wallCounts[s.currentPlayer]--;
  }

  s.currentPlayer = 1 - s.currentPlayer;
  return s;
}

/**
 * Evaluate from player 0's perspective (maximizing).
 * Positive = good for player 0, negative = good for player 1.
 */
export function evaluate(state) {
  if (state.gameOver) {
    return state.winner === 0 ? 10000 : -10000;
  }

  const path0 = shortestPathLength(state, 0);
  const path1 = shortestPathLength(state, 1);

  // Score = opponent's path - our path (from player 0 perspective)
  let score = path1 - path0;

  // Wall advantage bonus
  score += (state.wallCounts[0] - state.wallCounts[1]) * 0.5;

  return score;
}

export function isTerminal(state) {
  return state.gameOver;
}

// Export helpers needed by engine
export { getValidPawnMoves, SIZE };
