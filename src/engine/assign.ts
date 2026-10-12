import type { Assignments, Photo, Template } from './types';

type Orient = 'portrait' | 'landscape' | 'any';
const orient = (w: number, h: number): Orient => (w / h < 0.9 ? 'portrait' : w / h > 1.1 ? 'landscape' : 'any');

/** Best photos into biggest slots, orientation-aware. shuffle=true randomises among the top half. */
export function assign(t: Template, photos: Photo[], shuffle = false): Assignments {
  if (!photos.length) return {};
  let ranked = [...photos].sort((a, b) => b.score - a.score);
  if (shuffle) {
    const half = Math.max(1, Math.ceil(ranked.length / 2));
    const top = ranked.slice(0, half).sort(() => Math.random() - 0.5);
    ranked = [...top, ...ranked.slice(half).sort(() => Math.random() - 0.5)];
  }
  const slots = [...t.slots].sort((a, b) => b.w * b.h - a.w * a.h);
  const used = new Set<string>();
  const out: Assignments = {};
  for (const slot of slots) {
    const want = orient(slot.w, slot.h);
    const free = ranked.filter((p) => !used.has(p.id));
    let pick =
      free.find((p) => want === 'any' || orient(p.w, p.h) === want || orient(p.w, p.h) === 'any') ?? free[0];
    if (!pick) pick = ranked[used.size % ranked.length]; // fewer photos than slots: reuse
    used.add(pick.id);
    out[slot.id] = { photoId: pick.id, scale: 1, dx: 0, dy: 0, rotate: 0 };
  }
  return out;
}
