import { useEffect, useState } from 'react';

/* Only booleans live here — they flip rarely, so re-rendering on them is cheap.
   The progress bar owns its own state in <ScrollProgress /> to avoid a
   full-tree re-render on every scroll frame. */
export function useScrollUi() {
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 12);
        setShowTop(y > window.innerHeight * 0.9);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrolled, showTop };
}
