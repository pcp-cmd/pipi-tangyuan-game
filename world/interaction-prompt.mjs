const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const PROMPT_GEOMETRY = Object.freeze({ hitSize: 48, edge: 8, lift: 28 });
export function interactionAnchor(item) {
  const anchor = item?.interactionAnchor ?? item;
  return Number.isFinite(anchor?.x) && Number.isFinite(anchor?.y) ? { x: anchor.x, y: anchor.y } : null;
}
export function projectInteractionPrompt(anchor, camera) {
  if (!anchor || !camera || ![camera.x, camera.y, camera.scale, camera.width, camera.height].every(Number.isFinite) || camera.scale <= 0) return null;
  const x = camera.x + anchor.x * camera.scale, y = camera.y + anchor.y * camera.scale;
  const margin = PROMPT_GEOMETRY.hitSize / 2 + PROMPT_GEOMETRY.edge;
  if (camera.width < margin * 2 || camera.height < margin * 2 || x < 0 || y < 0 || x > camera.width || y > camera.height) return null;
  return { x: clamp(x, margin, camera.width - margin), y: clamp(y - PROMPT_GEOMETRY.lift, margin, camera.height - margin) };
}
const same = (a, b) => a && b && a.id === b.id && a.sceneId === b.sceneId && a.leader === b.leader;
export function mountInteractionPrompt({ document: doc, viewport, onActivate }) {
  const button = doc.createElement('button'); button.id = 'physicalInteract'; button.type = 'button'; button.className = 'physical-interact'; button.hidden = true;
  const key = doc.createElement('kbd'); key.textContent = 'E'; key.setAttribute('aria-hidden', 'true');
  const label = doc.createElement('span'); label.className = 'physical-action-label'; button.append(key, label); viewport.append(button);
  let current = null, pressed = null, keyboardPressed = null, keyboardArmed = false, projection = null, anchor = null, disposed = false;
  function place() {
    const point = projectInteractionPrompt(anchor, projection);
    button.hidden = !current || !point || disposed;
    if (point) { button.style.left = `${point.x}px`; button.style.top = `${point.y}px`; }
  }
  button.addEventListener('pointerdown', event => { event.stopPropagation(); pressed = current; });
  button.addEventListener('pointercancel', () => { pressed = null; });
  button.addEventListener('blur', () => { pressed = null; keyboardPressed = null; });
  button.addEventListener('keydown', event => {
    if (event.isComposing || event.keyCode === 229 || event.repeat) { event.preventDefault(); event.stopPropagation(); return; }
    if (event.key === 'Enter' || event.key === ' ') { keyboardArmed = true; keyboardPressed = current; }
  });
  button.addEventListener('click', event => {
    event.stopPropagation();
    const ticket = event.detail === 0 ? (keyboardArmed ? keyboardPressed : current) : pressed;
    pressed = keyboardPressed = null; keyboardArmed = false;
    if (!button.hidden && same(ticket, current)) void onActivate(ticket, button);
  });
  return Object.freeze({
    update(target, item) {
      if (!same(current, target)) pressed = keyboardPressed = null;
      current = target; anchor = target ? interactionAnchor(item) : null;
      label.textContent = target?.label ?? '';
      button.setAttribute('aria-label', target ? `E：${target.label}` : '场景互动');
      button.title = target ? `${target.label}（E）` : '';
      button.dataset.target = target?.id ?? '';
      place();
    },
    project(camera) { projection = camera; place(); },
    cancel() { pressed = keyboardPressed = null; },
    dispose() { disposed = true; current = pressed = keyboardPressed = null; button.remove(); },
  });
}
