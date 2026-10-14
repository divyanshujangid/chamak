import { loadArt } from './assets';
import { applySlotRotation, placement, slotPath } from './fit';
import type { Assignments, Photo, PhotoTransform, Slot, Template } from './types';
import { DESIGN_W } from './types';

export interface RenderOpts {
  selectedSlot?: string | null;
  badge?: boolean;
  preview?: boolean;
}

export function render(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  template: Template,
  assignments: Assignments,
  photos: Map<string, Photo>,
  opts: RenderOpts = {},
) {
  const k = w / DESIGN_W;
  ctx.save();
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  template.drawBackground(ctx, 1080, 1920);
  for (const slot of template.slots) {
    template.beforeSlot?.(ctx, slot.id);
    drawSlot(ctx, slot, assignments, photos, !!opts.preview);
  }
  template.drawForeground(ctx, 1080, 1920);
  if (opts.badge) drawBadge(ctx);
  if (opts.selectedSlot) {
    const slot = template.slots.find((s) => s.id === opts.selectedSlot);
    if (slot) drawSelection(ctx, slot);
  }
  ctx.restore();
}

function drawSlot(ctx: CanvasRenderingContext2D, slot: Slot, a: Assignments, photos: Map<string, Photo>, preview: boolean) {
  const t = a[slot.id];
  const p = t ? photos.get(t.photoId) : undefined;
  if (slot.cutout && p && t) {
    if (p.cutout) drawCutout(ctx, slot, p, t);
    else drawStickerPhoto(ctx, slot, p, t);
    return;
  }
  ctx.save();
  applySlotRotation(ctx, slot);
  ctx.beginPath();
  slotPath(ctx, slot);
  ctx.clip();
  if (!p || !t) {
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fill();
    if (preview) {
      ctx.setLineDash([16, 12]);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 6;
      ctx.stroke();
    }
    ctx.restore();
    return;
  }
  const s = photoTransform(ctx, slot, p, t);
  ctx.drawImage(p.bitmap, (-p.w * s) / 2, (-p.h * s) / 2, p.w * s, p.h * s);
  if (slot.mono) {
    // clip survives a transform reset, so this greys exactly the slot
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  ctx.restore();
}

/** Move the origin to the photo centre (focus placement + user pan/rotate); returns the draw scale. */
function photoTransform(ctx: CanvasRenderingContext2D, slot: Slot, p: Photo, t: PhotoTransform) {
  const { s, ox, oy } = placement(slot, p, t.scale);
  ctx.translate(slot.x + slot.w / 2 + ox + t.dx, slot.y + slot.h / 2 + oy + t.dy);
  if (t.rotate) ctx.rotate((t.rotate * Math.PI) / 180);
  return s;
}

const OUTLINE = 14; // design px
const STICKER_TILT = -3; // degrees, fallback sticker only

/** Fallback until the cut-out is ready (or if it failed): the photo as a tilted
 *  white-bordered rounded sticker with a shadow. */
function drawStickerPhoto(ctx: CanvasRenderingContext2D, slot: Slot, p: Photo, t: PhotoTransform) {
  const r = Math.min(36, slot.w * 0.08);
  const b = OUTLINE + 4;
  ctx.save();
  applySlotRotation(ctx, slot);
  const cx = slot.x + slot.w / 2, cy = slot.y + slot.h / 2;
  ctx.translate(cx, cy);
  ctx.rotate((STICKER_TILT * Math.PI) / 180);
  ctx.translate(-cx, -cy);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(slot.x - b, slot.y - b, slot.w + 2 * b, slot.h + 2 * b, r + b);
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(slot.x, slot.y, slot.w, slot.h, r);
  ctx.clip();
  const s = photoTransform(ctx, slot, p, t);
  if (slot.mono) ctx.filter = 'grayscale(1)';
  ctx.drawImage(p.bitmap, (-p.w * s) / 2, (-p.h * s) / 2, p.w * s, p.h * s);
  ctx.restore();
}

/** The person, unclipped (free to break out of the frame), with a white outline and shadow. */
function drawCutout(ctx: CanvasRenderingContext2D, slot: Slot, p: Photo, t: PhotoTransform) {
  ctx.save();
  applySlotRotation(ctx, slot);
  const s = photoTransform(ctx, slot, p, t);
  // Device pixels per source pixel decides the sticker's resolution.
  const m = ctx.getTransform();
  const dev = Math.hypot(m.a, m.b); // device px per design px
  const st = sticker(p.cutout!, s * dev, OUTLINE * dev, !!slot.mono);
  const k = 1 / (st.res / s); // sticker px -> design px
  ctx.drawImage(st.canvas, (-p.w * s) / 2 - st.pad * k, (-p.h * s) / 2 - st.pad * k, st.canvas.width * k, st.canvas.height * k);
  ctx.restore();
}

interface Sticker { key: string; canvas: HTMLCanvasElement; res: number; pad: number }
const stickers = new WeakMap<ImageBitmap, Sticker>();

/**
 * Sticker bitmap built at roughly the size it is drawn (res = sticker px per source px),
 * cached per cut-out. White outline = the silhouette stamped at 16 offsets round a
 * circle, filled white; the soft drop shadow is baked in. Rebuilt only when the drawn
 * size changes by more than ~12% (pinch zoom) or mono changes.
 */
function sticker(cut: ImageBitmap, wantRes: number, outlinePx: number, mono: boolean): Sticker {
  const step = Math.round(Math.log(Math.min(1, wantRes)) / Math.log(1.12));
  const res = Math.min(1, Math.pow(1.12, step));
  const key = `${step}|${mono}`;
  const hit = stickers.get(cut);
  if (hit && hit.key === key) return hit;
  if (hit) hit.canvas.width = hit.canvas.height = 1;

  const o = outlinePx * (res / wantRes); // outline in sticker px, true to design size
  const blur = o * 1.6;
  const pad = Math.ceil(o + blur * 2 + o);
  const w = Math.max(1, Math.round(cut.width * res)), h = Math.max(1, Math.round(cut.height * res));

  const person = document.createElement('canvas');
  person.width = w; person.height = h;
  const pc = person.getContext('2d')!;
  pc.imageSmoothingQuality = 'high';
  pc.drawImage(cut, 0, 0, w, h);
  if (mono) {
    pc.globalCompositeOperation = 'saturation';
    pc.fillStyle = '#808080';
    pc.fillRect(0, 0, w, h);
    pc.globalCompositeOperation = 'destination-in';
    pc.drawImage(cut, 0, 0, w, h);
  }

  const ring = document.createElement('canvas');
  ring.width = w + 2 * pad; ring.height = h + 2 * pad;
  const rc = ring.getContext('2d')!;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rc.drawImage(person, pad + Math.cos(a) * o, pad + Math.sin(a) * o);
  }
  rc.globalCompositeOperation = 'source-in';
  rc.fillStyle = '#fff';
  rc.fillRect(0, 0, ring.width, ring.height);

  const out = document.createElement('canvas');
  out.width = ring.width; out.height = ring.height;
  const oc = out.getContext('2d')!;
  oc.shadowColor = 'rgba(0,0,0,0.38)';
  oc.shadowBlur = blur;
  oc.shadowOffsetY = o * 0.6;
  oc.drawImage(ring, 0, 0);
  oc.shadowColor = 'transparent';
  oc.drawImage(person, pad, pad);
  person.width = person.height = ring.width = ring.height = 1;

  const st = { key, canvas: out, res, pad };
  stickers.set(cut, st);
  return st;
}

function drawSelection(ctx: CanvasRenderingContext2D, slot: Slot) {
  ctx.save();
  applySlotRotation(ctx, slot);
  ctx.beginPath();
  slotPath(ctx, slot);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#F0B32E';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.restore();
}

function drawBadge(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.font = '500 28px "DM Sans Variable", sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 8;
  ctx.fillText('made with storywala ✦', 1040, 1890);
  ctx.restore();
}

export async function loadFonts(t: Template) {
  try {
    await Promise.all([...t.fonts.map((f) => document.fonts.load(f, 'Aaशुभ')), loadArt(t.art ?? [])]);
  } catch {
    /* render with fallback fonts */
  }
}
