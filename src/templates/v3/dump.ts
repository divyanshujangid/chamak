// v3 "dump" set: photo-dump grid, film contact sheet, diagonal detail slices, garba playlist.
// Research: T3, T4, T10, T11. Everything drawn in code; textures cached.
import '@fontsource/playfair-display/900.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/homemade-apple/400.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import '@fontsource/caveat/700.css';
import '@fontsource/rozha-one/400.css';
import '@fontsource/inter-tight/400.css';
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/600.css';
import '@fontsource/inter-tight/800.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/400-italic.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import type { Slot, Template } from '../../engine/types';
import { cached, grain, rng, sparkleDoodle, tornRect, velvet } from '../v2/art';

type Ctx = CanvasRenderingContext2D;

/* ---------------- shared helpers ---------------- */

/** Letter-spaced text (canvas letterSpacing is not everywhere yet). */
function spaced(ctx: Ctx, s: string, x: number, y: number, sp: number, align: CanvasTextAlign = 'left') {
  const chars = [...s];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + sp * (chars.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.save();
  ctx.textAlign = 'left';
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + sp;
  });
  ctx.restore();
  return total;
}

function heart(ctx: Ctx, x: number, y: number, s: number, color: string, lw = 3, fill = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s * 0.9, -s * 0.25, -s * 0.45, -s * 0.95, 0, -s * 0.42);
  ctx.bezierCurveTo(s * 0.45, -s * 0.95, s * 0.9, -s * 0.25, 0, s * 0.35);
  ctx.closePath();
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  if (fill) { ctx.fillStyle = color; ctx.fill(); } else { ctx.strokeStyle = color; ctx.stroke(); }
  ctx.restore();
}

/** Small washi tape (art.ts tape is fixed 54px tall). */
function miniTape(ctx: Ctx, x: number, y: number, w: number, h: number, rot: number, color: string, seed: number) {
  const r = rng(seed);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  for (let i = 0; i <= 5; i++) ctx.lineTo(w / 2 + (i % 2 ? -5 : 0) + r() * 2, -h / 2 + (h * i) / 5);
  ctx.lineTo(-w / 2, h / 2);
  for (let i = 5; i >= 0; i--) ctx.lineTo(-w / 2 + (i % 2 ? 5 : 0) - r() * 2, -h / 2 + (h * i) / 5);
  ctx.closePath();
  ctx.shadowColor = 'rgba(40,30,10,0.18)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.35);
  ctx.restore();
}

/* =========================================================
   1. Navratri Photo Dump (T3)
   ========================================================= */
const INK = '#2C2A26';
const RUST = '#A4452C';
const SAGE = 'rgba(154,165,143,0.88)';
const BLUSH = 'rgba(214,170,150,0.85)';
const LABELS = ['OUTFIT', 'JEWELLERY', 'DANDIYA', 'GARBA NIGHT', 'SELFIE', 'FRIENDS', 'FOOD', 'DECOR', 'CANDID'];
const DUMP_TW = 288, DUMP_TH = 360, DUMP_GX = 36, DUMP_X0 = 72, DUMP_Y0 = 446, DUMP_PITCH = 432;
const dumpSlots: Slot[] = LABELS.map((l, i) => ({
  id: l.toLowerCase().replace(' ', '-'),
  x: DUMP_X0 + (i % 3) * (DUMP_TW + DUMP_GX),
  y: DUMP_Y0 + Math.floor(i / 3) * DUMP_PITCH,
  w: DUMP_TW,
  h: DUMP_TH,
  shape: 'rect',
}));

