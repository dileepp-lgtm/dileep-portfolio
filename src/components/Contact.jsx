import { PROFILE } from '../data/site.jsx';

const Icon = ({ children }) => <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="wrap">
        <div className="reveal">
          <span className="eyebrow">Contact</span>
          <h2>Let's build meaningful digital experiences together.</h2>
          <p className="lead">
            Available for Freelance &amp; Full-time. Open to senior visual design and
            creative-direction roles, collaborations and select projects.
          </p>
          <div className="contact-links">
            <a className="c-link" href={`mailto:${PROFILE.email}`}>
              <Icon><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M3.2 7.2 12 13l8.8-5.8"/></Icon>
              Email
            </a>
            <a className="c-link" href={PROFILE.phoneHref}>
              <Icon><path d="M6.5 3.5h3l1.6 4-2.2 1.5a11.5 11.5 0 0 0 6.1 6.1l1.5-2.2 4 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/></Icon>
              {PROFILE.phone}
            </a>
            <a className="c-link" href={PROFILE.behance} target="_blank" rel="noopener">
              <Icon><rect x="3" y="3" width="18" height="18" rx="4.5"/><path d="M9 7.8v8.4"/><path d="M9 7.8h2.7a2.1 2.1 0 0 1 0 4.2H9"/><path d="M9 12h3a2.1 2.1 0 0 1 0 4.2H9"/></Icon>
              Behance
            </a>
            <a className="c-link" href={PROFILE.linkedin} target="_blank" rel="noopener">
              <Icon><rect x="3" y="3" width="18" height="18" rx="4.5"/><path d="M8 10.6v5.8"/><path d="M8 7.7v.1"/><path d="M11.9 16.4v-3.2a2.2 2.2 0 0 1 4.4 0v3.2"/><path d="M11.9 10.6v.8"/></Icon>
              LinkedIn
            </a>
            <a className="c-link" href={PROFILE.resume} download>
              <Icon><path d="M13.8 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.2z"/><path d="M13.8 3v5.2H19"/><path d="M8.8 13h6.4M8.8 16.6h4.2"/></Icon>
              Resume
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
