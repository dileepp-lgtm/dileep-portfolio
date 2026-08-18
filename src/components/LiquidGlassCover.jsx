import { useEffect, useRef, useState } from 'react';

/* Mounts the Liquid Glass metaball effect into a div that fills the cover.
   The effect (and three) are code-split. It's a single lightweight shader, so
   it runs on mobile too (touch-interactive + auto-animates); only reduced-motion
   opts out. */
export default function LiquidGlassCover() {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    let destroy = null;
    let cancelled = false;
    import('../effects/liquidGlass.js').then(({ createLiquidGlass }) => {
      if (cancelled || !ref.current) return;
      destroy = createLiquidGlass(ref.current);
    });
    return () => { cancelled = true; if (destroy) destroy(); };
  }, [enabled]);

  return <div ref={ref} className="liquid-fill" />;
}
