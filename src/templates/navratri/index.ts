import '@fontsource/yatra-one';
import '@fontsource/baloo-2/600.css';
import '@fontsource/baloo-2/800.css';
import '@fontsource/rozha-one';
import type { Template } from '../../engine/types';
import { bandhani, dandiya, frameRule, glow, goldFoil, mirror, paisley, slotOutline, sparkle, text } from '../shared';

const garba: Template = {
  id: 'navratri-garba-night',
  name: 'Garba Night',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: ['400 110px "Yatra One"', '800 40px "Baloo 2"'],
  slots: [
    { id: 'main', x: 90, y: 230, w: 900, h: 1000, shape: 'arch' },
    { id: 'l', x: 90, y: 1290, w: 420, h: 420, shape: 'rounded', radius: 40 },
    { id: 'r', x: 570, y: 1290, w: 420, h: 420, shape: 'rounded', radius: 40 },
  ],
  drawBackground(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1B0F3B');
    g.addColorStop(0.55, '#7B1FA2');
    g.addColorStop(1, '#C2185B');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    bandhani(ctx, w, h, '#FFFFFF', 0.08);
    glow(ctx, 540, 1830, 520, '255,213,79', 0.35);
  },
  drawForeground(ctx) {
    slotOutline(ctx, this.slots[0], 16, 6, '#FFD54F');
    slotOutline(ctx, this.slots[1], 12, 4, '#FFD54F');
    slotOutline(ctx, this.slots[2], 12, 4, '#FFD54F');
    text(ctx, 'GARBA NIGHT  ·  2026', 540, 160, { font: 'Baloo 2', weight: 800, size: 42, fill: '#FFFFFF', tracking: 10 });
    text(ctx, 'शुभ नवरात्रि', 540, 1855, {
      font: 'Yatra One', size: 120, fill: '#FFD54F', maxWidth: 720,
      shadow: { color: 'rgba(0,0,0,0.45)', blur: 24 },
    });
    dandiya(ctx, 110, 1800, 150, '#FFD54F');
    dandiya(ctx, 970, 1800, 150, '#FFD54F');
    sparkle(ctx, 150, 140, 50);
    sparkle(ctx, 930, 170, 36);
  },
};

const BANDS = ['#E91E63', '#FF6F00', '#FFC107', '#1B5E20'];
const chaniya: Template = {
  id: 'navratri-chaniya',
  name: 'Chaniya Choli',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: ['800 130px "Baloo 2"', '600 48px "Baloo 2"'],
  slots: [
    { id: 'a', x: 80, y: 360, w: 440, h: 560, shape: 'rounded', radius: 48 },
    { id: 'b', x: 560, y: 360, w: 440, h: 560, shape: 'rounded', radius: 48 },
    { id: 'c', x: 80, y: 960, w: 440, h: 560, shape: 'rounded', radius: 48 },
    { id: 'd', x: 560, y: 960, w: 440, h: 560, shape: 'rounded', radius: 48 },
  ],
  drawBackground(ctx, w, h) {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 4);
    const span = 2400;
    for (let i = -16, k = 0; i < 16; i++, k++) {
      ctx.fillStyle = BANDS[((k % 4) + 4) % 4];
      ctx.fillRect(i * 160, -span / 2, 160, span);
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, 0, w, h);
  },
  drawForeground(ctx) {
    for (const s of this.slots) slotOutline(ctx, s, 6, 10, '#FFFFFF');
    text(ctx, 'Navratri', 540, 270, {
      font: 'Baloo 2', weight: 800, size: 150, fill: '#FFFFFF', stroke: '#1B5E20', strokeWidth: 14,
    });
    for (let i = 0; i < 9; i++) mirror(ctx, 140 + i * 100, 1600, i % 2 ? 14 : 22);
    text(ctx, 'नौ रातें · नौ रंग · 2026', 540, 1720, { font: 'Baloo 2', weight: 800, size: 50, fill: '#FFFFFF', stroke: '#1B5E20', strokeWidth: 8 });
    paisley(ctx, 400, 1820, 90, -0.5, '#FFFFFF', 5);
    paisley(ctx, 680, 1820, 90, 0.5 + Math.PI, '#FFFFFF', 5);
  },
};

