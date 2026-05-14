/**
 * Quoridor AI - wraps the shared minimax solver with smart wall filtering.
 */
import { getBestMove } from '../shared-board/minimax.js';
import {
  getValidMoves, applyMove, evaluate, isTerminal,
  shortestPathLength, isBlocked, hasPath, SIZE
} from './game.js';

const DEPTHS = { easy: 2, medium: 3, hard: 4 };

/**
 * Filter wall moves to only those near pawns or along shortest paths.
 * This dramatically reduces branching factor.
 */
function getSmartMoves(state) {
  if (state.gameOver) return [];

  const allMoves = getValidMoves(state);
  const pawnMoves = allMoves.filter(m => m.type === 'move');
  const wallMoves = allMoves.filter(m => m.type === 'wall');

  if (wallMoves.length === 0) return pawnMoves;

  // Find BFS paths for both players to identify important corridors
  const p0 = state.pawns[0];
  const p1 = state.pawns[1];

  // Score each wall move by proximity to pawns and path relevance
  const scoredWalls = wallMoves.map(w => {
    let score = 0;

    // Distance to each pawn
    const d0 = Math.abs(w.row - p0.row) + Math.abs(w.col - p0.col);
    const d1 = Math.abs(w.row - p1.row) + Math.abs(w.col - p1.col);
    const minDist = Math.min(d0, d1);

    // Prefer walls near pawns
    if (minDist <= 1) score += 10;
    else if (minDist <= 2) score += 5;
    else if (minDist <= 3) score += 2;
    else score += 0;

    // Prefer walls that are between the pawns vertically
    const minRow = Math.min(p0.row, p1.row);
    const maxRow = Math.max(p0.row, p1.row);
    if (w.row >= minRow && w.row <= maxRow) score += 3;

    return { move: w, score };
  });

  // Sort by score descending and take top N
  scoredWalls.sort((a, b) => b.score - a.score);
  const maxWalls = 12;
  const selectedWalls = scoredWalls.slice(0, maxWalls).map(s => s.move);

  return [...pawnMoves, ...selectedWalls];
}

/**
 * Return the best move for the computer.
 */
export function getComputerMove(state, difficulty = 'medium') {
  const depth = DEPTHS[difficulty] || 3;
  // Player 0 is maximizing
  const maximizing = state.currentPlayer === 0;

  const gameFns = {
    getValidMoves: getSmartMoves,
    applyMove,
    evaluate,
    isTerminal,
  };

  return getBestMove(state, depth, gameFns, maximizing);
}
