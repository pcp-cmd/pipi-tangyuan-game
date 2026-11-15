import { externalAssignments, prepareExternalSubmission } from '../integration/external-work.mjs';
import { LESSONS } from '../integration/contracts.mjs';
import {inspectLocalCheckBundle, LOCAL_CHECK_TOOL} from '../integration/local-check.mjs';

export function mountExternalWorkPanel({ root, session, download, browseCourse, canWrite = () => true }) {
  const doc = root.ownerDocument, assignments = externalAssignments(), panes = new Map();
  let disposed = false, selectedId = assignments[0]?.id;
  const chooser = doc.createElement('select'); chooser.name = 'external-task';
  chooser.setAttribute('aria-label', '选择独立工程');
  const label = doc.createElement('label'); label.className = 'external-task-picker';
  label.textContent = '选择一份工程'; label.append(chooser);
  for (const task of assignments) {
    const option = doc.createElement('option'); option.value = task.id; option.textContent = task.title;
    chooser.append(option);
  }
  const preparation = doc.createElement('p'); preparation.className = 'external-task-preparation';
  const content = doc.createElement('div'); content.className = 'external-task-pages';
  root.replaceChildren(label, preparation, content);
  function selectTask(id, { focus = false } = {}) {
    if (disposed) return false;
    const assignment = assignments.find(task => task.id === id);
    if (!assignment) return false;
    selectedId = id; chooser.value = id;
    preparation.textContent = assignment.preparation;
    if (!panes.has(id)) {
      const page = doc.createElement('section'); page.dataset.externalTaskId = id;
      page.setAttribute('aria-label', assignment.title); content.append(page);
      const controller = mountAssignmentPanel({ root: page, session, download, browseCourse, canWrite, assignment });
      panes.set(id, { page, controller });
    }
    for (const [taskId, pane] of panes) pane.page.hidden = taskId !== id;
    panes.get(id).controller.render();
    if (focus) chooser.focus?.({ preventScroll: true });
    return true;
  }
  const onChange = () => selectTask(chooser.value);
  chooser.addEventListener('change', onChange);
  selectTask(selectedId);
  return Object.freeze({
    selectTask,
    get selectedTaskId() { return selectedId; },
    render() { if (!disposed) for (const pane of panes.values()) pane.controller.render(); },
    dispose() {
      if (disposed) return;
      disposed = true; chooser.removeEventListener('change', onChange);
      for (const pane of panes.values()) pane.controller.dispose();
    },
  });
}

