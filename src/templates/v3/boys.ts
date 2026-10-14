// v3 boys set: masculine, no florals, no pink. Built from research section 3 (B1-B4) and T8.
// Everything is drawn in code; patterns and metal frames are cached offscreen.
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/600.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/anton/400.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/cinzel/500.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import type { Slot, Template } from '../../engine/types';
import { cached, grain, rng, rotateAbout, txt, velvet } from '../v2/art';

type Ctx = CanvasRenderingContext2D;

const INTER = '"Inter Tight", system-ui, sans-serif';
const ANTON = '"Anton", Impact, sans-serif';
const PLEX = '"IBM Plex Mono", ui-monospace, monospace';
const SPACE = '"Space Mono", ui-monospace, monospace';
const CINZEL = '"Cinzel", serif';

/* ---------- date helpers (Sharad Navratri 2026 starts Sun 11 Oct) ---------- */
function today() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function navNight() {
  const n = Math.floor((today().getTime() - new Date(2026, 9, 11).getTime()) / 86400000) + 1;
  return Math.min(9, Math.max(1, n));
}
const pad2 = (n: number) => String(n).padStart(2, '0');
function dateStr() {
  const d = today();
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${pad2(d.getFullYear() % 100)}`;
}
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

/** Letter-spaced text (Chrome supports ctx.letterSpacing). */
function spaced(ctx: Ctx, s: string, x: number, y: number, font: string, fill: string, ls: number, align: CanvasTextAlign = 'center') {
  ctx.save();
  ctx.font = font;
  (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${ls}px`;
  ctx.textAlign = align;
  ctx.fillStyle = fill;
  // letterSpacing adds trailing space after the last glyph; nudge centred text back
  const nudge = align === 'center' ? ls / 2 : align === 'right' ? ls : 0;
  ctx.fillText(s, x + nudge, y);
  ctx.restore();
}

/** Heavier, larger film grain than the shared tile. */
function heavyGrain(ctx: Ctx, x: number, y: number, w: number, h: number, alpha: number, mode: GlobalCompositeOperation = 'overlay') {
  const tile = cached('boys-grain', 420, 420, (c) => {
    const img = c.createImageData(420, 420);
    const r = rng(1234);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (r() + r() + r() - 1.5) * 150;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.max(0, Math.min(255, v));
      img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = mode;
  ctx.fillStyle = ctx.createPattern(tile, 'repeat')!;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/* =====================================================================
   1. FIT SORTED >>  (B1: 2x2 fit-check lookbook, black letterbox)
   ===================================================================== */
const CELL_W = 538;
const CELL_H = 717; // 3:4
const GRID_Y = Math.round((1920 - (CELL_H * 2 + 4)) / 2);
const fitSlots: Slot[] = [
  { id: 'a', x: 0, y: GRID_Y, w: CELL_W, h: CELL_H, shape: 'rect' },
  { id: 'b', x: CELL_W + 4, y: GRID_Y, w: CELL_W, h: CELL_H, shape: 'rect' },
  { id: 'c', x: 0, y: GRID_Y + CELL_H + 4, w: CELL_W, h: CELL_H, shape: 'rect' },
  { id: 'd', x: CELL_W + 4, y: GRID_Y + CELL_H + 4, w: CELL_W, h: CELL_H, shape: 'rect' },
];

/** Instagram-style product tag: dark bubble with a pointer at (x, y). */
function itemTag(ctx: Ctx, label: string, x: number, y: number, up = true) {
  ctx.save();
  ctx.font = `600 27px ${INTER}`;
  const tw = ctx.measureText(label).width;
  const w = tw + 40, h = 50, gap = 12;
  const top = up ? y + gap : y - gap - h;
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(16,16,16,0.82)';
  ctx.beginPath();
  ctx.roundRect(x - w / 2, top, w, h, 10);
  ctx.moveTo(x - 11, up ? top : top + h);
  ctx.lineTo(x, y);
  ctx.lineTo(x + 11, up ? top : top + h);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, top + h / 2 + 1);
  ctx.restore();
}

const fitSorted: Template = {
  id: 'n3-fit-sorted',
  name: 'Fit Sorted >>',
  pack: 'navratri',
  direction: 'y2k-chrome',
  fonts: [`700 48px "Inter Tight"`, `600 27px "Inter Tight"`, `500 28px "Inter Tight"`, `400 24px "Space Mono"`],
  slots: fitSlots,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
  },
  drawForeground(ctx, w, h) {
    // a hair of grain over the grid so it reads as one shot-on-phone post
    heavyGrain(ctx, 0, GRID_Y, w, CELL_H * 2 + 4, 0.06, 'overlay');
    // letterbox bars, crisp
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, GRID_Y);
    ctx.fillRect(0, h - GRID_Y, w, GRID_Y);

    // top bar: quiet metadata
    const ty = GRID_Y - 44;
    txt(ctx, `garba fit — night ${pad2(navNight())}`, 44, ty, `500 28px ${INTER}`, 'rgba(255,255,255,0.88)', 'left');
    txt(ctx, dateStr(), w - 44, ty, `400 24px ${SPACE}`, 'rgba(255,255,255,0.55)', 'right');
    // bottom bar
    const by = h - GRID_Y + 70;
    txt(ctx, 'rate the fit 1–10', 44, by, `500 28px ${INTER}`, 'rgba(255,255,255,0.88)', 'left');
    txt(ctx, '01 / 04', w - 44, by, `400 24px ${SPACE}`, 'rgba(255,255,255,0.55)', 'right');

    // item tags
    const [a, b, c, d] = fitSlots;
    itemTag(ctx, 'kurta', a.x + a.w * 0.5, a.y + a.h * 0.56);
    itemTag(ctx, 'dupatta', b.x + b.w * 0.58, b.y + b.h * 0.48);
    itemTag(ctx, 'juttis', c.x + c.w * 0.44, c.y + c.h * 0.88, false);
    itemTag(ctx, 'watch', d.x + d.w * 0.4, d.y + d.h * 0.62);

    // the red tag on the centre seam
    ctx.save();
    ctx.translate(w / 2, GRID_Y + CELL_H + 2);
    ctx.rotate((-2.5 * Math.PI) / 180);
    ctx.font = `700 48px ${INTER}`;
    const label = 'fit sorted>>';
    const tw = ctx.measureText(label).width;
    const pw = tw + 48, ph = 74;
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#C0392B';
    ctx.beginPath();
    ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 4);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 3);
    ctx.restore();
  },
};

