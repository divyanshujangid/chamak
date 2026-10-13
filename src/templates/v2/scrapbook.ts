// Vintage-scrapbook set (2025-26 Pinterest trend: aged paper, watercolor lotus, mini player).
// Raster art is Pixabay Content License (public/art/CREDITS.md); layouts are our own.
import '@fontsource/great-vibes/400.css';
import '@fontsource/kalam/700.css';
import type { Slot, Template } from '../../engine/types';
import { art } from '../../engine/assets';
import { grain, miniPlayer, rotateAbout, tape, tornBand, txt } from './art';

type Ctx = CanvasRenderingContext2D;
const SCRIPT = '"Great Vibes", cursive';
const SANS = '"DM Sans Variable", system-ui, sans-serif';

function cover(ctx: Ctx, name: string, x: number, y: number, w: number, h: number, fx = 0.5, fy = 0.5) {
  const img = art(name);
  if (!img) return;
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s, sh = h / s;
  const sx = Math.min(img.width - sw, Math.max(0, img.width * fx - sw / 2));
  const sy = Math.min(img.height - sh, Math.max(0, img.height * fy - sh / 2));
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/** Place art by width at (x,y) with optional rotation and blend (multiply drops white backgrounds). */
function put(ctx: Ctx, name: string, x: number, y: number, w: number, rot = 0, op: GlobalCompositeOperation = 'source-over', alpha = 1) {
  const img = art(name);
  if (!img) return;
  const h = (w * img.height) / img.width;
  ctx.save();
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = alpha;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function card(ctx: Ctx, s: Slot, pad: number, color = '#FBF7EE', shadow = 0.35) {
  ctx.save();
  rotateAbout(ctx, s);
  ctx.shadowColor = `rgba(0,0,0,${shadow})`;
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = color;
  ctx.fillRect(s.x - pad, s.y - pad, s.w + pad * 2, s.h + pad * 2);
  ctx.restore();
}

/** Torn cream strip holding a music player, like a ripped page. */
function playerStrip(ctx: Ctx, x: number, y: number, w: number, rot: number, title: string, artist: string) {
  ctx.save();
  ctx.translate(x + w / 2, y + 70);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.translate(-w / 2, -70);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  for (let i = 0; i <= w; i += 14) ctx.lineTo(i, (i / 14) % 2 ? 0 : 9);
  for (let i = w; i >= 0; i -= 14) ctx.lineTo(i, 140 - ((i / 14) % 2 ? 0 : 9));
  ctx.closePath();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#E9DFCB';
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(x + w / 2, y + 70);
  ctx.rotate((rot * Math.PI) / 180);
  miniPlayer(ctx, -w / 2 + 22, -52, w - 44, title, artist, 0.42, 'rgba(60,40,30,0.9)');
  ctx.restore();
}

/* 1 — Cream paper, red watercolor lotus, black-edged photos + torn player (pins #5, #11) */
const s1: Slot[] = [
  { id: 'a', x: 430, y: 110, w: 560, h: 520, shape: 'rect' },
  { id: 'b', x: 60, y: 560, w: 400, h: 520, shape: 'rect' },
  { id: 'c', x: 520, y: 820, w: 500, h: 700, shape: 'rect' },
];
const lotusPaper: Template = {
  id: 's-lotus-paper',
  name: 'Lotus Letters',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`700 60px Kalam`],
  art: ['paper-plain', 'wc-lotus', 'wc-lotus-buds'],
  slots: s1,
  drawBackground(ctx, w, h) {
    cover(ctx, 'paper-plain', 0, 0, w, h);
    ctx.fillStyle = 'rgba(250,244,232,0.55)';
    ctx.fillRect(0, 0, w, h);
    put(ctx, 'wc-lotus', -120, 1380, 720, -12, 'multiply');
    put(ctx, 'wc-lotus-buds', 820, 1300, 300, 8, 'multiply', 0.9);
    for (const s of s1) card(ctx, s, 10, '#1A1412', 0.3);
  },
  drawForeground(ctx, w, h) {
    put(ctx, 'wc-lotus', 300, 420, 340, 18, 'multiply');
    playerStrip(ctx, 470, 640, 480, -2, 'Chogada', 'garba nights');
    txt(ctx, 'navratri diaries ✿', 300, 1250, `700 60px Kalam`, '#7C1F1F', 'center', undefined, -4);
    grain(ctx, w, h, 0.08, 'multiply');
  },
};

/* 2 — Pink letter paper, lotus cutouts, scattered white-bordered squares (pins #6, #10) */
const s2: Slot[] = [
  { id: 'a', x: 140, y: 330, w: 420, h: 480, shape: 'rect', rotate: -3 },
  { id: 'b', x: 610, y: 260, w: 330, h: 330, shape: 'rect', rotate: 3 },
  { id: 'c', x: 610, y: 640, w: 360, h: 400, shape: 'rect', rotate: -2 },
  { id: 'd', x: 90, y: 880, w: 400, h: 400, shape: 'rect', rotate: 2 },
  { id: 'e', x: 540, y: 1100, w: 400, h: 440, shape: 'rect', rotate: -3 },
];
const pinkDesi: Template = {
  id: 's-pink-desi',
  name: 'Desi Pink',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`700 120px Kalam`, `400 80px ${SCRIPT}`],
  art: ['paper-pink-letter', 'lotus-cutout'],
  slots: s2,
  drawBackground(ctx, w, h) {
    cover(ctx, 'paper-pink-letter', 0, 0, w, h);
    ctx.fillStyle = 'rgba(255,240,242,0.35)';
    ctx.fillRect(0, 0, w, h);
    put(ctx, 'lotus-cutout', -140, -120, 520, 160);
    for (const s of s2) card(ctx, s, 14, '#FFFFFF', 0.22);
  },
  drawForeground(ctx, w, h) {
    put(ctx, 'lotus-cutout', 520, 1420, 620, -8);
    put(ctx, 'lotus-cutout', 820, 860, 220, 14);
    tape(ctx, 350, 330, 150, -6, 'rgba(245,190,200,0.85)', 2);
    tape(ctx, 775, 262, 130, 5, 'rgba(236,214,170,0.85)', 3);
    tape(ctx, 290, 885, 140, 3, 'rgba(245,190,200,0.85)', 7);
    txt(ctx, 'देसी', 270, 1480, `700 150px Kalam`, '#A3122A', 'center', ['rgba(255,255,255,0.6)', 8], -6);
    txt(ctx, 'navratri edit', 290, 1580, `400 80px ${SCRIPT}`, '#7A2235', 'center', undefined, -6);
    grain(ctx, w, h, 0.06, 'multiply');
  },
};

