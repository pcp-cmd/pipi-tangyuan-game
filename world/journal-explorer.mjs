import { createCourseThumbnails } from './course-thumbnails.mjs';
import { describeLearningHistory, journalSummary, filterJournalLessons } from './learning-history.mjs';
import { accessLabel, appendAccessDetails } from './lesson-access-view.mjs';
import { coursePresentation } from './course-presentation.mjs';
import { orderedLearningLessons, learningOrdinal } from './learning-order.mjs';
import { mountCourseArticle } from './generated/course-article.mjs';
import { buildCourseRow, wrapCurrentCompatibilityNote } from './generated/journal-course-row.mjs';

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const attemptDate = value => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return { text: '时间不可显示', iso: null };
  return { text: new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date), iso: date.toISOString() };
};

export function createJournalExplorer({ lessons, assessmentVersion, evidenceVersionFor = () => assessmentVersion, session, groupOf, selectedGroup, chooseLesson, elements, isVisible = () => true, describeStart = () => false, onNavigationChange = () => {}, thumbnails = createCourseThumbnails({ document }) }) {
  const { list, search, filter, count, summary, current, clear, empty, notice } = elements;
  const cards = new Map();
  let currentArtId = null, currentThumbnail = null;
  let pendingSelection = false;
  let pendingOpener = null, startNodes = null;
  const statusOf = id => session.learningStatus(id);
  const canOpen = (id, view = session.snapshot()) => view.loadedValid && !view.selecting &&
    (lessons[view.game.mission].id === id || session.accessOf(id).canSelect);
  function setNavigationBusy(value) {
    pendingSelection = value;
    list.setAttribute('aria-busy', String(value));
    const view = session.snapshot();
    for (const button of [...list.querySelectorAll('[data-lesson]'), ...current.querySelectorAll('[data-resume-lesson]')]) {
      button.disabled = value || view.selecting || (!button.dataset.previewLesson && !canOpen(button.dataset.lesson || button.dataset.resumeLesson));
    }
    for (const button of list.querySelectorAll('[data-prerequisite]')) {
      button.disabled = value || view.selecting || !view.loadedValid || !session.accessOf(button.dataset.prerequisite).canSelect;
    }
  }

  function coursePreview(lesson) {
    const preview = element('details', 'course-preview');
    preview.append(element('summary', '', '课程内容'));
    function populate() {
      if (preview.dataset.loaded) return;
      preview.dataset.loaded = 'true';
      const body = element('div', 'course-preview-content');
      const explanation = element('div', 'knowledge-reader');
      body.append(explanation, element('h5', '', '工作台任务'), element('p', '', lesson.description));
      preview.append(body);
      mountCourseArticle({ root: explanation, lessonId: lesson.id });
    }
    preview.addEventListener('toggle', () => { if (preview.open) populate(); });
    return { node: preview, open() { populate(); preview.open = true; } };
  }

  async function navigate(index, opener) {
    if (pendingSelection) return;
    setNavigationBusy(true);
    notice.textContent = '正在确认草稿，再打开这项实践…';
    const priorText = opener.textContent;
    pendingOpener = opener;
    opener.disabled = true; opener.textContent = '正在打开…';
    refreshStartCopy(); onNavigationChange();
    try {
      const selected = await chooseLesson(index, opener);
      notice.textContent = selected === false
        ? `未切换课程。${session.snapshot().notice || '当前代码仍保留，请查看页面提醒后重试。'}`
        : '';
    } catch {
      notice.textContent = '这项实践暂未打开。当前代码仍保留，请检查保存提醒后重试。';
    } finally {
      setNavigationBusy(false);
      if (opener.isConnected) opener.textContent = priorText;
      pendingOpener = null;
      refreshStartCopy(); onNavigationChange();
    }
  }

  function historyDetails(lesson) {
    const view = session.snapshot();
    if (!view.loadedValid) return element('p', 'history-unavailable', '原存档尚未读取，暂不显示学习历史。');
    const record = view.envelope?.records[lesson.id] || null;
    const info = describeLearningHistory({ lessonId: lesson.id, status: statusOf(lesson.id), record, assessmentVersion: evidenceVersionFor(lesson.id) });
    const details = element('details', 'learning-history');
    const heading = element('summary', '', record?.attempts.length ? `最近提交 · ${record.attempts.length} 条留存` : '这份实践记录是什么意思？');
    details.append(heading);
    details.addEventListener('toggle', () => {
      if (!details.open || details.dataset.loaded) return;
      details.dataset.loaded = 'true';
      const body = element('div', 'learning-history-body');
      body.append(element('p', 'history-standard', info.standardNote), element('p', '', info.description), element('p', 'history-scope', info.scope));
      if (info.latestNote) body.append(element('p', 'history-latest-note', info.latestNote));
      if (info.recent.length) {
        const timeline = element('ol', 'learning-timeline');
        for (const attempt of info.recent) {
          const row = element('li');
          row.dataset.passed = String(attempt.passed);
          const top = element('div', 'learning-attempt-heading');
          const label = element('strong', '', attempt.label);
          const formatted = attemptDate(attempt.at);
          const date = element('time', '', formatted.text);
          if (formatted.iso) { date.dateTime = formatted.iso; date.title = formatted.iso; }
          top.append(label, date);
          row.append(top, element('span', '', `${attempt.assistance} · ${attempt.versionLabel}`));
          timeline.append(row);
        }
        body.append(timeline);
      }
      body.append(element('p', 'history-bounds', `${info.boundedNote}${info.recent.length ? ' 时间按此设备显示。' : ''}`));
      details.append(body);
    });
    return details;
  }

  // No cards, listeners, focus, filters or navigation permissions change in this path.
  function refreshStartCopy(view) {
    if (!isVisible()) return;
    const currentView = view ?? session.snapshot(), game = currentView.game;
    if (!startNodes) return;
    const active = lessons[startNodes.index];
    const showStart = !!game && startNodes.lessonId === lessons[game.mission]?.id && describeStart(currentView, pendingSelection) === true;
    const copy = currentView.loadedValid ? `${showStart ? '从这里开始' : '接着上次'} · ${String(learningOrdinal(lessons, active.id)).padStart(2, '0')} / ${lessons.length}` : '课程目录仍可浏览';
    if (startNodes.copy.textContent !== copy) startNodes.copy.textContent = copy;
    const action = showStart ? '开始第一课' : session.accessOf(active.id).canRun ? '继续当前稿' : '查看当前草稿';
    for (const button of [startNodes.resume, startNodes.list]) {
      if (!button || button === pendingOpener) continue;
      if (button.textContent !== action) {
        button.textContent = action;
        if (button === startNodes.list) button.setAttribute('aria-label', `${action}：${active.title}`);
      }
    }
  }

  function render() {
    // The panel owner decides visibility. Hidden calls carry no snapshot to queue:
    // the explicit open render below reads the latest session and filter values.
    if (!isVisible()) return;
    const view = session.snapshot();
    const game = view.game;
    if (!game) return;
    const focused = document.activeElement;
    const focusCard = focused?.closest?.('[data-lesson-card]')?.dataset.lessonCard;
    const focusClass = focused?.className;
    const focusDetails = focused?.tagName === 'SUMMARY' ? focused.parentElement?.className : null;
    const focusAction = focused?.dataset?.lesson ?? focused?.dataset?.prerequisite ?? null;
    const focusResume = focused?.dataset?.resumeLesson;
    const scroll = [];
    for (let node = list; node; node = node.parentElement) scroll.push([node, node.scrollTop, node.scrollLeft]);
    const totals = view.loadedValid ? journalSummary(lessons, statusOf) : null;
    summary.replaceChildren();
    for (const [value, label] of totals ? [[`${totals.passed} / ${totals.total}`, '已有通过记录（含兼容沿用）'], [String(totals.independent), '无辅助标记通过记录'], [String(totals.recheck), '待本版复验']] : [['—', '原记录受保护'], ['—', '实践状态未读取'], ['—', '请先处理恢复提醒']]) {
      const cell = element('div'); cell.append(element('strong', '', value), element('span', '', label)); summary.append(cell);
    }
    current.replaceChildren();
    const active = lessons[game.mission];
    const context = current.ownerDocument?.getElementById?.('journalCourseContext');
    if (context) context.textContent = view.loadedValid ? active.title : '原存档待恢复';
    const activeAccess = session.accessOf(active.id);
    const activeLabel = element('span', 'journal-current-copy');
    const currentCopy = element('small', '', view.loadedValid ? `接着上次 · ${String(learningOrdinal(lessons, active.id)).padStart(2, '0')} / ${lessons.length}` : '课程目录仍可浏览');
    activeLabel.append(currentCopy);
    const resume = element('button', 'primary-button journal-resume', activeAccess.canRun ? '继续当前稿' : '查看当前草稿');
    resume.type = 'button'; resume.dataset.resumeLesson = active.id; resume.disabled = pendingSelection || !canOpen(active.id, view);
    resume.addEventListener('click', () => { void navigate(game.mission, resume); });
    startNodes = { lessonId: active.id, index: game.mission, copy: currentCopy, resume, list: null };
    const currentArt = coursePresentation(active.id);
    const postcard = element('figure', 'journal-course-postcard');
    const mates = element('img', 'journal-course-mates');
    mates.src = './assets/pets/pipi-idle-v2.png'; mates.alt = ''; mates.setAttribute('aria-hidden', 'true');
    if (currentArtId !== active.id) {
      if (currentThumbnail) thumbnails.release(currentThumbnail);
      currentThumbnail = thumbnails.create(active.id, { className: 'journal-current-art', alt: currentArt.contextArt.alt, eager: true });
      currentArtId = active.id;
    }
    const illustration = currentThumbnail;
    const stamp = element('figcaption', 'journal-course-stamp', currentArt.locationLabel);
    postcard.append(mates, illustration, stamp);
    current.append(postcard, activeLabel);
    if (view.loadedValid) {
      current.append(resume);
      const activeInfo = describeLearningHistory({ lessonId: active.id, status: statusOf(active.id), assessmentVersion: evidenceVersionFor(active.id) });
      if (activeInfo.compatibilityNote) current.append(wrapCurrentCompatibilityNote(element('p', 'history-compatibility', activeInfo.compatibilityNote)));
      // An explicit next step, never an automatic switch after a successful run.
      // Search/region filters describe the list; this labelled shortcut spans all courses.
      if (statusOf(active.id) === 'independent-practice') {
        const next = filterJournalLessons(orderedLearningLessons(lessons), { status: 'ready', statusOf, accessOf: id => session.accessOf(id) })[0];
        if (next) {
          const nextIndex = lessons.findIndex(lesson => lesson.id === next.id);
          const nextButton = element('button', 'secondary-button journal-next', `全课程 · 接下来可练：${next.title}`);
          nextButton.type = 'button'; nextButton.dataset.resumeLesson = next.id;
          nextButton.disabled = pendingSelection || !canOpen(next.id, view);
          nextButton.addEventListener('click', () => { void navigate(nextIndex, nextButton); });
          current.append(nextButton);
        }
      }
      if (!activeAccess.canRun) {
        current.append(element('p', 'journal-unavailable', `${activeAccess.reason} 当前稿可查看、编辑和导出，暂不可运行。`));
        // Missing proof can leave the saved current course locked. Keep its draft
        // inspectable and offer a separate, explicit route to a runnable ancestor.
        const prerequisite = activeAccess.nextSteps.find(step => session.accessOf(step.id).canSelect);
        if (prerequisite) {
          const prerequisiteIndex = lessons.findIndex(lesson => lesson.id === prerequisite.id);
          const button = element('button', 'secondary-button journal-prerequisite', `补当前课先修：${prerequisite.title}`);
          button.type = 'button'; button.dataset.resumeLesson = prerequisite.id;
          button.disabled = pendingSelection || !canOpen(prerequisite.id, view);
          button.addEventListener('click', () => { void navigate(prerequisiteIndex, button); });
          current.append(button);
        }
      }
    }
    else current.append(element('p', 'journal-unavailable', '可到手账的存档区导出原件。没有把原来的进度当作零。'));

    const group = selectedGroup();
    const routeTitle = list.ownerDocument?.getElementById?.('journalRouteTitle');
    const routeSelect = list.ownerDocument?.getElementById?.('journalFilter');
    if (routeTitle) routeTitle.textContent = group === 'all' ? '课程路线'
      : `${routeSelect?.selectedOptions?.[0]?.textContent || '当前路线'} · 课程路线`;
    const groupIds = group === 'all' ? null : lessons.filter((lesson,index)=>groupOf(lesson,index)===group).map(lesson=>lesson.id);
    filter.disabled = !view.loadedValid;
    const visible = filterJournalLessons(orderedLearningLessons(lessons), { query: search.value, status: view.loadedValid ? filter.value : 'all', groupIds, statusOf, recordOf: id => view.envelope?.records[id], accessOf: id => session.accessOf(id) });
    count.textContent = `找到 ${visible.length} 项实践${view.loadedValid ? '' : ' · 仅浏览课程目录'}`;
    empty.hidden = visible.length !== 0;
    empty.textContent = group === 'all'
      ? '没有符合当前搜索和状态的课程。请调整搜索或状态条件。'
      : '这条路线里没有符合当前搜索和状态的课程。可在「选择路线」切到「全部实践」，或调整搜索与状态。';
    clear.hidden = !search.value && filter.value === 'all';
    const orderedCards = [];
    for (const lesson of visible) {
      const index = lessons.findIndex(item => item.id === lesson.id);
      const access = session.accessOf(lesson.id);
      const info = view.loadedValid ? describeLearningHistory({ lessonId: lesson.id, status: statusOf(lesson.id), assessmentVersion: evidenceVersionFor(lesson.id) }) : { tone: 'quiet', label: '实践记录未读取' };
      const signature = JSON.stringify([view.loadedValid, index === game.mission, access, statusOf(lesson.id), view.envelope?.records[lesson.id], Object.hasOwn(game.drafts, lesson.id)]);
      const previous = cards.get(lesson.id);
      if (previous?.signature === signature) {
        orderedCards.push(previous.article);
        if (index === game.mission) startNodes.list = previous.button;
        continue;
      }
      const openStates = [...previous?.article.querySelectorAll('details') ?? []].map(node => node.open);
      const article = element('article', 'journal-entry course-entry');
      article.dataset.lessonCard = lesson.id;
      article.dataset.current = String(view.loadedValid && index === game.mission);
      const ordinal = element('span', 'course-ordinal', String(learningOrdinal(lessons, lesson.id)).padStart(2, '0'));
      const markers = element('div', 'course-markers');
      if (view.loadedValid && index === game.mission) markers.append(element('span', 'course-current', '当前课程'));
      if (lesson.judgeKind === 'protocol') markers.append(element('span', 'course-protocol', '协议试航'));
      if (lesson.judgeKind === 'foundations') markers.append(element('span', 'course-protocol', '异步基础'));
      if (lesson.judgeKind === 'lifecycle') markers.append(element('span', 'course-protocol', '生命周期实训'));
      const title = element('h4', '', lesson.title);
      const topic = element('p', 'course-topic', lesson.topic);
      const badge = element('span', `learning-badge ${info.tone}`, info.label);
      badge.setAttribute('aria-label', `历史实践记录：${info.label}`);
      badge.hidden = view.loadedValid && statusOf(lesson.id) === 'unobserved';
      const eligibility = element('span', 'course-access', accessLabel(access)); eligibility.dataset.access = access.state;
      const previewOnly = !view.loadedValid || (index !== game.mission && !access.canSelect);
      const action = !view.loadedValid ? '查看课程内容' : index === game.mission
        ? access.canRun ? '继续当前稿' : '查看当前草稿'
        : !access.canSelect ? '查看课程内容' : Object.hasOwn(game.drafts, lesson.id) ? '继续这份草稿' : '打开这项实践';
      const button = element('button', 'secondary-button course-enter', action);
      button.type = 'button'; button.dataset.lesson = lesson.id;
      if (previewOnly) button.dataset.previewLesson = lesson.id;
      button.setAttribute('aria-label', `${button.textContent}：${lesson.title}`);
      if (view.loadedValid && index === game.mission) { button.setAttribute('aria-current', 'step'); startNodes.list = button; }
      button.disabled = pendingSelection;
      const preview = previous?.preview ?? coursePreview(lesson);
      button.addEventListener('click', () => {
        if (!previewOnly) { void navigate(index, button); return; }
        const row = article.querySelector('.course-row-details');
        if (row) row.open = true;
        preview.open();
        preview.node.scrollIntoView?.({ block: 'nearest', behavior: 'auto' });
      });
      const presentation = coursePresentation(lesson.id);
      const art = previous?.art ?? thumbnails.create(lesson.id, { alt: presentation.contextArt.alt });
      const context = element('p', 'course-context-copy', `${presentation.locationLabel} · ${presentation.scenario}`);
      const detailsContent = [markers, topic, eligibility, context, preview.node];
      if (info.compatibilityNote) detailsContent.push(element('p', 'history-compatibility', info.compatibilityNote));
      detailsContent.push(historyDetails(lesson));
      const row = buildCourseRow({ article, title, ordinal, action: button, art, badge, detailsContent });
      appendAccessDetails(document, row.body, lesson, access, (id, opener) => { void navigate(lessons.findIndex(item => item.id === id), opener); });
      [...article.querySelectorAll('details')].forEach((node, i) => { if (openStates[i]) { node.open = true; node.dispatchEvent?.(new Event('toggle')); } });
      cards.set(lesson.id, { signature, article, art, preview, button });
      orderedCards.push(article);
    }
    if (list.children.length !== orderedCards.length || orderedCards.some((node, i) => node !== list.children[i])) list.replaceChildren(...orderedCards);
    if (focused && focused !== document.activeElement) {
      const replacement = focusCard ? cards.get(focusCard)?.article.querySelectorAll('button,summary,a') : focusResume ? current.querySelectorAll('[data-resume-lesson]') : [];
      const candidate = [...replacement ?? []].find(node => focusResume ? node.dataset.resumeLesson === focusResume
        : node.tagName === focused.tagName && node.className === focusClass
          && (focusDetails === null || node.parentElement?.className === focusDetails)
          && (focusAction === null || (node.dataset.lesson ?? node.dataset.prerequisite) === focusAction));
      (focused.isConnected ? focused : candidate)?.focus?.({ preventScroll: true });
    }
    for (const [node, top, left] of scroll) { node.scrollTop = top; node.scrollLeft = left; }
    thumbnails.refresh();
    setNavigationBusy(pendingSelection);
    refreshStartCopy(view);
  }
  function resetFilters() {
    search.value = ''; filter.value = 'all'; notice.textContent = ''; render();
  }
  search.addEventListener('input', render);
  filter.addEventListener('change', render);
  clear.addEventListener('click', () => { resetFilters(); search.focus(); });
  return Object.freeze({ render, resetFilters, refreshStartCopy, navigationPending: () => pendingSelection, dispose: () => thumbnails.dispose() });
}
