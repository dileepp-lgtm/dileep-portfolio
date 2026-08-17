import { useState } from 'react';
import Work from '../components/Work.jsx';
import ImageTrail from '../components/ImageTrail.jsx';
import FluidGlassSection from '../components/FluidGlassSection.jsx';
import { FILTERS } from '../data/work.js';

/* A curated set of Dileep's own covers (local assets — no hotlink issues) that
   trail behind the cursor across the Work page header. */
const TRAIL_IMAGES = [
  '/assets/img/covers/deck_card.jpg',
  '/assets/img/covers/deck_zw.jpg',
  '/assets/img/covers/deck_hdfc.jpg',
  '/assets/img/covers/deck_hsbc.jpg',
  '/assets/img/covers/deck_sbi.jpg',
  '/assets/img/covers/deck_sc.jpg',
  '/assets/img/covers/deck_zsd.jpg',
  '/assets/img/covers/zw_car.jpg',
  '/assets/img/covers/zw_social.jpg',
  '/assets/img/ads-cover.jpg',
  '/assets/img/brand-cover.jpg',
  '/assets/img/car-cover.jpg'
];

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
        <div className="work-cover__trail">
          <ImageTrail items={TRAIL_IMAGES} variant={1} />
        </div>
        <div className="work-cover__title">
          <h1 className="sec-title">A gallery of the craft.</h1>
          <div className="gallery-nav gallery-nav--cover" role="group" aria-label="Filter work by discipline">
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
        </div>
      </section>

      <Work onOpenDeck={onOpenDeck} cat={cat} onPick={pick} hideHeader hideFilters />

      <FluidGlassSection />
    </div>
  );
}
