# 07 — Brand: Storywala

**Written:** 14 Oct 2026 (Navratri day 4). **Renamed** from Chamak to Storywala on 15 Oct 2026. Applies to the app UI, icons, OG image and social posts. Templates keep their own art direction (see `03-templates.md`); the brand is the frame around them, not inside them.

## Positioning
**The 30-second festive story maker for people who'd rather be dancing than editing.**
You drop your garba pics, Storywala picks your best shots, centres the faces and hands back a story that looks like you spent an hour on it. No signup, no upload, no editing skills.

Reference feel: the confidence of Instagram Edits, the playful sticker energy of Lemon8, the "no-filter, just post" honesty of BeReal, plus the colour of a garba ground at 11 pm: rani pink dupattas, marigold, neon from the food stalls.

What we are not:
- Not a generic AI startup (no purple gradients, no "AI-powered", no robot sparkles).
- Not the warm-cream-and-terracotta "artisanal" look.
- Not a greeting-card app (no clip-art diyas in the UI; the art lives in the templates).

## Name
**Storywala** (स्टोरीवाला). Home: **https://storywala.divyanshujangid.in**. The old address `chamak.pages.dev` keeps working as a fallback (same Cloudflare Pages project, still called `chamak`).

- **Why the name:** a *story-wala* is the person (or app) who makes your story for you, like the chaiwala makes your chai. After garba you're too tired to edit; the storywala does it in 30 seconds in the cab home. It says what we do and who does the work, in the way the group chat already talks.
- **Spelling:** `storywala` all lowercase in the wordmark and UI chrome; **Storywala** with a capital S in sentences, titles, the manifest and meta tags. Never "StoryWala", "Story Wala" or "Storywalla". Devanagari: **स्टोरीवाला**.
- The old name *Chamak* (चमक, "sparkle") lives on in the ✦ sparkle accent.

## Tagline and lines
| Use | Line |
|---|---|
| Tagline (primary) | **Photo daalo, story ready.** |
| Hero support | Navratri + Diwali story frames in 30 sec. No signup. Pics never leave your phone. |
| Short promise | Zero editing. Zero signup. Story ready. |
| Privacy line | Pics stay on your phone. Pakka. |
| WhatsApp share | Made this Navratri frame in 30 seconds 🪔 No signup, photos never uploaded. Try it: https://storywala.divyanshujangid.in |
| Export badge | made with storywala ✦ |

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
| Install | Keep Storywala on your home screen. Diwali is coming. | Install our Progressive Web App |
| Locked frame | 1 share unlocks 4 bonus frames | Premium content |

## Wordmark
- `storywala` in **Instrument Serif Italic 400**, all lowercase, tracking −0.01em, with a small **four-point sparkle (✦) in gulabi** (`--gulabi`, #F4A9BE) on the shoulder of the final `a`. Soft and handwritten-feeling, like a caption on a Pinterest story, not a tech logo.
- On the dark UI the letters are Doodh (`--text`); on light/paper backgrounds use ink `#2B2226`. The sparkle stays gulabi on both.
- Optional Devanagari tag **स्टोरीवाला** in Yatra One, rotated, in a marigold sticker pill. Landing hero and social posts only, never in the top bar.
- Minimum size: 26px font size in the top bar (the serif is light; smaller gets wispy). Never outline it, never put it on a busy photo.

## App icon
Soft and aesthetic, made from the same handmade-paper language as the templates. Source: `scratchpad/brand/sw-icon.html`, rendered by `scratchpad/shot/sw-icons.mjs` into `public/icons/`.

- **Layers, back to front:** handmade paper (`pd-paper.webp`) · pastel wash, mint `#D9EEE3` → peach `#F6E6DE` → blush `#F7CFDA` (multiply) · soft cream glow · a **cream story card** (`#FFF9F1`, rounded 9:16, tilted −7°) · the painted **pink lotus** (`pp-lotus-big.webp`) sitting over the card's lower half · one **small sparkle** top-right in `#EE9AB1` with a cream edge.
- **Files:** `icon-192.png`, `icon-512.png` (full bleed, the OS rounds the corners), `maskable-512.png` (artwork shrunk to 78% so it survives the circle mask), `apple-touch-icon.png` (180), `favicon.svg`.
- **Favicon:** a simplified vector, five flat-gradient pink petals on a cream card over the pastel wash, plus the sparkle. No texture: it can't hold at 16px.
- **48px test:** at home-screen size it must still read as "pink flower on a white card" next to Instagram and WhatsApp. If a change muddies that, the lotus wins: keep it big and saturated, keep the card edges visible above and below it.
- Never: bold neon, the dark raat background, clip-art, text inside the icon.

## Palette (`src/styles/tokens.css`)
Dark UI, so template colours stay the loudest thing on screen.

| Token | Hex | Name | Use |
|---|---|---|---|
| `--bg` | `#0B0912` | Raat (night) | App background, theme-color |
| `--surface` | `#16121F` | Raat 2 | Cards, sheets |
| `--surface-2` | `#231D30` | Raat 3 | Chips, inputs |
| `--text` | `#FBF7FF` | Doodh | Body text |
| `--text-dim` | `#B3ABC4` | Dhuaan | Secondary text (7.9:1 on bg) |
| `--rani` / `--accent` | `#FF3D8B` | Rani pink | Brand accent, focus, selection |
| `--gulabi` | `#F4A9BE` | Gulabi | Soft lotus pink: wordmark sparkle, icon |
| `--cream` | `#FFF8EF` | Malai | Story-card cream from the icon |
| `--nimbu` / `--cta` | `#DBFF4A` | Nimbu lime | Primary CTA only (ink text, 16:1) |
| `--genda` | `#FFB22E` | Genda marigold | Stickers, badges, highlights |
| `--neel` | `#8C7BFF` | Neel | Smart Pick / "magic" moments only |
| `--wa` | `#25D366` | WhatsApp | WhatsApp actions only |

Rules: one nimbu element per screen (the main action). Rani pink is the brand; marigold is decoration. Never put pink text on lime.

## Type
| Role | Font | Setting |
|---|---|---|
| Wordmark | Instrument Serif Italic | 400, lowercase, −0.01em |
| Display | Bricolage Grotesque Variable | 800, −0.04em, line-height 0.92 |
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
