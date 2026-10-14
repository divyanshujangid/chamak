// v4 · pond4: faithful recreations of two of the owner's Pinterest pins.
//  r4-paper-lily     <- pins/884253708119524264 (handmade paper, 3 black slots, torn-paper player,
//                       photographic pink water lily, red watercolour lotuses, pink cosmos)
//  r4-monet-pond     <- pins/1135751599800041704 (pastel Monet water lilies, 4 cream slots,
//                       dark player card, white-lily circle, "(HMM)" + emoji row)
//  r4-monet-pond-3   same family, 3 slots, Monet's Nymphéas (1915, Marmottan) in lilac and green.
// All art is raster (Pixabay Content License / public-domain Monet); see public/art/ref/CREDITS-pond4.md.
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/600.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/inter-tight/800.css';
import type { Slot, Template } from '../../engine/types';
import { art } from '../../engine/assets';
import { cached, grain, rng } from '../v2/art';

type Ctx = CanvasRenderingContext2D;
const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif';
const EMOJI = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

const A = {
  paper: 'ref/pd-paper',
  lily: 'ref/pd-pink-lily',
  cosmos: 'ref/pd-cosmos',
  red: 'ref/pd-red-lotus',
  white: 'ref/pd-white-lily',
  monetA: 'ref/pd-monet-a',
  monetB: 'ref/pd-monet-b',
};

/** Draw a raster art piece centred at (cx, cy), `w` wide, rotated `rot` degrees. */
function put(ctx: Ctx, name: string, cx: number, cy: number, w: number, rot = 0, opts: { flip?: boolean; alpha?: number; shadow?: number } = {}) {
  const img = art(name);
  if (!img) return;
  const h = (w * img.naturalHeight) / img.naturalWidth;
  ctx.save();
  ctx.translate(cx, cy);
  if (rot) ctx.rotate((rot * Math.PI) / 180);
  if (opts.flip) ctx.scale(-1, 1);
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  if (opts.shadow) {
    ctx.shadowColor = 'rgba(40,20,10,0.28)';
    ctx.shadowBlur = opts.shadow;
    ctx.shadowOffsetY = opts.shadow * 0.35;
  }
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/** Full-bleed background image (already 1080x1920). */
function bg(ctx: Ctx, name: string, w: number, h: number, fallback: string) {
  ctx.fillStyle = fallback;
  ctx.fillRect(0, 0, w, h);
  const img = art(name);
  if (img) ctx.drawImage(img, 0, 0, w, h);
}

/* ------------------------------------------------------------------ */
/* r4-paper-lily                                                       */
/* ------------------------------------------------------------------ */

// Measured from the pin (736x1308) and scaled x1.4674.
const paperSlots: Slot[] = [
  { id: 'a', x: 445, y: 84, w: 576, h: 430, shape: 'rect' },
  { id: 'b', x: 59, y: 664, w: 404, h: 536, shape: 'rect' },
  { id: 'c', x: 648, y: 690, w: 432, h: 690, shape: 'rect' },
];

/** Jagged torn-paper outline (fine fibres) around a rect. */
function tornPath(ctx: Ctx, x: number, y: number, w: number, h: number, seed: number, amp = 7, step = 5) {
  const r = rng(seed);
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = step; i < w; i += step) ctx.lineTo(x + i, y + (r() - 0.5) * amp - (r() < 0.12 ? amp * 0.8 : 0));
  for (let i = 0; i < h; i += step) ctx.lineTo(x + w + (r() - 0.5) * amp * 0.5, y + i);
  for (let i = w; i > 0; i -= step) ctx.lineTo(x + i, y + h + (r() - 0.5) * amp + (r() < 0.12 ? amp * 0.8 : 0));
  for (let i = h; i > 0; i -= step) ctx.lineTo(x + (r() - 0.5) * amp * 0.5, y + i);
  ctx.closePath();
}

