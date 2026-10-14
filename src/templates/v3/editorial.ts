// v3 editorial showpieces: Garba Disco (T1), Lyric Poster (T2), Dolled Up Strip (T9), Desi Sticker Bomb (T12).
// All art is drawn in code. Expensive layers (disco balls, chrome stars, damask, stickers, newsprint)
// are baked once into cached offscreen canvases so a render is a handful of drawImage calls.
import '@fontsource/anton/400.css';
import '@fontsource/archivo-black/400.css';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/caveat/700.css';
import '@fontsource/pinyon-script/400.css';
import '@fontsource/rozha-one/400.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/playfair-display/700-italic.css';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import '@fontsource/courier-prime/700.css';
import '@fontsource/cinzel/700.css';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/dm-sans';
import type { Slot, Template } from '../../engine/types';
import { cached, grain, lotus, marigold, miniPlayer, rng, rotateAbout, velvet } from '../v2/art';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const SANS = '"DM Sans Variable", system-ui, sans-serif';
const MONO = '"Space Mono", ui-monospace, monospace';
const BRICO = '"Bricolage Grotesque Variable", system-ui, sans-serif';

/* ============================================================ shared helpers */

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

/** Only bake text into a cache once its font is really there. */
function fontsReady(fonts: string[]) {
  try {
    return fonts.every((f) => document.fonts.check(f));
  } catch {
    return true;
  }
}

/** Like cached(), but draws uncached (and retries next time) while fonts are still loading. */
function cachedText(key: string, w: number, h: number, fonts: string[], draw: (c: Ctx) => void) {
  if (fontsReady(fonts)) return cached(key, w, h, draw);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  return c;
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  return c;
}

/** Bake a die-cut sticker: art + white outline + soft drop shadow, into one canvas.
 *  `draw` paints the art with (0,0) at the top-left of a w*h box. */
function bakeSticker(c: Ctx, w: number, h: number, pad: number, outline: number, draw: (c: Ctx) => void) {
  const W = w + pad * 2, H = h + pad * 2;
  const artC = canvas(W, H);
  const a = artC.getContext('2d')!;
  a.translate(pad, pad);
  draw(a);
  // white silhouette
  const sil = canvas(W, H);
  const s = sil.getContext('2d')!;
  s.drawImage(artC, 0, 0);
  s.globalCompositeOperation = 'source-in';
  s.fillStyle = '#FFFFFF';
  s.fillRect(0, 0, W, H);
  // dilate the silhouette into an outline layer
  const out = canvas(W, H);
  const o = out.getContext('2d')!;
  for (const rr of [outline, outline * 0.6]) {
    const n = 28;
    for (let i = 0; i < n; i++) o.drawImage(sil, Math.cos((i / n) * TAU) * rr, Math.sin((i / n) * TAU) * rr);
  }
  c.save();
  c.shadowColor = 'rgba(40,10,20,0.38)';
  c.shadowBlur = outline * 1.6;
  c.shadowOffsetX = outline * 0.25;
  c.shadowOffsetY = outline * 0.7;
  c.drawImage(out, 0, 0);
  c.restore();
  c.drawImage(artC, 0, 0);
}

function stickerCanvas(key: string, w: number, h: number, outline: number, draw: (c: Ctx) => void, fonts: string[] = []) {
  const pad = outline * 3 + 6;
  return cachedText(key, w + pad * 2, h + pad * 2, fonts, (c) => bakeSticker(c, w, h, pad, outline, draw));
}

/** Draw a baked sticker centred at (x,y), scaled to width `dw`, rotated in degrees. */
function place(ctx: Ctx, img: HTMLCanvasElement, x: number, y: number, dw: number, rot = 0) {
  const k = dw / img.width;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.drawImage(img, (-img.width * k) / 2, (-img.height * k) / 2, img.width * k, img.height * k);
  ctx.restore();
}

/** Four-point lens glint with glow. */
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

/* ============================================================ 1. GARBA DISCO */

/** Mirror ball: a tilted sphere of square facets, each lit with random lightness, plus glints. */
function discoBall(r: number, seed: number) {
  const m = Math.ceil(r * 0.25);
  const S = r * 2 + m * 2;
  return cached(`n3-disco-${r}-${seed}`, S, S, (c) => {
    const R = rng(seed);
    c.translate(S / 2, S / 2);
    // dark grout sphere
    const base = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.05, 0, 0, r);
    base.addColorStop(0, '#3A3B40');
    base.addColorStop(0.6, '#26262B');
    base.addColorStop(1, '#09090B');
    c.beginPath();
    c.arc(0, 0, r, 0, TAU);
    c.fillStyle = base;
    c.fill();
    c.save();
    c.clip();
    const tilt = 0.42, spin = 0.3;
    const L = (() => { const v = [-0.5, 0.62, 0.6]; const n = Math.hypot(...v); return v.map((x) => x / n); })();
    const Hh = (() => { const v = [L[0], L[1], L[2] + 1]; const n = Math.hypot(...v); return v.map((x) => x / n); })();
    const P = (phi: number, th: number) => {
      const x = Math.cos(phi) * Math.sin(th + spin), y = Math.sin(phi), z = Math.cos(phi) * Math.cos(th + spin);
      return [x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)];
    };
    const rows = Math.max(18, Math.round(r / 7.5));
    for (let i = 0; i < rows; i++) {
      const p0 = -Math.PI / 2 + (i / rows) * Math.PI, p1 = p0 + Math.PI / rows;
      const pm = (p0 + p1) / 2;
      const n = Math.max(4, Math.round(rows * 2 * Math.cos(pm)));
      const off = R() * TAU;
      for (let j = 0; j < n; j++) {
        const t0 = off + (j / n) * TAU, t1 = t0 + TAU / n;
        const g = 0.09; // grout inset
        const a0 = p0 + (p1 - p0) * g, a1 = p1 - (p1 - p0) * g;
        const b0 = t0 + (t1 - t0) * g, b1 = t1 - (t1 - t0) * g;
        const nc = P(pm, (t0 + t1) / 2);
        if (nc[2] < 0.03) continue;
        const pts = [P(a0, b0), P(a0, b1), P(a1, b1), P(a1, b0)];
        const diff = Math.max(0, nc[0] * L[0] + nc[1] * L[1] + nc[2] * L[2]);
        const spec = Math.pow(Math.max(0, nc[0] * Hh[0] + nc[1] * Hh[1] + nc[2] * Hh[2]), 60);
        const q = R();
        let v = 0.04 + diff * (q < 0.4 ? 0.22 * R() : 0.35 + 0.65 * R()) + spec * 1.1;
        const roll = R();
        let col: string;
        if (roll < 0.06 + diff * 0.08) v = 0.98;
        v *= 0.45 + 0.55 * nc[2];
        if (roll > 0.05 && roll < 0.15) {
          // reflects the oxblood room
          col = ramp(['#1A0306', '#6B1520', '#C2414F', '#FFD6D9'], v * 1.05);
        } else if (roll > 0.15 && roll < 0.19) {
          col = ramp(['#1B1206', '#7A5418', '#E8B85A', '#FFF4D6'], v * 1.05);
        } else {
          col = ramp(['#060608', '#2C2F35', '#8C929B', '#DCE0E5', '#FFFFFF'], v);
        }
        c.beginPath();
        c.moveTo(pts[0][0] * r, -pts[0][1] * r);
        for (let k = 1; k < 4; k++) c.lineTo(pts[k][0] * r, -pts[k][1] * r);
        c.closePath();
        c.fillStyle = col;
        c.fill();
        // tiny bevel highlight along the upper edge of bright facets
        if (v > 0.55) {
          c.strokeStyle = 'rgba(255,255,255,0.35)';
          c.lineWidth = Math.max(0.6, r / 260);
          c.beginPath();
          c.moveTo(pts[0][0] * r, -pts[0][1] * r);
          c.lineTo(pts[1][0] * r, -pts[1][1] * r);
          c.stroke();
        }
      }
    }
    // limb shading + rim light
    const limb = c.createRadialGradient(-r * 0.15, -r * 0.2, r * 0.5, 0, 0, r);
    limb.addColorStop(0, 'rgba(0,0,0,0)');
    limb.addColorStop(0.85, 'rgba(0,0,0,0.25)');
    limb.addColorStop(1, 'rgba(0,0,0,0.6)');
    c.fillStyle = limb;
    c.fillRect(-r, -r, r * 2, r * 2);
    const rim = c.createRadialGradient(r * 0.25, r * 0.3, r * 0.75, 0, 0, r * 1.02);
    rim.addColorStop(0, 'rgba(255,120,130,0)');
    rim.addColorStop(1, 'rgba(255,170,175,0.14)');
    c.fillStyle = rim;
    c.fillRect(-r, -r, r * 2, r * 2);
    c.restore();
    // glints on the lit side
    const lx = L[0] * r * 0.62, ly = -L[1] * r * 0.62;
    glint(c, lx, ly, r * 0.42, 1);
    for (let i = 0; i < 7; i++) {
      const a = R() * TAU, d = R() * r * 0.75;
      const gx = Math.cos(a) * d, gy = Math.sin(a) * d;
      if (gx * L[0] - gy * L[1] < -r * 0.15) continue;
      glint(c, gx, gy, r * (0.1 + R() * 0.16), 0.9);
    }
  });
}

