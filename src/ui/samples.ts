// Sample Navratri / garba photos for the landing gallery and demo mode.
// All from Pexels (free for commercial use, no attribution required: pexels.com/license);
// photographer and source page for each file are in public/samples/CREDITS.md.
// 1080px-long-edge WebP in public/samples, fetched only when the landing page needs them.
import { importOne } from '../engine/photos';
import type { Photo } from '../engine/types';

/** Face (or subject) centre per sample, so previews look face-centred without loading any model. */
const SAMPLES: { file: string; focus: { x: number; y: number } }[] = [
  { file: 's1', focus: { x: 0.53, y: 0.26 } }, // girl in mirror-work chaniya choli
  { file: 's2', focus: { x: 0.51, y: 0.31 } }, // woman in blue chaniya choli by carved pillar
  { file: 's3', focus: { x: 0.56, y: 0.39 } }, // girl with dandiya, mirror-work choli
  { file: 's4', focus: { x: 0.5, y: 0.18 } }, // man in kurta, festive string lights
  { file: 's5', focus: { x: 0.44, y: 0.25 } }, // friends dancing (three faces, centred on the middle one)
  { file: 's6', focus: { x: 0.5, y: 0.24 } }, // garba twirl, dandiya raised overhead
  { file: 's7', focus: { x: 0.44, y: 0.23 } }, // man in black kurta
  { file: 's8', focus: { x: 0.5, y: 0.5 } }, // dandiya sticks and bangles in a circle (no face)
  { file: 's9', focus: { x: 0.5, y: 0.49 } }, // Durga idol with marigolds (no person)
];

const url = (f: string) => `${import.meta.env.BASE_URL}samples/${f}.webp`;

let blobs: Promise<Blob[]> | null = null;
function sampleBlobs() {
  blobs ??= Promise.all(SAMPLES.map((s) => fetch(url(s.file)).then((r) => {
    if (!r.ok) throw new Error(`sample ${s.file}: ${r.status}`);
    return r.blob();
  })));
  blobs.catch(() => { blobs = null; });
  return blobs;
}

/** Photos with fixed scores (s1 best) and known focus points. */
async function build(withThumbs: boolean): Promise<Photo[]> {
  const list = await sampleBlobs();
  const out: Photo[] = [];
  for (let i = 0; i < list.length; i++) {
    if (withThumbs) {
      const p = await importOne(list[i]);
      out.push({ ...p, id: `sample-${i}-${p.id.slice(0, 6)}`, score: 1 - i * 0.06, focus: SAMPLES[i].focus });
    } else {
      const bitmap = await createImageBitmap(list[i]);
      out.push({ id: `gallery-${i}`, bitmap, w: bitmap.width, h: bitmap.height, score: 1 - i * 0.06, thumbUrl: '', focus: SAMPLES[i].focus });
    }
  }
  return out;
}

let gallery: Promise<Photo[]> | null = null;
/** Shared, long-lived set used for gallery and hero previews. Never put in project state. */
export function galleryPhotos() {
  gallery ??= build(false);
  gallery.catch(() => { gallery = null; });
  return gallery;
}

/** A fresh set the project owns (state releases the bitmaps on reset). */
export const demoProjectPhotos = () => build(true);
