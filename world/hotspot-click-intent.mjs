export const HOTSPOT_SINGLE_CLICK_DELAY_MS = 500;

// A first pointer click must not move its target before the native second click.
export function createHotspotClickIntent({ setTimer = setTimeout, clearTimer = clearTimeout, pause = () => () => {} } = {}) {
  let pending = null, epoch = 0, disposed = false;
  function cancel() {
    const previous = pending; pending = null; epoch++;
    if (previous) { clearTimer(previous.timer); previous.release(); }
  }
  function click(detail, approach) {
    cancel();
    if (disposed) return;
    if (detail === 0) return approach();
    if (detail !== 1) return;
    const release = pause(), token = ++epoch;
    const request = { token, release, timer: null };
    pending = request;
    request.timer = setTimer(() => {
      if (disposed || pending !== request) return;
      pending = null; request.release();
      if (!disposed && epoch === token) void approach();
    }, HOTSPOT_SINGLE_CLICK_DELAY_MS);
  }
  function activate(action) { cancel(); if (!disposed) return action(); }
  function bind(button, { approach, activate: action }) {
    button.addEventListener('click', event => { event.stopPropagation(); return click(event.detail, approach); });
    button.addEventListener('dblclick', event => { event.preventDefault(); event.stopPropagation(); return activate(action); });
  }
  return Object.freeze({ bind, cancel, pending: () => pending !== null,
    dispose() { disposed = true; cancel(); } });
}
