// v4 · colours4 — the 9 Colours of Navratri, rebuilt in the Pinterest reference recipe:
// soft newsprint paper washed in tonight's colour, plain offset photo blocks, realistic
// cut-out flowers / fabric / bangles recoloured to match, and one small label card.
// No headlines, no numerals, no goddess copy. Art: public/art/ref/cl-*.webp (CREDITS-colours4.md).
import '@fontsource-variable/dm-sans';
import '@fontsource/caveat/500.css';
import '@fontsource/caveat/700.css';
import { art } from '../../engine/assets';
import type { Slot, Template } from '../../engine/types';
import { cached, grain } from '../v2/art';

type Ctx = CanvasRenderingContext2D;
type Img = HTMLImageElement | HTMLCanvasElement;

const SANS = '"DM Sans Variable", system-ui, sans-serif';
const HAND = '"Caveat", "Kalam", cursive';

/* ---------------------------------------------------------------------------------- */
/* The nine nights (2026: 11–19 Oct)                                                  */
/* ---------------------------------------------------------------------------------- */
interface Night {
  n: number;
  name: string;
  emoji: string;
  /** soft watercolour wash tone */
  wash: string;
  washAlpha: number;
  /** deeper tone for the card and labels */
  deep: string;
  /** card text colour */
  ink: string;
  /** recolour target for pink petals: hue (deg), saturation multiplier, lightness shift */
  petal: Recolour;
}
interface Recolour { h: number; s: number; l: number }

const NIGHTS: Night[] = [
  { n: 1, name: 'orange', emoji: '🧡', wash: '#F3A35C', washAlpha: 0.5, deep: '#D9742B', ink: '#FFF8F0', petal: { h: 27, s: 1.15, l: 0.02 } },
  { n: 2, name: 'white', emoji: '🤍', wash: '#D9CFBF', washAlpha: 0.38, deep: '#FBF8F2', ink: '#5B5146', petal: { h: 40, s: 0.1, l: 0.3 } },
  { n: 3, name: 'red', emoji: '❤️', wash: '#E2706E', washAlpha: 0.48, deep: '#B8323A', ink: '#FFF5F3', petal: { h: 354, s: 1.2, l: -0.06 } },
  { n: 4, name: 'royal blue', emoji: '💙', wash: '#7D98DA', washAlpha: 0.5, deep: '#3152A8', ink: '#F4F6FF', petal: { h: 224, s: 0.95, l: 0 } },
  { n: 5, name: 'yellow', emoji: '💛', wash: '#F2CF62', washAlpha: 0.52, deep: '#E9B92A', ink: '#4A3A0E', petal: { h: 47, s: 1.25, l: 0.06 } },
  { n: 6, name: 'green', emoji: '💚', wash: '#8DC48C', washAlpha: 0.48, deep: '#3A8A4E', ink: '#F3FFF4', petal: { h: 112, s: 0.55, l: 0.04 } },
  { n: 7, name: 'grey', emoji: '🩶', wash: '#ABA7A3', washAlpha: 0.45, deep: '#7A7570', ink: '#FAF8F6', petal: { h: 30, s: 0.06, l: 0.02 } },
  { n: 8, name: 'purple', emoji: '💜', wash: '#B597D8', washAlpha: 0.5, deep: '#6D41A6', ink: '#FAF4FF', petal: { h: 276, s: 0.95, l: 0 } },
  { n: 9, name: 'peacock green', emoji: '🦚', wash: '#6FBDB3', washAlpha: 0.5, deep: '#0F7B78', ink: '#F0FFFD', petal: { h: 176, s: 0.8, l: -0.02 } },
];

/** Tonight's night: by date (11 Oct = 1 … 19 Oct = 9, clamped), or `?navday=N`. */
function tonight(): Night {
  let n = 0;
  try {
    if (typeof location !== 'undefined' && location.search) {
      const v = parseInt(new URLSearchParams(location.search).get('navday') ?? '', 10);
      if (v >= 1 && v <= 9) n = v;
    }
  } catch {
    /* non-browser context */
  }
  if (!n) {
    const d = new Date();
    const key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    n = key < 20261011 ? 1 : key > 20261019 ? 9 : key - 20261010;
  }
  return NIGHTS[n - 1];
}

