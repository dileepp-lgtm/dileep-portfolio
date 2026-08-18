import { lazy, Suspense, useEffect, useState } from 'react';

/* Code-split: ogl + the Orb shader only load on the Contact page. Lightweight
   single shader, so it runs everywhere; reduced-motion opts out. */
const Orb = lazy(() => import('./Orb.jsx'));

export default function ContactOrb() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <Orb hue={0} hoverIntensity={0.5} rotateOnHover backgroundColor="#000000" />
    </Suspense>
  );
}
