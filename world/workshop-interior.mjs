import { WORKSHOP_ART, WORKSHOP_OBJECTS, fitWorkshop, workshopObjectStyle } from './workshop-scene-model.mjs';

const IDLE_COPY = '点选桌上的物件，继续当前实践。';

// A presentation-only room. The host owns navigation, save gates and execution.
export function createWorkshopInterior({ host, onIntent, onExit, fallbackFocus, onBeforeVisibilityChange = () => {},
  document: doc = document, window: win = window, ResizeObserver: Observer = win.ResizeObserver } = {}) {
  if (!host || typeof onIntent !== 'function' || typeof onExit !== 'function') throw new TypeError('Workshop host and callbacks are required');
  let visible = false, disposed = false, pending = false, exiting = false, generation = 0, opener = null, assetsStarted = false;
  const cleanup = [], loaders = [], buttons = new Map();
  const make = (tag, className, text) => { const node = doc.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; };
  const listen = (node, type, handler) => { node.addEventListener(type, handler); cleanup.push(() => node.removeEventListener(type, handler)); };
  const room = make('section', 'workshop-interior'); room.hidden = true; room.setAttribute('aria-label', '代码工坊室内'); room.setAttribute('role', 'dialog'); room.setAttribute('aria-modal', 'true');
  const frame = make('div', 'workshop-interior-frame');
  const background = make('img', 'workshop-interior-background'); background.alt = '海岛日落映入木工坊，空桌前铺着蓝色地毯。'; background.draggable = false;
  const header = make('header', 'workshop-interior-header');
  const exit = make('button', 'workshop-interior-exit', '回到小岛'); exit.type = 'button';
  const heading = make('h2', '', '代码工坊');
  const status = make('p', 'workshop-interior-status', IDLE_COPY); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  header.append(exit, heading); frame.append(background); room.append(frame, header, status); host.append(room);

  const updateButtons = () => { for (const button of buttons.values()) button.disabled = pending || exiting; exit.disabled = exiting; room.setAttribute('aria-busy', String(pending || exiting)); };
  const fit = () => {
    if (!visible || disposed) return;
    const size = fitWorkshop(room.clientWidth, room.clientHeight);
    frame.style.width = `${size.width}px`; frame.style.height = `${size.height}px`;
  };
  function hide({ restoreFocus = true } = {}) {
    if (disposed) return;
    // Synchronize the outdoor presentation before removing its hiding class.
    if (visible) onBeforeVisibilityChange(false);
    visible = false; pending = false; exiting = false; generation += 1;
    room.hidden = true; room.inert = false; host.classList.remove('workshop-interior-open'); updateButtons();
    const target = opener?.isConnected && !opener.closest('[hidden],[inert]') ? opener : fallbackFocus?.();
    if (restoreFocus) target?.focus({ preventScroll: true });
  }
  async function requestExit() {
    if (!visible || disposed || exiting) return;
    const ticket = ++generation; pending = false; exiting = true; updateButtons();
    try {
      const accepted = await onExit();
      if (disposed || ticket !== generation) return;
      if (accepted !== false) { hide(); return; }
      status.textContent = '暂时不能离开，请先处理当前面板中的提示。';
    } catch {
      if (!disposed && ticket === generation) status.textContent = '暂时不能离开，请再试一次。';
    } finally {
      if (!disposed && ticket === generation) { exiting = false; updateButtons(); }
    }
  }
  async function activate(object, button) {
    if (!visible || disposed || pending || exiting) return;
    const ticket = ++generation; pending = true; updateButtons(); status.textContent = `正在打开${object.name}…`;
    try {
      const accepted = await onIntent({ id: object.id, intent: object.intent, opener: button });
      if (disposed || ticket !== generation) return;
      status.textContent = accepted === false ? '入口暂未打开，请先处理当前面板中的提示。' : IDLE_COPY;
    } catch {
      if (!disposed && ticket === generation) status.textContent = '入口暂未打开，请再试一次。';
    } finally {
      if (!disposed && ticket === generation) { pending = false; updateButtons(); }
    }
  }
  const backgroundFailed = () => { if (disposed) return; background.hidden = true; room.dataset.background = 'fallback'; status.textContent = '场景图片未能加载，桌上入口仍可用。'; };
  listen(background, 'load', () => { if (disposed) return; if (background.naturalWidth !== WORKSHOP_ART.width || background.naturalHeight !== WORKSHOP_ART.height) return backgroundFailed(); background.hidden = false; room.dataset.background = 'ready'; });
  listen(background, 'error', backgroundFailed);
  loaders.push(() => { background.src = WORKSHOP_ART.background; });
  for (const object of WORKSHOP_OBJECTS) {
    const style = workshopObjectStyle(object), button = make('button', 'workshop-object');
    button.type = 'button'; button.dataset.object = object.id; button.setAttribute('aria-label', object.label);
    button.style.left = style.left; button.style.bottom = style.bottom; button.style.width = style.width;
    const crop = make('span', 'workshop-prop'); crop.style.aspectRatio = style.ratio; crop.setAttribute('aria-hidden', 'true');
    const image = make('img', 'workshop-prop-image'); image.alt = ''; image.draggable = false; image.hidden = true;
    image.style.width = style.imageWidth; image.style.height = style.imageHeight; image.style.left = style.imageLeft; image.style.top = style.imageTop;
    const label = make('span', 'workshop-object-label', object.name);
    crop.append(image); button.append(crop, label); frame.append(button); buttons.set(object.id, button);
    const fail = () => { if (disposed) return; image.hidden = true; button.classList.remove('workshop-object-ready'); button.dataset.art = 'fallback'; };
    listen(image, 'load', () => { if (disposed) return; if (image.naturalWidth !== WORKSHOP_ART.atlasWidth || image.naturalHeight !== WORKSHOP_ART.atlasHeight) return fail(); image.hidden = false; button.classList.add('workshop-object-ready'); button.dataset.art = 'ready'; });
    listen(image, 'error', fail); loaders.push(() => { image.src = WORKSHOP_ART.props; });
    listen(button, 'click', () => activate(object, button));
  }
  listen(exit, 'click', requestExit);
  listen(room, 'keydown', event => {
    if (event.key === 'Tab' && !room.inert) {
      const available = [exit, ...buttons.values()].filter(button => !button.disabled);
      if (event.shiftKey && doc.activeElement === available[0]) { event.preventDefault(); available.at(-1)?.focus({ preventScroll: true }); }
      else if (!event.shiftKey && doc.activeElement === available.at(-1)) { event.preventDefault(); available[0]?.focus({ preventScroll: true }); }
    }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); void requestExit(); } });
  let observer;
  if (Observer) { observer = new Observer(fit); observer.observe(room); }
  else listen(win, 'resize', fit);
  return Object.freeze({
    show(source = doc.activeElement) { if (disposed) return false; if (visible) { fit(); return true; } onBeforeVisibilityChange(true); opener = source; visible = true; room.hidden = false; host.classList.add('workshop-interior-open'); status.textContent = room.dataset.background === 'fallback' ? '场景图片未能加载，桌上入口仍可用。' : IDLE_COPY; if (!assetsStarted) { assetsStarted = true; for (const load of loaders) load(); } fit(); exit.focus({ preventScroll: true }); return true; },
    setObscured(value) { if (!disposed) room.inert = Boolean(value); },
    focusDefault(source) { if (!visible || disposed) return false; const target = [exit, ...buttons.values()].includes(source) ? source : buttons.get('bench'); target?.focus({ preventScroll: true }); return true; },
    hide, requestExit, isVisible: () => visible,
    snapshot: () => ({ visible, pending, exiting, disposed }),
    dispose() { if (disposed) return; hide({ restoreFocus: false }); disposed = true; observer?.disconnect(); for (const fn of cleanup) fn(); room.remove(); },
  });
}
