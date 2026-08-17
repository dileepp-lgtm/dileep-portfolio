import { lazy, Suspense, useEffect, useRef, useState } from 'react';

/* Code-split: the ~1MB of three/r3f/drei only downloads when this section
   actually mounts (desktop). */
const FluidGlass = lazy(() => import('./FluidGlass.jsx'));

export default function FluidGlassSection() {
  const [enabled, setEnabled] = useState(false);
  const ref = useRef(null);

  /* WebGL + internal scroll are heavy and don't suit touch, so run the live
     effect only on a real pointer + roomy viewport; everyone else gets a
     lightweight branded band. */
  useEffect(() => {
    setEnabled(matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches);
  }, []);

  /* R3F can mount off-screen (Suspense) at the default 300x150 and never
     re-measure, leaving a blurry stretched canvas. Dispatch a resize when the
     section scrolls into view so the canvas fills its container. */
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const io = new IntersectionObserver(
      es => { if (es.some(e => e.isIntersecting)) window.dispatchEvent(new Event('resize')); },
      { threshold: 0.01 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [enabled]);

  return (
    <section ref={ref} className="fluid-showcase" aria-label="Interactive glass showcase">
      {enabled ? (
        <Suspense fallback={<div className="fluid-showcase__fallback"><span>Dileep P</span></div>}>
          <FluidGlass
            mode="lens"
            lensProps={{ scale: 0.25, ior: 1.15, thickness: 5, chromaticAberration: 0.1, anisotropy: 0.01 }}
          />
        </Suspense>
      ) : (
        <div className="fluid-showcase__fallback"><span>Dileep P</span></div>
      )}
    </section>
  );
}
