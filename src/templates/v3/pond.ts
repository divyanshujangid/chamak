// v3 "pond" set: Pichwai lotus pond (T7), B&W mosaic + cut-out colour hero (T5),
// and an Udaipur jharokha window (also-seen list). Raster art is Pixabay-licensed (public/art/CREDITS.md);
// everything else is drawn in code and cached.
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/yatra-one/400.css';
import '@fontsource/space-mono/400.css';
import type { Slot, Template } from '../../engine/types';
import { art } from '../../engine/assets';
import { cached, grain, lotus, rng, rotateAbout, sparkleDoodle, txt, velvet } from '../v2/art';

type Ctx = CanvasRenderingContext2D;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const YATRA = '"Yatra One", serif';
const MONO = '"Space Mono", monospace';
const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

/* ------------------------------------------------------------------ helpers */

/** White-background watercolour → transparent (colour-to-alpha), downscaled and memoised once loaded. */
const keyed = new Map<string, HTMLCanvasElement>();
function knockout(name: string, maxW = 640): HTMLCanvasElement | HTMLImageElement | undefined {
  const hit = keyed.get(name);
  if (hit) return hit;
  const img = art(name);
  if (!img) return undefined;
  const s = Math.min(1, maxW / img.width);
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  const g = c.getContext('2d')!;
  g.drawImage(img, 0, 0, c.width, c.height);
  const d = g.getImageData(0, 0, c.width, c.height);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], gg = p[i + 1], b = p[i + 2];
    let a = (255 - Math.min(r, gg, b)) / 255;
    a = Math.min(1, a * 1.25);
    if (a < 0.06) { p[i + 3] = 0; continue; }
    p[i] = Math.max(0, Math.min(255, (r - 255 * (1 - a)) / a));
    p[i + 1] = Math.max(0, Math.min(255, (gg - 255 * (1 - a)) / a));
    p[i + 2] = Math.max(0, Math.min(255, (b - 255 * (1 - a)) / a));
    p[i + 3] = Math.round(a * 255);
  }
  g.putImageData(d, 0, 0);
  keyed.set(name, c);
  return c;
}

function drawArt(ctx: Ctx, img: CanvasImageSource & { width: number; height: number } | undefined, cx: number, bottom: number, w: number, rot = 0, flip = false, alpha = 1) {
  if (!img) return;
  const h = (img.height / img.width) * w;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, bottom);
  ctx.rotate((rot * Math.PI) / 180);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
}

function card(ctx: Ctx, s: Slot, pad: number, bottom: number, color: string, shadow = 'rgba(0,0,0,0.45)') {
  ctx.save();
  rotateAbout(ctx, s);
  ctx.shadowColor = shadow;
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = color;
  ctx.fillRect(s.x - pad, s.y - pad, s.w + pad * 2, s.h + pad + bottom);
  ctx.restore();
}

/** Text in a slot's rotated frame (cx offset from slot centre, y from slot bottom). */
function slotText(ctx: Ctx, s: Slot, str: string, dx: number, dy: number, font: string, fill: string, align: CanvasTextAlign = 'center') {
  ctx.save();
  rotateAbout(ctx, s);
  txt(ctx, str, s.x + s.w / 2 + dx, s.y + s.h + dy, font, fill, align);
  ctx.restore();
}

/* ======================================================= 1. Pichwai Lotus Pond */

const BLUSH = '#F4B6C2';
const MINT = '#CDE8D3';
const CREAM = '#F6F1E7';

/** Pichwai lily pad: flat round pad with a notch, fine radiating veins and a cream rim. */
function pad(ctx: Ctx, x: number, y: number, r: number, rot: number, tone = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(1, 0.42);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, r, -Math.PI / 2 + 0.16, Math.PI * 1.5 - 0.16);
  ctx.closePath();
  const g = ctx.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.1, 0, 0, r);
  g.addColorStop(0, tone ? '#6F9C78' : '#5E8B69');
  g.addColorStop(1, tone ? '#2F5A43' : '#294B3A');
  ctx.fillStyle = g;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(205,232,211,0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(205,232,211,0.28)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 14; i++) {
    const a = -Math.PI / 2 + 0.16 + (i / 14) * (Math.PI * 2 - 0.32);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92);
    ctx.stroke();
  }
  ctx.restore();
}

