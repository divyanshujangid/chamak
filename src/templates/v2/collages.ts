// Photo-first collage templates, modeled on the layouts the user shared from Pinterest.
// Layout ideas only; every pixel of art is drawn in code.
import '@fontsource/great-vibes/400.css';
import '@fontsource/baloo-2/800.css';
import '@fontsource/kalam/400.css';
import '@fontsource/kalam/700.css';
import '@fontsource/caveat/700.css';
import type { Slot, Template } from '../../engine/types';
import {
  bow, canopy, goldFlower, grain, lines, lotus, miniPlayer, pushpin, sparkleDoodle, stripCard, tornBand, txt, velvet,
} from './art';

const SCRIPT = '"Great Vibes", cursive';
const SANS = '"DM Sans Variable", system-ui, sans-serif';

function frameStroke(ctx: CanvasRenderingContext2D, s: Slot, color: string, lw: number) {
  ctx.save();
  if (s.rotate) {
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate((s.rotate * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.strokeRect(s.x, s.y, s.w, s.h);
  ctx.restore();
}

/* A — Navy Collage on the canopy (ref #2) */
const navyCollage: Template = {
  id: 'c-navy-canopy',
  name: 'Pandal Collage',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: [],
  slots: [
    { id: 'big', x: 80, y: 300, w: 400, h: 640, shape: 'rect' },
    { id: 'r1', x: 500, y: 300, w: 210, h: 300, shape: 'rect' },
    { id: 'r2', x: 500, y: 620, w: 210, h: 320, shape: 'rect' },
    { id: 'b1', x: 80, y: 960, w: 250, h: 330, shape: 'rect' },
    { id: 'b2', x: 350, y: 960, w: 360, h: 640, shape: 'rect' },
    { id: 'b3', x: 80, y: 1310, w: 250, h: 290, shape: 'rect' },
  ],
  drawBackground(ctx, w, h) {
    canopy(ctx, w, h, 840, 1080, 31, { burst: 0.8 });
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#0A0E3A';
    ctx.fillRect(55, 275, 680, 1350);
    ctx.restore();
  },
  drawForeground(ctx, w, h) {
    goldFlower(ctx, 740, 290, 78, 0.3);
    grain(ctx, w, h, 0.06);
  },
};

/* B — Pinned Polaroids on dark paper (ref #3) */
const pol: Slot[] = [
  { id: 'p1', x: 85, y: 790, w: 270, h: 250, shape: 'rect', rotate: -4 },
  { id: 'p2', x: 405, y: 760, w: 270, h: 250, shape: 'rect', rotate: 1.5 },
  { id: 'p3', x: 725, y: 795, w: 270, h: 250, shape: 'rect', rotate: 5 },
];
const pinned: Template = {
  id: 'c-pinned-polaroids',
  name: 'Pinned Memories',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [],
  slots: [
    { id: 'top', x: 0, y: 70, w: 1080, h: 760, shape: 'rect' },
    ...pol,
    { id: 'bl', x: 0, y: 1150, w: 532, h: 720, shape: 'rect' },
    { id: 'br', x: 548, y: 1150, w: 532, h: 720, shape: 'rect' },
  ],
  drawBackground(ctx, w, h) {
    velvet(ctx, 0, 0, w, h, '#1B1A19', '#4A4744', 5);
  },
  beforeSlot(ctx, id) {
    if (id === 'p1') {
      tornBand(ctx, 1080, 770, 70, 'top', 8, '#EDE8DD');
      tornBand(ctx, 1080, 1060, 70, 'bottom', 9, '#EDE8DD');
      for (const s of pol) {
        ctx.save();
        const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
        ctx.translate(cx, cy);
        ctx.rotate(((s.rotate ?? 0) * Math.PI) / 180);
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 10;
        ctx.fillStyle = '#FBFBF8';
        ctx.fillRect(-s.w / 2 - 18, -s.h / 2 - 18, s.w + 36, s.h + 80);
        ctx.restore();
      }
    }
  },
  drawForeground(ctx, w, h) {
    tornBand(ctx, w, 0, 90, 'bottom', 3);
    tornBand(ctx, w, 1840, 80, 'top', 4);
    ctx.fillStyle = '#F7F5F0';
    ctx.fillRect(532, 1150, 16, 720);
    for (const s of pol) pushpin(ctx, s.x + s.w / 2, s.y - 4, 19);
    bow(ctx, 120, 140, 90);
    grain(ctx, w, h, 0.07);
  },
};

/* C — Garba Look Book: diagonal film strip on the canopy (ref #4) */
const STRIP_ROT = 33;
const sc = { x: 700, y: 590 };
const fw = 270, fh = 225, gap = 22;
const stripSlots: Slot[] = [0, 1, 2, 3].map((i) => {
  const ly = (i - 1.5) * (fh + gap);
  const t = (STRIP_ROT * Math.PI) / 180;
  const cx = sc.x - ly * Math.sin(t), cy = sc.y + ly * Math.cos(t);
  return { id: `f${i}`, x: cx - fw / 2, y: cy - fh / 2, w: fw, h: fh, shape: 'rect', rotate: STRIP_ROT };
});
const lookBook: Template = {
  id: 'c-garba-lookbook',
  name: 'Garba Look Book',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: ['400 120px "Great Vibes"', '800 120px "Baloo 2"'],
  slots: [
    { id: 'hero', x: 330, y: 1060, w: 690, h: 800, shape: 'rect' },
    ...stripSlots,
  ],
  drawBackground(ctx, w, h) {
    canopy(ctx, w, h, 640, 980, 47, { burst: 1.2 });
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#FBFAF7';
    ctx.fillRect(310, 1040, 730, 840);
    ctx.restore();
    stripCard(ctx, sc.x, sc.y, fw + 40, 4 * (fh + gap) + 40, STRIP_ROT);
  },
  drawForeground(ctx, w, h) {
    txt(ctx, 'गरबा', 180, 470, '800 140px "Baloo 2"', '#FFC93C', 'center', ['rgba(0,0,0,0.65)', 18], -57);
    txt(ctx, 'Look Book', 330, 640, `400 124px ${SCRIPT}`, '#FFF6E2', 'center', ['rgba(0,0,0,0.65)', 14], -57);
    grain(ctx, w, h, 0.06);
  },
};

/* D — Dolled up for Garba: photo-booth strip, orange panel + canopy (ref #5) */
const dolled: Template = {
  id: 'c-dolled-up',
  name: 'Dolled Up',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: ['300 56px "DM Sans Variable"', '400 96px "Great Vibes"', '700 76px "Kalam"', '400 28px "Kalam"'],
  slots: [
    { id: 's1', x: 300, y: 250, w: 460, h: 420, shape: 'rect' },
    { id: 's2', x: 300, y: 690, w: 460, h: 420, shape: 'rect' },
    { id: 's3', x: 300, y: 1130, w: 460, h: 420, shape: 'rect' },
  ],
  drawBackground(ctx, w, h) {
    canopy(ctx, w, h, 980, 420, 59, { burst: 0.9 });
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#C2570F');
    g.addColorStop(1, '#A4460A');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 400, h);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = '#FBFAF7';
    ctx.fillRect(280, 230, 500, 1560);
    ctx.restore();
  },
  drawForeground(ctx, w, h) {
    txt(ctx, 'Dolled up', 450, 1650, `300 58px ${SANS}`, '#1E1A18');
    txt(ctx, 'for', 660, 1662, `400 96px ${SCRIPT}`, '#1E1A18');
    txt(ctx, 'गरबा', 470, 1745, '700 74px "Kalam"', '#B4530F');
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(70, 1020, 300, 150, 10);
    ctx.fill();
    ctx.restore();
    lines(ctx, ['ढोल की थाप पे,', 'आज बस गरबा ✨'], 220, 1082, 42, '400 30px "Kalam"', '#2A2421', 'center');
    grain(ctx, w, h, 0.05);
  },
};

/* E — Dandiya Night: white page, 8-photo masonry, Hindi headline (ref #7) */
const dandiyaNight: Template = {
  id: 'c-dandiya-night',
  name: 'Dandiya Night 2K26',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: ['800 112px "Baloo 2"'],
  slots: [
    { id: 'a', x: 110, y: 300, w: 480, h: 330, shape: 'rect' },
    { id: 'b', x: 80, y: 660, w: 490, h: 340, shape: 'rect' },
    { id: 'c', x: 600, y: 580, w: 390, h: 420, shape: 'rect' },
    { id: 'd', x: 110, y: 1030, w: 300, h: 360, shape: 'rect' },
    { id: 'e', x: 440, y: 1030, w: 330, h: 470, shape: 'rect' },
    { id: 'f', x: 800, y: 1030, w: 190, h: 440, shape: 'rect' },
    { id: 'g', x: 110, y: 1420, w: 300, h: 400, shape: 'rect' },
    { id: 'h', x: 440, y: 1530, w: 470, h: 300, shape: 'rect' },
  ],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 0.03, 'multiply');
  },
  drawForeground(ctx, w, h) {
    txt(ctx, 'डांडिया', 620, 420, '800 112px "Baloo 2"', '#C2185B', 'left', ['rgba(194,24,91,0.25)', 6]);
    txt(ctx, 'नाइट', 620, 535, '800 104px "Baloo 2"', '#F57C00', 'left', ['rgba(245,124,0,0.25)', 6]);
    ctx.save();
    ctx.font = '800 104px "Baloo 2"';
    const nw = ctx.measureText('नाइट').width;
    ctx.font = '800 70px "Baloo 2"';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#FFFFFF';
    ctx.fillStyle = '#2B1B1B';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 8;
    ctx.strokeText('2K26', 640 + nw, 530);
    ctx.fillText('2K26', 640 + nw, 530);
    ctx.restore();
    lotus(ctx, 1000, 400, 72, 0);
    sparkleDoodle(ctx, 70, 230, 34);
    sparkleDoodle(ctx, 60, 330, 20);
    sparkleDoodle(ctx, 1020, 1560, 22);
    sparkleDoodle(ctx, 1000, 1690, 44);
    for (const s of this.slots) frameStroke(ctx, s, 'rgba(0,0,0,0.06)', 2);
    void w; void h;
  },
};