const photoDump: Template = {
  id: 'n3-photo-dump',
  name: 'Navratri Photo Dump',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: ['900 140px "Playfair Display"', '700 24px "Cormorant Garamond"', '400 50px "Homemade Apple"', '400 18px "Space Mono"'],
  slots: dumpSlots,
  drawBackground(ctx, w, h) {
    // kraft desk
    velvet(ctx, 0, 0, w, h, '#B9A27C', '#D6C4A2', 41);
    // parchment sheet with torn edges
    ctx.save();
    tornRect(ctx, 30, 34, w - 60, h - 68, 14, 77);
    ctx.shadowColor = 'rgba(60,40,10,0.35)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#EFE6D6';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.clip();
    ctx.globalAlpha = 0.55;
    velvet(ctx, 0, 0, w, h, '#E2D5BE', '#F5EEE2', 12);
    ctx.restore();

    // torn kraft scrap behind the header, taped
    ctx.save();
    tornRect(ctx, 150, 214, 780, 150, 12, 5);
    ctx.shadowColor = 'rgba(60,40,10,0.22)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#D9C7A6';
    ctx.fill();
    ctx.restore();

    // header
    ctx.fillStyle = INK;
    ctx.font = '400 18px "Space Mono", monospace';
    spaced(ctx, 'VOL. 04  ·  OCT 2026  ·  9 NIGHTS', w / 2, 178, 4, 'center');
    ctx.font = '900 132px "Playfair Display", serif';
    spaced(ctx, 'NAVRATRI', w / 2, 334, 8, 'center');

    // white mounts under each tile + labels
    dumpSlots.forEach((s, i) => {
      ctx.save();
      ctx.shadowColor = 'rgba(60,40,10,0.28)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#FBF8F1';
      ctx.fillRect(s.x - 9, s.y - 9, s.w + 18, s.h + 18);
      ctx.restore();
      ctx.fillStyle = INK;
      ctx.font = '700 24px "Cormorant Garamond", serif';
      spaced(ctx, LABELS[i], s.x + s.w / 2, s.y + s.h + 46, 5, 'center');
    });
  },
  drawForeground(ctx, w, h) {
    // tape strips on the tiles (alternating corners/tops, crisp not messy)
    const t = (i: number) => dumpSlots[i];
    miniTape(ctx, t(0).x + 12, t(0).y + 6, 96, 30, -38, SAGE, 1);
    miniTape(ctx, t(2).x + t(2).w - 12, t(2).y + 6, 96, 30, 38, BLUSH, 2);
    miniTape(ctx, t(4).x + t(4).w / 2, t(4).y - 6, 110, 30, -3, SAGE, 3);
    miniTape(ctx, t(6).x + 10, t(6).y + t(6).h - 6, 96, 30, 38, BLUSH, 4);
    miniTape(ctx, t(8).x + t(8).w - 10, t(8).y + t(8).h - 6, 96, 30, -38, SAGE, 5);
    miniTape(ctx, 196, 226, 120, 34, -12, 'rgba(236,222,190,0.85)', 6);
    miniTape(ctx, 884, 226, 120, 34, 10, 'rgba(236,222,190,0.85)', 7);

    // script tagline over the header
    ctx.save();
    ctx.translate(706, 404);
    ctx.rotate(-0.07);
    ctx.font = '400 50px "Homemade Apple", cursive';
    ctx.fillStyle = RUST;
    ctx.textAlign = 'center';
    ctx.fillText('photo dump', 0, 0);
    ctx.restore();

    // doodles
    sparkleDoodle(ctx, 112, 300, 26, INK, 3);
    sparkleDoodle(ctx, 140, 254, 13, RUST, 2.5);
    sparkleDoodle(ctx, 972, 262, 20, RUST, 3);
    heart(ctx, 932, 404, 22, RUST, 3);
    heart(ctx, 964, 380, 13, INK, 2.5);
    sparkleDoodle(ctx, 1000, 1760, 16, INK, 2.5);
    sparkleDoodle(ctx, 78, 1772, 12, RUST, 2.5);

    // footer
    ctx.save();
    ctx.font = '400 30px "Homemade Apple", cursive';
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    const msg = 'save this for your next garba night';
    ctx.fillText(msg, w / 2 - 18, 1790);
    const mw = ctx.measureText(msg).width;
    ctx.restore();
    heart(ctx, w / 2 - 18 + mw / 2 + 30, 1780, 24, RUST, 3, true);

    grain(ctx, w, h, 0.07, 'multiply');
  },
};

/* =========================================================
   2. NAVRATRI'26 Contact Sheet (T4)
   ========================================================= */
