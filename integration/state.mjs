import { freshState, parseSave, transition, MAX_SAVE_BYTES } from '../dist/engine.js';
import { ASSESSMENT_VERSION, REGISTRY_PREFIX_BY_VERSION, LESSON_IDS, LEGACY_IDS, getLesson, buildWorkerRequest, parseWorkerResult, codeDigest, evidenceVersionFor, isHistoricalEvidenceVersion } from './contracts.mjs';

import {runBudgetMs} from './run-policy.mjs';
import {deriveLegacyAccess, parseLegacyAccess} from './legacy-course-access.mjs';
import {parseExternalWork} from './external-work.mjs';

export const ENVELOPE_SCHEMA = 'pipi-game-learning/v1';
export const INTEGRATED_SAVE_KEY = 'pipi-integrated-review-v1';
export const MAX_ENVELOPE_BYTES = 8 * 1024 * 1024;
const MAX_ATTEMPTS = 40;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exact = (value, fields) => object(value) && Object.keys(value).length === fields.length && fields.every(field => Object.hasOwn(value, field));
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
function validAttempt(attempt) {
  return exact(attempt, ['id', 'at', 'passed', 'assisted', 'assessmentVersion', 'codeSha256']) &&
    typeof attempt.id === 'string' && attempt.id.length > 0 && attempt.id.length <= 100 &&
    Number.isFinite(attempt.at) && attempt.at >= 0 && typeof attempt.passed === 'boolean' && typeof attempt.assisted === 'boolean' &&
    Number.isInteger(attempt.assessmentVersion) && attempt.assessmentVersion >= 0 && attempt.assessmentVersion <= ASSESSMENT_VERSION && digest(attempt.codeSha256);
}

function retainAttemptWindow(attempts, priorMilestones, milestones, attempt) {
  const recent = [...attempts, attempt].slice(-MAX_ATTEMPTS);
  if (milestones.independent || recent.some(row => row.passed && !row.assisted)) return recent;
  const independent = [priorMilestones?.independent, ...attempts].findLast(row => row?.passed && !row.assisted);
  if (!independent) return recent;
  return [structuredClone(independent), ...recent.filter(row => row.id !== independent.id).slice(-(MAX_ATTEMPTS - 1))];
}

export function freshEnvelope() {
  return { schema: ENVELOPE_SCHEMA, revision: 0, assessmentVersion: ASSESSMENT_VERSION, game: freshState(), records: {}, draftAssistance: {}, migration: null, legacyAccess: null, externalWork: null };
}

export function parseEnvelope(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_ENVELOPE_BYTES) throw new Error('Invalid integrated save size.');
  const raw = JSON.parse(text);
  const storedAssessmentVersion = raw?.assessmentVersion;
  // Only the registry that existed in each stored container version is legal.
  const storedIds = LESSON_IDS.slice(0, REGISTRY_PREFIX_BY_VERSION[storedAssessmentVersion] ?? 0);
  const fields = ['schema', 'revision', 'assessmentVersion', 'game', 'records', 'draftAssistance', 'migration'];
  if (storedAssessmentVersion >= 10) fields.push('legacyAccess', 'externalWork');
  if (!exact(raw, fields) || raw.schema !== ENVELOPE_SCHEMA ||
      !Number.isSafeInteger(raw.revision) || raw.revision < 0 || !Number.isInteger(storedAssessmentVersion) || !Object.hasOwn(REGISTRY_PREFIX_BY_VERSION, storedAssessmentVersion) || !object(raw.records) || !object(raw.draftAssistance) ||
      Object.entries(raw.draftAssistance).some(([id, value]) => !storedIds.includes(id) || typeof value !== 'boolean')) throw new Error('Invalid integrated save.');
  const game = parseSave(JSON.stringify(raw.game), storedIds);
  const records = {};
  for (const [id, record] of Object.entries(raw.records)) {
    if (!storedIds.includes(id) || !exact(record, ['attempts', 'milestones']) || !Array.isArray(record.attempts) || record.attempts.length > MAX_ATTEMPTS ||
        !exact(record.milestones, ['assessmentVersion', 'guided', 'independent']) || !Number.isInteger(record.milestones.assessmentVersion) ||
        !isHistoricalEvidenceVersion(id, record.milestones.assessmentVersion) || record.milestones.assessmentVersion > storedAssessmentVersion) throw new Error('Invalid assessment record.');
    const ids = new Set();
    for (const attempt of record.attempts) {
      if (!validAttempt(attempt) || !isHistoricalEvidenceVersion(id, attempt.assessmentVersion) || attempt.assessmentVersion > storedAssessmentVersion || ids.has(attempt.id)) throw new Error('Invalid assessment attempt.');
      ids.add(attempt.id);
    }
    for (const [field, assisted] of [['guided', true], ['independent', false]]) {
      const milestone = record.milestones[field];
      if (milestone !== null && (!validAttempt(milestone) || !milestone.passed || milestone.assisted !== assisted || milestone.assessmentVersion !== record.milestones.assessmentVersion)) throw new Error('Invalid assessment milestone.');
      if (record.attempts.some(attempt => attempt.passed && attempt.assisted === assisted && attempt.assessmentVersion === record.milestones.assessmentVersion) && milestone === null) throw new Error('Missing assessment milestone.');
    }
    if ((record.attempts.some(attempt => attempt.passed) || record.milestones.guided || record.milestones.independent) && !game.completed.includes(id)) throw new Error('Passing evidence cannot lack its completion ledger entry.');
    records[id] = structuredClone(record);
  }
  if (raw.migration !== null) {
    if (!exact(raw.migration, ['source', 'original']) || raw.migration.source !== 'pipi-islands-v1' ||
        typeof raw.migration.original !== 'string' || new TextEncoder().encode(raw.migration.original).length > MAX_SAVE_BYTES) throw new Error('Invalid migration provenance.');
    const prior = parseSave(raw.migration.original, LEGACY_IDS);
    if (prior.completed.some(id => !game.completed.includes(id)) || prior.inventory.some(id => !game.inventory.includes(id)) ||
        prior.buildings.some(id => !game.buildings.includes(id)) || game.xp < prior.xp || game.turn < prior.turn) throw new Error('Migration cannot remove earned history or possessions.');
  }
  const source = {game, records};
  const legacyAccess = storedAssessmentVersion < 10 ? deriveLegacyAccess(source, storedAssessmentVersion) : parseLegacyAccess(raw.legacyAccess, source);
  const externalWork = storedAssessmentVersion < 10 ? null : parseExternalWork(raw.externalWork);
  return { ...raw, assessmentVersion: ASSESSMENT_VERSION, game, records, legacyAccess, externalWork };
}

