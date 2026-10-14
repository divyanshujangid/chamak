// v4: faithful recreations of the owner's Pinterest references (14 Oct 2026, evening).
import type { Template } from '../../engine/types';
import pinkpaper from './pinkpaper';
import pond from './pond';
import desi from './desi';
import luxe from './luxe';
import colours from './colours';

export const V4_SETS: Record<string, Template[]> = { pinkpaper, pond4: pond, desi, luxe, colours4: colours };
const v4: Template[] = [...colours, ...pinkpaper, ...pond, ...desi, ...luxe];
export default v4;