interface Strip { cx: number; cy: number; rot: number; n: number; fw: number; fh: number; gap: number; first: number; slots: Slot[] }
const MARGIN = 66;
function makeStrip(id: string, cx: number, cy: number, rot: number, n: number, fw: number, fh: number, gap: number, first: number): Strip {
  const a = (rot * Math.PI) / 180;
  const span = n * fw + (n - 1) * gap;
  const slots: Slot[] = [];
  for (let i = 0; i < n; i++) {
    const lx = -span / 2 + fw / 2 + i * (fw + gap);
    const wx = cx + lx * Math.cos(a), wy = cy + lx * Math.sin(a);
    slots.push({ id: `${id}-${i + 1}`, x: Math.round(wx - fw / 2), y: Math.round(wy - fh / 2), w: fw, h: fh, rotate: rot, shape: 'rect' });
  }
  return { cx, cy, rot, n, fw, fh, gap, first, slots };
}
const STRIPS: Strip[] = [
  makeStrip('s1', 556, 432, -4, 2, 430, 287, 40, 12),
  makeStrip('s2', 516, 830, -3.5, 3, 296, 197, 30, 14),
  makeStrip('s3', 550, 1230, -4.5, 2, 430, 287, 40, 17),
  makeStrip('s4', 524, 1628, -3.8, 3, 296, 197, 30, 19),
];
const STRIP_GREY = '#A3A3A3';
const EDGE_INK = 'rgba(26,26,26,0.86)';
const SHEET_BG = '#E9E7E2';

function drawStrip(ctx: Ctx, s: Strip, idx: number) {
  const H = s.fh + MARGIN * 2;
  const L = 1500;
  const pitch = s.fw + s.gap;
  const span = s.n * s.fw + (s.n - 1) * s.gap;
  ctx.save();
  ctx.translate(s.cx, s.cy);
  ctx.rotate((s.rot * Math.PI) / 180);
  // strip body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.32)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 10;
  const g = ctx.createLinearGradient(0, -H / 2, 0, H / 2);
  g.addColorStop(0, '#9C9C9C');
  g.addColorStop(0.5, STRIP_GREY);
  g.addColorStop(1, '#989898');
  ctx.fillStyle = g;
  ctx.fillRect(-L / 2, -H / 2, L, H);
  ctx.restore();
  // frame borders (dark film edge around each exposure) incl. blank frames bleeding off the ends
  ctx.fillStyle = '#1C1C1C';
  for (let k = -3; k < s.n + 3; k++) {
    const lx = -span / 2 + k * pitch;
    if (lx + s.fw < -L / 2 || lx > L / 2) continue;
    if (k < 0 || k >= s.n) {
      ctx.fillStyle = '#262422';
      ctx.fillRect(lx, -s.fh / 2, s.fw, s.fh);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(lx + 10, -s.fh / 2 + 10, s.fw - 20, s.fh - 20);
      ctx.fillStyle = '#1C1C1C';
    } else {
      ctx.fillRect(lx - 5, -s.fh / 2 - 5, s.fw + 10, s.fh + 10);
    }
  }
  // sprocket holes
  ctx.fillStyle = SHEET_BG;
  for (let x = -L / 2 + 10; x < L / 2; x += 46) {
    ctx.beginPath();
    ctx.roundRect(x, -H / 2 + 10, 24, 30, 4);
    ctx.roundRect(x, H / 2 - 40, 24, 30, 4);
    ctx.fill();
  }
  // edge markings
  ctx.fillStyle = EDGE_INK;
  ctx.textBaseline = 'alphabetic';
  const topY = -s.fh / 2 - 10, botY = s.fh / 2 + 24;
  ctx.font = '700 17px "Space Mono", monospace';
  for (let k = -3; k < s.n + 3; k++) {
    const lx = -span / 2 + k * pitch;
    if (lx + s.fw < -L / 2 || lx > L / 2) continue;
    const num = s.first + k;
    // top edge: roll name + arrow code
    spaced(ctx, (k + idx) % 2 === 0 ? "NAVRATRI'26" : 'GARBA 400', lx + 8, topY, 2);
    spaced(ctx, '► 26', lx + s.fw - 8, topY, 2, 'right');
    // bottom edge: frame numbers
    spaced(ctx, `${num}`, lx + 6, botY, 1);
    spaced(ctx, `► ${num}A`, lx + s.fw / 2 + 30, botY, 1, 'center');
  }
  ctx.font = '400 14px "Space Mono", monospace';
  for (let k = -3; k < s.n + 3; k++) {
    const lx = -span / 2 + k * pitch;
    if (lx + s.fw < -L / 2 || lx > L / 2) continue;
    spaced(ctx, (k + idx) % 2 ? '5063' : 'DX 26', lx + s.fw - 6, botY - 1, 1, 'right');
  }
  ctx.restore();
}

