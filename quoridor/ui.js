/**
 * Quoridor UI - renders the board with wall slots and handles interaction.
 */
import {
  createGame, getValidMoves, applyMove, isTerminal, isBlocked,
  hasPath, shortestPathLength, SIZE
} from './game.js';
import { getComputerMove } from './engine.js';
import { renderSetupScreen } from '../shared-board/board-ui.js';
import { showModal } from '../shared/modal.js';
import { RULES_HTML } from './rules.js';

const gameArea = document.getElementById('game-area');

let state = null;
let mode = 'pvc';
let difficulty = 'medium';
let humanPlayer = 0; // 0=black(top), 1=white(bottom)
let computerThinking = false;
let interactionMode = 'move'; // 'move' or 'wall'
let wallOrientation = 'h'; // 'h' or 'v'
let wallPreview = null; // {row, col, orientation} for hover preview

// Boot
document.getElementById('rules-btn').addEventListener('click', () => {
  showModal('How to Play - Quoridor', RULES_HTML);
});

showSetup();

async function showSetup() {
  gameArea.innerHTML = '';
  const config = await renderSetupScreen(gameArea, 'Quoridor', {
    colorLabels: ['Black (Top)', 'White (Bottom)'],
    subtitle: 'Race to the other side while blocking your opponent with walls.',
  });
  mode = config.mode;
  difficulty = config.difficulty;
  humanPlayer = config.playerColor; // 0=black, 1=white
  startGame();
}

function startGame() {
  state = createGame();
  computerThinking = false;
  interactionMode = 'move';
  wallOrientation = 'h';
  wallPreview = null;
  render();

  if (mode === 'pvc' && state.currentPlayer !== humanPlayer) {
    scheduleComputerMove();
  }
}

/**
 * Build the grid. The visual grid is 17x17:
 * - Odd rows/cols (0,2,4,...,16) are cells (9 cells)
 * - Even rows/cols (1,3,...,15) are wall gaps
 * - Cell at board (r,c) maps to grid (r*2, c*2)
 * - Horizontal wall gap between rows r and r+1 at col c: grid (r*2+1, c*2)
 * - Vertical wall gap between cols c and c+1 at row r: grid (r*2, c*2+1)
 * - Cross gap at grid (r*2+1, c*2+1)
 */
