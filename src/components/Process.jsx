import { PROCESS } from '../data/site.jsx';

export default function Process() {
  return (
    <section id="process">
      <div className="wrap">
        <div className="reveal">
          <span className="eyebrow">Design Process</span>
          <h2 className="sec-title">A clear path from insight to impact.</h2>
        </div>
        <div className="proc reveal" style={{ marginTop: 24 }}>
          {PROCESS.map((p, i) => (
            <div className="proc-step" key={p.title}>
              <div className="proc-num">
                <svg viewBox="0 0 24 24">{p.icon}</svg>
                <span className="n">{i + 1}</span>
              </div>
              <h4>{p.title}</h4>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
