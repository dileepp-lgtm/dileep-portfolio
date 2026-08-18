import { TOOLS } from '../data/site.jsx';

export default function Tools() {
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
