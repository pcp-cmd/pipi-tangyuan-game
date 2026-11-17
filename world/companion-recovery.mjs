export function mountCompanionRecovery({ root, message, retry, onRetry }) {
  let visible = false, pending = null, disposed = false;
  const names = { pipi: '皮皮', tangyuan: '汤圆' };
  function update(status) {
    if (disposed) return;
    if (status.status === 'degraded') visible = true;
    if (status.status === 'ready' || status.status === 'disposed') visible = false;
    root.hidden = !visible;
    const loading = status.status === 'loading' || status.loading?.length > 0;
    retry.disabled = loading || !!pending;
    root.setAttribute('aria-busy', String(loading || !!pending));
    if (visible) message.textContent = status.reason === 'startup-budget'
      ? '伙伴动作准备较慢，先用静态图继续探索；动作载入后会原地恢复。'
      : loading ? '正在重新准备伙伴动作，仍可继续探索。'
      : `${status.unavailable.map(cat => names[cat]).join('、')}的动作暂未载入，先用静态图继续探索。`;
  }
  function request() {
    if (disposed || pending || retry.disabled) return;
    retry.disabled = true; root.setAttribute('aria-busy', 'true');
    message.textContent = '正在重新准备伙伴动作，仍可继续探索。';
    pending = Promise.resolve().then(onRetry);
    void pending.then(status => {
      pending = null; update(status);
    }, () => {
      pending = null;
      if (!disposed) { retry.disabled = false; root.setAttribute('aria-busy', 'false'); message.textContent = '动作仍未载入，可继续探索，也可再次重试。'; }
    });
  }
  retry.addEventListener('click', request);
  return Object.freeze({ update, dispose() {
    if (disposed) return;
    disposed = true; retry.removeEventListener('click', request); root.hidden = true;
  } });
}
