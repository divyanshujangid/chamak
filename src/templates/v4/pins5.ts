// v4 · pins5: ten more recreations of the owner's Pinterest pins (17 Oct 2026).
//  r5-mehndi-velvet      <- pin 109493834686200578 (block-print patchwork, maroon velvet panel, henna hands, lotus)
//  r5-lantern-gallery    <- pin 922604673680689639 (white, 4 matted frames, brass lanterns, lotus in hand, jutti)
//  r5-gold-patchwork     <- pin 992691942874101064 (dark gold patchwork, 2 staggered photos, lit lanterns)
//  r5-navratri-circles   <- pin 819866307210739865 (terracotta, gold "Navratri" with Durga, 3 circles, pearl strings)
//  r5-pink-patchwork     <- pin 1121466744740788816 (pink patchwork, 2 photos, camera + gramophone stickers)
//  r5-bw-dump            <- pin 992410467895178757 (off-white, black-and-white photo grid, colour cut-out hero)
//  r5-fairy-lights       <- pin 1048001775784674964 (fairy-light curtain, 4 overlapping photos)
//  r5-bougainvillea      <- pin 1073475261436342403 (Mughal wall, bougainvillea, polaroid, pink lotus, torn player)
//  r5-pichwai-eyes       <- pin 1130614681523347691 (terracotta, 3 framed slots incl. wide "eyes" slot, pichwai lotus)
//  r5-gerbera            <- pin 1140325568165956734 (paper white, big photo + 3 small, orange gerberas)
// Raster art: Met Open Access textiles (CC0) and Pixabay Content License; see public/art/ref/CREDITS-pins5.md.
import '@fontsource/great-vibes/400.css';
import type { Slot, Template } from '../../engine/types';
import { art } from '../../engine/assets';
import { cached, grain, light, rng, velvet } from '../v2/art';
import { paperPlayer } from './pond';

type Ctx = CanvasRenderingContext2D;

const A = {
  patchMulti: 'ref/p5-patch-multi',
  patchPink: 'ref/p5-patch-pink',
  patchGold: 'ref/p5-patch-gold',
  hand: 'ref/p5-henna-hand',
  bougain: 'ref/p5-bougain',
  swan: 'ref/p5-swan',
  gramophone: 'ref/p5-gramophone',
  gerbera: 'ref/p5-gerbera',
  camera: 'ref/p5-camera',
  wall: 'ref/p5-mughal-wall',
  durga: 'ref/p5-durga-gold',
  lotusGold: 'ref/p5-lotus-gold',
  velvet: 'velvet-maroon',
  lantern: 'ref/ds-lantern',
  jutti: 'ref/ds-jutti',
  lotus: 'ref/cl-lotus',
  lotusStem: 'ref/pp-lotus-stem',
  lotusSmall: 'ref/pp-lotus-small',
  lotusBud: 'ref/pp-lotus-bud',
  lotusPink: 'ref/pp-lotus-big',
  paper: 'ref/pd-paper',
};

