/**
 * Shared board rendering utilities for square-grid board games.
 */

export function createSquareBoard(container, size, onClick, options = {}) {
  const board = document.createElement('div');
  board.className = 'board-grid';
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  const cells = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = document.createElement('div');
      const isLight = (row + col) % 2 === 0;
      cell.className = `board-cell ${isLight ? 'light' : 'dark'}`;
      if (options.uniformColor) cell.className = 'board-cell uniform';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', () => onClick(row, col));
      board.appendChild(cell);
      cells.push(cell);
    }
  }

  container.appendChild(board);
  return { board, cells, getCell: (r, c) => cells[r * size + c] };
}

export function highlightCells(boardData, positions, className = 'highlighted') {
  const size = Math.sqrt(boardData.cells.length);
  for (const [r, c] of positions) {
    const cell = boardData.getCell(r, c);
    if (cell) cell.classList.add(className);
  }
}

export function clearHighlights(boardData, className = 'highlighted') {
  for (const cell of boardData.cells) {
    cell.classList.remove(className, 'selected', 'last-move', 'valid-move');
  }
}

export function setCellContent(boardData, row, col, content) {
  const size = Math.sqrt(boardData.cells.length);
  const cell = boardData.getCell(row, col);
  if (cell) cell.innerHTML = content;
}

export function createPiece(symbol, color = '') {
  return `<span class="piece ${color}">${symbol}</span>`;
}

export function createDisc(color) {
  return `<div class="disc ${color}"></div>`;
}

export function createStone(color) {
  return `<div class="stone ${color}"></div>`;
}

export function renderSetupScreen(container, gameTitle, options = {}) {
  const div = document.createElement('div');
  div.className = 'board-setup';

  const showColorChoice = options.showColorChoice !== false;
  const colorLabels = options.colorLabels || ['Black', 'White'];

  div.innerHTML = `
    <h2>${gameTitle}</h2>
    ${options.subtitle ? `<p class="setup-subtitle">${options.subtitle}</p>` : ''}
    <div class="setup-section">
      <h3>Game Mode</h3>
      <div class="mode-buttons">
        <button class="btn mode-btn selected" data-mode="pvc">vs Computer</button>
        <button class="btn mode-btn" data-mode="pvp">vs Player</button>
      </div>
    </div>
    <div class="setup-section pvc-options">
      <h3>Difficulty</h3>
      <div class="diff-buttons">
        <button class="btn diff-btn" data-diff="easy">Easy</button>
        <button class="btn diff-btn selected" data-diff="medium">Medium</button>
        <button class="btn diff-btn" data-diff="hard">Hard</button>
      </div>
    </div>
    <div class="setup-section pvc-options">
      <h3>Play as</h3>
      <div class="color-buttons">
        <button class="btn color-btn selected" data-color="0">${colorLabels[0]}</button>
        <button class="btn color-btn" data-color="1">${colorLabels[1]}</button>
      </div>
    </div>
    ${options.extraHTML || ''}
    <button class="btn btn-primary start-btn">Start Game</button>
  `;

  container.appendChild(div);

  let mode = 'pvc';
  let difficulty = 'medium';
  let playerColor = 0;

  // Mode buttons
  div.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      div.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      mode = btn.dataset.mode;
      div.querySelectorAll('.pvc-options').forEach(el => {
        el.style.display = mode === 'pvc' ? '' : 'none';
      });
    });
  });

  // Difficulty buttons
  div.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      div.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      difficulty = btn.dataset.diff;
    });
  });

  // Color buttons
  div.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      div.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      playerColor = parseInt(btn.dataset.color);
    });
  });

  return new Promise(resolve => {
    div.querySelector('.start-btn').addEventListener('click', () => {
      resolve({ mode, difficulty, playerColor });
    });
  });
}