/** Closed lotus bud on a stem. (x,y) = bud base. */
function bud(ctx: Ctx, x: number, y: number, s: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const petal = (sx: number, col0: string, col1: string) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(sx * s * 0.75, -s * 0.25, sx * s * 0.5, -s * 0.85, 0, -s * 1.25);
    ctx.bezierCurveTo(-sx * s * 0.12, -s * 0.7, -sx * s * 0.1, -s * 0.3, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, -s * 1.25);
    g.addColorStop(0, col0);
    g.addColorStop(1, col1);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,20,50,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };
  petal(-1, '#F7D3DB', '#D8587A');
  petal(1, '#FBE3E8', '#E06A8A');
  ctx.beginPath();
  ctx.ellipse(0, s * 0.02, s * 0.32, s * 0.12, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#5E8B69';
  ctx.fill();
  ctx.restore();
}

function stem(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, bend: number, lw = 5) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo((x0 + x1) / 2 + bend, (y0 + y1) / 2, x1, y1);
  ctx.strokeStyle = '#3E6A4F';
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.strokeStyle = 'rgba(205,232,211,0.25)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

/** Pichwai water: rows of fine cream scallop waves. */
function water(ctx: Ctx, x0: number, x1: number, y0: number, y1: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(205,232,211,0.16)';
  ctx.lineWidth = 2;
  let row = 0;
  for (let y = y0; y < y1; y += 26, row++) {
    ctx.beginPath();
    const off = row % 2 ? 22 : 0;
    for (let x = x0 - 44 + off; x < x1; x += 44) {
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 11, y - 12, x + 22, y);
      ctx.quadraticCurveTo(x + 33, y - 12, x + 44, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

const pondSlots: Slot[] = [
  { id: 's1', x: 556, y: 96, w: 420, h: 420, shape: 'rect', rotate: 3 },
  { id: 's2', x: 492, y: 712, w: 490, h: 560, shape: 'rect', rotate: -2.5 },
  { id: 's3', x: 568, y: 1402, w: 400, h: 380, shape: 'rect', rotate: 2 },
];
const POND_PAD = 20, POND_BOTTOM = 78;
const pondCaptions = ['pink lotus era', 'garba nights, us', 'blessed & blushing'];
const pondCardColor = ['#F6F1E7', '#CDE8D3', '#F6F1E7'];

function pondColumn(c: Ctx) {
  const W = 470;
  water(c, 0, W, 1400, 1920);
  const r = rng(71);
  // back stems and buds
  const stems: [number, number, number, number, number][] = [
    [70, 1900, 110, 760, -40], [200, 1920, 232, 820, 50], [330, 1920, 300, 900, -30],
    [150, 1920, 150, 1180, 30], [400, 1920, 420, 1240, 40], [260, 1920, 260, 1350, -20],
  ];
  for (const [a, b, cx, cy, bend] of stems) stem(c, a, b, cx, cy, bend);
  bud(c, 110, 764, 62, -0.1);
  bud(c, 300, 904, 54, 0.15);
  bud(c, 420, 1244, 46, 0.2);
  // one small code-drawn Pichwai bloom low in the pond
  lotus(c, 260, 1352, 110, -0.08, ['#FCE4EA', '#E58FA6']);
  // lily pads stacked from the bottom
  const pads: [number, number, number][] = [];
  for (let i = 0; i < 16; i++) {
    const y = 1930 - i * 34 - r() * 20;
    pads.push([20 + r() * 420, y, 70 + r() * 70]);
  }
  pads.sort((a, b) => a[1] - b[1]);
  for (const [x, y, rr] of pads) pad(c, x, y, rr, (r() - 0.5) * 0.5, r() > 0.5 ? 1 : 0);
  // dragonfly-dots of pollen
  c.fillStyle = 'rgba(246,241,231,0.5)';
  for (let i = 0; i < 40; i++) {
    c.beginPath();
    c.arc(r() * W, 380 + r() * 1100, 1.5 + r() * 2.5, 0, Math.PI * 2);
    c.fill();
  }
}

const lotusPond: Template = {
  id: 'n3-lotus-pond',
  name: 'Pichwai Lotus Pond',
  pack: 'navratri',
  direction: 'royal-diwali',
  fonts: [`italic 600 60px ${SERIF}`, `italic 500 40px ${SERIF}`, `400 120px ${YATRA}`, `400 22px ${MONO}`],
  art: ['wc-lotus-pond', 'lotus-cutout', 'wc-lotus-buds', 'wc-lotus'],
  slots: pondSlots,
  drawBackground(ctx, w, h) {
    velvet(ctx, 0, 0, w, h, '#14211D', '#27392F', 23);
    ctx.save();
    const v = ctx.createRadialGradient(240, 1100, 100, 240, 1100, 1300);
    v.addColorStop(0, 'rgba(79,122,94,0.22)');
    v.addColorStop(1, 'rgba(10,18,15,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    // painted art: misty watercolour pond behind, then the code-drawn Pichwai column
    drawArt(ctx, knockout('wc-lotus-pond', 440), 230, 1560, 560, 0, true, 0.9);
    drawArt(ctx, knockout('wc-lotus-buds', 300), 380, 1860, 320, 6, true, 0.9);
    ctx.drawImage(cached('n3-pond-column', 470, 1920, pondColumn), 0, 0);
    // painted watercolour bloom mid-column, photographic hero bloom up top
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    drawArt(ctx, knockout('wc-lotus', 360), 150, 1210, 330, -4);
    const bloom = art('lotus-cutout');
    if (bloom) {
      stem(ctx, 232, 1500, 226, 850, -30, 7);
      ctx.drawImage(bloom, 20, 440, 420, 420);
    }
    ctx.restore();
    // fine double border, Pichwai style
    ctx.save();
    ctx.strokeStyle = 'rgba(246,241,231,0.38)';
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, w - 52, h - 52);
    ctx.strokeStyle = 'rgba(229,143,166,0.45)';
    ctx.strokeRect(36, 36, w - 72, h - 72);
    ctx.restore();
    // title block, top-left
    txt(ctx, 'नवरात्रि', 238, 250, `400 112px ${YATRA}`, BLUSH, 'center', ['rgba(0,0,0,0.45)', 18]);
    txt(ctx, 'lotus season', 238, 318, `italic 600 52px ${SERIF}`, CREAM, 'center');
    txt(ctx, 'NIGHT 04 · 2026', 238, 366, `400 22px ${MONO}`, 'rgba(205,232,211,0.7)', 'center');
  },
  beforeSlot(ctx, id) {
    const i = pondSlots.findIndex((s) => s.id === id);
    if (i < 0) return;
    const s = pondSlots[i];
    card(ctx, s, POND_PAD, POND_BOTTOM, pondCardColor[i]);
    slotText(ctx, s, pondCaptions[i], 0, 56, `italic 600 ${i === 1 ? 40 : 38}px ${SERIF}`, '#3B4A42');
  },
  drawForeground(ctx, w, h) {
    // emoji row between first and second polaroid
    ctx.save();
    ctx.font = `52px ${EMOJI}`;
    ctx.textAlign = 'center';
    ctx.fillText('🦢  🪞  🪷', 770, 668);
    ctx.restore();
    sparkleDoodle(ctx, 1010, 600, 30, BLUSH, 3);
    sparkleDoodle(ctx, 500, 1360, 26, MINT, 3);
    grain(ctx, w, h, 0.06);
  },
};

/* ============================================================ 2. Colour Pop */

const mosaic: Slot[] = [
  { id: 'm1', x: 60, y: 120, w: 330, h: 420, shape: 'rect', rotate: -2.5, mono: true },
  { id: 'm2', x: 420, y: 72, w: 270, h: 330, shape: 'rect', rotate: 1.5, mono: true },
  { id: 'm3', x: 720, y: 150, w: 300, h: 390, shape: 'rect', rotate: 3, mono: true },
  { id: 'm4', x: 48, y: 590, w: 290, h: 350, shape: 'rect', rotate: 2, mono: true },
  { id: 'm5', x: 370, y: 440, w: 350, h: 460, shape: 'rect', rotate: -1.2, mono: true },
  { id: 'm6', x: 752, y: 586, w: 280, h: 340, shape: 'rect', rotate: -3, mono: true },
];
const hero: Slot = { id: 'hero', x: 110, y: 850, w: 860, h: 930, shape: 'rect', rotate: -2, cutout: true };

const colourPop: Template = {
  id: 'n3-colour-pop',
  name: 'Colour Pop',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`italic 500 40px ${SERIF}`, `400 20px ${MONO}`],
  slots: [...mosaic, hero],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#EFEFEF';
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(540, 760, 200, 540, 900, 1300);
    g.addColorStop(0, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // thin white mats + soft shadows under the B&W prints
    for (const s of mosaic) card(ctx, s, 8, 8, '#FFFFFF', 'rgba(0,0,0,0.18)');
    txt(ctx, 'N°04', 70, 70, `400 20px ${MONO}`, '#8A8A8A', 'left');
    txt(ctx, 'NAVRATRI · 2026', 1010, 1890, `400 20px ${MONO}`, '#8A8A8A', 'right');
  },
  drawForeground(ctx, w, h) {
    txt(ctx, 'everyone else in black & white.', 70, 1890, `italic 500 38px ${SERIF}`, '#2B2B2B', 'left');
    grain(ctx, w, h, 0.05);
  },
};

/* ========================================================= 3. Jharokha Window */

const ARCH: Slot = { id: 'main', x: 296, y: 400, w: 488, h: 752, shape: 'arch' };
const MIR1: Slot = { id: 'mir1', x: 46, y: 1520, w: 330, h: 330, shape: 'circle' };
const MIR2: Slot = { id: 'mir2', x: 742, y: 1566, w: 290, h: 290, shape: 'circle' };
const CX = 540, SPRING = ARCH.y + ARCH.w / 2, R_OPEN = ARCH.w / 2;

const STONE = '#EEDFC6', STONE_D = '#CDB28C', STONE_L = '#FBF4E6';

function stoneTexture(c: Ctx) {
  const r = rng(404);
  c.fillStyle = STONE;
  c.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 220; i++) {
    const x = r() * 1080, y = r() * 1920, rr = 30 + r() * 120;
    const g = c.createRadialGradient(x, y, 0, x, y, rr);
    const dark = r() > 0.5;
    g.addColorStop(0, dark ? 'rgba(170,130,90,0.10)' : 'rgba(255,250,240,0.16)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  for (let i = 0; i < 4000; i++) {
    c.fillStyle = r() > 0.5 ? 'rgba(120,90,60,0.13)' : 'rgba(255,255,255,0.2)';
    c.fillRect(r() * 1080, r() * 1920, 1.6, 1.6);
  }
}

/** Fill a path with stone + bevel: light top-left edge, dark bottom-right edge. */
function carve(c: Ctx, path: Path2D, tex: HTMLCanvasElement, depth = 1) {
  c.save();
  c.shadowColor = 'rgba(70,45,30,0.35)';
  c.shadowBlur = 14 * depth;
  c.shadowOffsetY = 8 * depth;
  c.fillStyle = STONE;
  c.fill(path);
  c.restore();
  c.save();
  c.clip(path);
  c.drawImage(tex, 0, 0);
  c.restore();
  c.save();
  c.lineWidth = 3;
  c.translate(1.5, 2);
  c.strokeStyle = 'rgba(120,85,55,0.45)';
  c.stroke(path);
  c.translate(-3, -3.5);
  c.strokeStyle = 'rgba(255,252,244,0.85)';
  c.stroke(path);
  c.restore();
}

/** Incised line (groove): dark line with a light line just below-right. */
function groove(c: Ctx, path: Path2D, lw = 2.5) {
  c.save();
  c.lineWidth = lw;
  c.strokeStyle = 'rgba(110,78,50,0.5)';
  c.stroke(path);
  c.translate(1.5, 1.8);
  c.strokeStyle = 'rgba(255,252,244,0.75)';
  c.stroke(path);
  c.restore();
}

function rectP(x: number, y: number, w: number, h: number) {
  const p = new Path2D();
  p.rect(x, y, w, h);
  return p;
}

function archOpening(p: Path2D | Ctx, grow = 0) {
  p.moveTo(ARCH.x - grow, ARCH.y + ARCH.h + grow);
  p.lineTo(ARCH.x - grow, SPRING);
  p.arc(CX, SPRING, R_OPEN + grow, Math.PI, 0);
  p.lineTo(ARCH.x + ARCH.w + grow, ARCH.y + ARCH.h + grow);
  p.closePath();
}

function jharokhaLayer(c: Ctx) {
  const tex = cached('n3-jh-stone', 1080, 1920, stoneTexture);
  const L = 200, R = 880;
  // ---- main body: rectangle with the arch opening cut out (evenodd)
  const body = new Path2D();
  body.rect(L, 360, R - L, ARCH.y + ARCH.h - 360);
  archOpening(body, 0);
  c.save();
  c.shadowColor = 'rgba(60,40,40,0.45)';
  c.shadowBlur = 50;
  c.shadowOffsetY = 20;
  c.fillStyle = STONE;
  c.fill(body, 'evenodd');
  c.restore();
  c.save();
  c.clip(body, 'evenodd');
  c.drawImage(tex, 0, 0);
  // recessed band around the arch
  const band = new Path2D();
  archOpening(band, 62);
  const shade = c.createRadialGradient(CX, SPRING, R_OPEN, CX, SPRING, R_OPEN + 70);
  shade.addColorStop(0, 'rgba(150,110,75,0.32)');
  shade.addColorStop(1, 'rgba(150,110,75,0)');
  c.fillStyle = shade;
  c.fill(band);
  c.restore();
  // outer arch moulding
  const mould = new Path2D();
  mould.moveTo(ARCH.x - 62, ARCH.y + ARCH.h);
  mould.lineTo(ARCH.x - 62, SPRING);
  mould.arc(CX, SPRING, R_OPEN + 62, Math.PI, 0);
  mould.lineTo(ARCH.x + ARCH.w + 62, ARCH.y + ARCH.h);
  groove(c, mould, 3);
  const mould2 = new Path2D();
  mould2.moveTo(ARCH.x - 40, ARCH.y + ARCH.h);
  mould2.lineTo(ARCH.x - 40, SPRING);
  mould2.arc(CX, SPRING, R_OPEN + 40, Math.PI, 0);
  mould2.lineTo(ARCH.x + ARCH.w + 40, ARCH.y + ARCH.h);
  groove(c, mould2, 2);
  // bead row along the moulding
  for (let i = 0; i <= 26; i++) {
    const a = Math.PI + (i / 26) * Math.PI;
    const x = CX + Math.cos(a) * (R_OPEN + 51), y = SPRING + Math.sin(a) * (R_OPEN + 51);
    const g = c.createRadialGradient(x - 2, y - 2, 0, x, y, 7);
    g.addColorStop(0, STONE_L);
    g.addColorStop(1, STONE_D);
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, 6, 0, Math.PI * 2);
    c.fill();
  }
  // spandrel rosettes
  for (const sx of [L + 52, R - 52]) {
    const p = new Path2D();
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      p.moveTo(sx, 420);
      p.ellipse(sx + Math.cos(a) * 14, 420 + Math.sin(a) * 14, 14, 6, a, 0, Math.PI * 2);
    }
    groove(c, p, 2);
  }
  // ---- pilasters each side of the opening
  for (const px of [L + 6, R - 74]) {
    carve(c, rectP(px, 640, 68, ARCH.y + ARCH.h - 640), tex, 0.6);
    groove(c, rectP(px + 14, 690, 40, ARCH.y + ARCH.h - 740), 2);
    carve(c, rectP(px - 8, 620, 84, 28), tex, 0.6); // capital
    carve(c, rectP(px - 8, ARCH.y + ARCH.h - 34, 84, 34), tex, 0.6); // base
  }
  // ---- cusped (multifoil) trim inside the arch, overlapping the photo edge
  {
    const foil = document.createElement('canvas');
    foil.width = 1080; foil.height = 1300;
    const f = foil.getContext('2d')!;
    const ring = new Path2D();
    ring.arc(CX, SPRING, R_OPEN + 2, Math.PI, 0);
    ring.arc(CX, SPRING, R_OPEN - 34, 0, Math.PI, true);
    ring.closePath();
    f.fillStyle = STONE;
    f.fill(ring);
    f.save();
    f.clip(ring);
    f.drawImage(tex, 0, 0);
    f.restore();
    f.globalCompositeOperation = 'destination-out';
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = Math.PI + ((i + 0.5) / n) * Math.PI;
      f.beginPath();
      f.arc(CX + Math.cos(a) * (R_OPEN - 46), SPRING + Math.sin(a) * (R_OPEN - 46), 50, 0, Math.PI * 2);
      f.fill();
    }
    f.globalCompositeOperation = 'source-over';
    c.save();
    c.shadowColor = 'rgba(40,25,20,0.55)';
    c.shadowBlur = 16;
    c.shadowOffsetY = 8;
    c.drawImage(foil, 0, 0);
    c.restore();
    // highlight the cusp edges
    c.save();
    c.beginPath();
    c.arc(CX, SPRING, R_OPEN + 2, Math.PI, 0);
    c.strokeStyle = 'rgba(120,85,55,0.5)';
    c.lineWidth = 3;
    c.stroke();
    c.restore();
  }
  // ---- chhajja (sloped eave) above
  const eave = new Path2D();
  eave.moveTo(130, 372);
  eave.lineTo(950, 372);
  eave.lineTo(910, 318);
  eave.lineTo(170, 318);
  eave.closePath();
  carve(c, eave, tex, 1.2);
  carve(c, rectP(150, 372, 780, 22), tex, 0.6);
  for (let x = 170; x <= 910; x += 37) {
    c.fillStyle = 'rgba(120,85,55,0.35)';
    c.fillRect(x, 394, 3, 10);
  }
  // ---- bangaldar roof with domes
  const roof = new Path2D();
  roof.moveTo(200, 318);
  roof.bezierCurveTo(260, 200, 820, 200, 880, 318);
  roof.closePath();
  carve(c, roof, tex, 1);
  const rib = new Path2D();
  rib.moveTo(240, 304);
  rib.bezierCurveTo(300, 220, 780, 220, 840, 304);
  groove(c, rib, 2);
  const dome = (x: number, base: number, r: number) => {
    const d = new Path2D();
    d.moveTo(x - r, base);
    d.bezierCurveTo(x - r, base - r * 1.25, x - r * 0.15, base - r * 1.2, x, base - r * 1.55);
    d.bezierCurveTo(x + r * 0.15, base - r * 1.2, x + r, base - r * 1.25, x + r, base);
    d.closePath();
    carve(c, d, tex, 0.8);
    for (let k = -2; k <= 2; k++) {
      const g = new Path2D();
      g.moveTo(x + (k * r) / 2.6, base - 2);
      g.quadraticCurveTo(x + (k * r) / 3.4, base - r * 1.0, x, base - r * 1.5);
      groove(c, g, 1.4);
    }
    // kalash finial
    c.save();
    const gg = c.createLinearGradient(x - 10, 0, x + 10, 0);
    gg.addColorStop(0, '#B98A3E');
    gg.addColorStop(0.5, '#F3D38A');
    gg.addColorStop(1, '#A87830');
    c.fillStyle = gg;
    c.beginPath();
    c.arc(x, base - r * 1.55 - 10, 10, 0, Math.PI * 2);
    c.fill();
    c.fillRect(x - 3, base - r * 1.55 - 44, 6, 30);
    c.beginPath();
    c.arc(x, base - r * 1.55 - 46, 6, 0, Math.PI * 2);
    c.fill();
    c.restore();
  };
  dome(540, 236, 110);
  dome(268, 276, 50);
  dome(812, 276, 50);
  // ---- balcony: sill, jaali balustrade, base, corbels, pendant
  const sillY = ARCH.y + ARCH.h;
  carve(c, rectP(150, sillY, 780, 36), tex, 1);
  const balT = sillY + 36, balH = 128;
  carve(c, rectP(178, balT, 724, balH), tex, 0.8);
  // jaali: row of little cusped arches, recessed
  const nA = 9, aw = 724 / nA;
  for (let i = 0; i < nA; i++) {
    const x = 178 + i * aw + 12, w = aw - 24, y = balT + 16, h = balH - 30;
    const p = new Path2D();
    p.moveTo(x, y + h);
    p.lineTo(x, y + w / 2);
    p.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
    p.lineTo(x + w, y + h);
    p.closePath();
    c.save();
    c.fillStyle = 'rgba(95,65,50,0.42)';
    c.fill(p);
    c.clip(p);
    c.strokeStyle = 'rgba(238,223,198,0.7)';
    c.lineWidth = 3;
    for (let d = -h; d < w + h; d += 14) {
      c.beginPath();
      c.moveTo(x + d, y);
      c.lineTo(x + d + h, y + h);
      c.moveTo(x + d + h, y);
      c.lineTo(x + d, y + h);
      c.stroke();
    }
    c.restore();
    groove(c, p, 2);
  }
  const baseY = balT + balH;
  carve(c, rectP(150, baseY, 780, 30), tex, 1);
  // corbels
  for (const bx of [230, 540, 850]) {
    const p = new Path2D();
    p.moveTo(bx - 50, baseY + 30);
    p.lineTo(bx + 50, baseY + 30);
    p.bezierCurveTo(bx + 46, baseY + 70, bx + 18, baseY + 90, bx + 10, baseY + 120);
    p.lineTo(bx - 10, baseY + 120);
    p.bezierCurveTo(bx - 18, baseY + 90, bx - 46, baseY + 70, bx - 50, baseY + 30);
    p.closePath();
    carve(c, p, tex, 0.8);
    const knob = new Path2D();
    knob.arc(bx, baseY + 134, 14, 0, Math.PI * 2);
    carve(c, knob, tex, 0.5);
  }
  // gilt lotus pendant at centre
  lotus(c, 540, baseY + 170, 46, Math.PI, ['#FCE9D8', '#D98A6E']);
}