function mountAssignmentPanel({ root, session, download, browseCourse, canWrite, assignment }) {
  const doc = root.ownerDocument, cleanup = [], historyCleanup = [], selectionCleanup = [];
  let selected = [], preview = null, revision = 0, fileReadRevision = 0, busy = false, disposed = false, historySignature = '';
  let historyRevision = 0;
  const localChecks = new Map();
  const assistanceLabels = { none: '未使用外部帮助', hint: '提示', reference: '参考解答', ai: 'AI', peer: '协作', mixed: '多种帮助', guided: '带领完成', 'new-independent-task': '另题独立核验' };
  const make = (tag, copy = '', className = '') => {
    const node = doc.createElement(tag); node.textContent = copy; node.className = className; return node;
  };
  const removeAll = group => { for (const remove of group.splice(0)) remove(); };
  const listen = (node, type, fn, group = cleanup) => { node.addEventListener(type, fn); group.push(() => node.removeEventListener(type, fn)); };
  const button = (copy, fn, className = 'secondary-button', group = cleanup) => {
    const node = make('button', copy, className); node.type = 'button'; listen(node, 'click', fn, group); return node;
  };
  const label = (copy, node) => { const wrapper = make('label', copy); wrapper.append(node); return wrapper; };
  const select = (values, name) => {
    const node = make('select'); node.name = name;
    for (const [value, title] of values) { const option = make('option', title); option.value = value; node.append(option); }
    return node;
  };
  const status = make('p', '', 'submission-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const heading = make('h3', assignment.title), summary = make('p', assignment.summary);
  const requirements = make('ol'); assignment.requirements.forEach(copy => requirements.append(make('li', copy)));
  const prerequisites = make('details'), prerequisitesTitle = make('summary', '先学这些，再独立完成');
  prerequisites.append(prerequisitesTitle);
  for (const id of assignment.prerequisiteIds) prerequisites.append(button(LESSONS.find(lesson => lesson.id === id)?.title || id, event => browseCourse(id, event.currentTarget), 'text-button'));
  const starter = make('a', '下载独立起步工程'); starter.href = assignment.download.url; starter.download = assignment.download.filename;
  const readme = make('a', '阅读启动与交付说明'); readme.href = assignment.readme; readme.target = '_blank'; readme.rel = 'noopener';
  const links = make('p'); links.append(starter, doc.createTextNode(' · '), readme);
  const localTools = make('a', '下载本地自测工具'); localTools.href = LOCAL_CHECK_TOOL.url; localTools.download = LOCAL_CHECK_TOOL.filename;
  const localGuide = make('a', '自测与带回结果'); localGuide.href = LOCAL_CHECK_TOOL.readme; localGuide.target = '_blank'; localGuide.rel = 'noopener';
  links.append(doc.createTextNode(' · '), localTools, doc.createTextNode(' · '), localGuide);
  const localHelp = make('details'); localHelp.append(make('summary', '在 VS Code 做完后，带回哪份结果？'));
  localHelp.append(make('p', '在自己的工程目录运行下载工具，生成 LOCAL-CHECK.json。将它和对应源码、测试一同选入材料；改稿后重跑。游戏只核对报告与材料，不执行上交代码。'));
  localHelp.append(make('pre', `python -B "检查工具目录/local-check.py" --task ${assignment.id} --project .`));
  localHelp.append(make('p', '本次测试无失败、无跳过、进程正常结束且运行期间未改稿，才显示本机自测通过；测试是否充分、可信审核与独立能力仍单独确认。'));
  const readings = make('details'); readings.hidden = !assignment.readingUrls?.length;
  readings.append(make('summary', '工程学习手册'));
  const chapters = make('ol'); readings.append(chapters);
  for (const reading of assignment.readingUrls || []) {
    const link = make('a', reading.title); link.href = reading.url; link.target = '_blank'; link.rel = 'noopener';
    const item = make('li'); item.append(link); chapters.append(item);
  }
  const accept = button('领取这份委托', async () => act(() => session.acceptExternalTask(assignment.id)));
  const materials = make('fieldset'), legend = make('legend', '整理要提交的材料'); materials.append(legend, make('p', assignment.submissionNotice));
  const directory = make('input'); directory.type = 'file'; directory.multiple = true; directory.setAttribute('webkitdirectory', '');
  materials.append(label('选择专用作业文件夹', directory));
  const selectionStatus = make('p'), exclusions = make('div'); materials.append(selectionStatus, exclusions);
  const execution = select([['not-run', '尚未在本机运行'], ['self-reported-run', '我已运行，附实际命令'], ['setup-blocked', '环境准备受阻']], 'execution');
  const pythonVersion = make('input'); pythonVersion.type = 'text'; pythonVersion.maxLength = 200; pythonVersion.placeholder = '例如 Python 3.12.10；没有运行可留空';
  const commandLog = make('textarea'); commandLog.rows = 4; commandLog.maxLength = 6000; commandLog.placeholder = '实际命令、退出状态、输出摘要；不要放凭证或个人资料';
  const assistance = select([['none', '未使用外部帮助'], ['hint', '看过提示'], ['reference', '参考过解答'], ['ai', '使用过 AI'], ['peer', '与他人协作'], ['mixed', '使用过多种帮助']], 'assistance');
  const notes = make('textarea'); notes.rows = 3; notes.maxLength = 2000; notes.placeholder = '说明你独立完成的部分、仍未解决的问题和帮助范围';
  materials.append(label('本机运行情况', execution), label('实际解释器版本', pythonVersion), label('命令与结果', commandLog), label('帮助来源', assistance), label('交付说明', notes));
  const previewOutput = make('pre'); previewOutput.hidden = true; previewOutput.tabIndex = 0; previewOutput.setAttribute('aria-label', '最小提交清单与检查结果');
  const localPreview = make('section'); localPreview.hidden = true; localPreview.setAttribute('aria-label', '本地自测报告与材料一致性');
  const confirmed = make('input'); confirmed.type = 'checkbox';
  const confirmation = label('我已核对清单，并如实填写运行情况与帮助来源。', confirmed); confirmation.className = 'submission-confirmation';
  const prepareButton = button('预览最小提交清单', prepare);
  const exportPreview = button('下载这份提交包', () => { if (preview?.bundleText) download(preview.bundleText, preview.filename); });
  const record = button('保存为待核验作品', async () => {
    if (!preview?.readyToRecord || !confirmed.checked) return;
    await act(() => session.recordExternalSubmission(preview));
  }, 'primary-button');
  materials.append(prepareButton, previewOutput, localPreview, confirmation, exportPreview, record);
  const history = make('div'); history.setAttribute('aria-label', '本委托的历次作品与分项核验');
  const receiptSection = make('details'), receiptTitle = make('summary', '导入审核回执');
  const receipt = make('input'); receipt.type = 'file'; receipt.accept = '.json,application/json';
  receiptSection.append(receiptTitle, make('p', assignment.reviewNotice), label('选择签名回执 JSON', receipt));
  const importReceipt = button('核对并登记回执', async () => {
    const file = receipt.files?.[0];
    if (!file) { status.textContent = '请先选择一份审核回执。'; return; }
    if (file.size > 40 * 1024) { status.textContent = '回执超过 40 KiB，尚未读取。'; return; }
    await act(async () => session.importExternalReceipt(await file.text()));
  });
  receiptSection.append(importReceipt);
  const retry = button('重试保存作品记录', async () => {
    await act(async () => { const saved = await session.retrySave(); return { ok: saved === true, saved: saved === true, message: session.externalWorkView().persistenceNotice }; });
  }, 'text-button');
  root.replaceChildren(heading, summary, requirements, prerequisites, links, localHelp, readings, accept, status, materials, history, receiptSection, retry);

  function showLocalCheck(node, result) {
    node.replaceChildren(make('h4', result.title), make('p', result.detail));
    if (result.report) {
      const report = result.report;
      node.append(make('p', `Python ${report.environment.python} · ${report.environment.platform} · 退出码 ${report.process.exitCode ?? '未记录'}${report.process.timedOut ? ' · 超时' : ''}`));
      if (report.result?.tests.length) {
        const details = make('details'); details.append(make('summary', `查看本次 ${report.result.tests.length} 项结果`));
        const names = {passed:'通过', failed:'失败', error:'错误', skipped:'跳过', 'expected-failure':'预期失败', 'unexpected-success':'意外通过', incomplete:'未完成'};
        for (const test of report.result.tests) details.append(make('pre', `${names[test.outcome]} · ${test.id}${test.message ? '\n' + test.message : ''}`));
        node.append(details);
      }
    }
    node.append(make('p', result.boundary));
  }

  function invalidate() {
    if (disposed) return;
    revision++; preview = null; confirmed.checked = false; previewOutput.hidden = true; localPreview.hidden = true; render();
  }
  for (const field of [execution, pythonVersion, commandLog, assistance, notes]) listen(field, 'input', invalidate);
  listen(confirmed, 'change', render);
  listen(directory, 'change', async () => {
    invalidate(); const token = ++fileReadRevision;
    const chosen = [...(directory.files || [])];
    const files = chosen.filter(file => !(file.webkitRelativePath || file.name).split(/[\\/]/)
      .some(part => /^(?:\.git|\.venv|venv|node_modules|__pycache__)$/i.test(part)));
    const ignored = chosen.length - files.length;
    selected = []; removeAll(selectionCleanup); exclusions.replaceChildren();
    if (files.length > 128) {
      busy = false;
      selectionStatus.textContent = '选中的文件超过 128 个。请选专用作业目录，只保留要预览的源码、测试和说明。';
      render(); return;
    }
    busy = true; selectionStatus.textContent = `正在读取 ${files.length} 个文件…`; render();
    try {
      const rows = [];
      for (const file of files) {
        const path = file.webkitRelativePath || file.name;
        rows.push({ path, text: file.size > 64 * 1024 ? '\u0000' : await file.text(), notRead: file.size > 64 * 1024 });
      }
      if (disposed || token !== fileReadRevision) return;
      selected = rows;
      selectionStatus.textContent = `已选择 ${rows.length} 个文件。${ignored ? `已忽略 ${ignored} 个 Git、环境或缓存文件。` : ''}超过 64 KiB 的文件不读取，需在预览前排除。`;
      for (const row of rows) {
        const input = make('input'); input.type = 'checkbox'; input.dataset.excludePath = row.path;
        listen(input, 'change', invalidate, selectionCleanup);
        const wrapper = label(`不提交：${row.path}${row.notRead ? '（过大，未读取）' : ''}`, input); wrapper.className = 'submission-exclusion'; exclusions.append(wrapper);
      }
    } catch { if (!disposed && token === fileReadRevision) selectionStatus.textContent = '文件未能完整读取，请重新选择。'; }
    finally { if (!disposed && token === fileReadRevision) { busy = false; render(); } }
  });
  async function prepare() {
    if (busy || disposed) return;
    const token = revision; busy = true; render();
    try {
      const result = await prepareExternalSubmission({ taskId: assignment.id,
        files: selected.map(({path, text}) => ({path, text})),
        excludedPaths: [...exclusions.querySelectorAll('input:checked')].map(input => input.dataset.excludePath),
        declaration: { execution: execution.value, pythonVersion: pythonVersion.value, commandLog: commandLog.value, assistance: assistance.value, notes: notes.value } });
      if (disposed || token !== revision) return;
      if (!result.ok) { status.textContent = result.message; return; }
      const localResult = result.readyToRecord ? await inspectLocalCheckBundle(result.bundleText) : null;
      if (disposed || token !== revision) return;
      preview = result;
      previewOutput.textContent = [
        `将收录 ${result.manifest.length} 个文本文件，共 ${result.totalBytes} 字节。`,
        ...result.manifest.map(file => `${file.path} · ${file.bytes} 字节\nSHA256 ${file.sha256}`),
        ...result.omitted.map(file => `已排除：${file.path}`),
        ...result.issues.map(file => `需处理：${file.path} ${file.reason}`),
        ...result.missing.map(path => `还缺：${path}`),
        result.warning,
      ].join('\n\n');
      previewOutput.hidden = false;
      localPreview.hidden = !localResult;
      if (localResult) showLocalCheck(localPreview, localResult);
      status.textContent = result.readyToRecord ? '材料可整理为提交包。请核对清单后保存；这一步不评判代码是否正确。' : '先补齐或排除清单中的问题，再重新预览。';
    } catch { if (!disposed) status.textContent = '整理没有完成。所选材料仍在本页，请重试。'; }
    finally { busy = false; if (!disposed) render(); }
  }
  async function act(operation) {
    if (disposed || busy || !canWrite()) return;
    busy = true; render();
    try {
      const result = await operation();
      if (!disposed) status.textContent = !result.ok ? result.message || '尚未登记，请检查材料后重试。'
        : result.saved === true ? '本次作品记录已保存。核验状态见下方。' : '本次尚未确认保存。请先下载提交包或保留回执，再重试保存。';
    } catch { if (!disposed) status.textContent = '操作没有完成，材料仍保留在本页。请下载提交包后重试。'; }
    finally { busy = false; if (!disposed) render(); }
  }
  function render() {
    if (disposed) return;
    const view = session.externalWorkView(), task = view.assignments.find(row => row.id === assignment.id);
    const blocked = busy || view.busy || !canWrite();
    accept.disabled = blocked || task.status !== 'not-accepted'; accept.textContent = task.status === 'not-accepted' ? '领取这份委托' : `已领取 · ${task.label}`;
    directory.disabled = blocked; prepareButton.disabled = busy || selected.length === 0;
    exportPreview.disabled = !preview?.readyToRecord;
    record.disabled = blocked || !preview?.readyToRecord || !confirmed.checked || task.status === 'not-accepted';
    importReceipt.disabled = blocked; retry.disabled = blocked || view.persisted;
    const nextHistory = JSON.stringify({ task, persisted: view.persisted, notice: view.persistenceNotice });
    if (historySignature === nextHistory) return;
    const historyToken = ++historyRevision;
    const expanded = new Set([...history.children].filter(node => node.open).map(node => node.dataset.submissionDigest));
    historySignature = nextHistory;
    removeAll(historyCleanup);
    history.replaceChildren(make('h4', `作品记录 · ${task.label}`), make('p', task.detail));
    if (task.acceptedAt !== null) history.append(make('p', view.persistenceNotice));
    for (const submission of [...task.submissions].reverse()) {
      const item = make('details'), summary = make('summary', `${new Date(submission.submittedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Kuala_Lumpur' })} · ${submission.status === 'verified' ? '已核验' : submission.status === 'needs-work' ? '需补充' : '待核验'}`);
      item.dataset.submissionDigest = submission.submissionDigest;
      item.open = expanded.has(submission.submissionDigest);
      item.append(summary, make('p', `源码摘要：${submission.submissionDigest}`));
      item.append(make('p', `自报帮助：${assistanceLabels[submission.declaration.assistance]}`));
      const ratings = submission.capabilityRatings;
      item.append(make('p', `独立构建：${ratings.build ?? '未评估'} · 排错：${ratings.debug ?? '未评估'} · 迁移：${ratings.transfer ?? '未评估'}`));
      const localRecord = make('section'); localRecord.setAttribute('aria-label', '这次作品的本地自测报告');
      item.append(localRecord);
      const savedBundle = session.externalSubmissionBundle(assignment.id, submission.submissionDigest);
      if (savedBundle.ok) {
        if (!localChecks.has(submission.submissionDigest)) localChecks.set(submission.submissionDigest, inspectLocalCheckBundle(savedBundle.text));
        localRecord.textContent = '正在核对本地自测报告与这次提交材料…';
        localChecks.get(submission.submissionDigest).then(result => {
          if (!disposed && historyToken === historyRevision) showLocalCheck(localRecord, result);
        }).catch(() => {
          if (!disposed && historyToken === historyRevision) localRecord.textContent = '本地报告未能完成核对；作品仍待核验，可下载原提交包后重试。';
        });
      } else localRecord.textContent = '作品材料摘要尚未确认，本地报告暂未核对。';
      if (submission.review) {
        item.append(make('p', `审核记录的帮助：${submission.review.assistance.map(value => assistanceLabels[value]).join('、') || '未登记帮助'}`));
        item.append(make('p', submission.review.environment.summary));
        for (const copy of [...submission.review.feedback, ...submission.review.limits]) item.append(make('p', copy));
      }
      item.append(button('下载这次作品', () => {
        const bundle = session.externalSubmissionBundle(assignment.id, submission.submissionDigest);
        if (bundle.ok) download(bundle.text, bundle.filename); else status.textContent = bundle.message;
      }, 'text-button', historyCleanup));
      history.append(item);
    }
  }
  render();
  return Object.freeze({ render, dispose() { if (disposed) return; disposed = true; revision++; historyRevision++; localChecks.clear(); removeAll(cleanup); removeAll(historyCleanup); removeAll(selectionCleanup); } });
}