function render() {
  gameArea.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'board-container';

  const wrapper = document.createElement('div');
  wrapper.className = 'board-wrapper';

  // Build the board
  const boardDiv = document.createElement('div');
  boardDiv.className = 'quoridor-board';
  const gridSize = SIZE * 2 - 1; // 17
  boardDiv.style.gridTemplateColumns = buildGridTemplate();
  boardDiv.style.gridTemplateRows = buildGridTemplate();

  // Determine valid pawn moves for current player
  const validPawnMoves = getValidPawnMoves();
  const validPawnSet = new Set(validPawnMoves.map(m => `${m.row},${m.col}`));

  // Determine which wall gaps are filled
  const wallMap = buildWallMap();

  for (let gr = 0; gr < gridSize; gr++) {
    for (let gc = 0; gc < gridSize; gc++) {
      const isRowGap = gr % 2 === 1;
      const isColGap = gc % 2 === 1;

      if (!isRowGap && !isColGap) {
        // Board cell
        const boardRow = gr / 2;
        const boardCol = gc / 2;
        const cell = document.createElement('div');
        cell.className = 'quoridor-cell';

        // Add pawn if present
        for (let p = 0; p < 2; p++) {
          if (state.pawns[p].row === boardRow && state.pawns[p].col === boardCol) {
            const pawn = document.createElement('div');
            pawn.className = `q-pawn pawn-p${p}`;
            cell.appendChild(pawn);
          }
        }

        // Show valid move targets
        const isHumanTurn = mode === 'pvp' || state.currentPlayer === humanPlayer;
        if (!state.gameOver && !computerThinking && isHumanTurn &&
            interactionMode === 'move' && validPawnSet.has(`${boardRow},${boardCol}`)) {
          cell.classList.add('valid-target');
        }

        cell.addEventListener('click', () => handleCellClick(boardRow, boardCol));
        boardDiv.appendChild(cell);
      } else {
        // Wall gap
        const gap = document.createElement('div');
        gap.className = 'quoridor-gap';

        if (isRowGap && !isColGap) {
          gap.classList.add('quoridor-gap-h');
        } else if (!isRowGap && isColGap) {
          gap.classList.add('quoridor-gap-v');
        } else {
          gap.classList.add('quoridor-gap-cross');
        }

        // Check if this gap has a wall
        const wallKey = `${gr},${gc}`;
        if (wallMap.has(wallKey)) {
          gap.classList.add('wall-placed', `wall-p${wallMap.get(wallKey)}`);
        }

        // Wall preview on hover
        if (wallPreview && isWallPreviewGap(gr, gc, wallPreview)) {
          gap.classList.add('wall-hover');
        }

        // Wall placement click handler
        if (!isRowGap || !isColGap) {
          // Only handle non-cross gaps for wall placement
          gap.addEventListener('click', () => handleGapClick(gr, gc));
          gap.addEventListener('mouseenter', () => handleGapHover(gr, gc));
          gap.addEventListener('mouseleave', () => handleGapLeave());
        }

        boardDiv.appendChild(gap);
      }
    }
  }

  wrapper.appendChild(boardDiv);

  // Info panel
  const info = document.createElement('div');
  info.className = 'quoridor-info';

  // Turn indicator
  const turnDiv = document.createElement('div');
  turnDiv.className = 'quoridor-turn';
  let turnText;
  if (state.gameOver) {
    const winner = state.winner === 0 ? 'Black' : 'White';
    turnText = `${winner} wins!`;
  } else if (computerThinking) {
    turnText = 'Computer thinking...';
  } else if (mode === 'pvp') {
    turnText = `${state.currentPlayer === 0 ? 'Black' : 'White'}'s turn`;
  } else {
    turnText = state.currentPlayer === humanPlayer ? 'Your turn' : 'Computer\'s turn';
  }
  turnDiv.textContent = turnText;
  info.appendChild(turnDiv);

  // Wall counts
  const wallsDiv = document.createElement('div');
  wallsDiv.className = 'quoridor-walls-info';
  for (let p = 0; p < 2; p++) {
    const row = document.createElement('div');
    row.className = 'wall-count-row';
    const label = document.createElement('span');
    label.textContent = p === 0 ? 'Black walls:' : 'White walls:';
    row.appendChild(label);
    const pips = document.createElement('div');
    pips.className = 'wall-pips';
    for (let i = 0; i < 10; i++) {
      const pip = document.createElement('div');
      pip.className = `wall-pip${i >= state.wallCounts[p] ? ' used' : ''}`;
      pips.appendChild(pip);
    }
    row.appendChild(pips);
    wallsDiv.appendChild(row);
  }
  info.appendChild(wallsDiv);

  // Mode toggle (move / wall) - only show during human turn
  const isHumanTurn = !state.gameOver && !computerThinking &&
    (mode === 'pvp' || state.currentPlayer === humanPlayer);

  if (isHumanTurn) {
    const modeDiv = document.createElement('div');
    modeDiv.className = 'mode-toggle';

    const moveBtn = document.createElement('button');
    moveBtn.textContent = 'Move';
    moveBtn.className = interactionMode === 'move' ? 'active' : '';
    moveBtn.addEventListener('click', () => {
      interactionMode = 'move';
      wallPreview = null;
      render();
    });

    const wallBtn = document.createElement('button');
    wallBtn.textContent = 'Wall';
    wallBtn.className = interactionMode === 'wall' ? 'active' : '';
    const canPlaceWalls = state.wallCounts[state.currentPlayer] > 0;
    wallBtn.disabled = !canPlaceWalls;
    wallBtn.addEventListener('click', () => {
      if (!canPlaceWalls) return;
      interactionMode = 'wall';
      render();
    });

    modeDiv.appendChild(moveBtn);
    modeDiv.appendChild(wallBtn);
    info.appendChild(modeDiv);

    // Orientation toggle (only in wall mode)
    if (interactionMode === 'wall') {
      const oriDiv = document.createElement('div');
      oriDiv.className = 'ori-toggle';

      const hBtn = document.createElement('button');
      hBtn.textContent = 'Horizontal';
      hBtn.className = wallOrientation === 'h' ? 'active' : '';
      hBtn.addEventListener('click', () => { wallOrientation = 'h'; wallPreview = null; render(); });

      const vBtn = document.createElement('button');
      vBtn.textContent = 'Vertical';
      vBtn.className = wallOrientation === 'v' ? 'active' : '';
      vBtn.addEventListener('click', () => { wallOrientation = 'v'; wallPreview = null; render(); });

      oriDiv.appendChild(hBtn);
      oriDiv.appendChild(vBtn);
      info.appendChild(oriDiv);
    }
  }

  wrapper.appendChild(info);
  container.appendChild(wrapper);

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

  if (state.gameOver) {
    showGameOver();
  }
}

