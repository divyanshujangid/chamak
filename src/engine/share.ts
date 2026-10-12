export const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

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

export type ShareResult = 'shared' | 'cancelled' | 'unsupported';

export async function shareImage(blob: Blob, name: string, text?: string): Promise<ShareResult> {
  const file = new File([blob], name, { type: 'image/jpeg' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share(text ? { files: [file], text } : { files: [file] });
      return 'shared';
    } catch {
      return 'cancelled';
    }
  }
  return 'unsupported';
}

export function whatsappTextLink(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