/** Draw a raster art piece centred at (cx, cy), `w` wide, rotated `rot` degrees. */
function put(ctx: Ctx, name: string, cx: number, cy: number, w: number, rot = 0, opts: { flip?: boolean; alpha?: number; shadow?: number; crop?: [number, number, number, number] } = {}) {
  const img = art(name);
  if (!img) return;
  const [fx, fy, fw, fh] = opts.crop ?? [0, 0, 1, 1];
  const sw = img.naturalWidth * fw, sh = img.naturalHeight * fh;
  const h = (w * sh) / sw;
  ctx.save();
  ctx.translate(cx, cy);
  if (rot) ctx.rotate((rot * Math.PI) / 180);
  if (opts.flip) ctx.scale(-1, 1);
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  if (opts.shadow) {
    ctx.shadowColor = 'rgba(30,12,8,0.32)';
    ctx.shadowBlur = opts.shadow;
    ctx.shadowOffsetY = opts.shadow * 0.35;
  }
  ctx.drawImage(img, img.naturalWidth * fx, img.naturalHeight * fy, sw, sh, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/** Full-bleed background image (already 1080x1920). */
function bg(ctx: Ctx, name: string, w: number, h: number, fallback: string) {
  ctx.fillStyle = fallback;
  ctx.fillRect(0, 0, w, h);
  const img = art(name);
  if (img) ctx.drawImage(img, 0, 0, w, h);
}

/** Soft drop shadow under a rect (drawn before the photo covers it). */
function shadowRect(ctx: Ctx, x: number, y: number, w: number, h: number, blur = 26, fill = '#111', alpha = 0.4) {
  ctx.save();
  ctx.shadowColor = `rgba(0,0,0,${alpha})`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = blur * 0.35;
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

const fill = (ctx: Ctx, slots: Slot[], color: string) => {
  ctx.fillStyle = color;
  for (const s of slots) ctx.fillRect(s.x, s.y, s.w, s.h);
};

/** Warm terracotta leather: mottled velvet noise + handmade paper fibres. */
function terracotta(ctx: Ctx, w: number, h: number, dark: string, lightTone: string, seed: number) {
  velvet(ctx, 0, 0, w, h, dark, lightTone, seed);
  const p = art(A.paper);
  if (p) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.55;
    ctx.drawImage(p, 0, 0, w, h);
    ctx.restore();
  }
  grain(ctx, w, h, 0.07, 'overlay');
}

/** Hanging brass lantern on a chain, optionally lit (warm glow inside and around). */
function lantern(ctx: Ctx, cx: number, top: number, chain: number, w: number, lit = false) {
  ctx.save();
  ctx.strokeStyle = '#6B5326';
  ctx.lineWidth = 3;
  ctx.setLineDash([7, 4]);
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx, top + chain);
  ctx.stroke();
  ctx.restore();
  const img = art(A.lantern);
  const h = img ? (w * img.naturalHeight) / img.naturalWidth : w * 1.5;
  const cy = top + chain + h / 2;
  if (lit) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(cx, cy + h * 0.08, 0, cx, cy + h * 0.08, w * 1.6);
    g.addColorStop(0, 'rgba(255,196,96,0.55)');
    g.addColorStop(0.35, 'rgba(255,150,50,0.22)');
    g.addColorStop(1, 'rgba(255,120,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - w * 1.6, cy - w * 1.6, w * 3.2, w * 3.2);
    ctx.restore();
  }
  put(ctx, A.lantern, cx, cy, w, 0, { shadow: lit ? 0 : 14 });
  if (lit) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    light(ctx, cx, cy + h * 0.1, w * 0.9, 'rgb(255,190,90)');
    light(ctx, cx, cy + h * 0.1, w * 0.35, 'rgb(255,236,180)');
    ctx.restore();
  }
}

/* ------------------------------------------------------------------ */
/* r5-mehndi-velvet                                                    */
/* ------------------------------------------------------------------ */

const VEL = { x: 118, y: 268, w: 849, h: 1448 };
const mehndiSlots: Slot[] = [{ id: 'a', x: VEL.x + 44, y: VEL.y + 44, w: VEL.w - 88, h: VEL.h - 88, shape: 'rect' }];