function buildGridTemplate() {
  // 9 cells + 8 gaps = 17 tracks
  // Cells get 1fr, gaps get a fixed narrow width
  const parts = [];
  for (let i = 0; i < 17; i++) {
    parts.push(i % 2 === 0 ? '1fr' : '6px');
  }
  return parts.join(' ');
}

function getValidPawnMoves() {
  if (state.gameOver) return [];
  return getValidMoves(state).filter(m => m.type === 'move');
}

/**
 * Build a map of grid positions that have walls placed on them.
 * Returns Map<"gr,gc", playerIndex>
 */
function buildWallMap() {
  const map = new Map();

  // We need to track which player placed each wall for coloring
  // Since the state doesn't store who placed each wall, we infer:
  // walls are placed alternating, starting from player who went first.
  // Actually, we can't know. Just color all walls the same or based on state.
  // Let's just mark them as placed. For coloring, use alternating.

  for (let i = 0; i < state.walls.length; i++) {
    const w = state.walls[i];
    // Determine which player placed this wall based on turn order
    // Wall i was placed on turn (some_turn). Approximate: even index = p0, odd = p1
    // This isn't perfect but good enough for visual distinction
    const placer = i % 2 === 0 ? (state.pawns[0].row <= 4 ? 0 : 1) : (state.pawns[0].row <= 4 ? 1 : 0);

    if (w.orientation === 'h') {
      // Horizontal wall at (w.row, w.col): fills grid positions
      // Between board rows w.row and w.row+1, at cols w.col and w.col+1
      const gr = w.row * 2 + 1;
      const gc1 = w.col * 2;
      const gc2 = w.col * 2 + 2;
      const gcMid = w.col * 2 + 1;
      map.set(`${gr},${gc1}`, 0);
      map.set(`${gr},${gc2}`, 0);
      map.set(`${gr},${gcMid}`, 0);
    } else {
      // Vertical wall at (w.row, w.col): fills grid positions
      // Between board cols w.col and w.col+1, at rows w.row and w.row+1
      const gc = w.col * 2 + 1;
      const gr1 = w.row * 2;
      const gr2 = w.row * 2 + 2;
      const grMid = w.row * 2 + 1;
      map.set(`${gr1},${gc}`, 1);
      map.set(`${gr2},${gc}`, 1);
      map.set(`${grMid},${gc}`, 1);
    }
  }
  return map;
}

function isWallPreviewGap(gr, gc, preview) {
  if (preview.orientation === 'h') {
    const wallGr = preview.row * 2 + 1;
    const gc1 = preview.col * 2;
    const gc2 = preview.col * 2 + 2;
    const gcMid = preview.col * 2 + 1;
    return gr === wallGr && (gc === gc1 || gc === gc2 || gc === gcMid);
  } else {
    const wallGc = preview.col * 2 + 1;
    const gr1 = preview.row * 2;
    const gr2 = preview.row * 2 + 2;
    const grMid = preview.row * 2 + 1;
    return gc === wallGc && (gr === gr1 || gr === gr2 || gr === grMid);
  }
}

function handleCellClick(row, col) {
  if (state.gameOver || computerThinking) return;
  if (mode === 'pvc' && state.currentPlayer !== humanPlayer) return;
  if (interactionMode !== 'move') return;

  const validMoves = getValidPawnMoves();
  const move = validMoves.find(m => m.row === row && m.col === col);
  if (!move) return;

  state = applyMove(state, move);
  render();

  if (!state.gameOver && mode === 'pvc' && state.currentPlayer !== humanPlayer) {
    scheduleComputerMove();
  }
}

