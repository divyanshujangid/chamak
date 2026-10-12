import '@fontsource/caveat/400.css';
import '@fontsource/caveat/700.css';
import '@fontsource/kalam/400.css';
import '@fontsource/kalam/700.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/rozha-one';
import '@fontsource/courier-prime/400.css';
import type { Template } from '../../engine/types';
import {
  blockPrintFrame, bokehNight, bulbString, canopy, diya, grain, lotus, marigold, musicCard, paper,
  polaroid, rotateAbout, tape, textPill, txt, velvet,
} from './art';

const SERIF = '"Instrument Serif", Georgia, serif';
const HAND = '"Caveat", cursive';
const HINDI_HAND = '"Kalam", cursive';

/* 1 — Garba Canopy: the trending pandal-ceiling story */
const garbaCanopy: Template = {
  id: 'v2-garba-canopy',
  name: 'Garba Canopy',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: ['italic 400 64px "Instrument Serif"', '400 60px "Kalam"', '700 40px "Kalam"'],
  slots: [{ id: 'main', x: 170, y: 420, w: 740, h: 1040, shape: 'rect' }],
  drawBackground(ctx, w, h) {
    canopy(ctx, w, h, 540, 940, 11);
  },
  drawForeground(ctx, w, h) {
    const s = this.slots[0];
    ctx.save();
    ctx.strokeStyle = '#FFF6E6';
    ctx.lineWidth = 10;
    ctx.strokeRect(s.x - 5, s.y - 5, s.w + 10, s.h + 10);
    ctx.restore();
    marigold(ctx, s.x + s.w - 10, s.y + 20, 62, 3);
    marigold(ctx, s.x + s.w + 60, s.y + 90, 44, 8, false);
    marigold(ctx, s.x + 10, s.y + s.h - 10, 54, 5);
    txt(ctx, 'called it a', 540, 250, `italic 400 70px ${SERIF}`, '#FFF6E6', 'center', ['rgba(0,0,0,0.7)', 18]);
    txt(ctx, 'गरबा नाइट ✨', 540, 340, `700 72px ${HINDI_HAND}`, '#FFD86B', 'center', ['rgba(0,0,0,0.7)', 18]);
    txt(ctx, 'navratri · 2026', 540, 1600, `italic 400 52px ${SERIF}`, '#FFF6E6', 'center', ['rgba(0,0,0,0.8)', 16]);
    grain(ctx, w, h, 0.06);
  },
};

/* 2 — Navratri Diaries: polaroid scrapbook with tape + handwriting */
const diaries: Template = {
  id: 'v2-navratri-diaries',
  name: 'Navratri Diaries',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: ['700 90px "Caveat"', '400 50px "Caveat"', '400 44px "Kalam"'],
  slots: [
    { id: 'a', x: 110, y: 200, w: 500, h: 560, shape: 'rect', rotate: -6 },
    { id: 'b', x: 470, y: 720, w: 500, h: 560, shape: 'rect', rotate: 5 },
    { id: 'c', x: 120, y: 1240, w: 480, h: 470, shape: 'rect', rotate: -3 },
  ],
  drawBackground(ctx, w, h) {
    bokehNight(ctx, w, h, 21, ['#2A0E10', '#120607'], ['rgba(255,190,90,A)', 'rgba(255,120,60,A)', 'rgba(255,230,170,A)', 'rgba(255,90,140,A)']);
    bulbString(ctx, -40, 60, 1120, 140, 120, 12, ['rgb(255,200,90)', 'rgb(255,90,90)', 'rgb(120,220,140)', 'rgb(110,170,255)', 'rgb(255,140,220)']);
    for (const s of this.slots) polaroid(ctx, s, 24, 120);
  },
  drawForeground(ctx, w, h) {
    const caps = ['garba night 🪩', 'dolled up ✿', 'with my people ♡'];
    this.slots.forEach((s, i) => {
      ctx.save();
      rotateAbout(ctx, s);
      txt(ctx, caps[i], s.x + s.w / 2, s.y + s.h + 82, `700 54px ${HAND}`, '#2B2320');
      ctx.restore();
    });
    tape(ctx, 360, 182, 210, -10, 'rgba(240,200,120,0.8)', 3);
    tape(ctx, 930, 720, 190, 24, 'rgba(250,170,190,0.78)', 7);
    tape(ctx, 140, 1250, 180, -38, 'rgba(170,215,190,0.8)', 9);
    txt(ctx, 'navratri', 820, 300, `700 104px ${HAND}`, '#FFF1DC', 'center', ['rgba(0,0,0,0.6)', 14], 7);
    txt(ctx, 'diaries ✨', 840, 390, `700 84px ${HAND}`, '#FFD86B', 'center', ['rgba(0,0,0,0.6)', 14], 7);
    txt(ctx, 'नौ रातें, नौ यादें', 820, 1560, `400 50px ${HINDI_HAND}`, '#FFF1DC', 'center', ['rgba(0,0,0,0.6)', 12], -4);
    marigold(ctx, 990, 1720, 70, 12);
    marigold(ctx, 900, 1790, 50, 13, false);
    marigold(ctx, 1010, 1860, 44, 14);
    grain(ctx, w, h, 0.07);
  },
};

