import { useEffect, useRef } from 'react';

/* Writes straight to the DOM node, like the original did, so a scroll never
   re-renders the app tree. */
export default function ScrollProgress() {
  const bar = useRef(null);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar.current) bar.current.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" aria-hidden="true"><span ref={bar} /></div>;
}
