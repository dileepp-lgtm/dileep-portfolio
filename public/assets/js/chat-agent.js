/* ============================================================
   Portfolio assistant — bottom-right chat agent.

   Two answer modes:
   1. LOCAL (default)  — scores the question against AGENT_KB.entries.
                         No API key, no network, works offline.
   2. REMOTE (opt-in)  — if AGENT_CONFIG.endpoint is set, posts the
                         question to your own serverless function, which
                         holds the Groq key server-side. See
                         AI-AGENT-SETUP.md.

   NEVER put an API key in this file — it ships to every visitor.
   ============================================================ */
(function (global) {
  'use strict';

  var CFG = global.AGENT_CONFIG || {};
  var KB = global.AGENT_KB;
  if (!KB) return;

  var STOP = {the:1,a:1,an:1,is:1,are:1,was:1,of:1,to:1,in:1,on:1,for:1,and:1,or:1,do:1,does:1,did:1,
              you:1,your:1,he:1,his:1,him:1,i:1,me:1,my:1,it:1,that:1,this:1,what:1,which:1,can:1,
              with:1,about:1,tell:1,please:1,any:1,have:1,has:1,how:1,'s':1};

  function norm(s){ return String(s).toLowerCase().replace(/[^a-z0-9\s+&]/g,' ').replace(/\s+/g,' ').trim(); }

  /* Score each entry. Multi-word keys match as a phrase; single-word keys must
     match a whole token, or a token that STARTS with the key when the key is
     4+ chars (so "tool" still catches "tools"). Plain substring matching was
     too loose — "hi" hit "his", "now" hit "know". */
  function findAnswer(q){
    var nq = norm(q);
    if (!nq) return null;
    var tokens = nq.split(' ');
    var best = null, bestScore = 0;
    KB.entries.forEach(function(e){
      var score = 0;
      e.k.forEach(function(key){
        var nk = norm(key);
        if (!nk) return;
        if (nk.indexOf(' ') > -1) {                       // phrase
          if (nq.indexOf(nk) > -1) score += 6;
          return;
        }
        for (var i = 0; i < tokens.length; i++) {
          var tk = tokens[i];
          if (tk === nk) { score += 3; break; }           // exact token
          if (nk.length >= 4 && tk.indexOf(nk) === 0) { score += 3; break; } // plural/suffix
        }
      });
      if (score > bestScore) { bestScore = score; best = e; }
    });
    return bestScore >= 3 ? best.a : null;
  }

  /* ---------- markup ---------- */
  var root = document.createElement('div');
  root.className = 'agent';
  root.innerHTML =
    '<button class="agent-fab" type="button" aria-expanded="false" aria-controls="agent-panel" aria-label="Open the portfolio assistant">' +
      '<svg class="i-chat" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.2 8.2 0 0 1-.9 3.7 8.3 8.3 0 0 1-7.4 4.6 8.2 8.2 0 0 1-3.7-.9L3.5 20.5l1.4-5a8.2 8.2 0 0 1-.9-3.7 8.3 8.3 0 0 1 4.6-7.4 8.2 8.2 0 0 1 3.7-.9h.5a8.3 8.3 0 0 1 7.7 7.7z"/><path d="M8.9 10.8h6.2M8.9 13.8h4"/></svg>' +
      '<svg class="i-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '<span class="agent-ping"></span>' +
    '</button>' +
    '<section class="agent-panel" id="agent-panel" role="dialog" aria-modal="false" aria-label="Portfolio assistant" hidden>' +
      '<header class="agent-head">' +
        '<span class="agent-ava" aria-hidden="true">D</span>' +
        '<span class="agent-id"><strong>Ask about Dileep</strong><em>Portfolio assistant</em></span>' +
        '<button class="agent-x" type="button" aria-label="Close assistant">&times;</button>' +
      '</header>' +
      '<div class="agent-log" role="log" aria-live="polite" aria-atomic="false"></div>' +
      '<div class="agent-chips"></div>' +
      '<form class="agent-form" autocomplete="off">' +
        '<label class="sr" for="agent-input">Your question</label>' +
        '<input id="agent-input" class="agent-input" type="text" placeholder="Ask a question, or leave a message…" maxlength="500">' +
        '<button class="agent-send" type="submit" aria-label="Send">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 8 6 8z"/></svg>' +
        '</button>' +
      '</form>' +
      '<p class="agent-foot">Answers come from Dileep\'s CV. For anything else, ' +
        '<a href="mailto:dilee.live@gmail.com">email him</a>.</p>' +
    '</section>';
  document.body.appendChild(root);

  var fab   = root.querySelector('.agent-fab');
  var panel = root.querySelector('.agent-panel');
  var log   = root.querySelector('.agent-log');
  var chips = root.querySelector('.agent-chips');
  var form  = root.querySelector('.agent-form');
  var input = root.querySelector('.agent-input');
  var closeBtn = root.querySelector('.agent-x');
  var started = false;

  function bubble(text, who, opts){
    opts = opts || {};
    var row = document.createElement('div');
    row.className = 'agent-row ' + who;
    var b = document.createElement('div');
    b.className = 'agent-bubble';
    if (opts.html) b.innerHTML = text; else b.textContent = text;
    row.appendChild(b);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  function typing(){
    var row = document.createElement('div');
    row.className = 'agent-row bot typing';
    row.innerHTML = '<div class="agent-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  function renderChips(){
    chips.innerHTML = '';
    (KB.suggestions || []).forEach(function(s){
      var c = document.createElement('button');
      c.type = 'button'; c.className = 'agent-chip'; c.textContent = s;
      c.addEventListener('click', function(){ ask(s); });
      chips.appendChild(c);
    });
  }

  /* remote mode: your serverless proxy holds the key */
  function askRemote(q, history){
    return fetch(CFG.endpoint, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ question:q, history:history, system:KB.profile })
    }).then(function(r){
      if (!r.ok) throw new Error('endpoint ' + r.status);
      return r.json();
    }).then(function(d){
      return (d && (d.answer || d.reply)) || null;
    });
  }

  var history = [];

  function ask(q){
    q = String(q || '').trim();
    if (!q) return;
    bubble(q, 'me');
    input.value = '';
    history.push({ role:'user', content:q });
    var t = typing();

    var local = findAnswer(q);

    var finish = function(ans, isHtml){
      t.remove();
      bubble(ans, 'bot', { html: isHtml !== false });
      history.push({ role:'assistant', content: String(ans).replace(/<[^>]+>/g,'') });
      if (history.length > 12) history = history.slice(-12);
    };

    /* remote first when configured, local as the safety net */
    if (CFG.endpoint) {
      askRemote(q, history.slice(0,-1)).then(function(ans){
        finish(ans || local || KB.fallback);
      }).catch(function(){
        finish(local || KB.fallback);
      });
      return;
    }

    setTimeout(function(){
      if (local) return finish(local);
      /* looks like a message rather than a question → offer to send it */
      if (q.split(' ').length >= 4 && !/\?$/.test(q)) {
        var mail = 'mailto:dilee.live@gmail.com'
                 + '?subject=' + encodeURIComponent('Portfolio enquiry')
                 + '&body=' + encodeURIComponent(q);
        return finish('Thanks — I\'ve turned that into an email so it reaches Dileep directly: '
          + '<a class="agent-cta" href="' + mail + '">Send this message →</a>');
      }
      finish(KB.fallback);
    }, 380 + Math.random()*220);
  }

  function open(){
    panel.hidden = false;
    root.classList.add('open');
    fab.setAttribute('aria-expanded','true');
    fab.setAttribute('aria-label','Close the portfolio assistant');
    if (!started){
      started = true;
      bubble(KB.greeting, 'bot', { html:true });
      renderChips();
    }
    setTimeout(function(){ input.focus(); }, 120);
  }
  function close(){
    root.classList.remove('open');
    fab.setAttribute('aria-expanded','false');
    fab.setAttribute('aria-label','Open the portfolio assistant');
    setTimeout(function(){ panel.hidden = true; }, 220);
    fab.focus();
  }

  fab.addEventListener('click', function(){ root.classList.contains('open') ? close() : open(); });
  closeBtn.addEventListener('click', close);
  form.addEventListener('submit', function(e){ e.preventDefault(); ask(input.value); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && root.classList.contains('open')) close();
  });

  global.PortfolioAgent = { open:open, close:close, ask:ask };
})(window);