/** The beige torn-paper music player from the pin (no brand, just controls). */
function paperPlayer(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const card = cached(`pd-paper-player-${w}x${h}`, w + 40, h + 40, (c) => {
    c.translate(20, 20);
    // white paper core showing at the torn edge
    tornPath(c, -4, -6, w + 8, h + 12, 11, 10, 4);
    c.shadowColor = 'rgba(60,40,20,0.25)';
    c.shadowBlur = 14;
    c.shadowOffsetY = 4;
    c.fillStyle = '#F4EFE6';
    c.fill();
    c.shadowColor = 'transparent';
    // beige face with paper texture
    tornPath(c, 0, 0, w, h, 23, 8, 5);
    c.save();
    c.clip();
    c.fillStyle = '#D8CCBA';
    c.fillRect(0, 0, w, h);
    const tex = art(A.paper);
    if (tex) {
      c.globalCompositeOperation = 'multiply';
      c.globalAlpha = 0.9;
      c.drawImage(tex, 200, 600, 500, 260, 0, 0, w, h);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
    }
    grain(c, w, h, 0.08, 'multiply');
    c.restore();
    // controls (scaled from the pin: 305x142 px)
    const k = w / 305;
    const ink = '#2B2724';
    c.save();
    c.scale(k, k);
    c.fillStyle = ink;
    c.strokeStyle = ink;
    // "..." menu
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(240 + i * 4.2, 27, 1.3, 0, Math.PI * 2); c.fill(); }
    // progress
    c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(48, 58); c.lineTo(252, 58); c.stroke();
    c.font = `600 6.5px ${SANS}`;
    c.textAlign = 'right';
    c.fillText('3:37', 252, 67);
    c.textAlign = 'left';
    const cy = 102;
    // shuffle
    c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(33, cy - 4); c.lineTo(36, cy - 4); c.lineTo(42, cy + 4); c.lineTo(45, cy + 4); c.stroke();
    c.beginPath(); c.moveTo(33, cy + 4); c.lineTo(36, cy + 4); c.lineTo(42, cy - 4); c.lineTo(45, cy - 4); c.stroke();
    // prev
    c.fillRect(78, cy - 5, 1.8, 10);
    c.beginPath(); c.moveTo(89, cy - 5.5); c.lineTo(89, cy + 5.5); c.lineTo(80.5, cy); c.closePath(); c.fill();
    // pause in circle
    c.lineWidth = 1.2;
    c.beginPath(); c.arc(133, cy, 16, 0, Math.PI * 2); c.stroke();
    c.fillRect(127, cy - 6.5, 3.4, 13);
    c.fillRect(135.6, cy - 6.5, 3.4, 13);
    // next
    c.beginPath(); c.moveTo(183, cy - 5.5); c.lineTo(183, cy + 5.5); c.lineTo(191.5, cy); c.closePath(); c.fill();
    c.fillRect(192.2, cy - 5, 1.8, 10);
    // repeat
    c.lineWidth = 1.3;
    c.beginPath(); c.roundRect(226, cy - 4.5, 12, 9, 3); c.stroke();
    c.beginPath(); c.moveTo(236, cy - 7); c.lineTo(239, cy - 4.5); c.lineTo(236, cy - 2); c.stroke();
    c.restore();
  });
  ctx.drawImage(card, x - 20, y - 20);
}

/** Watercolour bleed + speckles under the red lotuses. */
function redWash(ctx: Ctx) {
  const wash = cached('pd-red-wash', 540, 640, (c) => {
    const r = rng(77);
    for (let i = 0; i < 26; i++) {
      const x = r() * 420, y = 120 + r() * 520, rad = 30 + r() * 90;
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, 'rgba(206,92,98,0.10)');
      g.addColorStop(1, 'rgba(206,92,98,0)');
      c.fillStyle = g;
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 18; i++) {
      c.fillStyle = `rgba(178,48,58,${0.25 + r() * 0.5})`;
      c.beginPath();
      c.arc(180 + r() * 340, 100 + r() * 420, 1.5 + r() * 5, 0, Math.PI * 2);
      c.fill();
    }
  });
  ctx.drawImage(wash, 0, 1280);
}

