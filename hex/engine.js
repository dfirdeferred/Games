/**
 * Hex AI - wraps the shared minimax solver.
 */
import { getBestMove } from '../shared-board/minimax.js';
import { getValidMoves, applyMove, evaluate, isTerminal } from './game.js';

const DEPTHS = { easy: 2, medium: 3, hard: 4 };

const gameFns = { getValidMoves, applyMove, evaluate, isTerminal };

/**
 * Return the best move for the computer.
 * @param {object} state  - current game state
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {{row, col}}
 */
export function getComputerMove(state, difficulty = 'medium') {
  const depth = DEPTHS[difficulty] || 3;
  // Red (1) is maximizing, Blue (2) is minimizing
  const maximizing = state.currentPlayer === 1;

  // For larger boards, limit moves considered at higher depths
  // to keep performance reasonable
  const limitedGameFns = { ...gameFns };
  if (state.size >= 11 && depth >= 3) {
    limitedGameFns.getValidMoves = (s) => {
      const moves = getValidMoves(s);
      if (moves.length <= 20) return moves;

      // Prioritize moves near existing stones
      const scored = moves.map(m => {
        let adjacentScore = 0;
        const dirs = [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0]];
        for (const [dr, dc] of dirs) {
          const nr = m.row + dr;
          const nc = m.col + dc;
          if (nr >= 0 && nr < s.size && nc >= 0 && nc < s.size) {
            if (s.board[nr][nc] !== 0) adjacentScore += 2;
          }
        }
        // Center bonus
        const centerDist = Math.abs(m.row - Math.floor(s.size / 2)) +
                          Math.abs(m.col - Math.floor(s.size / 2));
        adjacentScore += Math.max(0, s.size - centerDist);
        return { move: m, score: adjacentScore };
      });

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, 25).map(s => s.move);
    };
  }

  return getBestMove(state, depth, limitedGameFns, maximizing);
}