const mehndiVelvet: Template = {
  id: 'r5-mehndi-velvet',
  name: 'Mehndi Velvet',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: [],
  art: [A.patchMulti, A.velvet, A.hand, A.lotus, A.lotusStem, A.lotusBud, A.lotusSmall],
  slots: mehndiSlots,
  drawBackground(ctx, w, h) {
    bg(ctx, A.patchMulti, w, h, '#6E1E22');
    // maroon velvet panel with a soft shadow, the photo sits inside it like the pin's panel
    shadowRect(ctx, VEL.x, VEL.y, VEL.w, VEL.h, 40, '#4A0E16', 0.55);
    const v = art(A.velvet);
    if (v) {
      ctx.drawImage(v, 0, 0, v.naturalWidth, v.naturalHeight, VEL.x, VEL.y, VEL.w, VEL.h);
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#B23A4A';
      ctx.fillRect(VEL.x, VEL.y, VEL.w, VEL.h);
      ctx.restore();
    } else velvet(ctx, VEL.x, VEL.y, VEL.w, VEL.h, '#4A0D16', '#8E2233', 9);
  },
  drawForeground(ctx) {
    // henna hand reaching in from the top-left, offering a lotus
    put(ctx, A.hand, 205, 330, 330, -112, { shadow: 18 });
    put(ctx, A.lotus, 470, 395, 250, 18, { shadow: 16 });
    // second hand from the bottom-left edge
    put(ctx, A.hand, 170, 1590, 330, -70, { shadow: 18, flip: true });
    // lotus plants spilling over the bottom-right corner
    put(ctx, A.lotusStem, 985, 1350, 270, 8, { shadow: 12 });
    put(ctx, A.lotusBud, 1040, 1500, 120, 14);
    put(ctx, A.lotus, 905, 1600, 300, -6, { shadow: 14 });
    put(ctx, A.lotusSmall, 1015, 1770, 260, 10, { shadow: 12 });
    put(ctx, A.lotus, 820, 1860, 240, 12, { shadow: 12 });
  },
};

/* ------------------------------------------------------------------ */
/* r5-lantern-gallery                                                  */
/* ------------------------------------------------------------------ */

const MAT = 16;
const galleryFrames = [
  { x: 585, y: 60, w: 470, h: 680 },
  { x: 33, y: 400, w: 490, h: 690 },
  { x: 585, y: 800, w: 470, h: 680 },
  { x: 33, y: 1150, w: 490, h: 690 },
];
const gallerySlots: Slot[] = galleryFrames.map((f, i) => ({ id: 'abcd'[i], x: f.x + MAT, y: f.y + MAT, w: f.w - MAT * 2, h: f.h - MAT * 2, shape: 'rect' }));

const lanternGallery: Template = {
  id: 'r5-lantern-gallery',
  name: 'Lantern Gallery',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [],
  art: [A.lantern, A.hand, A.lotusStem, A.jutti, A.paper],
  slots: gallerySlots,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#FBFAF6';
    ctx.fillRect(0, 0, w, h);
    const p = art(A.paper);
    if (p) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(p, 0, 0, w, h);
      ctx.restore();
    }
    for (const f of galleryFrames) {
      shadowRect(ctx, f.x, f.y, f.w, f.h, 22, '#FFFFFF', 0.22);
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 2;
      ctx.strokeRect(f.x, f.y, f.w, f.h);
    }
    fill(ctx, gallerySlots, '#0A0A0A');
  },
  drawForeground(ctx) {
    lantern(ctx, 100, -10, 40, 118);
    lantern(ctx, 232, -10, 150, 104);
    lantern(ctx, 372, -10, 60, 124);
    // hand holding a lotus, between the columns
    put(ctx, A.lotusStem, 548, 640, 290, -10, { shadow: 10 });
    put(ctx, A.hand, 560, 1010, 250, 192, { shadow: 16 });
    // jutti dropped across the bottom frames
    put(ctx, A.jutti, 560, 1560, 400, -24, { shadow: 18 });
  },
};

/* ------------------------------------------------------------------ */
/* r5-gold-patchwork                                                   */
/* ------------------------------------------------------------------ */

const goldSlots: Slot[] = [
  { id: 'a', x: 70, y: 132, w: 618, h: 815, shape: 'rect' },
  { id: 'b', x: 407, y: 1000, w: 616, h: 815, shape: 'rect' },
];

