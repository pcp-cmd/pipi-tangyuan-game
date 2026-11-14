// Describes current observable emptiness, never a person's first visit or learning history.
import { ASSESSMENT_VERSION } from '../integration/contracts.mjs';
import { freshState } from '../dist/engine.js';
const initial = freshState();
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const noKeys = value => record(value) && Object.keys(value).length === 0;
const noItems = value => Array.isArray(value) && value.length === 0;

export function emptyLearningFacts(envelope) {
  const game = envelope?.game;
  return record(envelope) && envelope.assessmentVersion === ASSESSMENT_VERSION && envelope.migration === null &&
    record(game) && noKeys(game.drafts) && game.shopDraft === initial.shopDraft &&
    noKeys(envelope.draftAssistance) && noKeys(envelope.records) &&
    ['completed', 'inventory', 'buildings', 'history'].every(key => noItems(game[key])) &&
    game.coins === initial.coins && game.xp === initial.xp && game.turn === initial.turn &&
    game.positions?.pipi === initial.positions.pipi && game.positions?.tangyuan === initial.positions.tangyuan;
}

// Only the source parse is cached. The current draft/status/owner facts are checked afresh.
// The caller supplies the real Session's already-validated loadResult, not storage/original().
export function createFirstEntrySourceReader({ parse = JSON.parse } = {}) {
  const sources = new WeakMap();
  return loadResult => {
    if (!record(loadResult)) return false;
    if (sources.has(loadResult)) return sources.get(loadResult);
    let confirmed = false;
    if (loadResult.status === 'saved' && loadResult.migrated === false && emptyLearningFacts(loadResult.state) &&
        (!Object.hasOwn(loadResult, 'legacySourceStatus') || loadResult.legacySourceStatus === 'unchanged')) {
      if (!Object.hasOwn(loadResult, 'raw')) confirmed = true;
      else if (typeof loadResult.raw === 'string' && loadResult.legacySourceStatus === 'unchanged') {
        try { confirmed = emptyLearningFacts(parse(loadResult.raw)); } catch { /* Unknown source stays conservative. */ }
      }
    }
    sources.set(loadResult, confirmed);
    return confirmed;
  };
}

export function canDescribeCurrentFirstStepAsStart({ view, hasUnsaved, access, lesson, owner, sourceIsCurrentEmpty } = {}) {
  return view?.loadedValid === true && view.localEnvelopeValid === true && view.status === 'saved' &&
    hasUnsaved === false && view.pendingDraft === null && view.pendingWrites === 0 &&
    view.busy === false && view.selecting === false && owner?.runBusy === false && owner.pendingSelection === false &&
    lesson?.id === 'first-steps' && access?.canSelect === true && access.canRun === true &&
    sourceIsCurrentEmpty === true && view.game === view.envelope?.game && emptyLearningFacts(view.envelope) &&
    owner.assisted === false && owner.editorLessonId === lesson.id && typeof owner.liveEditorCode === 'string' &&
    typeof lesson.starter === 'string' && owner.liveEditorCode === lesson.starter;
}
