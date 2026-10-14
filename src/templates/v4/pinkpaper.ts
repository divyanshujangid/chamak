// v4 "pinkpaper": faithful recreations of the owner's pink-newsprint / cream-lyric Pinterest pins.
// Art: public/art/ref/pp-*.webp (see public/art/ref/CREDITS-pinkpaper.md). Painted lotuses,
// a photographic stargazer lily and an old-newsprint background with a pink watercolour wash.
import '@fontsource/baloo-2/devanagari-700.css';
import '@fontsource/baloo-2/latin-700.css';
import type { Template } from '../../engine/types';
import { art } from '../../engine/assets';
import { cached, grain, rng, tornRect } from '../v2/art';

type Ctx = CanvasRenderingContext2D;
const SANS = '"DM Sans Variable", system-ui, sans-serif';
const BALOO = '"Baloo 2", system-ui, sans-serif';

const A = {
  news: 'ref/pp-newsprint',
  lotusBig: 'ref/pp-lotus-big', // watercolour, wide side view
  lotusSmall: 'ref/pp-lotus-small', // painted, yellow centre
  lotusStem: 'ref/pp-lotus-stem', // realistic with stem
  bud: 'ref/pp-lotus-bud',
  lily: 'ref/pp-lily',
};

/** Draw a raster cut-out centred at (cx, cy), `w` wide, rotated `rot` degrees. */
function put(ctx: Ctx, name: string, cx: number, cy: number, w: number, rot = 0, opts: { flip?: boolean; shadow?: number; alpha?: number } = {}) {
  const img = art(name);
  if (!img) return;
  const h = (w * img.height) / img.width;
  ctx.save();
  ctx.translate(cx, cy);
  if (rot) ctx.rotate((rot * Math.PI) / 180);
  if (opts.flip) ctx.scale(-1, 1);
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  const sh = opts.shadow ?? 0.22;
  if (sh) {
    ctx.shadowColor = `rgba(70,20,35,${sh})`;
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
  }
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/** The pink newsprint page (pre-baked art), optionally mirrored, with a cream fallback. */
function newsprint(ctx: Ctx, w: number, h: number, mirror = false, lift = 0) {
  ctx.fillStyle = '#EFE2D2';
  ctx.fillRect(0, 0, w, h);
  const img = art(A.news);
  if (img) {
    ctx.save();
    if (mirror) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();
  }
  if (lift) {
    ctx.fillStyle = `rgba(244,236,224,${lift})`;
    ctx.fillRect(0, 0, w, h);
  }
}

/** Faint drop shadow under each photo block so the photos sit on the paper. */
function slotShadows(ctx: Ctx, slots: Template['slots'], a = 0.16) {
  ctx.save();
  ctx.shadowColor = `rgba(60,25,30,${a})`;
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#F4ECE2';
  for (const s of slots) if (s.y + s.h < 1920) ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* 1. Pink newsprint: 6 square slots, pink lyric card, painted lotuses */
/* ------------------------------------------------------------------ */

/** Pink lyric-share card (streaming-app style, no logo). */
function lyricCard(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.shadowColor = 'rgba(90,20,40,0.28)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#D4516F');
  g.addColorStop(1, '#C8405F');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  // album art: a little painted lotus on deep rose
  const ax = x + 18, ay = y + 18, as = 58;
  ctx.fillStyle = '#5A1A2C';
  ctx.fillRect(ax, ay, as, as);
  const lot = art(A.lotusSmall);
  if (lot) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(ax, ay, as, as);
    ctx.clip();
    ctx.drawImage(lot, ax - 4, ay + 4, as + 8, ((as + 8) * lot.height) / lot.width);
    ctx.restore();
  }
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 19px ${SANS}`;
  ctx.fillText('Nau Raatein', ax + as + 14, ay + 22);
  ctx.font = `500 15px ${SANS}`;
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.fillText('garba mix', ax + as + 14, ay + 44);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 21px ${SANS}`;
  ctx.fillText('tere sang ghoomun', x + 18, y + 122);
  ctx.fillText('nau raatein, nau rang', x + 18, y + 150);
  // small footer mark (generic, not a brand)
  ctx.beginPath();
  ctx.arc(x + 28, y + h - 24, 9, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fill();
  ctx.strokeStyle = '#C8405F';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 23, y + h - 26);
  ctx.quadraticCurveTo(x + 28, y + h - 29, x + 33, y + h - 26);
  ctx.moveTo(x + 24, y + h - 22);
  ctx.quadraticCurveTo(x + 28, y + h - 24, x + 32, y + h - 22);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `700 14px ${SANS}`;
  ctx.fillText('lyrics', x + 44, y + h - 19);
  ctx.restore();
}

