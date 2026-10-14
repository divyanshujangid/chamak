// v4 desi set: faithful recreations of the owner's desi-core Pinterest pins.
// All objects are raster cut-outs (Pixabay / Wikimedia Commons CC0-PD / Met Open Access),
// see public/art/ref/CREDITS-desi.md. Only the bandhani title fill, the ransom sticker,
// the dandiya sticks and the slot frames are drawn in code.
import '@fontsource/rozha-one/400.css';
import '@fontsource/rozha-one/devanagari-400.css';
import '@fontsource/archivo-black/400.css';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/space-grotesk/700.css';
import type { Slot, Template } from '../../engine/types';
import { art } from '../../engine/assets';
import { bow, cached, grain, rng } from '../v2/art';

type Ctx = CanvasRenderingContext2D;

const A = (n: string) => `ref/ds-${n}`;

/** Draw a raster object centred at (cx,cy), width w, rotation deg, optional soft drop shadow. */
function obj(ctx: Ctx, name: string, cx: number, cy: number, w: number, rot = 0, o: { shadow?: number; flip?: boolean; alpha?: number } = {}) {
  const img = art(name);
  if (!img) return;
  const h = (w * img.naturalHeight) / img.naturalWidth;
  ctx.save();
  ctx.translate(cx, cy);
  if (rot) ctx.rotate((rot * Math.PI) / 180);
  if (o.flip) ctx.scale(-1, 1);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  const s = o.shadow ?? 0.35;
  if (s > 0) {
    ctx.shadowColor = `rgba(40,10,20,${s})`;
    ctx.shadowBlur = 22;
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 12;
  }
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/** Die-cut sticker: object with a thick white outline (cached per name/size). */
function sticker(ctx: Ctx, name: string, cx: number, cy: number, w: number, rot = 0, border = 9) {
  const img = art(name);
  if (!img) return;
  const h = Math.round((w * img.naturalHeight) / img.naturalWidth);
  const pad = border + 4;
  const c = cached(`ds-stk-${name}-${w}-${border}`, w + pad * 2, h + pad * 2, (g) => {
    const t = document.createElement('canvas');
    t.width = w + pad * 2;
    t.height = h + pad * 2;
    const tg = t.getContext('2d')!;
    for (let a = 0; a < 24; a++) {
      const ang = (a / 24) * Math.PI * 2;
      tg.drawImage(img, pad + Math.cos(ang) * border, pad + Math.sin(ang) * border, w, h);
    }
    tg.globalCompositeOperation = 'source-in';
    tg.fillStyle = '#FFFFFF';
    tg.fillRect(0, 0, t.width, t.height);
    g.drawImage(t, 0, 0);
    g.drawImage(img, pad, pad, w, h);
  });
  ctx.save();
  ctx.translate(cx, cy);
  if (rot) ctx.rotate((rot * Math.PI) / 180);
  ctx.shadowColor = 'rgba(40,10,20,0.3)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.drawImage(c, -c.width / 2, -c.height / 2);
  ctx.restore();
}

/* =====================================================================
 * 1. r4-lantern-white  (pin 886153664224404729)
 * White page, 4 portrait slots in two staggered columns, each in a white
 * card with a soft drop shadow. Three brass lanterns hang top-left, a
 * long-stem pink lotus crosses the gutter, red juttis sit at the bottom.
 * ===================================================================== */
const lanternSlots: Slot[] = [
  { id: 'tr', x: 596, y: 62, w: 448, h: 650, shape: 'rect' },
  { id: 'ml', x: 64, y: 410, w: 448, h: 654, shape: 'rect' },
  { id: 'mr', x: 600, y: 800, w: 446, h: 654, shape: 'rect' },
  { id: 'bl', x: 66, y: 1148, w: 448, h: 656, shape: 'rect' },
];

function card(ctx: Ctx, s: Slot, pad = 26) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(s.x - pad, s.y - pad, s.w + pad * 2, s.h + pad * 2);
  ctx.shadowColor = 'transparent';
  // faint inner bevel like a printed photo card
  ctx.strokeStyle = 'rgba(0,0,0,0.07)';
  ctx.lineWidth = 2;
  ctx.strokeRect(s.x - pad + 1, s.y - pad + 1, s.w + pad * 2 - 2, s.h + pad * 2 - 2);
  ctx.restore();
}