/* =====================================================================
   2. GARBA NIGHT KING  (B2: hero + procedural Ajrakh band)
   ===================================================================== */
const INDIGO = '#1E2A4A';
const MADDER = '#9E2B25';
const AJ_BLACK = '#111111';
const CREAM = '#E9DFC9';

function circle(c: Ctx, x: number, y: number, r: number, fill: string) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
}

function starPath(c: Ctx, x: number, y: number, R: number, r: number, n = 8, rot = 0) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n;
    const rr = i % 2 ? r : R;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
}

/** One Ajrakh repeat: 8-point star field, corner rosettes forming a lattice. */
function ajrakhTile() {
  const T = 120, m = T / 2;
  return cached('aj-tile', T, T, (c) => {
    c.fillStyle = MADDER;
    c.fillRect(0, 0, T, T);
    // lattice dot-lines between rosettes (drawn on both edges so they wrap)
    for (let i = 0; i <= T; i += 10) {
      for (const [x, y] of [[i, 0], [i, T], [0, i], [T, i]]) {
        if (Math.min(i, T - i) < 30) continue;
        circle(c, x, y, 2.6, CREAM);
      }
    }
    // diagonal black lattice connecting star tips to rosettes
    c.strokeStyle = AJ_BLACK;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 0); c.lineTo(T, T);
    c.moveTo(T, 0); c.lineTo(0, T);
    c.stroke();
    // corner rosettes (quarters meet across tiles)
    for (const [x, y] of [[0, 0], [T, 0], [0, T], [T, T]]) {
      circle(c, x, y, 27, AJ_BLACK);
      circle(c, x, y, 22, INDIGO);
      starPath(c, x, y, 17, 8, 6, Math.PI / 6);
      c.fillStyle = CREAM;
      c.fill();
      circle(c, x, y, 5, MADDER);
    }
    // edge-mid diamonds (lattice joints)
    for (const [x, y] of [[m, 0], [m, T], [0, m], [T, m]]) {
      c.beginPath();
      c.moveTo(x, y - 11); c.lineTo(x + 11, y); c.lineTo(x, y + 11); c.lineTo(x - 11, y); c.closePath();
      c.fillStyle = AJ_BLACK; c.fill();
      c.beginPath();
      c.moveTo(x, y - 5); c.lineTo(x + 5, y); c.lineTo(x, y + 5); c.lineTo(x - 5, y); c.closePath();
      c.fillStyle = CREAM; c.fill();
    }
    // central 8-point star
    starPath(c, m, m, 40, 26, 8, -Math.PI / 2);
    c.fillStyle = AJ_BLACK; c.fill();
    starPath(c, m, m, 35, 22, 8, -Math.PI / 2);
    c.fillStyle = INDIGO; c.fill();
    starPath(c, m, m, 26, 16, 8, -Math.PI / 2 + Math.PI / 8);
    c.strokeStyle = CREAM; c.lineWidth = 2.5; c.stroke();
    circle(c, m, m, 11, AJ_BLACK);
    circle(c, m, m, 8, MADDER);
    circle(c, m, m, 3, CREAM);
    // resist dots inside the star points
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 4;
      circle(c, m + Math.cos(a) * 30, m + Math.sin(a) * 30, 2.4, CREAM);
    }
  });
}