const paperLily: Template = {
  id: 'r4-paper-lily',
  name: 'Paper Lily',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`600 10px "Inter Tight"`],
  art: [A.paper, A.lily, A.cosmos, A.red],
  slots: paperSlots,
  drawBackground(ctx, w, h) {
    bg(ctx, A.paper, w, h, '#EEE8DD');
    // warm the paper slightly toward the pin's oatmeal cream
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#F6F0E6';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    redWash(ctx);
    // black slot cards (what the empty pin shows); photos cover them
    ctx.fillStyle = '#050505';
    for (const s of paperSlots) ctx.fillRect(s.x, s.y, s.w, s.h);
  },
  drawForeground(ctx) {
    // torn-paper player pasted across the top of slot c
    paperPlayer(ctx, 603, 545, 446, 206);
    // photographic pink water lily overlapping slot b's top edge and the player
    put(ctx, A.lily, 482, 640, 430, -8, { shadow: 18 });
    // red watercolour lotuses, bottom-left (two big ones bleeding off the edge + a small bud)
    put(ctx, A.red, 170, 1360, 470, 6);
    put(ctx, A.red, 120, 1720, 520, -4, { flip: true });
    put(ctx, A.red, 478, 1802, 190, 3);
    // pink cosmos bottom-right
    put(ctx, A.cosmos, 868, 1648, 420, -6, { shadow: 12 });
  },
};

/* ------------------------------------------------------------------ */
/* Monet pond family                                                   */
/* ------------------------------------------------------------------ */

/** Dark phone-style music card from the pin (generic, no logo). */
function darkPlayer(ctx: Ctx, x: number, y: number, w: number, title: string, sub: string, progress: number) {
  const k = w / 297; // pin card was 297x145
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 5;
  ctx.beginPath();
  ctx.roundRect(0, 0, 297, 145, 20);
  ctx.fillStyle = 'rgba(30,33,30,0.94)';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 11px ${SANS}`;
  ctx.fillText(title, 17, 28);
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = `500 8.5px ${SANS}`;
  ctx.fillText(sub, 17, 41);
  // add (+) circle
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(270, 30, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(265, 30); ctx.lineTo(275, 30); ctx.moveTo(270, 25); ctx.lineTo(270, 35); ctx.stroke();
  // progress
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(17, 64, 263, 2);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(17, 64, 263 * progress, 2);
  ctx.beginPath(); ctx.arc(17 + 263 * progress, 65, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `500 6.5px ${SANS}`;
  ctx.fillText('0:38', 17, 77);
  ctx.textAlign = 'right';
  ctx.fillText('2:39', 280, 77);
  ctx.textAlign = 'left';
  const cy = 110;
  // shuffle (green, active)
  ctx.strokeStyle = '#1ED760';
  ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(18, cy - 5); ctx.lineTo(22, cy - 5); ctx.lineTo(29, cy + 5); ctx.lineTo(34, cy + 5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(18, cy + 5); ctx.lineTo(22, cy + 5); ctx.lineTo(29, cy - 5); ctx.lineTo(34, cy - 5); ctx.stroke();
  ctx.fillStyle = '#1ED760';
  ctx.beginPath(); ctx.arc(26, cy + 12, 1.4, 0, Math.PI * 2); ctx.fill();
  // prev / next
  ctx.fillStyle = '#FFF';
  ctx.fillRect(78, cy - 7, 2.6, 14);
  ctx.beginPath(); ctx.moveTo(93, cy - 8); ctx.lineTo(93, cy + 8); ctx.lineTo(81, cy); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(204, cy - 8); ctx.lineTo(204, cy + 8); ctx.lineTo(216, cy); ctx.closePath(); ctx.fill();
  ctx.fillRect(216.5, cy - 7, 2.6, 14);
  // play/pause
  ctx.beginPath(); ctx.arc(148, cy, 23, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.fillRect(141, cy - 8, 4.5, 16);
  ctx.fillRect(150.5, cy - 8, 4.5, 16);
  // sleep timer
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(271, cy + 1, 7, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(271, cy + 1); ctx.lineTo(271, cy - 3.5); ctx.moveTo(268, cy - 9); ctx.lineTo(274, cy - 9); ctx.stroke();
  ctx.restore();
}

/** Photo of a white water lily in a circle (behind the slots, like the pin). */
function lilyCircle(ctx: Ctx, cx: number, cy: number, r: number) {
  const img = art(A.white);
  ctx.save();
  ctx.shadowColor = 'rgba(40,30,40,0.18)';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#1D3A33';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.clip();
  if (img) ctx.drawImage(img, cx - r * 1.08, cy - r * 1.02, r * 2.16, r * 2.16);
  ctx.restore();
}

function hmm(ctx: Ctx, x: number, y: number, size: number) {
  ctx.save();
  ctx.font = `800 ${size}px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(80,60,80,0.25)';
  ctx.shadowBlur = 10;
  ctx.fillText('(HMM)', x, y);
  ctx.restore();
}

