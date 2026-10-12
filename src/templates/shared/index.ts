// Code-drawn art helpers. All coordinates in design units (1080x1920).
type Ctx = CanvasRenderingContext2D;

export function goldFoil(ctx: Ctx, x0 = 0, y0 = 0, x1 = 1080, y1 = 1920) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#8A6A1F');
  g.addColorStop(0.28, '#F6E27A');
  g.addColorStop(0.45, '#C9A23A');
  g.addColorStop(0.6, '#FFF3B0');
  g.addColorStop(0.78, '#B8892A');
  g.addColorStop(1, '#7A5A17');
  return g;
}

export function chrome(ctx: Ctx, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#5C5C5C');
  g.addColorStop(0.3, '#FFFFFF');
  g.addColorStop(0.48, '#9E9E9E');
  g.addColorStop(0.52, '#6E6E6E');
  g.addColorStop(0.7, '#FFFFFF');
  g.addColorStop(1, '#4A4A4A');
  return g;
}

let grainTile: HTMLCanvasElement | null = null;
export function grain(ctx: Ctx, w: number, h: number, alpha: number) {
  if (!grainTile) {
    grainTile = document.createElement('canvas');
    grainTile.width = grainTile.height = 256;
    const g = grainTile.getContext('2d')!;
    const img = g.createImageData(256, 256);
    let seed = 1337;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(rnd() * 255);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainTile, 'repeat')!;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Bandhani tie-dye dot field. */
export function bandhani(ctx: Ctx, w: number, h: number, color: string, alpha: number, spacing = 44, r = 9) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let row = 0, y = spacing / 2; y < h + spacing; y += spacing * 0.866, row++) {
    for (let x = row % 2 ? spacing / 2 : 0; x < w + spacing; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fill();
    }
  }
  ctx.restore();
}

