# 07 — Brand: Storiyaan

**Written:** 14 Oct 2026 (Navratri day 4). **Renamed** from Chamak to Storywala, then to Storiyaan, on 15 Oct 2026. Applies to the app UI, icons, OG image and social posts. Templates keep their own art direction (see `03-templates.md`); the brand is the frame around them, not inside them.

## Positioning
**The 30-second festive story maker for people who'd rather be dancing than editing.**
You drop your garba pics, Storiyaan picks your best shots, centres the faces and hands back a story that looks like you spent an hour on it. No signup, no upload, no editing skills.

Reference feel: the confidence of Instagram Edits, the playful sticker energy of Lemon8, the "no-filter, just post" honesty of BeReal, plus the colour of a garba ground at 11 pm: rani pink dupattas, marigold, neon from the food stalls.

What we are not:
- Not a generic AI startup (no purple gradients, no "AI-powered", no robot sparkles).
- Not the warm-cream-and-terracotta "artisanal" look.
- Not a greeting-card app (no clip-art diyas in the UI; the art lives in the templates).

## Name
**Storiyaan** (स्टोरियाँ). Home: **https://storiyaan.divyanshujangid.in** (DNS not live yet; until then the app's share links stay on `chamak.pages.dev`). The old address `chamak.pages.dev` keeps working as a fallback (same Cloudflare Pages project, still called `chamak`).

- **Why the name:** *storiyaan* is how Hindi makes "story" plural: all the stories from your nights. Nine nights of garba, Dussehra, Diwali, every one of them a story, and this is where they get made. It sounds the way the group chat already talks ("kitni storiyaan daali?") and says what we make, not how.
- **Spelling:** `storiyaan` all lowercase in the wordmark and UI chrome; **Storiyaan** with a capital S in sentences, titles, the manifest and meta tags. Never "StoriYaan", "Storiyan" or "Storiyaa". Devanagari: **स्टोरियाँ**.
- Earlier names: *Chamak* (चमक, "sparkle", lives on in the ✦ accent) and, briefly, *Storywala*.

## Tagline and lines
| Use | Line |
|---|---|
| Tagline (primary) | **Photo daalo, story ready.** |
| Hero support | Navratri + Diwali story frames in 30 sec. No signup. Pics never leave your phone. |
| Short promise | Zero editing. Zero signup. Story ready. |
| Privacy line | Pics stay on your phone. Pakka. |
| WhatsApp share | Made this Navratri frame in 30 seconds 🪔 No signup, photos never uploaded. Try it: https://storiyaan.divyanshujangid.in |
| Export badge | made with storiyaan ✦ |

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
| Install | Keep Storiyaan on your home screen. Diwali is coming. | Install our Progressive Web App |
| Locked frame | 1 share unlocks 4 bonus frames | Premium content |

## Wordmark
- `storiy` + *`aa`* + `n`, all lowercase. The base is **Bricolage Grotesque 800**, tracking −0.04em, in Doodh (`--text`). The **"aa" is Instrument Serif Italic 400 at 1.18× size in rani** (`--rani`, #FF3D8B), tracking 0. It is the same move as the landing headline "story *ready.*": a chunky grotesque with one soft serif italic beat. Component: `src/ui/Wordmark.tsx`, styles `.wordmark` / `.wm-aa` in `src/styles/base.css`.
- No sparkle in the wordmark. The ✦ stays as a UI accent elsewhere (Smart Pick, Done, badge).
- On light/paper backgrounds use ink `#2B2226` for the base letters; the "aa" stays rani.
- Optional Devanagari tag **स्टोरियाँ** in Yatra One, rotated, in a marigold sticker pill. Landing hero and social posts only, never in the top bar.
- Minimum size: 22px base font size. Never outline it, never put it on a busy photo.

## App icon: "story stack"
Two stacked story cards on the night tile: it says "many stories" at a glance. Source: `scratchpad/brand/sy-icon.html` (from option 3 in `brand/logos2.html`), rendered by `scratchpad/shot/sy-icons.mjs` into `public/icons/`.

- **Layers, back to front:** ink tile, `radial-gradient(90% 90% at 25% 10%, #2A0F2A, #0B0912 70%)` · a **gulabi card** (`#F4A9BE`, 0.9 opacity) tilted +9° · a **cream card** (`#FFF8EF`) tilted −7°, slightly left and in front · a Devanagari **स** in **Rozha One**, rani `#FF3D8B`, centred on the cream card · one small **nimbu lime sparkle** (`#DBFF4A`) top-right.
- Cards: 50% × 72% of the tile, corners 10%/6.5%. Back card at left 30%, top 12%; front at left 20%, top 15%. स at 40% of the tile size.
- **Files:** `icon-192.png`, `icon-512.png` (full bleed, the OS rounds the corners), `maskable-512.png` (artwork shrunk to 78%, tile fills the square), `apple-touch-icon.png` (180), `favicon.svg`.
- **Favicon:** the same mark as flat vector on a rounded ink square. The स is a real outline path traced from Rozha One (no web font inside the SVG), so it renders the same everywhere.
- **48px test:** next to Instagram and WhatsApp it must still read as "pink स on a white card, pink card behind". Keep the cream card big and the स bold.
- Never: outlines, gradients on the cards, more than one sparkle, Latin letters in the icon.

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
| `--gulabi` | `#F4A9BE` | Gulabi | Back story card in the icon |
| `--cream` | `#FFF8EF` | Malai | Front story card in the icon |
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
