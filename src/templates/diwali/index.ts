import '@fontsource/rozha-one';
import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/500.css';
import type { Template } from '../../engine/types';
import { diya, frameRule, glow, goldFoil, grain, mandala, slotOutline, sparkle, stringLights, text } from '../shared';

const diyaGlow: Template = {
  id: 'diwali-diya-glow',
  name: 'Diya Glow',
  pack: 'diwali',
  direction: 'royal-diwali',
  fonts: ['400 140px "Rozha One"', '300 36px "Cormorant Garamond"'],
  slots: [{ id: 'main', x: 120, y: 290, w: 840, h: 1110, shape: 'arch' }],
  drawBackground(ctx, w, h) {
    const g = ctx.createRadialGradient(540, 900, 100, 540, 900, 1250);
    g.addColorStop(0, '#3A0D16');
    g.addColorStop(1, '#0B0608');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    glow(ctx, 540, 1780, 600, '255,138,0', 0.4);
    grain(ctx, w, h, 0.05);
  },
  drawForeground(ctx, w, h) {
    const gold = goldFoil(ctx);
    frameRule(ctx, w, h, 36, 2, gold);
    slotOutline(ctx, this.slots[0], 18, 6, gold);
    slotOutline(ctx, this.slots[0], 34, 2, gold);
    text(ctx, '✦  2026  ✦', 540, 190, { font: 'Cormorant Garamond', weight: 500, size: 40, fill: '#E9C46A', tracking: 12 });
    text(ctx, 'Happy Diwali', 540, 1580, { font: 'Rozha One', size: 150, fill: gold, maxWidth: 900, shadow: { color: 'rgba(255,150,40,0.35)', blur: 30 } });
    text(ctx, 'शुभ दीपावली', 540, 1665, { font: 'Rozha One', size: 58, fill: 'rgba(246,226,122,0.75)' });
    diya(ctx, 330, 1850, 80);
    diya(ctx, 540, 1860, 110);
    diya(ctx, 750, 1850, 80);
  },
};

const maroonFoil: Template = {
  id: 'diwali-maroon-foil',
  name: 'Maroon Foil',
  pack: 'diwali',
  direction: 'royal-diwali',
  fonts: ['400 120px "Rozha One"', '300 36px "Cormorant Garamond"'],
  slots: [
    { id: 'top', x: 90, y: 270, w: 900, h: 600, shape: 'rect' },
    { id: 'l', x: 90, y: 910, w: 430, h: 620, shape: 'rect' },
    { id: 'r', x: 560, y: 910, w: 430, h: 620, shape: 'rect' },
  ],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#3B0A14';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.strokeStyle = 'rgba(233,196,106,0.06)';
    ctx.lineWidth = 2;
    for (let x = -h; x < w; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h, h);
      ctx.stroke();
    }
    ctx.restore();
  },
  drawForeground(ctx, w, h) {
    const gold = goldFoil(ctx);
    for (const s of this.slots) slotOutline(ctx, s, 0, 6, gold);
    for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) mandala(ctx, x, y, 170, 12, gold, 3);
    text(ctx, 'DIWALI', 540, 200, { font: 'Rozha One', size: 130, fill: gold, tracking: 28 });
    text(ctx, 'शुभ दीपावली', 540, 1680, { font: 'Rozha One', size: 84, fill: gold });
    text(ctx, 'two thousand twenty-six', 540, 1760, { font: 'Cormorant Garamond', weight: 500, style: 'italic', size: 40, fill: '#E9C46A', tracking: 4 });
  },
};

const nightLights: Template = {
  id: 'diwali-night-lights',
  name: 'Night of Lights',
  pack: 'diwali',
  direction: 'royal-diwali',
  locked: true,
  fonts: ['400 110px "Rozha One"', '500 36px "Cormorant Garamond"'],
  slots: [
    { id: 'a', x: 100, y: 430, w: 880, h: 600, shape: 'rounded', radius: 32 },
    { id: 'b', x: 100, y: 1070, w: 880, h: 600, shape: 'rounded', radius: 32 },
  ],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#060406';
    ctx.fillRect(0, 0, w, h);
    glow(ctx, 540, 120, 700, '255,170,60', 0.18);
    grain(ctx, w, h, 0.07);
  },
  drawForeground(ctx) {
    const gold = goldFoil(ctx, 0, 250, 1080, 400);
    stringLights(ctx, 1080, 10, 50, 11, ['#FFD54F', '#FF8A00', '#FFF3D0']);
    text(ctx, 'Shubh Deepavali', 540, 350, { font: 'Rozha One', size: 120, fill: gold, maxWidth: 920 });
    for (const s of this.slots) slotOutline(ctx, s, 0, 3, 'rgba(246,226,122,0.6)');
    text(ctx, 'with love, this Diwali', 540, 1780, { font: 'Cormorant Garamond', weight: 500, style: 'italic', size: 52, fill: '#F6E27A' });
    for (const [x, y, s] of [[120, 1730, 40], [960, 1700, 54], [880, 1850, 30], [200, 1860, 26], [540, 1860, 34]]) sparkle(ctx, x, y, s, '#FFE9A8');
  },
};

export default [diyaGlow, maroonFoil, nightLights];
