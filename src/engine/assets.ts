// Licensed raster art (Pixabay Content License; see public/art/CREDITS.md).
// Images are decoded once and shared; templates draw them synchronously after load.
const cache = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<void>>();

export function artUrl(name: string) {
  return `${import.meta.env.BASE_URL}art/${name}.webp`;
}

export function loadArt(names: string[]): Promise<void> {
  return Promise.all(
    names.map((n) => {
      if (cache.has(n)) return;
      let p = pending.get(n);
      if (!p) {
        const img = new Image();
        img.decoding = 'async';
        img.src = artUrl(n);
        p = img.decode().then(() => { cache.set(n, img); }, () => { /* draw without it */ });
        pending.set(n, p);
      }
      return p;
    }),
  ).then(() => undefined);
}

/** Returns the decoded image, or undefined if not loaded (callers skip drawing). */
export function art(name: string) {
  return cache.get(name);
}
