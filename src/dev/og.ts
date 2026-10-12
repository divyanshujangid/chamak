import '@fontsource-variable/dm-sans';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import { render, loadFonts } from '../engine/renderer';
import { assign } from '../engine/assign';
import { byId } from '../templates';
import { demoPhotos } from '../ui/demoPhotos';
import { glow, sparkle } from '../templates/shared';

(async () => {
  const c = document.getElementById('c') as HTMLCanvasElement;
  const ctx = c.getContext('2d')!;
  const photos = await demoPhotos();
  const map = new Map(photos.map((p) => [p.id, p]));
  await document.fonts.load('400 80px "Instrument Serif"');
  await document.fonts.load('italic 400 80px "Instrument Serif"');
  await document.fonts.load('500 24px "DM Sans Variable"');
  ctx.fillStyle = '#0E0A0C';
  ctx.fillRect(0, 0, 1200, 630);
  glow(ctx, 900, 330, 520, '240,140,40', 0.35);
  const cards: [string, number, number, number][] = [
    ['navratri-garba-night', 700, 70, -9],
    ['pastel-beige-air', 990, 70, 9],
    ['diwali-diya-glow', 840, 40, 0],
  ];
  for (const [id, x, y, rot] of cards) {
    const t = byId.get(id)!;
    await loadFonts(t);
    const off = document.createElement('canvas');
    off.width = 540; off.height = 960;
    render(off.getContext('2d')!, 540, 960, t, assign(t, photos), map);
    const w = 300, h = 533;
    ctx.save();
    ctx.translate(x - 90 + w / 2, y + h / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 16);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.clip();
    ctx.drawImage(off, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.fillStyle = '#F7F1EA';
  ctx.font = '400 54px "Instrument Serif"';
  ctx.fillText('chamak', 70, 110);
  ctx.fillStyle = '#F0B32E';
  ctx.font = '400 30px "Instrument Serif"';
  ctx.fillText('✦', 240, 80);
  ctx.fillStyle = '#F7F1EA';
  ctx.font = '400 76px "Instrument Serif"';
  ctx.fillText('Festive frames', 70, 290);
  ctx.fillText('for your photos.', 70, 368);
  ctx.fillStyle = '#F0B32E';
  ctx.font = 'italic 400 76px "Instrument Serif"';
  ctx.fillText('In 30 seconds.', 70, 446);
  ctx.fillStyle = '#B8ADA6';
  ctx.font = '500 26px "DM Sans Variable"';
  ctx.fillText('Free  ·  No signup  ·  100% private', 70, 540);
  sparkle(ctx, 560, 120, 30, '#F0B32E');
  document.body.dataset.done = '1';
})();
