import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import DeckViewer from './components/DeckViewer.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import Agent from './components/Agent.jsx';
import Home from './pages/Home.jsx';
import AboutPage from './pages/About.jsx';
import WorkPage from './pages/Work.jsx';
import ContactPage from './pages/Contact.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useReveal } from './hooks/useReveal.js';
import { useScrollUi } from './hooks/useScrollUi.js';

/* The three canvas effects are the same vanilla modules as the HTML build.
   They attach themselves to window, so a side-effect import is enough. */
import './effects/cursor-grid.js';
import './effects/border-glow.js';
import './effects/splash-cursor.js';

const hasMouse = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

export default function App() {
  const { theme, toggle } = useTheme();
  const { scrolled, showTop } = useScrollUi();
  const [deck, setDeck] = useState(null);
  const { pathname } = useLocation();

  /* re-arm reveal animations whenever the page changes or the viewer closes */
  useReveal([pathname, deck]);

  const openDeck = useCallback((key, cols) => setDeck({ key, cols }), []);
  const closeDeck = useCallback(() => setDeck(null), []);

  /* jump to the top on every navigation (each menu item is its own page) */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  /* SplashCursor is a global full-viewport fluid overlay — mount it once.
     Pointer-driven, so it's skipped entirely on touch devices. */
  useEffect(() => {
    if (!hasMouse() || !window.SplashCursor) return;
    const splash = window.SplashCursor.mount({
      RAINBOW_MODE: false, COLOR: '#2592F6', SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1024, DENSITY_DISSIPATION: 4.2, VELOCITY_DISSIPATION: 2,
      PRESSURE: 0.1, PRESSURE_ITERATIONS: 20, CURL: 3, SPLAT_RADIUS: 0.18,
      SPLAT_FORCE: 6000, SHADING: true, zIndex: 50
    });
    return () => { if (splash && splash.destroy) splash.destroy(); };
  }, []);

  /* CursorGrid lives on the hero (Home only) and BorderGlow decorates the
     cards — both depend on the current page's DOM, so re-init on navigation. */
  useEffect(() => {
    if (!hasMouse()) return;
    let grid = null, glow = null;
    const hero = document.getElementById('home');
    if (hero && window.CursorGrid) {
      grid = window.CursorGrid.mount(hero, {
        cellSize: 70, color: '#7FC4FF', radius: 170, falloff: 'smooth',
        holdTime: 400, fadeDuration: 900, lineWidth: 1.2, maxOpacity: 0.85,
        fillOpacity: 0.05, gridOpacity: 0.05, cellRadius: 4,
        clickPulse: true, pulseSpeed: 620
      });
    }
    if (window.BorderGlow) {
      glow = window.BorderGlow.init('.dcard, .acard, .vcard, .agent-panel');
    }
    return () => {
      if (grid && grid.destroy) grid.destroy();
      if (glow && glow.destroy) glow.destroy();
    };
  }, [pathname]);

  const toTop = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    const brand = document.querySelector('.brand');
    if (brand) brand.focus({ preventScroll: true });
  };

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <ScrollProgress />

      <Nav scrolled={scrolled} theme={theme} onToggleTheme={toggle} />

      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/work" element={<WorkPage onOpenDeck={openDeck} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <button className={'to-top' + (showTop ? ' show' : '')} type="button"
              aria-label="Back to top" onClick={toTop}>↑</button>

      <DeckViewer key={deck ? deck.key : "closed"} deck={deck} onClose={closeDeck} />
      <Agent />
    </>
  );
}
