/* Site-wide floating controls: ambient sound tab + social rail (every page) */
(() => {
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };
  const root = document.documentElement;

  /* ---------- social rail ---------- */
  const rail = document.createElement('div');
  rail.className = 'social-rail';
  rail.setAttribute('aria-label', 'Social links');
  rail.innerHTML = [
    ['https://www.instagram.com/asifghayaz/', 'Instagram', 'fa-instagram', 'ig'],
    ['https://www.facebook.com/asif.ghayaz/', 'Facebook', 'fa-facebook-f', 'fb'],
    ['https://wa.me/+923463355657', 'WhatsApp', 'fa-whatsapp', 'wa'],
  ].map(([h, l, ic, c]) => `<a href="${h}" target="_blank" rel="noopener" class="${c}" data-label="${l}" aria-label="${l}"><i class="fa-brands ${ic}"></i></a>`).join('');
  document.body.appendChild(rail);
  root.classList.add('has-rail');   // hides the older static icons

  /* ---------- sound tab ---------- */
  const soundBtn = document.createElement('button');
  soundBtn.className = 'sound-tab'; soundBtn.type = 'button'; soundBtn.id = 'soundBtn';
  soundBtn.setAttribute('aria-pressed', 'false');
  soundBtn.innerHTML = '<span class="eq"><i></i><i></i><i></i></span><span class="tg-txt">Sound off</span>';
  document.body.appendChild(soundBtn);

  const paintSound = () => {
    const ur = root.lang === 'ur';
    const t = soundBtn.querySelector('.tg-txt');
    if (t) t.textContent = on ? (ur ? 'آواز چالو' : 'Sound on') : (ur ? 'آواز بند' : 'Sound off');
  };
  new MutationObserver(() => paintSound()).observe(root, { attributes: true, attributeFilter: ['lang'] });

  /* ================================================================
     AMBIENT SOUND — synthesised with Web Audio (no audio file needed)
  ================================================================ */
  let ac = null, master = null, bellTimer = 0, on = false, nodes = [];
  const AC = window.AudioContext || window.webkitAudioContext;

  const build = () => {
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);

    // soft hall reverb from decaying noise
    const len = ac.sampleRate * 3.2, buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const conv = ac.createConvolver(); conv.buffer = buf;
    const wet = ac.createGain(); wet.gain.value = 0.7;
    conv.connect(wet); wet.connect(master);

    // warm pad: A minor add9, each note doubled and slightly detuned
    const filt = ac.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 800; filt.Q.value = 0.5;
    const pad = ac.createGain(); pad.gain.value = 0.16;
    filt.connect(pad); pad.connect(master); pad.connect(conv);
    [110, 164.81, 220, 261.63, 329.63, 493.88].forEach((f, i) => {
      [-7, 7].forEach(det => {
        const o = ac.createOscillator();
        o.type = i % 2 ? 'triangle' : 'sawtooth'; o.frequency.value = f; o.detune.value = det;
        const g = ac.createGain(); g.gain.value = i < 2 ? 0.22 : 0.12;
        o.connect(g); g.connect(filt); o.start(); nodes.push(o);
      });
    });
    // slow filter breathing
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.06;
    const lg = ac.createGain(); lg.gain.value = 320;
    lfo.connect(lg); lg.connect(filt.frequency); lfo.start(); nodes.push(lfo);

    // occasional bell notes (A minor pentatonic)
    const scale = [440, 523.25, 587.33, 659.25, 783.99, 880];
    const bell = () => {
      if (!on) return;
      const f = scale[Math.floor(Math.random() * scale.length)];
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const t = ac.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
      o.connect(g); g.connect(master); g.connect(conv);
      o.start(t); o.stop(t + 3.8);
      bellTimer = setTimeout(bell, 3500 + Math.random() * 5000);
    };
    bell.start = () => { clearTimeout(bellTimer); bellTimer = setTimeout(bell, 1200); };
    build.bell = bell;
  };

  const setSound = want => {
    if (!AC) { soundBtn.style.display = 'none'; return; }
    if (want && !ac) build();
    on = want;
    soundBtn.classList.toggle('on', on);
    soundBtn.setAttribute('aria-pressed', String(on));
    paintSound();
    store.set('sound', on ? '1' : '0');
    if (!ac) return;
    if (on) {
      ac.resume();
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setTargetAtTime(0.55, ac.currentTime, 0.8);
      build.bell.start();
    } else {
      clearTimeout(bellTimer);
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setTargetAtTime(0, ac.currentTime, 0.35);
      setTimeout(() => { if (!on && ac) ac.suspend(); }, 1600);
    }
  };
  soundBtn.addEventListener('click', () => setSound(!on));
  // browsers block audio until a gesture, so the page always starts silent.

  /* ---------- keep playing across pages ---------- */
  // Browsers only allow audio after a click, so if the visitor left it on, it
  // resumes on the new page as soon as they touch anything.
  if (store.get('sound') === '1') {
    setSound(true);
    if (ac && ac.state !== 'running') {
      const wake = () => {
        ac.resume();
        ['pointerdown', 'keydown', 'touchend'].forEach(ev => removeEventListener(ev, wake, true));
      };
      ['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, wake, true));
    }
  }
})();
