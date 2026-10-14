// Landing-gallery shelves. Ids that don't exist (yet) are skipped, so this works
// while new template packs are still landing.
import type { Template } from '../engine/types';
import { TEMPLATES, byId } from '../templates';

export type Shelf = 'hot' | 'girls' | 'boys' | 'friends' | 'colours' | 'diwali';

const ALL_SHELVES: { id: Shelf; label: string }[] = [
  { id: 'hot', label: 'Trending' },
  { id: 'girls', label: 'Girls' },
  { id: 'boys', label: 'Boys' },
  { id: 'friends', label: 'Friends' },
  { id: 'colours', label: '9 Colours' },
  { id: 'diwali', label: 'Diwali' },
];

/** Tabs that have at least one frame (Diwali stays hidden until its pack exists). */
export const SHELVES = ALL_SHELVES.filter((s) => s.id !== 'diwali' || TEMPLATES.some((t) => t.pack === 'diwali'));

const IDS: Record<Exclude<Shelf, 'diwali'>, string[]> = {
  hot: [
    'r4-day-colour', 'r4-pink-newsprint', 'r4-monet-pond', 'r4-carpet-gold', 'r4-cream-lyric', 'r4-desi-bomb',
    'r4-paper-lily', 'r4-kraft-velvet', 'r4-lantern-white', 'r4-nine-nights', 'r4-carpet-noir', 'r4-monet-pond-3',
    'r4-pink-newsprint-3', 'r4-garba-objects',
  ],
  girls: [
    'r4-pink-newsprint', 'r4-cream-lyric', 'r4-monet-pond', 'r4-paper-lily', 'r4-desi-bomb', 'r4-lantern-white',
    'r4-pink-newsprint-3', 'r4-monet-pond-3', 'r4-carpet-gold', 'r4-kraft-velvet',
  ],
  boys: ['r4-carpet-noir', 'r4-kraft-velvet', 'r4-carpet-gold', 'r4-garba-objects'],
  friends: [
    'r4-pink-newsprint', 'r4-nine-nights', 'r4-monet-pond', 'r4-desi-bomb', 'r4-garba-objects', 'r4-lantern-white',
    'r4-cream-lyric',
  ],
  colours: ['r4-day-colour', 'r4-nine-nights'],
};

const pick = (ids: string[]) => ids.map((id) => byId.get(id)).filter((t): t is Template => !!t);

/** Templates on a shelf, in display order. "Trending" tops up with every other Navratri frame. */
export function shelf(id: Shelf): Template[] {
  if (id === 'diwali') return TEMPLATES.filter((t) => t.pack === 'diwali');
  const list = pick(IDS[id]);
  if (id !== 'hot') return list;
  const seen = new Set(list.map((t) => t.id));
  return [...list, ...TEMPLATES.filter((t) => t.pack === 'navratri' && !seen.has(t.id))];
}

/** Hero carousel: the strongest photo-first frames that exist right now. */
export function heroTemplates(): Template[] {
  const want = pick(['r4-pink-newsprint', 'r4-day-colour', 'r4-monet-pond', 'r4-carpet-gold', 'r4-cream-lyric']);
  return (want.length >= 3 ? want : TEMPLATES.slice(0, 5)).slice(0, 5);
}

/** Does a template belong on a shelf? ('hot' = everything.) */
export function onShelf(t: Template, id: Shelf): boolean {
  if (id === 'hot') return true;
  if (id === 'diwali') return t.pack === 'diwali';
  return IDS[id].includes(t.id);
}

/** The main shelf a template belongs to, for highlighting chips while browsing. */
export function shelfOf(t: Template): Shelf | null {
  if (t.pack === 'diwali') return 'diwali';
  return (['colours', 'girls', 'boys', 'friends'] as const).find((s) => IDS[s].includes(t.id)) ?? null;
}
