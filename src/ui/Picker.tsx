import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Heart, Lock, Sparkles } from 'lucide-react';
import { assign } from '../engine/assign';
import type { Assignments, Photo, Template } from '../engine/types';
import { DIRECTION_LABEL, TEMPLATES } from '../templates';
import { useProject } from '../state/project';
import { TemplateCanvas } from './TemplateCanvas';
import { isUnlocked, unlockState } from './store';
import { useViewport } from './useViewport';
import { SITE_URL, whatsappTextLink } from '../engine/share';
import { onShelf, shelfOf, type Shelf } from './gallery';
import { useSaved } from './saved';
import { SmartPickMoment, photoSetKey, shouldShowSmartPick } from './SmartPick';
import { thumb, cachedThumb } from './thumbs';
import { usePhotoImport } from './usePhotoImport';
import './picker.css';

type Chip = Shelf | 'saved';
const CHIPS: { id: Chip; label: string }[] = [
  { id: 'hot', label: 'For you' },
  { id: 'colours', label: '9 Colours' },
  { id: 'girls', label: 'Girls' },
  { id: 'boys', label: 'Boys' },
  { id: 'friends', label: 'Friends' },
  { id: 'diwali', label: 'Diwali' },
  { id: 'saved', label: 'Saved' },
];

const GAP = 12;
const FULL_RANGE = 2; // live canvases for the active card ±2

/** Small cached preview image of a template with the user's photos (used off-centre and in the filmstrip). */
function Preview({ t, photos, px, setKey, urgent, className }: { t: Template; photos: Photo[]; px: number; setKey: string; urgent?: boolean; className?: string }) {
  const [src, setSrc] = useState(() => cachedThumb(t, px, setKey));
  useEffect(() => {
    let alive = true;
    const hit = cachedThumb(t, px, setKey);
    if (hit) { setSrc(hit); return; }
    thumb(t, photos, px, setKey, urgent).then((u) => alive && setSrc(u), () => {});
    return () => { alive = false; };
  }, [t, photos, px, setKey, urgent]);
  return src ? <img className={className} src={src} alt="" draggable={false} /> : <span className={`${className ?? ''} shimmer`} />;
}

