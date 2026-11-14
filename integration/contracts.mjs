import { EXTENSION_LESSONS, EXTENSION_IDS } from './extension-data.mjs';
import { INDEPENDENT_PRACTICE_IDS } from './independent-practice-data.mjs';
import { AE26_BRIDGE_IDS } from './ae26-bridge-data.mjs';
import { LESSON_DATA, PROTOCOL_SCHEMAS } from './data.mjs';
import {FOUNDATION_LESSONS, FOUNDATION_IDS, foundationSchema, foundationRequestFields, parseFoundationResult} from './foundation-route.mjs';
import {LIFECYCLE_LESSONS, lifecycleSchema, lifecycleRequestFields, parseLifecycleResult} from './lifecycle-route.mjs';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value, limit) => typeof value === 'string' && value.length <= limit;
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export const LESSONS = freeze(structuredClone([...LESSON_DATA, ...LIFECYCLE_LESSONS, ...FOUNDATION_LESSONS, ...EXTENSION_LESSONS]));
export const LESSON_IDS = Object.freeze(LESSONS.map(lesson => lesson.id));
export const LEGACY_IDS = Object.freeze(LESSON_IDS.slice(0, 18));
export const ASSESSMENT_VERSION = 10;
export const REGISTRY_PREFIX_BY_VERSION = Object.freeze({4: 60, 5: 63, 6: 66, 7: 66, 8: 82, 9: 94, 10: LESSON_IDS.length});
const schemas = freeze(structuredClone(PROTOCOL_SCHEMAS));
const byId = new Map(LESSONS.map(lesson => [lesson.id, lesson]));
export function evidenceVersionFor(id) { if (!byId.has(id)) throw new Error('Unknown evidence lesson.'); return AE26_BRIDGE_IDS.includes(id) ? 10 : INDEPENDENT_PRACTICE_IDS.includes(id) ? 9 : 8; }
const historicalV6Ids = new Set(['lifecycle-async-stream','lifecycle-bounded-map','harbor-manifest','workshop-closure','workshop-defaults','workshop-iterable','workshop-result','invalid-input','archive-json','workshop-composition','harbor-quantity','harbor-route','observatory-binary',...FOUNDATION_IDS]);
export function isHistoricalEvidenceVersion(id, version) {
  if (!Number.isInteger(version) || version < 0 || version > evidenceVersionFor(id)) return false;
  if (AE26_BRIDGE_IDS.includes(id)) return version === 10;
  if (INDEPENDENT_PRACTICE_IDS.includes(id)) return version === 9;
  if (version === 8) return true;
  if (EXTENSION_IDS.includes(id)) return false;
  if (FOUNDATION_IDS.includes(id)) return version === 6;
  const historicalCeiling = ['harbor-quantity','harbor-route'].includes(id) ? 7 : historicalV6Ids.has(id) ? 6 : 5;
  return version <= historicalCeiling;
}


if (LESSON_DATA.length !== 60 || LESSONS.length !== 66 + EXTENSION_IDS.length || byId.size !== LESSONS.length) throw new Error('Expected the preserved 66-course prefix and unique extension IDs.');
for (const lesson of LESSONS) {
  if (!Number.isSafeInteger(lesson.reward) || lesson.reward < 0 || !Number.isSafeInteger(lesson.xp) || lesson.xp < 0) throw new Error('Invalid lesson reward.');
  if (lesson.judgeKind === 'foundations') {
    foundationSchema(lesson.foundationTask);
  } else if (lesson.judgeKind === 'lifecycle') {
    lifecycleSchema(lesson.lifecycleTask);
  } else if (lesson.judgeKind === 'protocol') {
    if (!Array.isArray(schemas[lesson.protocolTask]) || !schemas[lesson.protocolTask].length) throw new Error('Missing protocol contract.');
  } else if (lesson.judgeKind || !Array.isArray(lesson.checks) || !lesson.checks.length) throw new Error('Missing base lesson contract.');
}

export const getLesson = id => byId.get(id) || null;
export function expectedLabels(request) {
  if (request.kind === 'shop') return [];
  const lesson = getLesson(request.lessonId);
  if (!lesson) throw new Error('Unknown lesson.');
  if (lesson.judgeKind === 'foundations') return foundationSchema(lesson.foundationTask).map(check => check.label);
  if (lesson.judgeKind === 'lifecycle') return lifecycleSchema(lesson.lifecycleTask).map(check => check.label);
  return lesson.judgeKind === 'protocol' ? [...schemas[lesson.protocolTask]] : lesson.checks.map(check => check[0]);
}