/** Faceted chrome 3D star (10 bevel facets lit from upper left). */
function chromeStar(R0: number, red: boolean, rot: number) {
  const m = R0 * 0.5;
  const S = R0 * 2 + m * 2;
  return cached(`n3-cstar-${R0}-${red}-${rot}`, S, S, (c) => {
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

const DISCO_SLOT: Slot = { id: 'pola', x: 150, y: 330, w: 780, h: 900, shape: 'rect', rotate: -4 };
const DISCO_PAD = 34, DISCO_LIP = 210;

const garbaDisco: Template = {
  id: 'n3-garba-disco',
  name: 'Garba Disco',
  pack: 'navratri',
  direction: 'y2k-chrome',
  fonts: ['700 110px "Caveat"', `800 150px ${BRICO}`, `700 26px ${MONO}`],
  slots: [DISCO_SLOT],
  drawBackground(ctx, w, h) {
    const bg = cached('n3-disco-bg', w, h, (c) => {
      velvet(c, 0, 0, w, h, '#22050A', '#5A1219', 61);
      const v = c.createRadialGradient(560, 820, 120, 540, 960, 1250);
      v.addColorStop(0, 'rgba(120,20,32,0.35)');
      v.addColorStop(0.6, 'rgba(40,6,11,0.15)');
      v.addColorStop(1, 'rgba(10,1,3,0.75)');
      c.fillStyle = v;
      c.fillRect(0, 0, w, h);
      // reflected light spots thrown by the balls on the wall
      const R = rng(906);
      for (let i = 0; i < 70; i++) {
        const x = R() * w, y = R() * h, s = 8 + R() * 34;
        c.save();
        c.translate(x, y);
        c.rotate(R() * 3);
        c.scale(1, 0.55 + R() * 0.4);
        const g = c.createRadialGradient(0, 0, 0, 0, 0, s);
        const warm = R() < 0.3;
        g.addColorStop(0, warm ? 'rgba(255,214,200,0.55)' : 'rgba(255,255,255,0.6)');
        g.addColorStop(0.45, warm ? 'rgba(255,150,150,0.22)' : 'rgba(230,236,255,0.22)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, s, 0, TAU);
        c.fill();
        c.restore();
      }
      // sharp flecks
      for (let i = 0; i < 160; i++) {
        const x = R() * w, y = R() * h, s = 1.5 + R() * 3.5;
        c.fillStyle = `rgba(255,${230 + R() * 25},${225 + R() * 30},${0.35 + R() * 0.5})`;
        c.fillRect(x, y, s, s);
      }
      for (let i = 0; i < 26; i++) glint(c, R() * w, R() * h, 10 + R() * 22, 0.55 + R() * 0.4);
      grain(c, w, h, 0.07);
    });
    ctx.drawImage(bg, 0, 0, w, h);
    // hanging ball, top right (behind the polaroid)
    ctx.save();
    ctx.strokeStyle = 'rgba(200,205,212,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(925, 0);
    ctx.lineTo(925, 40);
    ctx.stroke();
    ctx.restore();
    const top = discoBall(230, 11);
    ctx.drawImage(top, 925 - top.width / 2, 250 - top.height / 2);
    // polaroid card
    const s = DISCO_SLOT;
    ctx.save();
    rotateAbout(ctx, s);
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 26;
    ctx.fillStyle = '#F2F0EC';
    ctx.fillRect(s.x - DISCO_PAD, s.y - DISCO_PAD, s.w + DISCO_PAD * 2, s.h + DISCO_PAD + DISCO_LIP);
    ctx.shadowColor = 'transparent';
    const sheen = ctx.createLinearGradient(s.x, s.y, s.x + s.w, s.y + s.h + DISCO_LIP);
    sheen.addColorStop(0, 'rgba(255,255,255,0.5)');
    sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
    sheen.addColorStop(1, 'rgba(120,100,90,0.12)');
    ctx.fillStyle = sheen;
    ctx.fillRect(s.x - DISCO_PAD, s.y - DISCO_PAD, s.w + DISCO_PAD * 2, s.h + DISCO_PAD + DISCO_LIP);
    ctx.restore();
  },
  drawForeground(ctx, w, h) {
    const s = DISCO_SLOT;
    // inner photo edge + caption on the polaroid lip
    ctx.save();
    rotateAbout(ctx, s);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x, s.y, s.w, s.h);
    ctx.font = '700 112px "Caveat", cursive';
    ctx.fillStyle = '#26181A';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('garba szn', s.x + 18, s.y + s.h + 136);
    const tw = ctx.measureText('garba szn').width;
    ctx.font = '86px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    ctx.fillText('🪩', s.x + 40 + tw, s.y + s.h + 128);
    ctx.font = `700 24px ${MONO}`;
    ctx.fillStyle = 'rgba(38,24,26,0.55)';
    ctx.textAlign = 'right';
    ctx.fillText('NIGHT 04 · 14.10', s.x + s.w, s.y + s.h + 128);
    ctx.restore();

    // bottom-left ball, cropped by the corner
    const bl = discoBall(300, 29);
    ctx.drawImage(bl, 40 - bl.width / 2, 1870 - bl.height / 2);

    // chrome wordmark
    const word = cachedText('n3-disco-word', 760, 330, [`800 150px ${BRICO}`], (c) => {
      c.font = `800 148px ${BRICO}`;
      c.textAlign = 'right';
      c.textBaseline = 'alphabetic';
      const lines = ['DISCO', 'DANDIYA'];
      const ys = [140, 290];
      lines.forEach((t, i) => {
        const y = ys[i];
        const g = c.createLinearGradient(0, y - 115, 0, y + 6);
        g.addColorStop(0, '#FFFFFF');
        g.addColorStop(0.38, '#C9CCD1');
        g.addColorStop(0.5, '#5E626A');
        g.addColorStop(0.56, '#E9ECEF');
        g.addColorStop(0.8, '#9AA0A8');
        g.addColorStop(1, '#F4F5F7');
        c.save();
        c.shadowColor = 'rgba(0,0,0,0.6)';
        c.shadowBlur = 18;
        c.shadowOffsetY = 8;
        c.lineJoin = 'round';
        c.lineWidth = 10;
        c.strokeStyle = '#2B0A0E';
        c.strokeText(t, 750, y);
        c.restore();
        c.fillStyle = g;
        c.fillText(t, 750, y);
        c.lineWidth = 2;
        c.strokeStyle = 'rgba(255,255,255,0.7)';
        c.strokeText(t, 750, y);
      });
    });
    ctx.drawImage(word, 1040 - 760, 1450);

    // chrome stars
    const stars: [number, number, number, boolean, number][] = [
      [118, 300, 78, false, 0.2],
      [990, 520, 62, true, -0.25],
      [70, 930, 54, true, 0.4],
      [1010, 1150, 92, false, -0.1],
      [455, 1500, 46, true, 0.15],
      [300, 1700, 58, false, 0.5],
      [985, 1830, 50, true, -0.35],
    ];
    for (const [x, y, r, red, rot] of stars) {
      const img = chromeStar(r, red, rot);
      ctx.drawImage(img, x - img.width / 2, y - img.height / 2);
    }
    grain(ctx, w, h, 0.05);
  },
};

/* ============================================================ 2. LYRIC POSTER */

const LYRIC = ['DHOL BAJE', 'TOH DIL', 'NACHE', 'RAAT', 'BHAR'];
const LP = { x: 48, y: 96, w: 548 };

const lyricPoster: Template = {
  id: 'n3-lyric-poster',
  name: 'Lyric Poster',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: ['400 120px "Anton"', `700 22px ${MONO}`, `400 22px ${MONO}`, `700 26px ${SANS}`],
  slots: [
    { id: 'hero', x: 0, y: 900, w: 1080, h: 1020, shape: 'rect', mono: true },
    { id: 'c1', x: 616, y: 96, w: 416, h: 250, shape: 'rect' },
    { id: 'c2', x: 616, y: 362, w: 416, h: 250, shape: 'rect' },
    { id: 'c3', x: 616, y: 628, w: 416, h: 250, shape: 'rect' },
  ],
  drawBackground(ctx, w, h) {
    const bg = cached('n3-lyric-bg', w, h, (c) => {
      c.fillStyle = '#EFEBE3';
      c.fillRect(0, 0, w, h);
      grain(c, w, h, 0.09, 'multiply');
    });
    ctx.drawImage(bg, 0, 0, w, h);
    // header rule
    ctx.save();
    ctx.font = `700 20px ${MONO}`;
    ctx.fillStyle = '#0B0B0B';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('VOL.04', LP.x, 70);
    ctx.textAlign = 'right';
    ctx.fillText('NAVRATRI EDIT ’26', 1032, 70);
    ctx.fillRect(LP.x + 110, 63, 1032 - LP.x - 110 - 270, 2);
    ctx.restore();
  },
  drawForeground(ctx, w, h) {
    // lyric block (pre-baked type)
    const block = cachedText('n3-lyric-block', LP.w, 560, ['400 120px "Anton"', `700 22px ${MONO}`], (c) => {
      c.fillStyle = '#0B0B0B';
      c.fillRect(0, 0, LP.w, 560);
      const pad = 34, inner = LP.w - pad * 2;
      c.textBaseline = 'alphabetic';
      c.fillStyle = '#FFFFFF';
      let y = pad + 6;
      const caps = 0.88; // Anton cap height / em
      const sizes = LYRIC.map((t) => {
        c.font = '400 100px "Anton"';
        return Math.min(150, (100 * inner) / c.measureText(t).width);
      });
      // scale everything so the stack fits the block
      const total = sizes.reduce((a, s) => a + s * caps, 0) + (LYRIC.length - 1) * 20;
      const room = 560 - pad * 2 - 34;
      const k = Math.min(1, room / total);
      LYRIC.forEach((t, i) => {
        const fs = sizes[i] * k;
        y += fs * caps;
        c.font = `400 ${fs}px "Anton"`;
        if (i === 2) {
          c.fillStyle = '#C8283C';
          c.fillText(t, pad, y);
          c.fillStyle = '#FFFFFF';
        } else c.fillText(t, pad, y);
        y += 20 * k;
      });
      c.font = `400 17px ${MONO}`;
      c.fillStyle = 'rgba(255,255,255,0.6)';
      c.fillText('— track 04, side A', pad, 560 - pad + 6);
      c.textAlign = 'right';
      c.fillText('♪ 2:14', LP.w - pad, 560 - pad + 6);
    });
    ctx.drawImage(block, LP.x, LP.y);
    miniPlayer(ctx, LP.x, LP.y + 560 + 22, LP.w * 0.82, 'Dhol Baje (Garba Mix)', 'Raat Bhar · Navratri ’26', 0.36, 'rgba(11,11,11,0.94)');

    // numbered tags on the colour stack
    ctx.save();
    ctx.font = `700 20px ${MONO}`;
    ['01', '02', '03'].forEach((n, i) => {
      const y = 96 + i * 266;
      ctx.fillStyle = '#0B0B0B';
      ctx.fillRect(616, y, 52, 32);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(n, 627, y + 23);
    });
    ctx.restore();

    // hero overlays: legibility fade, emoji row, handle, edge rule
    const fade = ctx.createLinearGradient(0, 1620, 0, 1920);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 1620, w, 300);
    ctx.fillStyle = '#0B0B0B';
    ctx.fillRect(0, 892, w, 8);
    ctx.save();
    ctx.font = '64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 12;
    ctx.fillText('🦢🧿✨', 52, 1850);
    ctx.shadowBlur = 0;
    ctx.font = `700 22px ${MONO}`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.textAlign = 'right';
    ctx.fillText('DHOL BAJE / TOH DIL NACHE', 1032, 1822);
    ctx.font = `400 20px ${MONO}`;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('raat bhar, nau raatein.', 1032, 1852);
    ctx.restore();
    grain(ctx, w, h, 0.06);
  },
};

/* ============================================================ 3. DOLLED UP STRIP */

const SPLIT = 410;
const STRIP = { cx: 520, cy: 925, w: 470, h: 1650, rot: 2.2 };
const FRAME = { w: 410, h: 448, top: 34, gap: 22 };
function stripSlots(): Slot[] {
  const a = (STRIP.rot * Math.PI) / 180;
  return [0, 1, 2].map((i) => {
    const ly = -STRIP.h / 2 + FRAME.top + i * (FRAME.h + FRAME.gap) + FRAME.h / 2; // local centre
    const cx = STRIP.cx - Math.sin(a) * ly, cy = STRIP.cy + Math.cos(a) * ly;
    return { id: `f${i + 1}`, x: Math.round(cx - FRAME.w / 2), y: Math.round(cy - FRAME.h / 2), w: FRAME.w, h: FRAME.h, shape: 'rect', rotate: STRIP.rot } as Slot;
  });
}
const STRIP_SLOTS = stripSlots();

/** One damask medallion, centred at 0,0, roughly 150 x 230. */
function damaskMotif(c: Ctx) {
  for (const k of [-1, 1]) {
    c.save();
    c.scale(k, 1);
    // outer ogee arms
    c.beginPath();
    c.moveTo(0, -112);
    c.bezierCurveTo(26, -84, 62, -66, 60, -24);
    c.bezierCurveTo(58, 10, 24, 18, 30, 50);
    c.bezierCurveTo(36, 78, 68, 82, 70, 104);
    c.bezierCurveTo(48, 112, 18, 98, 0, 118);
    c.lineTo(0, 92);
    c.bezierCurveTo(12, 80, 22, 70, 12, 52);
    c.bezierCurveTo(2, 28, 36, 8, 36, -22);
    c.bezierCurveTo(36, -52, 12, -62, 0, -80);
    c.closePath();
    c.fill();
    // scroll curls
    c.beginPath();
    c.arc(52, -30, 16, -0.4, 4.2);
    c.arc(46, -30, 6, 4.2, -0.4, true);
    c.closePath();
    c.fill();
    c.beginPath();
    c.ellipse(46, 74, 10, 20, 0.6, 0, TAU);
    c.fill();
    // side leaf
    c.beginPath();
    c.moveTo(66, -6);
    c.quadraticCurveTo(96, -20, 86, -56);
    c.quadraticCurveTo(74, -26, 66, -6);
    c.fill();
    c.restore();
  }
  // central bud
  c.beginPath();
  c.moveTo(0, -60);
  c.bezierCurveTo(16, -40, 16, -10, 0, 6);
  c.bezierCurveTo(-16, -10, -16, -40, 0, -60);
  c.fill();
  c.beginPath();
  c.arc(0, 30, 9, 0, TAU);
  c.fill();
  // little crown
  c.beginPath();
  c.arc(0, -126, 7, 0, TAU);
  c.fill();
}

function damask(w: number, h: number) {
  return cached(`n3-damask-${w}x${h}`, w, h, (c) => {
    c.fillStyle = '#EDE6D8';
    c.fillRect(0, 0, w, h);
    const tile = (ox: number, oy: number, color: string) => {
      c.fillStyle = color;
      for (let row = -1; row < h / 260 + 1; row++) {
        for (let col = -1; col < w / 200 + 1; col++) {
          const x = col * 200 + (row % 2 ? 100 : 0) + ox + 60, y = row * 260 + oy + 130;
          c.save();
          c.translate(x, y);
          c.scale(0.82, 0.82);
          damaskMotif(c);
          c.restore();
        }
      }
    };
    // emboss: shadow down-right, highlight up-left, then the raised face
    tile(2.5, 3, 'rgba(150,130,100,0.38)');
    tile(-2, -2, 'rgba(255,255,255,0.9)');
    tile(0, 0, '#EAE2D2');
    // soft vignette toward the seam + paper grain
    const g = c.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(255,255,255,0.15)');
    g.addColorStop(0.75, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(70,40,20,0.18)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    grain(c, w, h, 0.08, 'multiply');
  });
}

/** Burgundy satin bow, drawn with banded sheen. Centre at (0,0), about 2s wide. */
function satinBow(s: number, seed: number) {
  const S = Math.ceil(s * 2.8);
  return cached(`n3-satinbow-${s}-${seed}`, S, S, (c) => {
    const R = rng(seed);
    c.translate(S / 2, S * 0.36);
    c.scale(s / 100, s / 100);
    const deep = '#3A0E15', wine = '#7C2F3A', hi = '#C77482', glow = '#F2C4CB';
    const satin = (x0: number, y0: number, x1: number, y1: number, phase = 0) => {
      const g = c.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, deep);
      g.addColorStop(0.18 + phase, wine);
      g.addColorStop(0.32 + phase, hi);
      g.addColorStop(0.38 + phase, glow);
      g.addColorStop(0.46 + phase, wine);
      g.addColorStop(0.72, '#5A1A24');
      g.addColorStop(0.86, hi);
      g.addColorStop(1, deep);
      return g;
    };
    c.save();
    c.shadowColor = 'rgba(20,0,4,0.5)';
    c.shadowBlur = 16;
    c.shadowOffsetY = 10;
    // tails
    for (const k of [-1, 1]) {
      const sw = R() * 10;
      c.beginPath();
      c.moveTo(k * 6, 4);
      c.bezierCurveTo(k * 26, 50, k * (30 + sw), 100, k * (58 + sw), 160);
      c.lineTo(k * (40 + sw), 150);
      c.lineTo(k * (30 + sw), 172);
      c.bezierCurveTo(k * 10, 110, k * -2, 60, k * -12, 10);
      c.closePath();
      c.fillStyle = satin(k * -10, 60, k * 50, 90, 0.04);
      c.fill();
    }
    // loops
    for (const k of [-1, 1]) {
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(k * 22, -58, k * 104, -70, k * 110, -18);
      c.bezierCurveTo(k * 114, 26, k * 50, 36, 0, 4);
      c.closePath();
      c.fillStyle = satin(k * 20, -60, k * 70, 30, k > 0 ? 0.02 : 0.06);
      c.fill();
    }
    c.restore();
    // inner fold shadows inside the loops
    for (const k of [-1, 1]) {
      c.beginPath();
      c.moveTo(k * 8, -2);
      c.bezierCurveTo(k * 30, -36, k * 80, -40, k * 86, -14);
      c.bezierCurveTo(k * 70, -22, k * 36, -18, k * 8, 2);
      c.closePath();
      c.fillStyle = 'rgba(30,4,8,0.55)';
      c.fill();
      // crisp sheen streak along the loop crest
      c.beginPath();
      c.moveTo(k * 24, -34);
      c.bezierCurveTo(k * 50, -54, k * 90, -50, k * 100, -24);
      c.strokeStyle = 'rgba(255,220,226,0.55)';
      c.lineWidth = 3;
      c.lineCap = 'round';
      c.stroke();
      // lower fold crease
      c.beginPath();
      c.moveTo(k * 18, 10);
      c.quadraticCurveTo(k * 60, 22, k * 96, 2);
      c.strokeStyle = 'rgba(40,6,10,0.4)';
      c.lineWidth = 2.5;
      c.stroke();
    }
    // knot
    const kg = c.createLinearGradient(-18, -20, 18, 22);
    kg.addColorStop(0, hi);
    kg.addColorStop(0.35, glow);
    kg.addColorStop(0.55, wine);
    kg.addColorStop(1, deep);
    c.beginPath();
    c.roundRect(-19, -22, 38, 44, 14);
    c.fillStyle = kg;
    c.fill();
    c.strokeStyle = 'rgba(40,6,10,0.35)';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-10, -18);
    c.quadraticCurveTo(-2, 0, -8, 18);
    c.stroke();
  });
}

/** Dried rose head with petals, stem and a leaf. (0,0) = flower centre. */
function driedRose(c: Ctx, r: number, seed: number, stemTo: [number, number], hue: 'mauve' | 'wine') {
  const R = rng(seed);
  const pal = hue === 'mauve' ? ['#5A3638', '#9A6E70', '#C69C98', '#EBD3CB'] : ['#3A0D16', '#7E2433', '#B04B5B', '#DE98A0'];
  // stem
  c.save();
  c.strokeStyle = '#5B5A3C';
  c.lineWidth = r * 0.09;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(0, r * 0.6);
  c.quadraticCurveTo(stemTo[0] * 0.4 + r * 0.3, stemTo[1] * 0.5, stemTo[0], stemTo[1]);
  c.stroke();
  // leaf
  const lx = stemTo[0] * 0.45, ly = stemTo[1] * 0.45;
  c.translate(lx, ly);
  c.rotate(-0.9 + R() * 0.4);
  const lg = c.createLinearGradient(0, -r * 0.2, r * 0.9, r * 0.2);
  lg.addColorStop(0, '#6F6B45');
  lg.addColorStop(1, '#3E3D27');
  c.fillStyle = lg;
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(r * 0.45, -r * 0.4, r * 1.0, 0);
  c.quadraticCurveTo(r * 0.45, r * 0.32, 0, 0);
  c.fill();
  c.strokeStyle = 'rgba(30,30,15,0.5)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(r * 0.9, 0);
  c.stroke();
  c.restore();
  // sepals
  c.save();
  c.fillStyle = '#4C4A30';
  for (const k of [-1, 0, 1]) {
    c.beginPath();
    c.moveTo(0, r * 0.45);
    c.quadraticCurveTo(k * r * 0.5, r * 0.75, k * r * 0.75, r * 0.95);
    c.quadraticCurveTo(k * r * 0.25, r * 0.65, 0, r * 0.62);
    c.fill();
  }
  c.restore();
  // petals, outer to inner
  c.save();
  c.shadowColor = 'rgba(20,0,4,0.35)';
  c.shadowBlur = r * 0.15;
  c.shadowOffsetY = r * 0.06;
  const rings = 4;
  for (let ring = 0; ring < rings; ring++) {
    const rad = r * (1 - ring * 0.2);
    const n = 5 - Math.floor(ring / 2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + ring * 0.7 + R() * 0.3;
      c.save();
      c.rotate(a);
      const g = c.createRadialGradient(0, 0, rad * 0.1, 0, rad * 0.35, rad * 0.95);
      g.addColorStop(0, pal[0]);
      g.addColorStop(0.5, pal[1]);
      g.addColorStop(0.85, pal[2]);
      g.addColorStop(1, pal[3]);
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(-rad * 0.55, rad * 0.05);
      c.bezierCurveTo(-rad * 0.7, rad * 0.75, rad * 0.7, rad * 0.75, rad * 0.55, rad * 0.05);
      // crinkled dried edge
      c.quadraticCurveTo(rad * 0.2, rad * 0.25, 0, rad * 0.12);
      c.quadraticCurveTo(-rad * 0.2, rad * 0.25, -rad * 0.55, rad * 0.05);
      c.fill();
      c.strokeStyle = 'rgba(255,225,220,0.45)';
      c.lineWidth = Math.max(1.2, rad * 0.035);
      c.stroke();
      c.restore();
    }
  }
  c.restore();
  // spiral heart
  c.strokeStyle = 'rgba(30,6,10,0.6)';
  c.lineWidth = r * 0.04;
  c.beginPath();
  for (let t = 0; t < 4 * Math.PI; t += 0.2) {
    const rr = r * 0.05 + t * r * 0.022;
    const x = Math.cos(t) * rr, y = Math.sin(t) * rr * 0.8;
    if (t === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.stroke();
}

const coquetteStrip: Template = {
  id: 'n3-coquette-strip',
  name: 'Dolled Up Strip',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: ['400 70px "Pinyon Script"', '700 30px "Cinzel"'],
  slots: STRIP_SLOTS,
  drawBackground(ctx, w, h) {
    const bg = cached('n3-coquette-bg', w, h, (c) => {
      c.drawImage(damask(SPLIT, h), 0, 0);
      velvet(c, SPLIT, 0, w - SPLIT, h, '#33050A', '#6A1420', 77);
      const v = c.createLinearGradient(SPLIT, 0, w, 0);
      v.addColorStop(0, 'rgba(0,0,0,0.35)');
      v.addColorStop(0.12, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,0.25)');
      c.fillStyle = v;
      c.fillRect(SPLIT, 0, w - SPLIT, h);
      // thin gold piping on the seam
      c.fillStyle = '#B8935A';
      c.fillRect(SPLIT - 2, 0, 4, h);
      c.fillStyle = 'rgba(255,240,200,0.5)';
      c.fillRect(SPLIT - 2, 0, 1.5, h);
      grain(c, w, h, 0.05);
    });
    ctx.drawImage(bg, 0, 0, w, h);
    // vertical label on the oxblood side
    ctx.save();
    ctx.translate(1010, 960);
    ctx.rotate(Math.PI / 2);
    ctx.font = '700 28px "Cinzel"';
    ctx.letterSpacing = '14px';
    ctx.fillStyle = 'rgba(237,230,216,0.75)';
    ctx.textAlign = 'center';
    ctx.fillText('NAVRATRI · NIGHT FOUR · MMXXVI', 0, 0);
    ctx.restore();
    // the white photobooth strip
    ctx.save();
    ctx.translate(STRIP.cx, STRIP.cy);
    ctx.rotate((STRIP.rot * Math.PI) / 180);
    ctx.shadowColor = 'rgba(20,0,4,0.55)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 24;
    ctx.fillStyle = '#FBF8F3';
    ctx.fillRect(-STRIP.w / 2, -STRIP.h / 2, STRIP.w, STRIP.h);
    ctx.shadowColor = 'transparent';
    const sh = ctx.createLinearGradient(-STRIP.w / 2, 0, STRIP.w / 2, 0);
    sh.addColorStop(0, 'rgba(0,0,0,0.04)');
    sh.addColorStop(0.5, 'rgba(255,255,255,0)');
    sh.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = sh;
    ctx.fillRect(-STRIP.w / 2, -STRIP.h / 2, STRIP.w, STRIP.h);
    ctx.restore();
  },
  drawForeground(ctx, w, h) {
    // caption on the strip foot
    ctx.save();
    ctx.translate(STRIP.cx, STRIP.cy);
    ctx.rotate((STRIP.rot * Math.PI) / 180);
    const footY = -STRIP.h / 2 + FRAME.top + 3 * FRAME.h + 2 * FRAME.gap;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5A0B12';
    ctx.font = '400 58px "Pinyon Script"';
    ctx.fillText('Dolled up for Garba', 0, footY + 86);
    ctx.font = '400 34px "Pinyon Script"';
    ctx.fillStyle = 'rgba(90,11,18,0.7)';
    ctx.fillText('the fourteenth of October', 0, footY + 132);
    ctx.restore();

    // satin bows tied on the strip
    const top = satinBow(120, 3);
    const a = (STRIP.rot * Math.PI) / 180;
    const at = (lx: number, ly: number) => [STRIP.cx + lx * Math.cos(a) - ly * Math.sin(a), STRIP.cy + lx * Math.sin(a) + ly * Math.cos(a)];
    const [tx, ty] = at(0, -STRIP.h / 2 + 6);
    place(ctx, top, tx, ty + top.height * 0.14, top.width, STRIP.rot - 3);
    const side = satinBow(84, 8);
    const [lx, ly] = at(-STRIP.w / 2 + 4, -STRIP.h / 2 + FRAME.top + FRAME.h + FRAME.gap / 2);
    place(ctx, side, lx, ly + side.height * 0.14, side.width, -14);
    const side2 = satinBow(90, 21);
    const [rx, ry] = at(STRIP.w / 2 - 4, -STRIP.h / 2 + FRAME.top + 2 * FRAME.h + 1.5 * FRAME.gap);
    place(ctx, side2, rx, ry + side2.height * 0.14, side2.width, 12);

    // dried rose spray, lower left on the damask, stems tucked under the strip
    ctx.save();
    ctx.translate(150, 1630);
    ctx.rotate(-0.35);
    driedRose(ctx, 92, 5, [220, 200], 'mauve');
    ctx.restore();
    ctx.save();
    ctx.translate(250, 1770);
    ctx.rotate(0.3);
    driedRose(ctx, 74, 9, [170, 140], 'wine');
    ctx.restore();
    ctx.save();
    ctx.translate(70, 1810);
    ctx.rotate(-0.8);
    driedRose(ctx, 50, 14, [130, 100], 'mauve');
    ctx.restore();

    // a single rose tucked under the strip's right edge, on the oxblood
    ctx.save();
    ctx.translate(840, 1560);
    ctx.rotate(2.6);
    driedRose(ctx, 64, 31, [160, 120], 'mauve');
    ctx.restore();

    // tiny script date on the damask, top left
    ctx.save();
    ctx.font = '400 56px "Pinyon Script"';
    ctx.fillStyle = '#7C2F3A';
    ctx.textAlign = 'center';
    ctx.fillText('14 · x · 26', 150, 190);
    ctx.strokeStyle = 'rgba(124,47,58,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(70, 220);
    ctx.lineTo(230, 220);
    ctx.stroke();
    ctx.restore();
    grain(ctx, w, h, 0.04);
  },
};

/* ============================================================ 4. DESI STICKER BOMB */

function bandhaniTile() {
  return cached('n3-bandhani', 160, 160, (c) => {
    const g = c.createLinearGradient(0, 0, 160, 160);
    g.addColorStop(0, '#9A2231');
    g.addColorStop(0.5, '#86192A');
    g.addColorStop(1, '#94202F');
    c.fillStyle = g;
    c.fillRect(0, 0, 160, 160);
    const R = rng(77);
    const step = 20;
    for (let gy = 0; gy < 8; gy++) {
      for (let gx = 0; gx < 8; gx++) {
        const cx = gx * step + (gy % 2 ? step / 2 : 0) + 10 + (R() - 0.5) * 2.5;
        const cy = gy * step + 10 + (R() - 0.5) * 2.5;
        const big = (gx + gy) % 4 === 0;
        const n = big ? 6 : 4;
        const rr = big ? 5.2 : 3.6;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU + (big ? 0 : Math.PI / 4);
          for (const [ox, oy] of [[0, 0], [160, 0], [0, 160], [160, 160], [-160, 0], [0, -160]]) {
            c.beginPath();
            c.arc(cx + ox + Math.cos(a) * rr, cy + oy + Math.sin(a) * rr, big ? 1.9 : 1.5, 0, TAU);
            c.fillStyle = 'rgba(255,248,236,0.95)';
            c.fill();
          }
        }
        if (big) {
          c.beginPath();
          c.arc(cx, cy, 1.8, 0, TAU);
          c.fillStyle = R() < 0.5 ? '#F2B533' : '#2F8F5A';
          c.fill();
        }
      }
    }
  });
}

/** "गरबा" wordmark filled with bandhani, baked as a die-cut sticker. */
function garbaWord() {
  const F = '400 330px "Rozha One"';
  return stickerCanvas('n3-garba-word', 800, 330, 16, (c) => {
    c.font = F;
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    const y = 268;
    c.save();
    c.shadowColor = 'rgba(60,0,10,0.6)';
    c.shadowOffsetY = 7;
    c.fillStyle = '#4A0812';
    c.fillText('गरबा', 400, y);
    c.restore();
    c.fillStyle = c.createPattern(bandhaniTile(), 'repeat')!;
    c.fillText('गरबा', 400, y);
    // satin top sheen
    const g = c.createLinearGradient(0, 40, 0, y);
    g.addColorStop(0, 'rgba(255,255,255,0.22)');
    g.addColorStop(0.45, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.18)');
    c.fillStyle = g;
    c.fillText('गरबा', 400, y);
    c.lineWidth = 3;
    c.strokeStyle = '#3E0610';
    c.strokeText('गरबा', 400, y);
  }, [F]);
}

const RANSOM: { ch: string; font: string; bg: string; fg: string }[] = [
  { ch: 'N', font: '400 92px "Anton"', bg: '#0E0E0E', fg: '#FFFFFF' },
  { ch: 'A', font: 'italic 700 96px "Playfair Display"', bg: '#F5E663', fg: '#141414' },
  { ch: 'V', font: '400 100px "Archivo Black"', bg: '#E5679A', fg: '#FFFFFF' },
  { ch: 'R', font: '400 104px "DM Serif Display"', bg: '#FFFFFF', fg: '#8C1D2B' },
  { ch: 'A', font: '700 90px "Courier Prime"', bg: '#2E6CC9', fg: '#FFFFFF' },
  { ch: 'T', font: '400 108px "Bebas Neue"', bg: '#F28C28', fg: '#141414' },
  { ch: 'R', font: '900 94px "Playfair Display"', bg: '#141414', fg: '#F5E663' },
  { ch: 'I', font: '700 100px "Cinzel"', bg: '#B8E0C8', fg: '#8C1D2B' },
];

function ransomSticker() {
  const fonts = RANSOM.map((r) => r.font);
  return stickerCanvas('n3-ransom', 760, 170, 12, (c) => {
    const R = rng(404);
    let x = 6;
    for (const r of RANSOM) {
      c.font = r.font;
      const tw = c.measureText(r.ch).width;
      const bw = tw + 26 + R() * 12, bh = 128 + R() * 24;
      const y = 20 + R() * 16;
      c.save();
      c.translate(x + bw / 2, y + bh / 2);
      c.rotate((R() - 0.5) * 0.22);
      c.fillStyle = r.bg;
      // slightly uneven scissor cut
      c.beginPath();
      c.moveTo(-bw / 2 + R() * 4, -bh / 2);
      c.lineTo(bw / 2 - R() * 4, -bh / 2 + R() * 5);
      c.lineTo(bw / 2, bh / 2 - R() * 4);
      c.lineTo(-bw / 2 + R() * 3, bh / 2);
      c.closePath();
      c.fill();
      c.fillStyle = r.fg;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(r.ch, 0, 6);
      c.restore();
      x += bw - 2;
    }
  }, fonts);
}

function chaiGlass() {
  return stickerCanvas('n3-chai', 180, 250, 10, (c) => {
    c.translate(90, 0);
    // steam
    c.strokeStyle = 'rgba(255,255,255,0.85)';
    c.lineWidth = 6;
    c.lineCap = 'round';
    for (const k of [-1, 0.2, 1]) {
      c.beginPath();
      c.moveTo(k * 26, 50);
      c.bezierCurveTo(k * 26 - 16, 34, k * 26 + 16, 22, k * 26, 2);
      c.stroke();
    }
    const top = 62, bot = 246, tw = 74, bw = 54;
    const body = new Path2D();
    body.moveTo(-tw, top);
    body.lineTo(tw, top);
    body.lineTo(bw, bot);
    body.quadraticCurveTo(0, bot + 6, -bw, bot);
    body.closePath();
    // tea
    c.save();
    c.clip(body);
    const tea = c.createLinearGradient(-tw, 0, tw, 0);
    tea.addColorStop(0, '#7A4A22');
    tea.addColorStop(0.3, '#C08A55');
    tea.addColorStop(0.55, '#A8733F');
    tea.addColorStop(1, '#5E3416');
    c.fillStyle = tea;
    c.fillRect(-tw, top + 22, tw * 2, bot);
    c.fillStyle = 'rgba(230,236,240,0.35)';
    c.fillRect(-tw, top, tw * 2, 22);
    // glass flutes
    for (let i = -6; i <= 6; i++) {
      const x0 = (i / 6.5) * tw, x1 = (i / 6.5) * bw;
      c.strokeStyle = i % 2 ? 'rgba(255,255,255,0.35)' : 'rgba(40,20,5,0.25)';
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(x0, top);
      c.lineTo(x1, bot);
      c.stroke();
    }
    // thick glass base
    c.fillStyle = 'rgba(210,225,230,0.55)';
    c.fillRect(-bw, bot - 22, bw * 2, 30);
    c.restore();
    // foam surface
    c.beginPath();
    c.ellipse(0, top + 22, tw * 0.95, 9, 0, 0, TAU);
    c.fillStyle = '#D8B289';
    c.fill();
    // rim
    c.beginPath();
    c.ellipse(0, top, tw, 11, 0, 0, TAU);
    c.strokeStyle = 'rgba(255,255,255,0.9)';
    c.lineWidth = 4;
    c.stroke();
    c.strokeStyle = 'rgba(120,140,150,0.6)';
    c.lineWidth = 2;
    c.stroke(body);
    // highlight
    c.fillStyle = 'rgba(255,255,255,0.55)';
    c.beginPath();
    c.moveTo(-tw + 16, top + 14);
    c.lineTo(-tw + 30, top + 14);
    c.lineTo(-bw + 22, bot - 26);
    c.lineTo(-bw + 12, bot - 26);
    c.closePath();
    c.fill();
  });
}

function jhumka() {
  return stickerCanvas('n3-jhumka', 170, 300, 10, (c) => {
    c.translate(85, 0);
    const gold = (y0: number, y1: number) => {
      const g = c.createLinearGradient(-70, y0, 70, y1);
      g.addColorStop(0, '#6E4A12');
      g.addColorStop(0.3, '#E9C46A');
      g.addColorStop(0.45, '#FFF0B8');
      g.addColorStop(0.6, '#C99A36');
      g.addColorStop(1, '#5C3D0E');
      return g;
    };
    // stud with ruby
    c.beginPath();
    c.arc(0, 30, 28, 0, TAU);
    c.fillStyle = gold(0, 60);
    c.fill();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      c.beginPath();
      c.arc(Math.cos(a) * 24, 30 + Math.sin(a) * 24, 4, 0, TAU);
      c.fillStyle = '#F6DB8A';
      c.fill();
    }
    const ruby = c.createRadialGradient(-5, 24, 2, 0, 30, 15);
    ruby.addColorStop(0, '#FF8A9A');
    ruby.addColorStop(0.5, '#C3102E');
    ruby.addColorStop(1, '#5A0010');
    c.beginPath();
    c.arc(0, 30, 15, 0, TAU);
    c.fillStyle = ruby;
    c.fill();
    // link
    c.fillStyle = gold(58, 90);
    c.beginPath();
    c.ellipse(0, 72, 9, 14, 0, 0, TAU);
    c.fill();
    // dome bell
    c.beginPath();
    c.moveTo(0, 82);
    c.bezierCurveTo(46, 84, 72, 150, 76, 206);
    c.lineTo(-76, 206);
    c.bezierCurveTo(-72, 150, -46, 84, 0, 82);
    c.closePath();
    c.fillStyle = gold(80, 210);
    c.fill();
    // engraved bands + granulation
    c.strokeStyle = 'rgba(80,50,10,0.55)';
    c.lineWidth = 2.5;
    for (const yy of [120, 150, 180]) {
      const ww = 22 + (yy - 82) * 0.44;
      c.beginPath();
      c.moveTo(-ww, yy);
      c.quadraticCurveTo(0, yy + 10, ww, yy);
      c.stroke();
    }
    for (let i = -8; i <= 8; i++) {
      c.beginPath();
      c.arc(i * 9, 203, 4.2, 0, TAU);
      c.fillStyle = '#F8E39A';
      c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,0.6)';
    c.beginPath();
    c.ellipse(-30, 150, 6, 30, 0.35, 0, TAU);
    c.fill();
    // pearl drops
    for (let i = -6; i <= 6; i++) {
      const px = i * 12, len = 20 + (i % 2 ? 10 : 22);
      c.strokeStyle = '#C99A36';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(px, 208);
      c.lineTo(px, 208 + len);
      c.stroke();
      const pg = c.createRadialGradient(px - 2, 210 + len, 1, px, 212 + len, 7);
      pg.addColorStop(0, '#FFFFFF');
      pg.addColorStop(0.6, '#EFE6DA');
      pg.addColorStop(1, '#B9AC9A');
      c.beginPath();
      c.arc(px, 214 + len, 7, 0, TAU);
      c.fillStyle = pg;
      c.fill();
    }
  });
}

function dandiyaPair() {
  return stickerCanvas('n3-dandiya', 300, 300, 10, (c) => {
    const stick = (rot: number, bands: string[]) => {
      c.save();
      c.translate(150, 150);
      c.rotate(rot);
      const L = 270, W = 22;
      // wrapped stripes
      for (let i = 0; i < 18; i++) {
        const y0 = -L / 2 + (i * L) / 18;
        const g = c.createLinearGradient(-W / 2, 0, W / 2, 0);
        const col = bands[i % bands.length];
        g.addColorStop(0, '#000');
        g.addColorStop(0.15, col);
        g.addColorStop(0.45, '#FFFFFF');
        g.addColorStop(0.55, col);
        g.addColorStop(1, '#2A0A00');
        c.fillStyle = g;
        c.globalAlpha = 1;
        c.fillRect(-W / 2, y0, W, L / 18 + 0.5);
        c.globalAlpha = 0.5;
        c.fillStyle = col;
        c.fillRect(-W / 2, y0, W, L / 18 + 0.5);
        c.globalAlpha = 1;
      }
      // mirror studs
      for (let i = 0; i < 4; i++) {
        const y = -L / 2 + 40 + i * 62;
        c.beginPath();
        c.arc(0, y, 6, 0, TAU);
        const mg = c.createLinearGradient(-6, y - 6, 6, y + 6);
        mg.addColorStop(0, '#FFFFFF');
        mg.addColorStop(1, '#8A99A8');
        c.fillStyle = mg;
        c.fill();
      }
      // gold caps + ghungroo tassel
      for (const e of [-1, 1]) {
        c.fillStyle = '#D9A93F';
        c.fillRect(-W / 2 - 2, e * L / 2 - (e > 0 ? 14 : 0), W + 4, 14);
      }
      for (let i = -1; i <= 1; i++) {
        c.strokeStyle = '#E04A2A';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(0, L / 2);
        c.lineTo(i * 12, L / 2 + 26);
        c.stroke();
        c.beginPath();
        c.arc(i * 12, L / 2 + 30, 6, 0, TAU);
        c.fillStyle = '#E2B54A';
        c.fill();
      }
      c.restore();
    };
    stick(-0.62, ['#C3102E', '#F2B533', '#1F7A4C', '#F2B533']);
    stick(0.62, ['#E5679A', '#F2B533', '#2E6CC9', '#F2B533']);
  });
}

function mirrorSticker() {
  return stickerCanvas('n3-mirror', 210, 210, 10, (c) => {
    c.translate(105, 105);
    // scalloped brass frame
    c.beginPath();
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * TAU;
      const r = 98 + Math.cos(a * 16) * 5;
      if (i === 0) c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const g = c.createLinearGradient(-100, -100, 100, 100);
    g.addColorStop(0, '#FFF0B8');
    g.addColorStop(0.3, '#C99A36');
    g.addColorStop(0.6, '#8C6418');
    g.addColorStop(1, '#E9C46A');
    c.fillStyle = g;
    c.fill();
    // bead ring
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * TAU;
      c.beginPath();
      c.arc(Math.cos(a) * 82, Math.sin(a) * 82, 5, 0, TAU);
      c.fillStyle = i % 2 ? '#C3102E' : '#1F7A4C';
      c.fill();
    }
    // glass
    const gl = c.createLinearGradient(-70, -70, 70, 70);
    gl.addColorStop(0, '#F4F8FB');
    gl.addColorStop(0.35, '#B9C6D2');
    gl.addColorStop(0.6, '#6E8296');
    gl.addColorStop(1, '#C9D5DF');
    c.beginPath();
    c.arc(0, 0, 70, 0, TAU);
    c.fillStyle = gl;
    c.fill();
    c.save();
    c.clip();
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.rotate(-0.7);
    c.fillRect(-90, -40, 180, 18);
    c.fillRect(-90, -10, 180, 7);
    c.restore();
  });
}

