export function mountClassroomGraduation({root, session, browseCourse, download}) {
  if (!root || typeof session?.graduationView !== 'function') throw new Error('A graduation root and session are required.');
  const document = root.ownerDocument;
  const create = (tag, className, text = '') => {
    const node = document.createElement(tag); node.className = className; node.textContent = text; return node;
  };
  const kicker = create('p', 'classroom-graduation-kicker', '课堂结业');
  const title = create('h3', 'classroom-graduation-title', '海神大使');
  const status = create('p', 'classroom-graduation-status');
  status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const progress = create('p', 'classroom-graduation-progress');
  const scope = create('p', 'classroom-graduation-scope', 'AE26 工程作品另行审核；课堂通过不等于实际掌握。');
  const actions = create('div', 'classroom-graduation-actions');
  const next = create('button', 'classroom-graduation-next', '继续练习');
  const retry = create('button', 'classroom-graduation-retry', '重试保存');
  const exportButton = create('button', 'classroom-graduation-download', '保存结业纪念');
  for (const button of [next, retry, exportButton]) button.type = 'button';
  actions.append(next, retry, exportButton);
  const nodes = [kicker, title, status, progress, scope, actions];
  root.append(...nodes);
  let disposed = false, retrying = false, actionNotice = '';

  function render() {
    if (disposed) return;
    const view = session.graduationView();
    root.dataset.state = view.state;
    title.textContent = view.title;
    const messages = {
      unavailable: '读取旅程后，查看结业进度。',
      'in-progress': '沿着航线，留下自己的解题记录。',
      'pending-save': '独立实践已齐，等待保存确认。',
      'needs-confirmation': '先核对存档，再确认结业记录。',
      earned: '课堂结业 · 已获得海神大使称号。'
    };
    status.textContent = actionNotice || messages[view.state];
    progress.textContent = view.savedIndependent === null ? '已保存记录尚未确认。' :
      `已保存的独立实践 ${view.savedIndependent} / ${view.total}`;
    next.hidden = typeof browseCourse !== 'function' || !view.nextLessonId;
    next.disabled = retrying;
    retry.hidden = view.state !== 'pending-save';
    retry.disabled = retrying || !view.canRetry;
    retry.textContent = retrying ? '正在保存…' : '重试保存';
    exportButton.hidden = typeof download !== 'function' || view.state !== 'earned';
    return view;
  }
  function continueCourse() {
    if (disposed || retrying) return;
    const view = session.graduationView();
    if (view.nextLessonId && typeof browseCourse === 'function') browseCourse(view.nextLessonId);
  }
  async function retrySave() {
    if (disposed || retrying || !session.graduationView().canRetry) return;
    retrying = true; actionNotice = ''; render();
    try { await session.retrySave(); }
    catch { actionNotice = '尚未确认保存，请保留当前旅程并重试。'; }
    finally { retrying = false; render(); }
  }
  function saveMemento() {
    if (disposed || typeof download !== 'function') return;
    const view = session.graduationView();
    if (view.state !== 'earned') { render(); return; }
    const text = ['皮皮和汤圆的小冒险 · 课堂结业纪念', view.title,
      `当前标准的独立实践记录：${view.savedIndependent} / ${view.total}，已确认保存。`,
      `课程标准：${view.assessmentVersion}；先修规则：${view.policyVersion}。`,
      '这份纪念仅记录课堂实践，不是实际掌握或 AE26 工程审核的证明。',
      '称号由已保存的课程记录复算，未记录首次获得日期。', ''].join('\n');
    try { download(text, 'pipi-tangyuan-classroom-graduation.txt'); actionNotice = ''; render(); }
    catch { actionNotice = '纪念文件未能保存，课堂记录仍在手账中。'; render(); }
  }
  next.addEventListener('click', continueCourse);
  retry.addEventListener('click', retrySave);
  exportButton.addEventListener('click', saveMemento);
  render();
  return Object.freeze({render, dispose() {
    if (disposed) return;
    disposed = true;
    next.removeEventListener('click', continueCourse);
    retry.removeEventListener('click', retrySave);
    exportButton.removeEventListener('click', saveMemento);
    for (const node of nodes) node.remove();
    delete root.dataset.state;
  }});
}
