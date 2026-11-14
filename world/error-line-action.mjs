// Presentation-only navigation. Never edits, runs, saves or grants assistance.
export function errorLineSelection(code, line) {
  if (typeof code !== 'string' || !Number.isSafeInteger(line) || line < 1) return null;
  let start = 0;
  for (let current = 1; current < line; current++) {
    const next = code.indexOf('\n', start);
    if (next < 0) return null;
    start = next + 1;
  }
  const newline = code.indexOf('\n', start);
  let end = newline < 0 ? code.length : newline;
  if (end > start && code[end - 1] === '\r') end--;
  return { start, end };
}

export function createErrorLineAction({ document, editor, code, line, isCurrent, notify }) {
  const selection = errorLineSelection(code, line);
  if (!selection) return null;
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'secondary-button error-line-action';
  button.textContent = `定位第 ${line} 行`;
  button.setAttribute('aria-label', `返回代码编辑器并选中第 ${line} 行`);
  button.addEventListener('click', () => {
    if (!isCurrent() || editor.value !== code || editor.readOnly) {
      notify('当前稿或运行状态已改变，请重新运行后定位。');
      return;
    }
    editor.focus();
    editor.setSelectionRange(selection.start, selection.end, 'forward');
    editor.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  });
  return button;
}