export function glow(ctx: Ctx, x: number, y: number, r: number, rgb = '255,138,0', a = 0.55) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(0.5, `rgba(${rgb},${a * 0.35})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Clay diya with flame. (x,y) = bottom-centre of bowl. */
export function diya(ctx: Ctx, x: number, y: number, size: number) {
  const s = size / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  glow(ctx, 0, -70, 150, '255,150,40', 0.5);
  // bowl
  ctx.beginPath();
  ctx.moveTo(-60, -30);
  ctx.quadraticCurveTo(-55, 10, 0, 12);
  ctx.quadraticCurveTo(55, 10, 70, -30);
  ctx.quadraticCurveTo(80, -38, 62, -36);
  ctx.lineTo(-60, -36);
  ctx.closePath();
  const bowl = ctx.createLinearGradient(0, -36, 0, 12);
  bowl.addColorStop(0, '#E07A2E');
  bowl.addColorStop(1, '#7A2E0E');
  ctx.fillStyle = bowl;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,150,0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, -34, 60, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  // flame
  ctx.beginPath();
  ctx.moveTo(42, -40);
  ctx.bezierCurveTo(20, -60, 30, -95, 46, -125);
  ctx.bezierCurveTo(62, -95, 72, -60, 50, -40);
  ctx.closePath();
  const f = ctx.createLinearGradient(46, -125, 46, -40);
  f.addColorStop(0, '#FFF7C2');
  f.addColorStop(0.5, '#FFC23A');
  f.addColorStop(1, '#FF6A00');
  ctx.shadowColor = 'rgba(255,170,40,0.9)';
  ctx.shadowBlur = 40;
  ctx.fillStyle = f;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.ellipse(46, -60, 6, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fill();
  ctx.restore();
}

/** Rangoli/mandala ring, stroke only. */
export function mandala(ctx: Ctx, x: number, y: number, r: number, petals: number, stroke: string | CanvasGradient, lw = 3) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  for (let i = 0; i < petals; i++) {
    ctx.save();
    ctx.rotate((i / petals) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.62, r * 0.14, r * 0.34, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -r * 0.98, r * 0.04, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  for (const k of [0.22, 0.28, 0.9]) {
    ctx.beginPath();
    ctx.arc(0, 0, r * k, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function paisley(ctx: Ctx, x: number, y: number, size: number, rot: number, stroke: string | CanvasGradient, lw = 4) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(size / 100, size / 100);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = (lw * 100) / size;
  const drop = (k: number) => {
    ctx.beginPath();
    ctx.moveTo(0, 50 * k);
    ctx.bezierCurveTo(-45 * k, 45 * k, -50 * k, -20 * k, -10 * k, -40 * k);
    ctx.bezierCurveTo(25 * k, -55 * k, 40 * k, -30 * k, 30 * k, -15 * k);
    ctx.bezierCurveTo(48 * k, 10 * k, 40 * k, 48 * k, 0, 50 * k);
    ctx.stroke();
  };
  drop(1);
  drop(0.6);
  ctx.beginPath();
  ctx.arc(-4, 8, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function sparkle(ctx: Ctx, x: number, y: number, size: number, color = '#FFFFFF') {
  const s = size / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(0, 0, s, 0);
  ctx.quadraticCurveTo(0, 0, 0, s);
  ctx.quadraticCurveTo(0, 0, -s, 0);
  ctx.quadraticCurveTo(0, 0, 0, -s);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = size / 2;
  ctx.fill();
  ctx.restore();
}

/** Hanging string of bulbs across the top. */
export function stringLights(ctx: Ctx, w: number, y0: number, sag: number, count: number, colors: string[]) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-20, y0);
  ctx.quadraticCurveTo(w / 2, y0 + sag * 2, w + 20, y0);
  ctx.stroke();
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const x = -20 + (w + 40) * t;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + sag * 2) + t * t * y0 + 26;
    const c = colors[i % colors.length];
    ctx.shadowColor = c;
    ctx.shadowBlur = 40;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(x, y, 13, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function frameRule(ctx: Ctx, w: number, h: number, inset: number, lw: number, stroke: string | CanvasGradient) {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
  ctx.restore();
}

export interface TextOpts {
  font: string;
  size: number;
  weight?: string | number;
  style?: string;
  fill: string | CanvasGradient;
  stroke?: string;
  strokeWidth?: number;
  align?: CanvasTextAlign;
  tracking?: number;
  maxWidth?: number;
  shadow?: { color: string; blur: number };
}

/** Draw text, shrinking to maxWidth. Supports letter-spacing. */
export function text(ctx: Ctx, str: string, x: number, y: number, o: TextOpts) {
  ctx.save();
  let size = o.size;
  const fontStr = () => `${o.style ?? ''} ${o.weight ?? 400} ${size}px "${o.font}", serif`.trim();
  ctx.font = fontStr();
  if (o.tracking) (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${o.tracking}px`;
  if (o.maxWidth) {
    while (ctx.measureText(str).width > o.maxWidth && size > 12) {
      size -= 2;
      ctx.font = fontStr();
    }
  }
  ctx.textAlign = o.align ?? 'center';
  ctx.textBaseline = 'alphabetic';
  if (o.shadow) {
    ctx.shadowColor = o.shadow.color;
    ctx.shadowBlur = o.shadow.blur;
  }
  if (o.stroke) {
    ctx.lineJoin = 'round';
    ctx.strokeStyle = o.stroke;
    ctx.lineWidth = o.strokeWidth ?? 6;
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = o.fill;
  ctx.fillText(str, x, y);
  ctx.restore();
}

export function dandiya(ctx: Ctx, x: number, y: number, len: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  for (const a of [-0.5, 0.5]) {
    ctx.save();
    ctx.rotate(a);
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -len / 2);
    ctx.lineTo(0, len / 2);
    ctx.stroke();
    ctx.fillStyle = color;
    for (const yy of [-len / 2 + 10, -len / 2 + 34, len / 2 - 10]) {
      ctx.beginPath();
      ctx.arc(0, yy, 13, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

/** Mirror-work (abhla) dot: white ring with dark mirror inside. */
export function mirror(ctx: Ctx, x: number, y: number, r: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fill();
  ctx.restore();
}

/** Stroke around a slot outline at an offset (for borders/frames). */
export function slotOutline(
  ctx: Ctx,
  s: { x: number; y: number; w: number; h: number; shape: string; radius?: number; rotate?: number },
  offset: number,
  lw: number,
  stroke: string | CanvasGradient,
) {
  ctx.save();
  if (s.rotate) {
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate((s.rotate * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }
  const x = s.x - offset, y = s.y - offset, w = s.w + offset * 2, h = s.h + offset * 2;
  ctx.beginPath();
  if (s.shape === 'arch') {
    const r = w / 2;
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  } else if (s.shape === 'circle') ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  else if (s.shape === 'rounded') ctx.roundRect(x, y, w, h, (s.radius ?? 32) + offset);
  else ctx.rect(x, y, w, h);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
  ctx.restore();
}

/** White instant-print border with drop shadow behind a rect slot. */
export function printBorder(ctx: Ctx, s: { x: number; y: number; w: number; h: number; rotate?: number }, b: number, bottom = b) {
  ctx.save();
  if (s.rotate) {
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate((s.rotate * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#FAFAF7';
  ctx.fillRect(s.x - b, s.y - b, s.w + b * 2, s.h + b + bottom);
  ctx.restore();
}