/** Dust, hairs and scratches, cached at half res. */
function dust(ctx: Ctx, w: number, h: number) {
  const tex = cached('n3-dust', 540, 960, (c) => {
    const r = rng(2026);
    for (let i = 0; i < 260; i++) {
      const x = r() * 540, y = r() * 960, s = r() < 0.9 ? 0.4 + r() * 0.9 : 1.4 + r() * 1.6;
      c.fillStyle = r() < 0.55 ? `rgba(255,255,255,${0.35 + r() * 0.4})` : `rgba(20,20,20,${0.25 + r() * 0.35})`;
      c.beginPath();
      c.ellipse(x, y, s, s * (0.6 + r() * 0.5), r() * 3, 0, Math.PI * 2);
      c.fill();
    }
    c.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const x = r() * 540, y = r() * 960, l = 10 + r() * 26;
      c.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,0.45)' : 'rgba(25,25,25,0.35)';
      c.lineWidth = 0.6;
      c.beginPath();
      c.moveTo(x, y);
      c.bezierCurveTo(x + l * 0.3, y - l * 0.4, x + l * 0.6, y + l * 0.3, x + l, y - l * 0.1);
      c.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const x = r() * 540;
      c.strokeStyle = 'rgba(255,255,255,0.12)';
      c.lineWidth = 0.5;
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x + (r() - 0.5) * 20, 960);
      c.stroke();
    }
  });
  ctx.drawImage(tex, 0, 0, w, h);
}

