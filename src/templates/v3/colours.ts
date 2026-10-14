// v3 · 9 Nights, 9 Colours. Daily frames that auto-tint to tonight's Navratri colour,
// plus the Dussehra recap grid. Research §4 / T6: the 2026 colour list is everywhere on
// Pinterest as infographics, but nobody ships photo frames for it. Fashion-editorial, not chart.
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/600.css';
import frItalicUrl from '@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2?url';
import frRomanUrl from '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2?url';
import type { Slot, Template } from '../../engine/types';
import { cached, grain, rng, velvet } from '../v2/art';

type Ctx = CanvasRenderingContext2D;

// Private aliases so sibling files that import other Fraunces cuts can't shadow our italic.
const SERIF = '"Fraunces Colours", "Fraunces Variable", Georgia, serif';
const ITALIC = '"Fraunces Colours Italic", "Fraunces Variable", Georgia, serif';
try {
  if (typeof FontFace !== 'undefined' && typeof document !== 'undefined') {
    document.fonts.add(new FontFace('Fraunces Colours', `url(${frRomanUrl})`, { weight: '100 900' }));
    document.fonts.add(new FontFace('Fraunces Colours Italic', `url(${frItalicUrl})`, { weight: '100 900' }));
  }
} catch {
  /* fall back to the shared Fraunces faces */
}
const GROT = '"Bricolage Grotesque Variable", system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const SANS = '"Inter Tight", system-ui, sans-serif';

/* ---------- the nine nights ---------- */
export interface Night {
  n: number;
  date: string;
  name: string;
  hex: string;
  goddess: string;
  meaning: string;
  /** Text colour on `hex`, picked per colour (WCAG ratio noted). */
  ink: string;
  /** Second accent used for small flourishes. */
  accent: string;
  /** Light-ink days get a slightly deepened lower field so small type stays >= 4.5:1. */
  lightInk: boolean;
}

export const NIGHTS: Night[] = [
  { n: 1, date: '11.10', name: 'orange', hex: '#F26B1D', goddess: 'Shailaputri', meaning: 'warmth, energy & a fresh start', ink: '#1E0B04', accent: '#FFF1E2', lightInk: false }, // 6.2:1
  { n: 2, date: '12.10', name: 'white', hex: '#F7F3EA', goddess: 'Brahmacharini', meaning: 'peace, purity & a quiet glow', ink: '#1A1A1A', accent: '#A8843A', lightInk: false }, // 15.7:1
  { n: 3, date: '13.10', name: 'red', hex: '#C8102E', goddess: 'Chandraghanta', meaning: 'courage, fire & zero fear', ink: '#FFF4EC', accent: '#FFCF7A', lightInk: true }, // 5.4:1
  { n: 4, date: '14.10', name: 'royal blue', hex: '#2350B8', goddess: 'Kushmanda', meaning: 'depth, calm & main-character energy', ink: '#F5F1E8', accent: '#FFC94A', lightInk: true }, // 6.4:1
  { n: 5, date: '15.10', name: 'yellow', hex: '#F5C518', goddess: 'Skandamata', meaning: 'joy, sunshine & big-smile energy', ink: '#1F1600', accent: '#8A3B00', lightInk: false }, // 11.0:1
  { n: 6, date: '16.10', name: 'green', hex: '#2E8B57', goddess: 'Katyayani', meaning: 'growth, harmony & new beginnings', ink: '#F4F7EE', accent: '#F6D77A', lightInk: true }, // 3.9:1 flat, ~5:1 on deepened field
  { n: 7, date: '17.10', name: 'grey', hex: '#8A8D91', goddess: 'Kalaratri', meaning: 'strength, balance & quiet power', ink: '#111214', accent: '#F4F2EE', lightInk: false }, // 5.6:1
  { n: 8, date: '18.10', name: 'purple', hex: '#6B3FA0', goddess: 'Mahagauri', meaning: 'grace, luxe & a little royalty', ink: '#F7F0FF', accent: '#FFC6E2', lightInk: true }, // 6.6:1
  { n: 9, date: '19.10', name: 'peacock green', hex: '#00796B', goddess: 'Siddhidatri', meaning: 'wisdom, wishes & full-circle magic', ink: '#EFFAF6', accent: '#E8C35A', lightInk: true }, // 5.0:1
];

