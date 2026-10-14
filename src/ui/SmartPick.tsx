import { useEffect, useMemo, useState } from 'react';
import { Check, Crown, Loader2 } from 'lucide-react';
import type { Photo } from '../engine/types';
import { Sparkle } from './Wordmark';

const shown = new Set<string>();
export const photoSetKey = (photos: Photo[]) => photos.map((p) => p.id).sort().join('|');
/** True the first time a given photo set reaches the Picker. */
export function shouldShowSmartPick(photos: Photo[]) {
  return photos.length > 0 && !shown.has(photoSetKey(photos));
}

const rank = (p: Photo) => p.score + (p.faceScore ? 0.5 + p.faceScore : 0);

/** The "we sorted your best shots" reveal. Auto-closes; tap anywhere to skip. */
export function SmartPickMoment({ photos, onClose }: { photos: Photo[]; onClose: () => void }) {
  const ranked = useMemo(() => [...photos].sort((a, b) => rank(b) - rank(a)), [photos]);
  const faces = photos.filter((p) => p.focus).length;
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    shown.add(photoSetKey(photos));
    const a = setTimeout(() => setSlow(true), 2200);
    const b = setTimeout(onClose, 3600);
    return () => { clearTimeout(a); clearTimeout(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const facesDone = faces > 0 || slow;

  return (
    <div className="sp-overlay" role="status" aria-live="polite" onClick={onClose}>
      <div className="sp-card">
        <div className="tag sp-tag"><Sparkle size={12} /> Smart Pick</div>
        <h2 className="sp-title">Sorted your <em>best</em> shots</h2>
        <div className="sp-thumbs">
          {ranked.slice(0, 5).map((p, i) => (
            <div key={p.id} className={`sp-thumb ${i === 0 ? 'best' : ''}`} style={{ animationDelay: `${120 + i * 70}ms` }}>
              {p.thumbUrl ? <img src={p.thumbUrl} alt="" /> : null}
              {i === 0 && <span className="sp-crown"><Crown size={12} /> best</span>}
            </div>
          ))}
          {ranked.length > 5 && <div className="sp-more">+{ranked.length - 5}</div>}
          <span className="sp-scan" aria-hidden />
        </div>
        <ul className="sp-list">
          <li style={{ animationDelay: '500ms' }}><Check size={16} /> Sharpest, best-lit pics → biggest spots</li>
          <li style={{ animationDelay: '800ms' }}>
            {facesDone ? <Check size={16} /> : <Loader2 size={16} className="sp-spin" />}
            {facesDone ? (faces > 0 ? `Faces centred in every frame` : 'Smart crop on every frame') : 'Centring faces…'}
          </li>
          <li style={{ animationDelay: '1100ms' }}><Check size={16} /> All on your phone. Nothing uploaded.</li>
        </ul>
        <div className="caption sp-skip">Tap to see your frames</div>
      </div>
    </div>
  );
}