/** Wobbly grease-pencil loop around a (rotated) frame. */
function greaseLoop(ctx: Ctx, s: Slot) {
  const r = rng(9);
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
  const rx = s.w / 2 + 34, ry = s.h / 2 + 30;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((s.rotate ?? 0) * Math.PI) / 180);
  ctx.strokeStyle = 'rgba(206,32,28,0.9)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 7;
  ctx.beginPath();
  for (let i = 0; i <= 70; i++) {
    const t = -2.4 + (i / 70) * (Math.PI * 2 + 0.5);
    const j = 1 + (r() - 0.5) * 0.015 + (i / 70) * 0.05;
    const x = Math.cos(t) * rx * j, y = Math.sin(t) * ry * j;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

const contactSheet: Template = {
  id: 'n3-contact-sheet',
  name: "NAVRATRI'26 Contact Sheet",
  pack: 'navratri',
  direction: 'y2k-chrome',
  fonts: ['700 17px "Space Mono"', '400 14px "Space Mono"', '700 52px "Caveat"', '400 22px "IBM Plex Mono"', 'italic 400 22px "IBM Plex Mono"'],
  slots: STRIPS.flatMap((s) => s.slots),
  drawBackground(ctx, w, h) {
    ctx.fillStyle = SHEET_BG;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.35;
    velvet(ctx, 0, 0, w, h, '#D6D3CC', '#F4F2EE', 88);
    ctx.globalAlpha = 1;
    // header line
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '700 22px "Space Mono", monospace';
    spaced(ctx, "NAVRATRI'26 — CONTACT SHEET", 60, 138, 3);
    spaced(ctx, 'ROLL 04 / 36', w - 60, 138, 3, 'right');
    ctx.fillRect(60, 154, w - 120, 2);
    STRIPS.forEach((s, i) => drawStrip(ctx, s, i));
  },
  drawForeground(ctx, w, h) {
    // grease-pencil pick on the first big frame
    const pick = STRIPS[0].slots[0];
    greaseLoop(ctx, pick);
    ctx.save();
    ctx.translate(560, 210);
    ctx.rotate(-0.07);
    ctx.font = '700 52px "Caveat", cursive';
    ctx.fillStyle = 'rgba(206,32,28,0.95)';
    ctx.fillText('this one', 0, 0);
    ctx.strokeStyle = 'rgba(206,32,28,0.95)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(182, -22); ctx.lineTo(196, -6); ctx.lineTo(226, -48);
    ctx.stroke();
    ctx.restore();
    // footer
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'italic 400 22px "IBM Plex Mono", monospace';
    spaced(ctx, 'nine nights. one roll. no retakes.', w / 2, 1862, 1, 'center');
    dust(ctx, w, h);
    grain(ctx, w, h, 0.06, 'overlay');
  },
};

/* =========================================================
   3. Detail Slices (T10)
   ========================================================= */
const T8 = Math.tan((8 * Math.PI) / 180);
const SL = 40, SR = 1040, ST = 40, SB = 1700, GAP = 3; // GAP is half of the 6px cut
const CUTS = [650, 1110];
const cutY = (c: number, x: number) => c - (x - 540) * T8;
const lift = (SR - SL) / 2 * T8; // vertical drift of a cut at the edges
const slicesSlots: Slot[] = [
  { id: 'earring', x: SL, y: ST, w: SR - SL, h: Math.round(CUTS[0] + lift - ST), shape: 'rect' },
  { id: 'eye', x: SL, y: Math.round(CUTS[0] - lift), w: SR - SL, h: Math.round(CUTS[1] - CUTS[0] + lift * 2), shape: 'rect' },
  { id: 'smile', x: SL, y: Math.round(CUTS[1] - lift), w: SR - SL, h: Math.round(SB - CUTS[1] + lift), shape: 'rect' },
];
function bandPath(ctx: Ctx, i: number) {
  const top = (x: number) => (i === 0 ? ST : cutY(CUTS[i - 1], x) + GAP);
  const bot = (x: number) => (i === 2 ? SB : cutY(CUTS[i], x) - GAP);
  ctx.beginPath();
  ctx.moveTo(SL, top(SL));
  ctx.lineTo(SR, top(SR));
  ctx.lineTo(SR, bot(SR));
  ctx.lineTo(SL, bot(SL));
  ctx.closePath();
}
const PAPER = '#FBFAF7';

const detailSlices: Template = {
  id: 'n3-detail-slices',
  name: 'Detail Slices',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: ['italic 300 84px "Fraunces Variable"', '400 40px "Rozha One"', '400 18px "Inter Tight"', '500 16px "Inter Tight"'],
  slots: slicesSlots,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);
  },
  // Each band is clipped to its diagonal parallelogram. The clip opened here is closed in the
  // next beforeSlot call, and the last one in drawForeground.
  beforeSlot(ctx, id) {
    const i = slicesSlots.findIndex((s) => s.id === id);
    if (i > 0) ctx.restore();
    ctx.save();
    bandPath(ctx, i);
    ctx.clip();
  },
  drawForeground(ctx, w, h) {
    ctx.restore();
    // hairline roman numerals on the bands, right edge
    ctx.save();
    ctx.font = 'italic 300 28px "Fraunces Variable", serif';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'right';
    ctx.fillText('i.', SR - 26, ST + 50);
    ctx.fillText('ii.', SR - 26, cutY(CUTS[0], SR) + 50);
    ctx.fillText('iii.', SR - 26, cutY(CUTS[1], SR) + 50);
    ctx.restore();
    // caption block in the bottom margin
    ctx.fillStyle = '#17130F';
    ctx.font = 'italic 300 84px "Fraunces Variable", serif';
    ctx.textAlign = 'left';
    ctx.fillText('nazakat', SL + 2, 1800);
    ctx.fillStyle = '#8A8178';
    ctx.font = '400 18px "Inter Tight", sans-serif';
    spaced(ctx, '(n.) grace, in the smallest details', SL + 6, 1846, 1.5);
    ctx.fillStyle = '#C1121F';
    ctx.font = '400 46px "Rozha One", serif';
    ctx.textAlign = 'right';
    ctx.fillText('रूप', SR - 2, 1792);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8A8178';
    ctx.font = '500 16px "Inter Tight", sans-serif';
    spaced(ctx, "NAVRATRI ’26", SR - 2, 1846, 4, 'right');
    ctx.fillStyle = '#C1121F';
    ctx.beginPath();
    ctx.arc(SR - 96, 1772, 5, 0, Math.PI * 2);
    ctx.fill();
    grain(ctx, w, h, 0.035, 'overlay');
  },
};

/* =========================================================
   4. Garba Playlist (T11)
   ========================================================= */
const TRACKS: [string, string][] = [
  ['Chogada', '3:12'],
  ['Udi Udi Jaye', '4:10'],
  ['Kesariyo Rang', '3:46'],
  ['Pankhida', '4:02'],
  ['Dholida', '3:35'],
  ['Nagada Sang Dhol', '4:29'],
  ['Shubhaarambh', '3:24'],
  ['Rangtaali', '3:58'],
];
const GREEN = '#1DB954';
const PX = 48, PW = 984, PY = 900, PH = 900, PAD = 44;
const ART = 156, ART_GAP = (PW - PAD * 2 - ART * 5) / 4, ART_Y = PY + 222;
const ROW_Y = ART_Y + ART + 64, ROW_H = 58;
const playlistSlots: Slot[] = [
  { id: 'hero', x: 0, y: 0, w: 1080, h: 1920, shape: 'rect' },
  ...[0, 1, 2, 3, 4].map((i): Slot => ({ id: `art${i + 1}`, x: Math.round(PX + PAD + i * (ART + ART_GAP)), y: ART_Y, w: ART, h: ART, shape: 'rounded', radius: 10 })),
];

