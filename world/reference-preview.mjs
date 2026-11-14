// Reconstructed from the retained preview-before-adoption specification.
// This component owns no save state and never evaluates or runs the reference.
export function createReferencePreview({ elements, capture, flush, markAssisted, replaceCode, restoreFocus, notice }) {
  const { root, title, code, opener, adopt } = elements;
  let serial = 0;
  let pending = false;
  let current = null;
  const sameView = (a, b) => a.lessonId === b.lessonId && a.navigation === b.navigation &&
    a.epoch === b.epoch && a.solution === b.solution;

  function clear() {
    serial++;
    pending = false;
    current = null;
    root.hidden = true;
    title.textContent = '';
    code.textContent = '';
    opener.setAttribute('aria-expanded', 'false');
  }
  function sync() {
    const view = capture();
    if (current && !sameView(current, view)) clear();
    opener.disabled = pending || !view.allowed;
    adopt.disabled = pending || !view.allowed || !current;
    root.setAttribute('aria-busy', String(pending));
  }
  function close({ focus = false } = {}) {
    clear();
    sync();
    if (focus) restoreFocus();
  }
  async function perform(kind, restart) {
    const start = capture();
    if (pending || !start.allowed || kind === 'adopt' && (!current || !sameView(current, start))) return false;
    const ticket = ++serial;
    pending = true;
    sync();
    const currentView = () => {
      const next = capture();
      return ticket === serial && sameView(start, next) && next.allowed;
    };
    const sameDraft = expected => {
      const next = capture();
      return currentView() && next.revision === expected.revision && next.code === expected.code;
    };
    async function confirmSaved(expected) {
      let saved;
      try { saved = await flush(); }
      catch {
        if (sameDraft(expected)) notice('保存未完成，当前代码没有替换。请先导出或重试保存。');
        return false;
      }
      if (!currentView()) return false;
      if (!sameDraft(expected)) {
        notice('代码已有新的修改，本次参考解操作已取消。');
        return false;
      }
      if (!saved) {
        notice('当前代码尚未确认保存，未替换代码。请先导出或重试保存。');
        return false;
      }
      return true;
    }
    try {
      if (!await confirmSaved(start)) return false;
      if (kind === 'open') {
        markAssisted();
        if (!currentView()) return false;
        // Do not reveal the answer while its assistance marker is only buffered.
        const markedDraft = capture();
        if (!await confirmSaved(markedDraft)) return false;
        current = capture();
        title.textContent = `${start.title} · 参考解`;
        code.textContent = start.solution;
        root.hidden = false;
        opener.setAttribute('aria-expanded', 'true');
        title.focus({ preventScroll: true });
        root.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      } else if (kind === 'restart') {
        clear();
        restart();
        sync();
      } else {
        clear();
        replaceCode(start.solution);
        sync();
        notice('已采用参考解，这份稿记为跟做实践。');
      }
      return true;
    } finally {
      if (ticket === serial) { pending = false; sync(); }
    }
  }
  close();
  return Object.freeze({ open: () => perform('open'), adopt: () => perform('adopt'),
    restart: action => { close(); return perform('restart', action); }, close, sync });
}
