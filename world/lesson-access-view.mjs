// This presentation layer never creates evidence, selects a lesson or edits a draft.
import { nextLearningLesson } from './learning-order.mjs';
export function accessLabel(access) {
  if (access.worldAccess?.available === false) return '航线未开放';
  return ({unlocked:'可以开始',revisit:'可以复练',retained:'可以继续',locked:'先学这些',unavailable:'恢复存档后继续'})[access.state] || '稍后再试';
}
export function lessonAccessPresentation(lesson, access) {
  if (lesson.id !== access.lessonId) throw new Error('Lesson/access identity mismatch.');
  return Object.freeze({label:accessLabel(access),canInspect:access.canInspect===true,canStart:access.canSelect===true,
    action:access.canSelect ? access.currentIndependent ? '再练一次' : '开始挑战' : '先看看内容',
    description:lesson.description,reason:access.reason,boundary:lesson.boundary || '',
    nextSteps:access.nextSteps.map(row=>({id:row.id,title:row.title})),
    unmeasured:[...access.additionalKnowledgeUnmeasured]});
}
export function accessSummaryCopy(summary) {
  return `可开始 ${summary.accessible} / ${summary.total} · 独立提交 ${summary.currentIndependent} · 跟做 ${summary.guidedOnly}`;
}

// Call before incrementing navigation, cancelling a run, flushing or reading the editor.
export function allowLessonIntent(session, lessonId, showReason) {
  const access=session.accessOf(lessonId);
  if (!access.canSelect) { showReason(access.reason); return false; }
  return true;
}

export function appendAccessDetails(document, article, lesson, access, choosePrerequisite) {
  const copy=lessonAccessPresentation(lesson,access);
  const details=document.createElement('details');details.className='lesson-access-details';
  const summary=document.createElement('summary');summary.textContent='这次学什么';details.append(summary);
  for(const text of [copy.description,copy.boundary,copy.reason]){
    if(!text)continue;const paragraph=document.createElement('p');paragraph.textContent=text;details.append(paragraph);
  }
  if(copy.unmeasured.length){const note=document.createElement('p');note.className='scope-note';note.textContent=`练习重点：${copy.unmeasured.join('、')}。`;details.append(note);}
  if(copy.nextSteps.length){
    const list=document.createElement('ul');
    for(const next of copy.nextSteps){const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.className='text-button';button.textContent=`先练：${next.title}`;button.dataset.prerequisite=next.id;button.addEventListener('click',()=>choosePrerequisite(next.id,button));li.append(button);list.append(li);}
    details.append(list);
  }
  article.append(details);return details;
}

// Re-evaluate on explicit activation; this is guidance, never an access grant.
export function successContinuation(session, lessons, index) {
  const next = nextLearningLesson(lessons, lessons[index]?.id);
  if (!next) return { label: '查看冒险手账', detail: '', index: null };
  const access = session.accessOf(next.id);
  if (access.canSelect) return { label: '下一个挑战', detail: '', index: lessons.findIndex(lesson => lesson.id === next.id) };
  return { label: '去手账看看', index: null,
    detail: `接下来是「${next.title}」。${access.reason}` };
}
