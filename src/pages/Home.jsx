import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Counter from '../components/Counter.jsx';
import { STATS } from '../data/site.jsx';

/* Landing page: the full-screen hero plus a short "at a glance" band that
   gives the home page substance and routes visitors on to Work / About. */
export default function Home() {
  return (
    <>
      <Hero />
      <section className="soft" id="highlights">
        <div className="wrap">
          <div className="reveal">
            <span className="eyebrow">At a glance</span>
            <h2 className="sec-title">A decade of craft, distilled.</h2>
            <p className="sec-lead">
              From advertising campaigns to fintech product design — here's the shape of the work.
            </p>
          </div>
          <div className="stats-row reveal d2">
            {STATS.map(s => (
              <div className="stat" key={s.label}>
                <Counter to={s.n} plus={s.plus} />
                <div className="lbl">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="hero-cta reveal d3" style={{ marginTop: 44 }}>
            <Link to="/work" className="btn btn-primary">View Work</Link>
            <Link to="/about" className="btn btn-ghost">More About Me</Link>
            <Link to="/contact" className="btn btn-ghost">Get in Touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