/* F — Lyrics & Light: cream collage, music widget, Hindi lyric box (ref #8) */
const lyrics: Template = {
  id: 'c-lyrics-cream',
  name: 'Lyrics & Light',
  pack: 'diwali',
  direction: 'minimal-pastel',
  fonts: ['400 44px "Kalam"', '700 44px "Kalam"'],
  slots: [
    { id: 'a', x: 70, y: 90, w: 450, h: 660, shape: 'rect' },
    { id: 'b', x: 560, y: 90, w: 450, h: 600, shape: 'rect' },
    { id: 'c', x: 170, y: 700, w: 390, h: 540, shape: 'rect' },
    { id: 'd', x: 590, y: 720, w: 420, h: 640, shape: 'rect' },
    { id: 'e', x: 0, y: 1250, w: 620, h: 670, shape: 'rect' },
  ],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#EFE3CF';
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 0.06, 'multiply');
  },
  beforeSlot(ctx, id) {
    if (id === 'e') miniPlayer(ctx, 330, 600, 420, 'diye jale', 'with family · diwali 2026', 0.28);
  },
  drawForeground(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(196,112,108,0.9)';
    ctx.fillRect(650, 1420, 380, 360);
    ctx.restore();
    lines(ctx, ['दीयों की रौशनी में,', 'घर फिर से हँसता है,', 'तेरे साथ हर लम्हा', 'त्योहार सा लगता है'], 675, 1490, 72, '700 40px "Kalam"', '#4A0B10');
    lotus(ctx, 1010, 1440, 110, 0.5, ['#FFE3EA', '#C2185B']);
    lotus(ctx, 560, 1880, 120, -0.3, ['#FFE3EA', '#C2185B']);
    grain(ctx, w, h, 0.04);
  },
};

export default [navyCollage, lookBook, dolled, pinned, dandiyaNight, lyrics];