function emojiRow(ctx: Ctx, s: string, x: number, y: number, size: number) {
  ctx.save();
  ctx.font = `${size}px ${EMOJI}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
  ctx.restore();
}

/** Pastel wash over the Monet so it reads soft like the pin (cached per name). */
function monetBg(ctx: Ctx, name: string, w: number, h: number, tint: string) {
  bg(ctx, name, w, h, '#D9D3D6');
  ctx.save();
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// Measured from the pin (720x1280) and scaled x1.5.
const monetSlots: Slot[] = [
  { id: 'a', x: 83, y: 465, w: 410, h: 410, shape: 'rect' },
  { id: 'b', x: 524, y: 615, w: 498, h: 497, shape: 'rect' },
  { id: 'c', x: 78, y: 1133, w: 333, h: 331, shape: 'rect' },
  { id: 'd', x: 428, y: 1133, w: 594, h: 331, shape: 'rect' },
];

const CREAM = '#FCFAF0';

const monetPond: Template = {
  id: 'r4-monet-pond',
  name: 'Monet Pond',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`800 66px "Inter Tight"`, `700 11px "Inter Tight"`, `500 9px "Inter Tight"`],
  art: [A.monetA, A.white],
  slots: monetSlots,
  drawBackground(ctx, w, h) {
    monetBg(ctx, A.monetA, w, h, 'rgba(255,236,240,0.10)');
    lilyCircle(ctx, 548, 497, 202);
    ctx.fillStyle = CREAM;
    for (const s of monetSlots) ctx.fillRect(s.x, s.y, s.w, s.h);
  },
  drawForeground(ctx) {
    hmm(ctx, 812, 200, 66);
    emojiRow(ctx, '🪷🦢🪞', 772, 572, 56);
    darkPlayer(ctx, 60, 890, 446, 'sun saawariya', 'garba nights · on repeat', 0.24);
  },
};

const monetSlots3: Slot[] = [
  { id: 'a', x: 70, y: 420, w: 520, h: 640, shape: 'rect' },
  { id: 'b', x: 614, y: 640, w: 396, h: 420, shape: 'rect' },
  { id: 'c', x: 70, y: 1090, w: 940, h: 520, shape: 'rect' },
];

const monetPond3: Template = {
  id: 'r4-monet-pond-3',
  name: 'Monet Pond III',
  pack: 'navratri',
  direction: 'minimal-pastel',
  fonts: [`800 60px "Inter Tight"`, `700 11px "Inter Tight"`, `500 9px "Inter Tight"`],
  art: [A.monetB, A.white],
  slots: monetSlots3,
  drawBackground(ctx, w, h) {
    monetBg(ctx, A.monetB, w, h, 'rgba(255,228,232,0.12)');
    lilyCircle(ctx, 812, 470, 190);
    ctx.fillStyle = CREAM;
    for (const s of monetSlots3) ctx.fillRect(s.x, s.y, s.w, s.h);
  },
  drawForeground(ctx) {
    hmm(ctx, 300, 300, 60);
    emojiRow(ctx, '🪷🫧🦢', 84, 376, 54);
    darkPlayer(ctx, 548, 1560, 446, 'kesariya rang', 'navratri dump · on repeat', 0.42);
  },
};

const list: Template[] = [paperLily, monetPond, monetPond3];
export default list;
