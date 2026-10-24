/* Motion layer — vanilla JS, no dependencies. Pairs with anim.css */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  root.classList.add('js-anim');

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // The cinematic intro lasts ~5.6s unless clicked; start hero text after it.
  const introOn = !!$('#cinematic-intro');
  const heroDelay = introOn ? 4800 : 200;

  /* ---------- scroll progress beam ---------- */
  const beam = document.createElement('div');
  beam.className = 'scroll-beam';
  document.body.appendChild(beam);
  const onScroll = () => {
    const h = root.scrollHeight - innerHeight;
    beam.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- hero: aurora + meteors ---------- */
  const hero = $('.hero');
  if (hero && !reduce) {
    const fx = document.createElement('div');
    fx.className = 'hero-fx';
    fx.innerHTML = '<div class="aurora"></div>';
    for (let i = 0; i < 8; i++) {
      const m = document.createElement('i');
      m.className = 'meteor';
      m.style.left = `${Math.round(Math.random() * 100)}%`;
      m.style.setProperty('--d', `${5 + Math.random() * 5}s`);
      m.style.setProperty('--delay', `${Math.random() * 8}s`);
      fx.appendChild(m);
    }
    hero.prepend(fx);
  }

  /* ---------- text generate on hero headline + flip words ---------- */
  const fx = (window.__fx = window.__fx || {});
  const h2 = $('.hero-left h2');
  if (h2) {
    const renderHeadline = (text, base) => {
      const words = text.trim().split(/\s+/);
      h2.setAttribute('aria-label', text.trim());
      h2.classList.remove('shimmer');
      h2.innerHTML = words
        .map((w, i) => `<span class="tg-word" aria-hidden="true" style="--i:${i};--base:${reduce ? 0 : base}ms">${w}</span>`)
        .join(' ');
      if (!reduce) setTimeout(() => h2.classList.add('shimmer'), base + words.length * 90 + 900);
    };
    renderHeadline(h2.textContent, heroDelay);
    fx.setHeadline = text => renderHeadline(text, 0);

    const line = document.createElement('p');
    line.className = 'flip-line';
    line.innerHTML = '<span class="static">Mastery in</span><span class="flip-words">' +
      ['Pen &amp; Ink', 'Landscapes', 'Calligraphy', 'Architecture', 'Horses']
        .map(t => `<span>${t}</span>`).join('') + '</span>';
    h2.after(line);
    const spans = $$('.flip-words span', line);
    fx.setFlip = (lead, words) => {
      $('.static', line).textContent = lead;
      spans.forEach((sp, i) => { sp.textContent = words[i] || sp.textContent; });
    };
    let k = 0;
    spans[0].classList.add('on');
    if (!reduce) setInterval(() => {
      const cur = spans[k];
      cur.classList.remove('on'); cur.classList.add('out');
      k = (k + 1) % spans.length;
      const nxt = spans[k];
      nxt.classList.remove('out'); void nxt.offsetWidth; nxt.classList.add('on');
      setTimeout(() => cur.classList.remove('out'), 800);
    }, 2400);
  }

  /* ---------- hero slideshow ---------- */
  const slides = $$('.hero-slide');
  if (slides.length > 1) {
    const dots = $$('.hero-dots i'), title = $('.hero-title');
    let cur = 0;
    const go = n => {
      slides[cur].classList.remove('active'); dots[cur]?.classList.remove('on');
      cur = n % slides.length;
      slides[cur].classList.add('active'); dots[cur]?.classList.add('on');
      if (title) title.textContent = slides[cur].dataset.title || '';
    };
    if (!reduce) setInterval(() => go(cur + 1), 5000);
    dots.forEach((d, i) => { d.style.cursor = 'pointer'; d.addEventListener('click', () => go(i)); });
  }

  /* ---------- section counts ---------- */
  $$('.gallery-section').forEach(sec => {
    const n = $$('.gallery-card', sec).length;
    const h = $('h3', sec);
    if (h && n) { h.dataset.n = n; h.dataset.count = n + ' works'; }
  });
  fx.setCounts = fn => $$('.gallery-section h3[data-n]').forEach(h => { h.dataset.count = fn(h.dataset.n); });

  /* ---------- marquee ---------- */
  const firstGallery = $('.gallery-section');
  if (firstGallery) {
    const items = ['Pen &amp; Ink', 'Landscapes', 'Calligraphy', 'Portraits', 'Architecture', 'Horses', 'Still Life', 'Abstract'];
    const mq = document.createElement('div');
    mq.className = 'marquee';
    mq.setAttribute('aria-hidden', 'true');
    const fill = list => {
      const row = list.map(t => `<span>${t}</span>`).join('');
      mq.innerHTML = `<div class="marquee-track">${row}${row}</div>`;
    };
    fill(items);
    fx.setMarquee = fill;
    firstGallery.before(mq);
  }

  /* inner pages use Bootstrap .card inside sections */
  $$('main section .card').forEach(c => c.classList.add('fx-card'));

  /* ---------- scroll reveal (staggered) ---------- */
  const targets = [
    ...$$('.gallery-section h3'),
    ...$$('.gallery-card, .fx-card'),
    ...$$('.bio, .side-card, #contact > h3, .contact-form, .contact-aside'),
  ];
  const counters = new Map();
  targets.forEach(el => {
    el.setAttribute('data-reveal', '');
    const p = el.parentElement;
    const n = counters.get(p) || 0;
    counters.set(p, n + 1);
    el.style.setProperty('--rd', `${(n % 3) * 110}ms`);
  });
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  }

  /* ---------- sticky header state ---------- */
  const header = $('header');
  if (header) addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), { passive: true });

  /* ---------- image loaded flags (drop skeleton) ---------- */
  $$('.gallery-card, .fx-card').forEach(card => {
    const img = $('img', card);
    if (!img) return;
    const done = () => card.classList.add('loaded');
    if (img.complete) done(); else { img.addEventListener('load', done); img.addEventListener('error', done); }
  });

  /* ---------- lightbox ---------- */
  const cards = $$('.gallery-card, .fx-card');
  if (cards.length) {
    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Artwork viewer');
    lb.innerHTML = '<button class="lb-x" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>' +
      '<button class="lb-p" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>' +
      '<button class="lb-n" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>' +
      '<figure><div class="lb-stage"><img alt=""></div><figcaption></figcaption></figure>';
    document.body.appendChild(lb);
    const lbImg = $('img', lb), cap = $('figcaption', lb);
    let idx = 0, lastFocus = null;

    const show = i => {
      idx = (i + cards.length) % cards.length;
      const src = $('img', cards[idx]);
      lbImg.classList.remove('ready', 'zoom');
      lbImg.onload = () => lbImg.classList.add('ready');
      lbImg.src = src.currentSrc || src.src;
      lbImg.alt = src.alt;
      cap.innerHTML = `<b>${idx + 1} / ${cards.length}</b> &nbsp;·&nbsp; ${src.alt}`;
      [idx - 1, idx + 1].forEach(j => { const p = new Image(); p.src = $('img', cards[(j + cards.length) % cards.length]).src; });
    };
    const open = i => {
      lastFocus = document.activeElement;
      show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('.lb-x', lb).focus();
    };
    const close = () => {
      lb.classList.remove('open'); document.body.style.overflow = ''; lastFocus?.focus?.();
    };

    // capture phase: takes over from the old "open image in new tab" handlers
    document.addEventListener('click', e => {
      const card = e.target.closest('.gallery-card, .fx-card');
      if (!card || e.target.closest('button')) return;
      e.preventDefault(); e.stopImmediatePropagation();
      open(cards.indexOf(card));
    }, true);

    // open one image on its own (used by the 3D gallery)
    window.__openArtwork = (src, alt) => {
      lastFocus = document.activeElement;
      lb.classList.add('single');
      lbImg.classList.remove('ready', 'zoom');
      lbImg.onload = () => lbImg.classList.add('ready');
      lbImg.src = src; lbImg.alt = alt;
      cap.textContent = alt;
      lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('.lb-x', lb).focus();
    };
    const closeBase = close;
    $('.lb-x', lb).onclick = () => { closeBase(); setTimeout(() => lb.classList.remove('single'), 400); };
    $('.lb-p', lb).onclick = () => show(idx - 1);
    $('.lb-n', lb).onclick = () => show(idx + 1);
    lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'FIGURE') $('.lb-x', lb).onclick(); });
    lbImg.addEventListener('click', e => { e.stopPropagation(); lbImg.classList.toggle('zoom'); });
    lbImg.addEventListener('pointermove', e => {
      const r = lbImg.getBoundingClientRect();
      lbImg.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') $('.lb-x', lb).onclick();
      else if (lb.classList.contains('single')) return;
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'ArrowLeft') show(idx - 1);
    });
    let sx = 0;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (lb.classList.contains('single')) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- floating dock ---------- */
  const base = new URL('./', (document.currentScript || $('script[src$="anim.js"]')).src).href;
  const here = location.pathname.split('/').pop() || 'index.html';
  const links = [
    ['index.html', 'Home', 'fa-house'],
    ['landscape.html', 'Landscapes', 'fa-mountain-sun'],
    ['calligraphy.html', 'Calligraphy', 'fa-feather-pointed'],
    ['master.html', 'Masterpieces', 'fa-crown'],
    ['horses.html', 'Horses', 'fa-horse'],
    ['architectr/architect.html', 'Architecture', 'fa-landmark'],
    ['#contact', 'Contact', 'fa-envelope'],
  ];
  const dock = document.createElement('div');
  dock.setAttribute('role', 'navigation');
  dock.className = 'dock'; dock.setAttribute('aria-label', 'Quick navigation');
  dock.innerHTML = links.map(([h, l, ic], i) => {
    const href = h.startsWith('#') ? h : base + h;
    const active = !h.startsWith('#') && h.split('/').pop() === here ? ' active' : '';
    return (i === links.length - 1 ? '<span class="sep"></span>' : '') +
      `<a href="${href}" class="${active.trim()}" data-label="${l}" aria-label="${l}"><i class="fa-solid ${ic}"></i></a>`;
  }).join('');
  document.body.appendChild(dock);
  if (fine && !reduce) {
    const items = $$('a', dock);
    dock.addEventListener('pointermove', e => items.forEach(a => {
      const r = a.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      const s = 1 + 0.55 * Math.exp(-(d * d) / (2 * 55 * 55));
      a.style.transform = `scale(${s.toFixed(3)}) translateY(${(-(s - 1) * 8).toFixed(1)}px)`;
    }));
    dock.addEventListener('pointerleave', () => items.forEach(a => { a.style.transform = ''; }));
  }

  if (!fine || reduce) return;

  /* ---------- global cursor glow ---------- */
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  let gx = 0, gy = 0, tx = 0, ty = 0, raf = 0;
  const loop = () => {
    gx += (tx - gx) * 0.14; gy += (ty - gy) * 0.14;
    glow.style.transform = `translate3d(${gx}px,${gy}px,0)`;
    raf = (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) ? requestAnimationFrame(loop) : 0;
  };
  addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY; glow.classList.add('on');
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  document.addEventListener('pointerleave', () => glow.classList.remove('on'));

  /* ---------- pointer-tracked glow / 3D tilt ---------- */
  const track = (el, tilt) => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
      if (tilt) {
        el.style.setProperty('--ry', `${((x / r.width) - 0.5) * 2 * tilt}deg`);
        el.style.setProperty('--rx', `${-((y / r.height) - 0.5) * 2 * tilt}deg`);
      }
    });
    if (tilt) el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    });
  };
  $$('.gallery-card, .fx-card').forEach(c => track(c, 6));
  $$('.bio, .side-card, .contact-form, .contact-aside, .hero-right').forEach(c => track(c, 0));

  /* ---------- hero image parallax ---------- */
  const heroRight = $('.hero-right');
  if (heroRight) {
    heroRight.addEventListener('pointermove', e => {
      const r = heroRight.getBoundingClientRect();
      heroRight.style.setProperty('--px', `${-(((e.clientX - r.left) / r.width) - 0.5) * 20}px`);
      heroRight.style.setProperty('--py', `${-(((e.clientY - r.top) / r.height) - 0.5) * 20}px`);
    });
    heroRight.addEventListener('pointerleave', () => {
      heroRight.style.setProperty('--px', '0px'); heroRight.style.setProperty('--py', '0px');
    });
  }

  /* ---------- magnetic buttons ---------- */
  $$('.btn-contact, .btn-outline, .actions .btn').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
})();
