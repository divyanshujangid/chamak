export const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Switch to https://storywala.divyanshujangid.in once its DNS (CNAME at Hostinger) is live.
export const SITE_URL = 'https://chamak.pages.dev';

export function shareText(now = new Date()) {
  return now < new Date('2026-10-21')
    ? `Made this Navratri frame in 30 seconds 🪔 No signup, photos never uploaded. Try it: ${SITE_URL}`
    : `Made my Diwali frame in 30 seconds ✨ Free, no signup, photos stay on your phone. Try it: ${SITE_URL}`;
}

export function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

export type ShareResult = 'shared' | 'cancelled' | 'blocked' | 'failed' | 'unsupported';

/** AbortError = user closed the sheet; NotAllowedError = lost the tap (needs a fresh one);
 *  TypeError = some targets reject files+text together, so retry with the file alone. */
export async function shareImage(blob: Blob, name: string, text?: string): Promise<ShareResult> {
  const file = new File([blob], name, { type: 'image/jpeg' });
  if (!navigator.canShare?.({ files: [file] })) return 'unsupported';
  try {
    await navigator.share(text ? { files: [file], text } : { files: [file] });
    return 'shared';
  } catch (e) {
    const err = e as DOMException;
    if (err?.name === 'AbortError') return 'cancelled';
    if (err?.name === 'NotAllowedError') return 'blocked';
    if (text && err?.name === 'TypeError') {
      try {
        await navigator.share({ files: [file] });
        return 'shared';
      } catch (e2) {
        return (e2 as DOMException)?.name === 'AbortError' ? 'cancelled' : 'failed';
      }
    }
    return 'failed';
  }
}

export function whatsappTextLink(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