const dandiyaPop: Template = {
  id: 'navratri-dandiya-pop',
  name: 'Dandiya Pop',
  pack: 'navratri',
  direction: 'navratri-pop',
  fonts: ['400 150px "Yatra One"', '600 40px "Baloo 2"'],
  slots: [
    { id: 'main', x: 150, y: 560, w: 780, h: 780, shape: 'circle' },
    { id: 'l', x: 50, y: 1410, w: 320, h: 320, shape: 'circle' },
    { id: 'r', x: 710, y: 1410, w: 320, h: 320, shape: 'circle' },
  ],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#FFC107';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1B5E20';
    ctx.beginPath();
    ctx.arc(540, 950, 520, 0, Math.PI * 2);
    ctx.fill();
    // sunburst rays
    ctx.save();
    ctx.translate(540, 950);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    for (let i = 0; i < 24; i += 2) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 520, (i / 24) * Math.PI * 2, ((i + 1) / 24) * Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
  drawForeground(ctx) {
    for (const s of this.slots) slotOutline(ctx, s, 10, 10, '#FFC107');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      paisley(ctx, 540 + Math.cos(a) * 455, 950 + Math.sin(a) * 455, 60, a + Math.PI / 2, '#FFC107', 5);
    }
    text(ctx, 'DANDIYA', 540, 220, { font: 'Yatra One', size: 170, fill: '#1B5E20', tracking: 6 });
    text(ctx, 'NIGHTS', 540, 380, { font: 'Yatra One', size: 150, fill: '#C2185B', tracking: 6 });
    text(ctx, "navratri '26", 540, 1860, { font: 'Baloo 2', weight: 800, size: 54, fill: '#1B5E20', tracking: 4 });
    sparkle(ctx, 120, 480, 60, '#C2185B');
    sparkle(ctx, 960, 470, 44, '#C2185B');
    sparkle(ctx, 540, 1390, 40, '#FFFFFF');
  },
};

const durga: Template = {
  id: 'navratri-maa-durga',
  name: 'Maa Durga Red',
  pack: 'navratri',
  direction: 'navratri-pop',
  locked: true,
  fonts: ['400 150px "Rozha One"', '600 40px "Baloo 2"'],
  slots: [
    { id: 'l', x: 80, y: 430, w: 450, h: 900, shape: 'arch' },
    { id: 'r', x: 550, y: 430, w: 450, h: 900, shape: 'arch' },
  ],
  drawBackground(ctx, w, h) {
    const g = ctx.createRadialGradient(540, 700, 100, 540, 900, 1300);
    g.addColorStop(0, '#B71C1C');
    g.addColorStop(1, '#4A0000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    glow(ctx, 540, 240, 420, '255,200,80', 0.4);
  },
  drawForeground(ctx, w, h) {
    const gold = goldFoil(ctx);
    frameRule(ctx, w, h, 36, 10, gold);
    frameRule(ctx, w, h, 60, 3, gold);
    for (const s of this.slots) slotOutline(ctx, s, 10, 5, gold);
    // trishul
    ctx.save();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(540, 140);
    ctx.lineTo(540, 360);
    ctx.moveTo(470, 170);
    ctx.quadraticCurveTo(470, 270, 540, 280);
    ctx.quadraticCurveTo(610, 270, 610, 170);
    ctx.moveTo(500, 330);
    ctx.lineTo(580, 330);
    ctx.stroke();
    ctx.restore();
    text(ctx, 'जय माता दी', 540, 1530, { font: 'Rozha One', size: 150, fill: gold, maxWidth: 860, shadow: { color: 'rgba(0,0,0,0.5)', blur: 20 } });
    text(ctx, 'NAVRATRI  ·  2026', 540, 1640, { font: 'Baloo 2', weight: 600, size: 40, fill: '#F6E27A', tracking: 10 });
    sparkle(ctx, 540, 1760, 46, '#F6E27A');
  },
};

export default [garba, chaniya, dandiyaPop, durga];
