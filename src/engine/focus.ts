// Face-centred crop: finds the faces in a photo with MediaPipe FaceDetector
// (blaze_face_short_range, 230 KB, CPU) and returns a normalised focus point.
// Dynamically imported after photo import; never blocks the UI.
import type { FaceDetector } from '@mediapipe/tasks-vision';
import type { Photo } from './types';
import { ML_BASE, downscale, freeCanvas, idle, loadVision } from './vision';

let detector: Promise<FaceDetector> | null = null;

function getDetector() {
  detector ??= loadVision().then(({ mp, files }) =>
    mp.FaceDetector.createFromOptions(files, {
      baseOptions: { modelAssetPath: `${ML_BASE}/blaze_face_short_range.tflite`, delegate: 'CPU' },
      runningMode: 'IMAGE',
      minDetectionConfidence: 0.6,
      minSuppressionThreshold: 0.3,
    }),
  );
  detector.catch(() => { detector = null; });
  return detector;
}

const TILE_MIN = 0.8;

/** Free the detector's WASM instance (each MediaPipe task has its own); reloads from cache if needed again. */
export async function releaseFaceDetector() {
  const d = detector;
  detector = null;
  if (d) (await d.catch(() => null))?.close();
}

interface Box { x: number; y: number; w: number; h: number; score: number }

function detectIn(d: FaceDetector, src: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, W: number, H: number): Box[] {
  const c = document.createElement('canvas');
  c.width = Math.round(sw);
  c.height = Math.round(sh);
  c.getContext('2d')!.drawImage(src, sx, sy, sw, sh, 0, 0, c.width, c.height);
  const res = d.detect(c);
  freeCanvas(c);
  return res.detections
    .filter((det) => det.boundingBox)
    .map((det) => {
      const b = det.boundingBox!;
      return { x: (sx + b.originX) / W, y: (sy + b.originY) / H, w: b.width / W, h: b.height / H, score: det.categories[0]?.score ?? 0 };
    });
}

const iou = (a: Box, b: Box) => {
  const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const i = ix * iy;
  return i / (a.w * a.h + b.w * b.h - i);
};

/** Normalised face boxes. Runs on the whole photo, then on overlapping square tiles
 *  so small faces in group shots are found by the short-range model too. */
export async function detectFaces(bitmap: ImageBitmap): Promise<Box[]> {
  const d = await getDetector();
  const src = downscale(bitmap, 768);
  const W = src.width, H = src.height;
  try {
    let boxes = detectIn(d, src, 0, 0, W, H, W, H);
    const side = Math.min(W, H) * 0.6;
    const nx = Math.max(2, Math.ceil(W / side)), ny = Math.max(2, Math.ceil(H / side));
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const sx = ((W - side) * i) / (nx - 1), sy = ((H - side) * j) / (ny - 1);
        // Tiles zoom in, which also invites false hits (backs of heads, hands): be stricter.
        boxes = boxes.concat(detectIn(d, src, sx, sy, side, side, W, H).filter((b) => b.score >= TILE_MIN));
      }
      await idle();
    }
    // Non-max suppression across passes; keep faces that are not tiny specks.
    boxes.sort((a, b) => b.score - a.score);
    const keep: Box[] = [];
    for (const b of boxes) if (b.w * b.h > 0.0004 && !keep.some((k) => iou(k, b) > 0.3)) keep.push(b);
    return keep;
  } finally {
    freeCanvas(src);
  }
}

/** Focus point: centre of the union of the faces that matter (ignore faces much
 *  smaller than the biggest one, e.g. strangers in the background). */
export function focusFromFaces(faces: Box[]): { x: number; y: number } | undefined {
  if (!faces.length) return undefined;
  const big = Math.max(...faces.map((f) => f.w * f.h));
  const main = faces.filter((f) => f.w * f.h >= big * 0.2);
  const x0 = Math.min(...main.map((f) => f.x)), x1 = Math.max(...main.map((f) => f.x + f.w));
  const y0 = Math.min(...main.map((f) => f.y)), y1 = Math.max(...main.map((f) => f.y + f.h));
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return { x: clamp((x0 + x1) / 2), y: clamp((y0 + y1) / 2) };
}

/** Prominence of the best face: its relative width, discounted when off-centre. */
export function faceScoreOf(faces: Box[]): number {
  let best = 0;
  for (const f of faces) {
    const d = Math.hypot(f.x + f.w / 2 - 0.5, f.y + f.h / 2 - 0.45);
    best = Math.max(best, Math.min(1, Math.sqrt(f.w * f.h) * 2.5) * (1 - 0.6 * Math.min(1, d / 0.7)));
  }
  return best;
}

/** Focus point (undefined when no face: keep centre crop) and face prominence. */
export async function analyzeFaces(p: Photo): Promise<Pick<Photo, 'focus' | 'faceScore'>> {
  const faces = await detectFaces(p.bitmap);
  return { focus: focusFromFaces(faces), faceScore: faceScoreOf(faces) };
}
