import type { Photo, PhotoTransform, Slot } from './types';

export function coverScale(slot: Slot, p: { w: number; h: number }) {
  return Math.max(slot.w / p.w, slot.h / p.h);
}

const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

/**
 * Where the photo sits in a slot. `s` is the drawn scale; (ox, oy) is the offset of the
 * photo centre from the slot centre before the user's dx/dy. With a focus point (the
 * faces) the cover-fitted photo is centred on it, clamped so no background shows.
 */
export function placement(slot: Slot, p: Pick<Photo, 'w' | 'h' | 'focus'>, scale: number) {
  const s = coverScale(slot, p) * scale;
  const mx = Math.max(0, (p.w * s - slot.w) / 2);
  const my = Math.max(0, (p.h * s - slot.h) / 2);
  const f = p.focus;
  const ox = f ? clamp((0.5 - f.x) * p.w * s, mx) : 0;
  const oy = f ? clamp((0.5 - f.y) * p.h * s, my) : 0;
  return { s, ox, oy, mx, my };
}

/** Clamp pan so the photo never exposes the background (skipped when rotated).
 *  dx/dy are offsets on top of the focus placement. */
export function clampTransform(slot: Slot, p: Photo, t: PhotoTransform): PhotoTransform {
  const scale = Math.min(4, Math.max(1, t.scale));
  if (t.rotate !== 0) return { ...t, scale };
  const { ox, oy, mx, my } = placement(slot, p, scale);
  return { ...t, scale, dx: clamp(ox + t.dx, mx) - ox, dy: clamp(oy + t.dy, my) - oy };
}

export function slotPath(ctx: CanvasRenderingContext2D | Path2D, slot: Slot) {
  const { x, y, w, h } = slot;
  switch (slot.shape) {
    case 'rect':
      ctx.rect(x, y, w, h);
      break;
    case 'rounded':
      ctx.roundRect(x, y, w, h, slot.radius ?? 32);
      break;
    case 'circle':
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    case 'arch': {
      const r = w / 2;
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI, 0);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      break;
    }
  }
}

/** Apply slot rotation around its center. Caller must save/restore. */
export function applySlotRotation(ctx: CanvasRenderingContext2D, slot: Slot) {
  if (!slot.rotate) return;
  const cx = slot.x + slot.w / 2;
  const cy = slot.y + slot.h / 2;
  ctx.translate(cx, cy);
  ctx.rotate((slot.rotate * Math.PI) / 180);
  ctx.translate(-cx, -cy);
}

/** Point in design units → is it inside the slot (accounting for slot rotation)? */
export function hitSlot(slot: Slot, px: number, py: number) {
  let x = px, y = py;
  if (slot.rotate) {
    const cx = slot.x + slot.w / 2, cy = slot.y + slot.h / 2;
    const a = (-slot.rotate * Math.PI) / 180;
    const dx = px - cx, dy = py - cy;
    x = cx + dx * Math.cos(a) - dy * Math.sin(a);
    y = cy + dx * Math.sin(a) + dy * Math.cos(a);
  }
  return x >= slot.x && x <= slot.x + slot.w && y >= slot.y && y <= slot.y + slot.h;
}
