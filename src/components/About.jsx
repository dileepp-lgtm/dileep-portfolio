import { ABOUT, STATS } from '../data/site.jsx';
import Counter from './Counter.jsx';

export default function About() {
  return (
    <section id="about">
      <div className="wrap">
        <div className="about-grid">
          <div className="reveal">
            <span className="eyebrow">About</span>
            <h2 className="sec-title">Hi, I'm Dileep — an art director turned fintech visual designer.</h2>
            {ABOUT.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
          <div className="stats reveal d2">
            {STATS.map(s => (
              <div className="stat" key={s.label}>
                <Counter to={s.n} plus={s.plus} />
                <div className="lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