/** Full Ajrakh border band: dotted black stripes, indigo chevron stripes, star field. Cached per size. */
function ajrakhBand(ctx: Ctx, x: number, y: number, w: number, h: number, seed = 3) {
  const tex = cached(`aj-band-${w}-${h}-${seed}`, w, h, (c) => {
    const tile = ajrakhTile();
    const S1 = 20, S2 = 6, S3 = 26; // black dot stripe, madder rule, indigo stripe
    const stripe = S1 + S2 + S3;
    const fieldY = stripe, fieldH = h - stripe * 2;
    c.fillStyle = AJ_BLACK;
    c.fillRect(0, 0, w, h);
    // field
    const reps = Math.max(1, Math.round(fieldH / 120));
    const k = fieldH / (120 * reps);
    const pat = c.createPattern(tile, 'repeat')!;
    pat.setTransform(new DOMMatrix([k, 0, 0, k, (w / 2) % (120 * k) - 60 * k, fieldY]));
    c.fillStyle = pat;
    c.fillRect(0, fieldY, w, fieldH);
    // stripes (mirrored top and bottom)
    for (const flip of [false, true]) {
      const yy = (o: number, hh: number) => (flip ? h - o - hh : o);
      c.fillStyle = AJ_BLACK;
      c.fillRect(0, yy(0, S1), w, S1);
      for (let i = 6; i < w; i += 13) circle(c, i, yy(0, S1) + S1 / 2, 3, CREAM);
      c.fillStyle = MADDER;
      c.fillRect(0, yy(S1, S2), w, S2);
      c.fillStyle = INDIGO;
      c.fillRect(0, yy(S1 + S2, S3), w, S3);
      const sy = yy(S1 + S2, S3);
      for (let i = 0; i < w; i += 26) {
        c.beginPath();
        c.moveTo(i, sy + 6); c.lineTo(i + 13, sy + S3 - 6); c.lineTo(i + 26, sy + 6);
        c.strokeStyle = CREAM; c.lineWidth = 2.5; c.stroke();
        circle(c, i + 13, sy + 7, 2.2, MADDER);
      }
      c.fillStyle = AJ_BLACK;
      c.fillRect(0, yy(stripe - 3, 3), w, 3);
    }
    // block-print imperfection: uneven ink + tiny resist flecks
    const r = rng(seed * 77);
    c.save();
    c.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 70; i++) {
      const gx = r() * w, gy = r() * h, gr = 40 + r() * 140;
      const g = c.createRadialGradient(gx, gy, 0, gx, gy, gr);
      g.addColorStop(0, `rgba(60,40,30,${0.12 + r() * 0.14})`);
      g.addColorStop(1, 'rgba(60,40,30,0)');
      c.fillStyle = g;
      c.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
    }
    c.restore();
    c.fillStyle = 'rgba(233,223,201,0.18)';
    for (let i = 0; i < (w * h) / 900; i++) c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
    heavyGrain(c, 0, 0, w, h, 0.12, 'overlay');
  });
  ctx.drawImage(tex, x, y, w, h);
}

/** A single dandiya stick along +x, centred at 0, length L. */
function dandiya(ctx: Ctx, L: number, t: number) {
  const wood = ctx.createLinearGradient(0, -t / 2, 0, t / 2);
  wood.addColorStop(0, '#F3EAD6');
  wood.addColorStop(0.5, '#D9C59A');
  wood.addColorStop(1, '#A88D5E');
  ctx.beginPath();
  ctx.roundRect(-L / 2, -t / 2, L, t, t / 2);
  ctx.fillStyle = wood;
  ctx.fill();
  // wrapped bands
  const bands: [number, number, string][] = [
    [-0.46, 0.05, MADDER], [-0.38, 0.03, INDIGO], [-0.31, 0.02, MADDER],
    [0.29, 0.02, MADDER], [0.34, 0.03, INDIGO], [0.41, 0.05, MADDER],
    [-0.02, 0.04, AJ_BLACK],
  ];
  ctx.save();
  ctx.clip();
  for (const [p, wd, col] of bands) {
    ctx.fillStyle = col;
    ctx.fillRect(p * L, -t, wd * L, t * 2);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-L / 2, -t / 2 + 2, L, t * 0.18);
  ctx.restore();
  // tassel bells at the ends
  for (const s of [-1, 1]) {
    circle(ctx, s * (L / 2 + 5), 0, t * 0.42, '#C8A96A');
    circle(ctx, s * (L / 2 + 5) - 2, -2, t * 0.14, '#F5E6B8');
  }
}

/** Round badge with ring text and two crossed dandiya sticks. */
function dandiyaMonogram(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  circle(ctx, 0, 0, r, AJ_BLACK);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r - 8, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = MADDER;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.66, 0, Math.PI * 2); ctx.stroke();
  // ring text
  const ring = 'GARBA · NIGHT · KING · MMXXVI · ';
  ctx.font = `700 ${Math.round(r * 0.15)}px ${SPACE}`;
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rr = r * 0.82;
  for (let i = 0; i < ring.length; i++) {
    const a = -Math.PI / 2 + (i / ring.length) * Math.PI * 2;
    ctx.save();
    ctx.translate(Math.cos(a) * rr, Math.sin(a) * rr);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(ring[i], 0, 0);
    ctx.restore();
  }
  // crossed sticks
  for (const a of [-45, 45]) {
    ctx.save();
    ctx.rotate((a * Math.PI) / 180);
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 8;
    dandiya(ctx, r * 1.08, r * 0.12);
    ctx.restore();
  }
  ctx.restore();
}

