import type { Photo } from '../engine/types';

/** Code-generated festive bokeh "photos" for the landing hero. No external images. */
function bokeh(seed: number, w: number, h: number, palette: string[]) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const g = ctx.createLinearGradient(0, 0, w * 0.3, h);
  g.addColorStop(0, palette[0]);
  g.addColorStop(1, palette[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) {
    const x = r() * w, y = r() * h, rad = 8 + r() * (i < 12 ? 120 : 40);
    const col = palette[2 + Math.floor(r() * (palette.length - 2))];
    const rg = ctx.createRadialGradient(x, y, 0, x, y, rad);
    rg.addColorStop(0, col);
    rg.addColorStop(0.7, col.replace(/[\d.]+\)$/, '0.12)'));
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

const PALETTES = [
  ['#2A0B12', '#120408', 'rgba(255,180,60,0.55)', 'rgba(255,120,40,0.5)', 'rgba(255,230,160,0.45)'],
  ['#1B0F3B', '#4A0E4E', 'rgba(255,90,170,0.5)', 'rgba(255,213,79,0.5)', 'rgba(140,120,255,0.45)'],
  ['#0F1A12', '#2A1A08', 'rgba(255,200,90,0.5)', 'rgba(255,150,60,0.45)', 'rgba(255,255,220,0.4)'],
  ['#2B0A0A', '#5A1010', 'rgba(255,200,80,0.55)', 'rgba(255,90,60,0.45)', 'rgba(255,240,200,0.4)'],
];

export async function demoPhotos(): Promise<Photo[]> {
  const out: Photo[] = [];
  for (let i = 0; i < PALETTES.length; i++) {
    const portrait = i % 2 === 0;
    const c = bokeh(1000 + i * 77, portrait ? 600 : 800, portrait ? 800 : 600, PALETTES[i]);
    const bitmap = await createImageBitmap(c);
    out.push({ id: `demo-${i}`, bitmap, w: c.width, h: c.height, score: 1 - i * 0.1, thumbUrl: '' });
  }
  return out;
}
