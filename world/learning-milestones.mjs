import { LESSONS } from '../integration/contracts.mjs';
import { prerequisiteEvidence, PREREQUISITE_ANCESTORS } from '../integration/lesson-access.mjs';
import { PHYSICAL_SCENES } from './physical-scenes.mjs';
import { coursePresentation } from './course-presentation.mjs';
import { hasRetainedCourseAccess } from '../integration/legacy-course-access.mjs';

export const WORLD_LEARNING_POLICY = 'island-milestones-20261114-v1';
export const ISLAND_ORDER = Object.freeze(['harbor', 'market', 'workshop', 'archive', 'observatory', 'beacon', 'protocol']);
export const ISLAND_MILESTONES = Object.freeze([
  { islandId: 'market', title: '读懂条件，完成循环', requires: ['safe-buy', 'shells'] },
  { islandId: 'workshop', title: '交付一份完整订单', requires: ['market-checkout'] },
  { islandId: 'archive', title: '让对象守住自己的规则', requires: ['workshop-wallet'] },
  { islandId: 'observatory', title: '整理数据，算出可靠结果', requires: ['archive-distance'] },
  { islandId: 'beacon', title: '用测试与排错验证程序', requires: ['observatory-diagnose'] },
  { islandId: 'protocol', title: '完成有边界的工具流程', requires: ['beacon-budget'] },
].map(row => Object.freeze({ ...row, requires: Object.freeze(row.requires) })));

const lessons = new Map(LESSONS.map(lesson => [lesson.id, lesson]));

export function lessonIslandId(id) {
  const lesson = lessons.get(id);
  if (!lesson) throw new Error('Unknown lesson in world learning policy.');
  if (ISLAND_ORDER.includes(lesson.islandId)) return lesson.islandId;
  return PHYSICAL_SCENES[coursePresentation(id).primarySceneId]?.islandId || 'harbor';
}

function visitedIndex(physical) {
  const ids = Array.isArray(physical?.discovered) ? physical.discovered : [];
  return ids.reduce((highest, id) => {
    const scene = PHYSICAL_SCENES[id];
    if (!scene || scene.legacyPreview || id.startsWith('candidate.')) return highest;
    return Math.max(highest, ISLAND_ORDER.indexOf(scene.islandId));
  }, 0);
}

function historicalIndependent(envelope, id) {
  if (!envelope?.game?.completed?.includes(id)) return false;
  const record = envelope.records?.[id];
  const proofs = [...(Array.isArray(record?.attempts) ? record.attempts : []), record?.milestones?.independent];
  return proofs.some(proof => proof?.passed === true && proof.assisted === false &&
    typeof proof.id === 'string' && proof.id.length > 0 && Number.isFinite(proof.at) && proof.at >= 0 &&
    Number.isInteger(proof.assessmentVersion) && proof.assessmentVersion >= 0 && /^[a-f0-9]{64}$/.test(proof.codeSha256 || ''));
}

export function islandAccess({ islandId, envelope, physical }) {
  const index = ISLAND_ORDER.indexOf(islandId);
  if (index < 0) return Object.freeze({ available: false, reason: '这里还没有航线。', missing: [], nextSteps: [], basis: 'unknown-island' });
  if (index === 0) return Object.freeze({ available: true, reason: '', missing: [], nextSteps: [], basis: 'starting-island' });
  const visited = visitedIndex(physical);
  if (index <= visited) return Object.freeze({ available: true, reason: '', missing: [], nextSteps: [], basis: 'visited-route' });
  const needed = ISLAND_MILESTONES.slice(visited, index).flatMap(row => row.requires);
  const missingIds = [...new Set(needed)].filter(id => prerequisiteEvidence(envelope, id) !== 'independent-practice');
  const describe = id => Object.freeze({ id, title: lessons.get(id).title, evidence: prerequisiteEvidence(envelope, id) });
  const missing = missingIds.map(describe);
  const nextIds = [...new Set(missingIds.flatMap(id => [...PREREQUISITE_ANCESTORS[id], id]))]
    .filter(id => prerequisiteEvidence(envelope, id) !== 'independent-practice' &&
      PREREQUISITE_ANCESTORS[id].every(prerequisite => prerequisiteEvidence(envelope, prerequisite) === 'independent-practice'));
  const nextSteps = nextIds.map(describe);
  const reason = missing.length ? `先独立完成${nextSteps.slice(0, 2).map(item => `「${item.title}」`).join('、')}，再来乘船。` : '';
  return Object.freeze({ available: missing.length === 0, reason, missing: Object.freeze(missing), nextSteps: Object.freeze(nextSteps),
    basis: missing.length ? 'learning-milestone' : 'independent-milestones', policyVersion: WORLD_LEARNING_POLICY });
}

export function lessonIslandAccess({ lessonId, envelope, physical }) {
  const islandId = lessonIslandId(lessonId);
  const access = islandAccess({ islandId, envelope, physical });
  if (access.available) return Object.freeze({ ...access, islandId });
  if (historicalIndependent(envelope, lessonId)) return Object.freeze({ available: true, reason: '', missing: [], nextSteps: [],
    islandId, basis: 'historical-lesson-revisit', policyVersion: WORLD_LEARNING_POLICY });
  if (hasRetainedCourseAccess(envelope, lessonId)) return Object.freeze({ available: true, reason: '', missing: [], nextSteps: [],
    islandId, basis: 'retained-lesson-access', policyVersion: WORLD_LEARNING_POLICY });
  return Object.freeze({ ...access, islandId, reason: `这份委托随新航线开放。${access.reason}` });
}

export function voyageAccess({ destination, envelope, physical }) {
  return islandAccess({ islandId: destination?.islandId, envelope, physical });
}
