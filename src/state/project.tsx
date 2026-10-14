import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { MAX_PHOTOS } from '../engine/photos';
import type { Assignments, Photo, PhotoTransform } from '../engine/types';

export type Step = 'upload' | 'pick' | 'edit' | 'done';

export { MAX_PHOTOS };

export interface State {
  step: Step;
  photos: Photo[];
  templateId: string | null;
  assignments: Assignments;
  badge: boolean;
  pickIndex: number;
  /** The user swapped or shuffled photos: background face results must not re-assign. */
  manual: boolean;
  /** True while the project runs on the bundled sample photos (demo mode). */
  demo: boolean;
  /** Template the user chose in the landing gallery; Picker opens on it. */
  preferId: string | null;
}

export type Action =
  | { type: 'ADD_PHOTOS'; photos: Photo[] }
  | { type: 'REPLACE_PHOTOS'; photos: Photo[]; demo?: boolean }
  | { type: 'SET_PREFER'; id: string | null }
  | { type: 'REMOVE_PHOTO'; id: string }
  /** Background results (face focus, person cut-out) landing on a photo. */
  | { type: 'PATCH_PHOTO'; id: string; patch: Partial<Pick<Photo, 'focus' | 'faceScore' | 'cutout'>> }
  | { type: 'SET_TEMPLATE'; templateId: string; assignments: Assignments }
  | { type: 'SET_ASSIGNMENTS'; assignments: Assignments; manual?: boolean }
  /** Re-run Smart Pick with fresh face data, unless the user arranged photos themselves. */
  | { type: 'AUTO_ASSIGN'; make: (photos: Photo[]) => Assignments }
  | { type: 'UPDATE_TRANSFORM'; slotId: string; t: Partial<PhotoTransform> }
  | { type: 'PUT_PHOTO'; slotId: string; photoId: string }
  | { type: 'SET_STEP'; step: Step }
  | { type: 'SET_PICK_INDEX'; index: number }
  | { type: 'TOGGLE_BADGE' }
  | { type: 'RESET' };

const initial: State = { step: 'upload', photos: [], templateId: null, assignments: {}, badge: false, pickIndex: 0, manual: false, demo: false, preferId: null };

const release = (photos: Photo[]) => photos.forEach((p) => {
  p.bitmap.close();
  p.cutout?.close();
  if (p.thumbUrl) URL.revokeObjectURL(p.thumbUrl);
});

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'ADD_PHOTOS':
      return { ...s, photos: [...s.photos, ...a.photos].slice(0, MAX_PHOTOS) };
    case 'REPLACE_PHOTOS':
      release(s.photos);
      return { ...s, photos: a.photos.slice(0, MAX_PHOTOS), demo: !!a.demo, assignments: {}, manual: false };
    case 'SET_PREFER':
      return { ...s, preferId: a.id };
    case 'REMOVE_PHOTO':
      return { ...s, photos: s.photos.filter((p) => p.id !== a.id) };
    case 'PATCH_PHOTO': {
      const i = s.photos.findIndex((p) => p.id === a.id);
      if (i < 0) { a.patch.cutout?.close(); return s; }
      const photos = [...s.photos];
      photos[i] = { ...photos[i], ...a.patch };
      return { ...s, photos };
    }
    case 'SET_TEMPLATE':
      return { ...s, templateId: a.templateId, assignments: a.assignments, manual: false };
    case 'SET_ASSIGNMENTS':
      return { ...s, assignments: a.assignments, manual: !!a.manual };
    case 'AUTO_ASSIGN': {
      if (s.manual || !s.templateId) return s;
      const fresh = a.make(s.photos);
      const next: Assignments = {};
      // Keep the user's pan/zoom wherever the photo did not change.
      for (const [k, v] of Object.entries(fresh)) next[k] = s.assignments[k]?.photoId === v.photoId ? s.assignments[k] : v;
      const same = Object.keys(next).every((k) => next[k] === s.assignments[k]);
      return same ? s : { ...s, assignments: next };
    }
    case 'UPDATE_TRANSFORM': {
      const cur = s.assignments[a.slotId];
      if (!cur) return s;
      return { ...s, assignments: { ...s.assignments, [a.slotId]: { ...cur, ...a.t } } };
    }
    case 'PUT_PHOTO': {
      const next = { ...s.assignments };
      const fresh = { photoId: a.photoId, scale: 1, dx: 0, dy: 0, rotate: 0 };
      const prev = next[a.slotId];
      const other = Object.keys(next).find((k) => k !== a.slotId && next[k].photoId === a.photoId);
      if (other && prev) next[other] = { ...fresh, photoId: prev.photoId };
      next[a.slotId] = fresh;
      return { ...s, assignments: next, manual: true };
    }
    case 'SET_STEP':
      return { ...s, step: a.step };
    case 'SET_PICK_INDEX':
      return { ...s, pickIndex: a.index };
    case 'TOGGLE_BADGE':
      return { ...s, badge: !s.badge };
    case 'RESET':
      release(s.photos);
      return { ...initial, badge: s.badge };
  }
}

const Ctx = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useProject() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProject outside provider');
  return v;
}

export function usePhotoMap(photos: Photo[]) {
  return new Map(photos.map((p) => [p.id, p]));
}