export function Picker() {
  const { state, dispatch } = useProject();
  const { w, h } = useViewport();
  const [chip, setChip] = useState<Chip>('hot');
  const [lockSheet, setLockSheet] = useState(false);
  const [moment, setMoment] = useState(() => shouldShowSmartPick(state.photos));
  const { saved, isSaved, toggle } = useSaved();
  const unlocked = isUnlocked();
  const railRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const replace = usePhotoImport({ replace: true });
  const idsKey = photoSetKey(state.photos);
  // A new photo set (e.g. samples swapped for the user's own) gets its own Smart Pick reveal.
  useEffect(() => { if (shouldShowSmartPick(state.photos)) setMoment(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [idsKey]);

  // Frames that fit the user's photo count come first (stable order otherwise). pickIndex indexes this list.
  const full = useMemo(() => {
    const n = state.photos.length;
    return [...TEMPLATES].sort((a, b) => Number(a.slots.length > n) - Number(b.slots.length > n));
  }, [state.photos.length]);

  const list = useMemo(
    () => (chip === 'saved' ? full.filter((t) => saved.includes(t.id)) : full.filter((t) => onShelf(t, chip))),
    [full, chip, saved],
  );

  const activeId = full[Math.min(state.pickIndex, full.length - 1)]?.id;
  const [active, setActive] = useState(() => Math.max(0, list.findIndex((t) => t.id === activeId)));
  const idx = Math.min(active, Math.max(0, list.length - 1));
  const t: Template | undefined = list[idx];

  const photos = useMemo(() => new Map(state.photos.map((p) => [p.id, p])), [state.photos]);
  const assignments = useMemo(() => {
    const m = new Map<string, Assignments>();
    for (const tp of TEMPLATES) m.set(tp.id, assign(tp, state.photos));
    return m;
  }, [state.photos]);
  // Preview cache key: changes when photos or their face focus change.
  const setKey = useMemo(() => state.photos.map((p) => `${p.id}${p.focus ? 'f' : ''}${p.faceScore ?? ''}${p.cutout ? 'c' : ''}`).join(','), [state.photos]);

  const cardW = Math.round(Math.min(w * 0.7, Math.max(150, (h - 350) * (9 / 16))));
  const cardH = Math.round((cardW * 16) / 9);
  const step = cardW + GAP;
  const prevPx = Math.round(cardW * Math.min(1.5, window.devicePixelRatio || 1));

  const scrollToIdx = useCallback((i: number, smooth: boolean) => {
    railRef.current?.scrollTo({ left: i * step, behavior: smooth ? 'smooth' : 'auto' });
  }, [step]);

  // Gallery choice from the landing page wins once.
  useEffect(() => {
    if (!state.preferId) return;
    const fi = full.findIndex((x) => x.id === state.preferId);
    dispatch({ type: 'SET_PREFER', id: null });
    if (fi < 0) return;
    setChip('hot');
    dispatch({ type: 'SET_PICK_INDEX', index: fi });
    setActive(fi);
    requestAnimationFrame(() => scrollToIdx(fi, false));
  }, [state.preferId, full, dispatch, scrollToIdx]);

  // Start where we left off.
  useLayoutEffect(() => { scrollToIdx(idx, false); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [step]);

  // Keep state.pickIndex (index into the full list) in sync with the centred card.
  useEffect(() => {
    if (!t) return;
    const fi = full.indexOf(t);
    if (fi >= 0 && fi !== state.pickIndex) dispatch({ type: 'SET_PICK_INDEX', index: fi });
  }, [t, full, state.pickIndex, dispatch]);

  // Filmstrip follows the active card.
  useEffect(() => {
    const strip = stripRef.current;
    const tile = strip?.children[idx] as HTMLElement | undefined;
    if (!strip || !tile) return;
    strip.scrollTo({ left: tile.offsetLeft - strip.clientWidth / 2 + tile.offsetWidth / 2, behavior: 'smooth' });
  }, [idx, chip]);

  const raf = useRef(0);
  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = railRef.current;
      if (!el) return;
      const i = Math.max(0, Math.min(list.length - 1, Math.round(el.scrollLeft / step)));
      setActive((cur) => (cur === i ? cur : i));
    });
  };

  const choose = (c: Chip) => {
    if (c === chip) return;
    const next = c === 'saved' ? full.filter((x) => saved.includes(x.id)) : full.filter((x) => onShelf(x, c));
    const keep = t ? next.indexOf(t) : -1;
    const i = Math.max(0, keep);
    setChip(c);
    setActive(i);
    requestAnimationFrame(() => scrollToIdx(i, false));
  };

  const jump = (i: number) => { setActive(i); scrollToIdx(i, true); };

  const isLocked = (tp: Template) => !!tp.locked && !unlocked;
  const use = (tp: Template) => {
    if (isLocked(tp)) { setLockSheet(true); return; }
    dispatch({ type: 'SET_TEMPLATE', templateId: tp.id, assignments: assignments.get(tp.id)! });
    dispatch({ type: 'SET_STEP', step: 'edit' });
  };
  const u = unlockState();
  const short = t ? t.slots.length - state.photos.length : 0;
  const activeShelf = t ? shelfOf(t) : null;
  const pad = Math.max(16, (w - cardW) / 2);

  return (
    <div className="picker">
      <header className="topbar">
        <button className="left iconbtn" onClick={() => dispatch({ type: 'SET_STEP', step: 'upload' })}><ChevronLeft size={20} /> Photos</button>
        <h1>Pick a frame</h1>
        {state.demo
          ? <button className="right demo-mine" onClick={replace.open}>Use my pics</button>
          : <span />}
      </header>

      <nav className="pchips" aria-label="Frame categories">
        {CHIPS.map((c) => {
          const n = c.id === 'saved' ? saved.length : 0;
          return (
            <button
              key={c.id}
              className={`pchip ${chip === c.id ? 'on' : ''} ${chip === 'hot' && activeShelf === c.id ? 'near' : ''}`}
              onClick={() => choose(c.id)}
            >
              {c.id === 'saved' && <Heart size={13} fill={n ? 'currentColor' : 'none'} />}
              {c.label}{c.id === 'saved' && n > 0 ? ` ${n}` : ''}
            </button>
          );
        })}
      </nav>

      {list.length === 0 ? (
        <div className="rail-empty" style={{ height: cardH + 24 }}>
          <Heart size={28} />
          <p><b>Nothing saved yet.</b><br />Tap ♡ on frames you like to shortlist and compare them here.</p>
          <button className="chip" onClick={() => choose('hot')}>Browse all frames</button>
        </div>
      ) : (
        <div
          ref={railRef}
          className="rail"
          style={{ paddingInline: pad, height: cardH + 24, scrollPaddingInline: pad }}
          onScroll={onScroll}
          aria-roledescription="carousel"
        >
          {list.map((tp, i) => {
            const near = Math.abs(i - idx) <= FULL_RANGE;
            return (
              <div
                key={tp.id}
                className={`pcard ${i === idx ? 'on' : ''}`}
                style={{ width: cardW, height: cardH, marginRight: i < list.length - 1 ? GAP : 0 }}
                aria-label={`${tp.name}${i === idx ? ' (selected)' : ''}`}
              >
                {near
                  ? <TemplateCanvas template={tp} assignments={assignments.get(tp.id)!} photos={photos} width={cardW} />
                  : <Preview t={tp} photos={state.photos} px={prevPx} setKey={setKey} className="pcard-img" />}
                {isLocked(tp) && <span className="lockpill"><Lock size={13} /> Share to unlock</span>}
                <button
                  className={`heart ${isSaved(tp.id) ? 'on' : ''}`}
                  aria-label={isSaved(tp.id) ? `Remove ${tp.name} from saved` : `Save ${tp.name}`}
                  aria-pressed={isSaved(tp.id)}
                  onClick={() => toggle(tp.id)}
                >
                  <Heart size={20} fill={isSaved(tp.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {t && (
        <div className="pmeta">
          <div className="pmeta-text">
            <div className="name">{t.name}</div>
            <div className="caption">
              {short > 0
                ? <span className="fit-hint">Best with {t.slots.length} photos · add {short} more or some repeat</span>
                : <>{DIRECTION_LABEL[t.direction]} · {idx + 1}/{list.length}</>}
            </div>
          </div>
          <button className="sp-pill" onClick={() => setMoment(true)} aria-label="What did Smart Pick do?">
            <Sparkles size={14} /> Smart Pick
          </button>
        </div>
      )}

      <div className="bottom-bar picker-bottom">
        {list.length > 1 && (
          <div className="strip-wrap">
            <div ref={stripRef} className="filmstrip" role="tablist" aria-label="All frames">
              {list.map((tp, i) => (
                <button
                  key={tp.id}
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={tp.name}
                  className={`ftile ${i === idx ? 'on' : ''}`}
                  onClick={() => jump(i)}
                >
                  <Preview t={tp} photos={state.photos} px={prevPx} setKey={setKey} urgent={Math.abs(i - idx) < 4} />
                  {isSaved(tp.id) && <span className="fheart"><Heart size={9} fill="currentColor" /></span>}
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="btn btn-primary" disabled={!t} onClick={() => t && use(t)}>
          {t && isLocked(t) ? <><Lock size={18} /> Unlock by sharing</> : 'Use this frame'}
        </button>
      </div>

      {moment && <SmartPickMoment photos={state.photos} onClose={() => setMoment(false)} />}
      {replace.input}
      {replace.overlay}

      {lockSheet && (
        <>
          <div className="sheet-backdrop" onClick={() => setLockSheet(false)} />
          <div className="sheet" role="dialog" aria-label="Unlock bonus frames">
            <div className="grabber" />
            <h2>4 bonus frames 🔓</h2>
            <p className="caption" style={{ fontSize: 15, margin: '0 0 18px' }}>
              Share one finished frame, or download 3, and these unlock on this phone. No payment, no signup.
            </p>
            <div className="progress"><span>Shares</span><b>{Math.min(u.shares, 1)}/1</b></div>
            <div className="progress"><span>Downloads</span><b>{Math.min(u.downloads, 3)}/3</b></div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => {
              setLockSheet(false);
              const free = list.findIndex((x, i) => i > idx && !isLocked(x));
              if (free >= 0) jump(free);
            }}>
              Pick a free frame first
            </button>
            <a className="btn btn-ghost" href={whatsappTextLink(`Free festive photo frames, no signup: ${SITE_URL}`)} target="_blank" rel="noreferrer">
              Tell friends on WhatsApp
            </a>
          </div>
        </>
      )}
    </div>
  );
}
