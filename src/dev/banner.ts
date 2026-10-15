// Print banners for garba grounds: real templates filled with the sample photos, plus a big QR.
// banner.html?format=poster|flex&src=<slug>&label=<small location text>
//   poster: A3 portrait, 300 dpi, trim 3508x4961 plus 3 mm (35 px) bleed on every side.
//   flex:   3 ft x 2 ft landscape, 150 dpi, 5400x3600 (no bleed; shops hem/eyelet the edge).
//   card:   12 x 18 cm photo print, 300 dpi, 1417x2126, no bleed (photo labs fill the paper).
//           Drawn with the poster layout on a 2:3 design sheet, then scaled down.
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/dm-sans';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/space-mono/latin-700.css';
import '@fontsource/yatra-one/devanagari-400.css';
import QRCode from 'qrcode';
import { render, loadFonts } from '../engine/renderer';
import { assign } from '../engine/assign';
import { byId } from '../templates';
import { galleryPhotos } from '../ui/samples';
import type { Photo } from '../engine/types';

const INK = '#0B0912';
const RANI = '#FF3D8B';
const LIME = '#DBFF4A';
const GULABI = '#F4A9BE';
const CREAM = '#FFF8EF';
const GENDA = '#FFB22E';
const DIM = '#B3ABC4';
const SITE = 'storiyaan.divyanshujangid.in';

const BRICO = '"Bricolage Grotesque Variable"';
const SERIF = '"Instrument Serif"';
const DMS = '"DM Sans Variable"';
const MONO = '"Space Mono"';

const q = new URLSearchParams(location.search);
const fq = q.get('format');
const format = fq === 'flex' || fq === 'card' ? fq : 'poster';
const src = (q.get('src') || 'banner').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'banner';
const label = (q.get('label') || '').trim();
const QR_URL = `https://${SITE}/?src=${encodeURIComponent(src)}`;

const BLEED = format === 'poster' ? 35 : 0;
const TW = format === 'flex' ? 5400 : 3508;
const TH = format === 'flex' ? 3600 : format === 'card' ? 5262 : 4961;
// Output pixels per design pixel (card: 1417 px across = 12 cm at 300 dpi).
const K = format === 'card' ? 1417 / TW : 1;
const SW = TW + BLEED * 2;
const SH = TH + BLEED * 2;

const c = document.getElementById('c') as HTMLCanvasElement;
c.width = Math.round(SW * K);
c.height = Math.round(SH * K);
const ctx = c.getContext('2d')!;
ctx.scale(K, K);

const rad = (d: number) => (d * Math.PI) / 180;

function setFont(font: string, spacing = 0) {
  ctx.font = font;
  ctx.letterSpacing = `${spacing}px`;
}
function textW(s: string, font: string, spacing = 0) {
  setFont(font, spacing);
  return ctx.measureText(s).width;
}

/** One headline line made of runs, e.g. "story " in Bricolage + "ready." in rani serif italic. */
type Run = { t: string; font: string; color: string; spacing?: number };
function runsW(runs: Run[]) {
  return runs.reduce((a, r) => a + textW(r.t, r.font, r.spacing ?? 0), 0);
}
function drawRuns(runs: Run[], x: number, y: number) {
  for (const r of runs) {
    setFont(r.font, r.spacing ?? 0);
    ctx.fillStyle = r.color;
    ctx.fillText(r.t, x, y);
    x += ctx.measureText(r.t).width;
  }
  ctx.letterSpacing = '0px';
  return x;
}

function wordmarkRuns(size: number, base = '#FBF7FF'): Run[] {
  const sp = -0.04 * size;
  return [
    { t: 'storiy', font: `800 ${size}px ${BRICO}`, color: base, spacing: sp },
    { t: 'aa', font: `italic 400 ${Math.round(size * 1.18)}px ${SERIF}`, color: RANI },
    { t: 'n', font: `800 ${size}px ${BRICO}`, color: base, spacing: sp },
  ];
}

