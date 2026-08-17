import { useState } from 'react';
import { FILTERS, SECTIONS } from '../data/work.js';
import DeckCard from './DeckCard.jsx';
import Motion from './Motion.jsx';
import Agency from './Agency.jsx';

export default function Work({ onOpenDeck, hideHeader = false }) {
  const [cat, setCat] = useState('all');

  const pick = c => {
    setCat(c);
    const el = document.getElementById('work');
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: el.offsetTop - 130, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section id="work" style={{ paddingBottom: 0 }}>
      {!hideHeader && (
        <div className="wrap">
          <div className="reveal">
            <span className="eyebrow">Selected Work</span>
            <h2 className="sec-title">A gallery of the craft.</h2>
            <p className="sec-lead">
              Organized by discipline and product. Click any cover to open the full set
              full screen and scroll through every page.
            </p>
          </div>
        </div>
      )}

      <div className="gallery-nav" role="group" aria-label="Filter work by discipline">
        <div className="wrap">
          {FILTERS.map(f => (
            <button key={f.cat} type="button"
                    className={'gfilter' + (cat === f.cat ? ' active' : '')}
                    aria-pressed={cat === f.cat}
                    onClick={() => pick(f.cat)}
                    dangerouslySetInnerHTML={{ __html: f.label }} />
          ))}
        </div>
      </div>

      {SECTIONS.map(s => {
        const hidden = !(cat === 'all' || cat === s.cat);
        if (s.cat === 'motion') return <Motion key={s.cat} section={s} hidden={hidden} />;
        if (s.cat === 'agency') return <Agency key={s.cat} section={s} hidden={hidden} />;
        return (
          <div className={'project' + (hidden ? ' hide' : '')} data-cat={s.cat} key={s.kicker}>
            <div className="wrap">
              <div className="project-head reveal">
                <div>
                  <span className="pt" dangerouslySetInnerHTML={{ __html: s.kicker }} />
                  <h2 dangerouslySetInnerHTML={{ __html: s.title }} />
                </div>
                <div className="pmeta" dangerouslySetInnerHTML={{ __html: s.meta }} />
              </div>
              <div className="deck-grid reveal">
                {s.cards.map(c => <DeckCard key={c.key} card={c} onOpen={onOpenDeck} />)}
              </div>
              {s.note && <p className="agency-note reveal" dangerouslySetInnerHTML={{ __html: s.note }} />}
            </div>
          </div>
        );
      })}
    </section>
  );
}
