import '@fontsource-variable/dm-sans';
import { importOne } from '../engine/photos';
import { scoreAll } from '../engine/score';
import { assign } from '../engine/assign';
import { loadFonts, render } from '../engine/renderer';
import { TEMPLATES, DIRECTION_LABEL } from '../templates';

const urls = Object.values(import.meta.glob('/dev-photos/*.jpg', { eager: true, query: '?url', import: 'default' })) as string[];
const q = new URLSearchParams(location.search);
const only = q.get('only')?.split(',');
const cols = q.get('cols');
if (cols) document.documentElement.style.setProperty('--cols', cols);

(async () => {
  const t0 = performance.now();
  const photos = [];
  for (const u of urls) photos.push(await importOne(await (await fetch(u)).blob()));
  scoreAll(photos);
  const t1 = performance.now();
  const map = new Map(photos.map((p) => [p.id, p]));
  const scores = document.getElementById('scores')!;
  for (const p of [...photos].sort((a, b) => b.score - a.score)) {
    scores.insertAdjacentHTML('beforeend', `<div><img src="${p.thumbUrl}">${p.score.toFixed(2)}</div>`);
  }
  const grid = document.getElementById('grid')!;
  const list = only ? TEMPLATES.filter((t) => only.includes(t.id)) : TEMPLATES;
  const times: number[] = [];
  for (const t of list) {
    await loadFonts(t);
    const c = document.createElement('canvas');
    c.width = 540; c.height = 960;
    const s = performance.now();
    render(c.getContext('2d')!, 540, 960, t, assign(t, photos), map);
    times.push(performance.now() - s);
    const f = document.createElement('figure');
    f.append(c);
    f.insertAdjacentHTML('beforeend', `<figcaption><b>${t.name}</b> · ${DIRECTION_LABEL[t.direction]}${t.locked ? ' · 🔒 bonus' : ''}</figcaption>`);
    grid.append(f);
  }
  document.getElementById('meta')!.textContent =
    `${list.length} templates · ${photos.length} photos imported+scored in ${Math.round(t1 - t0)} ms · avg render ${Math.round(times.reduce((a, b) => a + b, 0) / times.length)} ms · Smart Pick ranking below (best first)`;
  document.body.dataset.done = '1';
})();