const KING_HERO: Slot = { id: 'hero', x: 70, y: 232, w: 940, h: 1150, shape: 'rect' };
const KING_BAND_Y = 1446;
const garbaKing: Template = {
  id: 'n3-garba-king',
  name: 'Garba Night King',
  pack: 'navratri',
  direction: 'royal-diwali',
  fonts: [`400 160px "Anton"`, `700 34px "Space Mono"`, `400 26px "Space Mono"`],
  slots: [KING_HERO],
  drawBackground(ctx, w, h) {
    velvet(ctx, 0, 0, w, h, '#0B0B0C', '#232120', 13);
    ajrakhBand(ctx, 0, 0, w, 166, 5);
    ajrakhBand(ctx, 0, KING_BAND_Y, w, h - KING_BAND_Y, 3);
  },
  drawForeground(ctx, w, h) {
    const s = KING_HERO;
    // soft bottom burn on the photo so it sits into the band
    ctx.save();
    const g = ctx.createLinearGradient(0, s.y + s.h - 260, 0, s.y + s.h);
    g.addColorStop(0, 'rgba(10,10,10,0)');
    g.addColorStop(1, 'rgba(10,10,10,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(s.x, s.y + s.h - 260, s.w, 260);
    ctx.restore();
    // cream keyline
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 3;
    ctx.strokeRect(s.x - 16, s.y - 16, s.w + 32, s.h + 32);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(233,223,201,0.5)';
    ctx.strokeRect(s.x - 24, s.y - 24, s.w + 48, s.h + 48);

    // title plate on the band
    const px = 150, py = KING_BAND_Y + 96, pw = w - 300, ph = h - KING_BAND_Y - 192;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = AJ_BLACK;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 12, py + 12, pw - 24, ph - 24);
    ctx.strokeStyle = MADDER;
    ctx.strokeRect(px + 19, py + 19, pw - 38, ph - 38);

    ctx.save();
    ctx.font = `400 172px ${ANTON}`;
    const tw = ctx.measureText('GARBA NIGHT').width;
    const fs = Math.min(172, (172 * (pw - 90)) / tw);
    ctx.restore();
    spaced(ctx, 'GARBA NIGHT', w / 2, py + ph * 0.56, `400 ${Math.round(fs)}px ${ANTON}`, CREAM, 2);
    spaced(ctx, `NIGHT ${pad2(navNight())}  ·  ${dateStr()}`, w / 2, py + ph * 0.56 + 58, `700 28px ${SPACE}`, '#C9B48A', 6);

    dandiyaMonogram(ctx, s.x + s.w - 80, s.y + s.h - 40, 112);
    grain(ctx, w, h, 0.05);
  },
};

/* =====================================================================
   3. NO FACE, JUST FIT  (B4: faceless editorial, grain + fade)
   ===================================================================== */
const WARM_BLACK = '#121110';
const BONE = '#E8E2D6';
const BANDHANI = '#B5121B';
const NF_PHOTO: Slot = { id: 'fit', x: 86, y: 118, w: 908, h: 1412, shape: 'rect' };

/** A fabric swatch chip printed with Bandhani tie-dot clusters. */
function bandhaniChip(ctx: Ctx, x: number, y: number, s: number, rot: number) {
  const tex = cached(`bandhani-${s}`, s, s, (c) => {
    c.fillStyle = BANDHANI;
    c.fillRect(0, 0, s, s);
    const r = rng(9);
    const step = s / 6;
    for (let gy = 0; gy < 7; gy++) {
      for (let gx = 0; gx < 7; gx++) {
        const cx = gx * step + (gy % 2 ? step / 2 : 0), cy = gy * step;
        // 4-dot cluster around a centre dot, slightly irregular like real tie-dye
        for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const rr = (dx || dy ? 2.4 : 3.2) + r() * 0.9;
          circle(c, cx + dx * 6 + (r() - 0.5) * 1.5, cy + dy * 6 + (r() - 0.5) * 1.5, rr, dx || dy ? '#F1E6CF' : '#F3C54A');
        }
      }
    }
    heavyGrain(c, 0, 0, s, s, 0.2, 'overlay');
  });
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.drawImage(tex, -s / 2, -s / 2);
  ctx.restore();
}