function chain(ctx: Ctx, x: number, y0: number, y1: number) {
  ctx.save();
  ctx.strokeStyle = '#4A3A22';
  ctx.lineWidth = 2.2;
  for (let y = y0; y < y1; y += 11) {
    ctx.beginPath();
    ctx.ellipse(x, y + 5, 2.6, 5.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function lantern(ctx: Ctx, cx: number, top: number, w: number) {
  const img = art(A('lantern'));
  if (!img) return;
  const h = (w * img.naturalHeight) / img.naturalWidth;
  chain(ctx, cx, -10, top + 8);
  ctx.save();
  ctx.shadowColor = 'rgba(30,20,0,0.35)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 10;
  ctx.drawImage(img, cx - w / 2, top, w, h);
  ctx.restore();
}

const lanternWhite: Template = {
  id: 'r4-lantern-white',
  name: 'Lantern Gallery',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [],
  art: [A('lantern'), 'lotus-cutout', A('jutti')],
  slots: lanternSlots,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    for (const s of lanternSlots) card(ctx, s);
    // lanterns live behind nothing, but drawn in bg so cards never cover them (they don't overlap)
    lantern(ctx, 100, 40, 118);
    lantern(ctx, 232, 150, 112);
    lantern(ctx, 392, 12, 124);
  },
  drawForeground(ctx) {
    // long-stem lotus crossing the gutter (stands in for the mehndi hand holding a lotus)
    obj(ctx, 'lotus-cutout', 560, 810, 600, -9, { shadow: 0.25 });
    // a pair of red juttis overlapping the bottom-right card corner
    obj(ctx, A('jutti'), 800, 1640, 400, -14, { shadow: 0.35 });
    obj(ctx, A('jutti'), 760, 1760, 400, -6, { shadow: 0.35 });
  },
};

/* =====================================================================
 * 2. r4-desi-bomb  (pin 424323596166053647)
 * Pink newsprint, 2 black slots, bandhani "देसी" with a white bow and a
 * dense border of realistic desi object cut-outs plus a ransom name sticker.
 * ===================================================================== */
const bombSlots: Slot[] = [
  { id: 'top', x: 437, y: 334, w: 566, h: 563, shape: 'rect' },
  { id: 'bot', x: 302, y: 962, w: 513, h: 513, shape: 'rect' },
];

/** Bandhani tie-dye pattern: maroon ground, white rings in small clusters. */
function bandhani(w: number, h: number) {
  return cached(`ds-bandhani-${w}-${h}`, w, h, (g) => {
    g.fillStyle = '#7E1420';
    g.fillRect(0, 0, w, h);
    const r = rng(11);
    // tonal mottling
    for (let i = 0; i < 40; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(160,30,40,0.25)' : 'rgba(60,5,12,0.25)';
      g.beginPath();
      g.arc(r() * w, r() * h, 20 + r() * 60, 0, Math.PI * 2);
      g.fill();
    }
    const step = 17;
    for (let y = 6, row = 0; y < h; y += step, row++) {
      for (let x = (row % 2) * (step / 2) + 4; x < w; x += step) {
        const jx = x + (r() - 0.5) * 3, jy = y + (r() - 0.5) * 3;
        // clusters of 4 dots in a diamond, the classic bandhani "chaubundi"
        const big = (Math.floor(x / step) + row) % 3 === 0;
        const pts = big ? [[0, -3], [3, 0], [0, 3], [-3, 0]] : [[0, 0]];
        for (const [dx, dy] of pts) {
          g.beginPath();
          g.arc(jx + dx, jy + dy, big ? 1.9 : 2.4, 0, Math.PI * 2);
          g.fillStyle = '#F6EADF';
          g.fill();
          g.beginPath();
          g.arc(jx + dx, jy + dy, 0.9, 0, Math.PI * 2);
          g.fillStyle = '#B23A3A';
          g.fill();
        }
      }
    }
  });
}

function desiTitle(ctx: Ctx) {
  const tw = 480, th = 240;
  const c = cached('ds-desi-title', tw, th, (g) => {
    g.font = '400 210px "Rozha One"';
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#000';
    g.fillText('देसी', tw / 2, 200);
    g.globalCompositeOperation = 'source-in';
    g.drawImage(bandhani(tw, th), 0, 0);
  });
  ctx.save();
  ctx.shadowColor = 'rgba(60,0,10,0.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;
  ctx.drawImage(c, 560, 0);
  ctx.restore();
  // little white satin bow on the last letter, like the pin
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 6;
  bow(ctx, 975, 72, 62, '#FFFFFF');
  ctx.restore();
}

/** Ransom-note name sticker: each letter cut from a different "magazine". */
function ransom(ctx: Ctx, word: string, x: number, y: number, rot: number) {
  const styles: [string, string, string][] = [
    ['#F2A11F', '#1B1B1B', '700 50px "Space Grotesk"'],
    ['#E43D8C', '#FFFFFF', '400 54px "DM Serif Display"'],
    ['#1E1E1E', '#F7E7A6', '400 46px "Archivo Black"'],
    ['#FFFFFF', '#C2162E', '400 54px "DM Serif Display"'],
    ['#2E6FD8', '#FFFFFF', '400 46px "Archivo Black"'],
  ];
  const r = rng(5);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  // white backing so it reads as one sticker
  let cx = 0;
  const boxes: { x: number; w: number; st: [string, string, string]; ch: string; t: number }[] = [];
  [...word].forEach((ch, i) => {
    const st = styles[i % styles.length];
    ctx.font = st[2];
    const w = ctx.measureText(ch).width + 18;
    boxes.push({ x: cx, w, st, ch, t: (r() - 0.5) * 12 });
    cx += w + 2;
  });
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(-10, -48, cx + 18, 80, 10);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  for (const b of boxes) {
    ctx.save();
    ctx.translate(b.x + b.w / 2, -8);
    ctx.rotate((b.t * Math.PI) / 180);
    ctx.fillStyle = b.st[0];
    ctx.fillRect(-b.w / 2, -34, b.w, 64);
    ctx.fillStyle = b.st[1];
    ctx.font = b.st[2];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.ch, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

/** Ornate gold hand-mirror: silvered glass inside the gilt frame cut-out. */
function mirror(ctx: Ctx, cx: number, cy: number, w: number, rot: number) {
  const img = art(A('mirror'));
  if (!img) return;
  const h = (w * img.naturalHeight) / img.naturalWidth;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.shadowColor = 'rgba(40,10,20,0.35)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  const g = ctx.createLinearGradient(-w * 0.3, -h * 0.35, w * 0.3, h * 0.3);
  g.addColorStop(0, '#F4F2F2');
  g.addColorStop(0.35, '#BEB8BC');
  g.addColorStop(0.55, '#E9E6E8');
  g.addColorStop(1, '#8E878D');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.03, w * 0.36, h * 0.37, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  // glint
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-w * 0.12, -h * 0.2, w * 0.05, h * 0.14, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'rgba(40,10,20,0.3)';
  ctx.shadowBlur = 12;
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

const desiBomb: Template = {
  id: 'r4-desi-bomb',
  name: 'Desi Sticker Bomb',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: ['400 210px "Rozha One"', '700 50px "Space Grotesk"', '400 54px "DM Serif Display"', '400 46px "Archivo Black"'],
  art: [
    A('newsprint'), A('lotus-paint'), A('gajra'), A('jhumka-gold'), A('urli'), A('auto'), A('jhumka-silver'),
    A('jutti'), A('mirror'), A('peacock'), A('bangles'), A('chai'), A('lotus-bud'),
  ],
  slots: bombSlots,
  drawBackground(ctx, w, h) {
    const bg = art(A('newsprint'));
    if (bg) ctx.drawImage(bg, 0, 0, w, h);
    else {
      ctx.fillStyle = '#F2E1E2';
      ctx.fillRect(0, 0, w, h);
    }
    // soften the ink so it reads as faded pink newsprint
    ctx.fillStyle = 'rgba(248,226,230,0.38)';
    ctx.fillRect(0, 0, w, h);
  },
  drawForeground(ctx, w, h) {
    // top-left: big painted lotus, gajra, gold jhumkas
    obj(ctx, A('lotus-paint'), 175, 150, 560, 8, { shadow: 0.2 });
    obj(ctx, A('gajra'), 390, 250, 300, -18);
    obj(ctx, A('jhumka-gold'), 300, 520, 360, 0);
    // left column
    obj(ctx, A('urli'), 175, 830, 350, -6);
    sticker(ctx, A('auto'), 170, 1090, 230, -4);
    obj(ctx, A('jhumka-silver'), 140, 1300, 230, 4);
    obj(ctx, A('jutti'), 95, 1500, 270, 38, { flip: true });
    mirror(ctx, 150, 1725, 250, -12);
    obj(ctx, A('peacock'), 330, 1580, 190, -16, { shadow: 0.25 });
    obj(ctx, A('bangles'), 470, 1745, 250, 6);
    // right column
    obj(ctx, A('chai'), 985, 1040, 210, 0);
    obj(ctx, A('jhumka-silver'), 965, 1290, 250, -6);
    obj(ctx, A('lotus-bud'), 1020, 1470, 190, 18, { shadow: 0.2 });
    obj(ctx, A('lotus-paint'), 800, 1760, 640, -4, { shadow: 0.2 });
    // title and the ransom name sticker
    desiTitle(ctx);
    ransom(ctx, 'garba', 745, 930, -8);
    grain(ctx, w, h, 0.05);
  },
};

/* =====================================================================
 * 3. r4-garba-objects
 * Cream handmade paper, 3 staggered slots, a marigold toran across the top
 * with a hanging strand, a mirror-work fabric patch, crossed dandiya sticks
 * and a cutting-chai glass.
 * ===================================================================== */
const garbaSlots: Slot[] = [
  { id: 'a', x: 70, y: 270, w: 560, h: 700, shape: 'rect' },
  { id: 'b', x: 660, y: 600, w: 350, h: 500, shape: 'rect' },
  { id: 'c', x: 70, y: 1010, w: 560, h: 700, shape: 'rect' },
];

/** Strand of real marigold heads stamped along a quadratic curve (cached). */
function marigoldStrand(key: string, w: number, h: number, pts: [number, number, number, number, number, number], size: number, seed: number) {
  return cached(`ds-mg-${key}`, w, h, (g) => {
    const o = art(A('marigold-o')), y = art(A('marigold-y'));
    if (!o || !y) return;
    const r = rng(seed);
    const [x0, y0, cx, cy, x1, y1] = pts;
    const len = Math.hypot(x1 - x0, y1 - y0) + Math.abs(cy - (y0 + y1) / 2);
    const n = Math.ceil(len / (size * 0.55));
    g.shadowColor = 'rgba(70,30,0,0.35)';
    g.shadowBlur = 10;
    g.shadowOffsetY = 6;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      const yy = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
      const img = (i % 5 === 2 || i % 5 === 4) ? y : o;
      const s = size * (0.88 + r() * 0.24);
      const sh = (s * img.naturalHeight) / img.naturalWidth;
      g.save();
      g.translate(x + (r() - 0.5) * 6, yy + (r() - 0.5) * 6);
      g.rotate(r() * Math.PI * 2);
      g.drawImage(img, -s / 2, -sh / 2, s, sh);
      g.restore();
    }
  });
}

/** Decorated dandiya stick: wooden core wrapped in foil bands, gold caps, tassel. */
function dandiya(ctx: Ctx, cx: number, cy: number, len: number, rot: number, cols: [string, string]) {
  const wd = 26;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.shadowColor = 'rgba(60,30,0,0.4)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = cols[0];
  ctx.beginPath();
  ctx.roundRect(-len / 2, -wd / 2, len, wd, wd / 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save();
  ctx.clip();
  // diagonal wraps
  for (let x = -len / 2 - wd; x < len / 2 + wd; x += 34) {
    ctx.fillStyle = cols[1];
    ctx.beginPath();
    ctx.moveTo(x, -wd / 2); ctx.lineTo(x + 12, -wd / 2); ctx.lineTo(x + 22, wd / 2); ctx.lineTo(x + 10, wd / 2);
    ctx.fill();
    ctx.fillStyle = '#E2B84A';
    ctx.beginPath();
    ctx.moveTo(x + 14, -wd / 2); ctx.lineTo(x + 18, -wd / 2); ctx.lineTo(x + 28, wd / 2); ctx.lineTo(x + 24, wd / 2);
    ctx.fill();
  }
  // gota bands every so often
  for (const bx of [-len * 0.32, 0, len * 0.32]) {
    const gg = ctx.createLinearGradient(bx, 0, bx + 22, 0);
    gg.addColorStop(0, '#9C7420'); gg.addColorStop(0.5, '#FFF0B0'); gg.addColorStop(1, '#9C7420');
    ctx.fillStyle = gg;
    ctx.fillRect(bx - 11, -wd / 2, 22, wd);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let k = -8; k <= 8; k += 5) { ctx.beginPath(); ctx.arc(bx, k, 1.6, 0, Math.PI * 2); ctx.fill(); }
  }
  // cylinder shading
  const sh = ctx.createLinearGradient(0, -wd / 2, 0, wd / 2);
  sh.addColorStop(0, 'rgba(0,0,0,0.35)');
  sh.addColorStop(0.3, 'rgba(255,255,255,0.35)');
  sh.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  sh.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = sh;
  ctx.fillRect(-len / 2, -wd / 2, len, wd);
  ctx.restore();
  // gold end caps with tiny ghungroo
  for (const ex of [-len / 2 + 6, len / 2 - 6]) {
    const cg = ctx.createRadialGradient(ex - 3, -4, 1, ex, 0, 16);
    cg.addColorStop(0, '#FFF3C2'); cg.addColorStop(0.5, '#D4A63A'); cg.addColorStop(1, '#6E5115');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(ex, 0, 15, 0, Math.PI * 2);
    ctx.fill();
  }
  // tassel at one end
  ctx.strokeStyle = cols[1];
  ctx.lineWidth = 2;
  for (let k = 0; k < 14; k++) {
    ctx.beginPath();
    ctx.moveTo(len / 2 + 4, 0);
    ctx.quadraticCurveTo(len / 2 + 30, 10 + k, len / 2 + 22 + k * 1.6, 60 + (k % 4) * 6);
    ctx.stroke();
  }
  ctx.restore();
}

const garbaObjects: Template = {
  id: 'r4-garba-objects',
  name: 'Garba Things',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: [],
  art: ['paper-plain', A('marigold-o'), A('marigold-y'), A('shisha'), A('chai-glass')],
  slots: garbaSlots,
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#F4EBDA';
    ctx.fillRect(0, 0, w, h);
    const p = art('paper-plain');
    if (p) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.drawImage(p, 0, 0, w, 767 * (w / 1080));
      ctx.drawImage(p, 0, 767, w, 767);
      ctx.save();
      ctx.translate(0, 1534 + 767);
      ctx.scale(1, -1);
      ctx.drawImage(p, 0, 0, w, 767);
      ctx.restore();
      ctx.restore();
      ctx.fillStyle = 'rgba(250,243,228,0.35)';
      ctx.fillRect(0, 0, w, h);
    }
    // mirror-work patch tucked behind the right slot's top edge
    obj(ctx, A('shisha'), 840, 360, 330, 6, { shadow: 0.35 });
  },
  drawForeground(ctx, w, h) {
    // marigold toran across the top + one long strand down the right edge
    const top = marigoldStrand('top', 1080, 260, [-40, 40, 540, 230, 1120, 40], 92, 3);
    ctx.drawImage(top, 0, 0);
    const side = marigoldStrand('side', 200, 1300, [130, -40, 60, 650, 120, 1300], 84, 8);
    ctx.drawImage(side, 920, 30);
    // crossed dandiya sticks bottom right
    dandiya(ctx, 850, 1500, 520, -58, ['#C8174F', '#1E8A4C']);
    dandiya(ctx, 870, 1510, 520, -122, ['#E86A12', '#2747A8']);
    // cutting chai overlapping the bottom slot corner
    obj(ctx, A('chai-glass'), 650, 1720, 190, 0, { shadow: 0.4 });
    grain(ctx, w, h, 0.05);
  },
};

const list: Template[] = [lanternWhite, desiBomb, garbaObjects];
export default list;