const newsSlots: Template['slots'] = [
  { id: 'a', x: 213, y: 411, w: 437, h: 455, shape: 'rect' },
  { id: 'b', x: 679, y: 259, w: 230, h: 238, shape: 'rect' },
  { id: 'c', x: 679, y: 528, w: 319, h: 328, shape: 'rect' },
  { id: 'd', x: 53, y: 883, w: 347, h: 351, shape: 'rect' },
  { id: 'e', x: 429, y: 883, w: 246, h: 250, shape: 'rect' },
  { id: 'f', x: 421, y: 1158, w: 298, h: 308, shape: 'rect' },
];

const pinkNewsprint: Template = {
  id: 'r4-pink-newsprint',
  name: 'Gulabi Akhbaar',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`700 21px ${SANS}`, `500 15px ${SANS}`],
  art: [A.news, A.lotusBig, A.lotusSmall],
  slots: newsSlots,
  drawBackground(ctx, w, h) {
    newsprint(ctx, w, h);
    slotShadows(ctx, newsSlots, 0.12);
  },
  drawForeground(ctx) {
    lyricCard(ctx, 706, 900, 244, 222);
    put(ctx, A.lotusSmall, 952, 1112, 118, 8);
    // big painted lotus hanging into the top-left corner
    put(ctx, A.lotusSmall, 190, 92, 690, 196, { shadow: 0.18 });
    // big watercolour lotus rising from the bottom-right corner
    put(ctx, A.lotusBig, 835, 1745, 740, -4, { shadow: 0.2 });
    put(ctx, A.lotusSmall, 585, 1880, 150, -6);
  },
};

/* ------------------------------------------------------------------ */
/* 2. Cream lyric: 5-photo offset collage, plum player, Devanagari block */
/* ------------------------------------------------------------------ */

const CREAM = '#EEDFCA';

