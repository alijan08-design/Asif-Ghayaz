/* 3D ring gallery — Three.js (r128 global build). Home page only. */
(() => {
  /* ---------- artworks ---------- */
  const P = 'images/3d/asif-ghayaz-';
  const FULL = {
    mp: n => `images/pen-and-ink/masterpieces/asif-ghayaz-pen-and-ink-masterpiece-${n}.webp`,
    hs: n => `images/pen-and-ink/horses/asif-ghayaz-pen-and-ink-horse-${n}.webp`,
    ls: n => `images/landscapes/asif-ghayaz-landscape-painting-${n}.webp`,
    cl: n => `images/calligraphy/asif-ghayaz-islamic-calligraphy-${n}.webp`,
  };
  const works = [
    ['mp', '46', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
    ['hs', '09', 'Pen & Ink Horse Study', 'pen-and-ink-horse'],
    ['mp', '12', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
    ['ls', '17', 'Landscape Painting', 'landscape-painting'],
    ['mp', '33', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
    ['cl', '03', 'Islamic Calligraphy', 'islamic-calligraphy'],
    ['mp', '01', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
    ['hs', '04', 'Pen & Ink Horse Study', 'pen-and-ink-horse'],
    ['mp', '29', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
    ['ls', '12', 'Landscape Painting', 'landscape-painting'],
    ['mp', '05', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
    ['cl', '13', 'Islamic Calligraphy', 'islamic-calligraphy'],
    ['mp', '20', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
    ['hs', '01', 'Pen & Ink Horse Study', 'pen-and-ink-horse'],
    ['mp', '44', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
    ['mp', '21', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
    ['mp', '48', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
    ['mp', '03', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
    ['mp', '50', 'Pen & Ink Masterpiece', 'pen-and-ink-masterpiece'],
  ];
  const wrap = document.querySelector('.g3d-stage');
  if (!wrap) { document.getElementById('gallery3d')?.remove(); return; }

  /* WebGL cannot read local files (file://), and needs Three.js + WebGL: otherwise use a CSS 3D ring */
  const useCss = location.protocol === 'file:' || typeof THREE === 'undefined' || location.search.includes('css3d');
  if (useCss) { cssRing(); return; }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = wrap.querySelector('canvas');
  const label = wrap.querySelector('.g3d-label');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { document.getElementById('gallery3d')?.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

  const N = works.length;
  // every artwork is fitted inside the same box, and the ring is sized so neighbours never touch
  const WMAX = 2.0, HMAX = 2.8, GAP = 0.9;
  const R = (WMAX + GAP) / (2 * Math.sin(Math.PI / N));
  const fit = asp => (HMAX * asp > WMAX ? [WMAX, WMAX / asp] : [HMAX * asp, HMAX]);

  const ring = new THREE.Group();
  scene.add(ring);
  const items = [];
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  works.forEach((w, i) => {
    const a = (i / N) * Math.PI * 2;
    const mat = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide, transparent: true });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.scale.set(fit(0.72)[0], fit(0.72)[1], 1);
    mesh.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
    mesh.rotation.y = a;
    mesh.userData = { i, a, full: FULL[w[0]](w[1]), title: `${w[2]} ${w[1]}`, alt: `${w[2]} ${w[1]} by Asif Ghayaz`, s: 1 };
    ring.add(mesh);
    items.push(mesh);
    loader.load(`${P}${w[3]}-${w[1]}-3d.webp`, tex => {
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = maxAniso;
      mat.map = tex; mat.color.setScalar(1); mat.needsUpdate = true;
      mesh.userData.ready = true;
      mesh.userData.asp = tex.image.width / tex.image.height;
    });
  });

  /* floor glow + gold dust */
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(R * 1.35, 64),
    new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.05, depthWrite: false })
  );
  glow.rotation.x = -Math.PI / 2; glow.position.y = -HMAX / 2 - 0.25;
  scene.add(glow);

  const dustN = 260, pos = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    const r = R * (0.4 + Math.random() * 1.3), t = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.sin(t) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * 7; pos[i * 3 + 2] = Math.cos(t) * r;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xe2c47a, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dust);

  /* ---------- interaction state ---------- */
  let target = 0, rot = 0, vel = 0;
  let dragging = false, moved = 0, lastX = 0, mx = 0, my = 0, hover = null;
  let visible = false, lastScroll = scrollY;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

  const resize = () => {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.set(0, 0.35, R + (w < 640 ? 7.2 : 5.6));
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(wrap);
  resize();

  const setNdc = e => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    mx = ndc.x; my = ndc.y;
  };
  const pick = () => {
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(items)[0];
    return hit && hit.object.userData.ready ? hit.object : null;
  };

  canvas.addEventListener('pointerdown', e => {
    dragging = true; moved = 0; lastX = e.clientX; vel = 0;
    canvas.setPointerCapture(e.pointerId); wrap.classList.add('grab');
  });
  canvas.addEventListener('pointermove', e => {
    setNdc(e);
    if (dragging) {
      const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
      const d = -dx * 0.0042; target += d; vel = d;
    } else if (e.pointerType === 'mouse') {
      hover = pick();
    }
  });
  const end = e => {
    if (!dragging) return;
    dragging = false; wrap.classList.remove('grab');
    if (moved < 6) {
      setNdc(e);
      const o = pick();
      if (o && window.__openArtwork) window.__openArtwork(o.userData.full, o.userData.alt);
    } else {
      target += vel * 14; // inertia
    }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', () => { if (!dragging) hover = null; });

  addEventListener('keydown', e => {
    if (!visible || document.querySelector('.lb.open')) return;
    if (e.key === 'ArrowRight') target += (Math.PI * 2) / N;
    if (e.key === 'ArrowLeft') target -= (Math.PI * 2) / N;
  });
  wrap.querySelectorAll('[data-g3d]').forEach(b => b.addEventListener('click', () => {
    target += Number(b.dataset.g3d) * ((Math.PI * 2) / N);
  }));

  /* page scroll nudges the ring */
  addEventListener('scroll', () => {
    if (!visible) { lastScroll = scrollY; return; }
    target += (scrollY - lastScroll) * 0.0016; lastScroll = scrollY;
  }, { passive: true });

  new IntersectionObserver(es => {
    visible = es[0].isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
  }, { rootMargin: '200px' }).observe(wrap);

  /* ---------- loop ---------- */
  let raf = 0, t0 = performance.now();
  const tick = now => {
    raf = 0;
    if (!visible) return;
    const dt = Math.min((now - t0) / 1000, 0.05); t0 = now;
    if (!dragging && !reduce && !hover) target += dt * 0.07;
    rot += (target - rot) * Math.min(1, dt * 5);
    ring.rotation.y = rot;
    ring.rotation.x = my * -0.05;
    camera.position.x += (mx * 0.9 - camera.position.x) * 0.05;
    camera.lookAt(0, 0, 0);
    dust.rotation.y += dt * 0.02;

    let best = 0, bestI = 0;
    items.forEach(m => {
      const ang = Math.atan2(Math.sin(m.userData.a + rot), Math.cos(m.userData.a + rot)); // 0 = front
      const f = Math.max(0, Math.cos(ang));
      if (f > best) { best = f; bestI = m.userData.i; }
      const tint = 0.22 + 0.78 * f;
      if (m.userData.ready) m.material.color.setScalar(tint);
      const want = m === hover ? 1.06 : 1;
      m.userData.s += (want - m.userData.s) * 0.14;
      const [fw, fh] = fit(m.userData.asp || 0.72);
      m.scale.set(fw * m.userData.s, fh * m.userData.s, 1);
    });
    const front = hover || items[bestI];
    if (label && front) label.textContent = front.userData.title;
    canvas.style.cursor = hover ? 'pointer' : (dragging ? 'grabbing' : 'grab');
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  /* ================================================================
     CSS 3D fallback — same ring, plain <img> elements
  ================================================================ */
  function cssRing() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = wrap.querySelector('canvas'); if (canvas) canvas.remove();
    const label = wrap.querySelector('.g3d-label');
    const scene = document.createElement('div'); scene.className = 'c3d';
    const ring = document.createElement('div'); ring.className = 'c3d-ring';
    scene.appendChild(ring); wrap.prepend(scene);
    const N = works.length;
    const els = works.map((w, i) => {
      const f = document.createElement('figure'); f.className = 'c3d-item';
      const img = new Image(); img.src = `${P}${w[3]}-${w[1]}-3d.webp`; img.alt = `${w[2]} ${w[1]} by Asif Ghayaz`; img.draggable = false;
      f.appendChild(img); ring.appendChild(f);
      f.userData = { a: (i / N) * 360, full: FULL[w[0]](w[1]), alt: img.alt, title: `${w[2]} ${w[1]}` };
      return f;
    });
    let H = 300, R = 800;
    const layout = () => {
      H = Math.max(200, Math.min(wrap.clientHeight * 0.58, 380));
      const W = H * 0.78, GAPPX = Math.max(34, H * 0.12);
      R = (W + GAPPX) / (2 * Math.sin(Math.PI / N));
      scene.style.setProperty('--h', H + 'px');
      scene.style.setProperty('--w', W + 'px');
      els.forEach(f => { f.style.transform = `translate(-50%,-50%) rotateY(${f.userData.a}deg) translateZ(${R}px)`; });
    };
    new ResizeObserver(layout).observe(wrap); layout();

    let target = 0, rot = 0, vel = 0, dragging = false, moved = 0, lastX = 0, hover = null, visible = false, lastScroll = scrollY, down = null;
    ring.addEventListener('pointerover', e => { hover = e.target.closest('.c3d-item'); });
    ring.addEventListener('pointerout', () => { hover = null; });
    scene.addEventListener('pointerdown', e => {
      dragging = true; moved = 0; lastX = e.clientX; vel = 0; down = e.target.closest('.c3d-item');
      scene.setPointerCapture(e.pointerId); wrap.classList.add('grab');
    });
    scene.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
      const d = -dx * 0.24; target += d; vel = d;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false; wrap.classList.remove('grab');
      if (moved < 6 && down && window.__openArtwork) window.__openArtwork(down.userData.full, down.userData.alt);
      else target += vel * 14;
    };
    scene.addEventListener('pointerup', end); scene.addEventListener('pointercancel', end);
    addEventListener('keydown', e => {
      if (!visible || document.querySelector('.lb.open')) return;
      if (e.key === 'ArrowRight') target += 360 / N;
      if (e.key === 'ArrowLeft') target -= 360 / N;
    });
    wrap.querySelectorAll('[data-g3d]').forEach(b => b.addEventListener('click', () => { target += Number(b.dataset.g3d) * (360 / N); }));
    addEventListener('scroll', () => {
      if (visible) target += (scrollY - lastScroll) * 0.09; lastScroll = scrollY;
    }, { passive: true });
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); }, { rootMargin: '200px' }).observe(wrap);

    let raf = 0, t0 = performance.now();
    const tick = now => {
      raf = 0; if (!visible) return;
      const dt = Math.min((now - t0) / 1000, 0.05); t0 = now;
      if (!dragging && !reduce && !hover) target += dt * 4;
      rot += (target - rot) * Math.min(1, dt * 5);
      ring.style.transform = `translateZ(${-R}px) rotateY(${rot}deg)`;
      let best = -1, bi = 0;
      els.forEach((f, i) => {
        let ang = ((f.userData.a + rot) % 360 + 540) % 360 - 180;   // 0 = facing the viewer
        const k = Math.max(0, Math.cos(ang * Math.PI / 180));
        if (k > best) { best = k; bi = i; }
        f.style.filter = `brightness(${(0.25 + 0.75 * k).toFixed(2)})`;
      });
      const front = hover || els[bi];
      if (label) label.textContent = front.userData.title;
      scene.style.cursor = hover ? 'pointer' : (dragging ? 'grabbing' : 'grab');
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
})();
