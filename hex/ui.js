/**
 * Hex UI - renders hexagonal board and handles interaction.
 */
import { createGame, getValidMoves, applyMove, isTerminal, findWinningPath } from './game.js';
import { getComputerMove } from './engine.js';
import { renderSetupScreen } from '../shared-board/board-ui.js';
import { showModal } from '../shared/modal.js';
import { RULES_HTML } from './rules.js';

const gameArea = document.getElementById('game-area');

let state = null;
let mode = 'pvc';
let difficulty = 'medium';
let humanPlayer = 1; // 1=red, 2=blue
let computerThinking = false;

// Boot
document.getElementById('rules-btn').addEventListener('click', () => {
  showModal('How to Play - Hex', RULES_HTML);
});

showSetup();

async function showSetup() {
  gameArea.innerHTML = '';
  const config = await renderSetupScreen(gameArea, 'Hex', {
    colorLabels: ['Red', 'Blue'],
    subtitle: 'Connect your two sides with an unbroken chain of stones.',
  });
  mode = config.mode;
  difficulty = config.difficulty;
  humanPlayer = config.playerColor === 0 ? 1 : 2; // 0=Red, 1=Blue
  startGame();
}

function startGame() {
  state = createGame(11);
  computerThinking = false;
  render();

  // If computer goes first
  if (mode === 'pvc' && state.currentPlayer !== humanPlayer) {
    scheduleComputerMove();
  }
}

function render() {
  gameArea.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'board-container';

  // Info bar
  const info = document.createElement('div');
  info.className = 'hex-info';

  const turnDiv = document.createElement('div');
  turnDiv.className = 'hex-turn';
  const dot = document.createElement('div');
  dot.className = `hex-turn-dot ${state.currentPlayer === 1 ? 'red' : 'blue'}`;
  turnDiv.appendChild(dot);

  let turnText;
  if (state.gameOver) {
    const winColor = state.winner === 1 ? 'Red' : 'Blue';
    turnText = `${winColor} wins!`;
  } else if (computerThinking) {
    turnText = 'Computer thinking...';
  } else {
    const color = state.currentPlayer === 1 ? 'Red' : 'Blue';
    if (mode === 'pvp') {
      turnText = `${color}'s turn`;
    } else {
      turnText = state.currentPlayer === humanPlayer ? 'Your turn' : 'Computer\'s turn';
    }
  }
  const turnLabel = document.createTextNode(turnText);
  turnDiv.appendChild(turnLabel);
  info.appendChild(turnDiv);

  // Swap button
  if (state.swapAvailable && !state.gameOver && state.currentPlayer === 2) {
    const isHumanTurn = mode === 'pvp' || state.currentPlayer === humanPlayer;
    if (isHumanTurn) {
      const swapBtn = document.createElement('button');
      swapBtn.className = 'btn btn-small hex-swap-btn';
      swapBtn.textContent = 'Swap';
      swapBtn.title = 'Take the first player\'s stone position';
      swapBtn.addEventListener('click', () => {
        if (computerThinking || state.gameOver) return;
        state = applyMove(state, { swap: true });
        render();
        if (mode === 'pvc' && state.currentPlayer !== humanPlayer) {
          scheduleComputerMove();
        }
      });
      info.appendChild(swapBtn);
    }
  }

  container.appendChild(info);

  // Board wrapper with border indicators
  const boardWrapper = document.createElement('div');
  boardWrapper.style.position = 'relative';
  boardWrapper.style.display = 'inline-block';

  // Top border (red)
  const topBorder = document.createElement('div');
  topBorder.className = 'hex-border-top';
  topBorder.style.width = '80%';
  topBorder.style.marginLeft = '10%';
  boardWrapper.appendChild(topBorder);

  // Left border (blue)
  const leftBorder = document.createElement('div');
  leftBorder.className = 'hex-border-left';
  boardWrapper.appendChild(leftBorder);

  // Right border (blue)
  const rightBorder = document.createElement('div');
  rightBorder.className = 'hex-border-right';
  boardWrapper.appendChild(rightBorder);

  // Hex board
  const boardDiv = document.createElement('div');
  boardDiv.className = 'hex-board';

  // Find winning path if game is over
  let winPath = [];
  if (state.gameOver && state.winner) {
    winPath = findWinningPath(state.board, state.winner, state.size);
  }
  const winSet = new Set(winPath.map(p => `${p.row},${p.col}`));

  for (let r = 0; r < state.size; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'hex-row';
    // Offset each row to create rhombus shape
    rowDiv.style.marginLeft = `${r * 23}px`;

    for (let c = 0; c < state.size; c++) {
      const cell = document.createElement('div');
      cell.className = 'hex-cell';

      if (state.board[r][c] === 1) {
        cell.classList.add('red-stone', 'occupied');
      } else if (state.board[r][c] === 2) {
        cell.classList.add('blue-stone', 'occupied');
      }

      if (winSet.has(`${r},${c}`)) {
        cell.classList.add('win-path');
      }

      cell.addEventListener('click', () => handleCellClick(r, c));
      rowDiv.appendChild(cell);
    }
    boardDiv.appendChild(rowDiv);
  }

  boardWrapper.appendChild(boardDiv);

  // Bottom border (red)
  const bottomBorder = document.createElement('div');
  bottomBorder.className = 'hex-border-bottom';
  bottomBorder.style.width = '80%';
  bottomBorder.style.marginLeft = `${state.size * 23 * 0.1 + state.size * 23 * 0.1}px`;
  boardWrapper.appendChild(bottomBorder);

  container.appendChild(boardWrapper);

  // Controls
  const controls = document.createElement('div');
  controls.className = 'game-controls';

  const newGameBtn = document.createElement('button');
  newGameBtn.className = 'btn btn-small';
  newGameBtn.textContent = 'New Game';
  newGameBtn.addEventListener('click', () => showSetup());
  controls.appendChild(newGameBtn);

  const restartBtn = document.createElement('button');
  restartBtn.className = 'btn btn-small';
  restartBtn.textContent = 'Restart';
  restartBtn.addEventListener('click', () => startGame());
  controls.appendChild(restartBtn);

  container.appendChild(controls);

  gameArea.appendChild(container);

  // Game over overlay
  if (state.gameOver) {
    showGameOver();
  }
}

