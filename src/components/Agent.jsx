import { useEffect, useRef, useState } from 'react';
import { AGENT_KB as KB } from '../data/agentKb.js';

/* Optional: point this at your own serverless proxy to switch on real LLM
   answers (see AI-AGENT-SETUP.md). Never put an API key in client code. */
const ENDPOINT = import.meta.env.VITE_AGENT_ENDPOINT || '';

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9\s+&]/g, ' ').replace(/\s+/g, ' ').trim();

function findAnswer(q) {
  const nq = norm(q);
  if (!nq) return null;
  const tokens = nq.split(' ');
  let best = null, bestScore = 0;
  KB.entries.forEach(e => {
    let score = 0;
    e.k.forEach(key => {
      const nk = norm(key);
      if (!nk) return;
      if (nk.includes(' ')) { if (nq.includes(nk)) score += 6; return; }
      for (const tk of tokens) {
        if (tk === nk) { score += 3; break; }
        if (nk.length >= 4 && tk.indexOf(nk) === 0) { score += 3; break; }
      }
    });
    if (score > bestScore) { bestScore = score; best = e; }
  });
  return bestScore >= 3 ? best.a : null;
}

export default function Agent() {
  const [open, setOpen] = useState(false);     // drives the .open class (animation)
  const [mounted, setMounted] = useState(false); // drives `hidden` (display)
  const [started, setStarted] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const fabRef = useRef(null);
  const history = useRef([]);
  const hideTimer = useRef(null);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [msgs, typing]);

  /* open: reveal the element first, then add .open on the next frame.
     close: play the transition out, then hide it. */
  const setPanel = next => {
    if (next) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    } else {
      setOpen(false);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setMounted(false), 240);
    }
  };

  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      setMsgs([{ who: 'bot', html: KB.greeting }]);
    }
    if (open) setTimeout(() => inputRef.current && inputRef.current.focus(), 120);
  }, [open, started]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape' && open) { setPanel(false); fabRef.current && fabRef.current.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const push = m => setMsgs(v => [...v, m]);

  async function ask(q) {
    q = String(q || '').trim();
    if (!q) return;
    push({ who: 'me', text: q });
    setText('');
    history.current.push({ role: 'user', content: q });
    setTyping(true);

    const local = findAnswer(q);
    const finish = html => {
      setTyping(false);
      push({ who: 'bot', html });
      history.current.push({ role: 'assistant', content: String(html).replace(/<[^>]+>/g, '') });
      history.current = history.current.slice(-12);
    };

    if (ENDPOINT) {
      try {
        const r = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q, history: history.current.slice(0, -1), system: KB.profile })
        });
        if (!r.ok) throw new Error(r.status);
        const d = await r.json();
        return finish(d.answer || d.reply || local || KB.fallback);
      } catch {
        return finish(local || KB.fallback);      // endpoint down → local answers
      }
    }

    setTimeout(() => {
      if (local) return finish(local);
      if (q.split(' ').length >= 4 && !/\?$/.test(q)) {
        const mail = 'mailto:dilee.live@gmail.com?subject=' + encodeURIComponent('Portfolio enquiry')
                   + '&body=' + encodeURIComponent(q);
        return finish(`Thanks — I've turned that into an email so it reaches Dileep directly: `
          + `<a class="agent-cta" href="${mail}">Send this message →</a>`);
      }
      finish(KB.fallback);
    }, 380 + Math.random() * 220);
  }

  return (
    <div className={'agent' + (open ? ' open' : '')}>
      <button className="agent-fab" type="button" ref={fabRef}
              aria-expanded={open} aria-controls="agent-panel"
              aria-label={open ? 'Close the portfolio assistant' : 'Open the portfolio assistant'}
              onClick={() => setPanel(!open)}>
        <svg className="i-logo" viewBox="0 0 789 880" aria-hidden="true">
          <defs>
            <linearGradient id="fabLogoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6E9BF5" />
              <stop offset="1" stopColor="#A87BF0" />
            </linearGradient>
          </defs>
          <path fill="url(#fabLogoGrad)" fillRule="evenodd" d="M48 34 L440 34 A320 406 0 0 1 440 846 L210 846 L210 726 L48 726 Z M210 180 L432 180 A174 260 0 0 1 432 700 L210 700 Z" />
          <rect fill="url(#fabLogoGrad)" x="328" y="360" width="160" height="160" />
        </svg>
        <svg className="i-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        <span className="agent-ping" />
      </button>

      <section className="agent-panel" id="agent-panel" role="dialog" aria-modal="false"
               aria-label="Portfolio assistant" hidden={!mounted}>
        <header className="agent-head">
          <span className="agent-ava" aria-hidden="true">D</span>
          <span className="agent-id"><strong>Ask about Dileep</strong><em>Portfolio assistant</em></span>
          <button className="agent-x" type="button" aria-label="Close assistant" onClick={() => setPanel(false)}>×</button>
        </header>

        <div className="agent-log" role="log" aria-live="polite" ref={logRef}>
          {msgs.map((m, i) => (
            <div className={'agent-row ' + m.who} key={i}>
              {m.html
                ? <div className="agent-bubble" dangerouslySetInnerHTML={{ __html: m.html }} />
                : <div className="agent-bubble">{m.text}</div>}
            </div>
          ))}
          {typing && (
            <div className="agent-row bot typing">
              <div className="agent-bubble"><span className="dot" /><span className="dot" /><span className="dot" /></div>
            </div>
          )}
        </div>

        {started && (
          <div className="agent-chips">
            {KB.suggestions.map(s => (
              <button className="agent-chip" type="button" key={s} onClick={() => ask(s)}>{s}</button>
            ))}
          </div>
        )}

        <form className="agent-form" autoComplete="off" onSubmit={e => { e.preventDefault(); ask(text); }}>
          <label className="sr" htmlFor="agent-input">Your question</label>
          <input id="agent-input" className="agent-input" type="text" ref={inputRef}
                 value={text} onChange={e => setText(e.target.value)} maxLength={500}
                 placeholder="Ask a question, or leave a message…" />
          <button className="agent-send" type="submit" aria-label="Send">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 8 6 8z"/></svg>
          </button>
        </form>

        <p className="agent-foot">
          Answers come from Dileep's CV. For anything else,{' '}
          <a href="mailto:dilee.live@gmail.com">email him</a>.
        </p>
      </section>
    </div>
  );
}
