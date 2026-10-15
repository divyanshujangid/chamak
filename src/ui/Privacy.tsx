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
        <p>Storiyaan runs entirely in your browser. There is no server, no database and no upload. Your photos are read into your phone's memory, drawn into the frame on your phone, and saved to your phone. Close the tab and they are gone.</p>
        <h3>What we store</h3>
        <p>One small setting in your browser's local storage, remembering whether you have unlocked bonus frames and seen the swipe hint. No cookies. No accounts.</p>
        <h3>Analytics</h3>
        <p>We use PostHog (EU servers) to count simple steps: page opened, sample pics tried, frame picked, story saved or shared, and which banner or link brought you here. No cookies, no screen recording, no names. Your photos are never sent, only things like the frame name and how many photos you used.</p>
        <h3>The art</h3>
        <p>Every frame is drawn in code by us. No images are taken from anywhere. Fonts are open-source (SIL Open Font License).</p>
        <h3>Contact</h3>
        <p>Made in India by Divyanshu. Questions: <a href="mailto:divyanshujangid.todoit@gmail.com">divyanshujangid.todoit@gmail.com</a></p>
      </article>
    </div>
  );
}
