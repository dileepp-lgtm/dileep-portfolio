import { lazy, Suspense, useEffect, useRef, useState } from 'react';

/* Code-split: the ~1MB of three/r3f/drei only downloads when this mounts
   (desktop). Fills its parent (the Work hero). */
const FluidGlass = lazy(() => import('./FluidGlass.jsx'));

const TITLE = 'A gallery of the craft.';

/* HTML title used while the 3D scene loads and as the touch/mobile fallback —
   keeps the exact cover design (dark + gradient headline) without the WebGL. */
function TitleFallback() {
  return (
    <div className="fluid-fallback">
      <h1 className="sec-title">{TITLE}</h1>
    </div>
  );
}

export default function FluidGlassCover() {
  const [enabled, setEnabled] = useState(false);
  const ref = useRef(null);

  /* WebGL is heavy and pointer-driven, so run the live lens only on a real
     pointer + roomy viewport; touch/mobile keeps the plain title. */
  useEffect(() => {
    setEnabled(matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches);
  }, []);

  /* R3F can mount at the default 300x150 and skip a re-measure. The canvas
     arrives asynchronously (lazy chunk + Suspense), so nudge a resize a few
     times after enabling to catch it once mounted, and again when the hero
     scrolls into view. */
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
        <Suspense fallback={<TitleFallback />}>
          {/* dark scene + the title as 3D text so the lens refracts it; no
             stock images; pages=1 so the hero doesn't hijack page scroll */}
          <FluidGlass
            mode="lens"
            pages={1}
            background="#0b0b0f"
            text={TITLE}
            textColor="#8ea0ff"
            textFontScale={0.55}
            textY={0.45}
            showImages={false}
            lensProps={{ scale: 0.25, ior: 1.15, thickness: 5, chromaticAberration: 0.1, anisotropy: 0.01 }}
          />
        </Suspense>
      ) : (
        <TitleFallback />
      )}
    </div>
  );
}