/** Mirror-work (shisha) rim around a circle slot. */
function mirrorRim(ctx: Ctx, s: Slot, seed: number) {
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2, r = s.w / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 30, 0, Math.PI * 2);
  ctx.arc(cx, cy, r - 2, 0, Math.PI * 2, true);
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, '#F3D9A0');
  g.addColorStop(0.5, '#C8954A');
  g.addColorStop(1, '#8A5F2C');
  ctx.fillStyle = g;
  ctx.shadowColor = 'rgba(40,30,60,0.45)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  ctx.fill();
  ctx.restore();
  // little mirrors with thread stitches
  const n = Math.round((r * 2 * Math.PI) / 46);
  const rr = rng(seed);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = cx + Math.cos(a) * (r + 15), y = cy + Math.sin(a) * (r + 15);
    const mg = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 9);
    mg.addColorStop(0, '#FFFFFF');
    mg.addColorStop(0.5, rr() > 0.5 ? '#D8D4E8' : '#F2D6C8');
    mg.addColorStop(1, '#7C7894');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(x, y, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B0305A';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.save();
  ctx.strokeStyle = 'rgba(255,240,210,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 29, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function duskLake(c: Ctx) {
  const w = 1080, h = 1920, horizon = 1240;
  const sky = c.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#7F7BAA');
  sky.addColorStop(0.45, '#C3A3C0');
  sky.addColorStop(0.8, '#F0B9A6');
  sky.addColorStop(1, '#F8D3B0');
  c.fillStyle = sky;
  c.fillRect(0, 0, w, horizon);
  // low sun glow
  const sun = c.createRadialGradient(860, horizon - 40, 10, 860, horizon - 40, 420);
  sun.addColorStop(0, 'rgba(255,236,200,0.95)');
  sun.addColorStop(0.15, 'rgba(255,214,170,0.6)');
  sun.addColorStop(1, 'rgba(255,214,170,0)');
  c.fillStyle = sun;
  c.fillRect(0, 0, w, horizon);
  // distant Aravalli hills + palace silhouette
  const r = rng(9);
  c.fillStyle = 'rgba(122,106,150,0.55)';
  c.beginPath();
  c.moveTo(0, horizon);
  for (let x = 0; x <= w; x += 60) c.lineTo(x, horizon - 70 - Math.sin(x / 170) * 40 - r() * 18);
  c.lineTo(w, horizon);
  c.fill();
  c.fillStyle = 'rgba(96,82,128,0.7)';
  c.beginPath();
  c.moveTo(0, horizon);
  let x = 0;
  while (x < w) {
    const bw = 40 + r() * 80, bh = 20 + r() * 50;
    c.lineTo(x, horizon - bh);
    if (r() > 0.6) c.arc(x + bw / 2, horizon - bh, bw / 4, Math.PI, 0);
    c.lineTo(x + bw, horizon - bh);
    x += bw;
  }
  c.lineTo(w, horizon);
  c.fill();
  // lake
  const lake = c.createLinearGradient(0, horizon, 0, h);
  lake.addColorStop(0, '#E7B7A8');
  lake.addColorStop(0.25, '#A99BBE');
  lake.addColorStop(1, '#4F5A86');
  c.fillStyle = lake;
  c.fillRect(0, horizon, w, h - horizon);
  // shimmer strokes
  for (let i = 0; i < 260; i++) {
    const y = horizon + 6 + Math.pow(r(), 1.6) * (h - horizon);
    const near = (y - horizon) / (h - horizon);
    const sx = 860 + (r() - 0.5) * (200 + near * 900);
    const len = 20 + r() * 80 * (1 + near);
    c.strokeStyle = `rgba(255,${200 + Math.floor(r() * 40)},${170 + Math.floor(r() * 40)},${0.25 + r() * 0.35})`;
    c.lineWidth = 1.5 + near * 3;
    c.beginPath();
    c.moveTo(sx, y);
    c.lineTo(sx + len, y);
    c.stroke();
  }
  // birds
  c.strokeStyle = 'rgba(70,60,100,0.7)';
  c.lineWidth = 3;
  for (const [bx, by, s] of [[140, 230, 1], [200, 200, 0.8], [960, 470, 0.7], [910, 520, 0.9]] as const) {
    c.beginPath();
    c.moveTo(bx - 18 * s, by);
    c.quadraticCurveTo(bx - 8 * s, by - 10 * s, bx, by);
    c.quadraticCurveTo(bx + 8 * s, by - 10 * s, bx + 18 * s, by);
    c.stroke();
  }
}

