// ============================================
// TAF FUWAD - Premium Portfolio
// Complete Interactive JavaScript
// ============================================

(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────
  const CONFIG = {
    cursorLerp: 0.15,
    tiltMax: 10,
    magneticDistance: 100,
    particleCount: 50,
    starCount: 80,
    countUpDuration: 2000,
    loadingDelay: 2500,
    loadingFade: 800,
    rippleDuration: 600,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // ── DOM Cache ──────────────────────────────────────────────────
  const DOM = {
    loadingScreen: document.getElementById('loading-screen'),
    cursorDot: document.getElementById('cursor-dot'),
    cursorOutline: document.getElementById('cursor-outline'),
    mouseGlow: document.getElementById('mouse-glow') || document.querySelector('.mouse-glow'),
    navbar: document.querySelector('.navbar'),
    hamburger: document.querySelector('.hamburger'),
    mobileNav: document.querySelector('.mobile-nav'),
    mobileOverlay: document.querySelector('.mobile-overlay'),
    heroSection: document.querySelector('.hero') || document.getElementById('hero'),
    heroContent: document.querySelector('.hero-content'),
    heroImageWrapper: document.querySelector('.hero-image-wrapper'),
    sections: document.querySelectorAll('section[id]'),
    navLinks: document.querySelectorAll('.nav-link'),
    mobileNavLinks: document.querySelectorAll('.mobile-nav a'),
    bgEffects: document.querySelector('.bg-effects'),
    contactForm: document.querySelector('.contact-form') || document.getElementById('contact-form'),
    contactSubmit: document.querySelector('.contact-submit'),
    backToTop: document.querySelector('.back-to-top'),
    body: document.body
  };

  // ── Utility Functions ──────────────────────────────────────────

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // ── 1. Loading Screen ─────────────────────────────────────────

  function initLoadingScreen() {
    if (!DOM.loadingScreen) return;

    window.addEventListener('load', function () {
      setTimeout(function () {
        DOM.loadingScreen.classList.add('loading-hidden');

        setTimeout(function () {
          DOM.loadingScreen.style.display = 'none';
        }, CONFIG.loadingFade);
      }, CONFIG.loadingDelay);
    });
  }

  // ── 2. Custom Cursor ──────────────────────────────────────────

  function initCustomCursor() {
    if (!DOM.cursorDot || !DOM.cursorOutline) return;

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let rafId = null;

    const hoverTargets = 'a, button, [data-magnetic], [data-tilt], .btn, input, textarea, .hamburger';

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      DOM.cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    function animateOutline() {
      outlineX = lerp(outlineX, mouseX, CONFIG.cursorLerp);
      outlineY = lerp(outlineY, mouseY, CONFIG.cursorLerp);
      DOM.cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
      rafId = requestAnimationFrame(animateOutline);
    }
    rafId = requestAnimationFrame(animateOutline);

    document.addEventListener('mousedown', function () {
      DOM.cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(0.6)`;
    });

    document.addEventListener('mouseup', function () {
      DOM.cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1)`;
    });

    document.querySelectorAll(hoverTargets).forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        DOM.cursorDot.classList.add('cursor-hover');
        DOM.cursorOutline.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', function () {
        DOM.cursorDot.classList.remove('cursor-hover');
        DOM.cursorOutline.classList.remove('cursor-hover');
      });
    });

    // Hide on touch devices (belt-and-suspenders)
    if (isTouchDevice()) {
      DOM.cursorDot.style.display = 'none';
      DOM.cursorOutline.style.display = 'none';
      if (rafId) cancelAnimationFrame(rafId);
    }
  }

  // ── 3. Mouse Glow Background ──────────────────────────────────

  function initMouseGlow() {
    if (!DOM.mouseGlow) return;

    document.addEventListener('mousemove', function (e) {
      DOM.mouseGlow.style.setProperty('--mouse-x', e.clientX + 'px');
      DOM.mouseGlow.style.setProperty('--mouse-y', e.clientY + 'px');
    }, { passive: true });
  }

  // ── 4. Navbar ─────────────────────────────────────────────────

  function initNavbar() {
    if (!DOM.navbar) return;

    // Scroll class toggle
    const onScroll = debounce(function () {
      if (window.scrollY > 50) {
        DOM.navbar.classList.add('scrolled');
      } else {
        DOM.navbar.classList.remove('scrolled');
      }
    }, 10);

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on init
    onScroll();

    // Active link tracking via IntersectionObserver
    if (DOM.sections.length && DOM.navLinks.length) {
      const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      };

      const sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            DOM.navLinks.forEach(function (link) {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              }
            });
          }
        });
      }, observerOptions);

      DOM.sections.forEach(function (section) {
        sectionObserver.observe(section);
      });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ── 5. Hamburger Menu ─────────────────────────────────────────

  function initHamburger() {
    if (!DOM.hamburger) return;

    function toggleMenu() {
      const isOpen = DOM.hamburger.classList.toggle('open');
      if (DOM.mobileNav) DOM.mobileNav.classList.toggle('open', isOpen);
      if (DOM.mobileOverlay) DOM.mobileOverlay.classList.toggle('open', isOpen);
      DOM.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
      DOM.hamburger.classList.remove('open');
      if (DOM.mobileNav) DOM.mobileNav.classList.remove('open');
      if (DOM.mobileOverlay) DOM.mobileOverlay.classList.remove('open');
      DOM.body.style.overflow = '';
    }

    DOM.hamburger.addEventListener('click', toggleMenu);

    if (DOM.mobileOverlay) {
      DOM.mobileOverlay.addEventListener('click', closeMenu);
    }

    DOM.mobileNavLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // ── 6. Hero Parallax ──────────────────────────────────────────

  function initHeroParallax() {
    if (CONFIG.reducedMotion || !DOM.heroSection) return;

    let ticking = false;

    DOM.heroSection.addEventListener('mousemove', function (e) {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(function () {
        const rect = DOM.heroSection.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (e.clientX - rect.left - centerX) / centerX;
        const offsetY = (e.clientY - rect.top - centerY) / centerY;

        if (DOM.heroContent) {
          DOM.heroContent.style.transform =
            `translateX(${offsetX * 20 * 0.02}px) translateY(${offsetY * 20 * 0.02}px)`;
        }

        if (DOM.heroImageWrapper) {
          DOM.heroImageWrapper.style.transform =
            `perspective(1000px) rotateY(${offsetX * 30 * 0.03}deg) rotateX(${-offsetY * 30 * 0.03}deg)`;
        }

        if (DOM.mouseGlow) {
          DOM.mouseGlow.style.setProperty('--mouse-x', e.clientX + 'px');
          DOM.mouseGlow.style.setProperty('--mouse-y', e.clientY + 'px');
        }

        ticking = false;
      });
    }, { passive: true });

    // Reset transforms when mouse leaves hero
    DOM.heroSection.addEventListener('mouseleave', function () {
      if (DOM.heroContent) {
        DOM.heroContent.style.transform = 'translateX(0) translateY(0)';
        DOM.heroContent.style.transition = 'transform 0.6s ease-out';
        setTimeout(function () {
          DOM.heroContent.style.transition = '';
        }, 600);
      }
      if (DOM.heroImageWrapper) {
        DOM.heroImageWrapper.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
        DOM.heroImageWrapper.style.transition = 'transform 0.6s ease-out';
        setTimeout(function () {
          DOM.heroImageWrapper.style.transition = '';
        }, 600);
      }
    });
  }

  // ── 7. 3D Card Tilt ───────────────────────────────────────────

  function initTiltCards() {
    if (CONFIG.reducedMotion) return;

    const tiltElements = document.querySelectorAll('[data-tilt]');

    tiltElements.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const percentX = (e.clientX - cardCenterX) / (rect.width / 2);
        const percentY = (e.clientY - cardCenterY) / (rect.height / 2);

        const tiltX = clamp(-percentY * CONFIG.tiltMax, -CONFIG.tiltMax, CONFIG.tiltMax);
        const tiltY = clamp(percentX * CONFIG.tiltMax, -CONFIG.tiltMax, CONFIG.tiltMax);

        card.style.transform =
          `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

        // Light reflection via CSS custom properties
        card.style.setProperty('--tilt-x', ((percentX + 1) / 2 * 100).toFixed(1) + '%');
        card.style.setProperty('--tilt-y', ((percentY + 1) / 2 * 100).toFixed(1) + '%');
      }, { passive: true });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        card.style.transition = 'transform 0.5s ease-out';
        card.style.setProperty('--tilt-x', '50%');
        card.style.setProperty('--tilt-y', '50%');
        setTimeout(function () {
          card.style.transition = '';
        }, 500);
      });

      card.addEventListener('mouseenter', function () {
        card.style.transition = 'none';
      });
    });
  }

  // ── 8. Magnetic Buttons ───────────────────────────────────────

  function initMagneticButtons() {
    if (CONFIG.reducedMotion) return;

    const magneticEls = document.querySelectorAll('[data-magnetic]');

    magneticEls.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < CONFIG.magneticDistance) {
          const strength = 1 - (distance / CONFIG.magneticDistance);
          const moveX = distX * strength * 0.4;
          const moveY = distY * strength * 0.4;
          el.style.transform = `translate(${moveX}px, ${moveY}px)`;
          el.style.transition = 'transform 0.2s ease-out';
        }
      }, { passive: true });

      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translate(0px, 0px)';
        el.style.transition = 'transform 0.4s ease-out';
      });
    });
  }

  // ── 9. Ripple Effect ──────────────────────────────────────────

  function initRippleEffect() {
    const rippleTargets = document.querySelectorAll('.btn-primary, .contact-submit');

    rippleTargets.forEach(function (btn) {
      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = 'hidden';

      btn.addEventListener('click', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x - size / 2}px;
          top: ${y - size / 2}px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple-expand ${CONFIG.rippleDuration}ms ease-out forwards;
          pointer-events: none;
          z-index: 1;
        `;

        btn.appendChild(ripple);

        setTimeout(function () {
          ripple.remove();
        }, CONFIG.rippleDuration);
      });
    });

    // Inject ripple keyframes if not already present
    if (!document.getElementById('ripple-keyframes')) {
      const style = document.createElement('style');
      style.id = 'ripple-keyframes';
      style.textContent = `
        @keyframes ripple-expand {
          to { transform: scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ── 10. Scroll Reveal ─────────────────────────────────────────

  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Don't unobserve — keeps animation one-time since class stays
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ── 11. Skill Progress Rings ──────────────────────────────────

  function initSkillProgress() {
    const skillsSection = document.getElementById('skills') || document.querySelector('.skills');
    if (!skillsSection) return;

    const circles = skillsSection.querySelectorAll('.progress');
    if (!circles.length) return;

    const RADIUS = 30;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 188.496

    // Set initial state: full dashoffset (circle hidden)
    circles.forEach(function (circle) {
      circle.style.strokeDasharray = CIRCUMFERENCE;
      circle.style.strokeDashoffset = CIRCUMFERENCE;
    });

    const skillObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const sectionCircles = entry.target.querySelectorAll('.progress');

          sectionCircles.forEach(function (circle, index) {
            const percent = parseFloat(circle.getAttribute('data-percent')) || 0;
            const targetOffset = CIRCUMFERENCE - (percent / 100 * CIRCUMFERENCE);

            // Stagger each ring slightly
            setTimeout(function () {
              circle.style.transition = 'stroke-dashoffset 1.5s ease-out';
              circle.style.strokeDashoffset = targetOffset;
            }, index * 150);
          });

          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    skillObserver.observe(skillsSection);
  }

  // ── 12. Count Up Animation ────────────────────────────────────

  function initCountUp() {
    const countElements = document.querySelectorAll('[data-count]');
    if (!countElements.length) return;

    function easeOutQuad(t) {
      return t * (2 - t);
    }

    function animateCount(el) {
      const target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;

      const suffix = el.getAttribute('data-suffix') || '';
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / CONFIG.countUpDuration, 1);
        const easedProgress = easeOutQuad(progress);
        const currentValue = Math.round(easedProgress * target);

        el.textContent = currentValue + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target + suffix;
        }
      }

      requestAnimationFrame(update);
    }

    const countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    countElements.forEach(function (el) {
      countObserver.observe(el);
    });
  }

  // ── 13. Floating Particles ────────────────────────────────────

  function initParticles() {
    const container = DOM.bgEffects;
    if (!container) return;

    // Inject particle keyframes
    if (!document.getElementById('particle-keyframes')) {
      const style = document.createElement('style');
      style.id = 'particle-keyframes';
      style.textContent = `
        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25%      { transform: translate(30px, -40px) rotate(90deg); }
          50%      { transform: translate(-20px, -80px) rotate(180deg); }
          75%      { transform: translate(40px, -40px) rotate(270deg); }
        }
      `;
      document.head.appendChild(style);
    }

    for (let i = 0; i < CONFIG.particleCount; i++) {
      const particle = document.createElement('div');
      const size = randomRange(2, 4);
      const posX = randomRange(0, 100);
      const posY = randomRange(0, 100);
      const opacity = randomRange(0.1, 0.3);
      const duration = randomRange(15, 35);
      const delay = randomRange(0, 20);

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: white;
        opacity: ${opacity};
        left: ${posX}%;
        top: ${posY}%;
        will-change: transform;
        pointer-events: none;
        animation: particle-float ${duration}s ${delay}s ease-in-out infinite;
      `;

      container.appendChild(particle);
    }
  }

  // ── 14. Background Stars ──────────────────────────────────────

  function initStars() {
    const container = DOM.bgEffects;
    if (!container) return;

    // Inject twinkle keyframes
    if (!document.getElementById('star-keyframes')) {
      const style = document.createElement('style');
      style.id = 'star-keyframes';
      style.textContent = `
        @keyframes star-twinkle {
          0%, 100% { opacity: var(--star-base-opacity); }
          50%      { opacity: 0.02; }
        }
      `;
      document.head.appendChild(style);
    }

    for (let i = 0; i < CONFIG.starCount; i++) {
      const star = document.createElement('div');
      const size = randomRange(1, 2);
      const posX = randomRange(0, 100);
      const posY = randomRange(0, 100);
      const opacity = randomRange(0.1, 0.5);
      const duration = randomRange(3, 8);
      const delay = randomRange(0, 5);

      star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: white;
        left: ${posX}%;
        top: ${posY}%;
        pointer-events: none;
        --star-base-opacity: ${opacity};
        opacity: ${opacity};
        animation: star-twinkle ${duration}s ${delay}s ease-in-out infinite;
      `;

      container.appendChild(star);
    }
  }

  // ── 15. Section Title Gradient Sweep ──────────────────────────

  function initTitleSweep() {
    const titles = document.querySelectorAll('.section-title, .section-heading');
    if (!titles.length) return;

    // Inject sweep keyframes
    if (!document.getElementById('sweep-keyframes')) {
      const style = document.createElement('style');
      style.id = 'sweep-keyframes';
      style.textContent = `
        .title-sweep-active {
          background-size: 200% 100% !important;
          animation: gradient-sweep 1.5s ease-out forwards !important;
        }
        @keyframes gradient-sweep {
          0%   { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const titleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('title-sweep-active');
          titleObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    titles.forEach(function (title) {
      titleObserver.observe(title);
    });
  }

  // ── 17. Contact Form ──────────────────────────────────────────

  function initContactForm() {
    const form = DOM.contactForm;
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector('.contact-submit') ||
                        form.querySelector('button[type="submit"]') ||
                        form.querySelector('.btn-primary');

      if (!submitBtn) return;

      const originalText = submitBtn.innerHTML;
      const originalDisabled = submitBtn.disabled;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;">✓ Sent!</span>';
      submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

      setTimeout(function () {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = originalDisabled;
        submitBtn.style.background = '';
        form.reset();
      }, 2000);
    });
  }

  // ── 18. Back to Top ───────────────────────────────────────────

  function initBackToTop() {
    const btn = DOM.backToTop;
    if (!btn) return;

    // Show/hide based on scroll
    const toggleVisibility = debounce(function () {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, 50);

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── 19. Reduced Motion Handler ────────────────────────────────

  function applyReducedMotion() {
    if (!CONFIG.reducedMotion) return;

    // Inject reduced-motion overrides
    const style = document.createElement('style');
    style.id = 'reduced-motion-overrides';
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Initialize Everything ─────────────────────────────────────

  function init() {
    // Reduced motion first
    applyReducedMotion();

    // Core
    initLoadingScreen();

    // Cursor (desktop only)
    if (!isTouchDevice()) {
      initCustomCursor();
      initMouseGlow();
    }

    // Navigation
    initNavbar();
    initHamburger();

    // Interactive effects
    initHeroParallax();
    initTiltCards();
    initMagneticButtons();
    initRippleEffect();

    // Scroll-driven
    initScrollReveal();
    initSkillProgress();
    initCountUp();
    initTitleSweep();

    // Ambient background (skip if reduced motion)
    if (!CONFIG.reducedMotion) {
      initParticles();
      initStars();
    }

    // Forms & misc
    initContactForm();
    initBackToTop();
  }

  // ── DOM Ready ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
