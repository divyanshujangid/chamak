// v2 art: textures + objects tuned to the Pinterest festive-story aesthetic.
// Everything is generated in code. Expensive layers are cached as offscreen canvases.
type Ctx = CanvasRenderingContext2D;

export function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const cache = new Map<string, HTMLCanvasElement>();
export function cached(key: string, w: number, h: number, draw: (c: Ctx) => void) {
  let c = cache.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d')!);
    cache.set(key, c);
  }
  return c;
}

/* ---------- value noise ---------- */
function valueNoise(w: number, h: number, seed: number, octaves = [4, 8, 16, 32, 64], weights = [0.4, 0.25, 0.17, 0.1, 0.08]) {
  const out = new Float32Array(w * h);
  octaves.forEach((cells, o) => {
    const r = rng(seed + o * 101);
    const gw = cells + 1, gh = Math.ceil((cells * h) / w) + 1;
    const g = new Float32Array(gw * gh).map(() => r());
    for (let y = 0; y < h; y++) {
      const fy = (y / h) * (gh - 1), y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < w; x++) {
        const fx = (x / w) * (gw - 1), x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx);
        const a = g[y0 * gw + x0], b = g[y0 * gw + x0 + 1], c = g[(y0 + 1) * gw + x0], d = g[(y0 + 1) * gw + x0 + 1];
        out[y * w + x] += weights[o] * ((a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy);
      }
    }
  });
  return out;
}

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/** Crushed-velvet / distressed fabric texture between a dark and a light tone. */
export function velvet(ctx: Ctx, x: number, y: number, w: number, h: number, dark: string, light: string, seed = 7) {
  const tex = cached(`velvet-${dark}-${light}-${seed}`, 360, 640, (c) => {
    const n = valueNoise(360, 640, seed);
    const fine = valueNoise(360, 640, seed + 9, [90, 180], [0.6, 0.4]);
    const img = c.createImageData(360, 640);
    const [r0, g0, b0] = hex(dark), [r1, g1, b1] = hex(light);
    for (let i = 0; i < n.length; i++) {
      let t = Math.pow(Math.min(1, Math.max(0, (n[i] - 0.25) * 1.9)), 1.6);
      t = t * 0.85 + fine[i] * 0.22;
      img.data[i * 4] = r0 + (r1 - r0) * t;
      img.data[i * 4 + 1] = g0 + (g1 - g0) * t;
      img.data[i * 4 + 2] = b0 + (b1 - b0) * t;
      img.data[i * 4 + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
  ctx.save();
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tex, x, y, w, h);
  ctx.restore();
}

/** Fine film/paper grain. */
export function grain(ctx: Ctx, w: number, h: number, alpha: number, mode: GlobalCompositeOperation = 'overlay') {
  const tile = cached('grain', 256, 256, (c) => {
    const img = c.createImageData(256, 256);
    const r = rng(42);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = mode;
  ctx.fillStyle = ctx.createPattern(tile, 'repeat')!;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Soft glowing light sprite (pre-rendered, cheap to stamp hundreds of times). */
function lightSprite(color: string) {
  return cached(`light-${color}`, 64, 64, (c) => {
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, '#FFFFFF');
    g.addColorStop(0.12, color);
    g.addColorStop(0.35, color.replace('rgb(', 'rgba(').replace(')', ',0.35)'));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
  });
}
export function light(ctx: Ctx, x: number, y: number, size: number, color = 'rgb(255,214,140)') {
  ctx.drawImage(lightSprite(color), x - size / 2, y - size / 2, size, size);
}

/** Garba pandal canopy: satin fabric panels radiating from a lit centre, fairy lights on every seam.
 *  Tuned to look like the real pandal-ceiling photos used on Pinterest stories. */
export function canopy(ctx: Ctx, w: number, h: number, cx: number, cy: number, seed = 3, opts: { burst?: number; lights?: number } = {}) {
  const cols = ['#8E0E14', '#C0161D', '#D9471A', '#E8921A', '#D4A62A', '#3D6B2C', '#1C2C6E', '#5A1870', '#9A1D4F', '#E9CF9A', '#B5541A', '#6E0C2A'];
  const r = rng(seed);
  const R = Math.hypot(w, h) * 1.3;
  const burst = opts.burst ?? 1;
  ctx.save();
  ctx.fillStyle = '#0D0504';
  ctx.fillRect(0, 0, w, h);
  const seams: number[] = [];
  let a = -Math.PI;
  let last = -1;
  while (a < Math.PI) {
    const span = (Math.PI * 2 / 64) * (0.5 + r() * 1.3);
    const a1 = Math.min(Math.PI, a + span);
    let ci = Math.floor(r() * cols.length);
    if (ci === last) ci = (ci + 3) % cols.length;
    last = ci;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, a, a1);
    ctx.closePath();
    ctx.fillStyle = cols[ci];
    ctx.fill();
    // satin: dark folds at both seams, one or two sheen streaks inside
    const p0 = [cx + Math.cos(a) * 700, cy + Math.sin(a) * 700];
    const p1 = [cx + Math.cos(a1) * 700, cy + Math.sin(a1) * 700];
    const g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
    const sheen = 0.25 + r() * 0.5;
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(Math.max(0.05, sheen - 0.22), 'rgba(0,0,0,0.05)');
    g.addColorStop(sheen, `rgba(255,240,220,${0.22 + r() * 0.18})`);
    g.addColorStop(Math.min(0.95, sheen + 0.2), 'rgba(0,0,0,0.08)');
    g.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = g;
    ctx.fill();
    seams.push(a);
    a = a1;
  }
  // depth falloff toward the edges
  const vig = ctx.createRadialGradient(cx, cy, 200, cx, cy, Math.hypot(w, h) * 0.85);
  vig.addColorStop(0, 'rgba(0,0,0,0.0)');
  vig.addColorStop(0.55, 'rgba(0,0,0,0.15)');
  vig.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  // fairy lights along seams (small, dense, warm)
  ctx.globalCompositeOperation = 'lighter';
  const density = opts.lights ?? 1;
  for (const s of seams) {
    const curve = (r() - 0.5) * 0.04;
    for (let d = 90; d < R; d += (16 + (d / R) * 26) / density) {
      const ang = s + curve * (d / 600);
      const x = cx + Math.cos(ang) * d;
      const y = cy + Math.sin(ang) * d;
      if (x < -30 || y < -30 || x > w + 30 || y > h + 30) continue;
      const size = 9 + (d / R) * 30 + r() * 6;
      light(ctx, x, y, size, r() < 0.85 ? 'rgb(255,210,130)' : 'rgb(255,150,80)');
    }
  }
  // the bright light burst at the centre of the pandal
  if (burst > 0) {
    light(ctx, cx, cy, 520 * burst, 'rgb(255,190,90)');
    light(ctx, cx, cy, 220 * burst, 'rgb(255,240,200)');
  }
  ctx.restore();
}

/** Torn white paper band along the top or bottom edge. */
export function tornBand(ctx: Ctx, w: number, y: number, h: number, edge: 'top' | 'bottom', seed = 2, color = '#F7F5F0') {
  const r = rng(seed);
  ctx.save();
  ctx.beginPath();
  if (edge === 'bottom') {
    // band spans y..y+h, ragged edge at y+h
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    for (let x = w; x >= 0; x -= 8) ctx.lineTo(x, y + h - r() * 22 - (Math.sin(x / 90) + 1) * 6);
  } else {
    // band spans y..y+h, ragged edge at y
    ctx.moveTo(0, y + h);
    ctx.lineTo(w, y + h);
    for (let x = w; x >= 0; x -= 8) ctx.lineTo(x, y + r() * 22 + (Math.sin(x / 70) + 1) * 6);
  }
  ctx.closePath();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = edge === 'bottom' ? 6 : -6;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/** Brass push-pin. */
export function pushpin(ctx: Ctx, x: number, y: number, r = 20) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 8;
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#FFF3C4');
  g.addColorStop(0.35, '#D9B456');
  g.addColorStop(1, '#6E5115');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Hand-drawn ribbon bow, line art. */
export function bow(ctx: Ctx, x: number, y: number, s: number, color = '#F4F1EA') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.strokeStyle = color;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(k * 20, -40, k * 85, -45, k * 80, -5);
    ctx.bezierCurveTo(k * 78, 20, k * 30, 12, 0, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(k * 22, -14);
    ctx.quadraticCurveTo(k * 50, -26, k * 66, -12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(k * 4, 6);
    ctx.bezierCurveTo(k * 20, 40, k * 30, 70, k * 52, 100);
    ctx.lineTo(k * 36, 92);
    ctx.lineTo(k * 30, 106);
    ctx.bezierCurveTo(k * 14, 70, k * 4, 40, 0, 8);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** Metallic gold five-petal flower sticker. */
export function goldFlower(ctx: Ctx, x: number, y: number, r: number, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i / 5) * Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-r * 0.55, -r * 0.3, -r * 0.5, -r * 1.05, 0, -r);
    ctx.bezierCurveTo(r * 0.5, -r * 1.05, r * 0.55, -r * 0.3, 0, 0);
    const g = ctx.createLinearGradient(-r * 0.5, -r, r * 0.5, 0);
    g.addColorStop(0, '#FFF4C8');
    g.addColorStop(0.4, '#E3C26A');
    g.addColorStop(0.75, '#A7802B');
    g.addColorStop(1, '#F2DB8C');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(110,80,20,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.15);
    ctx.lineTo(0, -r * 0.8);
    ctx.strokeStyle = 'rgba(120,85,20,0.45)';
    ctx.stroke();
    ctx.restore();
  }
  const c = ctx.createRadialGradient(-r * 0.05, -r * 0.05, 1, 0, 0, r * 0.22);
  c.addColorStop(0, '#FFF8D8');
  c.addColorStop(1, '#8C6A1E');
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Hand-drawn 4-point sparkle, outline only. */
export function sparkleDoodle(ctx: Ctx, x: number, y: number, s: number, color = '#E9A93A', lw = 4) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s * 0.62, 0);
  ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s);
  ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s * 0.62, 0);
  ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s);
  ctx.stroke();
  ctx.restore();
}

