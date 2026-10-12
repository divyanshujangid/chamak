# 02 — Engine (data model, renderer, Smart Pick, export, share, gestures)

All coordinates are in **design units: 1080 wide x 1920 tall**. The renderer scales to whatever canvas it is given.

## Types (`src/engine/types.ts`)
```ts
export type SlotShape = 'rect' | 'rounded' | 'arch' | 'circle';

export interface Slot {
  id: string;
  x: number; y: number; w: number; h: number;   // design units
  rotate?: number;                              // degrees, slot itself tilted
  shape: SlotShape;
  radius?: number;                              // for 'rounded'
}

export interface Template {
  id: string;                 // 'navratri-garba-night'
  name: string;               // 'Garba Night'
  pack: 'navratri' | 'diwali';
  direction: 'navratri-pop' | 'royal-diwali' | 'minimal-pastel' | 'y2k-chrome';
  locked?: boolean;           // bonus template
  fonts: string[];            // e.g. ['700 120px "Yatra One"'] — loaded before draw
  slots: Slot[];
  drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void;
  drawForeground(ctx: CanvasRenderingContext2D, w: number, h: number): void;
}

export interface Photo {
  id: string;
  bitmap: ImageBitmap;        // downscaled, max 2048px long edge
  w: number; h: number;
  score: number;              // 0..1 from Smart Pick
  thumbUrl: string;           // 200px object URL for strips/grids
}

export interface PhotoTransform {
  photoId: string;
  scale: number;              // multiplier over cover-fit scale (1 = cover)
  dx: number; dy: number;     // pan offset in design units
  rotate: number;             // degrees
}

export interface Project {
  photos: Photo[];
  templateId: string | null;
  assignments: Record<string /*slotId*/, PhotoTransform>;
  badge: boolean;             // "Made with Chamak" toggle, default false
}
```

## State (`src/state/project.ts`)
One React context holding `Project` + `step: 'upload' | 'pick' | 'edit' | 'done'`. Use `useReducer`. Actions: `ADD_PHOTOS`, `SET_TEMPLATE`, `SET_ASSIGNMENTS`, `UPDATE_TRANSFORM`, `SWAP_SLOT`, `SET_STEP`, `TOGGLE_BADGE`. No external state library.

## Photo intake (`src/engine/photos.ts`)
```ts
export async function importFiles(files: File[]): Promise<Photo[]> {
  const out: Photo[] = [];
  for (const f of files.slice(0, 8)) {
    if (!f.type.startsWith('image/')) continue;
    const full = await createImageBitmap(f, { imageOrientation: 'from-image' });
    const k = 2048 / Math.max(full.width, full.height);
    const bitmap = k < 1
      ? await createImageBitmap(full, { resizeWidth: Math.round(full.width * k), resizeHeight: Math.round(full.height * k), resizeQuality: 'high' })
      : full;
    if (bitmap !== full) full.close();
    out.push({ id: crypto.randomUUID(), bitmap, w: bitmap.width, h: bitmap.height, score: 0, thumbUrl: await makeThumb(bitmap, 200) });
  }
  return out;
}
```
Notes: `imageOrientation: 'from-image'` fixes EXIF rotation (phones shoot rotated). iOS Safari converts HEIC to JPEG on `<input type=file>`; nothing extra needed. Show a progress bar; 8 photos take 1–3 s on a budget phone. Run intake inside `requestIdleCallback` chunks or sequentially, never `Promise.all` (memory spike).

## Fit math (`src/engine/fit.ts`)
Cover-fit: the photo always fills the slot.
```ts
export function coverScale(slot: Slot, p: Photo) {
  return Math.max(slot.w / p.w, slot.h / p.h);
}
// Draw order for a slot: clip to slot shape → translate to slot center → rotate(slot.rotate + t.rotate)
// → scale(coverScale * t.scale) → drawImage centered with (dx, dy) pan → restore.
```
Clamp pan so the photo never exposes the background: `|dx| <= (p.w*s - slot.w)/2`, same for dy, where `s = coverScale * t.scale`. Skip the clamp when `rotate != 0` (acceptable edge case for v1).