const goldPatchwork: Template = {
  id: 'r5-gold-patchwork',
  name: 'Gold Patchwork',
  pack: 'navratri',
  direction: 'royal-diwali',
  fonts: [],
  art: [A.patchGold, A.lantern],
  slots: goldSlots,
  drawBackground(ctx, w, h) {
    bg(ctx, A.patchGold, w, h, '#2A1A0C');
    // gentle vignette so the photos glow
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (const s of goldSlots) shadowRect(ctx, s.x, s.y, s.w, s.h, 34, '#1A100A', 0.6);
  },
  drawForeground(ctx) {
    lantern(ctx, 860, -10, 230, 150, true);
    lantern(ctx, 215, 1180, 20, 150, true);
  },
};

/* ------------------------------------------------------------------ */
/* r5-navratri-circles                                                 */
/* ------------------------------------------------------------------ */

const circleDefs = [
  { cx: 632, cy: 700, r: 262 },
  { cx: 280, cy: 1160, r: 262 },
  { cx: 760, cy: 1430, r: 312 },
];
const circleSlots: Slot[] = circleDefs.map((c, i) => ({ id: 'abc'[i], x: c.cx - c.r, y: c.cy - c.r, w: c.r * 2, h: c.r * 2, shape: 'circle' }));

const GOLD = (ctx: Ctx, y0: number, y1: number) => {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, '#FFF1B8');
  g.addColorStop(0.35, '#E8BC52');
  g.addColorStop(0.65, '#B07A22');
  g.addColorStop(1, '#F6D57A');
  return g;
};

