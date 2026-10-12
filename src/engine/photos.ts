import type { Photo } from './types';

const MAX_EDGE = 2048;

async function makeThumb(bitmap: ImageBitmap, size: number): Promise<string> {
  const k = size / Math.max(bitmap.width, bitmap.height);
  const c = document.createElement('canvas');
  c.width = Math.round(bitmap.width * k);
  c.height = Math.round(bitmap.height * k);
  c.getContext('2d')!.drawImage(bitmap, 0, 0, c.width, c.height);
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', 0.8));
  return blob ? URL.createObjectURL(blob) : '';
}

export async function importOne(source: Blob): Promise<Photo> {
  const full = await createImageBitmap(source, { imageOrientation: 'from-image' });
  const k = MAX_EDGE / Math.max(full.width, full.height);
  let bitmap = full;
  if (k < 1) {
    bitmap = await createImageBitmap(full, {
      resizeWidth: Math.round(full.width * k),
      resizeHeight: Math.round(full.height * k),
      resizeQuality: 'high',
    });
    full.close();
  }
  return {
    id: crypto.randomUUID(),
    bitmap,
    w: bitmap.width,
    h: bitmap.height,
    score: 0,
    thumbUrl: await makeThumb(bitmap, 240),
  };
}

/** Sequential on purpose: Promise.all spikes memory on budget phones. */
export async function importFiles(files: Blob[], onProgress?: (done: number, total: number) => void): Promise<Photo[]> {
  const list = files.filter((f) => f.type.startsWith('image/') || f.type === '').slice(0, 8);
  const out: Photo[] = [];
  for (let i = 0; i < list.length; i++) {
    try {
      out.push(await importOne(list[i]));
    } catch {
      /* skip unreadable file */
    }
    onProgress?.(i + 1, list.length);
  }
  return out;
}
