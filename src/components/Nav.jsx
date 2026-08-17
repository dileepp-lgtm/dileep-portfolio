import { useEffect, useState } from 'react';
import { NAV, PROFILE } from '../data/site.jsx';

export default function Nav({ scrolled, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const dark = theme === 'dark';

  /* highlight the nav item for whichever section is on screen */
  useEffect(() => {
    const secs = document.querySelectorAll('section[id], header[id]');
    if (!secs.length) return;
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) setActive('#' + e.target.id); }),
      { threshold: 0.5 }
    );
    secs.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, []);

  /* Escape closes the mobile menu */
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        const b = document.querySelector('.burger');
        if (b) b.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <nav className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="wrap">
        <a href="#home" className="brand">Dileep P<span>.</span></a>
        <div className={'nav-links' + (open ? ' show' : '')} id="nav-links">
          {NAV.map(n => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}
               style={active === n.href ? { color: 'var(--text)' } : undefined}>{n.label}</a>
          ))}
        </div>
        <div className="nav-right">
          <button className="theme-btn" type="button" onClick={onToggleTheme}
                  aria-pressed={dark} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
          </button>
          <a href="#contact" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>Send Inquiry</a>
          <button className="burger" type="button" onClick={() => setOpen(o => !o)}
                  aria-expanded={open} aria-controls="nav-links"
                  aria-label={open ? 'Close menu' : 'Open menu'}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
