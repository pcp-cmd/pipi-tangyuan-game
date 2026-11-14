/** Journal presentation only. The scene/session owner supplies every record. */
const PAGES = Object.freeze(['companions', 'courses', 'discoveries', 'saves']);
const mounted = new WeakMap();

export function mountJournalPages({ root, onPageChange = () => {} }) {
  if (!root?.querySelector || typeof onPageChange !== 'function') {
    throw new TypeError('A journal root and optional page-change callback are required.');
  }
  if (mounted.has(root)) return mounted.get(root);
  const doc = root.ownerDocument;
  const tabs = PAGES.map(page => root.querySelector(`[data-journal-page="${page}"]`));
  const panels = PAGES.map(page => root.querySelector(`[data-journal-panel="${page}"]`));
  if (tabs.some(tab => !tab) || panels.some(panel => !panel)) {
    throw new TypeError('The journal requires all four tabs and matching page pairs.');
  }
  let active = 'companions', disposed = false;

  // Move existing nodes, preserving the explorer's listeners and live labels.
  // Complete history and prerequisite explanations remain native disclosures.
  function compactCourseRows() {
    const current = root.querySelector('#journalCurrent');
    for (const note of current?.querySelectorAll('.history-compatibility') ?? []) {
      if (note.parentElement !== current) continue;
      const disclosure = doc.createElement('details'); disclosure.className = 'journal-current-notes';
      const summary = doc.createElement('summary'); summary.textContent = '本课记录说明';
      disclosure.append(summary, note); current.append(disclosure);
    }
    for (const article of root.querySelectorAll('.course-entry:not([data-book-row])')) {
      const title = article.querySelector('h4');
      const ordinal = article.querySelector('.course-ordinal');
      const action = article.querySelector('.course-enter');
      if (!title || !ordinal || !action) continue;
      article.dataset.bookRow = 'true';
      const main = doc.createElement('div');
      main.className = 'course-row-main';
      title.title = title.textContent;
      const art = article.querySelector('.course-context-art');
      const badge = article.querySelector('.learning-badge');
      const copy = doc.createElement('div'); copy.className = 'course-row-copy';
      copy.append(ordinal, title);
      if (badge) copy.append(badge);
      copy.append(action);
      if (art) main.append(art);
      main.append(copy);
      const details = doc.createElement('details');
      details.className = 'course-row-details';
      const summary = doc.createElement('summary');
      summary.textContent = '详情';
      summary.setAttribute('aria-label', `${title.textContent}：展开课程内容、学习记录与学习顺序`);
      const body = doc.createElement('div');
      body.className = 'course-row-body';
      const fullTitle = doc.createElement('p');
      fullTitle.className = 'course-full-title';
      fullTitle.textContent = title.textContent;
      body.append(fullTitle, ...article.childNodes);
      details.append(summary, body);
      article.append(main, details);
    }
  }

  function show(page) {
    if (disposed) return false;
    const index = PAGES.indexOf(page);
    if (index < 0) return false;
    const previous = active;
    const priorPanel = panels[PAGES.indexOf(previous)];
    const moveFocus = previous !== page && priorPanel.contains(doc.activeElement);
    active = page;
    for (let i = 0; i < PAGES.length; i++) {
      const selected = i === index;
      tabs[i].setAttribute('aria-selected', String(selected));
      tabs[i].tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    }
    root.dataset.journalPage = page;
    compactCourseRows();
    if (moveFocus) tabs[index].focus({ preventScroll: true });
    if (previous !== page) onPageChange(page);
    return true;
  }

  function click(event) {
    const tab = event.target.closest?.('[data-journal-page]');
    if (tab && tabs.includes(tab)) show(tab.dataset.journalPage);
  }
  function keydown(event) {
    const index = tabs.indexOf(event.target);
    if (index < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    show(PAGES[next]);
    tabs[next].focus({ preventScroll: true });
  }

  // Capture makes the destination visible before legacy jump/focus listeners.
  root.addEventListener('click', click, true);
  root.addEventListener('keydown', keydown);
  const Observer = doc.defaultView?.MutationObserver;
  const observer = Observer ? new Observer(compactCourseRows) : null;
  const entries = root.querySelector('#journalEntries');
  if (entries) observer?.observe(entries, { childList: true });
  const api = Object.freeze({
    show,
    syncVisible() { return show(active); },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.removeEventListener('click', click, true);
      root.removeEventListener('keydown', keydown);
      observer?.disconnect();
      mounted.delete(root);
    }
  });
  mounted.set(root, api);
  show(active);
  return api;
}
