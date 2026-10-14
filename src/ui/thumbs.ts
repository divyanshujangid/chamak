// Template previews as small JPEG blob URLs, rendered one at a time on a single
// reusable canvas. Keeps budget Androids smooth: no live canvas per card, no
// parallel decode spikes, and every result is cached for the session.
import { assign } from '../engine/assign';
import { loadFonts, render } from '../engine/renderer';
import type { Photo, Template } from '../engine/types';

const cache = new Map<string, string>();
const waiting = new Map<string, Promise<string>>();
type Job = { key: string; t: Template; photos: Photo[]; w: number; resolve: (u: string) => void; reject: (e: unknown) => void };
const queue: Job[] = [];
let running = false;
let canvas: HTMLCanvasElement | null = null;

const idle = () =>
  new Promise<void>((r) => ('requestIdleCallback' in window ? requestIdleCallback(() => r(), { timeout: 120 }) : setTimeout(r, 16)));

async function pump() {
  if (running) return;
  running = true;
  while (queue.length) {
    const job = queue.shift()!;
    try {
      await loadFonts(job.t);
      await idle();
      canvas ??= document.createElement('canvas');
      canvas.width = job.w;
      canvas.height = Math.round((job.w * 16) / 9);
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const map = new Map(job.photos.map((p) => [p.id, p]));
      render(ctx, canvas.width, canvas.height, job.t, assign(job.t, job.photos), map, { preview: true });
      const blob = await new Promise<Blob | null>((r) => canvas!.toBlob(r, 'image/jpeg', 0.86));
      if (!blob) throw new Error('toBlob failed');
      const u = URL.createObjectURL(blob);
      cache.set(job.key, u);
      job.resolve(u);
    } catch (e) {
      job.reject(e);
    } finally {
      waiting.delete(job.key);
    }
  }
  if (canvas) canvas.width = canvas.height = 1;
  running = false;
}

/** Device px width for a CSS width (DPR capped at 2). */
export const thumbPx = (cssW: number) => Math.round(cssW * Math.min(2, window.devicePixelRatio || 1));

export function cachedThumb(t: Template, px: number, setKey: string) {
  return cache.get(`${t.id}@${px}#${setKey}`);
}

/** Queue a preview. `urgent` jumps the line (the card the user is looking at). */
export function thumb(t: Template, photos: Photo[], px: number, setKey: string, urgent = false): Promise<string> {
  const key = `${t.id}@${px}#${setKey}`;
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);
  const w = waiting.get(key);
  if (w) {
    if (urgent) {
      const i = queue.findIndex((j) => j.key === key);
      if (i > 0) queue.unshift(...queue.splice(i, 1));
    }
    return w;
  }
  const p = new Promise<string>((resolve, reject) => {
    const job = { key, t, photos, w: px, resolve, reject };
    if (urgent) queue.unshift(job);
    else queue.push(job);
  });
  waiting.set(key, p);
  void pump();
  return p;
}
