const KEY = 'ck.unlock';
const HINT = 'ck.hint';

interface Unlock { shares: number; downloads: number }

function read(): Unlock {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { shares: v.shares | 0, downloads: v.downloads | 0 };
  } catch {
    return { shares: 0, downloads: 0 };
  }
}
function write(u: Unlock) {
  try { localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* private mode */ }
}

export const unlockState = read;
export const isUnlocked = () => { const s = read(); return s.shares >= 1 || s.downloads >= 3; };
export function recordShare() { const s = read(); s.shares++; write(s); }
export function recordDownload() { const s = read(); s.downloads++; write(s); }

export function hintSeen() { try { return localStorage.getItem(HINT) === '1'; } catch { return true; } }
export function markHintSeen() { try { localStorage.setItem(HINT, '1'); } catch { /* ignore */ } }
