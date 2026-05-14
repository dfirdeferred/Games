let currentOverlay = null;

export function showModal(titleText, bodyHTML) {
  hideModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const content = document.createElement('div');
  content.className = 'modal-content';

  const header = document.createElement('div');
  header.className = 'modal-header';

  const title = document.createElement('h2');
  title.textContent = titleText;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', hideModal);

  header.appendChild(title);
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'modal-body';
  body.innerHTML = bodyHTML;

  content.appendChild(header);
  content.appendChild(body);
  overlay.appendChild(content);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideModal();
  });

  document.body.appendChild(overlay);
  currentOverlay = overlay;
  requestAnimationFrame(() => overlay.classList.add('visible'));
}

export function hideModal() {
  if (currentOverlay) {
    currentOverlay.remove();
    currentOverlay = null;
  }
}