function playIcon(ctx: Ctx, x: number, y: number, r: number) {
  ctx.fillStyle = GREEN;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0B0B0B';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.28, y - r * 0.38);
  ctx.lineTo(x + r * 0.42, y);
  ctx.lineTo(x - r * 0.28, y + r * 0.38);
  ctx.closePath();
  ctx.fill();
}

const garbaPlaylist: Template = {
  id: 'n3-garba-playlist',
  name: 'Garba Playlist',
  pack: 'navratri',
  direction: 'y2k-chrome',
  fonts: ['800 64px "Inter Tight"', '600 30px "Inter Tight"', '500 22px "Inter Tight"', '400 24px "Inter Tight"', '400 22px "IBM Plex Mono"'],
  slots: playlistSlots,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, w, h);
  },
  beforeSlot(ctx, id) {
    if (id !== 'art1') return;
    const w = 1080, h = 1920;
    // top scrim for the caption, bottom scrim + panel for the playlist
    const top = ctx.createLinearGradient(0, 0, 0, 360);
    top.addColorStop(0, 'rgba(0,0,0,0.45)');
    top.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, w, 360);
    const bot = ctx.createLinearGradient(0, PY - 260, 0, h);
    bot.addColorStop(0, 'rgba(0,0,0,0)');
    bot.addColorStop(0.35, 'rgba(0,0,0,0.35)');
    bot.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = bot;
    ctx.fillRect(0, PY - 260, w, h - PY + 260);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(PX, PY, PW, PH, 34);
    ctx.fillStyle = 'rgba(8,8,8,0.72)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // header
    const x0 = PX + PAD;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '600 20px "Inter Tight", sans-serif';
    spaced(ctx, 'PUBLIC PLAYLIST', x0, PY + 66, 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 64px "Inter Tight", sans-serif';
    ctx.fillText("garba nights '26", x0, PY + 136);
    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.font = '400 24px "Inter Tight", sans-serif';
    ctx.fillText('made for 9 nights  ·  8 songs, 30 min', x0, PY + 180);
    playIcon(ctx, PX + PW - PAD - 46, PY + 112, 46);
    // heart + shuffle-ish icons beside play
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    heart(ctx, PX + PW - PAD - 140, PY + 116, 34, 'rgba(255,255,255,0.75)', 3);
  },
  drawForeground(ctx) {
    // album art hairline borders
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 2;
    playlistSlots.slice(1).forEach((s) => { ctx.beginPath(); ctx.roundRect(s.x, s.y, s.w, s.h, 10); ctx.stroke(); });
    ctx.restore();

    // tracklist
    const x0 = PX + PAD, xr = PX + PW - PAD;
    TRACKS.forEach(([title, dur], i) => {
      const y = ROW_Y + i * ROW_H;
      const playing = i === 2;
      if (playing) {
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.beginPath();
        ctx.roundRect(x0 - 16, y - 38, xr - x0 + 32, ROW_H - 4, 10);
        ctx.fill();
        // equaliser bars
        ctx.fillStyle = GREEN;
        [16, 26, 12].forEach((bh, k) => ctx.fillRect(x0 + k * 8, y - bh, 5, bh));
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '400 22px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(String(i + 1), x0 + 2, y);
      }
      ctx.textAlign = 'left';
      ctx.fillStyle = playing ? GREEN : '#FFFFFF';
      ctx.font = '600 30px "Inter Tight", sans-serif';
      ctx.fillText(title, x0 + 58, y);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '400 22px "IBM Plex Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(dur, xr - 54, y);
      // overflow dots
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(xr - 18 + k * 9 - 9, y - 8, 2.6, 0, Math.PI * 2); ctx.fill(); }
    });
    ctx.textAlign = 'left';

    // top caption
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 22px "Inter Tight", sans-serif';
    spaced(ctx, 'NOW PLAYING  ·  NIGHT 04', 60, 190, 4);
    ctx.font = '800 64px "Inter Tight", sans-serif';
    ctx.fillText('on repeat till', 58, 262);
    ctx.fillText('dussehra.', 58, 330);
    ctx.restore();
  },
};

const list: Template[] = [photoDump, contactSheet, detailSlices, garbaPlaylist];
export default list;
