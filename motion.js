(() => {
  // The document stays visible when motion is unavailable or disabled.
  if (!window.matchMedia || !('IntersectionObserver' in window) ||
      typeof Element.prototype.animate !== 'function') return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches) return;

  const timing = new Map();
  const group = (selector, step = 0) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      timing.set(element, Math.min(index * step, 160));
    });
  };
  group('.hero h1, .hero-lead, .hero-actions', 80);
  group('.portrait');
  group('.about > div', 80);
  group('.section-heading');
  group('.policy-row', 40);
  group('.progress-grid article', 70);
  group('.journal-library, .activity-feed', 70);
  group('.video-card', 70);
  group('.contact > h2, .contact-illustration, .contact > p, .contact > .button', 40);

  const pending = new Set(timing.keys());
  const active = new Map();
  let stopped = false;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting || !pending.has(target)) return;
      pending.delete(target);
      observer.unobserve(target);
      if (stopped || preference.matches || document.hidden ||
          target.contains(document.activeElement)) return;

      try {
        const animation = target.animate([
          { opacity: 0, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 600,
          delay: timing.get(target),
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'backwards'
        });
        active.set(target, animation);
        animation.onfinish = animation.oncancel = () => active.delete(target);
      } catch {
        // A failed decorative animation must never hide the content.
      }
    });
  }, { rootMargin: '0px 0px 40px 0px', threshold: 0 });

  const revealFocused = event => {
    timing.forEach((_, element) => {
      if (!element.contains(event.target)) return;
      pending.delete(element);
      observer.unobserve(element);
      active.get(element)?.cancel();
      active.delete(element);
    });
  };
  const stop = () => {
    stopped = true;
    observer.disconnect();
    pending.clear();
    active.forEach(animation => animation.cancel());
    active.clear();
    document.removeEventListener('focusin', revealFocused);
  };

  pending.forEach(element => observer.observe(element));
  document.addEventListener('focusin', revealFocused);
  preference.addEventListener?.('change', event => {
    if (event.matches) stop();
  });
  window.addEventListener('beforeprint', stop, { once: true });
  window.addEventListener('pagehide', stop, { once: true });
})();