/* ---------------------------------------------------------------------------------- */
/* Art helpers                                                                         */
/* ---------------------------------------------------------------------------------- */
const A = {
  paper: 'ref/cl-newsprint',
  wash: 'ref/cl-wash',
  blot: 'ref/cl-blot',
  lotus: 'ref/cl-lotus',
  bud: 'ref/cl-lotus-bud',
  lilyW: 'ref/cl-lily-white',
  lilyB: 'ref/cl-lily-blue',
  marigold: 'ref/cl-marigold',
  bangles: 'ref/cl-bangles',
  silk: 'ref/cl-silk',
  feather: 'ref/cl-feather',
};
const ART = Object.values(A);

function hsl2rgb(h: number, s: number, l: number): [number, number, number] {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t: number) => {
    t = ((t % 1) + 1) % 1;
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
  };
  const hh = h / 360;
  return [f(hh + 1 / 3) * 255, f(hh) * 255, f(hh - 1 / 3) * 255];
}
const hueDist = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/**
 * Photo-real recolour: only pixels near `from` hue (the petals) move to the target hue,
 * stems, leaves and yellow centres keep theirs. Cached per art × target.
 */
function recoloured(name: string, from: number, range: number, to: Recolour | null): Img | undefined {
  const img = art(name);
  if (!img || !to) return img;
  // work at (at most) the size it is drawn, so the one-off pass stays cheap
  const k = Math.min(1, 580 / Math.max(img.naturalWidth, img.naturalHeight));
  const cw = Math.round(img.naturalWidth * k), ch = Math.round(img.naturalHeight * k);
  return cached(`cl-rc-${name}-${from}-${to.h}-${to.s}-${to.l}`, cw, ch, (c) => {
    c.imageSmoothingQuality = 'high';
    c.drawImage(img, 0, 0, cw, ch);
    const id = c.getImageData(0, 0, cw, ch);
    const d = id.data;
    const shift = to.h - from;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 4) continue;
      const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
      const mx = r > g ? (r > b ? r : b) : g > b ? g : b;
      const mn = r < g ? (r < b ? r : b) : g < b ? g : b;
      const dd = mx - mn;
      if (dd < 0.02) continue; // greys stay put
      const l = (mx + mn) / 2;
      const s = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn);
      let h = mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
      h *= 60;
      const dist = hueDist(h, from);
      let w = dist < range ? 1 : dist < range + 18 ? 1 - (dist - range) / 18 : 0;
      w *= Math.min(1, s * 5);
      if (w <= 0) continue;
      // recolour fully, then blend in RGB so edge pixels never pass through other hues
      const ns = Math.min(1, s * to.s);
      const nl = Math.max(0, Math.min(1, to.l >= 0 ? l + (1 - l) * to.l : l * (1 + to.l)));
      const [r0, g0, b0] = hsl2rgb(h + shift, ns, nl);
      d[i] += (r0 - d[i]) * w;
      d[i + 1] += (g0 - d[i + 1]) * w;
      d[i + 2] += (b0 - d[i + 2]) * w;
    }
    c.putImageData(id, 0, 0);
  });
}

/** Pink lotus/bud recoloured to tonight. Pink petals sit around hue 335. */
const lotusFor = (night: Night, name = A.lotus) => recoloured(name, 335, 40, night.petal);

