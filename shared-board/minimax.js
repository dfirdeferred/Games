/**
 * Generic minimax with alpha-beta pruning.
 * Each game provides gameFns: { getValidMoves, applyMove, evaluate, isTerminal }
 */
export function minimax(state, depth, alpha, beta, maximizing, gameFns) {
  if (depth === 0 || gameFns.isTerminal(state)) {
    return { score: gameFns.evaluate(state), move: null };
  }

  const moves = gameFns.getValidMoves(state);
  if (moves.length === 0) {
    return { score: gameFns.evaluate(state), move: null };
  }

  let bestMove = moves[0];

  if (maximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      const newState = gameFns.applyMove(state, move);
      const { score } = minimax(newState, depth - 1, alpha, beta, false, gameFns);
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      const newState = gameFns.applyMove(state, move);
      const { score } = minimax(newState, depth - 1, alpha, beta, true, gameFns);
      if (score < minScore) {
        minScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return { score: minScore, move: bestMove };
  }
}

export function getBestMove(state, depth, gameFns, maximizing = true) {
  const { move } = minimax(state, depth, -Infinity, Infinity, maximizing, gameFns);
  return move;
}

// Difficulty presets
export const DIFFICULTY = {
  easy: { depth: 2, label: 'Easy' },
  medium: { depth: 4, label: 'Medium' },
  hard: { depth: 6, label: 'Hard' },
};