export function buildWorkerRequest({ kind, lessonId = null, code, player, scene = 'normal' }) {
  if (!['lesson', 'shop'].includes(kind) || !text(code, 20000) || !object(player) ||
      !Number.isSafeInteger(player.coins) || player.coins < 0 || player.coins > 100000 ||
      !Number.isInteger(player.position) || player.position < 0 || player.position >= 12) throw new Error('Invalid run request.');
  const state = { coins: player.coins, position: player.position };
  if (kind === 'shop') {
    if (lessonId !== null) throw new Error('Shop requests cannot name a lesson.');
    return freeze({ kind, lessonId: null, code, state, judgeKind: 'shop', checks: [] });
  }
  const lesson = getLesson(lessonId);
  if (!lesson) throw new Error('Unknown lesson.');
  if (lesson.judgeKind === 'foundations') return freeze({kind, lessonId, code, state, ...foundationRequestFields(lessonId, scene)});
  if (lesson.judgeKind === 'lifecycle') return freeze({kind, lessonId, code, state, ...lifecycleRequestFields(lessonId, scene)});
  if (lesson.judgeKind === 'protocol') {
    if (!['normal', 'failure', 'edge'].includes(scene)) throw new Error('Unknown protocol scene.');
    return freeze({ kind, lessonId, code, state, judgeKind: 'protocol', protocolTask: lesson.protocolTask, scene, checks: [] });
  }
  return freeze({ kind, lessonId, code, state, judgeKind: 'base', checks: lesson.checks.map(pair => [...pair]) });
}

export async function codeDigest(code) {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function parseWorkerResult(raw, request, sourceDigest) {
  if (request.judgeKind === 'foundations') return parseFoundationResult(raw, request, sourceDigest);
  if (request.judgeKind === 'lifecycle') return parseLifecycleResult(raw, request, sourceDigest);
  const expected = expectedLabels(request);
  if (!object(raw) || typeof raw.ok !== 'boolean' || typeof raw.passed !== 'boolean' ||
      !text(raw.stdout, 16000) || Array.from(raw.stdout).length > 8000 ||
      !Array.isArray(raw.effects) || raw.effects.length > 32 ||
      !/^[a-f0-9]{64}$/.test(sourceDigest) || raw.codeSha256 !== sourceDigest) throw new Error('Invalid result envelope or source digest.');
  if (Object.hasOwn(raw, 'outputTruncated') && (!['base', 'shop'].includes(request.judgeKind) || typeof raw.outputTruncated !== 'boolean')) throw new Error('Invalid output truncation flag.');
  const outputNotice = raw.outputTruncated === true ? { outputTruncated: true } : {};
  if (raw.ok && Object.hasOwn(raw, 'error')) throw new Error('Successful execution cannot contain an error field.');
  if (request.kind === 'lesson' && expected.length === 0) throw new Error('Lessons require checks.');
  const rows = raw.checks ?? (raw.ok ? null : []);
  if (!Array.isArray(rows) || rows.length > expected.length || (raw.ok && rows.length !== expected.length)) throw new Error('Unexpected check count.');
  const checks = rows.map((row, index) => {
    if (!object(row) || row.label !== expected[index] || typeof row.passed !== 'boolean' || !text(row.detail, 1000)) throw new Error('Unexpected check shape or label.');
    return { label: expected[index], passed: row.passed, detail: row.detail };
  });
  const worldEvents = raw.worldEvents ?? [];
  if (!Array.isArray(worldEvents) || worldEvents.length > 24 || worldEvents.some(event => !text(event, 1000))) throw new Error('Invalid world events.');
  if (!raw.ok) {
    if (raw.passed || raw.effects.length || !object(raw.error) || !text(raw.error.name, 100) || !text(raw.error.message, 2000) ||
        (raw.error.line != null && (!Number.isInteger(raw.error.line) || raw.error.line < 1 || raw.error.line > 20001))) throw new Error('Invalid Python error.');
    return { kind: 'python-error', stdout: raw.stdout, ...outputNotice, checks, worldEvents, error: { name: raw.error.name, message: raw.error.message, line: raw.error.line ?? null } };
  }
  if (request.judgeKind === 'protocol' && (raw.protocolTask !== request.protocolTask || raw.effects.length)) throw new Error('Protocol task mismatch or unexpected game effects.');
  const passed = checks.every(check => check.passed);
  if (raw.passed !== passed) throw new Error('Inconsistent pass result.');
  const effects = raw.effects.map(effect => {
    if (!object(effect)) throw new Error('Invalid effect.');
    if (effect.type === 'move' && Number.isInteger(effect.steps)) return { type: 'move', steps: effect.steps };
    if (effect.type === 'buy' && text(effect.item, 40)) return { type: 'buy', item: effect.item };
    throw new Error('Unknown effect.');
  });
  return passed ? { kind: 'success', stdout: raw.stdout, ...outputNotice, checks, worldEvents, effects } : { kind: 'incorrect', stdout: raw.stdout, ...outputNotice, checks, worldEvents };
}
