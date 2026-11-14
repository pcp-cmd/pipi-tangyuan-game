import { SAVE_KEY } from '../dist/engine.js';
import { createSaveStore } from '../dist/save-store.js';
import { INTEGRATED_SAVE_KEY, parseEnvelope, freshEnvelope, migrateMainSave } from './state.mjs';
import {externalHistoryPreserved} from './external-work.mjs';

export function createIntegrationStore({ storage, locks, tabID, now, onChange }) {
  const store = createSaveStore({ key: INTEGRATED_SAVE_KEY, parse: parseEnvelope, storage, locks, tabID, now, onChange });
  let latestLocal = null;
  function readLatest(options) {
    const result = store.readLatest(options);
    latestLocal = result.state;
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
      if (['invalid', 'error'].includes(existing.status)) return { ...existing, migrated: false };
      let original;
      try { original = storage.getItem(SAVE_KEY); }
      catch { return { state: null, status: 'error', migrated: false }; }
      let state;
      try { state = original === null ? freshEnvelope() : migrateMainSave(original); }
      catch { return { state: null, raw: original, status: 'invalid-legacy', migrated: false }; }
      const saved = await save(state);
      return { state, ...saved, migrated: original !== null && saved.status === 'saved' };
    };
    if (!locks?.request) return load();
    try { return await locks.request(SAVE_KEY, load); }
    catch { return { state: null, status: 'error', migrated: false }; }
  }
  return Object.freeze({ ...store, readLatest, save, loadOrMigrate, checkLegacySource });
}
