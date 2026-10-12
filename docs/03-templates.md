# 03 — Templates (the product)

**Rule zero:** every template is drawn as code. No downloaded images, no traced vectors, no Pinterest files, no Canva exports. Pinterest and Canva may be opened for mood only, with nothing saved from them. The only external assets are OFL fonts.

## Quality bar (the screenshot test)
Before a template is merged, render it with the `dev-photos/` set and ask: *would someone screenshot this before uploading their own photos?* Two people say yes → merge. Otherwise iterate. Protect 1–2 hours per template for this.

Checks every template must pass:
- Looks right at 360px wide (phone preview) and 1080px (export). Thin lines ≥ 3 design units.
- Text never overlaps a slot. Devanagari glyphs render (test with "शुभ नवरात्रि" / "शुभ दीपावली").
- Photo slots cover ≥ 45% of the canvas. People came for their photos, not our art.
- Works with the ugliest dev photo in the biggest slot.
- `drawBackground` + `drawForeground` render in < 40 ms at 1080x1920 on a laptop (measure with `performance.now()`).

## Fonts (self-hosted via fontsource, all OFL)
| Font | npm package | Scripts | Used by |
|---|---|---|---|
| Yatra One | `@fontsource/yatra-one` | Latin + Devanagari | Navratri Pop display |
| Baloo 2 | `@fontsource/baloo-2` (weights 600, 800) | Latin + Devanagari | Navratri Pop secondary |
| Rozha One | `@fontsource/rozha-one` | Latin + Devanagari | Royal Diwali display |
| Instrument Serif | `@fontsource/instrument-serif` (400, 400 italic) | Latin | Minimal Pastel |
| Cormorant Garamond | `@fontsource/cormorant-garamond` (300, 500) | Latin | Minimal Pastel small text |
| Space Grotesk | `@fontsource/space-grotesk` (500, 700) | Latin | Y2K Chrome |
| DM Sans Variable | `@fontsource-variable/dm-sans` | Latin | UI only, badge |
Import per direction in the direction's `index.ts` (so it lazy-loads): `import '@fontsource/rozha-one/400.css'`. Devanagari subsets load automatically via `unicode-range`.

## Template module contract
```ts
// src/templates/diwali/diya-glow.ts
import type { Template } from '../../engine/types';
import { goldFoil, diyaGlow, diya, frameRule } from '../shared';
export const diyaGlowTemplate: Template = {
  id: 'diwali-diya-glow', name: 'Diya Glow', pack: 'diwali', direction: 'royal-diwali',
  fonts: ['400 140px "Rozha One"', '500 36px "DM Sans Variable"'],
  slots: [{ id: 'main', x: 110, y: 300, w: 860, h: 1120, shape: 'arch' }],
  drawBackground(ctx, w, h) { /* ... */ },
  drawForeground(ctx, w, h) { /* ... */ },
};
```
Register in `src/templates/index.ts` in display order. Preview thumbnail for the "See all" grid = render at 270x480 once, cached.

## Shared art helpers (`src/templates/shared/`)
Write these once, reuse everywhere. Each is a pure function on `ctx`.
| Helper | What it draws | How |
|---|---|---|
| `goldFoil(ctx)` | Metallic gold fill style | `createLinearGradient` stops: `#8A6A1F 0, #F6E27A .35, #D4AF37 .5, #FFF3B0 .65, #8A6A1F 1` |
| `chrome(ctx)` | Silver chrome fill | stops: `#5C5C5C 0, #FFFFFF .3, #9E9E9E .5, #FFFFFF .7, #4A4A4A 1` |
| `grain(ctx, w, h, alpha)` | Film grain | Fill a 256x256 offscreen canvas with random gray noise once, `createPattern(..., 'repeat')`, fill rect at `alpha` with `globalCompositeOperation = 'overlay'` |
| `bandhani(ctx, w, h, color, alpha)` | Tie-dye dot grid | Rows of 10-unit circles, 44-unit spacing, every other row offset 22, each dot has a 4-unit darker inner dot |
| `diyaGlow(ctx, x, y, r)` | Warm light pool | `createRadialGradient` `rgba(255,138,0,.55)` → `rgba(255,138,0,0)` |
| `diya(ctx, x, y, size)` | Lamp icon | Bowl: half-ellipse path. Flame: teardrop via `bezierCurveTo`, gradient `#FFF3B0 → #FF8A00`. Inner flame white at 60% |
| `mandalaRing(ctx, x, y, r, petals)` | Rangoli corner ornament | `petals` ellipses rotated around center + 2 concentric circles, stroke only, 3 units |
| `paisley(ctx, x, y, size, rot)` | Paisley motif | Teardrop path with a curled tail, stroke 4 units, inner smaller teardrop |
| `stringLights(ctx, w, count)` | Hanging lights | Catenary-ish `quadraticCurveTo` wire from top corners, bulbs as glowing circles (`shadowBlur = 30`) |
| `sparkle(ctx, x, y, size)` | 4-point star | Two curved diamonds via `quadraticCurveTo`, white |
| `frameRule(ctx, inset, width, style)` | Border line(s) | Stroked rect(s) with inset |
| `textFit(ctx, text, maxWidth, font)` | Shrink text to width | Loop reducing font size until `measureText` fits |
| `slotPath(ctx, slot)` | Clip path per shape | Used by renderer AND by foreground borders around slots |

