// Presentation only. Input is the current, already-validated submission outcome.
// No editor, session, persistence, assistance or runtime capabilities are accepted.
const moveMessage = 'game.move() 每次需要 1 到 6 的整数。';
const explanations = {
  SyntaxError: '请检查报错行和它前面的语句：符号是否完整，语句是否写完。',
  IndentationError: '请对照上下相邻的语句，检查缩进层级是否一致。',
  NameError: '这个名字在使用前没有定义。请核对拼写和赋值的位置。',
  TypeError: '这些值的类型不能这样搭配。请核对参与这个操作的值及其类型。',
  ZeroDivisionError: '除数不能为 0。请检查参与除法的数值。',
  ValueError: '这个操作收到了不符合要求的值。请展开技术详情查看具体约束。',
};
export function firstFailureView(lessonId, outcome) {
  if (lessonId !== 'first-steps' || !['incorrect', 'python-error'].includes(outcome?.kind)) return null;
  const error = outcome.error, incorrect = outcome.kind === 'incorrect';
  const title = incorrect ? '还有检查未通过。'
    : error?.name === 'SyntaxError' ? '语法需要检查。'
    : error?.name === 'IndentationError' ? '缩进需要检查。' : 'Python 没有执行完。';
  const explanation = incorrect ? '请看未通过的那一项，再核对题目要求。'
    : typeof error?.message !== 'string' || error.message.length === 0 ? '请核对代码，也可以展开技术详情查看原始信息。'
    : error?.name === 'ValueError' && error.message === moveMessage ? `${moveMessage}本关目标仍以题目要求为准。`
    : Object.hasOwn(explanations, error?.name) ? explanations[error.name]
    : '请核对代码，也可以展开技术详情查看原始信息。';
  const savedNotice = outcome.saved === true ? '这条提交的草稿和未通过尝试在返回结果时已确认保存。'
    : outcome.saved === false ? '返回结果时，这条尝试尚未确认保存。请查看当前保存状态；如仍未保存，请先导出，再重试保存。'
    : '这条结果未提供保存确认。请查看当前保存状态。';
  const checkNotes = (outcome.checks || []).map(check => {
    if (check.passed) return '';
    if (check.label === 'steps 是整数 3') return '请核对题目要求的变量名、值和整数类型。';
    if (check.label === '真正发出前进 3 格的指令') return '请核对本次发出的移动指令是否符合任务要求。';
    if (check.label === '输出中打印了 3') return outcome.stdout === '' ? '本次没有打印输出。请核对题目要求的输出。' : '本次输出见上方，但输出检查仍未通过。请核对题目要求。';
    return '';
  });
  return Object.freeze({ title, explanation, savedNotice, checkNotes: Object.freeze(checkNotes), showCheckRelation: incorrect });
}
export function renderFirstFailureFeedback({ document, root, view, outcome }) {
  const element = (tag, text) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; };
  root.replaceChildren(); root.hidden = false;
  root.append(element('p', view.explanation));
  if (outcome.saved !== true) root.append(element('p', view.savedNotice));
  if (outcome.outputTruncated === true) root.append(element('p', '输出超过 8000 字符，后续输出已截断。依赖输出的检查可能受影响，请减少调试输出后重新运行。'));
  if (view.showCheckRelation === true) {
    const relation = element('details'); relation.open = false; relation.dataset.feedbackKind = 'check-relation';
    relation.append(element('summary', '看懂三项检查的关系'), element('p', '下面展示条件关系，不表示程序执行顺序。'));
    const conditions = element('ul');
    conditions.append(...['变量要求', '移动指令要求', '打印输出要求'].map(label => element('li', label)));
    relation.append(conditions, element('p', '本关要求：三项都要满足'), element('p', '单项通过，不等于本关通过，也不代表角色已经移动。'));
    root.append(relation);
  }
  const details = element('details'); details.open = false; details.dataset.feedbackKind = 'technical';
  details.append(element('summary', '错误与提交详情'), element('p', view.savedNotice), element('p', '本次位置与金币没有改变。本次没有获得奖励。'));
  const field = (parent, label, value) => { parent.append(element('span', label), element('pre', value === undefined || value === null ? '未提供' : String(value))); };
  if (outcome.error) {
    const error = element('section'); error.append(element('h4', '程序错误'));
    field(error, 'name', outcome.error.name); field(error, 'message', outcome.error.message); field(error, 'line', outcome.error.line); details.append(error);
  }
  const checks = element('section'); checks.append(element('h4', '任务检查详情'));
  if (!(outcome.checks || []).length) checks.append(element('p', '本次未返回任务检查项'));
  for (const check of outcome.checks || []) {
    const row = element('div'); field(row, 'label', check.label); field(row, 'passed', check.passed); field(row, 'detail', check.detail); checks.append(row);
  }
  details.append(checks); root.append(details);
}
