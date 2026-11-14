import {LIFECYCLE_LESSON_DATA, LIFECYCLE_SCHEMAS, LIFECYCLE_CONTRACT_DIGEST} from './lifecycle-data.mjs';

function freeze(value) {
  if (value && typeof value === 'object') { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
  return value;
}
const lessons = freeze(structuredClone(LIFECYCLE_LESSON_DATA));
const schemas = freeze(structuredClone(LIFECYCLE_SCHEMAS));
const byId = new Map(lessons.map(lesson => [lesson.id, lesson]));
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value, limit) => typeof value === 'string' && value.length <= limit;
const sha256 = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

export const LIFECYCLE_LESSONS = lessons;
export const LIFECYCLE_IDS = Object.freeze(lessons.map(lesson => lesson.id));
export {LIFECYCLE_CONTRACT_DIGEST};
export function lifecycleSchema(task) {
  if (!Object.hasOwn(schemas, task)) throw new Error('Unknown lifecycle task.');
  return schemas[task];
}
export function lifecycleRequestFields(lessonId, scene = 'normal') {
  const lesson = byId.get(lessonId);
  if (!lesson || !['normal', 'failure', 'cancel'].includes(scene)) throw new Error('Unknown lifecycle lesson or scene.');
  return Object.freeze({judgeKind:'lifecycle', lifecycleTask:lesson.lifecycleTask,
    lifecycleContractDigest:LIFECYCLE_CONTRACT_DIGEST, scene, checks:Object.freeze([])});
}

// A caller cannot extend an old route's budget by passing lifecycle flags.
export function runBudgetMs(request) {
  if (!object(request)) throw new Error('Missing trusted run request.');
  if (request.judgeKind === 'lifecycle') {
    const expected = lifecycleRequestFields(request.lessonId, request.scene);
    if (request.kind !== 'lesson' || request.lifecycleTask !== expected.lifecycleTask ||
        request.lifecycleContractDigest !== expected.lifecycleContractDigest) throw new Error('Mismatched lifecycle budget request.');
    return 25000;
  }
  if (!['base', 'protocol', 'shop'].includes(request.judgeKind) || byId.has(request.lessonId)) throw new Error('Unknown or mismatched judge route.');
  return 6000;
}

export function parseLifecycleResult(raw, request, sourceDigest) {
  const expectedRequest = lifecycleRequestFields(request.lessonId, request.scene);
  const expected = lifecycleSchema(expectedRequest.lifecycleTask);
  if (request.kind !== 'lesson' || request.judgeKind !== 'lifecycle' ||
      request.lifecycleTask !== expectedRequest.lifecycleTask || request.lifecycleContractDigest !== LIFECYCLE_CONTRACT_DIGEST ||
      !object(raw) || typeof raw.ok !== 'boolean' || typeof raw.passed !== 'boolean' ||
      (raw.ok && Object.hasOwn(raw, 'error')) ||
      !sha256(sourceDigest) || raw.codeSha256 !== sourceDigest ||
      raw.lifecycleTask !== expectedRequest.lifecycleTask || raw.lifecycleContractDigest !== LIFECYCLE_CONTRACT_DIGEST ||
      raw.expectedChecks !== expected.length || !text(raw.stdout, 12000) || Array.from(raw.stdout).length > 6000 ||
      !Array.isArray(raw.effects) || raw.effects.length !== 0) throw new Error('Invalid lifecycle envelope, contract, source or effects.');

  const rows = raw.checks;
  if (!Array.isArray(rows) || rows.length > expected.length || (raw.ok && rows.length !== expected.length)) throw new Error('Unexpected lifecycle check count.');
  const checks = rows.map((row, index) => {
    if (!object(row) || row.id !== expected[index].id || row.label !== expected[index].label ||
        typeof row.passed !== 'boolean' || !text(row.detail, 2400) || Array.from(row.detail).length > 1200) throw new Error('Unexpected lifecycle check identity, order or shape.');
    return {id:expected[index].id, label:expected[index].label, passed:row.passed, detail:row.detail};
  });
  const worldEvents = raw.worldEvents;
  if (!Array.isArray(worldEvents) || worldEvents.length > 36 ||
      worldEvents.some(event => !text(event, 2000) || Array.from(event).length > 1000)) throw new Error('Invalid lifecycle world events.');
  if (!raw.ok) {
    if (raw.passed || !object(raw.error) || !text(raw.error.name, 100) || !text(raw.error.message, 2000) ||
        (raw.error.line != null && (!Number.isInteger(raw.error.line) || raw.error.line < 1 || raw.error.line > 20001))) throw new Error('Invalid lifecycle Python error.');
    return {kind:'python-error', stdout:raw.stdout, checks, worldEvents,
      error:{name:raw.error.name, message:raw.error.message, line:raw.error.line ?? null}};
  }
  const passed = checks.every(check => check.passed);
  if (raw.passed !== passed) throw new Error('Inconsistent lifecycle pass proof.');
  return passed ? {kind:'success', stdout:raw.stdout, checks, worldEvents, effects:[]} :
    {kind:'incorrect', stdout:raw.stdout, checks, worldEvents};
}
