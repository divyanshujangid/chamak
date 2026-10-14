// Shared lazy loader for @mediapipe/tasks-vision. The package (~156 KB JS) and the
// self-hosted WASM under /ml/wasm are only fetched the first time a task needs them.
import type { FilesetResolver } from '@mediapipe/tasks-vision';

type WasmFileset = Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const ML_BASE = `${BASE}/ml`;

let fileset: Promise<{ mp: typeof import('@mediapipe/tasks-vision'); files: WasmFileset }> | null = null;

export function loadVision() {
  fileset ??= (async () => {
    const mp = await import('@mediapipe/tasks-vision');
    const files = await mp.FilesetResolver.forVisionTasks(`${ML_BASE}/wasm`);
    return { mp, files };
  })();
  // A failed load (offline, blocked) may be retried later.
  fileset.catch(() => { fileset = null; });
  return fileset;
}

/** Draw a bitmap into a canvas no larger than `max` on its long edge. Caller frees it. */
export function downscale(src: ImageBitmap, max: number): HTMLCanvasElement {
  const k = Math.min(1, max / Math.max(src.width, src.height));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(src.width * k));
  c.height = Math.max(1, Math.round(src.height * k));
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

export const freeCanvas = (c: HTMLCanvasElement) => { c.width = c.height = 1; };

/** Yield to the UI thread between heavy steps. */
export const idle = () =>
  new Promise<void>((r) => ('requestIdleCallback' in window ? requestIdleCallback(() => r(), { timeout: 400 }) : setTimeout(r, 30)));
