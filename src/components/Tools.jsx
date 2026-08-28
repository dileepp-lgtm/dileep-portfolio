import { useEffect, useState } from 'react';
import { TOOLS } from '../data/site.jsx';
import ShapeBlur from './ShapeBlur.jsx';

/* the ShapeBlur reveal follows the pointer, so it only makes sense (and is only
   worth the WebGL cost) on a real desktop pointer + roomy viewport */
const canBlur = () =>
  matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches &&
  !matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Tools() {
  const [blur, setBlur] = useState(false);
  useEffect(() => { setBlur(canBlur()); }, []);

  return (
    <section id="tools" className="soft">
      <div className="wrap">
        <div className="reveal">
          <span className="eyebrow">Tools</span>
          <h2 className="sec-title">The stack behind the work.</h2>
        </div>
        <div className="tools-grid reveal">
          {TOOLS.map(t => (
            <div className="tool" key={t.name}>
              {blur && (
                <div className="tool-blur" aria-hidden="true">
                  <ShapeBlur
                    variation={0}
                    shapeSize={0.86}
                    roundness={0.42}
                    borderSize={0.045}
                    circleSize={0.35}
                    circleEdge={0.6}
                  />
                </div>
              )}
              <div className="ico" style={{ background: t.bg }}>
                {t.logo ? (
                  <img src={t.logo} alt="" />
                ) : t.svg ? (
                  <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                    <path d={t.svg} />
                  </svg>
                ) : (
                  t.abbr
                )}
              </div>
              <div className="name">{t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
