import type { Photo } from './types';

const N = 256;

function gray(p: Photo): { g: Float32Array; w: number; h: number } {
  const k = N / Math.max(p.w, p.h);
  const w = Math.max(8, Math.round(p.w * k));
  const h = Math.max(8, Math.round(p.h * k));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(p.bitmap, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const g = new Float32Array(w * h);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) g[j] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  return { g, w, h };
}

/** Variance of the Laplacian. Higher = sharper. */
export function sharpness(g: Float32Array, w: number, h: number) {
  let sum = 0, sumSq = 0, n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const L = g[i - w] + g[i - 1] + g[i + 1] + g[i + w] - 4 * g[i];
      sum += L;
      sumSq += L * L;
      n++;
    }
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

/** 0..1, penalises clipped shadows/highlights and a mean far from mid-grey. */
export function exposure(g: Float32Array) {
  let dark = 0, bright = 0, total = 0;
  for (let i = 0; i < g.length; i++) {
    const v = g[i];
    if (v < 10) dark++;
    else if (v > 245) bright++;
    total += v;
  }
  const clipped = (dark + bright) / g.length;
  const meanDist = Math.abs(total / g.length - 118) / 118;
  return Math.max(0, Math.min(1, 1 - clipped * 4 - meanDist * 0.5));
}

export function resolutionScore(p: Photo) {
  return Math.min(1, Math.min(p.w, p.h) / 1080);
}

export function scoreAll(photos: Photo[]) {
  const data = photos.map(gray);
  const sharp = data.map((d) => sharpness(d.g, d.w, d.h));
  const max = Math.max(...sharp) || 1;
  photos.forEach((p, i) => {
    p.score = 0.6 * (sharp[i] / max) + 0.3 * exposure(data[i].g) + 0.1 * resolutionScore(p);
  });
}
