import { createPetScheduler } from '../pets-scheduler.mjs';
import { petFrameSource } from '../pets-frame-adapter.mjs';
import { PETS_ASSET_IDENTITIES } from '../pets-asset-identities.mjs';
import { loadVerifiedImage } from './asset-loader.mjs';
                                                      
import { scheduleStartupTask } from './startup.mjs';

                                            
const cats                       = ['pipi', 'tangyuan'];
export const COMPANION_SHEETS                                      = Object.freeze({
  pipi: new URL('../assets/pets/pipi-original-v2.lossless.webp', import.meta.url).href,
  tangyuan: new URL('../assets/pets/tangyuan-original-v2.lossless.webp', import.meta.url).href,
});
export const COMPANION_IDLE                                      = Object.freeze({
  pipi: new URL('../assets/pets/pipi-idle-v2.png', import.meta.url).href,
  tangyuan: new URL('../assets/pets/tangyuan-idle-v2.png', import.meta.url).href,
});
const frameKeys = ['petState', 'petFrame', 'petRow', 'petColumn', 'petSourceRow', 'petSourceColumn', 'petMirrored'];
                                            
                         
                     
                               
                                   
                    
                          
  
                                                            
const makeScheduler = createPetScheduler                                                                                                                                        ;
              
                                                                                                  
                                                                                         
  
                
                
                   
                                            
                                              
                      
                  
                              
                                      
                         
                         
                                                                            
                                                  
  

