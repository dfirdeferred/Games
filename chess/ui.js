import { createSquareBoard, highlightCells, clearHighlights, setCellContent, createPiece, renderSetupScreen } from '../shared-board/board-ui.js';
import { showModal } from '../shared/modal.js';
import { createGame, getValidMoves, applyMove, isTerminal, getResult, isInCheck } from './game.js';
import { getComputerMove } from './engine.js';
import { RULES_HTML } from './rules.js';

const PIECE_SYMBOLS = {
  white: { king: '\u2654', queen: '\u2655', rook: '\u2656', bishop: '\u2657', knight: '\u2658', pawn: '\u2659' },
  black: { king: '\u265A', queen: '\u265B', rook: '\u265C', bishop: '\u265D', knight: '\u265E', pawn: '\u265F' },
};

const container = document.getElementById('game-area');

document.getElementById('rules-btn').addEventListener('click', () => {
  showModal('How to Play - Chess', RULES_HTML);
});

let state, boardData, mode, difficulty, playerColor;
let selectedCell = null;
let validMovesForSelected = [];
let computerThinking = false;
let capturedByWhite = []; // pieces white captured (black pieces)
let capturedByBlack = []; // pieces black captured (white pieces)

async function init() {
  container.innerHTML = '';
  capturedByWhite = [];
  capturedByBlack = [];

  const setup = await renderSetupScreen(container, 'Chess', {
    colorLabels: ['White', 'Black'],
    subtitle: 'The classic game of strategy',
  });
  mode = setup.mode;
  difficulty = setup.difficulty;
  playerColor = setup.playerColor === 0 ? 'white' : 'black';
  startGame();
}

function startGame() {
  container.innerHTML = '';
  state = createGame();
  selectedCell = null;
  validMovesForSelected = [];
  computerThinking = false;
  capturedByWhite = [];
  capturedByBlack = [];

  const wrapper = document.createElement('div');
  wrapper.className = 'board-container';

  const turnDiv = document.createElement('div');
  turnDiv.id = 'turn-indicator';
  turnDiv.className = 'turn-indicator';
  wrapper.appendChild(turnDiv);

  const boardWrapper = document.createElement('div');
  boardWrapper.className = 'board-wrapper';

  const boardContainer = document.createElement('div');
  boardData = createSquareBoard(boardContainer, 8, onCellClick);
  boardWrapper.appendChild(boardContainer);

  // Side panel
  const infoPanel = document.createElement('div');
  infoPanel.className = 'game-info';

  infoPanel.innerHTML = `
    <div class="captured-section">
      <span class="label">Captured by White</span>
      <div class="captured-pieces" id="captured-white"></div>
    </div>
    <div class="captured-section">
      <span class="label">Captured by Black</span>
      <div class="captured-pieces" id="captured-black"></div>
    </div>
  `;
  boardWrapper.appendChild(infoPanel);
  wrapper.appendChild(boardWrapper);

  const msgDiv = document.createElement('div');
  msgDiv.id = 'chess-message';
  msgDiv.className = 'board-message';
  wrapper.appendChild(msgDiv);

  const controls = document.createElement('div');
  controls.className = 'game-controls';
  const newBtn = document.createElement('button');
  newBtn.className = 'btn btn-small';
  newBtn.textContent = 'New Game';
  newBtn.addEventListener('click', init);
  controls.appendChild(newBtn);
  wrapper.appendChild(controls);

  container.appendChild(wrapper);

  renderBoard();
  updateTurn();

  if (mode === 'pvc' && state.currentPlayer !== playerColor) {
    scheduleComputerMove();
  }
}

function renderBoard() {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (p) {
        const symbol = PIECE_SYMBOLS[p.color][p.type];
        setCellContent(boardData, r, c, createPiece(symbol, p.color));
      } else {
        setCellContent(boardData, r, c, '');
      }
    }
  }
  updateCheckHighlight();
  updateCaptured();
}

function updateCheckHighlight() {
  // Clear previous check highlights
  for (const cell of boardData.cells) {
    cell.classList.remove('check-highlight');
  }
  // Highlight king in check
  for (const color of ['white', 'black']) {
    if (isInCheck(state, color)) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = state.board[r][c];
          if (p && p.type === 'king' && p.color === color) {
            boardData.getCell(r, c).classList.add('check-highlight');
          }
        }
      }
    }
  }
}

function updateCaptured() {
  const whiteEl = document.getElementById('captured-white');
  const blackEl = document.getElementById('captured-black');
  if (whiteEl) {
    whiteEl.textContent = capturedByWhite.map(p => PIECE_SYMBOLS[p.color][p.type]).join(' ');
  }
  if (blackEl) {
    blackEl.textContent = capturedByBlack.map(p => PIECE_SYMBOLS[p.color][p.type]).join(' ');
  }
}

function updateTurn() {
  const el = document.getElementById('turn-indicator');
  if (!el) return;
  if (state.gameOver) {
    el.textContent = '';
    return;
  }
  const name = state.currentPlayer === 'white' ? 'White' : 'Black';
  el.textContent = `${name}'s Turn`;
  el.className = `turn-indicator active-${state.currentPlayer}`;

  const msg = document.getElementById('chess-message');
  if (msg) {
    if (isInCheck(state, state.currentPlayer)) {
      msg.textContent = 'Check!';
    } else {
      msg.textContent = '';
    }
  }
}