/** Draw an image centred at (x,y), width w, rotation deg, soft contact shadow. */
function place(ctx: Ctx, img: Img | undefined, x: number, y: number, w: number, rot = 0, shadow = 0.28, flip = false) {
  if (!img) return;
  const iw = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
  const ih = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
  const h = (w * ih) / iw;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  if (flip) ctx.scale(-1, 1);
  if (shadow) {
    ctx.shadowColor = `rgba(40,25,15,${shadow})`;
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 12;
  }
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/** Soft cream newsprint, cached. */
function paperBase(ctx: Ctx, w: number, h: number, lift: number) {
  const c = cached(`cl-paper-${lift}`, 1080, 1920, (p) => {
    p.fillStyle = '#F4EDE1';
    p.fillRect(0, 0, 1080, 1920);
    const img = art(A.paper);
    if (img) {
      // the old paper's masthead sits above the canvas; only the faded columns show
      p.globalAlpha = 0.85;
      p.drawImage(img, -60, -230, 1200, 2240);
      p.globalAlpha = 1;
      // pull the sepia towards cream
      p.globalCompositeOperation = 'color';
      p.fillStyle = 'rgba(236,222,200,0.6)';
      p.fillRect(0, 0, 1080, 1920);
      p.globalCompositeOperation = 'source-over';
    }
    p.fillStyle = `rgba(250,246,238,${lift})`;
    p.fillRect(0, 0, 1080, 1920);
  });
  ctx.drawImage(c, 0, 0, w, h);
}

/** A watercolour mask tinted in one colour (cached). */
function tintedMask(name: string, colour: string, contrast = 1) {
  const m = art(name);
  if (!m) return undefined;
  return cached(`cl-mask-${name}-${colour}-${contrast}`, m.naturalWidth, m.naturalHeight, (c) => {
    c.drawImage(m, 0, 0);
    if (contrast !== 1) {
      // blotchier: clear paper between the pigment pools
      const id = c.getImageData(0, 0, m.naturalWidth, m.naturalHeight);
      for (let i = 3; i < id.data.length; i += 4) {
        const a = Math.max(0, id.data[i] / 255 - 0.18) / 0.82;
        id.data[i] = Math.pow(a, contrast) * 255;
      }
      c.putImageData(id, 0, 0);
    }
    c.globalCompositeOperation = 'source-in';
    c.fillStyle = colour;
    c.fillRect(0, 0, m.naturalWidth, m.naturalHeight);
  });
}

/** Gentle watercolour wash of tonight's colour over the paper. */
function wash(ctx: Ctx, night: Night) {
  const t = tintedMask(A.wash, night.wash); // blotch contrast is baked into the asset
  const b = tintedMask(A.blot, night.wash);
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  if (t) {
    // landscape wash turned to cover the portrait page
    ctx.globalAlpha = Math.min(1, night.washAlpha * 1.5);
    ctx.translate(1080, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(t, -40, -40, 2000, 1160);
    ctx.globalAlpha = night.washAlpha * 0.6;
    ctx.drawImage(t, 2000, 1160, -2000, -1160);
  }
  ctx.restore();
  if (b) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = night.washAlpha * 0.9;
    ctx.drawImage(b, -120, 1240, 760, 980);
    ctx.globalAlpha = night.washAlpha * 0.5;
    ctx.drawImage(b, 640, -160, 560, 720);
    ctx.restore();
  }
}

/** Fabric sample with pinked (zig-zag) edges: the dupatta swatch, dyed tonight's colour. */
function silkSwatch(ctx: Ctx, night: Night, cx: number, cy: number, w: number, h: number, rot: number) {
  const img = art(A.silk);
  if (!img) return;
  const dyed = cached(`cl-silk-${night.n}`, img.naturalWidth, img.naturalHeight, (c) => {
    c.drawImage(img, 0, 0);
    if (night.n === 2) return; // white night: the cream silk itself
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = night.n === 7 ? '#9C9893' : night.wash;
    c.fillRect(0, 0, img.naturalWidth, img.naturalHeight);
    c.globalCompositeOperation = 'multiply';
    c.globalAlpha = 0.55;
    c.fillStyle = night.deep;
    c.fillRect(0, 0, img.naturalWidth, img.naturalHeight);
  });
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  const path = new Path2D();
  const t = 14; // tooth
  const x0 = -w / 2, y0 = -h / 2;
  path.moveTo(x0, y0);
  for (let x = x0; x < x0 + w; x += t) { path.lineTo(x + t / 2, y0 + t * 0.5); path.lineTo(x + t, y0); }
  for (let y = y0; y < y0 + h; y += t) { path.lineTo(x0 + w - t * 0.5, y + t / 2); path.lineTo(x0 + w, y + t); }
  for (let x = x0 + w; x > x0; x -= t) { path.lineTo(x - t / 2, y0 + h - t * 0.5); path.lineTo(x - t, y0 + h); }
  for (let y = y0 + h; y > y0; y -= t) { path.lineTo(x0 + t * 0.5, y - t / 2); path.lineTo(x0, y - t); }
  path.closePath();
  ctx.shadowColor = 'rgba(40,25,15,0.3)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = night.deep;
  ctx.fill(path);
  ctx.shadowColor = 'transparent';
  ctx.clip(path);
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight) * 1.05;
  ctx.drawImage(dyed, -img.naturalWidth * s / 2, -img.naturalHeight * s / 2, img.naturalWidth * s, img.naturalHeight * s);
  ctx.restore();
}

