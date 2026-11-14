import {createRecoveryArchiveManager} from '../integration/recovery-archive.mjs';
import {LESSONS, LESSON_IDS} from '../integration/contracts.mjs';
import {mountMissingAuthoritySection} from './missing-recovery-panel.mjs';

const COPY = {
  'prepared': '归档已准备，尚未验证保存。',
  'download-requested': '已请求下载。请在下方选回刚保存的文件，下载按钮本身不证明文件已保存。',
  'download-failed': '下载请求未完成，尚未允许释放。请重试下载。',
  'reading-file': '正在读取所选文件并核对完整原文…',
  'verified': '文件已实际读回并与这份备份完整匹配。现在可以单独确认释放。',
  'invalid-file': '没有读到完整有效的归档文件。未允许释放，请重新选择。',
  'wrong-archive': '所选文件与当前备份不匹配。未允许释放，请选回对应归档。',
  'file-read-failed': '文件未能完整读回。之前的验证已取消，备份没有因此被释放。',
  'branch-changed': '这份备份已变化。旧文件验证不能释放新分支，请刷新并重新归档。',
  'inbox-invalid': '恢复收件箱无法校验。原件仍保留，可导出原件，不能释放。',
  'inbox-unavailable': '暂时无法读取恢复收件箱。不能把它当作没有备份，请稍后刷新。',
  'released': '已确认释放刚才验证的备份。主进度和当前编辑未改动；如仍有待保存内容，请再点重试保存。',
  'observed-absent': '当前已不再看到这份备份，本次没有再次删除。请保留读回过的归档文件。',
  'release-uncertain': '释放结果尚未确认，可能已经写入。请保留归档并刷新列表核对，不会自动重复释放。',
  'recovery-error': '释放操作未确认完成。请保留文件并刷新核对。',
  'changed-recovery': '等候操作时备份发生变化，新的分支没有被删除。请刷新后重新归档。',
  'confirmation-required': '尚未确认释放，备份保持不变。',
  'verification-required': '需要重新选回文件并完成验证，不能沿用旧票据。',
  'archive-too-large': '归档超过安全读取上限，未允许释放；原记录仍保留。',
  'prepare-failed': '归档准备未完成，未允许释放。请稍后重试。',
  'download-required': '请先为所选分支请求下载，再选回保存的文件。',
};

