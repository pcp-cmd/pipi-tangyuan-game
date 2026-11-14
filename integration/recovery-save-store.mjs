const INBOX_SCHEMA = 'pipi-recovery-inbox/v1';
const HARD_ENTRIES = 8;
const HARD_BYTES = 8 * 1024 * 1024;
const bytes = value => new TextEncoder().encode(value).length;
const exact = (value, fields) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).length === fields.length && fields.every(field => Object.hasOwn(value, field));
const sha = async raw => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw ?? '')))]
  .map(value => value.toString(16).padStart(2, '0')).join('');

// Only this bounded inbox uses the new retention protocol. Legacy per-writer
// pending keys remain read-only because their writers do not share this lock.
export function createSaveStore({ key, parse, storage, locks, onChange = () => {},
  tabID = crypto.randomUUID(), ownerID = `${tabID}:${crypto.randomUUID()}`, now = Date.now,
  maxEntries = HARD_ENTRIES, maxBytes = HARD_BYTES, additionalRecoveryPrefixes = [] }) {
  if (typeof key !== 'string' || !key.length || typeof parse !== 'function' ||
    typeof tabID !== 'string' || !tabID.length || tabID.length > 100 ||
    typeof ownerID !== 'string' || !ownerID.length || ownerID.length > 160 ||
    !Number.isInteger(maxEntries) || maxEntries < 1 || maxEntries > HARD_ENTRIES ||
    !Number.isInteger(maxBytes) || maxBytes < 256 || maxBytes > HARD_BYTES ||
    !Array.isArray(additionalRecoveryPrefixes) || additionalRecoveryPrefixes.length > 8 ||
    additionalRecoveryPrefixes.some(prefix => typeof prefix !== 'string' || !prefix.length)) throw new TypeError('Invalid recovery configuration');
  const inboxKey = `${key}:recovery-v2`, legacyPrefix = `${key}:pending:`;
  let baseline = null, staged = null, dirty = false, status = 'idle', mode = 'ready', pending = null;
  let ownLastRaw = null, recoveryDurable = false, recoveryRetained = false, recoveryIssue = '';
  function report(next) {
    status = next;
    const result = { status, dirty, recoveryDurable, recoveryRetained };
    // Status observers must not change whether a storage operation succeeded.
    try { onChange(result); } catch {}
    return result;
  }
  function decodeInbox(raw) {
    if (raw === null) return { schema: INBOX_SCHEMA, entries: [] };
    if (typeof raw !== 'string' || bytes(raw) > HARD_BYTES) throw new Error('Invalid recovery inbox size');
    const value = JSON.parse(raw), owners = new Set();
    if (!exact(value, ['schema', 'entries']) || value.schema !== INBOX_SCHEMA || !Array.isArray(value.entries) || value.entries.length > HARD_ENTRIES)
      throw new Error('Invalid recovery inbox');
    for (const entry of value.entries) {
      if (!exact(entry, ['owner', 'writer', 'raw', 'baselineSha256', 'updatedAt']) ||
        typeof entry.owner !== 'string' || !entry.owner.length || entry.owner.length > 160 || owners.has(entry.owner) ||
        typeof entry.writer !== 'string' || !entry.writer.length || entry.writer.length > 100 ||
        typeof entry.raw !== 'string' || !/^[a-f0-9]{64}$/.test(entry.baselineSha256) ||
        !Number.isFinite(entry.updatedAt) || entry.updatedAt < 0) throw new Error('Invalid recovery entry');
      parse(entry.raw); owners.add(entry.owner);
    }
    return value;
  }
  function persistInbox(inbox, raw = JSON.stringify(inbox)) {
    if (inbox.entries.length > HARD_ENTRIES || bytes(raw) > HARD_BYTES) throw new Error('Invalid recovery inbox size');
    storage.setItem(inboxKey, raw);
    if (storage.getItem(inboxKey) !== raw) throw new Error('Recovery readback mismatch');
    return true;
  }
  function keySnapshot() {
    if (typeof storage.keys === 'function') {
      const names = storage.keys();
      if (!Array.isArray(names)) throw new Error('Invalid storage key snapshot');
      return names;
    }
    const length = storage.length;
    return Array.from({length}, (_, index) => storage.key(index));
  }
  function initializationSource(current, inboxRaw) {
    if (current !== null) return 'conflict';
    // Even an empty inbox is evidence of an earlier initialized session. An
    // absent main key must not silently turn that session into a fresh game.
    if (inboxRaw !== null) return 'recovery-present';
    const prefixes = [legacyPrefix, ...additionalRecoveryPrefixes];
    for (const name of keySnapshot()) {
      if (typeof name === 'string' && prefixes.some(prefix => name.startsWith(prefix))) return 'recovery-present';
    }
    return null;
  }
  function inspectInbox() {
    let raw;
    try { raw = storage.getItem(inboxKey); }
    catch { return { status: 'unavailable', raw: null, inboxKey, entries: [] }; }
    try { return { status: 'ready', raw, inboxKey, entries: decodeInbox(raw).entries }; }
    catch { return { status: 'invalid', raw, inboxKey, entries: [] }; }
  }
  function readLatest({ discardPending = false } = {}) {
    if (dirty && !discardPending) return { state: null, raw: baseline, ...report('pending-local') };
    try {
      const raw = storage.getItem(key);
      let state;
      try { state = raw === null ? null : parse(raw); }
      catch { baseline = raw; mode = 'invalid'; return { state: null, raw, ...report('invalid') }; }
      // An empty read is not a successful replacement for a known or staged
      // branch. Keep its exact pending bytes until a valid authority is read.
      // Only a genuinely new empty store may proceed to normal initialization.
      if (raw === null && (baseline !== null || staged !== null || dirty)) {
        mode = 'unavailable';
        return { state: null, raw, ...report('missing-authority') };
      }
      baseline = raw; staged = null; dirty = false; mode = 'ready'; recoveryDurable = false;
      // Reading/discarding a local branch does not authorize overwriting its
      // durable recovery entry. A later edit needs a new owner or an archive.
      ownLastRaw = null;
      return { state, raw, ...report(raw === null ? 'idle' : 'saved') };
    } catch { mode = 'unavailable'; return { state: null, raw: null, ...report('error') }; }
  }
  function observe() {
    try {
      if (storage.getItem(key) === baseline) return { status, dirty };
      mode = 'conflict'; return report('conflict');
    } catch { return report('error'); }
  }
  function save(state, { initializing = false } = {}) {
    let raw;
    try { raw = JSON.stringify(state); parse(raw); }
    catch { return Promise.resolve(report('invalid-state')); }
    staged = raw; dirty = raw !== baseline; recoveryDurable = false;
    const initialCandidate = initializing ? raw : null;
    let initializationApproved = !initializing;
    function refuseInitialization(next) {
      if (staged === initialCandidate) { staged = null; dirty = false; }
      mode = 'unavailable';
      return { ...report(next), initializationRefused: true };
    }
    if (!dirty && mode === 'ready') return Promise.resolve(report('saved'));
    if (mode === 'invalid' || mode === 'unavailable') return Promise.resolve(report(mode === 'invalid' ? 'invalid' : 'error'));
    if (!locks?.request) return Promise.resolve(report('locks-required'));
    if (pending) return pending;
    report('pending');
    pending = Promise.resolve().then(async () => {
      const raw = baseline;
      return { raw, sha256: await sha(raw) };
    }).then(baseProof => locks.request(key, () => {
      if (!dirty || staged === null) return { status, dirty, recoveryDurable, recoveryRetained };
      if (baseProof.raw !== baseline) return report('superseded');
      const candidate = staged;
      try {
        const current = storage.getItem(key);
        const inboxRaw = storage.getItem(inboxKey);
        if (initializing) {
          const blocked = initializationSource(current, inboxRaw);
          if (blocked) return refuseInitialization(blocked);
          initializationApproved = true;
        }
        let inbox;
        try { inbox = decodeInbox(inboxRaw); }
        catch { recoveryIssue = 'invalid'; return report('recovery-invalid'); }
        recoveryIssue = '';
        const previous = inbox.entries.find(entry => entry.owner === ownerID);
        if (previous && previous.raw !== ownLastRaw && previous.raw !== candidate && previous.raw !== current)
          return report('recovery-owner-conflict');
        // All new inbox writers hold this same lock. Equal durable copies can
        // be removed here without racing a newer write from their owners.
        const kept = inbox.entries.filter(entry => entry.raw !== current && entry.owner !== ownerID);
        if (current === candidate) {
          baseline = candidate; dirty = staged !== candidate; mode = 'ready'; recoveryDurable = previous?.raw === candidate;
          try { persistInbox({ schema: INBOX_SCHEMA, entries: kept }); recoveryRetained = false; recoveryDurable = false; ownLastRaw = null; }
          catch { recoveryRetained = true; }
          return report('saved');
        }
        const updatedAt = now();
        if (!Number.isFinite(updatedAt) || updatedAt < 0) return report('recovery-error');
        const entry = { owner: ownerID, writer: tabID, raw: candidate, baselineSha256: baseProof.sha256, updatedAt };
        const nextInbox = { schema: INBOX_SCHEMA, entries: [...kept, entry] };
        const nextInboxRaw = nextInbox.entries.length > maxEntries ? null : JSON.stringify(nextInbox);
        if (nextInboxRaw === null || bytes(nextInboxRaw) > maxBytes) {
          recoveryDurable = previous?.raw === candidate;
          return report('recovery-capacity');
        }
        try { persistInbox(nextInbox, nextInboxRaw); ownLastRaw = candidate; recoveryDurable = true; }
        catch { recoveryDurable = false; return report('recovery-error'); }
        if (current !== baseline || mode === 'conflict') { mode = 'conflict'; return report('conflict'); }
        try {
          storage.setItem(key, candidate);
          if (storage.getItem(key) !== candidate) throw new Error('Authority readback mismatch');
        } catch { return report('error'); }
        baseline = candidate; dirty = staged !== candidate; mode = 'ready';
        try {
          persistInbox({ schema: INBOX_SCHEMA, entries: nextInbox.entries.filter(entry => entry.raw !== candidate) });
          recoveryRetained = false; recoveryDurable = false; ownLastRaw = null;
        } catch { recoveryRetained = true; }
        return report('saved');
      } catch { return initializationApproved ? report('error') : refuseInitialization('error'); }
    })).catch(() => initializationApproved ? report('error') : refuseInitialization('error')).finally(() => { pending = null; });
    return pending;
  }
  function initialize(state) {
    if (dirty || staged !== null) return Promise.resolve({ ...report('pending-local'), initializationRefused: true });
    try {
      const blocked = initializationSource(storage.getItem(key), storage.getItem(inboxKey));
      if (blocked) { mode = 'unavailable'; return Promise.resolve({ ...report(blocked), initializationRefused: true }); }
    } catch {
      mode = 'unavailable';
      return Promise.resolve({ ...report('error'), initializationRefused: true });
    }
    return save(state, { initializing: true });
  }
  function recoveries() {
    const found = [];
    try {
      const current = storage.getItem(key);
      let inbox = { schema: INBOX_SCHEMA, entries: [] };
      try { inbox = decodeInbox(storage.getItem(inboxKey)); recoveryIssue = ''; }
      catch { recoveryIssue = 'invalid'; }
      for (const entry of inbox.entries) if (entry.raw !== current) found.push({
        key: `${inboxKey}#${entry.owner}`, owner: entry.owner, format: 'bounded-inbox', raw: entry.raw,
        state: parse(entry.raw), updatedAt: entry.updatedAt, baselineSha256: entry.baselineSha256 });
      for (const candidateKey of keySnapshot()) {
        if (!candidateKey?.startsWith(legacyPrefix)) continue;
        try {
          const record = JSON.parse(storage.getItem(candidateKey));
          if (record?.version === 1 && typeof record.save === 'string' && record.save !== current)
            found.push({ key: candidateKey, format: 'legacy-pending', raw: record.save, state: parse(record.save), updatedAt: record.updatedAt });
        } catch {}
      }
    } catch {}
    return found.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async function releaseArchived({ owner, expectedRaw, verifiedArchiveRaw, expectedEntry }) {
    if (!locks?.request || typeof owner !== 'string' || expectedRaw !== verifiedArchiveRaw || typeof expectedRaw !== 'string')
      return { status: 'archive-required' };
    const fields = ['owner', 'writer', 'raw', 'baselineSha256', 'updatedAt'];
    if (expectedEntry !== undefined && (!exact(expectedEntry, fields) || expectedEntry.owner !== owner || expectedEntry.raw !== expectedRaw))
      return { status: 'archive-required' };
    let entered = false;
    try { return await locks.request(key, () => {
      entered = true;
      let writeAttempted = false;
      try {
        const inbox = decodeInbox(storage.getItem(inboxKey)), existing = inbox.entries.find(entry => entry.owner === owner);
        if (!existing) return { status: 'already-released', outcome: 'observed-absent' };
        if (existing.raw !== expectedRaw || expectedEntry && fields.some(field => existing[field] !== expectedEntry[field]))
          return { status: 'changed-recovery' };
        writeAttempted = true;
        persistInbox({ schema: INBOX_SCHEMA, entries: inbox.entries.filter(entry => entry.owner !== owner) });
        if (owner === ownerID) { ownLastRaw = null; recoveryDurable = false; }
        return { status: 'released', mainChanged: false, outcome: 'confirmed' };
      } catch { return { status: 'recovery-error', outcome: writeAttempted ? 'uncertain' : 'not-started' }; }
    }); } catch { return { status: 'recovery-error', outcome: entered ? 'uncertain' : 'not-started' }; }
  }
  return Object.freeze({ readLatest, save, initialize, observe, recoveries, inspectInbox, releaseArchived, ownerID, inboxKey,
    pendingExport: () => staged === null ? null : ({ schema: 'pipi-pending-export/v1', raw: staged, recoveryDurable }),
    recoveryHealth: () => ({ issue: recoveryIssue }),
    snapshot: () => ({ status, dirty, raw: baseline, recoveryDurable, recoveryRetained }) });
}
