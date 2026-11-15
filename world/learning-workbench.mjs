const sections = Object.freeze([
  { id: 'learn', label: '读讲解', target: 'conceptDetails' },
  { id: 'code', label: '写代码', target: 'codeEditor' },
  { id: 'result', label: '看结果', target: 'resultTitle' },
]);

const runCopy = Object.freeze({
  idle: '先读讲解，再动手改一行。',
  running: 'Python 正在运行，可随时停止。',
  result: '本次运行的反馈已在结果区。',
  previous: '代码已改动，请重新运行当前稿。',
});

export function mountLearningWorkbench({ root, document: doc = root?.ownerDocument, reducedMotion = () => false }) {
  if (!root?.querySelector || !doc?.createElement || typeof reducedMotion !== 'function') {
    throw new TypeError('Learning workbench requires its root, document, and motion preference.');
  }
  const targets = new Map(sections.map(section => [section.id, root.querySelector(`#${section.target}`)]));
  const concept = targets.get('learn'), editor = targets.get('code'), result = targets.get('result');
  const summary = concept?.querySelector('summary');
  if (!concept || !editor || !result || !summary) throw new TypeError('Learning workbench regions are missing.');

  const nav = doc.createElement('nav');
  nav.className = 'learning-workbench-nav';
  nav.setAttribute('aria-label', '工坊学习导航');
  const links = doc.createElement('div'); links.className = 'learning-workbench-links';
  const status = doc.createElement('p'); status.className = 'learning-workbench-status';
  status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const buttons = new Map(), handlers = new Map(), disclosureChoices = new Map();
  let currentKey = null, runState = 'idle', activeSection = 'learn', disposed = false;
  let observedOpen = concept.open;
  const priorResultTabIndex = result.getAttribute('tabindex');
  result.setAttribute('tabindex', '-1');

  function refresh() {
    for (const [id, button] of buttons) {
      if (id === activeSection) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    }
    status.textContent = activeSection === 'result' && runState === 'idle'
      ? '还没有本次结果，运行代码后再来看。'
      : runCopy[runState];
  }

  function showSection(section) {
    if (!targets.has(section)) throw new RangeError('Unknown learning workbench section.');
    if (disposed || currentKey === null || root.hidden) return false;
    activeSection = section;
    if (section === 'learn') {
      concept.open = true;
      observedOpen = true;
      disclosureChoices.set(currentKey, true);
    }
    const target = section === 'learn' ? summary : targets.get(section);
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'nearest', inline: 'nearest' });
    refresh();
    return true;
  }

  for (const section of sections) {
    const button = doc.createElement('button'); button.type = 'button';
    button.className = 'learning-workbench-bookmark'; button.textContent = section.label;
    button.setAttribute('aria-controls', section.target);
    button.setAttribute('data-learning-jump', section.id);
    const handler = () => showSection(section.id);
    button.addEventListener('click', handler);
    buttons.set(section.id, button); handlers.set(button, handler); links.append(button);
  }
  nav.append(links, status); root.prepend(nav);

  function rememberDisclosure() {
    if (!disposed && currentKey !== null && concept.open !== observedOpen) disclosureChoices.set(currentKey, concept.open);
    observedOpen = concept.open;
  }
  concept.addEventListener('toggle', rememberDisclosure);

  function showLesson({ journeyKey, lessonId, hasHistory, canAutoExplain }) {
    if (typeof journeyKey !== 'string' || !journeyKey || typeof lessonId !== 'string' || !lessonId ||
        typeof hasHistory !== 'boolean' || typeof canAutoExplain !== 'boolean') {
      throw new TypeError('Lesson identity and explicit history and teaching-safety flags are required.');
    }
    if (disposed) return;
    rememberDisclosure();
    const nextKey = JSON.stringify([journeyKey, lessonId]);
    if (currentKey === nextKey) return;
    currentKey = nextKey;
    concept.open = disclosureChoices.has(currentKey)
      ? disclosureChoices.get(currentKey)
      : !hasHistory && canAutoExplain;
    observedOpen = concept.open;
    activeSection = concept.open ? 'learn' : 'code';
    runState = 'idle'; refresh();
  }

  function setRunState(value) {
    if (!Object.hasOwn(runCopy, value)) throw new RangeError('Unknown learning workbench run state.');
    if (disposed) return;
    runState = value; refresh();
  }

  function resetGuide() {
    if (disposed || currentKey === null) return;
    concept.open = false;
    observedOpen = false;
    disclosureChoices.set(currentKey, false);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    concept.removeEventListener('toggle', rememberDisclosure);
    for (const [button, handler] of handlers) button.removeEventListener('click', handler);
    if (priorResultTabIndex === null) result.removeAttribute('tabindex');
    else result.setAttribute('tabindex', priorResultTabIndex);
    nav.remove(); disclosureChoices.clear();
  }

  refresh();
  return Object.freeze({ showLesson, showSection, setRunState, resetGuide, dispose });
}
