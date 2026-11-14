export function createSaveStore({ key, parse, storage, locks, onChange = () => {},
  tabID = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, now = Date.now }) {
  const recoveryPrefix = `${key}:pending:`;
  const recoveryKey = `${recoveryPrefix}${tabID}`;
  let baseline = null;
  let staged = null;
  let dirty = false;
  let mode = 'ready';
  let status = 'idle';
  let pending = null;

  function report(next) {
    status = next;
    const result = { status, dirty };
    onChange(result);
    return result;
  }

  function removeOwnRecovery() {
    try { storage?.removeItem(recoveryKey); } catch {}
  }

  function readLatest({ discardPending = false } = {}) {
    try {
      if (!storage) throw new Error('Storage unavailable');
      const raw = storage.getItem(key);
      let state;
      try { state = raw === null ? null : parse(raw); }
      catch {
        baseline = raw;
        mode = 'invalid';
        return { state: null, raw, ...report('invalid') };
      }
      baseline = raw;
      mode = 'ready';
      staged = null;
      dirty = false;
      if (discardPending) removeOwnRecovery();
      return { state, raw, ...report(raw === null ? 'idle' : 'saved') };
    } catch {
      mode = 'unavailable';
      return { state: null, raw: null, ...report('error') };
    }
  }

  function writeRecovery(raw) {
    try {
      if (!storage) return false;
      storage.setItem(recoveryKey, JSON.stringify({ version: 1, updatedAt: now(), save: raw }));
      return true;
    } catch { return false; }
  }

  function save(state, { replaceInvalid = false } = {}) {
    let raw;
    try {
      raw = JSON.stringify(state);
      parse(raw);
    } catch { return Promise.resolve(report('invalid-state')); }
    staged = raw;
    dirty = raw !== baseline;
    if (!dirty && mode === 'ready') {
      removeOwnRecovery();
      return Promise.resolve(report('saved'));
    }
    const backedUp = writeRecovery(raw);
    if (mode === 'conflict') return Promise.resolve(report('conflict'));
    if (mode === 'invalid' && !replaceInvalid) return Promise.resolve(report('invalid'));
    if (mode === 'unavailable') return Promise.resolve(report('error'));
    if (replaceInvalid) mode = 'ready';
    if (!locks?.request) return Promise.resolve(report(backedUp ? 'backup-only' : 'error'));
    if (pending) return pending;
    report('pending');
    pending = Promise.resolve().then(() => locks.request(key, () => {
      if (!dirty || staged === null) return { status, dirty };
      if (mode !== 'ready') return report(mode === 'conflict' ? 'conflict' : 'error');
      try {
        if (storage.getItem(key) !== baseline) {
          mode = 'conflict';
          return report('conflict');
        }
        parse(staged);
        storage.setItem(key, staged);
        baseline = staged;
        dirty = false;
        removeOwnRecovery();
        return report('saved');
      } catch { return report('error'); }
    })).catch(() => report('error')).finally(() => { pending = null; });
    return pending;
  }

  function observe() {
    try {
      if (!storage || storage.getItem(key) === baseline) return { status, dirty };
      mode = 'conflict';
      return report('conflict');
    } catch { return report('error'); }
  }

  function recoveries() {
    const found = [];
    try {
      if (!storage) return found;
      const current = storage.getItem(key);
      for (let i = 0; i < storage.length; i++) {
        const candidateKey = storage.key(i);
        if (!candidateKey?.startsWith(recoveryPrefix)) continue;
        try {
          const record = JSON.parse(storage.getItem(candidateKey));
          if (record?.version !== 1 || typeof record.save !== 'string' || record.save === current) continue;
          const state = parse(record.save);
          found.push({ key: candidateKey, raw: record.save, state, updatedAt: Number.isFinite(record.updatedAt) ? record.updatedAt : 0 });
        } catch {}
      }
    } catch {}
    return found.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  return Object.freeze({ readLatest, save, observe, recoveries,
    snapshot: () => ({ status, dirty, raw: baseline }) });
}
