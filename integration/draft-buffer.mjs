export function createDraftBuffer({ commit, delayMs = 300, setTimer = setTimeout, clearTimer = clearTimeout }) {
  let pending = null, timer = null;
  function clear() { if (timer !== null) clearTimer(timer); timer = null; }
  function flush() {
    clear();
    if (!pending) return true;
    const draft = pending;
    const accepted = commit(draft) !== false;
    if (accepted && pending === draft) pending = null;
    return accepted;
  }
  return Object.freeze({
    mark(draft) { pending = Object.freeze({ ...draft }); clear(); timer = setTimer(flush, delayMs); },
    flush,
    discard() { clear(); pending = null; },
    snapshot: () => pending
  });
}
