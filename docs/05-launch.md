# 05 — Launch: previews, share text, privacy copy, testing, launch days

## `index.html` head (exact)
```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0E0A0C">
<title>Chamak — Festive photo frames in 30 seconds</title>
<meta name="description" content="Free Navratri and Diwali photo frames. No signup. Photos never leave your phone.">
<meta property="og:type" content="website">
<meta property="og:title" content="Chamak — Festive photo frames in 30 seconds">
<meta property="og:description" content="Free. No signup. Photos never leave your phone.">
<meta property="og:image" content="https://chamak.pages.dev/og.jpg?v=1">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="https://chamak.pages.dev/">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
```
WhatsApp preview rules (Meta docs + practice): image **under 300 KB** (Meta says 600 KB; 300 is the safe number), JPEG, ≥ 300 px wide, aspect ≤ 4:1. WhatsApp caches previews per URL, so bump `?v=2` when `og.jpg` changes. Test with https://www.opengraph.xyz/ and by sending the link to yourself on WhatsApp.

`og.jpg`: 1200x630, dark bg, three template previews with sample photos fanned at slight angles, headline "Festive frames in 30 seconds · Free · Private". Make it by rendering three templates at 540x960, compositing in a 1200x630 canvas via a one-off script `scripts/make-og.ts` (run in the browser dev page), download, compress with `npx @squoosh/cli --mozjpeg '{quality:78}'`.

## Share text (pre-filled)
Navratri (until 20 Oct):
> Made this Navratri frame in 30 seconds 🪔 No signup, photos never uploaded. Try it: https://chamak.pages.dev

Diwali (from 21 Oct):
> Made my Diwali frame in 30 seconds ✨ Free, no signup, photos stay on your phone. Try it: https://chamak.pages.dev

Keep under 140 chars. The link must be last so WhatsApp unfurls it. Switch by date in `share.ts`: `new Date() < new Date('2026-10-21') ? navratri : diwali`.

## Privacy page copy (`/privacy`)
> **Your photos never leave your phone.**
> Chamak runs entirely in your browser. There is no server, no database and no upload. Your photos are read into your phone's memory, drawn into the frame on your phone, and saved to your phone. Close the tab and they are gone.
>
> **What we store:** one small setting in your browser (`localStorage`) remembering whether you have unlocked bonus frames and seen the swipe hint. No cookies. No accounts.
>
> **Analytics:** we count page views with Cloudflare Web Analytics, which uses no cookies and does not identify you.
>
> **Sample photos** on the home page are from Pexels: [photographer] (link), … Thank you.
>
> **Contact:** [email]. Made in India by Divyanshu.

## Device test matrix (Day 3, mandatory before seeding)
| Device | Browser | Must pass |
|---|---|---|
| iPhone (iOS 16+) | Safari | 8-photo import, pinch/drag, export, Save to Photos via share sheet, WhatsApp share with image |
| iPhone | WhatsApp in-app browser (tap link inside WhatsApp) | Same as above; if share fails, show "Open in Safari" hint |
| Budget Android (≤ ₹15k, 4 GB RAM) | Chrome | 8-photo import under 4 s, 60 fps-ish gestures, download lands in Downloads/Gallery, WhatsApp share |
| Android | WhatsApp in-app (Chrome Custom Tab) | Download + share |
| Android Samsung | Samsung Internet | Smoke test only |
| Mac | Chrome DevTools, iPhone 12 + Pixel 5 presets | Layout only; gestures are not representative |
Also test: airplane mode after load (must still work), private/incognito (localStorage throws → app must not crash), portrait lock, 3G throttle first load < 6 s.

## Launch-day checklists
**Wed 14 Oct — Navratri v1**
1. `npm run deploy`, open the URL on both phones, run the full loop once each.
2. Send the link to yourself on WhatsApp, confirm preview image + title.
3. Post in 20 WhatsApp groups (family, college, society, garba groups). Message = the share text above plus one screenshot of a filled template.
4. Instagram story with a 9:16 export + link sticker. One post. That's it.
5. Watch Cloudflare analytics at 10 pm. Note visits and the top referrer.

**Tue 20 Oct — Dussehra push**: same message, "Last day of Navratri, make your frame" angle. Tease Diwali pack.

**Fri 24 Oct — Diwali pack**: redeploy with Diwali templates first in the swipe order, new `og.jpg?v=2` showing Diwali, new share text. Repeat steps 3–5. Ask 5 people to share, not just download.

**Sat 1 Nov–Sun 8 Nov**: one reminder post every 2–3 days. Dhanteras (6 Nov) is the biggest forward day before Diwali.

## Success metric
Only traffic. Targets, honest: 500 visits in first 48 h of Navratri v1 means the loop works. 5,000 unique visits by Diwali night means it popped. Below 200 in 48 h → fix the OG preview and share text first, templates second.
