import {ASSESSMENT_VERSION, LESSON_IDS} from './contracts.mjs';
import {ACCESS_POLICY_VERSION, PREREQUISITE_ANCESTORS, prerequisiteEvidence} from './lesson-access.mjs';

export function classroomEvidence(envelope) {
  if (!envelope) return null;
  const evidence = new Map(LESSON_IDS.map(id => [id, prerequisiteEvidence(envelope, id)]));
  if ([...evidence.values()].includes('unavailable')) return null;
  const count = kind => [...evidence.values()].filter(value => value === kind).length;
  return Object.freeze({currentIndependent: count('independent-practice'), guidedOnly: count('guided-practice'),
    needsRecheck: count('needs-recheck'),
    nextLessonId: LESSON_IDS.find(id => evidence.get(id) !== 'independent-practice' &&
      PREREQUISITE_ANCESTORS[id].every(prerequisite => evidence.get(prerequisite) === 'independent-practice')) ?? null});
}

export function classroomGraduationView({current, saved, loadedValid, disposed, authorityBlocked,
  status, storeStatus, pendingWrites, dirty}) {
  const total = LESSON_IDS.length;
  const currentComplete = current?.currentIndependent === total;
  const savedComplete = saved?.currentIndependent === total;
  const readable = ['saved', 'saving', 'pending', 'idle'];
  let state;
  if (disposed) state = 'unavailable';
  else if (authorityBlocked) state = 'needs-confirmation';
  else if (!loadedValid) state = 'unavailable';
  else if (currentComplete && !savedComplete) state = 'pending-save';
  else if (!readable.includes(status) || !readable.includes(storeStatus)) state = 'needs-confirmation';
  else if (savedComplete) state = 'earned';
  else state = 'in-progress';
  return Object.freeze({state, title: '海神大使', scope: 'classroom', total,
    currentIndependent: current?.currentIndependent ?? 0, savedIndependent: saved?.currentIndependent ?? null,
    guidedOnly: current?.guidedOnly ?? 0, needsRecheck: current?.needsRecheck ?? 0,
    assessmentVersion: ASSESSMENT_VERSION, policyVersion: ACCESS_POLICY_VERSION,
    nextLessonId: loadedValid && !disposed && !authorityBlocked ? current?.nextLessonId ?? null : null,
    canRetry: state === 'pending-save' && pendingWrites === 0 && !authorityBlocked,
    pendingSave: pendingWrites > 0 || dirty,
    mastery: 'not-assessed', transfer: 'not-assessed', engineeringReview: 'separate'});
}