const noFace: Template = {
  id: 'n3-no-face',
  name: 'No Face, Just Fit',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`400 220px "Anton"`, `400 26px "IBM Plex Mono"`, `500 24px "IBM Plex Mono"`],
  slots: [NF_PHOTO],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = WARM_BLACK;
    ctx.fillRect(0, 0, w, h);
    velvet(ctx, 0, 0, w, h, '#100F0E', '#1E1B18', 21);
  },
  drawForeground(ctx, _w, h) {
    const s = NF_PHOTO;
    // film treatment, only on the photo
    ctx.save();
    ctx.beginPath();
    ctx.rect(s.x, s.y, s.w, s.h);
    ctx.clip();
    ctx.globalAlpha = 0.5;
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = '#808080';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'lighten';
    ctx.fillStyle = '#2E2720'; // lifted, warm blacks
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#F2E8D8';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.globalCompositeOperation = 'screen';
    const leak = ctx.createRadialGradient(s.x + s.w, s.y + 80, 0, s.x + s.w, s.y + 80, 520);
    leak.addColorStop(0, 'rgba(181,18,27,0.38)');
    leak.addColorStop(1, 'rgba(181,18,27,0)');
    ctx.fillStyle = leak;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.globalCompositeOperation = 'source-over';
    const vg = ctx.createRadialGradient(s.x + s.w / 2, s.y + s.h * 0.42, s.w * 0.35, s.x + s.w / 2, s.y + s.h * 0.5, s.h * 0.78);
    vg.addColorStop(0, 'rgba(18,17,16,0)');
    vg.addColorStop(1, 'rgba(18,17,16,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    const bot = ctx.createLinearGradient(0, s.y + s.h - 340, 0, s.y + s.h);
    bot.addColorStop(0, 'rgba(18,17,16,0)');
    bot.addColorStop(1, 'rgba(18,17,16,0.85)');
    ctx.fillStyle = bot;
    ctx.fillRect(s.x, s.y + s.h - 340, s.w, 340);
    heavyGrain(ctx, s.x, s.y, s.w, s.h, 0.32, 'overlay');
    heavyGrain(ctx, s.x, s.y, s.w, s.h, 0.08, 'screen');
    ctx.restore();

    // header row
    txt(ctx, 'GARBA CORE — ISSUE 04', s.x, 80, `500 24px ${PLEX}`, 'rgba(232,226,214,0.75)', 'left');
    txt(ctx, dateStr(), s.x + s.w, 80, `500 24px ${PLEX}`, 'rgba(232,226,214,0.75)', 'right');

    // big condensed type
    const L = s.x - 6;
    ctx.save();
    ctx.font = `400 300px ${ANTON}`;
    const asc300 = ctx.measureText('NO FACE').actualBoundingBoxAscent;
    // fit width, and fit height: bottom of line 2 must clear the caption
    const byH = (300 * (h - 110 - s.y - s.h - 22)) / (asc300 * 1.36);
    const size = Math.min(byH, (300 * s.w * 0.98) / ctx.measureText('JUST FIT').width);
    ctx.font = `400 ${size}px ${ANTON}`;
    const asc = ctx.measureText('NO FACE').actualBoundingBoxAscent;
    const b1 = s.y + s.h + asc * 0.36;
    const b2 = b1 + asc + 22;
    ctx.fillStyle = BONE;
    ctx.textAlign = 'left';
    ctx.fillText('NO FACE', L, b1);
    const wNo = ctx.measureText('NO FACE ').width;
    ctx.fillStyle = BANDHANI;
    ctx.fillText('/', L + wNo, b1);
    ctx.fillStyle = BONE;
    ctx.fillText('JUST FIT', L, b2);
    ctx.restore();

    // caption
    txt(ctx, 'Fig. 01 — kurta, dupatta, attitude', s.x, h - 44, `400 26px ${PLEX}`, BONE, 'left');
    txt(ctx, `N°${pad2(navNight())}/09`, s.x + s.w, h - 44, `500 24px ${PLEX}`, BANDHANI, 'right');

    bandhaniChip(ctx, s.x + s.w - 56, s.y + 60, 132, 6);
    // tiny swatch label on the chip edge
    txt(ctx, 'BANDHANI', s.x + s.w - 56, s.y + 160, `500 18px ${PLEX}`, 'rgba(232,226,214,0.85)', 'center', ['rgba(0,0,0,0.8)', 8], 6);
  },
};

/* =====================================================================
   4. SILVER NOIR  (T8 / B3: oxidised silver frames on indigo carpet)
   ===================================================================== */
const SILVER_STOPS: [number, string][] = [
  [0, '#5A5D63'], [0.16, '#DADCE0'], [0.3, '#7B7E85'], [0.46, '#C9CCD1'],
  [0.6, '#666970'], [0.78, '#E6E8EB'], [1, '#55585E'],
];
function metal(c: Ctx, x0: number, y0: number, x1: number, y1: number, stops = SILVER_STOPS) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  for (const [o, col] of stops) g.addColorStop(o, col);
  return g;
}
function bead(c: Ctx, x: number, y: number, r: number) {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
  g.addColorStop(0, '#FFFFFF');
  g.addColorStop(0.35, '#C3C6CB');
  g.addColorStop(0.8, '#55585E');
  g.addColorStop(1, '#2A2C30');
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = g;
  c.fill();
}
function leaf(c: Ctx, x: number, y: number, rx: number, ry: number, rot: number) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  const g = c.createRadialGradient(-rx * 0.3, -ry * 0.5, 1, 0, 0, rx);
  g.addColorStop(0, '#F4F5F7');
  g.addColorStop(0.45, '#9EA1A7');
  g.addColorStop(1, '#3A3C41');
  c.beginPath();
  c.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = 'rgba(15,16,20,0.6)';
  c.lineWidth = 1.5;
  c.stroke();
  c.beginPath();
  c.moveTo(-rx * 0.8, 0);
  c.lineTo(rx * 0.8, 0);
  c.strokeStyle = 'rgba(20,20,24,0.45)';
  c.lineWidth = 1;
  c.stroke();
  c.restore();
}

