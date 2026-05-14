import { createSquareBoard, highlightCells, clearHighlights, setCellContent, renderSetupScreen } from '../shared-board/board-ui.js';
import { showModal } from '../shared/modal.js';
import { createGame, getValidMoves, applyMove, isTerminal, getResult } from './game.js';
import { getComputerMove } from './engine.js';
import { RULES_HTML } from './rules.js';

const container = document.getElementById('game-area');

document.getElementById('rules-btn').addEventListener('click', () => {
  showModal('How to Play - Breakthrough', RULES_HTML);
});

let state, boardData, mode, difficulty, playerColor;
let selectedCell = null;
let validMovesForSelected = [];
let computerThinking = false;

async function init() {
  container.innerHTML = '';
  const setup = await renderSetupScreen(container, 'Breakthrough', {
    colorLabels: ['White', 'Black'],
    subtitle: 'Race your pawns to the other side!',
  });
  mode = setup.mode;
  difficulty = setup.difficulty;
  // playerColor: 0 = White (player 2), 1 = Black (player 1)
  playerColor = setup.playerColor === 0 ? 2 : 1;
  startGame();
}

function startGame() {
  container.innerHTML = '';
  state = createGame();
  selectedCell = null;
  validMovesForSelected = [];
  computerThinking = false;

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

  wrapper.appendChild(boardWrapper);

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

  // If computer goes first
  if (mode === 'pvc' && state.currentPlayer !== playerColor) {
    scheduleComputerMove();
  }
}

function renderBoard() {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const val = state.board[r][c];
      if (val === 1) {
        setCellContent(boardData, r, c, '<div class="pawn black-pawn"></div>');
      } else if (val === 2) {
        setCellContent(boardData, r, c, '<div class="pawn white-pawn"></div>');
      } else {
        setCellContent(boardData, r, c, '');
      }
    }
  }
}

function updateTurn() {
  const el = document.getElementById('turn-indicator');
  if (!el) return;
  if (state.gameOver) {
    el.textContent = '';
    return;
  }
  const name = state.currentPlayer === 2 ? 'White' : 'Black';
  el.textContent = `${name}'s Turn`;
  el.className = `turn-indicator active-${name.toLowerCase()}`;
}

function onCellClick(row, col) {
  if (state.gameOver || computerThinking) return;
  if (mode === 'pvc' && state.currentPlayer !== playerColor) return;

  const piece = state.board[row][col];

  if (selectedCell) {
    // Try to move
    const move = validMovesForSelected.find(
      m => m.toRow === row && m.toCol === col
    );
    if (move) {
      executeMove(move);
      return;
    }
    // Clicked own piece - reselect
    if (piece === state.currentPlayer) {
      selectPiece(row, col);
      return;
    }
    // Deselect
    deselectPiece();
    return;
  }

  // Select a piece
  if (piece === state.currentPlayer) {
    selectPiece(row, col);
  }
}

function selectPiece(row, col) {
  deselectPiece();
  selectedCell = { row, col };
  const allMoves = getValidMoves(state);
  validMovesForSelected = allMoves.filter(
    m => m.fromRow === row && m.fromCol === col
  );

  boardData.getCell(row, col).classList.add('selected');

  for (const m of validMovesForSelected) {
    const cell = boardData.getCell(m.toRow, m.toCol);
    if (state.board[m.toRow][m.toCol] !== 0) {
      cell.classList.add('capture-move');
    } else {
      cell.classList.add('valid-move');
    }
  }
}

function deselectPiece() {
  selectedCell = null;
  validMovesForSelected = [];
  clearHighlights(boardData);
  // Also clear capture-move
  for (const cell of boardData.cells) {
    cell.classList.remove('capture-move', 'selected');
  }
}

function executeMove(move) {
  // Clear previous last-move highlights
  for (const cell of boardData.cells) {
    cell.classList.remove('last-move');
  }

  state = applyMove(state, move);
  deselectPiece();
  renderBoard();

  // Highlight last move
  boardData.getCell(move.fromRow, move.fromCol).classList.add('last-move');
  boardData.getCell(move.toRow, move.toCol).classList.add('last-move');

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
  setTimeout(() => {
    const move = getComputerMove(state, difficulty);
    if (move) {
      executeMove(move);
    }
    computerThinking = false;
  }, 300);
}

function showGameOver() {
  const result = getResult(state);
  let title, cssClass, message;

  if (mode === 'pvc') {
    if (result === playerColor) {
      title = 'You Win!';
      cssClass = 'win';
      message = 'Congratulations! You broke through!';
    } else {
      title = 'You Lose';
      cssClass = 'lose';
      message = 'The computer broke through first.';
    }
  } else {
    const winnerName = result === 2 ? 'White' : 'Black';
    title = `${winnerName} Wins!`;
    cssClass = 'win';
    message = `${winnerName} reached the other side!`;
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
