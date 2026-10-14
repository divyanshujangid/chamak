// v4 luxe set: faithful recreations of two owner pins plus a boys-leaning carpet variant.
//  r4-carpet-gold   <- pins/177610779055065188 (black/ivory Persian carpet patchwork, gold frangipani, wax seal, bow + crown)
//  r4-kraft-velvet  <- pins/310607705571601721 (kraft | oxblood velvet split, dried hibiscus, chrome stars, lyric)
//  r4-carpet-noir   <- same carpet recipe in black/indigo with oxidised silver kada, stars and seal (no florals)
// All art is raster: public-domain / CC0 museum and Commons photos, cut out and toned by us
// (see public/art/ref/CREDITS-luxe.md). Carpets are pre-composed patchworks.
import '@fontsource/anton/400.css';
import type { Template } from '../../engine/types';
import { art } from '../../engine/assets';
import { cached } from '../v2/art';

type Ctx = CanvasRenderingContext2D;
const ANTON = '"Anton", Impact, "Arial Narrow", sans-serif';

/* ---------- code-drawn faceted chrome star (ported from the v3 Garba Disco set) ---------- */
const TAU = Math.PI * 2;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const hexRgb = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
/** Piecewise colour ramp, t in 0..1. */
function ramp(stops: string[], t: number, a = 1) {
  t = clamp(t) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(t));
  const f = t - i;
  const c0 = hexRgb(stops[i]), c1 = hexRgb(stops[i + 1]);
  const m = (k: number) => Math.round(c0[k] + (c1[k] - c0[k]) * f);
  return `rgba(${m(0)},${m(1)},${m(2)},${a})`;
}
function glint(c: Ctx, x: number, y: number, s: number, a = 1, color = '255,255,255') {
  c.save();
  c.translate(x, y);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, s * 0.9);
  g.addColorStop(0, `rgba(${color},${0.9 * a})`);
  g.addColorStop(0.25, `rgba(${color},${0.3 * a})`);
  g.addColorStop(1, `rgba(${color},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, s * 0.9, 0, TAU);
  c.fill();
  c.fillStyle = `rgba(255,255,255,${a})`;
  // horizontal + vertical spikes, slim diagonals
  for (const [len, wid, rot] of [[1, 0.07, 0], [1, 0.07, Math.PI / 2], [0.45, 0.05, Math.PI / 4], [0.45, 0.05, -Math.PI / 4]]) {
    c.save();
    c.rotate(rot);
    c.beginPath();
    c.moveTo(-s * len, 0);
    c.quadraticCurveTo(0, -s * wid, s * len, 0);
    c.quadraticCurveTo(0, s * wid, -s * len, 0);
    c.fill();
    c.restore();
  }
  c.restore();
}

/** Faceted chrome 3D star (10 bevel facets lit from upper left). */
function chromeStar(R0: number, red: boolean, rot: number) {
  const m = R0 * 0.5;
  const S = R0 * 2 + m * 2;
  return cached(`lx-cstar-${R0}-${red}-${rot}`, S, S, (c) => {
    c.translate(S / 2, S / 2);
    c.rotate(rot);
    const ri = R0 * 0.48, H = R0 * 0.42;
    const pts: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? ri : R0;
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    // silhouette with drop shadow (bevel thickness + cast shadow)
    const path = new Path2D();
    path.moveTo(...pts[0]);
    for (const p of pts.slice(1)) path.lineTo(...p);
    path.closePath();
    c.save();
    c.shadowColor = 'rgba(10,0,2,0.55)';
    c.shadowBlur = R0 * 0.22;
    c.shadowOffsetX = R0 * 0.06;
    c.shadowOffsetY = R0 * 0.16;
    c.fillStyle = red ? '#3A0207' : '#2E3136';
    c.fill(path);
    c.restore();
    const stops = red
      ? ['#2A0105', '#6E0710', '#B3121B', '#F0434C', '#FFC9CC', '#FFFFFF']
      : ['#24272C', '#5D636B', '#9DA3AB', '#D7DBE0', '#F7F8FA', '#FFFFFF'];
    const L = [-0.55, -0.65, 0.53];
    const unrot = (x: number, y: number) => [x * Math.cos(rot) - y * Math.sin(rot), x * Math.sin(rot) + y * Math.cos(rot)];
    for (let i = 0; i < 10; i++) {
      const p = pts[i], q = pts[(i + 1) % 10];
      // normal of triangle (centre raised by H, p, q) in world (unrotated light)
      const u = [p[0], p[1], -H], v = [q[0], q[1], -H];
      let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      if (n[2] < 0) n = n.map((x) => -x);
      const len = Math.hypot(...n);
      n = n.map((x) => x / len);
      const [wx, wy] = unrot(n[0], n[1]);
      const s = clamp(0.5 + 0.62 * (wx * L[0] + wy * L[1] + n[2] * L[2] - 0.35));
      const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      const g = c.createLinearGradient(0, 0, mx, my);
      g.addColorStop(0, ramp(stops, s + 0.28));
      g.addColorStop(0.42, ramp(stops, s));
      g.addColorStop(0.7, ramp(stops, s - 0.26));
      g.addColorStop(1, ramp(stops, s + 0.12));
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(p[0], p[1]);
      c.lineTo(q[0], q[1]);
      c.closePath();
      c.fillStyle = g;
      c.fill();
    }
    // ridge lines
    c.lineWidth = Math.max(1, R0 * 0.018);
    for (let i = 0; i < 10; i++) {
      c.strokeStyle = i % 2 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.55)';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(pts[i][0], pts[i][1]);
      c.stroke();
    }
    c.strokeStyle = red ? 'rgba(255,190,195,0.5)' : 'rgba(255,255,255,0.6)';
    c.lineWidth = Math.max(1, R0 * 0.02);
    c.stroke(path);
    c.rotate(-rot);
    glint(c, -R0 * 0.12, -R0 * 0.2, R0 * 0.55, 0.95);
  });
}

/** Draw a silver chrome star of outer radius r centred on (x, y). */
function silverStar(ctx: Ctx, x: number, y: number, r: number, rot = 0) {
  const img = chromeStar(r, false, rot);
  ctx.drawImage(img, x - img.width / 2, y - img.height / 2);
}


/** Draw art by width, centred on (cx, cy), with rotation and a soft drop shadow. */
function put(ctx: Ctx, name: string, cx: number, cy: number, w: number, rot = 0, shadow = 0.5, blur = 18, dy = 8) {
  const img = art(name);
  if (!img) return;
  const h = (w * img.height) / img.width;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  if (shadow) {
    ctx.shadowColor = `rgba(0,0,0,${shadow})`;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetY = dy;
    ctx.shadowOffsetX = dy * 0.3;
  }
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function cover(ctx: Ctx, name: string, x: number, y: number, w: number, h: number) {
  const img = art(name);
  if (!img) return false;
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s, sh = h / s;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
  return true;
}

/** Dark lift under each photo block so it sits on the carpet like a print. */
function slotShadows(ctx: Ctx, t: Template, alpha = 0.55) {
  ctx.save();
  ctx.shadowColor = `rgba(0,0,0,${alpha})`;
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#0b0a08';
  for (const s of t.slots) {
    ctx.beginPath();
    if (s.shape === 'circle') ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2, s.w / 2, s.h / 2, 0, 0, Math.PI * 2);
    else ctx.rect(s.x, s.y, s.w, s.h);
    ctx.fill();
  }
  ctx.restore();
}

/* ---------- 1. black + gold carpet patchwork ---------- */
const carpetGold: Template = {
  id: 'r4-carpet-gold',
  name: 'Carpet Gold',
  pack: 'navratri',
  direction: 'royal-diwali',
  fonts: [],
  art: ['ref/lx-carpet-gold', 'ref/lx-frangipani-gold', 'ref/lx-seal-gold', 'ref/lx-bow', 'ref/lx-crown'],
  slots: [
    { id: 'top', x: 142, y: 117, w: 875, h: 470, shape: 'rect' },
    { id: 'left', x: 56, y: 722, w: 450, h: 797, shape: 'rect' },
    { id: 'circle', x: 616, y: 640, w: 452, h: 452, shape: 'circle' },
    { id: 'square', x: 525, y: 1255, w: 536, h: 547, shape: 'rect' },
  ],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#0b0906';
    ctx.fillRect(0, 0, w, h);
    cover(ctx, 'ref/lx-carpet-gold', 0, 0, w, h);
    slotShadows(ctx, carpetGold);
  },
  drawForeground(ctx) {
    put(ctx, 'ref/lx-frangipani-gold', 100, 104, 230, -12);
    put(ctx, 'ref/lx-bow', 612, 712, 340, -20, 0.45);
    put(ctx, 'ref/lx-crown', 526, 640, 138, -14, 0.5, 12, 5);
    put(ctx, 'ref/lx-frangipani-gold', 972, 1176, 205, 24);
    put(ctx, 'ref/lx-seal-gold', 92, 1606, 178, -8, 0.55);
    put(ctx, 'ref/lx-frangipani-gold', 470, 1826, 205, 4);
  },
};

/* ---------- 2. kraft | oxblood velvet split with dried hibiscus + lyric ---------- */
const SPLIT = 555;
const kraftVelvet: Template = {
  id: 'r4-kraft-velvet',
  name: 'Kraft & Velvet',
  pack: 'navratri',
  direction: 'royal-diwali',
  fonts: ['400 146px "Anton"'],
  art: ['ref/lx-kraft', 'velvet-maroon', 'ref/lx-hibiscus-dried'],
  slots: [{ id: 'hero', x: 105, y: 484, w: 575, h: 990, shape: 'rect' }],
  drawBackground(ctx, w, h) {
    // kraft paper, left half
    ctx.fillStyle = '#c9ab82';
    ctx.fillRect(0, 0, SPLIT, h);
    const kraft = art('ref/lx-kraft');
    if (kraft) {
      const pat = ctx.createPattern(kraft, 'repeat');
      if (pat) {
        ctx.save();
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, SPLIT, h);
        ctx.restore();
      }
    }
    // pull the orange kraft toward the reference's greyed sandy beige
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = 'rgba(128,128,128,0.55)';
    ctx.fillRect(0, 0, SPLIT, h);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#e6dccd';
    ctx.fillRect(0, 0, SPLIT, h);
    ctx.restore();
    // oxblood velvet, right half
    ctx.fillStyle = '#3b0b10';
    ctx.fillRect(SPLIT, 0, w - SPLIT, h);
    cover(ctx, 'velvet-maroon', SPLIT, 0, w - SPLIT, h);
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#6a2128';
    ctx.fillRect(SPLIT, 0, w - SPLIT, h);
    ctx.restore();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(20,2,4,0.55)');
    g.addColorStop(0.45, 'rgba(60,6,12,0.05)');
    g.addColorStop(1, 'rgba(20,2,4,0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(SPLIT, 0, w - SPLIT, h);
    // seam shadow where velvet meets paper
    const sg = ctx.createLinearGradient(SPLIT, 0, SPLIT + 26, 0);
    sg.addColorStop(0, 'rgba(0,0,0,0.45)');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(SPLIT, 0, 26, h);
    slotShadows(ctx, kraftVelvet, 0.5);
    // the pressed hibiscus tucks behind the photo's right edge, as in the pin
    put(ctx, 'ref/lx-hibiscus-dried', 828, 972, 430, -8, 0.5, 22, 10);
  },
  drawForeground(ctx) {
    silverStar(ctx, 812, 508, 30, 0.12);
    silverStar(ctx, 888, 668, 62, -0.18);
    // original Hinglish lyric (white, bold condensed, ragged left like the pin)
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(25,4,6,0.75)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 3;
    ctx.font = `400 80px ${ANTON}`;
    ctx.fillText('RAAT BHAR', 668, 1000);
    ctx.font = `400 146px ${ANTON}`;
    ctx.fillText('GARBA,', 664, 1150);
    ctx.font = `400 80px ${ANTON}`;
    ctx.fillText('DIL BHAR', 668, 1240);
    ctx.restore();
  },
};

/* ---------- 3. black + indigo carpet, oxidised silver (boys) ---------- */
const carpetNoir: Template = {
  id: 'r4-carpet-noir',
  name: 'Carpet Noir',
  pack: 'navratri',
  direction: 'royal-diwali',
  fonts: [],
  art: ['ref/lx-carpet-noir', 'ref/lx-kada-silver', 'ref/lx-seal-silver'],
  slots: [
    { id: 'tall', x: 64, y: 140, w: 560, h: 830, shape: 'rect' },
    { id: 'side', x: 664, y: 470, w: 356, h: 470, shape: 'rect' },
    { id: 'wide', x: 120, y: 1080, w: 900, h: 640, shape: 'rect' },
  ],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#05060b';
    ctx.fillRect(0, 0, w, h);
    cover(ctx, 'ref/lx-carpet-noir', 0, 0, w, h);
    slotShadows(ctx, carpetNoir, 0.65);
  },
  drawForeground(ctx) {
    silverStar(ctx, 860, 292, 84, 0.2);
    put(ctx, 'ref/lx-kada-silver', 846, 1016, 330, -10, 0.6, 22, 10);
    put(ctx, 'ref/lx-seal-silver', 96, 1012, 150, 10, 0.6);
    silverStar(ctx, 1002, 1806, 46, -0.25);
  },
};

const list: Template[] = [carpetGold, kraftVelvet, carpetNoir];
export default list;
