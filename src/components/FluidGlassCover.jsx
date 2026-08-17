import { lazy, Suspense, useEffect, useRef, useState } from 'react';

/* Code-split: the ~1MB of three/r3f/drei only downloads when this mounts
   (desktop). Fills its parent (the Work hero). */
const FluidGlass = lazy(() => import('./FluidGlass.jsx'));

export default function FluidGlassCover() {
  const [enabled, setEnabled] = useState(false);
  const ref = useRef(null);

  /* WebGL is heavy and pointer-driven, so run the live lens only on a real
     pointer + roomy viewport; touch/mobile gets a lightweight branded band. */
  useEffect(() => {
    setEnabled(matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches);
  }, []);

  /* R3F can mount at the default 300x150 and skip a re-measure. The canvas
     arrives asynchronously (lazy chunk + Suspense), so nudge a resize a few
     times after enabling to catch it once mounted, and again whenever the
     hero scrolls back into view. */
  useEffect(() => {
    if (!enabled) return;
    const bump = () => window.dispatchEvent(new Event('resize'));
    const timers = [250, 600, 1200, 2000].map(d => setTimeout(bump, d));
    let io;
    if (ref.current) {
      io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) bump(); }, { threshold: 0.01 });
      io.observe(ref.current);
    }
    return () => { timers.forEach(clearTimeout); io && io.disconnect(); };
  }, [enabled]);

  return (
    <div ref={ref} className="fluid-fill">
      {enabled ? (
        <Suspense fallback={<div className="fluid-fallback"><span>Dileep P</span></div>}>
          {/* pages=1 keeps the hero from hijacking page scroll */}
          <FluidGlass
            mode="lens"
            pages={1}
            lensProps={{ scale: 0.25, ior: 1.15, thickness: 5, chromaticAberration: 0.1, anisotropy: 0.01 }}
          />
        </Suspense>
      ) : (
        <div className="fluid-fallback"><span>Dileep P</span></div>
      )}
    </div>
  );
}
