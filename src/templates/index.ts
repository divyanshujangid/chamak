import type { Template } from '../engine/types';
import navratri from './navratri';
import diwali from './diwali';
import pastel from './pastel';
import y2k from './y2k';

/** Display order. Navratri first until Dussehra, then Diwali first. */
export function allTemplates(now = new Date()): Template[] {
  const nav = navratri;
  const diw = [...diwali, ...pastel, ...y2k];
  const open = (t: Template[]) => t.filter((x) => !x.locked);
  const locked = (t: Template[]) => t.filter((x) => x.locked);
  const navFirst = now < new Date('2026-10-21');
  const [a, b] = navFirst ? [nav, diw] : [diw, nav];
  return [...open(a), ...open(b), ...locked(a), ...locked(b)];
}

export const TEMPLATES = allTemplates();
export const byId = new Map(TEMPLATES.map((t) => [t.id, t]));
export const DIRECTION_LABEL: Record<Template['direction'], string> = {
  'navratri-pop': 'Navratri Pop',
  'royal-diwali': 'Royal Diwali',
  'minimal-pastel': 'Minimal Pastel',
  'y2k-chrome': 'Y2K Chrome',
};