/** Compact music-player widget (phone share-sheet style). */
export function miniPlayer(ctx: Ctx, x: number, y: number, w: number, title: string, artist: string, progress: number, bg = 'rgba(58,26,40,0.92)') {
  const k = w / 400;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.beginPath();
  ctx.roundRect(0, 0, 400, 200, 18);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#FFF';
  ctx.font = '700 26px "DM Sans Variable", sans-serif';
  ctx.fillText(title, 26, 46);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '500 18px "DM Sans Variable", sans-serif';
  ctx.fillText(artist, 26, 72);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(352, 32); ctx.lineTo(368, 48); ctx.moveTo(368, 32); ctx.lineTo(352, 48); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(26, 100, 348, 4);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(26, 100, 348 * progress, 4);
  ctx.beginPath(); ctx.arc(26 + 348 * progress, 102, 7, 0, Math.PI * 2); ctx.fill();
  ctx.font = '500 14px "DM Sans Variable", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('1:07', 26, 126);
  ctx.textAlign = 'right';
  ctx.fillText('3:54', 374, 126);
  // controls
  const cy = 160;
  ctx.fillStyle = '#FFF';
  const tri = (x0: number, dir: number) => { ctx.beginPath(); ctx.moveTo(x0, cy - 11); ctx.lineTo(x0, cy + 11); ctx.lineTo(x0 + dir * 16, cy); ctx.closePath(); ctx.fill(); };
  ctx.fillRect(124, cy - 11, 4, 22); tri(146, -1);
  ctx.fillRect(272, cy - 11, 4, 22); tri(254, 1);
  ctx.beginPath(); ctx.arc(200, cy, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.fillRect(191, cy - 10, 6, 20); ctx.fillRect(203, cy - 10, 6, 20);
  ctx.restore();
}

/** Multi-line text block. */
export function lines(ctx: Ctx, rows: string[], x: number, y: number, lh: number, font: string, fill: string, align: CanvasTextAlign = 'left') {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  rows.forEach((row, i) => ctx.fillText(row, x, y + i * lh));
  ctx.restore();
}

/** White photo-strip / film-strip card behind a set of slots (rotated about centre). */
export function stripCard(ctx: Ctx, cx: number, cy: number, w: number, h: number, rot: number, color = '#FBFAF7') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

/** Lotus flower, painted look. (x,y) = base centre. */
export function lotus(ctx: Ctx, x: number, y: number, size: number, rot = 0, tint: [string, string] = ['#FCE4EA', '#E0496E']) {
  const petal = (ang: number, len: number, wid: number, light: boolean) => {
    ctx.save();
    ctx.rotate((ang * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-wid, -len * 0.35, -wid * 0.7, -len * 0.8, 0, -len);
    ctx.bezierCurveTo(wid * 0.7, -len * 0.8, wid, -len * 0.35, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, -len);
    g.addColorStop(0, light ? '#FFF6F2' : tint[0]);
    g.addColorStop(0.55, light ? tint[0] : '#F39AB0');
    g.addColorStop(1, tint[1]);
    ctx.fillStyle = g;
    ctx.shadowColor = 'rgba(90,10,30,0.25)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(160,30,70,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -len * 0.08);
    ctx.quadraticCurveTo(wid * 0.08, -len * 0.5, 0, -len * 0.9);
    ctx.strokeStyle = 'rgba(200,60,100,0.25)';
    ctx.stroke();
    ctx.restore();
  };
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const s = size / 100;
  ctx.scale(s, s);
  // leaf pad
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 6, 110, 26, 0, 0, Math.PI * 2);
  const lg = ctx.createLinearGradient(0, -20, 0, 32);
  lg.addColorStop(0, '#6FA36B');
  lg.addColorStop(1, '#2F5E37');
  ctx.fillStyle = lg;
  ctx.fill();
  ctx.restore();
  for (const a of [-78, -50, 50, 78]) petal(a, 70, 26, false);
  for (const a of [-34, 34]) petal(a, 92, 32, false);
  for (const a of [-16, 16]) petal(a, 98, 30, true);
  petal(0, 104, 30, true);
  ctx.restore();
}

/** Marigold (genda phool) pompom. */
export function marigold(ctx: Ctx, x: number, y: number, r: number, seed = 1, warm = true) {
  const rr = rng(seed);
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = r * 0.3;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = warm ? '#C2410C' : '#B45309';
  ctx.fill();
  ctx.shadowBlur = 0;
  for (let ring = 0; ring < 6; ring++) {
    const rad = r * (1 - ring * 0.16);
    const n = Math.floor(10 + rad * 0.45);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rr() * 0.4 + ring;
      const px = Math.cos(a) * rad * 0.72, py = Math.sin(a) * rad * 0.72;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, 0, rad * 0.32, rad * 0.2, 0, 0, Math.PI * 2);
      const t = ring / 6;
      const col = warm
        ? `rgb(${255},${Math.round(120 + t * 80 + rr() * 20)},${Math.round(10 + t * 20)})`
        : `rgb(255,${Math.round(180 + t * 50)},${Math.round(30 + t * 30)})`;
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,40,0,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

/** Clay diya with realistic glow. (x,y) bottom centre. */
export function diya(ctx: Ctx, x: number, y: number, size: number) {
  const s = size / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.globalCompositeOperation = 'lighter';
  light(ctx, 30, -95, 260, 'rgb(255,150,50)');
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath();
  ctx.moveTo(-62, -34);
  ctx.bezierCurveTo(-58, 10, 40, 14, 58, -10);
  ctx.quadraticCurveTo(75, -26, 82, -42);
  ctx.quadraticCurveTo(60, -36, 50, -34);
  ctx.closePath();
  const bowl = ctx.createLinearGradient(0, -40, 0, 14);
  bowl.addColorStop(0, '#D9783A');
  bowl.addColorStop(0.5, '#A4431A');
  bowl.addColorStop(1, '#5A1E08');
  ctx.fillStyle = bowl;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -34, 62, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#3A1405';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,190,120,0.7)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // flame
  ctx.beginPath();
  ctx.moveTo(66, -44);
  ctx.bezierCurveTo(44, -64, 56, -104, 70, -134);
  ctx.bezierCurveTo(86, -104, 96, -66, 74, -44);
  ctx.closePath();
  const f = ctx.createLinearGradient(70, -134, 70, -44);
  f.addColorStop(0, 'rgba(255,250,210,0.95)');
  f.addColorStop(0.45, '#FFC547');
  f.addColorStop(1, '#FF5A00');
  ctx.fillStyle = f;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(70, -64, 6, 15, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fill();
  ctx.restore();
}

/** Block-print textile band (repeating stamped florals). */
export function blockPrintFrame(ctx: Ctx, w: number, h: number, band: number, base: string, ink1: string, ink2: string) {
  const stamp = (x: number, y: number, s: number) => {
    ctx.fillStyle = ink1;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * s * 0.42, y + Math.sin(a) * s * 0.42, s * 0.22, s * 0.13, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = ink2;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
  };
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.rect(band, band, w - band * 2, h - band * 2);
  ctx.fillStyle = base;
  ctx.fill('evenodd');
  ctx.clip('evenodd');
  const step = band * 0.95;
  for (let x = step / 2; x < w; x += step) { stamp(x, band / 2, band * 0.62); stamp(x, h - band / 2, band * 0.62); }
  for (let y = step * 1.5; y < h - step; y += step) { stamp(band / 2, y, band * 0.62); stamp(w - band / 2, y, band * 0.62); }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = ink1;
  ctx.lineWidth = 4;
  ctx.strokeRect(band - 6, band - 6, w - band * 2 + 12, h - band * 2 + 12);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(band + 6, band + 6, w - band * 2 - 12, h - band * 2 - 12);
  ctx.restore();
  // printed-on-cloth softness
  grain(ctx, w, h, 0.12, 'multiply');
}

/** Torn/deckled paper rectangle path. */
export function tornRect(ctx: Ctx, x: number, y: number, w: number, h: number, amp: number, seed: number) {
  const r = rng(seed);
  const seg = 9;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = seg; i < w; i += seg) ctx.lineTo(x + i, y + (r() - 0.5) * amp);
  for (let i = 0; i < h; i += seg) ctx.lineTo(x + w + (r() - 0.5) * amp, y + i);
  for (let i = w; i > 0; i -= seg) ctx.lineTo(x + i, y + h + (r() - 0.5) * amp);
  for (let i = h; i > 0; i -= seg) ctx.lineTo(x + (r() - 0.5) * amp, y + i);
  ctx.closePath();
}

export function paper(ctx: Ctx, x: number, y: number, w: number, h: number, seed: number, color = '#F7F0E1') {
  ctx.save();
  tornRect(ctx, x, y, w, h, 10, seed);
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/** Polaroid card behind a slot; returns nothing, caption drawn separately. */
export function polaroid(ctx: Ctx, s: { x: number; y: number; w: number; h: number; rotate?: number }, pad = 26, bottom = 130) {
  ctx.save();
  rotateAbout(ctx, s);
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#F6F2EA';
  ctx.fillRect(s.x - pad, s.y - pad, s.w + pad * 2, s.h + pad + bottom);
  ctx.restore();
}

export function rotateAbout(ctx: Ctx, s: { x: number; y: number; w: number; h: number; rotate?: number }) {
  if (!s.rotate) return;
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
  ctx.translate(cx, cy);
  ctx.rotate((s.rotate * Math.PI) / 180);
  ctx.translate(-cx, -cy);
}

/** Washi tape strip centred at (x,y). */
export function tape(ctx: Ctx, x: number, y: number, w: number, rot: number, color = 'rgba(236,214,170,0.82)', seed = 5) {
  const r = rng(seed);
  const h = 54;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  for (let i = 0; i <= 6; i++) ctx.lineTo(w / 2 + (i % 2 ? -7 : 0) + r() * 3, -h / 2 + (h * i) / 6);
  ctx.lineTo(-w / 2, h / 2);
  for (let i = 6; i >= 0; i--) ctx.lineTo(-w / 2 + (i % 2 ? 7 : 0) - r() * 3, -h / 2 + (h * i) / 6);
  ctx.closePath();
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 8;
  for (let i = -w; i < w; i += 22) {
    ctx.beginPath();
    ctx.moveTo(i, -h);
    ctx.lineTo(i + h, h);
    ctx.stroke();
  }
  ctx.restore();
}

/** Warm bokeh night background. */
export function bokehNight(ctx: Ctx, w: number, h: number, seed: number, base: [string, string], colors: string[]) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, base[0]);
  g.addColorStop(1, base[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 90; i++) {
    const x = r() * w, y = r() * h, rad = 10 + r() * (i < 18 ? 120 : 45);
    const c = colors[Math.floor(r() * colors.length)];
    const rg = ctx.createRadialGradient(x, y, rad * 0.2, x, y, rad);
    rg.addColorStop(0, c.replace('A', '0.30'));
    rg.addColorStop(0.85, c.replace('A', '0.18'));
    rg.addColorStop(1, c.replace('A', '0'));
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Catenary string of coloured bulbs. */
export function bulbString(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number, n: number, colors: string[]) {
  const pt = (t: number) => {
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t);
    return [x, y] as const;
  };
  ctx.save();
  ctx.strokeStyle = 'rgba(20,20,20,0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const [x, y] = pt(i / 40); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  for (let i = 1; i < n; i++) {
    const [x, y] = pt(i / n);
    const c = colors[i % colors.length];
    ctx.globalCompositeOperation = 'lighter';
    light(ctx, x, y + 22, 120, c);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#222';
    ctx.fillRect(x - 5, y, 10, 12);
    ctx.beginPath();
    ctx.ellipse(x, y + 24, 9, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = c.replace('rgb', 'rgb');
    ctx.fill();
  }
  ctx.restore();
}

/** Instagram-style text pill ("Classic" font with background). */
export function textPill(ctx: Ctx, str: string, x: number, y: number, font: string, size: number, fg: string, bg: string) {
  ctx.save();
  ctx.font = font;
  const w = ctx.measureText(str).width;
  const padX = size * 0.45, padY = size * 0.32;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x - w / 2 - padX, y - size * 0.82 - padY, w + padX * 2, size + padY * 2, size * 0.35);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.fillText(str, x, y);
  ctx.restore();
}

/** Music player card (generic, no brand). Album art is a template slot drawn underneath. */
export function musicCard(ctx: Ctx, x: number, y: number, w: number, h: number, title: string, artist: string, progress: number, art: { x: number; y: number; w: number; h: number }) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 34);
  ctx.fillStyle = 'rgba(22,18,20,0.78)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // art border
  ctx.beginPath();
  ctx.roundRect(art.x, art.y, art.w, art.h, 18);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.stroke();
  const tx = art.x + art.w + 34;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 44px "DM Sans Variable", sans-serif';
  ctx.fillText(title, tx, y + 78);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '500 32px "DM Sans Variable", sans-serif';
  ctx.fillText(artist, tx, y + 122);
  // progress
  const bx = tx, bw = x + w - 40 - tx, by = y + h - 62;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath(); ctx.roundRect(bx, by, bw, 8, 4); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.roundRect(bx, by, bw * progress, 8, 4); ctx.fill();
  ctx.beginPath(); ctx.arc(bx + bw * progress, by + 4, 12, 0, Math.PI * 2); ctx.fill();
  ctx.font = '500 24px "DM Sans Variable", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('1:24', bx, by + 44);
  ctx.textAlign = 'right';
  ctx.fillText('-2:51', bx + bw, by + 44);
  // pause button
  const px = x + w - 76, py = y + 74;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(px, py, 36, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.fillRect(px - 12, py - 15, 8, 30);
  ctx.fillRect(px + 4, py - 15, 8, 30);
  ctx.restore();
}

/** Mono (B&W) treatment over whatever is in the current clip. */
export function monoClip(ctx: Ctx, w: number, h: number, contrast = 0.12) {
  ctx.save();
  ctx.globalCompositeOperation = 'saturation';
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = `rgba(0,0,0,${contrast})`;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Simple Devanagari/English text helper. */
export function txt(ctx: Ctx, s: string, x: number, y: number, font: string, fill: string | CanvasGradient, align: CanvasTextAlign = 'center', shadow?: [string, number], rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate((rot * Math.PI) / 180);
  ctx.font = font;
  ctx.textAlign = align;
  if (shadow) { ctx.shadowColor = shadow[0]; ctx.shadowBlur = shadow[1]; }
  ctx.fillStyle = fill;
  ctx.fillText(s, 0, 0);
  ctx.restore();
}