/** Ornate oxidised-silver frame with an opening of w x h at (b, b). */
function silverFrame(w: number, h: number, b: number) {
  const W = w + b * 2, H = h + b * 2;
  return cached(`silver-${w}-${h}-${b}`, W, H, (c) => {
    // body
    c.beginPath();
    c.rect(0, 0, W, H);
    c.rect(b, b, w, h);
    c.fillStyle = metal(c, 0, 0, W, H);
    c.fill('evenodd');
    // recessed channel (darker) in the middle of the band
    const i0 = b * 0.26, i1 = b * 0.74;
    c.beginPath();
    c.rect(i0, i0, W - i0 * 2, H - i0 * 2);
    c.rect(i1, i1, W - i1 * 2, H - i1 * 2);
    c.fillStyle = metal(c, W, 0, 0, H, [[0, '#3C3E44'], [0.3, '#7E8188'], [0.55, '#45474D'], [0.8, '#8D9096'], [1, '#393B40']]);
    c.fill('evenodd');
    // bevel lines: dark groove + light lip
    const bevel = (inset: number) => {
      c.strokeStyle = 'rgba(12,13,16,0.75)';
      c.lineWidth = 3;
      c.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
      c.strokeStyle = 'rgba(255,255,255,0.55)';
      c.lineWidth = 1.5;
      c.strokeRect(inset + 2.5, inset + 2.5, W - (inset + 2.5) * 2, H - (inset + 2.5) * 2);
    };
    bevel(i0);
    bevel(i1 - 3);
    bevel(b * 0.12);
    // outer edge: light top-left, dark bottom-right
    c.lineWidth = 4;
    c.strokeStyle = 'rgba(255,255,255,0.7)';
    c.beginPath(); c.moveTo(2, H - 2); c.lineTo(2, 2); c.lineTo(W - 2, 2); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,0.7)';
    c.beginPath(); c.moveTo(W - 2, 2); c.lineTo(W - 2, H - 2); c.lineTo(2, H - 2); c.stroke();
    // inner opening lip: dark top-left (shadow), bright bottom-right
    c.lineWidth = 3;
    c.strokeStyle = 'rgba(0,0,0,0.75)';
    c.beginPath(); c.moveTo(b, b + h); c.lineTo(b, b); c.lineTo(b + w, b); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.75)';
    c.beginPath(); c.moveTo(b + w, b); c.lineTo(b + w, b + h); c.lineTo(b, b + h); c.stroke();

    // bead row along the outer band
    const br = b * 0.075, bi = b * 0.19, step = br * 2.6;
    for (let x = bi + step; x < W - bi - step / 2; x += step) { bead(c, x, bi, br); bead(c, x, H - bi, br); }
    for (let y = bi + step; y < H - bi - step / 2; y += step) { bead(c, bi, y, br); bead(c, W - bi, y, br); }
    // leaf chain in the channel
    const mid = b * 0.5, lrx = b * 0.15, lry = b * 0.085, ls = b * 0.42;
    for (let x = b * 1.1; x < W - b * 1.1; x += ls) {
      leaf(c, x, mid, lrx, lry, 0.5);
      leaf(c, x, H - mid, lrx, lry, -0.5);
      bead(c, x + ls / 2, mid, b * 0.04);
      bead(c, x + ls / 2, H - mid, b * 0.04);
    }
    for (let y = b * 1.1; y < H - b * 1.1; y += ls) {
      leaf(c, mid, y, lrx, lry, Math.PI / 2 + 0.5);
      leaf(c, W - mid, y, lrx, lry, Math.PI / 2 - 0.5);
      bead(c, mid, y + ls / 2, b * 0.04);
      bead(c, W - mid, y + ls / 2, b * 0.04);
    }
    // corner rosettes
    for (const [x, y] of [[b / 2, b / 2], [W - b / 2, b / 2], [b / 2, H - b / 2], [W - b / 2, H - b / 2]]) {
      const R = b * 0.62;
      c.save();
      c.shadowColor = 'rgba(0,0,0,0.6)';
      c.shadowBlur = 8;
      c.shadowOffsetY = 3;
      starPath(c, x, y, R, R * 0.62, 8, Math.PI / 8);
      c.fillStyle = metal(c, x - R, y - R, x + R, y + R);
      c.fill();
      c.restore();
      c.strokeStyle = 'rgba(15,16,20,0.6)';
      c.lineWidth = 1.5;
      starPath(c, x, y, R, R * 0.62, 8, Math.PI / 8);
      c.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        leaf(c, x + Math.cos(a) * R * 0.42, y + Math.sin(a) * R * 0.42, R * 0.22, R * 0.11, a);
      }
      bead(c, x, y, R * 0.24);
    }
    // top crest on the frame (cartouche)
    const cx = W / 2, cr = b * 0.55;
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.6)';
    c.shadowBlur = 8;
    c.beginPath();
    c.ellipse(cx, b / 2, cr * 1.7, cr, 0, 0, Math.PI * 2);
    c.fillStyle = metal(c, cx - cr * 2, 0, cx + cr * 2, b);
    c.fill();
    c.restore();
    c.beginPath();
    c.ellipse(cx, b / 2, cr * 1.25, cr * 0.62, 0, 0, Math.PI * 2);
    c.fillStyle = '#2A2C31';
    c.fill();
    starPath(c, cx, b / 2, cr * 0.5, cr * 0.22, 4, -Math.PI / 2);
    c.fillStyle = '#D6D8DC';
    c.fill();

    // oxidisation: blotchy tarnish + grain, only on metal
    c.save();
    c.beginPath();
    c.rect(0, 0, W, H);
    c.rect(b, b, w, h);
    c.clip('evenodd');
    c.globalCompositeOperation = 'multiply';
    c.globalAlpha = 0.55;
    velvet(c, 0, 0, W, H, '#3A3B40', '#FFFFFF', 31);
    c.globalAlpha = 1;
    c.restore();
    c.save();
    c.beginPath();
    c.rect(0, 0, W, H);
    c.rect(b, b, w, h);
    c.clip('evenodd');
    heavyGrain(c, 0, 0, W, H, 0.22, 'overlay');
    c.restore();
  });
}

