/* ============================================================
   Serverless proxy for the portfolio assistant (Groq).

   WHY THIS FILE EXISTS
   A static site can't hold an API key — everything it ships is public.
   This tiny function runs on the server, reads the key from an
   environment variable, and is the only thing that ever sees it.

   DEPLOY (Vercel, free tier, ~3 minutes)
     1. npm i -g vercel        (or use the vercel.com dashboard)
     2. From the portfolio folder:  vercel
     3. vercel env add GROQ_API_KEY      → paste your key when prompted
     4. vercel --prod
     5. In index.html set:
          window.AGENT_CONFIG = { endpoint: "/api/chat" };

   Netlify: move this to netlify/functions/chat.js and set the env var in
   Site settings → Environment variables. Endpoint becomes
   "/.netlify/functions/chat".

   The widget still works without this — it just answers from the local
   knowledge base instead of the LLM.
   ============================================================ */

const MODEL = 'llama-3.3-70b-versatile';   // fast + free tier on Groq

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured' });
  }

  try {
    const { question, history = [], system = '' } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Missing question' });
    }
    if (question.length > 500) {
      return res.status(400).json({ error: 'Question too long' });
    }

    // keep the transcript short and strip anything unexpected
    const turns = (Array.isArray(history) ? history : [])
      .slice(-8)
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map(m => ({ role: m.role, content: m.content.slice(0, 800) }));

    const messages = [
      {
        role: 'system',
        content:
          (system || 'You are a helpful portfolio assistant.') +
          '\n\nRules: answer in 2-4 sentences, plain text, no markdown headings. ' +
          'Never invent facts about Dileep. If the answer is not in the facts above, ' +
          'say you are not sure and suggest emailing dilee.live@gmail.com.'
      },
      ...turns,
      { role: 'user', content: question }
    ];

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 300
      })
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Groq error', r.status, detail);
      return res.status(502).json({ error: 'Upstream error' });
    }

    const data = await r.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) return res.status(502).json({ error: 'Empty response' });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
