# 06 — Task list (execute in order)

Each task: **ID · Title · Est · DoD (definition of done)**. Commit after each with message `<ID> <title>`. Tick the box. Post a Slack update at every task marked 📣.

## Day 1 — Tue 13 Oct · Engine + first templates + live URL
- [ ] **T01 Scaffold** · 30 min · `docs/01-setup.md` commands run; `npm run dev` opens on phone via LAN IP; `tokens.css` + `base.css` in place; dark bg, DM Sans loads.
- [ ] **T02 Types + state** · 30 min · `types.ts`, `state/project.ts` reducer with all actions and a `useProject()` hook; unit-free, just compiles.
- [ ] **T03 Photo intake** · 1 h · `importFiles()` with EXIF orientation + 2048 downscale + 200px thumbs; Upload screen shows progress and thumbnails; 8 phone photos import on iPhone without crash.
- [ ] **T04 Fit + renderer** · 2 h · `fit.ts`, `renderer.ts` with all four slot shapes; a hard-coded test template renders photos on a preview canvas at correct DPR.
- [ ] **T05 Shared art helpers** · 2 h · every helper in `03-templates.md` table implemented in `templates/shared/`; a dev page `/dev` renders each helper on a swatch.
- [ ] **T06 Three templates** · 3 h · `diwali-diya-glow`, `navratri-garba-night`, `pastel-beige-air` pass the screenshot test with dev photos; Devanagari renders; each draws < 40 ms.
- [ ] **T07 Export + download** · 1 h · `exportJpeg()` gives 1080x1920 JPEG < 900 KB; `download()` works on Android Chrome; iOS share-sheet save works.
- [ ] **T08 Deploy** 📣 · 20 min · `wrangler pages project create` + deploy; `https://chamak.pages.dev` loads on both phones; Web Analytics enabled.

**Day 1 exit:** on a phone, from the live URL: add photos → see one template filled → save the image. Post screenshots to Slack.

## Day 2 — Wed 14 Oct · Full loop, Navratri pack ships
- [ ] **T09 Smart Pick scoring** · 1 h · `score.ts` ranks `dev-photos/` with blurry and dark photos at the bottom; scoring 8 photos < 300 ms.
- [ ] **T10 Assignment** · 45 min · `assign.ts` orientation-aware; Shuffle variant; duplicates when photos < slots.
- [ ] **T11 Picker** · 2.5 h · swipe stack with `motion`, dots, name label, per-template cached previews with user's photos, "Use this", See-all grid sheet, first-open hint, locked pill.
- [ ] **T12 Editor** · 3 h · tap-select with ring, pinch/drag/clamp, rotate slider, double-tap reset, Swap strip, Smart Pick + Shuffle chips, Done → HD render overlay.
- [ ] **T13 Done screen** · 1 h · final image, Download/Save, Share (`navigator.share` with file, `wa.me` fallback), badge toggle re-renders, Make another / New photos.
- [ ] **T14 Unlock loop** · 45 min · `store.ts`; share success or 3 downloads unlocks; try/catch around storage; toast; pills vanish.
- [ ] **T15 Navratri templates** · 2.5 h · `navratri-chaniya`, `navratri-dandiya-pop`, `navratri-maa-durga` (locked) pass the screenshot test.
- [ ] **T16 Privacy page + head meta** · 30 min · `/privacy` with copy from `05-launch.md`; `index.html` meta block; temporary `og.jpg`.
- [ ] **T17 Ship v1** 📣 · 30 min · deploy; full loop on both phones; WhatsApp preview shows; share text correct. Post the URL + 3 exports to Slack.

**Day 2 exit:** anyone with the link can make and share a Navratri frame.

## Day 3 — Thu 15 Oct · Real-phone hardening + seed
- [ ] **T18 Device matrix** · 2 h · every row in `05-launch.md` matrix passes or has a documented fix; in-app browser behaviour confirmed.
- [ ] **T19 Perf** · 1.5 h · bundle < 150 KB gz (check `vite build` output); directions lazy-loaded; fonts subset; first load on 3G throttle < 6 s.
- [ ] **T20 OG image** · 1 h · `og.jpg` 1200x630 < 300 KB, verified in WhatsApp on both phones.
- [ ] **T21 Sample photos** · 1 h · 6 licensed photos in `public/samples/` as WebP ≤ 120 KB; hero cycles them; credits on `/privacy`.
- [ ] **T22 Seed** 📣 · 1 h · 20 WhatsApp groups + 1 Instagram story. Record visits at 10 pm in Slack.

## Day 4–5 — Fri 16–Sat 17 Oct · Diwali templates
- [ ] **T23 Royal Diwali** · 3 h · `diwali-maroon-foil`, `diwali-night-lights` (locked).
- [ ] **T24 Minimal Pastel** · 2.5 h · `pastel-sage-grid`, `pastel-blush-arch` (locked).
- [ ] **T25 Y2K Chrome** · 3.5 h · `y2k-flash`, `y2k-chrome-mirror`, `y2k-neon-grain` (locked).
- [ ] **T26 Pack switching** · 1 h · Diwali pack hidden behind `?pack=diwali` until 24 Oct; date-based share text; swipe order per pack.
- [ ] **T27 Screenshot review** 📣 · 1 h · all 13 templates rendered with dev photos into one contact sheet, posted to Slack, any "mid" ones get a second pass.

## Day 6 — Mon 20 Oct · Dussehra push
- [ ] **T28 Dussehra post** 📣 · 30 min · groups + story. Record numbers.

## Day 7–9 — Tue 21–Fri 24 Oct · Diwali ship
- [ ] **T29 Diwali QA** · 2 h · device matrix again on Diwali templates; `og.jpg?v=2` with Diwali art.
- [ ] **T30 Ship Diwali pack** 📣 · Fri 24 Oct · deploy, seed, numbers to Slack.

## v1.1 candidates (only after 24 Oct, pick by data)
- [ ] **T31 Family name field** · 3 h · optional single text input per template ("from the Sharma family"), `textFit`, Devanagari supported. Highest expected lift.
- [ ] **T32 Face detection in Smart Pick** · 4 h · `@mediapipe/tasks-vision` FaceDetector, short-range model, loaded only after import, +0.2 weight for ≥ 1 face. Only if Smart Pick complaints appear.
- [ ] **T33 4:5 post export** · 1.5 h · second size for Instagram feed.
- [ ] **T34 Domain** · 1 h · only if > 5k visits.

## Definition of "properly shipped"
- All Day 1–3 tasks ticked and the device matrix green.
- 13 templates pass the screenshot test (contact sheet in Slack).
- Privacy page true in every sentence (no runtime network calls except the analytics beacon; verify in DevTools Network tab).
- Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95.
