import { useCallback, useEffect, useState } from 'react';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Experience from './components/Experience.jsx';
import Work from './components/Work.jsx';
import Expertise from './components/Expertise.jsx';
import Process from './components/Process.jsx';
import Tools from './components/Tools.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import DeckViewer from './components/DeckViewer.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import Agent from './components/Agent.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useReveal } from './hooks/useReveal.js';
import { useScrollUi } from './hooks/useScrollUi.js';

/* The three canvas effects are the same vanilla modules as the HTML build.
   They attach themselves to window, so a side-effect import is enough. */
import './effects/cursor-grid.js';
import './effects/border-glow.js';
import './effects/splash-cursor.js';

export default function App() {
  const { theme, toggle } = useTheme();
  const { scrolled, showTop } = useScrollUi();
  const [deck, setDeck] = useState(null);

  useReveal([deck]);          // re-arm reveals when the viewer closes

  const openDeck = useCallback((key, cols) => setDeck({ key, cols }), []);
  const closeDeck = useCallback(() => setDeck(null), []);

  /* mount the canvas effects once the DOM exists */
  useEffect(() => {
    const hero = document.getElementById('home');
    let grid = null, splash = null;
    if (hero && window.CursorGrid) {
      grid = window.CursorGrid.mount(hero, {
        cellSize: 70, color: '#7FC4FF', radius: 170, falloff: 'smooth',
        holdTime: 400, fadeDuration: 900, lineWidth: 1.2, maxOpacity: 0.85,
        fillOpacity: 0.05, gridOpacity: 0.05, cellRadius: 4,
        clickPulse: true, pulseSpeed: 620
      });
    }
    if (window.SplashCursor) {
      splash = window.SplashCursor.mount({
        RAINBOW_MODE: false, COLOR: '#2592F6', SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 1024, DENSITY_DISSIPATION: 4.2, VELOCITY_DISSIPATION: 2,
        PRESSURE: 0.1, PRESSURE_ITERATIONS: 20, CURL: 3, SPLAT_RADIUS: 0.18,
        SPLAT_FORCE: 6000, SHADING: true, zIndex: 50
      });
    }
    return () => {
      if (grid && grid.destroy) grid.destroy();
      if (splash && splash.destroy) splash.destroy();
    };
  }, []);

  /* BorderGlow needs the cards in the DOM, so run it after the gallery paints */
  useEffect(() => {
    if (!window.BorderGlow) return;
    const glow = window.BorderGlow.init('.dcard, .acard, .vcard, .agent-panel');
    return () => { if (glow && glow.destroy) glow.destroy(); };
  }, []);

  const toTop = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    const brand = document.querySelector('.brand');
    if (brand) brand.focus({ preventScroll: true });
  };

  return (
    <>
      <a className="skip" href="#work">Skip to work</a>
      <ScrollProgress />

      <Nav scrolled={scrolled} theme={theme} onToggleTheme={toggle} />
      <Hero />
      <About />
      <Experience />
      <Work onOpenDeck={openDeck} />
      <Expertise />
      <Process />
      <Tools />
      <Contact />
      <Footer />

      <button className={'to-top' + (showTop ? ' show' : '')} type="button"
              aria-label="Back to top" onClick={toTop}>↑</button>

      <DeckViewer key={deck ? deck.key : "closed"} deck={deck} onClose={closeDeck} />
      <Agent />
    </>
  );
}
