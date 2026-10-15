import { useRef, useState } from 'react';
import { importOne } from '../engine/photos';
import { scoreAll } from '../engine/score';
import type { Photo } from '../engine/types';
import { MAX_PHOTOS, useProject } from '../state/project';
import { useToast } from './Toast';
import { track } from '../analytics';

/**
 * Shared photo picker: a hidden file input, sequential on-device import with progress,
 * scoring, and a busy overlay. `replace` swaps out the current set (e.g. demo samples).
 */
export function usePhotoImport({ replace = false, onDone }: { replace?: boolean; onDone?: (all: Photo[]) => void } = {}) {
  const { state, dispatch } = useProject();
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    const files = Array.from(list).filter((f) => f.type.startsWith('image/') || f.type === '' || /\.(heic|heif)$/i.test(f.name));
    const have = replace ? 0 : state.photos.length;
    const room = MAX_PHOTOS - have;
    if (files.length > room) toast(room > 0 ? `Using the first ${room} (max ${MAX_PHOTOS})` : `Max ${MAX_PHOTOS} photos`);
    const take = files.slice(0, Math.max(0, room));
    if (ref.current) ref.current.value = '';
    if (!take.length) return;
    setBusy({ done: 0, total: take.length });
    const added: Photo[] = [];
    for (let i = 0; i < take.length; i++) {
      try { added.push(await importOne(take[i])); } catch { /* unreadable */ }
      setBusy({ done: i + 1, total: take.length });
    }
    setBusy(null);
    if (added.length < take.length) toast(added.length ? 'Skipped a file we couldn’t read' : 'Couldn’t read those files. Try JPG or PNG.');
    if (!added.length) return;
    const all = replace ? added : [...state.photos, ...added];
    scoreAll(all);
    dispatch(replace ? { type: 'REPLACE_PHOTOS', photos: added } : { type: 'ADD_PHOTOS', photos: added });
    track('photos_added', { added: added.length, total: all.length, replace });
    onDone?.(all);
  }

  const input = (
    <input ref={ref} type="file" accept="image/*,.heic,.heif" multiple hidden onChange={(e) => onFiles(e.target.files)} />
  );
  const overlay = busy && (
    <div className="overlay" role="status">
      <div className="center busy">
        <div className="spinner" />
        <div className="busy-title">Getting your pics ready… {busy.done} of {busy.total}</div>
        <div className="caption">on your phone, not a server</div>
      </div>
    </div>
  );
  return { open: () => ref.current?.click(), input, overlay, busy: !!busy };
}