/** Small lyric-style card (music-app share card; no logo): tiny art square, two faint lyric
 *  bars, and the one line of text. */
function labelCard(ctx: Ctx, night: Night, x: number, y: number, w: number, label: string, rot = 0) {
  const h = w * 0.5;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = 'rgba(30,20,10,0.28)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 22);
  ctx.fillStyle = night.deep;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  if (night.n === 2) { ctx.strokeStyle = 'rgba(90,80,70,0.18)'; ctx.lineWidth = 2; ctx.stroke(); }
  const k = w / 360;
  // art square: a crop of tonight's flower
  const a = 64 * k, ax = 22 * k, ay = 22 * k;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ax, ay, a, a, 8 * k);
  ctx.fillStyle = night.wash;
  ctx.fill();
  ctx.clip();
  const fl = lotusFor(night);
  if (fl) ctx.drawImage(fl, ax - a * 0.25, ay - a * 0.12, a * 1.5, a * 1.5);
  ctx.restore();
  // faint bars where title/artist would be
  ctx.fillStyle = night.ink;
  ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.roundRect(ax + a + 18 * k, ay + 14 * k, 120 * k, 12 * k, 6 * k); ctx.fill();
  ctx.globalAlpha = 0.45;
  ctx.beginPath(); ctx.roundRect(ax + a + 18 * k, ay + 38 * k, 78 * k, 10 * k, 5 * k); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.font = `700 ${Math.round(30 * k)}px ${SANS}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(label, ax, h - 30 * k);
  ctx.restore();
}

/* ---------------------------------------------------------------------------------- */
/* 1 · r4-day-colour                                                                   */
/* ---------------------------------------------------------------------------------- */
const DC: Record<string, Slot> = {
  a: { id: 'a', x: 84, y: 340, w: 520, h: 660, shape: 'rect' },
  b: { id: 'b', x: 628, y: 262, w: 368, h: 432, shape: 'rect' },
  c: { id: 'c', x: 628, y: 718, w: 368, h: 472, shape: 'rect' },
  d: { id: 'd', x: 84, y: 1024, w: 520, h: 600, shape: 'rect' },
};

/** Per-night choice for the top-left flower: real flowers where they exist in that colour. */
function topFlower(n: Night): Img | undefined {
  switch (n.n) {
    case 1: return art(A.marigold);
    case 2: return art(A.lilyW);
    case 4: return recoloured(A.lilyB, 250, 45, { h: 226, s: 1, l: 0 });
    case 5: return recoloured(A.marigold, 30, 22, { h: 46, s: 1.1, l: 0.08 });
    case 7: return recoloured(A.lilyW, 50, 30, { h: 40, s: 0.15, l: -0.05 });
    case 8: return recoloured(A.lilyB, 250, 45, { h: 278, s: 0.95, l: 0 });
    default: return lotusFor(n, A.bud);
  }
}

const dayColour: Template = {
  id: 'r4-day-colour',
  name: 'Colour of the Day',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`700 30px ${SANS}`, `500 40px ${HAND}`],
  art: ART,
  slots: [DC.a, DC.b, DC.c, DC.d],
  drawBackground(ctx, w, h) {
    const n = tonight();
    paperBase(ctx, w, h, 0.58);
    wash(ctx, n);
    // the dupatta swatch, half tucked under the top-right photo
    silkSwatch(ctx, n, 850, 210, 330, 240, 7);
    grain(ctx, w, h, 0.05);
  },
  drawForeground(ctx) {
    const n = tonight();
    // top-left: tonight's flower spilling over photo A's corner
    const tf = topFlower(n);
    if (n.n === 9) place(ctx, art(A.feather), 250, 250, 520, -38, 0.22);
    else place(ctx, tf, 140, 270, n.n === 1 || n.n === 5 ? 360 : 420, n.n === 1 || n.n === 5 ? -14 : -8);
    // bangles on the bottom-left corner of photo D
    place(ctx, art(A.bangles), 150, 1650, 330, -12, 0.3);
    // big lotus, bottom right, overlapping photo D's edge
    place(ctx, lotusFor(n), 830, 1690, 560, 6, 0.25);
    // the one card
    labelCard(ctx, n, 650, 1236, 340, `day ${n.n} · ${n.name} ${n.emoji}`, -3);
    // a small bud by the card
    place(ctx, n.n === 9 ? lotusFor(n, A.bud) : lotusFor(n, A.bud), 1004, 1398, 110, 14, 0.2);
  },
};

/* ---------------------------------------------------------------------------------- */
/* 2 · r4-nine-nights — the Dussehra recap                                            */
/* ---------------------------------------------------------------------------------- */
const NG = { x0: 66, y0: 268, w: 300, h: 352, gx: 24, pitch: 420 };
const nineSlots: Slot[] = NIGHTS.map((_, i) => ({
  id: `n${i + 1}`,
  x: NG.x0 + (i % 3) * (NG.w + NG.gx),
  y: NG.y0 + Math.floor(i / 3) * NG.pitch,
  w: NG.w,
  h: NG.h,
  shape: 'rect',
}));

/** Card colours for the recap: the pink of the lotuses around it. */
const RECAP: Night = { ...NIGHTS[0], n: 0, wash: '#F2B6C4', deep: '#C9567A', ink: '#FFF5F8', petal: { h: 335, s: 1, l: 0 } };

const nineNights: Template = {
  id: 'r4-nine-nights',
  name: '9 Nights, 9 Colours',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`700 30px ${SANS}`, `600 38px ${HAND}`],
  art: ART,
  slots: nineSlots,
  drawBackground(ctx, w, h) {
    paperBase(ctx, w, h, 0.7);
    // a whisper of warmth top and bottom
    const b = tintedMask(A.blot, '#EBC9B5');
    if (b) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.28;
      ctx.drawImage(b, -160, -220, 720, 820);
      ctx.drawImage(b, 560, 1360, 700, 800);
      ctx.restore();
    }
    // each night's soft paint swatch peeking out behind its photo + handwritten label
    NIGHTS.forEach((n, i) => {
      const s = nineSlots[i];
      const sw = tintedMask(A.blot, n.n === 2 ? '#D8CDBD' : n.wash);
      if (sw) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = n.n === 2 ? 0.75 : 0.8;
        ctx.translate(s.x + s.w / 2 + 14, s.y + s.h / 2 + 12);
        ctx.rotate(((i % 2 ? 1 : -1) * (2 + (i % 3)) * Math.PI) / 180);
        if (i % 2) ctx.scale(-1, 1);
        ctx.drawImage(sw, -s.w / 2 - 34, -s.h / 2 - 30, s.w + 68, s.h + 60);
        ctx.restore();
      }
      ctx.save();
      ctx.font = `600 38px ${HAND}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = n.n === 2 ? '#8A7E70' : n.n === 5 ? '#B8901A' : n.deep;
      ctx.fillText(n.name, s.x + s.w / 2, s.y + s.h + 46);
      ctx.restore();
    });
    grain(ctx, w, h, 0.05);
  },
  beforeSlot(ctx, id) {
    const i = +id.slice(1) - 1;
    const s = nineSlots[i];
    const n = NIGHTS[i];
    // thin keyline in the night's colour
    ctx.save();
    ctx.strokeStyle = n.n === 2 ? '#BDB2A3' : n.deep;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 3;
    ctx.strokeRect(s.x - 9, s.y - 9, s.w + 18, s.h + 18);
    ctx.restore();
  },
  drawForeground(ctx) {
    const pink = art(A.lotus);
    // top-left lotus over the first tile's corner
    place(ctx, pink, 96, 214, 330, -12, 0.25);
    // marigolds top right
    place(ctx, art(A.marigold), 990, 210, 230, 16, 0.25);
    // white lily low left
    place(ctx, art(A.lilyW), 96, 1720, 220, -10, 0.22);
    // big pink lotus bottom right
    place(ctx, pink, 880, 1730, 470, 4, 0.25);
    // a bud by the card
    place(ctx, art(A.bud), 300, 1720, 120, -14, 0.18);
    // the one card
    labelCard(ctx, RECAP, 380, 1566, 340, '9 nights, 9 colours ✨', 2);
  },
};

const list: Template[] = [dayColour, nineNights];
export default list;