function sparkle(x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(r / 12, r / 12);
  ctx.translate(-12, -12);
  ctx.fillStyle = color;
  ctx.fill(new Path2D('M12 0c.9 6.4 4.6 10.6 12 12-7.4 1.4-11.1 5.6-12 12-.9-6.4-4.6-10.6-12-12C7.4 10.6 11.1 6.4 12 0Z'));
  ctx.restore();
}

function glow(x: number, y: number, r: number, rgba: string, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgba},${a})`);
  g.addColorStop(0.55, `rgba(${rgba},${a * 0.35})`);
  g.addColorStop(1, `rgba(${rgba},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(-BLEED, -BLEED, SW, SH);
}

/** Fine monochrome grain: hides gradient banding on print and gives the dark field some tooth. */
function grain(alpha: number) {
  const n = document.createElement('canvas');
  n.width = n.height = 256;
  const nx = n.getContext('2d')!;
  const img = nx.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  nx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = ctx.createPattern(n, 'repeat')!;
  ctx.fillRect(-BLEED, -BLEED, SW, SH);
  ctx.restore();
}

async function storyCard(id: string, photos: Photo[], map: Map<string, Photo>, w: number) {
  const t = byId.get(id);
  if (!t) throw new Error(`template ${id} missing`);
  await loadFonts(t);
  const off = document.createElement('canvas');
  off.width = Math.round(w);
  off.height = Math.round((w * 16) / 9);
  render(off.getContext('2d')!, off.width, off.height, t, assign(t, photos), map);
  return off;
}

function drawCard(img: HTMLCanvasElement, cx: number, cy: number, w: number, rot: number, shadow: number) {
  const h = (w * 16) / 9;
  const r = w * 0.055;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad(rot));
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = shadow;
  ctx.shadowOffsetY = shadow * 0.45;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, r);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save();
  ctx.clip();
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
  ctx.lineWidth = Math.max(2, w * 0.004);
  ctx.strokeStyle = 'rgba(255,248,239,0.22)';
  ctx.stroke();
  ctx.restore();
}

/** Cream panel with a level-H QR (pixel-aligned square modules), app icon in the middle, short link below. */
async function qrPanel(x: number, y: number, target: number, linkSize: number) {
  const qr = QRCode.create(QR_URL, { errorCorrectionLevel: 'H' });
  const n = qr.modules.size;
  const mod = Math.floor(target / n);
  const size = mod * n;
  const quiet = mod * 4;
  const pad = quiet;
  const linkH = linkSize * 1.9;
  const pw = size + pad * 2;
  const ph = size + pad * 2 + linkH;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = mod * 6;
  ctx.shadowOffsetY = mod * 2;
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.roundRect(x, y, pw, ph, mod * 3);
  ctx.fill();
  ctx.restore();
  const qx = Math.round(x + pad);
  const qy = Math.round(y + pad);
  ctx.fillStyle = INK;
  for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) {
    if (qr.modules.get(r, col)) ctx.fillRect(qx + col * mod, qy + r * mod, mod, mod);
  }
  // Centre logo: about 21% of the symbol width (≈4.5% of its area; level H recovers up to 30%).
  const logo = Math.round(size * 0.21);
  const lp = Math.round(mod * 0.9);
  const lx = qx + (size - logo) / 2;
  const ly = qy + (size - logo) / 2;
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.roundRect(lx - lp, ly - lp, logo + lp * 2, logo + lp * 2, logo * 0.26);
  ctx.fill();
  const icon = new Image();
  icon.src = '/icons/icon-512.png?v=3';
  await icon.decode();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(lx, ly, logo, logo, logo * 0.22);
  ctx.clip();
  ctx.drawImage(icon, lx, ly, logo, logo);
  ctx.restore();
  // Short link
  const lf = `700 ${linkSize}px ${DMS}`;
  setFont(lf, -0.01 * linkSize);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.fillText(SITE, x + pw / 2, y + pad + size + quiet * 0.15 + linkSize * 1.05);
  ctx.textAlign = 'left';
  ctx.letterSpacing = '0px';
  return { w: pw, h: ph, mod, n, size };
}