## Renderer (`src/engine/renderer.ts`)
```ts
export function render(ctx, w, h, template, project, photosById, opts?: { selectedSlot?: string }) {
  const k = w / 1080;                 // scale factor from design units
  ctx.save(); ctx.scale(k, k);        // from here on draw in 1080x1920 units
  template.drawBackground(ctx, 1080, 1920);
  for (const slot of template.slots) drawSlot(ctx, slot, project.assignments[slot.id], photosById);
  template.drawForeground(ctx, 1080, 1920);
  if (project.badge) drawBadge(ctx);  // small text bottom-right, 28px DM Sans, 70% white
  if (opts?.selectedSlot) drawSelectionRing(ctx, slot); // preview only, never on export
  ctx.restore();
}
```
`drawSlot` builds the clip path by shape: `rect` → rect, `rounded` → `roundRect`, `circle` → arc, `arch` → rect bottom + half-circle top (`arc` with radius `w/2` centered at `(x + w/2, y + w/2)`). Empty slot → fill `rgba(255,255,255,0.08)` with a dashed border in preview.

Preview canvas: CSS width = screen width minus margins, backing store = CSS px × `devicePixelRatio` capped at 2. Redraw with `requestAnimationFrame` on every gesture frame. Never redraw on React render; call `render` from a `useEffect` keyed on `project`.

Fonts: before the first render of a template, `await Promise.all(template.fonts.map(f => document.fonts.load(f)))`. Import the fontsource CSS once in `main.tsx` (`import '@fontsource/rozha-one'` etc.).

## Smart Pick (`src/engine/score.ts`)
Score each photo once on import. Work on a 256px grayscale copy.
```ts
function gray256(bitmap): Float32Array  // draw to 256px canvas, getImageData, luma = 0.299R+0.587G+0.114B

export function sharpness(g: Float32Array, w: number, h: number): number {
  // Laplacian variance. Kernel: [0,1,0; 1,-4,1; 0,1,0]
  let sum = 0, sumSq = 0, n = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const L = g[i - w] + g[i - 1] + g[i + 1] + g[i + w] - 4 * g[i];
    sum += L; sumSq += L * L; n++;
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;            // variance, higher = sharper
}

export function exposure(g: Float32Array): number {
  let dark = 0, bright = 0, total = 0;
  for (const v of g) { if (v < 10) dark++; else if (v > 245) bright++; total += v; }
  const clipped = (dark + bright) / g.length;          // fraction of blown pixels
  const meanDist = Math.abs(total / g.length - 118) / 118;
  return Math.max(0, 1 - clipped * 4 - meanDist * 0.5); // 0..1
}

export function resolutionScore(p: Photo) { return Math.min(1, Math.min(p.w, p.h) / 1080); }

export function scoreAll(photos: Photo[]) {
  const sharp = photos.map(p => sharpness(...));
  const max = Math.max(...sharp) || 1;                  // normalise within the batch
  photos.forEach((p, i) => {
    p.score = 0.6 * (sharp[i] / max) + 0.3 * exposure(...) + 0.1 * resolutionScore(p);
  });
}
```
Label in UI: **"Smart Pick (on-device)"**. Never call it AI.

## Assignment (`src/engine/assign.ts`)
1. Slots sorted by area, largest first. Photos sorted by score, best first.
2. For each slot: pick the highest-scored unused photo whose orientation matches (slot `w/h < 0.9` → prefer portrait photos `p.w/p.h < 0.9`; `> 1.1` → prefer landscape; else any). If none match, take the best unused.
3. Fewer photos than slots → reuse photos from the top of the list (duplicates allowed, warn in UI).
4. Every assignment starts at `{ scale: 1, dx: 0, dy: 0, rotate: 0 }`.
"Shuffle" = re-run with a random tiebreak among the top half.