export function createCompanionSprites({ actors, portraits, surfaces = {}, surfaceVisibility = {}, document: doc = document, window: win = window,
  mediaQuery = win.matchMedia('(prefers-reduced-motion: reduce)'), schedulerOptions = {}, sceneVisible = true, originalLeft = false,
  loadAtlas = (cat, signal) => loadVerifiedImage({ src: COMPANION_SHEETS[cat], naturalWidth: 1536, naturalHeight: 2288, sha256: PETS_ASSET_IDENTITIES[cat].runtimeSha256 }, { signal }),
  scheduleLoad = task => scheduleStartupTask(task, win),
}         ) {
  const mounts = new Map                    (cats.map(cat => [cat, []]));
  const resources = new Map                                 ();
  const loaded = new Set             ();
  const controller = new AbortController();
  const cleanup                    = [];
  const visibleSurfaces = new Map                 ([['scene', sceneVisible], ['portraits', false], ...Object.keys(surfaces).map(name => [name, false]                     ), ...Object.entries(surfaceVisibility)]);
  let disposed = false;
  let pageActive = true;
  const scheduler = makeScheduler({ ...schedulerOptions, visible: false, reducedMotion: mediaQuery.matches,
    render(cat           , frame                                                ) {
      const source = petFrameSource(cat, frame, { originalLeft });
      for (const mount of mounts.get(cat) ?? []) {
        if (!mount.ready || !visibleSurfaces.get(mount.surface)) continue;
        const key = `${frame.state}:${source.row}:${source.column}:${source.mirrored}`;
        if (mount.last === key) continue;
        mount.frame.style.setProperty('--pet-x', `${-source.column * 100}%`);
        mount.frame.style.setProperty('--pet-y', `${-source.row * 100}%`);
        mount.frame.style.transform = source.mirrored ? 'scaleX(-1)' : 'none';
        mount.frame.style.transformOrigin = 'center';
        Object.assign(mount.slot.dataset, { petState: frame.state, petFrame: String(frame.column), petRow: String(frame.row), petColumn: String(frame.column), petSourceRow: String(source.row), petSourceColumn: String(source.column), petMirrored: String(source.mirrored) });
        mount.last = key;
      }
    },
  });
  function listen(target             , event        , callback               ) {
    target.addEventListener(event, callback);
    cleanup.push(() => target.removeEventListener(event, callback));
  }
  function syncVisibility() {
    if (disposed) return;
    scheduler.setVisible(pageActive && !doc.hidden && [...visibleSurfaces.values()].some(Boolean));
    for (const cat of cats) scheduler.setCatVisible(cat, (mounts.get(cat) ?? []).some(mount => mount.ready && visibleSurfaces.get(mount.surface)));
  }
  function refresh(cat           ) {
    scheduler.setEnabled(cat, (mounts.get(cat) ?? []).some(mount => mount.ready));
    syncVisibility();
    scheduler.refresh(cat);
  }
  function fallback(mount       ) {
    mount.failed = true; mount.pending = false; mount.ready = false; mount.frame.hidden = true;
    mount.slot.classList.remove('pets-ready');
    mount.slot.dataset.petStatus = 'fallback';
    for (const key of frameKeys) delete mount.slot.dataset[key];
  }
  function resource(cat           )                       {
    const cached = resources.get(cat);
    if (cached) return cached;
    const request = loadAtlas(cat, controller.signal).then(image => {
      if (disposed) { image.dispose(); throw new Error('disposed'); }
      loaded.add(image);
      return image;
    }).catch(error => { resources.delete(cat); throw error; });
    resources.set(cat, request);
    return request;
  }
  async function hydrate(mount       ) {
    if (disposed || mount.ready || mount.pending || !visibleSurfaces.get(mount.surface)) return;
    const serial = ++mount.serial;
    mount.pending = true; mount.failed = false; mount.slot.dataset.petStatus = 'loading';
    try {
      const image = await resource(mount.cat);
      if (disposed || serial !== mount.serial) return;
      const accept = () => {
        if (disposed || serial !== mount.serial || !mount.pending) return;
        if (mount.image.naturalWidth !== 1536 || mount.image.naturalHeight !== 2288) { reject(); return; }
        mount.pending = false; mount.ready = true; mount.failed = false; mount.last = null;
        mount.frame.hidden = false; mount.slot.classList.add('pets-ready'); mount.slot.dataset.petStatus = 'ready';
        mount.image.removeEventListener('load', accept);
        refresh(mount.cat);
      };
      const reject = () => {
        if (disposed || serial !== mount.serial || (!mount.pending && !mount.ready)) return;
        mount.image.removeEventListener('load', accept); mount.image.removeEventListener('error', reject);
        fallback(mount); refresh(mount.cat);
      };
      listen(mount.image, 'load', accept); listen(mount.image, 'error', reject);
      mount.image.src = image.objectUrl;
      if (mount.image.complete && mount.image.naturalWidth) accept();
    } catch {
      if (disposed || serial !== mount.serial) return;
      fallback(mount); refresh(mount.cat);
    }
  }
  function mountFrame(cat           , surface        , slot             ) {
    if (!slot) throw new TypeError('A companion art slot is required');
    const frame = doc.createElement('span');
    frame.className = 'pets-frame'; frame.setAttribute('aria-hidden', 'true'); frame.hidden = true;
    const image = doc.createElement('img');
    image.className = 'pets-sheet'; image.alt = ''; image.draggable = false; image.decoding = 'async';
    frame.append(image); slot.append(frame);
    const mount        = { cat, surface, slot, frame, image, ready: false, failed: false, pending: false, last: null, serial: 0 };
    mounts.get(cat)?.push(mount);
    slot.dataset.petStatus = 'idle';
    const idle = slot.querySelector                  (':scope > img');
    if (idle) { idle.src = COMPANION_IDLE[cat]; idle.classList.add('pets-idle'); }
  }
  for (const cat of cats) { mountFrame(cat, 'scene', actors[cat]); mountFrame(cat, 'portraits', portraits[cat]); }
  for (const [surface, slots] of Object.entries(surfaces)) {
    if (['scene', 'portraits'].includes(surface)) throw new RangeError('A companion surface must have a unique name');
    for (const cat of cats) if (slots[cat]) mountFrame(cat, surface, slots[cat]);
  }
  function hydrateVisible() {
    if (disposed || !pageActive || doc.hidden) return;
    for (const record of mounts.values()) for (const mount of record) if (visibleSurfaces.get(mount.surface)) void hydrate(mount);
  }
  cleanup.push(scheduleLoad(hydrateVisible));
  syncVisibility();
  listen(doc, 'visibilitychange', () => { syncVisibility(); hydrateVisible(); });
  listen(win, 'pagehide', event => { pageActive = false; syncVisibility(); if (!(event                       ).persisted) dispose(); });
  listen(win, 'pageshow', () => { pageActive = true; syncVisibility(); hydrateVisible(); });
  const change = (event                     ) => scheduler.setReducedMotion(event.matches);
  if (typeof mediaQuery.addEventListener === 'function') listen(mediaQuery, 'change', change                 );
  else { mediaQuery.addListener(change); cleanup.push(() => mediaQuery.removeListener(change)); }
  function setSurfaceVisible(surface        , visible         ) {
    if (disposed) return;
    if (!visibleSurfaces.has(surface)) throw new RangeError('Unknown companion surface');
    if (visibleSurfaces.get(surface) === Boolean(visible)) return;
    visibleSurfaces.set(surface, Boolean(visible));
    for (const record of mounts.values()) for (const mount of record) if (mount.surface === surface) {
      mount.last = null;
      if (visible) void hydrate(mount);
    }
    syncVisibility();
    for (const cat of cats) scheduler.refresh(cat);
  }
  function dispose() {
    if (disposed) return;
    disposed = true; controller.abort(); scheduler.dispose();
    for (const fn of cleanup) fn();
    for (const record of mounts.values()) for (const mount of record) {
      mount.serial++; mount.frame.remove(); mount.slot.classList.remove('pets-ready'); delete mount.slot.dataset.petStatus;
      for (const key of frameKeys) delete mount.slot.dataset[key];
    }
    for (const image of loaded) image.dispose();
    loaded.clear(); resources.clear();
  }
  return Object.freeze({
    setContext: scheduler.setContext, contextToken: scheduler.contextToken, beginRun: scheduler.beginRun,
    beginWait: scheduler.beginWait, endWait: scheduler.endWait, setRunPhase: scheduler.setRunPhase,
    completeRun: scheduler.completeRun, cancelRun: scheduler.cancelRun, setReview: scheduler.setReview,
    wave: scheduler.wave, look: scheduler.look, clearLook: scheduler.clearLook, setMotion: scheduler.setMotion,
    move: scheduler.move, stopMotion: scheduler.stopMotion, setBusy: scheduler.setBusy,
    setSceneVisible: (visible         ) => setSurfaceVisible('scene', visible), setSurfaceVisible,
    isReady: (cat           ) => mounts.get(cat)?.some(mount => mount.surface === 'scene' && mount.ready) === true,
    retry: (cat            ) => { for (const [name, record] of mounts) if (!cat || name === cat) for (const mount of record) if (mount.failed) void hydrate(mount); },
    snapshot: () => ({ ...scheduler.snapshot(), surfaces: Object.fromEntries(visibleSurfaces), mounts: Object.fromEntries([...mounts].map(([cat, record]) => [cat, record.map(mount => ({ surface: mount.surface, ready: mount.ready, failed: mount.failed }))])) }),
    dispose,
  });
}


//# sourceURL=../typed/startup-companions.mts