const FORMAT = 'pipi-recovery-archive/v1';
const FIELDS = ['owner', 'writer', 'raw', 'baselineSha256', 'updatedAt'];
const MAX_FILE_BYTES = 16 * 1024 * 1024;
const bytes = value => new TextEncoder().encode(value).length;
const exact = (value, fields) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).length === fields.length && fields.every(field => Object.hasOwn(value, field));
const validEntry = value => exact(value, FIELDS) && typeof value.owner === 'string' && value.owner.length > 0 && value.owner.length <= 160 &&
  typeof value.writer === 'string' && value.writer.length > 0 && value.writer.length <= 100 && typeof value.raw === 'string' &&
  typeof value.baselineSha256 === 'string' && /^[a-f0-9]{64}$/.test(value.baselineSha256) && Number.isFinite(value.updatedAt) && value.updatedAt >= 0;
const sameEntry = (a, b) => FIELDS.every(field => a[field] === b[field]);
const digestRaw = async raw => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)))]
  .map(value => value.toString(16).padStart(2, '0')).join('');

// Internal fixed-store controller. It owns the File proof and the transaction;
// there is no public raw-string restore method or generic import capability.
// The wrapper supplies the parser, keys, source inspector and local-state guard.
export function createMissingAuthorityRecovery({key, legacyKey, scope, storage, locks, parse, inspectInbox,
  canRestore, onReload = () => ({status: 'read-required'}), onChange = () => {},
  readFile = file => file.text(), digest = digestRaw}) {
  if (typeof key !== 'string' || !key || typeof legacyKey !== 'string' || !legacyKey ||
      typeof scope !== 'string' || !scope || scope.length > 500 || typeof parse !== 'function' ||
      typeof inspectInbox !== 'function' || typeof canRestore !== 'function' || typeof onReload !== 'function')
    throw new TypeError('Invalid missing-authority context');
  let generation = 0, proof = null, busy = false, disposed = false, needsInspection = false;
  let phase = 'idle', lastResult = null, summary = null, lastAttempt = null;
  function snapshot() {
    return Object.freeze({phase, busy, canRestore: !disposed && !busy && !!proof, needsInspection,
      canInspectOutcome: !disposed && !!lastAttempt,
      canReload: !disposed && !busy && !needsInspection && !!lastAttempt && ['restored','observed-identical','reload-blocked'].includes(phase), summary, lastResult});
  }
  function report(status, details = {}) {
    phase = status; lastResult = Object.freeze({status, ...details});
    if (!disposed) { try { onChange(snapshot()); } catch {} }
    return lastResult;
  }
  function invalidate() { generation++; proof = null; summary = null; }
  function gate() {
    if (disposed) return false;
    try { return canRestore() === true; } catch { return false; }
  }
  function sourceContext(expectedEntry) {
    // This fast gate performs no Storage access in an ordinary loaded game.
    if (!gate()) return {status: 'local-state-blocked'};
    if (!locks?.request) return {status: 'locks-required'};
    try { if (storage.getItem(key) !== null) return {status: 'authority-present'}; }
    catch { return {status: 'authority-unavailable'}; }
    let found;
    try { found = inspectInbox(); } catch { return {status: 'source-unavailable'}; }
    if (found?.status === 'unavailable') return {status: 'source-unavailable'};
    if (found?.status !== 'ready' || !Array.isArray(found.entries) || found.entries.length > 8 || found.entries.some(row => !validEntry(row)))
      return {status: 'source-invalid'};
    if (typeof found.raw !== 'string' || found.entries.length === 0) return {status: 'no-live-source'};
    if (new Set(found.entries.map(row => row.raw)).size !== 1) return {status: 'ambiguous-sources'};
    const selected = expectedEntry ? found.entries.find(row => sameEntry(row, expectedEntry)) : found.entries[0];
    if (!selected) return {status: 'source-changed'};
    try {
      const names = typeof storage.keys === 'function' ? storage.keys() : Array.from({length: storage.length}, (_, index) => storage.key(index));
      if (!Array.isArray(names) || names.some(name => name !== null && typeof name !== 'string')) throw new Error('Invalid key list');
      if (names.some(name => typeof name === 'string' && [key + ':pending:', legacyKey + ':pending:'].some(prefix => name.startsWith(prefix))))
        return {status: 'legacy-pending-present'};
      const state = parse(selected.raw), legacyRaw = storage.getItem(legacyKey);
      if (legacyRaw !== (state.migration?.original ?? null)) return {status: 'legacy-source-changed'};
      return {status: 'eligible', inboxRaw: found.raw, entry: Object.freeze({...selected}), legacyRaw, state};
    } catch { return {status: 'source-unavailable'}; }
  }
  function refresh() {
    if (busy) return {status: 'busy'};
    invalidate();
    if (needsInspection) return report('outcome-check-required');
    const context = sourceContext();
    return report(context.status);
  }
  function cancel() {
    invalidate();
    return report(busy ? 'cancel-requested' : needsInspection ? 'outcome-check-required' : 'idle');
  }
  async function verifyFile(file) {
    if (busy) return {status: 'busy'};
    invalidate();
    if (needsInspection) return report('outcome-check-required');
    const token = generation;
    if (!gate()) return report('local-state-blocked');
    report('reading-file');
    const fail = status => token !== generation || disposed ? {status: 'superseded'} : report(status);
    if (typeof File === 'undefined' || !(file instanceof File) || !Number.isSafeInteger(file.size) || file.size < 1 ||
        file.size > MAX_FILE_BYTES || typeof file.name !== 'string') return fail('invalid-file');
    let text;
    try { text = await readFile(file); }
    catch { return fail('file-read-failed'); }
    if (token !== generation || disposed) return {status: 'superseded'};
    if (typeof text !== 'string' || bytes(text) !== file.size || bytes(text) > MAX_FILE_BYTES) return fail('invalid-file');
    let archive, state;
    try {
      archive = JSON.parse(text);
      if (!exact(archive, ['format', 'scope', 'entry', 'sha256']) || archive.format !== FORMAT || archive.scope !== scope ||
          !validEntry(archive.entry) || typeof archive.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(archive.sha256))
        return fail('wrong-archive');
      state = parse(archive.entry.raw);
    } catch { return fail('invalid-archive'); }
    let checksum;
    try { checksum = await digest(archive.entry.raw); } catch { return fail('file-check-failed'); }
    if (token !== generation || disposed) return {status: 'superseded'};
    if (checksum !== archive.sha256) return fail('wrong-archive');
    const context = sourceContext(archive.entry);
    if (context.status !== 'eligible') return fail(context.status);
    const ticket = Object.freeze({kind: 'restore-missing-authority'});
    summary = Object.freeze({fileName: file.name, fileBytes: file.size, rawSha256: checksum,
      storedAssessmentVersion: JSON.parse(archive.entry.raw).assessmentVersion, coins: state.game.coins, xp: state.game.xp,
      completed: state.game.completed.length, mission: state.game.mission, activeCat: state.game.activeCat,
      assistedDrafts: Object.values(state.draftAssistance).filter(value => value === true).length});
    proof = {ticket, token, inboxRaw: context.inboxRaw, entry: context.entry, legacyRaw: context.legacyRaw, checksum};
    return report('verified', {ticket, summary});
  }
  async function restoreVerified(ticket, {confirmed = false} = {}) {
    if (busy) return {status: 'busy'};
    if (!confirmed) return {status: 'confirmation-required'};
    if (disposed || !proof || proof.ticket !== ticket || proof.token !== generation) return {status: 'verification-required'};
    const authorized = proof; proof = null; busy = true;
    lastAttempt = {raw: authorized.entry.raw, checksum: authorized.checksum};
    report('waiting-for-lock');
    let attempted = false, result;
    try {
      // Same order as loadOrMigrate. No await, digest or callbacks are inserted
      // between the final synchronous source checks and main write/readback.
      result = await locks.request(legacyKey, () => locks.request(key, () => {
        if (disposed || generation !== authorized.token) return {status: 'verification-expired', outcome: 'not-started'};
        const context = sourceContext(authorized.entry);
        if (context.status !== 'eligible') return {status: context.status, outcome: 'not-started'};
        if (context.inboxRaw !== authorized.inboxRaw || context.legacyRaw !== authorized.legacyRaw)
          return {status: 'source-changed', outcome: 'not-started'};
        // The source file remains v4/v5/v6 raw. Do not serialize the parser's
        // normalized object, settle a reward, or consume any recovery record.
        attempted = true;
        storage.setItem(key, authorized.entry.raw);
        if (storage.getItem(key) !== authorized.entry.raw) throw new Error('Restored authority readback mismatch');
        return {status: 'restored', outcome: 'confirmed', rawSha256: authorized.checksum, sourceChangedByOperation: false};
      }));
    } catch { result = {status: 'restore-error', outcome: attempted ? 'uncertain' : 'not-started'}; }
    needsInspection = result.outcome === 'uncertain';
    busy = false;
    return report(result.status, Object.fromEntries(Object.entries(result).filter(([name]) => name !== 'status')));
  }
  function inspectOutcome() {
    if (disposed) return {status: 'disposed'};
    if (busy) return {status: 'busy'};
    invalidate();
    if (!lastAttempt) return report('no-restore-attempt');
    let raw;
    try { raw = storage.getItem(key); } catch { return report('outcome-unavailable'); }
    if (raw === null) { needsInspection = false; return report('observed-absent'); }
    if (raw === lastAttempt.raw) {
      needsInspection = false;
      return report('observed-identical', {outcome: 'observed-only', sourceChangedByOperation: false});
    }
    return report('different-authority');
  }
  function reloadObserved() {
    if (!snapshot().canReload) return {status: 'reload-not-ready'};
    let current;
    try { current = storage.getItem(key); } catch { return report('outcome-unavailable'); }
    if (current !== lastAttempt.raw) return report(current === null ? 'observed-absent' : 'different-authority');
    let readStatus;
    try { readStatus = onReload()?.status ?? 'read-required'; } catch { readStatus = 'read-required'; }
    return report(readStatus === 'saved' ? 'reloaded' : 'reload-blocked', {readStatus, writePerformed: false});
  }
  return Object.freeze({refresh, verifyFile, restoreVerified, inspectOutcome, reloadObserved, cancel, snapshot,
    dispose() {invalidate(); disposed = true;}});
}
