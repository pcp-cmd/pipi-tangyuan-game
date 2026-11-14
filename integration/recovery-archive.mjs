const FORMAT = 'pipi-recovery-archive/v1';
const MAX_ARCHIVE_BYTES = 16 * 1024 * 1024;
const FIELDS = ['owner', 'writer', 'raw', 'baselineSha256', 'updatedAt'];
const exact = (value, fields) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).length === fields.length && fields.every(field => Object.hasOwn(value, field));
const size = value => new TextEncoder().encode(value).length;
const defaultDigest = async raw => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)))]
  .map(value => value.toString(16).padStart(2, '0')).join('');
const validEntry = value => exact(value, FIELDS) && typeof value.owner === 'string' && value.owner.length > 0 && value.owner.length <= 160 &&
  typeof value.writer === 'string' && value.writer.length > 0 && value.writer.length <= 100 && typeof value.raw === 'string' &&
  /^[a-f0-9]{64}$/.test(value.baselineSha256) && Number.isFinite(value.updatedAt) && value.updatedAt >= 0;
const signature = entry => JSON.stringify(FIELDS.map(field => entry[field]));
const copyEntry = entry => Object.freeze(Object.fromEntries(FIELDS.map(field => [field, entry[field]])));

// The file reader is injectable for controlled async tests. Production passes
// no override and receives the File from a visible file-input change event.
// A download request alone never creates a release capability.
export function createRecoveryArchiveManager({session, scope, readFile = file => file.text(), digest = defaultDigest}) {
  if (typeof scope !== 'string' || !scope.length || scope.length > 500 ||
      typeof session?.inspectRecoveryInbox !== 'function' || typeof session?.releaseArchived !== 'function')
    throw new TypeError('Invalid recovery archive context');
  let generation = 0, selected = null, prepared = null, proof = null, releasing = false;
  let phase = 'idle', lastResult = null, lastRaw = null, inspection = {status: 'unavailable', entries: []};

  function invalidate(next) {
    generation++; prepared = null; proof = null;
    if (next) phase = next;
  }
  function inspect() {
    let result;
    try { result = session.inspectRecoveryInbox(); }
    catch { result = {status: 'unavailable', raw: null, entries: []}; }
    if (!result || !['ready', 'invalid', 'unavailable'].includes(result.status) || !Array.isArray(result.entries) ||
        result.entries.length > 8 || result.status === 'ready' && result.entries.some(entry => !validEntry(entry)))
      result = {status: 'unavailable', raw: null, entries: []};
    if (typeof result.raw === 'string') lastRaw = result.raw;
    inspection = result;
    return result;
  }
  function currentEntry(expected) {
    const current = inspect();
    if (current.status !== 'ready') return {status: current.status === 'invalid' ? 'inbox-invalid' : 'inbox-unavailable'};
    const found = current.entries.find(entry => entry.owner === expected.owner);
    return found && signature(found) === signature(expected) ? {status: 'matched', entry: found} : {status: 'branch-changed'};
  }
  function snapshot() {
    return Object.freeze({phase, selectedOwner: selected?.owner ?? null, selected,
      entries: inspection.status === 'ready' ? inspection.entries.map(copyEntry) : [], inboxStatus: inspection.status,
      canVerify: !releasing && !!prepared?.downloadRequested, canRelease: !releasing && !!proof,
      canExportOriginal: lastRaw !== null, releasing, lastResult});
  }
  function refresh() {
    const current = inspect();
    if (selected && (current.status !== 'ready' || !current.entries.some(entry => signature(entry) === signature(selected)))) {
      invalidate(current.status === 'ready' ? 'branch-changed' : 'inbox-' + current.status);
      selected = null;
    } else if (!selected && current.status !== 'ready') invalidate('inbox-' + current.status);
    return snapshot();
  }
  function select(owner) {
    if (releasing) return {status: 'busy'};
    const current = inspect(); invalidate('idle'); selected = null;
    if (current.status !== 'ready') return {status: 'inbox-' + current.status};
    const found = current.entries.find(entry => entry.owner === owner);
    if (!found) return {status: 'branch-changed'};
    selected = copyEntry(found); phase = 'selected'; return {status: 'selected', entry: selected};
  }
  async function prepareArchive() {
    if (releasing) return {status: 'busy'};
    invalidate('preparing');
    if (!selected) { phase = 'selection-required'; return {status: phase}; }
    const expected = selected, token = generation;
    try {
      const checksum = await digest(expected.raw);
      if (token !== generation) return {status: 'superseded'};
      const current = currentEntry(expected);
      if (current.status !== 'matched') { invalidate(current.status); return current; }
      const payload = {format: FORMAT, scope, entry: expected, sha256: checksum};
      const text = JSON.stringify(payload, null, 2);
      if (size(text) > MAX_ARCHIVE_BYTES) { phase = 'archive-too-large'; return {status: phase}; }
      const ticket = Object.freeze({kind: 'download-request'});
      prepared = {ticket, entry: expected, text, downloadRequested: false}; phase = 'prepared';
      return {status: 'prepared', ticket, text, filename: 'pipi-recovery-' + expected.owner.replace(/[^a-z0-9_-]/gi, '_').slice(0, 36) + '.json'};
    } catch { if (token === generation) { invalidate('prepare-failed'); return {status: phase}; } return {status: 'superseded'}; }
  }
  function noteDownloadRequested(ticket) {
    if (releasing || !prepared || prepared.ticket !== ticket) return {status: 'invalid-ticket'};
    const current = currentEntry(prepared.entry);
    if (current.status !== 'matched') { invalidate(current.status); return current; }
    prepared.downloadRequested = true; phase = 'download-requested'; return {status: phase, verified: false};
  }
  function noteDownloadFailed(ticket) {
    if (prepared?.ticket !== ticket) return {status: 'invalid-ticket'};
    invalidate('download-failed'); return {status: phase};
  }
  function cancelVerification() {
    if (releasing) return {status: 'busy'};
    generation++; proof = null;
    phase = prepared?.downloadRequested ? 'download-requested' : selected ? 'selected' : 'idle';
    return {status: 'verification-cleared'};
  }
  async function verifySelectedFile(file) {
    if (releasing) return {status: 'busy'};
    generation++; proof = null;
    const token = generation, expected = selected, request = prepared;
    if (!expected || !request?.downloadRequested) { phase = 'download-required'; return {status: phase}; }
    phase = 'reading-file';
    const fail = status => {
      if (token !== generation) return {status: 'superseded'};
      proof = null; phase = status; return {status};
    };
    if (typeof File === 'undefined' || !(file instanceof File) || !Number.isSafeInteger(file.size) ||
        file.size < 1 || file.size > MAX_ARCHIVE_BYTES || typeof file.name !== 'string') return fail('invalid-file');
    try {
      const text = await readFile(file);
      if (token !== generation) return {status: 'superseded'};
      if (typeof text !== 'string' || size(text) !== file.size || size(text) > MAX_ARCHIVE_BYTES) return fail('invalid-file');
      let value;
      try { value = JSON.parse(text); } catch { return fail('invalid-file'); }
      if (!exact(value, ['format', 'scope', 'entry', 'sha256']) || value.format !== FORMAT || value.scope !== scope ||
          !validEntry(value.entry) || signature(value.entry) !== signature(expected) || !/^[a-f0-9]{64}$/.test(value.sha256))
        return fail('wrong-archive');
      const checksum = await digest(value.entry.raw);
      if (token !== generation) return {status: 'superseded'};
      if (checksum !== value.sha256) return fail('wrong-archive');
      const current = currentEntry(expected);
      if (current.status !== 'matched') { invalidate(current.status); return current; }
      const ticket = Object.freeze({kind: 'verified-file'});
      proof = {ticket, entry: expected, archiveRaw: value.entry.raw, fileName: file.name, fileBytes: file.size};
      phase = 'verified'; return {status: phase, ticket, fileName: file.name, fileBytes: file.size};
    } catch { return fail('file-read-failed'); }
  }
  async function releaseVerified(ticket, {confirmed = false} = {}) {
    if (releasing) return {status: 'busy'};
    if (!confirmed) return {status: 'confirmation-required'};
    if (!proof || proof.ticket !== ticket) return {status: 'verification-required'};
    const authorized = proof, current = currentEntry(authorized.entry);
    if (current.status !== 'matched') { invalidate(current.status); return current; }
    invalidate('releasing'); releasing = true;
    let result;
    try {
      result = await session.releaseArchived({owner: authorized.entry.owner, expectedRaw: authorized.entry.raw,
        verifiedArchiveRaw: authorized.archiveRaw, expectedEntry: authorized.entry});
    } catch { result = {status: 'recovery-error', outcome: 'uncertain'}; }
    finally { releasing = false; }
    lastResult = Object.freeze({...result});
    if (result.status === 'released') { phase = 'released'; selected = null; }
    else if (result.status === 'already-released') { phase = 'observed-absent'; selected = null; }
    else if (result.status === 'recovery-error' && result.outcome !== 'not-started') phase = 'release-uncertain';
    else phase = result.status;
    inspect(); return {...result, phase};
  }
  function originalInboxExport() {
    inspect();
    if (lastRaw === null) return {status: 'original-unavailable'};
    const source = typeof inspection.raw === 'string' && inspection.status !== 'unavailable' ? 'current'
      : inspection.status === 'unavailable' ? 'historical-unavailable' : 'historical-missing';
    return {status: 'original-ready', filename: 'pipi-original-recovery-inbox.json', currentReadable: source === 'current', source,
      text: JSON.stringify({format: 'pipi-recovery-inbox-original/v1', scope, raw: lastRaw,
        latestReadStatus: inspection.status, source, note: '原始恢复收件箱备份，不是可导入主进度，也不是单分支释放凭证。'}, null, 2)};
  }
  return Object.freeze({refresh, select, snapshot, prepareArchive, noteDownloadRequested, noteDownloadFailed, cancelVerification,
    verifySelectedFile, releaseVerified, originalInboxExport});
}
