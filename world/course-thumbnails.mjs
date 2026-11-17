import { COURSE_THUMBNAILS } from './small-art.mjs';
import { loadVerifiedImage } from './generated/asset-loader.mjs';

const failure = code => Object.assign(new Error(code), { code });
function waitFor(work, signal, timeoutMs) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); };
    const finish = (callback, value) => { if (settled) return; settled = true; cleanup(); callback(value); };
    const abort = () => finish(reject, failure('asset-aborted'));
    const timer = setTimeout(() => finish(reject, failure('asset-timeout')), timeoutMs);
    signal.addEventListener('abort', abort, { once: true });
    Promise.resolve(work).then(value => finish(resolve, value), error => finish(reject, error));
    if (signal.aborted) abort();
  });
}

export function createCourseThumbnails({ document: doc = document, concurrency = 3, timeoutMs = 20000,
  loadImage = (asset, signal) => loadVerifiedImage(asset, { baseUrl: import.meta.url, signal, timeoutMs }),
  observerFactory = callback => typeof doc.defaultView?.IntersectionObserver === 'function'
    ? new doc.defaultView.IntersectionObserver(callback, { rootMargin: '120px' }) : null,
} = {}) {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) throw new RangeError('Thumbnail concurrency must be 1–8.');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 60000) throw new RangeError('Thumbnail timeout must be 1–60000 ms.');
  const entries = new Map(), queue = [], resources = new Map();
  let active = 0, disposed = false;
  const observer = observerFactory(changes => {
    for (const change of changes) {
      const entry = entries.get(change.target);
      if (!entry) continue;
      entry.visible = change.isIntersecting;
      if (entry.visible) enqueue(entry);
    }
    pump();
  });
  function state(entry, value, text = '') {
    entry.state = value; entry.root.dataset.imageState = value;
    entry.message.textContent = text; entry.message.hidden = value === 'ready';
    entry.retry.hidden = value !== 'failed'; entry.image.hidden = value !== 'ready';
    entry.root.setAttribute('aria-busy', String(value === 'loading'));
  }
  function dropResource(entry) {
    const cached = entry.resource;
    entry.resource = null;
    if (!cached) return;
    cached.users.delete(entry);
    if (cached.users.size) return;
    cached.closed = true; cached.controller.abort();
    if (resources.get(entry.id) === cached) resources.delete(entry.id);
    if (cached.loaded) { cached.loaded.dispose(); cached.loaded = null; }
  }
  function resource(entry) {
    const id = entry.id;
    let cached = resources.get(id);
    if (!cached) {
      cached = { controller: new AbortController(), users: new Set(), loaded: null, closed: false, promise: null };
      const request = cached;
      request.promise = Promise.resolve().then(() => {
        if (request.closed) throw failure('asset-aborted');
        return loadImage(COURSE_THUMBNAILS[id], request.controller.signal);
      }).then(image => {
        if (request.closed) { image.dispose(); throw failure('asset-aborted'); }
        request.loaded = image;
        return image;
      }).catch(error => {
        if (resources.get(id) === request) resources.delete(id);
        throw error;
      });
      resources.set(id, request);
    }
    cached.users.add(entry); entry.resource = cached;
    return cached.promise;
  }
  function enqueue(entry) {
    if (disposed || entry.released || !entry.visible || entry.state !== 'idle' || queue.includes(entry)) return;
    queue.push(entry);
  }
  function pump() {
    if (disposed) return;
    while (active < concurrency && queue.length) {
      const entry = queue.shift();
      if (entry.released || !entry.visible || entry.state !== 'idle') continue;
      active++; state(entry, 'loading', '图画载入中');
      waitFor(resource(entry), entry.controller.signal, timeoutMs).then(async loaded => {
        if (disposed || entry.released) return;
        entry.image.src = loaded.objectUrl;
        await waitFor(entry.image.decode(), entry.controller.signal, timeoutMs);
        if (disposed || entry.released) return;
        const asset = COURSE_THUMBNAILS[entry.id];
        if (entry.image.naturalWidth !== asset.naturalWidth || entry.image.naturalHeight !== asset.naturalHeight) throw failure('asset-dimensions');
        state(entry, 'ready');
      }).catch(error => {
        if (!disposed && !entry.released) {
          entry.image.removeAttribute('src');
          dropResource(entry);
          entry.root.dataset.imageFailure = error.code ?? 'asset-decode'; state(entry, 'failed', '图画暂未载入');
        }
      }).finally(() => { active--; pump(); });
    }
  }
  function create(id, { className = 'course-context-art', alt = '', eager = false } = {}) {
    if (disposed) throw new Error('Thumbnail manager is disposed.');
    if (!COURSE_THUMBNAILS[id]) throw new RangeError(`Unknown course thumbnail: ${id}`);
    const root = doc.createElement('figure'); root.className = `course-thumb ${className}`; root.dataset.thumbnailLesson = id;
    const image = doc.createElement('img'); image.className = 'course-thumb-image'; image.alt = alt; image.decoding = 'async'; image.draggable = false;
    image.width = COURSE_THUMBNAILS[id].naturalWidth; image.height = COURSE_THUMBNAILS[id].naturalHeight;
    const message = doc.createElement('span'); message.className = 'course-thumb-status'; message.setAttribute('role', 'status');
    const retry = doc.createElement('button'); retry.type = 'button'; retry.className = 'text-button course-thumb-retry'; retry.textContent = '重试'; retry.setAttribute('aria-label', `重新载入图画：${alt || id}`);
    const entry = { id, root, image, message, retry, visible: eager, state: 'idle', resource: null, controller: new AbortController(), released: false };
    entry.onRetry = () => {
      if (disposed || entry.released || entry.state !== 'failed') return;
      state(entry, 'idle'); delete root.dataset.imageFailure; entry.visible = true; enqueue(entry); pump();
    };
    retry.addEventListener('click', entry.onRetry);
    root.append(image, message, retry); entries.set(root, entry); state(entry, 'idle', '图画待载入');
    observer?.observe(root);
    if (eager) { enqueue(entry); pump(); }
    return root;
  }
  function release(root) {
    const entry = entries.get(root);
    if (!entry) return false;
    entry.released = true; entries.delete(root); observer?.unobserve(root);
    const index = queue.indexOf(entry); if (index !== -1) queue.splice(index, 1);
    entry.controller.abort(); entry.retry.removeEventListener('click', entry.onRetry);
    entry.image.removeAttribute('src'); dropResource(entry);
    return true;
  }
  function refresh() {
    if (observer || disposed) return;
    for (const entry of entries.values()) {
      const rect = entry.root.getBoundingClientRect?.();
      entry.visible = !!rect && rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.top < (doc.defaultView?.innerHeight ?? 0);
      if (entry.visible) enqueue(entry);
    }
    pump();
  }
  if (!observer) { doc.addEventListener?.('scroll', refresh, true); doc.defaultView?.addEventListener('resize', refresh); }
  return Object.freeze({ create, refresh, release,
    snapshot: () => ({ active, queued: queue.length, requested: resources.size, states: [...entries.values()].map(entry => ({ id: entry.id, state: entry.state })) }),
    dispose() {
      if (disposed) return; disposed = true;
      for (const root of entries.keys()) release(root);
      observer?.disconnect(); queue.length = 0;
      doc.removeEventListener?.('scroll', refresh, true); doc.defaultView?.removeEventListener('resize', refresh);
    },
  });
}
