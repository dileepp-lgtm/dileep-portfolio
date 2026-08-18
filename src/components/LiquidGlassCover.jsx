import { useEffect, useRef, useState } from 'react';

/* Mounts the Liquid Glass metaball effect into a div that fills the cover.
   The effect (and three) are code-split and only loaded on desktop pointers;
   touch/mobile keeps the plain dark cover + title. */
export default function LiquidGlassCover() {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches);
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
