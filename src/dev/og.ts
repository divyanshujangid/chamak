// Renders public/og.jpg (1200x630 link preview) from real templates filled with the sample photos.
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/dm-sans';
import '@fontsource/instrument-serif/400-italic.css';
import { render, loadFonts } from '../engine/renderer';
import { assign } from '../engine/assign';
import { byId } from '../templates';
import { galleryPhotos } from '../ui/samples';

const INK = '#0B0912';
const RANI = '#FF3D8B';
const LIME = '#DBFF4A';

(async () => {
  const c = document.getElementById('c') as HTMLCanvasElement;
  const ctx = c.getContext('2d')!;
  const photos = await galleryPhotos();
  const map = new Map(photos.map((p) => [p.id, p]));
  await Promise.all([
    document.fonts.load('800 80px "Bricolage Grotesque Variable"'),
    document.fonts.load('italic 400 80px "Instrument Serif"'),
    document.fonts.load('600 24px "DM Sans Variable"'),
  ]);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, 1200, 630);
  const glow = ctx.createRadialGradient(880, 320, 40, 880, 320, 520);
  glow.addColorStop(0, 'rgba(255,61,139,0.28)');
  glow.addColorStop(1, 'rgba(255,61,139,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1200, 630);

  // [id, centre x, top y, rotation] — back to front
  const cards: [string, number, number, number][] = [
    ['r4-monet-pond', 1120, 80, 9],
    ['r4-carpet-gold', 790, 80, -9],
    ['r4-day-colour', 1010, 46, 4],
    ['r4-pink-newsprint', 900, 36, -2],
  ];
  for (const [id, cx, y, rot] of cards) {
    const t = byId.get(id);
    if (!t) continue;
    await loadFonts(t);
    const off = document.createElement('canvas');
    off.width = 540; off.height = 960;
    render(off.getContext('2d')!, 540, 960, t, assign(t, photos), map);
    const w = 300, h = 533;
    ctx.save();
    ctx.translate(cx, y + h / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 18;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 18);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.clip();
    ctx.drawImage(off, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 46px "Bricolage Grotesque Variable"';
  ctx.fillText('chamak', 64, 96);
  ctx.fillStyle = RANI;
  ctx.font = '800 34px "Bricolage Grotesque Variable"';
  ctx.fillText('✦', 222, 70);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 84px "Bricolage Grotesque Variable"';
  ctx.fillText('Photo daalo,', 64, 262);
  ctx.fillText('story', 64, 354);
  ctx.fillStyle = RANI;
  ctx.font = 'italic 400 96px "Instrument Serif"';
  ctx.fillText('ready.', 300, 354);

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '600 26px "DM Sans Variable"';
  ctx.fillText('Aesthetic Navratri stories in 30 sec', 64, 430);

  ctx.fillStyle = LIME;
  ctx.beginPath();
  ctx.roundRect(64, 478, 452, 64, 32);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = '700 25px "DM Sans Variable"';
  ctx.fillText('Free · No signup · Pics stay private', 86, 519);

  document.body.dataset.done = '1';
})();
