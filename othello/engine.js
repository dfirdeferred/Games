/**
 * Othello AI – wraps the shared minimax solver.
 */
import { getBestMove, DIFFICULTY } from '../shared-board/minimax.js';
import { getValidMoves, applyMove, evaluate, isTerminal } from './game.js';

const gameFns = { getValidMoves, applyMove, evaluate, isTerminal };

/**
 * Return the best move for the computer.
 * @param {object} state  – current game state
 * @param {string} difficulty – 'easy' | 'medium' | 'hard'
 * @returns {{row, col}}
 */
export function getComputerMove(state, difficulty = 'medium') {
  const depth = DIFFICULTY[difficulty]?.depth ?? 4;
  // Computer maximises when playing as BLACK (player 1)
  const maximizing = state.currentPlayer === 1;
  return getBestMove(state, depth, gameFns, maximizing);
}
