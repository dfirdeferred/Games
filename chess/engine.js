import { getBestMove } from '../shared-board/minimax.js';
import { getValidMoves, applyMove, evaluate, isTerminal } from './game.js';

const DEPTHS = { easy: 2, medium: 3, hard: 4 };

export function getComputerMove(state, difficulty) {
  const depth = DEPTHS[difficulty] || 3;
  const gameFns = { getValidMoves, applyMove, evaluate, isTerminal };
  // White is maximizing, black is minimizing
  const maximizing = state.currentPlayer === 'white';
  return getBestMove(state, depth, gameFns, maximizing);
}