function limePill(x: number, y: number, w: number, lines: Run[][], lineH: number, padY: number) {
  const h = lines.length * lineH + padY * 2;
  ctx.fillStyle = LIME;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(h / 2, lineH * 0.9));
  ctx.fill();
  return h;
}

function chips(x: number, y: number, items: string[], size: number, maxW: number) {
  const f = `700 ${size}px ${MONO}`;
  const sp = size * 0.08;
  const padX = size * 0.75;
  const h = size * 2.1;
  const gap = size * 0.45;
  let cx = x;
  let cy = y;
  for (const it of items) {
    const w = textW(it, f, sp) + padX * 2;
    if (cx + w > x + maxW) { cx = x; cy += h + gap; }
    ctx.beginPath();
    ctx.roundRect(cx, cy, w, h, h / 2);
    ctx.fillStyle = 'rgba(255,248,239,0.07)';
    ctx.fill();
    ctx.lineWidth = Math.max(3, size * 0.06);
    ctx.strokeStyle = 'rgba(255,248,239,0.42)';
    ctx.stroke();
    setFont(f, sp);
    ctx.fillStyle = CREAM;
    ctx.fillText(it, cx + padX, cy + h / 2 + size * 0.36);
    cx += w + gap;
  }
  ctx.letterSpacing = '0px';
  return cy + h - y;
}

function sticker(cx: number, cy: number, size: number, rot: number) {
  const f = `400 ${size}px "Yatra One"`;
  const t = 'स्टोरियाँ';
  const w = textW(t, f) + size * 0.9;
  const h = size * 1.55;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad(rot));
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = size * 0.4;
  ctx.shadowOffsetY = size * 0.12;
  ctx.fillStyle = GENDA;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  setFont(f);
  ctx.fillText(t, 0, size * 0.36);
  ctx.textAlign = 'left';
  ctx.restore();
}

async function brandRow(x: number, y: number, iconSize: number, wmSize: number) {
  const icon = new Image();
  icon.src = '/icons/icon-512.png?v=3';
  await icon.decode();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, iconSize, iconSize, iconSize * 0.23);
  ctx.clip();
  ctx.drawImage(icon, x, y, iconSize, iconSize);
  ctx.restore();
  ctx.lineWidth = Math.max(2, iconSize * 0.012);
  ctx.strokeStyle = 'rgba(255,248,239,0.16)';
  ctx.beginPath();
  ctx.roundRect(x, y, iconSize, iconSize, iconSize * 0.23);
  ctx.stroke();
  drawRuns(wordmarkRuns(wmSize), x + iconSize * 1.22, y + iconSize * 0.5 + wmSize * 0.36);
}

function tag(text: string, xRight: number, y: number, size: number, maxW: number, color = DIM) {
  const fit = (s: number) => textW(text, `700 ${s}px ${MONO}`, s * 0.1);
  while (size > 24 && fit(size) > maxW) size -= 2;
  const w = fit(size);
  ctx.fillStyle = color;
  ctx.fillText(text, xRight - w, y);
  ctx.letterSpacing = '0px';
  return w;
}

const headline = (size: number): Run[][] => [
  [{ t: 'Photo daalo,', font: `800 ${size}px ${BRICO}`, color: '#FBF7FF', spacing: -0.04 * size }],
  [
    { t: 'story ', font: `800 ${size}px ${BRICO}`, color: '#FBF7FF', spacing: -0.04 * size },
    { t: 'ready.', font: `italic 400 ${Math.round(size * 1.18)}px ${SERIF}`, color: RANI },
  ],
];

const CTA = (size: number): Run[][] => [
  [{ t: 'Scan karo →', font: `800 ${size}px ${BRICO}`, color: INK, spacing: -0.03 * size }],
  [
    { t: '30 sec mein ', font: `800 ${size}px ${BRICO}`, color: INK, spacing: -0.03 * size },
    { t: 'story', font: `italic 400 ${Math.round(size * 1.18)}px ${SERIF}`, color: INK },
  ],
];

const TRUST = ['FREE', 'NO SIGNUP', 'NO APP DOWNLOAD'];
const TOPTAG = (label || 'NAVRATRI 2026').toUpperCase();

