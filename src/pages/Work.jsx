import { useState } from 'react';
import Work from '../components/Work.jsx';
import FluidGlassCover from '../components/FluidGlassCover.jsx';
import { FILTERS } from '../data/work.js';

export default function WorkPage({ onOpenDeck }) {
  const [cat, setCat] = useState('all');

  /* pick a discipline, then drop into the gallery to see the results */
  const pick = c => {
    setCat(c);
    const el = document.getElementById('work');
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: el.offsetTop - 130, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="page">
      <section className="work-cover" aria-label="Selected work">
        <FluidGlassCover />
        <div className="work-cover__filters gallery-nav gallery-nav--cover"
             role="group" aria-label="Filter work by discipline">
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
      </section>

      <Work onOpenDeck={onOpenDeck} cat={cat} onPick={pick} hideHeader hideFilters />
    </div>
  );
}
