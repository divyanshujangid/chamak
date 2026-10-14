import { useMemo, useRef, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { ChevronLeft, Images, Plus, RotateCw, Shuffle, Sparkles } from 'lucide-react';
import { assign } from '../engine/assign';
import { clampTransform, hitSlot } from '../engine/fit';
import { MAX_PHOTOS, importFiles } from '../engine/photos';
import { scoreAll } from '../engine/score';
import type { PhotoTransform } from '../engine/types';
import { byId } from '../templates';
import { useProject } from '../state/project';
import { TemplateCanvas } from './TemplateCanvas';
import { useToast } from './Toast';
import { useViewport } from './useViewport';
import './editor.css';

export function Editor() {
  const { state, dispatch } = useProject();
  const toast = useToast();
  const { w, h } = useViewport();
  const t = byId.get(state.templateId!)!;
  const [sel, setSel] = useState<string | null>(null);
  const [strip, setStrip] = useState(false);
  const [touched, setTouched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastTap = useRef<{ id: string; at: number } | null>(null);
  const photos = useMemo(() => new Map(state.photos.map((p) => [p.id, p])), [state.photos]);

  const controlsH = 56 + (sel ? 64 : 0) + 64 + (strip ? 92 : 0) + 24;
  const canvasW = Math.round(Math.min(w - 32, (h - controlsH - 16) * (9 / 16)));
  const k = canvasW / 1080;

  const toDesign = (cx: number, cy: number) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return [(cx - r.left) / k, (cy - r.top) / k] as const;
  };
  const slotAt = (cx: number, cy: number) => {
    const [x, y] = toDesign(cx, cy);
    return [...t.slots].reverse().find((s) => hitSlot(s, x, y))?.id ?? null;
  };
  const update = (slotId: string, patch: Partial<PhotoTransform>) => {
    const slot = t.slots.find((s) => s.id === slotId)!;
    const cur = state.assignments[slotId];
    const p = cur && photos.get(cur.photoId);
    if (!cur || !p) return;
    dispatch({ type: 'UPDATE_TRANSFORM', slotId, t: clampTransform(slot, p, { ...cur, ...patch }) });
  };

  useGesture(
    {
      onDrag: ({ tap, xy: [x, y], movement: [mx, my], first, pinching, cancel, memo }) => {
        if (pinching) return cancel();
        if (tap) {
          const id = slotAt(x, y);
          setTouched(true);
          if (id && lastTap.current?.id === id && Date.now() - lastTap.current.at < 300) {
            update(id, { scale: 1, dx: 0, dy: 0, rotate: 0 });
            toast('Reset');
          }
          lastTap.current = id ? { id, at: Date.now() } : null;
          setSel(id);
          return;
        }
        let m = memo as { id: string; dx: number; dy: number } | undefined;
        if (first || !m) {
          const id = slotAt(x, y) ?? sel;
          const cur = id ? state.assignments[id] : undefined;
          if (!id || !cur) return undefined;
          if (id !== sel) setSel(id);
          setTouched(true);
          m = { id, dx: cur.dx, dy: cur.dy };
        }
        update(m.id, { dx: m.dx + mx / k, dy: m.dy + my / k });
        return m;
      },
      onPinch: ({ origin: [ox, oy], first, movement: [ms], memo }) => {
        let m = memo as { id: string; s: number } | undefined;
        if (first || !m) {
          const id = slotAt(ox, oy) ?? sel;
          if (!id) return undefined;
          setSel(id);
          m = { id, s: state.assignments[id]?.scale ?? 1 };
        }
        update(m.id, { scale: m.s * ms });
        return m;
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault();
        if (sel) update(sel, { scale: (state.assignments[sel]?.scale ?? 1) * (1 - dy * 0.002) });
      },
    },
    {
      target: wrapRef,
      eventOptions: { passive: false },
      drag: { filterTaps: true, pointer: { touch: true } },
      pinch: { scaleBounds: { min: 0.5, max: 6 } },
    },
  );

  const selT = sel ? state.assignments[sel] : null;

  async function addPhotos(list: FileList | null) {
    if (!list?.length) return;
    const room = MAX_PHOTOS - state.photos.length;
    const added = await importFiles(Array.from(list).slice(0, room));
    scoreAll([...state.photos, ...added]);
    dispatch({ type: 'ADD_PHOTOS', photos: added });
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="editor">
      <header className="topbar">
        <button className="left iconbtn" onClick={() => dispatch({ type: 'SET_STEP', step: 'pick' })}><ChevronLeft size={20} /> Frames</button>
        <h1>{t.name}</h1>
        <button className="right btn-done" onClick={() => dispatch({ type: 'SET_STEP', step: 'done' })}>Done</button>
      </header>

      <div className="canvas-wrap" ref={wrapRef} style={{ width: canvasW, height: (canvasW * 16) / 9 }}>
        <TemplateCanvas template={t} assignments={state.assignments} photos={photos} width={canvasW} opts={{ selectedSlot: sel }} label="Preview of your frame. Tap a photo to adjust." />
        {!touched && <div className="tap-hint">Tap a photo to adjust · pinch to zoom</div>}
      </div>

      {sel && selT && (
        <div className="rotate-row">
          <RotateCw size={18} />
          <input
            type="range" min={-45} max={45} step={1}
            value={selT.rotate}
            onChange={(e) => update(sel, { rotate: +e.target.value })}
            aria-label="Rotate photo"
          />
          <span className="deg">{selT.rotate}°</span>
        </div>
      )}

      <div className="chips">
        <button className={`chip ${strip ? 'on' : ''}`} onClick={() => setStrip((s) => !s)}><Images size={16} /> Swap</button>
        <button className="chip" onClick={() => { dispatch({ type: 'SET_ASSIGNMENTS', assignments: assign(t, state.photos) }); toast('Smart Pick (on-device): best shots in the biggest spots'); }}><Sparkles size={16} /> Smart Pick</button>
        <button className="chip" onClick={() => dispatch({ type: 'SET_ASSIGNMENTS', assignments: assign(t, state.photos, true), manual: true })}><Shuffle size={16} /> Shuffle</button>
      </div>

      {strip && (
        <div className="strip" role="listbox" aria-label="Your photos">
          {state.photos.map((p) => {
            const inSel = sel && state.assignments[sel]?.photoId === p.id;
            return (
              <button
                key={p.id}
                className={`sthumb ${inSel ? 'on' : ''}`}
                onClick={() => {
                  const target = sel ?? t.slots[0].id;
                  if (!sel) { setSel(target); toast('Tip: tap a photo in the frame first'); }
                  dispatch({ type: 'PUT_PHOTO', slotId: target, photoId: p.id });
                }}
              >
                <img src={p.thumbUrl} alt="" />
              </button>
            );
          })}
          {state.photos.length < MAX_PHOTOS && (
            <button className="sthumb add" onClick={() => fileRef.current?.click()} aria-label="Add photos"><Plus /></button>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} />
        </div>
      )}
    </div>
  );
}