(async () => {
  const photos = await galleryPhotos();
  const map = new Map(photos.map((p) => [p.id, p]));
  await Promise.all([
    document.fonts.load(`800 100px ${BRICO}`),
    document.fonts.load(`italic 400 100px ${SERIF}`),
    document.fonts.load(`700 100px ${DMS}`),
    document.fonts.load(`500 100px ${DMS}`),
    document.fonts.load(`700 100px ${MONO}`),
    document.fonts.load('400 100px "Yatra One"', 'स्टोरियाँ'),
  ]);

  // Background over the whole sheet including bleed; everything else in trim coordinates.
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, SW, SH);
  ctx.translate(BLEED, BLEED);

  if (format !== 'flex') await poster(photos, map);
  else await flex(photos, map);

  document.body.dataset.done = '1';
})().catch((e) => {
  console.error(e);
  document.body.dataset.done = 'error';
});

async function poster(photos: Photo[], map: Map<string, Photo>) {
  const W = TW, H = TH;
  const mx = Math.round(W * 0.05), my = Math.round(H * 0.05);

  glow(W * 0.05, H * 0.02, W * 0.95, '42,15,42', 1);
  glow(W * 0.55, H * 0.5, W * 0.72, '255,61,139', 0.34);
  glow(W * 0.95, H * 0.98, W * 0.6, '255,61,139', 0.16);
  grain(0.22);

  // Brand row + tag
  await brandRow(mx, my, 230, 150);
  tag(TOPTAG, W - mx, my + 115 + 22, 66, W - mx * 2 - 1250);

  // Hook + headline
  const HS = 470;
  ctx.fillStyle = GULABI;
  drawRuns([{ t: 'Garba khel ke thak gaye?', font: `800 ${190}px ${BRICO}`, color: GULABI, spacing: -0.03 * 190 }], mx, 800);
  const hl = headline(HS);
  drawRuns(hl[0], mx - 10, 1250);
  const endX = drawRuns(hl[1], mx - 10, 1700);
  sparkle(endX + 90, 1360, 70, LIME);

  // Template fan: back to front, kept below the headline and inside the side margins
  const CW = 900;
  const fan: [string, number, number, number][] = [
    ['r4-monet-pond', 2830, 2830, 12],
    ['r4-carpet-gold', 720, 2850, -12],
    ['r4-day-colour', 2190, 2740, 5],
    ['r4-desi-bomb', 1400, 2760, -5],
  ];
  for (const [id, cx, cy, rot] of fan) {
    const img = await storyCard(id, photos, map, CW * 1.6);
    drawCard(img, cx, cy, CW, rot, 130);
  }
  sticker(1830, 1990, 140, -8);

  // Bottom: QR panel right, CTA + chips left (bottom aligned to the safe line)
  const qrTarget = 1340;
  const n = QRCode.create(QR_URL, { errorCorrectionLevel: 'H' }).modules.size;
  const mod = Math.floor(qrTarget / n);
  const size = mod * n;
  const pw = size + mod * 8;
  const ph = size + mod * 8 + 92 * 1.9;
  const px = W - mx - pw, py = H - my - ph;
  const info = await qrPanel(px, py, qrTarget, 92);

  const leftW = px - mx - 110;
  const ctaSize = 168;
  const lineH = ctaSize * 1.12;
  const padY = ctaSize * 0.5;
  const chipSize = 58;
  const chipsH = chipSize * 2.1;
  const privacyH = 90;
  const blockH = (2 * lineH + padY * 2) + 70 + chipsH + 60 + privacyH;
  let y = H - my - blockH;
  const pillH = limePill(mx, y, leftW, CTA(ctaSize), lineH, padY);
  drawRuns(CTA(ctaSize)[0], mx + ctaSize * 0.55, y + padY + lineH * 0.82);
  drawRuns(CTA(ctaSize)[1], mx + ctaSize * 0.55, y + padY + lineH * 1.82);
  y += pillH + 70;
  y += chips(mx, y, TRUST, chipSize, leftW) + 60;
  drawRuns([{ t: 'Pics stay on your phone. Pakka.', font: `500 ${78}px ${DMS}`, color: DIM }], mx, y + 70);

  console.log('poster qr', info, 'cm', ((info.size * K / 300) * 2.54).toFixed(1));
}

