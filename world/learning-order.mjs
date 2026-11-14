import * as teaching from '../integration/course-learning.mjs';

const rank = new Map((teaching.LEARNING_PATH || teaching.COURSE_LEARNING.map(guide => guide.id)).map((id, index) => [id, index]));

export function orderedLearningLessons(lessons) {
  return [...lessons].sort((left, right) => (rank.get(left.id) ?? Infinity) - (rank.get(right.id) ?? Infinity));
}

export function learningOrdinal(lessons, id) {
  return orderedLearningLessons(lessons).findIndex(lesson => lesson.id === id) + 1;
}

export function nextLearningLesson(lessons, currentId) {
  const ordered = orderedLearningLessons(lessons);
  const index = ordered.findIndex(lesson => lesson.id === currentId);
  return index < 0 ? undefined : ordered[index + 1];
}
