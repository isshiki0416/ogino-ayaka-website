(() => {
  const root = document.querySelector('#video-gallery');
  const groups = (window.SITE_CONFIG?.videoGroups || []).filter(group => group.items?.length);
  if (!root || !groups.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 7000;
  const models = [];
  let current = Math.max(0, groups.findIndex(group => group.id === 'youtube'));
  let timer;
  let inView = !('IntersectionObserver' in window);
  let hoverPaused = false;
  let focusPaused = false;

  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  const external = (url, title) => {
    const link = make('a', 'movie-link');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', title + '（新しいタブで開きます）');
    return link;
  };
  const icon = id => {
    if (id === 'instagram') return socialIcon('instagram');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = id === 'youtube'
      ? '<rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor"/><path d="m10 8 6 4-6 4Z" fill="white"/>'
      : '<path d="m3 8 9-5 9 5M4 9h16M5 19h14M3 22h18M6 10v7m6-7v7m6-7v7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
    return svg;
  };

  const tabs = make('div', 'movie-tabs');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', '動画のカテゴリー');
  const panels = make('div', 'movie-panels');
  const status = make('p', 'movie-sr-only');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');

  function schedule() {
    clearTimeout(timer);
    const model = models[current];
    if (!model || model.slides.length < 2 || reduced.matches ||
        hoverPaused || focusPaused || document.hidden || !inView) return;
    timer = setTimeout(() => selectSlide(model, model.index + 1, false), interval);
  }

  function selectSlide(model, next, announce = true) {
    model.index = (next + model.slides.length) % model.slides.length;
    model.slides.forEach((slide, index) => {
      const active = index === model.index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
      slide.querySelector('a').tabIndex = active ? 0 : -1;
      model.dots[index].setAttribute('aria-current', String(active));
    });
    model.counter.textContent = `${String(model.index + 1).padStart(2, '0')} / ${String(model.slides.length).padStart(2, '0')}`;
    if (announce) status.textContent = `${model.group.label}、${model.index + 1}本目。${model.group.items[model.index].title}`;
    schedule();
  }

  function selectGroup(index, focusTab = false) {
    current = index;
    hoverPaused = false;
    focusPaused = false;
    models.forEach((model, i) => {
      const active = i === index;
      model.tab.setAttribute('aria-selected', String(active));
      model.tab.tabIndex = active ? 0 : -1;
      model.panel.hidden = !active;
    });
    if (focusTab) models[index].tab.focus();
    status.textContent = '';
    schedule();
  }

  groups.forEach((group, groupIndex) => {
    const tab = make('button', 'movie-tab');
    tab.type = 'button';
    tab.id = `movie-tab-${group.id}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `movie-panel-${group.id}`);
    const label = make('span', 'movie-tab-label', group.id === 'instagram' ? 'Instagram' : group.label);
    if (group.id === 'instagram') label.append(make('span', 'movie-tab-sub', 'ショート動画'));
    tab.append(icon(group.id), label);
    tabs.append(tab);

    const panel = make('div', 'movie-panel');
    panel.id = `movie-panel-${group.id}`;
    panel.dataset.platform = group.id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    const stage = make('div', 'movie-stage');
    stage.setAttribute('aria-roledescription', 'カルーセル');
    stage.setAttribute('aria-label', group.label);
    stage.setAttribute('role', 'group');
    const controls = make('div', 'movie-controls');
    const counter = make('span', 'movie-counter');
    counter.setAttribute('aria-hidden', 'true');
    const dots = make('div', 'movie-dots');
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', '表示する動画を選択');
    const model = { group, tab, panel, stage, counter, slides: [], dots: [], index: 0 };
    models.push(model);

    group.items.forEach((item, index) => {
      const slide = make('article', 'movie-slide');
      slide.id = `movie-${group.id}-${index + 1}`;
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'スライド');
      slide.setAttribute('aria-label', `${index + 1} / ${group.items.length}`);
      const link = external(item.url, item.title);
      const media = make('div', 'movie-media' + (group.portrait ? ' movie-media-portrait' : ''));
      const image = make('img');
      image.src = item.thumbnail;
      image.alt = item.thumbnailAlt || item.title + 'のサムネイル';
      image.loading = 'lazy';
      image.decoding = 'async';
      if (item.thumbnailPosition) image.style.objectPosition = item.thumbnailPosition;
      const play = make('span', 'movie-play');
      play.setAttribute('aria-hidden', 'true');
      media.append(image, play);
      const caption = make('div', 'movie-caption');
      caption.append(make('h3', 'movie-name', item.title), make('span', 'movie-destination', group.linkLabel));
      link.append(media, caption);
      slide.append(link);
      stage.append(slide);
      model.slides.push(slide);

      const dot = make('button', 'movie-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', `${index + 1}本目：${item.title}`);
      dot.setAttribute('aria-controls', slide.id);
      dot.addEventListener('click', () => selectSlide(model, index));
      dots.append(dot);
      model.dots.push(dot);
    });

    controls.append(counter, dots);
    panel.append(stage, controls);
    panels.append(panel);
    tab.addEventListener('click', () => selectGroup(groupIndex));
    tab.addEventListener('keydown', event => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? models.length - 1 :
        (groupIndex + (event.key === 'ArrowRight' ? 1 : -1) + models.length) % models.length;
      selectGroup(next, true);
    });
    stage.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') { hoverPaused = true; schedule(); }
    });
    stage.addEventListener('pointerleave', () => { hoverPaused = false; schedule(); });
    panel.addEventListener('focusin', () => { focusPaused = true; schedule(); });
    panel.addEventListener('focusout', () => {
      queueMicrotask(() => { focusPaused = models[current].panel.contains(document.activeElement); schedule(); });
    });
    panel.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      // Keep keyboard focus on a stable control as the old slide becomes inert.
      const next = (model.index + (event.key === 'ArrowRight' ? 1 : -1) + model.slides.length) % model.slides.length;
      model.dots[next].focus();
      selectSlide(model, next);
    });

    let gesture;
    let suppressClick = false;
    stage.addEventListener('pointerdown', event => {
      suppressClick = false;
      if (event.pointerType === 'touch') gesture = { x: event.clientX, y: event.clientY };
    });
    stage.addEventListener('pointerup', event => {
      if (!gesture) return;
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      gesture = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5 && model.slides.length > 1) {
        suppressClick = true;
        selectSlide(model, model.index + (dx < 0 ? 1 : -1));
      }
    });
    stage.addEventListener('pointercancel', () => { gesture = null; });
    stage.addEventListener('click', event => {
      if (suppressClick) { event.preventDefault(); suppressClick = false; }
    }, true);
    selectSlide(model, 0, false);
  });

  root.append(tabs, panels, status);
  selectGroup(current);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.15 }).observe(root);
  }
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', schedule);
  window.addEventListener('pagehide', () => clearTimeout(timer));
  window.addEventListener('pageshow', schedule);
})();