/* 3 — Velvet Lotus: crimson velvet, block-print border, torn paper, painted lotus */
const velvetLotus: Template = {
  id: 'v2-velvet-lotus',
  name: 'Velvet & Lotus',
  pack: 'diwali',
  direction: 'royal-diwali',
  fonts: ['400 92px "Rozha One"', 'italic 400 48px "Instrument Serif"'],
  slots: [{ id: 'main', x: 190, y: 380, w: 700, h: 960, shape: 'rect' }],
  drawBackground(ctx, w, h) {
    velvet(ctx, 0, 0, w, h, '#3D0510', '#A3182F', 17);
    blockPrintFrame(ctx, w, h, 70, '#EFE1C4', '#9C3A1E', '#1F3A6B');
    const s = this.slots[0];
    paper(ctx, s.x - 26, s.y - 26, s.w + 52, s.h + 52, 4, '#F8F1E3');
  },
  drawForeground(ctx, w, h) {
    txt(ctx, 'Shubh Deepavali', 540, 270, `400 96px "Rozha One"`, '#F3D58A', 'center', ['rgba(0,0,0,0.5)', 16]);
    txt(ctx, 'light, love & a little mithai', 540, 1450, `italic 400 50px ${SERIF}`, '#F8E9D0', 'center', ['rgba(0,0,0,0.5)', 10]);
    lotus(ctx, 880, 1640, 230, -0.12);
    lotus(ctx, 730, 1690, 150, 0.15, ['#FFF0F3', '#D94A73']);
    lotus(ctx, 200, 1690, 170, 0.1);
    diya(ctx, 470, 1780, 90);
    diya(ctx, 580, 1790, 70);
    grain(ctx, w, h, 0.06);
  },
};

/* 4 — Flash Mono: B&W flash photo + colour fairy lights + IG text pills */
const flashMono: Template = {
  id: 'v2-flash-mono',
  name: 'Raas Era (B&W)',
  pack: 'navratri',
  direction: 'y2k-chrome',
  fonts: ['700 52px "DM Sans Variable"', '400 40px "Courier Prime"'],
  slots: [{ id: 'main', x: 0, y: 0, w: 1080, h: 1920, shape: 'rect', mono: true }],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);
  },
  drawForeground(ctx, w, h) {
    const v = ctx.createRadialGradient(540, 900, 500, 540, 900, 1250);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    const top = ctx.createLinearGradient(0, 0, 0, 380);
    top.addColorStop(0, 'rgba(0,0,0,0.55)');
    top.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, w, 380);
    bulbString(ctx, -40, 40, 1120, 60, 140, 11, ['rgb(255,190,80)', 'rgb(255,80,80)', 'rgb(90,220,130)', 'rgb(90,160,255)']);
    textPill(ctx, 'in my raas garba era 🪩', 540, 1560, '700 50px "DM Sans Variable", sans-serif', 50, '#111', '#FFFFFF');
    textPill(ctx, 'navratri ’26', 540, 1660, '700 40px "DM Sans Variable", sans-serif', 40, '#FFFFFF', 'rgba(0,0,0,0.65)');
    txt(ctx, '◉ 10.10.26  21:47', 70, 1850, `400 38px "Courier Prime"`, '#FF9F2E', 'left', ['rgba(255,140,40,0.8)', 10]);
    grain(ctx, w, h, 0.16);
  },
};

