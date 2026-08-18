import { useEffect } from 'react';

/* Adds .in to every .reveal once it scrolls into view — same behaviour as the
   IntersectionObserver in the HTML build, but re-armed whenever `deps` change
   so filtered-in sections still animate. */
export function useReveal(deps = []) {
  useEffect(() => {
    const els = [...document.querySelectorAll('.reveal:not(.in)')];
    if (!els.length) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    /* Reveal anything already in view right away — the observer's first callback
       can lag or be throttled, which would otherwise leave the first fold
       invisible. Only off-screen elements wait for the scroll observer. */
    const vh = window.innerHeight || 0;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh * 0.95) el.classList.add('in');
      else io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
