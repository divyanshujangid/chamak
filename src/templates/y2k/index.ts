import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import type { Template } from '../../engine/types';
import { chrome, grain, printBorder, slotOutline, sparkle, text } from '../shared';

const flash: Template = {
  id: 'y2k-flash',
  name: 'Flash',
  pack: 'diwali',
  direction: 'y2k-chrome',
  fonts: ['700 96px "Space Grotesk"'],
  slots: [{ id: 'main', x: 110, y: 290, w: 860, h: 1100, shape: 'rect' }],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, w, h);
    printBorder(ctx, this.slots[0], 22, 22);
  },
  drawForeground(ctx, w, h) {
    text(ctx, 'DIWALI ✦ 2026', 540, 1580, { font: 'Space Grotesk', weight: 700, size: 112, fill: chrome(ctx, 0, 1480, 0, 1600), stroke: 'rgba(255,255,255,0.9)', strokeWidth: 2, maxWidth: 940 });
    text(ctx, 'flash on. lights on.', 540, 1680, { font: 'Space Grotesk', weight: 500, size: 38, fill: '#A0A0A0', tracking: 4 });
    text(ctx, '● REC', 130, 220, { font: 'Space Grotesk', weight: 700, size: 34, fill: '#FF3B30', align: 'left', tracking: 4 });
    text(ctx, '08.11.26', 950, 220, { font: 'Space Grotesk', weight: 500, size: 34, fill: '#FFB347', align: 'right', tracking: 4 });
    for (const [x, y, s] of [[90, 1780, 60], [990, 1760, 44], [960, 300, 70], [130, 1430, 34], [540, 1820, 30], [820, 1860, 50]]) sparkle(ctx, x, y, s);
    grain(ctx, w, h, 0.12);
  },
};

const chromeMirror: Template = {
  id: 'y2k-chrome-mirror',
  name: 'Chrome Mirror',
  pack: 'diwali',
  direction: 'y2k-chrome',
  fonts: ['700 220px "Space Grotesk"', '500 40px "Space Grotesk"'],
  slots: [
    { id: 'a', x: 80, y: 260, w: 540, h: 700, shape: 'rect', rotate: -6 },
    { id: 'b', x: 460, y: 560, w: 540, h: 700, shape: 'rect', rotate: 5 },
    { id: 'c', x: 170, y: 980, w: 540, h: 620, shape: 'rect', rotate: -3 },
  ],
  drawBackground(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#BDBDBD');
    g.addColorStop(0.45, '#F4F4F4');
    g.addColorStop(0.55, '#CFCFCF');
    g.addColorStop(1, '#8F8F8F');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (const s of this.slots) printBorder(ctx, s, 16, 16);
  },
  drawForeground(ctx, w, h) {
    text(ctx, 'diwali 2026', 1000, 180, { font: 'Space Grotesk', weight: 500, size: 40, fill: '#333', align: 'right', tracking: 4 });
    const ink = ctx.createLinearGradient(0, 1620, 0, 1840);
    ink.addColorStop(0, '#1A1A1A');
    ink.addColorStop(0.45, '#6A6A6A');
    ink.addColorStop(0.5, '#0A0A0A');
    ink.addColorStop(1, '#3A3A3A');
    text(ctx, 'lit.', 90, 1830, { font: 'Space Grotesk', weight: 700, size: 260, fill: ink, stroke: '#FFFFFF', strokeWidth: 3, align: 'left', shadow: { color: 'rgba(0,0,0,0.25)', blur: 20 } });
    sparkle(ctx, 900, 1720, 90, '#FFFFFF');
    sparkle(ctx, 1000, 1640, 40, '#FFFFFF');
    grain(ctx, w, h, 0.08);
  },
};

const neon: Template = {
  id: 'y2k-neon-grain',
  name: 'Neon Grain',
  pack: 'diwali',
  direction: 'y2k-chrome',
  locked: true,
  fonts: ['700 88px "Space Grotesk"'],
  slots: [
    { id: 'a', x: 90, y: 330, w: 900, h: 600, shape: 'rounded', radius: 24 },
    { id: 'b', x: 90, y: 990, w: 900, h: 600, shape: 'rounded', radius: 24 },
  ],
  drawBackground(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#12001A');
    g.addColorStop(1, '#2A0033');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  },
  drawForeground(ctx, w, h) {
    ctx.save();
    ctx.shadowColor = '#FF2E88';
    ctx.shadowBlur = 30;
    for (const s of this.slots) slotOutline(ctx, s, 10, 5, '#FF2E88');
    ctx.restore();
    text(ctx, 'DIWALI MODE: ON', 540, 230, { font: 'Space Grotesk', weight: 700, size: 52, fill: '#00E5FF', tracking: 8, shadow: { color: '#00E5FF', blur: 24 } });
    text(ctx, 'shine bright', 540, 1730, { font: 'Space Grotesk', weight: 700, size: 120, fill: '#FF2E88', shadow: { color: '#FF2E88', blur: 40 } });
    sparkle(ctx, 120, 1830, 50, '#00E5FF');
    sparkle(ctx, 960, 260, 50, '#00E5FF');
    grain(ctx, w, h, 0.1);
  },
};

export default [flash, chromeMirror, neon];
