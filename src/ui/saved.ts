// Shortlisted ("saved") frames, per device.
import { useCallback, useState } from 'react';

const KEY = 'ck.saved';

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function useSaved() {
  const [ids, setIds] = useState<string[]>(read);
  const toggle = useCallback((id: string) => {
    setIds((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  }, []);
  return { saved: ids, isSaved: (id: string) => ids.includes(id), toggle };
}