/** Persian-carpet lattice over indigo velvet (cached). */
function carpet(ctx: Ctx, w: number, h: number) {
  const tex = cached('boys-carpet', 540, 960, (c) => {
    velvet(c, 0, 0, 540, 960, '#090C18', '#253055', 17);
    c.save();
    // diamond lattice
    c.strokeStyle = 'rgba(160,170,210,0.10)';
    c.lineWidth = 1.2;
    const sp = 54;
    for (let i = -20; i < 40; i++) {
      c.beginPath(); c.moveTo(i * sp, 0); c.lineTo(i * sp + 960, 960); c.stroke();
      c.beginPath(); c.moveTo(i * sp, 0); c.lineTo(i * sp - 960, 960); c.stroke();
    }
    // lattice flowers (as small 8-point stars, no florals)
    for (let y = 0; y <= 960; y += sp / 2) {
      for (let x = ((y / (sp / 2)) % 2) * (sp / 2); x <= 540; x += sp) {
        starPath(c, x, y, 6, 2.5, 8, 0);
        c.fillStyle = 'rgba(200,169,106,0.16)';
        c.fill();
      }
    }
    // border bands
    for (const [ins, a] of [[14, 0.22], [20, 0.12], [34, 0.22]] as [number, number][]) {
      c.strokeStyle = `rgba(200,169,106,${a})`;
      c.lineWidth = 1.5;
      c.strokeRect(ins, ins, 540 - ins * 2, 960 - ins * 2);
    }
    for (let x = 30; x < 520; x += 12) {
      c.fillStyle = 'rgba(160,170,210,0.18)';
      c.fillRect(x, 26, 4, 4);
      c.fillRect(x, 930, 4, 4);
    }
    // vignette
    const v = c.createRadialGradient(270, 440, 120, 270, 480, 620);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.6)');
    c.fillStyle = v;
    c.fillRect(0, 0, 540, 960);
    c.restore();
  });
  ctx.drawImage(tex, 0, 0, w, h);
}

function kada(ctx: Ctx, x: number, y: number, rx: number, ry: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  ctx.lineWidth = ry * 0.62;
  ctx.strokeStyle = metal(ctx, -rx, -ry, rx, ry);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  // engraved notches on the front half
  ctx.strokeStyle = 'rgba(20,22,26,0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 18; i++) {
    const a = (i / 18) * Math.PI;
    const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
    ctx.beginPath();
    ctx.moveTo(ex * 0.9, ey * 0.9 - ry * 0.12);
    ctx.lineTo(ex * 1.1, ey * 1.1 + ry * 0.12);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.45);
  ctx.stroke();
  ctx.restore();
}

function watch(ctx: Ctx, x: number, y: number, r: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 12;
  // bracelet links
  const lw = r * 1.15, lh = r * 0.34;
  for (const dir of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const yy = dir * (r * 0.85 + i * (lh + 4)) - (dir < 0 ? lh : 0);
      const ww = lw * (1 - i * 0.04);
      ctx.fillStyle = metal(ctx, -ww / 2, yy, ww / 2, yy + lh);
      ctx.beginPath();
      ctx.roundRect(-ww / 2, yy, ww, lh, 4);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(-ww * 0.17, yy, 2, lh);
      ctx.fillRect(ww * 0.17, yy, 2, lh);
    }
  }
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 14;
  // case + bezel
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = metal(ctx, -r, -r, r, r);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
    ctx.lineTo(Math.cos(a) * r * 0.97, Math.sin(a) * r * 0.97);
    ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  // crown
  ctx.fillStyle = metal(ctx, r, -6, r + 12, 6);
  ctx.fillRect(r - 2, -7, 12, 14);
  // dial
  const dg = ctx.createRadialGradient(-r * 0.2, -r * 0.3, 2, 0, 0, r * 0.8);
  dg.addColorStop(0, '#2C3A66');
  dg.addColorStop(1, '#0D1226');
  ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.fillStyle = dg; ctx.fill();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = '#E2E4E8';
    ctx.fillRect(-1.5, -r * 0.7, 3, i % 3 ? r * 0.08 : r * 0.15);
    ctx.restore();
  }
  // hands at 10:10
  ctx.strokeStyle = '#EEF0F3';
  ctx.lineCap = 'round';
  for (const [a, len, lwid] of [[-60, 0.42, 4], [60, 0.6, 3]] as [number, number, number][]) {
    const ar = ((a - 90) * Math.PI) / 180;
    ctx.lineWidth = lwid;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ar) * r * len, Math.sin(ar) * r * len); ctx.stroke();
  }
  ctx.strokeStyle = '#C8A96A';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, r * 0.15); ctx.lineTo(0, -r * 0.65); ctx.stroke();
  circle(ctx, 0, 0, 4, '#C8A96A');
  // crystal glare
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, Math.PI * 1.05, Math.PI * 1.55);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = r * 0.1;
  ctx.stroke();
  ctx.restore();
}

