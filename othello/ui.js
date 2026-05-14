/**
 * Othello – main UI entry point.
 */
import { createSquareBoard, createDisc, setCellContent, renderSetupScreen } from '../shared-board/board-ui.js';
import { showModal } from '../shared/modal.js';
import { createGame, getValidMoves, applyMove, isValidMove, getScore, isTerminal } from './game.js';
import { getComputerMove } from './engine.js';
import { RULES_HTML } from './rules.js';

const container = document.getElementById('game-area');

let state;
let boardData;
let mode;        // 'pvc' | 'pvp'
let difficulty;  // 'easy' | 'medium' | 'hard'
let humanColor;  // 0 = black (player 1), 1 = white (player 2)
let thinking = false;

/* ---------- bootstrap ---------- */

async function init() {
  container.innerHTML = '';
  thinking = false;

  const setup = await renderSetupScreen(container, 'Othello', {
    colorLabels: ['Black (first)', 'White'],
  });

  mode = setup.mode;
  difficulty = setup.difficulty;
  humanColor = setup.playerColor; // 0 → black(1), 1 → white(2)

  startGame();
}

/* ---------- game start ---------- */

function startGame() {
  state = createGame();
  container.innerHTML = '';

  // Turn indicator
  const turnEl = document.createElement('div');
  turnEl.className = 'turn-indicator';
  turnEl.id = 'turn-indicator';
  container.appendChild(turnEl);

  // Score display
  const scoreEl = document.createElement('div');
  scoreEl.className = 'score-display';
  scoreEl.id = 'score-display';
  container.appendChild(scoreEl);

  // Board
  boardData = createSquareBoard(container, 8, onCellClick, { uniformColor: true });

  // Message area
  const msgEl = document.createElement('div');
  msgEl.className = 'board-message';
  msgEl.id = 'board-message';
  container.appendChild(msgEl);

  // Controls
  const controls = document.createElement('div');
  controls.className = 'game-controls';
  controls.innerHTML = `
    <button class="btn btn-small" id="new-game-btn">New Game</button>
    <button class="btn btn-small" id="rules-btn-game">How to Play</button>
  `;
  container.appendChild(controls);

  document.getElementById('new-game-btn').addEventListener('click', init);
  document.getElementById('rules-btn-game').addEventListener('click', showRules);

  render();

  // If computer goes first
  if (mode === 'pvc' && isComputerTurn()) {
    scheduleComputerMove();
  }
}

/* ---------- rendering ---------- */

function render() {
  const { board } = state;

  // Draw all discs
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = boardData.getCell(r, c);
      cell.classList.remove('last-placed');

      if (board[r][c] === 1) {
        setCellContent(boardData, r, c, createDisc('black-disc'));
      } else if (board[r][c] === 2) {
        setCellContent(boardData, r, c, createDisc('white-disc'));
      } else {
        setCellContent(boardData, r, c, '');
      }
    }
  }

  // Show valid-move previews for the current human player
  if (!state.gameOver && !thinking) {
    const moves = getValidMoves(state);
    const discClass = state.currentPlayer === 1 ? 'black-disc' : 'white-disc';
    if (!isComputerTurn()) {
      for (const { row, col } of moves) {
        setCellContent(boardData, row, col, createDisc(`${discClass} preview`));
      }
    }
  }

  // Update turn indicator
  const turnEl = document.getElementById('turn-indicator');
  if (state.gameOver) {
    turnEl.textContent = 'Game Over';
    turnEl.className = 'turn-indicator';
  } else {
    const name = state.currentPlayer === 1 ? 'Black' : 'White';
    turnEl.textContent = `${name}'s Turn`;
    turnEl.className = `turn-indicator ${state.currentPlayer === 1 ? 'active-black' : 'active-white'}`;
  }

  // Update score
  const score = getScore(state);
  const scoreEl = document.getElementById('score-display');
  scoreEl.innerHTML = `
    <div class="score-row">
      <span><span class="score-disc black"></span>Black</span>
      <span class="score-val">${score.black}</span>
    </div>
    <div class="score-row">
      <span><span class="score-disc white"></span>White</span>
      <span class="score-val">${score.white}</span>
    </div>
  `;

  // Check terminal
  if (isTerminal(state)) {
    state = { ...state, gameOver: true };
    showGameOver();
  }
}

