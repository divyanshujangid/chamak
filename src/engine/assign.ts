import type { Assignments, Photo, Template } from './types';

type Orient = 'portrait' | 'landscape' | 'any';
const orient = (w: number, h: number): Orient => (w / h < 0.9 ? 'portrait' : w / h > 1.1 ? 'landscape' : 'any');

/** Ranking: once faces are known, a photo with a clear face beats a merely sharp one
 *  for the big slots (people make the story, not the scenery). */
const rank = (p: Photo) => p.score + (p.faceScore ? 0.5 + p.faceScore : 0);

/**
 * Best photos into biggest slots, orientation-aware. shuffle=true randomises among the top half.
 * Cut-out slots are filled first with the most prominent face (largest, most central), since
 * a cut-out needs a person; with no face data they take the best-ranked photo.
 */
export function assign(t: Template, photos: Photo[], shuffle = false): Assignments {
  if (!photos.length) return {};
  let ranked = [...photos].sort((a, b) => rank(b) - rank(a));
  if (shuffle) {
    const half = Math.max(1, Math.ceil(ranked.length / 2));
    const top = ranked.slice(0, half).sort(() => Math.random() - 0.5);
    ranked = [...top, ...ranked.slice(half).sort(() => Math.random() - 0.5)];
  }
  const slots = [...t.slots].sort((a, b) => Number(!!b.cutout) - Number(!!a.cutout) || b.w * b.h - a.w * a.h);
  const used = new Set<string>();
  const out: Assignments = {};
  for (const slot of slots) {
    const want = orient(slot.w, slot.h);
    const free = ranked.filter((p) => !used.has(p.id));
    let pick: Photo | undefined;
    if (slot.cutout) {
      const faces = free.filter((p) => (p.faceScore ?? 0) > 0);
      pick = faces.sort((a, b) => b.faceScore! - a.faceScore!)[0];
    }
    pick ??= free.find((p) => want === 'any' || orient(p.w, p.h) === want || orient(p.w, p.h) === 'any') ?? free[0];
    if (!pick) pick = ranked[used.size % ranked.length]; // fewer photos than slots: reuse
    used.add(pick.id);
    out[slot.id] = { photoId: pick.id, scale: 1, dx: 0, dy: 0, rotate: 0 };
  }
  return out;
}
