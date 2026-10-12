import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { Assignments, Photo, PhotoTransform } from '../engine/types';

export type Step = 'upload' | 'pick' | 'edit' | 'done';

export interface State {
  step: Step;
  photos: Photo[];
  templateId: string | null;
  assignments: Assignments;
  badge: boolean;
  pickIndex: number;
}

export type Action =
  | { type: 'ADD_PHOTOS'; photos: Photo[] }
  | { type: 'REMOVE_PHOTO'; id: string }
  | { type: 'SET_TEMPLATE'; templateId: string; assignments: Assignments }
  | { type: 'SET_ASSIGNMENTS'; assignments: Assignments }
  | { type: 'UPDATE_TRANSFORM'; slotId: string; t: Partial<PhotoTransform> }
  | { type: 'PUT_PHOTO'; slotId: string; photoId: string }
  | { type: 'SET_STEP'; step: Step }
  | { type: 'SET_PICK_INDEX'; index: number }
  | { type: 'TOGGLE_BADGE' }
  | { type: 'RESET' };

const initial: State = { step: 'upload', photos: [], templateId: null, assignments: {}, badge: false, pickIndex: 0 };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'ADD_PHOTOS':
      return { ...s, photos: [...s.photos, ...a.photos].slice(0, 8) };
    case 'REMOVE_PHOTO':
      return { ...s, photos: s.photos.filter((p) => p.id !== a.id) };
    case 'SET_TEMPLATE':
      return { ...s, templateId: a.templateId, assignments: a.assignments };
    case 'SET_ASSIGNMENTS':
      return { ...s, assignments: a.assignments };
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
      return { ...s, assignments: next };
    }
    case 'SET_STEP':
      return { ...s, step: a.step };
    case 'SET_PICK_INDEX':
      return { ...s, pickIndex: a.index };
    case 'TOGGLE_BADGE':
      return { ...s, badge: !s.badge };
    case 'RESET':
      s.photos.forEach((p) => { p.bitmap.close(); URL.revokeObjectURL(p.thumbUrl); });
      return initial;
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