## Export (`src/engine/export.ts`)
```ts
export async function exportJpeg(template, project, photosById): Promise<Blob> {
  const sizes = [[1080, 1920], [810, 1440]];           // fallback for memory errors
  for (const [w, h] of sizes) {
    try {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      render(c.getContext('2d')!, w, h, template, { ...project }, photosById);
      const blob = await new Promise<Blob>((res, rej) => c.toBlob(b => b ? res(b) : rej(), 'image/jpeg', 0.92));
      c.width = c.height = 0;                            // free memory on iOS
      return blob;
    } catch (e) { if (w === 810) throw e; }
  }
  throw new Error('export failed');
}
```
Filename: `chamak-<templateId>-<yyyymmdd>.jpg`.

## Download + share (`src/engine/share.ts`)
```ts
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);

export function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

export async function shareImage(blob: Blob, name: string, text: string): Promise<'shared' | 'unsupported' | 'cancelled'> {
  const file = new File([blob], name, { type: 'image/jpeg' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], text }); return 'shared'; }
    catch { return 'cancelled'; }                         // AbortError = user closed sheet
  }
  return 'unsupported';
}

export function whatsappTextLink(text: string) { return `https://wa.me/?text=${encodeURIComponent(text)}`; }
```
Behaviour:
- **Android:** "Download HD" → `download()`. "Share on WhatsApp" → `shareImage()`; if unsupported, open `whatsappTextLink`.
- **iOS:** "Save to Photos" → `shareImage()` (user taps *Save Image* in the sheet; `a.download` on iOS saves to Files, which users do not find). "Share on WhatsApp" → same sheet.
- `navigator.share` resolving = count as 1 completed share for the unlock loop. Rejecting = no count.
- Support: `navigator.share` iOS Safari 12.1+, files on iOS 15+; Android Chrome 75+. In-app browsers (WhatsApp opens Chrome Custom Tab / SFSafariViewController) support it too; verify on Day 3.

## Unlock (`src/ui/store.ts`)
```ts
const KEY = 'ck.unlock';  // { shares: number, downloads: number }
export const isUnlocked = () => { const s = read(); return s.shares >= 1 || s.downloads >= 3; };
```
Wrap all `localStorage` access in try/catch (private mode throws). Privacy page mentions this one key.

## Gestures (`src/ui/gestures.ts`)
Editor, using `@use-gesture/react` on the canvas wrapper:
- `onDrag`: `dx += delta.x / k`, `dy += delta.y / k` (k = canvas CSS px per design unit), then clamp.
- `onPinch`: `scale = clamp(scale * (1 + delta), 1, 4)`.
- Tap (drag distance < 6px): hit-test slots in reverse order (topmost first) in design units → select.
- Rotate: `<input type="range" min=-45 max=45 step=1>` bound to `rotate`.
- Set `touch-action: none` on the canvas wrapper so the page does not scroll while editing.

Picker, using `motion`:
- `<motion.div drag="x" dragConstraints={{left:0,right:0}} onDragEnd={(e, info) => Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500 ? commit(sign) : snapBack()}>`
- Left = next template, right = previous (browse both ways). "Use this" button commits. Rotate the card by `offset.x / 20` degrees while dragging.
- Each card is a 360x640 preview canvas rendered once per template with the current assignments (cache as a data URL per `templateId + photo ids`).

## Performance budget
| Thing | Budget |
|---|---|
| JS bundle (gz), excluding fonts | < 150 KB |
| Fonts total (woff2, latin + devanagari subsets) | < 400 KB, lazy per direction |
| First interactive on 4G mid-range Android | < 3 s |
| Editor gesture frame | 16 ms (render preview at ≤ 2x DPR) |
| Export 1080x1920 on iPhone 11 | < 1.5 s |
Lazy-load template directions with `import()` so the Navratri pack does not pay for Y2K fonts.
