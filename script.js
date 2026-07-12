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

    /* ---------- 4. contact form: open email client with pre-filled message ---------- */
  const form = document.getElementById('contact-form');
  if (form) {
    const status = document.getElementById('form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      
      const subject = `Contact from ${name}`;
      const body = `Name: ${name}%0AEmail: ${email}%0A%0AMessage:%0A${encodeURIComponent(message)}`;
      
      // Try to detect if user is on a specific email provider
      // Option 1: Gmail
      const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=adam.wetzli@gmail.com&su=${encodeURIComponent(subject)}&body=${body}`;
      
      // Option 2: Outlook.com (personal)
      const outlookLink = `https://outlook.live.com/mail/0/deeplink/compose?to=adam.wetzli@gmail.com&subject=${encodeURIComponent(subject)}&body=${body}`;
      
      // Option 3: Office 365 / Work Outlook
      const officeLink = `https://outlook.office.com/mail/deeplink/compose?to=adam.wetzli@gmail.com&subject=${encodeURIComponent(subject)}&body=${body}`;
      
      // Option 4: Yahoo Mail
      const yahooLink = `https://compose.mail.yahoo.com/?to=adam.wetzli@gmail.com&subject=${encodeURIComponent(subject)}&body=${body}`;
      
      // Default: Try Gmail first (most common)
      window.open(gmailLink, '_blank');
      
      // Also try mailto: as fallback for desktop clients
      const mailtoLink = `mailto:adam.wetzli@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 500);
      
      if (status) {
        status.textContent = '✓ Opening email — please send the message!';
        status.classList.add('show');
        status.style.color = 'var(--signal)';
      }
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

  /* ---------- 7. PDF download ---------- */
  const pdfBtn = document.getElementById('download-pdf');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', function() {
      // Get the section you want to export
      const element = document.querySelector('.section-tight');
      
      // Configuration for the PDF
      const opt = {
        margin:        [8, 8, 8, 8],
        filename:     'CV_Adam_Scheuerlein.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // Generate and download the PDF
      html2pdf().set(opt).from(element).save();
    });
  }

  /* ---------- 8. Email copy modal ---------- */
  const emailTrigger = document.getElementById('email-copy-trigger');
  const emailModal = document.getElementById('email-modal');
  const modalClose = document.getElementById('email-modal-close');
  const copyBtn = document.getElementById('copy-email-btn');
  const emailAddress = document.getElementById('email-address');

  if (emailTrigger && emailModal) {
    // Open modal
    emailTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      emailModal.classList.add('show');
    });

    // Close modal
    const closeModal = () => {
      emailModal.classList.remove('show');
      // Reset copy button text
      if (copyBtn) {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }
    };

    modalClose.addEventListener('click', closeModal);

    // Close on background click
    emailModal.addEventListener('click', (e) => {
      if (e.target === emailModal) {
        closeModal();
      }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && emailModal.classList.contains('show')) {
        closeModal();
      }
    });

    // Copy email
    if (copyBtn && emailAddress) {
      copyBtn.addEventListener('click', async () => {
        const email = emailAddress.textContent;
        try {
          await navigator.clipboard.writeText(email);
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = email;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      });
    }
  }

  /* ---------- 9. cursor duck: a little friend that waddles to the pointer ---------- */
  (function initCursorDuck(){
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (prefersReducedMotion || !hasFinePointer) return;

    const duck = document.createElement('div');
    duck.id = 'cursor-duck';
    duck.setAttribute('aria-hidden', 'true');
    duck.innerHTML = `
      <svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">
        <g class="duck-leg leg-back">
          <rect x="41" y="60" width="6" height="16" rx="3" fill="#D9832A"/>
          <path d="M37 76 L51 76 L47 82 L41 82 Z" fill="#D9832A"/>
        </g>
        <g class="duck-bob">
          <ellipse cx="46" cy="52" rx="28" ry="20" fill="#FFD23F"/>
          <path d="M22 50 Q34 60 48 51" stroke="#E8B93A" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".6"/>
          <circle cx="68" cy="32" r="15" fill="#FFD23F"/>
          <path d="M80 31 L95 27 L95 38 Z" fill="#FF8C1A"/>
          <circle cx="72" cy="27" r="2" fill="#171B1F"/>
        </g>
        <g class="duck-leg leg-front">
          <rect x="55" y="60" width="6" height="16" rx="3" fill="#FF8C1A"/>
          <path d="M51 76 L65 76 L61 82 L55 82 Z" fill="#FF8C1A"/>
        </g>
      </svg>`;
    document.body.appendChild(duck);

    const PROXIMITY_RADIUS = 240;   // px — how close the cursor must be before the duck notices it
    const WANDER_SPEED     = 0.55;  // px / frame — its own lazy pace
    const CHASE_SPEED      = 1.1;   // px / frame — still unhurried, just a bit more purposeful
    const EDGE_MARGIN      = 60;    // keep the duck away from the very edge of the viewport

    let duckX = window.innerWidth * (0.3 + Math.random() * 0.4);
    let duckY = window.innerHeight * (0.3 + Math.random() * 0.4);
    let targetX = duckX;
    let targetY = duckY;
    let facing = 1;      // 1 = facing right, -1 = facing left
    let waddleT = 0;

    let mouseX = -9999;
    let mouseY = -9999;
    let mouseInWindow = false;

    let pauseUntil = 0; // timestamp until which the duck stands still between wanders

    function pickWanderTarget(){
      const w = window.innerWidth, h = window.innerHeight;
      targetX = EDGE_MARGIN + Math.random() * Math.max(w - EDGE_MARGIN * 2, 1);
      targetY = EDGE_MARGIN + Math.random() * Math.max(h - EDGE_MARGIN * 2, 1);
    }
    pickWanderTarget();

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseInWindow = true;
    }, { passive: true });

    document.addEventListener('mouseleave', () => { mouseInWindow = false; });
    window.addEventListener('blur', () => { mouseInWindow = false; });

    function tick(now){
      const distToMouse = mouseInWindow ? Math.hypot(mouseX - duckX, mouseY - duckY) : Infinity;
      const chasing = distToMouse < PROXIMITY_RADIUS;

      if (chasing) {
        targetX = mouseX;
        targetY = mouseY;
      }

      const dx = targetX - duckX;
      const dy = targetY - duckY;
      const dist = Math.hypot(dx, dy);

      let moving = false;

      if (dist > 4) {
        const speed = chasing ? CHASE_SPEED : WANDER_SPEED;
        duckX += (dx / dist) * speed;
        duckY += (dy / dist) * speed;
        moving = true;
        if (Math.abs(dx) > 1.5) facing = dx < 0 ? -1 : 1;
        pauseUntil = 0;
      } else if (!chasing) {
        // reached a wander waypoint — stand around for a bit before picking another
        if (pauseUntil === 0) {
          pauseUntil = now + 900 + Math.random() * 1800;
        } else if (now >= pauseUntil) {
          pickWanderTarget();
          pauseUntil = 0;
        }
      }

      duck.classList.toggle('is-walking', moving);
      duck.classList.toggle('is-idle', !moving);

      if (moving) {
        waddleT += chasing ? 0.22 : 0.16;
      }

      const waddleAngle = moving ? Math.sin(waddleT) * 5 : 0;

      duck.style.transform =
        `translate3d(${duckX - 28}px, ${duckY - 25}px, 0) rotate(${waddleAngle}deg) scaleX(${facing})`;

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  })();

});
