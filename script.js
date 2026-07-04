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

});
