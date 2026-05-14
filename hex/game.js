/**
 * Hex game logic.
 * Board: 11x11 rhombus of hexagons. 0=empty, 1=red, 2=blue.
 * Red connects top-to-bottom, Blue connects left-to-right.
 * Hex neighbors for (r,c): (r-1,c), (r-1,c+1), (r,c-1), (r,c+1), (r+1,c-1), (r+1,c).
 */

const DEFAULT_SIZE = 11;

export function createGame(size = DEFAULT_SIZE) {
  const board = Array.from({ length: size }, () => Array(size).fill(0));
  return {
    board,
    currentPlayer: 1, // red goes first
    size,
    gameOver: false,
    winner: null,
    swapAvailable: false,
    moveCount: 0,
  };
}

function cloneState(state) {
  return {
    board: state.board.map(r => [...r]),
    currentPlayer: state.currentPlayer,
    size: state.size,
    gameOver: state.gameOver,
    winner: state.winner,
    swapAvailable: state.swapAvailable,
    moveCount: state.moveCount,
  };
}

export function getNeighbors(row, col, size) {
  const dirs = [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0]];
  const result = [];
  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      result.push({ row: nr, col: nc });
    }
  }
  return result;
}

export function checkWin(board, player, size) {
  // BFS from one side to opposite side
  // Red (1): top row (r=0) to bottom row (r=size-1)
  // Blue (2): left col (c=0) to right col (c=size-1)
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const queue = [];

  if (player === 1) {
    // Start from top row
    for (let c = 0; c < size; c++) {
      if (board[0][c] === player) {
        queue.push({ row: 0, col: c });
        visited[0][c] = true;
      }
    }
  } else {
    // Start from left col
    for (let r = 0; r < size; r++) {
      if (board[r][0] === player) {
        queue.push({ row: r, col: 0 });
        visited[r][0] = true;
      }
    }
  }

  while (queue.length > 0) {
    const { row, col } = queue.shift();
    // Check if reached opposite side
    if (player === 1 && row === size - 1) return true;
    if (player === 2 && col === size - 1) return true;

    for (const n of getNeighbors(row, col, size)) {
      if (!visited[n.row][n.col] && board[n.row][n.col] === player) {
        visited[n.row][n.col] = true;
        queue.push(n);
      }
    }
  }
  return false;
}

/**
 * Find the winning path via BFS for highlighting.
 */
export function findWinningPath(board, player, size) {
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const parent = Array.from({ length: size }, () => Array(size).fill(null));
  const queue = [];

  if (player === 1) {
    for (let c = 0; c < size; c++) {
      if (board[0][c] === player) {
        queue.push({ row: 0, col: c });
        visited[0][c] = true;
      }
    }
  } else {
    for (let r = 0; r < size; r++) {
      if (board[r][0] === player) {
        queue.push({ row: r, col: 0 });
        visited[r][0] = true;
      }
    }
  }

  while (queue.length > 0) {
    const { row, col } = queue.shift();
    if ((player === 1 && row === size - 1) || (player === 2 && col === size - 1)) {
      // Trace back path
      const path = [];
      let cur = { row, col };
      while (cur) {
        path.push(cur);
        cur = parent[cur.row][cur.col];
      }
      return path;
    }

    for (const n of getNeighbors(row, col, size)) {
      if (!visited[n.row][n.col] && board[n.row][n.col] === player) {
        visited[n.row][n.col] = true;
        parent[n.row][n.col] = { row, col };
        queue.push(n);
      }
    }
  }
  return [];
}

export function getValidMoves(state) {
  if (state.gameOver) return [];
  const moves = [];
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      if (state.board[r][c] === 0) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

export function applyMove(state, move) {
  const s = cloneState(state);

  // Handle swap move
  if (move.swap) {
    // Find the first player's stone and swap it
    for (let r = 0; r < s.size; r++) {
      for (let c = 0; c < s.size; c++) {
        if (s.board[r][c] === 1) {
          s.board[r][c] = 2; // Change red stone to blue
        }
      }
    }
    s.currentPlayer = 1; // Red's turn again
    s.swapAvailable = false;
    s.moveCount++;
    return s;
  }

  s.board[move.row][move.col] = s.currentPlayer;
  s.moveCount++;

  // After first move, swap becomes available for second player
  if (s.moveCount === 1) {
    s.swapAvailable = true;
  } else {
    s.swapAvailable = false;
  }

  // Check for win
  if (checkWin(s.board, s.currentPlayer, s.size)) {
    s.gameOver = true;
    s.winner = s.currentPlayer;
  }

  s.currentPlayer = s.currentPlayer === 1 ? 2 : 1;
  return s;
}

/**
 * Dijkstra shortest path heuristic for evaluation.
 * For a player, compute minimum number of empty cells needed to complete a connection.
 */
function shortestPath(board, player, size) {
  // Use Dijkstra: cost 0 to traverse own cells, cost 1 for empty, Infinity for opponent
  const dist = Array.from({ length: size }, () => Array(size).fill(Infinity));
  // Priority queue as sorted array (simple impl)
  const pq = [];

  if (player === 1) {
    // Red: top to bottom
    for (let c = 0; c < size; c++) {
      const cost = board[0][c] === player ? 0 : board[0][c] === 0 ? 1 : Infinity;
      if (cost < Infinity) {
        dist[0][c] = cost;
        pq.push({ row: 0, col: c, cost });
      }
    }
  } else {
    // Blue: left to right
    for (let r = 0; r < size; r++) {
      const cost = board[r][0] === player ? 0 : board[r][0] === 0 ? 1 : Infinity;
      if (cost < Infinity) {
        dist[r][0] = cost;
        pq.push({ row: r, col: 0, cost });
      }
    }
  }

  // Sort ascending by cost
  pq.sort((a, b) => a.cost - b.cost);

  while (pq.length > 0) {
    const { row, col, cost } = pq.shift();
    if (cost > dist[row][col]) continue;

    // Check if reached goal
    if (player === 1 && row === size - 1) return cost;
    if (player === 2 && col === size - 1) return cost;

    for (const n of getNeighbors(row, col, size)) {
      const cellVal = board[n.row][n.col];
      if (cellVal !== 0 && cellVal !== player) continue; // opponent blocks
      const moveCost = cellVal === player ? 0 : 1;
      const newCost = cost + moveCost;
      if (newCost < dist[n.row][n.col]) {
        dist[n.row][n.col] = newCost;
        // Insert sorted
        let inserted = false;
        for (let i = 0; i < pq.length; i++) {
          if (newCost <= pq[i].cost) {
            pq.splice(i, 0, { row: n.row, col: n.col, cost: newCost });
            inserted = true;
            break;
          }
        }
        if (!inserted) pq.push({ row: n.row, col: n.col, cost: newCost });
      }
    }
  }

  return Infinity;
}

/**
 * Evaluate from Red's (player 1) perspective.
 * Positive = good for red, negative = good for blue.
 */
export function evaluate(state) {
  if (state.gameOver) {
    return state.winner === 1 ? 10000 : -10000;
  }
  const redPath = shortestPath(state.board, 1, state.size);
  const bluePath = shortestPath(state.board, 2, state.size);
  return bluePath - redPath;
}

export function isTerminal(state) {
  return state.gameOver;
}
