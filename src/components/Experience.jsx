import { EXPERIENCE } from '../data/site.jsx';

export default function Experience() {
  return (
    <section id="experience" className="soft">
      <div className="wrap">
        <div className="reveal">
          <span className="eyebrow">Career Journey</span>
          <h2 className="sec-title">From advertising craft to fintech scale.</h2>
        </div>
        <div className="tl" style={{ marginTop: 24 }}>
          {EXPERIENCE.map((e, i) => (
            <div className={'tl-item reveal' + (i ? ' d' + i : '')} key={e.org}>
              <div className="tl-date">{e.date}</div>
              <h3>{e.org}</h3>
              <p className="tl-role">{e.role}</p>
              {e.products && (
                <div className="chips" style={{ marginBottom: 14 }}>
                  {e.products.map(p => <span className="chip solid" key={p}>{p}</span>)}
                </div>
              )}
              <div className="chips">
                {e.chips.map(c => <span className="chip" key={c}>{c}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