function plumPlayer(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.shadowColor = 'rgba(40,10,20,0.35)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#5A2B3A');
  g.addColorStop(1, '#3A1A26');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  const k = w / 332;
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 19px ${SANS}`;
  ctx.fillText('Rang Laaga Re', 18, 36);
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.font = `500 14px ${SANS}`;
  ctx.fillText('Navratri Sessions, Vol. 2', 18, 57);
  // close + add icons
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(250, 26); ctx.lineTo(266, 42); ctx.moveTo(266, 26); ctx.lineTo(250, 42);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(301, 34, 11, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(301, 28); ctx.lineTo(301, 40); ctx.moveTo(295, 34); ctx.lineTo(307, 34); ctx.stroke();
  // progress
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(18, 92, 296, 3);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(18, 92, 60, 3);
  ctx.beginPath(); ctx.arc(78, 93.5, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `500 11px ${SANS}`;
  ctx.fillText('0:57', 18, 113);
  ctx.textAlign = 'right';
  ctx.fillText('4:21', 314, 113);
  ctx.textAlign = 'left';
  // controls
  const cy = 150;
  ctx.fillStyle = '#F2A7C0';
  sparkle(ctx, 30, cy, 9);
  ctx.fillStyle = '#FFFFFF';
  const tri = (x0: number, dir: number) => { ctx.beginPath(); ctx.moveTo(x0, cy - 9); ctx.lineTo(x0, cy + 9); ctx.lineTo(x0 + dir * 13, cy); ctx.closePath(); ctx.fill(); };
  ctx.fillRect(84, cy - 9, 3, 18); tri(100, -1);
  ctx.fillRect(244, cy - 9, 3, 18); tri(231, 1);
  ctx.beginPath(); ctx.arc(166, cy, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3A1A26';
  ctx.fillRect(159, cy - 8, 5, 16); ctx.fillRect(168, cy - 8, 5, 16);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(302, cy + 1, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(302, cy + 1); ctx.lineTo(302, cy - 4); ctx.moveTo(299, cy - 11); ctx.lineTo(305, cy - 11); ctx.stroke();
  ctx.restore();
}

function sparkle(ctx: Ctx, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x + s * 0.15, y - s * 0.15, x + s, y);
  ctx.quadraticCurveTo(x + s * 0.15, y + s * 0.15, x, y + s);
  ctx.quadraticCurveTo(x - s * 0.15, y + s * 0.15, x - s, y);
  ctx.quadraticCurveTo(x - s * 0.15, y - s * 0.15, x, y - s);
  ctx.fill();
}

// Original lines (not from any song): "Your laughter in the dhol's beat, nine nights spinning
// around you; every colour feels new, my heart has found its garba."
const LYRIC = ['ढोल की थाप पे', 'तेरी हँसी गूँजे,', 'नौ रातों में हम', 'तेरे संग घूमे,', 'हर रंग नया सा', 'दिल गरबा हुआ'];

const creamSlots: Template['slots'] = [
  { id: 'p1', x: 69, y: 78, w: 453, h: 605, shape: 'rect' },
  { id: 'p2', x: 574, y: 79, w: 415, h: 552, shape: 'rect' },
  { id: 'p3', x: 184, y: 668, w: 375, h: 528, shape: 'rect' },
  { id: 'p4', x: 602, y: 671, w: 427, h: 757, shape: 'rect' },
  { id: 'p5', x: 0, y: 1210, w: 572, h: 710, shape: 'rect' },
];

const creamLyric: Template = {
  id: 'r4-cream-lyric',
  name: 'Dil Garba Hua',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`700 40px ${BALOO}`, `700 19px ${SANS}`, `500 14px ${SANS}`],
  art: [A.lily],
  slots: creamSlots,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, w, h);
    const v = ctx.createRadialGradient(w / 2, h * 0.45, h * 0.2, w / 2, h * 0.5, h * 0.75);
    v.addColorStop(0, 'rgba(255,248,236,0.35)');
    v.addColorStop(1, 'rgba(196,160,128,0.18)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 0.06, 'multiply');
    slotShadows(ctx, creamSlots.slice(0, 4), 0.14);
  },
  drawForeground(ctx, w) {
    // the bottom photo melts into the cream at its top and right edges
    const s = creamSlots[4];
    ctx.save();
    let g = ctx.createLinearGradient(0, s.y, 0, s.y + 110);
    g.addColorStop(0, CREAM);
    g.addColorStop(1, 'rgba(238,223,202,0)');
    ctx.fillStyle = g;
    ctx.fillRect(s.x, s.y - 2, s.w + 2, 112);
    g = ctx.createLinearGradient(s.x + s.w, 0, s.x + s.w - 90, 0);
    g.addColorStop(0, CREAM);
    g.addColorStop(1, 'rgba(238,223,202,0)');
    ctx.fillStyle = g;
    ctx.fillRect(s.x + s.w - 90, s.y, 92, s.h);
    ctx.restore();

    plumPlayer(ctx, 411, 531, 332, 184);

    // dusty-rose lyric block
    const bx = 688, by = 1470, bw = 340, bh = 330;
    ctx.save();
    ctx.fillStyle = '#B5615F';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#3E0F17';
    ctx.font = `700 40px ${BALOO}`;
    LYRIC.forEach((row, i) => ctx.fillText(row, bx + 18, by + 62 + i * 46, bw - 30));
    ctx.restore();

    // pink stargazer lilies on the corners
    put(ctx, A.lily, w - 48, 1428, 300, -22, { shadow: 0.25 });
    put(ctx, A.lily, 560, 1830, 400, 8, { shadow: 0.25 });
  },
};

/* ------------------------------------------------------------------ */
/* 3. Pink newsprint, 3 big slots: hanging lotus, torn-paper player     */
/* ------------------------------------------------------------------ */

function tornPlayer(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const card = cached('pp-torn-player', w + 40, h + 40, (c) => {
    c.save();
    c.translate(20, 20);
    tornRect(c, 0, 0, w, h, 9, 17);
    c.shadowColor = 'rgba(60,30,30,0.3)';
    c.shadowBlur = 14;
    c.shadowOffsetY = 5;
    c.fillStyle = '#CDBFAC';
    c.fill();
    c.shadowColor = 'transparent';
    // fibrous speckle
    const r = rng(9);
    for (let i = 0; i < 500; i++) {
      c.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(90,70,50,0.10)';
      c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
    }
    c.restore();
  });
  ctx.drawImage(card, x - 20, y - 20);
  ctx.save();
  ctx.translate(x, y);
  const ink = '#4A3E36';
  ctx.fillStyle = 'rgba(74,62,54,0.35)';
  ctx.fillRect(56, 62, w - 90, 4);
  ctx.fillStyle = ink;
  ctx.fillRect(56, 62, (w - 90) * 0.34, 4);
  ctx.beginPath(); ctx.arc(56 + (w - 90) * 0.34, 64, 7, 0, Math.PI * 2); ctx.fill();
  const cy = 128, cx = 56 + (w - 90) / 2;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.stroke();
  ctx.fillRect(cx - 9, cy - 12, 6, 24); ctx.fillRect(cx + 3, cy - 12, 6, 24);
  const tri = (x0: number, dir: number) => { ctx.beginPath(); ctx.moveTo(x0, cy - 11); ctx.lineTo(x0, cy + 11); ctx.lineTo(x0 + dir * 15, cy); ctx.closePath(); ctx.fill(); };
  ctx.fillRect(cx - 92, cy - 11, 4, 22); tri(cx - 72, -1);
  ctx.fillRect(cx + 88, cy - 11, 4, 22); tri(cx + 72, 1);
  // shuffle + repeat marks
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx - 160, cy - 7); ctx.lineTo(cx - 140, cy - 7); ctx.moveTo(cx - 160, cy + 1); ctx.lineTo(cx - 140, cy + 1); ctx.moveTo(cx - 160, cy + 9); ctx.lineTo(cx - 146, cy + 9); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + 150, cy, 10, -0.3, Math.PI * 1.6); ctx.stroke();
  ctx.restore();
}

const news3Slots: Template['slots'] = [
  { id: 's1', x: 443, y: 77, w: 583, h: 442, shape: 'rect' },
  { id: 's2', x: 30, y: 691, w: 370, h: 509, shape: 'rect' },
  { id: 's3', x: 540, y: 970, w: 506, h: 672, shape: 'rect' },
];

const pinkNewsprint3: Template = {
  id: 'r4-pink-newsprint-3',
  name: 'Kamal Akhbaar',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`700 21px ${SANS}`],
  art: [A.news, A.lotusBig, A.lotusSmall, A.lotusStem, A.bud],
  slots: news3Slots,
  drawBackground(ctx, w, h) {
    newsprint(ctx, w, h, true, 0.28);
    slotShadows(ctx, news3Slots, 0.16);
  },
  drawForeground(ctx) {
    tornPlayer(ctx, 580, 646, 446, 190);
    put(ctx, A.lotusSmall, 520, 716, 250, -8);
    put(ctx, A.bud, 985, 300, 120, 18);
    put(ctx, A.bud, 925, 700, 104, -10, { flip: true });
    // translucent lotus hanging from the top-left corner, seen from below
    put(ctx, A.lotusStem, 215, 175, 640, 172, { shadow: 0.12, alpha: 0.92 });
    // lotuses on stems climbing the left margin
    put(ctx, A.lotusStem, 300, 1440, 360, 4);
    put(ctx, A.lotusStem, 140, 1745, 300, -12);
    // deep pink lotus in the bottom-right corner
    put(ctx, A.lotusBig, 960, 1825, 360, -10);
  },
};

const list: Template[] = [pinkNewsprint, creamLyric, pinkNewsprint3];
export default list;
