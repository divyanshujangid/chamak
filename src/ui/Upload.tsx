import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Camera, Download, Lock, Plus, ShieldCheck, X } from 'lucide-react';
import type { Photo, Template } from '../engine/types';
import { MAX_PHOTOS, useProject } from '../state/project';
import { heroTemplates, shelf, SHELVES, type Shelf } from './gallery';
import { InstallButton } from './InstallSheet';
import { demoProjectPhotos, galleryPhotos } from './samples';
import { isUnlocked } from './store';
import { thumb, thumbPx, cachedThumb } from './thumbs';
import { useToast } from './Toast';
import { usePhotoImport } from './usePhotoImport';
import { useViewport } from './useViewport';
import { Sparkle, Wordmark } from './Wordmark';
import './upload.css';
import { track } from '../analytics';

const SET = 'samples';
const COLOURS = ['orange', 'white', 'red', 'royal blue', 'yellow', 'green', 'grey', 'purple', 'peacock green'];
const DOT = ['#F26B1D', '#F7F3EA', '#C8102E', '#2350B8', '#F5C518', '#2E8B57', '#8A8D91', '#6B3FA0', '#00796B'];

/** "NAVRATRI · DAY 04 · ROYAL BLUE" during Navratri (11–19 Oct 2026), else the Diwali countdown. */
function festivalTag(now = new Date()) {
  const day = Math.floor((now.getTime() - new Date(2026, 9, 11).getTime()) / 864e5) + 1;
  if (day >= 1 && day <= 9) return { text: `Navratri · day ${String(day).padStart(2, '0')} · ${COLOURS[day - 1]}`, dot: DOT[day - 1] };
  const diwali = Math.ceil((new Date(2026, 10, 8).getTime() - now.getTime()) / 864e5);
  if (diwali > 0 && diwali < 40) return { text: `Diwali in ${diwali} days`, dot: '#FFB22E' };
  return { text: 'Navratri + Diwali frames', dot: '#FF3D8B' };
}

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** A template preview image with the sample photos. Renders only once it nears the viewport. */
function LazyPreview({ t, photos, cssW, eager }: { t: Template; photos: Photo[] | null; cssW: number; eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = thumbPx(cssW);
  const [src, setSrc] = useState(() => cachedThumb(t, px, SET));
  const [seen, setSeen] = useState(!!eager);
  useEffect(() => {
    if (seen || !ref.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: '300px 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);
  useEffect(() => {
    if (!seen || !photos || src) return;
    let alive = true;
    thumb(t, photos, px, SET, eager).then((u) => alive && setSrc(u), () => {});
    return () => { alive = false; };
  }, [seen, photos, t, px, src, eager]);
  return (
    <div ref={ref} className="lp" style={{ width: cssW, height: Math.round((cssW * 16) / 9) }}>
      {src ? <img src={src} alt={`${t.name} frame preview`} draggable={false} /> : <span className="shimmer" />}
    </div>
  );
}

export function Upload() {
  const { state, dispatch } = useProject();
  const toast = useToast();
  const { w } = useViewport();
  const [samples, setSamples] = useState<Photo[] | null>(null);
  const [tab, setTab] = useState<Shelf>('hot');
  const [heroIdx, setHeroIdx] = useState(0);
  const [preview, setPreview] = useState<Template | null>(null);
  const [demoBusy, setDemoBusy] = useState(false);
  const unlocked = isUnlocked();

  const add = usePhotoImport({
    onDone: (all) => { if (all.length >= 3 || state.preferId) dispatch({ type: 'SET_STEP', step: 'pick' }); },
  });

  useEffect(() => { galleryPhotos().then(setSamples, () => {}); }, []);
  const heroes = useMemo(heroTemplates, []);
  useEffect(() => {
    if (reduceMotion()) return;
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % heroes.length), 2800);
    return () => clearInterval(id);
  }, [heroes.length]);

  const items = useMemo(() => shelf(tab), [tab]);
  const tag = festivalTag();
  const has = state.photos.length > 0;
  const heroW = Math.round(Math.min(150, w * 0.38));
  const cellW = Math.floor((Math.min(w, 460) - 32 - 12) / 2);

  async function startDemo(t?: Template) {
    if (demoBusy) return;
    setDemoBusy(true);
    try {
      const photos = await demoProjectPhotos();
      dispatch({ type: 'REPLACE_PHOTOS', photos, demo: true });
      track('demo_started', { template: t?.id ?? null });
      dispatch({ type: 'SET_PREFER', id: t?.id ?? null });
      dispatch({ type: 'SET_STEP', step: 'pick' });
    } catch {
      toast('Couldn’t load sample pics. Check your connection.');
    } finally {
      setDemoBusy(false);
    }
  }

  function pickWithMine(t: Template) {
    dispatch({ type: 'SET_PREFER', id: t.id });
    setPreview(null);
    add.open();
  }

  return (
    <div className="upload">
      <header className="topbar">
        <Wordmark />
        <span />
        <div className="right top-actions">
          <InstallButton className="get-app"><Download size={15} /> Get app</InstallButton>
          <a className="iconbtn" href="/privacy" aria-label="Privacy"><Lock size={18} /></a>
        </div>
      </header>

      {!has ? (
        <>
          <section className="hero">
            <div className="tag hero-tag"><i style={{ background: tag.dot }} />{tag.text}</div>
            <p className="hero-problem">Garba khel ke thak gaye? Mast photos hain, par edit karne ki energy zero 😮‍💨</p>
            <h1 className="hero-h">Photo daalo,<br />story <em>ready.</em></h1>
            <p className="hero-sub">Ghar jaate jaate, cab mein hi. <b>30 sec mein Insta-ready story.</b> No signup, pics stay on your phone.</p>
            <div className="fan" style={{ height: Math.round(heroW * 1.78) + 24 }} aria-hidden>
              {heroes.length >= 3 && [-1, 0, 1].map((off) => {
                const i = (heroIdx + off + heroes.length) % heroes.length;
                return (
                  <div key={heroes[i].id} className={`fan-card f${off + 1}`} style={{ width: heroW }}>
                    <LazyPreview t={heroes[i]} photos={samples} cssW={heroW} eager />
                  </div>
                );
              })}
              <span className="fan-sticker deva">स्टोरियाँ</span>
              <span className="fan-sticker smart"><Sparkle size={11} /> faces centred</span>
            </div>
          </section>

          <section className="gallery" aria-label="Browse frames">
            <div className="g-head">
              <h2>Pick your vibe</h2>
              <span className="caption">Tap any frame to try it</span>
            </div>
            <div className="g-tabs" role="tablist">
              {SHELVES.map((s) => (
                <button key={s.id} role="tab" aria-selected={tab === s.id} className={`pchip ${tab === s.id ? 'on' : ''}`} onClick={() => { setTab(s.id); track('gallery_tab', { tab: s.id }); }}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="g-grid">
              {items.map((t) => (
                <button key={t.id} className="g-cell" onClick={() => setPreview(t)} aria-label={`Preview ${t.name}`}>
                  <LazyPreview t={t} photos={samples} cssW={cellW} />
                  {t.locked && !unlocked && <span className="g-lock"><Lock size={11} /> 1 share</span>}
                  <span className="g-name">{t.name}</span>
                </button>
              ))}
            </div>
            <p className="g-foot caption"><ShieldCheck size={14} /> Samples shown. Your pics stay on your phone, always.</p>
          </section>
        </>
      ) : (
        <section className="tray">
          <h2>{state.photos.length} pic{state.photos.length > 1 ? 's' : ''} ready</h2>
          <p className="caption">{state.photos.length < 3 ? 'Add a few more for the collage frames, or continue.' : `Add up to ${MAX_PHOTOS - state.photos.length} more, or continue.`}</p>
          <div className="thumbs">
            {state.photos.map((p) => (
              <div key={p.id} className="thumb">
                <img src={p.thumbUrl} alt="" />
                <button aria-label="Remove photo" onClick={() => dispatch({ type: 'REMOVE_PHOTO', id: p.id })}><X size={14} /></button>
              </div>
            ))}
            {state.photos.length < MAX_PHOTOS && (
              <button className="thumb add" onClick={add.open} aria-label="Add more photos"><Plus /></button>
            )}
          </div>
          <div className="tray-tip">
            <Sparkle size={16} />
            <p><b>Smart Pick is on.</b> Your sharpest, best-lit pic gets the biggest spot and faces get centred, right here on your phone.</p>
          </div>
        </section>
      )}

      <div className="bottom-bar upload-bottom">
        {add.input}
        {has ? (
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'SET_STEP', step: 'pick' })}>
            Pick a frame <ArrowRight size={20} />
          </button>
        ) : (
          <>
            <button className="btn btn-primary" onClick={add.open}>
              <Camera size={20} /> Add your photos
            </button>
            <div className="sub-cta">
              <button className="demo-link" onClick={() => startDemo()} disabled={demoBusy}>
                {demoBusy ? 'Loading samples…' : <><b>Try with sample pics</b> <ArrowRight size={14} /></>}
              </button>
              <span className="caption nowrap">Up to {MAX_PHOTOS} pics · 0 uploads</span>
            </div>
          </>
        )}
      </div>

      {preview && (
        <>
          <div className="sheet-backdrop" onClick={() => setPreview(null)} />
          <div className="sheet pv-sheet" role="dialog" aria-label={preview.name}>
            <div className="grabber" />
            <div className="pv-body">
              <LazyPreview t={preview} photos={samples} cssW={Math.min(200, Math.round(w * 0.5))} eager />
              <div className="pv-side">
                <div className="tag pv-tag">{preview.pack === 'diwali' ? 'Diwali' : 'Navratri'} · {preview.slots.length} photo{preview.slots.length > 1 ? 's' : ''}</div>
                <h2>{preview.name}</h2>
                <p className="caption">This is with sample pics. Yours get Smart Pick: best shots in the biggest spots, faces centred.</p>
                {preview.locked && !unlocked && <p className="caption pv-lock"><Lock size={12} /> Bonus frame: 1 share unlocks it</p>}
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => pickWithMine(preview)}><Camera size={20} /> Use my photos</button>
            <button className="btn btn-ghost" onClick={() => { const t = preview; setPreview(null); void startDemo(t); }}>Try it with samples first</button>
          </div>
        </>
      )}

      {add.overlay}
      {demoBusy && (
        <div className="overlay" role="status">
          <div className="center busy"><div className="spinner" /><div className="busy-title">Loading sample pics…</div></div>
        </div>
      )}
    </div>
  );
}
