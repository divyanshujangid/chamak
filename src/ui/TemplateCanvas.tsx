import { useEffect, useRef } from 'react';
import { loadFonts, render, type RenderOpts } from '../engine/renderer';
import type { Assignments, Photo, Template } from '../engine/types';

interface Props {
  template: Template;
  assignments: Assignments;
  photos: Map<string, Photo>;
  width: number; // CSS px
  opts?: RenderOpts;
  className?: string;
  label?: string;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

const fontsLoaded = new Set<string>();

/** Renders a template to a canvas at device pixel ratio (capped at 2). */
export function TemplateCanvas({ template, assignments, photos, width, opts, className, label, canvasRef }: Props) {
  const own = useRef<HTMLCanvasElement>(null);
  const ref = canvasRef ?? own;
  const height = Math.round((width * 16) / 9);
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    let cancelled = false;
    const draw = () => {
      if (cancelled) return;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, c.width, c.height);
      render(ctx, c.width, c.height, template, assignments, photos, { preview: true, ...opts });
    };
    if (fontsLoaded.has(template.id)) {
      const id = requestAnimationFrame(draw);
      return () => { cancelled = true; cancelAnimationFrame(id); };
    }
    loadFonts(template).then(() => { fontsLoaded.add(template.id); draw(); });
    return () => { cancelled = true; };
  }, [template, assignments, photos, opts?.selectedSlot, opts?.badge, width, ref, opts]);

  return (
    <canvas
      ref={ref}
      className={className}
      width={Math.round(width * dpr)}
      height={Math.round(height * dpr)}
      style={{ width, height }}
      role="img"
      aria-label={label ?? `Preview of ${template.name}`}
    />
  );
}
