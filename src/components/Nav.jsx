import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { NAV } from '../data/site.jsx';

export default function Nav({ scrolled, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false);
  const dark = theme === 'dark';

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

  const linkStyle = ({ isActive }) => (isActive ? { color: 'var(--text)' } : undefined);

  return (
    <nav className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="wrap">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>Dileep P<span>.</span></Link>
        <div className={'nav-links' + (open ? ' show' : '')} id="nav-links">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
                     onClick={() => setOpen(false)} style={linkStyle}>{n.label}</NavLink>
          ))}
        </div>
        <div className="nav-right">
          <button className="theme-btn" type="button" onClick={onToggleTheme}
                  aria-pressed={dark} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
          </button>
          <Link to="/contact" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>Send Inquiry</Link>
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
