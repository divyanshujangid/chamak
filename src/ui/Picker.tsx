import { useMemo, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight, Hand, LayoutGrid, Lock } from 'lucide-react';
import { assign } from '../engine/assign';
import type { Assignments, Template } from '../engine/types';
import { DIRECTION_LABEL, TEMPLATES } from '../templates';
import { useProject } from '../state/project';
import { TemplateCanvas } from './TemplateCanvas';
import { hintSeen, isUnlocked, markHintSeen, unlockState } from './store';
import { useViewport } from './useViewport';
import { SITE_URL, whatsappTextLink } from '../engine/share';
import './picker.css';

export function Picker() {
  const { state, dispatch } = useProject();
  const { w, h } = useViewport();
  const [dir, setDir] = useState(1);
  const [grid, setGrid] = useState(false);
  const [lockSheet, setLockSheet] = useState(false);
  const [hint, setHint] = useState(!hintSeen());
  const unlocked = isUnlocked();
  // Frames that fit the user's photo count come first (stable order otherwise).
  const list = useMemo(() => {
    const n = state.photos.length;
    return [...TEMPLATES].sort((a, b) => Number(a.slots.length > n) - Number(b.slots.length > n));
  }, [state.photos.length]);
  const idx = Math.min(state.pickIndex, list.length - 1);
  const t = list[idx];
  const short = t.slots.length - state.photos.length;

  const photos = useMemo(() => new Map(state.photos.map((p) => [p.id, p])), [state.photos]);
  const assignments = useMemo(() => {
    const m = new Map<string, Assignments>();
    for (const tp of TEMPLATES) m.set(tp.id, assign(tp, state.photos));
    return m;
  }, [state.photos]);

  const cardW = Math.round(Math.min(w * 0.82, (h - 56 - 190) * (9 / 16)));
  const go = (d: number) => {
    const n = (idx + d + list.length) % list.length;
    setDir(d);
    dispatch({ type: 'SET_PICK_INDEX', index: n });
    if (hint) { setHint(false); markHintSeen(); }
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -90 || info.velocity.x < -500) go(1);
    else if (info.offset.x > 90 || info.velocity.x > 500) go(-1);
  };
  const isLocked = (tp: Template) => !!tp.locked && !unlocked;
  const use = (tp: Template) => {
    if (isLocked(tp)) { setLockSheet(true); return; }
    dispatch({ type: 'SET_TEMPLATE', templateId: tp.id, assignments: assignments.get(tp.id)! });
    dispatch({ type: 'SET_STEP', step: 'edit' });
  };
  const u = unlockState();

  return (
    <div className="picker">
      <header className="topbar">
        <button className="left iconbtn" onClick={() => dispatch({ type: 'SET_STEP', step: 'upload' })}><ChevronLeft size={20} /> Photos</button>
        <h1>Pick a frame</h1>
        <button className="right iconbtn" onClick={() => setGrid(true)} aria-label="See all frames"><LayoutGrid size={20} /></button>
      </header>

      <div className="stage" style={{ height: cardW * (16 / 9) + 24 }}>
        <div className="card back" style={{ width: cardW, height: cardW * (16 / 9) }}>
          <TemplateCanvas
            template={list[(idx + 1) % list.length]}
            assignments={assignments.get(list[(idx + 1) % list.length].id)!}
            photos={photos}
            width={cardW}
          />
        </div>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={t.id}
            className="card"
            style={{ width: cardW, height: cardW * (16 / 9) }}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 60, opacity: 0, scale: 0.94 }),
              center: { x: 0, opacity: 1, scale: 1, rotate: 0 },
              exit: (d: number) => ({ x: -d * 420, opacity: 0, rotate: -d * 14 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragSnapToOrigin
            dragElastic={0.9}
            whileDrag={{ scale: 1.02 }}
            onDragEnd={onDragEnd}
            onTap={() => use(t)}
          >
            <TemplateCanvas template={t} assignments={assignments.get(t.id)!} photos={photos} width={cardW} />
            {isLocked(t) && <span className="lockpill"><Lock size={13} /> Share to unlock</span>}
          </motion.div>
        </AnimatePresence>
        {hint && (
          <div className="hint" aria-hidden>
            <Hand size={30} className="hand" />
            <span>Swipe to browse</span>
          </div>
        )}
      </div>

      <div className="meta">
        <button className="nav" onClick={() => go(-1)} aria-label="Previous frame"><ChevronLeft /></button>
        <div className="center">
          <div className="name">{t.name}</div>
          <div className="caption">{DIRECTION_LABEL[t.direction]} · {idx + 1} of {list.length}</div>
          {short > 0 && <div className="caption fit-hint">Best with {t.slots.length} photos · add {short} more or some will repeat</div>}
        </div>
        <button className="nav" onClick={() => go(1)} aria-label="Next frame"><ChevronRight /></button>
      </div>

      <div className="bottom-bar">
        <button className="btn btn-primary" onClick={() => use(t)}>
          {isLocked(t) ? <><Lock size={18} /> Unlock by sharing</> : 'Use this frame'}
        </button>
      </div>

      {grid && (
        <>
          <div className="sheet-backdrop" onClick={() => setGrid(false)} />
          <div className="sheet" role="dialog" aria-label="All frames">
            <div className="grabber" />
            <h2>All frames</h2>
            {(['navratri', 'diwali'] as const).map((pack) => (
              <section key={pack}>
                <h3 className="pack">{pack === 'navratri' ? 'Navratri' : 'Diwali'}</h3>
                <div className="grid">
                  {list.map((tp, i) => tp.pack !== pack ? null : (
                    <button key={tp.id} className={`gcell ${i === idx ? 'on' : ''}`} onClick={() => { dispatch({ type: 'SET_PICK_INDEX', index: i }); setGrid(false); }}>
                      <TemplateCanvas template={tp} assignments={assignments.get(tp.id)!} photos={photos} width={Math.floor((Math.min(w, 460) - 44) / 2)} />
                      {isLocked(tp) && <span className="lockpill sm"><Lock size={11} /></span>}
                      <span className="gname">{tp.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

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
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setLockSheet(false); go(1); }}>
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
