/* ── Custom Cursor ─────────────────────────────────────────────────── */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
if (dot && ring) {
  let rx = 0, ry = 0, mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  function lerp(a, b, t) { return a + (b - a) * t; }
  (function animRing() {
    rx = lerp(rx, mx, 0.12); ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('a, button, .btn, .pill, .acc-card, .edu-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ── Theme Toggle ──────────────────────────────────────────────────── */
const themeBtn = document.getElementById('theme-toggle');
const moonIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>`;
const sunIcon  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

let isDark = true;
if (themeBtn) {
  themeBtn.innerHTML = moonIcon;
  themeBtn.addEventListener('click', () => {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeBtn.innerHTML = isDark ? moonIcon : sunIcon;
  });
}

/* ── Navbar ────────────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const indicator = document.getElementById('nav-indicator');

if (navbar) {
  setTimeout(() => navbar.classList.add('visible'), 0);
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink();
  });
}

function updateActiveLink() {
  if (!indicator || !navLinks.length) return;
  const sections = ['hero','featured','about','experience','accomplishments','education','projects','writing','freelance','contact'];
  let current = 'hero';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 140) current = id;
  });
  navLinks.forEach(link => {
    const active = link.dataset.section === current;
    link.classList.toggle('active', active);
    if (active) {
      const rect = link.getBoundingClientRect();
      const navRect = navbar.getBoundingClientRect();
      indicator.style.left = (rect.left - navRect.left) + 'px';
      indicator.style.width = rect.width + 'px';
    }
  });
}
updateActiveLink();

/* ── Hero Animation Sequence ──────────────────────────────────────── */
const heroName = document.querySelector('.hero-name');
if (heroName) {
  (function() {
    function splitChars(el) {
      const text = el.textContent;
      el.innerHTML = '';
      [...text].forEach(ch => {
        const span = document.createElement('span');
        span.className = ch === ' ' ? 'char space' : 'char';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(span);
      });
    }
    splitChars(heroName);
    const badge = document.querySelector('.hero-badge');
    if (badge) { badge.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)'; badge.style.opacity = '1'; badge.style.transform = 'translateY(0)'; }
    const chars = heroName.querySelectorAll('.char');
    chars.forEach((ch, i) => {
      setTimeout(() => {
        ch.style.transition = `opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out), filter 0.5s var(--ease-out)`;
        ch.style.opacity = '1';
        ch.style.transform = 'translateY(0)';
        ch.style.filter = 'blur(0)';
      }, 200 + i * 50);
    });
    setTimeout(() => {
      const sub = document.querySelector('.hero-subtitle');
      if (sub) { sub.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)'; sub.style.opacity = '1'; sub.style.transform = 'translateY(0)'; }
    }, 600);
    setTimeout(() => {
      const tag = document.querySelector('.hero-tagline');
      if (tag) { tag.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)'; tag.style.opacity = '1'; tag.style.transform = 'translateY(0)'; }
    }, 800);
    setTimeout(() => {
      const ctas = document.querySelector('.hero-ctas');
      if (ctas) { ctas.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)'; ctas.style.opacity = '1'; ctas.style.transform = 'scale(1)'; }
    }, 1000);
    setTimeout(() => {
      const dg = document.getElementById('dot-grid');
      if (dg) dg.classList.add('visible');
    }, 1200);
  })();
}

/* ── Scroll Reveal ─────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.style.transition = `opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)`;
    el.style.transitionDelay = el.dataset.delay || '0ms';
    el.classList.add('revealed');
    el.style.opacity = '1'; el.style.transform = 'none';
    revealObserver.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

// AIdeaS card
const aideaCard = document.querySelector('.aideas-card');
if (aideaCard) {
  const aideaObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      aideaCard.style.transition = 'opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out)';
      aideaCard.classList.add('revealed');
      setTimeout(() => aideaCard.classList.add('border-active'), 700);
      aideaObs.disconnect();
    }
  }, { threshold: 0.2 });
  aideaObs.observe(aideaCard);
}

// About reveal
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Pills spring pop
const pillsGrid = document.querySelector('.pills-grid');
if (pillsGrid) {
  const pillObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    document.querySelectorAll('.pill').forEach((pill, i) => {
      setTimeout(() => {
        pill.style.transition = 'opacity 0.4s var(--ease-out), transform 0.4s var(--ease-out)';
        pill.style.opacity = '1';
        pill.style.transform = 'scale(1.08)';
        setTimeout(() => { pill.style.transform = 'scale(1)'; }, 180);
      }, i * 40);
    });
    pillObs.disconnect();
  }, { threshold: 0.1 });
  pillObs.observe(pillsGrid);
}

// Timeline
const tlLine = document.querySelector('.timeline-line');
if (tlLine) {
  const tlObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { tlLine.classList.add('drawn'); tlObs.disconnect(); }
  }, { threshold: 0.05 });
  tlObs.observe(tlLine);
}
document.querySelectorAll('.timeline-entry').forEach((entry, i) => {
  const entObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    setTimeout(() => {
      entry.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)';
      entry.classList.add('revealed');
      const dotEl = entry.querySelector('.timeline-dot');
      if (dotEl) dotEl.classList.add('pulse');
    }, i * 80);
    entObs.disconnect();
  }, { threshold: 0.1 });
  entObs.observe(entry);
});

// Cards
document.querySelectorAll('.acc-card').forEach((card, i) => { card.dataset.delay = (i * 80) + 'ms'; revealObserver.observe(card); });
document.querySelectorAll('.edu-card').forEach((card, i) => { card.dataset.delay = (i * 100) + 'ms'; revealObserver.observe(card); });
document.querySelectorAll('.section-title, .section-label, .about-bio').forEach(el => { el.classList.add('reveal'); revealObserver.observe(el); });
document.querySelectorAll('.project-card').forEach((card, i) => { card.dataset.delay = (i * 100) + 'ms'; revealObserver.observe(card); });
document.querySelectorAll('.writing-card:not(.writing-soon)').forEach((card, i) => { card.dataset.delay = (i * 100) + 'ms'; revealObserver.observe(card); });
document.querySelectorAll('.freelance-card').forEach((card, i) => { card.dataset.delay = (i * 80) + 'ms'; revealObserver.observe(card); });
document.querySelectorAll('.freelance-cta, .freelance-sub').forEach(el => { el.classList.add('reveal'); revealObserver.observe(el); });

/* ── Magnetic Buttons ─────────────────────────────────────────────── */
document.querySelectorAll('.btn-magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ── Smooth scroll for CTAs ───────────────────────────────────────── */
document.querySelectorAll('[data-scroll]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.scroll);
    if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  });
});

/* ── Page tracking ────────────────────────────────────────────────── */
window.trackPage = function(page) {
  const key = 'sj_tracked_' + page;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page }),
  }).catch(() => {});
};

/* ── Contact form ─────────────────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    const status = document.getElementById('contact-status');
    const btn = document.getElementById('cf-submit');

    status.className = '';
    status.style.display = 'none';

    if (!name || !email || !message) {
      status.textContent = 'Please fill in all fields.';
      status.className = 'error';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error();
      status.textContent = "Thanks! I'll get back to you within 24 hours.";
      status.className = 'success';
      contactForm.reset();
    } catch {
      status.textContent = 'Something went wrong. Please email me directly at sj.samyakj@gmail.com';
      status.className = 'error';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message →';
    }
  });
}
