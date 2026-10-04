(() => {
  // Keep native disclosures available when animation is unsupported.
  if (!window.matchMedia || typeof Element.prototype.animate !== 'function') return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finishers = [];
  const selector = '.about-copy > details, .policy-row, .more-results';

  document.querySelectorAll(selector).forEach(details => {
    const summary = details.querySelector(':scope > summary');
    const content = summary?.nextElementSibling;
    if (!summary || !content) return;

    let expanded = details.open;
    let heightAnimation;
    let contentAnimation;
    details.classList.add('disclosure-motion');
    summary.querySelector(':scope > span')?.setAttribute('aria-hidden', 'true');

    const syncState = () => {
      details.dataset.expanded = String(expanded);
      summary.setAttribute('aria-expanded', String(expanded));
      content.inert = !expanded;
    };

    const finish = () => {
      heightAnimation?.cancel();
      contentAnimation?.cancel();
      heightAnimation = contentAnimation = undefined;
      details.open = expanded;
      details.style.removeProperty('height');
      details.classList.remove('is-disclosing');
      syncState();
    };

    const animateTo = next => {
      const wasOpen = details.open;
      const startHeight = details.getBoundingClientRect().height;
      const contentStyle = getComputedStyle(content);
      const startOpacity = wasOpen ? contentStyle.opacity : '0';
      const startTransform = wasOpen ? contentStyle.transform : 'translateY(6px)';
      expanded = next;

      if (preference.matches) {
        finish();
        return;
      }

      // Start a reversal at the current visible height, even during a quick second click.
      details.style.height = `${startHeight}px`;
      heightAnimation?.cancel();
      contentAnimation?.cancel();
      details.classList.add('is-disclosing');
      details.open = true;
      syncState();

      const style = getComputedStyle(details);
      const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const collapsedHeight = summary.getBoundingClientRect().height + border;
      // Measure native layout, including paragraph/list margins, before pinning the height.
      details.style.height = 'auto';
      const endHeight = expanded ? details.getBoundingClientRect().height : collapsedHeight;
      details.style.height = `${startHeight}px`;

      try {
        const transition = details.animate([
          { height: `${startHeight}px` },
          { height: `${endHeight}px` }
        ], {
          duration: expanded ? 460 : 340,
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'forwards'
        });
        heightAnimation = transition;
        contentAnimation = content.animate([
          { opacity: startOpacity, transform: startTransform },
          { opacity: expanded ? 1 : 0, transform: expanded ? 'translateY(0)' : 'translateY(3px)' }
        ], {
          duration: expanded ? 360 : 200,
          delay: expanded && !wasOpen ? 70 : 0,
          easing: 'ease-out',
          fill: 'both'
        });
        transition.onfinish = () => {
          if (heightAnimation === transition) finish();
        };
      } catch {
        finish();
      }
    };

    summary.addEventListener('click', event => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      animateTo(!expanded);
    });

    // Links elsewhere on the page may also open a policy using its native open property.
    details.addEventListener('toggle', () => {
      if (heightAnimation && details.open) return;
      expanded = details.open;
      finish();
    });

    syncState();
    finishers.push(() => { if (heightAnimation) finish(); });
  });

  const finishAll = () => finishers.forEach(finish => finish());
  preference.addEventListener('change', finishAll);
  window.addEventListener('resize', finishAll);
  window.addEventListener('beforeprint', finishAll);
  window.addEventListener('pagehide', finishAll);
})();
