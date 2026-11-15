import { courseLearning } from '../integration/course-learning.mjs';
import { LESSONS } from '../integration/contracts.mjs';
import { renderKnowledgeText } from './knowledge-reader.mjs';

const titles = new Map(LESSONS.map(lesson => [lesson.id, lesson.title]));

export function renderCourseLearning({ document: doc = document, lessonId, onTransfer }) {
  const guide = courseLearning(lessonId);
  const make = (tag, text, className) => {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const taskTitle = doc.getElementById('lessonTaskTitle');
  if (taskTitle) taskTitle.textContent = titles.get(lessonId) || '';
  const explanation = doc.getElementById('lessonExplanation');
  renderKnowledgeText(explanation, [...new Set(guide.explanation.filter(Boolean))].join('\n\n'));
  if (guide.inputContract) {
    const inputs = make('details');
    inputs.append(make('summary', '输入范围'), make('p', guide.inputContract));
    explanation.append(inputs);
  }
  if (guide.bridgeLessons?.length) {
    const bridges = make('nav'); bridges.setAttribute('aria-label', '建议先补充的练习');
    bridges.append(make('p', '需要时先练'));
    for (const id of guide.bridgeLessons) {
      const button = make('button', titles.get(id) || id, 'text-button');
      button.type = 'button';
      button.addEventListener('click', () => onTransfer(id, button));
      bridges.append(button);
    }
    explanation.append(bridges);
  }
  const example = doc.getElementById('lessonExample');
  const code = make('pre', guide.workedExample.code);
  code.tabIndex = 0; code.setAttribute('aria-label', '概念示例代码，只读');
  const expected = make('details');
  expected.append(make('summary', '预测与预期结果'));
  const steps = make('ol');
  for (const step of guide.workedExample.steps || []) steps.append(make('li', step));
  expected.append(steps, make('pre', guide.workedExample.expected));
  const environment = make('details', undefined, 'example-environment');
  environment.append(make('summary', '示例运行环境'), make('p', guide.workedExample.executionEnvironment || '概念示例 · 不作为本课提交'));
  example.replaceChildren(code, expected, environment);
  const mistakes = doc.getElementById('lessonMistakes');
  mistakes.replaceChildren(...guide.typicalErrors.map(error => {
    const detail = make('details');
    detail.append(make('summary', error.symptom), make('p', error.reason), make('p', error.repair));
    return detail;
  }));
  // The parent hint disclosure owns the assistance marker. Nested levels are
  // revealed deliberately; changing lesson discards their previous open state.
  const hintLevels = doc.getElementById('lessonHintLevels');
  if (hintLevels) {
    const levels = (guide.hintLevels || []).filter(level => level.level > 1);
    hintLevels.replaceChildren(...levels.map(level => {
      const detail = make('details', undefined, 'hint-level');
      detail.dataset.hintLevel = String(level.level);
      const content = make('div');
      renderKnowledgeText(content, level.text || '');
      detail.append(make('summary', level.title || `提示 ${level.level}`), content);
      return detail;
    }));
  }
  const transfer = doc.getElementById('lessonTransfer');
  const independentTransfer = guide.transferChallenge.relationship === 'independent-transfer';
  const sharedTransfer = independentTransfer && (LESSONS.find(lesson => lesson.id === guide.transferChallenge.lessonId)?.transferFrom?.length || 0) > 1;
  const transferTitle = doc.getElementById('lessonTransferTitle');
  if (transferTitle) transferTitle.textContent = sharedTransfer ? '独立应用与综合练习' : independentTransfer ? '独立迁移练习' : '继续练一练';
  transfer.replaceChildren();
  if (guide.independentApplication?.prompt) {
    const application = guide.independentApplication;
    const section = make('section', undefined, 'independent-application');
    const checks = make('ul');
    for (const check of application.checks || []) checks.append(make('li', check));
    section.append(make('h4', '自己再试一次'), make('p', application.prompt),
      make('p', application.graded ? '按这些方向检查你的结果' : '自行核对', 'scope-note'), checks);
    if (application.environment) section.append(make('p', application.environment, 'scope-note'));
    // Observation prompts never grant evidence or offer a synthetic pass button.
    // Any graded task still enters through the existing guarded transfer action.
    transfer.append(section);
  }
  transfer.append(make('p', guide.transferChallenge.prompt));
  if (guide.transferChallenge.assessmentScope) transfer.append(make('p', guide.transferChallenge.assessmentScope, 'scope-note'));
  if (guide.transferChallenge.lessonId) {
    const button = make('button', sharedTransfer ? '打开综合练习' : independentTransfer ? '打开新的独立任务' : '打开相关练习', 'text-button');
    button.type = 'button';
    button.addEventListener('click', () => onTransfer(guide.transferChallenge.lessonId, button));
    transfer.append(button);
  }
  const boundary = make('details');
  boundary.append(make('summary', '本课边界'), make('p', guide.boundaries));
  transfer.append(boundary);
  const nativeProject = doc.getElementById('lessonNativeProject');
  nativeProject.replaceChildren();
  nativeProject.hidden = !guide.nativeProject;
  if (guide.nativeProject) {
    const project = guide.nativeProject, detail = make('details');
    const download = make('a', project.studentOnly ? '下载独立项目包（ZIP）' : '下载项目源码（ZIP）', 'text-button');
    download.href = project.sourceArchive;
    download.download = project.sourceArchive.split('/').at(-1);
    const instructions = make('a', '下载启动说明', 'text-button');
    instructions.href = project.readme; instructions.download = 'README-native-course.md';
    detail.append(make('summary', project.title), make('p', project.assistance), make('p', project.assessmentScope),
      make('p', '本地项目需要另装 Python 3.12+；游戏内课程无需安装它。'), download, instructions);
    nativeProject.append(detail);
  }
  return guide;
}

export function presentRunChecks({ document: doc = document, outcome }) {
  const detail = doc.getElementById('runChecks');
  const summary = doc.getElementById('runChecksSummary');
  const checks = outcome.checks || [];
  const failed = checks.filter(check => !check.passed);
  detail.hidden = !checks.length && outcome.kind !== 'python-error';
  detail.open = failed.length > 0 || outcome.kind === 'python-error';
  summary.textContent = failed.length ? `${failed.length} 项待修正 · 展开全部检查` : `检查明细 · ${checks.length} 项通过`;
  const next = doc.getElementById('failureNext');
  next.hidden = outcome.lessonId === 'first-steps' || !['incorrect', 'python-error'].includes(outcome.kind);
  if (!next.hidden) {
    const directions = {
      NameError: '核对报错名字的拼写，以及第一次赋值的位置。',
      TypeError: '先打印参与运算的值和类型，再核对函数接收的参数。',
      ValueError: '核对这次输入是否符合任务允许的范围与格式。',
      SyntaxError: '检查报错行及前一行的冒号、括号和引号。',
      IndentationError: '检查相邻语句的缩进，确认它们属于同一层级。',
      ZeroDivisionError: '先处理除数为零的情况，再进行除法。',
    };
    next.textContent = outcome.kind === 'python-error'
      ? directions[outcome.error?.name] || '对照报错行与任务要求；需要时展开左页的讲解与提示。'
      : `先检查「${failed[0]?.label || '任务要求'}」。用同样的输入逐步追踪返回值，再重试。`;
  } else next.textContent = '';
}
