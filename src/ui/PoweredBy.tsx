import './powered.css';

/** Creator credit: "Powered by ToDo IT" with the studio's logo (light version for the dark UI). */
export function PoweredBy() {
  return (
    <div className="powered">
      <span>Powered by</span>
      <img src="/brand/todoit-light.png" alt="ToDo IT" width={70} height={30} loading="lazy" />
    </div>
  );
}
