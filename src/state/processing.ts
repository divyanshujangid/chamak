// Background photo processing: face focus for every photo, person cut-out for the
// photo in a `cutout` slot of the active template. Both lazily load MediaPipe,
// run one job at a time off the critical path, and land via PATCH_PHOTO, which
// gives the photos array a new identity so every TemplateCanvas re-renders.
import { useEffect, useRef } from 'react';
import { assign } from '../engine/assign';
import type { Photo, Template } from '../engine/types';
import { TEMPLATES, byId } from '../templates';
import { useProject, type State } from './project';

const tried = { focus: new Set<string>(), cutout: new Set<string>() };

const saveData = () => !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

/** The template the user is looking at: the editor's, or the picker's current card
 *  (same "fits your photo count first" order the Picker uses). */
function activeTemplate(s: State): Template | undefined {
  if ((s.step === 'edit' || s.step === 'done') && s.templateId) return byId.get(s.templateId);
  if (s.step !== 'pick' || !s.photos.length) return undefined;
  const n = s.photos.length;
  const list = [...TEMPLATES].sort((a, b) => Number(a.slots.length > n) - Number(b.slots.length > n));
  return list[Math.min(s.pickIndex, list.length - 1)];
}

/** Photos that sit in a cut-out slot of the active template and still need a cut-out. */
function cutoutTargets(s: State): Photo[] {
  const t = activeTemplate(s);
  if (!t || !t.slots.some((sl) => sl.cutout)) return [];
  const a = s.step === 'pick' || !s.templateId ? assign(t, s.photos) : s.assignments;
  const ids = t.slots.filter((sl) => sl.cutout).map((sl) => a[sl.id]?.photoId);
  return s.photos.filter((p) => ids.includes(p.id) && !p.cutout && !tried.cutout.has(p.id));
}

export function usePhotoProcessing() {
  const { state, dispatch } = useProject();
  const busy = useRef(false);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    if (busy.current) return;
    // Faces first (about 100 ms a photo): they decide which photo the cut-out slot gets.
    const next = (): { kind: 'cutout' | 'focus'; p: Photo } | null => {
      const s = latest.current;
      const f = saveData() ? undefined : s.photos.find((p) => p.faceScore === undefined && !tried.focus.has(p.id));
      if (f) return { kind: 'focus', p: f };
      const c = cutoutTargets(s)[0];
      return c ? { kind: 'cutout', p: c } : null;
    };
    const reassign = () => {
      const t = latest.current.templateId ? byId.get(latest.current.templateId) : undefined;
      if (t) dispatch({ type: 'AUTO_ASSIGN', make: (photos) => assign(t, photos) });
    };
    const start = () => {
      if (busy.current || !next()) return;
      busy.current = true;
      void run();
    };
    const run = async () => {
      let facesChanged = false, usedFaces = false;
      for (let job = next(); job; job = next()) {
        const { kind, p } = job;
        if (kind === 'cutout' && facesChanged) {
          // Face data landed: re-run Smart Pick once (no-op after a manual swap), then
          // let the next render pick the cut-out target from the new assignment.
          facesChanged = false;
          reassign();
          await new Promise((r) => setTimeout(r, 0));
          continue;
        }
        tried[kind].add(p.id);
        try {
          if (kind === 'cutout') {
            const { cutoutPerson } = await import('../engine/segment');
            const cutout = await cutoutPerson(p.bitmap);
            dispatch({ type: 'PATCH_PHOTO', id: p.id, patch: { cutout } });
          } else {
            const { analyzeFaces } = await import('../engine/focus');
            const patch = await analyzeFaces(p);
            dispatch({ type: 'PATCH_PHOTO', id: p.id, patch });
            facesChanged = usedFaces = true;
          }
        } catch (e) {
          // Keep the fallback rendering (centre crop / photo sticker).
          console.warn(`chamak: ${kind} skipped`, e);
        }
        await new Promise((r) => setTimeout(r, 0));
      }
      if (facesChanged) reassign();
      if (usedFaces) void import('../engine/focus').then((m) => m.releaseFaceDetector());
      busy.current = false;
      setTimeout(start, 0); // pick up anything that arrived during the last job
    };
    start();
  }, [state.photos, state.templateId, state.step, state.pickIndex, state.assignments, dispatch]);
}