export function migrateMainSave(original) {
  const game = parseSave(original, LEGACY_IDS);
  const draftAssistance = Object.fromEntries(Object.keys(game.drafts).map(id => [id, true]));
  const envelope = { ...freshEnvelope(), game, draftAssistance, migration: { source: 'pipi-islands-v1', original } };
  return parseEnvelope(JSON.stringify(envelope));
}

export function assessmentStatus(envelope, id) {
  if (!getLesson(id)) throw new Error('Unknown lesson.');
  const attempts = envelope.records[id]?.attempts || [];
  const milestones = envelope.records[id]?.milestones;
  if (milestones?.assessmentVersion === evidenceVersionFor(id) && milestones.independent) return 'independent-practice';
  if (milestones?.assessmentVersion === evidenceVersionFor(id) && milestones.guided) return 'guided-practice';
  const passes = attempts.filter(attempt => attempt.passed && attempt.assessmentVersion === evidenceVersionFor(id));
  if (passes.some(attempt => !attempt.assisted)) return 'independent-practice';
  if (passes.length) return 'guided-practice';
  return envelope.game.completed.includes(id) ? 'needs-recheck' : attempts.length ? 'practice' : 'unobserved';
}

export function updateDraft(envelope, { kind, lessonId = null, code, assisted }) {
  if (!['lesson', 'shop'].includes(kind) || typeof code !== 'string' || code.length > 20000 || (assisted !== undefined && typeof assisted !== 'boolean') || (kind === 'lesson' && !getLesson(lessonId))) throw new Error('Invalid draft.');
  const next = structuredClone(envelope);
  if (kind === 'shop') next.game.shopDraft = code;
  else { next.game.drafts[lessonId] = code; if (assisted !== undefined) next.draftAssistance[lessonId] = assisted; }
  if (new TextEncoder().encode(JSON.stringify(next.game)).length > MAX_SAVE_BYTES) {
    const error = new Error('当前存档总量已达到 3 MiB 上限。请保留编辑器中的新稿，先导出备份再整理草稿。');
    error.name = 'DraftCapacityError';
    error.pendingDraft = Object.freeze({ kind, lessonId, code });
    throw error;
  }
  return parseEnvelope(JSON.stringify(next));
}

export function selectContext(envelope, { lessonId = LESSON_IDS[envelope.game.mission], activeCat = envelope.game.activeCat }) {
  if (!getLesson(lessonId) || !['pipi', 'tangyuan'].includes(activeCat)) throw new Error('Invalid game context.');
  const next = structuredClone(envelope);
  const mission = LESSON_IDS.indexOf(lessonId);
  if (next.game.mission !== mission || next.game.activeCat !== activeCat) next.revision++;
  next.game.mission = mission;
  next.game.activeCat = activeCat;
  return parseEnvelope(JSON.stringify(next));
}

