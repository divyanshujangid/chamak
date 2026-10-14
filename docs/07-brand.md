# 07 — Brand: Chamak

**Written:** 14 Oct 2026 (Navratri day 4). Applies to the app UI, icons, OG image and social posts. Templates keep their own art direction (see `03-templates.md`); the brand is the frame around them, not inside them.

## Positioning
**The 30-second festive story maker for people who'd rather be dancing than editing.**
You drop your garba pics, Chamak picks your best shots, centres the faces and hands back a story that looks like you spent an hour on it. No signup, no upload, no editing skills.

Reference feel: the confidence of Instagram Edits, the playful sticker energy of Lemon8, the "no-filter, just post" honesty of BeReal, plus the colour of a garba ground at 11 pm: rani pink dupattas, marigold, neon from the food stalls.

What we are not:
- Not a generic AI startup (no purple gradients, no "AI-powered", no robot sparkles).
- Not the warm-cream-and-terracotta "artisanal" look.
- Not a greeting-card app (no clip-art diyas in the UI; the art lives in the templates).

## Name, tagline, lines
| Use | Line |
|---|---|
| Tagline (primary) | **Photo daalo, story ready.** |
| Hero support | Navratri + Diwali story frames in 30 sec. No signup. Pics never leave your phone. |
| Short promise | Zero editing. Zero signup. Full chamak. |
| Privacy line | Pics stay on your phone. Pakka. |
| WhatsApp share | Made my Navratri story in 30 sec on chamak.pages.dev ✦ no signup, photos stay on your phone |

## Voice rules
1. **Talk like the group chat, not like a bank.** Short, lowercase-friendly, Hinglish where it comes naturally. One Hindi word per line, max.
2. **Promise time, not tech.** Say "30 sec", "one tap", "best shots". Never "AI", "algorithm", "leverage", "seamless".
3. **Confident, never needy.** No exclamation-mark stacks, no "Oops!". One emoji at most, and ✦ is our emoji.
4. **Privacy said plainly, every time photos are involved.** "On your phone, not a server."
5. **Celebrate the user, not the app.** "Main character energy" is about them.

| Moment | Yes | No |
|---|---|---|
| Primary CTA | Add your photos | Upload images |
| Demo | Try with sample pics | Start free trial |
| Import progress | Getting your pics ready… 3 of 6 | Processing files |
| Smart Pick | Smart Pick: best shots in the biggest spots, faces centred ✦ | Our AI analysed your images |
| Picker | Swipe for vibes | Browse templates |
| Done | Story ready ✦ Ab post karo. | Your export is complete! |
| Error | Couldn't render on this phone. Try fewer photos. | Oops! Something went wrong!! |
| Install | Keep Chamak on your home screen. Diwali is coming. | Install our Progressive Web App |
| Locked frame | 1 share unlocks 4 bonus frames | Premium content |

## Wordmark
- `chamak` in **Bricolage Grotesque 800**, all lowercase, tracking −0.05em, with a **four-point sparkle (✦) in rani pink** sitting on the shoulder of the `k`, like a glint on a mirror-work dupatta.
- Optional Devanagari tag **चमक** in Yatra One, rotated −4°, in a marigold sticker pill. Use it on the landing hero and social posts only, never in the top bar.
- Minimum size: 20px cap height in the top bar. Never outline it, never put it on a gradient.
- App icon / favicon: the sparkle alone, rani pink on raat ink, with a small nimbu-lime glint.

## Palette (`src/styles/tokens.css`)
Dark UI, so template colours stay the loudest thing on screen.

| Token | Hex | Name | Use |
|---|---|---|---|
| `--bg` | `#0B0912` | Raat (night) | App background, theme-color |
| `--surface` | `#16121F` | Raat 2 | Cards, sheets |
| `--surface-2` | `#231D30` | Raat 3 | Chips, inputs |
| `--text` | `#FBF7FF` | Doodh | Body text |
| `--text-dim` | `#B3ABC4` | Dhuaan | Secondary text (7.9:1 on bg) |
| `--rani` / `--accent` | `#FF3D8B` | Rani pink | Brand accent, sparkle, focus, selection |
| `--nimbu` / `--cta` | `#DBFF4A` | Nimbu lime | Primary CTA only (ink text, 16:1) |
| `--genda` | `#FFB22E` | Genda marigold | Stickers, badges, highlights |
| `--neel` | `#8C7BFF` | Neel | Smart Pick / "magic" moments only |
| `--wa` | `#25D366` | WhatsApp | WhatsApp actions only |

Rules: one nimbu element per screen (the main action). Rani pink is the brand; marigold is decoration. Never put pink text on lime.

## Type
| Role | Font | Setting |
|---|---|---|
| Display / wordmark | Bricolage Grotesque Variable | 800, −0.04em, line-height 0.92 |
| Editorial accent | Instrument Serif Italic | One word per headline, in rani pink ("story *ready.*") |
| Labels / tags | Space Mono | 700, uppercase, +0.08em, 11–12px ("DAY 04 · ROYAL BLUE") |
| UI / body | DM Sans Variable | 400–700, 14–17px |
| Devanagari accent | Yatra One | Stickers only |

## Motion
1. **Pop, don't float.** State changes are 160–220 ms with `--ease` (fast out). Successes use the overshoot spring `--ease-pop`.
2. **Every wait shows progress.** Count photos, tick checklists; no bare spinners over 1 s.
3. **One magic moment per flow:** the Smart Pick reveal (thumbnails sort, the best one gets a crown, ticks appear in a 120 ms stagger). Don't sprinkle sparkles elsewhere.
4. **Cards behave like stickers:** slight tilt, real shadow, spring back on release.
5. **`prefers-reduced-motion`:** everything collapses to opacity fades; the hero stops auto-cycling.
