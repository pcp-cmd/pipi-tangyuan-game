import { freshEnvelope, parseEnvelope, INTEGRATED_SAVE_KEY } from '../integration/state.mjs';
import { createWorldStorage, WORLD_PREFIX } from './world-storage.mjs';

export const JOURNEY_INDEX_KEY = 'pipi-desktop-journeys/v1';
export const JOURNEY_PREFIX = 'pipi-desktop-journey/v1:';
export const JOURNEY_SELECTION_KEY = 'pipi-desktop-active-journey/v1';
export const JOURNEY_SLOTS = Object.freeze(['slot-1', 'slot-2', 'slot-3']);
const COURSE_KEY = WORLD_PREFIX + INTEGRATED_SAVE_KEY;
const META_KEY = 'journey-origin/v1';
const MAX_BYTES = 32 * 1024 * 1024;
const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const byteLength = value => new TextEncoder().encode(value).length;
const safeNamespace = value => typeof value === 'string' && /^pipi-desktop-journey\/v1:[a-zA-Z0-9-]{16,80}:$/.test(value);
const validTime = value => Number.isFinite(value) && value >= 0;
const permittedKey = key => typeof key === 'string' && key.length <= 500 &&
  (key.startsWith(WORLD_PREFIX) || key === META_KEY || key === 'physical-v1' || key.startsWith('physical-v1:'));
const failure = (reason, message) => ({ ok: false, reason, message });

export function namespaceStorage(nativeStorage, prefix) {
  const keys = () => Array.from({ length: nativeStorage.length }, (_, i) => nativeStorage.key(i))
    .filter(key => typeof key === 'string' && key.startsWith(prefix)).map(key => key.slice(prefix.length));
  return Object.freeze({
    get length() { return keys().length; }, key: index => keys()[index] ?? null, keys,
    getItem: key => nativeStorage.getItem(prefix + key),
    setItem: (key, value) => nativeStorage.setItem(prefix + key, value),
    removeItem: key => nativeStorage.removeItem(prefix + key)
  });
}

function parseIndex(raw) {
  const value = JSON.parse(raw);
  if (!exact(value, ['schema', 'revision', 'slots']) || value.schema !== 'pipi-journeys/v1' ||
      !Number.isSafeInteger(value.revision) || value.revision < 0 || !Array.isArray(value.slots) || value.slots.length > 3) throw Error('Invalid journey index.');
  const ids = new Set(), namespaces = new Set();
  for (const slot of value.slots) {
    if (!exact(slot, ['id', 'namespace', 'createdAt', 'origin']) || !JOURNEY_SLOTS.includes(slot.id) || ids.has(slot.id) ||
        !safeNamespace(slot.namespace) || namespaces.has(slot.namespace) || !validTime(slot.createdAt) ||
        !['new', 'legacy-copy', 'import'].includes(slot.origin)) throw Error('Invalid journey slot.');
    ids.add(slot.id); namespaces.add(slot.namespace);
  }
  return value;
}

function readEntries(storage) {
  const entries = storage.keys().sort().map(key => ({ key, value: storage.getItem(key) }));
  if (entries.length > 512 || entries.some(entry => !permittedKey(entry.key) || typeof entry.value !== 'string') ||
      byteLength(JSON.stringify(entries)) > MAX_BYTES) throw Error('Journey data exceeds the supported backup boundary.');
  return entries;
}

