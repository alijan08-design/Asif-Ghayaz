/* Home-page extras: English / Urdu switch */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };

  /* ---------- header buttons ---------- */
  const nav = $('header nav');
  const contactBtn = $('header nav .btn-contact');
  if (!nav || !contactBtn) return;

  const langBtn = document.createElement('button');
  langBtn.className = 'tg-btn'; langBtn.type = 'button'; langBtn.id = 'langBtn';
  langBtn.setAttribute('aria-label', 'Switch language');
  langBtn.innerHTML = '<i class="fa-solid fa-language"></i><span class="tg-txt">اردو</span>';

  nav.insertBefore(langBtn, contactBtn);


  /* ================================================================
     ENGLISH  /  URDU
  ================================================================ */
  const T = [
    // [selector, [urdu per element], useHTML]
    ['nav > a[href="#home"]', ['صفحۂ اول']],
    ['nav > a[href="#about"]', ['تعارف']],
    ['nav > a.btn-contact', ['رابطہ']],
    ['nav .dropdown > button', ['گیلری']],
    ['.dropdown-item', ['خطاطی', 'منظر نگاری', 'قلم و سیاہی', 'شاہکار', 'عام', 'گھوڑے', 'تعمیرات', 'دیگر']],
    ['.hero .kicker', ['نمایاں فنکار']],
    ['.tagline', ['آصف غیاض قلم و سیاہی کے باریک بیں پورٹریٹس اور تعمیراتی خاکے تخلیق کرتے ہیں، جن میں یاد، مقام اور مہارت ایک ساتھ سمٹ آتے ہیں۔']],
    ['.actions .btn', ['گیلری دیکھیں', 'کمیشن کی درخواست']],
    ['.hero-left > div[style]', ['پاکستان بھر میں نمائشیں • ادارہ جاتی اشاعتوں میں شامل کام']],
    ['.g3d-head .kicker', ['انٹرایکٹو']],
    ['.g3d-head h3', ['گیلری میں گھومیں']],
    ['.g3d-head p', ['حلقے کو گھمانے کے لیے ڈریگ کریں۔ کسی بھی فن پارے پر کلک کر کے اسے مکمل سائز میں دیکھیں۔']],
    ['.g3d-hint', ['<i class="fa-solid fa-hand"></i> ڈریگ &nbsp;·&nbsp; اسکرول &nbsp;·&nbsp; کلک'], true],
    ['.gallery-section h3', ['قلم و سیاہی', 'منظر نگاری', 'خطاطی', 'دیگر فن پارے']],
    ['.bio h3', ['آصف غیاض کے بارے میں']],
    ['.bio > p', [
      'آصف غیاض پاکستان کے فنکار ہیں جو باریک قلم و سیاہی کی ڈرائنگز اور مکسڈ میڈیا پینٹنگز کے لیے جانے جاتے ہیں۔ انہوں نے اقبال مہدی کی شاگردی میں تربیت پائی۔ ان کے کام میں نظم و ضبط والی ڈرافٹسمین شپ کے ساتھ جگہ اور ساخت کا گہرا شعور نظر آتا ہے۔ قریبی پورٹریٹس سے لے کر تعمیراتی مطالعات تک، ان کے فن پارے باریک لکیروں کے ذریعے یاد، مقام اور خاموش کہانیاں بیان کرتے ہیں۔',
      'پاکستان بھر کی گیلریوں میں نمائشوں کے علاوہ، آصف کے خاکے اور فن پارے ادارہ جاتی اشاعتوں اور کیلنڈروں کے لیے بھی بنائے گئے ہیں، جو ظاہر کرتا ہے کہ ان کا کام عکاسی اور فائن آرٹ کے درمیان بآسانی سفر کرتا ہے۔']],
    ['.bio h4', ['تربیت اور اثرات', 'نمایاں کامیابیاں']],
    ['.bio li', ['اقبال مہدی کی شاگردی', 'مشاہداتی ڈرائنگ اور تکنیکی ڈرافٹسمین شپ کی ابتدائی تربیت', 'ادارہ جاتی پرنٹ میڈیا میں شمولیت (AKUH منصوبے)', 'پاکستان کی بڑی گیلریوں میں انفرادی اور گروپ نمائشیں']],
    ['.side-card h4', ['نمائشیں', 'اشاعتیں']],
    ['.side-card p', ['کروماٹک فیلڈز — انفرادی (جون 2024)', 'میٹریل ایکوز — گروپ (نومبر 2023)', 'نمایاں: کنٹیمپریری آرٹ ریویو (2024) • AKUH اشاعتیں']],
    ['#contact > h3', ['رابطہ اور کمیشن']],
    ['.contact-form h2', ['ہم سے رابطہ کریں']],
    ['.contact-form .subtitle', ['نیچے فارم پُر کریں، ہم جلد آپ سے رابطہ کریں گے۔']],
    ['.form-group label', ['نام *', 'ای میل *', 'موضوع', 'پیغام *']],
    ['#contactForm button', ['ای میل کے ذریعے بھیجیں', 'واٹس ایپ کے ذریعے بھیجیں']],
    ['.contact-aside h4', ['اسٹوڈیو اور سوشل', 'نیوز لیٹر']],
    ['.contact-aside > p', ['اسٹوڈیو وزٹ اپائنٹمنٹ پر۔ مقام: (شہر)', 'نمائشوں اور نئے کام کی اطلاعات حاصل کریں۔']],
    ['.contact-aside form button', ['سبسکرائب']],
    ['footer', ['© <span id="year"></span> آصف غیاض — جملہ حقوق محفوظ ہیں'], true],
  ];
  const RTL = ['.hero-left', '.g3d-head', '.gallery-section h3', '.bio', '.side-card', '#contact > h3', '.contact-form', '.contact-aside', 'footer'];
  const SLIDE_UR = {
    'Pen & ink masterpiece': 'قلم و سیاہی کا شاہکار',
    'Horse study in pen & ink': 'قلم و سیاہی میں گھوڑے کا مطالعہ',
    'Landscape painting': 'منظر نگاری',
    'Islamic calligraphy': 'اسلامی خطاطی',
  };
  const MARQUEE_UR = ['قلم و سیاہی', 'منظر نگاری', 'خطاطی', 'پورٹریٹس', 'تعمیرات', 'گھوڑے', 'ساکن زندگی', 'تجریدی فن'];
  const FLIP_UR = ['قلم و سیاہی', 'منظر نگاری', 'خطاطی', 'تعمیرات', 'گھوڑے'];
  const HEADLINE = { en: 'Drawn lines, layered memory', ur: 'لکیروں میں بسی، تہ در تہ یادیں' };
  const EN_MARQUEE = ['Pen &amp; Ink', 'Landscapes', 'Calligraphy', 'Portraits', 'Architecture', 'Horses', 'Still Life', 'Abstract'];
  const EN_FLIP = ['Pen &amp; Ink', 'Landscapes', 'Calligraphy', 'Architecture', 'Horses'];

  // remember the English originals once
  T.forEach(([sel]) => $$(sel).forEach(el => { if (el.dataset.en === undefined) el.dataset.en = el.innerHTML; }));
  const placeholder = $('#subscribe-email');
  const enPlaceholder = placeholder ? placeholder.placeholder : '';
  const slides = $$('.hero-slide');
  slides.forEach(s => { s.dataset.titleEn = s.dataset.title; });

  const paintLabels = () => {
    const ur = document.documentElement.lang === 'ur';
    const lt = $('.tg-txt', langBtn);
    if (lt) lt.textContent = ur ? 'English' : 'اردو';
  };

  const applyLang = lang => {
    const ur = lang === 'ur';
    document.documentElement.lang = ur ? 'ur' : 'en';
    if (ur && !$('#urdu-font')) {
      const l = document.createElement('link');
      l.id = 'urdu-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600&display=swap';
      document.head.appendChild(l);
    }
    T.forEach(([sel, list, html]) => {
      $$(sel).forEach((el, i) => {
        if (ur) { if (list[i] === undefined) return; el.innerHTML = list[i]; }
        else if (el.dataset.en !== undefined) el.innerHTML = el.dataset.en;
      });
    });
    RTL.forEach(sel => $$(sel).forEach(el => el.classList.toggle('ur-rtl', ur)));
    if (placeholder) placeholder.placeholder = ur ? 'آپ کا ای میل' : enPlaceholder;

    const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
    const fx = window.__fx || {};
    if (fx.setHeadline) fx.setHeadline(ur ? HEADLINE.ur : HEADLINE.en);
    if (fx.setFlip) fx.setFlip(ur ? 'مہارت:' : 'Mastery in', ur ? FLIP_UR : EN_FLIP);
    if (fx.setMarquee) fx.setMarquee(ur ? MARQUEE_UR : EN_MARQUEE);
    if (fx.setCounts) fx.setCounts(n => (ur ? `${n} فن پارے` : `${n} works`));
    slides.forEach(s => { s.dataset.title = ur ? (SLIDE_UR[s.dataset.titleEn] || s.dataset.titleEn) : s.dataset.titleEn; });
    const active = slides.find(s => s.classList.contains('active'));
    const ht = $('.hero-title'); if (ht && active) ht.textContent = active.dataset.title;

    paintLabels();
    store.set('lang', ur ? 'ur' : 'en');
  };

  langBtn.addEventListener('click', () => applyLang(document.documentElement.lang === 'ur' ? 'en' : 'ur'));

  // run after anim.js has built the hero pieces
  const init = () => {
    paintLabels();
    if (store.get('lang') === 'ur') applyLang('ur');
  };
  if (document.readyState === 'complete') init(); else addEventListener('load', init);
})();
