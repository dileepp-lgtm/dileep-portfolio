import { VIDEOS } from '../data/work.js';

export default function Motion({ section, hidden }) {
  return (
    <div className={'project' + (hidden ? ' hide' : '')} data-cat="motion">
      <div className="wrap">
        <div className="project-head reveal">
          <div>
            <span className="pt">{section.kicker}</span>
            <h2>{section.title}</h2>
          </div>
          <div className="pmeta" dangerouslySetInnerHTML={{ __html: section.meta }} />
        </div>
        <div className="vid-grid reveal">
          {VIDEOS.map(v => (
            <figure className={'vcard' + (v.wide ? ' wide' : '')} key={v.src}>
              <video src={v.src} poster={v.poster} controls loop muted playsInline preload="none" />
              <figcaption>
                <span className="t">{v.title}</span>
                <span className="c">{v.sub}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
