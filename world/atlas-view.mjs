import { GestureClickGuard } from './gesture-click-guard.js';

// Camera only. This module never reads or writes game progress or browser storage.
const ART_WIDTH = 1586, ART_HEIGHT = 992, PAD = 48;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export function atlasGeometry(width, height, zoom = 1, bottom = 0) {
  width = Math.max(1, width); height = Math.max(1, height);
  const fit = Math.max(.01, Math.min(Math.max(1, width - 16) / ART_WIDTH, Math.max(1, height - 112) / ART_HEIGHT));
  const cover = Math.max(width / ART_WIDTH, height / ART_HEIGHT) / fit;
  const maxZoom = Math.max(4, cover);
  zoom = clamp(zoom, 1, maxZoom);
  const artWidth = ART_WIDTH * fit * zoom, artHeight = ART_HEIGHT * fit * zoom;
  const stageWidth = Math.max(width, artWidth + PAD * 2);
  const stageHeight = Math.max(height, artHeight + PAD * 2 + bottom);
  return { width, height, zoom, cover, maxZoom, artWidth, artHeight, stageWidth, stageHeight,
    left: (stageWidth - artWidth) / 2, top: (stageHeight - bottom - artHeight) / 2 };
}

export function atlasCenter(layout, left, top) {
  if (!layout) return { x: .5, y: .5 };
  return { x: clamp((left + layout.width / 2 - layout.left) / layout.artWidth, 0, 1),
    y: clamp((top + layout.height / 2 - layout.top) / layout.artHeight, 0, 1) };
}

