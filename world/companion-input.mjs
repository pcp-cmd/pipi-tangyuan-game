export function mountCompanionInput({ root, sprites, visibleSlots, context, canGreet = () => true }) {
  const cleanup = [];
  const listen = (event, handler, options) => {
    root.addEventListener(event, handler, options);
    cleanup.push(() => root.removeEventListener(event, handler, options));
  };
  function lookAt(x, y) {
    const owner = context();
    for (const { cat, slot } of visibleSlots()) {
      const rect = slot.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      const dx = x - rect.left - rect.width / 2, dy = y - rect.top - rect.height / 2;
      if (Math.hypot(dx, dy) <= 1e-7) continue;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      sprites.look(cat, angle, owner);
    }
  }
  function clear() { for (const cat of ['pipi', 'tangyuan']) sprites.clearLook(cat); }
  listen('pointermove', event => lookAt(event.clientX, event.clientY), { passive: true });
  listen('pointerleave', clear);
  listen('focusin', event => {
    const rect = event.target.getBoundingClientRect?.();
    if (rect) lookAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });
  listen('focusout', event => { if (!root.contains(event.relatedTarget)) clear(); });
  listen('click', event => {
    const button = event.target.closest?.('[data-wave-cat]');
    if (button && root.contains(button) && !button.disabled && canGreet()) sprites.wave(button.dataset.waveCat, context());
  });
  return Object.freeze({ dispose() { for (const remove of cleanup) remove(); clear(); } });
}
