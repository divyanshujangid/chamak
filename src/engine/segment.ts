// Person cut-out with MediaPipe ImageSegmenter (selfie_segmenter, 250 KB float16).
// Dynamically imported only when the active template has a `cutout` slot.
// The model runs on a <=512 px copy; the soft mask is scaled back up and feathered.
import type { ImageSegmenter } from '@mediapipe/tasks-vision';
import { ML_BASE, downscale, freeCanvas, loadVision } from './vision';

const INPUT_MAX = 512;
let segmenter: Promise<ImageSegmenter> | null = null;
let usingGpu = false;

async function create(delegate: 'GPU' | 'CPU') {
  const { mp, files } = await loadVision();
  const s = await mp.ImageSegmenter.createFromOptions(files, {
    baseOptions: { modelAssetPath: `${ML_BASE}/selfie_segmenter.tflite`, delegate },
    runningMode: 'IMAGE',
    outputConfidenceMasks: true,
    outputCategoryMask: false,
  });
  usingGpu = delegate === 'GPU';
  return s;
}

function getSegmenter() {
  segmenter ??= create('GPU').catch(() => create('CPU'));
  segmenter.catch(() => { segmenter = null; });
  return segmenter;
}

async function runMask(input: HTMLCanvasElement): Promise<{ data: Float32Array; w: number; h: number }> {
  const seg = await getSegmenter();
  try {
    return readMask(seg, input);
  } catch (e) {
    if (!usingGpu) throw e;
    // WebGL delegate failed at run time (lost context, driver bug): retry on CPU.
    seg.close();
    segmenter = create('CPU');
    return readMask(await segmenter, input);
  }
}

function readMask(seg: ImageSegmenter, input: HTMLCanvasElement) {
  const res = seg.segment(input);
  try {
    const masks = res.confidenceMasks ?? [];
    const m = masks[masks.length - 1]; // selfie_segmenter: one "person" channel
    if (!m) throw new Error('no mask');
    // Copy: the mask's buffer belongs to the task and is freed by close().
    return { data: new Float32Array(m.getAsFloat32Array()), w: m.width, h: m.height };
  } finally {
    res.close();
  }
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Drop stray blobs (bokeh, a lamp the model half-believes is a person): label the
 * solid (>0.5) regions, keep those at least 12% of the biggest, and keep soft fringe
 * pixels only within 3 px of a kept region. Mutates alpha; returns kept pixel count.
 */
function keepMainBodies(alpha: Float32Array, w: number, h: number): number {
  const n = w * h;
  const label = new Int32Array(n).fill(-1);
  const sizes: number[] = [];
  const stack: number[] = [];
  for (let i = 0; i < n; i++) {
    if (alpha[i] <= 0.5 || label[i] >= 0) continue;
    const id = sizes.length;
    let size = 0;
    label[i] = id;
    stack.push(i);
    while (stack.length) {
      const j = stack.pop()!;
      size++;
      const x = j % w;
      const nb = [x > 0 ? j - 1 : -1, x < w - 1 ? j + 1 : -1, j - w, j + w];
      for (const k of nb) {
        if (k >= 0 && k < n && label[k] < 0 && alpha[k] > 0.5) { label[k] = id; stack.push(k); }
      }
    }
    sizes.push(size);
  }
  if (!sizes.length) return 0;
  const min = Math.max(...sizes) * 0.12;
  const keep = new Uint8Array(n);
  let kept = 0;
  for (let i = 0; i < n; i++) if (label[i] >= 0 && sizes[label[i]] >= min) { keep[i] = 1; kept++; }
  // Dilate the kept mask by 3 px (separable box max) to admit the soft fringe.
  const R = 3;
  const tmp = new Uint8Array(n);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = 0;
    for (let d = -R; d <= R && !v; d++) { const xx = x + d; if (xx >= 0 && xx < w) v = keep[y * w + xx]; }
    tmp[y * w + x] = v;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = 0;
    for (let d = -R; d <= R && !v; d++) { const yy = y + d; if (yy >= 0 && yy < h) v = tmp[yy * w + x]; }
    if (!v) alpha[y * w + x] = 0;
    else if (label[y * w + x] >= 0 && !keep[y * w + x]) alpha[y * w + x] = 0;
  }
  return kept;
}

/** Person-only ImageBitmap, same size as `bitmap`, transparent elsewhere. Throws on failure. */
export async function cutoutPerson(bitmap: ImageBitmap): Promise<ImageBitmap> {
  const input = downscale(bitmap, INPUT_MAX);
  let maskC: HTMLCanvasElement | null = null;
  let soft: HTMLCanvasElement | null = null;
  let full: HTMLCanvasElement | null = null;
  try {
    const { data, w, h } = await runMask(input);
    // Confidence -> alpha with a contrast curve: tightens the 256 px blob edge.
    const alpha = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) alpha[i] = smooth(0.45, 0.8, data[i]);
    const fg = keepMainBodies(alpha, w, h);
    if (fg < data.length * 0.01) throw new Error('no person found');
    const img = new ImageData(w, h);
    for (let i = 0; i < alpha.length; i++) img.data[i * 4 + 3] = Math.round(alpha[i] * 255);
    maskC = document.createElement('canvas');
    maskC.width = w;
    maskC.height = h;
    maskC.getContext('2d')!.putImageData(img, 0, 0);

    // Feather: a light blur on the small mask (where ctx.filter exists), then
    // a high-quality upscale which softens the edge further.
    soft = document.createElement('canvas');
    soft.width = w;
    soft.height = h;
    const sctx = soft.getContext('2d')!;
    if ('filter' in sctx) sctx.filter = 'blur(0.8px)';
    sctx.drawImage(maskC, 0, 0);

    full = document.createElement('canvas');
    full.width = bitmap.width;
    full.height = bitmap.height;
    const ctx = full.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(soft, 0, 0, full.width, full.height);
    return await createImageBitmap(full);
  } finally {
    freeCanvas(input);
    if (maskC) freeCanvas(maskC);
    if (soft) freeCanvas(soft);
    if (full) freeCanvas(full);
  }
}