export function createAtlasView({ viewport, stage, art, zoomIn, zoomOut, fit, detail, detailOverlay = true, initialView = 'cover', topInset = () => 72, preparePinFocus = () => false, hostWindow = window }) {
  let layout = null, zoom = 1, drag = null, mode = initialView === 'fit' ? 'fit' : 'cover', pointerFocusPin = null;
  const guard = new GestureClickGuard();
  const bottom = () => !detailOverlay || detail.hidden ? 0 : detail.getBoundingClientRect().height + 24;
  function draw(center = atlasCenter(layout, viewport.scrollLeft, viewport.scrollTop)) {
    if (!viewport.clientWidth || !viewport.clientHeight) return;
    if (mode === 'cover') zoom = atlasGeometry(viewport.clientWidth, viewport.clientHeight).cover;
    if (mode === 'fit') zoom = 1;
    layout = atlasGeometry(viewport.clientWidth, viewport.clientHeight, zoom, bottom());
    const topPadding = Math.max(0, topInset());
    layout.top += topPadding;
    layout.stageHeight += topPadding;
    zoom = layout.zoom;
    stage.style.width = `${layout.stageWidth}px`; stage.style.height = `${layout.stageHeight}px`;
    Object.assign(art.style, { width: `${layout.artWidth}px`, height: `${layout.artHeight}px`,
      left: `${layout.left}px`, top: `${layout.top}px` });
    viewport.scrollLeft = layout.left + center.x * layout.artWidth - layout.width / 2;
    viewport.scrollTop = layout.top + center.y * layout.artHeight - layout.height / 2;
    zoomOut.disabled = zoom <= 1.001; zoomIn.disabled = zoom >= layout.maxZoom - .001;
  }
  function reveal(pin) {
    if (!pin || !layout) return;
    const a = viewport.getBoundingClientRect(), p = pin.getBoundingClientRect();
    const safeBottom = Math.max(a.top + 132, a.bottom - bottom() - 40);
    const safe = { left: a.left + 12, right: a.right - 12,
      top: Math.min(a.top + topInset(), safeBottom - Math.min(p.height || p.bottom - p.top, 64)), bottom: safeBottom };
    const dx = p.left < safe.left ? p.left - safe.left : p.right > safe.right ? p.right - safe.right : 0;
    const dy = p.top < safe.top ? p.top - safe.top : p.bottom > safe.bottom ? p.bottom - safe.bottom : 0;
    viewport.scrollLeft += dx; viewport.scrollTop += dy;
  }
  function resize() {
    draw();
    const focused = viewport.ownerDocument.activeElement;
    if (focused?.matches('.atlas-pin') && focused !== pointerFocusPin) revealFocused(focused);
  }
  function revealFocused(pin) {
    const bounds = viewport.getBoundingClientRect(), target = pin.getBoundingClientRect();
    const availableHeight = bounds.height - topInset() - bottom() - 40;
    if (!detail.hidden && availableHeight < (target.height || target.bottom - target.top) + 16 && preparePinFocus(pin)) draw();
    reveal(pin);
  }
  function changeZoom(factor) { mode = 'custom'; zoom *= factor; draw(); }
  zoomIn.addEventListener('click', () => changeZoom(1.35));
  zoomOut.addEventListener('click', () => changeZoom(1 / 1.35));
  fit.addEventListener('click', () => { mode = 'fit'; zoom = 1; draw({ x: .5, y: .5 }); });
  // Native pointer focus must not scroll a pressed pin away from its release.
  // Touch focuses after pointerup, so this transaction ends at click, not up.
  const clearPointerFocus = () => { pointerFocusPin = null; };
  hostWindow.addEventListener('pointerdown', clearPointerFocus, true);
  hostWindow.addEventListener('keydown', clearPointerFocus, true);
  hostWindow.addEventListener('click', clearPointerFocus, true);
  viewport.addEventListener('focusin', event => {
    if (event.target.matches('.atlas-pin') && event.target !== pointerFocusPin) revealFocused(event.target);
  });
  viewport.addEventListener('keydown', event => {
    // Candidate-selection keys belong to the input method, not the map camera.
    if (event.isComposing || event.keyCode === 229) return;
    if (event.target !== viewport) return;
    const delta = { ArrowLeft: [-80, 0], ArrowRight: [80, 0], ArrowUp: [0, -80], ArrowDown: [0, 80] }[event.key];
    if (delta) { event.preventDefault(); viewport.scrollLeft += delta[0]; viewport.scrollTop += delta[1]; }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); changeZoom(1.35); }
    if (event.key === '-') { event.preventDefault(); changeZoom(1 / 1.35); }
    if (event.key === '0') { event.preventDefault(); mode = 'fit'; zoom = 1; draw({ x: .5, y: .5 }); }
  });
  viewport.addEventListener('pointerdown', event => {
    pointerFocusPin = event.button === 0 ? event.target?.closest?.('.atlas-pin') || null : null;
    // Touch scrolling remains native. Capture a mouse only after it becomes a drag,
    // otherwise a click on a pin must still reach that pin.
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    guard.begin();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY,
      left: viewport.scrollLeft, top: viewport.scrollTop, moved: false };
  });
  hostWindow.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) viewport.setPointerCapture(event.pointerId);
    drag.moved = true; guard.drag(); viewport.classList.add('dragging');
    viewport.scrollLeft = drag.left - dx; viewport.scrollTop = drag.top - dy;
  });
  function end(event) {
    if (event.type === 'pointercancel') clearPointerFocus();
    if (!drag || event.pointerId !== drag.id) return;
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    drag = null; viewport.classList.remove('dragging');
    if (event.type === 'pointercancel') guard.cancel(); else guard.finish();
  }
  hostWindow.addEventListener('pointerup', end);
  hostWindow.addEventListener('pointercancel', end);
  hostWindow.addEventListener('blur', () => { clearPointerFocus(); drag = null; guard.cancel(); viewport.classList.remove('dragging'); });
  viewport.addEventListener('click', event => {
    if (guard.consume(event.detail)) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  return {
    open() {
      if (!layout) zoom = atlasGeometry(viewport.clientWidth, viewport.clientHeight).cover;
      draw();
    },
    resize, reveal,
    refreshDetails(pin) { draw(); reveal(pin); }
  };
}
