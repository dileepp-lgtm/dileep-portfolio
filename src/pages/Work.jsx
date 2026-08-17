import Work from '../components/Work.jsx';
import ImageTrail from '../components/ImageTrail.jsx';

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

/* The full gallery — decks, agency covers and motion videos, with the
   discipline filter. Opening a cover is handled by the shared DeckViewer
   mounted in App, via the onOpenDeck handler passed down here. */
export default function WorkPage({ onOpenDeck }) {
  return (
    <div className="page">
      <section className="work-cover" aria-label="Selected work">
        <div className="work-cover__trail">
          <ImageTrail items={TRAIL_IMAGES} variant={1} />
        </div>
        <div className="work-cover__title">
          <span className="eyebrow">Selected Work</span>
          <h1 className="sec-title">A gallery of the craft.</h1>
          <p className="sec-lead">
            Move your cursor across to reveal the work — then scroll for the full collection.
          </p>
        </div>
      </section>

      <Work onOpenDeck={onOpenDeck} hideHeader />
    </div>
  );
}
