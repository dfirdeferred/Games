const PREFIX = 'mud_save_';

export function saveGame(gameId, state) {
  try {
    const data = { version: 1, timestamp: Date.now(), state };
    localStorage.setItem(PREFIX + gameId, JSON.stringify(data));
    return true;
  } catch { return false; }
}

export function loadGame(gameId) {
  try {
    const raw = localStorage.getItem(PREFIX + gameId);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.state;
  } catch { return null; }
}

export function hasSave(gameId) {
  return localStorage.getItem(PREFIX + gameId) !== null;
}

export function deleteSave(gameId) {
  localStorage.removeItem(PREFIX + gameId);
}

export function getSaveTimestamp(gameId) {
  try {
    const raw = localStorage.getItem(PREFIX + gameId);
    if (!raw) return null;
    return JSON.parse(raw).timestamp;
  } catch { return null; }
}