/* ---------- interaction ---------- */

function onCellClick(row, col) {
  if (state.gameOver || thinking) return;
  if (isComputerTurn()) return;
  if (!isValidMove(state, row, col)) return;

  state = applyMove(state, { row, col });
  render();

  handlePostMove();
}

function handlePostMove() {
  if (state.gameOver || isTerminal(state)) {
    state = { ...state, gameOver: true };
    render();
    return;
  }

  // Check if the next player must pass
  const moves = getValidMoves(state);
  if (moves.length === 0) {
    // Auto-pass
    setMessage(`${state.currentPlayer === 1 ? 'Black' : 'White'} has no moves — pass!`);
    state = applyMove(state, null);
    render();

    if (isTerminal(state)) {
      state = { ...state, gameOver: true };
      render();
      return;
    }
  }

  // Computer's turn?
  if (mode === 'pvc' && isComputerTurn()) {
    scheduleComputerMove();
  }
}

function scheduleComputerMove() {
  thinking = true;
  setMessage('Computer is thinking...');

  setTimeout(() => {
    if (state.gameOver) { thinking = false; return; }

    const moves = getValidMoves(state);
    if (moves.length === 0) {
      // Computer must pass
      setMessage('Computer has no moves — pass!');
      state = applyMove(state, null);
      thinking = false;
      render();
      handlePostMove();
      return;
    }

    const move = getComputerMove(state, difficulty);
    state = applyMove(state, move);
    thinking = false;
    render();
    handlePostMove();
  }, 300);
}

/* ---------- helpers ---------- */

function isComputerTurn() {
  if (mode !== 'pvc') return false;
  // humanColor 0 → human is BLACK (1); humanColor 1 → human is WHITE (2)
  const humanPlayer = humanColor === 0 ? 1 : 2;
  return state.currentPlayer !== humanPlayer;
}

function setMessage(text) {
  const el = document.getElementById('board-message');
  if (el) el.textContent = text;
}

/* ---------- game over ---------- */

function showGameOver() {
  const score = getScore(state);
  let resultClass, title;

  if (score.black > score.white) {
    title = 'Black Wins!';
    resultClass = 'win';
  } else if (score.white > score.black) {
    title = 'White Wins!';
    resultClass = 'win';
  } else {
    title = 'Draw!';
    resultClass = 'draw';
  }

  // In PvC, adjust messaging
  if (mode === 'pvc') {
    const humanPlayer = humanColor === 0 ? 1 : 2;
    const humanWon = (humanPlayer === 1 && score.black > score.white) ||
                     (humanPlayer === 2 && score.white > score.black);
    const isDraw = score.black === score.white;
    if (isDraw) {
      resultClass = 'draw';
    } else {
      resultClass = humanWon ? 'win' : 'lose';
      title = humanWon ? 'You Win!' : 'You Lose!';
    }
  }

  const overlay = document.createElement('div');
  overlay.className = 'board-game-over';
  overlay.innerHTML = `
    <div class="result-box">
      <h2 class="${resultClass}">${title}</h2>
      <p>Black ${score.black} &mdash; ${score.white} White</p>
      <button class="btn btn-primary" id="play-again-btn">Play Again</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('play-again-btn').addEventListener('click', () => {
    overlay.remove();
    init();
  });
}

/* ---------- rules ---------- */

function showRules() {
  showModal('How to Play Othello', RULES_HTML);
}

// Wire up the header rules button
document.getElementById('rules-btn')?.addEventListener('click', showRules);

// Start
init();
