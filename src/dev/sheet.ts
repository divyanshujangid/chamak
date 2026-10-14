import '@fontsource-variable/dm-sans';
import { importOne } from '../engine/photos';
import { scoreAll } from '../engine/score';
import { assign } from '../engine/assign';
import { loadFonts, render } from '../engine/renderer';
import { TEMPLATES as V1, DIRECTION_LABEL } from '../templates';
import V2 from '../templates/v2';
import C from '../templates/v2/collages';
import A from '../templates/v2/artful';
import S from '../templates/v2/scrapbook';
import V3, { V3_SETS } from '../templates/v3';
import V4, { V4_SETS } from '../templates/v4';

const urls = Object.values(import.meta.glob('/dev-photos/*.jpg', { eager: true, query: '?url', import: 'default' })) as string[];
const q = new URLSearchParams(location.search);
const only = q.get('only')?.split(',');
const set = q.get('set') ?? '';
const TEMPLATES = set === 'v4' ? V4 : V4_SETS[set] ? V4_SETS[set] : set === 'v3' ? V3 : V3_SETS[set] ? V3_SETS[set] : q.get('set') === 'v2' ? V2 : q.get('set') === 'c' ? C : q.get('set') === 'a' ? A : q.get('set') === 's' ? S : V1;
const cols = q.get('cols');
if (cols) document.documentElement.style.setProperty('--cols', cols);

(async () => {
  const t0 = performance.now();
  const photos = [];
  for (const u of urls) photos.push(await importOne(await (await fetch(u)).blob()));
  scoreAll(photos);
  const t1 = performance.now();
  // Face focus for every photo, like the app does after import (?nofocus=1 to compare).
  let focusMs = 0, faces = 0;
  if (!q.has('nofocus')) {
    const { analyzeFaces } = await import('../engine/focus');
    const f0 = performance.now();
    for (const p of photos) {
      try { Object.assign(p, await analyzeFaces(p)); if (p.faceScore) faces++; } catch (e) { console.warn('focus failed', e); }
    }
    focusMs = performance.now() - f0;
  }
  const map = new Map(photos.map((p) => [p.id, p]));
  const scores = document.getElementById('scores')!;
  for (const p of [...photos].sort((a, b) => b.score - a.score)) {
    scores.insertAdjacentHTML('beforeend', `<div><img src="${p.thumbUrl}">${p.score.toFixed(2)}${p.faceScore !== undefined ? ` · f${p.faceScore.toFixed(2)}` : ""}</div>`);
  }
  const grid = document.getElementById('grid')!;
  let list = only ? TEMPLATES.filter((t) => only.includes(t.id)) : TEMPLATES;
  // ?cuttest=1: engine test only, marks each template's biggest slot as a cut-out slot.
  if (q.has('cuttest')) {
    list = list.map((t) => {
      const big = [...t.slots].sort((x, y) => y.w * y.h - x.w * x.h)[0];
      return { ...t, slots: t.slots.map((sl) => (sl === big ? { ...sl, cutout: true } : sl)) };
    });
  }
  const times: number[] = [];
  const cutMs: number[] = [];
  for (const t of list) {
    await loadFonts(t);
    const a = assign(t, photos);
    // Cut-outs for this template's cut-out slots, before drawing (?nocut=1 shows the fallback).
    for (const sl of t.slots.filter((x) => x.cutout && !q.has('nocut'))) {
      const p = map.get(a[sl.id]?.photoId ?? '');
      if (!p || p.cutout) continue;
      try {
        const { cutoutPerson } = await import('../engine/segment');
        const c0 = performance.now();
        p.cutout = await cutoutPerson(p.bitmap);
        cutMs.push(performance.now() - c0);
      } catch (e) { console.warn('cutout failed', e); }
    }
    const c = document.createElement('canvas');
    const W = +(q.get('res') ?? 540);
    c.width = W; c.height = Math.round((W * 16) / 9);
    const s = performance.now();
    render(c.getContext('2d')!, c.width, c.height, t, a, map);
    times.push(performance.now() - s);
    const f = document.createElement('figure');
    f.append(c);
    f.insertAdjacentHTML('beforeend', `<figcaption><b>${t.name}</b> · ${DIRECTION_LABEL[t.direction]}${t.locked ? ' · 🔒 bonus' : ''}</figcaption>`);
    grid.append(f);
  }
  document.getElementById('meta')!.textContent =
    `${list.length} templates · ${photos.length} photos imported+scored in ${Math.round(t1 - t0)} ms · faces in ${faces}/${photos.length} photos, focus ${Math.round(focusMs)} ms total · cut-outs ${cutMs.map(Math.round).join('/') || 'none'} ms · avg render ${Math.round(times.reduce((a, b) => a + b, 0) / times.length)} ms · Smart Pick ranking below (best first)`;
  document.body.dataset.done = '1';
})();
