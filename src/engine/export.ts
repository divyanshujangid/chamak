import { loadFonts, render } from './renderer';
import type { Assignments, Photo, Template } from './types';

export async function exportJpeg(
  t: Template,
  a: Assignments,
  photos: Map<string, Photo>,
  badge: boolean,
): Promise<Blob> {
  await loadFonts(t);
  const sizes: [number, number][] = [
    [1080, 1920],
    [810, 1440],
  ];
  let lastErr: unknown;
  for (const [w, h] of sizes) {
    const c = document.createElement('canvas');
    try {
      c.width = w;
      c.height = h;
      render(c.getContext('2d')!, w, h, t, a, photos, { badge });
      const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', 0.92));
      if (blob) return blob;
    } catch (e) {
      lastErr = e;
    } finally {
      c.width = c.height = 0; // free memory on iOS
    }
  }
  throw lastErr ?? new Error('export failed');
}

export function exportName(t: Template) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `storywala-${t.id}-${ymd}.jpg`;
}