function handleCellClick(row, col) {
  if (state.gameOver || computerThinking) return;
  if (state.board[row][col] !== 0) return;

  // In PvC mode, only allow human player's turn
  if (mode === 'pvc' && state.currentPlayer !== humanPlayer) return;

  state = applyMove(state, { row, col });
  render();

  if (!state.gameOver && mode === 'pvc' && state.currentPlayer !== humanPlayer) {
    scheduleComputerMove();
  }
}

function scheduleComputerMove() {
  computerThinking = true;
  render();

  setTimeout(() => {
    // Check for swap on computer's turn (blue, moveCount=1)
    if (state.swapAvailable && state.currentPlayer === 2) {
      // Simple heuristic: swap if the stone is near center
      const size = state.size;
      const center = Math.floor(size / 2);
      let stoneR = -1, stoneC = -1;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (state.board[r][c] === 1) { stoneR = r; stoneC = c; }
        }
      }
      const dist = Math.abs(stoneR - center) + Math.abs(stoneC - center);
      if (dist <= 3) {
        // Swap - the center stone is strong
        state = applyMove(state, { swap: true });
        computerThinking = false;
        render();
        return;
      }
    }

    const move = getComputerMove(state, difficulty);
    if (move) {
      state = applyMove(state, move);
    }
    computerThinking = false;
    render();

    // If computer still needs to move (shouldn't happen, but safety)
    if (!state.gameOver && mode === 'pvc' && state.currentPlayer !== humanPlayer) {
      scheduleComputerMove();
    }
  }, 300);
}

function showGameOver() {
  const overlay = document.createElement('div');
  overlay.className = 'board-game-over';

  const box = document.createElement('div');
  box.className = 'result-box';

  const winColor = state.winner === 1 ? 'Red' : 'Blue';
  let heading, resultClass, message;

  if (mode === 'pvp') {
    heading = `${winColor} Wins!`;
    resultClass = 'win';
    message = `${winColor} has connected their sides.`;
  } else {
    const humanWon = state.winner === humanPlayer;
    heading = humanWon ? 'You Win!' : 'You Lose';
    resultClass = humanWon ? 'win' : 'lose';
    message = humanWon
      ? 'You connected your sides!'
      : 'The computer connected its sides.';
  }

  box.innerHTML = `
    <h2 class="${resultClass}">${heading}</h2>
    <p>${message}</p>
    <div class="game-controls">
      <button class="btn" id="go-rematch">Rematch</button>
      <button class="btn" id="go-setup">New Setup</button>
    </div>
  `;

  overlay.appendChild(box);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);

  document.getElementById('go-rematch').addEventListener('click', () => {
    overlay.remove();
    startGame();
  });
  document.getElementById('go-setup').addEventListener('click', () => {
    overlay.remove();
    showSetup();
  });
}
