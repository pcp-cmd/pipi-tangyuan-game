import { SAVE_KEY } from '../dist/engine.js';
import { createSaveStore } from './recovery-save-store.mjs';
import { INTEGRATED_SAVE_KEY, parseEnvelope, freshEnvelope, migrateMainSave } from './state.mjs';
import {externalHistoryPreserved} from './external-work.mjs';
import { createMissingAuthorityRecovery } from './missing-authority-recovery.mjs';

export function createIntegrationStore({ storage, locks, tabID, now, onChange, retention = {} }) {
  if (!retention || typeof retention !== 'object' || Array.isArray(retention) ||
      Object.keys(retention).some(key => !['ownerID', 'maxEntries', 'maxBytes'].includes(key))) throw new TypeError('Invalid retention options');
  const { ownerID, maxEntries, maxBytes } = retention;
  const store = createSaveStore({ key: INTEGRATED_SAVE_KEY, parse: parseEnvelope, storage, locks, tabID, now, onChange, ownerID, maxEntries, maxBytes,
    additionalRecoveryPrefixes: [`${SAVE_KEY}:pending:`] });
  let latestLocal = null;
  function readLatest(options) {
    const result = store.readLatest(options);
    // A refused/failed read is not a new state. Keep the monotonic guard for
    // an accepted local result that may exist only in the recovery inbox.
    if (result.state) latestLocal = result.state;
    return result;
  }
  function save(state) {
    let next;
    try { next = parseEnvelope(JSON.stringify(state)); }
    catch { return Promise.resolve({ status: 'invalid-state', dirty: store.snapshot().dirty }); }
    if (latestLocal) {
      const prior = latestLocal;
      const stable = game => { const { drafts, shopDraft, ...rest } = game; return rest; };
      const lostHistory = ['completed', 'inventory', 'buildings'].some(field => prior.game[field].some(id => !next.game[field].includes(id))) ||
        next.game.xp < prior.game.xp || next.game.turn < prior.game.turn || Object.keys(prior.records).some(id => !Object.hasOwn(next.records, id));
      const changedAtSameRevision = next.revision === prior.revision &&
        (JSON.stringify(stable(next.game)) !== JSON.stringify(stable(prior.game)) || JSON.stringify(next.records) !== JSON.stringify(prior.records) ||
          JSON.stringify(next.externalWork) !== JSON.stringify(prior.externalWork));
      const lostMilestone = Object.entries(prior.records).some(([id, record]) => {
        const before = record.milestones, after = next.records[id]?.milestones;
        return !after || after.assessmentVersion < before.assessmentVersion ||
          (after.assessmentVersion === before.assessmentVersion && ['guided', 'independent'].some(field => before[field] && !after[field]));
      });
      if (next.revision < prior.revision || lostHistory || lostMilestone || changedAtSameRevision || JSON.stringify(next.migration) !== JSON.stringify(prior.migration) ||
          JSON.stringify(next.legacyAccess) !== JSON.stringify(prior.legacyAccess) || !externalHistoryPreserved(prior.externalWork,next.externalWork)) {
        return Promise.resolve({ status: 'stale-state', dirty: store.snapshot().dirty });
      }
    }
    latestLocal = next;
    return store.save(next);
  }
  function checkLegacySource(state) {
    try {
      const original = state.migration?.original ?? null;
      return storage.getItem(SAVE_KEY) === original ? 'unchanged' : 'changed';
    } catch { return 'unavailable'; }
  }
  async function loadOrMigrate() {
    const load = async () => {
      if (store.snapshot().dirty) return { state: null, status: 'pending-local', migrated: false };
      const existing = readLatest();
      if (existing.state) return { ...existing, migrated: false, legacySourceStatus: checkLegacySource(existing.state) };
      if (['invalid', 'error', 'missing-authority'].includes(existing.status)) return { ...existing, migrated: false };
      let original;
      try { original = storage.getItem(SAVE_KEY); }
      catch { return { state: null, status: 'error', migrated: false }; }
      let state;
      try { state = original === null ? freshEnvelope() : migrateMainSave(original); }
      catch { return { state: null, raw: original, status: 'invalid-legacy', migrated: false }; }
      const saved = await store.initialize(state);
      if (saved.initializationRefused) return { state: null, ...saved, migrated: false };
      latestLocal = state;
      return { state, ...saved, migrated: original !== null && saved.status === 'saved' };
    };
    if (!locks?.request) return load();
    try { return await locks.request(SAVE_KEY, load); }
    catch { return { state: null, status: 'error', migrated: false }; }
  }
  const { initialize: _privateInitialize, ...publicStore } = store;
  function missingAuthorityRecovery({scope, canRestore = () => true, onReload, onChange, readFile, digest} = {}) {
    return createMissingAuthorityRecovery({scope, key: INTEGRATED_SAVE_KEY, legacyKey: SAVE_KEY, storage, locks,
      parse: parseEnvelope, inspectInbox: store.inspectInbox, readFile, digest, onChange, onReload,
      canRestore: () => latestLocal === null && store.snapshot().status === 'recovery-present' &&
        !store.snapshot().dirty && store.pendingExport() === null && canRestore() === true});
  }
  return Object.freeze({ ...publicStore, readLatest, save, loadOrMigrate, checkLegacySource, missingAuthorityRecovery });
}
