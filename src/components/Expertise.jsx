import { EXPERTISE } from '../data/site.jsx';

export default function Expertise() {
  return (
    <section id="expertise" className="soft">
      <div className="wrap">
        <div className="reveal">
          <span className="eyebrow">Creative Expertise</span>
          <h2 className="sec-title">End-to-end, from strategy to pixels.</h2>
        </div>
        <div className="exp-grid reveal">
          {EXPERTISE.map((e, i) => (
            <div className="exp" key={e}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span> {e}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