## The 13 templates

Column key: **BG** background · **Slots** `{x,y,w,h,shape}` in design units · **Type** text layer(s) · **Motifs** code-drawn art.

### Navratri Pop (pack: navratri) — ships Day 2
| ID | Name | BG | Slots | Type | Motifs | Locked |
|---|---|---|---|---|---|---|
| `navratri-garba-night` | Garba Night | Vertical gradient `#1B0F3B → #7B1FA2 → #C2185B`; `bandhani(#FFFFFF, .07)` | main `{90,220,900,1000,arch}`; two `{90,1280,420,420,rounded r40}` `{570,1280,420,420,rounded r40}` | "शुभ नवरात्रि" Yatra One 110 `#FFD54F` at y 1800 centered; "GARBA NIGHT 2026" Baloo 2 800 40 white letter-spacing 8 at y 150 | Dandiya cross (two 6-unit rounded lines with 14-unit bead circles) at bottom corners in `#FFD54F` | no |
| `navratri-chaniya` | Chaniya Choli | Diagonal 45° bands alternating `#E91E63` `#FF6F00` `#FFC107` `#1B5E20`, 160 units wide; mirror-work dots: 28-unit circles white stroke 4, inner `#111` fill, on band edges | 2x2 grid `{80,360,440,560}` `{560,360,440,560}` `{80,960,440,560}` `{560,960,440,560}` all `rounded r48`, 40-unit gap | "Navratri" Baloo 2 800 130 white with `#1B5E20` stroke 8 at y 240; "2026" Baloo 2 600 48 at y 1640 | Paisley pair bottom center in white at 60% | no |
| `navratri-dandiya-pop` | Dandiya Pop | Flat `#FFC107`; large `#1B5E20` circle r 700 centered at (540, 1000) | circle `{130,590,820,820,circle}`; two small circles `{40,1420,300,300}` `{740,1420,300,300}` | "DANDIYA" Yatra One 150 `#1B5E20` at y 200; "NIGHTS" same at y 340; small "navratri '26" Baloo 2 600 40 bottom | 6 paisleys around the big circle rim in `#FFC107`, 4 sparkles | no |
| `navratri-maa-durga` | Maa Durga Red | Flat `#8B0000`; `goldFoil` double `frameRule` insets 40 and 60, widths 10 and 3; `diyaGlow` top center | two portraits `{70,420,460,900,rounded r24}` `{550,420,460,900,rounded r24}` | "जय माता दी" Rozha One 150 goldFoil at y 1520; "Navratri 2026" Baloo 2 600 40 gold at y 1620 | Trishul (trident) line icon top center: vertical 6-unit line + three prongs via arcs, goldFoil, 160 tall | **yes** |

### Royal Diwali (pack: diwali)
| ID | Name | BG | Slots | Type | Motifs | Locked |
|---|---|---|---|---|---|---|
| `diwali-diya-glow` | Diya Glow | Radial `#2A0A0F` center → `#0B0608` edges; three `diyaGlow` pools along y 1700 | main `{110,300,860,1120,arch}` | "Happy Diwali" Rozha One 140 goldFoil at y 1560; "शुभ दीपावली" Rozha One 56 gold 70% at y 1640 | `goldFoil` arch outline 6 units around slot; 3 `diya` at y 1760 sizes 90/120/90; `frameRule` inset 36 width 2 | no |
| `diwali-maroon-foil` | Maroon Foil | Flat `#3B0A14`; diagonal gold pinstripes 2 units every 24 at 5% | landscape `{80,260,920,620,rect}`; portraits `{80,920,440,620,rect}` `{560,920,440,620,rect}` | "DIWALI" Rozha One 120 goldFoil letter-spacing 20 at y 160; "two thousand twenty-six" Cormorant 300 36 gold at y 1660 | `mandalaRing` r 110, 12 petals in all four corners, goldFoil stroke; each slot gets a 4-unit gold border | no |
| `diwali-night-lights` | Night of Lights | Flat `#050505` with `grain` .06 | two stacked `{100,420,880,600,rounded r32}` `{100,1060,880,600,rounded r32}` | "Shubh Deepavali" Rozha One 110 goldFoil at y 300; family line placeholder (v1.1) | `stringLights` from y 0, 9 bulbs alternating `#FFD54F` `#FF8A00` `#FFFFFF`, `shadowBlur` 40; 5 sparkles | **yes** |

