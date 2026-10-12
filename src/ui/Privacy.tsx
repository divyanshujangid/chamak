import { ChevronLeft } from 'lucide-react';

export function Privacy() {
  return (
    <div className="privacy">
      <header className="topbar">
        <a className="left iconbtn" href="/"><ChevronLeft size={20} /> Back</a>
        <h1>Privacy</h1>
        <span />
      </header>
      <article>
        <h2>Your photos never leave your phone.</h2>
        <p>Chamak runs entirely in your browser. There is no server, no database and no upload. Your photos are read into your phone's memory, drawn into the frame on your phone, and saved to your phone. Close the tab and they are gone.</p>
        <h3>What we store</h3>
        <p>One small setting in your browser's local storage, remembering whether you have unlocked bonus frames and seen the swipe hint. No cookies. No accounts.</p>
        <h3>Analytics</h3>
        <p>We count page views with Cloudflare Web Analytics, which uses no cookies and does not identify you.</p>
        <h3>The art</h3>
        <p>Every frame is drawn in code by us. No images are taken from anywhere. Fonts are open-source (SIL Open Font License).</p>
        <h3>Contact</h3>
        <p>Made in India by Divyanshu. Questions: <a href="mailto:divyanshujangid.todoit@gmail.com">divyanshujangid.todoit@gmail.com</a></p>
      </article>
    </div>
  );
}