/** Navratri 2026 night (1..9) for a date: day 1 before 11 Oct, day 9 after 19 Oct. */
export function navratriDay(date: Date = new Date()): number {
  const d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const start = Date.UTC(2026, 9, 11);
  const i = Math.floor((d - start) / 864e5);
  return Math.min(9, Math.max(1, i + 1));
}

/** Tonight, with a `?navday=N` override for previews (safe outside a browser). */
function tonight(): Night {
  let n = navratriDay();
  try {
    if (typeof location !== 'undefined') {
      const v = parseInt(new URLSearchParams(location.search).get('navday') ?? '', 10);
      if (v >= 1 && v <= 9) n = v;
    }
  } catch {
    /* not a browser */
  }
  return NIGHTS[n - 1];
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/* ---------- helpers ---------- */
function spaced(ctx: Ctx, px: number) {
  (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${px}px`;
}

function text(ctx: Ctx, s: string, x: number, y: number, font: string, fill: string, align: CanvasTextAlign = 'left', ls = 0, alpha = 1) {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = fill;
  ctx.globalAlpha = alpha;
  if (ls) spaced(ctx, ls);
  ctx.fillText(s, x, y);
  ctx.restore();
}

/** Largest size (<= max) at which `s` fits in `maxW`. `font` has a {S} placeholder. */
function fit(ctx: Ctx, s: string, font: string, maxW: number, max: number) {
  ctx.save();
  ctx.font = font.replace('{S}', '100');
  const w = ctx.measureText(s).width;
  ctx.restore();
  return Math.min(max, Math.floor((100 * maxW) / w));
}

/** Coloured fabric: flat colour + greyscale crushed-silk texture in soft-light + light falloff. */
function fabric(ctx: Ctx, x: number, y: number, w: number, h: number, c: Night, seed = 11) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = c.hex;
  ctx.fillRect(x, y, w, h);
  const tex = cached(`n3-silk-${seed}`, 360, 640, (cc) => velvet(cc, 0, 0, 360, 640, '#000000', '#FFFFFF', seed));
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = c.n === 2 ? 0.3 : 0.42;
  ctx.drawImage(tex, x, y, w, h);
  ctx.globalAlpha = 1;
  // studio light: a soft lift top-left, a deeper fall bottom-right
  const g = ctx.createRadialGradient(x + w * 0.25, y + h * 0.12, 0, x + w * 0.25, y + h * 0.12, Math.max(w, h) * 1.05);
  g.addColorStop(0, 'rgba(255,255,255,0.22)');
  g.addColorStop(0.55, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  if (c.lightInk) {
    // deepen the lower field slightly so small light type holds contrast
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const d = ctx.createLinearGradient(0, y + h * 0.55, 0, y + h);
    d.addColorStop(0, 'rgba(0,0,0,0)');
    d.addColorStop(1, 'rgba(40,40,40,0.28)');
    ctx.fillStyle = d;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}

/** Nine-dot colour strip, tonight's dot ringed. Returns the strip's right edge. */
function dots(ctx: Ctx, x: number, y: number, step: number, r: number, today: Night, ring: string) {
  ctx.save();
  for (const c of NIGHTS) {
    const cx = x + (c.n - 1) * step;
    const on = c.n === today.n;
    ctx.beginPath();
    ctx.arc(cx, y, on ? r * 1.25 : r, 0, Math.PI * 2);
    ctx.fillStyle = c.hex;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = ring;
    ctx.globalAlpha = on ? 1 : 0.35;
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (on) {
      ctx.beginPath();
      ctx.arc(cx, y, r * 1.25 + 9, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = ring;
      ctx.stroke();
    }
  }
  ctx.restore();
  return x + 8 * step + r;
}

function hairline(ctx: Ctx, x0: number, x1: number, y: number, color: string, alpha = 0.55, lw = 2) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
  ctx.restore();
}

/** Mat behind a slot: a band of the base colour plus an ink keyline, so it reads as a cut-in print. */
function mat(ctx: Ctx, s: Slot, c: Night, padPx: number) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = c.hex;
  if (s.shape === 'circle') {
    ctx.beginPath();
    ctx.arc(s.x + s.w / 2, s.y + s.h / 2, s.w / 2 + padPx, 0, Math.PI * 2);
    ctx.fill();
  } else ctx.fillRect(s.x - padPx, s.y - padPx, s.w + padPx * 2, s.h + padPx * 2);
  ctx.restore();
}

/* ===================================================================== */
/* 1 · Night N — magazine-cover colour story                              */
/* ===================================================================== */
const NN = {
  hero: { id: 'hero', x: 64, y: 404, w: 952, h: 1026, shape: 'rect' } as Slot,
  detail: { id: 'detail', x: 716, y: 1262, w: 300, h: 400, shape: 'rect' } as Slot,
};

const nightColour: Template = {
  id: 'n3-night-colour',
  name: 'Night N',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: [
    `500 120px ${ITALIC}`, `500 120px ${SERIF}`, `800 200px ${GROT}`,
    `500 24px ${MONO}`, `600 24px ${MONO}`, `500 30px ${SANS}`,
  ],
  slots: [NN.hero, NN.detail],
  drawBackground(ctx, w, h) {
    const c = tonight();
    fabric(ctx, 0, 0, w, h, c);
    // meta row
    text(ctx, 'NAVRATRI ’26', 64, 96, `600 24px ${MONO}`, c.ink, 'left', 6);
    text(ctx, "THE COLOUR ISSUE", 540, 96, `500 24px ${MONO}`, c.ink, 'center', 6, 0.8);
    text(ctx, `NIGHT ${pad2(c.n)}/09`, 1016, 96, `600 24px ${MONO}`, c.ink, 'right', 6);
    hairline(ctx, 64, 1016, 122, c.ink, 0.5);
    // masthead: the colour itself
    const font = `500 {S}px ${ITALIC}`;
    const size = fit(ctx, c.name, font, 940, 220);
    text(ctx, c.name, 540, 322, font.replace('{S}', String(size)), c.ink, 'center', -2);
    // thin keyline offset around the hero
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.strokeRect(NN.hero.x - 14, NN.hero.y - 14, NN.hero.w + 28, NN.hero.h + 28);
    ctx.restore();
  },
  beforeSlot(ctx, id) {
    if (id === 'detail') mat(ctx, NN.detail, tonight(), 16);
  },
  drawForeground(ctx, w, h) {
    const c = tonight();
    // the numeral, half on the photo
    ctx.save();
    ctx.shadowColor = c.lightInk ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.18)';
    ctx.shadowBlur = 40;
    text(ctx, pad2(c.n), 34, 1592, `800 380px ${GROT}`, c.ink, 'left', -18);
    ctx.restore();
    // detail caption
    text(ctx, 'THE DETAILS ↑', 1016, 1712, `500 20px ${MONO}`, c.ink, 'right', 4, 0.8);
    // goddess + meaning
    text(ctx, `Maa ${c.goddess}`, 64, 1680, `500 64px ${ITALIC}`, c.ink, 'left', -1);
    text(ctx, c.meaning, 66, 1730, `500 30px ${SANS}`, c.ink, 'left', 0, 0.9);
    // colour strip
    const right = dots(ctx, 84, 1815, 52, 15, c, c.ink);
    text(ctx, `${c.date} · 9 nights, 9 colours`, right + 30, 1824, `500 22px ${MONO}`, c.ink, 'left', 2, 0.75);
    grain(ctx, w, h, 0.07);
  },
};

/* ===================================================================== */
/* 2 · Colour Story — full-bleed photo, colour-block band, stacked serif  */
/* ===================================================================== */
const CS = {
  hero: { id: 'hero', x: 0, y: 0, w: 1080, h: 1330, shape: 'rect' } as Slot,
  detail: { id: 'detail', x: 716, y: 1180, w: 300, h: 300, shape: 'circle' } as Slot,
};
const BAND_Y = 1300;

const colourStory: Template = {
  id: 'n3-colour-story',
  name: 'Colour Story',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: [`600 120px ${SERIF}`, `400 60px ${ITALIC}`, `800 200px ${GROT}`, `500 24px ${MONO}`, `600 24px ${MONO}`, `500 28px ${SANS}`],
  slots: [CS.hero, CS.detail],
  drawBackground(ctx, w, h) {
    fabric(ctx, 0, 0, w, h, tonight(), 23);
  },
  beforeSlot(ctx, id) {
    if (id !== 'detail') return;
    const c = tonight();
    // colour band laid over the hero's bottom edge, with a dye-bleed fade into the photo
    const g = ctx.createLinearGradient(0, BAND_Y - 170, 0, BAND_Y);
    g.addColorStop(0, c.hex + '00');
    g.addColorStop(1, c.hex + 'E6');
    ctx.fillStyle = g;
    ctx.fillRect(0, BAND_Y - 170, 1080, 170);
    fabric(ctx, 0, BAND_Y, 1080, 620, c, 23);
    hairline(ctx, 0, 1080, BAND_Y, c.ink, 0.6, 3);
    // top scrim + meta, over the photo
    const t = ctx.createLinearGradient(0, 0, 0, 220);
    t.addColorStop(0, 'rgba(0,0,0,0.42)');
    t.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = t;
    ctx.fillRect(0, 0, 1080, 220);
    text(ctx, `NIGHT ${pad2(c.n)} — ${c.name.toUpperCase()}`, 64, 92, `600 24px ${MONO}`, '#FFFFFF', 'left', 6);
    text(ctx, 'NAVRATRI ’26', 1016, 92, `600 24px ${MONO}`, '#FFFFFF', 'right', 6);
    mat(ctx, CS.detail, c, 14);
  },
  drawForeground(ctx, w, h) {
    const c = tonight();
    // ink ring on the detail circle
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CS.detail.x + 150, CS.detail.y + 150, 150 + 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // stacked serif colour name
    const words = c.name.split(' ');
    const rows = words.length === 1 ? [c.name + '.'] : [words[0], words.slice(1).join(' ') + '.'];
    const font = `600 {S}px ${SERIF}`;
    const size = Math.min(...rows.map((r) => fit(ctx, r, font, 600, rows.length === 1 ? 230 : 180)));
    const lh = size * 0.88;
    const base = rows.length === 1 ? 1530 : 1470;
    rows.forEach((r, i) => text(ctx, r, 58, base + i * lh, font.replace('{S}', String(size)), c.ink, 'left', -3));
    // numeral, right column
    text(ctx, pad2(c.n), 1022, 1684, `800 170px ${GROT}`, c.ink, 'right', -8);
    text(ctx, 'NIGHT', 1016, 1548, `600 22px ${MONO}`, c.ink, 'right', 6, 0.8);
    hairline(ctx, 64, 1016, 1714, c.ink, 0.45);
    text(ctx, `Maa ${c.goddess}`, 64, 1762, `400 52px ${ITALIC}`, c.ink, 'left', -1);
    text(ctx, c.meaning, 66, 1808, `500 28px ${SANS}`, c.ink, 'left', 0, 0.9);
    dots(ctx, 80, 1860, 44, 12, c, c.ink);
    grain(ctx, w, h, 0.06);
  },
};

/* ===================================================================== */
/* 3 · 9 Nights Recap — paint-chip grid for Dussehra                      */
/* ===================================================================== */
const CARD_W = 310, CARD_PAD = 10, PHOTO_H = 370, BAND_H = 64, GAP_X = 35, GAP_Y = 30, GRID_Y = 404;
const GRID_X = (1080 - (3 * CARD_W + 2 * GAP_X)) / 2;
const CARD_H = CARD_PAD + PHOTO_H + BAND_H;
const card = (i: number) => ({ x: GRID_X + (i % 3) * (CARD_W + GAP_X), y: GRID_Y + Math.floor(i / 3) * (CARD_H + GAP_Y) });
const recapSlots: Slot[] = NIGHTS.map((c, i) => {
  const k = card(i);
  return { id: `n${c.n}`, x: k.x + CARD_PAD, y: k.y + CARD_PAD, w: CARD_W - CARD_PAD * 2, h: PHOTO_H, shape: 'rect' };
});

function creamPaper(ctx: Ctx, w: number, h: number) {
  const tex = cached('n3-cream-paper', 540, 960, (c) => {
    c.fillStyle = '#F3ECDF';
    c.fillRect(0, 0, 540, 960);
    velvet(c, 0, 0, 540, 960, '#E9E0CE', '#FAF6EE', 19);
    const r = rng(77);
    c.globalAlpha = 0.06;
    for (let i = 0; i < 900; i++) {
      c.fillStyle = r() > 0.5 ? '#8A7350' : '#FFFFFF';
      c.fillRect(r() * 540, r() * 960, 1 + r() * 2, 1);
    }
  });
  ctx.drawImage(tex, 0, 0, w, h);
}

/** Watercolour swatch blob: shows only when a night has no photo. */
function watercolour(ctx: Ctx, s: Slot, c: Night) {
  const r = rng(c.n * 31);
  ctx.save();
  ctx.beginPath();
  ctx.rect(s.x, s.y, s.w, s.h);
  ctx.clip();
  ctx.fillStyle = '#FBF8F2';
  ctx.fillRect(s.x, s.y, s.w, s.h);
  for (let i = 0; i < 7; i++) {
    const cx = s.x + s.w * (0.3 + r() * 0.4), cy = s.y + s.h * (0.3 + r() * 0.4), rad = s.w * (0.28 + r() * 0.2);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, c.hex + '66');
    g.addColorStop(0.75, c.hex + '40');
    g.addColorStop(1, c.hex + '00');
    ctx.fillStyle = g;
    ctx.fillRect(s.x, s.y, s.w, s.h);
  }
  ctx.restore();
  text(ctx, c.name, s.x + s.w / 2, s.y + s.h / 2 + 14, `500 40px ${ITALIC}`, c.n === 2 ? '#8C7C64' : c.hex, 'center');
}

const nineNights: Template = {
  id: 'n3-nine-nights',
  name: '9 Nights Recap',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`600 136px ${SERIF}`, `400 136px ${ITALIC}`, `500 40px ${ITALIC}`, `600 22px ${MONO}`, `500 20px ${MONO}`],
  slots: recapSlots,
  drawBackground(ctx, w, h) {
    creamPaper(ctx, w, h);
    const ink = '#1C1712';
    // header
    text(ctx, '9 nights,', 56, 205, `600 150px ${SERIF}`, ink, 'left', -4);
    text(ctx, '9 colours.', 56, 338, `400 150px ${ITALIC}`, ink, 'left', -4);
    text(ctx, 'NAVRATRI', 1024, 112, `600 22px ${MONO}`, ink, 'right', 6);
    text(ctx, '2026', 1024, 144, `600 22px ${MONO}`, ink, 'right', 6);
    text(ctx, '11—19 OCT', 1024, 176, `500 20px ${MONO}`, ink, 'right', 5, 0.7);
    // spectrum rule
    const sw = (1024 - 690) / 9;
    NIGHTS.forEach((c, i) => {
      ctx.fillStyle = c.hex;
      ctx.fillRect(690 + i * sw, 300, sw + 0.5, 22);
    });
    ctx.save();
    ctx.strokeStyle = 'rgba(28,23,18,0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(690, 300, 1024 - 690, 22);
    ctx.restore();
    text(ctx, 'and we wore every one', 1024, 352, `400 30px ${ITALIC}`, ink, 'right', 0, 0.8);
    // paint-chip cards
    NIGHTS.forEach((c, i) => {
      const k = card(i);
      ctx.save();
      ctx.shadowColor = 'rgba(60,40,20,0.28)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = c.hex;
      ctx.fillRect(k.x, k.y, CARD_W, CARD_H);
      ctx.restore();
      if (c.n === 2) {
        ctx.save();
        ctx.strokeStyle = 'rgba(28,23,18,0.22)';
        ctx.lineWidth = 2;
        ctx.strokeRect(k.x + 1, k.y + 1, CARD_W - 2, CARD_H - 2);
        ctx.restore();
      }
      watercolour(ctx, recapSlots[i], c);
      const by = k.y + CARD_PAD + PHOTO_H + BAND_H / 2 + 8;
      text(ctx, `${pad2(c.n)} · ${c.name}`, k.x + 16, by, `600 22px ${MONO}`, c.ink, 'left', 1);
    });
    text(ctx, 'dussehra · 20.10.26 · jai mata di ✦', 540, 1850, `500 20px ${MONO}`, ink, 'center', 4, 0.7);
  },
  drawForeground(ctx, w, h) {
    grain(ctx, w, h, 0.05);
  },
};

const list: Template[] = [nightColour, colourStory, nineNights];
export default list;
