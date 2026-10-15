/** Four-point sparkle: the ✦ accent used across the UI (not part of the wordmark). */
export function Sparkle({ className, size }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 0c.9 6.4 4.6 10.6 12 12-7.4 1.4-11.1 5.6-12 12-.9-6.4-4.6-10.6-12-12C7.4 10.6 11.1 6.4 12 0Z" />
    </svg>
  );
}

/** "storiyaan": Bricolage 800 with the "aa" in rani Instrument Serif italic, like "story *ready.*". */
export function Wordmark({ href }: { href?: string }) {
  const inner = <>storiy<span className="wm-aa">aa</span>n</>;
  return href
    ? <a className="wordmark left" href={href} aria-label="Storiyaan home">{inner}</a>
    : <span className="wordmark left" role="img" aria-label="Storiyaan">{inner}</span>;
}
