import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/500.css';
import type { Template } from '../../engine/types';
import { grain, slotOutline, text } from '../shared';

const beige: Template = {
  id: 'pastel-beige-air',
  name: 'Beige Air',
  pack: 'diwali',
  direction: 'minimal-pastel',
  fonts: ['italic 400 96px "Instrument Serif"', '300 34px "Cormorant Garamond"'],
  slots: [{ id: 'main', x: 130, y: 250, w: 820, h: 1160, shape: 'rect' }],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#F3EAD8';
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 0.05);
  },
  drawForeground(ctx) {
    slotOutline(ctx, this.slots[0], 14, 28, '#FFFDF8');
    text(ctx, 'diwali', 540, 1600, { font: 'Instrument Serif', style: 'italic', size: 150, fill: '#5B4A3A' });
    text(ctx, 'TWO THOUSAND TWENTY-SIX', 540, 1690, { font: 'Cormorant Garamond', weight: 500, size: 30, fill: '#7C6A58', tracking: 8 });
    ctx.fillStyle = '#9CAF88';
    ctx.beginPath();
    ctx.arc(540, 1780, 10, 0, Math.PI * 2);
    ctx.fill();
  },
};

const sage: Template = {
  id: 'pastel-sage-grid',
  name: 'Sage Grid',
  pack: 'diwali',
  direction: 'minimal-pastel',
  fonts: ['500 44px "Cormorant Garamond"', 'italic 400 80px "Instrument Serif"'],
  slots: [
    { id: 'a', x: 90, y: 340, w: 420, h: 560, shape: 'rect' },
    { id: 'b', x: 570, y: 340, w: 420, h: 560, shape: 'rect' },
    { id: 'c', x: 90, y: 960, w: 420, h: 560, shape: 'rect' },
    { id: 'd', x: 570, y: 960, w: 420, h: 560, shape: 'rect' },
  ],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#E6EBE0';
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 0.04);
  },
  drawForeground(ctx) {
    text(ctx, 'FESTIVE SEASON', 540, 220, { font: 'Cormorant Garamond', weight: 500, size: 44, fill: '#3F4A3C', tracking: 14 });
    ctx.fillStyle = '#3F4A3C';
    ctx.fillRect(440, 255, 200, 1.5);
    text(ctx, 'little moments of light', 540, 1680, { font: 'Instrument Serif', style: 'italic', size: 76, fill: '#3F4A3C' });
    text(ctx, '— diwali ’26', 540, 1760, { font: 'Cormorant Garamond', weight: 500, size: 36, fill: '#6B7766', tracking: 3 });
  },
};

const blush: Template = {
  id: 'pastel-blush-arch',
  name: 'Blush Arch',
  pack: 'diwali',
  direction: 'minimal-pastel',
  locked: true,
  fonts: ['400 100px "Instrument Serif"', '300 34px "Cormorant Garamond"'],
  slots: [{ id: 'main', x: 150, y: 200, w: 780, h: 1240, shape: 'arch' }],
  drawBackground(ctx, w, h) {
    ctx.fillStyle = '#F6E3DD';
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 0.05);
  },
  drawForeground(ctx) {
    slotOutline(ctx, this.slots[0], 18, 2, '#6B3F3A');
    text(ctx, 'happy diwali', 540, 1610, { font: 'Instrument Serif', size: 120, fill: '#6B3F3A' });
    ctx.fillStyle = '#6B3F3A';
    ctx.fillRect(390, 1650, 300, 1.5);
    text(ctx, 'light · love · family', 540, 1730, { font: 'Cormorant Garamond', weight: 500, style: 'italic', size: 40, fill: '#8A5A54', tracking: 3 });
  },
};

export default [beige, sage, blush];