/* 3 — Maroon velvet with a lotus border and one big portrait (pin #9) */
const velvetLotus: Template = {
  id: 's-velvet-lotus',
  name: 'Velvet Lotus',
  pack: 'diwali',
  direction: 'royal-diwali',
  fonts: [`400 130px ${SCRIPT}`, `600 28px ${SANS}`],
  art: ['velvet-maroon', 'lotus-cutout'],
  slots: [{ id: 'main', x: 110, y: 230, w: 860, h: 1260, shape: 'rect' }],
  drawBackground(ctx, w, h) {
    cover(ctx, 'velvet-maroon', 0, 0, w, h, 0.4, 0.5);
    ctx.fillStyle = 'rgba(60,0,10,0.25)';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#E9D3A0';
    ctx.fillRect(96, 216, 888, 1288);
    ctx.restore();
  },
  drawForeground(ctx, w, h) {
    put(ctx, 'lotus-cutout', 700, 1260, 420, -10);
    put(ctx, 'lotus-cutout', 880, 1100, 220, 18);
    put(ctx, 'lotus-cutout', -60, 90, 300, 150);
    txt(ctx, 'Shubh Deepavali', 540, 1700, `400 130px ${SCRIPT}`, '#F3D58E', 'center', ['rgba(0,0,0,0.5)', 16]);
    ctx.save();
    ctx.letterSpacing = '12px';
    txt(ctx, 'DIWALI · 2026', 546, 1790, `600 28px ${SANS}`, '#E9C27A');
    ctx.restore();
    grain(ctx, w, h, 0.06);
  },
};

/* 4 — Old handwritten letter, lotus pond + sunflower watercolors, two tall frames (pins #4, #14) */
const s4: Slot[] = [
  { id: 'a', x: 520, y: 150, w: 470, h: 700, shape: 'rect', rotate: 2 },
  { id: 'b', x: 90, y: 1000, w: 470, h: 700, shape: 'rect', rotate: -2 },
];
const oldLetter: Template = {
  id: 's-old-letter',
  name: 'Old Letter',
  pack: 'diwali',
  direction: 'minimal-pastel',
  fonts: [`700 56px Kalam`],
  art: ['paper-letter', 'wc-lotus-pond', 'wc-sunflower'],
  slots: s4,
  drawBackground(ctx, w, h) {
    cover(ctx, 'paper-letter', 0, 0, w, h, 0.5, 0.6);
    put(ctx, 'wc-lotus-pond', -80, 80, 640, 0, 'multiply', 0.95);
    put(ctx, 'wc-sunflower', 600, 1040, 480, 8, 'multiply', 0.95);
    for (const s of s4) card(ctx, s, 18, '#F3E9D6', 0.35);
  },
  drawForeground(ctx, w, h) {
    playerStrip(ctx, 80, 760, 440, -3, 'Deewani Raatein', 'diwali mix');
    tape(ctx, 755, 145, 160, 4, 'rgba(236,214,170,0.85)', 1);
    tape(ctx, 325, 995, 160, -5, 'rgba(236,214,170,0.85)', 2);
    txt(ctx, 'roshni, mithai & tum ✨', 760, 1800, `700 56px Kalam`, '#4A2A14', 'center', undefined, -3);
    grain(ctx, w, h, 0.08, 'multiply');
  },
};

/* 5 — Bougainvillea window over sheet-music paper, one framed photo + player (pins #7, #13) */
const windowT: Template = {
  id: 's-bougainvillea',
  name: 'Bougainvillea',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`400 110px ${SCRIPT}`, `700 54px Kalam`],
  art: ['paper-music', 'wc-bougainvillea', 'wc-peony'],
  slots: [{ id: 'main', x: 170, y: 640, w: 740, h: 860, shape: 'rect' }],
  drawBackground(ctx, w, h) {
    cover(ctx, 'paper-music', 0, 0, w, h);
    ctx.fillStyle = 'rgba(248,238,222,0.35)';
    ctx.fillRect(0, 0, w, h);
    put(ctx, 'wc-bougainvillea', -40, -30, 1160, 0, 'multiply');
    tornBand(ctx, w, 1780, 140, 'top', 5, '#F1E6D2');
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#F6EEDF';
    ctx.fillRect(140, 610, 800, 1060);
    ctx.restore();
  },
  drawForeground(ctx, w, h) {
    put(ctx, 'wc-peony', 660, 1440, 440, -6, 'multiply');
    miniPlayer(ctx, 200, 1530, 420, 'Phool', 'navratri playlist', 0.36, 'rgba(60,40,30,0.9)');
    txt(ctx, 'phoolon wali navratri', 540, 1870, `700 54px Kalam`, '#8A2440');
    grain(ctx, w, h, 0.07, 'multiply');
  },
};

export default [lotusPaper, pinkDesi, oldLetter, windowT, velvetLotus];
