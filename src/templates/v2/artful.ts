// Templates built on licensed raster art (Pixabay Content License, see public/art/CREDITS.md).
// Each mirrors a Pinterest-trending look; the art is free for commercial use, never copied from pins.
import '@fontsource/great-vibes/400.css';
import '@fontsource/baloo-2/800.css';
import '@fontsource/kalam/700.css';
import type { Slot, Template } from '../../engine/types';
import { art } from '../../engine/assets';
import { grain, marigold, polaroid, rotateAbout, sparkleDoodle, tape, tornBand, txt } from './art';

type Ctx = CanvasRenderingContext2D;
const SCRIPT = '"Great Vibes", cursive';
const SANS = '"DM Sans Variable", system-ui, sans-serif';
const BALOO = '"Baloo 2", system-ui, sans-serif';

/** Draw image `name` to cover the box, with focus point (0..1) kept in view. */
function cover(ctx: Ctx, name: string, x: number, y: number, w: number, h: number, fx = 0.5, fy = 0.5) {
  const img = art(name);
  if (!img) return;
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s, sh = h / s;
  const sx = Math.min(img.width - sw, Math.max(0, img.width * fx - sw / 2));
  const sy = Math.min(img.height - sh, Math.max(0, img.height * fy - sh / 2));
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function frame(ctx: Ctx, s: Slot, pad: number, bottom: number, color = '#FBF8F2') {
  ctx.save();
  rotateAbout(ctx, s);
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = color;
  ctx.fillRect(s.x - pad, s.y - pad, s.w + pad * 2, s.h + pad + bottom);
  ctx.restore();
}

/* 1 — Durga eyes over a saffron glow */
const eyes: Template = {
  id: 'a-durga-eyes',
  name: 'Maa Ke Nayan',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: [`800 100px ${BALOO}`, `600 30px ${SANS}`],
  art: ['durga-eyes'],
  slots: [
    { id: 'main', x: 170, y: 560, w: 740, h: 940, shape: 'arch' },
    { id: 'l', x: 40, y: 1290, w: 270, h: 270, shape: 'circle' },
    { id: 'r', x: 770, y: 1290, w: 270, h: 270, shape: 'circle' },
  ],
  drawBackground(ctx, w, h) {
    const g = ctx.createRadialGradient(540, 420, 60, 540, 900, 1300);
    g.addColorStop(0, '#FFB62E');
    g.addColorStop(0.45, '#E2461B');
    g.addColorStop(1, '#6E0A12');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const img = art('durga-eyes');
    if (img) ctx.drawImage(img, 0, 0, img.width, 470, 60, 70, 960, 960 * (470 / img.width));
    // gold arch outline
    ctx.save();
    ctx.strokeStyle = '#FFD27A';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(150, 1520);
    ctx.lineTo(150, 930);
    ctx.arc(540, 930, 390, Math.PI, 0);
    ctx.lineTo(930, 1520);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  },
  drawForeground(ctx, w, h) {
    for (const [x, y] of [[175, 1290], [905, 1290]]) {
      ctx.save();
      ctx.strokeStyle = '#FFD27A';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(x, y + 135, 140, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    for (let i = 0; i < 9; i++) marigold(ctx, 330 + i * 52, 1530 + Math.sin(i) * 6, 30, i + 3);
    txt(ctx, 'शुभ नवरात्रि', 540, 1720, `800 120px ${BALOO}`, '#FFF1D0', 'center', ['rgba(0,0,0,0.45)', 18]);
    ctx.save();
    ctx.letterSpacing = '14px';
    txt(ctx, 'NAVRATRI · 2026', 548, 1800, `600 30px ${SANS}`, '#FFD27A');
    ctx.restore();
    grain(ctx, w, h, 0.08);
  },
};

/* 2 — Durga Puja marigold ring; photo sits inside the ring */
const RS = 1000 / 1280;
const RX = 40, RY = 30;
const ringC = { x: RX + 632 * RS, y: RY + 712 * RS, r: 305 * RS };
const ringPol: Slot[] = [
  { id: 'p1', x: 110, y: 1150, w: 390, h: 420, shape: 'rect', rotate: -5 },
  { id: 'p2', x: 580, y: 1130, w: 390, h: 420, shape: 'rect', rotate: 4 },
];
const ring: Template = {
  id: 'a-durga-ring',
  name: 'Durga Puja Ring',
  pack: 'navratri',
  direction: 'royal-diwali',
  fonts: [`400 120px ${SCRIPT}`, `600 30px ${SANS}`],
  art: ['durga-ring'],
  slots: [
    { id: 'ring', x: ringC.x - ringC.r - 10, y: ringC.y - ringC.r - 10, w: ringC.r * 2 + 20, h: ringC.r * 2 + 20, shape: 'circle' },
    ...ringPol,
  ],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#FFF4E2';
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(540, 620, 100, 540, 620, 900);
    g.addColorStop(0, 'rgba(255,190,80,0.45)');
    g.addColorStop(1, 'rgba(255,190,80,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (const s of ringPol) frame(ctx, s, 20, 90);
  },
  drawForeground(ctx, w, h) {
    const img = art('durga-ring');
    if (img) {
      // ring art on top of the photo, with its white centre cut out
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.arc(ringC.x, ringC.y, ringC.r - 2, 0, Math.PI * 2, true);
      ctx.clip('evenodd');
      ctx.drawImage(img, RX, RY, 1000, 1000);
      ctx.restore();
    }
    tape(ctx, 300, 1140, 170, -8, 'rgba(240,170,60,0.75)', 3);
    tape(ctx, 775, 1118, 170, 6, 'rgba(230,80,60,0.7)', 8);
    txt(ctx, 'Happy Navratri', 540, 1770, `400 128px ${SCRIPT}`, '#9A1B1B');
    ctx.save();
    ctx.letterSpacing = '12px';
    txt(ctx, 'JAI MATA DI', 546, 1850, `600 30px ${SANS}`, '#C8741A');
    ctx.restore();
    grain(ctx, w, h, 0.06);
  },
};

/* 3 — Durga painting header with torn-paper photo board */
const paintSlots: Slot[] = [
  { id: 'big', x: 80, y: 800, w: 540, h: 760, shape: 'rect', rotate: -2 },
  { id: 'r1', x: 670, y: 800, w: 340, h: 360, shape: 'rect', rotate: 3 },
  { id: 'r2', x: 670, y: 1200, w: 340, h: 360, shape: 'rect', rotate: -2 },
];
const painting: Template = {
  id: 'a-durga-painting',
  name: 'Durga Artwork',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`700 80px Kalam`, `600 28px ${SANS}`],
  art: ['durga-painting'],
  slots: paintSlots,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#F6EBD9';
    ctx.fillRect(0, 0, w, h);
    cover(ctx, 'durga-painting', 0, 0, w, 720, 0.5, 0.5);
    tornBand(ctx, w, 690, 80, 'top', 6, '#F6EBD9');
    for (const s of paintSlots) frame(ctx, s, 16, 16);
  },
  drawForeground(ctx, w, h) {
    tape(ctx, 350, 790, 180, -4, 'rgba(236,214,170,0.85)', 2);
    tape(ctx, 840, 792, 150, 5, 'rgba(232,120,90,0.7)', 4);
    tape(ctx, 840, 1192, 150, -6, 'rgba(236,214,170,0.85)', 6);
    txt(ctx, 'जय माता दी', 540, 1730, `700 92px Kalam`, '#8E1B1B');
    sparkleDoodle(ctx, 200, 1700, 40, '#E2952E');
    sparkleDoodle(ctx, 880, 1690, 32, '#E2952E');
    ctx.save();
    ctx.letterSpacing = '10px';
    txt(ctx, 'NAVRATRI DIARIES', 545, 1810, `600 28px ${SANS}`, '#B0642A');
    ctx.restore();
    grain(ctx, w, h, 0.07, 'multiply');
  },
};

/* 4 — Real diya bokeh, single hero photo */
const glow: Template = {
  id: 'a-diya-glow',
  name: 'Golden Diyas',
  pack: 'diwali',
  direction: 'royal-diwali',
  fonts: [`400 140px ${SCRIPT}`, `800 60px ${BALOO}`],
  art: ['diya-bokeh'],
  slots: [{ id: 'hero', x: 150, y: 300, w: 780, h: 1000, shape: 'rounded', radius: 36 }],
  drawBackground(ctx, w, h) {
    cover(ctx, 'diya-bokeh', 0, 0, w, h, 0.5, 0.5);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(20,8,2,0.75)');
    g.addColorStop(0.55, 'rgba(20,8,2,0.25)');
    g.addColorStop(1, 'rgba(20,8,2,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.shadowColor = 'rgba(255,170,60,0.7)';
    ctx.shadowBlur = 60;
    ctx.fillStyle = '#FFF3DC';
    ctx.beginPath();
    ctx.roundRect(136, 286, 808, 1028, 44);
    ctx.fill();
    ctx.restore();
  },
  drawForeground(ctx, w, h) {
    txt(ctx, 'Happy Diwali', 540, 220, `400 140px ${SCRIPT}`, '#FFD98A', 'center', ['rgba(255,150,40,0.8)', 24]);
    txt(ctx, 'शुभ दीपावली', 540, 1420, `800 64px ${BALOO}`, '#FFF1D6', 'center', ['rgba(0,0,0,0.6)', 16]);
    grain(ctx, w, h, 0.05);
  },
};

/* 5 — One diya in the dark, two polaroids */
const darkPol: Slot[] = [
  { id: 'a', x: 90, y: 1020, w: 420, h: 480, shape: 'rect', rotate: -6 },
  { id: 'b', x: 570, y: 990, w: 420, h: 480, shape: 'rect', rotate: 5 },
];
const dark: Template = {
  id: 'a-diya-dark',
  name: 'Ek Diya',
  pack: 'diwali',
  direction: 'minimal-pastel',
  fonts: [`italic 400 96px "Instrument Serif"`, `700 56px Kalam`],
  art: ['diya-dark'],
  slots: darkPol,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    cover(ctx, 'diya-dark', 0, -80, w, h, 0.5, 0.5);
    for (const s of darkPol) polaroid(ctx, s, 22, 110);
  },
  drawForeground(ctx, w, h) {
    txt(ctx, 'one diya,', 540, 170, `italic 400 96px "Instrument Serif"`, '#F5E2BF');
    txt(ctx, 'a thousand memories', 540, 270, `italic 400 96px "Instrument Serif"`, '#F5E2BF');
    txt(ctx, 'diwali ’26 ✨', 300, 1590, `700 46px Kalam`, '#3A2A1A', 'center', undefined, -6);
    txt(ctx, 'with my people', 780, 1555, `700 46px Kalam`, '#3A2A1A', 'center', undefined, 5);
    txt(ctx, 'शुभ दीपावली', 540, 1820, `700 56px Kalam`, '#E9B866');
    grain(ctx, w, h, 0.06);
  },
};

/* 6 — Paper-cut Durga scene over a photo strip */
const stripSlots: Slot[] = [
  { id: 's1', x: 50, y: 1010, w: 300, h: 420, shape: 'rect', rotate: -3 },
  { id: 's2', x: 390, y: 990, w: 300, h: 420, shape: 'rect' },
  { id: 's3', x: 730, y: 1010, w: 300, h: 420, shape: 'rect', rotate: 3 },
];
const papercut: Template = {
  id: 'a-papercut-durga',
  name: 'Paper Durga',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: [`400 120px ${SCRIPT}`, `800 70px ${BALOO}`],
  art: ['durga-papercut'],
  slots: stripSlots,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#0E3A3F';
    ctx.fillRect(0, 0, w, h);
    cover(ctx, 'durga-papercut', 0, 0, w, 1080, 0.5, 0.5);
    tornBand(ctx, w, 940, 1000, 'top', 11, '#0E3A3F');
    for (const s of stripSlots) frame(ctx, s, 14, 14, '#FFF7EA');
  },
  drawForeground(ctx, w, h) {
    txt(ctx, 'Navratri Vibes', 540, 1610, `400 130px ${SCRIPT}`, '#FFE2A8', 'center', ['rgba(0,0,0,0.4)', 12]);
    txt(ctx, 'शुभ नवरात्रि', 540, 1760, `800 76px ${BALOO}`, '#F7A6B6');
    for (let i = 0; i < 11; i++) marigold(ctx, 40 + i * 100, 1890, 34, i + 20);
    grain(ctx, w, h, 0.06);
  },
};

export default [eyes, ring, painting, papercut, glow, dark];
