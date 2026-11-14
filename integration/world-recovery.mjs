import { ASSESSMENT_VERSION } from './contracts.mjs';

// A recovery export preserves local evidence. It neither retries a write nor
// turns an unreadable authority or a pending award into a committed game save.
export function exportWorldProgress(session) {
  const view = session.snapshot();
  if (view.loadedValid && view.localEnvelopeValid && view.status === 'saved' && !session.hasUnsaved()) {
    return { text: session.exportState(), filename: `pipi-world-v${ASSESSMENT_VERSION}-save.json`, recovery: false, saved: true };
  }
  const payload = {
    format: 'pipi-world-recovery/v2',
    note: '恢复备份，不可直接作为已验收存档导入。本地封套、待保存状态和编辑器原文均可能尚未持久保存；它们不授予通过、解锁或奖励。',
    envelope: view.localEnvelopeValid ? JSON.parse(session.exportState()) : null,
    pendingDraft: view.pendingDraft ? { ...view.pendingDraft } : null,
    pendingSave: session.pendingExport(),
    original: session.original(),
    lastReadStatus: view.loadResult?.status ?? null,
    authorityReadable: view.loadedValid,
    locallyValidated: view.localEnvelopeValid,
    saveStatus: view.status
  };
  return { text: JSON.stringify(payload, null, 2), filename: 'pipi-world-recovery.json', recovery: true, saved: false };
}