function onCellClick(row, col) {
  if (state.gameOver || computerThinking) return;
  if (mode === 'pvc' && state.currentPlayer !== playerColor) return;

  const p = state.board[row][col];

  if (selectedCell) {
    // Try to move
    const matchingMoves = validMovesForSelected.filter(
      m => m.to.row === row && m.to.col === col
    );
    if (matchingMoves.length > 0) {
      if (matchingMoves.length > 1) {
        // Multiple promotions - show dialog
        showPromotionDialog(matchingMoves);
        return;
      }
      executeMove(matchingMoves[0]);
      return;
    }
    // Clicked own piece - reselect
    if (p && p.color === state.currentPlayer) {
      selectPiece(row, col);
      return;
    }
    deselectPiece();
    return;
  }

  if (p && p.color === state.currentPlayer) {
    selectPiece(row, col);
  }
}

function selectPiece(row, col) {
  deselectPiece();
  selectedCell = { row, col };
  const allMoves = getValidMoves(state);
  validMovesForSelected = allMoves.filter(
    m => m.from.row === row && m.from.col === col
  );

  boardData.getCell(row, col).classList.add('selected');

  // Deduplicate target squares (promotion moves share same target)
  const targets = new Map();
  for (const m of validMovesForSelected) {
    const key = `${m.to.row},${m.to.col}`;
    if (!targets.has(key)) {
      targets.set(key, m);
    }
  }

  for (const [key, m] of targets) {
    const cell = boardData.getCell(m.to.row, m.to.col);
    const target = state.board[m.to.row][m.to.col];
    if (target) {
      cell.classList.add('capture-move');
    } else {
      // Check en passant
      const movingPiece = state.board[row][col];
      if (movingPiece && movingPiece.type === 'pawn' && m.to.col !== col && !target) {
        cell.classList.add('capture-move');
      } else {
        cell.classList.add('valid-move');
      }
    }
  }
}

function deselectPiece() {
  selectedCell = null;
  validMovesForSelected = [];
  clearHighlights(boardData);
  for (const cell of boardData.cells) {
    cell.classList.remove('capture-move', 'selected');
  }
}

function showPromotionDialog(moves) {
  const color = state.currentPlayer;
  const overlay = document.createElement('div');
  overlay.className = 'promotion-dialog';
  overlay.innerHTML = `
    <div class="promotion-choices">
      <h3>Promote Pawn</h3>
      <div class="promotion-buttons">
        <button class="promotion-btn" data-type="queen">${PIECE_SYMBOLS[color].queen}</button>
        <button class="promotion-btn" data-type="rook">${PIECE_SYMBOLS[color].rook}</button>
        <button class="promotion-btn" data-type="bishop">${PIECE_SYMBOLS[color].bishop}</button>
        <button class="promotion-btn" data-type="knight">${PIECE_SYMBOLS[color].knight}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelectorAll('.promotion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const move = moves.find(m => m.promotion === type);
      overlay.remove();
      if (move) executeMove(move);
    });
  });
}

function executeMove(move) {
  // Track captures
  const capturedPiece = state.board[move.to.row][move.to.col];
  const movingPiece = state.board[move.from.row][move.from.col];

  // En passant capture detection
  let epCapture = false;
  if (movingPiece && movingPiece.type === 'pawn' && state.enPassantTarget &&
      move.to.row === state.enPassantTarget.row && move.to.col === state.enPassantTarget.col) {
    epCapture = true;
  }

  if (capturedPiece) {
    if (state.currentPlayer === 'white') {
      capturedByWhite.push(capturedPiece);
    } else {
      capturedByBlack.push(capturedPiece);
    }
  } else if (epCapture) {
    const epPawn = state.board[move.from.row][move.to.col];
    if (epPawn) {
      if (state.currentPlayer === 'white') {
        capturedByWhite.push(epPawn);
      } else {
        capturedByBlack.push(epPawn);
      }
    }
  }

  // Clear previous last-move highlights
  for (const cell of boardData.cells) {
    cell.classList.remove('last-move');
  }

  state = applyMove(state, move);
  deselectPiece();
  renderBoard();

  boardData.getCell(move.from.row, move.from.col).classList.add('last-move');
  boardData.getCell(move.to.row, move.to.col).classList.add('last-move');

  updateTurn();

  if (state.gameOver) {
    showGameOver();
    return;
  }

  if (mode === 'pvc' && state.currentPlayer !== playerColor) {
    scheduleComputerMove();
  }
}

function scheduleComputerMove() {
  computerThinking = true;
  const msg = document.getElementById('chess-message');
  if (msg) msg.textContent = 'Computer thinking...';

  setTimeout(() => {
    const move = getComputerMove(state, difficulty);
    if (move) {
      executeMove(move);
    }
    computerThinking = false;
  }, 500);
}

function showGameOver() {
  const result = getResult(state);
  let title, cssClass, message;

  if (result === 'draw') {
    title = 'Draw';
    cssClass = 'draw';
    // Determine draw type
    if (state.halfMoveClock >= 100) {
      message = 'Draw by the 50-move rule.';
    } else {
      message = 'Stalemate - no legal moves available.';
    }
  } else if (mode === 'pvc') {
    if (result === playerColor) {
      title = 'Checkmate!';
      cssClass = 'win';
      message = 'You win! Excellent play!';
    } else {
      title = 'Checkmate';
      cssClass = 'lose';
      message = 'The computer wins. Better luck next time!';
    }
  } else {
    const winnerName = result === 'white' ? 'White' : 'Black';
    title = 'Checkmate!';
    cssClass = 'win';
    message = `${winnerName} wins by checkmate!`;
  }

  const overlay = document.createElement('div');
  overlay.className = 'board-game-over';
  overlay.innerHTML = `
    <div class="result-box">
      <h2 class="${cssClass}">${title}</h2>
      <p>${message}</p>
      <button class="btn btn-primary" id="play-again-btn">Play Again</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#play-again-btn').addEventListener('click', () => {
    overlay.remove();
    init();
  });
}

init();
