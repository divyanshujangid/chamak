import { useEffect, useMemo, useState } from 'react';
import { Camera, ChevronLeft, Download, Lock, Share2, X } from 'lucide-react';
import { assign } from '../engine/assign';
import { exportJpeg, exportName } from '../engine/export';
import { download, isIOS, shareImage, shareText, whatsappTextLink } from '../engine/share';
import { byId, HAS_BONUS } from '../templates';
import { useProject } from '../state/project';
import { isUnlocked, recordDownload, recordShare, unlockState } from './store';
import { useToast } from './Toast';
import { InstallButton } from './InstallSheet';
import { markNudgeSeen, nudgeSeen, useInstall } from './install';
import { usePhotoImport } from './usePhotoImport';
import { Sparkle } from './Wordmark';
import './done.css';

export function Done() {
  const { state, dispatch } = useProject();
  const toast = useToast();
  const t = byId.get(state.templateId!)!;
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [, bump] = useState(0);
  const [won, setWon] = useState(false);
  const [nudgeOff, setNudgeOff] = useState(nudgeSeen);
  const install = useInstall();
  // Demo mode: swap the samples for the user's own pics and go straight back to edit this frame.
  const mine = usePhotoImport({
    replace: true,
    onDone: (all) => {
      dispatch({ type: 'SET_TEMPLATE', templateId: t.id, assignments: assign(t, all) });
      dispatch({ type: 'SET_STEP', step: 'edit' });
    },
  });
  const photos = useMemo(() => new Map(state.photos.map((p) => [p.id, p])), [state.photos]);
  const name = exportName(t);

  useEffect(() => {
    let alive = true;
    let made: string | null = null;
    setBlob(null);
    setError(false);
    exportJpeg(t, state.assignments, photos, state.badge)
      .then((b) => {
        if (!alive) return;
        made = URL.createObjectURL(b);
        setBlob(b);
        setUrl(made);
      })
      .catch(() => alive && setError(true));
    return () => { alive = false; if (made) URL.revokeObjectURL(made); };
  }, [t, state.assignments, photos, state.badge]);

  const afterCount = (wasUnlocked: boolean) => {
    if (!wasUnlocked && isUnlocked()) toast('4 bonus frames unlocked 🎉');
    setWon(true);
    bump((n) => n + 1);
  };

  async function onSave() {
    if (!blob) return;
    const was = isUnlocked();
    if (isIOS) {
      const r = await shareImage(blob, name);
      if (r === 'shared') { recordDownload(); afterCount(was); }
      else if (r === 'blocked') toast('Tap Save again');
      else if (r === 'unsupported' || r === 'failed') { download(blob, name); recordDownload(); toast('Saved to your downloads'); afterCount(was); }
    } else {
      download(blob, name);
      recordDownload();
      toast('Saved to your downloads');
      afterCount(was);
    }
  }

  async function onShare() {
    if (!blob) return;
    const was = isUnlocked();
    const r = await shareImage(blob, name, shareText());
    if (r === 'shared') { recordShare(); afterCount(was); }
    else if (r === 'blocked') toast('Tap Share again');
    else if (r === 'failed') { download(blob, name); toast('Sharing failed, so we saved it to your downloads'); }
    else if (r === 'unsupported') window.open(whatsappTextLink(shareText()), '_blank');
  }

  const u = unlockState();
  const unlocked = isUnlocked();

  return (
    <div className="done">
      <header className="topbar">
        <button className="left iconbtn" onClick={() => dispatch({ type: 'SET_STEP', step: 'edit' })}><ChevronLeft size={20} /> Edit</button>
        <h1>Story ready <span className="h1-spark"><Sparkle size={14} /></span></h1>
        <span />
      </header>

      <div className="result">
        {url && !error ? (
          <img src={url} alt={`Your ${t.name} frame`} />
        ) : error ? (
          <div className="result-msg">
            <p>Couldn't render on this phone. Try fewer photos.</p>
            <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_STEP', step: 'edit' })}>Back to edit</button>
          </div>
        ) : (
          <div className="result-msg"><div className="spinner" />Rendering HD…</div>
        )}
      </div>

      <div className="actions">
        {state.demo && (
          <button className="btn btn-pink" onClick={mine.open}>
            <Camera size={20} /> Now make it with my pics
          </button>
        )}
        <button className="btn btn-primary" disabled={!blob} onClick={onSave}>
          <Download size={20} /> {isIOS ? 'Save to Photos' : 'Download HD'}
        </button>
        <button className="btn btn-wa" disabled={!blob} onClick={onShare}>
          <Share2 size={20} /> Share on WhatsApp
        </button>

        {won && !nudgeOff && install.available && (
          <div className="install-nudge" role="status">
            <span className="ig-tile" aria-hidden><img src="/icons/icon-192.png?v=3" alt="" width={40} height={40} /></span>
            <p><b>Keep Storiyaan on your home screen</b>Diwali frames drop soon. One tap, no app store.</p>
            <InstallButton className="nudge-go" onStart={() => { markNudgeSeen(); }}>Add</InstallButton>
            <button className="nudge-x" aria-label="Not now" onClick={() => { markNudgeSeen(); setNudgeOff(true); }}><X size={16} /></button>
          </div>
        )}

        <label className="toggle">
          <input type="checkbox" checked={state.badge} onChange={() => dispatch({ type: 'TOGGLE_BADGE' })} />
          <span className="switch" />
          <span>Add a small “made with storiyaan” tag (helps friends find us)</span>
        </label>

        {HAS_BONUS && !unlocked && (
          <div className="unlock">
            <Lock size={16} />
            <span>4 bonus frames · {Math.min(u.shares, 1)}/1 share or {Math.min(u.downloads, 3)}/3 downloads</span>
          </div>
        )}

        <div className="again">
          <button className="btn btn-ghost" onClick={() => dispatch({ type: 'SET_STEP', step: 'pick' })}>Make another</button>
          <button className="btn btn-ghost" onClick={() => dispatch({ type: 'RESET' })}>New photos</button>
        </div>
      </div>
      {mine.input}
      {mine.overlay}
    </div>
  );
}
