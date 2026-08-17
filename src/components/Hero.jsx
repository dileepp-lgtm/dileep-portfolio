import { Link } from 'react-router-dom';
import { PROFILE } from '../data/site.jsx';

export default function Hero() {
  return (
    <header className="hero2 has-photo" id="home">
      <div className="hero-photo" role="img" aria-label="Portrait of Dileep P" />
      <div className="hero-veil" />
      <div className="wrap">
        <div className="hero-copy">
          <div className="hero-name reveal"><span className="line" /> {PROFILE.name} — {PROFILE.role}</div>
          <h1 className="reveal d1">{PROFILE.headline[0]}<br /><em>{PROFILE.headline[1]}</em></h1>
          <p className="hero-sub reveal d2">{PROFILE.sub}</p>
          <div className="hero-facts reveal d2">
            <span className="f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg> {PROFILE.location}</span>
            <span className="f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> {PROFILE.company}</span>
            <span className="f"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/></svg> 13+ years · 6+ products</span>
          </div>
          <div className="hero-badges reveal d3">
            <span className="pill"><span className="dot" />Available for work</span>
            <span className="pill a">Freelance</span>
            <span className="pill b">Full-Time</span>
          </div>
          <div className="hero-cta reveal d3">
            <Link to="/work" className="btn btn-primary">View Work</Link>
            <a href={PROFILE.resume} download className="btn btn-ghost">Download Resume</a>
            <Link to="/contact" className="btn btn-ghost">Contact Me</Link>
          </div>
        </div>
      </div>
      <Link to="/about" className="scroll-cue" aria-label="Go to About"><span className="m" />About</Link>
    </header>
  );
}