/* 5 — Now Playing: full photo + music card with second photo as album art */
const nowPlaying: Template = {
  id: 'v2-now-playing',
  name: 'Now Playing',
  pack: 'diwali',
  direction: 'y2k-chrome',
  fonts: ['700 44px "DM Sans Variable"', 'italic 400 64px "Instrument Serif"'],
  slots: [
    { id: 'main', x: 0, y: 0, w: 1080, h: 1920, shape: 'rect' },
    { id: 'art', x: 110, y: 1500, w: 190, h: 190, shape: 'rounded', radius: 18 },
  ],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);
  },
  beforeSlot(ctx, slotId) {
    if (slotId !== 'art') return;
    const fade = ctx.createLinearGradient(0, 1200, 0, 1920);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 1200, 1080, 720);
    musicCard(ctx, 70, 1460, 940, 270, 'diwali nights', 'on repeat · with fam', 0.36, this.slots[1]);
  },
  drawForeground(ctx, w, h) {
    txt(ctx, 'this diwali ✨', 540, 1360, `italic 400 92px ${SERIF}`, '#FFFFFF', 'center', ['rgba(0,0,0,0.6)', 20]);
    txt(ctx, '◉ 08.11.26', 70, 120, `400 40px "Courier Prime"`, '#FF9F2E', 'left', ['rgba(255,140,40,0.8)', 10]);
    grain(ctx, w, h, 0.08);
  },
};

/* 6 — Cream Diya: soft cream silk, kolam dots, real-glow diyas (minimal) */
const creamDiya: Template = {
  id: 'v2-cream-diya',
  name: 'Cream & Diya',
  pack: 'diwali',
  direction: 'minimal-pastel',
  fonts: ['italic 400 120px "Instrument Serif"', '400 40px "Instrument Serif"'],
  slots: [{ id: 'main', x: 160, y: 300, w: 760, h: 1080, shape: 'arch' }],
  drawBackground(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#FBF4E6');
    g.addColorStop(0.5, '#F3E6CC');
    g.addColorStop(1, '#EAD7B5');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // silk sheen
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    for (const [x, a] of [[200, 0.5], [620, 0.35], [940, 0.4]] as const) {
      const sh = ctx.createLinearGradient(x - 160, 0, x + 160, 0);
      sh.addColorStop(0, 'rgba(255,255,255,0)');
      sh.addColorStop(0.5, `rgba(255,255,255,${a})`);
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sh;
      ctx.save();
      ctx.translate(x, 0);
      ctx.rotate(0.25);
      ctx.fillRect(-200, -200, 400, h + 400);
      ctx.restore();
    }
    ctx.restore();
    // kolam dot rows
    ctx.fillStyle = '#B3262E';
    for (const y0 of [110, 1830]) {
      for (let i = 0; i < 17; i++) {
        const x = 60 + i * 60;
        ctx.beginPath(); ctx.arc(x, y0, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 30, y0 + (y0 < 900 ? 30 : -30), 4, 0, Math.PI * 2); ctx.fill();
      }
    }
    const s = this.slots[0];
    ctx.save();
    ctx.shadowColor = 'rgba(90,50,10,0.35)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    const r = (s.w + 40) / 2;
    ctx.moveTo(s.x - 20, s.y + s.h + 20);
    ctx.lineTo(s.x - 20, s.y - 20 + r);
    ctx.arc(s.x - 20 + r, s.y - 20 + r, r, Math.PI, 0);
    ctx.lineTo(s.x + s.w + 20, s.y + s.h + 20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },
  drawForeground(ctx, w, h) {
    txt(ctx, 'happy diwali', 540, 1540, `italic 400 128px ${SERIF}`, '#7A1E1E');
    txt(ctx, 'FROM OUR HOME TO YOURS', 540, 1620, `400 34px ${SERIF}`, '#9C6A3A', 'center');
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.restore();
    diya(ctx, 380, 1770, 85);
    diya(ctx, 540, 1785, 105);
    diya(ctx, 700, 1770, 85);
    marigold(ctx, 170, 1450, 40, 21);
    marigold(ctx, 120, 1520, 30, 22, false);
    marigold(ctx, 930, 1440, 36, 23);
    grain(ctx, w, h, 0.05, 'multiply');
  },
};

export default [garbaCanopy, diaries, velvetLotus, flashMono, nowPlaying, creamDiya];
