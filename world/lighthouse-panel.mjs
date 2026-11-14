import { courseCardView, courseReviewView } from './course-presentation.mjs';
import { evidenceCompatibility } from './learning-history.mjs';
import { orderedLearningLessons, learningOrdinal } from './learning-order.mjs';

const el = (doc, tag, cls, text) => {
  const node = doc.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};
const dateText = at => {
  const date = new Date(at);
  return Number.isFinite(date.getTime()) ? date.toLocaleString('zh-CN', { hour12: false }) : '时间未记录';
};

export function mountLighthousePanel({ root, lessons, session, latestResult, onVerify }) {
  const doc = root.ownerDocument;
  const list = root.querySelector('#reviewCourses'), detail = root.querySelector('#reviewDetail');
  const filter = root.querySelector('#reviewFilter'), search = root.querySelector('#reviewSearch');
  let selectedId = lessons[0].id, renderedId = null;
  function renderDetail() {
    if (renderedId !== selectedId) { detail.scrollTop = 0; renderedId = selectedId; }
    if (!selectedId) { detail.replaceChildren(el(doc, 'p', 'scope-note', '当前筛选没有课程。调整筛选后，再选择一项验证。')); return; }
    const review = courseReviewView(session, selectedId, latestResult());
    const { course, access, status, draft, history, currentResult } = review;
    detail.replaceChildren();
    const head = el(doc, 'div', 'review-course-heading');
    const art = el(doc, 'img', 'course-context-art'); art.src = course.contextArt.src; art.alt = course.contextArt.alt;
    const text = el(doc, 'div'); text.append(el(doc, 'span', 'eyebrow', `验证记录 · ${String(learningOrdinal(lessons, course.id)).padStart(2, '0')} / ${lessons.length}`), el(doc, 'h3', '', course.title), el(doc, 'p', 'review-status', status.label));
    head.append(art, text); detail.append(head, el(doc, 'p', 'review-purpose', course.verificationPrompt));
    const criteria = el(doc, 'section', 'review-criteria');
    criteria.append(el(doc, 'h4', '', '本课检查'));
    const checks = el(doc, 'ul');
    for (const label of review.checkLabels) checks.append(el(doc, 'li', '', label));
    criteria.append(checks); detail.append(criteria);
    const actions = el(doc, 'div', 'review-actions');
    let scene = null;
    if (review.sceneOptions.length) {
      const label = el(doc, 'label', 'course-select', '验证情境');
      scene = el(doc, 'select'); scene.id = 'reviewScenario';
      for (const option of review.sceneOptions) { const item = el(doc, 'option', '', option.label); item.value = option.value; scene.append(item); }
      label.append(scene); actions.append(label);
    }
    const verify = el(doc, 'button', 'primary-button', draft.exists ? '验证这份草稿' : '打开验证台'); verify.type = 'button'; verify.id = 'verifySelectedCourse'; verify.disabled = !access.canRun;
    verify.addEventListener('click', () => { void onVerify(selectedId, scene?.value || 'normal', verify); });
    actions.append(verify); detail.append(actions);
    if (!access.canRun) detail.append(el(doc, 'p', 'scope-note', access.reason));
    detail.append(el(doc, 'p', 'scope-note', draft.exists ? `已存草稿 · ${draft.length} 字${draft.assisted ? ' · 含辅助记录' : ''}` : '尚未保存草稿；打开后可编写并实际运行。'));
    if (currentResult) {
      const current = el(doc, 'section', 'review-current-result');
      current.append(el(doc, 'h4', '', '本次验证'), el(doc, 'p', '', currentResult.kind === 'success' ? '本次检查通过' : currentResult.kind === 'python-error' ? 'Python 运行报错' : '本次检查未通过'));
      const output = el(doc, 'pre', '', currentResult.stdout || '（本次没有输出）'); current.append(output);
      const rows = el(doc, 'ul');
      for (const check of currentResult.checks) rows.append(el(doc, 'li', check.passed ? 'passed' : 'failed', `${check.passed ? '✓' : '○'} ${check.label}`));
      current.append(rows);
      if (!currentResult.saved) current.append(el(doc, 'p', 'scope-note', '本次结果尚未确认保存。请先在手账导出完整旅程，再重试保存。'));
      if (currentResult.error) current.append(el(doc, 'p', '', `${currentResult.error.name || 'PythonError'}：${currentResult.error.message || ''}`));
      if (currentResult.outputTruncated) current.append(el(doc, 'p', 'scope-note', '本次输出已截断。'));
      detail.append(current);
    }
    const records = el(doc, 'section', 'review-records');
    records.append(el(doc, 'h4', '', `近期提交 · ${history.length}`));
    if (!history.length) records.append(el(doc, 'p', 'scope-note', '暂无可显示的近期提交记录。保留的通过凭据与已有完成进度仍分别记录。'));
    const timeline = el(doc, 'ol', 'review-timeline');
    for (const attempt of history) {
      const row = el(doc, 'li');
      row.append(el(doc, 'strong', '', `${attempt.passed ? '通过' : '未通过'} · ${attempt.assisted ? '含辅助' : '无辅助标记'}`), el(doc, 'time', '', dateText(attempt.at)), el(doc, 'small', '', evidenceCompatibility(selectedId, attempt.evidenceVersion)?.versionLabel || (attempt.currentVersion ? '本版检查' : `历史检查 · ${attempt.evidenceVersion}`)));
      const more = el(doc, 'details'); more.append(el(doc, 'summary', '', '提交凭据'), el(doc, 'code', '', attempt.codeSha256 || '未记录代码摘要')); row.append(more); timeline.append(row);
    }
    records.append(timeline);
    const retained = Object.entries(review.milestones).filter(([, attempt]) => attempt);
    if (retained.length) {
      const milestones = el(doc, 'details', 'review-history-note'); milestones.append(el(doc, 'summary', '', '保留的通过凭据'));
      const rows = el(doc, 'ul', 'review-timeline');
      for (const [kind, attempt] of retained) {
        const row = el(doc, 'li');
        row.append(el(doc, 'strong', '', kind === 'guided' ? '含辅助通过' : '无辅助标记通过'), el(doc, 'time', '', dateText(attempt.at)), el(doc, 'small', '', evidenceCompatibility(selectedId, attempt.evidenceVersion)?.versionLabel || (attempt.currentVersion ? '本版检查' : `历史检查 · ${attempt.evidenceVersion}`)), el(doc, 'code', '', attempt.codeSha256 || '未记录代码摘要'));
        rows.append(row);
      }
      milestones.append(rows); records.append(milestones);
    }
    const compatibility = evidenceCompatibility(selectedId, course.evidenceVersion);
    if (compatibility) { const notice = el(doc, 'details', 'review-history-note'); notice.append(el(doc, 'summary', '', '历史证据说明'), el(doc, 'p', 'scope-note', compatibility.notice)); records.append(notice); }
    const note = el(doc, 'details', 'review-history-note'); note.append(el(doc, 'summary', '', '记录范围'), el(doc, 'p', 'scope-note', review.historyNotice)); records.append(note); detail.append(records);
  }
  function render({ resetSelection = false } = {}) {
    if (resetSelection) selectedId = lessons[session.snapshot().game.mission]?.id || selectedId;
    const query = search.value.trim().toLocaleLowerCase();
    const views = orderedLearningLessons(lessons).map(lesson => courseCardView(session, lesson.id, { mode: 'verify' }));
    const matches = views.filter(item => {
      if (query && !`${item.title} ${item.topic}`.toLocaleLowerCase().includes(query)) return false;
      if (filter.value === 'failed') return item.lastAttempt?.passed === false;
      if (filter.value === 'guided') return item.status.key === 'guided-practice';
      if (filter.value === 'recheck') return item.status.key === 'needs-recheck';
      if (filter.value === 'ready') return item.access.canRun;
      return true;
    });
    if (!matches.some(item => item.id === selectedId)) selectedId = matches[0]?.id || null;
    root.querySelector('#reviewCount').textContent = `${matches.length} / ${lessons.length} 课`;
    list.replaceChildren();
    for (const item of matches) {
      const row = el(doc, 'li'), button = el(doc, 'button', 'review-course'); button.type = 'button'; button.dataset.reviewLesson = item.id; button.setAttribute('aria-pressed', String(item.id === selectedId));
      const art = el(doc, 'img', 'course-context-art'); art.src = item.contextArt.src; art.alt = ''; art.loading = 'lazy';
      const copy = el(doc, 'span'); copy.append(el(doc, 'strong', '', `${String(learningOrdinal(lessons, item.id)).padStart(2, '0')} · ${item.title}`), el(doc, 'small', '', `${item.status.label} · ${item.accessLabel}`)); button.append(art, copy);
      button.addEventListener('click', () => { selectedId = item.id; render(); }); row.append(button); list.append(row);
    }
    if (!matches.length) list.append(el(doc, 'li', 'scope-note', '没有符合条件的记录。'));
    renderDetail();
  }
  filter.addEventListener('change', () => render()); search.addEventListener('input', () => render());
  return Object.freeze({ render });
}
