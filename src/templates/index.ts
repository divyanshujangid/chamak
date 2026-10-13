import type { Template } from '../engine/types';
import v2only from './v2';
import collages from './v2/collages';
import artful from './v2/artful';
import scrapbook from './v2/scrapbook';

const v2 = [...scrapbook, ...artful, ...collages, ...v2only];

/** Display order: festival-of-the-moment first, then the rest. Old v1 set retired (rejected in review). */
export function allTemplates(now = new Date()): Template[] {
  const navFirst = now < new Date('2026-10-21');
  const nav = v2.filter((t) => t.pack === 'navratri');
  const diw = v2.filter((t) => t.pack === 'diwali');
  const ordered = navFirst ? [...nav, ...diw] : [...diw, ...nav];
  return [...ordered.filter((t) => !t.locked), ...ordered.filter((t) => t.locked)];
}

export const TEMPLATES = allTemplates();
export const byId = new Map(TEMPLATES.map((t) => [t.id, t]));
export const HAS_BONUS = TEMPLATES.some((t) => t.locked);
export const DIRECTION_LABEL: Record<Template['direction'], string> = {
  'navratri-pop': 'Navratri',
  'royal-diwali': 'Royal Diwali',
  'minimal-pastel': 'Minimal',
  'y2k-chrome': 'Insta Story',
};
