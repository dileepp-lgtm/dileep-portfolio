import { useCallback, useEffect, useRef, useState } from 'react';
import { DECKS, DECK_NAMES } from '../data/work.js';

/* Full-screen scrolling viewer. Landscape pages span the full width, square /
   portrait ones pair up two-per-row (same rule as the HTML build). */
export default function DeckViewer({ deck, onClose }) {
  const scrollRef = useRef(null);
  const innerRef = useRef(null);
  const lastFocus = useRef(null);
  const [progress, setProgress] = useState(0);
  const [page, setPage] = useState(1);

  const pages = deck ? DECKS[deck.key] || [] : [];
  const name = deck ? DECK_NAMES[deck.key] || 'Deck' : '';
  const open = !!deck;

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    setPage(1); setProgress(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    const t = setTimeout(() => scrollRef.current && scrollRef.current.focus({ preventScroll: true }), 40);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
      if (lastFocus.current && lastFocus.current.focus) lastFocus.current.focus();
    };
  }, [open, deck]);

  const ticking = useRef(false);
  const onScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => { ticking.current = false; measure(); });
  }, []);

  const measure = () => {
    const el = scrollRef.current, inner = innerRef.current;
    if (!el || !inner) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    const imgs = inner.querySelectorAll('img');
    let cur = 1;
    imgs.forEach((img, i) => {
      if (img.offsetTop - inner.offsetTop - el.scrollTop <= el.clientHeight * 0.45) cur = i + 1;
    });
    setPage(cur);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      const el = scrollRef.current;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab') {                       // keep focus inside the dialog
        const box = el.closest('.dv');
        const f = box ? box.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])') : [];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
      }
      if (!el) return;
      if (e.key === 'PageDown' || e.key === 'ArrowDown') { e.preventDefault(); el.scrollBy({ top: el.clientHeight * 0.9, behavior: 'smooth' }); }
      if (e.key === 'PageUp'   || e.key === 'ArrowUp')   { e.preventDefault(); el.scrollBy({ top: -el.clientHeight * 0.9, behavior: 'smooth' }); }
      if (e.key === 'Home') { e.preventDefault(); el.scrollTo({ top: 0, behavior: 'smooth' }); }
      if (e.key === 'End')  { e.preventDefault(); el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* landscape pages get .wide once their real dimensions are known */
  const markWide = e => {
    const img = e.currentTarget;
    if (img.naturalWidth / img.naturalHeight > 1.25) img.classList.add('wide');
  };

  return (
    <div className={'dv' + (open ? ' open' : '')} role="dialog" aria-modal="true"
         aria-label={name || 'Deck viewer'} tabIndex={-1}>
      <div className="dv-bar">
        <h2 className="dvt">{name}</h2>
        <span className="dvc">{pages.length ? `${page} / ${pages.length}` : ''}</span>
        <button className="dv-x" type="button" aria-label="Close viewer" onClick={onClose}>×</button>
      </div>
      <div className="dv-progress" aria-hidden="true"><span style={{ width: progress + '%' }} /></div>
      <div className="dv-scroll" tabIndex={0} ref={scrollRef} onScroll={onScroll}>
        <div className={'dv-inner' + (deck && deck.cols === '2' ? ' two' : '')} ref={innerRef}>
          {open && pages.map((p, i) => (
            <img key={p} src={p} alt={`${name} — page ${i + 1}`}
                 loading={i < 4 ? 'eager' : 'lazy'} onLoad={markWide} />
          ))}
        </div>
      </div>
    </div>
  );
}
