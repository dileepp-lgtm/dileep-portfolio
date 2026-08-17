import { AGENCY } from '../data/work.js';
import { PROFILE } from '../data/site.jsx';

export default function Agency({ section, hidden }) {
  return (
    <div className={'project' + (hidden ? ' hide' : '')} data-cat="agency">
      <div className="wrap">
        <div className="project-head reveal">
          <div>
            <span className="pt">{section.kicker}</span>
            <h2>{section.title}</h2>
          </div>
          <div className="pmeta" dangerouslySetInnerHTML={{ __html: section.meta }} />
        </div>
        <div className="agency-grid reveal">
          {AGENCY.map(a => (
            <a className="acard" href={a.href} target="_blank" rel="noopener" key={a.href}>
              <div className="am"><img src={a.img} alt={a.alt} loading="lazy" referrerPolicy="no-referrer" /></div>
              <div className="ab">
                <span className="t">{a.title}</span>
                <span className="c">{a.sub}</span>
                <span className="l">View on Behance →</span>
              </div>
            </a>
          ))}
        </div>
        <p className="agency-note reveal">
          Covers load from Behance — <a href={PROFILE.behance} target="_blank" rel="noopener"
            style={{ color: 'var(--accent)', fontWeight: 600 }}>see the full profile →</a>
        </p>
      </div>
    </div>
  );
}