/** Pearl strings with gold caps hanging from the top edge. */
function pearlStrings(ctx: Ctx, x: number, n: number, gap: number, seed: number) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const y = 30 + i * gap + r() * 6;
    // thread
    ctx.strokeStyle = 'rgba(214,170,80,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - gap + 20);
    ctx.lineTo(x, y);
    ctx.stroke();
    // gold cap
    ctx.save();
    ctx.fillStyle = GOLD(ctx, y - 18, y + 4);
    ctx.beginPath();
    ctx.moveTo(x - 15, y + 2);
    ctx.quadraticCurveTo(x - 14, y - 16, x, y - 20);
    ctx.quadraticCurveTo(x + 14, y - 16, x + 15, y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7A5418';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // pearl
    const pg = ctx.createRadialGradient(x - 6, y + 12, 2, x, y + 18, 20);
    pg.addColorStop(0, '#FFFFFF');
    pg.addColorStop(0.5, '#F1E9DC');
    pg.addColorStop(1, '#B9A88E');
    ctx.fillStyle = pg;
    ctx.shadowColor = 'rgba(40,10,5,0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.ellipse(x, y + 18, 15, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** Gold ornamental border along the bottom: scallops + small lotus row. */
function goldBorder(ctx: Ctx, w: number, y: number) {
  const tile = cached('p5-gold-border', w, 120, (c) => {
    c.fillStyle = GOLD(c, 0, 120);
    c.fillRect(0, 70, w, 50);
    for (let x = 0; x < w + 60; x += 60) {
      c.beginPath();
      c.moveTo(x - 30, 72);
      c.quadraticCurveTo(x - 15, 18, x, 8);
      c.quadraticCurveTo(x + 15, 18, x + 30, 72);
      c.closePath();
      c.fill();
      c.strokeStyle = '#6E4410';
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = '#7A1E1E';
      c.beginPath();
      c.arc(x, 48, 7, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = GOLD(c, 0, 120);
    }
    c.strokeStyle = '#6E4410';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, 90);
    c.lineTo(w, 90);
    c.stroke();
    for (let x = 15; x < w; x += 30) {
      c.fillStyle = '#FFF4C8';
      c.beginPath();
      c.arc(x, 104, 4, 0, Math.PI * 2);
      c.fill();
    }
  });
  ctx.drawImage(tile, 0, y);
}

const navratriCircles: Template = {
  id: 'r5-navratri-circles',
  name: 'Navratri Circles',
  pack: 'navratri',
  direction: 'royal-diwali',
  fonts: ['400 190px "Great Vibes"'],
  art: [A.paper, A.durga, A.lotusGold],
  slots: circleSlots,
  drawBackground(ctx, w, h) {
    terracotta(ctx, w, h, '#7E2F27', '#B75A4A', 31);
    // cream stone discs (visible at the edge while photos load)
    for (const c of circleDefs) {
      ctx.save();
      ctx.shadowColor = 'rgba(50,10,5,0.45)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#E8E1D6';
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, c.r + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = '#D9B45A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, c.r + 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
  drawForeground(ctx, w, h) {
    // Durga + gold script title
    put(ctx, A.durga, 120, 250, 150, -4, { shadow: 12 });
    ctx.save();
    ctx.font = '400 190px "Great Vibes"';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(40,8,4,0.55)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = GOLD(ctx, 150, 330);
    ctx.fillText('Navratri', 170, 310);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(110,60,12,0.6)';
    ctx.lineWidth = 1.5;
    ctx.strokeText('Navratri', 170, 310);
    ctx.restore();
    // gold dandiya pair under the title
    ctx.save();
    ctx.lineCap = 'round';
    for (const [dy, rot] of [[0, -0.04], [14, 0.03]] as const) {
      ctx.save();
      ctx.translate(410, 360 + dy);
      ctx.rotate(rot);
      ctx.strokeStyle = GOLD(ctx, -6, 6);
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(-140, 0);
      ctx.lineTo(140, 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    pearlStrings(ctx, 960, 11, 112, 4);
    pearlStrings(ctx, 1040, 13, 104, 9);
    // gold lotus seated at the bottom of every circle
    for (const c of circleDefs) put(ctx, A.lotusGold, c.cx, c.cy + c.r - 6, c.r * 0.72, 0, { shadow: 10 });
    goldBorder(ctx, w, h - 104);
  },
};

/* ------------------------------------------------------------------ */
/* r5-pink-patchwork                                                   */
/* ------------------------------------------------------------------ */

const pinkSlots: Slot[] = [
  { id: 'a', x: 322, y: 110, w: 687, h: 746, shape: 'rect' },
  { id: 'b', x: 41, y: 1001, w: 652, h: 722, shape: 'rect' },
];

const pinkPatchwork: Template = {
  id: 'r5-pink-patchwork',
  name: 'Pink Patchwork',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: [],
  art: [A.patchPink, A.camera, A.gramophone],
  slots: pinkSlots,
  drawBackground(ctx, w, h) {
    bg(ctx, A.patchPink, w, h, '#C2185B');
    for (const s of pinkSlots) shadowRect(ctx, s.x, s.y, s.w, s.h, 28, '#F6A9BC', 0.4);
  },
  drawForeground(ctx) {
    put(ctx, A.camera, 238, 205, 430, -14, { shadow: 16 });
    put(ctx, A.gramophone, 880, 1640, 440, 0, { shadow: 18 });
  },
};

/* ------------------------------------------------------------------ */
/* r5-bw-dump                                                          */
/* ------------------------------------------------------------------ */

const bwSlots: Slot[] = [
  { id: 'a', x: 137, y: 516, w: 454, h: 261, shape: 'rect', mono: true },
  { id: 'b', x: 605, y: 269, w: 321, h: 508, shape: 'rect', mono: true },
  { id: 'c', x: 82, y: 801, w: 207, h: 338, shape: 'rect', mono: true },
  { id: 'd', x: 302, y: 801, w: 437, h: 283, shape: 'rect', mono: true },
  { id: 'e', x: 753, y: 801, w: 173, h: 275, shape: 'rect', mono: true },
  { id: 'f', x: 0, y: 1166, w: 261, h: 165, shape: 'rect', mono: true },
  { id: 'g', x: 137, y: 1344, w: 165, h: 412, shape: 'rect', mono: true },
  { id: 'h', x: 802, y: 1092, w: 132, h: 581, shape: 'rect', mono: true },
  // colour cut-out hero standing in front of the grid
  { id: 'hero', x: 150, y: 720, w: 800, h: 1200, shape: 'rect', cutout: true },
];

const bwDump: Template = {
  id: 'r5-bw-dump',
  name: 'B&W Dump',
  pack: 'navratri',
  direction: 'y2k-chrome',
  fonts: [],
  art: [A.paper],
  slots: bwSlots,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#EEECE8';
    ctx.fillRect(0, 0, w, h);
    const p = art(A.paper);
    if (p) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(p, 0, 0, w, h);
      ctx.restore();
    }
    ctx.fillStyle = '#D6D3CE';
    for (const s of bwSlots) if (!s.cutout) ctx.fillRect(s.x, s.y, s.w, s.h);
  },
  drawForeground() {},
};

/* ------------------------------------------------------------------ */
/* r5-fairy-lights                                                     */
/* ------------------------------------------------------------------ */

const fairySlots: Slot[] = [
  { id: 'a', x: 0, y: 0, w: 591, h: 631, shape: 'rect' },
  { id: 'b', x: 157, y: 590, w: 703, h: 699, shape: 'rect' },
  { id: 'c', x: 96, y: 1295, w: 357, h: 625, shape: 'rect' },
  { id: 'd', x: 453, y: 1248, w: 627, h: 672, shape: 'rect' },
];

/** Dark wall with a curtain of warm fairy-light strands. */
function fairyCurtain(ctx: Ctx, w: number, h: number) {
  const layer = cached('p5-fairy-curtain', w, h, (c) => {
    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#1B1714');
    g.addColorStop(1, '#0E0C0B');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    // faint wall panels
    c.strokeStyle = 'rgba(255,255,255,0.035)';
    c.lineWidth = 3;
    for (let x = 0; x < w; x += 270) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    const r = rng(17);
    c.globalCompositeOperation = 'screen';
    for (let sx = 18; sx < w; sx += 44 + r() * 26) {
      const sway = (r() - 0.5) * 30;
      c.strokeStyle = 'rgba(120,100,70,0.25)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(sx, 0);
      c.quadraticCurveTo(sx + sway, h / 2, sx, h);
      c.stroke();
      for (let y = r() * 40; y < h; y += 34 + r() * 30) {
        const t = y / h, x = sx + sway * 2 * t * (1 - t) * 2;
        const s = 14 + r() * 16;
        light(c, x, y, s * 2.2, 'rgb(255,214,140)');
        light(c, x, y, s * 0.6, 'rgb(255,246,220)');
      }
    }
  });
  ctx.drawImage(layer, 0, 0);
}

const fairyLights: Template = {
  id: 'r5-fairy-lights',
  name: 'Fairy Lights',
  pack: 'navratri',
  direction: 'y2k-chrome',
  fonts: [],
  slots: fairySlots,
  drawBackground(ctx, w, h) {
    fairyCurtain(ctx, w, h);
    for (const s of fairySlots) shadowRect(ctx, s.x, s.y, s.w, s.h, 30, '#151210', 0.6);
  },
  drawForeground(ctx, w, h) {
    // a few strands crossing in front of the photos, like the pin
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const r = rng(5);
    for (const sx of [610, 905, 1040]) {
      for (let y = 10; y < h; y += 46 + r() * 28) {
        if (sx === 905 && y > 560 && y < 1300) continue;
        light(ctx, sx + (r() - 0.5) * 8, y, 30 + r() * 20, 'rgb(255,214,140)');
      }
    }
    for (let i = 0; i < 26; i++) light(ctx, r() * w, 1870 + r() * 50, 40, 'rgb(255,214,140)');
    ctx.restore();
  },
};

/* ------------------------------------------------------------------ */
/* r5-bougainvillea                                                    */
/* ------------------------------------------------------------------ */

const POL = { x: 132, y: 357, w: 816, h: 1179 };
const bougSlots: Slot[] = [{ id: 'a', x: 192, y: 467, w: 696, h: 767, shape: 'rect' }];

const bougainvillea: Template = {
  id: 'r5-bougainvillea',
  name: 'Bougainvillea',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [],
  art: [A.wall, A.bougain, A.lotusPink, A.lotusStem, A.lotus, A.paper],
  slots: bougSlots,
  drawBackground(ctx, w, h) {
    bg(ctx, A.wall, w, h, '#E4D6BE');
    // bougainvillea canopy along the top and down the right edge (behind the polaroid)
    const sprigs: [number, number, number, number, boolean][] = [
      [60, 60, 330, 100, false], [270, 30, 360, 80, true], [520, 40, 340, 96, false], [760, 20, 360, 74, true],
      [1000, 80, 360, 110, false], [1040, 420, 330, 160, true], [1050, 780, 300, 170, false], [1030, 1500, 330, 200, true],
      [60, 1820, 330, -70, false], [330, 1900, 330, -90, true], [1000, 1860, 360, -100, false],
    ];
    for (const [x, y, s, rot, flip] of sprigs) put(ctx, A.bougain, x, y, s, rot, { flip, shadow: 10 });
    // aged polaroid card
    shadowRect(ctx, POL.x, POL.y, POL.w, POL.h, 34, '#E9E0CE', 0.35);
    const p = art(A.paper);
    if (p) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(POL.x, POL.y, POL.w, POL.h);
      ctx.clip();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.8;
      ctx.drawImage(p, POL.x, POL.y, POL.w, POL.h);
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(160,130,90,0.12)';
    ctx.fillRect(POL.x, POL.y, POL.w, POL.h);
    fill(ctx, bougSlots, '#050505');
  },
  drawForeground(ctx) {
    put(ctx, A.lotusPink, 180, 400, 300, -14, { shadow: 16 });
    put(ctx, A.lotusStem, 985, 760, 230, 16, { shadow: 12 });
    put(ctx, A.lotus, 905, 1000, 170, -10, { shadow: 12 });
    put(ctx, A.lotusPink, 890, 1300, 400, 6, { shadow: 18 });
    paperPlayer(ctx, 26, 1390, 650, 270);
  },
};

/* ------------------------------------------------------------------ */
/* r5-pichwai-eyes                                                     */
/* ------------------------------------------------------------------ */

const pichSlots: Slot[] = [
  { id: 'a', x: 112, y: 58, w: 382, h: 578, shape: 'rect' },
  { id: 'eyes', x: 62, y: 756, w: 958, h: 394, shape: 'rect' },
  { id: 'c', x: 634, y: 1250, w: 368, h: 526, shape: 'rect' },
];

/** Pichwai-style lotus pad: teal disc with radiating veins and a lighter rim. */
function lotusLeaf(ctx: Ctx, x: number, y: number, rx: number, ry: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  const g = ctx.createRadialGradient(0, 0, rx * 0.1, 0, 0, rx);
  g.addColorStop(0, '#5E9A7E');
  g.addColorStop(0.7, '#2F6B58');
  g.addColorStop(1, '#1F4A3E');
  ctx.shadowColor = 'rgba(30,10,5,0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0.12, Math.PI * 2 - 0.12);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(200,230,200,0.45)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const a = 0.3 + (i / 14) * (Math.PI * 2 - 0.6);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * rx * 0.92, Math.sin(a) * ry * 0.92);
    ctx.stroke();
  }
  ctx.strokeStyle = '#173A30';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0.12, Math.PI * 2 - 0.12);
  ctx.stroke();
  ctx.restore();
}

const pichwaiEyes: Template = {
  id: 'r5-pichwai-eyes',
  name: 'Pichwai Eyes',
  pack: 'navratri',
  direction: 'royal-diwali',
  fonts: [],
  art: [A.paper, A.lotus, A.lotusSmall, A.lotusPink, A.lotusBud, A.lotusStem, A.swan],
  slots: pichSlots,
  drawBackground(ctx, w, h) {
    terracotta(ctx, w, h, '#8A3A30', '#B5604F', 53);
    // corner lotus ponds (leaves sit behind the frames)
    lotusLeaf(ctx, 900, 150, 120, 70, -12);
    lotusLeaf(ctx, 1040, 330, 110, 64, 18);
    lotusLeaf(ctx, 60, 1760, 130, 76, 10);
    lotusLeaf(ctx, 260, 1900, 120, 68, -8);
    lotusLeaf(ctx, 1000, 1880, 120, 70, 6);
    for (const s of pichSlots) {
      shadowRect(ctx, s.x - 7, s.y - 7, s.w + 14, s.h + 14, 18, '#111111', 0.45);
    }
    fill(ctx, pichSlots, '#C9A3A6');
  },
  drawForeground(ctx) {
    // top-right lotus cluster
    put(ctx, A.lotusPink, 760, 110, 230, -8, { shadow: 12 });
    put(ctx, A.lotus, 930, 70, 210, 12, { shadow: 12 });
    put(ctx, A.lotusBud, 1015, 210, 90, 20);
    // left lily breaking over the wide frame
    put(ctx, A.lotusSmall, 60, 740, 200, -18, { shadow: 12 });
    // swan + lotus between frames
    put(ctx, A.swan, 650, 690, 200, 0, { shadow: 8 });
    put(ctx, A.lotusPink, 830, 690, 150, 0, { shadow: 8 });
    // bottom corners
    put(ctx, A.lotus, 140, 1640, 260, -10, { shadow: 12 });
    put(ctx, A.lotusStem, 300, 1760, 200, 8, { shadow: 10 });
    put(ctx, A.lotusSmall, 920, 1800, 270, 12, { shadow: 12 });
    put(ctx, A.lotusBud, 1050, 1640, 90, -10);
  },
};

/* ------------------------------------------------------------------ */
/* r5-gerbera                                                          */
/* ------------------------------------------------------------------ */

const gerberaSlots: Slot[] = [
  { id: 'big', x: 0, y: 563, w: 737, h: 700, shape: 'rect' },
  { id: 'b', x: 269, y: 165, w: 377, h: 275, shape: 'rect' },
  { id: 'c', x: 701, y: 884, w: 297, h: 311, shape: 'rect' },
  { id: 'd', x: 330, y: 1365, w: 363, h: 366, shape: 'rect' },
];
const HEAD: [number, number, number, number] = [0, 0, 1, 0.6];

const gerbera: Template = {
  id: 'r5-gerbera',
  name: 'Gerbera',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [],
  art: [A.paper, A.gerbera],
  slots: gerberaSlots,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#ECEAE6';
    ctx.fillRect(0, 0, w, h);
    const p = art(A.paper);
    if (p) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.55;
      ctx.drawImage(p, 0, 0, w, h);
      ctx.restore();
    }
    // a gerbera sprig behind the big photo
    put(ctx, A.gerbera, 150, 520, 300, -38, { shadow: 10 });
    for (const s of gerberaSlots) shadowRect(ctx, s.x, s.y, s.w, s.h, 30, '#D9D5CF', 0.32);
  },
  drawForeground(ctx) {
    put(ctx, A.gerbera, 700, 610, 420, 8, { shadow: 16, crop: HEAD });
    put(ctx, A.gerbera, 160, 1420, 380, -12, { shadow: 16, crop: HEAD });
    put(ctx, A.gerbera, 470, 1270, 170, 20, { shadow: 10, crop: HEAD });
    put(ctx, A.gerbera, 940, 1310, 150, -16, { shadow: 10, crop: HEAD });
  },
};

const list: Template[] = [mehndiVelvet, navratriCircles, bougainvillea, pinkPatchwork, goldPatchwork, lanternGallery, pichwaiEyes, fairyLights, bwDump, gerbera];
export default list;
