import { useState, type ReactNode } from 'react';
import { Check, Copy, Ellipsis, EllipsisVertical, Plus, Share } from 'lucide-react';
import { SITE_URL } from '../engine/share';
import { iosOtherBrowser, isIOSDevice, promptInstall, useInstall, type InstallMode } from './install';
import { useToast } from './Toast';
import { Sparkle } from './Wordmark';
import './install.css';

interface Props {
  className?: string;
  children: ReactNode;
  /** Called after an accepted prompt or once the guide is opened. */
  onStart?: () => void;
}

/** A button that installs Chamak the best way this browser allows. Renders nothing when installed. */
export function InstallButton({ className, children, onStart }: Props) {
  const { available, mode } = useInstall();
  const [sheet, setSheet] = useState<InstallMode | null>(null);
  const toast = useToast();
  if (!available) return null;

  async function start() {
    onStart?.();
    if (mode === 'prompt') {
      const ok = await promptInstall();
      if (ok) toast('Chamak is on your home screen ✦');
      return;
    }
    setSheet(mode);
  }

  return (
    <>
      <button className={className} onClick={start}>{children}</button>
      {sheet && <InstallGuide mode={sheet} onClose={() => setSheet(null)} />}
    </>
  );
}

function AppTile() {
  return (
    <span className="ig-tile" aria-hidden>
      <Sparkle size={22} />
    </span>
  );
}

export function InstallGuide({ mode, onClose }: { mode: InstallMode; onClose: () => void }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      toast('Link copied');
    } catch {
      toast(SITE_URL.replace('https://', ''));
    }
  };

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet install-sheet" role="dialog" aria-label="Add Chamak to your home screen">
        <div className="grabber" />
        <div className="ig-head">
          <AppTile />
          <div>
            <h2>Chamak on your home screen</h2>
            <p className="caption">Opens like an app. Ready for Dussehra and Diwali. Still no signup.</p>
          </div>
        </div>

        {mode === 'inapp' ? (
          <>
            <p className="ig-note">You're in an in-app browser (Instagram, WhatsApp…), which can't add apps. Open this page in {isIOSDevice ? 'Safari' : 'Chrome'} first:</p>
            <ol className="ig-steps">
              <li>
                <span className="ig-num">1</span>
                <div><b>Tap {isIOSDevice ? '•••' : '⋮'}</b> at the top right</div>
                <span className="ig-key">{isIOSDevice ? <Ellipsis size={18} /> : <EllipsisVertical size={18} />}</span>
              </li>
              <li>
                <span className="ig-num">2</span>
                <div><b>Open in {isIOSDevice ? 'Safari' : 'Chrome'}</b> (or "Open in browser"), then tap Get app there</div>
              </li>
            </ol>
            <button className="btn btn-secondary" onClick={copy}>{copied ? <><Check size={18} /> Copied</> : <><Copy size={18} /> Copy link instead</>}</button>
          </>
        ) : mode === 'ios' ? (
          <ol className="ig-steps">
            <li>
              <span className="ig-num">1</span>
              <div>
                <b>Tap Share</b> {iosOtherBrowser ? 'in the address bar' : 'in Safari’s toolbar'}
                <span className="caption ig-sub">On iOS 26 it's inside the ••• menu</span>
              </div>
              <span className="ig-key"><Share size={18} /></span>
            </li>
            <li>
              <span className="ig-num">2</span>
              <div>
                <b>Add to Home Screen</b>
                <span className="caption ig-sub">Scroll the list if you don't see it, then tap Add</span>
              </div>
              <span className="ig-key"><Plus size={18} /></span>
            </li>
            <li className="ig-arrow" aria-hidden><span>↓ Share is down there</span></li>
          </ol>
        ) : (
          <ol className="ig-steps">
            <li>
              <span className="ig-num">1</span>
              <div><b>Tap ⋮</b> at the top right of Chrome</div>
              <span className="ig-key"><EllipsisVertical size={18} /></span>
            </li>
            <li>
              <span className="ig-num">2</span>
              <div><b>Add to Home screen</b> or <b>Install app</b></div>
              <span className="ig-key"><Plus size={18} /></span>
            </li>
          </ol>
        )}
        <button className="btn btn-ghost" onClick={onClose}>Got it</button>
      </div>
    </>
  );
}