function marigoldCluster() {
  return stickerCanvas('n3-marigolds', 260, 200, 10, (c) => {
    // leaves
    c.fillStyle = '#2F6B2E';
    for (const [x, y, a] of [[40, 160, -2.4], [210, 170, -0.6], [130, 190, 1.57]] as const) {
      c.save();
      c.translate(x, y);
      c.rotate(a);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(30, -22, 64, 0);
      c.quadraticCurveTo(30, 22, 0, 0);
      c.fill();
      c.restore();
    }
    marigold(c, 80, 100, 64, 3, true);
    marigold(c, 190, 92, 56, 7, false);
    marigold(c, 140, 150, 44, 12, true);
  });
}

function lotusSticker() {
  return stickerCanvas('n3-lotus', 230, 190, 10, (c) => {
    lotus(c, 115, 170, 210, 0, ['#FCE4EA', '#E5679A']);
  });
}

function bubbleSticker() {
  const F = '700 44px "Caveat"';
  return stickerCanvas('n3-bubble', 300, 150, 8, (c) => {
    c.fillStyle = '#141414';
    c.beginPath();
    c.roundRect(4, 4, 290, 110, 55);
    c.moveTo(70, 108);
    c.lineTo(52, 146);
    c.lineTo(110, 110);
    c.fill();
    c.font = F;
    c.fillStyle = '#F5E663';
    c.textAlign = 'center';
    c.fillText('chalo garba! 💃', 150, 74);
  }, [F]);
}

