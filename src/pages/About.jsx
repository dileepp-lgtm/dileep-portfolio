import About from '../components/About.jsx';
import Experience from '../components/Experience.jsx';
import ImageTrail from '../components/ImageTrail.jsx';

/* A different curated set of Dileep's own covers for the About hero trail. */
const TRAIL_IMAGES = [
  '/assets/img/ads-cover.jpg',
  '/assets/img/brand-cover.jpg',
  '/assets/img/broc-cover.jpg',
  '/assets/img/car-cover.jpg',
  '/assets/img/ads-01.jpg',
  '/assets/img/ads-05.jpg',
  '/assets/img/brand-01.jpg',
  '/assets/img/brand-03.jpg',
  '/assets/img/covers/deck_hdfc.jpg',
  '/assets/img/covers/deck_hsbc.jpg',
  '/assets/img/covers/vid_hackathon.jpg',
  '/assets/img/covers/vid_openfilm.jpg'
];

/* About Dileep: hero fold (same style as the Work cover) + bio, stats and the
   career timeline. (Expertise, process and tools live on the home page.) */
export default function AboutPage() {
  return (
    <div className="page">
      <section className="work-cover" aria-label="About Dileep">
        <div className="work-cover__trail">
          <ImageTrail items={TRAIL_IMAGES} variant={1} />
        </div>
        <div className="work-cover__title">
          <h1 className="sec-title">The story behind the craft.</h1>
        </div>
      </section>

      <About />
      <Experience />
    </div>
  );
}
