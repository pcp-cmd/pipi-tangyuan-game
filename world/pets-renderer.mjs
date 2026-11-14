import { createPetScheduler } from './pets-scheduler.mjs';
import { petFrameSource } from './pets-frame-adapter.mjs';

export const COMPANION_SHEETS = Object.freeze({
  pipi: new URL('./assets/pets/pipi-original-v2.lossless.webp', import.meta.url).href,
  tangyuan: new URL('./assets/pets/tangyuan-original-v2.lossless.webp', import.meta.url).href,
});
const cats = ['pipi', 'tangyuan'];
const frameKeys = ['petState', 'petFrame', 'petRow', 'petColumn', 'petSourceRow', 'petSourceColumn', 'petMirrored'];

export function createCompanionSprites({ actors, portraits, surfaces = {}, surfaceVisibility = {}, document: doc = document, window: win = window, mediaQuery = win.matchMedia('(prefers-reduced-motion: reduce)'), schedulerOptions = {}, sceneVisible = true, originalLeft = false }) {
  const mounts = new Map(cats.map(cat => [cat, { core: [], extra: [], ready: false, failed: false }]));
  const cleanup = [], visibleSurfaces = new Map([['scene', Boolean(sceneVisible)], ['portraits', false], ...Object.keys(surfaces).map(name => [name, false]), ...Object.entries(surfaceVisibility).map(([name, value]) => [name, Boolean(value)])]);
  let disposed = false, pageActive = true;
  const scheduler = createPetScheduler({ ...schedulerOptions, visible: false, reducedMotion: mediaQuery.matches,
    render(cat, frame) {
      const record = mounts.get(cat), source = petFrameSource(cat, frame, { originalLeft });
      for (const mounted of [...record.core, ...record.extra]) {
        if (!mounted.ready || !visibleSurfaces.get(mounted.surface)) continue;
        const key = `${frame.state}:${source.row}:${source.column}:${source.mirrored}`;
        if (mounted.last === key) continue;
        mounted.frame.style.setProperty('--pet-x', `${-source.column * 100}%`);
        mounted.frame.style.setProperty('--pet-y', `${-source.row * 100}%`);
        mounted.frame.style.transform = source.mirrored ? 'scaleX(-1)' : 'none';
        mounted.frame.style.transformOrigin = 'center';
        Object.assign(mounted.slot.dataset, { petState: frame.state, petFrame: String(frame.column), petRow: String(frame.row), petColumn: String(frame.column), petSourceRow: String(source.row), petSourceColumn: String(source.column), petMirrored: String(source.mirrored) });
        mounted.last = key;
      }
    },
  });
  function syncVisibility() {
    if (disposed) return;
    scheduler.setVisible(pageActive && !doc.hidden && [...visibleSurfaces.values()].some(Boolean));
    for (const [cat, record] of mounts) scheduler.setCatVisible(cat, [...record.core, ...record.extra].some(mounted => mounted.ready && visibleSurfaces.get(mounted.surface)));
  }
  const listen = (target, name, callback) => { target.addEventListener(name, callback); cleanup.push(() => target.removeEventListener(name, callback)); };
  function fallback(mounted) {
    mounted.failed = true; mounted.ready = false; mounted.frame.hidden = true;
    mounted.slot.classList.remove('pets-ready'); mounted.slot.dataset.petStatus = 'fallback';
    for (const key of frameKeys) delete mounted.slot.dataset[key];
  }
  function reveal(mounted) {
    mounted.ready = true; mounted.frame.hidden = false; mounted.last = null;
    mounted.slot.classList.add('pets-ready'); mounted.slot.dataset.petStatus = 'ready';
  }
  function refresh(cat) {
    const record = mounts.get(cat);
    scheduler.setEnabled(cat, record.ready || record.extra.some(mounted => mounted.ready));
    syncVisibility(); scheduler.refresh(cat);
  }
  function mountFrame(cat, surface, slot, core) {
    if (!slot) throw new TypeError('A companion art slot is required');
    const record = mounts.get(cat), frame = doc.createElement('span');
    frame.className = 'pets-frame'; frame.setAttribute('aria-hidden', 'true'); frame.hidden = true;
    const image = doc.createElement('img'); image.className = 'pets-sheet'; image.alt = ''; image.draggable = false; image.decoding = 'async';
    frame.append(image); slot.append(frame);
    const mounted = { cat, surface, slot, frame, image, ready: false, loaded: false, failed: false, decoding: false, last: null };
    (core ? record.core : record.extra).push(mounted);
    slot.dataset.petStatus = 'loading';
    if (core && record.failed) { fallback(mounted); return mounted; }
    const reject = () => {
      if (disposed) return;
      if (core) { record.failed = true; record.ready = false; for (const member of record.core) fallback(member); }
      else fallback(mounted);
      refresh(cat);
    };
    const accept = () => {
      if (disposed || mounted.failed || (core && record.failed)) return;
      if (image.naturalWidth !== 1536 || image.naturalHeight !== 2288) { reject(); return; }
      mounted.loaded = true;
      if (core) {
        if (record.core.length !== 2 || !record.core.every(member => member.loaded)) return;
        record.ready = true; record.core.forEach(reveal);
      } else reveal(mounted);
      refresh(cat);
    };
    const decode = () => {
      if (disposed || mounted.failed || mounted.decoding || (core && record.failed)) return;
      mounted.decoding = true;
      if (typeof image.decode !== 'function') { accept(); return; }
      Promise.resolve().then(() => disposed ? undefined : image.decode()).then(accept, reject);
    };
    listen(image, 'load', decode); listen(image, 'error', reject);
    image.src = COMPANION_SHEETS[cat];
    if (image.complete && image.naturalWidth) decode();
    return mounted;
  }
  for (const cat of cats) {
    mountFrame(cat, 'scene', actors[cat], true);
    mountFrame(cat, 'portraits', portraits[cat], true);
  }
  for (const [surface, slots] of Object.entries(surfaces)) {
    if (['scene', 'portraits'].includes(surface)) throw new RangeError('A companion surface must have a unique name');
    for (const cat of cats) if (slots[cat]) mountFrame(cat, surface, slots[cat], false);
  }
  syncVisibility();
  listen(doc, 'visibilitychange', syncVisibility);
  listen(win, 'pagehide', event => { pageActive = false; syncVisibility(); if (event.persisted === false) dispose(); });
  listen(win, 'pageshow', () => { pageActive = true; syncVisibility(); });
  if (typeof mediaQuery.addEventListener === 'function') listen(mediaQuery, 'change', event => scheduler.setReducedMotion(event.matches));
  else if (typeof mediaQuery.addListener === 'function') { const change = event => scheduler.setReducedMotion(event.matches); mediaQuery.addListener(change); cleanup.push(() => mediaQuery.removeListener(change)); }
  function setSurfaceVisible(surface, value) {
    if (disposed) return;
    if (!visibleSurfaces.has(surface)) throw new RangeError('Unknown companion surface');
    if (visibleSurfaces.get(surface) === Boolean(value)) return;
    visibleSurfaces.set(surface, Boolean(value));
    for (const record of mounts.values()) for (const mounted of [...record.core, ...record.extra]) if (mounted.surface === surface) mounted.last = null;
    syncVisibility(); for (const cat of cats) scheduler.refresh(cat);
  }
  function dispose() {
    if (disposed) return;
    disposed = true; scheduler.dispose(); for (const fn of cleanup) fn();
    for (const record of mounts.values()) for (const mounted of [...record.core, ...record.extra]) {
      mounted.frame.remove(); mounted.slot.classList.remove('pets-ready'); delete mounted.slot.dataset.petStatus;
      for (const key of frameKeys) delete mounted.slot.dataset[key];
    }
  }
  const actionMethods = ['setContext', 'contextToken', 'beginRun', 'beginWait', 'endWait', 'setRunPhase', 'completeRun', 'cancelRun', 'setReview', 'wave', 'look', 'clearLook', 'setMotion', 'move', 'stopMotion', 'setBusy'];
  return Object.freeze({
    ...Object.fromEntries(actionMethods.map(name => [name, (...args) => scheduler[name](...args)])),
    setSceneVisible: value => setSurfaceVisible('scene', value), setSurfaceVisible,
    isReady: cat => mounts.get(cat)?.ready === true,
    snapshot: () => ({ ...scheduler.snapshot(), surfaces: Object.fromEntries(visibleSurfaces), mounts: Object.fromEntries([...mounts].map(([cat, record]) => [cat, [...record.core, ...record.extra].map(mounted => ({ surface: mounted.surface, ready: mounted.ready, failed: mounted.failed }))])) }),
    dispose,
  });
}
