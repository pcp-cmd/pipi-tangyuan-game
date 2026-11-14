// Presentation-only keyboard reveal. It never receives a session, camera record,
// storage object or persistence callback. The host retains its normal camera.
const rect = r => ({ left: r.left ?? r.x, top: r.top ?? r.y, width: r.width, height: r.height,
  right: (r.left ?? r.x) + r.width, bottom: (r.top ?? r.y) + r.height });
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
const overlaps = (a, b, gap) => a.left < b.right + gap && a.right > b.left - gap && a.top < b.bottom + gap && a.bottom > b.top - gap;

/** Find the smallest screen-space pan that exposes the whole focus outline,
 * without revealing empty space outside the image or covering a HUD control. */
export function findFocusPan({ target, viewport, world, obstacles = [], gap = 8 }) {
  const t = rect(target), v = rect(viewport), w = rect(world), blocks = obstacles.map(rect);
  if (![t, v, w, ...blocks].every(r => Object.values(r).every(Number.isFinite) && r.width >= 0 && r.height >= 0) || !Number.isFinite(gap) || gap < 0) throw new RangeError('Invalid focus geometry');
  if (!t.width || !t.height || !v.width || !v.height) return null;
  const minX = Math.max(v.right - w.right, v.left + gap - t.left);
  const maxX = Math.min(v.left - w.left, v.right - gap - t.right);
  const minY = Math.max(v.bottom - w.bottom, v.top + gap - t.top);
  const maxY = Math.min(v.top - w.top, v.bottom - gap - t.bottom);
  if (minX > maxX + .1 || minY > maxY + .1) return null;
  const xs = [0, minX, maxX], ys = [0, minY, maxY];
  for (const b of blocks) { xs.push(b.left - gap - t.right, b.right + gap - t.left); ys.push(b.top - gap - t.bottom, b.bottom + gap - t.top); }
  let best = null;
  for (const x of new Set(xs.map(x => clamp(x, minX, maxX)))) for (const y of new Set(ys.map(y => clamp(y, minY, maxY)))) {
    const moved = { ...t, left: t.left + x, right: t.right + x, top: t.top + y, bottom: t.bottom + y };
    if (blocks.some(b => overlaps(moved, b, gap - .1))) continue;
    const distance = x * x + y * y;
    if (!best || distance < best.distance) best = { x, y, distance };
  }
  return best && { x: best.x, y: best.y };
}

export function mountSceneKeyboardFocus({ world, viewport, obstacles, document: doc = document, window: win = window }) {
  let original = null, disposed = false;
  const cleanups = [];
  const listen = (node, name, handler) => { node.addEventListener(name, handler); cleanups.push(() => node.removeEventListener(name, handler)); };
  function clear() {
    if (!original) return;
    world.style.transform = original.transform;
    if (original.minTarget) world.style.setProperty('--world-min-target', original.minTarget);
    else world.style.removeProperty('--world-min-target');
    original = null;
  }
  function reveal(target) {
    clear();
    if (disposed || !target?.matches?.('button:focus-visible') || !world.contains(target) || target.closest('[hidden],[inert]') || !target.getClientRects().length) return false;
    const v = rect(viewport.getBoundingClientRect()), base = rect(world.getBoundingClientRect());
    const baseScale = base.width / world.clientWidth;
    if (!Number.isFinite(baseScale) || baseScale <= 0) return false;
    original = { transform: world.style.transform, minTarget: world.style.getPropertyValue('--world-min-target') };
    const blocked = obstacles().filter(n => n.getClientRects().length && win.getComputedStyle(n).visibility !== 'hidden').map(n => n.getBoundingClientRect());
    // A cover-fit scene may have no vertical pan room. A temporary closer view
    // then makes a northern landmark reachable below the HUD, without blank edges.
    for (const multiplier of [1, 1.25, 1.5, 2]) {
      const scale = baseScale * multiplier;
      world.style.transform = `translate(${base.left - v.left}px, ${base.top - v.top}px) scale(${scale})`;
      world.style.setProperty('--world-min-target', `${45 / scale}px`);
      const pan = findFocusPan({ target: target.getBoundingClientRect(), viewport: v, world: world.getBoundingClientRect(), obstacles: blocked });
      if (!pan) continue;
      world.style.transform = `translate(${base.left - v.left + pan.x}px, ${base.top - v.top + pan.y}px) scale(${scale})`;
      return true;
    }
    clear();
    return false;
  }
  // Touch focuses after release, before its native click. Keep the pressed
  // geometry; only keyboard focus should restore and reveal another target.
  listen(world, 'focusin', event => { if (event.target.matches?.('button:focus-visible')) reveal(event.target); });
  listen(world, 'focusout', event => { if (!world.contains(event.relatedTarget)) clear(); });
  listen(win, 'resize', () => reveal(doc.activeElement));
  const dispose = () => { if (disposed) return; clear(); disposed = true; for (const fn of cleanups) fn(); };
  listen(win, 'pagehide', event => { if (event.persisted) clear(); else dispose(); });
  listen(win, 'pageshow', event => { if (event.persisted) reveal(doc.activeElement); });
  return Object.freeze({ clear, reveal, dispose });
}
