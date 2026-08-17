function syncThemeButton(){
  var btn = document.querySelector('.theme-btn');
  if(!btn) return;
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}
function toggleTheme(){
  var cur = document.documentElement.getAttribute('data-theme');
  var next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try{ localStorage.setItem('theme', next); }catch(e){}
  syncThemeButton();
}

/* keep keyboard focus inside an open dialog */
function trapFocus(container, e){
  var f = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  var list = Array.prototype.filter.call(f, function(el){ return el.offsetParent !== null || el === document.activeElement; });
  if(!list.length) return;
  var first = list[0], last = list[list.length - 1];
  if(!container.contains(document.activeElement)){ e.preventDefault(); first.focus(); return; }
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
}

document.addEventListener('DOMContentLoaded', function(){
  var btn = document.querySelector('.theme-btn');
  if(btn) btn.addEventListener('click', toggleTheme);
  syncThemeButton();

  // sticky nav + scroll progress + back-to-top
  var nav = document.querySelector('.nav');
  var bar = document.querySelector('.scroll-progress span');
  var toTop = document.querySelector('.to-top');
  var ticking = false;
  var onScroll = function(){
    if(ticking) return; ticking = true;
    requestAnimationFrame(function(){
      var y = window.scrollY;
      if(nav) nav.classList.toggle('scrolled', y > 12);
      if(bar){
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      }
      if(toTop) toTop.classList.toggle('show', y > window.innerHeight * 0.9);
      ticking = false;
    });
  };
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
  if(toTop) toTop.addEventListener('click', function(){
    window.scrollTo({top:0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    var brand = document.querySelector('.brand'); if(brand) brand.focus({preventScroll:true});
  });

  // mobile menu
  var burger = document.querySelector('.burger');
  var links = document.querySelector('.nav-links');
  if(burger && links){
    var setMenu = function(open){
      links.classList.toggle('show', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', function(){ setMenu(!links.classList.contains('show')); });
    links.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && links.classList.contains('show')){ setMenu(false); burger.focus(); } });
  }

  // reveal on scroll
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  // count up stats
  document.querySelectorAll('.num[data-count]').forEach(function(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var seen = false;
    var so = new IntersectionObserver(function(en){
      en.forEach(function(x){
        if(x.isIntersecting && !seen){ seen = true; var t0=null;
          var step=function(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/1100,1);
            var ease=1-Math.pow(1-p,3);
            var v = Math.round(target*ease);
            el.firstChild.nodeValue = v; if(p<1) requestAnimationFrame(step); };
          requestAnimationFrame(step);
        }
      });
    }, {threshold:.5});
    so.observe(el);
  });


  // gallery category filter (project sections)
  var gfilters = document.querySelectorAll('.gfilter');
  var projects = document.querySelectorAll('.project');
  gfilters.forEach(function(f){
    f.addEventListener('click', function(){
      gfilters.forEach(function(x){ x.classList.remove('active'); x.setAttribute('aria-pressed','false'); });
      f.classList.add('active'); f.setAttribute('aria-pressed','true');
      var cat = f.getAttribute('data-cat');
      projects.forEach(function(p){
        p.classList.toggle('hide', !(cat === 'all' || p.getAttribute('data-cat') === cat));
      });
      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({top: document.getElementById('work').offsetTop - 130, behavior: reduce ? 'auto' : 'smooth'});
    });
  });

  // full-screen scrolling deck viewer
  var dv = document.getElementById('dv');
  if(dv && typeof DECKS !== 'undefined'){
    var dvInner = dv.querySelector('.dv-inner');
    var dvScroll = dv.querySelector('.dv-scroll');
    var dvT = dv.querySelector('.dvt');
    var dvC = dv.querySelector('.dvc');
    var dvProg = dv.querySelector('.dv-progress span');
    var lastFocus = null;
    var total = 0;

    var closeDeck = function(){
      dv.classList.remove('open');
      document.body.style.overflow = '';
      dvInner.innerHTML = '';
      if(dvProg) dvProg.style.width = '0%';
      if(lastFocus && lastFocus.focus) lastFocus.focus();   // return focus to the card
      lastFocus = null;
    };
    // live "page N of M" + read progress while scrolling
    var updateProgress = function(){
      if(!dv.classList.contains('open') || !total) return;
      var max = dvScroll.scrollHeight - dvScroll.clientHeight;
      var pct = max > 0 ? dvScroll.scrollTop / max : 0;
      if(dvProg) dvProg.style.width = (pct * 100) + '%';
      var imgs = dvInner.querySelectorAll('img'), cur = 1;
      for(var i = 0; i < imgs.length; i++){
        if(imgs[i].offsetTop - dvInner.offsetTop - dvScroll.scrollTop <= dvScroll.clientHeight * 0.45) cur = i + 1;
      }
      dvC.textContent = cur + ' / ' + total;
    };
    dvScroll.addEventListener('scroll', function(){
      if(dvScroll._t) return; dvScroll._t = 1;
      requestAnimationFrame(function(){ updateProgress(); dvScroll._t = 0; });
    }, {passive:true});

    var openDeck = function(key, cols, trigger){
      var pages = DECKS[key]; if(!pages) return;
      var name = (typeof DECK_NAMES !== 'undefined' && DECK_NAMES[key]) ? DECK_NAMES[key] : 'Deck';
      lastFocus = trigger || document.activeElement;
      total = pages.length;
      dvInner.classList.toggle('two', cols === '2');
      dvT.textContent = name;
      dvC.textContent = '1 / ' + total;
      dvInner.innerHTML = pages.map(function(p,i){
        return '<img src="'+p+'" alt="'+name+' — page '+(i+1)+'" loading="'+(i<4?'eager':'lazy')+'">';
      }).join('');
      // landscape pages span the full width; square/portrait pair up 2-per-row
      Array.prototype.forEach.call(dvInner.querySelectorAll('img'), function(img){
        var mark = function(){
          if(img.naturalWidth && img.naturalWidth / img.naturalHeight > 1.25) img.classList.add('wide');
        };
        if(img.complete && img.naturalWidth) mark(); else img.addEventListener('load', mark, {once:true});
      });
      dv.classList.add('open');
      document.body.style.overflow = 'hidden';
      dvScroll.scrollTop = 0;
      if(dvProg) dvProg.style.width = '0%';
      dvScroll.focus({preventScroll:true});          // arrow keys scroll immediately
    };
    document.body.addEventListener('click', function(e){
      var card = e.target.closest('[data-deck]');
      if(card){ e.preventDefault(); openDeck(card.getAttribute('data-deck'), card.getAttribute('data-cols'), card); }
    });
    dv.querySelector('.dv-x').addEventListener('click', closeDeck);
    document.addEventListener('keydown', function(e){
      if(!dv.classList.contains('open')) return;
      if(e.key === 'Escape'){ closeDeck(); return; }
      if(e.key === 'Tab'){ trapFocus(dv, e); return; }
      if(e.key === 'PageDown' || e.key === 'ArrowDown'){ e.preventDefault(); dvScroll.scrollBy({top:dvScroll.clientHeight*0.9, behavior:'smooth'}); }
      if(e.key === 'PageUp' || e.key === 'ArrowUp'){ e.preventDefault(); dvScroll.scrollBy({top:-dvScroll.clientHeight*0.9, behavior:'smooth'}); }
      if(e.key === 'Home'){ e.preventDefault(); dvScroll.scrollTo({top:0, behavior:'smooth'}); }
      if(e.key === 'End'){ e.preventDefault(); dvScroll.scrollTo({top:dvScroll.scrollHeight, behavior:'smooth'}); }
    });
  }

  // lightbox
  var lb = document.getElementById('lb');
  if(lb){
    var lbImg = lb.querySelector('img');
    var gallery = [];
    var idx = 0;
    var collect = function(){
      return Array.prototype.slice.call(document.querySelectorAll('[data-lb]')).filter(function(el){
        var pr = el.closest('.project'); return !pr || !pr.classList.contains('hide');
      });
    };
    var lbLast = null;
    var setImg = function(){
      var el = gallery[idx];
      lbImg.src = el.getAttribute('data-lb') || el.querySelector('img').src;
      lbImg.alt = (el.querySelector('img') && el.querySelector('img').alt) || 'Enlarged view';
      lb.setAttribute('aria-label', 'Image ' + (idx + 1) + ' of ' + gallery.length);
    };
    var closeLb = function(){
      lb.classList.remove('open');
      document.body.style.overflow = '';
      if(lbLast && lbLast.focus) lbLast.focus();
      lbLast = null;
    };
    var openAt = function(i, trigger){
      gallery = collect(); idx = i; lbLast = trigger || document.activeElement;
      setImg(); lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus({preventScroll:true});
    };
    document.body.addEventListener('click', function(e){
      var t = e.target.closest('[data-lb]');
      if(t){ var all = collect(), i = all.indexOf(t); if(i > -1) openAt(i, t); }
    });
    var lbNav = function(d){ idx = (idx + d + gallery.length) % gallery.length; setImg(); };
    lb.querySelector('.lb-close').addEventListener('click', closeLb);
    lb.querySelector('.lb-prev').addEventListener('click', function(e){ e.stopPropagation(); lbNav(-1); });
    lb.querySelector('.lb-next').addEventListener('click', function(e){ e.stopPropagation(); lbNav(1); });
    lb.addEventListener('click', function(e){ if(e.target===lb) closeLb(); });
    document.addEventListener('keydown', function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key==='Escape'){ closeLb(); return; }
      if(e.key==='Tab'){ trapFocus(lb, e); return; }
      if(e.key==='ArrowLeft') lbNav(-1);
      if(e.key==='ArrowRight') lbNav(1);
    });
  }

  // active section highlight in nav
  var secs = document.querySelectorAll('section[id]');
  var navA = document.querySelectorAll('.nav-links a');
  if(secs.length && navA.length){
    var sIo = new IntersectionObserver(function(en){
      en.forEach(function(x){ if(x.isIntersecting){
        navA.forEach(function(a){ a.style.color = a.getAttribute('href')==='#'+x.target.id ? 'var(--text)' : ''; });
      }});
    }, {threshold:.5});
    secs.forEach(function(s){ sIo.observe(s); });
  }
});
