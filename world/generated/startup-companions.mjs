import { createPetScheduler } from '../pets-scheduler.mjs';
import { petFrameSource } from '../pets-frame-adapter.mjs';
import { PETS_ASSET_IDENTITIES } from '../pets-asset-identities.mjs';
import { CORE_ATLASES } from '../small-art.mjs';
import { loadVerifiedImage } from './asset-loader.mjs';
                                                                     
import { scheduleStartupTask } from './startup.mjs';

                                            
                            
                                                                                                                                                   
export const COMPANION_LOAD_POLICY                                = Object.freeze({ attempts: 2, coreTimeoutMs: 20000, mountTimeoutMs: 4000, retryDelayMs: 250, startupWaitMs: 3000 });
                                                                        
                                                                                                                                                              
                                                                                                                                                                      
                                                                
const failureOf = (error         , phase = 'request')              => {
  const value = error                               ;
  return { code: value?.code ?? 'asset-unavailable', phase: value?.phase ?? phase,
    ...(value?.httpStatus === undefined ? {} : { httpStatus: value.httpStatus }) };
};
const loadError = (code        , phase        ) => Object.assign(new Error(code), { code, phase });

function boundedLoad   (task                                     , options   
                                                                                               
 )             {
  return new Promise((resolve, reject) => {
    const controller = new AbortController(); let settled = false;
    const cleanup = () => { clearTimeout(timer); options.signal.removeEventListener('abort', abort); };
    const fail = (code        ) => {
      if (settled) return;
      settled = true; cleanup(); reject(loadError(code, options.phase())); controller.abort();
    };
    const abort = () => fail('asset-aborted');
    const timer = setTimeout(() => fail('asset-timeout'), options.timeoutMs);
    options.signal.addEventListener('abort', abort, { once: true });
    if (options.signal.aborted) { abort(); return; }
    let work            ;
    try { work = task(controller.signal); } catch (error) { settled = true; cleanup(); reject(error); return; }
    void Promise.resolve(work).then(value => {
      if (settled) { options.releaseLate(value); return; }
      settled = true; cleanup(); resolve(value);
    }, error => { if (!settled) { settled = true; cleanup(); reject(error); } });
  });
}
function retryPause(ms        , signal             )                {
  if (signal.aborted) return Promise.reject(loadError('asset-aborted', 'request'));
  if (!ms) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(loadError('asset-aborted', 'request')); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}
const cats                       = ['pipi', 'tangyuan'];
export const COMPANION_SHEETS                                      = Object.freeze({
  pipi: new URL('../' + PETS_ASSET_IDENTITIES.pipi.runtime, import.meta.url).href,
  tangyuan: new URL('../' + PETS_ASSET_IDENTITIES.tangyuan.runtime, import.meta.url).href,
});
export const COMPANION_IDLE                                      = Object.freeze({
  pipi: new URL('../assets/pets/pipi-idle-v2.png', import.meta.url).href,
  tangyuan: new URL('../assets/pets/tangyuan-idle-v2.png', import.meta.url).href,
});
const frameKeys = ['petState', 'petFrame', 'petRow', 'petColumn', 'petSourceRow', 'petSourceColumn', 'petMirrored', 'petTier', 'petRequestedState'];
                                            
                                                                                                                                                           
                                                            
const makeScheduler = createPetScheduler                                                                                                                                        ;
              
                                                                                                  
                                                                                                                                                                   
  
                
                                                                                                                          
                                                                                                         
                                                 
                                                                                                 
                                                                                                  
                                                                                             
                                                  
  

