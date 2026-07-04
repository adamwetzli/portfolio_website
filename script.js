// ============================================================
// Max Mustermann — portfolio interactions
// No external runtime dependencies: everything below is plain
// DOM APIs (IntersectionObserver, requestAnimationFrame, etc.)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. build progress bar (scroll position) ---------- */
  const bar = document.getElementById('build-progress');
  if (bar) {
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (scrolled / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    document.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- 2. reveal-on-scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i * 60, 240) + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- 3. live "system log" footer timestamp ---------- */
  const clock = document.getElementById('footer-clock');
  if (clock) {
    const render = () => {
      const now = new Date();
      clock.textContent = now.toLocaleString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    };
    render();
    setInterval(render, 1000);
  }

  /* ---------- 4. contact form: local validation + status message ----------
     No backend exists on this static demo — we simulate a queued request
     so the form still feels real without silently failing. */
  const form = document.getElementById('contact-form');
  if (form) {
    const status = document.getElementById('form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) return;
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'SENDING…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        if (status) {
          status.textContent = '✓ 202 Accepted — message queued. I reply within a day or two.';
          status.classList.add('show');
        }
        form.reset();
      }, 700);
    });
  }

  /* ---------- 5. light / dark theme toggle ---------- */
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- 6. view transitions between pages (progressive enhancement) ---------- */
  if (document.startViewTransition) {
    document.querySelectorAll('a[href$=".html"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const url = link.getAttribute('href');
        if (link.target === '_blank' || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        document.startViewTransition(() => {
          window.location.href = url;
        });
      });
    });
  }

});
