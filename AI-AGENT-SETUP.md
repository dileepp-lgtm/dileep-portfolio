# Portfolio assistant — how it works

A chat agent sits in the bottom-right corner of the site. It answers questions
about you and turns longer notes into a pre-filled email.

---

## ⚠️ First: revoke the key you shared

The Groq key `gsk_hdNQ…iRc` was pasted into a chat, so treat it as public.

1. Go to **console.groq.com → API Keys**
2. **Delete** that key
3. Create a fresh one and keep it somewhere private

The key is **not** in any file in this project — that's deliberate (see below).

---

## Why the key isn't in the page

This is a static site: every file it serves is readable by any visitor via
*View Source*. A key placed in the JavaScript would be visible to everyone and
could be spent against your account. There's no way around that on a purely
static page — the key has to live on a server.

So the agent ships in two modes.

---

## Mode 1 — Local answers (active now, nothing to set up)

Answers come from `assets/js/agent-kb.js`, a knowledge base written from your CV.
It covers experience, roles, tools, education, products, campaigns, availability,
rates, contact details and more — roughly the questions a recruiter or client
actually asks.

- No API key, no network calls, works offline and from `file://`
- If someone types a longer message instead of a question, it offers a
  **Send this message →** button that opens a pre-filled email to
  `dilee.live@gmail.com`

**To edit answers:** open `assets/js/agent-kb.js`. Each entry is:

```js
{ k:["keyword","another phrase"], a:"The answer, HTML allowed." }
```

`k` are the words that should trigger it; `a` is what the agent replies.
Add or reword freely — no build step, just save and refresh.

---

## Mode 2 — Real AI (optional, ~3 minutes)

Free-form answers from Groq, with the key safe on the server.

1. Install the CLI: `npm i -g vercel`
2. From this `portfolio/` folder, run: `vercel`
3. Add the key as an environment variable:
   ```
   vercel env add GROQ_API_KEY
   ```
   Paste your **new** key when prompted.
4. Deploy: `vercel --prod`
5. In `index.html`, change:
   ```js
   window.AGENT_CONFIG = { endpoint: "" };
   ```
   to
   ```js
   window.AGENT_CONFIG = { endpoint: "/api/chat" };
   ```

That's it. The widget will call your function, which calls Groq with the key
server-side. The function is `api/chat.js` and already includes the system
prompt built from your CV, length limits, and a short conversation memory.

**Netlify instead of Vercel:** move `api/chat.js` to
`netlify/functions/chat.js`, set `GROQ_API_KEY` in *Site settings →
Environment variables*, and use `endpoint: "/.netlify/functions/chat"`.

### Safety net
If the endpoint is slow, errors, or hits a rate limit, the widget silently
falls back to the local knowledge base — so it never shows an error to a
visitor.

---

## Files

| File | Purpose |
|---|---|
| `assets/js/agent-kb.js` | Your facts + suggested questions. **Edit this one.** |
| `assets/js/chat-agent.js` | Widget UI, matching logic, endpoint hook |
| `api/chat.js` | Serverless proxy that keeps the Groq key server-side |
| `index.html` | `window.AGENT_CONFIG` — where you set the endpoint |

## Notes

- Your CV phone numbers are **not** in the knowledge base — publishing them on
  a live page invites spam. Add them to `agent-kb.js` if you'd like.
- The agent is keyboard accessible (Esc closes) and skipped for nothing — it
  works on mobile too.
- `PortfolioAgent.open()` / `.ask("question")` are available in the console if
  you ever want to trigger it from elsewhere on the page.