function glint(ctx: Ctx, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(235,238,245,0.9)';
  ctx.shadowColor = 'rgba(220,228,255,0.9)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s * 0.8, 0); ctx.quadraticCurveTo(0, 0, 0, s);
  ctx.quadraticCurveTo(0, 0, -s * 0.8, 0); ctx.quadraticCurveTo(0, 0, 0, -s);
  ctx.fill();
  ctx.restore();
}

const SN_SLOTS: Slot[] = [
  { id: 'big', x: 150, y: 236, w: 600, h: 800, shape: 'rect', rotate: -2 },
  { id: 'm1', x: 600, y: 1112, w: 380, h: 506, shape: 'rect', rotate: 3 },
  { id: 'm2', x: 104, y: 1250, w: 380, h: 506, shape: 'rect', rotate: -3.5 },
];
const SN_BORDER: Record<string, number> = { big: 64, m1: 48, m2: 48 };

function drawFrameFor(ctx: Ctx, s: Slot) {
  const b = SN_BORDER[s.id];
  const tex = silverFrame(s.w, s.h, b);
  ctx.save();
  rotateAbout(ctx, s);
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 22;
  ctx.drawImage(tex, s.x - b, s.y - b);
  ctx.restore();
}
/** Inner shadow of the frame lip falling onto the photo. */
function lipShadow(ctx: Ctx, s: Slot) {
  ctx.save();
  rotateAbout(ctx, s);
  ctx.beginPath();
  ctx.rect(s.x, s.y, s.w, s.h);
  ctx.clip();
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 8;
  ctx.beginPath();
  ctx.rect(s.x - 200, s.y - 200, s.w + 400, s.h + 400);
  ctx.rect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = '#000';
  ctx.fill('evenodd');
  ctx.restore();
}

const silverNoir: Template = {
  id: 'n3-silver-noir',
  name: 'Silver Noir',
  pack: 'navratri',
  direction: 'royal-diwali',
  fonts: [`600 44px "Cinzel"`, `500 26px "Cinzel"`, `700 44px "Cinzel"`],
  slots: SN_SLOTS,
  drawBackground(ctx, w, h) {
    carpet(ctx, w, h);
  },
  beforeSlot(ctx, id) {
    const i = SN_SLOTS.findIndex((s) => s.id === id);
    if (i > 0) lipShadow(ctx, SN_SLOTS[i - 1]);
    drawFrameFor(ctx, SN_SLOTS[i]);
  },
  drawForeground(ctx, w, h) {
    lipShadow(ctx, SN_SLOTS[SN_SLOTS.length - 1]);
    // slight cool, desaturated grade across everything for the "noir" feel
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(40,52,90,0.35)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    const silverText = metal(ctx, 0, 60, 0, 140, [[0, '#F4F5F7'], [0.5, '#9DA0A7'], [0.55, '#C9CCD1'], [1, '#6F727A']]);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 12;
    ctx.font = `700 46px ${CINZEL}`;
    (ctx as Ctx & { letterSpacing: string }).letterSpacing = '14px';
    ctx.textAlign = 'center';
    ctx.fillStyle = silverText;
    ctx.fillText('NAVRATRI · MMXXVI', w / 2 + 7, 128);
    ctx.restore();

    spaced(ctx, `— NIGHT ${ROMAN[navNight() - 1]} —`, 790, 1760, `500 28px ${CINZEL}`, 'rgba(211,213,216,0.85)', 10);
    spaced(ctx, 'OXIDISED, NOT TARNISHED', 790, 1806, `500 20px ${CINZEL}`, 'rgba(200,169,106,0.8)', 6);

    watch(ctx, 920, 470, 64, 18);
    kada(ctx, 928, 870, 90, 36, -14);
    glint(ctx, 806, 230, 20);
    glint(ctx, 560, 1110, 14);
    glint(ctx, 1000, 1660, 16);
    grain(ctx, w, h, 0.06);
  },
};

const list: Template[] = [fitSorted, garbaKing, noFace, silverNoir];
export default list;
