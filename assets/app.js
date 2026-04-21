// ========= Scroll-spy nav, reveals, mobile menu =========
(function () {
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  const mobile = document.querySelector('.mobile-menu');

  const onScroll = () => {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => {
    const isOpen = mobile.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobile.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      mobile.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Reveal on scroll
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
})();

// ========= Hero carousel =========
(function () {
  const slides = document.querySelectorAll('.hero__slide');
  const indicators = document.querySelectorAll('.hero__indicator');
  if (!slides.length) return;

  let idx = 0;
  let timer = null;
  const INTERVAL = 5000;

  const go = (i) => {
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === idx));
    indicators.forEach((d, k) => {
      d.classList.remove('is-active');
      // Restart the CSS animation by force-reflow
      const fill = d.querySelector('.hero__indicator-fill');
      if (fill) { fill.style.animation = 'none'; void fill.offsetWidth; fill.style.animation = ''; }
    });
    indicators[idx].classList.add('is-active');
  };

  const start = () => {
    stop();
    timer = setInterval(() => go(idx + 1), INTERVAL);
  };
  const stop = () => { if (timer) clearInterval(timer); timer = null; };

  indicators.forEach((d) => {
    d.addEventListener('click', () => {
      const i = parseInt(d.dataset.i, 10);
      go(i);
      start();
    });
  });

  // Pause on tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  start();
})();

// ========= Testimonios carousel =========
(function () {
  const track = document.querySelector('.testimonios__track');
  if (!track) return;
  const slides = Array.from(track.children);
  const dotsWrap = document.querySelector('.testimonios__dots');
  const prev = document.querySelector('.t-prev');
  const next = document.querySelector('.t-next');

  let idx = 0;
  const perView = () => (window.innerWidth < 900 ? 1 : 3);
  const maxIdx = () => Math.max(0, slides.length - perView());

  const render = () => {
    const pv = perView();
    const offset = idx * (100 / pv);
    track.style.transform = `translateX(calc(-${offset}% - ${idx * 24}px))`;
    // dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      const pages = Math.max(1, slides.length - pv + 1);
      for (let i = 0; i < pages; i++) {
        const d = document.createElement('div');
        d.className = 't-dot' + (i === idx ? ' active' : '');
        d.addEventListener('click', () => {
          idx = i;
          render();
        });
        dotsWrap.appendChild(d);
      }
    }
    prev.disabled = idx === 0;
    next.disabled = idx >= maxIdx();
  };

  prev.addEventListener('click', () => {
    idx = Math.max(0, idx - 1);
    render();
  });
  next.addEventListener('click', () => {
    idx = Math.min(maxIdx(), idx + 1);
    render();
  });
  window.addEventListener('resize', () => {
    idx = Math.min(idx, maxIdx());
    render();
  });

  // autoplay
  let auto = setInterval(() => {
    if (idx >= maxIdx()) idx = 0;
    else idx++;
    render();
  }, 6500);
  track.addEventListener('mouseenter', () => clearInterval(auto));

  render();
})();

// ========= Actividades tabs =========
(function () {
  const tabs = document.querySelectorAll('.actividades__tabs .tab');
  const cards = document.querySelectorAll('.act-card');
  tabs.forEach((t) => {
    t.addEventListener('click', () => {
      tabs.forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      const type = t.dataset.type;
      cards.forEach((c) => {
        const show = type === 'todas' || c.dataset.type === type;
        c.style.display = show ? 'flex' : 'none';
      });
    });
  });
})();

// ========= Form validation =========
(function () {
  const form = document.querySelector('.form');
  if (!form) return;
  const ok = document.querySelector('.form__success');

  const validate = (row) => {
    const input = row.querySelector('input, textarea');
    const err = row.querySelector('.form__error');
    const val = input.value.trim();
    let msg = '';
    if (!val) msg = 'Este campo es requerido';
    else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
      msg = 'Correo no válido';
    row.classList.toggle('error', !!msg);
    err.textContent = msg;
    return !msg;
  };

  form.querySelectorAll('.form__row').forEach((row) => {
    const input = row.querySelector('input, textarea');
    input.addEventListener('blur', () => validate(row));
    input.addEventListener('input', () => {
      if (row.classList.contains('error')) validate(row);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('.form__row').forEach((row) => {
      if (!validate(row)) valid = false;
    });
    if (!valid) return;

    // Compose WhatsApp message (number hidden from UI)
    const nombre = form.querySelector('#nombre').value.trim();
    const correo = form.querySelector('#correo').value.trim();
    const mensaje = form.querySelector('#mensaje').value.trim();
    const text = `Hola, soy ${nombre} (${correo}).\n\n${mensaje}`;
    const waNumber = '59175050000';
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

    form.style.display = 'none';
    ok.style.display = 'block';
    window.open(url, '_blank', 'noopener');
  });
})();

// ========= Tweaks (edit-mode) =========
(function () {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
    theme: 'brown',
    type: 'playfair',
    density: 'aireado',
  } /*EDITMODE-END*/;

  const state = { ...TWEAK_DEFAULTS };

  const apply = () => {
    document.body.setAttribute('data-theme', state.theme);
    document.body.setAttribute('data-type', state.type);
    document.body.setAttribute('data-density', state.density);
  };

  const panel = document.querySelector('.tweaks');
  if (!panel) { apply(); return; }

  const wireGroup = (selector, key) => {
    panel.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener('click', () => {
        state[key] = btn.dataset.value;
        panel.querySelectorAll(selector).forEach((b) => b.classList.toggle('active', b.dataset.value === state[key]));
        apply();
        try {
          window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: state[key] } }, '*');
        } catch (e) {}
      });
    });
  };

  const sync = () => {
    panel.querySelectorAll('[data-group="theme"]').forEach((b) => b.classList.toggle('active', b.dataset.value === state.theme));
    panel.querySelectorAll('[data-group="type"]').forEach((b) => b.classList.toggle('active', b.dataset.value === state.type));
    panel.querySelectorAll('[data-group="density"]').forEach((b) => b.classList.toggle('active', b.dataset.value === state.density));
  };

  wireGroup('[data-group="theme"]', 'theme');
  wireGroup('[data-group="type"]', 'type');
  wireGroup('[data-group="density"]', 'density');

  panel.querySelector('.tweaks__close').addEventListener('click', () => {
    panel.classList.remove('visible');
    try { window.parent.postMessage({ type: '__deactivate_edit_mode' }, '*'); } catch (e) {}
  });

  // Edit mode protocol
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === '__activate_edit_mode') {
      panel.classList.add('visible');
      sync();
    } else if (d.type === '__deactivate_edit_mode') {
      panel.classList.remove('visible');
    }
  });

  apply();
  sync();

  try {
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  } catch (e) {}
})();
