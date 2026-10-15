// Product analytics (PostHog, EU). Privacy rules, mirrored on the privacy page:
// - no cookies or storage (in-memory only), no session replay, no autocapture
// - only named events with small props (template id, photo count); never photos, names or file data
// The library loads after the page is idle so it never slows the first screen.
import type { PostHog } from 'posthog-js';

const KEY = 'phc_D4s4DYnjqLQvVmXMKyYAJ7TkDo9xethNvSyk4VQhUsnZ';
const LIVE_HOSTS = ['storiyaan.divyanshujangid.in', 'chamak.pages.dev'];

let ph: PostHog | null = null;
const queue: [string, Record<string, unknown>][] = [];

/** Banner/QR source: ?src=adipur-garba-1 or ?utm_source=… */
function source() {
  try {
    const q = new URLSearchParams(location.search);
    return q.get('src') || q.get('utm_source') || (document.referrer ? new URL(document.referrer).hostname : 'direct');
  } catch {
    return 'direct';
  }
}

export function initAnalytics() {
  if (typeof window === 'undefined' || !LIVE_HOSTS.includes(location.hostname)) return;
  const start = () =>
    import('posthog-js').then(({ default: posthog }) => {
      posthog.init(KEY, {
        api_host: 'https://eu.i.posthog.com',
        ui_host: 'https://eu.posthog.com',
        persistence: 'memory',
        person_profiles: 'identified_only',
        autocapture: false,
        disable_session_recording: true,
        disable_surveys: true,
        capture_pageview: true,
        capture_pageleave: true,
      });
      posthog.register({ src: source(), standalone: matchMedia('(display-mode: standalone)').matches });
      ph = posthog;
      for (const [e, p] of queue.splice(0)) ph.capture(e, p);
    }).catch(() => { /* blocked by an ad blocker: the app works the same */ });
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 4000 });
  else setTimeout(start, 2500);
}

export function track(event: string, props: Record<string, unknown> = {}) {
  if (ph) ph.capture(event, props);
  else if (queue.length < 50) queue.push([event, props]);
}
