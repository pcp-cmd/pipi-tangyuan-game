import {LESSONS, LESSON_IDS, ASSESSMENT_VERSION, evidenceVersionFor} from './contracts.mjs';
import {PREREQUISITE_RULE_DATA} from './prerequisite-rules.mjs';
import {hasRetainedCourseAccess} from './legacy-course-access.mjs';

export const ACCESS_POLICY_VERSION = 'course-prerequisites-v5-retained-access';
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const byId = new Map(LESSONS.map(lesson => [lesson.id, lesson]));
const freeze = value => {
  if (value && typeof value === 'object') { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
  return value;
};

// Validation is exported for graph-change regression tests, not as an access override.
export function validatePrerequisiteGraph(ids, rows) {
  if (!Array.isArray(ids) || new Set(ids).size !== ids.length || !Array.isArray(rows) || rows.length !== ids.length)
    throw new Error('Prerequisite graph must explicitly cover the trusted registry.');
  const graph = new Map();
  for (let index = 0; index < ids.length; index++) {
    const row = rows[index];
    if (!object(row) || row.id !== ids[index] || !Array.isArray(row.requires) || new Set(row.requires).size !== row.requires.length ||
        row.requires.some(id => !ids.includes(id) || id === row.id)) throw new Error('Invalid prerequisite identity, order or edge.');
    graph.set(row.id, [...row.requires]);
  }
  const ancestors = new Map(), visiting = new Set();
  function walk(id) {
    if (visiting.has(id)) throw new Error('Cyclic prerequisite graph.');
    if (ancestors.has(id)) return ancestors.get(id);
    visiting.add(id);
    const found = new Set();
    for (const prerequisite of graph.get(id)) { found.add(prerequisite); for (const earlier of walk(prerequisite)) found.add(earlier); }
    visiting.delete(id);
    const ordered = ids.filter(candidate => found.has(candidate));
    ancestors.set(id, ordered);
    return ordered;
  }
  for (const id of ids) walk(id);
  return Object.fromEntries(ids.map(id => [id, [...ancestors.get(id)]]));
}

const ancestorData = validatePrerequisiteGraph(LESSON_IDS, PREREQUISITE_RULE_DATA);
export const PREREQUISITE_RULES = freeze(structuredClone(PREREQUISITE_RULE_DATA));
export const PREREQUISITE_ANCESTORS = freeze(ancestorData);
const direct = new Map(PREREQUISITE_RULES.map(row => [row.id, row.requires]));
if (LESSON_IDS.length < 66 || PREREQUISITE_RULES[0].id !== 'first-steps') throw new Error('Access must preserve the original course registry prefix.');

const proofFields = ['id', 'at', 'passed', 'assisted', 'assessmentVersion', 'codeSha256'];
function currentProof(value, assisted, id) {
  return object(value) && Object.keys(value).length === proofFields.length && proofFields.every(key => Object.hasOwn(value, key)) &&
    typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 100 && Number.isFinite(value.at) && value.at >= 0 &&
    value.passed === true && value.assisted === assisted && value.assessmentVersion === evidenceVersionFor(id) &&
    typeof value.codeSha256 === 'string' && /^[a-f0-9]{64}$/.test(value.codeSha256);
}
function usableEnvelope(envelope) {
  return object(envelope) && envelope.assessmentVersion === ASSESSMENT_VERSION && object(envelope.records) &&
    object(envelope.game) && Array.isArray(envelope.game.completed);
}

// The caller supplies a parsed envelope. These strict local checks also fail closed
// for malformed proof shapes rather than coercing booleans or old-version records.
export function prerequisiteEvidence(envelope, id) {
  if (!byId.has(id)) throw new Error('Unknown prerequisite lesson.');
  if (!usableEnvelope(envelope)) return 'unavailable';
  const record = envelope.records[id], rewarded = envelope.game.completed.includes(id);
  if (!rewarded || !object(record)) return rewarded ? 'needs-recheck' : 'unobserved';
  const milestones = record.milestones;
  if (object(milestones) && milestones.assessmentVersion === evidenceVersionFor(id) && currentProof(milestones.independent, false, id)) return 'independent-practice';
  const attempts = Array.isArray(record.attempts) ? record.attempts : [];
  if (attempts.some(attempt => currentProof(attempt, false, id))) return 'independent-practice';
  if (object(milestones) && milestones.assessmentVersion === evidenceVersionFor(id) && currentProof(milestones.guided, true, id) || attempts.some(attempt => currentProof(attempt, true, id))) return 'guided-practice';
  return 'needs-recheck';
}

const unmeasuredKnowledge = freeze({
  'lifecycle-multi-resource': ['嵌套异常组与控制异常的解释、陌生资源的所有权判断'],
  'lifecycle-async-stream': ['异步生成器的独立解释与陌生资源迁移；新基础通过不等于全面掌握'],
  'lifecycle-bounded-map': ['异步 worker 的等待语义', 'TaskGroup 子任务取消边界', '异步任务失败时的所有权与收尾'],
});

export function accessOf(envelope, id) {
  const lesson = byId.get(id);
  if (!lesson) throw new Error('Unknown access target.');
  const available = usableEnvelope(envelope);
  const all = PREREQUISITE_ANCESTORS[id];
  const evidence = new Map(LESSON_IDS.map(key => [key, prerequisiteEvidence(envelope, key)]));
  const missing = all.filter(key => evidence.get(key) !== 'independent-practice');
  const describe = key => ({id:key, title:byId.get(key).title, evidence:evidence.get(key)});
  const ownEvidence = evidence.get(id);
  const currentIndependent = ownEvidence === 'independent-practice';
  const gateSatisfied = available && missing.length === 0;
  // Historical independent evidence permits revisiting only its own lesson.
  const record = envelope?.records?.[id];
  const historicalIndependent = Boolean(available && envelope.game.completed.includes(id) &&
    (record?.milestones?.independent?.passed === true || record?.attempts?.some(attempt => attempt.passed && !attempt.assisted)));
  const revisit = available && (currentIndependent || historicalIndependent) && !gateSatisfied;
  const retained = available && hasRetainedCourseAccess(envelope, id) && !gateSatisfied && !revisit;
  const nextSteps = missing.filter(key => PREREQUISITE_ANCESTORS[key].every(prerequisite => evidence.get(prerequisite) === 'independent-practice'));
  const state = !available ? 'unavailable' : gateSatisfied ? 'unlocked' : revisit ? 'revisit' : retained ? 'retained' : 'locked';
  let reason = !available ? '读取旅程后即可开始。' : gateSatisfied ? (all.length ? '准备好了，可以开始这份委托。' : '从这里开启旅程。') :
    '下一步先完成：' + nextSteps.slice(0, 3).map(key => byId.get(key).title).join('、') + (missing.length > nextSteps.slice(0, 3).length ? `。完成后会显示下一步。` : '。');
  if (revisit) reason = '曾经完成的记录已保留。可以复做本课，再沿手账补齐当前路线。';
  if (retained) reason = '这份旧委托可以继续。新的准备课也可随时回看，原来的草稿与记录都在。';
  return freeze({lessonId:id, policyVersion:ACCESS_POLICY_VERSION, assessmentVersion:evidenceVersionFor(id), containerAssessmentVersion:ASSESSMENT_VERSION, state,
    canInspect:true, canSelect:gateSatisfied || revisit || retained, canRun:gateSatisfied || revisit || retained,
    prerequisitesSatisfied:gateSatisfied, evidence:ownEvidence, currentIndependent,
    required:direct.get(id).map(describe), missingPrerequisites:missing.map(describe), nextSteps:nextSteps.map(describe),
    additionalKnowledgeUnmeasured:unmeasuredKnowledge[id] || [],
    reason, mastery:'not-assessed', transfer:'not-assessed'});
}

export function learningAccessSummary(envelope) {
  const rows = LESSON_IDS.map(id => accessOf(envelope, id));
  const independent = rows.filter(row => row.currentIndependent).length;
  return freeze({policyVersion:ACCESS_POLICY_VERSION, assessmentVersion:ASSESSMENT_VERSION, total:LESSON_IDS.length,
    accessible:rows.filter(row => row.canRun).length, locked:rows.filter(row => row.state === 'locked').length,
    currentIndependent:independent, guidedOnly:rows.filter(row => row.evidence === 'guided-practice').length,
    needsRecheck:rows.filter(row => row.evidence === 'needs-recheck').length,
    allCurrentIndependentPasses:independent === LESSON_IDS.length,
    mastery:'not-assessed', transfer:'not-assessed', delayedRetention:'not-assessed'});
}

export class LessonLockedError extends Error {
  constructor(access) { super(access.reason); this.name = 'LessonLockedError'; this.lessonId = access.lessonId; this.access = access; }
}
export function requireLessonAccess(envelope, id) {
  const access = accessOf(envelope, id);
  if (!access.canRun) throw new LessonLockedError(access);
  return access;
}