export function createCompanionSprites({ actors, portraits, surfaces = {}, surfaceVisibility = {}, document: doc = document, window: win = window,
  mediaQuery = win.matchMedia('(prefers-reduced-motion: reduce)'), schedulerOptions = {}, sceneVisible = true, originalLeft = false,
  loadCore = (cat, signal, options) => loadVerifiedImage(CORE_ATLASES[cat], { ...options, baseUrl: new URL('../', import.meta.url).href, signal }),
  loadAtlas = (cat, signal, options) => loadVerifiedImage({ src: COMPANION_SHEETS[cat], naturalWidth: 1536, naturalHeight: 2288, sha256: PETS_ASSET_IDENTITIES[cat].runtimeSha256 }, { ...options, signal }),
  loadPolicy = {}, onStatus = () => {},
  scheduleLoad = task => scheduleStartupTask(task, win),
}         ) {
  const policy = { ...COMPANION_LOAD_POLICY, ...loadPolicy };
  if (!Number.isInteger(policy.attempts) || policy.attempts < 1 || policy.attempts > 3 ||
    ![policy.coreTimeoutMs, policy.mountTimeoutMs].every(value => Number.isFinite(value) && value > 0 && value <= 60000) ||
    !Number.isFinite(policy.startupWaitMs) || policy.startupWaitMs <= 0 || policy.startupWaitMs > 10000 ||
    !Number.isFinite(policy.retryDelayMs) || policy.retryDelayMs < 0 || policy.retryDelayMs > 5000) throw new RangeError('Invalid companion load policy');
  const resourceStates = new Map                                                                                            ();
  const diagnostics              = [];
  const record = (event           ) => { diagnostics.push(event); if (diagnostics.length > 80) diagnostics.shift(); };
  const mounts = new Map                    (cats.map(cat => [cat, []]));
  const resources = new Map                              ();
  const startupWaits = new Map                                     ();
  const startupExpired = new Set        ();
  const failedExtras = new Set           ();
  const loaded = new Set             ();
  const controller = new AbortController();
  const cleanup                    = [];
  const visibleSurfaces = new Map                 ([['scene', sceneVisible], ['portraits', false], ...Object.keys(surfaces).map(name => [name, false]                     ), ...Object.entries(surfaceVisibility)]);
  let disposed = false, pageActive = true;
  const scheduler = makeScheduler({ ...schedulerOptions, visible: false, reducedMotion: mediaQuery.matches,
    render(cat           , frame       ) {
      const source = petFrameSource(cat, frame, { originalLeft });
      for (const mount of mounts.get(cat) ?? []) {
        if (!mount.ready || !visibleSurfaces.get(mount.surface)) continue;
        const needsExtra = source.row >= 2 && mount.tier === 'core';
        if (needsExtra && !failedExtras.has(cat)) void hydrate(mount, 'full');
        const displayed = needsExtra ? { row: 0, column: 0, mirrored: false } : source;
        const state = needsExtra ? 'idle' : frame.state;
        const key = `${state}:${displayed.row}:${displayed.column}:${displayed.mirrored}`;
        mount.slot.dataset.petRequestedState = frame.state;
        if (mount.last === key) continue;
        mount.frame.style.setProperty('--pet-x', `${-displayed.column * 100}%`);
        mount.frame.style.setProperty('--pet-y', `${-displayed.row * 100}%`);
        mount.frame.style.transform = displayed.mirrored ? 'scaleX(-1)' : 'none';
        mount.frame.style.transformOrigin = 'center';
        Object.assign(mount.slot.dataset, { petState: state, petFrame: String(displayed.column), petRow: String(needsExtra ? 0 : frame.row), petColumn: String(displayed.column), petSourceRow: String(displayed.row), petSourceColumn: String(displayed.column), petMirrored: String(displayed.mirrored) });
        mount.last = key;
      }
    },
  });
  function listen(target             , event        , callback               ) {
    target.addEventListener(event, callback); cleanup.push(() => target.removeEventListener(event, callback));
  }
  function syncVisibility() {
    if (disposed) return;
    scheduler.setVisible(pageActive && !doc.hidden && [...visibleSurfaces.values()].some(Boolean));
    for (const cat of cats) scheduler.setCatVisible(cat, (mounts.get(cat) ?? []).some(mount => mount.ready && visibleSurfaces.get(mount.surface)));
  }
  function refresh(cat           ) {
    scheduler.setEnabled(cat, (mounts.get(cat) ?? []).some(mount => mount.ready));
    syncVisibility(); scheduler.refresh(cat);
  }
  function fallback(mount       , failure              = { code: 'asset-decode', phase: 'mount' }) {
    mount.failure = failure;
    mount.failed = true; mount.ready = false; mount.frame.hidden = true;
    mount.slot.classList.remove('pets-ready'); mount.slot.dataset.petStatus = 'fallback';
    for (const key of frameKeys) delete mount.slot.dataset[key];
  }
  function readiness(surface = 'scene')                     {
    const targets = [...mounts.values()].flat().filter(mount => mount.surface === surface);
    const unavailable = targets.filter(mount => !mount.ready).map(mount => mount.cat);
    const loading = targets.filter(mount => mount.pending !== null || !mount.ready && !mount.failed).map(mount => mount.cat);
    return { status: disposed ? 'disposed' : loading.length ? 'loading' : unavailable.length ? 'degraded' : 'ready', unavailable, loading };
  }
  function publish() {
    if (disposed) return;
    try { onStatus(playableReadiness()); } catch { /* A presentation observer cannot block resource settlement. */ }
  }
  function resource(cat           , tier      )                       {
    const key = `${cat}:${tier}`, cached = resources.get(key);
    if (cached) return cached;
    const status                                                                                     = { state: 'loading', attempts: 0 };
    resourceStates.set(key, status);
    const request = (async () => {
      const limit = tier === 'core' ? policy.attempts : 1;
      for (let attempt = 1; attempt <= limit; attempt++) {
        status.attempts = attempt;
        const started = performance.now(); let phase = 'request';
        record({ cat, tier, attempt, outcome: 'started', elapsedMs: 0, code: '', phase });
        try {
          const image = await boundedLoad(signal => (tier === 'core' ? loadCore : loadAtlas)(cat, signal, {
            timeoutMs: policy.coreTimeoutMs, onEvent: event => { phase = event.phase; },
          }), { signal: controller.signal, timeoutMs: policy.coreTimeoutMs, phase: () => phase, releaseLate: image => image.dispose() });
          if (disposed) { image.dispose(); throw loadError('asset-aborted', phase); }
          status.state = 'ready'; delete status.failure; loaded.add(image);
          record({ cat, tier, attempt, outcome: 'passed', elapsedMs: performance.now() - started, code: '', phase: 'ready' });
          return image;
        } catch (error) {
          status.failure = failureOf(error, phase);
          record({ cat, tier, attempt, outcome: 'failed', elapsedMs: performance.now() - started, ...status.failure });
          if (disposed || controller.signal.aborted || attempt === limit) { status.state = 'failed'; throw error; }
          await retryPause(policy.retryDelayMs, controller.signal);
        }
      }
      throw loadError('asset-unavailable', 'request');
    })();
    resources.set(key, request); return request;
  }
  function mountImage(url        , tier      , previous                              , signal             )                            {
    return new Promise((resolve, reject) => {
      const image = previous ?? doc.createElement('img');
      image.className = 'pets-sheet'; image.alt = ''; image.draggable = false; image.decoding = 'async';
      const remove = () => { image.removeEventListener('load', accept); image.removeEventListener('error', fail); signal.removeEventListener('abort', abort); };
      const fail = () => { remove(); reject(loadError('asset-decode', 'mount')); };
      const abort = () => { remove(); image.src = ''; reject(loadError('asset-aborted', 'mount')); };
      const accept = () => {
        if (image.naturalWidth !== 1536 || image.naturalHeight !== (tier === 'core' ? 416 : 2288)) {
          remove(); reject(loadError('asset-dimensions', 'mount')); return;
        }
        remove(); resolve(image);
      };
      image.addEventListener('load', accept); image.addEventListener('error', fail);
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) { abort(); return; }
      image.src = url;
      if (image.complete && image.naturalWidth) accept();
    });
  }
  function hydrate(mount       , tier       = 'core', requested = false)                {
    if (mount.pending) return mount.pending;
    if (disposed || (!requested && !visibleSurfaces.get(mount.surface)) || mount.failed || (mount.ready && (mount.tier === 'full' || tier === 'core'))) return Promise.resolve();
    const serial = ++mount.serial;
    if (!mount.ready) { mount.slot.dataset.petStatus = 'loading'; delete mount.failure; }
    mount.pending = (async () => {
      try {
        const loadedImage = await resource(mount.cat, tier);
        if (disposed || serial !== mount.serial) return;
        let image                              ;
        for (let attempt = 1; attempt <= policy.attempts; attempt++) {
          const started = performance.now();
          record({ cat: mount.cat, tier, surface: mount.surface, attempt, phase: 'mount', outcome: 'started', elapsedMs: 0, code: '' });
          try {
            image = await boundedLoad(signal => mountImage(loadedImage.objectUrl, tier, mount.ready ? undefined : mount.image, signal), {
              signal: controller.signal, timeoutMs: policy.mountTimeoutMs, phase: () => 'mount', releaseLate: image => { image.src = ''; },
            });
            record({ cat: mount.cat, tier, surface: mount.surface, attempt, phase: 'mount', outcome: 'passed', elapsedMs: performance.now() - started, code: '' });
            break;
          } catch (error) {
            record({ cat: mount.cat, tier, surface: mount.surface, attempt, outcome: 'failed', elapsedMs: performance.now() - started, ...failureOf(error, 'mount') });
            if (disposed || attempt === policy.attempts) throw error;
            await retryPause(policy.retryDelayMs, controller.signal);
          }
        }
        if (disposed || serial !== mount.serial || !image) return;
        mount.removeError?.();
        mount.image = image; mount.frame.replaceChildren(image);
        mount.frame.style.setProperty('--pet-sheet-rows', String(tier === 'core' ? 2 : 11));
        mount.tier = tier; mount.ready = true; mount.failed = false; mount.last = null; delete mount.failure;
        mount.frame.hidden = false; mount.slot.classList.add('pets-ready');
        mount.slot.dataset.petStatus = 'ready'; mount.slot.dataset.petTier = tier;
        const mounted = image;
        const failed = () => {
          if (disposed || mount.image !== mounted) return;
          fallback(mount); refresh(mount.cat); publish();
        };
        image.addEventListener('error', failed);
        mount.removeError = () => mounted.removeEventListener('error', failed);
      } catch (error) {
        if (disposed || serial !== mount.serial) return;
        if (tier === 'full' && mount.ready) { failedExtras.add(mount.cat); mount.slot.dataset.petStatus = 'extra-failed'; }
        else fallback(mount, failureOf(error));
      } finally {
        mount.pending = null;
        if (!disposed && serial === mount.serial) { refresh(mount.cat); publish(); }
      }
    })();
    publish(); return mount.pending;
  }
  function mountFrame(cat           , surface        , slot             ) {
    if (!slot) throw new TypeError('A companion art slot is required');
    const frame = doc.createElement('span'); frame.className = 'pets-frame'; frame.setAttribute('aria-hidden', 'true'); frame.hidden = true;
    const image = doc.createElement('img'); image.className = 'pets-sheet'; image.alt = ''; image.draggable = false;
    frame.append(image); slot.append(frame);
    mounts.get(cat)?.push({ cat, surface, slot, frame, image, ready: false, failed: false, tier: 'core', pending: null, last: null, serial: 0 });
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
  cleanup.push(scheduleLoad(hydrateVisible)); syncVisibility();
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
    for (const record of mounts.values()) for (const mount of record) if (mount.surface === surface) { mount.last = null; if (visible) void hydrate(mount); }
    syncVisibility(); for (const cat of cats) scheduler.refresh(cat);
  }
  async function whenReady(surface = 'scene') {
    const targets = [...mounts.values()].flat().filter(mount => mount.surface === surface);
    await Promise.all(targets.map(mount => hydrate(mount, 'core', true)));
    if (!targets.length) throw new RangeError('Unknown companion surface');
    return readiness(surface);
  }
  function playableReadiness(surface = 'scene')                     {
    const current = readiness(surface);
    if (current.status === 'disposed') return current;
    if (!current.unavailable.length) return { ...current, status: 'ready', loading: [] };
    return current.status === 'loading' && startupExpired.has(surface)
      ? { ...current, status: 'degraded', reason: 'startup-budget' } : current;
  }
  function whenPlayable(surface = 'scene')                              {
    if (!visibleSurfaces.has(surface)) return Promise.reject(new RangeError('Unknown companion surface'));
    const current = playableReadiness(surface);
    if (current.status !== 'loading') return Promise.resolve(current);
    const existing = startupWaits.get(surface);
    if (existing) return existing;
    const wait = new Promise                    ((resolve, reject) => {
      let settled = false;
      const cleanupWait = () => {
        clearTimeout(timer); controller.signal.removeEventListener('abort', abort); startupWaits.delete(surface);
      };
      const finish = (value                    ) => {
        if (settled) return;
        settled = true; cleanupWait(); resolve(value);
      };
      const abort = () => finish(playableReadiness(surface));
      const timer = setTimeout(() => {
        startupExpired.add(surface); finish(playableReadiness(surface)); publish();
      }, policy.startupWaitMs);
      controller.signal.addEventListener('abort', abort, { once: true });
      void Promise.resolve().then(() => whenReady(surface)).then(finish, error => {
        if (settled) return;
        settled = true; cleanupWait(); reject(error);
      });
    });
    startupWaits.set(surface, wait);
    return wait;
  }
  function dispose() {
    if (disposed) return;
    disposed = true; controller.abort(); scheduler.dispose();
    for (const fn of cleanup) fn();
    for (const record of mounts.values()) for (const mount of record) {
      mount.serial++; mount.removeError?.(); mount.frame.remove(); mount.slot.classList.remove('pets-ready'); delete mount.slot.dataset.petStatus;
      for (const key of frameKeys) delete mount.slot.dataset[key];
    }
    for (const image of loaded) image.dispose(); loaded.clear(); resources.clear();
  }
  return Object.freeze({
    setContext: scheduler.setContext, contextToken: scheduler.contextToken, beginRun: scheduler.beginRun,
    beginWait: scheduler.beginWait, endWait: scheduler.endWait, setRunPhase: scheduler.setRunPhase,
    completeRun: scheduler.completeRun, cancelRun: scheduler.cancelRun, setReview: scheduler.setReview,
    wave: scheduler.wave, look: scheduler.look, clearLook: scheduler.clearLook, setMotion: scheduler.setMotion,
    move: scheduler.move, stopMotion: scheduler.stopMotion, setBusy: scheduler.setBusy,
    setSceneVisible: (visible         ) => setSurfaceVisible('scene', visible), setSurfaceVisible, whenReady, whenPlayable,
    isReady: (cat           ) => mounts.get(cat)?.some(mount => mount.surface === 'scene' && mount.ready) === true,
    retry: async (cat            ) => {
      if (disposed) return readiness();
      if (cat !== undefined && !cats.includes(cat)) throw new RangeError('Unknown companion');
      const pending                  = [];
      for (const [name, record] of mounts) if (!cat || name === cat) {
        for (const tier of ['core', 'full']         ) {
          const key = `${name}:${tier}`;
          if (resourceStates.get(key)?.state === 'failed') { resources.delete(key); resourceStates.delete(key); }
        }
        failedExtras.delete(name);
        for (const mount of record) {
          if (mount.failed) { mount.failed = false; pending.push(hydrate(mount, 'core', true)); }
          else { mount.last = null; scheduler.refresh(name); }
        }
      }
      await Promise.all(pending); publish(); return readiness();
    },
    snapshot: () => ({ ...scheduler.snapshot(), loading: playableReadiness(), diagnostics: diagnostics.map(event => ({ ...event })), resources: Object.fromEntries([...resourceStates].map(([key, value]) => [key, { ...value, ...(value.failure ? { failure: { ...value.failure } } : {}) }])), surfaces: Object.fromEntries(visibleSurfaces), mounts: Object.fromEntries([...mounts].map(([cat, record]) => [cat, record.map(mount => ({ surface: mount.surface, ready: mount.ready, failed: mount.failed, ...(mount.failure ? { failure: { ...mount.failure } } : {}) }))])) }),
    dispose,
  });
}


//# sourceURL=../typed/startup-companions.mts