function gridPosToWall(gr, gc) {
  // Convert a grid gap position + current orientation to a wall placement
  if (wallOrientation === 'h') {
    // Find the horizontal wall row from the grid row
    if (gr % 2 !== 1) return null; // Must be a horizontal gap row
    const wallRow = (gr - 1) / 2;
    // The wall col is derived from the grid col
    const boardCol = Math.floor(gc / 2);
    // Wall needs col in range [0, SIZE-2]
    const wallCol = Math.min(boardCol, SIZE - 2);
    // Adjust: if clicking on the right half, shift left
    if (wallCol < 0 || wallCol >= SIZE - 1) return null;
    if (wallRow < 0 || wallRow >= SIZE - 1) return null;
    return { row: wallRow, col: wallCol, orientation: 'h' };
  } else {
    // Vertical
    if (gc % 2 !== 1) return null;
    const wallCol = (gc - 1) / 2;
    const boardRow = Math.floor(gr / 2);
    const wallRow = Math.min(boardRow, SIZE - 2);
    if (wallRow < 0 || wallRow >= SIZE - 1) return null;
    if (wallCol < 0 || wallCol >= SIZE - 1) return null;
    return { row: wallRow, col: wallCol, orientation: 'v' };
  }
}

function handleGapClick(gr, gc) {
  if (state.gameOver || computerThinking) return;
  if (mode === 'pvc' && state.currentPlayer !== humanPlayer) return;
  if (interactionMode !== 'wall') return;

  const wall = gridPosToWall(gr, gc);
  if (!wall) return;

  // Check if this is a valid wall placement
  const allMoves = getValidMoves(state);
  const validWall = allMoves.find(m =>
    m.type === 'wall' && m.row === wall.row && m.col === wall.col && m.orientation === wall.orientation
  );
  if (!validWall) return;

  state = applyMove(state, validWall);
  wallPreview = null;
  interactionMode = 'move'; // Switch back to move mode
  render();

  if (!state.gameOver && mode === 'pvc' && state.currentPlayer !== humanPlayer) {
    scheduleComputerMove();
  }
}

function handleGapHover(gr, gc) {
  if (state.gameOver || computerThinking) return;
  if (interactionMode !== 'wall') return;
  if (mode === 'pvc' && state.currentPlayer !== humanPlayer) return;

  const wall = gridPosToWall(gr, gc);
  if (!wall) { wallPreview = null; render(); return; }

  // Check validity
  const allMoves = getValidMoves(state);
  const valid = allMoves.find(m =>
    m.type === 'wall' && m.row === wall.row && m.col === wall.col && m.orientation === wall.orientation
  );
  if (valid) {
    wallPreview = wall;
  } else {
    wallPreview = null;
  }
  render();
}

function handleGapLeave() {
  if (wallPreview) {
    wallPreview = null;
    render();
  }
}

function scheduleComputerMove() {
  computerThinking = true;
  render();

  setTimeout(() => {
    const move = getComputerMove(state, difficulty);
    if (move) {
      state = applyMove(state, move);
    }
    computerThinking = false;
    render();

    if (!state.gameOver && mode === 'pvc' && state.currentPlayer !== humanPlayer) {
      scheduleComputerMove();
    }
  }, 400);
}

function showGameOver() {
  const overlay = document.createElement('div');
  overlay.className = 'board-game-over';

  const box = document.createElement('div');
  box.className = 'result-box';

  const winnerName = state.winner === 0 ? 'Black' : 'White';
  let heading, resultClass, message;

  if (mode === 'pvp') {
    heading = `${winnerName} Wins!`;
    resultClass = 'win';
    message = `${winnerName} reached the opposite side!`;
  } else {
    const humanWon = state.winner === humanPlayer;
    heading = humanWon ? 'You Win!' : 'You Lose';
    resultClass = humanWon ? 'win' : 'lose';
    message = humanWon
      ? 'You reached the other side first!'
      : 'The computer reached the other side first.';
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
