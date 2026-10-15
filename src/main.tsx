import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/space-mono/latin-700.css';
import '@fontsource/yatra-one/devanagari-400.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/privacy.css';
import './ui/install'; // captures beforeinstallprompt before React mounts
import App from './App';
import { initAnalytics } from './analytics';

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline shell + art cache. Production only, so dev never serves stale modules.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* app works without it */ });
  });
}