async function flex(photos: Photo[], map: Map<string, Photo>) {
  const W = TW, H = TH;
  const mx = Math.round(W * 0.05), my = Math.round(H * 0.05);

  glow(W * 0.02, H * 0.02, W * 0.7, '42,15,42', 1);
  glow(W * 0.3, H * 0.78, W * 0.4, '255,61,139', 0.34);
  glow(W * 0.82, H * 0.35, W * 0.3, '255,61,139', 0.14);
  grain(0.22);

  // Right column: tag, chips, privacy, CTA, QR panel (bottom aligned)
  const qrTarget = 1790;
  const n = QRCode.create(QR_URL, { errorCorrectionLevel: 'H' }).modules.size;
  const mod = Math.floor(qrTarget / n);
  const size = mod * n;
  const linkSize = 104;
  const pw = size + mod * 8;
  const ph = size + mod * 8 + linkSize * 1.9;
  const px = W - mx - pw, py = H - my - ph;

  // Left: brand row, hook, headline
  await brandRow(mx, my, 210, 140);
  drawRuns([{ t: 'Garba khel ke thak gaye?', font: `800 ${170}px ${BRICO}`, color: GULABI, spacing: -0.03 * 170 }], mx, 690);
  const HS = 410;
  const hl = headline(HS);
  drawRuns(hl[0], mx - 8, 1080);
  const endX = drawRuns(hl[1], mx - 8, 1480);
  sparkle(endX + 80, 1180, 62, LIME);

  // Left bottom: template fan, back to front (right card tucks under the QR panel)
  const CW = 900;
  const fan: [string, number, number, number][] = [
    ['r4-monet-pond', 2560, 2470, 11],
    ['r4-carpet-gold', 760, 2500, -11],
    ['r4-day-colour', 1960, 2400, 4],
    ['r4-desi-bomb', 1330, 2420, -4],
  ];
  for (const [id, cx, cy, rot] of fan) {
    const img = await storyCard(id, photos, map, CW * 1.6);
    drawCard(img, cx, cy, CW, rot, 120);
  }
  sticker(2760, 1640, 120, 8);

  tag(TOPTAG, W - mx, my + 105 + 22, 62, pw);
  const ctaSize = 120;
  const ctaRuns: Run[] = [
    { t: 'Scan karo → 30 sec mein ', font: `800 ${ctaSize}px ${BRICO}`, color: INK, spacing: -0.03 * ctaSize },
    { t: 'story', font: `italic 400 ${Math.round(ctaSize * 1.18)}px ${SERIF}`, color: INK },
  ];
  const ctaH = ctaSize * 2.05;
  const ctaY = py - 70 - ctaH;
  ctx.fillStyle = LIME;
  ctx.beginPath();
  ctx.roundRect(px, ctaY, pw, ctaH, ctaH / 2);
  ctx.fill();
  drawRuns(ctaRuns, px + (pw - runsW(ctaRuns)) / 2, ctaY + ctaH / 2 + ctaSize * 0.36);
  const chipSize = 56;
  const chipsW = TRUST.reduce((a, t) => a + textW(t, `700 ${chipSize}px ${MONO}`, chipSize * 0.08) + chipSize * 1.5, 0) + chipSize * 0.45 * (TRUST.length - 1);
  const privacy: Run[] = [{ t: 'Pics stay on your phone. Pakka.', font: `500 ${66}px ${DMS}`, color: DIM }];
  const privY = ctaY - 60;
  drawRuns(privacy, px + (pw - runsW(privacy)) / 2, privY);
  chips(px + (pw - chipsW) / 2, privY - 66 - 50 - chipSize * 2.1, TRUST, chipSize, pw);

  const info = await qrPanel(px, py, qrTarget, linkSize);
  console.log('flex qr', info, 'cm', ((info.size / 150) * 2.54).toFixed(1));
}
