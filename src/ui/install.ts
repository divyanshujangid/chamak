// "Add to Home Screen" for Android (one-tap prompt) and iOS (guided steps).
// Imported from main.tsx so `beforeinstallprompt` is captured before React mounts.
import { useEffect, useState } from 'react';
import { track } from '../analytics';

interface BIPEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const ua = navigator.userAgent;
export const isIOSDevice = /iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isAndroid = /Android/i.test(ua);
/** In-app browsers (Instagram, Facebook, WhatsApp, Snapchat, LinkedIn…) can't install web apps. */
export const inAppBrowser = /Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Snapchat|Line\/|LinkedInApp|Twitter|musical_ly|BytedanceWebview/i.test(ua)
  || (isAndroid && /; wv\)/.test(ua));
/** iOS browsers other than Safari: Chrome/Edge/Firefox (iOS 16.4+) also offer Add to Home Screen in their share menu. */
export const iosOtherBrowser = isIOSDevice && /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);

export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

let deferred: BIPEvent | null = null;
let installed = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e as BIPEvent;
  emit();
});
window.addEventListener('appinstalled', () => {
  installed = true;
  deferred = null;
  emit();
});

export type InstallMode = 'prompt' | 'ios' | 'inapp' | 'android-manual' | 'desktop';

export function installMode(): InstallMode {
  if (deferred) return 'prompt';
  if (inAppBrowser) return 'inapp';
  if (isIOSDevice) return 'ios';
  if (isAndroid) return 'android-manual';
  return 'desktop';
}

/** Show the button? Hidden once installed / running standalone, and on desktop without a prompt. */
export function useInstall() {
  const [, bump] = useState(0);
  useEffect(() => {
    const f = () => bump((n) => n + 1);
    subs.add(f);
    return () => { subs.delete(f); };
  }, []);
  const mode = installMode();
  const available = !installed && !isStandalone() && mode !== 'desktop';
  return { available, mode };
}

/** Fire the native prompt. Returns true when the user accepted. */
export async function promptInstall(): Promise<boolean> {
  const e = deferred;
  if (!e) return false;
  deferred = null;
  await e.prompt();
  const { outcome } = await e.userChoice;
  track('install_prompt', { outcome });
  emit();
  return outcome === 'accepted';
}

const NUDGE = 'ck.installNudge';
export function nudgeSeen() { try { return localStorage.getItem(NUDGE) === '1'; } catch { return true; } }
export function markNudgeSeen() { try { localStorage.setItem(NUDGE, '1'); } catch { /* private mode */ } }