### Minimal Pastel (pack: diwali)
| ID | Name | BG | Slots | Type | Motifs | Locked |
|---|---|---|---|---|---|---|
| `pastel-beige-air` | Beige Air | Flat `#F3EAD8` | main `{120,260,840,1180,rect}` with 28-unit `#FFFFFF` border drawn in foreground | "diwali" Instrument Serif italic 96 `#5B4A3A` at y 1580; "two thousand twenty-six" Cormorant 300 34 letter-spacing 6 at y 1660 | One `#9CAF88` 18-unit dot at (540, 1740). That's it. Air is the design. | no |
| `pastel-sage-grid` | Sage Grid | Flat `#E6EBE0` | 2x2 `{90,330,420,560}` `{570,330,420,560}` `{90,950,420,560}` `{570,950,420,560}` rect, 60-unit gutters | "festive season" Cormorant 500 44 `#3F4A3C` letter-spacing 10 at y 220; thin 1-unit rule 200 wide under it | none | no |
| `pastel-blush-arch` | Blush Arch | Flat `#F6E3DD` | main `{150,200,780,1240,arch}` | "happy diwali" Instrument Serif 100 `#6B3F3A` at y 1600; 1-unit underline 300 wide | 2-unit `#6B3F3A` arch outline at 12-unit offset | **yes** |

### Y2K Chrome (pack: diwali)
| ID | Name | BG | Slots | Type | Motifs | Locked |
|---|---|---|---|---|---|---|
| `y2k-flash` | Flash | Flat `#0A0A0A`, `grain` .10 | main `{90,300,900,1150,rect}` with 14-unit white border (instant-print look), `shadowBlur` 60 black | "DIWALI ✦ 2026" Space Grotesk 700 96 `chrome` fill + 2-unit `#FFF` stroke at y 1620 | 6 sparkles scattered, sizes 30–70, white | no |
| `y2k-chrome-mirror` | Chrome Mirror | Vertical `#C0C0C0 → #F0F0F0 → #8F8F8F`, `grain` .08 | three tilted `{80,300,560,720,rect, rotate -6}` `{440,560,560,720,rect, rotate 4}` `{200,1000,560,720,rect, rotate -3}` each with 12-unit white border | "lit." Space Grotesk 700 220 `chrome` at (120, 1800) left-aligned; "diwali 2026" Space Grotesk 500 40 `#333` top right | none | no |
| `y2k-neon-grain` | Neon Grain | Flat `#12001A`, `grain` .09 | two `{90,340,900,560,rounded r20}` `{90,980,900,560,rounded r20}` | "shine bright" Space Grotesk 700 88 `#FF2E88` with `shadowBlur` 40 same color at y 1660 | 5-unit `#FF2E88` outline around each slot with `shadowBlur` 30; two `#00E5FF` sparkles | **yes** |

Bonus (locked) set = `navratri-maa-durga`, `diwali-night-lights`, `pastel-blush-arch`, `y2k-neon-grain`.

## Build order
1. `shared/` helpers + `diwali-diya-glow` + `navratri-garba-night` + `pastel-beige-air` (Day 1). These exercise arch, rounded, foil, grain, bandhani, Devanagari.
2. Rest of Navratri Pop (Day 2).
3. Royal Diwali, Minimal Pastel, Y2K Chrome (Day 4–5).

## Sample photos for the landing hero and OG image
Needed: 6 photos of Indian people in festive settings, royalty-free, model-released.
- Source: https://www.pexels.com — search "indian family diwali", "garba", "navratri dance", "diwali portrait". Open each photo, confirm it says **"Free to use"** (Pexels License), download at 1920px.
- Alternative: Unsplash (https://unsplash.com/license), same checks. Unsplash forbids building a competing photo service; this is not one.
- Better alternative: 6 photos from friends/family with verbal consent. Real photos convert better than stock.
- Compress to WebP ≤ 120 KB each (`npx @squoosh/cli --webp auto`) into `public/samples/`.
- Credit photographers in `/privacy` under "Sample photos" with name + Pexels link. Not required by license, but do it.
