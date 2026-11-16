const needsRecovery = new Set([
  'conflict', 'backup-only', 'locks-required', 'recovery-capacity', 'recovery-owner-conflict',
  'recovery-invalid', 'recovery-error', 'recovery-present', 'pending-local', 'missing-authority', 'error',
  'invalid', 'invalid-state', 'stale-state', 'invalid-legacy',
]);

export function showSaveRecovery(details                           , status        )       {
  if (!details) return;
  const previous = details.dataset.saveState;
  details.dataset.saveState = status;
  details.dataset.needsRecovery = String(needsRecovery.has(status));
  if (needsRecovery.has(status) && previous !== status) details.open = true;
}


//# sourceURL=../typed/save-recovery-view.mts