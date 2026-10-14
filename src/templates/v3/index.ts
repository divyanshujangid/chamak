// v3: Navratri 2026 trend pack (from Pinterest research, 14 Oct 2026).
import type { Template } from '../../engine/types';
import colours from './colours';
import boys from './boys';
import dump from './dump';
import editorial from './editorial';
import pond from './pond';

export const V3_SETS: Record<string, Template[]> = { colours, boys, dump, editorial, pond };
const v3: Template[] = [...colours, ...boys, ...dump, ...editorial, ...pond];
export default v3;
