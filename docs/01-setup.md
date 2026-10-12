# 01 — Setup, packages, deploy

## Prerequisites
- Node 20+ (`node -v`), npm 10+
- A Cloudflare account (free): https://dash.cloudflare.com/sign-up
- Git + GitHub repo `chamak` (private is fine)
- One iPhone and one budget Android phone on the same Wi-Fi for testing

## Scaffold (run exactly this)
```bash
cd ~/Desktop/projects/photos
npm create vite@latest . -- --template react-ts
npm install
npm install motion @use-gesture/react lucide-react
npm install @fontsource/yatra-one @fontsource/baloo-2 @fontsource/rozha-one \
  @fontsource/instrument-serif @fontsource/cormorant-garamond @fontsource/space-grotesk \
  @fontsource-variable/dm-sans
git init && git add -A && git commit -m "scaffold"
```

Why each package:
| Package | Use | License |
|---|---|---|
| `motion` | Swipe card stack (drag + spring) | MIT |
| `@use-gesture/react` | Pinch/drag in the editor | MIT |
| `lucide-react` | UI icons only, never in templates | ISC |
| `@fontsource/*` | Self-hosted fonts, no Google request at runtime | OFL |

## Vite config
`vite.config.ts`: add `server: { host: true }` so phones can open `http://<your-mac-ip>:5173`. Find your IP with `ipconfig getifaddr en0`.

## Folder structure (create these)
```
src/
  main.tsx, App.tsx
  styles/tokens.css, styles/base.css
  engine/   types.ts renderer.ts fit.ts score.ts assign.ts export.ts share.ts photos.ts
  templates/ index.ts shared/ navratri/ diwali/ pastel/ y2k/
  ui/       Upload.tsx Picker.tsx Editor.tsx Done.tsx Privacy.tsx gestures.ts store.ts
  state/    project.ts (single React context, see 02-engine)
public/
  og.jpg (1200x630, <300KB)  favicon.svg  robots.txt
docs/
```
Routing: two routes only, `/` and `/privacy`. Use `window.location.pathname` check in `App.tsx`; no router library needed.

## Dev photo set
Put 8 personal test photos in `dev-photos/` (gitignored). Include: one blurry, one dark, one overexposed, two portraits, two landscapes, one group. Smart Pick is tested against this set.

## Deploy to Cloudflare Pages (first time)
Wrangler 4.149 is already installed globally and logged in (verified 12 Oct 2026). Account ID `63191e21ce9a89ffe22273ce38ca35b3`, token has `pages (write)`. Check with `npx wrangler whoami`. Do **not** run `wrangler login` again unless whoami fails.
```bash
npx wrangler pages project create chamak --production-branch main
npm run build
npx wrangler pages deploy dist --project-name chamak
```
Live at `https://chamak.pages.dev`. Every later deploy is the last two lines. Add to `package.json`: `"deploy": "vite build && wrangler pages deploy dist --project-name chamak"`.

Free-tier facts: 500 builds/month, unlimited static bandwidth, 20,000 files/site, 25 MiB per file. We use none of that meaningfully.

## Analytics (cookieless)
Cloudflare dashboard → Pages → chamak → Settings → enable **Web Analytics**. It injects a beacon, sets no cookies, no fingerprinting. Nothing else. No GA, no Meta pixel.

## Domain (only if traffic justifies, after Day 3)
- `.com`: Cloudflare Registrar, at cost (~$10/yr). Dash → Domain Registration → Register.
- `.in`: Cloudflare does not sell `.in`. Buy at Hostinger/BigRock (~₹600–900/yr), set nameservers to Cloudflare, then Pages → Custom domains → add.
- Check availability first: https://www.namecheap.com/domains/ (search `chamak`).

## Git hygiene
- `main` is what's deployed. Work on `main` directly for the 48h sprint, feature branches after.
- Commit after each task in `docs/06-tasks.md`. Commit message = task ID + title.
- `.gitignore`: `node_modules dist dev-photos .wrangler`.
