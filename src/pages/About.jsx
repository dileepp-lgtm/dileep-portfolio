import About from '../components/About.jsx';
import Experience from '../components/Experience.jsx';
import LiquidGlassCover from '../components/LiquidGlassCover.jsx';

/* About Dileep: hero fold with the Liquid Glass metaball effect + bio, stats
   and the career timeline. (Expertise, process and tools live on the home page.) */
export default function AboutPage() {
  return (
    <div className="page">
      <section className="work-cover" aria-label="About Dileep">
        <div className="work-cover__trail">
          <LiquidGlassCover />
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