export async function createSubmission(envelope, { kind, lessonId = null, code, requestId, generation, assisted = false, now, scene = 'normal' }) {
  if (typeof requestId !== 'string' || !requestId.length || requestId.length > 100 ||
      !Number.isSafeInteger(generation) || generation < 0 || !Number.isFinite(now) || now < 0 || typeof assisted !== 'boolean') throw new Error('Invalid submission identity.');
  const snapshot = parseEnvelope(JSON.stringify(envelope));
  const game = snapshot.game;
  if ((kind === 'lesson' && (game.drafts[lessonId] !== code || LESSON_IDS[game.mission] !== lessonId)) ||
      (kind === 'shop' && game.shopDraft !== code)) throw new Error('Submission must match the selected saved draft.');
  const request = buildWorkerRequest({ kind, lessonId, code, scene, player: { coins: game.coins, position: game.positions[game.activeCat] } });
  const sourceDigest = await codeDigest(code);
  const effectiveAssisted = assisted || (kind === 'lesson' && snapshot.draftAssistance[lessonId] === true);
  return Object.freeze({ containerAssessmentVersion:ASSESSMENT_VERSION, evidenceVersion:kind === 'lesson' ? evidenceVersionFor(lessonId) : null, request, sourceDigest, requestId, generation, assisted: effectiveAssisted, revision: snapshot.revision, activeCat: game.activeCat, deadline: now + runBudgetMs(request) });
}

export function acceptResult(envelope, submission, current, raw, { now, at }) {
  const request = submission.request;
  const storedDraft = request.kind === 'shop' ? envelope.game.shopDraft : envelope.game.drafts[request.lessonId];
  if (submission.containerAssessmentVersion !== ASSESSMENT_VERSION || (request.kind === 'lesson' && submission.evidenceVersion !== evidenceVersionFor(request.lessonId)) || !current || current.kind !== request.kind || !Number.isFinite(now) || now < 0 || now >= submission.deadline || current.requestId !== submission.requestId || current.generation !== submission.generation ||
      envelope.revision !== submission.revision || current.code !== request.code || storedDraft !== request.code || envelope.game.activeCat !== submission.activeCat ||
      (request.kind === 'lesson' && (current.lessonId !== request.lessonId || LESSON_IDS[envelope.game.mission] !== request.lessonId)) ||
      (['protocol', 'lifecycle', 'foundations'].includes(request.judgeKind) && current.scene !== request.scene)) return { kind: 'discarded', state: envelope, reward: 0 };
  if (!Number.isFinite(at) || at < 0) throw new Error('Invalid attempt timestamp.');
  let outcome;
  try { outcome = parseWorkerResult(raw, request, submission.sourceDigest); }
  catch (error) { return { kind: 'invalid-result', state: envelope, reward: 0, message: error.message }; }
  const next = structuredClone(envelope);
  let reward = 0;
  if (outcome.kind === 'success') {
    try {
      const result = transition(next.game, outcome.effects, request.kind === 'shop' ? { practice: true } : { passed: true, mission: getLesson(request.lessonId) });
      next.game = result.state;
      reward = result.reward;
    } catch (error) { return { kind: 'transaction-error', state: envelope, reward: 0, message: error.message }; }
  }
  if (request.kind === 'lesson') {
    const prior = next.records[request.lessonId];
    const attempts = prior?.attempts || [];
    if (attempts.some(attempt => attempt.id === submission.requestId)) return { kind: 'discarded', state: envelope, reward: 0 };
    const attempt = { id: submission.requestId, at, passed: outcome.kind === 'success', assisted: submission.assisted, assessmentVersion: evidenceVersionFor(request.lessonId), codeSha256: submission.sourceDigest };
    let milestones = prior?.milestones ? structuredClone(prior.milestones) : { assessmentVersion: evidenceVersionFor(request.lessonId), guided: null, independent: null };
    // A failed new-version attempt does not erase an old-version historical anchor.
    if (attempt.passed) {
      if (milestones.assessmentVersion !== evidenceVersionFor(request.lessonId)) milestones = {assessmentVersion:evidenceVersionFor(request.lessonId),guided:null,independent:null};
      milestones[attempt.assisted ? 'guided' : 'independent'] = { ...attempt };
    }
    next.records[request.lessonId] = { attempts: retainAttemptWindow(attempts, prior?.milestones, milestones, attempt), milestones };
  }
  next.revision++;
  return { ...outcome, state: parseEnvelope(JSON.stringify(next)), reward };
}
