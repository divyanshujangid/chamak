import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Lock, Plus, X } from 'lucide-react';
import { importFiles } from '../engine/photos';
import { scoreAll } from '../engine/score';
import { assign } from '../engine/assign';
import type { Photo } from '../engine/types';
import { TEMPLATES } from '../templates';
import { useProject } from '../state/project';
import { demoPhotos } from './demoPhotos';
import { TemplateCanvas } from './TemplateCanvas';
import { useToast } from './Toast';
import { useViewport } from './useViewport';
import './upload.css';

const HERO_IDS = ['c-garba-lookbook', 'c-navy-canopy', 'c-dolled-up', 'c-dandiya-night', 'c-lyrics-cream', 'c-pinned-polaroids'];

export function Upload() {
  const { state, dispatch } = useProject();
  const toast = useToast();
  const { w } = useViewport();
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [demo, setDemo] = useState<Photo[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { demoPhotos().then(setDemo); }, []);
  useEffect(() => {
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IDS.length), 2600);
    return () => clearInterval(id);
  }, []);

  const demoMap = useMemo(() => new Map(demo.map((p) => [p.id, p])), [demo]);
  const hero = useMemo(
    () => HERO_IDS.map((id) => TEMPLATES.find((t) => t.id === id)!).map((t) => ({ t, a: assign(t, demo) })),
    [demo],
  );

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    const files = Array.from(list);
    const room = 8 - state.photos.length;
    if (files.length > room) toast(room > 0 ? `Using the first ${room} photos (max 8)` : 'Max 8 photos');
    const take = files.slice(0, Math.max(0, room));
    if (!take.length) return;
    setBusy({ done: 0, total: take.length });
    const added = await importFiles(take, (done, total) => setBusy({ done, total }));
    setBusy(null);
    if (added.length < take.length) toast('Skipped a file we could not read');
    const all = [...state.photos, ...added];
    scoreAll(all);
    dispatch({ type: 'ADD_PHOTOS', photos: added });
    if (all.length >= 3) dispatch({ type: 'SET_STEP', step: 'pick' });
    if (inputRef.current) inputRef.current.value = '';
  }

  const cardW = Math.min(200, (w - 32) * 0.46);
  const has = state.photos.length > 0;

  return (
    <div className="upload">
      <header className="topbar">
        <span className="left brand">chamak<span className="brand-dot">✦</span></span>
        <span />
        <a className="right iconbtn" href="/privacy" aria-label="Privacy"><Lock size={16} /> Privacy</a>
      </header>

      {!has && (
        <div className="hero" style={{ height: cardW * 1.78 + 30 }} aria-hidden>
          {demo.length > 0 && [-1, 0, 1].map((off) => {
            const i = (heroIdx + off + HERO_IDS.length) % HERO_IDS.length;
            const { t, a } = hero[i];
            return (
              <div key={`${t.id}-${off}`} className={`hero-card pos${off + 1}`} style={{ width: cardW }}>
                <TemplateCanvas template={t} assignments={a} photos={demoMap} width={cardW} />
              </div>
            );
          })}
        </div>
      )}

      <section className="pitch">
        {!has ? (
          <>
            <h2>Festive frames for your photos. <em>In 30 seconds.</em></h2>
            <p>Free. No signup. Your photos never leave your phone.</p>
            <div className="trust">
              <div><b>₹0</b>free forever</div>
              <div><b>0 uploads</b>stays on phone</div>
              <div><b>HD</b>story-ready</div>
            </div>
          </>
        ) : (
          <>
            <h2>{state.photos.length} photo{state.photos.length > 1 ? 's' : ''} ready</h2>
            <p>Add up to {8 - state.photos.length} more, or continue.</p>
            <div className="thumbs">
              {state.photos.map((p) => (
                <div key={p.id} className="thumb">
                  <img src={p.thumbUrl} alt="" />
                  <button aria-label="Remove photo" onClick={() => dispatch({ type: 'REMOVE_PHOTO', id: p.id })}><X size={14} /></button>
                </div>
              ))}
              {state.photos.length < 8 && (
                <button className="thumb add" onClick={() => inputRef.current?.click()} aria-label="Add more photos"><Plus /></button>
              )}
            </div>
          </>
        )}
      </section>

      <div className="bottom-bar">
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        {has ? (
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'SET_STEP', step: 'pick' })}>
            Pick a frame →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => inputRef.current?.click()}>
            <Camera size={20} /> Add your photos
          </button>
        )}
        <p className="caption center">{has ? 'Tip: 3 or more photos unlock the collage frames' : '1 to 8 photos · nothing is uploaded, ever'}</p>
      </div>

      {busy && (
        <div className="overlay" role="status">
          <div className="center">
            <div className="spinner" />
            <div>Preparing {busy.done} of {busy.total}…</div>
            <div className="caption">on your phone, not a server</div>
          </div>
        </div>
      )}
    </div>
  );
}
