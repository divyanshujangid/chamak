# Storiyaan — Master Plan

**Written:** 12 Oct 2026 · **Brief:** `~/Downloads/BRIEF.md` · **Budget:** ₹0 · **Owner:** Divyanshu
**Progress channel:** Slack #claude (C0BSPJAPLTG)

## What we are building (one line)
A free website where anyone uploads 3–8 photos, swipes to pick a festival template, and downloads a 1080x1920 story image in under 60 seconds. No signup, no backend, photos never leave the phone.

## Status (12 Oct 2026, night)
- **Live:** https://chamak.pages.dev. New home https://storiyaan.divyanshujangid.in once its DNS is connected; chamak.pages.dev then stays as the fallback (same Cloudflare project). The full loop works: upload, swipe, edit, download, share.
- **Templates:** the original 13 specs in `docs/03-templates.md` were built, rejected in review as flat clip-art, and **retired**. The live set is 6 redesigned templates in `src/templates/v2/`, built on the texture and object library in `src/templates/v2/art.ts`. Treat `03-templates.md` slot/colour tables as history; the contract, fonts rules, and quality bar still apply.
- **Open decision:** where photo-real art comes from: free stock cutouts, AI-generated art, or code-only.
- **Dev tools:** `/dev.html?set=v2` renders a contact sheet with Smart Pick scores. `/og.html` renders the WhatsApp preview image.

## Read these docs in order
| # | Doc | What it answers |
|---|---|---|
| 1 | `docs/01-setup.md` | How to scaffold, which packages, how to deploy, domain, analytics |
| 2 | `docs/02-engine.md` | Data model, renderer, photo pipeline, Smart Pick algorithms, export, share, gestures (with code) |
| 3 | `docs/03-templates.md` | Template contract, all 13 template specs (colors, fonts, slots, motifs), where fonts/assets come from, quality bar |
| 4 | `docs/04-ux.md` | Every screen, every state, copy, design tokens, gesture spec |
| 5 | `docs/05-launch.md` | OG/WhatsApp preview, share text, privacy page copy, device test matrix, launch-day steps |
| 6 | `docs/06-tasks.md` | Ordered task list with dates and definition of done. **Start here when coding.** |

## Calendar (verified 12 Oct 2026)
| Festival | Date | Days away |
|---|---|---|
| Navratri | 11–20 Oct (live) | 0–8 |
| Dussehra | Tue 20 Oct | 8 |
| Karwa Chauth | Thu 29 Oct | 17 |
| Dhanteras | Fri 6 Nov | 25 |
| **Diwali** | **Sun 8 Nov** | **27** |
| Bhai Dooj | Tue 10 Nov | 29 |

Two launches on one engine: **Navratri pack by Wed 14 Oct**, **Diwali pack by Fri 24 Oct**.

## Locked decisions
| Area | Decision |
|---|---|
| Name | **Storiyaan** (स्टोरियाँ, Hindi plural of "story": all the stories from your nights). Renamed from Chamak on 15 Oct 2026. Home `storiyaan.divyanshujangid.in`; `chamak.pages.dev` stays as fallback (redirect script in `index.html`, off until DNS is live). |
| Stack | Vite + React 18 + TypeScript. Hand-written CSS with tokens. No Tailwind, no component library. |
| Rendering | One canvas renderer for preview and export. Design space is 1080x1920. |
| Templates | One TS module each. Metadata + slots + `drawBackground` + `drawForeground`. All art drawn as code. |
| Photos | Downscaled to max 2048px on import, held as `ImageBitmap`. Never uploaded. |
| Smart Pick | Sharpness + exposure + resolution. No face detection in v1. Default fill, tap-to-swap. |
| Picker | Swipe stack rendered with the user's own photos. Dots + "See all" grid. |
| Export | JPEG 0.92 at 1080x1920. iOS: share sheet with file (saves to Photos). Android: direct download + share. |
| Unlock | 1 completed share or 3 downloads unlocks 4 bonus templates. Stored in `localStorage`. |
| Hosting | Cloudflare Pages free tier. Cloudflare Web Analytics (cookieless). |
| Libraries | `motion` (swipe), `@use-gesture/react` (pinch/drag), `lucide-react` (icons), `@fontsource/*` (fonts). All MIT/ISC/OFL. |

## Schedule
| Day | Date | Deliverable |
|---|---|---|
| 1 | Tue 13 Oct | Engine + export + 3 templates, live on pages.dev |
| 2 | Wed 14 Oct | Full loop (swipe, editor, Smart Pick, share, unlock, privacy). **Navratri pack v1 ships.** |
| 3 | Thu 15 Oct | Real-phone fixes, perf, OG preview, seed to 20 WhatsApp groups |
| 4–5 | Fri 16–Sat 17 Oct | Diwali templates (9), polish |
| 6 | Mon 20 Oct (Dussehra) | Navratri/Dussehra push |
| 7–9 | Tue 21–Fri 24 Oct | Diwali pack QA, **Diwali pack ships Fri 24 Oct** |
| 10+ | 25 Oct–8 Nov | Watch numbers, v1.1 (family name field, face detection if needed) |

## Top risks
1. Templates look mid → build 3, judge against the screenshot test, then build the rest. Design hours are protected.
2. iOS Safari memory → 2048px import downscale, export retry at 0.75x.
3. WhatsApp preview looks bad → OG image is a first-class deliverable on Day 3.