export function mountRecoveryPanel({session, scope, anchor, editorAnchor, download, document = globalThis.document,
  window = globalThis.window, confirm = message => globalThis.confirm(message), onReloaded = () => {}}) {
  if (!anchor || typeof download !== 'function') throw new TypeError('Recovery panel requires an anchor and downloader');
  const manager = createRecoveryArchiveManager({session, scope});
  const element = (tag, className, text) => {
    const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node;
  };
  const stylesheet = document.createElement('link'); stylesheet.rel = 'stylesheet'; stylesheet.href = new URL('./recovery.css', import.meta.url).href;
  document.head.append(stylesheet);
  const dialog = element('dialog', 'recovery-dialog'); dialog.id = 'recoveryDialog'; dialog.setAttribute('aria-labelledby', 'recoveryDialogTitle');
  const closeButton = element('button', 'recovery-close', '返回原页面'); closeButton.type = 'button'; closeButton.id = 'closeRecoveryManager'; dialog.append(closeButton);
  const panel = element('section', 'recovery-manager'); panel.id = 'recoveryManager';
  const summary = element('h3', '', '冲突备份与安全归档'); summary.id = 'recoveryDialogTitle'; panel.append(summary); dialog.append(panel);
  const body = element('div', 'recovery-manager-body'); panel.append(body);
  body.append(element('p', 'recovery-explanation', '先下载，再选回文件核对，最后单独确认释放。这不会补金币、解锁或覆盖主进度。'));
  const status = element('p', 'recovery-status', '打开后读取恢复列表。'); status.id = 'recoveryManagerStatus'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); body.append(status);
  const refreshButton = element('button', 'secondary-button', '刷新备份列表'); refreshButton.type = 'button'; refreshButton.id = 'refreshRecoveryBranches';
  const originalButton = element('button', 'secondary-button', '导出收件箱原件'); originalButton.type = 'button'; originalButton.id = 'exportRecoveryInbox';
  const topActions = element('div', 'recovery-actions'); topActions.append(refreshButton, originalButton); body.append(topActions);
  const list = element('div', 'recovery-branch-list'); list.id = 'recoveryBranchList'; list.setAttribute('role', 'group'); list.setAttribute('aria-label', '可归档的恢复分支'); body.append(list);
  const selection = element('section', 'recovery-selection'); selection.id = 'recoverySelectedBranch'; selection.hidden = true; body.append(selection);
  const heading = element('h4', '', '所选备份'); const meta = element('p', 'recovery-meta'); const preview = element('pre', 'recovery-preview');
  selection.append(heading, meta, preview);
  const downloadButton = element('button', 'secondary-button', '1. 下载这份备份'); downloadButton.type = 'button'; downloadButton.id = 'downloadRecoveryBranch'; selection.append(downloadButton);
  const fileLabel = element('label', 'recovery-file-label', '2. 选回刚保存的归档文件'); fileLabel.htmlFor = 'recoveryArchiveFile'; selection.append(fileLabel);
  const fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = '.json,application/json'; fileInput.id = 'recoveryArchiveFile'; selection.append(fileInput);
  const verifiedFile = element('p', 'recovery-file-proof', '尚未读回文件。'); verifiedFile.id = 'recoveryVerifiedFile'; selection.append(verifiedFile);
  const releaseButton = element('button', 'recovery-release', '3. 确认并释放这份备份'); releaseButton.type = 'button'; releaseButton.id = 'releaseRecoveryBranch'; selection.append(releaseButton);
  selection.append(element('p', 'recovery-caution', '释放只移除这一份浏览器备份，不会自动重载或保存新稿。若主记录缺失，请先恢复并载入，再考虑释放来源；释放最后一份保留来源后，本版暂不能仅凭外部归档恢复进度。请保留归档文件。'));
  body.append(element('p', 'recovery-legacy-note', '这里只管理新收件箱。旧版恢复记录与课程日志仍在原处，本页不会清理，也不会合并其中的奖励。'));
  const journalOpen = element('button', 'secondary-button', '管理冲突备份'); journalOpen.type = 'button'; journalOpen.id = 'openJournalRecovery'; anchor.after(journalOpen);
  let editorOpen = null;
  if (editorAnchor) { editorOpen = element('button', 'text-button', '管理冲突备份'); editorOpen.type = 'button'; editorOpen.id = 'openEditorRecovery'; editorAnchor.append(editorOpen); }
  document.body.append(dialog);

  let ticket = null, uiGeneration = 0, disposed = false, opener = null, missing = null;
  function message(text) { if (!disposed) status.textContent = text; }
  function resultMessage(result) { message(COPY[result.phase] || COPY[result.status] || '请刷新列表并确认当前备份，再继续。'); }
  function ensureDialogFocus(preferred = closeButton) {
    if (!dialog.open) return;
    const active = document.activeElement;
    let inside = false, unavailable = !!active?.disabled;
    for (let node = active; node; node = node.parentElement) {
      unavailable ||= !!node.hidden;
      if (node === dialog) { inside = true; break; }
    }
    if (!inside || unavailable) preferred.focus();
  }
  function controls() {
    const view = manager.snapshot(); selection.hidden = !view.selected;
    const busy = view.releasing || view.phase === 'preparing' || missing?.snapshot().busy;
    refreshButton.disabled = busy; downloadButton.disabled = busy || !view.selected;
    originalButton.disabled = busy || !view.canExportOriginal;
    fileInput.disabled = busy || !view.canVerify; releaseButton.disabled = busy || !view.canRelease || !ticket;
    for (const button of list.querySelectorAll('button')) button.disabled = busy;
    if (!view.canRelease) { ticket = null; verifiedFile.textContent = view.phase === 'reading-file' ? '正在读回文件…' : '尚未完成当前分支的文件读回验证。'; }
    ensureDialogFocus();
  }
  function selectionDetails(entry) {
    if (!entry) return;
    let source;
    try { source = JSON.parse(entry.raw); } catch { source = null; }
    const lessonId = LESSON_IDS[source?.game?.mission], lesson = LESSONS.find(item => item.id === lessonId);
    heading.textContent = '所选备份 · ' + entry.owner.slice(0, 14);
    const assisted = source?.draftAssistance?.[lessonId] === true;
    meta.textContent = `${lesson?.title || lessonId || '历史课程'} · ${entry.raw.length.toLocaleString()} 字符原文 · ${assisted ? '草稿带辅助标记' : '草稿未标辅助'}，不是新的通过证明。`;
    const code = source?.game?.drafts?.[lessonId];
    preview.textContent = typeof code === 'string' ? code.slice(0, 1000) + (code.length > 1000 ? '\n…预览已截短，归档保留完整原文。' : '') : '此分支没有当前课程草稿。归档仍保留完整进度原文。';
  }
  function drawList(view) {
    list.replaceChildren();
    if (view.inboxStatus !== 'ready') list.append(element('p', 'recovery-empty', COPY['inbox-' + view.inboxStatus]));
    else if (!view.entries.length) list.append(element('p', 'recovery-empty', '新收件箱暂无可见分支。若主记录缺失，不会据此新建空白游戏；已有原件仍可导出。'));
    for (const entry of view.entries) {
      const button = element('button', 'recovery-branch', `备份 ${entry.owner.slice(0, 14)} · ${entry.raw.length.toLocaleString()} 字符`);
      button.type = 'button'; button.dataset.owner = entry.owner; button.setAttribute('aria-pressed', String(view.selectedOwner === entry.owner));
      button.addEventListener('click', () => {
        if (manager.snapshot().releasing) return;
        uiGeneration++; ticket = null; fileInput.value = ''; missing.cancel();
        const result = manager.select(entry.owner); const current = manager.snapshot(); drawList(current); selectionDetails(current.selected); controls();
        if (dialog.open) (list.querySelectorAll('button')[current.entries.findIndex(item => item.owner === current.selectedOwner)] || closeButton).focus();
        if (result.status === 'selected') message('已选中这份备份。请先下载，下载请求不会立即允许释放。'); else resultMessage(result);
      });
      list.append(button);
    }
    ensureDialogFocus();
  }
  function refresh({user = false} = {}) {
    if (disposed || manager.snapshot().releasing) return;
    if (user) { uiGeneration++; manager.cancelVerification(); ticket = null; }
    const current = manager.refresh(); drawList(current); selectionDetails(current.selected); controls();
    missing.refresh();
    if (current.inboxStatus !== 'ready') message(COPY['inbox-' + current.inboxStatus]);
    else if (!current.entries.length) message('已读取新收件箱，暂无可见分支。不会清理旧版记录。');
    else message(`读到 ${current.entries.length} 份备份。请选择需要归档的一份；主进度不会参与释放。`);
  }
  function open(from) {
    if (disposed) return;
    opener = from;
    if (!dialog.open) dialog.showModal();
    refresh();
  }
  function clearOnClose() {
    missing.cancel();
    if (!manager.snapshot().releasing) { uiGeneration++; manager.cancelVerification(); ticket = null; controls(); }
  }
  journalOpen.addEventListener('click', () => open(journalOpen));
  editorOpen?.addEventListener('click', () => open(editorOpen));
  closeButton.addEventListener('click', () => { clearOnClose(); dialog.close(); });
  // A native file chooser's cancel event also bubbles. Only the dialog's own
  // dismissal may clear both purposes; selecting no file is not closing it.
  dialog.addEventListener('cancel', event => { if (event.target === dialog) clearOnClose(); });
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
  // Keep the world/editor keyboard handlers from interpreting dialog input as
  // movement, a Python run, or a request to flush/close the original panel.
  dialog.addEventListener('keydown', event => event.stopPropagation());
  // Removing, hiding, or disabling the focused control can leave BODY focused.
  // Guard at capture phase so even that transient state cannot reach the
  // world's document/viewport/editor key handlers. Native Tab/button actions
  // remain enabled; Escape closes only this dialog.
  const onModalKey = event => {
    if (!dialog.open) return;
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); clearOnClose(); dialog.close(); }
    else ensureDialogFocus();
  };
  window.addEventListener('keydown', onModalKey, true);
  refreshButton.addEventListener('click', () => refresh({user: true}));
  downloadButton.addEventListener('click', async () => {
    missing.cancel();
    const token = ++uiGeneration; ticket = null; fileInput.value = '';
    const preparing = manager.prepareArchive(); controls(); message('正在准备完整归档…');
    const archive = await preparing; if (disposed || token !== uiGeneration) return;
    if (archive.status !== 'prepared') { resultMessage(archive); controls(); return; }
    try { download(archive.text, archive.filename); resultMessage(manager.noteDownloadRequested(archive.ticket)); }
    catch { resultMessage(manager.noteDownloadFailed(archive.ticket)); }
    controls();
  });
  function clearFileProof() {
    if (manager.snapshot().releasing) return;
    uiGeneration++; manager.cancelVerification(); ticket = null; fileInput.value = ''; controls();
  }
  fileInput.addEventListener('click', clearFileProof);
  fileInput.addEventListener('cancel', () => { clearFileProof(); message('没有选回文件，未允许释放。可以重新选择。'); });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0], token = ++uiGeneration; ticket = null;
    const verifying = manager.verifySelectedFile(file); controls(); message('正在实际读取所选文件…');
    const result = await verifying; if (disposed || token !== uiGeneration) return;
    if (result.status === 'verified') { ticket = result.ticket; verifiedFile.textContent = `已读回：${result.fileName}（${result.fileBytes.toLocaleString()} 字节），完整匹配。`; }
    resultMessage(result); controls();
  });
  releaseButton.addEventListener('click', async () => {
    if (!ticket || !manager.snapshot().canRelease) return;
    if (!confirm('确认只释放这份浏览器恢复备份吗？请保留刚刚实际读回的归档文件。若主记录缺失，请先恢复并载入；释放最后一份保留来源后，本版暂不能仅凭外部归档恢复进度。主进度、当前编辑和其他备份不会因此改变。')) {
      message('已取消释放，备份仍保留。'); return;
    }
    missing.cancel();
    const releasing = manager.releaseVerified(ticket, {confirmed: true}); ticket = null; controls(); message('正在核对最新分支并请求释放…');
    const result = await releasing; if (disposed) return;
    drawList(manager.snapshot()); controls(); resultMessage(result);
  });
  originalButton.addEventListener('click', () => {
    const original = manager.originalInboxExport(); controls();
    if (original.status !== 'original-ready') { message('没有读到可导出的收件箱原文，请先刷新。'); return; }
    const sourceNote = original.currentReadable ? '已请求下载收件箱原件。' : original.source === 'historical-missing'
      ? '已请求下载上次读到的收件箱原件，当前收件箱键已不存在。' : '已请求下载上次读到的收件箱原件，当前读取未成功。';
    try { download(original.text, original.filename); message(sourceNote + '这不是单分支释放凭证，也不是可直接导入的主进度。'); }
    catch { message('原件下载请求未完成。原存储没有改动，请重试。'); }
  });
  const onStorage = event => {
    if (event.key !== scope + ':recovery-v2') return;
    // Do not scan Storage for every draft write from another tab. Revoke the
    // file capability and ask for an explicit fresh list instead.
    uiGeneration++; manager.cancelVerification(); ticket = null; controls();
    if (dialog.open) message('另一个页面更新了恢复收件箱。请刷新列表，旧文件验证已取消。');
  };
  missing=mountMissingAuthoritySection({session,scope,container:body,document,window,confirm,onReloaded,ensureFocus:ensureDialogFocus,onBusyChange:()=>controls()});
  window.addEventListener('storage', onStorage); controls();
  return Object.freeze({element: dialog, refresh, dispose() {disposed = true; uiGeneration++; missing.dispose(); window.removeEventListener('storage', onStorage); window.removeEventListener('keydown', onModalKey, true); dialog.remove(); journalOpen.remove(); editorOpen?.remove(); stylesheet.remove();}});
}