export function createJourneys({ storage, locks, selectionStorage, now = () => Date.now(),
  uuid = () => crypto.randomUUID(), digest = async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(v => v.toString(16).padStart(2, '0')).join('') }) {
  let index = null, current = null, status = 'idle', notice = '', busy = false;
  const scoped = slot => namespaceStorage(storage, slot.namespace);
  const scopedLocks = slot => locks?.request ? { request: (key, callback) => locks.request(slot.namespace + key, callback) } : null;
  const namespaces = () => [...new Set(Array.from({ length: storage.length }, (_, i) => storage.key(i))
    .filter(key => typeof key === 'string' && key.startsWith(JOURNEY_PREFIX))
    .map(key => key.slice(0, key.indexOf(':', JOURNEY_PREFIX.length) + 1)).filter(safeNamespace))];
  const view = () => Object.freeze({ status, notice, busy, current: current?.id ?? null,
    slots: index?.slots.map(slot => Object.freeze({ ...slot, active: current?.id === slot.id })) ?? [],
    unpublished: namespaces().filter(prefix => !index?.slots.some(slot => slot.namespace === prefix)) });
  function readIndex() {
    const raw = storage.getItem(JOURNEY_INDEX_KEY);
    return raw === null ? { raw, value: { schema: 'pipi-journeys/v1', revision: 0, slots: [] } } : { raw, value: parseIndex(raw) };
  }
  async function mutate(work) {
    if (busy) return failure('busy', '正在处理旅程，请稍候。');
    if (!locks?.request) return failure('locks-required', '此浏览器不能安全协调旅程保存，请使用本地启动的 Chrome 或 Edge。');
    busy = true;
    try { return await locks.request(JOURNEY_INDEX_KEY, work); }
    catch (error) { notice = '旅程未确认写入。原记录仍保留，请先导出备份。'; return failure('storage-error', notice); }
    finally { busy = false; }
  }
  function choose(slot) {
    // Selection belongs to this tab. Other tabs retain their own session and lock scope.
    selectionStorage.setItem(JOURNEY_SELECTION_KEY, slot.id);
    if (selectionStorage.getItem(JOURNEY_SELECTION_KEY) !== slot.id) throw Error('Selection readback failed.');
    current = slot;
  }
  async function createFrom(entries, origin, targetId = null, sourceCheck = () => true, initializing = false) {
    return mutate(async () => {
      const before = readIndex();
      if (initializing && before.value.slots.length) {
        index = before.value; status = 'ready';
        return { ok: true, slot: Object.freeze({ ...index.slots[0] }), reused: true };
      }
      if (initializing && namespaces().length) return failure('unpublished', '发现尚未完成接续的旅程副本。原件已保留，未再新建空档。');
      if (!sourceCheck()) return failure('conflict', '原旅程已发生变化，未用旧快照接续。');
      const id = targetId ?? JOURNEY_SLOTS.find(candidate => !before.value.slots.some(slot => slot.id === candidate));
      if (!id || !JOURNEY_SLOTS.includes(id) || before.value.slots.some(slot => slot.id === id)) return failure('capacity', '三个旅程位置已占用。已有旅程不会被覆盖。');
      const namespace = JOURNEY_PREFIX + uuid() + ':';
      if (!safeNamespace(namespace) || namespaces().includes(namespace)) return failure('identity-conflict', '新旅程标识发生冲突，已有记录未改变。');
      const slot = { id, namespace, createdAt: now(), origin };
      const target = scoped(slot);
      const payload = [...entries.filter(entry => entry.key !== META_KEY), { key: META_KEY, value: JSON.stringify({ schema: 'pipi-journey-origin/v1', createdAt: slot.createdAt, origin }) }];
      if (payload.some(entry => !permittedKey(entry.key) || typeof entry.value !== 'string')) return failure('invalid-import', '备份含有不属于旅程的键。');
      for (const entry of payload) {
        target.setItem(entry.key, entry.value);
        if (target.getItem(entry.key) !== entry.value) throw Error('Journey copy readback failed.');
      }
      const actual = readEntries(target);
      if (actual.length !== payload.length || payload.some(entry => target.getItem(entry.key) !== entry.value)) throw Error('Journey copy changed.');
      if (storage.getItem(JOURNEY_INDEX_KEY) !== before.raw || !sourceCheck()) throw Error('Journey source or index changed.');
      const next = { ...before.value, revision: before.value.revision + 1, slots: [...before.value.slots, slot] };
      const raw = JSON.stringify(next);
      storage.setItem(JOURNEY_INDEX_KEY, raw);
      if (storage.getItem(JOURNEY_INDEX_KEY) !== raw) throw Error('Journey index readback failed.');
      index = next; status = 'ready';
      return { ok: true, slot: Object.freeze({ ...slot }) };
    });
  }
  async function open() {
    try {
      const loaded = readIndex(); index = loaded.value;
      if (!index.slots.length) {
        const legacy = namespaceStorage(storage, '').keys().filter(key => key.startsWith(WORLD_PREFIX)).sort()
          .map(key => ({ key, value: storage.getItem(key) }));
        const legacySnapshot = JSON.stringify(legacy);
        const sourceCheck = () => JSON.stringify(namespaceStorage(storage, '').keys().filter(key => key.startsWith(WORLD_PREFIX)).sort()
          .map(key => ({ key, value: storage.getItem(key) }))) === legacySnapshot;
        const result = await createFrom(legacy.length ? legacy : [{ key: COURSE_KEY, value: JSON.stringify(freshEnvelope()) }], legacy.length ? 'legacy-copy' : 'new', null, sourceCheck, true);
        if (!result.ok) { status = result.reason; notice = result.message; return result; }
        notice = !result.reused && legacy.length ? '旧旅程已复制到旅程一，原始记录保留。' : '';
      }
      const wanted = selectionStorage.getItem(JOURNEY_SELECTION_KEY);
      const slot = index.slots.find(item => item.id === wanted) ?? index.slots[0];
      choose(slot); status = 'ready';
      return { ok: true, view: view() };
    } catch { status = 'invalid'; notice = '旅程索引或浏览器存储无法读取，原件未覆盖。'; return failure(status, notice); }
  }
  async function create(targetId) {
    return createFrom([{ key: COURSE_KEY, value: JSON.stringify(freshEnvelope()) }], 'new', targetId);
  }
  function select(id, { validatePhysical = () => {} } = {}) {
    if (busy) return failure('busy', '正在处理旅程，请稍候。');
    try {
      const latest = readIndex(); const slot = latest.value.slots.find(item => item.id === id);
      if (!slot) return failure('missing', '这个旅程尚未建立。');
      const target = scoped(slot);
      if (target.getItem(META_KEY) === null || target.getItem(COURSE_KEY) === null) return failure('incomplete', '旅程主记录或来源记录缺失，尚未切换。');
      parseEnvelope(target.getItem(COURSE_KEY));
      validatePhysical(target.getItem('physical-v1'));
      choose(slot); index = latest.value;
      return { ok: true };
    } catch { return failure('storage-error', '旅程未能读取，仍保留当前页面。'); }
  }
  function io() {
    if (!current) throw Error('No active journey.');
    const slot = current, native = scoped(slot), nativeLocks = scopedLocks(slot);
    return { storage: native, locks: nativeLocks, learning: createWorldStorage(native, nativeLocks),
      nativeKey: key => slot.namespace + key, namespace: slot.namespace };
  }
  async function exportCurrent({ saved, recovery = null, validatePhysical = () => {} } = {}) {
    if (!current) return failure('missing', '尚未打开旅程。');
    const slot = current;
    try {
      const source = scoped(slot), entries = readEntries(source), before = JSON.stringify(entries);
      if (saved === true) {
        const course = entries.find(entry => entry.key === COURSE_KEY)?.value;
        if (!course) throw Error('Missing learning authority.');
        parseEnvelope(course);
        validatePhysical(entries.find(entry => entry.key === 'physical-v1')?.value ?? null);
      }
      const checked = [];
      for (const entry of entries) checked.push({ ...entry, sha256: await digest(entry.value) });
      if (JSON.stringify(readEntries(source)) !== before) return failure('conflict', '备份期间记录发生变化，请等保存完成后再导出。');
      const bundle = { format: 'pipi-journey/v1', kind: saved === true ? 'saved' : 'recovery', createdAt: now(),
        profile: { slotId: slot.id, createdAt: slot.createdAt }, entries: checked, recovery: saved === true ? null : recovery };
      return { ok: true, text: JSON.stringify(bundle, null, 2), filename: `pipi-${slot.id}-${saved === true ? 'journey' : 'recovery'}.json`, recovery: saved !== true };
    } catch { return failure('invalid', '无法形成完整备份。当前原文保留，请使用原件和代码导出。'); }
  }
  async function importToEmpty(text, { targetId, validatePhysical = () => {} } = {}) {
    try {
      if (typeof text !== 'string' || byteLength(text) > MAX_BYTES) return failure('invalid-import', '备份为空或超过大小上限。');
      const bundle = JSON.parse(text);
      let entries;
      if (bundle?.schema === 'pipi-game-learning/v1') {
        parseEnvelope(text); entries = [{ key: COURSE_KEY, value: text }];
      } else {
        if (!exact(bundle, ['format', 'kind', 'createdAt', 'profile', 'entries', 'recovery']) ||
            bundle.format !== 'pipi-journey/v1' || bundle.kind !== 'saved' || bundle.recovery !== null || !validTime(bundle.createdAt) ||
            !exact(bundle.profile, ['slotId', 'createdAt']) || !JOURNEY_SLOTS.includes(bundle.profile.slotId) || !validTime(bundle.profile.createdAt) ||
            !Array.isArray(bundle.entries) || !bundle.entries.length || bundle.entries.length > 512) return failure('invalid-import', '这不是可恢复的完整已保存旅程。恢复证据包不会授予进度。');
        const keys = new Set(); entries = [];
        for (const entry of bundle.entries) {
          if (!exact(entry, ['key', 'value', 'sha256']) || !permittedKey(entry.key) || keys.has(entry.key) || typeof entry.value !== 'string' ||
              typeof entry.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(entry.sha256) || await digest(entry.value) !== entry.sha256) return failure('invalid-import', '备份摘要或字段不一致，未写入旅程。');
          keys.add(entry.key); entries.push({ key: entry.key, value: entry.value });
        }
        const course = entries.find(entry => entry.key === COURSE_KEY)?.value;
        if (!course) return failure('invalid-import', '备份缺少学习主记录。');
        parseEnvelope(course);
        validatePhysical(entries.find(entry => entry.key === 'physical-v1')?.value ?? null);
      }
      return await createFrom(entries, 'import', targetId);
    } catch { return failure('invalid-import', '备份未通过校验，当前旅程和原文件均未改变。'); }
  }
  function exportUnpublished() {
    const drafts = view().unpublished.map(prefix => ({ namespace: prefix, entries: readEntries(namespaceStorage(storage, prefix)) }));
    return JSON.stringify({ format: 'pipi-unpublished-journeys/recovery-v1', drafts }, null, 2);
  }
  return Object.freeze({ open, create, select, io, view, exportCurrent, importToEmpty, exportUnpublished });
}
