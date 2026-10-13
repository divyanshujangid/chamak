import { loadArt } from './assets';
import { applySlotRotation, coverScale, slotPath } from './fit';
import type { Assignments, Photo, Slot, Template } from './types';
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
  const s = coverScale(slot, p) * t.scale;
  ctx.translate(slot.x + slot.w / 2 + t.dx, slot.y + slot.h / 2 + t.dy);
  if (t.rotate) ctx.rotate((t.rotate * Math.PI) / 180);
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
  ctx.fillText('made with chamak ✦', 1040, 1890);
  ctx.restore();
}

export async function loadFonts(t: Template) {
  try {
    await Promise.all([...t.fonts.map((f) => document.fonts.load(f, 'Aaशुभ')), loadArt(t.art ?? [])]);
  } catch {
    /* render with fallback fonts */
  }
}
