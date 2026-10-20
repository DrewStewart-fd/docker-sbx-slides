(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const stage = document.querySelector('.stage');
  const viewport = document.querySelector('.viewport');
  const panel = document.querySelector('.notes-panel');
  const counter = document.querySelector('.counter');
  const bar = document.querySelector('.progress');
  const help = document.querySelector('.help');
  const NOTES_H = 190;
  let index = 0;
  let presenter = null;

  function notesFor(n) {
    const note = slides[n].querySelector('.notes');
    return note ? note.innerHTML : '<p>No notes for this slide.</p>';
  }

  function fit() {
    const open = document.body.classList.contains('show-notes');
    const h = window.innerHeight - (open ? NOTES_H : 0);
    const scale = Math.min(window.innerWidth / 1280, h / 800);
    stage.style.setProperty('--s', scale);
    viewport.style.bottom = (open ? NOTES_H : 0) + 'px';
  }

  function show(n, updateHash = true) {
    index = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, k) => s.classList.toggle('active', k === index));
    counter.textContent = `${index + 1} / ${slides.length}`;
    bar.style.width = ((index + 1) / slides.length) * 100 + '%';
    panel.innerHTML = notesFor(index);
    if (updateHash) history.replaceState(null, '', '#' + (index + 1));
    syncPresenter();
  }

  function fromHash() {
    const n = parseInt(location.hash.slice(1), 10);
    show(Number.isFinite(n) ? n - 1 : 0, false);
  }

  function cycleTheme() {
    const root = document.documentElement;
    const next = { '': 'light', light: 'dark', dark: '' }[root.dataset.theme || ''];
    if (next) root.dataset.theme = next; else delete root.dataset.theme;
    syncTheme();
  }

  // Presenter window: notes, current + next slide, timer. Share only the main window.
  function presenterOpen() { return presenter && !presenter.closed; }

  function thumb(doc, n) {
    const box = doc.createElement('div');
    box.className = 'p-thumb';
    if (n >= slides.length) {
      box.classList.add('end');
      box.textContent = 'End of deck';
      return box;
    }
    const st = doc.createElement('div');
    st.className = 'stage';
    const clone = doc.importNode(slides[n], true);
    clone.classList.add('active');
    st.appendChild(clone);
    box.appendChild(st);
    return box;
  }

  function fitThumbs() {
    if (!presenterOpen()) return;
    presenter.document.querySelectorAll('.p-thumb').forEach((b) => {
      b.style.setProperty('--s', b.clientWidth / 1280);
    });
  }

  function syncTheme() {
    if (!presenterOpen()) return;
    const t = document.documentElement.dataset.theme;
    const root = presenter.document.documentElement;
    if (t) root.dataset.theme = t; else delete root.dataset.theme;
  }

  function syncPresenter() {
    if (!presenterOpen()) return;
    const d = presenter.document;
    const notes = d.querySelector('.p-notes');
    d.querySelector('.p-count').textContent = `Slide ${index + 1} of ${slides.length}`;
    d.querySelector('.p-now').replaceChildren(thumb(d, index));
    d.querySelector('.p-next').replaceChildren(thumb(d, index + 1));
    notes.innerHTML = notesFor(index);
    notes.scrollTop = 0;
    syncTheme();
    fitThumbs();
  }

  function openPresenter() {
    if (presenterOpen()) { presenter.focus(); return; }
    presenter = window.open('', 'sbx-presenter', 'width=1200,height=760');
    if (!presenter) return;
    const d = presenter.document;
    const css = new URL('style.css', location.href).href;
    d.open();
    d.write(`<!doctype html><html><head><meta charset="utf-8"><title>Presenter</title>
<link rel="stylesheet" href="${css}"></head>
<body class="presenter">
<header class="p-bar"><span class="p-count"></span>
<button class="p-timer" type="button" title="Click to reset">00:00</button></header>
<section class="p-slides"><p class="kicker">Now</p><div class="p-now"></div>
<p class="kicker">Next</p><div class="p-next"></div></section>
<section class="p-notes"></section>
</body></html>`);
    d.close();
    d.title = 'Presenter · ' + document.title;

    let start = Date.now();
    const timer = d.querySelector('.p-timer');
    const tick = () => {
      const s = Math.floor((Date.now() - start) / 1000);
      timer.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    };
    presenter.setInterval(tick, 1000);
    timer.addEventListener('click', () => { start = Date.now(); tick(); });

    d.addEventListener('keydown', (e) => onKey(e, true));
    d.querySelector('link').addEventListener('load', fitThumbs);
    presenter.addEventListener('resize', fitThumbs);
    syncPresenter();
  }

  function onKey(e, fromPresenter) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': case 'Enter':
        e.preventDefault(); show(index + 1); break;
      case 'ArrowLeft': case 'PageUp': case 'Backspace':
        e.preventDefault(); show(index - 1); break;
      case 'Home': show(0); break;
      case 'End': show(slides.length - 1); break;
      case 'n': case 'N':
        if (fromPresenter) break;
        document.body.classList.toggle('show-notes'); fit(); break;
      case 'f': case 'F':
        if (fromPresenter) break;
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
        break;
      case 'p': case 'P': openPresenter(); break;
      case 't': case 'T': cycleTheme(); break;
      case '?': if (!fromPresenter) help.classList.toggle('open'); break;
      case 'Escape': help.classList.remove('open'); break;
    }
  }

  document.addEventListener('keydown', (e) => onKey(e, false));

  viewport.addEventListener('click', (e) => {
    if (e.target.closest('a, pre, code')) return;
    show(index + (e.clientX < window.innerWidth / 3 ? -1 : 1));
  });

  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', fromHash);
  window.addEventListener('pagehide', () => { if (presenterOpen()) presenter.close(); });
  fit();
  fromHash();
})();
