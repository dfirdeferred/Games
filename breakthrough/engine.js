import { getBestMove } from '../shared-board/minimax.js';
import { getValidMoves, applyMove, evaluate, isTerminal } from './game.js';

const DEPTHS = { easy: 3, medium: 5, hard: 6 };

export function getComputerMove(state, difficulty) {
  const depth = DEPTHS[difficulty] || 4;
  const gameFns = { getValidMoves, applyMove, evaluate, isTerminal };
  // Black (1) is maximizing, White (2) is minimizing
  const maximizing = state.currentPlayer === 1;
  return getBestMove(state, depth, gameFns, maximizing);
}
