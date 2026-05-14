const MAX_LINES = 200;

export class Terminal {
  constructor(containerEl) {
    this.container = containerEl;
    this.output = document.createElement('div');
    this.output.className = 'terminal-output';
    this.container.appendChild(this.output);
    this.lineCount = 0;
  }

  write(text, className = '') {
    const line = document.createElement('div');
    line.className = 'terminal-line' + (className ? ' ' + className : '');
    line.textContent = text;
    this.output.appendChild(line);
    this.lineCount++;
    this._prune();
    this.scrollToBottom();
  }

  writeHTML(html, className = '') {
    const line = document.createElement('div');
    line.className = 'terminal-line' + (className ? ' ' + className : '');
    line.innerHTML = html;
    this.output.appendChild(line);
    this.lineCount++;
    this._prune();
    this.scrollToBottom();
  }

  writeRoom(title, description, exits) {
    this.separator();
    this.write(title, 'room-title');
    this.write(description, 'room-desc');
    if (exits && exits.length > 0) {
      this.write(`Exits: ${exits.join(', ')}`, 'exits');
    }
  }

  writeCombat(text) { this.write(text, 'combat'); }
  writeLoot(text) { this.write(text, 'loot'); }
  writeSystem(text) { this.write(text, 'system'); }
  writeHeal(text) { this.write(text, 'heal'); }

  separator() {
    const line = document.createElement('div');
    line.className = 'terminal-line separator';
    line.innerHTML = '&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;';
    this.output.appendChild(line);
    this.lineCount++;
    this._prune();
  }

  clear() {
    this.output.innerHTML = '';
    this.lineCount = 0;
  }

  scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  _prune() {
    while (this.output.children.length > MAX_LINES) {
      this.output.removeChild(this.output.firstChild);
      this.lineCount--;
    }
  }

  // Render all messages from state
  renderMessages(messages, fromIndex = 0) {
    for (let i = fromIndex; i < messages.length; i++) {
      const msg = messages[i];
      this.write(msg.text, msg.type || '');
    }
  }
}