const jharokha: Template = {
  id: 'n3-jharokha',
  name: 'Jharokha Window',
  pack: 'navratri',
  direction: 'royal-diwali',
  fonts: [`italic 600 56px ${SERIF}`, `600 30px ${SERIF}`, `400 64px ${YATRA}`],
  slots: [ARCH, MIR1, MIR2],
  drawBackground(ctx) {
    ctx.drawImage(cached('n3-jh-dusk', 1080, 1920, duskLake), 0, 0);
  },
  drawForeground(ctx, w, h) {
    ctx.drawImage(cached('n3-jh-frame', 1080, 1920, jharokhaLayer), 0, 0);
    mirrorRim(ctx, MIR1, 3);
    mirrorRim(ctx, MIR2, 8);
    txt(ctx, 'झरोखे से', 558, 1676, `400 62px ${YATRA}`, '#FFF1DE', 'center', ['rgba(60,40,90,0.55)', 16]);
    txt(ctx, 'lake palace', 558, 1738, `italic 600 46px ${SERIF}`, '#FFF1DE', 'center', ['rgba(60,40,90,0.55)', 12]);
    txt(ctx, 'nights', 558, 1784, `italic 600 46px ${SERIF}`, '#FFF1DE', 'center', ['rgba(60,40,90,0.55)', 12]);
    txt(ctx, 'UDAIPUR · NAVRATRI 2026', 548, 1890, `600 26px ${SERIF}`, 'rgba(255,241,222,0.8)', 'center');
    grain(ctx, w, h, 0.05);
  },
};

const list: Template[] = [lotusPond, colourPop, jharokha];
export default list;