function newsprint(w: number, h: number) {
  return cached('n3-newsprint', w, h, (c) => {
    c.fillStyle = '#F1DCDD';
    c.fillRect(0, 0, w, h);
    const R = rng(1203);
    // columns of fake body text
    const colW = 236, gut = 26, x0 = 22;
    for (let col = 0; col < 5; col++) {
      const cx = x0 + col * (colW + gut);
      let y = 40 + R() * 30;
      while (y < h - 30) {
        if (R() < 0.06) {
          // headline
          c.fillStyle = 'rgba(90,40,50,0.22)';
          c.fillRect(cx, y, colW * (0.6 + R() * 0.4), 22);
          c.fillRect(cx, y + 30, colW * (0.4 + R() * 0.4), 22);
          y += 72;
          continue;
        }
        if (R() < 0.03) {
          // halftone block
          const bh = 120 + R() * 80;
          for (let yy = 0; yy < bh; yy += 8) for (let xx = 0; xx < colW; xx += 8) {
            const d = 0.5 + 0.5 * Math.sin(xx * 0.03 + yy * 0.02 + col);
            c.beginPath();
            c.arc(cx + xx + 4, y + yy + 4, 1 + d * 2.4, 0, TAU);
            c.fillStyle = 'rgba(110,50,60,0.13)';
            c.fill();
          }
          y += bh + 18;
          continue;
        }
        let x = cx;
        c.fillStyle = 'rgba(90,40,50,0.14)';
        const end = cx + (R() < 0.12 ? colW * (0.3 + R() * 0.5) : colW);
        while (x < end) {
          const ww = 14 + R() * 46;
          c.fillRect(x, y, Math.min(ww, end - x), 6);
          x += ww + 7;
        }
        y += 14;
      }
      c.fillStyle = 'rgba(90,40,50,0.12)';
      if (col < 4) c.fillRect(cx + colW + gut / 2 - 1, 30, 1.5, h - 60);
    }
    // blush wash so it reads pink, not grey
    const g = c.createRadialGradient(w / 2, h / 2, 200, w / 2, h / 2, 1200);
    g.addColorStop(0, 'rgba(241,220,221,0.45)');
    g.addColorStop(1, 'rgba(229,103,154,0.12)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    grain(c, w, h, 0.12, 'multiply');
  });
}

const BOMB_A: Slot = { id: 'a', x: 420, y: 430, w: 600, h: 700, shape: 'rect', rotate: 3 };
const BOMB_B: Slot = { id: 'b', x: 70, y: 1110, w: 540, h: 620, shape: 'rect', rotate: -3.5 };

function blackFrame(ctx: Ctx, s: Slot, b: number) {
  ctx.save();
  rotateAbout(ctx, s);
  ctx.shadowColor = 'rgba(60,10,20,0.45)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = '#0E0E0E';
  ctx.fillRect(s.x - b, s.y - b, s.w + b * 2, s.h + b * 2);
  ctx.restore();
}

const desiBomb: Template = {
  id: 'n3-desi-bomb',
  name: 'Desi Sticker Bomb',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: [
    '400 330px "Rozha One"', '400 92px "Anton"', 'italic 700 96px "Playfair Display"', '900 94px "Playfair Display"',
    '400 100px "Archivo Black"', '400 104px "DM Serif Display"', '700 90px "Courier Prime"', '400 108px "Bebas Neue"',
    '700 100px "Cinzel"', '700 44px "Caveat"', `700 22px ${MONO}`,
  ],
  slots: [BOMB_A, BOMB_B],
  drawBackground(ctx, w, h) {
    ctx.drawImage(newsprint(w, h), 0, 0, w, h);
    blackFrame(ctx, BOMB_A, 20);
    blackFrame(ctx, BOMB_B, 20);
  },
  drawForeground(ctx, w, h) {
    // caption strips on the black frames
    ctx.save();
    rotateAbout(ctx, BOMB_A);
    ctx.font = `700 22px ${MONO}`;
    ctx.fillStyle = '#F1DCDD';
    ctx.textAlign = 'right';
    ctx.fillText('FULL DESI MODE ✦ NIGHT 04', BOMB_A.x + BOMB_A.w, BOMB_A.y - 3);
    ctx.restore();

    // stickers: big wordmark first, then the border, ransom note on top
    place(ctx, garbaWord(), 470, 250, 900, -4);
    const R = rng(55);
    const jit = () => (R() - 0.5) * 10;
    place(ctx, chaiGlass(), 200, 650, 230, -8 + jit());
    place(ctx, jhumka(), 95, 930, 170, 10);
    place(ctx, mirrorSticker(), 300, 960, 200, jit());
    place(ctx, lotusSticker(), 790, 1230, 250, 6);
    place(ctx, dandiyaPair(), 840, 1500, 330, -6);
    place(ctx, marigoldCluster(), 160, 1830, 300, -6);
    place(ctx, jhumka(), 990, 1110, 130, -14);
    place(ctx, marigoldCluster(), 1010, 660, 200, 18);
    place(ctx, mirrorSticker(), 640, 1800, 150, 0);
    place(ctx, bubbleSticker(), 860, 1830, 290, 4);
    place(ctx, chaiGlass(), 990, 1700, 140, 12);
    place(ctx, ransomSticker(), 400, 1690, 640, -5);
    grain(ctx, w, h, 0.04);
  },
};

const list: Template[] = [garbaDisco, lyricPoster, coquetteStrip, desiBomb];
export default list;
