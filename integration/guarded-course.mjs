import {selectContext, createSubmission, acceptResult} from './state.mjs';
import {ACCESS_POLICY_VERSION, PREREQUISITE_ANCESTORS, accessOf, prerequisiteEvidence, requireLessonAccess} from './lesson-access.mjs';
import {LESSON_IDS} from './contracts.mjs';

// Application entry points. The lower-level state functions remain available to
// isolated judge/calibration tests; the world must use these guarded operations.
export function selectAccessibleContext(envelope, options = {}) {
  const lessonId = options.lessonId ?? LESSON_IDS[envelope.game.mission];
  requireLessonAccess(envelope, lessonId);
  return selectContext(envelope, {...options, lessonId});
}

export async function createAccessibleSubmission(envelope, options) {
  if (options.kind === 'lesson') requireLessonAccess(envelope, options.lessonId);
  const satisfiedPrerequisiteIds = options.kind === 'lesson' ? PREREQUISITE_ANCESTORS[options.lessonId].filter(id => prerequisiteEvidence(envelope, id) === 'independent-practice') : [];
  const token = await createSubmission(envelope, options);
  if (options.kind === 'lesson') requireLessonAccess(envelope, options.lessonId);
  if (!satisfiedPrerequisiteIds.every(id => prerequisiteEvidence(envelope, id) === 'independent-practice')) throw new Error('提交期间先修记录已改变，请重新检查准入。');
  return Object.freeze({...token, accessPolicyVersion:ACCESS_POLICY_VERSION, satisfiedPrerequisiteIds:Object.freeze(satisfiedPrerequisiteIds)});
}

export function acceptAccessibleResult(envelope, submission, current, raw, timing) {
  if (submission.request.kind === 'lesson') {
    const access = accessOf(envelope, submission.request.lessonId);
    const retainedPrerequisites = Array.isArray(submission.satisfiedPrerequisiteIds) && submission.satisfiedPrerequisiteIds.every(id => prerequisiteEvidence(envelope, id) === 'independent-practice');
    if (submission.accessPolicyVersion !== ACCESS_POLICY_VERSION || !access.canRun || !retainedPrerequisites)
      return {kind:'access-denied', state:envelope, reward:0, access,
        message:submission.accessPolicyVersion !== ACCESS_POLICY_VERSION ? '访问策略已经改变，请重新进入课程并提交。' : !retainedPrerequisites ? '运行期间先修记录已改变，请重新检查准入后提交。' : access.reason};
  }
  return acceptResult(envelope, submission, current, raw, timing);
}
